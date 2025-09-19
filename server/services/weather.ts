export interface WeatherResponse {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: Array<{
    date: string;
    high: number;
    low: number;
    condition: string;
    icon: string;
  }>;
  farmingAdvice: string[];
}

export async function fetchWeatherData(location: string): Promise<WeatherResponse> {
  // Using a weather API like OpenWeatherMap
  const apiKey = process.env.WEATHER_API_KEY || process.env.OPENWEATHER_API_KEY || "default_key";
  
  try {
    // Current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`
    );
    
    if (!currentResponse.ok) {
      throw new Error(`Weather API error: ${currentResponse.status}`);
    }
    
    const currentData = await currentResponse.json();
    
    // 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?q=${location}&appid=${apiKey}&units=metric`
    );
    
    if (!forecastResponse.ok) {
      throw new Error(`Forecast API error: ${forecastResponse.status}`);
    }
    
    const forecastData = await forecastResponse.json();
    
    // Process forecast data (take one reading per day)
    const dailyForecast = [];
    const processedDates = new Set();
    
    for (const item of forecastData.list) {
      const date = new Date(item.dt * 1000).toISOString().split('T')[0];
      if (!processedDates.has(date) && dailyForecast.length < 5) {
        processedDates.add(date);
        dailyForecast.push({
          date,
          high: Math.round(item.main.temp_max),
          low: Math.round(item.main.temp_min),
          condition: item.weather[0].main,
          icon: item.weather[0].icon
        });
      }
    }
    
    // Generate farming advice based on weather
    const farmingAdvice = generateFarmingAdvice(currentData, dailyForecast);
    
    return {
      location: currentData.name,
      current: {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].main,
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed * 3.6) // Convert m/s to km/h
      },
      forecast: dailyForecast,
      farmingAdvice
    };
    
  } catch (error) {
    console.error("Weather API error:", error);
    // Return default weather data if API fails
    return {
      location: location,
      current: {
        temperature: 28,
        condition: "Partly Cloudy",
        humidity: 78,
        windSpeed: 12
      },
      forecast: [
        { date: new Date().toISOString().split('T')[0], high: 32, low: 24, condition: "Sunny", icon: "01d" },
        { date: new Date(Date.now() + 86400000).toISOString().split('T')[0], high: 28, low: 22, condition: "Rain", icon: "10d" },
        { date: new Date(Date.now() + 172800000).toISOString().split('T')[0], high: 30, low: 23, condition: "Cloudy", icon: "03d" },
        { date: new Date(Date.now() + 259200000).toISOString().split('T')[0], high: 31, low: 25, condition: "Partly Cloudy", icon: "02d" },
        { date: new Date(Date.now() + 345600000).toISOString().split('T')[0], high: 33, low: 26, condition: "Sunny", icon: "01d" }
      ],
      farmingAdvice: [
        "Good day for irrigation",
        "Avoid spraying pesticides",
        "Optimal for land preparation"
      ]
    };
  }
}

function generateFarmingAdvice(current: any, forecast: any[]): string[] {
  const advice: string[] = [];
  
  // Temperature-based advice
  if (current.main.temp > 35) {
    advice.push("Very hot day - increase irrigation frequency");
    advice.push("Provide shade for sensitive crops");
  } else if (current.main.temp < 20) {
    advice.push("Cool weather - reduce watering");
    advice.push("Good time for land preparation");
  } else {
    advice.push("Optimal temperature for most field activities");
  }
  
  // Humidity-based advice
  if (current.main.humidity > 80) {
    advice.push("High humidity - monitor for fungal diseases");
    advice.push("Ensure good air circulation in crops");
  } else if (current.main.humidity < 50) {
    advice.push("Low humidity - increase irrigation");
  }
  
  // Wind-based advice
  if (current.wind.speed > 5) {
    advice.push("Windy conditions - avoid spraying operations");
  } else {
    advice.push("Calm weather - good for spraying pesticides/fertilizers");
  }
  
  // Rain forecast advice
  const rainInForecast = forecast.some(day => 
    day.condition.toLowerCase().includes('rain') || 
    day.condition.toLowerCase().includes('storm')
  );
  
  if (rainInForecast) {
    advice.push("Rain expected - postpone irrigation");
    advice.push("Ensure proper drainage in fields");
  }
  
  return advice;
}

export async function getWeatherAlerts(location: string): Promise<string[]> {
  // This would typically come from weather service alerts
  // For now, return some sample alerts based on conditions
  try {
    const weather = await fetchWeatherData(location);
    const alerts: string[] = [];
    
    // Check for extreme conditions
    if (weather.current.temperature > 38) {
      alerts.push("Extreme heat warning - protect crops and livestock");
    }
    
    if (weather.current.humidity > 85 && weather.current.temperature > 30) {
      alerts.push("High humidity and temperature - disease risk increased");
    }
    
    // Check forecast for heavy rain
    const heavyRainExpected = weather.forecast.some(day => 
      day.condition.toLowerCase().includes('rain')
    );
    
    if (heavyRainExpected) {
      alerts.push("Heavy rainfall expected - consider postponing field work");
    }
    
    return alerts;
  } catch (error) {
    console.error("Weather alerts error:", error);
    return [];
  }
}
