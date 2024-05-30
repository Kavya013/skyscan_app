import React,{useState} from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Weather.css';
import Recommendations from './Recommendations';

function Weather() {
  const [city, setCity] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [weatherData, setWeatherData] = useState(null);
  const navigate = useNavigate();
  
  const searchWeather = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/api/weather/${city}`);
      setWeatherData(response.data);
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
    setLoading(false);
  };

  const handleVoiceSearch = () => {
    // Check if the browser supports Web Speech API
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Your browser does not support the Web Speech API');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.onresult = async (event) => {
      const voiceText = event.results[0][0].transcript.trim();
      const cityName = voiceText.replace(/\.$/, '');
      setCity(cityName);
      setLoading(true);
      setError(null);
      try {
        const encodedCity = encodeURIComponent(cityName);
        const response = await axios.get(`/api/weather/${encodedCity}`);
        setWeatherData(response.data);
      } catch (error) {
        console.error('Error fetching weather data:', error);
        setError('Failed to fetch weather data. Please try again.');
      }
      setLoading(false);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
    };

    recognition.start();
  };


  const handleViewHistoricalWeather = () => {
    navigate('/historical-weather', { state: { city, start: 'START_TIMESTAMP', end: 'END_TIMESTAMP' } });
  };

  const getBackgroundImage = (description) => {
    switch (description.toLowerCase()) {
      case 'clear sky':
        return 'url("/sunny.jpg")';
      case 'few clouds':
      case 'scattered clouds':
      case 'broken clouds':
        return 'url("/broken.jpg")';
      case 'shower rain':
      case 'light rain':
      case 'moderate rain':
      case 'rain':
        return 'url("/rain.jpg")';
      case 'snow':
        return 'url("/snow.jpg")';
      case 'thunderstorm':
        return 'url("/thunder.gif")';
      default:
        return 'url("/newbg.jpg")';
    }
  };

  return (
    <div className="container" style={{ backgroundImage: weatherData ? getBackgroundImage(weatherData.description) : 'url("/newbg.jpg")' }}>
    <h1>SKY SCAN</h1>
    <div className="search-container">
      <input
        type="text"
        value={city}
        onChange={(e) => setCity(e.target.value)}
        placeholder="Enter city"
        class="input"
      />
      <button onClick={searchWeather}>Search</button>
      <button onClick={handleVoiceSearch}>Voice Search</button>
      <button onClick={handleViewHistoricalWeather}>Historical Weather</button>
    </div>
    {loading && <div className="loading">Loading...</div>}
    {weatherData && (
        <div className="weather-info">
            <div className="current-conditions">
               <h2>Current Conditions</h2>
               <p id="temperature">{weatherData.temperature}°C</p>
               <p id="description">{weatherData.description}</p>
          </div>
          <Recommendations 
            temperature={weatherData.temperature} 
            description={weatherData.description} 
            
          />
        {/* </CurrentConditions> */}
      {/* </WeatherInfo> */}
    
  </div>
  )}
  </div>
  );
};

export default Weather;