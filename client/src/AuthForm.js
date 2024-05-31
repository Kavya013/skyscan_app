import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styles.css';

const AuthForm = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [showPopup, setShowPopup] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [defaultLocation, setDefaultLocation] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const toggleForm = () => {
    setIsSignIn(!isSignIn);
    setErrorMessage('');
  };

  const handleSignIn = async () => {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;

    try {
      const response = await axios.post('https://skyscan-app-9.onrender.com/api/login', { email, password });
      if (response.status === 200) {
        setUserId(response.data.userId);
        if (!response.data.preferencesSet) {
          setShowPopup(true);
        } else {
          navigate('/weather');
        }
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('Error logging in: ' + error.message);
      }
    }
  };

  const handleSignUp = async () => {
    const username = document.getElementById('signup-username').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    try {
      const response = await axios.post('https://skyscan-app-9.onrender.com/api/signup', { username, email, password });
      if (response.status === 200) {
        toggleForm();
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('Error signing up: ' + error.message);
      }
    }
  };

  const handleSetLocation = async () => {
    try {
      const response = await axios.post('https://skyscan-app-9.onrender.com/api/preferences', { userId, defaultLocation, phoneNumber });
      if (response.status === 200) {
        setShowPopup(false);
        navigate('/weather');
      }
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data);
      } else {
        setErrorMessage('Error setting location: ' + error.message);
      }
    }
  };

  return (
    <div className={`cont ${isSignIn ? '' : 's--signup'}`}>
      <div className="form sign-in">
        <h2>Welcome</h2>
        <label>
          <span>Email</span>
          <input id="signin-email" type="email" />
        </label>
        <label>
          <span>Password</span>
          <input id="signin-password" type="password" />
        </label>
        {errorMessage && <p className="error">{errorMessage}</p>}
        <button type="button" className="submit" onClick={handleSignIn}>Sign In</button>
      </div>
      <div className="sub-cont">
        <div className="img">
          <div className="img__text m--up">
            <h3>Don't have an account? Please Sign up!</h3>
          </div>
          <div className="img__text m--in">
            <h3>If you already have an account, just sign in.</h3>
          </div>
          <div className="img__btn" onClick={toggleForm}>
            <span className="m--up">Sign Up</span>
            <span className="m--in">Sign In</span>
          </div>
        </div>
        <div className="form sign-up">
          <h2>Create your Account</h2>
          <label>
            <span>Name</span>
            <input id="signup-username" type="text" />
          </label>
          <label>
            <span>Email</span>
            <input id="signup-email" type="email" />
          </label>
          <label>
            <span>Password</span>
            <input id="signup-password" type="password" />
          </label>
          {errorMessage && <p className="error">{errorMessage}</p>}
          <button type="button" className="submit" onClick={handleSignUp}>Sign Up</button>
        </div>
      </div>
      {showPopup && (
        <div className="popup">
          <div className="popup-inner">
            <h2>Set Default Location and Phone Number</h2>
            <label>
              <span>Default Location</span>
              <input
                type="text"
                value={defaultLocation}
                onChange={(e) => setDefaultLocation(e.target.value)}
              />
            </label>
            <label>
              <span>Phone Number</span>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </label>
            {errorMessage && <p className="error">{errorMessage}</p>}
            <button type="button" className="submit" onClick={handleSetLocation}>
              Save and Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthForm;



