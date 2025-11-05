import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface EmailSettingsProps {
  enabled: boolean;
  email: string;
  onEnabledChange: (enabled: boolean) => void;
  onEmailChange: (email: string) => void;
}

export default function EmailSettings({ enabled, email, onEnabledChange, onEmailChange }: EmailSettingsProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
        <div className="flex items-center gap-3">
          <Icon name="Mail" size={20} className="text-[#4A90E2] dark:text-[#7EC8E3]" />
          <Label htmlFor="email-notifications" className="font-medium text-[#34495E] dark:text-white">
            Email уведомления
          </Label>
        </div>
        <Switch
          id="email-notifications"
          checked={enabled}
          onCheckedChange={onEnabledChange}
        />
      </div>

      {enabled && (
        <div className="ml-4 pl-4 border-l-2 border-blue-200 dark:border-blue-700">
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => onEmailChange(e.target.value)}
            className="max-w-md"
          />
        </div>
      )}
    </div>
  );
}
