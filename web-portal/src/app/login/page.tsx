'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

/**
 * Groomer Safety Management System - Web Portal Login
 * © 2026 Dog Days Grooming & Development. All rights reserved.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Groomer Portal Login</h1>
        
        {errorMsg ? <p style={styles.error}>{errorMsg}</p> : null}

        <form onSubmit={handleLogin} style={styles.form}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={styles.input}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#4a5568' }}>
          Don't have an account? <a href="/signup" style={{ color: '#3182ce', fontWeight: '600' }}>Sign up here</a>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  } as React.CSSProperties,
  card: {
    backgroundColor: '#ffffff',
    padding: '30px',
    borderRadius: '8px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    width: '100%',
    maxWidth: '400px',
  } as React.CSSProperties,
  title: {
    textAlign: 'center' as const,
    fontSize: '20px',
    fontWeight: 'bold' as const,
    marginBottom: '20px',
    color: '#1a202c',
  },
  form: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '12px',
  },
  input: {
    padding: '10px',
    borderRadius: '6px',
    border: '1px solid #cbd5e0',
    fontSize: '14px',
    color: '#1a202c',
  },
  button: {
    backgroundColor: '#3182ce',
    color: '#ffffff',
    padding: '10px',
    borderRadius: '6px',
    border: 'none',
    fontWeight: 'bold' as const,
    cursor: 'pointer',
    marginTop: '5px',
  },
  error: {
    color: '#e53e3e',
    fontSize: '13px',
    marginBottom: '10px',
    textAlign: 'center' as const,
  },
};