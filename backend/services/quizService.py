import sys
import json
import fitz
import re
import requests

def extract_text(pdf_path):
    doc = fitz.open(pdf_path)
    return "".join([page.get_text() for page in doc])

def call_ollama(text):
    prompt = f"""
    Generate 5 multiple choice questions from the following content with 4 options and 1 correct answer.
    FORMAT:
    Q1: ...
    A. ...
    B. ...
    C. ...
    D. ...
    Answer: B

    Content:
    \"\"\"{text}\"\"\"
    """

    response = requests.post(
        "http://localhost:11434/api/generate",
        json={"model": "llama2", "prompt": prompt, "stream": False}
    )
    return response.json()["response"]

def parse_mcq(text):
    pattern = r"Q\d+: (.*?)\nA\. (.*?)\nB\. (.*?)\nC\. (.*?)\nD\. (.*?)\nAnswer: (.)"
    matches = re.findall(pattern, text, re.DOTALL)
    questions = []

    for m in matches:
        questions.append({
            "question": m[0].strip(),
            "options": {
                "A": m[1].strip(),
                "B": m[2].strip(),
                "C": m[3].strip(),
                "D": m[4].strip()
            },
            "correct": m[5].strip()
        })
    return questions

if __name__ == "__main__":
    pdf_path = sys.argv[1]
    text = extract_text(pdf_path)
    response = call_ollama(text)
    questions = parse_mcq(response)
    print(json.dumps(questions))
