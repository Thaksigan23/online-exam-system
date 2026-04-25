import React from 'react';
import { useNavigate } from 'react-router-dom';

function Unauthorized() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-xl text-center w-full max-w-md border border-red-300">
        <h1 className="text-3xl font-bold text-red-600 mb-2">🚫 Unauthorized</h1>
        <p className="text-gray-700 mb-6">
          You do not have access to this page.
        </p>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition duration-200"
        >
          🔙 Go to Dashboard
        </button>
      </div>
    </div>
  );
}

export default Unauthorized;
