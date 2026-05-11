import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';

function TakeExam() {
  const [isReleased, setIsReleased] = useState(false);
  const [examLink, setExamLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

useEffect(() => {
  const fetchStatusAndLink = async () => {
    try {
      const linkRes = await axios.get(apiUrl('/examlink'), {
        headers: { Authorization: `Bearer ${token}` },
      });

      const { url, startTime, endTime } = linkRes.data;

      const now = new Date();
      const start = new Date(startTime);
      const end = new Date(endTime);

      if (now >= start && now <= end) {
        setIsReleased(true);
        setExamLink(url);
      } else {
        setIsReleased(false);
      }
    } catch (err) {
      setError('Could not load exam link or timing.');
    } finally {
      setLoading(false);
    }
  };

  fetchStatusAndLink();
}, [token]);


  if (loading)
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p>Loading...</p>
        </div>
      </div>
    );

  if (error)
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <p style={styles.error}>{error}</p>
        </div>
      </div>
    );

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>Take Your Exam</h2>
        <p>
  Exam available from {new Date(startTime).toLocaleString()} to {new Date(endTime).toLocaleString()}
</p>

        {isReleased ? (
          examLink ? (
            <>
              <button
                style={styles.button}
                onClick={() => {
                  const confirmStart = window.confirm('Are you ready to start your exam?');
                  if (confirmStart) {
                    window.open(examLink, '_blank');
                  }
                }}
              >
                Start Exam
              </button>
              <p style={styles.linkText}>
                Or access directly via{' '}
                <a
                  href={examLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={styles.link}
                >
                  this link
                </a>
              </p>
            </>
          ) : (
            <p style={styles.message}>The teacher has not set the exam link yet.</p>
          )
        ) : (
          <p style={styles.message}>The exam hasn't been released yet. Please check back later.</p>
        )}
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
    backgroundColor: '#f4f6f8',
    padding: '20px',
  },
  card: {
    backgroundColor: '#fff',
    padding: '40px',
    borderRadius: '10px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    textAlign: 'center',
    width: '100%',
    maxWidth: '400px',
  },
  heading: {
    fontSize: '24px',
    marginBottom: '20px',
    color: '#333',
  },
  button: {
    padding: '12px 24px',
    fontSize: '16px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginBottom: '15px',
  },
  linkText: {
    fontSize: '14px',
    marginTop: '10px',
  },
  link: {
    color: '#007bff',
    textDecoration: 'underline',
  },
  message: {
    color: '#555',
    fontSize: '16px',
  },
  error: {
    color: 'red',
    fontWeight: 'bold',
  },
};

export default TakeExam;
