import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import styles from './Register.module.css';
import { motion } from 'framer-motion';
import AuthButton from './AuthButton';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      navigate('/login');
    } catch (err) {
      const message = err.response?.data?.message || 'Registration failed. Please try again.';
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
        <h1 className={styles.title}>📝 Join the Quiz System</h1>
        <h2 className={styles.subtitle}>🎯 Create your account</h2>

        <motion.form
          onSubmit={handleRegister}
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: { staggerChildren: 0.2 }
            }
          }}
        >
          <motion.input
            type="text"
            name="name"
            placeholder="👤 Full Name"
            value={formData.name}
            onChange={handleInputChange}
            required
            className={styles.input}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          />

          <motion.input
            type="email"
            name="email"
            placeholder="📧 Email Address"
            value={formData.email}
            onChange={handleInputChange}
            required
            className={styles.input}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          />

          <motion.input
            type="password"
            name="password"
            placeholder="🔒 Password"
            value={formData.password}
            onChange={handleInputChange}
            required
            className={styles.input}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          />

          <motion.select
            name="role"
            value={formData.role}
            onChange={handleInputChange}
            required
            className={styles.select}
            variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
          >
            <option value="">🎓 Select Role</option>
            <option value="student">🧑‍🎓 Student</option>
            <option value="teacher">👩‍🏫 Teacher</option>
          </motion.select>

          <AuthButton
            loading={loading}
            loadingText="Registering..."
            ariaLabel="Submit registration form"
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
          >
            🚀 Register Now
          </AuthButton>
        </motion.form>

        {error && (
          <p className={styles.error} role="alert" aria-live="polite">
            ❌ {error}
          </p>
        )}

        <p className={styles.loginLink}>
          Already have an account? <Link to="/login">🔐 Login here</Link>
        </p>
      </motion.div>
    </div>
  );
}

export default Register;
