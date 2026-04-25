import React, { useEffect, useState } from 'react';
import axios from 'axios';
import styles from './StudentResults.module.css';
import { motion } from 'framer-motion';

function StudentResults() {
  const [results, setResults] = useState([]);
  const [selectedResultId, setSelectedResultId] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:5000/api/results/my', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setResults(res.data);
        if (res.data.length > 0) setSelectedResultId(res.data[0]._id);
      } catch (err) {
        setError(err.response?.data?.message || 'Error fetching results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  if (loading) return <p>Loading your results...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (results.length === 0) return <p>No results found.</p>;
  const selectedResult = results.find((result) => result._id === selectedResultId) || results[0];

  return (
    <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className={styles.title}>My Exam Results</h2>
      <div className={styles.resultList}>
        {results.map((result) => (
          <div
            key={result._id}
            className={styles.resultCard}
            style={{
              cursor: 'pointer',
              border: selectedResult?._id === result._id ? '2px solid #22c55e' : '1px solid #ddd',
            }}
            onClick={() => setSelectedResultId(result._id)}
          >
            <h4>{result.examId?.title || 'Untitled Exam'}</h4>
            <p><strong>Score:</strong> {result.score} / {result.total}</p>
            <p><strong>Date:</strong> {new Date(result.submittedAt || result.createdAt).toLocaleString()}</p>
          </div>
        ))}
      </div>
      {selectedResult && (
        <div className={styles.resultCard} style={{ marginTop: '20px' }}>
          <h3>Detailed Review</h3>
          {(selectedResult.answers || []).map((answer) => (
            <div key={answer.questionId} style={{ marginBottom: '12px' }}>
              <p><strong>Q:</strong> {answer.question}</p>
              <p><strong>Your Answer:</strong> {answer.selectedAnswer || 'No Answer'}</p>
              <p><strong>Correct Answer:</strong> {answer.correctAnswer}</p>
              <p><strong>Status:</strong> {answer.isCorrect ? 'Correct' : 'Incorrect'}</p>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

export default StudentResults;
