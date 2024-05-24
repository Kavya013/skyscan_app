import React, { useState } from 'react';
import './styles.css';
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignIn = () => {
    // Add your sign in logic here
    console.log("Email:", email);
    console.log("Password:", password);

    // After handling the sign-in logic, you might want to clear the form fields.
    setEmail('');
    setPassword('');
  };

  return (
    <div class="form sign-in">
      <h2>Welcome</h2>
      <label>
        <span>Email</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </label>
      <label>
        <span>Password</span>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </label>
      <p class="forgot-pass">Forgot password?</p>
      <button type="button" class="submit" onClick={handleSignIn}>
        Sign In
      </button>
    </div>
  );
};

export default Login;
