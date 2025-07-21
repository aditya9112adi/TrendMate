import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const OPENWEATHER_API_KEY = Deno.env.get('OPENWEATHER_API_KEY')!
    const url = new URL(req.url)
    const lat = url.searchParams.get('lat') || '37.7749' // Default to San Francisco
    const lon = url.searchParams.get('lon') || '-122.4194'
    
    // Current weather
    const currentResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    )
    const currentData = await currentResponse.json()
    
    // 5-day forecast
    const forecastResponse = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=imperial`
    )
    const forecastData = await forecastResponse.json()
    
    if (!currentResponse.ok || !forecastResponse.ok) {
      throw new Error('Failed to fetch weather data')
    }

    const getIconType = (weatherMain: string) => {
      switch (weatherMain.toLowerCase()) {
        case 'clear': return 'sun'
        case 'rain': case 'drizzle': return 'rain'
        case 'clouds': default: return 'cloud'
      }
    }

    // Get next 3 days forecast (skip today, take every 8th item for daily data)
    const dailyForecasts = forecastData.list
      .filter((_: any, index: number) => index % 8 === 0)
      .slice(1, 4)
      .map((day: any, index: number) => {
        const days = ['Tomorrow', 'Day After', 'In 3 Days']
        return {
          day: days[index] || 'Later',
          high: Math.round(day.main.temp_max),
          low: Math.round(day.main.temp_min), 
          icon: getIconType(day.weather[0].main)
        }
      })

    const weatherInfo = {
      location: `${currentData.name}, ${currentData.sys.country}`,
      current: {
        temperature: Math.round(currentData.main.temp),
        condition: currentData.weather[0].description
          .split(' ')
          .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' '),
        humidity: currentData.main.humidity,
        windSpeed: Math.round(currentData.wind.speed)
      },
      forecast: dailyForecasts
    }

    return new Response(
      JSON.stringify({ weather: weatherInfo }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    )
  }
})