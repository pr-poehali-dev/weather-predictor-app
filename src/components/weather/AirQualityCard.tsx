import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface AirQualityCardProps {
  airQualityData: any;
}

export default function AirQualityCard({ airQualityData }: AirQualityCardProps) {
  if (!airQualityData || !Object.keys(airQualityData.allergens || {}).length) {
    return null;
  }

  return (
    <Card className="p-4 md:p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl transition-colors duration-300">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-0 mb-4 md:mb-6">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="p-1.5 md:p-2 rounded-lg bg-gradient-to-br from-[#98D8C8] to-[#4A90E2]">
            <Icon name="Wind" size={20} className="text-white md:w-6 md:h-6" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-[#34495E] dark:text-white">Качество воздуха и аллергены</h3>
            <p className="text-xs md:text-sm text-[#34495E]/60 dark:text-white/60">Индекс: {airQualityData.aqi?.value || 0} — {airQualityData.aqi?.level}</p>
          </div>
        </div>
        <Badge 
          variant="secondary" 
          className={`text-xs md:text-sm self-start md:self-auto ${
            airQualityData.aqi?.color === 'green' ? 'bg-green-100 text-green-700' :
            airQualityData.aqi?.color === 'yellow' ? 'bg-yellow-100 text-yellow-700' :
            airQualityData.aqi?.color === 'orange' ? 'bg-orange-100 text-orange-700' :
            airQualityData.aqi?.color === 'red' ? 'bg-red-100 text-red-700' :
            'bg-purple-100 text-purple-700'
          }`}
        >
          AQI {airQualityData.aqi?.value}
        </Badge>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
        {Object.entries(airQualityData.allergens || {}).map(([key, allergen]: [string, any]) => (
          <div 
            key={key} 
            className={`p-3 md:p-4 rounded-xl border-2 ${
              allergen.risk === 'very_high' ? 'border-red-300 bg-red-50' :
              allergen.risk === 'high' ? 'border-orange-300 bg-orange-50' :
              allergen.risk === 'medium' ? 'border-yellow-300 bg-yellow-50' :
              'border-green-300 bg-green-50'
            }`}
          >
            <div className="flex flex-col items-center text-center gap-1.5 md:gap-2">
              <Icon name={allergen.icon} size={24} className={`md:w-8 md:h-8 ${
                allergen.risk === 'very_high' ? 'text-red-600' :
                allergen.risk === 'high' ? 'text-orange-600' :
                allergen.risk === 'medium' ? 'text-yellow-600' :
                'text-green-600'
              }`} />
              <div>
                <div className="font-semibold text-[#34495E] dark:text-[#34495E] text-xs md:text-sm">{allergen.name}</div>
                <div className="text-[10px] md:text-xs text-[#34495E]/60 dark:text-[#34495E]/80 mb-1">{allergen.bloomPeriod}</div>
                <div className={`text-xs font-medium ${
                  allergen.risk === 'very_high' ? 'text-red-600' :
                  allergen.risk === 'high' ? 'text-orange-600' :
                  allergen.risk === 'medium' ? 'text-yellow-600' :
                  'text-green-600'
                }`}>
                  {allergen.level}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {airQualityData.pollutants && (
        <div className="mt-6 pt-6 border-t border-[#34495E]/10">
          <h4 className="text-sm font-semibold text-[#34495E]/70 mb-3">Загрязняющие вещества</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
              <div className="text-xs text-[#34495E]/60">PM2.5</div>
              <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.pm25} µg/m³</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
              <div className="text-xs text-[#34495E]/60">PM10</div>
              <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.pm10} µg/m³</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
              <div className="text-xs text-[#34495E]/60">NO₂</div>
              <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.no2} µg/m³</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
              <div className="text-xs text-[#34495E]/60">O₃</div>
              <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.o3} µg/m³</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
              <div className="text-xs text-[#34495E]/60">CO</div>
              <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.co} µg/m³</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
              <div className="text-xs text-[#34495E]/60">SO₂</div>
              <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.so2} µg/m³</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
              <div className="text-xs text-[#34495E]/60">Пыль</div>
              <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.dust} µg/m³</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-[#4A90E2]/10">
              <div className="text-xs text-[#34495E]/60">NH₃</div>
              <div className="font-semibold text-[#34495E]">{airQualityData.pollutants.ammonia} µg/m³</div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}