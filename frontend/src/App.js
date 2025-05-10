import './App.css';
import QuizBuilder from './components/CreateQuiz';
import PDFQuizGenerator from './components/PDFQuizGenerator';
import PDFQuizUploader from './components/PDFQuizUploader'; // Import the new component

function App() {
  return (
    <div className="App" style={{ padding: "20px" }}>
      <h1>Quiz Management</h1>

      <div style={{ marginBottom: "40px" }}>
        <QuizBuilder />
      </div>

      <div>
        <PDFQuizUploader />
      </div>
      <div>
        <PDFQuizGenerator/>
      </div>
    </div>
  );
}

export default App;
