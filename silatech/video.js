const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "video",
    alias: ["ytmp4", "ytvideo"],
    desc: "Download YouTube video (MP4)",
    category: "download",
    react: "🎬",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, prefix }) => {
    try {
        const query = args.join(' ');
        
        if (!query) {
            return await conn.sendMessage(from, {
                text: `🎬 *Video Downloader*\n\n` +
                      `Usage: ${prefix}video <video name or URL>\n\n` +
                      `Example: ${prefix}video Adele Hello`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: `🔍 *Searching:* ${query}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Search for video
        const searchApi = `https://weeb-api.vercel.app/ytsearch?query=${encodeURIComponent(query)}`;
        const searchRes = await axios.get(searchApi);
        
        if (!searchRes.data || searchRes.data.length === 0) {
            throw new Error('No results found');
        }
        
        const video = searchRes.data[0];
        const videoId = video.id;
        const videoTitle = video.title;
        const videoThumb = video.thumbnail;
        const videoDuration = video.timestamp || 'Unknown';

        // Send info with thumbnail
        await conn.sendMessage(from, {
            image: { url: videoThumb },
            caption: `🎬 *${videoTitle}*\n⏱️ Duration: ${videoDuration}\n\n📥 *Downloading MP4...*`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Download MP4
        const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
        const apiUrl = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
        
        const dlRes = await axios.get(apiUrl, { timeout: 60000 });
        
        if (!dlRes.data) throw new Error('No data from API');
        
        const data = dlRes.data;
        const videoDlUrl = data.video || data.mp4 || data.url;
        
        if (!videoDlUrl) throw new Error('Video URL not found');
        
        // Download video file
        const videoRes = await axios.get(videoDlUrl, { 
            responseType: 'arraybuffer',
            timeout: 180000 // 3 minutes for video
        });
        
        const videoBuffer = Buffer.from(videoRes.data);
        const fileSize = (videoBuffer.length / (1024 * 1024)).toFixed(2);
        
        if (fileSize > 50) {
            return await conn.sendMessage(from, {
                text: `⚠️ *File too large* (${fileSize} MB)\nMax: 50 MB`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        // Send video
        await conn.sendMessage(from, {
            video: videoBuffer,
            caption: `🎬 *${videoTitle}*\n📊 Size: ${fileSize} MB\n\n> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Video error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
