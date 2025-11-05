import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import Icon from '@/components/ui/icon';

interface NotificationChannelsProps {
  settings: {
    emailEnabled: boolean;
    email: string;
    telegramEnabled: boolean;
    telegram: string;
  };
  onSettingsChange: (settings: any) => void;
  telegramBotUsername: string;
}

export default function NotificationChannels({ 
  settings, 
  onSettingsChange,
  telegramBotUsername 
}: NotificationChannelsProps) {
  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30">
          <div className="flex items-center gap-3">
            <Icon name="Mail" size={20} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
            <Label htmlFor="email-notifications" className="font-medium text-[#34495E] dark:text-white/90">
              Email уведомления
            </Label>
          </div>
          <Switch
            id="email-notifications"
            checked={settings.emailEnabled}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, emailEnabled: checked })}
          />
        </div>

        {settings.emailEnabled && (
          <div className="ml-4 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
            <Input
              type="email"
              placeholder="your@email.com"
              value={settings.email}
              onChange={(e) => onSettingsChange({ ...settings, email: e.target.value })}
              className="max-w-md"
            />
          </div>
        )}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#98D8C8]/30 to-[#4A90E2]/30 dark:from-[#98D8C8]/10 dark:to-[#4A90E2]/10">
          <div className="flex items-center gap-3">
            <Icon name="Send" size={20} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
            <Label htmlFor="telegram-notifications" className="font-medium text-[#34495E] dark:text-white/90">
              Telegram уведомления
            </Label>
          </div>
          <Switch
            id="telegram-notifications"
            checked={settings.telegramEnabled}
            onCheckedChange={(checked) => onSettingsChange({ ...settings, telegramEnabled: checked })}
          />
        </div>

        {settings.telegramEnabled && (
          <div className="ml-4 pl-4 border-l-2 border-[#4A90E2]/30 dark:border-[#4A90E2]/50 space-y-3">
            <div className="p-4 bg-[#4A90E2]/5 dark:bg-[#4A90E2]/10 rounded-lg border border-[#4A90E2]/20 dark:border-[#4A90E2]/30">
              <p className="text-sm text-[#34495E] dark:text-white/80 mb-3">
                <Icon name="Info" size={16} className="inline mr-2 text-[#4A90E2] dark:text-[#7EC8E3]" />
                Чтобы получать уведомления в Telegram:
              </p>
              <ol className="text-sm text-[#34495E]/80 dark:text-white/70 space-y-2 ml-6 list-decimal">
                <li>
                  Найдите бота{' '}
                  <a
                    href={`https://t.me/${telegramBotUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#4A90E2] dark:text-[#7EC8E3] hover:underline font-medium"
                  >
                    @{telegramBotUsername}
                  </a>
                </li>
                <li>Нажмите "Start" или отправьте команду <code className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-xs">/start</code></li>
                <li>Скопируйте ваш Telegram ID из ответа бота</li>
                <li>Вставьте ID в поле ниже</li>
              </ol>
            </div>
            
            <Input
              type="text"
              placeholder="Ваш Telegram ID"
              value={settings.telegram}
              onChange={(e) => onSettingsChange({ ...settings, telegram: e.target.value })}
              className="max-w-md"
            />
          </div>
        )}
      </div>
    </>
  );
}
