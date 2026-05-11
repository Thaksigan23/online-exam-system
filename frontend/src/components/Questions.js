import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';
import styles from './Questions.module.css';

const newQuestionBlock = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
  text: '',
  o1: '',
  o2: '',
  o3: '',
  o4: '',
  correctIndex: 0,
});

function Questions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');
  const [examLink, setExamLink] = useState('');
  const [isReleased, setIsReleased] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  const [quizTitle, setQuizTitle] = useState('Class quiz');
  const [durationMinutes, setDurationMinutes] = useState(30);
  const [linkSlug, setLinkSlug] = useState('');
  const [quizBlocks, setQuizBlocks] = useState([newQuestionBlock()]);
  const [savingQuiz, setSavingQuiz] = useState(false);

  const token = localStorage.getItem('token');

  const loadPage = useCallback(async () => {
    setLoading(true);
    setError('');
    setFeedback('');
    try {
      const [qRes, linkRes] = await Promise.all([
        axios.get(apiUrl('/questions'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
        axios.get(apiUrl('/examlink'), {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (qRes.data?.isReleased !== undefined) {
        setIsReleased(Boolean(qRes.data.isReleased));
      }
      setQuestionCount(Array.isArray(qRes.data?.questions) ? qRes.data.questions.length : 0);

      if (linkRes?.data?.url) {
        setExamLink(linkRes.data.url);
      }
    } catch (err) {
      setError('Could not load teacher tools. Try refreshing the page.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadPage();
  }, [loadPage]);

  const toggleReleaseStatus = async () => {
    setFeedback('');
    try {
      const newStatus = !isReleased;
      await axios.patch(
        apiUrl('/questions/release'),
        { isReleased: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsReleased(newStatus);
      setFeedback(
        newStatus
          ? 'Students can see released questions in the question bank.'
          : 'Exam marked as not released.'
      );
    } catch (err) {
      setError('Could not update release status.');
      console.error(err);
    }
  };

  const updateBlock = (id, field, value) => {
    setQuizBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, [field]: value } : b))
    );
  };

  const addQuestionRow = () => {
    setQuizBlocks((prev) => [...prev, newQuestionBlock()]);
  };

  const removeQuestionRow = (id) => {
    setQuizBlocks((prev) => (prev.length <= 1 ? prev : prev.filter((b) => b.id !== id)));
  };

  const handleCreateQuiz = async (e) => {
    e.preventDefault();
    setError('');
    setFeedback('');
    setSavingQuiz(true);

    try {
      const questions = quizBlocks.map((b) => {
        const options = [b.o1, b.o2, b.o3, b.o4].map((o) => o.trim());
        if (!b.text.trim()) {
          throw new Error('Each question needs a prompt.');
        }
        if (options.some((o) => !o)) {
          throw new Error('Each question needs four answer choices.');
        }
        const correctAnswer = options[Number(b.correctIndex)] || options[0];
        return {
          text: b.text.trim(),
          options,
          correctAnswer,
        };
      });

      await axios.post(
        apiUrl('/exam'),
        {
          title: quizTitle.trim() || 'Online Quiz',
          link: linkSlug.trim() || undefined,
          durationMinutes: Math.max(1, Number(durationMinutes) || 30),
          questions,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setFeedback(
        'Quiz created and set as the active exam. Students can open Take exam after questions exist in the bank.'
      );
      setQuizBlocks([newQuestionBlock()]);
      await loadPage();
    } catch (err) {
      const msg =
        err.message ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Could not create the quiz.';
      setError(msg);
    } finally {
      setSavingQuiz(false);
    }
  };

  return (
    <div className={`${styles.container} ${styles.fadeIn}`}>
      <h2 className={styles.title}>Manage questions</h2>

      {loading && (
        <div className={styles.loading} role="status" aria-live="polite">
          <span className={styles.inlineSpinner} aria-hidden="true" />
          Loading…
        </div>
      )}
      {error && (
        <div className={styles.bannerError} role="alert">
          {error}
        </div>
      )}
      {feedback && (
        <div className={styles.bannerSuccess} role="status">
          {feedback}
        </div>
      )}

      <section className={styles.section} aria-labelledby="create-quiz-heading">
        <h3 id="create-quiz-heading" className={styles.subTitle}>
          Create online quiz
        </h3>
        <p className={styles.helpText}>
          Builds a new timed quiz for students (one active exam at a time). Add at least one
          question below. You can still add individual questions to the bank from this page later.
        </p>
        <p className={styles.metaLine}>
          Questions in bank: <strong>{questionCount}</strong>
        </p>

        <form className={styles.quizForm} onSubmit={handleCreateQuiz}>
          <div className={styles.row}>
            <label className={styles.label} htmlFor="quiz-title">
              Quiz title
            </label>
            <input
              id="quiz-title"
              className={styles.inputWide}
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g. Week 5 review"
            />
          </div>
          <div className={styles.rowTwo}>
            <div>
              <label className={styles.label} htmlFor="quiz-duration">
                Duration (minutes)
              </label>
              <input
                id="quiz-duration"
                type="number"
                min={1}
                max={240}
                className={styles.inputNumber}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(e.target.value)}
              />
            </div>
            <div>
              <label className={styles.label} htmlFor="quiz-slug">
                Optional link code
              </label>
              <input
                id="quiz-slug"
                className={styles.inputWide}
                value={linkSlug}
                onChange={(e) => setLinkSlug(e.target.value)}
                placeholder="letters-numbers only"
              />
            </div>
          </div>

          {quizBlocks.map((block, index) => (
            <fieldset key={block.id} className={styles.questionCard}>
              <legend className={styles.cardLegend}>Question {index + 1}</legend>
              <label className={styles.label} htmlFor={`qtext-${block.id}`}>
                Prompt
              </label>
              <textarea
                id={`qtext-${block.id}`}
                className={styles.textArea}
                rows={2}
                value={block.text}
                onChange={(e) => updateBlock(block.id, 'text', e.target.value)}
                placeholder="Enter the question"
              />
              <div className={styles.optionsGrid}>
                {['o1', 'o2', 'o3', 'o4'].map((key, i) => (
                  <div key={key}>
                    <label className={styles.label} htmlFor={`${key}-${block.id}`}>
                      Choice {i + 1}
                    </label>
                    <input
                      id={`${key}-${block.id}`}
                      className={styles.inputWide}
                      value={block[key]}
                      onChange={(e) => updateBlock(block.id, key, e.target.value)}
                    />
                  </div>
                ))}
              </div>
              <label className={styles.label} htmlFor={`correct-${block.id}`}>
                Correct answer
              </label>
              <select
                id={`correct-${block.id}`}
                className={styles.select}
                value={block.correctIndex}
                onChange={(e) => updateBlock(block.id, 'correctIndex', Number(e.target.value))}
              >
                <option value={0}>Choice 1</option>
                <option value={1}>Choice 2</option>
                <option value={2}>Choice 3</option>
                <option value={3}>Choice 4</option>
              </select>
              {quizBlocks.length > 1 && (
                <button
                  type="button"
                  className={styles.ghostButton}
                  onClick={() => removeQuestionRow(block.id)}
                >
                  Remove this question
                </button>
              )}
            </fieldset>
          ))}

          <div className={styles.actionsRow}>
            <button type="button" className={styles.secondaryButton} onClick={addQuestionRow}>
              Add another question
            </button>
            <button type="submit" className={styles.saveButton} disabled={savingQuiz}>
              {savingQuiz ? 'Saving quiz…' : 'Publish quiz'}
            </button>
          </div>
        </form>
      </section>

      <section className={styles.section}>
        <h3 className={styles.subTitle}>External exam link (optional)</h3>
        <p className={styles.helpText}>
          If your school uses a separate link (for example Google Forms), save it here. The in-app
          quiz above works independently.
        </p>

        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (!token) {
              setError('Please log in again.');
              return;
            }
            setFeedback('');
            try {
              const now = new Date();
              const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
              await axios.post(
                apiUrl('/examlink'),
                {
                  url: examLink,
                  startTime: now.toISOString(),
                  endTime: end.toISOString(),
                },
                {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                  },
                }
              );
              setFeedback('External exam link saved with a default one-week window.');
              setError('');
            } catch (err) {
              setError(
                err.response?.data?.message ||
                  'Could not save the external link. Check the URL and try again.'
              );
              console.error(err);
            }
          }}
        >
          <div className={styles.centerBox}>
            <input
              type="url"
              value={examLink}
              onChange={(e) => setExamLink(e.target.value)}
              placeholder="https://…"
              className={styles.inputWide}
            />
            <button type="submit" className={styles.saveButton}>
              Save link
            </button>
          </div>
        </form>
      </section>

      <section className={styles.section}>
        <p>
          <strong>Question bank release:</strong>{' '}
          {isReleased ? 'Released (visible to students)' : 'Not released'}
        </p>
        <button type="button" className={styles.toggleButton} onClick={toggleReleaseStatus}>
          {isReleased ? 'Unrelease question bank' : 'Release question bank'}
        </button>
      </section>
    </div>
  );
}

export default Questions;
