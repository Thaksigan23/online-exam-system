import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import styles from './ExamPage.module.css'; // Optional styling
import { motion } from 'framer-motion';

function ExamPage() {
  const { link } = useParams();
  const navigate = useNavigate();

  const [exam, setExam] = useState(null);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:5000/api/exam/${link}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    })
      .then(res => {
        setExam(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Exam not found or expired.');
        setLoading(false);
      });
  }, [link]);

  const handleSelect = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option });
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        'http://localhost:5000/api/exam/submit',
        { answers },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setResult(res.data);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  if (loading) return <p>Loading exam...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;
  if (!exam) return null;

  return (
    <motion.div className={styles.container} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className={styles.title}>{exam.title}</h2>

      {submitted ? (
        <div className={styles.resultBox}>
          <h3>Your Result</h3>
          <p><strong>Score:</strong> {result.score} / {result.total}</p>
          <button onClick={() => navigate('/student/results')} className={styles.btn}>View My Results</button>
        </div>
      ) : (
        <>
          <form className={styles.examForm}>
            {exam.questions.map((q, idx) => (
              <div key={q._id} className={styles.questionCard}>
                <p><strong>{idx + 1}. {q.text}</strong></p>
                {q.options.map((opt, i) => (
                  <label key={i} className={styles.optionLabel}>
                    <input
                      type="radio"
                      name={q._id}
                      value={opt}
                      checked={answers[q._id] === opt}
                      onChange={() => handleSelect(q._id, opt)}
                    />
                    {opt}
                  </label>
                ))}
              </div>
            ))}
          </form>

          <button className={styles.submitBtn} onClick={handleSubmit}>Submit Exam</button>
        </>
      )}
    </motion.div>
  );
}

export default ExamPage;
