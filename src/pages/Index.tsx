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

import SynopticMap from '@/components/weather/SynopticMap';
import PressureTab from '@/components/weather/PressureTab';
import NotificationSettings from '@/components/weather/NotificationSettings';
import { notificationService } from '@/services/notificationService';

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
    { name: 'Москва', lat: 55.7558, lon: 37.6173, region: 'Москва' },
    { name: 'Санкт-Петербург', lat: 59.9311, lon: 30.3609, region: 'Санкт-Петербург' },
    { name: 'Новосибирск', lat: 55.0084, lon: 82.9357, region: 'Новосибирская область' },
    { name: 'Екатеринбург', lat: 56.8389, lon: 60.6057, region: 'Свердловская область' },
    { name: 'Казань', lat: 55.7887, lon: 49.1221, region: 'Татарстан' },
    { name: 'Нижний Новгород', lat: 56.3287, lon: 44.0020, region: 'Нижегородская область' },
    { name: 'Челябинск', lat: 55.1644, lon: 61.4368, region: 'Челябинская область' },
    { name: 'Самара', lat: 53.2001, lon: 50.1500, region: 'Самарская область' },
    { name: 'Тольятти', lat: 53.5303, lon: 49.3461, region: 'Самарская область' },
    { name: 'Саранск', lat: 54.1838, lon: 45.1749, region: 'Мордовия' },
    { name: 'Краснодар', lat: 45.0355, lon: 38.9753, region: 'Краснодарский край' },
    { name: 'Воронеж', lat: 51.6605, lon: 39.2005, region: 'Воронежская область' },
    { name: 'Пермь', lat: 58.0105, lon: 56.2502, region: 'Пермский край' },
    { name: 'Волгоград', lat: 48.7080, lon: 44.5133, region: 'Волгоградская область' },
    { name: 'Ростов-на-Дону', lat: 47.2357, lon: 39.7015, region: 'Ростовская область' },
    { name: 'Уфа', lat: 54.7388, lon: 55.9721, region: 'Башкортостан' },
    { name: 'Омск', lat: 54.9885, lon: 73.3242, region: 'Омская область' },
    { name: 'Красноярск', lat: 56.0153, lon: 92.8932, region: 'Красноярский край' },
    { name: 'Тюмень', lat: 57.1522, lon: 65.5272, region: 'Тюменская область' },
    { name: 'Барнаул', lat: 53.3480, lon: 83.7799, region: 'Алтайский край' },
    { name: 'Иркутск', lat: 52.2978, lon: 104.2964, region: 'Иркутская область' },
    { name: 'Владивосток', lat: 43.1332, lon: 131.9113, region: 'Приморский край' },
    { name: 'Ярославль', lat: 57.6261, lon: 39.8845, region: 'Ярославская область' },
    { name: 'Тула', lat: 54.1934, lon: 37.6156, region: 'Тульская область' },
    { name: 'Севастополь', lat: 44.6160, lon: 33.5252, region: 'Севастополь' },
    { name: 'Махачкала', lat: 42.9849, lon: 47.5047, region: 'Дагестан' },
    { name: 'Хабаровск', lat: 48.4827, lon: 135.0838, region: 'Хабаровский край' },
    { name: 'Оренбург', lat: 51.7727, lon: 55.0988, region: 'Оренбургская область' },
    { name: 'Новокузнецк', lat: 53.7577, lon: 87.1099, region: 'Кемеровская область' },
    { name: 'Рязань', lat: 54.6269, lon: 39.6916, region: 'Рязанская область' },
    { name: 'Томск', lat: 56.4977, lon: 84.9744, region: 'Томская область' },
    { name: 'Кемерово', lat: 55.3547, lon: 86.0861, region: 'Кемеровская область' },
    { name: 'Астрахань', lat: 46.3497, lon: 48.0408, region: 'Астраханская область' },
    { name: 'Пенза', lat: 53.2001, lon: 45.0000, region: 'Пензенская область' },
    { name: 'Липецк', lat: 52.6097, lon: 39.5708, region: 'Липецкая область' },
    { name: 'Киров', lat: 58.6035, lon: 49.6679, region: 'Кировская область' },
    { name: 'Чебоксары', lat: 56.1439, lon: 47.2489, region: 'Чувашия' },
    { name: 'Калининград', lat: 54.7104, lon: 20.4522, region: 'Калининградская область' },
    { name: 'Сочи', lat: 43.6028, lon: 39.7342, region: 'Краснодарский край' },
    { name: 'Ставрополь', lat: 45.0428, lon: 41.9734, region: 'Ставропольский край' },
    { name: 'Тверь', lat: 56.8587, lon: 35.9176, region: 'Тверская область' },
    { name: 'Магнитогорск', lat: 53.4078, lon: 58.9797, region: 'Челябинская область' },
    { name: 'Иваново', lat: 57.0000, lon: 40.9833, region: 'Ивановская область' },
    { name: 'Брянск', lat: 53.2521, lon: 34.3717, region: 'Брянская область' },
    { name: 'Курск', lat: 51.7373, lon: 36.1873, region: 'Курская область' },
    { name: 'Нижний Тагил', lat: 57.9197, lon: 59.9650, region: 'Свердловская область' },
    { name: 'Улан-Удэ', lat: 51.8272, lon: 107.6063, region: 'Бурятия' },
    { name: 'Калуга', lat: 54.5293, lon: 36.2754, region: 'Калужская область' },
    { name: 'Владимир', lat: 56.1294, lon: 40.4063, region: 'Владимирская область' },
    { name: 'Архангельск', lat: 64.5401, lon: 40.5433, region: 'Архангельская область' },
    { name: 'Мурманск', lat: 68.9585, lon: 33.0827, region: 'Мурманская область' },
    { name: 'Якутск', lat: 62.0355, lon: 129.6755, region: 'Якутия' },
    { name: 'Смоленск', lat: 54.7824, lon: 32.0454, region: 'Смоленская область' },
    { name: 'Сургут', lat: 61.2500, lon: 73.4167, region: 'Ханты-Мансийский АО' }
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

    const query = searchQuery.toLowerCase();
    const matches = popularCities.filter(city => 
      city.name.toLowerCase().includes(query) ||
      city.region.toLowerCase().includes(query)
    );
    
    setSearchResults(matches.map(city => ({
      name: city.name,
      lat: city.lat,
      lon: city.lon,
      display_name: `${city.name}, ${city.region}`,
      country: 'Россия',
      admin1: city.region
    })));
    
    if (matches.length > 0) {
      return;
    }

    if (searchQuery.length < 2) {
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
      
      if (data && airQualityData) {
        notificationService.checkAllConditions(data, airQualityData);
      }
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
      
      if (data && weatherData) {
        notificationService.checkAllConditions(weatherData, data);
      }
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

  const pressureMmHg = Math.round(currentWeather.pressure * 0.750062);
  
  const weatherMetrics = [
    { label: 'Влажность', value: `${currentWeather.humidity}%`, icon: 'Droplets' },
    { label: 'Ветер', value: `${currentWeather.windSpeed} км/ч ${getWindDirection(currentWeather.windDirection)}`, icon: 'Wind' },
    { label: 'Давление', value: `${pressureMmHg} мм рт.ст.`, icon: 'Gauge' },
    { label: 'Облачность', value: `${currentWeather.cloudCover}%`, icon: 'Cloud' },
    { label: 'Осадки', value: `${currentWeather.precipitation} мм`, icon: 'CloudRain' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A90E2] via-[#7EC8E3] to-[#98D8C8] p-3 md:p-8">
      <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 animate-fade-in">
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
          <TabsList className="bg-white/20 backdrop-blur-sm border-0 p-1 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-1 h-auto">
            <TabsTrigger value="hourly" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2] text-xs md:text-sm flex-col md:flex-row py-2 md:py-1.5">
              <Icon name="Clock" size={16} className="md:mr-2 mb-1 md:mb-0" />
              <span className="hidden md:inline">Почасовой прогноз</span>
              <span className="md:hidden">По часам</span>
            </TabsTrigger>
            <TabsTrigger value="daily" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2] text-xs md:text-sm flex-col md:flex-row py-2 md:py-1.5">
              <Icon name="Calendar" size={16} className="md:mr-2 mb-1 md:mb-0" />
              <span>10 дней</span>
            </TabsTrigger>
            <TabsTrigger value="pollen" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2] text-xs md:text-sm flex-col md:flex-row py-2 md:py-1.5">
              <Icon name="Flower2" size={16} className="md:mr-2 mb-1 md:mb-0" />
              <span className="hidden md:inline">Аллергены по часам</span>
              <span className="md:hidden">Аллергены</span>
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2] text-xs md:text-sm flex-col md:flex-row py-2 md:py-1.5">
              <Icon name="History" size={16} className="md:mr-2 mb-1 md:mb-0" />
              <span>История</span>
            </TabsTrigger>
            <TabsTrigger value="precipitation" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2] text-xs md:text-sm flex-col md:flex-row py-2 md:py-1.5">
              <Icon name="CloudRain" size={16} className="md:mr-2 mb-1 md:mb-0" />
              <span>Осадки</span>
            </TabsTrigger>
            <TabsTrigger value="pressure" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2] text-xs md:text-sm flex-col md:flex-row py-2 md:py-1.5">
              <Icon name="Gauge" size={16} className="md:mr-2 mb-1 md:mb-0" />
              <span>Давление</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2] text-xs md:text-sm flex-col md:flex-row py-2 md:py-1.5">
              <Icon name="LineChart" size={16} className="md:mr-2 mb-1 md:mb-0" />
              <span>Аналитика</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="data-[state=active]:bg-white data-[state=active]:text-[#4A90E2] text-xs md:text-sm flex-col md:flex-row py-2 md:py-1.5">
              <Icon name="Bell" size={16} className="md:mr-2 mb-1 md:mb-0" />
              <span className="hidden md:inline">Уведомления</span>
              <span className="md:hidden">Алерты</span>
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

          <TabsContent value="pressure" className="mt-6">
            <PressureTab loading={loading} weatherData={weatherData} />
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