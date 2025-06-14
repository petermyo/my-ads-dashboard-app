import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/Common/Card';
import Input from '../components/Common/Input';
import Button from '../components/Common/Button';
import LoadingSpinner from '../components/Common/LoadingSpinner';
import MessageBox from '../components/Common/MessageBox'; // Re-use message box
import { useAuth } from '../components/Auth/AuthProvider'; // Use the new AuthProvider

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [role, setRole] = useState('viewer'); // Default role for registration
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');

  const { login, register } = useAuth(); // Get login and register functions from AuthProvider
  const navigate = useNavigate();

  const handleMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 5000); // Clear message after 5 seconds
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(''); // Clear previous messages

    try {
      if (isRegistering) {
        await register(email, password, role);
        handleMessage('Registration successful! Please log in.', 'success');
        setIsRegistering(false); // Switch to login form
      } else {
        await login(email, password);
        handleMessage('Login successful!', 'success');
        navigate('/dashboard'); // Redirect to dashboard on successful login
      }
    } catch (error) {
      handleMessage(error.message || 'An error occurred.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
          {isRegistering ? 'Register' : 'Login'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {isRegistering && (
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-200 ease-in-out"
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg shadow-md transition duration-300 ease-in-out disabled:opacity-50"
          >
            {loading ? <LoadingSpinner size="sm" /> : (isRegistering ? 'Register' : 'Login')}
          </Button>
        </form>

        <p className="mt-6 text-center text-gray-600">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(false)}
                className="text-blue-900 hover:underline font-medium"
              >
                Login
              </button>
            </>
          ) : (
            <>
              {/* Don't have an account?{' '}
              <button
                type="button"
                onClick={() => setIsRegistering(true)}
                className="text-blue-900 hover:underline font-medium"
              >
                Register
              </button> */}
            </>
          )}
        </p>
      </Card>
      {message && <MessageBox message={message} type={messageType} />}
    </div>
  );
};

export default LoginPage;
