const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

// ============================================
// 📌 FLUX AI COMMAND
// ============================================
cmd({
    pattern: "flux",
    alias: ["fluxai", "fluximg"],
    desc: "Generate image using Flux AI",
    category: "ai",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const prompt = args.join(' ');
        if (!prompt) {
            return await conn.sendMessage(from, {
                text: `*𝚄𝚜𝚊𝚐𝚎:* .𝚏𝚕𝚞𝚡 <𝚙𝚛𝚘𝚖𝚙𝚝>\n\n𝙴𝚡: .𝚏𝚕𝚞𝚡 𝚊 𝚌𝚊𝚝 𝚒𝚗 𝚜𝚙𝚊𝚌𝚎`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: '*𝚂𝙸𝙻𝙰 𝙸𝚂 𝙲𝚁𝙴𝙰𝚃𝙸𝙽𝙶 𝚈𝙾𝚄𝚁 𝙸𝙼𝙰𝙶𝙴...*',
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        const apiUrl = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl, { 
            responseType: 'arraybuffer',
            timeout: 60000 
        });

        const imageBuffer = Buffer.from(response.data);

        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: `> *Prompt:* ${prompt}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        await conn.sendMessage(from, {
            react: { text: '✅', key: mek.key }
        });

    } catch (error) {
        console.error('Flux error:', error);
        await conn.sendMessage(from, {
            text: `❌ *𝙵𝚊𝚒𝚕𝚎𝚍:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 STABLE DIFFUSION COMMAND
// ============================================
cmd({
    pattern: "sd",
    alias: ["stablediffusion", "diffusion"],
    desc: "Generate image using Stable Diffusion",
    category: "ai",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const prompt = args.join(' ');
        if (!prompt) {
            return await conn.sendMessage(from, {
                text: `*𝚄𝚜𝚊𝚐𝚎:* .𝚜𝚍 <𝚙𝚛𝚘𝚖𝚙𝚝>\n\n𝙴𝚡: .𝚜𝚍 𝚊 𝚋𝚎𝚊𝚞𝚝𝚒𝚏𝚞𝚕 𝚕𝚊𝚗𝚍𝚜𝚌𝚊𝚙𝚎`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: '*𝚂𝙸𝙻𝙰 𝙸𝚂 𝙲𝚁𝙴𝙰𝚃𝙸𝙽𝙶 𝚈𝙾𝚄𝚁 𝙸𝙼𝙰𝙶𝙴...*',
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        const apiUrl = `https://api.siputzx.my.id/api/ai/stable-diffusion?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl, { 
            responseType: 'arraybuffer',
            timeout: 60000 
        });

        const imageBuffer = Buffer.from(response.data);

        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: `> *Prompt:* ${prompt}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        await conn.sendMessage(from, {
            react: { text: '✅', key: mek.key }
        });

    } catch (error) {
        console.error('SD error:', error);
        await conn.sendMessage(from, {
            text: `❌ *𝙵𝚊𝚒𝚕𝚎𝚍:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 STABILITY AI COMMAND
// ============================================
cmd({
    pattern: "stability",
    alias: ["stabilityai", "sai"],
    desc: "Generate image using Stability AI",
    category: "ai",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const prompt = args.join(' ');
        if (!prompt) {
            return await conn.sendMessage(from, {
                text: `*𝚄𝚜𝚊𝚐𝚎:* .𝚜𝚝𝚊𝚋𝚒𝚕𝚒𝚝𝚢 <𝚙𝚛𝚘𝚖𝚙𝚝>\n\n𝙴𝚡: .𝚜𝚝𝚊𝚋𝚒𝚕𝚒𝚝𝚢 𝚊 𝚛𝚘𝚋𝚘𝚝 𝚒𝚗 𝚝𝚑𝚎 𝚏𝚞𝚝𝚞𝚛𝚎`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: '*𝚂𝙸𝙻𝙰 𝙸𝚂 𝙲𝚁𝙴𝙰𝚃𝙸𝙽𝙶 𝚈𝙾𝚄𝚁 𝙸𝙼𝙰𝙶𝙴...*',
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        const apiUrl = `https://api.siputzx.my.id/api/ai/stabilityai?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl, { 
            responseType: 'arraybuffer',
            timeout: 60000 
        });

        const imageBuffer = Buffer.from(response.data);

        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: `> *Prompt:* ${prompt}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        await conn.sendMessage(from, {
            react: { text: '✅', key: mek.key }
        });

    } catch (error) {
        console.error('Stability error:', error);
        await conn.sendMessage(from, {
            text: `❌ *𝙵𝚊𝚒𝚕𝚎𝚍:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 IMAGINE COMMAND (Alias for flux)
// ============================================
cmd({
    pattern: "imagine",
    alias: ["aiimg", "aiimage"],
    desc: "Generate image using Flux AI",
    category: "ai",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const prompt = args.join(' ');
        if (!prompt) {
            return await conn.sendMessage(from, {
                text: `*𝚄𝚜𝚊𝚐𝚎:* .𝚒𝚖𝚊𝚐𝚒𝚗𝚎 <𝚙𝚛𝚘𝚖𝚙𝚝>\n\n𝙴𝚡: .𝚒𝚖𝚊𝚐𝚒𝚗𝚎 𝚊 𝚜𝚞𝚗𝚜𝚎𝚝 𝚘𝚟𝚎𝚛 𝚝𝚑𝚎 𝚘𝚌𝚎𝚊𝚗`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: '*𝚂𝙸𝙻𝙰 𝙸𝚂 𝙲𝚁𝙴𝙰𝚃𝙸𝙽𝙶 𝚈𝙾𝚄𝚁 𝙸𝙼𝙰𝙶𝙴...*',
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        const apiUrl = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(prompt)}`;
        const response = await axios.get(apiUrl, { 
            responseType: 'arraybuffer',
            timeout: 60000 
        });

        const imageBuffer = Buffer.from(response.data);

        await conn.sendMessage(from, {
            image: imageBuffer,
            caption: `> *Prompt:* ${prompt}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        await conn.sendMessage(from, {
            react: { text: '✅', key: mek.key }
        });

    } catch (error) {
        console.error('Imagine error:', error);
        await conn.sendMessage(from, {
            text: `❌ *𝙵𝚊𝚒𝚕𝚎𝚍:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
