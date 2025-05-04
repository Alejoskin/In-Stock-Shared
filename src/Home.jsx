import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import auth from '../firebase-config';

function Home() {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user); // true si hay usuario logueado
    });

    return () => unsubscribe(); // Limpiar listener al desmontar
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/Login');
    } catch (error) {
      console.log('Logout failed: ', error.message);
    }
  };

  const handleLogin = () => {
    navigate('/Login');
  };

  const handleRegister = () => {
    navigate('/Register');
  };

  return (
    <>
      <div className="header">
        <button className="settings-button">Settings</button>
        <a href="design.html" className="logo">In Stock</a>

        <div className="login">
          {isLoggedIn ? (
            <button onClick={handleLogout}>Logout</button>
          ) : (
            <>
              <button className="login-button" onClick={handleLogin}>Login</button>
              <button className="register-button" onClick={handleRegister}>Register</button>
            </>
          )}
        </div>
      </div>

      <div className="left-menu">
        <div className="dropdown">
          <button className="dropdown-button">Dropdown</button>
          <div className="dropdown-content">
            <a href="#">Link 1</a>
            <a href="#">Link 2</a>
            <a href="#">Link 3</a>
          </div>
        </div>
        <div className="dropdown">
          <button className="dropdown-button">Dropdown</button>
          <div className="dropdown-content">
            <a href="#">Link 1</a>
            <a href="#">Link 2</a>
            <a href="#">Link 3</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
