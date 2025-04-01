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

  return (
    <div className="landing-container">
      {/* Hero Section */}
      <div className="landing-hero">
        <h1 className="landing-title">Multi-App LLM</h1>
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
          <button onClick={handleSend}>Get Started</button>
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
        {/* Removed the "Explore More Features" button */}
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
