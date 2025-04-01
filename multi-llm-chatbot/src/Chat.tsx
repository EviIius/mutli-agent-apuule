import React, { useState, useEffect, useRef } from 'react';
import './Chat.css';

interface Message {
  text: string;
  sender: 'user' | 'bot';
  timestamp: number;
  // Optionally, add avatarUrl if needed
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
}

interface ChatProps {
  initialMessage?: string;
}

const Chat: React.FC<ChatProps> = ({ initialMessage = '' }) => {
  // LLM Options
  const llmOptions = [
    { label: 'OpenAI GPT-3.5', value: 'gpt-3.5' },
    { label: 'OpenAI GPT-4', value: 'gpt-4' },
    { label: 'Anthropic Claude', value: 'anthropic' },
    { label: 'Cohere Command', value: 'cohere-command' },
  ];
  const [selectedLLM, setSelectedLLM] = useState<string>(llmOptions[0].value);

  // Theme: "dark" or "light"
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Sidebar & UI States
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [botTyping, setBotTyping] = useState(false);

  // Conversations & Messages
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

  // Use the initial message from landing page if provided
  useEffect(() => {
    if (initialMessage && !hasUsedInitialMessage) {
      setHasUsedInitialMessage(true);
      const userMsg: Message = {
        text: initialMessage,
        sender: 'user',
        timestamp: Date.now(),
      };

      setBotTyping(true);
      setTimeout(() => {
        const botMsg: Message = {
          text: `Hello! This is a simulated response using ${selectedLLM}.`,
          sender: 'bot',
          timestamp: Date.now(),
        };
        updateConversationMessages(userMsg, botMsg);
        setBotTyping(false);
      }, 1500);
    }
  }, [initialMessage, hasUsedInitialMessage, selectedLLM]);

  // Auto-scroll on new messages or typing indicator change
  useEffect(() => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  }, [selectedConversation?.messages, botTyping]);

  // Update conversation messages and update title if it's a new conversation
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

  // Send a message
  const handleSendMessage = () => {
    if (!input.trim() || !selectedConversation) return;
    const userMsg: Message = {
      text: input,
      sender: 'user',
      timestamp: Date.now(),
    };
    setBotTyping(true);
    setInput('');
    setTimeout(() => {
      const botMsg: Message = {
        text: `Hello! This is a simulated response using ${selectedLLM}.`,
        sender: 'bot',
        timestamp: Date.now(),
      };
      updateConversationMessages(userMsg, botMsg);
      setBotTyping(false);
    }, 1500);
  };

  // Create new conversation
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

  // Select conversation from sidebar and optionally close sidebar
  const handleSelectConversation = (id: number) => {
    setSelectedConversationId(id);
    setSidebarOpen(false);
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Export current conversation as a text file
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

  // Toggle theme between dark and light
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className={`app-container ${theme}`}>
      {/* Sidebar */}
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
              onClick={() => handleSelectConversation(conv.id)}
            >
              {conv.title}
            </li>
          ))}
        </ul>
      </aside>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Top Bar */}
        <header className="top-bar">
          <button className="new-chat-btn" onClick={handleNewChat}>
            + New Chat
          </button>
          <button className="sidebar-toggle" onClick={toggleSidebar}>
            {sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
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
          <button className="export-btn" onClick={handleExport}>
            Export
          </button>
          <button className="theme-toggle-btn" onClick={toggleTheme}>
            {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </button>
        </header>

        {/* Chat Window */}
        <div className="chat-window" ref={chatWindowRef}>
          {selectedConversation?.messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.sender}`}>
              <div className="message-text">{msg.text}</div>
              <div className="message-timestamp">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
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

        {/* Chat Input */}
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
          <button onClick={handleSendMessage}>Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
