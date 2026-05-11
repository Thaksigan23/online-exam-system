import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { apiUrl } from '../config/api';
import styles from './Exam.module.css';

function Exam() {
  const [examTitle, setExamTitle] = useState('');
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [initialLoad, setInitialLoad] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [isTimerExpired, setIsTimerExpired] = useState(false);
  const [duplicateTab, setDuplicateTab] = useState(false);
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);

  const token = localStorage.getItem('token');
  const answersRef = useRef(answers);
  const resultRef = useRef(result);
  answersRef.current = answers;
  resultRef.current = result;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const submitExam = useCallback(
    async (isAutoSubmit = false) => {
      setError('');
      setSubmitLoading(true);
      try {
        const res = await axios.post(
          apiUrl('/exam/submit'),
          { answers, autoSubmitted: isAutoSubmit },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setResult(res.data);
      } catch (submitError) {
        const msg =
          submitError.response?.data?.message ||
          submitError.response?.data?.error ||
          'We could not submit your answers. Check your connection and try again.';
        setError(msg);
      } finally {
        setSubmitLoading(false);
      }
    },
    [answers, token]
  );

  useEffect(() => {
    const fetchQuestions = async () => {
      setInitialLoad(true);
      setError('');
      setAlreadySubmitted(false);
      try {
        const res = await axios.get(apiUrl('/exam/questions'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setExamTitle(res.data.title || 'Quiz');
        setQuestions(res.data.questions || []);
        const examDuration = (res.data.durationMinutes || 30) * 60;
        setDurationSeconds(examDuration);
        setRemainingSeconds(examDuration);
      } catch (fetchError) {
        if (fetchError.response?.status === 409) {
          setAlreadySubmitted(true);
          setError(
            fetchError.response?.data?.message ||
              'You have already submitted this quiz. Each student gets one attempt.'
          );
          return;
        }
        const msg =
          fetchError.response?.data?.message ||
          fetchError.response?.data?.error ||
          'Could not load the quiz. Make sure you are logged in as a student and try again.';
        setError(msg);
      } finally {
        setInitialLoad(false);
      }
    };
    fetchQuestions();

    const channel = new BroadcastChannel('exam_channel');
    channel.postMessage('exam_opened');
    channel.onmessage = (e) => {
      if (e.data === 'exam_opened') {
        setDuplicateTab(true);
      }
    };

    return () => {
      channel.close();
    };
  }, [token]);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (resultRef.current) return;
      if (Object.keys(answersRef.current).length === 0) return;
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    if (result || initialLoad || submitLoading || questions.length === 0) {
      return undefined;
    }

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
  }, [result, initialLoad, submitLoading, questions.length, submitExam]);

  const handleOptionChange = (questionId, selectedOption) => {
    setAnswers((prev) => ({ ...prev, [questionId]: selectedOption }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const unanswered = questions.filter((q) => !answers[q._id]);
    if (unanswered.length > 0) {
      setError(
        `Please answer all questions before submitting. (${unanswered.length} still unanswered.)`
      );
      return;
    }
    await submitExam(false);
  };

  if (initialLoad && questions.length === 0 && !error) {
    return (
      <div className={styles.container} aria-busy="true">
        <div className={styles.loadingCard}>
          <div className={styles.spinner} aria-hidden="true" />
          <p>Loading your quiz…</p>
        </div>
      </div>
    );
  }

  const unansweredCount = questions.filter((q) => !answers[q._id]).length;
  const timerUrgent = remainingSeconds > 0 && remainingSeconds <= 60;

  return (
    <div className={styles.container}>
      <h2>Take exam</h2>
      {examTitle && !result && <p className={styles.examTitle}>{examTitle}</p>}

      {duplicateTab && (
        <div className={styles.bannerWarn} role="status">
          This quiz may be open in another tab. Use only one tab so your answers and timer stay
          correct.
        </div>
      )}

      {error && (
        <div className={styles.bannerError} role="alert">
          {error}
          {alreadySubmitted && (
            <div className={styles.resultActions} style={{ marginTop: '0.75rem' }}>
              <Link to="/results" className={styles.linkButton}>
                View your results
              </Link>
            </div>
          )}
        </div>
      )}

      {!result && !alreadySubmitted && questions.length > 0 && (
        <p className={styles.bannerInfo} role="status" aria-live="polite">
          Progress:{' '}
          <strong>{questions.filter((q) => answers[q._id]).length}</strong> of{' '}
          <strong>{questions.length}</strong> questions answered
        </p>
      )}

      {!result && !alreadySubmitted && durationSeconds > 0 && questions.length > 0 && (
        <div
          className={`${styles.timer} ${timerUrgent ? styles.timerUrgent : ''}`}
          role="timer"
          aria-live="polite"
          aria-atomic="true"
          aria-label="Time remaining for this quiz"
        >
          Time left: {formatTime(remainingSeconds)}
          {timerUrgent && <span className={styles.srOnly}>Less than one minute remaining.</span>}
        </div>
      )}

      {isTimerExpired && !result && (
        <p className={styles.bannerInfo} role="status">
          Time is up. Submitting your answers now…
        </p>
      )}

      {submitLoading && (
        <p className={styles.bannerInfo} role="status">
          Submitting your answers…
        </p>
      )}

      {result ? (
        <div className={styles.result}>
          <h3>Quiz submitted</h3>
          <p>
            Your score: <strong>{result.score}</strong> out of <strong>{result.total}</strong>
          </p>
          {result.autoSubmitted && (
            <p className={styles.bannerWarn} style={{ marginTop: '0.75rem' }}>
              Submitted automatically when the timer ran out.
            </p>
          )}
          <div className={styles.resultActions}>
            <Link to="/results" className={styles.linkButton}>
              Review answers
            </Link>
            <Link to="/dashboard" className={styles.linkButton}>
              Back to dashboard
            </Link>
          </div>
        </div>
      ) : alreadySubmitted ? null : !error && questions.length === 0 ? (
        <div className={styles.bannerInfo} role="status">
          <p>There are no questions in this quiz yet.</p>
          <p style={{ marginTop: '0.5rem', fontSize: '0.95rem' }}>
            If you are a teacher, add questions under <strong>Manage Questions</strong>, then create
            or publish a quiz from the same page.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} aria-label={`${examTitle || 'Quiz'} questions`}>
          {unansweredCount > 0 && (
            <p className={styles.bannerInfo} role="status">
              {unansweredCount} question{unansweredCount === 1 ? '' : 's'} still unanswered.
            </p>
          )}
          {questions.map((q, index) => (
            <fieldset key={q._id} className={styles.questionFieldset}>
              <legend className={styles.questionLegend}>
                Question {index + 1}: {q.text}
              </legend>
              <ul className={styles.options}>
                {q.options.map((opt, i) => {
                  const inputId = `q-${q._id}-opt-${i}`;
                  return (
                    <li key={inputId} className={styles['option-item']}>
                      <label htmlFor={inputId} className={styles.optionLabel}>
                        <input
                          id={inputId}
                          type="radio"
                          name={`question-${q._id}`}
                          value={opt}
                          checked={answers[q._id] === opt}
                          onChange={() => handleOptionChange(q._id, opt)}
                          disabled={submitLoading}
                        />
                        <span>{opt}</span>
                      </label>
                    </li>
                  );
                })}
              </ul>
            </fieldset>
          ))}

          <button type="submit" disabled={submitLoading || questions.length === 0}>
            {submitLoading ? 'Submitting…' : 'Submit quiz'}
          </button>
        </form>
      )}
    </div>
  );
}

export default Exam;
