import React, { useState } from "react";

function WiFiPasswordSetter() {
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [validationMessage, setValidationMessage] = useState("");
  const [validating, setValidating] = useState(false);
  const [messageType, setMessageType] = useState(""); // "warning", "error", "info"

  const validatePassword = async () => {
    if (!password) {
      setValidationMessage("Password field cannot be empty");
      setMessageType("error");
      return;
    }

    // Check password length according to WiFi standards
    if (password.length < 8 || password.length > 63) {
      setValidationMessage("Password must be between 8-63 characters long");
      setMessageType("error");
      return;
    }

    try {
      setValidating(true);
      setValidationMessage("Validating password security...");
      setMessageType("info");

      // Simulate network validation delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Call Render backend for "validation" (actually roasting)
      const res = await fetch("https://useless-project-temp-bjll.onrender.com/roast", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Access-Control-Allow-Origin": "*"
        },
        body: JSON.stringify({ password }),
        mode: 'cors',
        credentials: 'omit'
      });

      if (!res.ok) {
        let errorMessage = `Server returned ${res.status}: ${res.statusText}`;
        try {
          const errorData = await res.json();
          if (errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (e) {
          // If JSON parsing fails, use the default error message
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      
      if (data.reply) {
        setValidationMessage(data.reply);
        setMessageType("warning");

        // Text-to-speech with more natural, sarcastic voice
        if ('speechSynthesis' in window) {
          const synth = window.speechSynthesis;
          const utterance = new SpeechSynthesisUtterance(data.reply);
          
          // Configure for more natural, sarcastic delivery
          utterance.rate = 0.85;
          utterance.pitch = 0.9;
          utterance.volume = 0.8;
          
          // Try to find a more natural voice
          const voices = synth.getVoices();
          const preferredVoice = voices.find(voice => 
            voice.name.includes('Google') || 
            voice.name.includes('Microsoft') ||
            voice.lang.startsWith('en')
          );
          if (preferredVoice) {
            utterance.voice = preferredVoice;
          }
          
          synth.speak(utterance);
        }
      } else {
        throw new Error("Invalid response from server");
      }

    } catch (err) {
      console.error("Validation error:", err);
      
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setValidationMessage("Unable to connect to password validation service. The server might be sleeping - please wait 30 seconds and try again.");
      } else if (err.message.includes('CORS')) {
        setValidationMessage("Network error: Cross-origin request blocked. Please try again.");
      } else if (err.message.includes('503') || err.message.includes('502')) {
        setValidationMessage("Service temporarily unavailable. The server is starting up - please wait 30-60 seconds and try again.");
      } else {
        setValidationMessage(err.message || "Password validation service is temporarily unavailable. Please try again later.");
      }
      setMessageType("error");
    } finally {
      setValidating(false);
    }
  };

  // Test backend connection
  const testConnection = async () => {
    try {
      setValidationMessage("Testing connection to backend...");
      setMessageType("info");
      
      const res = await fetch("https://useless-project-temp-bjll.onrender.com/health", {
        method: "GET",
        headers: { 
          "Accept": "application/json"
        },
        mode: 'cors',
        credentials: 'omit'
      });

      if (res.ok) {
        const data = await res.json();
        setValidationMessage("✅ Backend connection successful! " + (data.message || ""));
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

  const getMessageIcon = () => {
    switch (messageType) {
      case "warning":
        return "⚠️";
      case "error":
        return "❌";
      case "info":
        return "ℹ️";
      default:
        return "⚠️";
    }
  };

  const getMessageStyle = () => {
    switch (messageType) {
      case "warning":
        return {
          backgroundColor: "#fef3c7",
          borderColor: "#f59e0b",
          color: "#92400e"
        };
      case "error":
        return {
          backgroundColor: "#fee2e2",
          borderColor: "#ef4444",
          color: "#991b1b"
        };
      case "info":
        return {
          backgroundColor: "#dbeafe",
          borderColor: "#3b82f6",
          color: "#1e40af"
        };
      default:
        return {
          backgroundColor: "#fef3c7",
          borderColor: "#f59e0b",
          color: "#92400e"
        };
    }
  };

  const resetForm = () => {
    setPassword("");
    setValidationMessage("");
    setMessageType("");
  };

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
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        border: "1px solid #e2e8f0",
        width: "100%",
        maxWidth: "480px",
        padding: "32px"
      }}>
        {/* Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          marginBottom: "24px",
          paddingBottom: "16px",
          borderBottom: "1px solid #e2e8f0"
        }}>
          <div style={{
            backgroundColor: "#3b82f6",
            borderRadius: "8px",
            padding: "8px",
            marginRight: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }}>
            <span style={{ color: "white", fontSize: "16px" }}>📶</span>
          </div>
          <div>
            <h1 style={{
              fontSize: "18px",
              fontWeight: "600",
              color: "#1e293b",
              margin: "0",
              lineHeight: "1.2"
            }}>
              WiFi Network Configuration
            </h1>
            <p style={{
              fontSize: "14px",
              color: "#64748b",
              margin: "4px 0 0 0"
            }}>
              Set up your wireless network password
            </p>
          </div>
        </div>

        {/* Network Info */}
        <div style={{
          backgroundColor: "#f1f5f9",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "24px",
          display: "flex",
          alignItems: "center"
        }}>
          <span style={{ marginRight: "8px", fontSize: "14px" }}>⚙️</span>
          <div>
            <div style={{ fontSize: "14px", fontWeight: "500", color: "#374151" }}>
              Network: HomeNetwork_5GHz
            </div>
            <div style={{ fontSize: "12px", color: "#6b7280" }}>
              Security: WPA2-Personal
            </div>
          </div>
        </div>

        {/* Test Connection Button */}
        <div style={{ marginBottom: "16px", textAlign: "center" }}>
          <button
            onClick={testConnection}
            style={{
              padding: "8px 16px",
              fontSize: "12px",
              fontWeight: "500",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              backgroundColor: "#f9fafb",
              color: "#374151",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
          >
            🔧 Test Backend Connection
          </button>
        </div>

        {/* Password Input */}
        <div style={{ marginBottom: "20px" }}>
          <label style={{
            display: "block",
            fontSize: "14px",
            fontWeight: "500",
            color: "#374151",
            marginBottom: "8px"
          }}>
            Network Password *
          </label>
          <div style={{ position: "relative" }}>
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder="Enter your network password"
              style={{
                width: "100%",
                padding: "12px 40px 12px 16px",
                fontSize: "14px",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                outline: "none",
                backgroundColor: "white",
                transition: "border-color 0.2s",
                boxSizing: "border-box"
              }}
              onFocus={(e) => e.target.style.borderColor = "#3b82f6"}
              onBlur={(e) => e.target.style.borderColor = "#d1d5db"}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && password && !validating) {
                  validatePassword();
                }
              }}
            />
            <button
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "12px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280",
                padding: "4px"
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <p style={{
            fontSize: "12px",
            color: "#6b7280",
            marginTop: "6px",
            margin: "6px 0 0 0"
          }}>
            Password must be 8-63 characters long
          </p>
        </div>

        {/* Validation Message */}
        {validationMessage && (
          <div style={{
            ...getMessageStyle(),
            border: "1px solid",
            borderRadius: "8px",
            padding: "12px 16px",
            marginBottom: "20px",
            display: "flex",
            alignItems: "flex-start",
            fontSize: "14px",
            lineHeight: "1.5"
          }}>
            <div style={{ marginRight: "8px", marginTop: "2px", flexShrink: 0 }}>
              {getMessageIcon()}
            </div>
            <div>{validationMessage}</div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{
          display: "flex",
          gap: "12px",
          justifyContent: "flex-end"
        }}>
          <button
            onClick={resetForm}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "500",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              backgroundColor: "white",
              color: "#374151",
              cursor: "pointer",
              transition: "all 0.2s"
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = "#f9fafb";
              e.target.style.borderColor = "#9ca3af";
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = "white";
              e.target.style.borderColor = "#d1d5db";
            }}
          >
            Cancel
          </button>
          <button
            onClick={validatePassword}
            disabled={validating || !password || password.length < 8 || password.length > 63}
            style={{
              padding: "10px 20px",
              fontSize: "14px",
              fontWeight: "500",
              border: "none",
              borderRadius: "8px",
              backgroundColor: (validating || !password || password.length < 8 || password.length > 63) ? "#9ca3af" : "#3b82f6",
              color: "white",
              cursor: (validating || !password || password.length < 8 || password.length > 63) ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              gap: "6px"
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = "#2563eb";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.backgroundColor = "#3b82f6";
              }
            }}
          >
            <span style={{ marginRight: "6px" }}>🛡️</span>
            {validating ? "Validating..." : "Apply Settings"}
          </button>
        </div>

        {/* Footer */}
        <div style={{
          marginTop: "24px",
          paddingTop: "16px",
          borderTop: "1px solid #e2e8f0",
          fontSize: "12px",
          color: "#6b7280",
          textAlign: "center"
        }}>
          Changes will be applied immediately after validation
        </div>
      </div>
    </div>
  );
}

export default WiFiPasswordSetter;