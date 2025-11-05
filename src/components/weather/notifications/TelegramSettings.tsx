import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface TelegramSettingsProps {
  enabled: boolean;
  telegramId: string;
  botUsername: string;
  onEnabledChange: (enabled: boolean) => void;
  onTelegramIdChange: (id: string) => void;
}

export default function TelegramSettings({ 
  enabled, 
  telegramId, 
  botUsername,
  onEnabledChange, 
  onTelegramIdChange 
}: TelegramSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-[#98D8C8]/30 to-[#4A90E2]/30 dark:from-[#98D8C8]/20 dark:to-[#4A90E2]/20">
        <div className="flex items-center gap-3">
          <Icon name="Send" size={20} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
          <Label htmlFor="telegram-notifications" className="font-medium text-[#34495E] dark:text-white">
            Telegram уведомления
          </Label>
        </div>
        <Switch
          id="telegram-notifications"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {enabled && (
        <div className="ml-4 pl-4 border-l-2 border-[#98D8C8] dark:border-[#98D8C8]/50 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <p className="text-sm text-[#34495E] dark:text-white mb-3 flex items-center gap-2">
              <Icon name="Info" size={16} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
              <span className="font-medium">Как получить Telegram ID:</span>
            </p>
            <ol className="text-sm text-[#34495E]/80 dark:text-white/70 space-y-2 ml-6 list-decimal">
              <li>
                Откройте бота{' '}
                <a 
                  href={`https://t.me/${botUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4A90E2] dark:text-[#7EC8E3] hover:underline font-medium"
                >
                  @{botUsername}
                </a>
              </li>
              <li>Нажмите <strong>Start</strong> или отправьте команду <code className="px-1.5 py-0.5 bg-white dark:bg-gray-800 rounded text-xs">/start</code></li>
              <li>Бот пришлет ваш ID — скопируйте его и вставьте ниже</li>
            </ol>
          </div>
          
          <Input
            type="text"
            placeholder="Ваш Telegram ID (например: 123456789)"
            value={telegramId}
            onChange={(e) => onTelegramIdChange(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}
    </div>
  );
}
