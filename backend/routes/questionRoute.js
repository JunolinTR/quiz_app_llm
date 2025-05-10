const express = require("express");
const db = require("../models/db");
const router = express.Router();

// Get Questions for a Quiz
router.get("/:quizId", (req, res) => {
    db.query("SELECT * FROM questions WHERE quiz_id = ?", [req.params.quizId], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

module.exports = router;
