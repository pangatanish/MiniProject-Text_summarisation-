from flask import Flask, request, render_template, make_response, send_from_directory
from transformers import pipeline
from flask_cors import CORS
import os
from PyPDF2 import PdfReader
import docx

app = Flask(__name__)
CORS(app)

# Initialize the summarizer
# summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
summarizer = pipeline("summarization", model="Falconsai/text_summarization")

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/static/<path:filename>')
def static_files(filename):
    return send_from_directory(os.path.join(app.root_path, 'static'), filename)

@app.route('/index')
def index():
    return render_template('index.html')

# 🔽 Utility functions
def extract_text_from_pdf(file_stream):
    reader = PdfReader(file_stream)
    text = ''
    for page in reader.pages:
        text += page.extract_text() + '\n'
    return text

def extract_text_from_docx(file_stream):
    doc = docx.Document(file_stream)
    return '\n'.join([para.text for para in doc.paragraphs])

@app.route('/process', methods=['POST'])
def process_text():
    input_text = request.form.get('inputText', '')
    max_len = int(request.form.get('length', '50'))

    # Handle file input if text is empty
    if not input_text.strip() and 'file' in request.files:
        file = request.files['file']
        filename = file.filename.lower()

        if filename.endswith('.pdf'):
            input_text = extract_text_from_pdf(file)
        elif filename.endswith('.docx'):
            input_text = extract_text_from_docx(file)
        else:
            return make_response("Unsupported file format. Only PDF and DOCX are supported.", 400)

    input_text = input_text.strip()

    if not input_text:
        return make_response("No valid text found to summarize.", 400)

    # Check if the text is too short
    if len(input_text.split()) < 30:
        return make_response("Text is too short to summarize. Please enter at least 30 words.", 400)

    # Truncate input to avoid token limit overflow (BART accepts ~1024 tokens max)
    if len(input_text.split()) > 800:
        input_text = ' '.join(input_text.split()[:800])

    try:
        summary = summarizer(input_text, max_length=250, min_length=max_len, do_sample=False)
        output_text = summary[0]["summary_text"]
        response = make_response(output_text)
        response.mimetype = "text/plain"
        return response
    except Exception as e:
        return make_response(f"Error during summarization: {str(e)}", 500)


if __name__ == '__main__':
    app.run(debug=True)