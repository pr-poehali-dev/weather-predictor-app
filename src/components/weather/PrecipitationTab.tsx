import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface PrecipitationTabProps {
  loading: boolean;
  weatherData: any;
  dailyForecast: any[];
}

export default function PrecipitationTab({ loading, weatherData, dailyForecast }: PrecipitationTabProps) {
  return (
    <>
      <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl dark:bg-[#1e2936]/95 overflow-hidden">
        <h3 className="text-xl font-semibold text-[#34495E] dark:text-white mb-6">Детальный прогноз осадков</h3>
        {loading ? (
          <div className="text-center py-8 text-[#34495E]/60 dark:text-white/60">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="flex gap-3 pb-4 min-w-max">
              {weatherData?.hourly?.slice(0, 24).map((hour: any, index: number) => {
                const hasRain = (hour.rain || 0) > 0;
                const hasSnow = (hour.snow || 0) > 0;
                const totalPrecip = hour.precipitation || 0;
                
                return (
                  <div key={index} className={`flex-shrink-0 w-28 p-4 rounded-xl border-2 overflow-hidden ${
                    totalPrecip > 5 ? 'border-blue-400 bg-blue-50 dark:border-blue-600 dark:bg-blue-900/20' :
                    totalPrecip > 1 ? 'border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/15' :
                    totalPrecip > 0 ? 'border-blue-200 bg-blue-50/30 dark:border-blue-800 dark:bg-blue-900/10' :
                    'border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/20'
                  }`}>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-[#34495E] dark:text-white mb-2">{hour.time}</div>
                      
                      {hasRain && (
                        <div className="mb-2">
                          <Icon name="CloudRain" size={24} className="mx-auto text-blue-500 dark:text-blue-400" />
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Дождь</div>
                          <div className="text-sm font-bold text-[#34495E] dark:text-white">{hour.rain.toFixed(1)} мм</div>
                        </div>
                      )}
                      
                      {hasSnow && (
                        <div className="mb-2">
                          <Icon name="CloudSnow" size={24} className="mx-auto text-blue-400 dark:text-blue-400" />
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium mt-1">Снег</div>
                          <div className="text-sm font-bold text-[#34495E] dark:text-white">{hour.snow.toFixed(1)} см</div>
                        </div>
                      )}
                      
                      {!hasRain && !hasSnow && totalPrecip === 0 && (
                        <div>
                          <Icon name="Sun" size={24} className="mx-auto text-yellow-500 dark:text-yellow-400" />
                          <div className="text-xs text-[#34495E]/60 dark:text-white/60 mt-1">Без осадков</div>
                        </div>
                      )}
                      
                      <div className="mt-2 pt-2 border-t border-[#34495E]/10 dark:border-white/10">
                        <div className="text-xs text-[#34495E]/60 dark:text-white/60">Вероятность</div>
                        <div className="text-sm font-semibold text-[#4A90E2] dark:text-blue-400">{hour.precip}%</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <div className="grid md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl dark:bg-[#1e2936]/95 overflow-hidden">
          <h3 className="text-xl font-semibold text-[#34495E] dark:text-white mb-6">Ожидаемые осадки по дням</h3>
          {loading ? (
            <div className="text-center py-8 text-[#34495E]/60 dark:text-white/60">Загрузка...</div>
          ) : (
            <div className="space-y-3">
              {dailyForecast.slice(0, 7).map((day: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#4A90E2]/10 to-[#98D8C8]/10 dark:from-[#4A90E2]/20 dark:to-[#98D8C8]/20">
                  <div className="flex items-center gap-3">
                    <div className="w-16 text-sm font-medium text-[#34495E] dark:text-white">{day.day}</div>
                    {(day.rain || 0) > 0 && <Icon name="CloudRain" size={20} className="text-blue-500 dark:text-blue-400" />}
                    {(day.snow || 0) > 0 && <Icon name="CloudSnow" size={20} className="text-blue-400 dark:text-blue-400" />}
                  </div>
                  <div className="flex items-center gap-4">
                    {(day.rain || 0) > 0 && (
                      <div className="text-sm">
                        <span className="text-[#34495E]/60 dark:text-white/60">Дождь: </span>
                        <span className="font-semibold text-blue-600 dark:text-blue-400">{day.rain.toFixed(1)} мм</span>
                      </div>
                    )}
                    {(day.snow || 0) > 0 && (
                      <div className="text-sm">
                        <span className="text-[#34495E]/60 dark:text-white/60">Снег: </span>
                        <span className="font-semibold text-blue-500 dark:text-blue-400">{day.snow.toFixed(1)} см</span>
                      </div>
                    )}
                    {(day.rain || 0) === 0 && (day.snow || 0) === 0 && (
                      <div className="text-sm text-green-600 dark:text-green-400 font-medium">Без осадков</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl dark:bg-[#1e2936]/95 overflow-hidden">
          <h3 className="text-xl font-semibold text-[#34495E] dark:text-white mb-6">Рекомендации</h3>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Umbrella" size={24} className="text-blue-600 dark:text-blue-400" />
                <div className="font-semibold text-[#34495E] dark:text-white">Зонт обязателен</div>
              </div>
              <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                {dailyForecast.filter((d: any) => d.precip > 50).length > 0 
                  ? `В ${dailyForecast.filter((d: any) => d.precip > 50).length} из 7 дней высокая вероятность дождя`
                  : 'На этой неделе осадки маловероятны'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20 dark:from-[#98D8C8]/30 dark:to-[#4A90E2]/30">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="Car" size={24} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
                <div className="font-semibold text-[#34495E] dark:text-white">Дорожные условия</div>
              </div>
              <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                {dailyForecast.some((d: any) => (d.snow || 0) > 0)
                  ? 'Ожидается снег — будьте осторожны на дорогах'
                  : 'Дорожные условия будут благоприятными'}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20 dark:from-[#4A90E2]/30 dark:to-[#98D8C8]/30">
              <div className="flex items-center gap-3 mb-2">
                <Icon name="CalendarCheck" size={24} className="text-[#98D8C8] dark:text-[#7EC8E3]" />
                <div className="font-semibold text-[#34495E] dark:text-white">Планирование</div>
              </div>
              <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                Лучшие дни для активного отдыха: {
                  dailyForecast
                    .filter((d: any, i: number) => i < 7 && d.precip < 30)
                    .map((d: any) => d.day)
                    .join(', ') || 'данных нет'
                }
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}