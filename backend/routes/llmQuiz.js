const express = require('express');
const multer = require('multer');
const quizController = require('../controllers/llmQuizController');

const router = express.Router();

// Configure Multer to store uploaded PDFs in the "uploads" folder
const upload = multer({ dest: 'uploads/' });

// POST /api/generate-quiz
router.post('/generate-quiz', upload.single('pdf'), quizController.generateQuizFromPDF);

module.exports = router;
