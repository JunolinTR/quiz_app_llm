const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ROUTES
const quizRoute = require("./routes/quizRoute");
const questionRoute = require("./routes/QuestionRoute");
const pdfUploadRoute = require("./routes/llmQuiz"); // <--- this must match your file name

app.use("/create-quiz", quizRoute);
app.use("/questions", questionRoute);
app.use("/api", pdfUploadRoute); // endpoint becomes /api/generate-quiz

// Debug route logger (optional but helpful)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.listen(5000, () => console.log("Server running on port 5000"));
