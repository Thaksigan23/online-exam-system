// pages/AdminUploadExamLink.jsx
import React, { useState } from 'react';

function AdminUploadExamLink() {
  const [link, setLink] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/examlink', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ link }),
    });

    const data = await res.json();
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
    </div>
  );
}

export default AdminUploadExamLink;
