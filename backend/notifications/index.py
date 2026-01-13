import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
import urllib.request
import urllib.parse

def check_bot_status() -> Dict[str, Any]:
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    if not bot_token:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'active': False, 'reason': 'Token not configured'}),
            'isBase64Encoded': False
        }
    
    try:
        url = f'https://api.telegram.org/bot{bot_token}/getMe'
        req = urllib.request.Request(url)
        
        with urllib.request.urlopen(req, timeout=5) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('ok'):
                bot_info = result.get('result', {})
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({
                        'active': True,
                        'bot': {
                            'username': bot_info.get('username'),
                            'name': bot_info.get('first_name'),
                            'id': bot_info.get('id')
                        }
                    }),
                    'isBase64Encoded': False
                }
            else:
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'active': False, 'reason': 'Invalid token'}),
                    'isBase64Encoded': False
                }
    except Exception as e:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'active': False, 'reason': str(e)}),
            'isBase64Encoded': False
        }

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Отправка уведомлений о погоде и пыльце через Email и Telegram, проверка статуса бота
    Args: event - dict с httpMethod, body (email, telegram, message, type), pathParams
          context - object с request_id
    Returns: HTTP response dict
    '''
    method: str = event.get('httpMethod', 'POST')
    query_params = event.get('queryStringParameters', {})
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'GET' and query_params.get('action') == 'bot-status':
        return check_bot_status()
    
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
    
    email_to = body_data.get('email', '')
    telegram_id = body_data.get('telegram', '')
    message = body_data.get('message', '')
    notification_type = body_data.get('type', 'info')
    
    results = {'email': None, 'telegram': None}
    
    if email_to:
        results['email'] = send_email(email_to, message, notification_type)
    
    if telegram_id:
        results['telegram'] = send_telegram(telegram_id, message)
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'results': results,
            'request_id': context.request_id
        }),
        'isBase64Encoded': False
    }

def send_email(to_email: str, message: str, notification_type: str) -> Dict[str, Any]:
    smtp_email = os.environ.get('SMTP_EMAIL')
    smtp_password = os.environ.get('SMTP_PASSWORD')
    
    print(f'Sending email to: {to_email}, type: {notification_type}')
    
    if not smtp_email or not smtp_password:
        print('SMTP credentials not configured')
        return {'success': False, 'error': 'SMTP credentials not configured'}
    
    subject_map = {
        'pollen_high': '⚠️ Высокий уровень пыльцы!',
        'pollen_medium': '⚡ Средний уровень пыльцы',
        'weather_alert': '🌪️ Погодное предупреждение',
        'daily_forecast': '🌤️ Ежедневный прогноз погоды'
    }
    
    subject = subject_map.get(notification_type, '🐺 Уведомление от Волк-синоптик')
    
    msg = MIMEMultipart('alternative')
    msg['Subject'] = subject
    msg['From'] = smtp_email
    msg['To'] = to_email
    
    html = f'''
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h2 style="color: #4A90E2; margin-bottom: 20px;">🐺 Волк-синоптик</h2>
                <div style="background: linear-gradient(135deg, #4A90E2, #98D8C8); padding: 20px; border-radius: 8px; color: white; margin-bottom: 20px;">
                    <p style="margin: 0; font-size: 16px; line-height: 1.6;">{message}</p>
                </div>
                <p style="color: #666; font-size: 14px;">
                    Это автоматическое уведомление от вашего погодного сервиса Волк-синоптик.
                </p>
            </div>
        </body>
    </html>
    '''
    
    msg.attach(MIMEText(html, 'html'))
    
    try:
        with smtplib.SMTP_SSL('smtp.gmail.com', 465) as server:
            server.login(smtp_email, smtp_password)
            server.send_message(msg)
        print(f'Email sent successfully to {to_email}')
        return {'success': True}
    except Exception as e:
        print(f'Email error: {str(e)}')
        return {'success': False, 'error': str(e)}

def get_chat_id_from_username(bot_token: str, username: str) -> str:
    username = username.lstrip('@')
    
    try:
        url = f'https://api.telegram.org/bot{bot_token}/getUpdates'
        req = urllib.request.Request(url)
        
        with urllib.request.urlopen(req) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('ok'):
                for update in result.get('result', []):
                    message = update.get('message', {})
                    from_user = message.get('from', {})
                    
                    if from_user.get('username', '').lower() == username.lower():
                        return str(from_user.get('id'))
        
        return username
    except:
        return username

def send_telegram(telegram_input: str, message: str) -> Dict[str, Any]:
    bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
    
    print(f'Sending telegram to: {telegram_input}')
    
    if not bot_token:
        print('Telegram bot token not configured')
        return {'success': False, 'error': 'Telegram bot token not configured'}
    
    chat_id = telegram_input
    if telegram_input.startswith('@') or not telegram_input.isdigit():
        chat_id = get_chat_id_from_username(bot_token, telegram_input)
    
    url = f'https://api.telegram.org/bot{bot_token}/sendMessage'
    
    data = {
        'chat_id': chat_id,
        'text': f'🐺 *Волк-синоптик*\n\n{message}',
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
            if result.get('ok'):
                print(f'Telegram sent successfully to {chat_id}')
            else:
                print(f'Telegram error: {result}')
            return {'success': result.get('ok', False), 'chat_id': chat_id}
    except Exception as e:
        print(f'Telegram exception: {str(e)}')
        return {'success': False, 'error': str(e)}