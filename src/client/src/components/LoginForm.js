import React, { useState } from 'react';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import axios from 'axios';
import './LoginForm.css';

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      // Send a request to your gateway service for authentication
        console.log("[*] Logging in!!!");
        console.log(email + " : " + password);
        const base_64_Token = btoa(`${email}:${password}`);
        const response = await axios.post('http://foodwastereduction.com/login', {
            username: email,
            password: password
            }, {
            headers: {
                'Authorization': `Basic ${base_64_Token}`
            }
        });
  
        const token = response.data;
        console.log(token);
        // Store the JWT token in local storage
        localStorage.setItem('jwt', token);
        // const jwtToken = localStorage.getItem('jwt');
 
        // console.log(jwtToken)
        // Redirect the user to the dashboard page 
        window.location.href = '/dashboard';

    } catch (error) {
        console.log(error);
    }
  }

  const handleTest = async() => {
    const response = await axios.get('http://foodwastereduction.com/test');
    console.log(response.data.testing);
  }
  

  return (
    <div className="login-container">
        <button type="button" onClick={handleTest}>TEST</button>
      <form onSubmit={handleSubmit}>
        <h2>Login</h2>
        <div className="form-group">
          <label htmlFor="email"><FaEnvelope /> Email address:</label>
          <input
            type="email"
            className="form-control"
            id="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password"><FaLock /> Password:</label>
          <input
            type="password"
            className="form-control"
            id="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="form-group form-check">
          <label className="form-check-label">
            <input className="form-check-input" type="checkbox" /> Remember me
          </label>
        </div>
        <button type="submit" className="btn btn-primary">Submit</button>
      </form>
    </div>
  );
}

export default LoginForm;
