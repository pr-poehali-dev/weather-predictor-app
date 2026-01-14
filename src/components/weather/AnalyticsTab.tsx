import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import AIForecast from './AIForecast';

interface AnalyticsTabProps {
  loading: boolean;
  dailyForecast: any[];
  weatherData?: any;
}

export default function AnalyticsTab({ loading, dailyForecast, weatherData }: AnalyticsTabProps) {
  return (
    <div className="space-y-6">
      <AIForecast weatherData={weatherData} loading={loading} />
      
      <Card className="p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <h3 className="text-xl font-semibold text-[#34495E] dark:text-white mb-6">Статистика погоды</h3>
        {loading ? (
          <div className="text-center py-8 text-[#34495E]/60 dark:text-white/60">Загрузка...</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#E55039]/10 to-[#F6B93B]/10 dark:from-[#E55039]/20 dark:to-[#F6B93B]/20">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="TrendingUp" size={24} className="text-[#E55039]" />
                <div className="text-sm text-[#34495E]/60 dark:text-white/60">Макс. температура</div>
              </div>
              <div className="text-2xl font-bold text-[#34495E] dark:text-white">
                {dailyForecast.length > 0 ? Math.max(...dailyForecast.map((d: any) => d.high)) : 0}°
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/10 to-[#98D8C8]/10 dark:from-[#4A90E2]/20 dark:to-[#98D8C8]/20">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="TrendingDown" size={24} className="text-[#4A90E2]" />
                <div className="text-sm text-[#34495E]/60 dark:text-white/60">Мин. температура</div>
              </div>
              <div className="text-2xl font-bold text-[#34495E] dark:text-white">
                {dailyForecast.length > 0 ? Math.min(...dailyForecast.map((d: any) => d.low)) : 0}°
              </div>
            </div>
            
            <div className="p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/10 to-[#4A90E2]/10 dark:from-[#98D8C8]/20 dark:to-[#4A90E2]/20">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="CloudRain" size={24} className="text-[#98D8C8]" />
                <div className="text-sm text-[#34495E]/60 dark:text-white/60">Дождливых дней</div>
              </div>
              <div className="text-2xl font-bold text-[#34495E] dark:text-white">
                {dailyForecast.length > 0 ? dailyForecast.filter((d: any) => d.precip > 30).length : 0} из 10
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}