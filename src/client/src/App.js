import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './components/LoginForm';
import Dashboard from './components/Dashboard';

function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const jwtToken = localStorage.getItem('jwt');
    console.log(jwtToken)

    const checkAuth = async () => {
      try {
        const response = await axios.post('http://foodwastereduction.com/validate', null, {
          headers: {
            Authorization: `Bearer ${jwtToken}`
          }
        });
        console.log(response.request);
        if(response.data === "Fail"){
          console.log(response.data)
          setAuthenticated(false);
        }
        else if(response.data === "Pass"){
          console.log(response.data)
          setAuthenticated(true)
        }
      } catch (error) {
        console.log(error.response.data);
      }
    };

    checkAuth();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={authenticated ? <Dashboard /> : <LoginForm />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
