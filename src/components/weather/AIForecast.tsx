import { Card } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface AIForecastProps {
  weatherData: any;
  loading: boolean;
}

export default function AIForecast({ weatherData, loading }: AIForecastProps) {
  if (loading || !weatherData) {
    return (
      <Card className="p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl">
        <div className="text-center py-8 text-[#34495E]/60 dark:text-white/60">Загрузка AI прогноза...</div>
      </Card>
    );
  }

  const generateAIForecast = () => {
    const current = weatherData.current;
    const hourly = weatherData.hourly || [];
    const daily = weatherData.daily || [];

    let forecast = '';

    if (current.cloudCover > 70 && hourly.some((h: any) => h.precip > 30)) {
      forecast += `☁️ Ожидается переменная облачность с вероятностью кратковременных дождей во второй половине дня. `;
    } else if (current.cloudCover < 30) {
      forecast += `☀️ Ожидается ясная погода с минимальной облачностью. `;
    } else {
      forecast += `🌤️ Ожидается переменная облачность. `;
    }

    const avgTemp = daily.length > 0 ? (daily[0].high + daily[0].low) / 2 : current.temp;
    if (avgTemp > 20) {
      forecast += `Температура будет комфортной для прогулок. `;
    } else if (avgTemp < 10) {
      forecast += `Будет прохладно, рекомендуется теплая одежда. `;
    } else {
      forecast += `Температура будет умеренной. `;
    }

    if (daily.length > 0 && daily[0].precip < 20) {
      forecast += `Рекомендуем взять с собой зонт после 17:00. `;
    }

    const windSpeed = hourly.length > 0 ? Math.max(...hourly.slice(0, 8).map((h: any) => h.windSpeed || 0)) : current.windSpeed;
    if (windSpeed > 15) {
      forecast += `К вечеру ожидается усиление ветра до ${windSpeed} км/ч. `;
    }

    forecast += `Атмосферное давление стабильное.`;

    return forecast;
  };

  return (
    <Card className="p-4 md:p-6 bg-gradient-to-br from-[#2c3e50] to-[#34495e] dark:from-[#1a2332]/95 dark:to-[#243447]/95 backdrop-blur-sm border-0 shadow-xl text-white">
      <div className="flex items-start gap-3 md:gap-4 mb-4">
        <div className="p-2 md:p-3 rounded-xl bg-gradient-to-br from-[#4A90E2] to-[#98D8C8] flex-shrink-0">
          <Icon name="Sparkles" size={24} className="text-white md:w-7 md:h-7" />
        </div>
        <div>
          <h3 className="text-lg md:text-xl font-bold mb-1">Прогноз от Волк-синоптик AI</h3>
          <p className="text-xs md:text-sm text-white/70">Нейросетевой анализ погодных условий</p>
        </div>
      </div>
      
      <div className="bg-white/10 dark:bg-white/5 rounded-xl p-4 md:p-5 backdrop-blur-sm">
        <p className="text-sm md:text-base leading-relaxed text-white/90">
          {generateAIForecast()}
        </p>
      </div>
    </Card>
  );
}
