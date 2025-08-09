from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)

# Fix CORS to allow your Vercel domain
CORS(app, resources={
    r"/*": {
        "origins": [
            "https://useless-project-temp-livid.vercel.app",
            "https://useless-project-temp-n7rc3vk7m-kajal1704s-projects.vercel.app",
            "http://localhost:3000", 
            "http://localhost:3001", 
            "http://localhost:3002"
        ],
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept"]
    }
})

# Configure the Gemini API - USE ENVIRONMENT VARIABLE
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    print("ERROR: GEMINI_API_KEY environment variable not set!")
    # Fallback for development only - REMOVE THIS IN PRODUCTION
    api_key = "AIzaSyD3oHw59DwXxNrqou_c0WgSM_glC6BKpRc"

genai.configure(api_key=api_key)

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
        
        return jsonify({"reply": roast_reply})
        
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({"reply": "Oops! Couldn't generate a roast this time. Try again!"}), 500

@app.route("/roast", methods=["GET"])
def roast_get():
    return jsonify({"message": "This endpoint expects a POST request with password data"}), 200

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "WiFi Password Roasting API is running!"})

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "WiFi Password Roasting API is running!"})

# Handle CORS preflight requests
@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = jsonify({"message": "OK"})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add('Access-Control-Allow-Headers', "Content-Type,Accept")
        response.headers.add('Access-Control-Allow-Methods', "GET,POST,OPTIONS")
        return response

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting server on port {port}")
    app.run(host="0.0.0.0", port=port, debug=False)