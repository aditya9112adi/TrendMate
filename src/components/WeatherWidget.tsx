import { useEffect, useState } from "react";
import InfoCard from "./InfoCard";
import { Cloud, Sun, CloudRain, Wind, Thermometer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WeatherData {
  location: string;
  current: {
    temperature: number;
    condition: string;
    humidity: number;
    windSpeed: number;
  };
  forecast: Array<{
    day: string;
    high: number;
    low: number;
    icon: string;
  }>;
}

const WeatherIcon = ({ type, className = "w-4 h-4" }: { type: string; className?: string }) => {
  switch (type) {
    case "sun": return <Sun className={className} />;
    case "rain": return <CloudRain className={className} />;
    default: return <Cloud className={className} />;
  }
};

const WeatherWidget = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Try to get user's location with better options
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              console.log('Got user location:', latitude, longitude);
              const { data, error } = await supabase.functions.invoke('fetch-weather', {
                body: { lat: latitude.toString(), lon: longitude.toString() }
              });
              if (error) throw error;
              setWeather(data.weather);
              setLoading(false);
            },
            async (error) => {
              console.log('Geolocation error:', error.message);
              // Fallback to India coordinates (New Delhi)
              const { data, error: fetchError } = await supabase.functions.invoke('fetch-weather', {
                body: { lat: '28.6139', lon: '77.2090' }
              });
              if (fetchError) throw fetchError;
              setWeather(data.weather);
              setLoading(false);
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000 // 5 minutes
            }
          );
        } else {
          console.log('Geolocation not supported');
          // Fallback to India if geolocation not supported
          const { data, error } = await supabase.functions.invoke('fetch-weather', {
            body: { lat: '28.6139', lon: '77.2090' }
          });
          if (error) throw error;
          setWeather(data.weather);
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching weather:', error);
        setLoading(false);
      }
    };

    fetchWeather();
  }, []);

  const weatherContent = (
    <div className="space-y-4">
      {loading ? (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
          <p className="text-xs text-muted-foreground">Loading weather...</p>
        </div>
      ) : weather ? (
        <>
          {/* Current Weather */}
          <div className="text-center p-4 bg-gradient-card rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Cloud className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold">{weather.current.temperature}°F</span>
            </div>
            <p className="text-sm text-muted-foreground mb-2">{weather.current.condition}</p>
            <p className="text-xs font-medium">{weather.location}</p>
          </div>

          {/* Weather Details */}
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Thermometer className="w-3 h-3 text-muted-foreground" />
              <span>Humidity: {weather.current.humidity}%</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="w-3 h-3 text-muted-foreground" />
              <span>Wind: {weather.current.windSpeed} mph</span>
            </div>
          </div>

          {/* Forecast */}
          <div className="space-y-2">
            {weather.forecast.map((day, index) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <span className="font-medium">{day.day}</span>
            <div className="flex items-center gap-2">
              <WeatherIcon type={day.icon} />
              <span className="text-muted-foreground">{day.high}°/{day.low}°</span>
            </div>
            </div>
          ))}
        </div>
        </>
      ) : (
        <p className="text-xs text-muted-foreground text-center py-4">Weather data unavailable</p>
      )}
    </div>
  );

  return (
    <InfoCard
      title="Weather Forecast"
      icon={Cloud}
      content={weatherContent}
      badge={{ text: "Updated", variant: "outline" }}
      action={{
        text: "7-Day Forecast",
        onClick: () => window.open('https://weather.com', '_blank')
      }}
    />
  );
};

export default WeatherWidget;