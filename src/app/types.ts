export type UiState = 'initial' | 'loading' | 'error' | 'data' | 'empty';

export type Transaction = {
  id: number;
  account_id: number;
  user_id: number;
  payment_method_id: number;
  transaction_type: string;
  category: string;
  amount: number;
  description: string | null;
  slug: string;
  created?: string | Date;
};
export type Paginated<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};

export type TransactionToCreate = {
  account_id: number;
  payment_method_id: number;
  transaction_type: string;
  category: string;
  amount: number;
  description: string;
};
export type User = {
  id: number;
  username: string;
  email: string;
  admin: boolean;
  created: string | Date;
  slug?: string | null;
  profilePictureUrl?: string | null;
};
export type PaymentMethod = {
  id: number;
  name: string;
  slug: string;
};
export type Category = {
  id: number;
  name: string;
  slug: string;
};
export type Budget = {
  id: number;
  user_id: number;
  category: string;
  monthly_limit: number;
  created: string | Date;
  slug: string;
};
export type Account = {
  id: number;
  user_id: number;
  account_name: string;
  balance: number;
  created: string | Date;
  slug: string;
};
export interface UserImage {
  id: number; // Unique identifier for the image
  userId: number; // ID of the user associated with the image
  url: string; // URL of the image
  publicId: string; // Public ID for the image (if applicable)
  caption?: string; // Optional caption for the image
  createdAt?: string; // Optional timestamp for when the image was created
}
