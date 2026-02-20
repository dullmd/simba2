const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const fetch = require('node-fetch');

cmd({
    pattern: "tiktoksearch",
    alias: ["tiktoks", "tiks", "ttsearch"],
    desc: "Search TikTok videos",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, q, sender }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 TIKTOK SEARCH 🐢 〕❖─╮
*│ Please provide search query*
*│*
*│ 📌 Usage: .tiktoksearch <query>*
*│ Example: .tiktoksearch comedy*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: `🔎 *Searching:* ${q}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        const api = `https://apis-starlights-team.koyeb.app/starlight/tiktoksearch?text=${encodeURIComponent(q)}`;
        const res = await fetch(api);
        const data = await res.json();

        if (!data.data || data.data.length === 0) {
            return await conn.sendMessage(from, {
                text: "❌ *No results found*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Get up to 7 random results
        const results = data.data.slice(0, 7).sort(() => Math.random() - 0.5);

        // Send as slide/carousel style
        for (let i = 0; i < results.length; i++) {
            const video = results[i];
            
            const caption = `╭─❖〔 🐢 TIKTOK ${i+1}/${results.length} 🐢 〕❖─╮
*│ 🎵 ${video.title || 'No title'}*
*│ 👤 ${video.author || 'Unknown'}*
*│ ⏱️ ${video.duration || 'N/A'}*
*│*
*│ 🔗 ${video.link}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

            if (video.nowm) {
                await conn.sendMessage(from, {
                    video: { url: video.nowm },
                    caption: caption,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
                
                // Small delay between videos
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Search failed*",
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
