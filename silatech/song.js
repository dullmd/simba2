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
                text: `🎵 *How to use song command:*\n\n` +
                      `1️⃣ *By URL*\n` +
                      `   ${prefix}song <youtube-url>\n\n` +
                      `2️⃣ *By Search*\n` +
                      `   ${prefix}song <song name>\n\n` +
                      `3️⃣ *Example:*\n` +
                      `   ${prefix}song https://youtu.be/xxxxx\n` +
                      `   ${prefix}song Adele Hello`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Search for video
        let videoId, videoTitle, videoThumb, videoDuration;
        
        // Check if input is URL
        const urlMatch = userInput.match(/(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|.+\?v=)?([^&\n]{11})/);
        
        if (urlMatch) {
            videoId = urlMatch[1];
            videoTitle = `Video_${videoId}`;
            videoThumb = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
            videoDuration = 'Unknown';
        } else {
            // Search using API
            const searchApi = `https://weeb-api.vercel.app/ytsearch?query=${encodeURIComponent(userInput)}`;
            const searchRes = await axios.get(searchApi);
            
            if (!searchRes.data || searchRes.data.length === 0) {
                throw new Error('No results found');
            }
            
            const firstResult = searchRes.data[0];
            videoId = firstResult.id;
            videoTitle = firstResult.title;
            videoThumb = firstResult.thumbnail;
            videoDuration = firstResult.timestamp || 'Unknown';
        }

        // Format selection buttons - 4 options
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
            image: { url: videoThumb },
            caption: `🎵 *${videoTitle}*\n⏱️ Duration: ${videoDuration}\n\n📌 *Choose format:*`,
            footer: config.BOT_FOOTER,
            buttons: buttons,
            headerType: 4, // 4 = IMAGE
            contextInfo: getContextInfo({ sender: sender })
        };

        await conn.sendMessage(from, buttonMessage, { quoted: fkontak });

    } catch (error) {
        console.error('Song command error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// Handle button clicks
cmd({
    on: 'body',
    fromMe: false
}, async (conn, mek, m, { from, sender, body }) => {
    try {
        const prefix = body.charAt(0);
        if (!body.startsWith(prefix + 'song_')) return;
        
        const parts = body.split('_');
        if (parts.length < 3) return;
        
        const format = parts[1]; // mp3, mp4, mp3doc, mp4doc
        const videoId = parts[2];
        
        // Determine type
        const isAudio = format.includes('mp3');
        const isDoc = format.includes('doc');
        
        await conn.sendMessage(from, {
            text: `⏳ *Downloading ${format.toUpperCase()}...*\nPlease wait...`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

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
        
        // Get thumbnail
        const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        
        // Create caption
        const caption = `🎵 *${title}*\n📦 Format: ${format.toUpperCase()}\n📊 Size: ${fileSize.toFixed(2)} MB\n\n> ${config.BOT_FOOTER}`;
        
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
                // Send audio with thumbnail
                await conn.sendMessage(from, {
                    audio: fileBuffer,
                    mimetype: 'audio/mpeg',
                    ptt: false,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            } else {
                // Send video with thumbnail in caption
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
            text: `❌ *Download Failed:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
