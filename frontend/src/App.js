import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard';
import Exam from './components/Exams';
import Results from './components/Results';
import Questions from './components/Questions';
import Unauthorized from './pages/Unauthorized';
import ViewResults from './pages/ViewResults';
import StudentList from './pages/StudentList';
import StudentResults from './pages/StudentResults';
import TeacherDashboard from './pages/TeacherDashboard';

import PrivateRoute from './components/PrivateRoute'; // Reusable token guard
import TeacherRoute from './components/TeacherRoute'; // Role-based access

function App() {
  const isAuthenticated = !!localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes (token required) */}
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/exam" element={<Exam />} />
          <Route path="/results" element={<Results />} />
          <Route path="/teacher-results" element={<ViewResults />} />
          <Route path="/student/results" element={<StudentResults />} />

          {/* Teacher-only routes */}
          <Route element={<TeacherRoute />}>
            <Route path="/questions" element={<Questions />} />
            <Route path="/students" element={<StudentList />} />
            <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
          </Route>
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
