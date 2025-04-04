import { Transaction, User, UserImage, Account } from './types';

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://hv1nytt.onrender.com';

export class ApiError extends Error {
  status: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

export class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  private async fetchCore<T>(
    url: string,
    options: RequestInit = {},
    isFormData: boolean = false
  ): Promise<T> {
    const headers = new Headers(options.headers || {});
    if (!isFormData) {
      headers.set('Content-Type', 'application/json');
    }
    if (this.token) {
      headers.set('Authorization', `Bearer ${this.token}`);
    }

    const config: RequestInit = { ...options, headers };
    let response: Response;
    try {
      response = await fetch(url, config);
    } catch (networkError) {
      console.error(`Network error fetching from ${url}:`, networkError);
      throw new ApiError(
        //@ts-expect-error networkError is not typed
        `Network error: ${networkError.message || 'Failed to connect'}`,
        0
      );
    }

    if (response.ok && response.status === 204) {
      return null as T;
    }

    let responseBody = null;
    const contentType = response.headers.get('content-type');
    if (contentType?.includes('application/json')) {
      try {
        responseBody = await response.json();
      } catch (jsonError) {
        console.error(
          `Error parsing JSON from ${url} (status: ${response.status}):`,
          jsonError
        );
        if (!response.ok) {
          throw new ApiError(
            `API request failed (${response.status}), unable to parse error JSON.`,
            response.status
          );
        }
        console.warn(
          `API request succeeded (${response.status}) but failed to parse JSON body.`
        );
        throw new ApiError(
          `Invalid JSON received for successful request (${response.status}).`,
          response.status
        );
      }
    } else if (!response.ok) {
      try {
        const textError = await response.text();
        console.error(
          `API Error Text (${response.status}) from ${url}:`,
          textError
        );
        throw new ApiError(
          textError || `Request failed with status ${response.status}`,
          response.status
        );
      } catch (textErr) {
        const errorMessage =
          textErr instanceof Error ? textErr.message : 'Unknown error occurred';
        throw new ApiError(
          `Request failed with status ${response.status}: ${errorMessage}`,
          response.status
        );
      }
    }

    if (!response.ok) {
      console.error(`API Error: ${response.status} from ${url}`, responseBody);
      const errorMessage =
        responseBody?.error ||
        responseBody?.message ||
        `Request failed with status ${response.status}`;
      throw new ApiError(errorMessage, response.status, responseBody);
    }

    return responseBody as T;
  }

  async login(credentials: {
    username: string;
    password: string;
  }): Promise<{ user: User; token: string; expiresIn: number }> {
    const url = `${BASE_URL}/auth/users/login`;
    return this.fetchCore<{ user: User; token: string; expiresIn: number }>(
      url,
      {
        method: 'POST',
        body: JSON.stringify(credentials),
      }
    );
  }

  async register(
    userData: Omit<
      User,
      'id' | 'admin' | 'created' | 'slug' | 'profilePictureUrl'
    > & { password: string }
  ): Promise<User> {
    const url = `${BASE_URL}/auth/users/register`;
    return this.fetchCore<User>(url, {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getCurrentUser(): Promise<User> {
    const url = `${BASE_URL}/auth/users/me`;
    return this.fetchCore<User>(url);
  }

  async getMyProfilePicture(): Promise<{ profilePictureUrl: string | null }> {
    const url = `${BASE_URL}/auth/users/me/profile-picture`;
    try {
      const result = await this.fetchCore<{ profilePictureUrl: string | null }>(
        url
      );
      return result ?? { profilePictureUrl: null };
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 404)
      ) {
        console.warn(
          `getMyProfilePicture failed with ${error.status}, returning null url.`
        );
        return { profilePictureUrl: null };
      }
      console.error('Error fetching my profile picture:', error);
      throw error;
    }
  }

  async getMyAccounts(): Promise<
    Pick<Account, 'id' | 'account_name' | 'slug'>[]
  > {
    const url = `${BASE_URL}/my-accounts`;
    try {
      const accounts = await this.fetchCore<
        Pick<Account, 'id' | 'account_name' | 'slug'>[]
      >(url);
      return accounts ?? [];
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 404)
      ) {
        console.warn(
          `getMyAccounts failed with ${error.status}, returning empty array.`
        );
        return [];
      }
      console.error('Error fetching my accounts:', error);
      throw error;
    }
  }

  async getMyTransactions(username: string): Promise<Transaction[]> {
    const url = `${BASE_URL}/transactions/${username}`;
    try {
      const transactions = await this.fetchCore<Transaction[]>(url);
      return transactions ?? [];
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 404)
      ) {
        console.warn(
          `getMyTransactions failed with ${error.status}, returning empty array.`
        );
        return [];
      }
      console.error('Error fetching my transactions:', error);
      throw error;
    }
  }

  async getAllTransactions(): Promise<Transaction[]> {
    const url = `${BASE_URL}/transactions`;
    try {
      const transactions = await this.fetchCore<Transaction[]>(url);
      return transactions ?? [];
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 403 || error.status === 404)
      ) {
        console.warn(
          `getAllTransactions failed with ${error.status}, returning empty array.`
        );
        return [];
      }
      console.error('Error fetching all transactions:', error);
      throw error;
    }
  }

  async createTransaction(
    newTransactionData: Omit<Transaction, 'id' | 'slug' | 'user_id' | 'created'>
  ): Promise<Transaction> {
    const url = `${BASE_URL}/transactions`;
    return this.fetchCore<Transaction>(url, {
      method: 'POST',
      body: JSON.stringify(newTransactionData),
    });
  }

  async uploadImage(
    formData: FormData
  ): Promise<{ message: string; imageUrl: string; imageId: number }> {
    const url = `${BASE_URL}/auth/images/upload`;
    return this.fetchCore<{
      message: string;
      imageUrl: string;
      imageId: number;
    }>(url, { method: 'POST', body: formData }, true);
  }

  async getMyImages(): Promise<UserImage[]> {
    const url = `${BASE_URL}/auth/images`;
    try {
      const images = await this.fetchCore<UserImage[]>(url);
      return images ?? [];
    } catch (error) {
      if (
        error instanceof ApiError &&
        (error.status === 401 || error.status === 404)
      ) {
        console.warn(
          `getMyImages failed with ${error.status}, returning empty array.`
        );
        return [];
      }
      console.error('Error fetching my images:', error);
      throw error;
    }
  }
}
