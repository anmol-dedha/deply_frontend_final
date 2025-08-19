import React, { useState } from "react";
import { marked } from "marked"; // for markdown rendering

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [micOn, setMicOn] = useState(false);
  const [isTyping, setIsTyping] = useState(false); // NEW

  // 🔹 Send message to backend
  const handleSend = async () => {
    if (!input.trim()) return;

    setMessages([...messages, { sender: "user", text: input }]);
    setIsTyping(true); // show typing indicator

    try {
      const response = await fetch("https://backend-fy14.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: data.reply || "No response from server.",
          type: data.type || "text",
          location: data.location,
          temp: data.temp,
          desc: data.desc,
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to backend.", type: "text" },
      ]);
    }

    setInput("");
    setIsTyping(false); // hide typing indicator
  };

  // 🔹 Mic input (speech-to-text)
  const handleMic = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "hi-IN";
    recognition.start();
    setMicOn(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onend = () => setMicOn(false);
  };

  // 🔹 Text-to-speech (speak bot reply)
  const speak = (text) => {
    const cleanedText = text.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, ""); // remove emojis

    if (!cleanedText.trim()) return;

    const utterance = new SpeechSynthesisUtterance(cleanedText);
    utterance.lang = /[\u0900-\u097F]/.test(cleanedText) ? "hi-IN" : "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="chat-container">
      <h1>🧑‍🌾 AnnaData AI - किसानों की सेवा में</h1>

      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg ${msg.sender}`}>
            <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong>{" "}
            {msg.type === "weather" ? (
              <div className="weather-widget">
                <h3>{msg.location}</h3>
                <p>🌡️ {msg.temp}°C</p>
                <p>🌤️ {msg.desc}</p>
              </div>
            ) : (
              <span
                dangerouslySetInnerHTML={{ __html: marked(msg.text || "") }}
              />
            )}
            {msg.sender === "bot" && msg.type !== "weather" && (
              <button onClick={() => speak(msg.text)}>🔊</button>
            )}
          </div>
        ))}

        {/* 👇 Typing Indicator */}
        {isTyping && (
          <div className="typing-indicator">
            Bot is typing<span className="dots">...</span>
          </div>
        )}
      </div>

      <div className="input-box">
        <input
          type="text"
          value={input}
          placeholder="अपना सवाल पूछिए..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleMic} className={micOn ? "mic-on" : ""}>
          🎤
        </button>
        <button onClick={handleSend}>भेजें</button>
      </div>
    </div>
  );
}

export default App;
