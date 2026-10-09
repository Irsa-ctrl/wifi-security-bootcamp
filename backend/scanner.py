"""
Real Wi-Fi Scanner with IP Detection, Email Alerts, and History
"""

import subprocess
import re
import socket
import fcntl
import struct
from datetime import datetime
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

# ============================================
# EMAIL ALERT SYSTEM
# ============================================

def send_email_alert(ssid, risk_level, risk_score, analysis):
    """Send email alert for dangerous networks"""
    try:
        # Configure these with your email details
        sender_email = "your_email@gmail.com"
        sender_password = "your_app_password"
        receiver_email = "alert_receiver@gmail.com"
        
        if not sender_email or sender_email == "your_email@gmail.com":
            print("⚠️ Email not configured. Skipping alert.")
            return False
        
        subject = f"🚨 Wi-Fi Security Alert: {ssid} - {risk_level}"
        body = f"""
        ⚠️ DANGEROUS NETWORK DETECTED!
        
        SSID: {ssid}
        Risk Level: {risk_level}
        Risk Score: {risk_score}/100
        Analysis: {analysis}
        Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
        
        Do NOT connect to this network!
        """
        
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = receiver_email
        msg['Subject'] = subject
        msg.attach(MIMEText(body, 'plain'))
        
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print(f"📧 Email alert sent for {ssid}")
        return True
    except Exception as e:
        print(f"⚠️ Email alert failed: {e}")
        return False

# ============================================
# IP ADDRESS FUNCTIONS
# ============================================

def get_ip_address(interface='wlan0'):
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        return socket.inet_ntoa(fcntl.ioctl(
            s.fileno(),
            0x8915,
            struct.pack('256s', interface.encode()[:15])
        )[20:24])
    except:
        return 'N/A'

def get_gateway_ip():
    try:
        with open('/proc/net/route', 'r') as f:
            for line in f.readlines():
                parts = line.split()
                if parts[1] == '00000000':
                    gateway_hex = parts[2]
                    gateway = '.'.join(str(int(gateway_hex[i:i+2], 16)) 
                                      for i in range(6, -1, -2))
                    return gateway
    except:
        return 'N/A'

# ============================================
# MAIN SCANNING FUNCTION
# ============================================

def scan_wifi():
    try:
        # Check nmcli
        result = subprocess.run(['which', 'nmcli'], capture_output=True, text=True)
        if result.returncode != 0:
            return get_simulated_networks()
        
        # Check Wi-Fi interface
        interface_check = subprocess.run(['nmcli', 'dev', 'status'], capture_output=True, text=True)
        if 'wifi' not in interface_check.stdout.lower():
            return get_simulated_networks()
        
        result = subprocess.run(
            ['nmcli', '-t', '-f', 'SSID,SECURITY,SIGNAL,BSSID', 'dev', 'wifi', 'list'],
            capture_output=True, text=True, timeout=10
        )
        
        if result.returncode != 0:
            return get_simulated_networks()
        
        networks = []
        lines = result.stdout.strip().split('\n')
        gateway_ip = get_gateway_ip()
        device_ip = get_ip_address('wlan0')
        
        for line in lines:
            if not line:
                continue
            parts = line.split(':')
            if len(parts) >= 4:
                ssid = parts[0] if parts[0] else 'Hidden'
                security = parts[1] if parts[1] else 'None'
                signal = int(parts[2]) if parts[2].isdigit() else 0
                bssid = parts[3] if parts[3] else 'N/A'
                
                if not ssid or ssid == '--':
                    continue
                
                risk_score = calculate_risk(ssid, security, signal)
                networks.append({
                    'ssid': ssid,
                    'security': security,
                    'signal': signal,
                    'bssid': bssid,
                    'gateway_ip': gateway_ip,
                    'device_ip': device_ip,
                    'timestamp': datetime.now().isoformat(),
                    'risk_score': risk_score
                })
        
        if len(networks) == 0:
            return get_simulated_networks()
        
        # Check for dangerous networks and send alerts
        for net in networks:
            risk_info = get_risk_level(net['risk_score'])
            if risk_info['level'] in ['Risky', 'Dangerous']:
                analysis = get_detailed_analysis(net['ssid'], net['security'], 
                                                  net['signal'], net['risk_score'])
                send_email_alert(net['ssid'], risk_info['level'], 
                                 net['risk_score'], analysis[0] if analysis else '')
        
        return networks
    
    except Exception as e:
        print(f"⚠️ Scan error: {e}. Using simulated data.")
        return get_simulated_networks()

