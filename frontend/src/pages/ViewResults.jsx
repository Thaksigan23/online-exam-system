import React, { useCallback, useEffect, useState } from 'react';
import axios from 'axios';

function ViewResults() {
  const [results, setResults] = useState([]);
  const [filters, setFilters] = useState({
    studentName: '',
    studentEmail: '',
    startDate: '',
    endDate: '',
    minScore: '',
    maxScore: ''
  });

  const token = localStorage.getItem('token');

  const fetchResults = useCallback(async () => {
    try {
      const query = new URLSearchParams(filters).toString();
      const res = await axios.get(`http://localhost:5000/api/results/all?${query}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setResults(res.data);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    }
  }, [filters, token]);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gradient-to-r from-purple-600 via-indigo-700 to-blue-700 rounded-xl shadow-xl text-white min-h-screen">
      <h2 className="text-4xl font-extrabold mb-6 text-center drop-shadow-lg animate-fadeInDown">
        Student Exam Results
      </h2>

      {/* Filters Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8 animate-fadeInUp">
        {Object.keys(filters).map((key) => (
          <input
            key={key}
            type={key.toLowerCase().includes('date') ? 'date' : 'text'}
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={filters[key]}
            onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
            className="p-3 rounded-lg border border-indigo-300 bg-indigo-900 placeholder-indigo-400 text-white focus:outline-none focus:ring-2 focus:ring-indigo-400 transition"
          />
        ))}
        <button
          onClick={fetchResults}
          className="col-span-1 md:col-span-3 lg:col-span-1 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 transition rounded-lg shadow-lg text-lg font-semibold flex items-center justify-center gap-2"
          aria-label="Apply Filters"
        >
          🔍 Apply Filters
        </button>
      </div>

      {/* Results Table */}
      <div className="overflow-x-auto rounded-lg shadow-lg animate-fadeInUp">
        <table className="min-w-full bg-indigo-900/80 rounded-lg overflow-hidden">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-800 to-purple-900 text-white">
              {['Name', 'Email', 'Score', 'Date', 'Details'].map((header) => (
                <th
                  key={header}
                  className="py-3 px-5 text-left font-semibold tracking-wide border-b border-indigo-700"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center py-6 text-indigo-200 italic">
                  No results found. Try adjusting filters.
                </td>
              </tr>
            )}
            {results.map((res, i) => (
              <tr
                key={i}
                className="border-b border-indigo-700 hover:bg-indigo-800 transition cursor-default"
              >
                <td className="p-4 font-medium">{res.studentId?.name || 'N/A'}</td>
                <td className="p-4 lowercase text-indigo-200">{res.studentId?.email || 'N/A'}</td>
                <td className="p-4 font-semibold text-green-400">{res.score}</td>
                <td className="p-4 font-mono text-indigo-300">
                  {new Date(res.submittedAt || res.createdAt).toLocaleString()}
                </td>
                <td className="p-4">
                  <details className="bg-indigo-800 rounded-md p-3 shadow-inner hover:shadow-lg transition">
                    <summary className="cursor-pointer font-semibold text-indigo-400 hover:text-indigo-200 select-none">
                      Show Answers
                    </summary>
                    <ul className="mt-2 list-disc list-inside space-y-2 max-h-60 overflow-auto">
                      {res.answers?.map((a, idx) => (
                        <li
                          key={idx}
                          className={`p-2 rounded-md ${
                            a.isCorrect
                              ? 'bg-green-900 text-green-300'
                              : 'bg-red-900 text-red-300'
                          } shadow-inner`}
                        >
                          <p>
                            <strong>Q:</strong> {a.question}
                          </p>
                          <p>
                            <strong>Your Answer:</strong> {a.selectedAnswer || 'No Answer'}
                          </p>
                          <p>
                            <strong>Correct:</strong> {a.isCorrect ? '✅' : '❌'}
                          </p>
                        </li>
                      ))}
                    </ul>
                  </details>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer / Optional Summary */}
      <footer className="mt-12 text-center text-indigo-300 italic animate-fadeInUp">
        Powered by Your Exam System 🚀
      </footer>
    </div>
  );
}

export default ViewResults;
