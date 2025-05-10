import { useState } from "react";

function QuizBuilder() {
    const [quizTitle, setQuizTitle] = useState("");
    const [numQuestions, setNumQuestions] = useState(0);
    const [questions, setQuestions] = useState([]);

    const handleGenerateFields = () => {
        setQuestions(Array.from({ length: numQuestions }, () => ({
            question: "",
            options: ["", "", "", ""],
            correctOption: ""
        })));
    };

    const handleChange = (index, field, value, optionIndex = null) => {
        const newQuestions = [...questions];
        
        if (field === "question" || field === "correctOption") {
            newQuestions[index][field] = field === "correctOption" ? parseInt(value, 10) || "" : value;
        } else if (field === "options" && optionIndex !== null) {
            const updatedOptions = [...newQuestions[index].options];
            updatedOptions[optionIndex] = value;
            newQuestions[index].options = updatedOptions;
        }

        setQuestions(newQuestions);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (!quizTitle.trim()) {
            alert("Please enter a quiz title.");
            return;
        }
    
        const quizData = { title: quizTitle, questions };
    
        try {
            // Update the URL here if necessary
            const response = await fetch("http://localhost:5000/create-quiz", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(quizData),
            });
    
            // Check if response is okay
            if (response.ok) {
                // Try to parse JSON response
                const data = await response.json();
                alert("Quiz created successfully!");
                setQuizTitle("");
                setNumQuestions(0);
                setQuestions([]);
            } else {
                // If response is not OK, alert the error message
                const errorData = await response.json(); // Make sure it's JSON
                alert("Error: " + errorData.error || "Unknown error occurred");
            }
        } catch (error) {
            // Catch any error related to the request itself
            console.error("Error submitting quiz:", error);
            alert("Failed to submit quiz.");
        }
    };
    
    return (
        <div>
            <h2>Quiz Builder</h2>
            <label>Quiz Title:</label>
            <input 
                type="text" 
                value={quizTitle} 
                onChange={(e) => setQuizTitle(e.target.value)} 
                required 
            />
            <br />
            <label>Enter number of questions: </label>
            <input 
                type="number" 
                value={numQuestions} 
                onChange={(e) => setNumQuestions(parseInt(e.target.value) || 0)}
                min="1"
            />
            <button onClick={handleGenerateFields}>Generate</button>
            
            {questions.length > 0 && (
                <form onSubmit={handleSubmit}>
                    {questions.map((q, i) => (
                        <div key={i} className="question-container">
                            <label>Question {i + 1}:</label>
                            <input 
                                type="text" 
                                value={q.question} 
                                onChange={(e) => handleChange(i, "question", e.target.value)} 
                                required
                            />
                            <br />
                            <label>Options:</label>
                            {q.options.map((opt, j) => (
                                <input 
                                    key={j} 
                                    type="text" 
                                    value={opt} 
                                    onChange={(e) => handleChange(i, "options", e.target.value, j)} 
                                    required
                                />
                            ))}
                            <br />
                            <label>Correct Option (1-4):</label>
                            <input 
                                type="number" 
                                value={q.correctOption} 
                                onChange={(e) => handleChange(i, "correctOption", e.target.value)}
                                min="1" max="4" 
                                required
                            />
                        </div>
                    ))}
                    <button type="submit">Submit</button>
                </form>
            )}
        </div>
    );
}

export default QuizBuilder;