cat > script.js << 'EOF'
// Configuration
const API_BASE = 'http://127.0.0.1:5000';
let scanInterval = null;

// Scan Networks
async function scanNetworks() {
    const btn = document.getElementById('scanBtn');
    const status = document.getElementById('status');
    
    btn.disabled = true;
    btn.textContent = '⏳ Scanning...';
    status.textContent = '🔄 Scanning Wi-Fi networks...';
    
    try {
        const response = await fetch(`${API_BASE}/api/scan`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.error) {
            status.textContent = '❌ ' + data.error;
            btn.disabled = false;
            btn.textContent = '🔄 Scan Networks';
            return;
        }
        
        updateDashboard(data);
        status.textContent = `✅ Scanned ${data.networks.length} networks`;
        
    } catch (error) {
        status.textContent = '❌ Error: Make sure backend is running on port 5000';
        console.error('Error:', error);
        // Show demo data if backend not available
        showDemoData();
    } finally {
        btn.disabled = false;
        btn.textContent = '🔄 Scan Networks';
    }
}

// Demo data for testing (when backend is not available)
function showDemoData() {
    const demoNetworks = [
        {
            ssid: 'Home_WiFi_Secure',
            security: 'WPA3',
            signal: 85,
            bssid: 'AA:BB:CC:DD:EE:01',
            device_ip: '192.168.1.100',
            gateway_ip: '192.168.1.1',
            risk_score: 5,
            risk_level: 'Safe',
            risk_icon: '🟢',
            risk_class: 'safe',
            analysis: ['✅ No obvious security issues detected']
        },
        {
            ssid: 'Office_Network',
            security: 'WPA2',
            signal: 78,
            bssid: 'AA:BB:CC:DD:EE:02',
            device_ip: '192.168.1.101',
            gateway_ip: '192.168.1.1',
            risk_score: 15,
            risk_level: 'Safe',
            risk_icon: '🟢',
            risk_class: 'safe',
            analysis: ['✅ No obvious security issues detected']
        },
        {
            ssid: 'Starbucks_WiFi',
            security: 'WPA1 WPA2',
            signal: 72,
            bssid: 'AA:BB:CC:DD:EE:03',
            device_ip: '192.168.1.102',
            gateway_ip: '192.168.1.1',
            risk_score: 45,
            risk_level: 'Suspicious',
            risk_icon: '🟠',
            risk_class: 'suspicious',
            analysis: ['⚠️ Older encryption standard']
        },
        {
            ssid: 'Free_Public_WiFi',
            security: 'None',
            signal: 92,
            bssid: 'AA:BB:CC:DD:EE:04',
            device_ip: '192.168.1.103',
            gateway_ip: '192.168.1.1',
            risk_score: 70,
            risk_level: 'Risky',
            risk_icon: '🔴',
            risk_class: 'risky',
            analysis: ['⚠️ No encryption (Open network)', '⚠️ Suspicious SSID name']
        },
        {
            ssid: 'Airport_Free_Hotspot',
            security: 'WEP',
            signal: 65,
            bssid: 'AA:BB:CC:DD:EE:05',
            device_ip: '192.168.1.104',
            gateway_ip: '192.168.1.1',
            risk_score: 85,
            risk_level: 'Dangerous',
            risk_icon: '⛔',
            risk_class: 'dangerous',
            analysis: ['⚠️ WEP encryption (Old/Insecure)', '⚠️ Suspicious SSID name']
        },
        {
            ssid: 'Cafe_Guest_Network',
            security: 'WPA2',
            signal: 55,
            bssid: 'AA:BB:CC:DD:EE:06',
            device_ip: '192.168.1.105',
            gateway_ip: '192.168.1.1',
            risk_score: 30,
            risk_level: 'Suspicious',
            risk_icon: '🟠',
            risk_class: 'suspicious',
            analysis: ['⚠️ Suspicious SSID name']
        }
    ];
    
    const stats = {
        total: demoNetworks.length,
        safe: demoNetworks.filter(n => n.risk_level === 'Safe').length,
        suspicious: demoNetworks.filter(n => n.risk_level === 'Suspicious').length,
        risky: demoNetworks.filter(n => n.risk_level === 'Risky').length,
        dangerous: demoNetworks.filter(n => n.risk_level === 'Dangerous').length
    };
    
    updateDashboard({ networks: demoNetworks, stats: stats });
    document.getElementById('status').textContent = '📡 Demo mode (backend not available)';
}

// Update Dashboard
function updateDashboard(data) {
    const networks = data.networks;
    const stats = data.stats;
    
    // Update Stats
    document.getElementById('safeCount').textContent = stats.safe || 0;
    document.getElementById('suspiciousCount').textContent = stats.suspicious || 0;
    document.getElementById('riskyCount').textContent = stats.risky || 0;
    document.getElementById('dangerousCount').textContent = stats.dangerous || 0;
    
    // Update Network Count
    document.getElementById('networkCount').textContent = `${stats.total || 0} networks found`;
    
    // Update Network List (with IPs)
    const container = document.getElementById('networkContainer');
    if (!networks || networks.length === 0) {
        container.innerHTML = '<div class="loading">No networks found. Try again.</div>';
    } else {
        container.innerHTML = networks.map(net => `
            <div class="network-item">
                <span class="ssid">${net.ssid || 'Unknown'}</span>
                <span class="security">${net.security || 'Unknown'}</span>
                <span class="signal">📶 ${net.signal || 0}%</span>
                <span class="bssid">📡 ${net.bssid || 'N/A'}</span>
                <span class="ip">🌐 ${net.device_ip || 'N/A'}</span>
                <span class="gateway">🚪 ${net.gateway_ip || 'N/A'}</span>
                <span class="risk ${net.risk_class || 'safe'}">${net.risk_icon || '🟢'} ${net.risk_level || 'Safe'}</span>
                <span class="score">${net.risk_score || 0}/100</span>
                ${net.analysis && net.analysis.length > 0 ? `
                    <div class="analysis">
                        ${net.analysis.map(a => a).join('<br>')}
                    </div>
                ` : ''}
            </div>
        `).join('');
    }
    
    // Update Alerts
    const alertContainer = document.getElementById('alertContainer');
    const alertNetworks = networks ? networks.filter(n => n.risk_level === 'Risky' || n.risk_level === 'Dangerous') : [];
    document.getElementById('alertCount').textContent = `${alertNetworks.length} alerts`;
    
    if (alertNetworks.length === 0) {
        alertContainer.innerHTML = '<div class="no-alerts">✅ No active threats detected</div>';
    } else {
        alertContainer.innerHTML = alertNetworks.map(net => `
            <div class="alert-item ${net.risk_class || ''}">
                ${net.risk_icon || '⚠️'} <strong>${net.ssid || 'Unknown'}</strong> — ${net.risk_level || 'Unknown'} (Score: ${net.risk_score || 0}/100)
                <br><small>Security: ${net.security || 'Unknown'} | Signal: ${net.signal || 0}% | IP: ${net.device_ip || 'N/A'} | ${net.analysis ? net.analysis[0] : ''}</small>
            </div>
        `).join('');
    }
}

// Auto-scan on page load
window.onload = function() {
    setTimeout(scanNetworks, 1000);
    if (scanInterval) clearInterval(scanInterval);
    scanInterval = setInterval(scanNetworks, 30000);
};
EOF
