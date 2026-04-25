import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';

const TeacherRoute = () => {
  const token = localStorage.getItem('token');
  const role = localStorage.getItem('role');

  if (!token || role !== 'teacher') {
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />; // ✅ Allows nested routes to render
};

export default TeacherRoute;
