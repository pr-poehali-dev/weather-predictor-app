import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface GeomagneticData {
  kIndex: number;
  level: string;
  description: string;
  forecast: Array<{
    date: string;
    kIndex: number;
    level: string;
  }>;
}

interface GeomagneticCardProps {
  geomagneticData: GeomagneticData | null;
}

export default function GeomagneticCard({ geomagneticData }: GeomagneticCardProps) {
  if (!geomagneticData) {
    return null;
  }

  const getKIndexColor = (kIndex: number) => {
    if (kIndex <= 2) return { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: 'text-green-600' };
    if (kIndex <= 4) return { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', icon: 'text-yellow-600' };
    if (kIndex <= 6) return { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: 'text-orange-600' };
    return { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: 'text-red-600' };
  };

  const currentColors = getKIndexColor(geomagneticData.kIndex);

  const getLevelIcon = (kIndex: number) => {
    if (kIndex <= 2) return 'CheckCircle2';
    if (kIndex <= 4) return 'AlertCircle';
    if (kIndex <= 6) return 'AlertTriangle';
    return 'Zap';
  };

  const getHealthImpact = (kIndex: number) => {
    if (kIndex <= 2) return 'Воздействие отсутствует';
    if (kIndex <= 4) return 'Слабое воздействие на чувствительных людей';
    if (kIndex <= 6) return 'Возможны головные боли, усталость';
    return 'Сильное воздействие: мигрени, бессонница, скачки давления';
  };

  return (
    <Card className="p-4 md:p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
            <Icon name="Activity" size={20} className="text-white md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-[#34495E] dark:text-white">Магнитные бури</h3>
            <p className="text-xs md:text-sm text-[#34495E]/60 dark:text-white/60">Геомагнитная активность</p>
          </div>
        </div>
        <Badge 
          variant="secondary" 
          className={`text-xs md:text-sm self-start md:self-auto ${currentColors.bg} ${currentColors.text}`}
        >
          K-индекс: {geomagneticData.kIndex}
        </Badge>
      </div>

      <div className={`p-6 rounded-2xl border-2 ${currentColors.border} ${currentColors.bg} mb-6`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-white/50`}>
            <Icon name={getLevelIcon(geomagneticData.kIndex)} size={32} className={currentColors.icon} />
          </div>
          <div className="flex-1">
            <h4 className={`text-lg font-bold ${currentColors.text} mb-2`}>
              {geomagneticData.level}
            </h4>
            <p className="text-sm text-[#34495E] dark:text-[#34495E] mb-3">
              {geomagneticData.description}
            </p>
            <div className="flex items-start gap-2">
              <Icon name="Heart" size={16} className={`${currentColors.icon} mt-0.5`} />
              <p className="text-xs text-[#34495E]/80 dark:text-[#34495E]/90">
                <span className="font-semibold">Влияние на здоровье:</span> {getHealthImpact(geomagneticData.kIndex)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-[#34495E] dark:text-white mb-4 flex items-center gap-2">
          <Icon name="Calendar" size={16} />
          Прогноз на 3 дня
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {geomagneticData.forecast.map((day, index) => {
            const dayColors = getKIndexColor(day.kIndex);
            return (
              <div 
                key={index}
                className={`p-4 rounded-xl border-2 ${dayColors.border} ${dayColors.bg}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-[#34495E] dark:text-[#34495E]">
                    {day.date}
                  </span>
                  <Icon name={getLevelIcon(day.kIndex)} size={20} className={dayColors.icon} />
                </div>
                <div className="space-y-1">
                  <div className={`text-2xl font-bold ${dayColors.text}`}>
                    K = {day.kIndex}
                  </div>
                  <div className={`text-xs font-medium ${dayColors.text}`}>
                    {day.level}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-[#34495E]/10 dark:border-white/10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-[#34495E]/70 dark:text-white/70">K 0-2: Спокойно</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-[#34495E]/70 dark:text-white/70">K 3-4: Слабая буря</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-[#34495E]/70 dark:text-white/70">K 5-6: Умеренная</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-[#34495E]/70 dark:text-white/70">K 7-9: Сильная</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
