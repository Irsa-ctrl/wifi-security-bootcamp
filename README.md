# 🛡️ Fake Wi-Fi & Hotspot Detection System

A web-based cybersecurity awareness dashboard built with **Python (Flask)** on **Kali Linux** to monitor, detect, and analyze rogue Wi-Fi access points, Evil Twin setups, and unencrypted wireless networks in real time.

---

## 🌟 Key Features

- **📊 Real-Time Threat Assessment:** Categorizes scanned access points into `Safe`, `Suspicious`, `Risky`, and `Dangerous` threat levels.
- **🚨 Active Threat Alerts:** Highlights unencrypted networks, suspicious SSIDs, and outdated security standards (WEP/WPA1).
- **🔑 Password Generator & Strength Checker:** Evaluates credential strength to prevent unauthorized network access.
- **📜 Scan History & Exporting:** Tracks network changes over time and exports analytical PDF reports.
- **📚 Integrated Security Bootcamp:** Built-in interactive lessons covering Public Wi-Fi Risks, Evil Twin Attacks, and Safe Browsing practices.

---

## 🚀 Installation & Setup

```bash
# Clone the repository
git clone [https://github.com/Irsa-ctrl/wifi-security-bootcamp.git](https://github.com/Irsa-ctrl/wifi-security-bootcamp.git)
cd wifi-security-bootcamp/backend

# Install dependencies
pip install -r requirements.txt

# Run the Flask app
python app.py
