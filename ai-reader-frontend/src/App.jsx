import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import './App.css';

function App() {
  const [question, setQuestion] = useState('');
  const [file, setFile] = useState(null);
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! Upload a file and ask me anything about it.' }
  ]);
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!question.trim() && !file) return;

    const newMessages = [...messages, { sender: 'user', text: question || (file ? `Attached: ${file.name}` : "Message") }];
    setMessages(newMessages);
    setLoading(true);

    const formData = new FormData();
    formData.append("question", question.trim() || "Describe this file");

    if (file) {
      formData.append("file", file);
    }

    try {
      const response = await axios.post('http://localhost:8083/api/ai/ask', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const aiText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "No answer.";
      setMessages(prev => [...prev, { sender: 'ai', text: aiText }]);

    } catch (error) {
      let errorMessage = "Something went wrong.";

      if (error.response) {
        if (error.response.status === 429) {
          errorMessage = "⏳ Too many requests! Please wait 1 minute (Free Tier Limit).";
        } else if (error.response.status === 500) {
          errorMessage = "⚠️ Server Error. The backend is having trouble.";
        } else {
          errorMessage = `Error (${error.response.status}): ${error.response.data || error.message}`;
        }
      } else {
        errorMessage = "❌ Server is not responding. Please try again later.";
      }

      setMessages(prev => [...prev, { sender: 'ai', text: errorMessage }]);
    } finally {
      setLoading(false);
      setQuestion('');
      setFile(null);

      if (document.getElementById('file-input')) {
        document.getElementById('file-input').value = "";
      }
    }
  };

  return (
    <div className="app-container">
      <header>
        <h2>📄 AI File Reader</h2>
      </header>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">
              <div className={`avatar ${msg.sender}`}>{msg.sender === 'ai' ? 'AI' : 'You'}</div>
              <div className="text">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="message ai">
            <div className="message-content">
              <div className="avatar ai">AI</div>
              <div className="text">Thinking...</div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="input-area">
        <div className="input-container">
          <input
            id="file-input"
            type="file"
            accept="image/*, application/pdf"
            onChange={(e) => {
              const selectedFile = e.target.files[0];

              if (selectedFile) {
                if (selectedFile.type.startsWith("image/") || selectedFile.type === "application/pdf") {
                  setFile(selectedFile);
                } else {
                  alert("Sorry, only Images and PDFs are allowed!");
                  e.target.value = "";
                }
              }
            }}
            style={{ color: '#ccc' }}
          />

          <textarea
            placeholder="Ask something..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button onClick={handleSend} disabled={loading}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default App;