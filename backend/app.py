from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os

app = Flask(__name__)

# Allow only Vercel domain(s) + localhost for dev
allowed_origins = [
    "https://useless-project-temp-livid.vercel.app",
    "https://useless-project-temp-n7rc3vk7m-kajal1704s-projects.vercel.app",
    "http://localhost:3000",
    "http://localhost:3001",
    "http://localhost:3002"
]
CORS(app, resources={r"/*": {"origins": allowed_origins}}, supports_credentials=False)

# Configure Gemini API - MUST be in environment variables
api_key = os.getenv("GEMINI_API_KEY")
if not api_key:
    raise RuntimeError("GEMINI_API_KEY environment variable not set!")

genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

@app.route("/roast", methods=["POST"])
def roast():
    data = request.json
    if not data or not data.get("password"):
        return jsonify({"error": "Password field is required"}), 400
    
    password = data["password"]
    prompt = f"""You are a quick-witted comedian specializing in roasting terrible WiFi passwords...
    Password: "{password}"
    Roast:"""
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=100,
                temperature=0.9,
            )
        )
        return jsonify({"reply": response.text.strip()})
    except Exception as e:
        print(f"Error calling Gemini API: {e}")
        return jsonify({"reply": "Oops! Couldn't generate a roast this time. Try again!"}), 500

@app.route("/health", methods=["GET"])
def health_check():
    return jsonify({"status": "healthy", "message": "WiFi Password Roasting API is running!"})

@app.route("/", methods=["GET"])
def root():
    return jsonify({"message": "WiFi Password Roasting API is running!"})

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
