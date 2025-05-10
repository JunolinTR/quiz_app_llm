import React, { useState } from 'react';

const PDFQuizGenerator = () => {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setQuestions([]);
    setErrorMsg('');
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Select a file first, brave warrior.");
      return;
    }

    setLoading(true);
    setErrorMsg('');
    const formData = new FormData();
    formData.append('pdf', file);

    try {
      const response = await fetch('http://localhost:5000/api/generate-quiz', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Backend responded with status ${response.status}`);
      }

      const data = await response.json();

      if (Array.isArray(data.questions)) {
        setQuestions(data.questions);
      } else {
        throw new Error("Response format invalid: questions not found.");
      }
    } catch (error) {
      console.error("Oops, backend tripped over a pebble:", error);
      setErrorMsg("Something went wrong while generating the quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "30px", padding: "20px", border: "1px solid #ccc", borderRadius: "10px" }}>
      <h2>🧠 PDF → Quiz Generator</h2>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button onClick={handleUpload} disabled={loading} style={{ marginLeft: "10px" }}>
        {loading ? "Summoning Quiz Magic..." : "Upload & Generate"}
      </button>

      {errorMsg && <p style={{ color: "red", marginTop: "10px" }}>{errorMsg}</p>}

      {Array.isArray(questions) && questions.length > 0 ? (
        <div style={{ marginTop: "20px" }}>
          <h3>📋 Generated Questions</h3>
          <ul>
            {questions.map((q, idx) => (
              <li key={idx}>
                <strong>{q.question}</strong>
                <ul>
                  {Object.entries(q.options).map(([key, val]) => (
                    <li key={key}>{key}. {val}</li>
                  ))}
                </ul>
                <p><strong>Correct Answer:</strong> {q.correct}</p>
              </li>
            ))}
          </ul>
        </div>
      ) : !loading && !errorMsg && (
        <p style={{ marginTop: "15px" }}>📄 Upload a PDF to generate your quiz.</p>
      )}
    </div>
  );
};

export default PDFQuizGenerator;
