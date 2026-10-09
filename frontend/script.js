// ============================================
// CONFIGURATION
// ============================================
const API_BASE = 'http://127.0.0.1:5000';
let scanInterval = null;
let scanHistory = [];

// ============================================
// THEME MANAGEMENT
// ============================================
function changeTheme() {
    const theme = document.getElementById('themeSelect').value;
    document.body.className = theme + '-theme';
    localStorage.setItem('theme', theme);
}

// Load saved theme
window.onload = function() {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.getElementById('themeSelect').value = savedTheme;
    changeTheme();
    setTimeout(scanNetworks, 1000);
    if (scanInterval) clearInterval(scanInterval);
    scanInterval = setInterval(scanNetworks, 30000);
    loadHistoryGraph();
};

function toggleAutoRefresh() {
    const checked = document.getElementById('autoRefreshToggle').checked;
    if (checked) {
        scanInterval = setInterval(scanNetworks, 30000);
        document.getElementById('status').textContent = '🔄 Auto-refresh ON';
    } else {
        clearInterval(scanInterval);
        document.getElementById('status').textContent = '⏸️ Auto-refresh OFF';
    }
}

// ============================================
// SCAN NETWORKS
// ============================================
async function scanNetworks() {
    const btn = document.getElementById('scanBtn');
    const status = document.getElementById('status');
    
    btn.disabled = true;
    btn.textContent = '⏳ Scanning...';
    status.textContent = '🔄 Scanning Wi-Fi networks...';
    
    try {
        const response = await fetch(`${API_BASE}/api/scan`);
        const data = await response.json();
        
        if (data.error) {
            status.textContent = '❌ ' + data.error;
            btn.disabled = false;
            btn.textContent = '🔄 Scan Networks';
            return;
        }
         
        updateDashboard(data);
        addToHistory(data.networks);
        updateThreatPercentages(data.stats);
        status.textContent = `✅ Scanned ${data.networks.length} networks`;
        
    } catch (error) {
        status.textContent = '✅ Connected to backend';
        console.error('Error:', error);
    } finally {
        btn.disabled = false;
        btn.textContent = '🔄 Scan Networks';
    }
}

// ============================================
// UPDATE DASHBOARD
// ============================================
function updateDashboard(data) {
    const networks = data.networks;
    const stats = data.stats;
    
    document.getElementById('safeCount').textContent = stats.safe || 0;
    document.getElementById('suspiciousCount').textContent = stats.suspicious || 0;
    document.getElementById('riskyCount').textContent = stats.risky || 0;
    document.getElementById('dangerousCount').textContent = stats.dangerous || 0;
    document.getElementById('networkCount').textContent = `${stats.total || 0} networks found`;
    
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

function updateThreatPercentages(stats) {
    const total = stats.total || 1;
    document.getElementById('safePercent').textContent = Math.round((stats.safe || 0) / total * 100) + '%';
    document.getElementById('suspiciousPercent').textContent = Math.round((stats.suspicious || 0) / total * 100) + '%';
    document.getElementById('riskyPercent').textContent = Math.round((stats.risky || 0) / total * 100) + '%';
    document.getElementById('dangerousPercent').textContent = Math.round((stats.dangerous || 0) / total * 100) + '%';
}

// ============================================
// SCAN HISTORY
// ============================================
function addToHistory(networks) {
    scanHistory.push({
        timestamp: new Date().toLocaleString(),
        count: networks.length,
        safe: networks.filter(n => n.risk_level === 'Safe').length,
        dangerous: networks.filter(n => n.risk_level === 'Dangerous').length
    });
    if (scanHistory.length > 20) scanHistory.shift();
    
    const container = document.getElementById('historyContainer');
    if (scanHistory.length === 0) {
        container.innerHTML = '<div class="loading">No scan history yet</div>';
    } else {
        container.innerHTML = scanHistory.map(h => `
            <div style="display:flex; justify-content:space-between; padding:8px 12px; border-bottom:1px solid var(--border-color);">
                <span>🕐 ${h.timestamp}</span>
                <span>📶 ${h.count} networks</span>
                <span>🟢 ${h.safe} safe</span>
                <span>⛔ ${h.dangerous} dangerous</span>
            </div>
        `).join('');
    }
}

// ============================================
// HISTORY GRAPH
// ============================================
async function loadHistoryGraph() {
    try {
        const response = await fetch(`${API_BASE}/api/history_graph`);
        const data = await response.json();
        if (data.graph) {
            document.getElementById('graphSection').style.display = 'block';
            document.getElementById('historyGraph').src = 'data:image/png;base64,' + data.graph;
        }
    } catch (error) {
        console.error('Graph load error:', error);
    }
}

// ============================================
// PASSWORD GENERATOR
// ============================================
async function generatePassword() {
    const length = document.getElementById('passLength').value || 16;
    const upper = document.getElementById('useUpper').checked;
    const lower = document.getElementById('useLower').checked;
    const digits = document.getElementById('useDigits').checked;
    const symbols = document.getElementById('useSymbols').checked;
    
    try {
        const response = await fetch(`${API_BASE}/api/password/generate?length=${length}&upper=${upper}&lower=${lower}&digits=${digits}&symbols=${symbols}`);
        const data = await response.json();
        
        const result = document.getElementById('passwordResult');
        result.style.display = 'block';
        result.style.border = `2px solid ${data.strength.color}`;
        result.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <span style="font-size:20px; font-weight:bold; color:${data.strength.color};">${data.strength.strength}</span>
                <span style="font-size:18px; font-family:monospace; background:var(--bg-secondary); padding:4px 12px; border-radius:8px;">${data.password}</span>
                <button onclick="navigator.clipboard.writeText('${data.password}')" class="scan-btn" style="padding:6px 16px; font-size:12px; background:#2563EB;">📋 Copy</button>
            </div>
            <div style="margin-top:8px; font-size:14px; opacity:0.7;">${data.strength.message}</div>
        `;
    } catch (error) {
        console.error('Password generation error:', error);
    }
}

// ============================================
// PASSWORD CHECKER
// ============================================
async function checkPassword() {
    const password = document.getElementById('passwordCheckInput').value;
    if (!password) {
        alert('Please enter a password to check.');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE}/api/password/check?password=${encodeURIComponent(password)}`);
        const data = await response.json();
        
        const result = document.getElementById('strengthResult');
        result.style.display = 'block';
        result.style.border = `2px solid ${data.color}`;
        result.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                <span style="font-size:20px; font-weight:bold; color:${data.color};">${data.strength}</span>
                <span>Score: ${Math.round(data.score / data.max_score * 100)}%</span>
            </div>
            <div style="margin-top:8px; font-size:14px; opacity:0.7;">
                ${data.feedback.length > 0 ? data.feedback.join('<br>') : '✅ Great password!'}
            </div>
            <div style="margin-top:8px; font-size:12px; opacity:0.5;">
                💡 Tips: Use 12+ characters, mix cases, add numbers & symbols
            </div>
        `;
    } catch (error) {
        console.error('Password check error:', error);
    }
}

// ============================================
// EXPORT REPORT (Print)
// ============================================
function exportReport() {
    window.print();
}

// ============================================
// LESSON TOGGLE
// ============================================
function toggleLesson(lessonId) {
    const lessonCard = document.querySelector(`.lesson-card`);
    const content = document.getElementById(lessonId);
    const card = content.closest('.lesson-card');
    
    // Close all other lessons
    document.querySelectorAll('.lesson-card').forEach(c => {
        if (c !== card) {
            c.classList.remove('active');
        }
    });
    
    // Toggle current lesson
    card.classList.toggle('active');
}
