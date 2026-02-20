const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const yts = require('yt-search');

cmd({
    pattern: "yts",
    alias: ["ytsearch", "youtubesearch"],
    desc: "Search YouTube videos",
    category: "search",
    react: "🔎",
    filename: __filename
},
async (conn, mek, m, { from, q, sender }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 YOUTUBE SEARCH 🐢 〕❖─╮
*│ Please provide search query*
*│*
*│ 📌 Usage: .yts <query>*
*│ Example: .yts bongo flava*
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

        const search = await yts(q);
        const results = search.all.slice(0, 10); // Get first 10 results

        // Send as slide/carousel style
        for (let i = 0; i < results.length; i++) {
            const video = results[i];
            
            const caption = `╭─❖〔 🐢 YOUTUBE ${i+1}/${results.length} 🐢 〕❖─╮
*│ 🎥 ${video.title}*
*│ 👤 ${video.author.name}*
*│ ⏱️ ${video.timestamp}*
*│ 👁️ ${video.views} views*
*│ 📅 ${video.ago}*
*│*
*│ 🔗 ${video.url}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

            await conn.sendMessage(from, {
                image: { url: video.thumbnail },
                caption: caption,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            
            // Small delay between slides
            await new Promise(resolve => setTimeout(resolve, 800));
        }

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Search failed*",
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
