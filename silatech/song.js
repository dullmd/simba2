// silatech/song.js
const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, sleep, downloadMediaMessage } = require('../lib/functions');
const axios = require('axios');
const fs = require('fs-extra');

cmd({
    pattern: "song",
    alias: ["yt", "play", "video", "mp3", "mp4", "ytaudio", "ytvideo"],
    desc: "Download YouTube videos/audio",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, command, prefix }) => {
    try {
        const userInput = args.join(' ');
        
        if (!userInput) {
            return await conn.sendMessage(from, {
                text: `🎵 *𝙷𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎 𝚜𝚘𝚗𝚐 𝚌𝚘𝚖𝚖𝚊𝚗𝚍:*\n\n` +
                      `1️⃣ *𝙱𝚢 𝚄𝚁𝙻*\n` +
                      `   ${prefix}𝚜𝚘𝚗𝚐 <𝚢𝚘𝚞𝚝𝚞𝚋𝚎-𝚞𝚛𝚕>\n\n` +
                      `2️⃣ *𝙱𝚢 𝚂𝚎𝚊𝚛𝚌𝚑*\n` +
                      `   ${prefix}𝚜𝚘𝚗𝚐 <𝚜𝚘𝚗𝚐 𝚗𝚊𝚖𝚎>\n\n` +
                      `3️⃣ *𝙴𝚡𝚊𝚖𝚙𝚕𝚎:*\n` +
                      `   ${prefix}𝚜𝚘𝚗𝚐 https://youtu.be/xxxxx\n` +
                      `   ${prefix}𝚜𝚘𝚗𝚐 𝙰𝚍𝚎𝚕𝚎 𝙷𝚎𝚕𝚕𝚘`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: `*╭━━━〔 🐢 𝙿𝚁𝙾𝙲𝙴𝚂𝚂𝙸𝙽𝙶 〕━━━┈⊷*\n*┃🐢│*\n*┃🐢│ 🔍 𝙵𝚎𝚝𝚌𝚑𝚒𝚗𝚐: ${userInput.substring(0, 30)}...*\n*┃🐢│*\n*╰━━━━━━━━━━━━━━━┈⊷*`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Search for video
        let videoUrl, videoTitle, videoId;
        
        // Check if input is URL
        const urlMatch = userInput.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|.+\?v=)?([^&\n]{11})/);
        
        if (urlMatch) {
            videoId = urlMatch[1];
            videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            videoTitle = `Video_${videoId}`;
        } else {
            // Search using API
            const searchApi = `https://weeb-api.vercel.app/ytsearch?query=${encodeURIComponent(userInput)}`;
            const searchRes = await axios.get(searchApi);
            
            if (!searchRes.data || searchRes.data.length === 0) {
                throw new Error('No results found');
            }
            
            const firstResult = searchRes.data[0];
            videoId = firstResult.id;
            videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
            videoTitle = firstResult.title.replace(/[^\w\s]/gi, '').substring(0, 50);
            
            await conn.sendMessage(from, {
                image: { url: firstResult.thumbnail },
                caption: `*╭━━━〔 🐢 𝚁𝙴𝚂𝚄𝙻𝚃 𝙵𝙾𝚄𝙽𝙳 〕━━━┈⊷*\n*┃🐢│*\n*┃🐢│ 🎵 𝚃𝚒𝚝𝚕𝚎: ${firstResult.title}*\n*┃🐢│ ⏱️ 𝙳𝚞𝚛𝚊𝚝𝚒𝚘𝚗: ${firstResult.timestamp || 'Unknown'}*\n*┃🐢│*\n*╰━━━━━━━━━━━━━━━┈⊷*`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Format selection buttons
        const buttons = [
            {
                buttonId: `${prefix}song_mp3_${videoId}`,
                buttonText: { displayText: '🎵 MP3 Audio' },
                type: 1
            },
            {
                buttonId: `${prefix}song_mp4_${videoId}`,
                buttonText: { displayText: '🎬 MP4 Video' },
                type: 1
            },
            {
                buttonId: `${prefix}song_mp3doc_${videoId}`,
                buttonText: { displayText: '📄 MP3 Document' },
                type: 1
            },
            {
                buttonId: `${prefix}song_mp4doc_${videoId}`,
                buttonText: { displayText: '📁 MP4 Document' },
                type: 1
            }
        ];

        const buttonMessage = {
            text: `*╭━━━〔 🐢 𝙲𝙷𝙾𝙾𝚂𝙴 𝙵𝙾𝚁𝙼𝙰𝚃 〕━━━┈⊷*\n*┃🐢│*\n*┃🐢│ 🎵 𝚃𝚒𝚝𝚕𝚎: ${videoTitle.substring(0, 30)}...*\n*┃🐢│*\n*┃🐢│ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚜𝚎𝚕𝚎𝚌𝚝 𝚏𝚘𝚛𝚖𝚊𝚝:*\n*┃🐢│*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n> ${config.BOT_FOOTER}`,
            footer: config.BOT_FOOTER,
            buttons: buttons,
            headerType: 1,
            contextInfo: getContextInfo({ sender: sender })
        };

        await conn.sendMessage(from, buttonMessage, { quoted: fkontak });

    } catch (error) {
        console.error('Song command error:', error);
        await conn.sendMessage(from, {
            text: `❌ *𝙴𝚛𝚛𝚘𝚛:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// Handle button clicks
cmd({
    on: 'body',
    fromMe: false
}, async (conn, mek, m, { from, sender, body, prefix }) => {
    try {
        if (!body.startsWith(prefix + 'song_')) return;
        
        const parts = body.split('_');
        if (parts.length < 3) return;
        
        const format = parts[1]; // mp3 or mp4 or mp3doc or mp4doc
        const videoId = parts[2];
        
        await conn.sendMessage(from, {
            text: `*╭━━━〔 🐢 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙸𝙽𝙶 〕━━━┈⊷*\n*┃🐢│*\n*┃🐢│ 📥 𝙵𝚘𝚛𝚖𝚊𝚝: ${format.toUpperCase()}*\n*┃🐢│ ⏳ 𝙿𝚕𝚎𝚊𝚜𝚎 𝚠𝚊𝚒𝚝...*\n*┃🐢│*\n*╰━━━━━━━━━━━━━━━┈⊷*`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Determine if audio or video
        const isAudio = format.includes('mp3');
        const isDoc = format.includes('doc');
        
        // Use your API
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
        
        const response = await axios.get(apiUrl, { timeout: 60000 });
        
        if (!response.data) throw new Error('No data from API');
        
        const data = response.data;
        const title = data.title || 'YouTube Video';
        let downloadUrl;
        
        if (isAudio) {
            downloadUrl = data.audio || data.mp3 || data.url;
        } else {
            downloadUrl = data.video || data.mp4 || data.url;
        }
        
        if (!downloadUrl) throw new Error('Download URL not found');
        
        // Download file
        const fileRes = await axios.get(downloadUrl, { 
            responseType: 'arraybuffer',
            timeout: 120000
        });
        
        const fileBuffer = Buffer.from(fileRes.data);
        const fileSize = fileBuffer.length / (1024 * 1024);
        
        if (fileSize > 50) throw new Error('File too large (>50MB)');
        
        const caption = `*╭━━━〔 🐢 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝙳 〕━━━┈⊷*\n*┃🐢│*\n*┃🐢│ 🎵 𝚃𝚒𝚝𝚕𝚎: ${title.substring(0, 30)}...*\n*┃🐢│ 📦 𝙵𝚘𝚛𝚖𝚊𝚝: ${format.toUpperCase()}*\n*┃🐢│ 📊 𝚂𝚒𝚣𝚎: ${fileSize.toFixed(2)} MB*\n*┃🐢│*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n> ${config.BOT_FOOTER}`;
        
        if (isDoc) {
            // Send as document
            await conn.sendMessage(from, {
                document: fileBuffer,
                mimetype: isAudio ? 'audio/mpeg' : 'video/mp4',
                fileName: `${title}.${isAudio ? 'mp3' : 'mp4'}`,
                caption: caption,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        } else {
            // Send as media
            if (isAudio) {
                await conn.sendMessage(from, {
                    audio: fileBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            } else {
                await conn.sendMessage(from, {
                    video: fileBuffer,
                    caption: caption,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
        }
        
        await conn.sendMessage(from, {
            react: { text: '✅', key: mek.key }
        });
        
    } catch (error) {
        console.error('Download error:', error);
        await conn.sendMessage(from, {
            text: `❌ *𝙳𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝙵𝚊𝚒𝚕𝚎𝚍:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
