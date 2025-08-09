import React, { useState } from "react";

const API_BASE = process.env.REACT_APP_API_BASE; // Set in Vercel Environment Variables

function WiFiPasswordSetter() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [validating, setValidating] = useState(false);
  const [messageType, setMessageType] = useState(""); // "warning", "error", "info"

  // ---- VALIDATE PASSWORD ----
  const validatePassword = async () => {
    if (!password) {
      setValidationMessage("Password field cannot be empty");
      setMessageType("error");
      return;
    }

    if (password.length < 8 || password.length > 63) {
      setValidationMessage("Password must be between 8–63 characters long");
      setMessageType("error");
      return;
    }

    try {
      setValidating(true);
      setValidationMessage("Validating password security...");
      setMessageType("info");

      await new Promise(resolve => setTimeout(resolve, 800)); // Short simulated delay

      const res = await fetch(`${API_BASE}/roast`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify({ password }),
        mode: 'cors'
      });

      if (!res.ok) {
        let errorMessage = `Server returned ${res.status}: ${res.statusText}`;
        try {
          const errorData = await res.json();
          if (errorData.error) errorMessage = errorData.error;
        } catch {}
        throw new Error(errorMessage);
      }

      const data = await res.json();
      if (data.reply) {
        setValidationMessage(data.reply);
        setMessageType("warning");

        // --- Text-to-Speech ---
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(data.reply);
          utterance.rate = 0.85;
          utterance.pitch = 0.9;
          utterance.volume = 0.8;
          const voices = window.speechSynthesis.getVoices();
          const preferredVoice = voices.find(v => 
            v.name.includes('Google') || v.name.includes('Microsoft') || v.lang.startsWith('en')
          );
          if (preferredVoice) utterance.voice = preferredVoice;
          window.speechSynthesis.speak(utterance);
        }
      } else {
        throw new Error("Invalid response from server");
      }

    } catch (err) {
      console.error("Validation error:", err);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setValidationMessage("Unable to connect to backend. Server may be waking up — wait 30s and try again.");
      } else if (err.message.includes('CORS')) {
        setValidationMessage("CORS error: backend is not allowing this domain.");
      } else if (err.message.includes('503') || err.message.includes('502')) {
        setValidationMessage("Service temporarily unavailable — try again in 30–60s.");
      } else {
        setValidationMessage(err.message || "Password validation service is unavailable.");
      }
      setMessageType("error");
    } finally {
      setValidating(false);
    }
  };

  // ---- TEST BACKEND CONNECTION ----
  const testConnection = async () => {
    try {
      setValidationMessage("Testing connection to backend...");
      setMessageType("info");
      
      const res = await fetch(`${API_BASE}/health`, {
        method: "GET",
        headers: { "Accept": "application/json" },
        mode: 'cors'
      });

      if (res.ok) {
        const data = await res.json();
        setValidationMessage(`✅ Backend connection successful! ${data.message || ""}`);
        setMessageType("info");
      } else {
        setValidationMessage(`❌ Backend responded with ${res.status}: ${res.statusText}`);
        setMessageType("error");
      }
    } catch (err) {
      setValidationMessage(`❌ Connection failed: ${err.message}`);
      setMessageType("error");
    }
  };

  // ---- ICONS & STYLES ----
  const getMessageIcon = () => {
    switch (messageType) {
      case "warning": return "⚠️";
      case "error": return "❌";
      case "info": return "ℹ️";
      default: return "⚠️";
    }
  };

  const getMessageStyle = () => {
    switch (messageType) {
      case "warning": return { backgroundColor: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" };
      case "error": return { backgroundColor: "#fee2e2", borderColor: "#ef4444", color: "#991b1b" };
      case "info": return { backgroundColor: "#dbeafe", borderColor: "#3b82f6", color: "#1e40af" };
      default: return { backgroundColor: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" };
    }
  };

  const resetForm = () => {
    setPassword("");
    setValidationMessage("");
    setMessageType("");
  };

  // ---- UI ----
  return (
    <div style={{
      minHeight: "100vh",
      backgroundColor: "#f8fafc",
      backgroundImage: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      padding: "20px"
    }}>
      <div style={{
        backgroundColor: "white",
        borderRadius: "12px",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
        border: "1px solid #e2e8f0",
        width: "100%",
        maxWidth: "480px",
        padding: "32px"
      }}>
        
        {/* HEADER */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ backgroundColor: "#3b82f6", borderRadius: "8px", padding: "8px", marginRight: "12px" }}>
            <span style={{ color: "white" }}>📶</span>
          </div>
          <div>
            <h1 style={{ fontSize: "18px", fontWeight: "600", color: "#1e293b", margin: 0 }}>WiFi Network Configuration</h1>
            <p style={{ fontSize: "14px", color: "#64748b", margin: 0 }}>Set up your wireless network password</p>
          </div>
        </div>

        {/* NETWORK */}
        <div style={{ backgroundColor: "#f1f5f9", borderRadius: "8px", padding: "12px 16px", marginBottom: "24px", display: "flex", alignItems: "center" }}>
          <span style={{ marginRight: "8px" }}>⚙️</span>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>Network: HomeNetwork_5GHz</div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>Security: WPA2-Personal</div>
          </div>
        </div>

        {/* TEST BUTTON */}
        <div style={{ marginBottom: "16px", textAlign: "center" }}>
          <button onClick={testConnection} style={{
            padding: "8px 16px", fontSize: "12px", fontWeight: "500",
            border: "1px solid #d1d5db", borderRadius: "6px", backgroundColor: "#f9fafb",
            color: "#374151", cursor: "pointer"
          }}>🔧 Test Backend Connection</button>
        </div>

        {/* PASSWORD INPUT */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{ fontSize: "14px", fontWeight: "500", color: "#374151", marginBottom: "8px", display: "block" }}>
            Network Password *
          </label>
          <div style={{ position: "relative" }}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your network password"
              style={{
                width: "100%", padding: "12px 40px 12px 16px", fontSize: "14px",
                border: "1px solid #d1d5db", borderRadius: "8px", outline: "none"
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && password && !validating) validatePassword();
              }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer" }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <p style={{ fontSize: "12px", color: "#6b7280", marginTop: "6px" }}>Password must be 8–63 characters long</p>
        </div>

        {/* MESSAGE */}
        {validationMessage && (
          <div style={{
            ...getMessageStyle(),
            border: "1px solid",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex"
          }}>
            <div style={{ marginRight: "8px" }}>{getMessageIcon()}</div>
            <div>{validationMessage}</div>
          </div>
        )}

        {/* BUTTONS */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
          <button onClick={resetForm} style={{ padding: "10px 20px", border: "1px solid #d1d5db", borderRadius: "8px", backgroundColor: "white" }}>Cancel</button>
          <button
            onClick={validatePassword}
            disabled={validating || !password || password.length < 8 || password.length > 63}
            style={{
              padding: "10px 20px",
              borderRadius: "8px",
              border: "none",
              backgroundColor: (validating || !password || password.length < 8 || password.length > 63) ? "#9ca3af" : "#3b82f6",
              color: "white"
            }}
          >
            🛡️ {validating ? "Validating..." : "Apply Settings"}
          </button>
        </div>

        {/* FOOTER */}
        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: "1px solid #e2e8f0", fontSize: "12px", color: "#6b7280", textAlign: "center" }}>
          Changes will be applied immediately after validation
        </div>
      </div>
    </div>
  );
}

export default WiFiPasswordSetter;
