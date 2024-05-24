import './App.css';
import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import AuthForm from './AuthForm';
import Weather from './Weather';
import HistoricalWeather from './HistoricalWeather';

const App = () => {
  

  return (
    <Router>
    <Routes>
      <Route path="/" element={<AuthForm />} />
      <Route path="/weather" element={<Weather/>} />
      <Route path="/historical-weather" element={<HistoricalWeather />} />
      
     
     
    </Routes>
  </Router>
   
  );
};
export default App;

