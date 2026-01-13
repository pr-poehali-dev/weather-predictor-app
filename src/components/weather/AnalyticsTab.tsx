import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AnalyticsTabProps {
  loading: boolean;
  dailyForecast: any[];
}

export default function AnalyticsTab({ loading, dailyForecast }: AnalyticsTabProps) {
  return (
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#98D8C8]">
          <Icon name="Brain" size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[#34495E]">Прогноз от Волк-синоптик AI</h3>
          <p className="text-sm text-[#34495E]/60">Нейросетевой анализ погодных условий</p>
        </div>
      </div>
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#4A90E2]/10 to-[#98D8C8]/10">
        <p className="text-[#34495E] leading-relaxed">
          🌧️ Ожидается переменная облачность с вероятностью кратковременных дождей во второй половине дня. 
          Температура будет комфортной для прогулок. Рекомендуем взять с собой зонт после 17:00. 
          К вечеру ожидается усиление ветра до 15 км/ч. Атмосферное давление стабильное.
        </p>
      </div>
    </Card>
  );
}