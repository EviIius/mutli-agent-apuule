# Multi-LLM Chatbot Project

This project aims to create a **multi-LLM (Large Language Model) chatbot** with a polished user experience across two main pages:

1. **Landing Page**  
   - A single-screen (no scrolling) hero section welcoming users.
   - Quick feature highlights showcasing key chatbot capabilities.
   - A footer with contact info and developer GitHub links.
   - Switchable between light and dark modes for improved accessibility.

2. **Chat Interface**  
   - A dedicated chat page where users can:
     - Select from multiple LLMs (once integrated on the backend).
     - Start new conversations or browse existing ones in a collapsible sidebar.
     - Send and receive messages with proper text wrapping, timestamps, and theming.
     - Toggle light/dark mode for better readability and personalization.

## Key Objectives

1. **Single-Screen Landing Page**  
   - No scrollbars, locked to `100vh` so all main elements are shown at once.
   - A welcoming hero area with a prompt to “Get Started” by typing a message.
   - A feature highlights section to briefly describe multi-LLM integration, real-time interaction, and conversation export.
   - A footer with contact information and GitHub links for developer reference.

2. **Themed Chat Interface**  
   - **Dark Mode** using deep charcoal grays and a vibrant accent color (cyan or blue).  
   - **Light Mode** using off-white backgrounds and matching accent color.  
   - Collapsible sidebar for conversation history and model selection.  
   - Timestamp legibility in both dark and light modes via dedicated CSS variables.  
   - A responsive message area with user and bot bubbles, plus micro-interactions (hover effects, button presses, tooltip truncation).

3. **Consistent Color Schemes**  
   - Both the landing page and the chat page share complementary dark/light color palettes.  
   - Scrollbars, buttons, timestamps, and text are styled for maximum contrast.

4. **User-Friendly Micro-Interactions**  
   - Subtle animations on hover (conversation items, feature cards).
   - Button press scaling for tactile feedback.
   - Fade/slide animations for incoming messages and page sections.

5. **Extendibility**  
   - Once the UI is finalized, the backend can be integrated to support multiple LLM APIs.  
   - The new chat “Get Started” button or input bar can be configured to pass the user’s query to the chatbot endpoint.

## Technologies & Structure

- **Frontend:**  
  - **TypeScript** for typed React components.  
  - **LandingPage.css / Chat.css** for styles.  
  - **Flexbox** to lock pages to a single screen or create collapsible sidebars.  
  - **CSS Variables** for easy theme switching between dark and light modes.

- **Backend (future integration):**  
  - A Node/Express server (or similar) that orchestrates calls to different LLM services (OpenAI, Anthropic, etc.).  
  - A secure API endpoint that accepts user messages, selected model, and returns LLM responses.

## Next Steps

1. **Finalize UI/UX**  
   - Verify all elements fit various screen sizes (especially the single-screen landing page).  
   - Ensure theming is consistent, with no unreadable text in either mode.
2. **Backend Integration**  
   - Implement a server route to handle user queries and pass them to the chosen LLM.  
   - Store chat history if desired (e.g., in a database).
3. **Deployment & Testing**  
   - Deploy the app to a hosting platform.  
   - Perform usability testing, gather feedback, and iterate.

---

With these designs, **users** will have a **smooth experience** from the moment they land on the page—seeing a quick overview of the chatbot’s capabilities—and then diving into a robust multi-LLM conversation on the dedicated chat page, seamlessly switching between dark and light themes.
