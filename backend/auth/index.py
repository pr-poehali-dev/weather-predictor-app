import json
import os
import hmac
import hashlib
import time
import urllib.parse
import psycopg2
from psycopg2.extras import RealDictCursor

def handler(event: dict, context) -> dict:
    '''Авторизация через Telegram Web App'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if method == 'POST':
        try:
            body = json.loads(event.get('body', '{}'))
            user_data = body.get('user', {})
            
            telegram_id = user_data.get('id')
            username = user_data.get('username', '')
            first_name = user_data.get('first_name', '')

            if not telegram_id:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Invalid user data'})
                }

            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor(cursor_factory=RealDictCursor)

            admin_telegram_id = os.environ.get('ADMIN_TELEGRAM_ID', '')
            is_admin = str(telegram_id) == admin_telegram_id

            cur.execute('''
                INSERT INTO users (telegram_id, username, first_name, is_admin, last_login)
                VALUES (%s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT (telegram_id) 
                DO UPDATE SET 
                    username = EXCLUDED.username,
                    first_name = EXCLUDED.first_name,
                    is_admin = EXCLUDED.is_admin,
                    last_login = CURRENT_TIMESTAMP
                RETURNING id, telegram_id, username, first_name, is_admin
            ''', (telegram_id, username, first_name, is_admin))
            
            user = cur.fetchone()
            conn.commit()

            cur.execute('''
                SELECT location_lat, location_lon, location_name, notifications_enabled
                FROM user_settings
                WHERE user_id = %s
            ''', (user['id'],))
            
            settings = cur.fetchone()

            cur.close()
            conn.close()

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'user': dict(user),
                    'settings': dict(settings) if settings else None
                })
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)})
            }

    if method == 'GET':
        telegram_id = event.get('queryStringParameters', {}).get('telegram_id')
        
        if not telegram_id:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'telegram_id required'})
            }

        try:
            conn = psycopg2.connect(os.environ['DATABASE_URL'])
            cur = conn.cursor(cursor_factory=RealDictCursor)

            cur.execute('''
                SELECT u.id, u.telegram_id, u.username, u.first_name, u.is_admin,
                       s.location_lat, s.location_lon, s.location_name, s.notifications_enabled
                FROM users u
                LEFT JOIN user_settings s ON u.id = s.user_id
                WHERE u.telegram_id = %s
            ''', (telegram_id,))
            
            result = cur.fetchone()

            cur.close()
            conn.close()

            if not result:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'User not found'})
                }

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(dict(result))
            }

        except Exception as e:
            return {
                'statusCode': 500,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': str(e)})
            }

    return {
        'statusCode': 405,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({'error': 'Method not allowed'})
    }