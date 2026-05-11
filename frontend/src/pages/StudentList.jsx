import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { apiUrl } from '../config/api';
import { useNavigate } from 'react-router-dom';

function StudentList() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  useEffect(() => {
    if (role !== 'teacher') {
      alert('Access denied');
      navigate('/unauthorized');
      return;
    }

    const fetchStudents = async () => {
      try {
        const response = await axios.get(apiUrl('/auth/students'), {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStudents(response.data);
        setFilteredStudents(response.data);
      } catch (err) {
        console.error(err);
        setError('Failed to fetch student data');
      }
    };

    fetchStudents();
  }, [token, role, navigate]);

  // Filter by search
  useEffect(() => {
    const filtered = students.filter((student) =>
      student.name.toLowerCase().includes(search.toLowerCase()) ||
      student.email.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [search, students]);

  return (
    <div style={{ padding: '20px' }}>
      <h2>📋 Student List</h2>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{ padding: '8px', width: '100%', marginBottom: '20px' }}
      />

      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {filteredStudents.map((student) => (
          <li key={student._id}>
            <strong>{student.name}</strong> ({student.email})
          </li>
        ))}
      </ul>
    </div>
  );
}

export default StudentList;
