import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface PressureSettingsProps {
  enabled: boolean;
  minPressure: number;
  maxPressure: number;
  onEnabledChange: (enabled: boolean) => void;
  onMinPressureChange: (value: number) => void;
  onMaxPressureChange: (value: number) => void;
}

export default function PressureSettings({
  enabled,
  minPressure,
  maxPressure,
  onEnabledChange,
  onMinPressureChange,
  onMaxPressureChange
}: PressureSettingsProps) {
  return (
    <div className="space-y-3 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 p-4 rounded-lg border-2 border-purple-200 dark:border-purple-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Gauge" size={18} className="text-purple-600 dark:text-purple-400" />
          <Label className="font-medium text-[#34495E] dark:text-white">Атмосферное давление</Label>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>
      
      {enabled && (
        <div className="mt-4 space-y-4">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#34495E]/70 dark:text-white/70">Минимальное давление:</span>
              <span className="font-medium text-[#34495E] dark:text-white">{minPressure} мм рт.ст.</span>
            </div>
            <Slider
              value={[minPressure]}
              onValueChange={(value) => onMinPressureChange(value[0])}
              min={700}
              max={780}
              step={5}
              className="w-full"
            />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-[#34495E]/70 dark:text-white/70">Максимальное давление:</span>
              <span className="font-medium text-[#34495E] dark:text-white">{maxPressure} мм рт.ст.</span>
            </div>
            <Slider
              value={[maxPressure]}
              onValueChange={(value) => onMaxPressureChange(value[0])}
              min={700}
              max={780}
              step={5}
              className="w-full"
            />
          </div>
          
          <p className="text-xs text-[#34495E]/60 dark:text-white/60 bg-purple-100 dark:bg-purple-900/30 p-3 rounded-lg">
            <Icon name="Info" size={14} className="inline mr-1" />
            Уведомление придёт, если давление выйдет за указанные границы
          </p>
        </div>
      )}
    </div>
  );
}
