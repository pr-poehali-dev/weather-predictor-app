import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import Icon from '@/components/ui/icon';

interface GeomagneticNotificationsProps {
  settings: any;
  onSettingsChange: (settings: any) => void;
}

export default function GeomagneticNotifications({ settings, onSettingsChange }: GeomagneticNotificationsProps) {
  const getKIndexLabel = (k: number) => {
    if (k <= 2) return 'Спокойно';
    if (k <= 4) return 'Слабая буря';
    if (k <= 6) return 'Умеренная буря';
    return 'Сильная буря';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
          <Icon name="Activity" size={20} className="text-white" />
        </div>
        <div>
          <h4 className="font-semibold text-[#34495E] dark:text-white">Магнитные бури</h4>
          <p className="text-sm text-[#34495E]/60 dark:text-white/60">Уведомления о геомагнитной активности</p>
        </div>
      </div>

      <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
        <div className="flex items-center gap-3">
          <Icon name="Zap" size={18} className="text-purple-600 dark:text-purple-400" />
          <Label htmlFor="geomagnetic-enabled" className="text-sm font-medium cursor-pointer text-[#34495E] dark:text-white">
            Предупреждать о магнитных бурях
          </Label>
        </div>
        <Switch
          id="geomagnetic-enabled"
          checked={settings.geomagneticEnabled}
          onCheckedChange={(checked) => onSettingsChange({ ...settings, geomagneticEnabled: checked })}
        />
      </div>

      {settings.geomagneticEnabled && (
        <div className="p-4 bg-white/50 dark:bg-[#2a3f54]/30 rounded-lg border border-[#34495E]/10 dark:border-white/10">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-sm font-medium text-[#34495E] dark:text-white">
                  Уведомлять при K-индексе от {settings.minKIndex}
                </Label>
                <span className="text-sm font-bold px-3 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                  {getKIndexLabel(settings.minKIndex)}
                </span>
              </div>
              <Slider
                value={[settings.minKIndex]}
                min={0}
                max={9}
                step={1}
                onValueChange={([value]) => onSettingsChange({ ...settings, minKIndex: value })}
                className="mb-2"
              />
              <div className="flex justify-between text-xs text-[#34495E]/60 dark:text-white/60">
                <span>K=0 (спокойно)</span>
                <span>K=9 (экстремально)</span>
              </div>
            </div>

            <div className="pt-4 border-t border-[#34495E]/10 dark:border-white/10">
              <p className="text-xs text-[#34495E]/70 dark:text-white/70 mb-2">
                <Icon name="Info" size={14} className="inline mr-1" />
                <strong>Что такое K-индекс?</strong>
              </p>
              <div className="space-y-1 text-xs text-[#34495E]/60 dark:text-white/60">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span>K 0-2: Геомагнитное поле спокойное</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                  <span>K 3-4: Слабые возмущения поля</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span>K 5-6: Умеренная магнитная буря</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500"></div>
                  <span>K 7-9: Сильная геомагнитная буря</span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#34495E]/10 dark:border-white/10">
              <div className="flex items-start gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                <Icon name="Heart" size={16} className="text-purple-600 dark:text-purple-400 mt-0.5" />
                <div className="text-xs text-[#34495E]/80 dark:text-white/80">
                  <strong className="text-purple-700 dark:text-purple-300">Влияние на здоровье:</strong>
                  <br />
                  Магнитные бури могут вызывать головные боли, бессонницу, перепады давления и общее недомогание у метеочувствительных людей.
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
