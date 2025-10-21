import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

const Index = () => {
  const [selectedCity, setSelectedCity] = useState('Москва');
  const cities = ['Москва', 'Санкт-Петербург', 'Новосибирск', 'Екатеринбург'];

  const currentWeather = {
    temp: 24,
    feelsLike: 22,
    condition: 'Переменная облачность',
    humidity: 65,
    windSpeed: 12,
    windDirection: 'СЗ',
    pressure: 1013,
    visibility: 10,
    uvIndex: 5,
    sunrise: '05:42',
    sunset: '20:18',
    precipitation: 20
  };

  const hourlyForecast = [
    { time: '14:00', temp: 24, icon: 'CloudRain', precip: 20 },
    { time: '15:00', temp: 25, icon: 'Cloud', precip: 10 },
    { time: '16:00', temp: 26, icon: 'CloudSun', precip: 5 },
    { time: '17:00', temp: 25, icon: 'Sun', precip: 0 },
    { time: '18:00', temp: 24, icon: 'CloudSun', precip: 0 },
    { time: '19:00', temp: 23, icon: 'Cloud', precip: 15 },
    { time: '20:00', temp: 22, icon: 'CloudRain', precip: 30 },
    { time: '21:00', temp: 21, icon: 'CloudRain', precip: 40 }
  ];

  const dailyForecast = [
    { day: 'Сегодня', high: 26, low: 18, icon: 'CloudRain', precip: 60, condition: 'Дождь' },
    { day: 'Завтра', high: 24, low: 17, icon: 'Cloud', precip: 30, condition: 'Облачно' },
    { day: 'Ср', high: 27, low: 19, icon: 'CloudSun', precip: 10, condition: 'Переменная облачность' },
    { day: 'Чт', high: 29, low: 20, icon: 'Sun', precip: 0, condition: 'Ясно' },
    { day: 'Пт', high: 28, low: 21, icon: 'CloudSun', precip: 5, condition: 'Малооблачно' },
    { day: 'Сб', high: 26, low: 19, icon: 'Cloud', precip: 20, condition: 'Облачно' },
    { day: 'Вс', high: 25, low: 18, icon: 'CloudRain', precip: 50, condition: 'Дождь' },
    { day: 'Пн', high: 23, low: 16, icon: 'CloudRain', precip: 70, condition: 'Сильный дождь' },
    { day: 'Вт', high: 24, low: 17, icon: 'Cloud', precip: 25, condition: 'Облачно' },
    { day: 'Ср', high: 26, low: 18, icon: 'CloudSun', precip: 15, condition: 'Переменная облачность' }
  ];

  const weatherMetrics = [
    { label: 'Влажность', value: `${currentWeather.humidity}%`, icon: 'Droplets' },
    { label: 'Ветер', value: `${currentWeather.windSpeed} км/ч ${currentWeather.windDirection}`, icon: 'Wind' },
    { label: 'Давление', value: `${currentWeather.pressure} мбар`, icon: 'Gauge' },
    { label: 'Видимость', value: `${currentWeather.visibility} км`, icon: 'Eye' },
    { label: 'УФ-индекс', value: currentWeather.uvIndex, icon: 'Sun' },
    { label: 'Осадки', value: `${currentWeather.precipitation}%`, icon: 'CloudRain' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#4A90E2] via-[#7EC8E3] to-[#98D8C8] p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">Метеум</h1>
            <p className="text-white/80 text-lg">Прогноз погоды с нейросетевой точностью</p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            {cities.map((city) => (
              <Button
                key={city}
                variant={selectedCity === city ? 'default' : 'secondary'}
                onClick={() => setSelectedCity(city)}
                className={selectedCity === city ? 'bg-white text-[#4A90E2] hover:bg-white/90' : 'bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm'}
              >
                <Icon name="MapPin" size={16} className="mr-2" />
                {city}
              </Button>
            ))}
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
              <div className="animate-float">
                <Icon name="CloudRain" size={100} className="text-[#4A90E2]" />
              </div>
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
                    <div className="text-2xl font-bold">{currentWeather.sunrise}</div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <Icon name="Sunset" size={24} />
                  <div>
                    <div className="text-sm opacity-90">Закат</div>
                    <div className="text-2xl font-bold">{currentWeather.sunset}</div>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white/20 backdrop-blur-sm">
                <div className="text-sm opacity-90 mb-2">Продолжительность дня</div>
                <div className="text-xl font-bold">14 ч 36 мин</div>
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
              <div className="flex gap-4 overflow-x-auto pb-4">
                {hourlyForecast.map((hour, index) => (
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
            </Card>
          </TabsContent>

          <TabsContent value="daily" className="mt-6">
            <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
              <h3 className="text-xl font-semibold text-[#34495E] mb-6">Прогноз на 10 дней</h3>
              <div className="space-y-3">
                {dailyForecast.map((day, index) => (
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
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="mt-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <h3 className="text-xl font-semibold text-[#34495E] mb-6">Статистика температуры</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#F39C12]/20 to-[#F7DC6F]/20">
                    <div className="flex items-center gap-3">
                      <Icon name="TrendingUp" size={24} className="text-[#F39C12]" />
                      <div>
                        <div className="text-sm text-[#34495E]/60">Макс за неделю</div>
                        <div className="text-2xl font-bold text-[#34495E]">29°</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                    <div className="flex items-center gap-3">
                      <Icon name="TrendingDown" size={24} className="text-[#4A90E2]" />
                      <div>
                        <div className="text-sm text-[#34495E]/60">Мин за неделю</div>
                        <div className="text-2xl font-bold text-[#34495E]">16°</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20">
                    <div className="flex items-center gap-3">
                      <Icon name="Activity" size={24} className="text-[#98D8C8]" />
                      <div>
                        <div className="text-sm text-[#34495E]/60">Средняя</div>
                        <div className="text-2xl font-bold text-[#34495E]">23°</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
                <h3 className="text-xl font-semibold text-[#34495E] mb-6">Осадки за неделю</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                    <div className="flex items-center gap-3">
                      <Icon name="CloudRain" size={24} className="text-[#4A90E2]" />
                      <div>
                        <div className="text-sm text-[#34495E]/60">Дождливых дней</div>
                        <div className="text-2xl font-bold text-[#34495E]">4 из 7</div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20">
                    <div className="flex items-center gap-3">
                      <Icon name="Droplets" size={24} className="text-[#98D8C8]" />
                      <div>
                        <div className="text-sm text-[#34495E]/60">Общий объём</div>
                        <div className="text-2xl font-bold text-[#34495E]">28 мм</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                    <div className="flex items-center gap-3">
                      <Icon name="Zap" size={24} className="text-[#F7DC6F]" />
                      <div>
                        <div className="text-sm text-[#34495E]/60">Грозы</div>
                        <div className="text-2xl font-bold text-[#34495E]">1 день</div>
                      </div>
                    </div>
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
