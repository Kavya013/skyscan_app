import React, { useState } from 'react';
import './styles.css';
const Signup = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignUp = () => {
    // Add your sign up logic here
    console.log("Name:", name);
    console.log("Email:", email);
    console.log("Password:", password);

  // After handling the sign-up logic, you might want to clear the form fields.
     setName('');
     setEmail('');
     setPassword('');
  };

  return (
    <div class="form sign-up">
      <h2>Create your Account</h2>
      <label>
        <span>Name</span>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
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
      <button type="button" class="submit" onClick={handleSignUp}>
        Sign Up
      </button>
    </div>
  );
};

export default Signup;

