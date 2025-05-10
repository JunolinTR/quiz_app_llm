import { useState, useRef } from "react";

function PDFQuizUploader() {
    const [pdfFile, setPdfFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState("");
    const fileInputRef = useRef(null);

    const handleFileChange = (e) => {
        setPdfFile(e.target.files[0]);
        setMessage(""); // Clear previous messages
    };

    const handleUpload = async () => {
        if (!pdfFile) {
            alert("Please select a PDF file first.");
            return;
        }

        const formData = new FormData();
        formData.append("pdf", pdfFile);

        try {
            setUploading(true);

            const response = await fetch("http://localhost:5000/upload-pdf", {
                method: "POST",
                body: formData,
            });

            if (response.ok) {
                const data = await response.json();
                setMessage("✅ PDF uploaded and quiz stored successfully!");
                setPdfFile(null);
                if (fileInputRef.current) {
                    fileInputRef.current.value = ""; // Reset file input
                }
            } else {
                const errorData = await response.json();
                setMessage("❌ Error: " + (errorData.error || "Failed to upload PDF."));
            }
        } catch (err) {
            console.error("Upload error:", err);
            setMessage("❌ Something went wrong during upload.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "500px", margin: "auto" }}>
            <h2>Upload PDF with Questions</h2>
            <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                ref={fileInputRef}
            />
            <br /><br />
            <button onClick={handleUpload} disabled={uploading}>
                {uploading ? "Uploading..." : "Upload PDF"}
            </button>
            <br /><br />
            {message && <p>{message}</p>}
        </div>
    );
}

export default PDFQuizUploader;
