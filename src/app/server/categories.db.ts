import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import xss from 'xss';
import { mock } from 'node:test';
import { create } from 'domain';
import { skip } from '@prisma/client/runtime/library';
// User schema
const UserSchema = z.object({
  id: z.number(),
  username: z.string().nonempty(),
  password: z.string().nonempty(),
  admin: z.boolean(),
  created: z.date(),
  slug: z.string(),
});
type User = z.infer<typeof UserSchema>;

// Payment Method schema
const PaymentMethodSchema = z.object({
  id: z.number(),
  name: z.string().nonempty(),
  slug: z.string(),
});
type PaymentMethod = z.infer<typeof PaymentMethodSchema>;
// Account schema
const AccountSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  account_name: z.string().nonempty(),
  balance: z.number(),
  created: z.date(),
  slug: z.string(),
});
type Account = z.infer<typeof AccountSchema>;

// Category schema
const CategorySchema = z.object({
  id: z.number(),
  name: z.string().nonempty(),
  slug: z.string(),
});
type Category = z.infer<typeof CategorySchema>;
// Budget schema
const BudgetSchema = z.object({
  id: z.number(),
  user_id: z.number(),
  category: z.string(),
  monthly_limit: z.number(),
  created: z.date(),
  slug: z.string(),
});
type Budget = z.infer<typeof BudgetSchema>;

// eslint-disable-next-line
const TransactionSchema = z.object({
  id: z.number(),
  account_id: z
    .number()
    .min(1, 'account_id must be from 1-3')
    .max(3, 'account_id must be from 1-3'),
  user_id: z
    .number()
    .min(1, 'user_id must be from 1-3')
    .max(3, 'user_id must be from 1-3'),
  payment_method_id: z
    .number()
    .min(1, 'payment_method_id must be from 1-3')
    .max(3, 'payment_method_id must be from 1-3'),
  transaction_type: z.string().nonempty(),
  category: z.string().nonempty('category must be filled out'),
  amount: z
    .number()
    .min(0, 'the amount has to be over 0 $')
    .max(1000000, 'the amount has to be under 1000000 $)'),
  description: z
    .string()
    .min(3, 'description must be at least 3 letters')
    .max(1024, 'description must be at most 1024 letters'),
  slug: z.string(),
});
type Transaction = z.infer<typeof TransactionSchema>;

const TransactionToCreateSchema = z.object({
  account_id: z
    .number()
    .min(1, 'account_id must be from 1-3')
    .max(3, 'account_id must be from 1-3'),
  user_id: z
    .number()
    .min(1, 'user_id must be from 1-3')
    .max(3, 'user_id must be from 1-3'),
  payment_method_id: z
    .number()
    .min(1, 'payment_method_id must be from 1-3')
    .max(3, 'payment_method_id must be from 1-3'),
  transaction_type: z.string().nonempty(),
  category: z.string().nonempty('category must be filled out'),
  amount: z
    .number()
    .min(0, 'the amount has to be over 0 $')
    .max(1000000, 'the amount has to be under 1000000 $)'),
  description: z
    .string()
    .min(3, 'description must be at least 3 letters')
    .max(1024, 'description must be at most 1024 letters'),
});

type TransactionToCreate = z.infer<typeof TransactionToCreateSchema>;

const TransactionToUpdateSchema = z.object({
  account_id: z
    .number()
    .min(1, 'account_id must be from 1-3')
    .max(3, 'account_id must be from 1-3'),
  user_id: z
    .number()
    .min(1, 'user_id must be from 1-3')
    .max(3, 'user_id must be from 1-3'),
  payment_method_id: z
    .number()
    .min(1, 'payment_method_id must be from 1-3')
    .max(3, 'payment_method_id must be from 1-3'),
  transaction_type: z.string().nonempty(),
  category: z.string().nonempty('category must be filled out'),
  amount: z
    .number()
    .min(0, 'the amount has to be over 0 $')
    .max(1000000, 'the amount has to be under 1000000 $)'),
  description: z
    .string()
    .min(3, 'description must be at least 3 letters')
    .max(1024, 'description must be at most 1024 letters'),
});

type TransactionToUpdate = z.infer<typeof TransactionToUpdateSchema>;
type TransactionToDelete = z.infer<typeof TransactionSchema>;

const prisma = new PrismaClient();

