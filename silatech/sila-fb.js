const { cmd } = global;
const axios = require('axios');
const config = require('../config');
const { fkontak, getContextInfo, formatBytes } = require('../lib/functions');

cmd({
    pattern: "fb",
    alias: ["facebook", "fbdl", "facebookdl"],
    desc: "Download Facebook videos",
    category: "download",
    react: "📥",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, reply }) => {
    try {
        // Get URL from args or quoted message
        let url = args.join(' ').trim();
        
        if (!url) {
            // Check if there's a quoted message with a URL
            if (mek.quoted && mek.quoted.text) {
                const quotedText = mek.quoted.text;
                const urlMatch = quotedText.match(/(https?:\/\/[^\s]+)/g);
                if (urlMatch) url = urlMatch[0];
            }
        }

        if (!url) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 FACEBOOK DOWNLOADER 🐢 〕❖─╮
*│*
*│ 📥 Usage: .fb <facebook video url>*
*│*
*│ 📌 Example:*
*│ .fb https://www.facebook.com/watch?v=123456*
*│*
*│ 💡 Or reply to a message containing the link*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Validate URL
        if (!url.match(/https?:\/\/(www\.)?(facebook|fb)\.com/i)) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 ERROR 🐢 〕❖─╮
*│*
*│ ❌ Invalid Facebook URL!*
*│*
*│ 📌 Please provide a valid*
*│    Facebook video link*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Send loading reaction
        await conn.sendMessage(from, { 
            react: { text: '⏳', key: mek.key } 
        });

        // Send processing message
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 PROCESSING 🐢 〕❖─╮
*│*
*│ 🔄 Downloading Facebook video...*
*│ 📎 URL: ${url.substring(0, 50)}...*
*│*
*│ ⏱️ Please wait*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // API Call
        const apiUrl = `https://api.ryzendesu.vip/api/downloader/fb?url=${encodeURIComponent(url)}`;
        const { data } = await axios.get(apiUrl, { timeout: 30000 });

        if (!data?.status || !data?.url) {
            throw new Error("Invalid API response or no video found.");
        }

        const videoUrl = data.url;
        const quality = data.quality || 'HD';
        const title = data.title || 'Facebook Video';

        // Get video info for size (optional head request)
        let videoSize = 'Unknown';
        try {
            const headRes = await axios.head(videoUrl);
            if (headRes.headers['content-length']) {
                videoSize = formatBytes(parseInt(headRes.headers['content-length']));
            }
        } catch (e) {
            // Ignore size fetch error
        }

        // Send video
        await conn.sendMessage(from, {
            video: { url: videoUrl },
            caption: `╭─❖〔 🐢 FACEBOOK DOWNLOADER 🐢 〕❖─╮
*│*
*│ 📥 *Video Downloaded!*
*│*
*│ 🎬 Title: ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}*
*│ 📊 Quality: ${quality}*
*│ 📦 Size: ${videoSize}*
*│ 🔗 Source: Facebook*
*│*
*│ 👤 Downloaded by: @${sender.split('@')[0]}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

        // Success reaction
        await conn.sendMessage(from, { 
            react: { text: '✅', key: mek.key } 
        });

    } catch (error) {
        console.error("FB Download Error:", error);

        // Error message
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 ERROR 🐢 〕❖─╮
*│*
*│ ❌ Failed to download video!*
*│*
*│ 📌 Reason: ${error.message || 'Unknown error'}*
*│*
*│ 💡 Try:*
*│ • Check if URL is valid*
*│ • Try another video*
*│ • Try again later*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Error reaction
        await conn.sendMessage(from, { 
            react: { text: '❌', key: mek.key } 
        });

        // Send error to owner (optional)
        const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
        await conn.sendMessage(ownerJid, {
            text: `⚠️ *FB Downloader Error!*\n\n📍 *User:* @${sender.split('@')[0]}\n🔗 *URL:* ${url}\n❌ *Error:* ${error.message}`,
            contextInfo: { mentionedJid: [sender] }
        }).catch(() => {});
    }
});
