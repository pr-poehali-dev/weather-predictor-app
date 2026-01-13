import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface PollenForecastTabProps {
  loading: boolean;
  airQualityData: any;
  weatherData: any;
}

export default function PollenForecastTab({ loading, airQualityData, weatherData }: PollenForecastTabProps) {
  return (
    <>
      <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <h3 className="text-xl font-semibold text-[#34495E] mb-6">Почасовой прогноз аллергенов</h3>
        {loading || !airQualityData?.hourlyForecast ? (
          <div className="text-center py-8 text-[#34495E]/60">Загрузка...</div>
        ) : (
          <div className="overflow-x-auto">
            <div className="flex gap-3 pb-4 min-w-max">
              {airQualityData.hourlyForecast.slice(0, 24).map((hour: any, index: number) => {
                const hourTime = new Date(hour.time);
                const maxPollen = Math.max(hour.alder || 0, hour.birch || 0, hour.grass || 0, hour.mugwort || 0, hour.olive || 0, hour.ragweed || 0);
                const pollenRisk = maxPollen === 0 ? 'low' : maxPollen < 20 ? 'low' : maxPollen < 50 ? 'medium' : maxPollen < 100 ? 'high' : 'very_high';
                
                return (
                  <div key={index} className={`flex-shrink-0 w-32 p-4 rounded-xl border-2 ${
                    pollenRisk === 'very_high' ? 'border-red-300 bg-red-50' :
                    pollenRisk === 'high' ? 'border-orange-300 bg-orange-50' :
                    pollenRisk === 'medium' ? 'border-yellow-300 bg-yellow-50' :
                    'border-green-300 bg-green-50'
                  }`}>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-[#34495E] mb-2">
                        {hourTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className={`text-xs font-medium mb-3 ${
                        pollenRisk === 'very_high' ? 'text-red-600' :
                        pollenRisk === 'high' ? 'text-orange-600' :
                        pollenRisk === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                      }`}>
                        {pollenRisk === 'very_high' ? 'Очень высокий' :
                         pollenRisk === 'high' ? 'Высокий' :
                         pollenRisk === 'medium' ? 'Средний' : 'Низкий'}
                      </div>
                      <div className="space-y-1.5 text-xs">
                        {hour.alder > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/60">Ольха</span>
                            <span className="font-semibold text-[#34495E]">{Math.round(hour.alder)}</span>
                          </div>
                        )}
                        {hour.birch > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/60">Берёза</span>
                            <span className="font-semibold text-[#34495E]">{Math.round(hour.birch)}</span>
                          </div>
                        )}
                        {hour.grass > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/60">Злаки</span>
                            <span className="font-semibold text-[#34495E]">{Math.round(hour.grass)}</span>
                          </div>
                        )}
                        {hour.mugwort > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/60">Полынь</span>
                            <span className="font-semibold text-[#34495E]">{Math.round(hour.mugwort)}</span>
                          </div>
                        )}
                        {hour.olive > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/60">Олива</span>
                            <span className="font-semibold text-[#34495E]">{Math.round(hour.olive)}</span>
                          </div>
                        )}
                        {hour.ragweed > 0 && (
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[#34495E]/60">Амброзия</span>
                            <span className="font-semibold text-[#34495E]">{Math.round(hour.ragweed)}</span>
                          </div>
                        )}
                        {maxPollen === 0 && (
                          <div className="text-green-600 font-medium">Нет пыльцы</div>
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

      {weatherData && (
        <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl mt-6">
          <h3 className="text-xl font-semibold text-[#34495E] mb-6">Направление ветра и распространение пыльцы</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Icon name="Wind" size={32} className="text-[#4A90E2]" />
                <div>
                  <div className="text-sm text-[#34495E]/60">Текущий ветер</div>
                  <div className="text-2xl font-bold text-[#34495E]">{weatherData.current?.windSpeed || 0} км/ч</div>
                  <div className="text-sm text-[#34495E]/60">Направление: {weatherData.current?.windDirection || 'СВ'}</div>
                </div>
              </div>
              <div className="relative w-64 h-64 mx-auto bg-gradient-to-br from-[#4A90E2]/10 to-[#98D8C8]/10 rounded-full flex items-center justify-center">
                <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-[#34495E]">С</div>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-semibold text-[#34495E]">Ю</div>
                <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#34495E]">З</div>
                <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs font-semibold text-[#34495E]">В</div>
                
                <div className="w-48 h-48 bg-white/50 rounded-full flex items-center justify-center relative">
                  <Icon name="Navigation" size={48} className="text-[#4A90E2] transform rotate-45" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-[#4A90E2] rounded-full animate-pulse"></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Icon name="MapPin" size={24} className="text-[#4A90E2]" />
                  <div className="font-semibold text-[#34495E]">Зона риска</div>
                </div>
                <p className="text-sm text-[#34495E]/80">
                  Пыльца распространяется в северо-восточном направлении. Наибольшая концентрация ожидается в радиусе 5-10 км от центра города.
                </p>
              </div>
              
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Icon name="Info" size={24} className="text-[#98D8C8]" />
                  <div className="font-semibold text-[#34495E]">Рекомендации</div>
                </div>
                <ul className="text-sm text-[#34495E]/80 space-y-2">
                  <li>• Избегайте прогулок в парках с 10:00 до 16:00</li>
                  <li>• Держите окна закрытыми в утренние часы</li>
                  <li>• Используйте очиститель воздуха в помещении</li>
                  <li>• Примите антигистаминные при необходимости</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20">
                <div className="flex items-center gap-3 mb-3">
                  <Icon name="TrendingUp" size={24} className="text-[#4A90E2]" />
                  <div className="font-semibold text-[#34495E]">Прогноз на завтра</div>
                </div>
                <p className="text-sm text-[#34495E]/80">
                  Ожидается снижение концентрации пыльцы на 30% из-за вероятных осадков и изменения направления ветра на западное.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
