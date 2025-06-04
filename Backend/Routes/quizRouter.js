const express = require('express');
const { createWorker } = require('tesseract.js');
const path = require('path');
const router = express.Router();
const fs = require('fs');
const multer = require('multer');
require('dotenv').config();

const generateQuizPrompt = require('../utils/GenerateQuiz.js');
const generateQuery = require('../utils/generateQuery.js');
const readFileBasedOnType = require('../utils/ReadFile.js');
const { GoogleGenAI } = require('@google/genai');
const chunkText = require('../utils/chunkText.js');
const embedChunks = require('../utils/embedChunks.js');
const { cosineSimilarity } = require('../utils/similarity.js'); // We'll create this
const verifyUser = require('../Middlewares/QuizValidation.js')
const Quiz = require('../Models/Quiz.js'); // Assuming you have a Quiz model defined    
const convertPdfToImages = require('../utils/convertPdfToImages.js'); // Assuming you have a function to convert PDF to images

const apiKey = process.env.GOOGLE_API_KEY;
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

router.get('/', verifyUser, async (req, res) => {
    const email = req.headers.email;
    if (!email) {
        return res.status(400).json({ success: false, error: 'Email header is required' });
    }
    try {
        const Quizzes = await Quiz.find({ email });
        res.json(Quizzes);
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});


router.post('/', verifyUser, upload.single('file'), async (req, res) => {
    try {
        const { topics, description, difficulty, numQuestions } = req.body;
        const filePath = req.file.path;

        let text1 = await readFileBasedOnType(filePath);
        if (text1.length < 10) {
            const images = await convertPdfToImages(filePath);
            let trText = '';
            const worker = await createWorker();
            await worker.loadLanguage('eng');
            await worker.initialize('eng');
            console.log('Converting PDF to images and performing OCR...');
            for (const imagePath of images) {
                try {
                    const { data: { text } } = await worker.recognize(imagePath);
                    fs.unlinkSync(imagePath); 
                    trText += text + '\n';
                } catch (err) {
                    console.error(`Failed to OCR image ${imagePath}`, err);
                }
            }
            text1 = trText.trim();
        }
        console.log('Extracted text:', text1);
        fs.unlink(filePath, (err) => {
            if (err) console.error('Failed to delete file:', err);
        });

        if( !text1 || text1.length < 10) {
            return res.status(400).json({ success: false, error: 'Failed to extract sufficient text from the file.' });
        }

        // --- RAG Begins ---
        const chunks = chunkText(text1);
        const embeddedChunks = await embedChunks(chunks);

        const query = generateQuery({ topics, description });
        const model = new GoogleGenAI({ apiKey });

        // Pass the text under `contents`
        const queryEmbeddingResponse = await model.models.embedContent({
            model: 'embedding-001',
            contents: query,        // ← string, or you can use [query]
        });

        // `embeddings` is an array (one per input in `contents`)
        const queryEmbeddingObj = queryEmbeddingResponse.embeddings[0];

        const queryVector = Array.isArray(queryEmbeddingObj.values)
            ? queryEmbeddingObj.values
            : queryEmbeddingObj;

        const topK = 5;
        const topChunks = embeddedChunks
            .map(item => {
                const chunkVector = Array.isArray(item.embedding.values)
                    ? item.embedding.values
                    : item.embedding;

                return {
                    text: item.text,
                    similarity: cosineSimilarity(queryVector, chunkVector)
                };
            })
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, topK)
            .map(item => item.text)
            .join('\n');


        // Final prompt with context
        const finalPrompt = generateQuizPrompt({
            context: topChunks,
            numQuestions,
            difficulty,
            topics,
            description
        });

        const result = await model.models.generateContent({
            model: "gemini-2.0-flash",
            contents: finalPrompt
        });
        let raw = result.text;
        raw = raw.replace(/```json\s*([\s\S]*?)```/, '$1').trim();
        let quizObj;
        try {
            quizObj = JSON.parse(raw);
        } catch (e) {
            // handle parse error: perhaps log `raw` for debugging
            throw new Error("Failed to parse quiz JSON");
        }

        if (req.user && req.user.email) {
            const newQuiz = new Quiz({
                email: req.user.email,
                quizTitle: quizObj.quizTitle,
                quizDescription: quizObj.quizDescription,
                questions: quizObj.questions
            });

            await newQuiz.save();
            console.log('Saved quiz for user:', req.user.email);
        } else {
            console.log('Guest user, not saving quiz');
        }

        console.log('Quiz Object:', quizObj);
        res.json({ success: true, quiz: quizObj });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: error });
    }
});

module.exports = router;
