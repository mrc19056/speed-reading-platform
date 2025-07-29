import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Login from './pages/Login';
import StudentDashboard from './pages/Student/Dashboard';
import TeacherDashboard from './pages/Teacher/Dashboard';
import Profile from './pages/Profile';
import Courses from './pages/Student/Courses';
import Activities from './pages/Student/Activities';
import Achievements from './pages/Student/Achievements';
import SpeedReading from './pages/Student/SpeedReading';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoadingSpinner from './components/LoadingSpinner';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      <Route path="/login" element={
        user ? <Navigate to={user.role === 'student' ? '/dashboard' : '/teacher'} /> : <Login />
      } />
      
      <Route path="/" element={
        user ? <Navigate to={user.role === 'student' ? '/dashboard' : '/teacher'} /> : <Navigate to="/login" />
      } />

      {/* Student Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><StudentDashboard /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/kurslarim" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><Courses /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/etkinlikler" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><Activities /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/basarilarim" element={
        <ProtectedRoute allowedRoles={['student']}>
          <Layout><Achievements /></Layout>
        </ProtectedRoute>
      } />
      
      <Route path="/hizli-okuma/:activityId" element={
        <ProtectedRoute allowedRoles={['student']}>
          <SpeedReading />
        </ProtectedRoute>
      } />

      {/* Teacher Routes */}
      <Route path="/teacher" element={
        <ProtectedRoute allowedRoles={['teacher', 'admin']}>
          <Layout><TeacherDashboard /></Layout>
        </ProtectedRoute>
      } />

      {/* Common Routes */}
      <Route path="/profil" element={
        <ProtectedRoute allowedRoles={['student', 'teacher', 'admin']}>
          <Layout><Profile /></Layout>
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;