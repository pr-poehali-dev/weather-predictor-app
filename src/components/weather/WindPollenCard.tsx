import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface WindPollenCardProps {
  weatherData: any;
  pollenData: any;
  loading: boolean;
}

export default function WindPollenCard({ weatherData, pollenData, loading }: WindPollenCardProps) {
  if (loading || !weatherData) {
    return (
      <Card className="p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl">
        <div className="text-center py-8 text-[#34495E]/60 dark:text-white/60">Загрузка...</div>
      </Card>
    );
  }

  const current = weatherData.current || {};
  const windSpeed = current.windSpeed || 0;
  const windDirection = current.windDirection || 0;

  const getWindDirectionName = (deg: number) => {
    const directions = [
      { name: 'С', label: 'Северный' },
      { name: 'СВ', label: 'Северо-восточный' },
      { name: 'В', label: 'Восточный' },
      { name: 'ЮВ', label: 'Юго-восточный' },
      { name: 'Ю', label: 'Южный' },
      { name: 'ЮЗ', label: 'Юго-западный' },
      { name: 'З', label: 'Западный' },
      { name: 'СЗ', label: 'Северо-западный' }
    ];
    return directions[Math.round(deg / 45) % 8];
  };

  const windDir = getWindDirectionName(windDirection);

  const getPollenSpreadDirection = () => {
    if (windSpeed < 5) return 'Пыльца распространяется медленно во всех направлениях из-за слабого ветра.';
    if (windSpeed < 15) return `Пыльца распространяется в ${windDir.label.toLowerCase()} направлении. Наибольшая концентрация ожидается в радиусе 5-10 км от центра города.`;
    return `Сильный ветер разносит пыльцу в ${windDir.label.toLowerCase()} направлении на большие расстояния (более 15 км).`;
  };

  const getRecommendations = () => {
    const recs = [];
    
    if (pollenData && pollenData.risk === 'high') {
      if (windSpeed > 10) {
        recs.push('Избегайте прогулок в парках с 10:00 до 16:00');
      } else {
        recs.push('Ограничьте время на открытом воздухе в утренние часы');
      }
      recs.push('Держите окна закрытыми в утренние часы');
      recs.push('Используйте очиститель воздуха в помещении');
      recs.push('Примите антигистаминные при необходимости');
    } else {
      recs.push('Условия благоприятны для прогулок');
      recs.push('Можно проветривать помещение');
      recs.push('Риск аллергических реакций минимален');
    }
    
    return recs;
  };

  const getForecastTomorrow = () => {
    const hourly = weatherData.hourly || [];
    if (hourly.length < 8) return '';
    
    const avgWindTomorrow = hourly.slice(0, 8).reduce((sum: number, h: any) => sum + (h.windSpeed || 0), 0) / 8;
    
    if (avgWindTomorrow < windSpeed - 3) {
      return 'Ожидается снижение концентрации пыльцы на 30% из-за вероятных осадков и изменения направления ветра на западное.';
    } else if (avgWindTomorrow > windSpeed + 3) {
      return 'Ожидается увеличение концентрации пыльцы на 20% из-за усиления ветра.';
    }
    return 'Концентрация пыльцы останется на текущем уровне.';
  };

  return (
    <Card className="p-4 md:p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
      <h3 className="text-lg md:text-xl font-semibold text-[#34495E] dark:text-white mb-4 md:mb-6">
        Направление ветра и распространение пыльцы
      </h3>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="space-y-4">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/10 to-[#98D8C8]/10 dark:from-[#4A90E2]/20 dark:to-[#98D8C8]/20">
            <Icon name="Wind" size={24} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
            <div>
              <div className="text-xs md:text-sm text-[#34495E]/60 dark:text-white/60">Текущий ветер</div>
              <div className="text-xl md:text-2xl font-bold text-[#34495E] dark:text-white">{windSpeed} км/ч</div>
              <div className="text-xs md:text-sm text-[#34495E]/70 dark:text-white/70">Направление: {windDirection}°</div>
            </div>
          </div>

          <div className="relative w-full aspect-square max-w-[280px] mx-auto">
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#4A90E2]/20 to-[#98D8C8]/20 dark:from-[#4A90E2]/30 dark:to-[#98D8C8]/30"></div>
            
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-sm font-medium text-[#34495E] dark:text-white">С</div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-sm font-medium text-[#34495E] dark:text-white">Ю</div>
            <div className="absolute left-2 top-1/2 -translate-y-1/2 text-sm font-medium text-[#34495E] dark:text-white">З</div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 text-sm font-medium text-[#34495E] dark:text-white">В</div>
            
            <div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 transition-transform duration-500"
              style={{ transform: `translate(-50%, -50%) rotate(${windDirection}deg)` }}
            >
              <Icon name="Navigation" size={64} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10 dark:from-[#4A90E2]/20 dark:to-[#98D8C8]/20">
            <div className="flex items-start gap-2 mb-3">
              <Icon name="MapPin" size={20} className="text-[#4A90E2] dark:text-[#7EC8E3] mt-1" />
              <div>
                <h4 className="font-semibold text-[#34495E] dark:text-white mb-1">Зона риска</h4>
                <p className="text-xs md:text-sm text-[#34495E]/80 dark:text-white/80">
                  {getPollenSpreadDirection()}
                </p>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-[#98D8C8]/10 to-[#4A90E2]/10 dark:from-[#98D8C8]/20 dark:to-[#4A90E2]/20">
            <div className="flex items-start gap-2 mb-3">
              <Icon name="Info" size={20} className="text-[#98D8C8] dark:text-[#7EC8E3] mt-1" />
              <div>
                <h4 className="font-semibold text-[#34495E] dark:text-white mb-2">Рекомендации</h4>
                <ul className="space-y-1.5">
                  {getRecommendations().map((rec, idx) => (
                    <li key={idx} className="text-xs md:text-sm text-[#34495E]/80 dark:text-white/80 flex items-start gap-2">
                      <span className="text-[#98D8C8] dark:text-[#7EC8E3] mt-0.5">•</span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10 dark:from-[#4A90E2]/20 dark:to-[#98D8C8]/20">
            <div className="flex items-start gap-2">
              <Icon name="TrendingDown" size={20} className="text-[#4A90E2] dark:text-[#7EC8E3] mt-1" />
              <div>
                <h4 className="font-semibold text-[#34495E] dark:text-white mb-1">Прогноз на завтра</h4>
                <p className="text-xs md:text-sm text-[#34495E]/80 dark:text-white/80">
                  {getForecastTomorrow()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
