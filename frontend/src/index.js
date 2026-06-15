import React from 'react';
import ReactDOM from 'react-dom/client';
import Login from './Login';

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <Login onLoginSuccess={(user) => {
      console.log('Logged in:', user);
      // Replace with your routing logic, e.g.:
      // window.location.href = user.role === 'RECRUTEUR' ? '/recruiter/dashboard' : '/candidate/dashboard';
    }} />
  </React.StrictMode>
);
