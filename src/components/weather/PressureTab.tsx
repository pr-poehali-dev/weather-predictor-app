import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface PressureTabProps {
  loading: boolean;
  weatherData: any;
}

export default function PressureTab({ loading, weatherData }: PressureTabProps) {
  if (loading) {
    return (
      <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <div className="flex items-center justify-center py-12">
          <Icon name="Loader2" size={48} className="animate-spin text-[#4A90E2]" />
        </div>
      </Card>
    );
  }

  if (!weatherData?.current?.pressure) {
    return (
      <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <div className="text-center py-12 text-[#34495E]/60">
          Данные о давлении недоступны
        </div>
      </Card>
    );
  }

  const currentPressureMmHg = Math.round(weatherData.current.pressure * 0.750062);
  const dailyForecast = weatherData?.daily || [];
  const hourlyData = weatherData?.hourly || [];
  
  const hourlyPressure = hourlyData.slice(0, 48).map((hour: any) => ({
    time: hour.time,
    pressure: hour.pressure ? Math.round(hour.pressure * 0.750062) : 0
  })).filter((h: any) => h.pressure > 0);

  const dailyPressure = dailyForecast.map((day: any) => ({
    day: day.day,
    pressureMax: day.pressureMax ? Math.round(day.pressureMax * 0.750062) : 0,
    pressureMin: day.pressureMin ? Math.round(day.pressureMin * 0.750062) : 0
  })).filter((d: any) => d.pressureMax > 0);

  const allPressures = [
    currentPressureMmHg,
    ...hourlyPressure.map((h: any) => h.pressure),
    ...dailyPressure.flatMap((d: any) => [d.pressureMax, d.pressureMin])
  ].filter(p => p > 0);

  const minPressure = Math.min(...allPressures) - 5;
  const maxPressure = Math.max(...allPressures) + 5;
  const pressureRange = maxPressure - minPressure;
  const avgPressure = Math.round(allPressures.reduce((a, b) => a + b, 0) / allPressures.length);

  const getPressureStatus = (pressure: number) => {
    if (pressure < 735) return { text: 'Низкое', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (pressure < 755) return { text: 'Нормальное', color: 'text-green-600', bg: 'bg-green-100' };
    return { text: 'Высокое', color: 'text-orange-600', bg: 'bg-orange-100' };
  };

  const status = getPressureStatus(currentPressureMmHg);

  return (
    <div className="space-y-6">
      <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-gradient-to-br from-[#4A90E2] to-[#7EC8E3]">
            <Icon name="Gauge" size={32} className="text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-[#34495E]">Атмосферное давление</h2>
            <p className="text-[#34495E]/60">Текущее и прогноз на 2 недели</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10 border-0">
            <div className="text-sm text-[#34495E]/60 mb-2">Текущее давление</div>
            <div className="text-4xl font-bold text-[#34495E] mb-2">{currentPressureMmHg}</div>
            <div className="text-sm text-[#34495E]/80">мм рт.ст.</div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10 border-0">
            <div className="text-sm text-[#34495E]/60 mb-2">Статус</div>
            <div className={`text-2xl font-bold mb-2 ${status.color}`}>{status.text}</div>
            <div className="text-sm text-[#34495E]/80">
              {currentPressureMmHg < 735 ? 'Возможны головные боли' : 
               currentPressureMmHg > 755 ? 'Повышенная нагрузка на организм' : 
               'Комфортные условия'}
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10 border-0">
            <div className="text-sm text-[#34495E]/60 mb-2">Среднее за период</div>
            <div className="text-4xl font-bold text-[#34495E] mb-2">{avgPressure}</div>
            <div className="text-sm text-[#34495E]/80">мм рт.ст.</div>
          </Card>
        </div>

        {hourlyPressure.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-[#34495E] mb-4">Почасовой прогноз (24 часа)</h3>
            <div className="grid grid-cols-8 gap-2">
              {hourlyPressure.slice(0, 24).map((hour: any, index: number) => {
                const hourStatus = getPressureStatus(hour.pressure);
                return (
                  <div key={index} className={`p-3 rounded-lg ${hourStatus.bg} text-center`}>
                    <div className="text-xs text-[#34495E]/60 mb-1">{hour.time}</div>
                    <div className={`text-sm font-bold ${hourStatus.color}`}>{hour.pressure}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <h3 className="text-xl font-semibold text-[#34495E] mb-6">Прогноз на 14 дней</h3>
        
        <div className="space-y-3">
          {dailyPressure.map((day: any, index: number) => {
            const avgDayPressure = Math.round((day.pressureMax + day.pressureMin) / 2);
            const dayStatus = getPressureStatus(avgDayPressure);
            
            return (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/50 hover:bg-white/80 transition-colors">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-24 font-semibold text-[#34495E]">{day.day}</div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium ${dayStatus.bg} ${dayStatus.color}`}>
                    {dayStatus.text}
                  </div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-xs text-[#34495E]/60 mb-1">Макс</div>
                    <div className="text-lg font-bold text-[#34495E]">{day.pressureMax}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#34495E]/60 mb-1">Мин</div>
                    <div className="text-lg font-bold text-[#34495E]">{day.pressureMin}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#34495E]/60 mb-1">Средн</div>
                    <div className={`text-lg font-bold ${dayStatus.color}`}>{avgDayPressure}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="p-8 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <h3 className="text-xl font-semibold text-[#34495E] mb-6">Влияние давления на здоровье</h3>
        
        <div className="grid md:grid-cols-3 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-blue-600">
              <Icon name="ArrowDown" size={24} />
              <span className="font-semibold">Низкое (&lt; 735)</span>
            </div>
            <ul className="space-y-2 text-sm text-[#34495E]/80">
              <li>• Головная боль</li>
              <li>• Слабость, утомляемость</li>
              <li>• Снижение концентрации</li>
              <li>• Сонливость</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-green-600">
              <Icon name="Check" size={24} />
              <span className="font-semibold">Нормальное (735-755)</span>
            </div>
            <ul className="space-y-2 text-sm text-[#34495E]/80">
              <li>• Хорошее самочувствие</li>
              <li>• Нормальная активность</li>
              <li>• Комфортное состояние</li>
              <li>• Стабильное давление</li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-2 text-orange-600">
              <Icon name="ArrowUp" size={24} />
              <span className="font-semibold">Высокое (&gt; 755)</span>
            </div>
            <ul className="space-y-2 text-sm text-[#34495E]/80">
              <li>• Учащенное сердцебиение</li>
              <li>• Повышенная возбудимость</li>
              <li>• Нагрузка на сосуды</li>
              <li>• Возможна бессонница</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
