"""
Business: Search for cities and villages using geocoding API
Args: event with httpMethod, queryStringParameters (query for search)
Returns: HTTP response with list of locations (name, lat, lon, country, region)
"""

import json
import urllib.request
import urllib.parse
from typing import Dict, Any, List

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
        encoded_query = urllib.parse.quote(query)
        api_url = f"https://geocoding-api.open-meteo.com/v1/search?name={encoded_query}&count=20&language=ru&format=json"
        
        with urllib.request.urlopen(api_url) as response:
            data = json.loads(response.read().decode())
        
        results: List[Dict[str, Any]] = []
        
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
