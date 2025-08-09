from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)
CORS(app, resources={r"/roast": {"origins": ["http://localhost:3000", "http://localhost:3001", "http://localhost:3002"]}})

# Configure the Gemini API
# Set your API key as an environment variable or replace with your actual key
genai.configure(api_key="AIzaSyD3oHw59DwXxNrqou_c0WgSM_glC6BKpRc")

# Initialize the model
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route("/roast", methods=["POST"])
def roast():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400
        
        password = data.get("password", "")
        if not password:
            return jsonify({"error": "Password field is required"}), 400
        
        prompt = f"""You are a quick-witted comedian who specializes in roasting terrible WiFi passwords.  
Make the roast clever, funny, and easy to understand, focusing mostly on mocking how bad or silly the password itself is.  
You can lightly roast the person, but keep it playful, not mean-spirited.  
Jokes can be about how easy it is to hack, how weird it looks, or how it sounds like a failed attempt at creating a new language.  
Never repeat the same roast, even for the same password.  
Keep it under 150 characters.  
Output only the roast, no explanations or extra text.
Password: "{password}"
Roast:"""
        
        # Generate content using Gemini
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=100,
                temperature=0.9,
            )
        )
        
        roast_reply = response.text.strip()
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({"reply": "Oops! Couldn't generate a roast this time. Try again!"}), 500
    
    return jsonify({"reply": roast_reply})

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy"})

if __name__ == "__main__":
    print("Starting server on http://localhost:5000")
    app.run(host="0.0.0.0", port=5000, debug=True)