import Icon from '@/components/ui/icon';

interface BotStatusBadgeProps {
  status: 'checking' | 'active' | 'inactive' | 'error';
  botInfo: { username?: string; name?: string } | null;
  onRefresh: () => void;
}

export default function BotStatusBadge({ status, botInfo, onRefresh }: BotStatusBadgeProps) {
  const getStatusDisplay = () => {
    switch (status) {
      case 'checking':
        return { color: 'bg-gray-400', text: 'Проверка...', icon: 'RefreshCw' as const };
      case 'active':
        return { color: 'bg-green-500', text: `Бот активен${botInfo?.username ? ` (@${botInfo.username})` : ''}`, icon: 'CheckCircle2' as const };
      case 'inactive':
        return { color: 'bg-yellow-500', text: 'Бот не настроен', icon: 'AlertCircle' as const };
      case 'error':
        return { color: 'bg-red-500', text: 'Ошибка подключения', icon: 'XCircle' as const };
    }
  };

  const statusDisplay = getStatusDisplay();

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-[#1e2936] border-2 border-gray-200 dark:border-gray-700">
      <div className={`w-2 h-2 rounded-full ${statusDisplay.color} ${status === 'checking' ? 'animate-pulse' : ''}`} />
      <Icon name={statusDisplay.icon} size={14} className="text-[#34495E]/70 dark:text-white/70" />
      <span className="text-xs font-medium text-[#34495E] dark:text-white">{statusDisplay.text}</span>
      <button 
        onClick={onRefresh}
        className="ml-1 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
        title="Обновить статус"
      >
        <Icon name="RefreshCw" size={12} className="text-[#34495E]/50 dark:text-white/50" />
      </button>
    </div>
  );
}
