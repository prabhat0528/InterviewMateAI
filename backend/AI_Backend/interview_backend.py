import os
import json
from typing import List, Dict
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain.output_parsers import StructuredOutputParser, ResponseSchema

# -----------------------------
# Setup
# -----------------------------
load_dotenv()
GEMINI_KEY = os.getenv("GEMINI_KEY")
if not GEMINI_KEY:
    raise RuntimeError("Missing GEMINI_KEY in environment")

app = Flask(__name__)
CORS(app,
     resources={r"/*": {"origins": "https://interviewmateai.onrender.com"}},
     supports_credentials=True,
     allow_headers=["Content-Type"],
     methods=["GET", "POST", "OPTIONS"]
)

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=GEMINI_KEY)

# -----------------------------
# Generate Questions
# -----------------------------
question_schema = ResponseSchema(
    name="questions",
    description="A list of 5 interview questions, each with 'question' and 'description'",
    type="array"
)
parser = StructuredOutputParser.from_response_schemas([question_schema])

generate_prompt = PromptTemplate(
    template="""
You are an interviewer for a company.
Generate exactly 5 interview questions.

Return only a JSON object matching the schema:
{parser_schema}

Job Title: {job_title}
Topics: {topics}
Experience Year: {experience_year}
""",
    input_variables=["job_title", "topics", "experience_year"],
    partial_variables={"parser_schema": parser.get_format_instructions()}
)
generate_chain = LLMChain(llm=llm, prompt=generate_prompt)

@app.route("/generate_questions", methods=["POST"])
def generate_questions():
    try:
        data = request.get_json(force=True)
        job_title = data.get("job_title", "")
        topics = data.get("topics", "")
        experience_year = data.get("experience_year", "0")

        raw = generate_chain.invoke({
            "job_title": job_title,
            "topics": topics,
            "experience_year": experience_year
        })

        raw_text = raw.get("text", "") if isinstance(raw, dict) else str(raw)
        output = parser.parse(raw_text)
        questions = output.get("questions", [])

        return jsonify({"questions": questions}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# -----------------------------
# Evaluate Answers
# -----------------------------
evaluate_prompt = PromptTemplate(
    template="""
You are an expert interviewer and grammar evaluator.
Evaluate EACH answer for:
1) Relevance and technical correctness
2) Grammar and fluency
Provide concise, actionable feedback per answer.

Question–answer pairs:
{qa_pairs}

Return ONLY a JSON object:
{{ "per_answer":[{{"question_index":0,"feedback":"...","relevance_score":0,"grammar_score":0}}], 
"overall_feedback":"...","overall_score":0 }}
""",
    input_variables=["qa_pairs"]
)
evaluate_chain = LLMChain(llm=llm, prompt=evaluate_prompt)

@app.route("/evaluate_answers", methods=["POST"])
def evaluate_answers():
    try:
        data = request.get_json(force=True)
        questions: List[Dict] = data.get("questions", [])
        answers: List[str] = data.get("answers", [])

        if not questions or not answers or len(questions) != len(answers):
            return jsonify({"error": "questions and answers must be non-empty arrays of same length"}), 400

        qa_pairs = "\n\n".join([f"Q{i+1}: {q.get('question')}\nA{i+1}: {a}" 
                                for i, (q, a) in enumerate(zip(questions, answers))])

        # Invoke AI
        raw = evaluate_chain.invoke({"qa_pairs": qa_pairs})
        raw_text = raw.get("text") if isinstance(raw, dict) else str(raw)

        #  Strip code blocks if present
        if raw_text.startswith("```"):
            raw_text = "\n".join(raw_text.split("\n")[1:-1])  

        # Parse JSON
        try:
            result = json.loads(raw_text)
        except json.JSONDecodeError as e:
            return jsonify({"error": "Failed to parse AI output", "raw_output": raw_text, "exception": str(e)}), 500

        return jsonify(result), 200

    except Exception as e:
        app.logger.error(f"Error in evaluate_answers: {str(e)}")
        return jsonify({"error": str(e)}), 500

# -----------------------------
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)