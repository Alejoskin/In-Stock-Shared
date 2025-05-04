import { useState, useEffect } from 'react';
import './App.css';

import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';

import Login from './Login.jsx';
import Home from './Home';
import auth from '../firebase-config';

function PrivateRoute({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) =>
      setIsAuthenticated(!!user)
    );
    return () => unsubscribe();
  }, []);

  if (isAuthenticated === null) {
    return <div> Loading...</div>;
  }
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function App() {

  return (
  <Router>
    <Routes>
      <Route path="login" element={<Login />}>
        {' '}
      </Route>
      <Route path="/" element ={
          <PrivateRoute>
            <Home />
          </PrivateRoute>
        }
      ></Route>
    </Routes>
  </Router>
  )
}

export default App;
