import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';
import styles from './TeacherQuestions.module.css'; // create this file for styles or adjust

function TeacherQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
  });

  const [isReleased, setIsReleased] = useState(false);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(apiUrl('/questions'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        setQuestions(res.data.questions);
        setIsReleased(res.data.isReleased);
      } catch (err) {
        setError('Failed to load questions.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuestions();
  }, [token]);

  const handleInputChange = (e, optionIndex = null) => {
    if (optionIndex !== null) {
      const newOptions = [...form.options];
      newOptions[optionIndex] = e.target.value;
      setForm(prev => ({ ...prev, options: newOptions }));
    } else {
      setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }
  };

  const handleAddQuestion = async (e) => {
    e.preventDefault();

    if (!form.text.trim() || form.options.some(opt => !opt.trim()) || !form.correctAnswer) {
      alert('Please fill all fields and select the correct answer.');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await axios.post(apiUrl('/questions'), form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(prev => [...prev, res.data]);
      setForm({ text: '', options: ['', '', '', ''], correctAnswer: '' });
    } catch {
      setError('Failed to add question.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuestion = async (id) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;

    setLoading(true);
    try {
      await axios.delete(apiUrl(`/questions/${id}`), {
        headers: { Authorization: `Bearer ${token}` }
      });
      setQuestions(prev => prev.filter(q => q._id !== id));
    } catch {
      setError('Failed to delete question.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleRelease = async () => {
    setLoading(true);
    try {
      const newStatus = !isReleased;
      await axios.patch(apiUrl('/questions/release'), { isReleased: newStatus }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIsReleased(newStatus);
      alert(`Exam has been ${newStatus ? 'released' : 'unreleased'}`);
    } catch {
      setError('Failed to update exam release status.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h2>Manage Exam Questions</h2>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <button onClick={handleToggleRelease} disabled={loading}>
        {loading ? 'Updating...' : isReleased ? 'Unrelease Exam' : 'Release Exam'}
      </button>

      <form onSubmit={handleAddQuestion} className={styles.form}>
        <h3>Add New Question</h3>

        <label>
          Question Text:
          <textarea
            name="text"
            value={form.text}
            onChange={handleInputChange}
            required
          />
        </label>

        <div>
          <p>Options:</p>
          {form.options.map((opt, i) => (
            <input
              key={i}
              type="text"
              value={opt}
              onChange={(e) => handleInputChange(e, i)}
              placeholder={`Option ${i + 1}`}
              required
            />
          ))}
        </div>

        <label>
          Correct Answer:
          <select
            name="correctAnswer"
            value={form.correctAnswer}
            onChange={handleInputChange}
            required
          >
            <option value="">Select correct option</option>
            {form.options.map((opt, i) => (
              <option key={i} value={opt}>{opt || `Option ${i + 1}`}</option>
            ))}
          </select>
        </label>

        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Question'}
        </button>
      </form>

      <h3>Existing Questions</h3>
      <ul className={styles.questionList}>
        {questions.length === 0 && <p>No questions added yet.</p>}
        {questions.map(q => (
          <li key={q._id} className={styles.questionItem}>
            <strong>{q.text}</strong>
            <ul>
              {q.options.map((opt, i) => (
                <li key={i} style={{ fontWeight: opt === q.correctAnswer ? 'bold' : 'normal' }}>
                  {opt}
                </li>
              ))}
            </ul>
            <button onClick={() => handleDeleteQuestion(q._id)} disabled={loading}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default TeacherQuestions;
