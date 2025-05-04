import React, { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth';
import auth from '../firebase-config';
import { useNavigate } from 'react-router-dom';

import './login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setLoginError(false); // Limpia el error al montar
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
      console.log('User is logged in');
    } catch (error) {
      setLoginError(true);
      console.error('Login failed:', error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/');
      console.log('User registered');
    } catch (error) {
      setLoginError(true);
      console.log('Registration failed:', error.message);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-title">In Stock</h2>

      {loginError && <h3 className="error-message">Wrong username or password.</h3>}

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
      />

      <div className="login-actions">
        <button className="login-button" onClick={handleLogin}>Login</button>
        <button className="register-button" onClick={handleRegister}>Register</button>
      </div>
    </div>
  );
}

export default Login;
