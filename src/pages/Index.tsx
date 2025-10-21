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
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [open, setOpen] = useState(false);
  const searchTimeout = useRef<NodeJS.Timeout>();
  
  const popularCities = [
    { name: 'Москва', lat: 55.7558, lon: 37.6173 },
    { name: 'Санкт-Петербург', lat: 59.9311, lon: 30.3609 },
    { name: 'Новосибирск', lat: 55.0084, lon: 82.9357 },
    { name: 'Екатеринбург', lat: 56.8389, lon: 60.6057 }
  ];

  useEffect(() => {
    fetchWeather(selectedLocation.lat, selectedLocation.lon);
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