import { useEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Icon from '@/components/ui/icon';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

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
  const [layerType, setLayerType] = useState<'wind' | 'rain'>('wind');
  const [zoom, setZoom] = useState(8);
  const zoomTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mapCenter, setMapCenter] = useState({ lat: selectedLocation.lat, lon: selectedLocation.lon });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mapImageRef = useRef<HTMLImageElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);

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
    const tileSize = 256;
    const scale = Math.pow(2, zoom);
    const worldSize = tileSize * scale;
    
    const lon = mapCenter.lon;
    const lat = mapCenter.lat;
    
    const x = ((lon + 180) / 360) * worldSize;
    const latRad = (lat * Math.PI) / 180;
    const y = ((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2) * worldSize;
    
    const mapUrl = `https://tile.openstreetmap.org/${zoom}/${Math.floor(x / tileSize)}/${Math.floor(y / tileSize)}.png`;
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = mapUrl;
    img.onload = () => {
      mapImageRef.current = img;
    };
  }, [mapCenter, zoom]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;

    const scale = Math.pow(2, zoom);
    const lonDelta = -(dx / scale) * 0.5;
    const latDelta = (dy / scale) * 0.5;

    setMapCenter(prev => ({
      lat: Math.max(-85, Math.min(85, prev.lat + latDelta)),
      lon: prev.lon + lonDelta
    }));

    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    const newZoom = Math.max(3, Math.min(15, zoom + delta));
    
    if (zoomTimeoutRef.current) {
      clearTimeout(zoomTimeoutRef.current);
    }
    
    zoomTimeoutRef.current = setTimeout(() => {
      setZoom(newZoom);
    }, 50);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const hourData = weatherData?.hourly?.[timeIndex];
    if (!hourData) return;

    const baseWindSpeed = hourData.windSpeed || 10;
    const baseWindDeg = hourData.windDirection || 0;
    const rain = hourData.rain || 0;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 100; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: 0,
          vy: 0,
          life: Math.random() * 100,
          maxLife: 100 + Math.random() * 50
        });
      }
    }

    const animate = () => {
      const isDark = document.documentElement.classList.contains('dark');
      const bgColor = isDark ? '#1a2332' : '#E8F4FD';
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      if (mapImageRef.current) {
        ctx.globalAlpha = isDark ? 0.6 : 0.5;
        ctx.drawImage(mapImageRef.current, 0, 0, canvas.width, canvas.height);
        ctx.globalAlpha = 1.0;
      }
      ctx.strokeStyle = isDark ? 'rgba(255, 255, 255, 0.15)' : 'rgba(100, 100, 100, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < canvas.width; i += 50) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, canvas.height);
        ctx.stroke();
      }
      for (let i = 0; i < canvas.height; i += 50) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(canvas.width, i);
        ctx.stroke();
      }

      if (layerType === 'wind') {
        particlesRef.current.forEach((particle) => {
          const dx = particle.x - centerX;
          const dy = particle.y - centerY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          const variation = Math.sin(particle.x * 0.01) * 20 + Math.cos(particle.y * 0.01) * 20;
          const windDeg = baseWindDeg + variation;
          const windSpeed = baseWindSpeed * (1 + Math.sin(distance * 0.01) * 0.3);
          
          const angleRad = (windDeg - 90) * (Math.PI / 180);
          particle.vx = Math.cos(angleRad) * windSpeed * 0.5;
          particle.vy = Math.sin(angleRad) * windSpeed * 0.5;

          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life++;

          if (particle.x < 0 || particle.x > canvas.width || 
              particle.y < 0 || particle.y > canvas.height || 
              particle.life > particle.maxLife) {
            particle.x = Math.random() * canvas.width;
            particle.y = Math.random() * canvas.height;
            particle.life = 0;
          }

          const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
          const color = speed > 15 ? 'rgba(231, 76, 60, 0.6)' : 
                       speed > 7 ? 'rgba(243, 156, 18, 0.6)' : 
                       'rgba(74, 144, 226, 0.6)';
          
          const alpha = Math.min(particle.life / 20, 1) * (1 - particle.life / particle.maxLife);
          
          ctx.strokeStyle = color.replace('0.6', String(alpha * 0.8));
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(particle.x - particle.vx * 3, particle.y - particle.vy * 3);
          ctx.stroke();
        });
      } else if (layerType === 'rain' && rain > 0) {
        particlesRef.current.forEach((particle) => {
          particle.vx = Math.sin(particle.x * 0.02) * 0.5;
          particle.vy = 5 + rain * 0.5;

          particle.x += particle.vx;
          particle.y += particle.vy;
          particle.life++;

          if (particle.y > canvas.height || particle.life > particle.maxLife) {
            particle.x = Math.random() * canvas.width;
            particle.y = 0;
            particle.life = 0;
          }

          const alpha = Math.min(particle.life / 20, 1) * (1 - particle.life / particle.maxLife);
          
          ctx.fillStyle = `rgba(74, 144, 226, ${alpha * 0.6})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
          ctx.fill();
        });
      }

      ctx.shadowColor = isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.9)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 0;
      ctx.shadowOffsetY = 2;
      
      ctx.font = '40px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('📍', centerX, centerY);

      ctx.font = 'bold 16px Arial';
      ctx.fillStyle = isDark ? '#ffffff' : '#34495E';
      ctx.fillText(selectedLocation.name, centerX, centerY + 50);
      
      ctx.font = '12px Arial';
      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(52, 73, 94, 0.8)';
      ctx.fillText(`${mapCenter.lat.toFixed(4)}°N, ${mapCenter.lon.toFixed(4)}°E`, centerX, centerY + 70);
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      animationRef.current = requestAnimationFrame(animate);
    };

    ctx.fillStyle = '#E8F4FD';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [timeIndex, layerType, weatherData, selectedLocation]);

  const currentTime = weatherData?.hourly?.[timeIndex]?.time || 'Загрузка...';

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

      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={500}
          className="w-full h-auto max-h-[500px] rounded-xl shadow-lg mb-4 bg-[#E8F4FD] dark:bg-[#2a3f5f] cursor-move touch-none"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onWheel={handleWheel}
          onTouchStart={(e) => {
            if (e.touches.length === 1) {
              const touch = e.touches[0];
              setIsDragging(true);
              setDragStart({ x: touch.clientX, y: touch.clientY });
            }
          }}
          onTouchMove={(e) => {
            if (e.touches.length === 1 && isDragging) {
              e.preventDefault();
              const touch = e.touches[0];
              const dx = touch.clientX - dragStart.x;
              const dy = touch.clientY - dragStart.y;
              const scale = Math.pow(2, zoom);
              const lonDelta = -(dx / scale) * 0.5;
              const latDelta = (dy / scale) * 0.5;
              setMapCenter(prev => ({
                lat: Math.max(-85, Math.min(85, prev.lat + latDelta)),
                lon: prev.lon + lonDelta
              }));
              setDragStart({ x: touch.clientX, y: touch.clientY });
            }
          }}
          onTouchEnd={() => setIsDragging(false)}
        />
        <div className="absolute top-4 right-4 flex flex-col gap-2">
          <Button
            variant="secondary"
            size="icon"
            onTouchStart={(e) => { e.stopPropagation(); setZoom(prev => Math.min(15, prev + 1)); }}
            onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.min(15, prev + 1)); }}
            className="bg-white/90 dark:bg-[#1e2936]/90 text-[#34495E] dark:text-white shadow-lg hover:bg-white dark:hover:bg-[#1e2936] border border-gray-300 dark:border-gray-700 touch-none"
          >
            <Icon name="Plus" size={20} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onTouchStart={(e) => { e.stopPropagation(); setZoom(prev => Math.max(3, prev - 1)); }}
            onClick={(e) => { e.stopPropagation(); setZoom(prev => Math.max(3, prev - 1)); }}
            className="bg-white/90 dark:bg-[#1e2936]/90 text-[#34495E] dark:text-white shadow-lg hover:bg-white dark:hover:bg-[#1e2936] border border-gray-300 dark:border-gray-700 touch-none"
          >
            <Icon name="Minus" size={20} />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onTouchStart={(e) => {
              e.stopPropagation();
              setMapCenter({ lat: selectedLocation.lat, lon: selectedLocation.lon });
              setZoom(8);
            }}
            onClick={(e) => {
              e.stopPropagation();
              setMapCenter({ lat: selectedLocation.lat, lon: selectedLocation.lon });
              setZoom(8);
            }}
            className="bg-white/90 dark:bg-[#1e2936]/90 text-[#34495E] dark:text-white shadow-lg hover:bg-white dark:hover:bg-[#1e2936] border border-gray-300 dark:border-gray-700 touch-none"
          >
            <Icon name="MapPin" size={20} />
          </Button>
        </div>
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
            <span>📍 — ваше местоположение</span>
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