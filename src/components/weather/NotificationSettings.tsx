import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

export default function NotificationSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    email: '',
    telegram: '',
    emailEnabled: false,
    telegramEnabled: false,
    pollenHigh: true,
    pollenMedium: false,
    weatherAlert: true,
    dailyForecast: false
  });

  const handleSave = () => {
    if (settings.emailEnabled && !settings.email) {
      toast({
        title: '❌ Ошибка',
        description: 'Введите email для уведомлений',
        variant: 'destructive'
      });
      return;
    }

    if (settings.telegramEnabled && !settings.telegram) {
      toast({
        title: '❌ Ошибка',
        description: 'Введите Telegram ID для уведомлений',
        variant: 'destructive'
      });
      return;
    }

    localStorage.setItem('weatherNotifications', JSON.stringify(settings));
    
    toast({
      title: '✅ Настройки сохранены',
      description: 'Вы будете получать уведомления при опасных уровнях пыльцы',
    });
  };

  return (
    <Card className="p-6 bg-white/95 backdrop-blur-sm border-0 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 rounded-lg bg-gradient-to-br from-[#4A90E2] to-[#98D8C8]">
          <Icon name="Bell" size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-[#34495E]">Уведомления</h3>
          <p className="text-sm text-[#34495E]/60">Настройте оповещения о погоде и аллергенах</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100">
            <div className="flex items-center gap-3">
              <Icon name="Mail" size={20} className="text-[#4A90E2]" />
              <Label htmlFor="email-notifications" className="font-medium text-[#34495E]">
                Email уведомления
              </Label>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, emailEnabled: checked })}
            />
          </div>

          {settings.emailEnabled && (
            <div className="ml-4 pl-4 border-l-2 border-blue-200">
              <Input
                type="email"
                placeholder="your@email.com"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="max-w-md"
              />
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#98D8C8]/30 to-[#4A90E2]/30">
            <div className="flex items-center gap-3">
              <Icon name="Send" size={20} className="text-[#4A90E2]" />
              <Label htmlFor="telegram-notifications" className="font-medium text-[#34495E]">
                Telegram уведомления
              </Label>
            </div>
            <Switch
              id="telegram-notifications"
              checked={settings.telegramEnabled}
              onCheckedChange={(checked) => setSettings({ ...settings, telegramEnabled: checked })}
            />
          </div>

          {settings.telegramEnabled && (
            <div className="ml-4 pl-4 border-l-2 border-[#98D8C8]">
              <Input
                type="text"
                placeholder="@username или Chat ID"
                value={settings.telegram}
                onChange={(e) => setSettings({ ...settings, telegram: e.target.value })}
                className="max-w-md"
              />
              <p className="text-xs text-[#34495E]/60 mt-2">
                Для получения Chat ID напишите боту @userinfobot
              </p>
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[#34495E]/10">
          <h4 className="font-semibold text-[#34495E] mb-4">Типы уведомлений</h4>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon name="AlertTriangle" size={18} className="text-red-500" />
                <div>
                  <div className="font-medium text-[#34495E]">Высокий уровень пыльцы</div>
                  <div className="text-xs text-[#34495E]/60">Индекс {'>'} 9.0</div>
                </div>
              </div>
              <Switch
                checked={settings.pollenHigh}
                onCheckedChange={(checked) => setSettings({ ...settings, pollenHigh: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-yellow-50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon name="AlertCircle" size={18} className="text-yellow-600" />
                <div>
                  <div className="font-medium text-[#34495E]">Средний уровень пыльцы</div>
                  <div className="text-xs text-[#34495E]/60">Индекс 4.0-9.0</div>
                </div>
              </div>
              <Switch
                checked={settings.pollenMedium}
                onCheckedChange={(checked) => setSettings({ ...settings, pollenMedium: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-orange-50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon name="CloudRain" size={18} className="text-orange-600" />
                <div>
                  <div className="font-medium text-[#34495E]">Экстремальная погода</div>
                  <div className="text-xs text-[#34495E]/60">Штормы, метели, ураганы</div>
                </div>
              </div>
              <Switch
                checked={settings.weatherAlert}
                onCheckedChange={(checked) => setSettings({ ...settings, weatherAlert: checked })}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-blue-50 transition-colors">
              <div className="flex items-center gap-3">
                <Icon name="Calendar" size={18} className="text-blue-600" />
                <div>
                  <div className="font-medium text-[#34495E]">Ежедневный прогноз</div>
                  <div className="text-xs text-[#34495E]/60">Каждое утро в 8:00</div>
                </div>
              </div>
              <Switch
                checked={settings.dailyForecast}
                onCheckedChange={(checked) => setSettings({ ...settings, dailyForecast: checked })}
              />
            </div>
          </div>
        </div>

        <Button 
          onClick={handleSave}
          className="w-full bg-gradient-to-r from-[#4A90E2] to-[#98D8C8] hover:opacity-90"
        >
          <Icon name="Save" size={18} className="mr-2" />
          Сохранить настройки
        </Button>
      </div>
    </Card>
  );
}
