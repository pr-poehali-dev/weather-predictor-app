import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface WeatherHistoryTabProps {
  loading: boolean;
  historyData: any[];
}

export default function WeatherHistoryTab({ loading, historyData }: WeatherHistoryTabProps) {
  return (
    <>
      <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
        <h3 className="text-xl font-semibold text-[#34495E] mb-6">История погоды за последние 7 дней</h3>
        {loading ? (
          <div className="text-center py-8 text-[#34495E]/60">Загрузка...</div>
        ) : (
          <div className="space-y-4">
            {historyData.map((day: any, index: number) => {
              const date = new Date(day.date);
              const dayName = date.toLocaleDateString('ru-RU', { weekday: 'short', day: 'numeric', month: 'short' });
              
              return (
                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/10 to-[#98D8C8]/10 hover:from-[#4A90E2]/15 hover:to-[#98D8C8]/15 transition-all">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-20 text-sm font-medium text-[#34495E]">{dayName}</div>
                    <Icon name={day.icon} size={32} className="text-[#4A90E2]" />
                    <div className="text-sm text-[#34495E]/70">{day.condition}</div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <div className="text-xs text-[#34495E]/60 mb-1">Макс</div>
                      <div className="text-lg font-bold text-red-500">{day.high}°</div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-[#34495E]/60 mb-1">Мин</div>
                      <div className="text-lg font-bold text-blue-500">{day.low}°</div>
                    </div>
                    
                    {day.precipitation > 0 && (
                      <div className="text-center min-w-[80px]">
                        <div className="text-xs text-[#34495E]/60 mb-1">Осадки</div>
                        <div className="text-sm font-semibold text-[#4A90E2]">
                          {day.rain > 0 && <span className="flex items-center gap-1"><Icon name="CloudRain" size={14} />{day.rain} мм</span>}
                          {day.snow > 0 && <span className="flex items-center gap-1"><Icon name="CloudSnow" size={14} />{day.snow} см</span>}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl mt-6">
        <h3 className="text-xl font-semibold text-[#34495E] mb-6">Сравнение с прошлой неделей</h3>
        {loading || historyData.length === 0 ? (
          <div className="text-center py-8 text-[#34495E]/60">Нет данных</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-gradient-to-br from-[#4A90E2]/20 to-[#98D8C8]/20">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Thermometer" size={24} className="text-[#4A90E2]" />
                <div className="font-semibold text-[#34495E]">Средняя температура</div>
              </div>
              <div className="text-3xl font-bold text-[#34495E]">
                {Math.round(historyData.reduce((sum: number, d: any) => sum + (d.high + d.low) / 2, 0) / historyData.length)}°
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#98D8C8]/20 to-[#4A90E2]/20">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="CloudRain" size={24} className="text-[#98D8C8]" />
                <div className="font-semibold text-[#34495E]">Всего осадков</div>
              </div>
              <div className="text-3xl font-bold text-[#34495E]">
                {historyData.reduce((sum: number, d: any) => sum + (d.precipitation || 0), 0).toFixed(1)} мм
              </div>
            </div>

            <div className="p-4 rounded-xl bg-gradient-to-br from-[#4A90E2]/20 to-[#98D8C8]/20">
              <div className="flex items-center gap-3 mb-3">
                <Icon name="Calendar" size={24} className="text-[#4A90E2]" />
                <div className="font-semibold text-[#34495E]">Дождливых дней</div>
              </div>
              <div className="text-3xl font-bold text-[#34495E]">
                {historyData.filter((d: any) => (d.rain || 0) > 0.5).length} из {historyData.length}
              </div>
            </div>
          </div>
        )}
      </Card>
    </>
  );
}
