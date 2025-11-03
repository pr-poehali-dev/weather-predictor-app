"""
Business: Search for cities and villages using geocoding API
Args: event with httpMethod, queryStringParameters (query for search)
Returns: HTTP response with list of locations (name, lat, lon, country, region)
"""

import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List

RUSSIAN_CITIES = {
    'тольятти': {'name': 'Тольятти', 'lat': 53.5303, 'lon': 49.3461, 'admin1': 'Самарская область'},
    'саранск': {'name': 'Саранск', 'lat': 54.1838, 'lon': 45.1749, 'admin1': 'Мордовия'},
    'краснодар': {'name': 'Краснодар', 'lat': 45.0355, 'lon': 38.9753, 'admin1': 'Краснодарский край'},
    'воронеж': {'name': 'Воронеж', 'lat': 51.6605, 'lon': 39.2005, 'admin1': 'Воронежская область'},
    'пермь': {'name': 'Пермь', 'lat': 58.0105, 'lon': 56.2502, 'admin1': 'Пермский край'},
    'волгоград': {'name': 'Волгоград', 'lat': 48.7080, 'lon': 44.5133, 'admin1': 'Волгоградская область'},
    'тюмень': {'name': 'Тюмень', 'lat': 57.1522, 'lon': 65.5272, 'admin1': 'Тюменская область'},
    'барнаул': {'name': 'Барнаул', 'lat': 53.3480, 'lon': 83.7799, 'admin1': 'Алтайский край'},
    'иркутск': {'name': 'Иркутск', 'lat': 52.2978, 'lon': 104.2964, 'admin1': 'Иркутская область'},
    'владивосток': {'name': 'Владивосток', 'lat': 43.1332, 'lon': 131.9113, 'admin1': 'Приморский край'},
    'ярославль': {'name': 'Ярославль', 'lat': 57.6261, 'lon': 39.8845, 'admin1': 'Ярославская область'},
    'тула': {'name': 'Тула', 'lat': 54.1934, 'lon': 37.6156, 'admin1': 'Тульская область'},
    'севастополь': {'name': 'Севастополь', 'lat': 44.6160, 'lon': 33.5252, 'admin1': 'Севастополь'},
    'махачкала': {'name': 'Махачкала', 'lat': 42.9849, 'lon': 47.5047, 'admin1': 'Дагестан'},
    'хабаровск': {'name': 'Хабаровск', 'lat': 48.4827, 'lon': 135.0838, 'admin1': 'Хабаровский край'},
    'оренбург': {'name': 'Оренбург', 'lat': 51.7727, 'lon': 55.0988, 'admin1': 'Оренбургская область'},
    'новокузнецк': {'name': 'Новокузнецк', 'lat': 53.7577, 'lon': 87.1099, 'admin1': 'Кемеровская область'},
    'рязань': {'name': 'Рязань', 'lat': 54.6269, 'lon': 39.6916, 'admin1': 'Рязанская область'},
    'томск': {'name': 'Томск', 'lat': 56.4977, 'lon': 84.9744, 'admin1': 'Томская область'},
    'кемерово': {'name': 'Кемерово', 'lat': 55.3547, 'lon': 86.0861, 'admin1': 'Кемеровская область'},
    'астрахань': {'name': 'Астрахань', 'lat': 46.3497, 'lon': 48.0408, 'admin1': 'Астраханская область'},
    'пенза': {'name': 'Пенза', 'lat': 53.2001, 'lon': 45.0000, 'admin1': 'Пензенская область'},
    'липецк': {'name': 'Липецк', 'lat': 52.6097, 'lon': 39.5708, 'admin1': 'Липецкая область'},
    'киров': {'name': 'Киров', 'lat': 58.6035, 'lon': 49.6679, 'admin1': 'Кировская область'},
    'чебоксары': {'name': 'Чебоксары', 'lat': 56.1439, 'lon': 47.2489, 'admin1': 'Чувашия'},
    'калининград': {'name': 'Калининград', 'lat': 54.7104, 'lon': 20.4522, 'admin1': 'Калининградская область'},
    'брянск': {'name': 'Брянск', 'lat': 53.2521, 'lon': 34.3717, 'admin1': 'Брянская область'},
    'иваново': {'name': 'Иваново', 'lat': 57.0000, 'lon': 40.9833, 'admin1': 'Ивановская область'},
    'магнитогорск': {'name': 'Магнитогорск', 'lat': 53.4078, 'lon': 58.9797, 'admin1': 'Челябинская область'},
    'курск': {'name': 'Курск', 'lat': 51.7373, 'lon': 36.1873, 'admin1': 'Курская область'},
    'тверь': {'name': 'Тверь', 'lat': 56.8587, 'lon': 35.9176, 'admin1': 'Тверская область'},
    'нижний тагил': {'name': 'Нижний Тагил', 'lat': 57.9197, 'lon': 59.9650, 'admin1': 'Свердловская область'},
    'ставрополь': {'name': 'Ставрополь', 'lat': 45.0428, 'lon': 41.9734, 'admin1': 'Ставропольский край'},
    'улан-удэ': {'name': 'Улан-Удэ', 'lat': 51.8272, 'lon': 107.6063, 'admin1': 'Бурятия'},
    'сочи': {'name': 'Сочи', 'lat': 43.6028, 'lon': 39.7342, 'admin1': 'Краснодарский край'},
    'калуга': {'name': 'Калуга', 'lat': 54.5293, 'lon': 36.2754, 'admin1': 'Калужская область'},
    'владимир': {'name': 'Владимир', 'lat': 56.1294, 'lon': 40.4063, 'admin1': 'Владимирская область'},
    'архангельск': {'name': 'Архангельск', 'lat': 64.5401, 'lon': 40.5433, 'admin1': 'Архангельская область'},
    'мурманск': {'name': 'Мурманск', 'lat': 68.9585, 'lon': 33.0827, 'admin1': 'Мурманская область'},
    'якутск': {'name': 'Якутск', 'lat': 62.0355, 'lon': 129.6755, 'admin1': 'Якутия'},
    'смоленск': {'name': 'Смоленск', 'lat': 54.7824, 'lon': 32.0454, 'admin1': 'Смоленская область'},
    'сургут': {'name': 'Сургут', 'lat': 61.2500, 'lon': 73.4167, 'admin1': 'Ханты-Мансийский АО'}
}

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    params = event.get('queryStringParameters') or {}
    query = params.get('query', '')
    
    if not query or len(query) < 2:
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'results': []}, ensure_ascii=False),
            'isBase64Encoded': False
        }
    
    try:
        results: List[Dict[str, Any]] = []
        query_lower = query.lower()
        
        for city_key, city_data in RUSSIAN_CITIES.items():
            if query_lower in city_key or city_key.startswith(query_lower):
                results.append({
                    'name': city_data['name'],
                    'lat': city_data['lat'],
                    'lon': city_data['lon'],
                    'country': 'Россия',
                    'admin1': city_data['admin1'],
                    'display_name': f"{city_data['name']}, {city_data['admin1']}",
                    'population': 0,
                    'country_code': 'RU'
                })
        
        encoded_query = urllib.parse.quote(query)
        api_url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded_query}&count=20&language=ru&format=json"
        
        with urllib.request.urlopen(api_url) as response:
            data = json.loads(response.read().decode())
        
        if 'results' in data:
            for location in data['results']:
                location_data = {
                    'name': location.get('name', ''),
                    'lat': location.get('latitude'),
                    'lon': location.get('longitude'),
                    'country': location.get('country', ''),
                    'admin1': location.get('admin1', ''),
                    'admin2': location.get('admin2', ''),
                    'admin3': location.get('admin3', ''),
                    'admin4': location.get('admin4', ''),
                    'population': location.get('population', 0),
                    'timezone': location.get('timezone', ''),
                    'country_code': location.get('country_code', '')
                }
                
                display_parts = [location_data['name']]
                
                if location_data.get('admin4'):
                    display_parts.append(location_data['admin4'])
                elif location_data.get('admin3'):
                    display_parts.append(location_data['admin3'])
                elif location_data.get('admin2'):
                    display_parts.append(location_data['admin2'])
                elif location_data.get('admin1'):
                    display_parts.append(location_data['admin1'])
                
                if location_data['country'] and location_data['country'] != 'Россия':
                    display_parts.append(location_data['country'])
                
                location_data['display_name'] = ', '.join(display_parts)
                results.append(location_data)
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'results': results}, ensure_ascii=False),
            'isBase64Encoded': False
        }
        
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': str(e), 'results': []}, ensure_ascii=False),
            'isBase64Encoded': False
        }