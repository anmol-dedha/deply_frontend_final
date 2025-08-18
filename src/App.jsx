import React, { useState } from "react";

function App() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  const handleSend = async () => {
    if (!input.trim()) return;

    // Add user message
    setMessages([...messages, { sender: "user", text: input }]);

    try {
      const response = await fetch("https://your-backend.onrender.com/chat", {
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
        { sender: "bot", text: "Error connecting to backend." },
      ]);
    }

    setInput("");
  };

  return (
    <div className="chat-container">
      <h1>🌱 AnnaData Chatbot</h1>
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={`msg ${msg.sender}`}>
            <strong>{msg.sender === "user" ? "You" : "Bot"}:</strong>{" "}
            {msg.text}
          </div>
        ))}
      </div>

      <div className="input-box">
        <input
          type="text"
          value={input}
          placeholder="Ask me about farming..."
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default App;
