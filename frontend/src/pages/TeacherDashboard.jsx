import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';
import styles from './TeacherDashboard.module.css';

function TeacherDashboard() {
  const [results, setResults] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [filters, setFilters] = useState({
    studentName: '',
    studentEmail: '',
    examTitle: '',
    minScore: '',
    maxScore: '',
    startDate: '',
    endDate: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const params = {};

      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const [resultsRes, analyticsRes] = await Promise.all([
        axios.get(apiUrl('/results'), {
          headers: { Authorization: `Bearer ${token}` },
          params,
        }),
        axios.get(apiUrl('/results/analytics'), {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      setResults(resultsRes.data);
      setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = e => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    fetchResults();
  };

  const downloadCsv = () => {
    const headers = ['Student Name', 'Email', 'Exam', 'Score', 'Total', 'Submitted'];
    const rows = results.map((r) => [
      r.studentId?.name || '',
      r.studentId?.email || '',
      r.examId?.title || '',
      r.score,
      r.total,
      new Date(r.submittedAt || r.createdAt).toISOString(),
    ]);
    const esc = (cell) => {
      const s = String(cell ?? '');
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const csv = [headers.map(esc).join(','), ...rows.map((row) => row.map(esc).join(','))].join(
      '\n'
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exam-results-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className={styles.container}>
      <h2>Teacher Dashboard - Student Exam Results</h2>
      {analytics && (
        <div className={styles.filterForm} style={{ marginBottom: '16px' }}>
          <div><strong>Total Attempts:</strong> {analytics.attemptCount}</div>
          <div><strong>Average Score:</strong> {analytics.averageScore}</div>
          <div><strong>Pass Rate:</strong> {analytics.passRate}%</div>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.filterForm}>
        <input
          type="text"
          name="studentName"
          placeholder="Student Name"
          value={filters.studentName}
          onChange={handleChange}
        />
        <input
          type="email"
          name="studentEmail"
          placeholder="Student Email"
          value={filters.studentEmail}
          onChange={handleChange}
        />
        <input
          type="text"
          name="examTitle"
          placeholder="Exam Title"
          value={filters.examTitle}
          onChange={handleChange}
        />
        <input
          type="number"
          name="minScore"
          placeholder="Min Score"
          value={filters.minScore}
          onChange={handleChange}
          min="0"
        />
        <input
          type="number"
          name="maxScore"
          placeholder="Max Score"
          value={filters.maxScore}
          onChange={handleChange}
          min="0"
        />
        <input
          type="date"
          name="startDate"
          placeholder="Start Date"
          value={filters.startDate}
          onChange={handleChange}
        />
        <input
          type="date"
          name="endDate"
          placeholder="End Date"
          value={filters.endDate}
          onChange={handleChange}
        />
        <button type="submit" className={styles.filterBtn}>
          Filter
        </button>
        <button type="button" className={styles.filterBtn} onClick={downloadCsv} disabled={!results.length}>
          Download CSV
        </button>
      </form>

      {loading && <p>Loading results...</p>}
      {error && <p className={styles.error}>{error}</p>}

      <table className={styles.resultsTable}>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Email</th>
            <th>Exam</th>
            <th>Score</th>
            <th>Date Taken</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r) => (
            <tr key={r._id}>
              <td>{r.studentId?.name || 'N/A'}</td>
              <td>{r.studentId?.email || 'N/A'}</td>
              <td>{r.examId?.title || 'N/A'}</td>
              <td>{r.score} / {r.total}</td>
              <td>{new Date(r.submittedAt || r.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {analytics && analytics.questionPerformance?.length > 0 && (
        <>
          <h3 style={{ marginTop: '20px' }}>Question Analytics (Lowest Accuracy First)</h3>
          <table className={styles.resultsTable}>
            <thead>
              <tr>
                <th>Question</th>
                <th>Attempts</th>
                <th>Correct</th>
                <th>Accuracy</th>
              </tr>
            </thead>
            <tbody>
              {analytics.questionPerformance.map((item) => (
                <tr key={item.questionId}>
                  <td>{item.question}</td>
                  <td>{item.totalAttempts}</td>
                  <td>{item.correctAttempts}</td>
                  <td>{item.accuracy}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {!loading && results.length === 0 && <p>No results found.</p>}
    </div>
  );
}

export default TeacherDashboard;
