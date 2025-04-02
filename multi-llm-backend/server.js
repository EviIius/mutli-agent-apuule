// server.js
require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

// POST endpoint to handle chat requests with Gemini
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, selectedModel } = req.body;
    
    // Build the request payload for Gemini.
    // Adjust the parameter names and values according to Gemini's official documentation.
    const payload = {
      prompt: prompt,
      model: selectedModel || 'gemini-v1', // Use the selected model or default to 'gemini-v1'
      temperature: 0.7,
      max_tokens: 150,
      top_p: 0.9,
      frequency_penalty: 0.0,
      presence_penalty: 0.0
    };

    // Call Gemini's API using Axios
    const response = await axios.post(
      process.env.GEMINI_API_URL,
      payload,
      {
        headers: {
          'Authorization': `Bearer ${process.env.GEMINI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // Assuming Gemini returns the generated text in response.data.response
    res.json({ response: response.data.response });
  } catch (error) {
    console.error('Error calling Gemini API:', error.response ? error.response.data : error);
    res.status(500).json({ error: 'Failed to fetch response from Gemini' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
