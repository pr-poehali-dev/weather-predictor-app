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
            {(() => {
              const currentMonth = new Date().getMonth();
              const isWinter = currentMonth === 11 || currentMonth === 0 || currentMonth === 1;
              const isSummer = currentMonth >= 5 && currentMonth <= 7;
              
              const rainDays = dailyForecast.filter((d: any) => d.precip > 50 && (d.rain || 0) > 0).length;
              const snowDays = dailyForecast.filter((d: any) => (d.snow || 0) > 0).length;
              const clearDays = dailyForecast.filter((d: any, i: number) => i < 7 && d.precip < 30).length;
              
              return (
                <>
                  {/* Совет по зонту/снегу */}
                  {snowDays > 0 ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-800/20 border-2 border-blue-300 dark:border-blue-700">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="CloudSnow" size={24} className="text-blue-600 dark:text-blue-400" />
                        <div className="font-semibold text-[#34495E] dark:text-white">Зима в самом разгаре</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                        {snowDays === 1 
                          ? 'Ожидается снегопад в один из дней — приготовьте зимнюю куртку'
                          : `Снег ожидается в ${snowDays} дней — одевайтесь теплее и берите перчатки`}
                      </p>
                    </div>
                  ) : rainDays > 0 ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-blue-100 to-blue-50 dark:from-blue-900/30 dark:to-blue-800/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Umbrella" size={24} className="text-blue-600 dark:text-blue-400" />
                        <div className="font-semibold text-[#34495E] dark:text-white">{isWinter ? 'Дождь в холода' : 'Зонт обязателен'}</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                        {rainDays === 1
                          ? `${isWinter ? 'Дождь зимой неприятен — одевайтесь по погоде' : 'Возможен дождь в один из дней'}`
                          : `${isWinter ? `Мокрая погода ${rainDays} дней — тёплая куртка обязательна` : `Высокая вероятность дождя в ${rainDays} из 7 дней`}`}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-green-100 to-emerald-50 dark:from-green-900/30 dark:to-emerald-800/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Sun" size={24} className="text-green-600 dark:text-green-400" />
                        <div className="font-semibold text-[#34495E] dark:text-white">{isWinter ? 'Сухая морозная погода' : 'Ясная неделя'}</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                        {isWinter 
                          ? 'Осадков не ожидается — хорошее время для зимних прогулок'
                          : 'На этой неделе осадки маловероятны — отличное время для активного отдыха'}
                      </p>
                    </div>
                  )}

                  {/* Совет по дорогам */}
                  {snowDays > 1 ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-orange-100 to-red-50 dark:from-orange-900/30 dark:to-red-800/20 border-2 border-orange-400 dark:border-orange-700">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="AlertTriangle" size={24} className="text-orange-600 dark:text-orange-400" />
                        <div className="font-semibold text-[#34495E] dark:text-white">Будьте осторожны!</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                        Снег и гололёд — скорость снижайте, дистанцию увеличивайте. Зимние шины обязательны
                      </p>
                    </div>
                  ) : snowDays === 1 ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-yellow-100 to-amber-50 dark:from-yellow-900/30 dark:to-amber-800/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Car" size={24} className="text-yellow-600 dark:text-yellow-400" />
                        <div className="font-semibold text-[#34495E] dark:text-white">Дорожные условия</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                        Возможен снег — будьте внимательны на дорогах, особенно утром
                      </p>
                    </div>
                  ) : rainDays > 2 ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20 dark:from-[#98D8C8]/30 dark:to-[#4A90E2]/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Car" size={24} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
                        <div className="font-semibold text-[#34495E] dark:text-white">Мокрые дороги</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                        Дожди в течение недели — тормозной путь увеличивается, соблюдайте дистанцию
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20 dark:from-[#98D8C8]/30 dark:to-[#4A90E2]/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Car" size={24} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
                        <div className="font-semibold text-[#34495E] dark:text-white">Хорошая видимость</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                        {isWinter 
                          ? 'Дороги сухие, но осторожность зимой не помешает'
                          : 'Дорожные условия благоприятные — комфортная поездка'}
                      </p>
                    </div>
                  )}

                  {/* Совет по планированию */}
                  {clearDays >= 5 ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-purple-100 to-pink-50 dark:from-purple-900/30 dark:to-pink-800/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="CalendarCheck" size={24} className="text-purple-600 dark:text-purple-400" />
                        <div className="font-semibold text-[#34495E] dark:text-white">{isWinter ? 'Зимние активности' : 'Отличная неделя!'}</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                        {isWinter 
                          ? `${clearDays} ясных дней — идеально для катания на коньках, лыжах или прогулок в парке`
                          : `${clearDays} ясных дней — отличное время для пикников, спорта и прогулок на природе`}
                      </p>
                    </div>
                  ) : clearDays >= 2 ? (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/20 to-[#98D8C8]/20 dark:from-[#4A90E2]/30 dark:to-[#98D8C8]/30">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="CalendarCheck" size={24} className="text-[#98D8C8] dark:text-[#7EC8E3]" />
                        <div className="font-semibold text-[#34495E] dark:text-white">Планирование</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                        Благоприятные дни для активности: {
                          dailyForecast
                            .filter((d: any, i: number) => i < 7 && d.precip < 30)
                            .map((d: any) => d.day)
                            .join(', ') || 'уточняется'
                        }
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl bg-gradient-to-r from-gray-100 to-slate-50 dark:from-gray-900/30 dark:to-slate-800/20">
                      <div className="flex items-center gap-3 mb-2">
                        <Icon name="Home" size={24} className="text-gray-600 dark:text-gray-400" />
                        <div className="font-semibold text-[#34495E] dark:text-white">{isWinter ? 'Уютная неделя дома' : 'Непогода'}</div>
                      </div>
                      <p className="text-sm text-[#34495E]/80 dark:text-white/80">
                        {isWinter
                          ? 'Большую часть недели осадки — время для домашнего уюта и горячего чая'
                          : 'На улице преимущественно осадки — запланируйте домашние дела или культурные мероприятия'}
                      </p>
                    </div>
                  )}
                </>
              );
            })()}
          </div>
        </Card>
      </div>
    </>
  );
}