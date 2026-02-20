const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

// ============================================
// 📌 FLUX AI IMAGE GENERATOR
// ============================================
cmd({
    pattern: "flux",
    alias: ["fluxai", "imagine"],
    desc: "Generate image using Flux AI",
    category: "ai",
    react: "🎨",
    filename: __filename
},
async (conn, mek, m, { from, q }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 FLUX AI 🐢 〕❖─╮
*│ Please provide prompt*
*│*
*│ 📌 Usage: .flux <prompt>*
*│ Example: .flux beautiful sunset*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: "🎨 *Creating imagine...*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

        const api = `https://api.siputzx.my.id/api/ai/flux?prompt=${encodeURIComponent(q)}`;
        const res = await axios.get(api, { responseType: 'arraybuffer' });

        if (!res.data) throw new Error('No image');

        const caption = `╭─❖〔 🐢 FLUX AI 🐢 〕❖─╮
*│ ✨ Prompt: ${q}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: Buffer.from(res.data),
            caption: caption,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed to generate*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 STABLE DIFFUSION
// ============================================
cmd({
    pattern: "sdiffusion",
    alias: ["stable", "imagine2"],
    desc: "Generate image using Stable Diffusion",
    category: "ai",
    react: "🎨",
    filename: __filename
},
async (conn, mek, m, { from, q }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 STABLE DIFFUSION 🐢 〕❖─╮
*│ Please provide prompt*
*│*
*│ 📌 Usage: .sdiffusion <prompt>*
*│ Example: .sdiffusion cyberpunk city*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: "🎨 *Creating imagine...*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

        const api = `https://api.siputzx.my.id/api/ai/stable-diffusion?prompt=${encodeURIComponent(q)}`;
        const res = await axios.get(api, { responseType: 'arraybuffer' });

        if (!res.data) throw new Error('No image');

        const caption = `╭─❖〔 🐢 STABLE DIFFUSION 🐢 〕❖─╮
*│ ✨ Prompt: ${q}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: Buffer.from(res.data),
            caption: caption,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed to generate*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 STABILITY AI
// ============================================
cmd({
    pattern: "stability",
    alias: ["stabilityai", "imagine3"],
    desc: "Generate image using Stability AI",
    category: "ai",
    react: "🎨",
    filename: __filename
},
async (conn, mek, m, { from, q }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 STABILITY AI 🐢 〕❖─╮
*│ Please provide prompt*
*│*
*│ 📌 Usage: .stability <prompt>*
*│ Example: .stability fantasy landscape*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: "🎨 *Creating imagine...*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

        const api = `https://api.siputzx.my.id/api/ai/stabilityai?prompt=${encodeURIComponent(q)}`;
        const res = await axios.get(api, { responseType: 'arraybuffer' });

        if (!res.data) throw new Error('No image');

        const caption = `╭─❖〔 🐢 STABILITY AI 🐢 〕❖─╮
*│ ✨ Prompt: ${q}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: Buffer.from(res.data),
            caption: caption,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed to generate*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});
