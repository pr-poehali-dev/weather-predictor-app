import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DailyForecastSettingsProps {
  enabled: boolean;
  time: string;
  onEnabledChange: (enabled: boolean) => void;
  onTimeChange: (time: string) => void;
}

export default function DailyForecastSettings({
  enabled,
  time,
  onEnabledChange,
  onTimeChange
}: DailyForecastSettingsProps) {
  return (
    <div className="space-y-3 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg border-2 border-green-200 dark:border-green-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Sun" size={18} className="text-green-600 dark:text-green-400" />
          <Label className="font-medium text-[#34495E] dark:text-white">Ежедневный прогноз погоды</Label>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>
      
      {enabled && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3">
            <Icon name="Clock" size={16} className="text-green-600 dark:text-green-400" />
            <span className="text-sm text-[#34495E]/70 dark:text-white/70">Время отправки:</span>
            <Input
              type="time"
              value={time}
              onChange={(e) => onTimeChange(e.target.value)}
              className="w-32"
            />
          </div>
          <p className="text-xs text-[#34495E]/60 dark:text-white/60 ml-6">
            Прогноз на день будет приходить каждое утро в указанное время
          </p>
        </div>
      )}
    </div>
  );
}
