import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './ViewResults.module.css';

function ViewResults() {
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await axios.get('http://localhost:5000/api/results/all', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data);
      } catch (err) {
        setError('Failed to load exam results.');
      }
    };

    fetchResults();
  }, [token]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Student Exam Results</h2>
      {error && <p className={styles.error}>{error}</p>}

      {results.length === 0 ? (
        <p className={styles.noResults}>No exam results available.</p>
      ) : (
        <table className={styles.resultsTable}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Score</th>
              <th>Date</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res, i) => (
              <tr key={i} className={i % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                <td>{res.studentName}</td>
                <td>{res.studentEmail}</td>
                <td>
                  <span
                    className={
                      res.score >= 75
                        ? styles.highScore
                        : res.score >= 50
                        ? styles.mediumScore
                        : styles.lowScore
                    }
                  >
                    {res.score}%
                  </span>
                </td>
                <td>{new Date(res.createdAt).toLocaleDateString()}</td>
                <td>
                  <details>
                    <summary className={styles.detailsSummary}>View Answers</summary>
                    <ul className={styles.answerList}>
                      {res.answers?.map((a, idx) => (
                        <li key={idx} className={a.isCorrect ? styles.correctAnswer : styles.wrongAnswer}>
                          <strong>Q:</strong> {a.question} <br />
                          <strong>Your Answer:</strong> {a.selectedAnswer} <br />
                          <strong>Correct:</strong> {a.isCorrect ? '✅' : '❌'}
                        </li>
                      ))}
                    </ul>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default ViewResults;
