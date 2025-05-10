const express = require("express");
const router = express.Router();
const db = require("../models/db"); // Ensure you import your DB connection

router.post("/create-quiz", (req, res) => {
    const { title, questions } = req.body;
    if (!title || !questions || questions.length === 0) {
        return res.status(400).json({ error: "Invalid data" });
    }

    // Insert quiz
    const quizQuery = "INSERT INTO quizzes (title, no_of_qns) VALUES (?, ?)";
    db.query(quizQuery, [title, questions.length], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });

        const quizId = result.insertId;
        const questionQuery =
            "INSERT INTO questions (quiz_id, question_text, option1, option2, option3, option4, correct_option) VALUES ?";
        
        const questionValues = questions.map((q) => [
            quizId,
            q.question,
            q.options[0],
            q.options[1],
            q.options[2],
            q.options[3],
            q.correctOption
        ]);

        db.query(questionQuery, [questionValues], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.status(201).json({ message: "Quiz created successfully" });
        });
    });
});

module.exports = router; // Corrected export
