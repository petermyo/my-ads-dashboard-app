import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import components and pages
import { AuthProvider } from './services/components/Auth/AuthProvider';
import PrivateRoute from './services/components/Auth/PrivateRoute';
import Navbar from './services/components/Navigation/Navbar';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import SummaryPage from './pages/SummaryPage';
import UsersPage from './pages/UsersPage';
import ReportsPage from './pages/ReportsPage';
import MessageBox from './services/components/Common/MessageBox';

function App() {
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const handleMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    // Auto-clear message after a few seconds
    setTimeout(() => {
      setMessage('');
    }, 6000);
  };

  return (
    <Router>
      <AuthProvider>
        <div className="flex flex-col min-h-screen">
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route element={<PrivateRoute />}>
              <Route path="/" element={
                <>
                  <Navbar onMessage={handleMessage} />
                  <DashboardPage onMessage={handleMessage} />
                </>
              } />
              <Route path="/dashboard" element={
                <>
                  <Navbar onMessage={handleMessage} />
                  <DashboardPage onMessage={handleMessage} />
                </>
              } />
              <Route path="/summary" element={
                <>
                  <Navbar onMessage={handleMessage} />
                  <SummaryPage onMessage={handleMessage} />
                </>
              } />
              <Route path="/users" element={
                <>
                  <Navbar onMessage={handleMessage} />
                  <UsersPage onMessage={handleMessage} />
                </>
              } />
              <Route path="/reports" element={
                <>
                  <Navbar onMessage={handleMessage} />
                  <ReportsPage onMessage={handleMessage} />
                </>
              } />
            </Route>
            {/* Redirect any unmatched routes to dashboard if authenticated, or login otherwise */}
            <Route path="*" element={<PrivateRoute />} />
          </Routes>
        </div>
        <MessageBox message={message} type={messageType} />
      </AuthProvider>
    </Router>
  );
}

export default App;
