import json
import os
from typing import Dict, Any
import urllib.request

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Telegram бот для настройки уведомлений о погоде и пыльце
    Args: event - dict с httpMethod, body (webhook от Telegram)
          context - object с request_id
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'POST')
    query_params = event.get('queryStringParameters', {})
    
    print(f'Telegram bot request: method={method}, query={query_params}')
    
    # Setup webhook
    if method == 'GET' and query_params.get('action') == 'set-webhook':
        return setup_webhook()
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    body_data = json.loads(event.get('body', '{}'))
    print(f'Received webhook data: {json.dumps(body_data)}')
    
    # Обработка webhook от Telegram
    if 'message' in body_data:
        message = body_data['message']
        chat_id = message['chat']['id']
        text = message.get('text', '')
        
        print(f'Processing message from {chat_id}: {text}')
        response_text = handle_command(text, chat_id)
        print(f'Sending response: {response_text[:50]}...')
        result = send_message(chat_id, response_text)
        print(f'Message sent: {result}')
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'ok': True}),
        'isBase64Encoded': False
    }

def handle_command(text: str, chat_id: int) -> str:
    '''Обработка команд бота'''
    
    if text.startswith('/start'):
        return '''🐺 *Привет! Я Волк-синоптик!*

Я помогу настроить уведомления о погоде и пыльце.

*Доступные команды:*
/subscribe - Подписаться на уведомления
/unsubscribe - Отписаться от уведомлений
/settings - Мои настройки
/email - Добавить email для уведомлений
/help - Помощь

Ваш Chat ID: `{}`

Скопируйте его и укажите в настройках на сайте!'''.format(chat_id)
    
    elif text.startswith('/subscribe'):
        # Здесь можно сохранять подписку в БД
        return '''✅ *Вы подписаны на уведомления!*

Теперь я буду присылать вам:
🌡️ Ежедневный прогноз погоды
🌸 Уровень пыльцы (при высоких значениях)
⚡ Важные погодные предупреждения

Для настройки подробных параметров используйте веб-интерфейс.'''
    
    elif text.startswith('/unsubscribe'):
        return '''❌ *Вы отписаны от уведомлений*

Чтобы снова подписаться, используйте /subscribe'''
    
    elif text.startswith('/settings'):
        return '''⚙️ *Ваши настройки:*

Chat ID: `{}`
Статус: Подписан ✅

Для изменения настроек используйте веб-интерфейс или команды:
/email - Добавить email
/unsubscribe - Отписаться'''.format(chat_id)
    
    elif text.startswith('/email'):
        parts = text.split(' ', 1)
        if len(parts) > 1:
            email = parts[1]
            # Здесь можно сохранять email в БД
            return f'''📧 *Email добавлен!*

Теперь уведомления будут приходить на:
• Telegram: `{chat_id}`
• Email: `{email}`'''
        else:
            return '''📧 *Добавление email*

Используйте: `/email your@email.com`

Пример: `/email ivan@gmail.com`'''
    
    elif text.startswith('/help'):
        return '''❓ *Справка*

*Основные команды:*
/subscribe - Подписаться на уведомления
/unsubscribe - Отписаться
/email - Добавить email
/settings - Посмотреть настройки

*Типы уведомлений:*
🌡️ Ежедневный прогноз
🌸 Уровень пыльцы
⚡ Погодные предупреждения

*Нужна помощь?*
Используйте веб-интерфейс для детальной настройки'''
    
    else:
        return '''🤔 Не понял команду.

Используйте /help для списка команд или /start для начала.'''

def setup_webhook() -> Dict[str, Any]:
    '''Настройка webhook для Telegram бота'''
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    if not bot_token:
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'TELEGRAM_BOT_TOKEN not configured'}),
            'isBase64Encoded': False
        }
    
    webhook_url = 'https://functions.poehali.dev/f03fce2f-ec26-44b9-8491-2ec4d99f6a01'
    url = f'https://api.telegram.org/bot{bot_token}/setWebhook'
    
    data = {
        'url': webhook_url,
        'allowed_updates': ['message'],
        'drop_pending_updates': True
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f'Webhook setup result: {result}')
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'success': result.get('ok', False),
                    'webhook_url': webhook_url,
                    'result': result
                }),
                'isBase64Encoded': False
            }
    except Exception as e:
        print(f'Webhook setup error: {str(e)}')
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e)}),
            'isBase64Encoded': False
        }

def send_message(chat_id: int, text: str) -> bool:
    '''Отправка сообщения в Telegram'''
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    if not bot_token:
        print('TELEGRAM_BOT_TOKEN not configured')
        return False
    
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': text,
        'parse_mode': 'Markdown'
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=json.dumps(data).encode('utf-8'),
            headers={'Content-Type': 'application/json'}
        )
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            print(f'Send message result: {result}')
            return result.get('ok', False)
    except Exception as e:
        print(f'Send message error: {str(e)}')
        return False