import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

interface SynopticMapProps {
  selectedLocation: {
    lat: number;
    lon: number;
    name: string;
  };
  weatherData: any;
}

function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

function WindOverlay({ 
  hourData, 
  layerType 
}: { 
  hourData: any;
  layerType: 'wind' | 'rain' | 'pollen';
}) {
  const map = useMap();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!map || !hourData) return;

    const canvas = canvasRef.current || document.createElement('canvas');
    canvasRef.current = canvas;

    const bounds = map.getBounds();
    const size = map.getSize();
    
    canvas.width = size.x;
    canvas.height = size.y;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '400';

    if (!canvas.parentElement) {
      map.getPane('overlayPane')?.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const windSpeed = hourData.windSpeed || 0;
    const windDeg = hourData.windDirection || 0;
    const rain = hourData.rain || 0;

    const gridSize = 60;
    const rows = Math.ceil(size.y / gridSize);
    const cols = Math.ceil(size.x / gridSize);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const x = j * gridSize + gridSize / 2;
        const y = i * gridSize + gridSize / 2;

        if (layerType === 'wind') {
          const angle = (windDeg - 90) * (Math.PI / 180);
          const arrowLength = Math.max(Math.min(windSpeed * 1.2, 35), 12);
          
          const color = windSpeed > 30 ? '#E74C3C' : windSpeed > 15 ? '#F39C12' : '#4A90E2';
          
          ctx.strokeStyle = color;
          ctx.lineWidth = 2.5;
          ctx.globalAlpha = 0.8;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(
            x + arrowLength * Math.cos(angle),
            y + arrowLength * Math.sin(angle)
          );
          ctx.stroke();

          const headSize = 6;
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
          const radius = Math.min(rain * 4, 25);
          ctx.fillStyle = `rgba(74, 144, 226, ${Math.min(rain / 10, 0.5)})`;
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    const handleMove = () => {
      if (canvas.parentElement) {
        canvas.remove();
        canvasRef.current = null;
      }
    };

    map.on('movestart', handleMove);
    map.on('zoomstart', handleMove);

    return () => {
      map.off('movestart', handleMove);
      map.off('zoomstart', handleMove);
      if (canvas.parentElement) {
        canvas.remove();
      }
    };
  }, [map, hourData, layerType]);

  return null;
}

export default function SynopticMap({ selectedLocation, weatherData }: SynopticMapProps) {
  const [timeIndex, setTimeIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [layerType, setLayerType] = useState<'wind' | 'rain' | 'pollen'>('wind');
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  const currentTime = weatherData?.hourly?.[timeIndex]?.time || 'Загрузка...';
  const hourData = weatherData?.hourly?.[timeIndex];

  return (
    <Card className="p-6 bg-white/95 dark:bg-[#1e2936]/95 backdrop-blur-sm border-0 shadow-xl overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#98D8C8]">
            <Icon name="Map" size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-[#34495E] dark:text-white">Синоптическая карта</h3>
            <p className="text-sm text-[#34495E]/60 dark:text-white/60">Время: {currentTime}</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            variant={layerType === 'wind' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayerType('wind')}
            className="flex-shrink-0"
          >
            <Icon name="Wind" size={16} className="mr-1" />
            <span className="hidden sm:inline">Ветер</span>
          </Button>
          <Button
            variant={layerType === 'rain' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLayerType('rain')}
            className="flex-shrink-0"
          >
            <Icon name="CloudRain" size={16} className="mr-1" />
            <span className="hidden sm:inline">Дождь</span>
          </Button>
        </div>
      </div>

      <div className="rounded-xl overflow-hidden shadow-lg mb-4" style={{ height: '500px' }}>
        <MapContainer
          center={[selectedLocation.lat, selectedLocation.lon]}
          zoom={9}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapUpdater center={[selectedLocation.lat, selectedLocation.lon]} />
          <Marker position={[selectedLocation.lat, selectedLocation.lon]}>
            <Popup>
              <div className="text-center">
                <div className="font-bold">{selectedLocation.name}</div>
                {hourData && (
                  <div className="text-sm mt-1">
                    <div>🌡️ {hourData.temp}°C</div>
                    <div>💨 {hourData.windSpeed} км/ч</div>
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
          {hourData && <WindOverlay hourData={hourData} layerType={layerType} />}
        </MapContainer>
      </div>

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

          <div className="text-sm font-semibold text-[#34495E] dark:text-white min-w-[60px] text-right">
            {timeIndex + 1} / {maxHours}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm gap-3">
          <div className="flex items-center gap-2 text-[#34495E]/60 dark:text-white/60">
            <Icon name="Info" size={16} />
            <span>📍 — ваше местоположение. Перемещайте карту мышью или пальцем</span>
          </div>
          {layerType === 'wind' && (
            <div className="flex flex-wrap items-center gap-3 sm:gap-4">
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
