import React, { useState, useEffect } from 'react';
import axios from 'axios';
import styles from './Questions.module.css';

function Questions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [examLink, setExamLink] = useState('');
  const [isReleased, setIsReleased] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchExamLink = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/examlink', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data?.url) {
          setExamLink(res.data.url);
        } else {
          setExamLink('');
        }
        setLoading(false);
      } catch (err) {
        setLoading(false);
        setError('Failed to fetch exam link');
        console.error(err);
      }
    };

    fetchExamLink();
  }, [token]);

  const toggleReleaseStatus = async () => {
    try {
      const newStatus = !isReleased;
      await axios.patch(
        'http://localhost:5000/api/questions/release',
        { isReleased: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsReleased(newStatus);
      alert(`Exam release status set to: ${newStatus ? 'Released ✅' : 'Not Released ❌'}`);
    } catch (err) {
      setError('Failed to update release status.');
      console.error(err);
    }
  };

  return (
    <div className={`${styles.container} ${styles.fadeIn}`}>
      <h2 className={styles.title}>Manage Questions</h2>

      {loading && <p className={styles.loading}>Loading questions...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <section className={styles.section}>
        <h3 className={styles.subTitle}>Set External Exam Link</h3>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!token) {
              setError('User not authenticated. Please login again.');
              return;
            }

            try {
              await axios.post(
                'http://localhost:5000/api/examlink',
                { url: examLink },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              alert('Exam link updated successfully');
              setError('');
            } catch (err) {
              setError('Failed to update exam link.');
              console.error(err);
            }
          }}
        >
          <div className={styles.centerBox}>
            <input
              type="url"
              value={examLink}
              onChange={(e) => setExamLink(e.target.value)}
              placeholder="Paste exam link here (Google links allowed!)"
              required
              className={styles.inputWide}
            />
            <button type="submit" className={styles.saveButton}>
              Save Exam Link
            </button>
          </div>
        </form>
      </section>

      <section className={styles.section}>
        <p>
          <b>Exam Status:</b> {isReleased ? 'Released ✅' : 'Not Released ❌'}
        </p>
        <button className={styles.toggleButton} onClick={toggleReleaseStatus}>
          {isReleased ? 'Unrelease Exam' : 'Release Exam'}
        </button>
      </section>
    </div>
  );
}

export default Questions;
