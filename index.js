import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from "@google/genai";

// Setup dirname untuk ESM (import style)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const GEMINI_MODEL = "gemini-2.5-flash";

app.use(cors());
app.use(express.json());

// Middleware untuk menyajikan file statis (frontend)
app.use(express.static(path.join(__dirname, 'public')));

// System Instruction
const SYSTEM_INSTRUCTION = `Kamu adalah 'Fini', asisten edukasi finansial pintar yang berbicara dengan gaya bahasa santai, asyik, dan menggunakan gaya bahasa anak muda Indonesia masa kini (sesekali gunakan sapaan kak, bro, atau sis). 
Tugas utama kamu adalah membantu pengguna memahami konsep keuangan, budgeting, dan dasar investasi. 
ATURAN PENTING: 
1. Jika pengguna bertanya di luar topik keuangan (misal: cuaca, resep masakan, dll), tolak dengan sopan dan arahkan kembali ke topik finansial.
2. Jangan pernah memberikan saran investasi yang menjanjikan keuntungan pasti. Selalu ingatkan tentang risiko.
3. Gunakan emoji agar percakapan lebih hidup!`;

app.post('/api/chat', async (req, res) => {
    const { conversation } = req.body;
    try {
        if (!Array.isArray(conversation)) throw new Error('Messages must be an array!');

        const contents = conversation.map(({ role, text }) => ({
            role: role === 'user' ? 'user' : 'model',
            parts: [{ text }]
        }));

        const response = await ai.models.generateContent({
            model: GEMINI_MODEL,
            contents: contents,
            config: {
                temperature: 0.8, // Kreatif tapi tetap informatif
                systemInstruction: SYSTEM_INSTRUCTION
            }
        });

        res.status(200).json({ result: response.text });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Gemini Chatbot running on http://localhost:${PORT}`));