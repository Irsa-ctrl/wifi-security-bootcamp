
from flask import (
    Flask,
    jsonify,
    render_template,
    request,
    send_from_directory
)
from flask_cors import CORS
from datetime import datetime
from pathlib import Path

import scanner
import analyzer
import password_generator


# Project folders
BASE_DIR = Path(__file__).resolve().parent
FRONTEND_DIR = BASE_DIR.parent / "frontend"
QUIZ_DIR = BASE_DIR.parent / "quiz"


# Flask configuration
app = Flask(
    __name__,
    template_folder=str(FRONTEND_DIR),
    static_folder=str(FRONTEND_DIR),
    static_url_path="/static"
)

CORS(app)


# Last scan data
last_scan = []
last_scan_time = None


# Main dashboard
@app.route("/")
def dashboard():
    return render_template("index.html")


# Serve CSS from frontend/style.css
@app.route("/style.css")
def serve_css():
    return send_from_directory(
        str(FRONTEND_DIR),
        "style.css"
    )


# Serve JavaScript from frontend/script.js
@app.route("/script.js")
def serve_js():
    return send_from_directory(
        str(FRONTEND_DIR),
        "script.js"
    )


# Wi-Fi network scan
@app.route("/api/scan")
def scan_networks():
    global last_scan, last_scan_time

    networks = scanner.scan_wifi()

    if isinstance(networks, dict) and "error" in networks:
        return jsonify({"error": networks["error"]}), 500

    for net in networks:
        risk_info = scanner.get_risk_level(net["risk_score"])

        net["risk_level"] = risk_info["level"]
        net["risk_color"] = risk_info["color"]
        net["risk_icon"] = risk_info["icon"]
        net["risk_class"] = risk_info["class"]

        net["analysis"] = scanner.get_detailed_analysis(
            net["ssid"],
            net["security"],
            net["signal"],
            net["risk_score"]
        )

    duplicates = analyzer.detect_duplicate_ssids(networks)

    for dup in duplicates:
        for net in dup["networks"]:
            net["risk_score"] = min(
                net["risk_score"] + 30, 100
            )
            net["risk_level"] = "Dangerous"
            net["risk_color"] = "#DC2626"
            net["risk_icon"] = "⛔"
            net["risk_class"] = "dangerous"
            net["analysis"].append(dup["warning"])

    analyzer.save_history(networks)

    last_scan = networks
    last_scan_time = datetime.now().isoformat()

    return jsonify({
        "networks": networks,
        "duplicates": duplicates,
        "timestamp": last_scan_time,
        "stats": analyzer.get_network_stats(networks)
    })


# Scan history
@app.route("/api/history")
def get_history():
    return jsonify(analyzer.load_history())


# History graph
@app.route("/api/history_graph")
def get_history_graph():
    img = analyzer.generate_history_graph()
    return jsonify({"graph": img})


# Generate password
@app.route("/api/password/generate")
def generate_password():
    length = request.args.get("length", 16, type=int)

    # Limit length to a reasonable range
    length = max(8, min(length, 128))

    use_upper = request.args.get("upper", "true") == "true"
    use_lower = request.args.get("lower", "true") == "true"
    use_digits = request.args.get("digits", "true") == "true"
    use_symbols = request.args.get("symbols", "true") == "true"

    password = password_generator.generate_password(
        length,
        use_upper,
        use_lower,
        use_digits,
        use_symbols
    )

    strength = password_generator.check_strength(password)

    return jsonify({
        "password": password,
        "strength": strength
    })


# Check password strength
@app.route("/api/password/check")
def check_password():
    password = request.args.get("password", "")

    if not password:
        return jsonify({
            "error": "No password provided"
        }), 400

    strength = password_generator.check_strength(password)

    return jsonify(strength)


# Quiz page
@app.route("/quiz.html")
def quiz():
    return send_from_directory(
        str(QUIZ_DIR),
        "quiz.html"
    )


# Run locally
if __name__ == "__main__":
    print("Starting Wi-Fi Security Dashboard...")
    print("Open: http://127.0.0.1:5000")
    app.run(
        debug=True,
        host="127.0.0.1",
        port=5000
    )
