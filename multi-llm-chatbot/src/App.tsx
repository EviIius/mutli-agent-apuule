import React, { useState } from 'react';
import './App.css';
import LandingPage from './LandingPage';
import Chat from './Chat';

function App() {
  // Whether to show the landing page or the chat
  const [showLanding, setShowLanding] = useState(true);
  // The very first message typed on the landing page
  const [initialMessage, setInitialMessage] = useState('');

  // Handle the user sending a message from the landing page
  const handleLandingMessage = (message: string) => {
    setInitialMessage(message);
    setShowLanding(false);
  };

  return (
    <div className="App">
      {showLanding ? (
        <LandingPage onSendFirstMessage={handleLandingMessage} />
      ) : (
        <Chat initialMessage={initialMessage} />
      )}
    </div>
  );
}

export default App;
