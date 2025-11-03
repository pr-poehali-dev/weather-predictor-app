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

  const hourlyData = weatherData?.hourly || [];
  const historyData = weatherData?.history || [];
  
  const allPressureData = [
    ...historyData.map((day: any) => ({
      time: new Date(day.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }),
      pressure: 0,
      isHistory: true
    })),
    ...hourlyData.slice(0, 48).map((hour: any, index: number) => {
      const date = new Date();
      date.setHours(date.getHours() + index);
      return {
        time: date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
        pressure: 0,
        isHistory: false
      };
    })
  ];

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
  
  const minPressure = 720;
  const maxPressure = 780;
  const pressureRange = maxPressure - minPressure;

  const getPressureStatus = (pressure: number) => {
    if (pressure < 735) return { text: 'Низкое', color: 'text-blue-600' };
    if (pressure < 755) return { text: 'Нормальное', color: 'text-green-600' };
    return { text: 'Высокое', color: 'text-orange-600' };
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
            <p className="text-[#34495E]/60">Текущее и прогноз</p>
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
            <div className="text-sm text-[#34495E]/60 mb-2">Норма</div>
            <div className="text-4xl font-bold text-[#34495E] mb-2">745</div>
            <div className="text-sm text-[#34495E]/80">мм рт.ст.</div>
          </Card>
        </div>

        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[#34495E] mb-4">График давления (48 часов)</h3>
          
          <div className="relative h-64 bg-white/50 rounded-xl p-4">
            <div className="absolute inset-0 flex items-center justify-center text-[#34495E]/40 text-sm">
              График будет доступен после добавления данных о давлении в API
            </div>
            
            <div className="absolute left-4 top-0 bottom-0 flex flex-col justify-between text-xs text-[#34495E]/60">
              <span>{maxPressure}</span>
              <span>{minPressure + pressureRange * 0.66}</span>
              <span>{minPressure + pressureRange * 0.33}</span>
              <span>{minPressure}</span>
            </div>

            <div className="absolute bottom-4 left-16 right-4 border-t border-[#34495E]/20"></div>
          </div>
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
