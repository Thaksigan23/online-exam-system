import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';
import styles from './Results.module.css';

function Results() {
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const res = await axios.get(apiUrl('/results/my'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setResults(res.data);
        if (res.data.length > 0) {
          setSelectedResult(res.data[0]);
        }
        setError('');
      } catch (err) {
        setError('Failed to load results.');
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [token]);

  if (loading)
    return (
      <p className={styles.loadingText} style={{ textAlign: 'center' }}>
        Loading results...
      </p>
    );

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Your Exam Results</h2>

      {error && <p className={styles.errorText}>{error}</p>}

      {results.length === 0 ? (
        <p className={styles.noResults}>No results to display.</p>
      ) : (
        <>
          <div className={styles.summary}>
            <strong>Attempts:</strong> {results.length}
          </div>
          <div className={styles.resultsList}>
            {results.map((r) => {
              const isSelected = selectedResult?._id === r._id;
              return (
                <div
                  key={r._id}
                  className={`${styles.resultItem} ${isSelected ? styles.correct : ''}`}
                  onClick={() => setSelectedResult(r)}
                  role="button"
                  tabIndex={0}
                >
                  <div className={styles.questionText}>{r.examId?.title || 'Online Quiz'}</div>
                  <div>Score: <span className={styles.score}>{r.score}</span> / {r.total}</div>
                  <div>Date: {new Date(r.submittedAt || r.createdAt).toLocaleString()}</div>
                </div>
              );
            })}
          </div>

          {selectedResult && (
            <div className={styles.summary}>
              <h3>Answer Breakdown</h3>
              {selectedResult.answers?.map((answer) => (
                <div key={answer.questionId} className={styles.resultItem}>
                  <div className={styles.questionText}>{answer.question}</div>
                  <div>Your answer: <span className={styles.userAnswer}>{answer.selectedAnswer || 'No answer'}</span></div>
                  <div>Correct answer: <span className={styles.correctAnswer}>{answer.correctAnswer}</span></div>
                  <div>{answer.isCorrect ? 'Correct' : 'Incorrect'}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Results;
