/**
 * AIShifts Backend Proxy Server
 * Handles secure API calls to Gemini and Fal.ai
 */

import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Load environment variables from parent directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 50 * 1024 * 1024 } });

// Load system prompt
let systemPrompt = '';
try {
    systemPrompt = readFileSync(join(__dirname, '..', '.system_prompt'), 'utf-8');
    console.log('✅ System prompt loaded');
} catch (error) {
    console.warn('⚠️ .system_prompt file not found, using empty system prompt');
}

/**
 * Health check endpoint
 */
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * Generate prompt with Gemini API
 * POST /api/gemini
 */
app.post('/api/gemini', async (req, res) => {
    try {
        const { userMessage, itemPrompt } = req.body;
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

        const fullPrompt = `${itemPrompt}\n\nUser Request: ${userMessage}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: [{
                        parts: [{ text: fullPrompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048
                    }
                })
            }
        );

        const data = await response.json();

        if (data.error) {
            console.error('Gemini API Error:', data.error);
            return res.status(500).json({ error: data.error.message });
        }

        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('✅ Gemini response generated');

        res.json({ prompt: generatedText });
    } catch (error) {
        console.error('❌ Gemini API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Generate image with Fal.ai API
 * POST /api/fal
 */
app.post('/api/fal', upload.single('image'), async (req, res) => {
    try {
        const { prompt } = req.body;
        const imageFile = req.file;
        const apiKey = process.env.FAL_KEY;

        if (!apiKey) {
            return res.status(500).json({ error: 'FAL_KEY not configured' });
        }

        // Convert image to base64 data URL if provided
        let imageUrl = null;
        if (imageFile) {
            const base64 = imageFile.buffer.toString('base64');
            const mimeType = imageFile.mimetype;
            imageUrl = `data:${mimeType};base64,${base64}`;
        }

        // Call Fal.ai API (using flux-dev/image-to-image for image editing)
        const endpoint = imageUrl
            ? 'https://fal.run/fal-ai/flux/dev/image-to-image'
            : 'https://fal.run/fal-ai/flux/dev';

        const payload = imageUrl
            ? { prompt, image_url: imageUrl, strength: 0.75 }
            : { prompt };

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (data.detail) {
            console.error('Fal.ai API Error:', data.detail);
            return res.status(500).json({ error: data.detail });
        }

        console.log('✅ Fal.ai image generated');
        res.json({
            imageUrl: data.images?.[0]?.url || data.image?.url,
            data
        });
    } catch (error) {
        console.error('❌ Fal.ai API Error:', error);
        res.status(500).json({ error: error.message });
    }
});

/**
 * Combined endpoint: Gemini + Fal.ai
 * POST /api/generate
 */
app.post('/api/generate', upload.single('image'), async (req, res) => {
    try {
        const { userMessage, itemPrompt, falModel } = req.body;
        const imageFile = req.file;

        // Step 1: Call Gemini to generate enhanced prompt
        const geminiApiKey = process.env.GEMINI_API_KEY;
        if (!geminiApiKey) {
            return res.status(500).json({ error: 'GEMINI_API_KEY not configured' });
        }

        const fullPrompt = `${itemPrompt}\n\nUser Request: ${userMessage}`;

        const geminiResponse = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${geminiApiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    system_instruction: {
                        parts: [{ text: systemPrompt }]
                    },
                    contents: [{
                        parts: [{ text: fullPrompt }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topK: 40,
                        topP: 0.95,
                        maxOutputTokens: 2048
                    }
                })
            }
        );

        const geminiData = await geminiResponse.json();
        if (geminiData.error) {
            return res.status(500).json({ error: geminiData.error.message });
        }

        const generatedPrompt = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || '';
        console.log('✅ Gemini prompt generated');

        // Step 2: Call Fal.ai with the generated prompt
        const falApiKey = process.env.FAL_KEY;
        if (!falApiKey) {
            return res.status(500).json({ error: 'FAL_KEY not configured' });
        }

        let imageUrl = null;
        if (imageFile) {
            const base64 = imageFile.buffer.toString('base64');
            const mimeType = imageFile.mimetype;
            imageUrl = `data:${mimeType};base64,${base64}`;
        }

        // Use model from item JSON or default
        const modelToUse = falModel || 'fal-ai/flux/dev/image-to-image';
        const falEndpoint = `https://fal.run/${modelToUse}`;

        console.log(`🎨 Using Fal.ai model: ${modelToUse}`);
        console.log(`📝 Prompt length: ${generatedPrompt?.length || 0}`);
        console.log(`🖼️ Image provided: ${imageUrl ? 'Yes' : 'No'}`);

        // Build payload - different models may have different field names
        const falPayload = {
            prompt: generatedPrompt
        };

        // Add image if provided (try multiple field names for compatibility)
        if (imageUrl) {
            falPayload.image_url = imageUrl;
            falPayload.image = imageUrl;  // Some models use 'image' instead
            falPayload.image_urls = [imageUrl];  // Some models use 'image_urls' array
            falPayload.strength = 0.75;
        }

        console.log('📦 Fal.ai payload keys:', Object.keys(falPayload));

        const falResponse = await fetch(falEndpoint, {
            method: 'POST',
            headers: {
                'Authorization': `Key ${falApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(falPayload)
        });

        const falData = await falResponse.json();

        console.log('📤 Fal.ai response status:', falResponse.status);

        if (!falResponse.ok || falData.detail || falData.error) {
            const errorMsg = falData.detail || falData.error?.message || falData.message || JSON.stringify(falData);
            console.error('❌ Fal.ai Error:', errorMsg);
            return res.status(500).json({ error: `Fal.ai: ${errorMsg}` });
        }

        console.log('✅ Fal.ai image generated');
        res.json({
            geminiPrompt: generatedPrompt,
            imageUrl: falData.images?.[0]?.url || falData.image?.url,
            falData
        });

    } catch (error) {
        console.error('❌ Generate Error:', error);
        res.status(500).json({ error: error.message || String(error) });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 AIShifts Backend running on http://localhost:${PORT}`);
    console.log(`   - Gemini API: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Missing'}`);
    console.log(`   - Fal.ai API: ${process.env.FAL_KEY ? '✅ Configured' : '❌ Missing'}`);
});
