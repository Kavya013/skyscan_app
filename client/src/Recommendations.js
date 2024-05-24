// Recommendations.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudRain, faSnowflake, faSun, faWind, faTemperatureHigh, faThermometerHalf, faSmog } from '@fortawesome/free-solid-svg-icons';
import './Recommendations.css';
const Recommendations = ({ temperature, description, windSpeed, humidity }) => {
  const getRecommendations = () => {
    let recommendations = { dress: '', food: '', activities: '' };

    if (temperature < 0) {
      recommendations.dress = 'Wear heavy winter clothing, including a coat, gloves, and a hat.';
      recommendations.food = 'Hot drinks like tea or coffee and hearty meals like stews.';
      recommendations.activities = 'Indoor activities such as reading, watching movies, or exercising.';
    } else if (temperature >= 0 && temperature < 10) {
      recommendations.dress = 'Wear warm clothing such as a jacket, sweater, and long pants.';
      recommendations.food = 'Warm drinks and comfort foods like soups and casseroles.';
      recommendations.activities = 'Outdoor activities like walking or light hiking with proper gear.';
    } else if (temperature >= 10 && temperature < 20) {
      recommendations.dress = 'Wear a light jacket or sweater with comfortable pants.';
      recommendations.food = 'Warm meals and drinks, but lighter options like sandwiches and salads.';
      recommendations.activities = 'Outdoor activities like jogging, biking, or visiting parks.';
    } else if (temperature >= 20 && temperature < 30) {
      recommendations.dress = 'Wear light and breathable clothing such as t-shirts and shorts.';
      recommendations.food = 'Cold drinks, fresh fruits, and light meals like salads.';
      recommendations.activities = 'Outdoor activities like swimming, picnicking, or playing sports.';
    } else {
      recommendations.dress = 'Wear cool and breathable clothing like tank tops and shorts.';
      recommendations.food = 'Stay hydrated with plenty of water, and enjoy cold treats like ice cream.';
      recommendations.activities = 'Water activities like swimming or going to the beach.';
    }

    if (description.includes('rain')) {
      recommendations.dress += ' Don’t forget an umbrella or a raincoat.';
      recommendations.food += ' Enjoy comfort foods and warm drinks.';
      recommendations.activities = 'Indoor activities to stay dry, such as visiting museums or cafes.';
    }

    if (description.includes('snow')) {
      recommendations.dress += ' Wear waterproof and insulated footwear.';
      recommendations.food += ' Warm, high-calorie foods to keep energy levels up.';
      recommendations.activities = 'Outdoor activities like building a snowman or skiing if conditions allow.';
    }

    if (description.includes('clear')) {
        recommendations.dress += ' Sunglasses and a hat to protect from the sun.';
        recommendations.food += ' Fresh, light foods and plenty of water.';
        recommendations.activities = 'Outdoor activities like hiking, walking, or visiting parks.';
      }
    
      if (description.includes('cloud')) {
        recommendations.dress += ' Comfortable clothing with a light jacket.';
        recommendations.food += ' Warm meals and hot drinks.';
        recommendations.activities = 'Outdoor activities or exploring local attractions.';
      }
    
      if (description.includes('thunderstorm')) {
        recommendations.dress += ' Stay indoors and avoid wearing metallic accessories.';
        recommendations.food += ' Comfort foods and warm beverages.';
        recommendations.activities = 'Indoor activities like watching movies or reading books.';
      }
    
      if (description.includes('fog')) {
        recommendations.dress += ' Wear visible clothing and a light jacket.';
        recommendations.food += ' Warm drinks and light meals.';
        recommendations.activities = 'Indoor activities or short, safe walks in familiar areas.';
      }

  

    return recommendations;
  };
  

  const {dress,food,activities}=getRecommendations();
  const recommendations = getRecommendations(description);


  return (
    <div className="recommendations">
      <h3>Recommendations</h3>
      <div className="recommendation-item">
        <FontAwesomeIcon icon={faTemperatureHigh} className="icon" />
        <span>{recommendations.dress}</span>
      </div>
      <div className="recommendation-item">
        <FontAwesomeIcon icon={faThermometerHalf} className="icon" />
        <span>{recommendations.food}</span>
      </div>
      <div className="recommendation-item">
        <FontAwesomeIcon icon={faWind} className="icon" />
        <span>{recommendations.activities}</span>
      </div>
    </div>
    
   
  );
};

export default Recommendations;