export async function getUsers(): Promise<Array<User>> {
  const users = await prisma.users.findMany();
  console.log('users :>> ', users);
  return users;
}
export async function getUser(slug: string): Promise<User | null> {
  const user = await prisma.users.findUnique({
    where: {
      slug: slug,
    },
  });
  return user ?? null;
}

export async function getPaymentMethods(): Promise<Array<PaymentMethod>> {
  const paymentMethods = await prisma.payment_methods.findMany();
  console.log('paymentMethods :>> ', paymentMethods);
  return paymentMethods;
}
export async function getPaymentMethod(
  slug: string
): Promise<PaymentMethod | null> {
  const pay = await prisma.payment_methods.findUnique({
    where: {
      slug: slug,
    },
  });
  return pay ?? null;
}

export async function getAccounts(): Promise<Array<Account>> {
  const accounts = await prisma.accounts.findMany();
  console.log('accounts :>> ', accounts);
  return accounts;
}
export async function getAccount(slug: string): Promise<Account | null> {
  const acc = await prisma.accounts.findUnique({
    where: {
      slug: slug,
    },
  });
  return acc ?? null;
}

export async function getBudgets(): Promise<Array<Budget>> {
  const budgets = await prisma.budgets.findMany();
  console.log('budgets :>> ', budgets);
  return budgets;
}
export async function getBudget(slug: string): Promise<Budget | null> {
  const bud = await prisma.budgets.findUnique({
    where: {
      slug: slug,
    },
  });
  return bud ?? null;
}

export async function getCategories(): Promise<Array<Category>> {
  const categories = await prisma.categories.findMany();
  console.log('categories :>> ', categories);
  return categories;
}
export async function getCategory(slug: string): Promise<Category | null> {
  const cat = await prisma.categories.findUnique({
    where: {
      slug: slug,
    },
  });
  return cat ?? null;
}

export async function getTransactions(
  page: number
): Promise<Array<Transaction>> {
  const transactions = await prisma.transactions.findMany({
    skip: page * 10,
    take: 10,
  });
  console.log('transactions :>> ', transactions);
  return transactions;
}

export async function getTransaction(
  slug: string
): Promise<Transaction | null> {
  const tran = await prisma.transactions.findUnique({
    where: {
      slug: slug,
    },
  });
  return tran ?? null;
}

export function validateTransaction(transactionToValidate: unknown) {
  const result = TransactionToCreateSchema.safeParse(transactionToValidate);

  return result;
}
export function validateUpdatedTransaction(transactionToValidate: unknown) {
  const result = TransactionToUpdateSchema.safeParse(transactionToValidate);

  return result;
}

export async function createTransaction(
  transactionToCreate: TransactionToCreate
): Promise<Transaction> {
  const createdTransaction = await prisma.transactions.create({
    data: {
      account_id: transactionToCreate.account_id,
      user_id: transactionToCreate.user_id,
      payment_method_id: transactionToCreate.payment_method_id,
      transaction_type: transactionToCreate.transaction_type,
      category: transactionToCreate.category,
      amount: transactionToCreate.amount,
      description: transactionToCreate.description,
      slug: '',
    },
  });
  const updatedTransaction = await prisma.transactions.update({
    where: {
      id: createdTransaction.id,
    },
    data: {
      slug: `transaction_${createdTransaction.id}`,
    },
  });
  return updatedTransaction;
}

// Það sem ég gerði til að deletea category...
export async function deleteTransaction(
  transactionToDelete: TransactionToDelete
): Promise<Transaction> {
  if (!transactionToDelete) {
    throw new Error('Category not found');
  }
  const deletedCategory = await prisma.transactions.delete({
    where: {
      slug: transactionToDelete?.slug,
    },
  });
  return deletedCategory;
}

export async function updateTransaction(
  newValidTransaction: TransactionToUpdate,
  transactionToUpdate: Transaction
): Promise<Transaction | null> {
  if (!transactionToUpdate) {
    throw new Error('Category not found');
  }
  const updatedTransaction = await prisma.transactions.update({
    where: {
      slug: transactionToUpdate.slug,
    },
    data: {
      account_id: newValidTransaction.account_id,
      user_id: newValidTransaction.user_id,
      payment_method_id: newValidTransaction.payment_method_id,
      transaction_type: newValidTransaction.transaction_type,
      category: newValidTransaction.category,
      amount: newValidTransaction.amount,
      description: newValidTransaction.description,
    },
  });
  console.log('updatedTransaction :>> ', updatedTransaction);
  return updatedTransaction;
}