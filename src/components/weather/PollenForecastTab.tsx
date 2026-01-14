import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';
import WindPollenCard from './WindPollenCard';

interface PollenForecastTabProps {
  loading: boolean;
  airQualityData: any;
  weatherData: any;
}

export default function PollenForecastTab({ loading, airQualityData, weatherData }: PollenForecastTabProps) {
  return (
    <>
      <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl dark:bg-[#1e2936]/95 overflow-hidden">
        <h3 className="text-xl font-semibold text-[#34495E] dark:text-white mb-6">Почасовой прогноз аллергенов</h3>
        {loading || !airQualityData?.hourlyForecast ? (
          <div className="text-center py-8 text-[#34495E]/60 dark:text-white/60">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto -mx-6 px-6">
            <div className="flex gap-3 pb-4 min-w-max">
              {airQualityData.hourlyForecast.slice(0, 24).map((hour: any, index: number) => {
                const hourTime = new Date(hour.time);
                const maxPollen = Math.max(hour.alder || 0, hour.birch || 0, hour.grass || 0, hour.mugwort || 0, hour.olive || 0, hour.ragweed || 0);
                const pollenRisk = maxPollen === 0 ? 'low' : maxPollen < 20 ? 'low' : maxPollen < 50 ? 'medium' : maxPollen < 100 ? 'high' : 'very_high';
                
                return (
                  <div key={index} className={`flex-shrink-0 w-32 p-4 rounded-xl border-2 overflow-hidden ${
                    pollenRisk === 'very_high' ? 'border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-700' :
                    pollenRisk === 'high' ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-700' :
                    pollenRisk === 'medium' ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-700' :
                    'border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
                  }`}>
                    <div className="text-center">
                      <div className="text-sm font-bold text-[#34495E] dark:text-white mb-2">
                        {hourTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className={`text-xs font-medium mb-3 ${
                        pollenRisk === 'very_high' ? 'text-red-600 dark:text-red-400' :
                        pollenRisk === 'high' ? 'text-orange-600 dark:text-orange-400' :
                        pollenRisk === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                        'text-green-600 dark:text-green-400'
                      }`}>
                        {pollenRisk === 'very_high' ? 'Очень высокий' :
                         pollenRisk === 'high' ? 'Высокий' :
                         pollenRisk === 'medium' ? 'Средний' : 'Низкий'}
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {hour.alder > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/70 dark:text-white/80">Ольха</span>
                            <span className="font-bold text-[#34495E] dark:text-white">{Math.round(hour.alder)}</span>
                          </div>
                        )}
                        {hour.birch > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/70 dark:text-white/80">Берёза</span>
                            <span className="font-bold text-[#34495E] dark:text-white">{Math.round(hour.birch)}</span>
                          </div>
                        )}
                        {hour.grass > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/70 dark:text-white/80">Злаки</span>
                            <span className="font-bold text-[#34495E] dark:text-white">{Math.round(hour.grass)}</span>
                          </div>
                        )}
                        {hour.mugwort > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/70 dark:text-white/80">Полынь</span>
                            <span className="font-bold text-[#34495E] dark:text-white">{Math.round(hour.mugwort)}</span>
                          </div>
                        )}
                        {hour.olive > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/70 dark:text-white/80">Олива</span>
                            <span className="font-bold text-[#34495E] dark:text-white">{Math.round(hour.olive)}</span>
                          </div>
                        )}
                        {hour.ragweed > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/70 dark:text-white/80">Амброзия</span>
                            <span className="font-bold text-[#34495E] dark:text-white">{Math.round(hour.ragweed)}</span>
                          </div>
                        )}
                        {maxPollen === 0 && (
                          <div className="text-green-600 dark:text-green-400 font-medium">Нет пыльцы</div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </Card>

      <div className="mt-6">
        <WindPollenCard weatherData={weatherData} pollenData={airQualityData} loading={loading} />
      </div>
    </>
  );
}