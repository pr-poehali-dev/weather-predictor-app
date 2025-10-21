import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

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
    { name: 'Екатеринбург', lat: 56.8389, lon: 60.6057 }
  ];

  useEffect(() => {
    fetchWeather(selectedLocation.lat, selectedLocation.lon);
    fetchAirQuality(selectedLocation.lat, selectedLocation.lon);
  }, [selectedLocation]);

  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    searchTimeout.current = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

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
              display_name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
              country: ''
            });
          }
        } catch (error) {
          console.error('Failed to reverse geocode:', error);
          setSelectedLocation({
            name: 'Моё местоположение',
            lat,
            lon,
            display_name: `${lat.toFixed(4)}, ${lon.toFixed(4)}`,
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
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Метеум</h1>
            <p className="text-white/80 text-lg">Прогноз погоды с нейросетевой точностью</p>
          </div>
          
          <div className="flex flex-col gap-3 w-full md:w-auto">
            <div className="flex gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                  variant="secondary"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full md:w-[320px] justify-between bg-white/95 text-[#34495E] hover:bg-white backdrop-blur-sm"
                >
                  <div className="flex items-center gap-2 truncate">
                    <Icon name="MapPin" size={16} />
                    <span className="truncate">{selectedLocation.display_name}</span>
                  </div>
                  <Icon name="Search" size={16} className="ml-2 flex-shrink-0" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[320px] p-0" align="end">
                <Command shouldFilter={false}>
                  <CommandInput 
                    placeholder="Поиск города или села..." 
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {searchQuery.length < 2 && (
                      <CommandGroup heading="Популярные города">
                        {popularCities.map((city) => (
                          <CommandItem
                            key={city.name}
                            onSelect={() => selectLocation({
                              name: city.name,
                              lat: city.lat,
                              lon: city.lon,
                              display_name: city.name,
                              country: 'Россия'
                            })}
                          >
                            <Icon name="MapPin" size={14} className="mr-2" />
                            {city.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                    
                    {isSearching && (
                      <div className="py-6 text-center text-sm text-muted-foreground">
                        Поиск...
                      </div>
                    )}
                    
                    {!isSearching && searchQuery.length >= 2 && searchResults.length === 0 && (
                      <CommandEmpty>Ничего не найдено</CommandEmpty>
                    )}
                    
                    {!isSearching && searchResults.length > 0 && (
                      <CommandGroup heading="Результаты поиска">
                        {searchResults.map((location, index) => (
                          <CommandItem
                            key={`${location.name}-${location.lat}-${index}`}
                            onSelect={() => selectLocation(location)}
                          >
                            <Icon name="MapPin" size={14} className="mr-2" />
                            <div className="flex flex-col">
                              <span>{location.display_name}</span>
                              {location.admin1 && (
                                <span className="text-xs text-muted-foreground">
                                  {location.admin1}{location.country && location.country !== 'Россия' ? `, ${location.country}` : ''}
                                </span>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            <Button
              variant="secondary"
              size="icon"
              onClick={getCurrentLocation}
              disabled={geolocating}
              className="bg-white/95 text-[#34495E] hover:bg-white backdrop-blur-sm"
              title="Моё местоположение"
            >
              <Icon name={geolocating ? "Loader2" : "MapPinned"} size={16} className={geolocating ? "animate-spin" : ""} />
            </Button>
          </div>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl animate-slide-up">
            <div className="flex justify-between items-start mb-6">
              <div>
                <div className="text-7xl font-bold text-[#34495E] mb-2">{currentWeather.temp}°</div>
                <div className="text-xl text-[#34495E]/70 mb-1">Ощущается как {currentWeather.feelsLike}°</div>
                <div className="text-lg text-[#34495E]/60">{currentWeather.condition}</div>
              </div>
              {!loading && currentWeather.icon && (
                <div className="animate-float">
                  <Icon name={currentWeather.icon} size={100} className="text-[#4A90E2]" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-8">
              {weatherMetrics.map((metric, index) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10">
                  <div className="p-2 rounded-lg bg-[#4A90E2]/20">
                    <Icon name={metric.icon} size={20} className="text-[#4A90E2]" />
                  </div>
                  <div>
                    <div className="text-sm text-[#34495E]/60">{metric.label}</div>
                    <div className="font-semibold text-[#34495E]">{metric.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#F7DC6F] to-[#F39C12] border-0 shadow-xl animate-slide-up text-white">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold">Солнце</h3>
              <Icon name="Sunrise" size={32} />
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Icon name="Sunrise" size={24} />
                  <div>
                    <div className="text-sm opacity-90">Восход</div>
                    <div className="text-2xl font-bold">
                      {sunData.sunrise ? new Date(sunData.sunrise).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Icon name="Sunset" size={24} />
                  <div>
                    <div className="text-sm opacity-90">Закат</div>
                    <div className="text-2xl font-bold">
                      {sunData.sunset ? new Date(sunData.sunset).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                <div className="text-sm opacity-90 mb-2">Продолжительность дня</div>
                <div className="text-xl font-bold">
                  {sunData.sunrise && sunData.sunset ? (() => {
                    const sunrise = new Date(sunData.sunrise);
                    const sunset = new Date(sunData.sunset);
                    const diffMs = sunset.getTime() - sunrise.getTime();
                    const hours = Math.floor(diffMs / (1000 * 60 * 60));
                    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    return `${hours} ч ${minutes} мин`;
                  })() : '--'}
                </div>
              </div>
            </div>
          </Card>
        </div>

        {airQualityData && Object.keys(airQualityData.allergens || {}).length > 0 && (
          <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-br from-[#98D8C8] to-[#4A90E2]">
                  <Icon name="Wind" size={24} className="text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#34495E]">Качество воздуха и аллергены</h3>
                  <p className="text-sm text-[#34495E]/60">Индекс качества воздуха: {airQualityData.aqi?.value || 0} — {airQualityData.aqi?.level}</p>
                </div>
              </div>
              <Badge 
                variant="secondary" 
                className={`text-sm ${
                  airQualityData.aqi?.color === 'green' ? 'bg-green-100 text-green-700' :
                  airQualityData.aqi?.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
                  airQualityData.aqi?.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                  airQualityData.aqi?.color === 'red' ? 'bg-red-100 text-red-700' :
                  'bg-purple-100 text-purple-700'
                }`}
              >
                AQI {airQualityData.aqi?.value}
              </Badge>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {Object.entries(airQualityData.allergens || {}).map(([key, allergen]: [string, any]) => (
                <div 
                  key={key} 
                  className={`p-4 rounded-xl border-2 ${
                    allergen.risk === 'very_high' ? 'border-red-300 bg-red-50' :
                    allergen.risk === 'high' ? 'border-orange-300 bg-orange-50' :
                    allergen.risk === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-green-300 bg-green-50'
                  }`}
                >
                  <div className="flex flex-col items-center text-center gap-2">
                    <Icon name={allergen.icon} size={32} className={`${
                      allergen.risk === 'very_high' ? 'text-red-600' :
                      allergen.risk === 'high' ? 'text-orange-600' :
                      allergen.risk === 'medium' ? 'text-yellow-600' :
                      'text-green-600'
                    }`} />
                    <div>
                      <div className="font-semibold text-[#34495E] text-sm">{allergen.name}</div>
                      <div className="text-xs text-[#34495E]/60 mb-1">{allergen.bloomPeriod}</div>
                      <div className={`text-xs font-medium ${
                        allergen.risk === 'very_high' ? 'text-red-600' :
                        allergen.risk === 'high' ? 'text-orange-600' :
                        allergen.risk === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {allergen.level}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {airQualityData.pollutants && (
              <div className="mt-6 pt-6 border-t border-[#34495E]/10">
                <h4 className="text-sm font-semibold text-[#34495E]/70 mb-3">Загрязняющие вещества</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
                  <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
                    <div className="text-xs text-[#34495E]/60">PM2.5</div>
                    <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.pm25} µg/m³</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
                    <div className="text-xs text-[#34495E]/60">PM10</div>
                    <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.pm10} µg/m³</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
                    <div className="text-xs text-[#34495E]/60">NO₂</div>
                    <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.no2} µg/m³</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
                    <div className="text-xs text-[#34495E]/60">O₃</div>
                    <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.o3} µg/m³</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
                    <div className="text-xs text-[#34495E]/60">CO</div>
                    <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.co} µg/m³</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
                    <div className="text-xs text-[#34495E]/60">SO₂</div>
                    <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.so2} µg/m³</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
                    <div className="text-xs text-[#34495E]/60">Пыль</div>
                    <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.dust} µg/m³</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
                    <div className="text-xs text-[#34495E]/60">NH₃</div>
                    <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.ammonia} µg/m³</div>
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

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
          </TabsList>

          <TabsContent value="hourly" className="mt-6">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-xl font-semibold text-[#34495E] mb-6">Прогноз на 24 часа</h3>
              {loading ? (
                <div className="text-center py-8 text-[#34495E]/60">Загрузка...</div>
              ) : (
                <div className="flex gap-4 overflow-x-auto pb-4">
                  {hourlyForecast.map((hour: any, index: number) => (
                    <div key={index} className="flex-shrink-0 w-24 text-center">
                      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10 hover:from-[#4A90E2]/20 hover:to-[#98D8C8]/20 transition-all">
                        <div className="text-sm text-[#34495E]/60 mb-2">{hour.time}</div>
                        <Icon name={hour.icon} size={32} className="mx-auto mb-2 text-[#4A90E2]" />
                        <div className="text-2xl font-bold text-[#34495E] mb-1">{hour.temp}°</div>
                        {hour.precip > 0 && (
                          <Badge variant="secondary" className="text-xs bg-[#4A90E2]/20 text-[#4A90E2]">
                            <Icon name="Droplets" size={12} className="mr-1" />
                            {hour.precip}%
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="mt-6">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-xl font-semibold text-[#34495E] mb-6">Прогноз на 10 дней</h3>
              {loading ? (
                <div className="text-center py-8 text-[#34495E]/60">Загрузка...</div>
              ) : (
                <div className="space-y-3">
                  {dailyForecast.map((day: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-gradient-to-r from-[#4A90E2]/10 to-[#98D8C8]/10 hover:from-[#4A90E2]/20 hover:to-[#98D8C8]/20 transition-all">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-16 font-semibold text-[#34495E]">{day.day}</div>
                        <Icon name={day.icon} size={32} className="text-[#4A90E2]" />
                        <div className="text-[#34495E]/70 flex-1">{day.condition}</div>
                      </div>
                      <div className="flex items-center gap-6">
                        {day.precip > 0 && (
                          <Badge variant="secondary" className="bg-[#4A90E2]/20 text-[#4A90E2]">
                            <Icon name="Droplets" size={12} className="mr-1" />
                            {day.precip}%
                        </Badge>
                      )}
                        <div className="flex gap-2 items-center min-w-[100px] justify-end">
                          <span className="text-lg font-semibold text-[#34495E]">{day.high}°</span>
                          <span className="text-[#34495E]/50">/</span>
                          <span className="text-[#34495E]/70">{day.low}°</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <h3 className="text-xl font-semibold text-[#34495E] mb-6">Статистика температуры</h3>
                {loading ? (
                  <div className="text-center py-8 text-[#34495E]/60">Загрузка...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#F39C12]/20 to-[#F7DC6F]/20">
                      <div className="flex items-center gap-3">
                        <Icon name="TrendingUp" size={24} className="text-[#F39C12]" />
                        <div>
                          <div className="text-sm text-[#34495E]/60">Макс за неделю</div>
                          <div className="text-2xl font-bold text-[#34495E]">
                            {dailyForecast.length > 0 ? Math.max(...dailyForecast.slice(0, 7).map((d: any) => d.high)) : 0}°
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                      <div className="flex items-center gap-3">
                        <Icon name="TrendingDown" size={24} className="text-[#4A90E2]" />
                        <div>
                          <div className="text-sm text-[#34495E]/60">Мин за неделю</div>
                          <div className="text-2xl font-bold text-[#34495E]">
                            {dailyForecast.length > 0 ? Math.min(...dailyForecast.slice(0, 7).map((d: any) => d.low)) : 0}°
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20">
                      <div className="flex items-center gap-3">
                        <Icon name="Activity" size={24} className="text-[#98D8C8]" />
                        <div>
                          <div className="text-sm text-[#34495E]/60">Средняя</div>
                          <div className="text-2xl font-bold text-[#34495E]">
                            {dailyForecast.length > 0 ? Math.round(dailyForecast.slice(0, 7).reduce((sum: number, d: any) => sum + (d.high + d.low) / 2, 0) / 7) : 0}°
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <h3 className="text-xl font-semibold text-[#34495E] mb-6">Осадки за неделю</h3>
                {loading ? (
                  <div className="text-center py-8 text-[#34495E]/60">Загрузка...</div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                      <div className="flex items-center gap-3">
                        <Icon name="CloudRain" size={24} className="text-[#4A90E2]" />
                        <div>
                          <div className="text-sm text-[#34495E]/60">Дождливых дней</div>
                          <div className="text-2xl font-bold text-[#34495E]">
                            {dailyForecast.length > 0 ? dailyForecast.slice(0, 7).filter((d: any) => d.precip > 30).length : 0} из 7
                          </div>
                        </div>
                      </div>
                  </div>
                  
                    <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20">
                      <div className="flex items-center gap-3">
                        <Icon name="Droplets" size={24} className="text-[#98D8C8]" />
                        <div>
                          <div className="text-sm text-[#34495E]/60">Средняя вероятность</div>
                          <div className="text-2xl font-bold text-[#34495E]">
                            {dailyForecast.length > 0 ? Math.round(dailyForecast.slice(0, 7).reduce((sum: number, d: any) => sum + d.precip, 0) / 7) : 0}%
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                      <div className="flex items-center gap-3">
                        <Icon name="CloudRain" size={24} className="text-[#4A90E2]" />
                        <div>
                          <div className="text-sm text-[#34495E]/60">Сильные осадки</div>
                          <div className="text-2xl font-bold text-[#34495E]">
                            {dailyForecast.length > 0 ? dailyForecast.slice(0, 7).filter((d: any) => d.precip > 60).length : 0} {dailyForecast.length > 0 && dailyForecast.slice(0, 7).filter((d: any) => d.precip > 60).length === 1 ? 'день' : 'дней'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="pollen" className="mt-6">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-xl font-semibold text-[#34495E] mb-6">Почасовой прогноз аллергенов</h3>
              {loading || !airQualityData?.hourlyForecast ? (
                <div className="text-center py-8 text-[#34495E]/60">Загрузка...</div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex gap-3 pb-4 min-w-max">
                    {airQualityData.hourlyForecast.slice(0, 24).map((hour: any, index: number) => {
                      const hourTime = new Date(hour.time);
                      const maxPollen = Math.max(hour.alder || 0, hour.birch || 0, hour.grass || 0, hour.mugwort || 0, hour.olive || 0, hour.ragweed || 0);
                      const pollenRisk = maxPollen === 0 ? 'low' : maxPollen < 20 ? 'low' : maxPollen < 50 ? 'medium' : maxPollen < 100 ? 'high' : 'very_high';
                      
                      return (
                        <div key={index} className={`flex-shrink-0 w-32 p-4 rounded-xl border-2 ${
                          pollenRisk === 'very_high' ? 'border-red-300 bg-red-50' :
                          pollenRisk === 'high' ? 'border-orange-300 bg-orange-50' :
                          pollenRisk === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                          'border-green-300 bg-green-50'
                        }`}>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-[#34495E] mb-2">
                              {hourTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                            <div className={`text-xs font-medium mb-3 ${
                              pollenRisk === 'very_high' ? 'text-red-600' :
                              pollenRisk === 'high' ? 'text-orange-600' :
                              pollenRisk === 'medium' ? 'text-yellow-600' :
                              'text-green-600'
                            }`}>
                              {pollenRisk === 'very_high' ? 'Очень высокий' :
                               pollenRisk === 'high' ? 'Высокий' :
                               pollenRisk === 'medium' ? 'Средний' : 'Низкий'}
                            </div>
                            <div className="space-y-1.5 text-xs">
                              {hour.alder > 0 && (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[#34495E]/60">Ольха</span>
                                  <span className="font-semibold text-[#34495E]">{Math.round(hour.alder)}</span>
                                </div>
                              )}
                              {hour.birch > 0 && (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[#34495E]/60">Берёза</span>
                                  <span className="font-semibold text-[#34495E]">{Math.round(hour.birch)}</span>
                                </div>
                              )}
                              {hour.grass > 0 && (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[#34495E]/60">Злаки</span>
                                  <span className="font-semibold text-[#34495E]">{Math.round(hour.grass)}</span>
                                </div>
                              )}
                              {hour.mugwort > 0 && (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[#34495E]/60">Полынь</span>
                                  <span className="font-semibold text-[#34495E]">{Math.round(hour.mugwort)}</span>
                                </div>
                              )}
                              {hour.olive > 0 && (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[#34495E]/60">Олива</span>
                                  <span className="font-semibold text-[#34495E]">{Math.round(hour.olive)}</span>
                                </div>
                              )}
                              {hour.ragweed > 0 && (
                                <div className="flex items-center justify-between gap-2">
                                  <span className="text-[#34495E]/60">Амброзия</span>
                                  <span className="font-semibold text-[#34495E]">{Math.round(hour.ragweed)}</span>
                                </div>
                              )}
                              {maxPollen === 0 && (
                                <div className="text-green-600 font-medium">Нет пыльцы</div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            {weatherData && (
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl mt-6">
                <h3 className="text-xl font-semibold text-[#34495E] mb-6">Направление ветра и распространение пыльцы</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <Icon name="Wind" size={32} className="text-[#4A90E2]" />
                      <div>
                        <div className="text-sm text-[#34495E]/60">Текущий ветер</div>
                        <div className="text-2xl font-bold text-[#34495E]">{weatherData.wind} км/ч</div>
                        <div className="text-sm text-[#34495E]/60">Направление: {weatherData.windDirection || 'СВ'}</div>
                      </div>
                    </div>
                    <div className="relative w-64 h-64 mx-auto bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10 rounded-full flex items-center justify-center">
                      <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-[#34495E]">С</div>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-[#34495E]">Ю</div>
                      <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#34495E]">З</div>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#34495E]">В</div>
                      
                      <div className="w-48 h-48 bg-white/50 rounded-full flex items-center justify-center relative">
                        <Icon name="Navigation" size={48} className="text-[#4A90E2] transform rotate-45" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-[#4A90E2] rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon name="MapPin" size={24} className="text-[#4A90E2]" />
                        <div className="font-semibold text-[#34495E]">Зона риска</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80">
                        Пыльца распространяется в северо-восточном направлении. Наибольшая концентрация ожидается в радиусе 5-10 км от центра города.
                      </p>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon name="Info" size={24} className="text-[#98D8C8]" />
                        <div className="font-semibold text-[#34495E]">Рекомендации</div>
                      </div>
                      <ul className="text-sm text-[#34495E]/80 space-y-2">
                        <li>• Избегайте прогулок в парках с 10:00 до 16:00</li>
                        <li>• Держите окна закрытыми в утренние часы</li>
                        <li>• Используйте очиститель воздуха в помещении</li>
                        <li>• Примите антигистаминные при необходимости</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                      <div className="flex items-center gap-3 mb-3">
                        <Icon name="TrendingUp" size={24} className="text-[#4A90E2]" />
                        <div className="font-semibold text-[#34495E]">Прогноз на завтра</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80">
                        Ожидается снижение концентрации пыльцы на 30% из-за вероятных осадков и изменения направления ветра на западное.
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-6">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-xl font-semibold text-[#34495E] mb-6">История погоды за последние 7 дней</h3>
              {loading ? (
                <div className="text-center py-8 text-[#34495E]/60">Загрузка...</div>
              ) : (
                <div className="space-y-4">
                  {historyData.map((day: any, index: number) => {
                    const date = new Date(day.date);
                    const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
                    
                    return (
                      <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/10 to-[#98D8C8]/10 hover:from-[#4A90E2]/15 hover:to-[#98D8C8]/15 transition-all">
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-20 text-sm font-medium text-[#34495E]">{dayName}</div>
                          <Icon name={day.icon} size={32} className="text-[#4A90E2]" />
                          <div className="text-sm text-[#34495E]/70">{day.condition}</div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="text-xs text-[#34495E]/60 mb-1">Макс</div>
                            <div className="text-lg font-bold text-red-500">{day.high}°</div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-[#34495E]/60 mb-1">Мин</div>
                            <div className="text-lg font-bold text-blue-500">{day.low}°</div>
                          </div>
                          
                          {day.precipitation > 0 && (
                            <div className="text-center min-w-[80px]">
                              <div className="text-xs text-[#34495E]/60 mb-1">Осадки</div>
                              <div className="text-sm font-semibold text-[#4A90E2]">
                                {day.rain > 0 && <span className="flex items-center gap-1"><Icon name="CloudRain" size={14} />{day.rain} мм</span>}
                                {day.snow > 0 && <span className="flex items-center gap-1"><Icon name="CloudSnow" size={14} />{day.snow} см</span>}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </Card>

            <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl mt-6">
              <h3 className="text-xl font-semibold text-[#34495E] mb-6">Сравнение с прошлой неделей</h3>
              {loading || historyData.length === 0 ? (
                <div className="text-center py-8 text-[#34495E]/60">Нет данных</div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#4A90E2]/20 to-[#98D8C8]/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon name="Thermometer" size={24} className="text-[#4A90E2]" />
                      <div className="font-semibold text-[#34495E]">Средняя температура</div>
                    </div>
                    <div className="text-3xl font-bold text-[#34495E]">
                      {Math.round(historyData.reduce((sum: number, d: any) => sum + (d.high + d.low) / 2, 0) / historyData.length)}°
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#98D8C8]/20 to-[#4A90E2]/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon name="CloudRain" size={24} className="text-[#98D8C8]" />
                      <div className="font-semibold text-[#34495E]">Всего осадков</div>
                    </div>
                    <div className="text-3xl font-bold text-[#34495E]">
                      {historyData.reduce((sum: number, d: any) => sum + (d.precipitation || 0), 0).toFixed(1)} мм
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-br from-[#4A90E2]/20 to-[#98D8C8]/20">
                    <div className="flex items-center gap-3 mb-3">
                      <Icon name="Calendar" size={24} className="text-[#4A90E2]" />
                      <div className="font-semibold text-[#34495E]">Дождливых дней</div>
                    </div>
                    <div className="text-3xl font-bold text-[#34495E]">
                      {historyData.filter((d: any) => (d.rain || 0) > 0.5).length} из {historyData.length}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="precipitation" className="mt-6">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-xl font-semibold text-[#34495E] mb-6">Детальный прогноз осадков</h3>
              {loading ? (
                <div className="text-center py-8 text-[#34495E]/60">Загрузка...</div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="flex gap-3 pb-4 min-w-max">
                    {weatherData?.hourly?.slice(0, 24).map((hour: any, index: number) => {
                      const hasRain = (hour.rain || 0) > 0;
                      const hasSnow = (hour.snow || 0) > 0;
                      const totalPrecip = hour.precipitation || 0;
                      
                      return (
                        <div key={index} className={`flex-shrink-0 w-28 p-4 rounded-xl border-2 ${
                          totalPrecip > 5 ? 'border-blue-400 bg-blue-50' :
                          totalPrecip > 1 ? 'border-blue-300 bg-blue-50/50' :
                          totalPrecip > 0 ? 'border-blue-200 bg-blue-50/30' :
                          'border-gray-200 bg-gray-50'
                        }`}>
                          <div className="text-center">
                            <div className="text-sm font-semibold text-[#34495E] mb-2">{hour.time}</div>
                            
                            {hasRain && (
                              <div className="mb-2">
                                <Icon name="CloudRain" size={24} className="mx-auto text-blue-500" />
                                <div className="text-xs text-blue-600 font-medium mt-1">Дождь</div>
                                <div className="text-sm font-bold text-[#34495E]">{hour.rain.toFixed(1)} мм</div>
                              </div>
                            )}
                            
                            {hasSnow && (
                              <div className="mb-2">
                                <Icon name="CloudSnow" size={24} className="mx-auto text-blue-400" />
                                <div className="text-xs text-blue-600 font-medium mt-1">Снег</div>
                                <div className="text-sm font-bold text-[#34495E]">{hour.snow.toFixed(1)} см</div>
                              </div>
                            )}
                            
                            {!hasRain && !hasSnow && totalPrecip === 0 && (
                              <div>
                                <Icon name="Sun" size={24} className="mx-auto text-yellow-500" />
                                <div className="text-xs text-[#34495E]/60 mt-1">Без осадков</div>
                              </div>
                            )}
                            
                            <div className="mt-2 pt-2 border-t border-[#34495E]/10">
                              <div className="text-xs text-[#34495E]/60">Вероятность</div>
                              <div className="text-sm font-semibold text-[#4A90E2]">{hour.precip}%</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>

            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <h3 className="text-xl font-semibold text-[#34495E] mb-6">Ожидаемые осадки по дням</h3>
                {loading ? (
                  <div className="text-center py-8 text-[#34495E]/60">Загрузка...</div>
                ) : (
                  <div className="space-y-3">
                    {dailyForecast.slice(0, 7).map((day: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#4A90E2]/10 to-[#98D8C8]/10">
                        <div className="flex items-center gap-3">
                          <div className="w-16 text-sm font-medium text-[#34495E]">{day.day}</div>
                          {(day.rain || 0) > 0 && <Icon name="CloudRain" size={20} className="text-blue-500" />}
                          {(day.snow || 0) > 0 && <Icon name="CloudSnow" size={20} className="text-blue-400" />}
                        </div>
                        <div className="flex items-center gap-4">
                          {(day.rain || 0) > 0 && (
                            <div className="text-sm">
                              <span className="text-[#34495E]/60">Дождь: </span>
                              <span className="font-semibold text-blue-600">{day.rain.toFixed(1)} мм</span>
                            </div>
                          )}
                          {(day.snow || 0) > 0 && (
                            <div className="text-sm">
                              <span className="text-[#34495E]/60">Снег: </span>
                              <span className="font-semibold text-blue-500">{day.snow.toFixed(1)} см</span>
                            </div>
                          )}
                          {(day.rain || 0) === 0 && (day.snow || 0) === 0 && (
                            <div className="text-sm text-green-600 font-medium">Без осадков</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <h3 className="text-xl font-semibold text-[#34495E] mb-6">Рекомендации</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="Umbrella" size={24} className="text-blue-600" />
                      <div className="font-semibold text-[#34495E]">Зонт обязателен</div>
                    </div>
                    <p className="text-sm text-[#34495E]/80">
                      {dailyForecast.filter((d: any) => d.precip > 50).length > 0 
                        ? `В ${dailyForecast.filter((d: any) => d.precip > 50).length} из 7 дней высокая вероятность дождя`
                        : 'На этой неделе осадки маловероятны'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="Car" size={24} className="text-[#4A90E2]" />
                      <div className="font-semibold text-[#34495E]">Дорожные условия</div>
                    </div>
                    <p className="text-sm text-[#34495E]/80">
                      {dailyForecast.some((d: any) => (d.snow || 0) > 0)
                        ? 'Ожидается снег — будьте осторожны на дорогах'
                        : 'Дорожные условия будут благоприятными'}
                    </p>
                  </div>

                  <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                    <div className="flex items-center gap-3 mb-2">
                      <Icon name="CalendarCheck" size={24} className="text-[#98D8C8]" />
                      <div className="font-semibold text-[#34495E]">Планирование</div>
                    </div>
                    <p className="text-sm text-[#34495E]/80">
                      Лучшие дни для активного отдыха: {
                        dailyForecast
                          .filter((d: any, i: number) => i < 7 && d.precip < 30)
                          .map((d: any) => d.day)
                          .join(', ') || 'данных нет'
                      }
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#98D8C8]">
              <Icon name="Brain" size={24} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-[#34495E]">Прогноз от Метеум AI</h3>
              <p className="text-sm text-[#34495E]/60">Нейросетевой анализ погодных условий</p>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/10 to-[#98D8C8]/10">
            <p className="text-[#34495E] leading-relaxed">
              🌧️ Ожидается переменная облачность с вероятностью кратковременных дождей во второй половине дня. 
              Температура будет комфортной для прогулок. Рекомендуем взять с собой зонт после 17:00. 
              К вечеру ожидается усиление ветра до 15 км/ч. Атмосферное давление стабильное.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Index;