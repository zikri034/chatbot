import 'dotenv/config';
import express from 'express';
import multer from 'multer';
import { GoogleGenAI } from '@google/genai';

const app = express();
const upload = multer();

// Inisialisasi Gemini API Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash";

app.use(express.json());

// System Instruction untuk Use Case "Chatbot Edukasi Finansial"
const SYSTEM_INSTRUCTION = "Kamu adalah asisten edukasi finansial yang ramah. Bantu jelaskan konsep keuangan dengan gaya bahasa yang santai dan mudah dipahami, tetapi jangan pernah memberikan saran investasi personal.";

// ENDPOINT 1: Generate Text
app.post('/generate-text', async (req, res) => {
    const { prompt } = req.body;
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: `${SYSTEM_INSTRUCTION}\n\nPertanyaan pengguna: ${prompt}`
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// ENDPOINT 2: Generate From Image
app.post("/generate-from-image", upload.single("image"), async (req, res) => {
    const { prompt } = req.body;
    const base64Image = req.file.buffer.toString("base64");
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: `${SYSTEM_INSTRUCTION}\n\n${prompt ?? "Deskripsikan gambar ini kaitannya dengan keuangan."}`, type: "text" },
                { inlineData: { data: base64Image, mimeType: req.file.mimetype } }
            ],
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// ENDPOINT 3: Generate From Document
app.post("/generate-from-document", upload.single("document"), async (req, res) => {
    const { prompt } = req.body;
    const base64Document = req.file.buffer.toString("base64");
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: `${SYSTEM_INSTRUCTION}\n\n${prompt ?? "Tolong buat ringkasan dari dokumen keuangan berikut."}`, type: "text" },
                { inlineData: { data: base64Document, mimeType: req.file.mimetype } }
            ]
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// ENDPOINT 4: Generate From Audio
app.post("/generate-from-audio", upload.single("audio"), async (req, res) => {
    const { prompt } = req.body;
    const base64Audio = req.file.buffer.toString("base64");
    try {
        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: [
                { text: `${SYSTEM_INSTRUCTION}\n\n${prompt ?? "Tolong buatkan transkrip dari rekaman berikut."}`, type: "text" },
                { inlineData: { data: base64Audio, mimeType: req.file.mimetype } }
            ]
        });
        res.status(200).json({ result: response.text });
    } catch (e) {
        console.log(e);
        res.status(500).json({ message: e.message });
    }
});

// Menjalankan Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server ready on http://localhost:${PORT}`));