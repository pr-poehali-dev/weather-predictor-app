import json
import urllib.request
from datetime import datetime

def handler(event: dict, context) -> dict:
    '''Получение данных о магнитных бурях с API NOAA'''
    method = event.get('httpMethod', 'GET')

    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type'
            },
            'body': ''
        }

    if method == 'GET':
        try:
            current_url = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index.json'
            forecast_url = 'https://services.swpc.noaa.gov/products/noaa-planetary-k-index-forecast.json'

            with urllib.request.urlopen(current_url) as response:
                current_data = json.loads(response.read().decode())

            with urllib.request.urlopen(forecast_url) as response:
                forecast_data = json.loads(response.read().decode())

            current_kp = 0
            if len(current_data) > 1:
                latest_entry = current_data[-1]
                current_kp = float(latest_entry[1]) if latest_entry[1] else 0

            forecast = []
            for row in forecast_data[1:]:
                if row[2] == 'predicted':
                    kp_value = float(row[1]) if row[1] else 0
                    forecast.append({
                        'date': row[0].split()[0],
                        'kp': kp_value,
                        'level': get_level_from_kp(kp_value)
                    })
                    if len(forecast) >= 3:
                        break

            result = {
                'current': {
                    'kp': current_kp,
                    'level': get_level_from_kp(current_kp),
                    'description': get_description(current_kp)
                },
                'forecast': forecast
            }

            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps(result)
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

def get_level_from_kp(kp: float) -> str:
    if kp < 3:
        return 'low'
    elif kp < 5:
        return 'moderate'
    elif kp < 7:
        return 'high'
    else:
        return 'extreme'

def get_description(kp: float) -> str:
    if kp < 3:
        return 'Спокойная обстановка. Влияние на здоровье минимально.'
    elif kp < 5:
        return 'Умеренная активность. Возможна легкая головная боль у чувствительных людей.'
    elif kp < 7:
        return 'Высокая активность. Может ухудшиться самочувствие у метеозависимых людей.'
    else:
        return 'Экстремальная активность. Рекомендуется избегать физических нагрузок.'
