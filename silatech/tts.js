const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');
const googleTTS = require('google-tts-api'); // Make sure to install this

cmd({
    pattern: "tts",
    alias: ["say", "speak", "voice"],
    desc: "Convert text to speech (any language)",
    category: "tools",
    react: "🔊",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ');
        
        if (!text) {
            return await conn.sendMessage(from, {
                text: `🔊 *𝚄𝚜𝚊𝚐𝚎:* .𝚝𝚝𝚜 <𝚝𝚎𝚡𝚝>\n\n𝙴𝚡: .𝚝𝚝𝚜 𝙷𝚎𝚕𝚕𝚘 𝚆𝚘𝚛𝚕𝚍\n.𝚜𝚊𝚢 𝙰𝚜𝚜𝚊𝚕𝚊𝚖𝚞𝚊𝚕𝚊𝚒𝚔𝚞𝚖`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Auto-detect language or use English as fallback
        const ttsUrl = googleTTS.getAudioUrl(text, {
            lang: 'en', // Google TTS auto-detects language based on text
            slow: false,
            host: "https://translate.google.com",
        });

        const response = await axios.get(ttsUrl, { 
            responseType: "arraybuffer",
            timeout: 30000
        });
        
        const audioBuffer = Buffer.from(response.data, "binary");

        await conn.sendMessage(from, {
            audio: audioBuffer,
            mimetype: "audio/mp4",
            ptt: false,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        await conn.sendMessage(from, {
            react: { text: '🔊', key: mek.key }
        });

    } catch (error) {
        console.error('TTS error:', error);
        await conn.sendMessage(from, {
            text: `❌ *𝙵𝚊𝚒𝚕𝚎𝚍:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
