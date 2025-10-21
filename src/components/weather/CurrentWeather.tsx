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
    <div className="grid md:grid-cols-2 gap-6 mb-8">
      <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold text-[#34495E] mb-2">{selectedLocation.display_name}</h2>
            <p className="text-[#34495E]/60">Сейчас</p>
          </div>
          <Icon name={currentWeather.icon} size={64} className="text-[#4A90E2]" />
        </div>
        
        <div className="mb-6">
          <div className="text-6xl font-bold text-[#34495E] mb-2">{currentWeather.temp}°</div>
          <div className="text-lg text-[#34495E]/70">Ощущается как {currentWeather.feelsLike}°</div>
          <div className="text-lg text-[#34495E] mt-2">{currentWeather.condition}</div>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {weatherMetrics.map((metric, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10">
              <Icon name={metric.icon} size={24} className="text-[#4A90E2]" />
              <div>
                <div className="text-xs text-[#34495E]/60">{metric.label}</div>
                <div className="font-semibold text-[#34495E]">{metric.value}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#F6B93B] to-[#E55039]">
            <Icon name="Sun" size={24} className="text-white" />
          </div>
          <h3 className="text-xl font-semibold text-[#34495E]">Солнце</h3>
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
  );
}
