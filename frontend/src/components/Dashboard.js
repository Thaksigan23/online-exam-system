import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { getUserFromToken } from '../utils/getUserFromToken';
import { apiUrl } from '../config/api';
import styles from './Dashboard.module.css';

const COLORS = ['#22c55e', '#f97316'];

const Dashboard = () => {
  const navigate = useNavigate();
  const user = getUserFromToken();

  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [error, setError] = useState('');

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const [statsRes, historyRes] = await Promise.all([
          fetch(apiUrl('/exam/stats'), {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
          fetch(apiUrl('/exam/history'), {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }),
        ]);

        if (!statsRes.ok || !historyRes.ok) throw new Error('Unauthorized or failed to fetch');
        const statsData = await statsRes.json();
        const historyData = await historyRes.json();

        setStats(statsData);
        setHistory(historyData);
      } catch (err) {
        console.error('Stats fetch error:', err);
        setError('Failed to fetch exam stats.');
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const chartData = stats
    ? [
        { name: 'Correct', value: stats.correctAnswers },
        { name: 'Incorrect', value: stats.totalAnswers - stats.correctAnswers },
      ]
    : [];

  const barData = stats
    ? [
        { name: 'Average Score', Score: stats.averageScore },
        { name: 'Exams Taken', Score: stats.examsTaken },
      ]
    : [];

  return (
    <div className={styles.container}>
      <div className={styles.headerBox}>
        <h1 className={styles.title}>🎉 Welcome, {user?.name}!</h1>
        <p className={styles.subTitle}>🧑‍💼 Role: {user?.role}</p>
      </div>

      <nav className={styles.nav}>
        <a href="/dashboard" className={styles.navLink}>🏠 Dashboard</a>
        <a href="/questions" className={styles.navLink}>📋 Questions</a>
        <a href="/results" className={styles.navLink}>📊 Results</a>
      </nav>

      {loadingStats && <p className={styles.loading}>⏳ Loading stats...</p>}
      {error && <p className={styles.error}>❌ {error}</p>}

      {!loadingStats && stats && (
        <>
          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={chartData} dataKey="value" nameKey="name" outerRadius={80} label>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartBox}>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Score" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className={styles.chartBox}>
            {history.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={history}>
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="score" stroke="#0ea5e9" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className={styles.empty}>📭 No exam history yet.</p>
            )}
          </div>
        </>
      )}

      <div className={styles.buttonGroup}>
        {user?.role === 'teacher' && (
          <button className={`${styles.button} ${styles.buttonBlue}`} onClick={() => navigate('/questions')}>
            📋 Manage Questions
          </button>
        )}
        <button className={`${styles.button} ${styles.buttonGreen}`} onClick={() => navigate('/exam')}>
          📝 Take Exam
        </button>
        <button className={`${styles.button} ${styles.buttonPurple}`} onClick={() => navigate('/results')}>
          📊 View Your Results
        </button>
        {user?.role === 'teacher' && (
          <button className={`${styles.button} ${styles.buttonYellow}`} onClick={() => navigate('/teacher-results')}>
            👩‍🏫 Student Results
          </button>
        )}
      </div>

      <button className={`${styles.button} ${styles.buttonRed}`} onClick={handleLogout}>
        🚪 Logout
      </button>
    </div>
  );
};

export default Dashboard;
