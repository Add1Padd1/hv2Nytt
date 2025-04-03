export type UiState = 'initial' | 'loading' | 'error' | 'data' | 'empty';
export type Transaction = {
  id: number;
  account_id: number;
  user_id: number;
  payment_method_id: number;
  transaction_type: string;
  category: string;
  amount: number;
  description: string;
  slug: string;
};
export type Paginated<T> = {
  data: T[];
  total: number;
  limit: number;
  offset: number;
};

export type TransactionToCreate = {
  account_id: number;
  user_id: number;
  payment_method_id: number;
  transaction_id: string;
  transaction_type: string;
  category: string;
  amount: number;
  description: string;
};
export type User = {
  id: number;
  username: string;
  email: string;
  password: string;
  admin: boolean;
  created: string;
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
  created: string;
  slug: string;
};
export type Account = {
  id: number;
  user_id: number;
  account_name: string;
  balance: number;
  created: string;
  slug: string;
};
