const fs = require('fs');
const pdfParse = require('pdf-parse');
const axios = require('axios');
const path = require('path');

exports.generateQuizFromPDF = async (req, res) => {
  try {
    const pdfPath = req.file.path;

    // Step 1: Extract text from the PDF asynchronously
    const dataBuffer = await fs.promises.readFile(pdfPath);
    const pdfData = await pdfParse(dataBuffer);
    const extractedText = pdfData.text;

    // Validate if the extracted text is valid
    if (!extractedText || extractedText.trim().length < 100) {
      return res.status(400).json({ error: 'PDF content is too short or empty to generate questions.' });
    }

    // Step 2: Prepare the prompt for LLM
    const prompt = `You are an educational AI. From the following text, generate 5 MCQs (multiple-choice questions) with:
- question
- 4 options labeled A, B, C, D
- correct answer key

Text:
""" 
${extractedText}
"""

Respond in JSON format:
[
  {
    "question": "...",
    "options": {
      "A": "...",
      "B": "...",
      "C": "...",
      "D": "..."
    },
    "correct": "A"
  },
  ...
]
    `;

    // Step 3: Call Ollama (localhost API) to generate questions
    try {
      const ollamaResponse = await axios.post('http://localhost:11434/api/generate', {
        model: 'phi',
        prompt: prompt,
        stream: false
      });
      console.log("LLM Response:", ollamaResponse.data);
    } catch (axiosError) {
      console.error("Error with Axios request:", axiosError);
      return res.status(500).json({ error: 'Failed to contact Ollama API.' });
    }
    

    const responseText = ollamaResponse.data.response;

    // Step 4: Parse the JSON response from LLM
    let questions;
    try {
      const jsonStart = responseText.indexOf('[');
      const jsonEnd = responseText.lastIndexOf(']') + 1;
      const jsonString = responseText.substring(jsonStart, jsonEnd);
      questions = JSON.parse(jsonString);
    } catch (err) {
      return res.status(500).json({ error: 'Failed to parse questions from LLM response.' });
    }

    // Step 5: Delete the uploaded PDF file after processing
    try {
      await fs.promises.unlink(pdfPath);
    } catch (err) {
      console.warn("Could not delete temp file:", err);
    }

    // Step 6: Send the generated questions to the frontend
    res.json({ questions });

  } catch (error) {
    console.error("LLM generation error:", error);
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
};
