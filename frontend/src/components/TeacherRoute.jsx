import React from 'react';
import { Navigate } from 'react-router-dom';

const TeacherRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (!user || user.role !== 'teacher') {
    return <Navigate to="/unauthorized" />;
  }

  return children;
};

export default TeacherRoute;
