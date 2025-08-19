import React, { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [micOn, setMicOn] = useState(false);

  // 🔹 Send message to backend
  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { sender: "user", text: input }]);

    try {
      const response = await fetch("https://backend-fy14.onrender.com/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.reply || "No response from server." },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Error connecting to backend." },
      ]);
    }

    setInput("");
  };

  // 🔹 Mic input (speech-to-text)
  const handleMic = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "hi-IN"; // Hindi
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
  // Remove emojis, keep only letters, numbers, punctuation, and spaces
  const cleanedText = text.replace(/[^\p{L}\p{N}\p{P}\p{Z}]/gu, "");

  if (!cleanedText.trim()) return; // Don't speak if nothing left

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  // Auto-detect Hindi vs English
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
            {msg.text}
            {msg.sender === "bot" && (
              <button onClick={() => speak(msg.text)}>🔊</button>
            )}
          </div>
        ))}
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
