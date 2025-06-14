import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../services/authService';
import { useAuth } from '../components/Auth/AuthProvider'; // Import useAuth to check current user state
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import Card from '../components/Common/Card';
import MessageBox from '../components/Common/MessageBox';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('error');
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    // If user is already logged in (e.g., via custom token or anonymous), redirect
    if (currentUser && currentUser.uid) {
      navigate('/dashboard', { replace: true });
    }
  }, [currentUser, navigate]);


  const handleLogin = async (e) => {
    e.preventDefault();
    setMessage(''); // Clear previous messages
    try {
      await login(email, password);
      setMessageType('success');
      setMessage('Login successful! Redirecting to dashboard...');
      // Give time for message to display before redirect
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (error) {
      setMessageType('error');
      setMessage(error.message || 'Login failed. Please check your credentials.');
      console.error("Login error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Card className="text-center max-w-sm w-full">
        {/* Placeholder for logo - In a real app, ensure this path is correct */}
        <img src="https://placehold.co/128x128/aabbcc/ffffff?text=LOGO" alt="Company Logo" className="mx-auto mb-6 w-32 h-auto rounded-lg" />
        <h1 className="text-2xl font-bold text-blue-900 mb-4">Login to Ads Dashboard</h1>
        <form onSubmit={handleLogin} className="mt-4">
          <Input
            type="email"
            id="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mb-4"
          />
          <Input
            type="password"
            id="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="mb-6"
          />
          <Button
            type="submit"
            className="w-full bg-blue-900 text-white hover:bg-blue-800 focus:ring-blue-600"
          >
            Login
          </Button>
        </form>
      </Card>
      <MessageBox message={message} type={messageType} />
    </div>
  );
};

export default LoginPage;
