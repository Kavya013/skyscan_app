require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql');
const axios = require('axios');
const path = require('path');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const twilio = require('twilio');
const app = express();
const cors=require('cors');
const port = 3008;

const allowedOrigins = ['https://skyscan-application.vercel.app'];
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Twilio configuration
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
const twilioPhoneNumber =process.env.TWILIO_PHONE_NUMBER ;

// Nodemailer configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Database connection setup
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password:process.env.DB_PASSWORD ,
  database: process.env.DB_DATABASE
});

connection.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  } else {
    console.log('Connected to MySQL database');
  }
});

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve React static files
app.use(express.static(path.join(__dirname, '..', 'client', 'build')));

// Fetch sunrise and sunset times from Open-Meteo API
const getSunriseSunsetTimes = async (latitude, longitude) => {
  try {
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=sunrise,sunset&timezone=auto`;
    const response = await axios.get(apiUrl);

    if (!response.data || !response.data.daily) {
      throw new Error('Incomplete sunrise/sunset data received from API');
    }

    const { sunrise, sunset } = response.data.daily;
    return { sunrise: sunrise[0], sunset: sunset[0] };
  } catch (error) {
    console.error('Error fetching sunrise/sunset data:', error);
    return null;
  }
};

// Send email notification
const sendEmailNotification = (email, subject, text) => {
  const mailOptions = {
    from:process.env.GMAIL_USER ,
    to: email,
    subject: subject,
    text: text
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending email:', error);
    } else {
      console.log('Email sent:', info.response);
    }
  });
};

// Send SMS notification
const sendSMSNotification = (phoneNumber, message) => {
  twilioClient.messages.create({
    body: message,
    from: twilioPhoneNumber,
    to: phoneNumber
  })
  .then(message => console.log('SMS sent:', message.sid))
  .catch(error => console.error('Error sending SMS:', error));
};

// Schedule notifications for sunrise and sunset
const scheduleNotifications = async (userId, email, phoneNumber, latitude, longitude) => {
  const times = await getSunriseSunsetTimes(latitude, longitude);
  if (!times) return;

  const { sunrise, sunset } = times;

  const scheduleTime = (time, event) => {
    const date = new Date(time);
    date.setMinutes(date.getMinutes() - 5); // 5 minutes before the event

    const cronTime = `${date.getUTCMinutes()} ${date.getUTCHours()} * * *`;

    cron.schedule(cronTime, () => {
      const message = `This is a reminder that ${event} will occur in 5 minutes!!!Get ready to capture the scenic picture`;
      sendEmailNotification(email, `${event} Notification`, message);
      sendSMSNotification(phoneNumber, message);
    }, { timezone: 'Etc/UTC' });
  };

  scheduleTime(sunrise, 'Sunrise');
  scheduleTime(sunset, 'Sunset');
};

// Weather endpoint to get latitude and longitude
// Weather endpoint to get latitude, longitude, and current weather conditions
app.get('/api/weather/:city', async (req, res) => {
  try {
    const city = req.params.city;
    const encodedCity = encodeURIComponent(city);
    const apiKey = process.env.WEATHER_API_KEY;
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${encodedCity}&appid=${apiKey}&units=metric`;

    const response = await axios.get(apiUrl);
    if (!response.data || !response.data.coord || !response.data.main || !response.data.weather) {
      throw new Error('Incomplete weather data received from API');
    }
    const { coord, main, weather } = response.data; // Extract latitude, longitude, temperature, and description from the response
    const { lat, lon } = coord;

    const weatherData = {
      latitude: lat,
      longitude: lon,
      temperature: main.temp,
      description: weather[0].description
    };

    res.json(weatherData);
  } catch (error) {
    console.error('Error fetching weather data:', error);
    res.status(500).send('Internal Server Error');
  }
});


// Historical weather endpoint
app.get('/api/historical-weather', async (req, res) => {
  const { city, start, end } = req.query;
  console.log('Received parameters:', { city, start, end });

  if (!city || !start || !end) {
    return res.status(400).send('Bad Request: city, start date, and end date are required');
  }

  try {
    // Fetch latitude and longitude coordinates from OpenWeatherMap API
   

    const cityResponse = await axios.get(`http://localhost:${port}/api/weather/${city}`);
    const { latitude, longitude } = cityResponse.data;

    const adjustedStartDate = new Date(start);
    const adjustedEndDate = new Date(end);


    const formattedStartDate = adjustedStartDate.toISOString().split('T')[0];
    const formattedEndDate = adjustedEndDate.toISOString().split('T')[0];

    // Make request to Open-Meteo API for historical weather data
    const apiUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m,weathercode&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,sunrise,sunset&start_date=${formattedStartDate}&end_date=${formattedEndDate}&timezone=auto`;
    console.log('Historical API URL:', apiUrl);

    const response = await axios.get(apiUrl);
    console.log('Historical weather response:', response.data);

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching historical weather data:', error.response ? error.response.data : error.message);
    res.status(500).send('Internal Server Error');
  }
});

// User registration endpoint
app.post('/api/signup', (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).send('Bad Request: username, email, and password are required');
  }

  const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
  connection.query(sql, [username, email, password], (err, result) => {
    if (err) {
      console.error('Error registering user:', err);
      res.status(500).send('Internal Server Error');
    } else {
      res.send('User registered successfully');
    }
  });
});

// User login endpoint
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).send('Bad Request: email and password are required');
  }
  console.log('Attempting login with email:', email);

  const sql = 'SELECT * FROM users WHERE email = ? AND password = ?';
  connection.query(sql, [email, password], (err, result) => {
    if (err) {
      console.error('Error logging in:', err);
      res.status(500).send('Internal Server Error');
    } else {
      if (result.length === 0) {
        console.log('Login failed: Invalid email or password');
        res.status(401).send('Unauthorized: Invalid email or password');
      } else {
        // User logged in successfully
        // Here, you can proceed to show the pop-up form for default location entry
        // You may want to send some data back to the client indicating successful login
        console.log('Login successful for email:', email);
        res.status(200).json({ userId: result[0].id, preferencesSet: result[0].preferences_set });
      }
    }
  });
});

// User preferences endpoint to set default location
app.post('/api/preferences', (req, res) => {
  const { userId, defaultLocation, phoneNumber } = req.body;

  if (!userId || !defaultLocation || !phoneNumber) {
    return res.status(400).send('Bad Request: userId, defaultLocation, and phone number are required');
  }

  const sql = 'UPDATE users SET default_location = ?, phone_number = ? , preferences_set = TRUE WHERE id = ?';
  connection.query(sql, [defaultLocation, phoneNumber, userId], (err, result) => {
    if (err) {
      console.error('Error setting default location and phone number:', err);
      res.status(500).send('Internal Server Error');
    } else {
      axios.get(`http://localhost:${port}/api/weather/${defaultLocation}`)
        .then(response => {
          const { latitude, longitude } = response.data;
          // Schedule notifications for the user
          scheduleNotifications(userId, response.data.email, phoneNumber, latitude, longitude);
          res.send('Default location and phone number set successfully');
        })
        .catch(error => {
          console.error('Error fetching coordinates for default location:', error);
          res.status(500).send('Internal Server Error');
        });
      
    }
  });
});

// Serve React frontend
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'client', 'build', 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

