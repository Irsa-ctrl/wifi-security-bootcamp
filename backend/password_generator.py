"""
Password Generator & Strength Checker
"""

import secrets
import string
import re

def generate_password(length=16, use_upper=True, use_lower=True, 
                      use_digits=True, use_symbols=True):
    """Generate a strong random password"""
    chars = ''
    if use_upper:
        chars += string.ascii_uppercase
    if use_lower:
        chars += string.ascii_lowercase
    if use_digits:
        chars += string.digits
    if use_symbols:
        chars += "!@#$%^&*()-_=+[]{}|;:,.<>?"
    
    if not chars:
        chars = string.ascii_letters + string.digits
    
    return ''.join(secrets.choice(chars) for _ in range(length))

def check_strength(password):
    """Check password strength and return score with feedback"""
    score = 0
    feedback = []
    
    # Length check
    if len(password) >= 8:
        score += 1
    else:
        feedback.append("❌ Too short (min 8 characters)")
    
    if len(password) >= 12:
        score += 1
    if len(password) >= 16:
        score += 1
    
    # Character checks
    if re.search(r'[a-z]', password) and re.search(r'[A-Z]', password):
        score += 1
    else:
        feedback.append("❌ Add both uppercase and lowercase letters")
    
    if re.search(r'\d', password):
        score += 1
    else:
        feedback.append("❌ Add numbers")
    
    if re.search(r'[!@#$%^&*()\-_=+\[\]{}|;:,.<>?]', password):
        score += 1
    else:
        feedback.append("❌ Add special characters (!@#$%^&*)")
    
    # Pattern checks (common patterns)
    common_patterns = ['123456', 'password', 'qwerty', 'abc123', 
                       'admin', 'letmein', 'welcome', 'monkey']
    if any(pattern in password.lower() for pattern in common_patterns):
        score -= 1
        feedback.append("⚠️ Contains common pattern")
    
    # Determine strength
    if score >= 5:
        strength = "🟢 Strong"
        color = "#22C55E"
        message = "✅ Great password!"
    elif score >= 3:
        strength = "🟡 Medium"
        color = "#FACC15"
        message = "⚠️ Could be stronger"
    else:
        strength = "🔴 Weak"
        color = "#EF4444"
        message = "❌ Please use a stronger password"
    
    return {
        'strength': strength,
        'color': color,
        'score': score,
        'max_score': 6,
        'feedback': feedback,
        'message': message
    }
