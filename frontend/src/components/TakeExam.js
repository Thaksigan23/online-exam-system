import React, { useEffect, useState } from 'react';
import { apiUrl } from '../config/api';
import styles from './TakeExam.module.css';

const TakeExam = () => {
  const [examLink, setExamLink] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExamLink = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(apiUrl('/examlink'), {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to fetch exam link.');

        setExamLink(data.url);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchExamLink();
  }, []);

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.title}>📝 Take Exam</h1>

        {loading ? (
          <p className={styles.loading}>Loading exam link...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : examLink ? (
          <a
            href={examLink}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.examButton}
          >
            Open Exam Link
          </a>
        ) : (
          <p className={styles.noLink}>No exam link is currently available.</p>
        )}
      </div>
    </div>
  );
};

export default TakeExam;
