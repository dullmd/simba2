const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');
const yts = require('yt-search');

cmd({
    pattern: "song",
    alias: ["play", "mp3", "music"],
    desc: "Download song from YouTube",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, q, prefix }) => {
    try {
        // Check if query provided
        if (!q) {
            const buttons = [
                { 
                    buttonId: `${prefix}song https://youtu.be/dQw4w9WgXcQ`, 
                    buttonText: { displayText: '🎵 Example Song' }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}song Faded`, 
                    buttonText: { displayText: '🔍 Try Faded' }, 
                    type: 1 
                }
            ];

            const caption = `*╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮*\n` +
                           `*│ 🐢 How to use song command*\n` +
                           `*│*\n` +
                           `*│ 1️⃣ By URL*\n` +
                           `*│    ${prefix}song <youtube-url>*\n` +
                           `*│*\n` +
                           `*│ 2️⃣ By Search*\n` +
                           `*│    ${prefix}song <song name>*\n` +
                           `*│*\n` +
                           `*│ 3️⃣ Example:*\n` +
                           `*│    ${prefix}song https://youtu.be/xxxxx*\n` +
                           `*│    ${prefix}song Adele Hello*\n` +
                           `*│*\n` +
                           `*╰─❖〔 🐢 Stay Slow Stay Smart 🐢 〕❖─╯*\n\n` +
                           `${config.BOT_FOOTER}`;

            await conn.sendMessage(from, { 
                text: caption, 
                footer: config.BOT_FOOTER,
                buttons: buttons,
                headerType: 1,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            return;
        }

        // Send searching reaction
        await conn.sendMessage(from, {
            react: { text: '🔍', key: mek.key }
        });

        // Search for video
        let videoData = null;
        let videoUrl = '';
        let title = '';
        let thumbnail = '';
        let duration = '';
        let views = '';

        // Check if it's a direct YouTube URL
        if (q.includes('youtube.com') || q.includes('youtu.be')) {
            const videoId = q.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            
            if (!videoId) {
                return await conn.sendMessage(from, {
                    text: `❌ *Invalid YouTube link*\n\n${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
            
            const search = await yts({ videoId: videoId });
            if (search) videoData = search;
        } else {
            const search = await yts(q);
            if (!search || !search.all || search.all.length === 0) {
                return await conn.sendMessage(from, {
                    text: `❌ *No results found for* "${q}"\n\n${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
            
            videoData = search.all[0];
        }

        if (!videoData) {
            return await conn.sendMessage(from, {
                text: `❌ *Could not get video information*\n\n${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        videoUrl = videoData.url;
        title = videoData.title || 'Unknown Title';
        thumbnail = videoData.thumbnail || videoData.image;
        duration = videoData.timestamp || videoData.duration?.toString() || 'N/A';
        views = videoData.views ? videoData.views.toLocaleString() : 'N/A';

        // Format duration
        if (duration.includes(':')) {
            // Already formatted
        } else if (!isNaN(duration)) {
            const seconds = parseInt(duration);
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            duration = `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
        }

        // Create buttons with the command prefix
        const buttons = [
            { 
                buttonId: `${prefix}getaudio ${Buffer.from(videoUrl).toString('base64')}|mp3`, 
                buttonText: { displayText: '🎵 AUDIO MP3' }, 
                type: 1 
            },
            { 
                buttonId: `${prefix}getaudio ${Buffer.from(videoUrl).toString('base64')}|doc`, 
                buttonText: { displayText: '📄 AUDIO DOC' }, 
                type: 1 
            }
        ];

        const caption = `*╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮*\n` +
                       `*│ 🐢 Song Found!*\n` +
                       `*│*\n` +
                       `*│ 🎵 Title : ${title.substring(0, 40)}*\n` +
                       `*│ ⏱️ Duration : ${duration}*\n` +
                       `*│ 👁️ Views : ${views}*\n` +
                       `*│ 🔗 Link : ${videoUrl}*\n` +
                       `*│*\n` +
                       `*╰─❖〔 🐢 Stay Slow Stay Smart 🐢 〕❖─╯*\n\n` +
                       `*Choose download option below:*`;

        await conn.sendMessage(from, { 
            image: { url: thumbnail },
            caption: caption,
            footer: config.BOT_FOOTER,
            buttons: buttons,
            headerType: 4,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Song command error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}\n\n${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 GETAUDIO COMMAND - Handles button clicks
// ============================================
cmd({
    pattern: "getaudio",
    alias: [],
    desc: "Download audio from YouTube",
    category: "downloader",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, q, prefix }) => {
    try {
        if (!q) return;
        
        const [encodedUrl, type] = q.split('|');
        if (!encodedUrl || !type) return;
        
        const videoUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
        
        await conn.sendMessage(from, {
            react: { text: '⏳', key: mek.key }
        });

        // Get video info for title
        let videoId = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
        if (!videoId) {
            videoId = videoUrl.split('v=')[1]?.split('&')[0] || 
                      videoUrl.split('youtu.be/')[1]?.split('?')[0];
        }
        
        let title = 'Unknown Title';
        if (videoId) {
            try {
                const search = await yts({ videoId: videoId });
                if (search) title = search.title;
            } catch (e) {
                console.log('Could not fetch title:', e);
            }
        }
        
        const fileName = `${title.substring(0, 50).replace(/[^\w\s]/gi, '_')}.mp3`;
        
        // Try to download
        try {
            // Try multiple APIs
            const apis = [
                `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`,
                `https://api.dhamzxploit.my.id/api/ytplay?query=${encodeURIComponent(videoUrl)}`,
                `https://api.siputzx.my.id/api/d/ytmp3?url=${encodeURIComponent(videoUrl)}`
            ];
            
            let audioUrl = null;
            
            for (const api of apis) {
                try {
                    const response = await axios.get(api, { timeout: 15000 });
                    
                    if (response.data?.status && response.data?.audio) {
                        audioUrl = response.data.audio;
                        break;
                    } else if (response.data?.result?.audio) {
                        audioUrl = response.data.result.audio;
                        break;
                    } else if (response.data?.download) {
                        audioUrl = response.data.download;
                        break;
                    } else if (typeof response.data === 'string' && response.data.startsWith('http')) {
                        audioUrl = response.data;
                        break;
                    }
                } catch (e) {
                    continue;
                }
            }
            
            if (!audioUrl) {
                throw new Error('Could not get audio URL');
            }
            
            // Send based on type
            if (type === 'mp3') {
                // Send as playable audio
                await conn.sendMessage(from, {
                    audio: { url: audioUrl },
                    mimetype: "audio/mpeg",
                    fileName: fileName,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            } else {
                // Send as document
                await conn.sendMessage(from, {
                    document: { url: audioUrl },
                    mimetype: "audio/mpeg",
                    fileName: fileName,
                    caption: `*╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮*\n` +
                            `*│ 📄 Document Downloaded*\n` +
                            `*│ 🎵 ${title}*\n` +
                            `*╰─❖〔 🐢 Stay Slow Stay Smart 🐢 〕❖─╯*\n\n` +
                            `${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
            
            await conn.sendMessage(from, {
                react: { text: '✅', key: mek.key }
            });
            
        } catch (downloadError) {
            console.error('Download error:', downloadError);
            
            await conn.sendMessage(from, {
                text: `❌ *Failed to download audio*\n\nReason: ${downloadError.message}\n\n${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            
            await conn.sendMessage(from, {
                react: { text: '❌', key: mek.key }
            });
        }
        
    } catch (error) {
        console.error('Getaudio command error:', error);
    }
});
