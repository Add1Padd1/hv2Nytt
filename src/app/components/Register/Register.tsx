'use client';

import React, { useState } from 'react';
import styles from './Register.module.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ApiClient } from '@/app/api';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!username || !email || !password || !confirmPassword) {
      setErrorMessage('Vinsamlegast fylltu út alla reiti.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Lykilorð stemma ekki.');
      return;
    }
    if (password.length < 8) {
      setErrorMessage('Lykilorð verður að vera að minnsta kosti 8 stafir.');
      return;
    }

    setLoading(true);
    const apiClient = new ApiClient();

    try {
      await apiClient.register({ username, email, password });

      setSuccessMessage('Skráning tókst! Þú getur nú skráð þig inn.');
      setTimeout(() => {
        router.push('/login');
      }, 2500);
    } catch (error) {
      console.error('Registration API error:', error);

      setErrorMessage(
        // @ts-expect-error error is not typed
        error?.message || 'Nýskráning mistókst. Vinsamlegast reyndu aftur.'
      );
      setSuccessMessage('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.registerContainer}>
      <form className={styles.registerForm} onSubmit={handleSubmit}>
        <h2 className={styles.title}>Nýskráning</h2>

        {errorMessage && <p className={styles.errorMessage}>{errorMessage}</p>}
        {successMessage && (
          <p className={styles.successMessage}>{successMessage}</p>
        )}

        <div className={styles.inputGroup}>
          <label htmlFor="username" className={styles.label}>
            Notandanafn
          </label>
          <input
            type="text"
            id="username"
            className={styles.input}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Sláðu inn notandanafn"
            required
            disabled={loading || !!successMessage}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="email" className={styles.label}>
            Netfang
          </label>
          <input
            type="email"
            id="email"
            className={styles.input}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Sláðu inn netfang"
            required
            disabled={loading || !!successMessage}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="password" className={styles.label}>
            Lykilorð
          </label>
          <input
            type="password"
            id="password"
            className={styles.input}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sláðu inn lykilorð (minst 8 stafir)"
            required
            disabled={loading || !!successMessage}
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="confirmPassword" className={styles.label}>
            Staðfesta lykilorð
          </label>
          <input
            type="password"
            id="confirmPassword"
            className={styles.input}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Sláðu inn lykilorð aftur"
            required
            disabled={loading || !!successMessage}
          />
        </div>

        <button
          type="submit"
          className={styles.button}
          disabled={loading || !!successMessage}
        >
          {loading ? 'Skrái...' : 'Skrá mig'}
        </button>

        <Link href="/login" className={styles.link}>
          Hefur þú nú þegar aðgang? Skráðu þig inn
        </Link>
      </form>
    </div>
  );
};

export default Register;
