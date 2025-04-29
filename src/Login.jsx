import React, { useState } from 'react';

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from 'firebase/auth'; //sin install firebase
import auth from '../firebase-config'; //sin crear
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [loginError, setLogError] = useState(true);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/');
      console.log('User is logged in');
    } catch (error) {
      setLogError(false);
      console.error('Login-Failed', error.message);
    }
  };

  const handleRegister = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate('/');
      console.log('User Registerd');
    } catch (error) {
      setLogError(false);
      console.log('Registration Failed: ', error.message);
    }
  };

  return (
    <div>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Enter your email"
      />{' '}
      <br />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Enter your password"
      />{' '}
      <br />
      <button onClick={handleLogin}> Login </button>
      <br />
      <button onClick={handleRegister}> Register </button>
      <br />
      {loginError ? <p> </p> : <h3> Wrong username or password.</h3>}
    </div>
  );
}

export default Login;
