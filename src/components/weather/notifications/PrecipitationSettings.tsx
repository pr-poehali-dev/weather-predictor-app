import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface PrecipitationSettingsProps {
  enabled: boolean;
  minPrecipitation: number;
  onEnabledChange: (enabled: boolean) => void;
  onMinPrecipitationChange: (value: number) => void;
}

export default function PrecipitationSettings({
  enabled,
  minPrecipitation,
  onEnabledChange,
  onMinPrecipitationChange
}: PrecipitationSettingsProps) {
  const getPrecipitationLabel = (value: number) => {
    if (value < 1) return 'Слабый дождь';
    if (value < 3) return 'Умеренный дождь';
    if (value < 6) return 'Сильный дождь';
    return 'Очень сильный дождь';
  };

  return (
    <div className="space-y-3 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 p-4 rounded-lg border-2 border-blue-200 dark:border-blue-700">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="CloudRain" size={18} className="text-blue-600 dark:text-blue-400" />
          <Label className="font-medium text-[#34495E] dark:text-white">Осадки</Label>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>
      
      {enabled && (
        <div className="mt-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-[#34495E]/70 dark:text-white/70">Минимальное количество осадков:</span>
            <span className="font-medium text-[#34495E] dark:text-white">{minPrecipitation} мм</span>
          </div>
          <Slider
            value={[minPrecipitation]}
            onValueChange={(value) => onMinPrecipitationChange(value[0])}
            min={0.1}
            max={10}
            step={0.1}
            className="w-full"
          />
          <p className="text-xs text-[#34495E]/60 dark:text-white/60">
            {getPrecipitationLabel(minPrecipitation)}
          </p>
        </div>
      )}
    </div>
  );
}
