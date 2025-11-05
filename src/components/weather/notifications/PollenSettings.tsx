import Icon from '@/components/ui/icon';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const POLLEN_TYPES = [
  { id: 'birch', label: 'Берёза', icon: 'TreeDeciduous' },
  { id: 'grass', label: 'Злаковые травы', icon: 'Wheat' },
  { id: 'ragweed', label: 'Амброзия', icon: 'Flower2' },
  { id: 'tree', label: 'Деревья', icon: 'Trees' },
  { id: 'weed', label: 'Сорные травы', icon: 'Sprout' },
];

interface PollenSettingsProps {
  pollenHigh: boolean;
  pollenMedium: boolean;
  pollenTypes: Record<string, boolean>;
  onPollenHighChange: (enabled: boolean) => void;
  onPollenMediumChange: (enabled: boolean) => void;
  onPollenTypeChange: (id: string, enabled: boolean) => void;
}

export default function PollenSettings({
  pollenHigh,
  pollenMedium,
  pollenTypes,
  onPollenHighChange,
  onPollenMediumChange,
  onPollenTypeChange
}: PollenSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 p-4 rounded-lg border-2 border-amber-200 dark:border-amber-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="AlertTriangle" size={18} className="text-amber-600 dark:text-amber-400" />
            <Label className="font-medium text-[#34495E] dark:text-white">Высокий уровень пыльцы</Label>
          </div>
          <Switch
            checked={pollenHigh}
            onCheckedChange={onPollenHighChange}
          />
        </div>
        <p className="text-xs text-[#34495E]/60 dark:text-white/60 ml-6">Индекс {'>'} 9.0</p>
      </div>

      <div className="space-y-3 bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 p-4 rounded-lg border-2 border-yellow-200 dark:border-yellow-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="AlertCircle" size={18} className="text-yellow-600 dark:text-yellow-400" />
            <Label className="font-medium text-[#34495E] dark:text-white">Средний уровень пыльцы</Label>
          </div>
          <Switch
            checked={pollenMedium}
            onCheckedChange={onPollenMediumChange}
          />
        </div>
        <p className="text-xs text-[#34495E]/60 dark:text-white/60 ml-6">Индекс 4.0–9.0</p>
      </div>

      {(pollenHigh || pollenMedium) && (
        <div className="ml-4 pl-4 border-l-2 border-amber-300 dark:border-amber-700 space-y-3">
          <p className="text-sm font-medium text-[#34495E] dark:text-white mb-2">Выберите аллергены:</p>
          <div className="grid grid-cols-1 gap-2">
            {POLLEN_TYPES.map((pollen) => (
              <div 
                key={pollen.id}
                className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-[#1e2936] hover:bg-amber-50 dark:hover:bg-amber-900/20 transition-colors border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-center gap-2">
                  <Icon name={pollen.icon} size={16} className="text-amber-600 dark:text-amber-400" />
                  <span className="text-sm text-[#34495E] dark:text-white">{pollen.label}</span>
                </div>
                <Switch
                  checked={pollenTypes[pollen.id]}
                  onCheckedChange={(checked) => onPollenTypeChange(pollen.id, checked)}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
