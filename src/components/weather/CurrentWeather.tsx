import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface CurrentWeatherProps {
  currentWeather: {
    temp: number;
    feelsLike: number;
    condition: string;
    icon: string;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    pressure: number;
    cloudCover: number;
    precipitation: number;
  };
  selectedLocation: {
    name: string;
    display_name: string;
  };
  sunData: {
    sunrise: string;
    sunset: string;
  };
  weatherMetrics: Array<{
    label: string;
    value: string;
    icon: string;
  }>;
  getWindDirection: (deg: number) => string;
}

export default function CurrentWeather({
  currentWeather,
  selectedLocation,
  sunData,
  weatherMetrics,
  getWindDirection
}: CurrentWeatherProps) {
  return (
    <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
      <Card className="p-4 md:p-8 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl transition-colors duration-300">
        <div className="flex items-start justify-between mb-4 md:mb-6">
          <div>
            <h2 className="text-lg md:text-2xl font-semibold text-[#34495E] dark:text-white mb-1 md:mb-2">{selectedLocation.display_name}</h2>
            <p className="text-sm md:text-base text-[#34495E]/60 dark:text-white/60">Сейчас</p>
          </div>
          <Icon name={currentWeather.icon} size={48} className="text-[#4A90E2] dark:text-[#7EC8E3] md:w-16 md:h-16" />
        </div>
        
        <div className="mb-4 md:mb-6">
          <div className="text-4xl md:text-6xl font-bold text-[#34495E] dark:text-white mb-1 md:mb-2">{currentWeather.temp}°</div>
          <div className="text-sm md:text-lg text-[#34495E]/70 dark:text-white/70">Ощущается как {currentWeather.feelsLike}°</div>
          <div className="text-sm md:text-lg text-[#34495E] dark:text-white/90 mt-1 md:mt-2">{currentWeather.condition}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          {weatherMetrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-2 md:gap-3 p-2 md:p-3 rounded-xl bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10 dark:from-[#4A90E2]/20 dark:to-[#98D8C8]/20">
              <Icon name={metric.icon} size={20} className="text-[#4A90E2] dark:text-[#7EC8E3] md:w-6 md:h-6" />
              <div>
                <div className="text-[10px] md:text-xs text-[#34495E]/60 dark:text-white/60">{metric.label}</div>
                <div className="text-xs md:text-base font-semibold text-[#34495E] dark:text-white">{metric.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-4 md:p-8 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl transition-colors duration-300">
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-[#F6B93B] to-[#E55039]">
            <Icon name="Sun" size={20} className="text-white md:w-6 md:h-6" />
          </div>
          <h3 className="text-lg md:text-xl font-semibold text-[#34495E] dark:text-white">Солнце</h3>
        </div>
        
        <div className="space-y-3 md:space-y-4">
          <div className="flex justify-between items-center p-3 md:p-4 rounded-xl bg-white/20 dark:bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 md:gap-3">
              <Icon name="Sunrise" size={20} className="md:w-6 md:h-6" />
              <div>
                <div className="text-xs md:text-sm opacity-90 dark:text-white/90">Восход</div>
                <div className="text-lg md:text-2xl font-bold dark:text-white">
                  {sunData.sunrise ? (sunData.sunrise.includes('T') ? new Date(sunData.sunrise).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : sunData.sunrise) : '--:--'}
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center p-3 md:p-4 rounded-xl bg-white/20 dark:bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 md:gap-3">
              <Icon name="Sunset" size={20} className="md:w-6 md:h-6" />
              <div>
                <div className="text-xs md:text-sm opacity-90 dark:text-white/90">Закат</div>
                <div className="text-lg md:text-2xl font-bold dark:text-white">
                  {sunData.sunset ? (sunData.sunset.includes('T') ? new Date(sunData.sunset).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : sunData.sunset) : '--:--'}
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 md:p-4 rounded-xl bg-white/20 dark:bg-white/5 backdrop-blur-sm">
            <div className="text-xs md:text-sm opacity-90 dark:text-white/90 mb-2">Продолжительность дня</div>
            <div className="text-base md:text-xl font-bold dark:text-white">
              {sunData.sunrise && sunData.sunset ? (() => {
                let sunrise: Date;
                let sunset: Date;
                
                if (sunData.sunrise.includes('T')) {
                  sunrise = new Date(sunData.sunrise);
                  sunset = new Date(sunData.sunset);
                } else {
                  const today = new Date();
                  const [sunriseHour, sunriseMin] = sunData.sunrise.split(':').map(Number);
                  const [sunsetHour, sunsetMin] = sunData.sunset.split(':').map(Number);
                  sunrise = new Date(today.getFullYear(), today.getMonth(), today.getDate(), sunriseHour, sunriseMin);
                  sunset = new Date(today.getFullYear(), today.getMonth(), today.getDate(), sunsetHour, sunsetMin);
                }
                
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
  );
}