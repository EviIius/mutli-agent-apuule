import React, { useState } from 'react';
import './LandingPage.css';

interface LandingPageProps {
  onSendFirstMessage: (message: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onSendFirstMessage }) => {
  const [firstMessage, setFirstMessage] = useState('');

  const handleSend = () => {
    if (!firstMessage.trim()) return;
    onSendFirstMessage(firstMessage.trim());
  };

  const scrollToModels = () => {
    const section = document.getElementById('model-showcase-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="landing-container">
      {/* Sticky Header Navigation */}
      <header className="landing-nav">
        <h1 className="landing-title">Multi-App LLM</h1>
        <nav className="nav-buttons">
          {/* Removed arrow button; keep “View Models” only */}
          <button className="view-models-btn" onClick={scrollToModels}>View Models</button>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="landing-hero">
        <p className="landing-subtitle">
          Your AI companion awaits. Experience multi-LLM power at your fingertips.
        </p>
        <div className="landing-input-bar">
          <input
            type="text"
            placeholder="Type your first message..."
            value={firstMessage}
            onChange={(e) => setFirstMessage(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
          />
          {/* Move the arrow button here, next to the input */}
          <button onClick={handleSend} className="submit-arrow-btn">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="arrow-icon"
            >
              <path d="M15 11l-3-3m0 0l-3 3m3-3v8" />
              <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Feature Highlights Section */}
      <div className="feature-highlights">
        <h2>Features</h2>
        <div className="features">
          <div className="feature">
            <h3>Multi-LLM Integration</h3>
            <p>Access and compare responses from multiple leading LLMs seamlessly.</p>
          </div>
          <div className="feature">
            <h3>Real-time Interaction</h3>
            <p>Experience instant, dynamic conversations powered by AI.</p>
          </div>
          <div className="feature">
            <h3>Export Conversations</h3>
            <p>Save and share your chat history easily for future reference.</p>
          </div>
        </div>
      </div>

      {/* Model Info Section */}
      <div className="model-showcase" id="model-showcase-section">
        <h2>Supported LLMs</h2>
        <div className="model-grid">
          <div className="model-card">
            <h3>Gemini 1.5 Pro</h3>
            <p>2M context tokens, multimodal, 8K output</p>
          </div>
          <div className="model-card">
            <h3>Gemini 2.0 Flash</h3>
            <p>Fast inference, efficient 1M token handling</p>
          </div>
          <div className="model-card">
            <h3>Mistral Small</h3>
            <p>Lightweight, fast, open-source friendly</p>
          </div>
          <div className="model-card upcoming">
            <h3>Mistral Large</h3>
            <p><em>Coming Soon</em> — High-capacity performance</p>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <footer className="landing-footer">
        <p>Contact us at: <strong>dev@domain.com</strong></p>
        <p>
          Developer GitHubs:
          <a href="https://github.com/developer1" target="_blank" rel="noopener noreferrer">Developer1</a>
          |
          <a href="https://github.com/developer2" target="_blank" rel="noopener noreferrer">Developer2</a>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
