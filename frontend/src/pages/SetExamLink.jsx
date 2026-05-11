import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';

function SetExamLink() {
  const [url, setUrl] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = localStorage.getItem('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      await axios.post(
        apiUrl('/examlink'),
        { url, startTime, endTime },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setMessage('✅ Exam link and time window set successfully.');
    } catch (err) {
      setError(err.response?.data?.message || '❌ Failed to set exam link.');
    }
  };
  const navigate = useNavigate();

useEffect(() => {
  const role = localStorage.getItem('role');
  if (role !== 'teacher') {
    alert('Access denied. Teachers only.');
    navigate('/unauthorized'); // or redirect to home or dashboard
  }
}, []);


  return (
    <div style={styles.container}>
      <h2>Set Exam Link & Time Window</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Exam URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
          style={styles.input}
        />
        <label>Start Time:</label>
        <input
          type="datetime-local"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
          style={styles.input}
        />
        <label>End Time:</label>
        <input
          type="datetime-local"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button}>Save</button>
      </form>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

const styles = {
  container: {
    padding: '40px',
    maxWidth: '500px',
    margin: 'auto',
    backgroundColor: '#f7f7f7',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0,0,0,0.1)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '12px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default SetExamLink;
