import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface DailyForecastTabProps {
  loading: boolean;
  dailyForecast: any[];
}

export default function DailyForecastTab({ loading, dailyForecast }: DailyForecastTabProps) {
  return (
    <div className="space-y-6">
      <Card className="p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
        <h3 className="text-xl font-semibold text-[#34495E] dark:text-white mb-6">Прогноз на 10 дней</h3>
        {loading ? (
          <div className="text-center py-8 text-[#34495E]/60 dark:text-white/60">Загрузка...</div>
        ) : (
          <div className="space-y-3">
            {dailyForecast.map((day: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/10 to-[#98D8C8]/10 dark:from-[#4A90E2]/20 dark:to-[#98D8C8]/20 hover:from-[#4A90E2]/15 hover:to-[#98D8C8]/15 dark:hover:from-[#4A90E2]/25 dark:hover:to-[#98D8C8]/25 transition-all">
                <div className="flex items-center gap-4 flex-1">
                  <div className="w-20 font-medium text-[#34495E] dark:text-white">{day.day}</div>
                  <Icon name={day.icon} size={32} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
                  <div className="text-sm text-[#34495E]/70 dark:text-white/70 flex-1">{day.condition}</div>
                </div>
                
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-2">
                    <Icon name="Droplets" size={16} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
                    <span className="text-sm text-[#34495E] dark:text-white">{day.precip}%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-red-500">{day.high}°</span>
                    <span className="text-[#34495E]/40">/</span>
                    <span className="text-lg font-bold text-blue-500">{day.low}°</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
          <h3 className="text-xl font-semibold text-[#34495E] dark:text-white mb-6">Температура</h3>
          {loading ? (
            <div className="text-center py-8 text-[#34495E]/60 dark:text-white/60">Загрузка...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#E55039]/20 to-[#F6B93B]/20 dark:from-[#E55039]/30 dark:to-[#F6B93B]/30">
                <div className="flex items-center gap-3">
                  <Icon name="ThermometerSun" size={24} className="text-[#E55039]" />
                  <div>
                    <div className="text-sm text-[#34495E]/60 dark:text-white/60">Максимальная</div>
                    <div className="text-2xl font-bold text-[#34495E] dark:text-white">
                      {dailyForecast.length > 0 ? Math.max(...dailyForecast.map((d: any) => d.high)) : 0}°
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20 dark:from-[#4A90E2]/30 dark:to-[#98D8C8]/30">
                <div className="flex items-center gap-3">
                  <Icon name="ThermometerSnowflake" size={24} className="text-[#4A90E2]" />
                  <div>
                    <div className="text-sm text-[#34495E]/60 dark:text-white/60">Минимальная</div>
                    <div className="text-2xl font-bold text-[#34495E] dark:text-white">
                      {dailyForecast.length > 0 ? Math.min(...dailyForecast.map((d: any) => d.low)) : 0}°
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20 dark:from-[#98D8C8]/30 dark:to-[#4A90E2]/30">
                <div className="flex items-center gap-3">
                  <Icon name="Activity" size={24} className="text-[#98D8C8]" />
                  <div>
                    <div className="text-sm text-[#34495E]/60 dark:text-white/60">Средняя</div>
                    <div className="text-2xl font-bold text-[#34495E] dark:text-white">
                      {dailyForecast.length > 0 ? Math.round(dailyForecast.slice(0, 7).reduce((sum: number, d: any) => sum + (d.high + d.low) / 2, 0) / 7) : 0}°
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
          <h3 className="text-xl font-semibold text-[#34495E] dark:text-white mb-6">Осадки за неделю</h3>
          {loading ? (
            <div className="text-center py-8 text-[#34495E]/60 dark:text-white/60">Загрузка...</div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20 dark:from-[#4A90E2]/30 dark:to-[#98D8C8]/30">
                <div className="flex items-center gap-3">
                  <Icon name="CloudRain" size={24} className="text-[#4A90E2]" />
                  <div>
                    <div className="text-sm text-[#34495E]/60 dark:text-white/60">Дождливых дней</div>
                    <div className="text-2xl font-bold text-[#34495E] dark:text-white">
                      {dailyForecast.length > 0 ? dailyForecast.slice(0, 7).filter((d: any) => d.precip > 30).length : 0} из 7
                    </div>
                  </div>
                </div>
            </div>
            
              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20 dark:from-[#98D8C8]/30 dark:to-[#4A90E2]/30">
                <div className="flex items-center gap-3">
                  <Icon name="Droplets" size={24} className="text-[#98D8C8]" />
                  <div>
                    <div className="text-sm text-[#34495E]/60 dark:text-white/60">Средняя вероятность</div>
                    <div className="text-2xl font-bold text-[#34495E] dark:text-white">
                      {dailyForecast.length > 0 ? Math.round(dailyForecast.slice(0, 7).reduce((sum: number, d: any) => sum + d.precip, 0) / 7) : 0}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20 dark:from-[#4A90E2]/30 dark:to-[#98D8C8]/30">
                <div className="flex items-center gap-3">
                  <Icon name="CloudRain" size={24} className="text-[#4A90E2]" />
                  <div>
                    <div className="text-sm text-[#34495E]/60 dark:text-white/60">Сильные осадки</div>
                    <div className="text-2xl font-bold text-[#34495E] dark:text-white">
                      {dailyForecast.length > 0 ? dailyForecast.slice(0, 7).filter((d: any) => d.precip > 60).length : 0} {dailyForecast.length > 0 && dailyForecast.slice(0, 7).filter((d: any) => d.precip > 60).length === 1 ? 'день' : 'дней'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}