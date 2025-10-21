import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface HourlyForecastTabProps {
  loading: boolean;
  hourlyForecast: any[];
}

export default function HourlyForecastTab({ loading, hourlyForecast }: HourlyForecastTabProps) {
  return (
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
                  <div className="flex items-center justify-center gap-1 text-xs text-[#4A90E2]">
                    <Icon name="Droplets" size={12} />
                    <span>{hour.precip}%</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
