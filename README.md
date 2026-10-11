# 🛡️ Fake Wi-Fi & Hotspot Detection System

A web-based cybersecurity awareness dashboard built with **Python (Flask)** on **Kali Linux** to monitor, detect, and analyze rogue Wi-Fi access points, Evil Twin setups, and unencrypted wireless networks in real time.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.8+-green.svg)
![Flask](https://img.shields.io/badge/flask-2.3-red.svg)
![Platform](https://img.shields.io/badge/platform-Kali%20Linux-purple.svg)

---

## 📖 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Screenshots](#-screenshots)
- [Installation & Setup](#-installation--setup)
- [Usage](#-usage)
- [Requirements](#-requirements)
- [Project Structure](#-project-structure)
- [Tech Stack](#-tech-stack)
- [Contributing](#-contributing)
- [License](#-license)
- [Authors](#-authors)
- [Acknowledgements](#-acknowledgements)

---

## 🎯 About the Project

**Fake Wi-Fi & Hotspot Detection System** is an open-source cybersecurity awareness tool designed to protect users from malicious Wi-Fi networks. In today's world, public Wi-Fi is everywhere — cafes, airports, hotels, and universities. But not all networks are safe.

This dashboard helps users:

- 🔍 **Detect** suspicious and fake Wi-Fi networks
- ⚠️ **Analyze** network security (encryption, SSID, signal strength)
- 📊 **Visualize** threat levels in real time
- 📚 **Learn** about Wi-Fi security through interactive lessons and quizzes

Built as part of a **Security Awareness Boot Camp**, this project aims to make public Wi-Fi safer for everyone.

---

## 🌟 Key Features

| Feature | Description |
|---------|-------------|
| 📊 **Real-Time Threat Assessment** | Categorizes scanned access points into Safe, Suspicious, Risky, and Dangerous threat levels |
| 🚨 **Active Threat Alerts** | Highlights unencrypted networks, suspicious SSIDs, and outdated security standards (WEP/WPA1) |
| 🌐 **IP Detection** | Shows BSSID (router MAC), Device IP, and Gateway IP for each network |
| 👥 **Evil Twin Detection** | Identifies duplicate SSIDs (fake networks mimicking legitimate ones) |
| 🔑 **Password Generator & Strength Checker** | Evaluates credential strength to prevent unauthorized network access |
| 📜 **Scan History & Exporting** | Tracks network changes over time and exports analytical PDF reports |
| 📚 **Integrated Security Bootcamp** | Built-in interactive lessons covering Public Wi-Fi Risks, Evil Twin Attacks, and Safe Browsing |
| 🧠 **Security Quiz** | 10 questions with detailed explanations |
| 🎨 **5 Custom Themes** | Dark, Light, Neon, Ocean, Forest |
| 📱 **Mobile Responsive** | Works on desktop, tablet, and mobile |
| 📈 **Threat Distribution** | Visual percentage breakdown of network threat levels |
| ⚡ **Wi-Fi Speed Test** | Tests network latency and speed |

---

## 📸 Screenshots

### Dashboard Overview
![Dashboard](docs/screenshots/dashboard.png)

### Network Scan Results
![Network Scan](docs/screenshots/network-scan.png)

### Active Alerts
![Alerts](docs/screenshots/alerts.png)

### Lessons & Quiz
![Lessons](docs/screenshots/lessons.png)

### Password Tools
![Password](docs/screenshots/password.png)

---

## 🚀 Installation & Setup

### Prerequisites

Before you begin, make sure you have:

- **OS:** Kali Linux (or any Linux distribution)
- **Python:** 3.8 or higher
- **Wi-Fi Adapter:** Required for real-time scanning
- **NetworkManager:** For `nmcli` commands

### Step 1: Install NetworkManager

```bash
sudo apt update
sudo apt install network-manager -y
