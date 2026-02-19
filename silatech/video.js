const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, sleep } = require('../lib/functions');
const axios = require('axios');
const yts = require('yt-search');
const fs = require('fs-extra');

cmd({
    pattern: "video",
    alias: ["ytaudio", "ytmp3", "ytvideo", "ytmp4", "play2"],
    desc: "Download YouTube videos/audio",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, command }) => {
    try {
        const query = args.join(' ');
        
        if (!query) {
            return await conn.sendMessage(from, {
                text: `🎵 *𝙷𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎:*\n\n` +
                      `1️⃣ *𝙱𝚢 𝚄𝚁𝙻:* .𝚢𝚝 <𝚕𝚒𝚗𝚔>\n` +
                      `2️⃣ *𝙱𝚢 𝚂𝚎𝚊𝚛𝚌𝚑:* .𝚢𝚝 <𝚗𝚊𝚖𝚎>\n\n` +
                      `𝙴𝚡𝚊𝚖𝚙𝚕𝚎:\n` +
                      `.𝚢𝚝 https://youtu.be/xxxxx\n` +
                      `.𝚢𝚝 𝙰𝚍𝚎𝚕𝚎 𝙷𝚎𝚕𝚕𝚘`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Send processing message
        await conn.sendMessage(from, {
            text: `*🔍 𝚂𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐: ${query.substring(0, 30)}...*`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Search for video
        const search = await yts(query);
        
        if (!search.videos || search.videos.length === 0) {
            throw new Error('No results found');
        }

        const data = search.videos[0];
        const ytUrl = data.url;

        // Try primary API (yako)
        let apiRes = null;
        let usedApi = 'primary';
        
        try {
            const primaryApi = `https://gtech-api-xtp1.onrender.com/api/video/yt?apikey=APIKEY&url=${encodeURIComponent(ytUrl)}`;
            const response = await axios.get(primaryApi, { timeout: 10000 });
            
            if (response.data?.status && response.data?.result) {
                apiRes = response.data.result;
            }
        } catch (primaryError) {
            console.log('Primary API failed, trying backup...');
        }

        // If primary fails, try backup API (kutoka kwenye song.js yako)
        if (!apiRes) {
            usedApi = 'backup';
            const backupApi = `https://api.siputzx.my.id/api/d/yt?url=${encodeURIComponent(ytUrl)}`;
            const response = await axios.get(backupApi, { timeout: 15000 });
            
            if (response.data?.status && response.data?.data) {
                apiRes = response.data.data;
            }
        }

        if (!apiRes) {
            throw new Error('All APIs failed');
        }

        // Determine download type based on command
        const isAudio = command === 'ytaudio' || command === 'ytmp3' || command === 'play';
        const downloadUrl = isAudio ? 
            (apiRes.mp3 || apiRes.audio) : 
            (apiRes.mp4 || apiRes.video);

        if (!downloadUrl) {
            throw new Error(`No ${isAudio ? 'audio' : 'video'} download available`);
        }

        // Send info message
        const infoMsg = `*╭━━━〔 🎵 𝚈𝙾𝚄𝚃𝚄𝙱𝙴 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳 〕━━━┈⊷*
*┃🐢│*
*┃🐢│ 🎯 𝚃𝚒𝚝𝚕𝚎: ${data.title}*
*┃🐢│ ⏱️ 𝙳𝚞𝚛𝚊𝚝𝚒𝚘𝚗: ${data.timestamp}*
*┃🐢│ 👁️ 𝚅𝚒𝚎𝚠𝚜: ${data.views?.toLocaleString() || 'N/A'}*
*┃🐢│ 📦 𝙵𝚘𝚛𝚖𝚊𝚝: ${isAudio ? '𝙰𝚞𝚍𝚒𝚘 (𝙼𝙿𝟹)' : '𝚅𝚒𝚍𝚎𝚘 (𝙼𝙿𝟺)'}*
*┃🐢│*
*╰━━━━━━━━━━━━━━━┈⊷*

> *𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍𝚒𝚗𝚐...*`;

        await conn.sendMessage(from, {
            image: { url: data.thumbnail },
            caption: infoMsg,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Download the file
        const fileRes = await axios.get(downloadUrl, { 
            responseType: 'arraybuffer',
            timeout: 120000
        });
        
        const fileBuffer = Buffer.from(fileRes.data);
        const fileSize = fileBuffer.length / (1024 * 1024); // MB

        if (fileSize > 50) {
            throw new Error('File too large (>50MB)');
        }

        // Send based on format
        const finalCaption = `> *${data.title}*\n> ${config.BOT_FOOTER}`;

        if (isAudio) {
            await conn.sendMessage(from, {
                audio: fileBuffer,
                mimetype: 'audio/mpeg',
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        } else {
            await conn.sendMessage(from, {
                video: fileBuffer,
                caption: finalCaption,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Send reaction
        await conn.sendMessage(from, {
            react: { text: '✅', key: mek.key }
        });

    } catch (error) {
        console.error('YT command error:', error);
        
        let errorMessage = '𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍. 𝚃𝚛𝚢 𝚊𝚐𝚊𝚒𝚗.';
        if (error.message.includes('timeout')) {
            errorMessage = '𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚝𝚒𝚖𝚎𝚍 𝚘𝚞𝚝.';
        } else if (error.message.includes('No results')) {
            errorMessage = '𝙽𝚘 𝚛𝚎𝚜𝚞𝚕𝚝𝚜 𝚏𝚘𝚞𝚗𝚍.';
        }

        await conn.sendMessage(from, {
            text: `❌ *𝙴𝚛𝚛𝚘𝚛:* ${errorMessage}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        await conn.sendMessage(from, {
            react: { text: '❌', key: mek.key }
        });
    }
});
