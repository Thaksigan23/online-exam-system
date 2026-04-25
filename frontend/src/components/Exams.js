import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import styles from './Exam.module.css';

function Exam() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isTimerExpired, setIsTimerExpired] = useState(false);

  const token = localStorage.getItem('token');

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const submitExam = useCallback(async (isAutoSubmit = false) => {
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(
        'http://localhost:5000/api/exam/submit',
        { answers, autoSubmitted: isAutoSubmit },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setResult(res.data);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Failed to submit exam.');
    } finally {
      setLoading(false);
    }
  }, [answers, token]);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const res = await axios.get('http://localhost:5000/api/exam/questions', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(res.data.questions || []);
        const examDuration = (res.data.durationMinutes || 30) * 60;
        setDurationSeconds(examDuration);
        setRemainingSeconds(examDuration);
      } catch (fetchError) {
        if (fetchError.response?.status === 409) {
          setError(fetchError.response?.data?.message || 'You already submitted this quiz.');
          return;
        }
        setError('Failed to load exam questions.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();

    // Security Measures
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    const handleContextMenu = (e) => e.preventDefault();
    const handleKeyDown = (e) => {
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'C') ||
        (e.ctrlKey && e.key === 'V') ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('contextmenu', handleContextMenu);
    window.addEventListener('keydown', handleKeyDown);

    // Prevent multiple tabs
    const channel = new BroadcastChannel('exam_channel');
    channel.postMessage('exam_opened');
    channel.onmessage = (e) => {
      if (e.data === 'exam_opened') {
        alert('Exam is already open in another tab.');
      }
    };

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('contextmenu', handleContextMenu);
      window.removeEventListener('keydown', handleKeyDown);
      channel.close();
    };
  }, [token]);

  useEffect(() => {
    if (result || loading || questions.length === 0) return undefined;

    const intervalId = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          setIsTimerExpired(true);
          submitExam(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [result, loading, questions.length, submitExam]);

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers(prev => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitExam(false);
  };

  if (loading && questions.length === 0) return <p className={styles.loading}>Loading exam...</p>;

  return (
    <div className={styles.container}>
      <h2>Take Exam</h2>
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {!result && durationSeconds > 0 && (
        <p style={{ textAlign: 'center', marginBottom: '12px', fontWeight: 'bold' }}>
          Time left: {formatTime(remainingSeconds)}
        </p>
      )}
      {isTimerExpired && !result && (
        <p style={{ textAlign: 'center', color: '#b91c1c' }}>
          Time is up. Your quiz is being submitted automatically.
        </p>
      )}

      {result ? (
        <div className={styles.result}>
          <h3>✅ Exam Submitted</h3>
          <p>Your Score: {result.score} / {result.total}</p>
          {result.autoSubmitted && (
            <p style={{ marginTop: '8px', color: '#b45309' }}>Submitted automatically when timer expired.</p>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {questions.map(q => (
            <div key={q._id} className={styles.question}>
              <div className={styles['question-text']}>{q.text}</div>
              <ul className={styles.options}>
                {q.options.map((opt, i) => (
                  <li key={i} className={styles['option-item']}>
                    <label>
                      <input
                        type="radio"
                        name={q._id}
                        value={opt}
                        checked={answers[q._id] === opt}
                        onChange={() => handleOptionChange(q._id, opt)}
                        required
                      />
                      {' '}{opt}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <button type="submit" disabled={loading || questions.length === 0}>
            {loading ? 'Submitting...' : 'Submit Exam'}
          </button>
        </form>
      )}
    </div>
  );
}

export default Exam;
