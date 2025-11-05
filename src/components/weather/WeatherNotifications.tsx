import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface WeatherNotificationsProps {
  settings: {
    weatherAlert: boolean;
    precipitationEnabled: boolean;
    minPrecipitation: number;
    pressureEnabled: boolean;
    minPressure: number;
    maxPressure: number;
    dailyForecast: boolean;
    dailyForecastTime: string;
  };
  onSettingsChange: (settings: any) => void;
}

export default function WeatherNotifications({ settings, onSettingsChange }: WeatherNotificationsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Cloud" size={20} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
        <h4 className="font-semibold text-[#34495E] dark:text-white/90">Погодные уведомления</h4>
      </div>

      <div className="space-y-3 ml-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-orange-50 dark:bg-orange-950/20">
          <div className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={16} className="text-orange-500 dark:text-orange-400" />
            <Label htmlFor="weather-alert" className="text-sm font-medium text-[#34495E] dark:text-white/90">
              Экстремальные погодные условия
            </Label>
          </div>
          <Switch
            id="weather-alert"
            checked={settings.weatherAlert}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, weatherAlert: checked })}
          />
        </div>

        <div className="space-y-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="CloudRain" size={16} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
              <Label htmlFor="precipitation" className="text-sm font-medium text-[#34495E] dark:text-white/90">
                Уведомления об осадках
              </Label>
            </div>
            <Switch
              id="precipitation"
              checked={settings.precipitationEnabled}
              onCheckedChange={(checked) => onSettingsChange({ ...settings, precipitationEnabled: checked })}
            />
          </div>

          {settings.precipitationEnabled && (
            <div className="ml-6 space-y-2">
              <Label className="text-sm text-[#34495E]/80 dark:text-white/70">
                Минимальное количество: {settings.minPrecipitation} мм
              </Label>
              <Slider
                value={[settings.minPrecipitation]}
                onValueChange={([value]) => onSettingsChange({ ...settings, minPrecipitation: value })}
                min={0.1}
                max={10}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
        </div>

        <div className="space-y-3 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Gauge" size={16} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
              <Label htmlFor="pressure" className="text-sm font-medium text-[#34495E] dark:text-white/90">
                Уведомления о давлении
              </Label>
            </div>
            <Switch
              id="pressure"
              checked={settings.pressureEnabled}
              onCheckedChange={(checked) => onSettingsChange({ ...settings, pressureEnabled: checked })}
            />
          </div>

          {settings.pressureEnabled && (
            <div className="ml-6 space-y-3">
              <div className="space-y-2">
                <Label className="text-sm text-[#34495E]/80 dark:text-white/70">
                  Минимальное: {settings.minPressure} мм рт. ст.
                </Label>
                <Slider
                  value={[settings.minPressure]}
                  onValueChange={([value]) => onSettingsChange({ ...settings, minPressure: value })}
                  min={700}
                  max={800}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm text-[#34495E]/80 dark:text-white/70">
                  Максимальное: {settings.maxPressure} мм рт. ст.
                </Label>
                <Slider
                  value={[settings.maxPressure]}
                  onValueChange={([value]) => onSettingsChange({ ...settings, maxPressure: value })}
                  min={700}
                  max={800}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3 p-4 rounded-lg bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20 dark:from-[#98D8C8]/10 dark:to-[#4A90E2]/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon name="Calendar" size={16} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
              <Label htmlFor="daily-forecast" className="text-sm font-medium text-[#34495E] dark:text-white/90">
                Ежедневный прогноз
              </Label>
            </div>
            <Switch
              id="daily-forecast"
              checked={settings.dailyForecast}
              onCheckedChange={(checked) => onSettingsChange({ ...settings, dailyForecast: checked })}
            />
          </div>

          {settings.dailyForecast && (
            <div className="ml-6">
              <Label className="text-sm text-[#34495E]/80 dark:text-white/70 mb-2 block">Время отправки:</Label>
              <Input
                type="time"
                value={settings.dailyForecastTime}
                onChange={(e) => onSettingsChange({ ...settings, dailyForecastTime: e.target.value })}
                className="max-w-[150px]"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
