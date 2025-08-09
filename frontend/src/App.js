import React, { useState } from "react";

function PasswordInput() {
  const [showPassword, setShowPassword] = useState(false);
  const [value, setValue] = useState("");
  const [roast, setRoast] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchRoast = async () => {
    if (!value) {
      alert("Please type something to roast 😏");
      return;
    }
    try {
      setLoading(true);
      // If you added "proxy" in package.json, use "/roast"
      // Otherwise, replace with "http://localhost:5000/roast"
      const res = await fetch("/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: value }),
      });

      if (!res.ok) {
        throw new Error(`Server error: ${res.statusText}`);
      }

      const data = await res.json();
      setRoast(data.reply);

      // Speak the roast aloud
      const synth = window.speechSynthesis;
      const utter = new SpeechSynthesisUtterance(data.reply);
      synth.speak(utter);

    } catch (err) {
      console.error(err);
      setRoast("Oops! Can't roast right now 😬");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at 80% 20%, #fff176 10%, #f06292 76%, #64b5f6 100%)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Comic Neue', Comic Sans MS, cursive, sans-serif",
      }}
    >
      <div
        style={{
          background: "rgba(255,255,255,0.85)",
          borderRadius: "20px",
          boxShadow: "0 8px 32px rgba(160, 110, 220, 0.2)",
          padding: "40px 30px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          border: "3px dashed #f06292",
        }}
      >
        <h2
          style={{
            margin: "0 0 24px",
            color: "#5e35b1",
            fontWeight: 700,
            fontSize: 26,
          }}
        >
          🔒 Roast Portal of Doom! 😂
        </h2>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ position: "relative" }}>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type={showPassword ? "text" : "password"}
              placeholder={showPassword ? "😲 Password exposed!" : "🤫 Your secret..."}
              style={{
                width: "260px",
                padding: "0 40px 0 16px",
                height: "45px",
                fontSize: "18px",
                borderRadius: "25px",
                border: "2px solid #fff176",
                outline: "none",
                background: "linear-gradient(90deg, #f3e5f5, #fffde7)",
              }}
            />
            <span
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                fontSize: "22px",
                userSelect: "none",
              }}
              aria-label={showPassword ? "Hide password" : "Show password"}
              role="button"
              tabIndex={0}
              onKeyPress={(e) => {
                if (e.key === "Enter" || e.key === " ") setShowPassword(!showPassword);
              }}
            >
              {showPassword ? "🙈" : "👁️"}
            </span>
          </div>

          <button
            onClick={fetchRoast}
            disabled={loading}
            style={{
              background: "#ff5722",
              color: "#fff",
              border: "none",
              borderRadius: "25px",
              padding: "10px 18px",
              fontSize: "16px",
              cursor: "pointer",
              fontWeight: "bold",
              boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
            }}
          >
            {loading ? "🔥..." : "Enter"}
          </button>
        </div>

        {roast && (
          <p
            style={{
              marginTop: "20px",
              color: "#d84315",
              fontWeight: "bold",
              fontSize: "20px",
              textAlign: "center",
            }}
          >
            {roast}
          </p>
        )}
      </div>
    </div>
  );
}

export default PasswordInput;
