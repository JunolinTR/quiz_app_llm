const express = require("express");
const router = express.Router();
const multer = require("multer");
const pdfParse = require("pdf-parse");
const db = require("../models/db");

// Setup file upload using multer
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.post("/upload-pdf", upload.single("pdf"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    try {
        const data = await pdfParse(req.file.buffer);
        const text = data.text;

        const quizTitle = "PDF Imported Quiz"; // You can modify this or get from client
        const lines = text.split("\n").map(line => line.trim()).filter(line => line);

        let questions = [];
        let currentQuestion = null;

        lines.forEach(line => {
            if (/^\d+\.\s/.test(line)) {
                if (currentQuestion) {
                    questions.push(currentQuestion);
                }
                currentQuestion = {
                    question: line.replace(/^\d+\.\s/, ""),
                    options: []
                };
            } else if (/^[A-D]\.\s/.test(line)) {
                currentQuestion?.options.push(line.replace(/^[A-D]\.\s/, ""));
            } else if (/^Answer:\s?[A-D]/.test(line)) {
                const answerLetter = line.split(":")[1].trim();
                const correctOption = ["A", "B", "C", "D"].indexOf(answerLetter) + 1;
                currentQuestion.correctOption = correctOption;
            }
        });

        if (currentQuestion) questions.push(currentQuestion);

        // Save quiz to DB
        const quizQuery = "INSERT INTO quizzes (title, no_of_qns) VALUES (?, ?)";
        db.query(quizQuery, [quizTitle, questions.length], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });

            const quizId = result.insertId;

            const questionQuery = `
                INSERT INTO questions 
                (quiz_id, question_text, option1, option2, option3, option4, correct_option) 
                VALUES ?
            `;

            const values = questions.map(q => [
                quizId,
                q.question,
                q.options[0],
                q.options[1],
                q.options[2],
                q.options[3],
                q.correctOption
            ]);

            db.query(questionQuery, [values], (err) => {
                if (err) return res.status(500).json({ error: err.message });
                res.status(201).json({ message: "PDF quiz uploaded and saved successfully!" });
            });
        });

    } catch (err) {
        console.error("PDF processing error:", err);
        res.status(500).json({ error: "Failed to parse and store PDF" });
    }
});

module.exports = router;
