import json
import os
from datetime import datetime

HISTORY_FILE = 'data/history.json'

def load_history():
    if not os.path.exists(HISTORY_FILE):
        return []
    try:
        with open(HISTORY_FILE, 'r') as f:
            return json.load(f)
    except:
        return []

def save_history(networks):
    os.makedirs('data', exist_ok=True)
    history = load_history()
    history.append({
        'timestamp': datetime.now().isoformat(),
        'networks': networks
    })
    if len(history) > 50:
        history = history[-50:]
    with open(HISTORY_FILE, 'w') as f:
        json.dump(history, f, indent=2)

def detect_duplicate_ssids(networks):
    ssid_count = {}
    for net in networks:
        ssid = net['ssid']
        ssid_count[ssid] = ssid_count.get(ssid, []) + [net]
    return [{'ssid': ssid, 'count': len(nets), 'networks': nets, 
             'warning': f'⚠️ Multiple networks with same SSID: "{ssid}"'} 
            for ssid, nets in ssid_count.items() if len(nets) > 1]

def get_network_stats(networks):
    total = len(networks)
    safe = sum(1 for n in networks if n.get('risk_level') == 'Safe')
    suspicious = sum(1 for n in networks if n.get('risk_level') == 'Suspicious')
    risky = sum(1 for n in networks if n.get('risk_level') == 'Risky')
    dangerous = sum(1 for n in networks if n.get('risk_level') == 'Dangerous')
    return {'total': total, 'safe': safe, 'suspicious': suspicious, 
            'risky': risky, 'dangerous': dangerous,
            'avg_risk': sum(n.get('risk_score', 0) for n in networks) / total if total > 0 else 0}

def generate_history_graph():
    return None
