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
          <button onClick={handleSend}>Get Started</button>
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
          <a
            href="https://github.com/developer1"
            target="_blank"
            rel="noopener noreferrer"
          >
            Developer1
          </a>
          |
          <a
            href="https://github.com/developer2"
            target="_blank"
            rel="noopener noreferrer"
          >
            Developer2
          </a>
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
