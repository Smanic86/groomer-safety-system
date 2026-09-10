'use client';

import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function SignUpPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const router = useRouter();

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password: password.trim(),
    });

    setLoading(false);

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Account created successfully! Redirecting...');
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Groomer Portal Sign Up</h1>
        
        {errorMsg ? <p style={styles.error}>{errorMsg}</p> : null}
        {successMsg ? <p style={styles.success}>{successMsg}</p> : null}

        <form onSubmit={handleSignUp} style={styles.form}>
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
            placeholder="Password (min 6 characters)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.button} disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '15px', fontSize: '13px', color: '#4a5568' }}>
          Already have an account? <a href="/login" style={{ color: '#3182ce', fontWeight: '600' }}>Log in here</a>
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
  success: {
    color: '#38a169',
    fontSize: '13px',
    marginBottom: '10px',
    textAlign: 'center' as const,
  },
};