def get_simulated_networks():
    """Simulated networks for testing"""
    return [
        {'ssid': 'Home_WiFi_Secure', 'security': 'WPA3', 'signal': 85, 
         'bssid': 'AA:BB:CC:DD:01', 'gateway_ip': '192.168.1.1', 
         'device_ip': '192.168.1.100', 'timestamp': datetime.now().isoformat(), 
         'risk_score': 5},
        {'ssid': 'Office_Network', 'security': 'WPA2', 'signal': 78,
         'bssid': 'AA:BB:CC:DD:02', 'gateway_ip': '192.168.1.1',
         'device_ip': '192.168.1.101', 'timestamp': datetime.now().isoformat(),
         'risk_score': 15},
        {'ssid': 'Starbucks_WiFi', 'security': 'WPA1 WPA2', 'signal': 72,
         'bssid': 'AA:BB:CC:DD:03', 'gateway_ip': '192.168.1.1',
         'device_ip': '192.168.1.102', 'timestamp': datetime.now().isoformat(),
         'risk_score': 45},
        {'ssid': 'Free_Public_WiFi', 'security': 'None', 'signal': 92,
         'bssid': 'AA:BB:CC:DD:04', 'gateway_ip': '192.168.1.1',
         'device_ip': '192.168.1.103', 'timestamp': datetime.now().isoformat(),
         'risk_score': 70},
        {'ssid': 'Airport_Free_Hotspot', 'security': 'WEP', 'signal': 65,
         'bssid': 'AA:BB:CC:DD:05', 'gateway_ip': '192.168.1.1',
         'device_ip': '192.168.1.104', 'timestamp': datetime.now().isoformat(),
         'risk_score': 85},
        {'ssid': 'Cafe_Guest_Network', 'security': 'WPA2', 'signal': 55,
         'bssid': 'AA:BB:CC:DD:06', 'gateway_ip': '192.168.1.1',
         'device_ip': '192.168.1.105', 'timestamp': datetime.now().isoformat(),
         'risk_score': 30}
    ]

def calculate_risk(ssid, security, signal):
    risk = 0
    if security == 'None' or '--' in security or 'WEP' in security:
        risk += 35
    suspicious = ['free', 'public', 'guest', 'hotspot', 'freewifi', 'unsecured']
    if any(word in ssid.lower() for word in suspicious):
        risk += 25
    if signal > 80 and risk > 20:
        risk += 20
    if 'WPA1' in security or 'TKIP' in security:
        risk += 15
    if security == 'WEP':
        risk += 20
    return min(risk, 100)

def get_risk_level(score):
    if score < 20:
        return {'level': 'Safe', 'color': '#22C55E', 'icon': '🟢', 'class': 'safe'}
    elif score < 50:
        return {'level': 'Suspicious', 'color': '#F97316', 'icon': '🟠', 'class': 'suspicious'}
    elif score < 75:
        return {'level': 'Risky', 'color': '#EF4444', 'icon': '🔴', 'class': 'risky'}
    else:
        return {'level': 'Dangerous', 'color': '#DC2626', 'icon': '⛔', 'class': 'dangerous'}

def get_detailed_analysis(ssid, security, signal, risk_score):
    factors = []
    if security == 'None' or '--' in security:
        factors.append('⚠️ No encryption (Open network)')
    elif 'WEP' in security:
        factors.append('⚠️ WEP encryption (Old/Insecure)')
    elif 'WPA1' in security or 'TKIP' in security:
        factors.append('⚠️ Older encryption standard')
    suspicious = ['free', 'public', 'guest', 'hotspot', 'freewifi', 'unsecured']
    if any(word in ssid.lower() for word in suspicious):
        factors.append(f'⚠️ Suspicious SSID name: "{ssid}"')
    if signal > 80 and risk_score > 20:
        factors.append('⚠️ Very strong signal + suspicious = Possible Evil Twin')
    if len(factors) == 0:
        factors.append('✅ No obvious security issues detected')
    return factors
