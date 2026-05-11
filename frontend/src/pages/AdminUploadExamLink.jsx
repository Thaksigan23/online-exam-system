// pages/AdminUploadExamLink.jsx
import React, { useState } from 'react';
import { apiUrl } from '../config/api';

function AdminUploadExamLink() {
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    const token = localStorage.getItem('token');
    const now = new Date();
    const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    const res = await fetch(apiUrl('/examlink'), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        url: link,
        startTime: now.toISOString(),
        endTime: end.toISOString(),
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.message || 'Request failed.');
      return;
    }
    setMessage(data.message || 'Link saved.');
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">Paste Google Exam Link</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://docs.google.com/forms/..."
          className="border p-2 w-full mb-2"
          required
        />
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">
          Save Link
        </button>
      </form>
      {message && <p className="mt-2 text-green-600">{message}</p>}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}

export default AdminUploadExamLink;
