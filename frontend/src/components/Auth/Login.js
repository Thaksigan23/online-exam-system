import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Login.module.css';
import { motion } from 'framer-motion';
import AuthButton from './AuthButton';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:5000/api/auth/login', {
        email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('role', response.data.user.role);
        navigate('/dashboard');
      } else {
        setError('Login failed: No token received.');
      }
    } catch (err) {
      const message = err.response?.data?.message || 'Login failed. Please try again.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className={styles.title}>🔐 Login to Your Account</h1>
        <h2 className={styles.subtitle}>📚 Online Quiz System</h2>

        <motion.form
          onSubmit={handleLogin}
          initial="hidden"
          animate="visible"
          variants={{
            visible: { transition: { staggerChildren: 0.2 } },
          }}
        >
          <motion.input
            type="email"
            placeholder="📧 Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className={styles.input}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          />

          <motion.input
            type="password"
            placeholder="🔒 Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className={styles.input}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          />

          <AuthButton
            loading={loading}
            loadingText="Logging in..."
            ariaLabel="Submit login form"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            🚀 Login
          </AuthButton>
        </motion.form>

        {error && (
          <p className={styles.error} role="alert" aria-live="polite">
            ❌ {error}
          </p>
        )}

        <p className={styles.loginLink}>
          📝 Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Login;