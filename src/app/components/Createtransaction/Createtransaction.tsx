'use client';
import { JSX, useState, useEffect } from 'react';
import styles from './Createtransaction.module.css';
import { ApiClient, ApiError } from '@/app/api';
import { useAuth } from '@/app/context/AuthContext';
import { UiState, Account } from '@/app/types';

interface CreatetransactionProps {
  onTransactionCreated: () => void;
}
type AccountOption = Pick<Account, 'id' | 'account_name'>;

export default function Createtransaction({
  onTransactionCreated,
}: CreatetransactionProps): JSX.Element {
  const { user, token, logout } = useAuth();
  const [uiState, setUiState] = useState<UiState>('initial');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionType, setTransactionType] = useState('');
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [account, setAccount] = useState('');
  const [message, setMessage] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [errorDetails, setErrorDetails] = useState<any>(null);
  const [accountOptions, setAccountOptions] = useState<AccountOption[]>([]);
  const [accountsLoading, setAccountsLoading] = useState<boolean>(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAccounts = async () => {
      if (!token) {
        setAccountsLoading(false);
        setAccountsError('Ekki innskráður.');
        return;
      }
      setAccountsLoading(true);
      setAccountsError(null);
      const apiClient = new ApiClient();
      apiClient.setToken(token);
      try {
        const fetchedAccounts = await apiClient.getMyAccounts();
        setAccountOptions(fetchedAccounts);
      } catch (error) {
        console.error('Failed to fetch accounts:', error);
        if (error instanceof ApiError && error.status === 401) {
          logout();
          setAccountsError('Útskráð/ur.');
        } else if (error instanceof Error) {
          setAccountsError(`Villa: ${error.message}`);
        } else {
          setAccountsError('Óþekkt villa við að sækja reikninga.');
        }
      } finally {
        setAccountsLoading(false);
      }
    };
    fetchAccounts();
  }, [token]);

  const clearForm = () => {
    setAccount('');
    setPaymentMethod('');
    setTransactionType('');
    setCategory('');
    setAmount('');
    setDescription('');
    setMessage('');
    setErrorDetails(null);
    setUiState('initial');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !user) {
      setMessage('Notandi ekki innskráður.');
      setUiState('error');
      return;
    }
    if (!account) {
      setMessage('Vinsamlegast veldu reikning.');
      setUiState('error');
      return;
    }

    setUiState('loading');
    setMessage('');
    setErrorDetails(null);

    const newTransactionData = {
      account_id: parseInt(account, 10),
      payment_method_id: parseInt(paymentMethod, 10),
      transaction_type: transactionType,
      category: category,
      amount: parseFloat(amount),
      description: description,
    };

    // Client-side validation (dálítið óþarfi ef Zod er gott á backend, en sakar ekki)
    if (
      isNaN(newTransactionData.account_id) ||
      isNaN(newTransactionData.payment_method_id) ||
      isNaN(newTransactionData.amount) ||
      newTransactionData.amount <= 0
    ) {
      setMessage(
        'Ógild gögn. Athugaðu reikning, greiðslumáta og upphæð (> 0).'
      );
      setUiState('error');
      return;
    }
    if (
      !newTransactionData.transaction_type ||
      !newTransactionData.category ||
      !newTransactionData.description
    ) {
      setMessage('Vinsamlegast fylltu út alla reiti.');
      setUiState('error');
      return;
    }

    const apiClient = new ApiClient();
    apiClient.setToken(token);
    try {
      const createdTransaction = await apiClient.createTransaction(
        newTransactionData
      );
      setUiState('data');
      setMessage('Færsla stofnuð!');
      console.log('Transaction created:', createdTransaction);
      onTransactionCreated();
      setTimeout(clearForm, 2500);
    } catch (error) {
      console.error('Error creating transaction:', error);
      setUiState('error');
      if (error instanceof ApiError) {
        setMessage(`Villa (${error.status}): ${error.message}`);
        if (error.details?.details) {
          setErrorDetails(error.details.details);
          setMessage(
            `Villa (${error.status}): Ógild færslugögn. Sjá nánar hér að neðan.`
          );
        }
        if (error.status === 401) {
          logout();
        }
      } else if (error instanceof Error) {
        setMessage(`Villa: ${error.message}`);
      } else {
        setMessage('Óþekkt villa við að stofna færslu.');
      }
    }
  };

  if (uiState === 'loading') {
    return <p className={styles.loadingScreen}>Stofna færslu...</p>;
  }

  return (
    <div className={styles.formContainer}>
      <h2 className={styles.title}>Stofna nýja færslu</h2>
      {accountsError && <p className={styles.errorMessage}>{accountsError}</p>}
      {message && !errorDetails && (
        <div className={styles.messageContainer}>
          <p
            className={
              uiState === 'error' ? styles.errorMessage : styles.successMessage
            }
          >
            {message}
          </p>
        </div>
      )}
      {errorDetails && (
        <div className={styles.errorDetailsContainer}>
          <p className={styles.errorMessage}>
            {message.includes('Sjá nánar') ? message : 'Gögn eru ógild:'}
          </p>
          <ul className={styles.errorDetails}>
            {Object.entries(errorDetails.fieldErrors || {}).map(
              ([field, errors]) => (
                <li key={field}>
                  <strong>{field}:</strong> {(errors as string[]).join(', ')}
                </li>
              )
            )}
            {(errorDetails.formErrors || []).map(
              (err: string, index: number) => (
                <li key={`form-${index}`}>{err}</li>
              )
            )}
          </ul>
        </div>
      )}

      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formGroup}>
          <label htmlFor="account" className={styles.label}>
            Reikningur:
          </label>
          <select
            id="account"
            className={styles.input}
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            required
            disabled={accountsLoading || accountOptions.length === 0}
          >
            <option value="" disabled>
              {accountsLoading
                ? 'Hleð...'
                : accountOptions.length === 0
                ? 'Engir reikningar'
                : 'Veldu reikning'}
            </option>
            {accountOptions.map((acc) => (
              <option key={acc.id} value={String(acc.id)}>
                {acc.account_name}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="paymentMethod" className={styles.label}>
            Greiðslumáti:
          </label>
          <select
            id="paymentMethod"
            className={styles.input}
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="" disabled>
              Veldu form greiðslu
            </option>
            <option value="1">Reiðufé</option>
            <option value="2">Kreditkort</option>
            <option value="3">Bankamillifærsla</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="transactionType" className={styles.label}>
            Tegund færslu:
          </label>
          <select
            id="transactionType"
            className={styles.input}
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value)}
            required
          >
            <option value="" disabled>
              Veldu tegund
            </option>
            <option value="income">Tekjur</option>
            <option value="expense">Gjöld</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="category" className={styles.label}>
            Flokkur:
          </label>
          <select
            id="category"
            className={styles.input}
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
          >
            <option value="" disabled>
              Veldu flokk
            </option>
            <option value="matur">Matur</option>
            <option value="íbúð">Íbúð</option>
            <option value="samgöngur">Samgöngur</option>
            <option value="afþreying">Afþreying</option>
            <option value="laun">Laun</option>
            <option value="annað">Annað</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="amount" className={styles.label}>
            Upphæð (kr.):
          </label>
          <input
            type="number"
            id="amount"
            className={styles.input}
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
            step="0.01"
            min="0.01"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="description" className={styles.label}>
            Lýsing:
          </label>
          <input
            type="text"
            id="description"
            className={styles.input}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Stutt skýring..."
            required
          />
        </div>

        {/* Takkar */}
        <div className={styles.buttonGroup}>
          <button
            type="submit"
            className={styles.submitButton}
            // @ts-expect-error because of disabled prop
            disabled={uiState === 'loading' || accountsLoading}
          >
            {/* @ts-expect-error because of disabled prop */}
            {uiState === 'loading' ? 'Sendi...' : 'Stofna færslu'}
          </button>
          <button
            type="button"
            onClick={clearForm}
            className={styles.clearButton}
            // @ts-expect-error because of disabled prop
            disabled={uiState === 'loading'}
          >
            Hreinsa
          </button>
        </div>
      </form>
    </div>
  );
}
