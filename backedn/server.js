const express = require("express");
const multer = require("multer");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const pdfParse = require("pdf-parse");
const fs = require("fs");

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const upload = multer({ dest: "uploads/" });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to clean asterisks from AI-generated output
const cleanOutput = (text) => text.replace(/\*/g, " ");

// Resume Analysis API
app.post("/analyze-resume", upload.single("resume"), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: "No file uploaded" });
        }

        const dataBuffer = fs.readFileSync(req.file.path);
        const pdfData = await pdfParse(dataBuffer);
        const resumeText = pdfData.text;
        
        const prompt = `Analyze this resume: ${resumeText}. Extract skills, experience, and education. Also, provide advice on how to improve the resume. Additionally, suggest what jobs the candidate is suitable for and what extra skills they should learn next to enhance their career prospects.`;

        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const response = await model.generateContent(prompt);
        let analysis = response.response.candidates[0].content.parts[0].text;
        
        res.json({ analysis: cleanOutput(analysis.trim()) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Job Matching API
app.post("/match-jobs", async (req, res) => {
    try {
        const { resumeAnalysis, jobDescriptions } = req.body;
        if (!resumeAnalysis || !jobDescriptions || !Array.isArray(jobDescriptions)) {
            return res.status(400).json({ error: "Invalid input format" });
        }

        const prompt = `Based on this resume analysis: ${resumeAnalysis}, match it with the following job descriptions: ${jobDescriptions.join("\n\n")} and suggest the most suitable jobs.`;
        
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        const response = await model.generateContent(prompt);
        let jobMatches = response.response.candidates[0].content.parts[0].text;
        
        res.json({ jobMatches: cleanOutput(jobMatches) });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.listen(5000, () => console.log("Server running on port 5000"));
