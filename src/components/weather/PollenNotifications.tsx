import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';

const POLLEN_TYPES = [
  { id: 'birch', label: 'Берёза', icon: 'TreeDeciduous' },
  { id: 'grass', label: 'Злаковые травы', icon: 'Wheat' },
  { id: 'ragweed', label: 'Амброзия', icon: 'Flower2' },
  { id: 'tree', label: 'Деревья', icon: 'Trees' },
  { id: 'weed', label: 'Сорные травы', icon: 'Sprout' },
];

interface PollenNotificationsProps {
  settings: {
    pollenHigh: boolean;
    pollenMedium: boolean;
    pollenTypes: {
      birch: boolean;
      grass: boolean;
      ragweed: boolean;
      tree: boolean;
      weed: boolean;
    };
  };
  onSettingsChange: (settings: any) => void;
}

export default function PollenNotifications({ settings, onSettingsChange }: PollenNotificationsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon name="Flower2" size={20} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
        <h4 className="font-semibold text-[#34495E] dark:text-white/90">Уведомления об аллергенах</h4>
      </div>

      <div className="space-y-3 ml-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-950/20">
          <Label htmlFor="pollen-high" className="text-sm font-medium text-[#34495E] dark:text-white/90">
            Высокий уровень пыльцы
          </Label>
          <Switch
            id="pollen-high"
            checked={settings.pollenHigh}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, pollenHigh: checked })}
          />
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950/20">
          <Label htmlFor="pollen-medium" className="text-sm font-medium text-[#34495E] dark:text-white/90">
            Средний уровень пыльцы
          </Label>
          <Switch
            id="pollen-medium"
            checked={settings.pollenMedium}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, pollenMedium: checked })}
          />
        </div>

        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-[#34495E] dark:text-white/90 mb-3">Типы аллергенов:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {POLLEN_TYPES.map((type) => (
              <div
                key={type.id}
                className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-[#98D8C8]/20 to-[#4A90E2]/20 dark:from-[#98D8C8]/10 dark:to-[#4A90E2]/10"
              >
                <div className="flex items-center gap-2">
                  <Icon name={type.icon} size={16} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
                  <Label htmlFor={`pollen-${type.id}`} className="text-sm text-[#34495E] dark:text-white/80">
                    {type.label}
                  </Label>
                </div>
                <Switch
                  id={`pollen-${type.id}`}
                  checked={settings.pollenTypes[type.id as keyof typeof settings.pollenTypes]}
                  onCheckedChange={(checked) =>
                    onSettingsChange({
                      ...settings,
                      pollenTypes: { ...settings.pollenTypes, [type.id]: checked },
                    })
                  }
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
