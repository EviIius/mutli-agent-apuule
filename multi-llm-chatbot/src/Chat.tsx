import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  debugInfo?: string;
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
}

interface ChatProps {
  initialMessage?: string;
}

const GEMINI_API_KEY = "put_your_api_key_here"; // Replace with your actual API key

const modelCapabilities: Record<string, string> = {
  'models/gemini-1.5-pro-latest': 'Gemini 1.5 Pro: 2M tokens, 8K output, multimodal',
  'models/gemini-1.5-flash-001': 'Gemini 1.5 Flash: 1M tokens, fast + multimodal',
  'models/gemini-2.0-flash-001': 'Gemini 2.0 Flash: 1M tokens, versatile multimodal',
};

const Chat: React.FC<ChatProps> = ({ initialMessage = '' }) => {
  const llmOptions = [
    { label: 'Gemini 1.5 Pro', value: 'models/gemini-1.5-pro-latest' },
    { label: 'Gemini 1.5 Flash', value: 'models/gemini-1.5-flash-001' },
    { label: 'Gemini 2.0 Flash', value: 'models/gemini-2.0-flash-001' },
  ];

  const [selectedLLM, setSelectedLLM] = useState<string>(llmOptions[0].value);
  const [previousLLM, setPreviousLLM] = useState<string>(llmOptions[0].value);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [botTyping, setBotTyping] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([
    { id: 1, title: 'New Conversation', messages: [] },
  ]);
  const [selectedConversationId, setSelectedConversationId] = useState<number>(1);
  const [input, setInput] = useState<string>('');
  const [hasUsedInitialMessage, setHasUsedInitialMessage] = useState(false);

  const chatWindowRef = useRef<HTMLDivElement>(null);
  const selectedConversation = conversations.find(
    (conv) => conv.id === selectedConversationId
  );

  useEffect(() => {
    if (initialMessage && !hasUsedInitialMessage) {
      setHasUsedInitialMessage(true);
      const userMsg: Message = {
        text: initialMessage,
        sender: 'user',
        timestamp: Date.now(),
      };
      setBotTyping(true);
      handleSendMessage(userMsg.text, userMsg);
    }
  }, [initialMessage, hasUsedInitialMessage, selectedLLM]);

  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages, botTyping]);

  useEffect(() => {
    if (selectedLLM !== previousLLM) {
      const newId =
        conversations.length > 0
          ? Math.max(...conversations.map((c) => c.id)) + 1
          : 1;
      const newConversation: Conversation = {
        id: newId,
        title: `Switched to ${llmOptions.find((l) => l.value === selectedLLM)?.label}`,
        messages: [
          {
            text: `Switched to ${llmOptions.find((l) => l.value === selectedLLM)?.label}`,
            sender: 'bot',
            timestamp: Date.now(),
            debugInfo: modelCapabilities[selectedLLM],
          },
        ],
      };
      setConversations((prev) => [newConversation, ...prev]);
      setSelectedConversationId(newId);
      setPreviousLLM(selectedLLM);
    }
  }, [selectedLLM]);

  const updateConversationMessages = (...msgs: Message[]) => {
    if (!selectedConversation) return;
    const updatedMessages = [...selectedConversation.messages, ...msgs];
    let updatedTitle = selectedConversation.title;
    if (selectedConversation.messages.length === 0) {
      const firstUserMsg = msgs.find((m) => m.sender === 'user');
      if (firstUserMsg) {
        updatedTitle =
          firstUserMsg.text.substring(0, 50) +
          (firstUserMsg.text.length > 50 ? '...' : '');
      }
    }
    const updatedConversation: Conversation = {
      ...selectedConversation,
      messages: updatedMessages,
      title: updatedTitle,
    };
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversation.id ? updatedConversation : conv
      )
    );
  };

  const handleSendMessage = async (textOverride?: string, messageOverride?: Message) => {
    const userText = textOverride ?? input;
    if (!userText.trim() || !selectedConversation) return;
    const userMsg: Message = messageOverride ?? {
      text: userText,
      sender: 'user',
      timestamp: Date.now(),
    };
    setBotTyping(true);
    if (!messageOverride) setInput('');

    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/${selectedLLM}:generateContent?key=${GEMINI_API_KEY}`;
      console.log('Calling:', endpoint);
      const geminiResponse = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userMsg.text }] }],
        }),
      });
      const data = await geminiResponse.json();
      console.log('Gemini Response:', data);
      const botReply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        data?.candidates?.[0]?.content?.parts?.[0] ||
        JSON.stringify(data);

      const botMsg: Message = {
        text: botReply,
        sender: 'bot',
        timestamp: Date.now(),
        debugInfo: `Model: ${selectedLLM}\n${modelCapabilities[selectedLLM]}`,
      };
      updateConversationMessages(userMsg, botMsg);
    } catch (error: any) {
      const errorMsg: Message = {
        text: `Error calling Gemini API: ${error.message || error.toString()}`,
        sender: 'bot',
        timestamp: Date.now(),
      };
      updateConversationMessages(userMsg, errorMsg);
    } finally {
      setBotTyping(false);
    }
  };

  const handleNewChat = () => {
    const newId =
      conversations.length > 0
        ? Math.max(...conversations.map((c) => c.id)) + 1
        : 1;
    const newConversation: Conversation = {
      id: newId,
      title: 'New Conversation',
      messages: [],
    };
    setConversations((prev) => [newConversation, ...prev]);
    setSelectedConversationId(newId);
  };

  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    setSidebarOpen(false);
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleExport = () => {
    if (!selectedConversation) return;
    const textContent = selectedConversation.messages
      .map((m) => `${m.sender}: ${m.text}`)
      .join('\n');
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'conversation.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`app-container ${theme}`}>
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <button className="close-sidebar-btn" onClick={() => setSidebarOpen(false)}>
          ✕
        </button>
        <ul className="conversation-list">
          {conversations.map((conv) => (
            <li
              key={conv.id}
              className={`conversation-item ${
                conv.id === selectedConversationId ? 'active' : ''
              }`}
              data-full-title={conv.title}
              onClick={() => handleSelectConversation(conv.id)}
            >
              {conv.title}
            </li>
          ))}
        </ul>
      </aside>

      <div className="chat-main">
        <header className="top-bar">
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
          </button>
          <button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button>
          <select
            className="llm-select"
            value={selectedLLM}
            onChange={(e) => setSelectedLLM(e.target.value)}
          >
            {llmOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>

        <div className="chat-window" ref={chatWindowRef}>
          {selectedConversation?.messages.map((msg, idx) => {
            const isLast = idx === selectedConversation.messages.length - 1;
            const isBot = msg.sender === 'bot';
            return (
              <div key={idx} className={`message ${msg.sender}`}>
                <div className="message-text">
                  {msg.text}
                  {msg.debugInfo && (
                    <pre className="debug-info">{msg.debugInfo}</pre>
                  )}
                </div>
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
                {isBot && isLast && (
                  <div className="export-under-bubble">
                    <button className="export-btn" onClick={handleExport}>
                      Export
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          {botTyping && (
            <div className="typing-indicator">
              <div className="spinner">
                <div className="dot dot1"></div>
                <div className="dot dot2"></div>
                <div className="dot dot3"></div>
              </div>
            </div>
          )}
        </div>

        <div className="chat-input">
          <input
            type="text"
            placeholder="Type your message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSendMessage();
            }}
          />
          <button onClick={() => handleSendMessage()}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
