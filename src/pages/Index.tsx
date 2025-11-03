import { useState, useEffect, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import WeatherHeader from '@/components/weather/WeatherHeader';
import CurrentWeather from '@/components/weather/CurrentWeather';
import AirQualityCard from '@/components/weather/AirQualityCard';
import HourlyForecastTab from '@/components/weather/HourlyForecastTab';
import DailyForecastTab from '@/components/weather/DailyForecastTab';
import PollenForecastTab from '@/components/weather/PollenForecastTab';
import WeatherHistoryTab from '@/components/weather/WeatherHistoryTab';
import PrecipitationTab from '@/components/weather/PrecipitationTab';
import AnalyticsTab from '@/components/weather/AnalyticsTab';
import NotificationSettings from '@/components/weather/NotificationSettings';
import SynopticMap from '@/components/weather/SynopticMap';

const WEATHER_API_URL = 'https://functions.poehali.dev/e720239f-3450-4c60-8958-9b046ff3b470';
const GEOCODING_API_URL = 'https://functions.poehali.dev/7faffcea-6e50-4b65-a1c3-20a51eabee7a';
const AIR_QUALITY_API_URL = 'https://functions.poehali.dev/fe7bc55e-5d6e-4c25-a2bf-2fd682293e6a';

interface Location {
  name: string;
  lat: number;
  lon: number;
  display_name: string;
  country: string;
  admin1?: string;
}

const Index = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    name: 'Москва',
    lat: 55.7558,
    lon: 37.6173,
    display_name: 'Москва',
    country: 'Россия'
  });
  const [weatherData, setWeatherData] = useState<any>(null);
  const [airQualityData, setAirQualityData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const [geolocating, setGeolocating] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  
  const popularCities = [
    { name: 'Москва', lat: 55.7558, lon: 37.6173 },
    { name: 'Санкт-Петербург', lat: 59.9311, lon: 30.3609 },
    { name: 'Новосибирск', lat: 55.0084, lon: 82.9357 },
    { name: 'Екатеринбург', lat: 56.8389, lon: 60.6057 },
    { name: 'Казань', lat: 55.7887, lon: 49.1221 },
    { name: 'Нижний Новгород', lat: 56.3287, lon: 44.0020 },
    { name: 'Челябинск', lat: 55.1644, lon: 61.4368 },
    { name: 'Самара', lat: 53.2001, lon: 50.1500 },
    { name: 'Тольятти', lat: 53.5303, lon: 49.3461 },
    { name: 'Саранск', lat: 54.1838, lon: 45.1749 },
    { name: 'Краснодар', lat: 45.0355, lon: 38.9753 },
    { name: 'Воронеж', lat: 51.6605, lon: 39.2005 },
    { name: 'Пермь', lat: 58.0105, lon: 56.2502 },
    { name: 'Волгоград', lat: 48.7080, lon: 44.5133 },
    { name: 'Ростов-на-Дону', lat: 47.2357, lon: 39.7015 },
    { name: 'Уфа', lat: 54.7388, lon: 55.9721 }
  ];

  useEffect(() => {
    fetchWeather(selectedLocation.lat, selectedLocation.lon);
    fetchAirQuality(selectedLocation.lat, selectedLocation.lon);
  }, [selectedLocation]);

  useEffect(() => {
    if (searchQuery.length === 0) {
      setSearchResults([]);
      return;
    }

    if (searchQuery.length < 2) {
      const matches = popularCities.filter(city => 
        city.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      
      setSearchResults(matches.map(city => ({
        name: city.name,
        lat: city.lat,
        lon: city.lon,
        display_name: city.name,
        country: 'Россия'
      })));
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchLocations(searchQuery);
    }, 150);

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  const searchLocations = async (query: string) => {
    setIsSearching(true);
    try {
      const response = await fetch(`${GEOCODING_API_URL}?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      setSearchResults(data.results || []);
    } catch (error) {
      console.error('Failed to search locations:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const fetchWeather = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const response = await fetch(`${WEATHER_API_URL}?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      setWeatherData(data);
    } catch (error) {
      console.error('Failed to fetch weather:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAirQuality = async (lat: number, lon: number) => {
    try {
      const response = await fetch(`${AIR_QUALITY_API_URL}?lat=${lat}&lon=${lon}`);
      const data = await response.json();
      setAirQualityData(data);
    } catch (error) {
      console.error('Failed to fetch air quality:', error);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Геолокация не поддерживается вашим браузером');
      return;
    }

    setGeolocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        try {
          const response = await fetch(`${GEOCODING_API_URL}?query=${lat},${lon}`);
          const data = await response.json();
          
          if (data.results && data.results.length > 0) {
            const location = data.results[0];
            setSelectedLocation(location);
          } else {
            setSelectedLocation({
              name: 'Моё местоположение',
              lat,
              lon,
              display_name: 'Моё местоположение',
              country: ''
            });
          }
        } catch (error) {
          console.error('Failed to reverse geocode:', error);
          setSelectedLocation({
            name: 'Моё местоположение',
            lat,
            lon,
            display_name: 'Моё местоположение',
            country: ''
          });
        } finally {
          setGeolocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        alert('Не удалось определить местоположение');
        setGeolocating(false);
      }
    );
  };

  const selectLocation = (location: Location) => {
    setSelectedLocation(location);
    setOpen(false);
    setSearchQuery('');
  };

  const currentWeather = weatherData?.current || {
    temp: 0,
    feelsLike: 0,
    condition: 'Загрузка...',
    icon: 'Cloud',
    humidity: 0,
    windSpeed: 0,
    windDirection: 0,
    pressure: 0,
    cloudCover: 0,
    precipitation: 0
  };

  const hourlyForecast = weatherData?.hourly?.slice(0, 8) || [];
  const dailyForecast = weatherData?.daily || [];
  const historyData = weatherData?.history || [];
  const sunData = weatherData?.sun || { sunrise: '', sunset: '' };

  const getWindDirection = (deg: number) => {
    const directions = ['С', 'СВ', 'В', 'ЮВ', 'Ю', 'ЮЗ', 'З', 'СЗ'];
    return directions[Math.round(deg / 45) % 8];
  };

  const weatherMetrics = [
    { label: 'Влажность', value: `${currentWeather.humidity}%`, icon: 'Droplets' },
    { label: 'Ветер', value: `${currentWeather.windSpeed} км/ч ${getWindDirection(currentWeather.windDirection)}`, icon: 'Wind' },
    { label: 'Давление', value: `${currentWeather.pressure} мбар`, icon: 'Gauge' },
    { label: 'Облачность', value: `${currentWeather.cloudCover}%`, icon: 'Cloud' },
    { label: 'Осадки', value: `${currentWeather.precipitation} мм`, icon: 'CloudRain' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A90E2] via-[#7EC8E3] to-[#98D8C8] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        <WeatherHeader
          selectedLocation={selectedLocation}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          searchResults={searchResults}
          isSearching={isSearching}
          open={open}
          setOpen={setOpen}
          popularCities={popularCities}
          selectLocation={selectLocation}
          getCurrentLocation={getCurrentLocation}
          geolocating={geolocating}
        />

        <CurrentWeather
          currentWeather={currentWeather}
          selectedLocation={selectedLocation}
          sunData={sunData}
          weatherMetrics={weatherMetrics}
          getWindDirection={getWindDirection}
        />

        <AirQualityCard airQualityData={airQualityData} />

        <SynopticMap selectedLocation={selectedLocation} weatherData={weatherData} />

        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="bg-white/20 backdrop-blur-sm border-0 p-1">
            <TabsTrigger value="hourly" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2]">
              <Icon name="Clock" size={16} className="mr-2" />
              Почасовой прогноз
            </TabsTrigger>
            <TabsTrigger value="daily" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2]">
              <Icon name="Calendar" size={16} className="mr-2" />
              10 дней
            </TabsTrigger>
            <TabsTrigger value="pollen" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2]">
              <Icon name="Flower2" size={16} className="mr-2" />
              Аллергены по часам
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2]">
              <Icon name="History" size={16} className="mr-2" />
              История
            </TabsTrigger>
            <TabsTrigger value="precipitation" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2]">
              <Icon name="CloudRain" size={16} className="mr-2" />
              Осадки
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2]">
              <Icon name="LineChart" size={16} className="mr-2" />
              Аналитика
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2]">
              <Icon name="Bell" size={16} className="mr-2" />
              Уведомления
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="mt-6">
            <HourlyForecastTab loading={loading} hourlyForecast={hourlyForecast} />
          </TabsContent>

          <TabsContent value="daily" className="mt-6">
            <DailyForecastTab loading={loading} dailyForecast={dailyForecast} />
          </TabsContent>

          <TabsContent value="pollen" className="mt-6">
            <PollenForecastTab loading={loading} airQualityData={airQualityData} weatherData={weatherData} />
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <WeatherHistoryTab loading={loading} historyData={historyData} />
          </TabsContent>

          <TabsContent value="precipitation" className="mt-6">
            <PrecipitationTab loading={loading} weatherData={weatherData} dailyForecast={dailyForecast} />
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <AnalyticsTab loading={loading} dailyForecast={dailyForecast} />
          </TabsContent>

          <TabsContent value="notifications" className="mt-6">
            <NotificationSettings />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;