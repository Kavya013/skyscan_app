import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation } from 'react-router-dom';
import './HistoricalWeather.css';

function formatDate(date) {
  const parts = date.split('-');
  return `${parts[0]}-${parts[1]}-${parts[2]}`;
}

function HistoricalWeather() {
  const [loading, setLoading] = useState(false);
  const [historicalWeatherData, setHistoricalWeatherData] = useState(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const location = useLocation();
  const { city } = location.state;

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
  };

  useEffect(() => {
    if (startDate && endDate) {
      const formattedStartDate = formatDate(startDate);
      const formattedEndDate = formatDate(endDate);
      console.log('Sending request with:', { city, start_date: formattedStartDate, end_date: formattedEndDate });
      fetchHistoricalWeather(city, formattedStartDate, formattedEndDate);
    }
  }, [city, startDate, endDate]);

  const fetchHistoricalWeather = async (city, start, end) => {
    setLoading(true);

    const timezoneOffset = new Date().getTimezoneOffset() / 60;
    const adjustedStartDate = new Date(start);
    const adjustedEndDate = new Date(end);
    
    adjustedStartDate.setHours(adjustedStartDate.getHours() - timezoneOffset);
    adjustedEndDate.setHours(adjustedEndDate.getHours() - timezoneOffset);
    
    const formattedStartDate = formatDate(adjustedStartDate.toISOString().split('T')[0]);
    const formattedEndDate = formatDate(adjustedEndDate.toISOString().split('T')[0]);

    // Log the dates being sent to the API
    console.log('Fetching weather for:', { city, start: formattedStartDate, end: formattedEndDate });

    try {
      const response = await axios.get(`https://skyscan-app-9.onrender.com/historical-weather`, {
        params: {
          city: city,
          start: start,
          end: end
        }
      });
      console.log('Response data:', response.data);

      setHistoricalWeatherData(response.data);
      
    } catch (error) {
      console.error('Error fetching historical weather data:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1>Historical Weather for {city}</h1>
      <div className="date-inputs">
        <div>
          <label htmlFor="startDate">Start Date:</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={handleStartDateChange}
          />
        </div>
        <div>
          <label htmlFor="endDate">End Date:</label>
          <input
            type="date"
            id="endDate"
            value={endDate}
            onChange={handleEndDateChange}
          />
        </div>
      </div>
      {loading && <div className="loading">Loading...</div>}
      {historicalWeatherData && historicalWeatherData.daily && (
        <div className="historical-weather-cards">
          {historicalWeatherData.daily.time.map((time, index) => (
            <div key={index} className="weather-card">
              <p><strong>Date:</strong> {new Date(time).toLocaleDateString()}</p>
              <p><strong>Max Temperature:</strong> {historicalWeatherData.daily.temperature_2m_max[index]}°C</p>
              <p><strong>Min Temperature:</strong> {historicalWeatherData.daily.temperature_2m_min[index]}°C</p>
              <p><strong>Precipitation:</strong> {historicalWeatherData.daily.precipitation_sum[index]} mm</p>
              <p><strong>Sunrise:</strong> {new Date(historicalWeatherData.daily.sunrise[index]).toLocaleTimeString()}</p>
              <p><strong>Sunset:</strong> {new Date(historicalWeatherData.daily.sunset[index]).toLocaleTimeString()}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default HistoricalWeather;


