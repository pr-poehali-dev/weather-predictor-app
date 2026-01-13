import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface SynopticMapProps {
  selectedLocation: {
    lat: number;
    lon: number;
    name: string;
  };
  weatherData: any;
}

export default function SynopticMap({ selectedLocation, weatherData }: SynopticMapProps) {
  const [timeIndex, setTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [layerType, setLayerType] = useState<'wind' | 'rain' | 'pollen'>('wind');
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const maxHours = weatherData?.hourly?.length || 24;

  useEffect(() => {
    if (isPlaying) {
      playIntervalRef.current = setInterval(() => {
        setTimeIndex((prev) => (prev + 1) % maxHours);
      }, 1000);
    } else {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    }

    return () => {
      if (playIntervalRef.current) {
        clearInterval(playIntervalRef.current);
      }
    };
  }, [isPlaying, maxHours]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hourData = weatherData?.hourly?.[timeIndex];
    if (!hourData) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.fillStyle = '#E8F4FD';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.font = '40px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('🐺', centerX, centerY);

    ctx.font = '14px Arial';
    ctx.fillStyle = '#34495E';
    ctx.fillText(selectedLocation.name, centerX, centerY + 50);

    const windSpeed = hourData.windSpeed || 0;
    const windDeg = hourData.windDirection || 0;
    const rain = hourData.rain || 0;
    const pollen = hourData.pollen || 0;

    const gridSize = 80;
    const rows = 5;
    const cols = 7;
    const startX = (canvas.width - cols * gridSize) / 2;
    const startY = (canvas.height - rows * gridSize) / 2;

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = startX + j * gridSize + gridSize / 2;
        const y = startY + i * gridSize + gridSize / 2;

        if (Math.abs(x - centerX) < 50 && Math.abs(y - centerY) < 50) continue;

        if (layerType === 'wind') {
          const angle = (windDeg - 90) * (Math.PI / 180);
          const arrowLength = Math.max(Math.min(windSpeed * 1.5, 40), 15);
          
          const color = windSpeed > 30 ? '#E74C3C' : windSpeed > 15 ? '#F39C12' : '#4A90E2';
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x + arrowLength * Math.cos(angle),
            y + arrowLength * Math.sin(angle)
          );
          ctx.stroke();

          const headSize = 8;
          const headAngle = Math.PI / 6;
          ctx.beginPath();
          ctx.moveTo(
            x + arrowLength * Math.cos(angle),
            y + arrowLength * Math.sin(angle)
          );
          ctx.lineTo(
            x + arrowLength * Math.cos(angle) - headSize * Math.cos(angle - headAngle),
            y + arrowLength * Math.sin(angle) - headSize * Math.sin(angle - headAngle)
          );
          ctx.moveTo(
            x + arrowLength * Math.cos(angle),
            y + arrowLength * Math.sin(angle)
          );
          ctx.lineTo(
            x + arrowLength * Math.cos(angle) - headSize * Math.cos(angle + headAngle),
            y + arrowLength * Math.sin(angle) - headSize * Math.sin(angle + headAngle)
          );
          ctx.stroke();
        }

        if (layerType === 'rain' && rain > 0) {
          const radius = Math.min(rain * 5, 30);
          ctx.fillStyle = `rgba(74, 144, 226, ${Math.min(rain / 10, 0.7)})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }

        if (layerType === 'pollen' && pollen > 0) {
          const radius = Math.min(pollen * 4, 25);
          ctx.fillStyle = `rgba(255, 165, 0, ${Math.min(pollen / 10, 0.6)})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
  }, [timeIndex, layerType, weatherData, selectedLocation]);

  const currentTime = weatherData?.hourly?.[timeIndex]?.time || 'Загрузка...';

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#98D8C8]">
            <Icon name="Map" size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#34495E]">Синоптическая карта</h3>
            <p className="text-sm text-[#34495E]/60">Время: {currentTime}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant={layerType === 'wind' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayerType('wind')}
          >
            <Icon name="Wind" size={16} className="mr-2" />
            Ветер
          </Button>
          <Button
            variant={layerType === 'rain' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayerType('rain')}
          >
            <Icon name="CloudRain" size={16} className="mr-2" />
            Дождь
          </Button>
          <Button
            variant={layerType === 'pollen' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayerType('pollen')}
          >
            <Icon name="Flower2" size={16} className="mr-2" />
            Пыльца
          </Button>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        width={800}
        height={500}
        className="w-full h-[500px] rounded-xl shadow-lg mb-4 bg-[#E8F4FD]"
      />

      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            <Icon name={isPlaying ? 'Pause' : 'Play'} size={20} />
          </Button>

          <div className="flex-1 relative">
            <input
              type="range"
              min="0"
              max={maxHours - 1}
              value={timeIndex}
              onChange={(e) => setTimeIndex(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, #4A90E2 0%, #4A90E2 ${(timeIndex / (maxHours - 1)) * 100}%, #E5E7EB ${(timeIndex / (maxHours - 1)) * 100}%, #E5E7EB 100%)`
              }}
            />
          </div>

          <div className="text-sm font-semibold text-[#34495E] min-w-[80px] text-right">
            {timeIndex + 1} / {maxHours}
          </div>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-[#34495E]/60">
            <Icon name="Info" size={16} />
            <span>🐺 — ваше местоположение GPS</span>
          </div>
          {layerType === 'wind' && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[#4A90E2]"></div>
                <span className="text-xs">{'<'}15 км/ч</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[#F39C12]"></div>
                <span className="text-xs">15-30 км/ч</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-1 bg-[#E74C3C]"></div>
                <span className="text-xs">{'>'}30 км/ч</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}