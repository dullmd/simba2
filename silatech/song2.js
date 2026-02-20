const { cmd } = global;
const axios = require('axios');
const yts = require('yt-search');
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "song2",
    alias: ["mp3", "music", "song2"],
    desc: "Download song as MP3 from YouTube",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, q, prefix, reply, l, isOwner }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `┏━❑ *SONG DOWNLOADER* ━━━━━━━━━\n┃\n┃ ✦ ${prefix}song2 <song name>\n┃ ✦ ${prefix}song2 <YouTube URL>\n┃\n┗━━━━━━━━━━━━━━━━━━━━\n\n> ${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Send searching message with reaction
        await conn.sendMessage(from, {
            react: { text: "🔍", key: mek.key }
        });

        let videoData = null;
        let isDirectUrl = false;

        // Check if it's a direct YouTube URL
        if (q.includes('youtube.com') || q.includes('youtu.be')) {
            isDirectUrl = true;
            const videoId = q.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/)?.[1];
            
            if (!videoId) {
                await conn.sendMessage(from, {
                    react: { text: "❌", key: mek.key }
                });
                return await conn.sendMessage(from, {
                    text: `❌ *Invalid YouTube link!*\n\n> ${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
            
            const search = await yts({ videoId: videoId });
            if (search) videoData = search;
        } else {
            // Search for the song
            await conn.sendMessage(from, {
                text: `🔍 *Searching YouTube for* "${q}"...\n\n> ${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            
            const search = await yts(q);
            if (!search || !search.all || search.all.length === 0) {
                await conn.sendMessage(from, {
                    react: { text: "❌", key: mek.key }
                });
                return await conn.sendMessage(from, {
                    text: `❌ *No results found for* "${q}"\n\n> ${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
            
            videoData = search.all[0];
        }

        if (!videoData) {
            await conn.sendMessage(from, {
                react: { text: "❌", key: mek.key }
            });
            return await conn.sendMessage(from, {
                text: `❌ *Could not get video information*\n\n> ${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const videoUrl = videoData.url;
        const title = videoData.title || 'Unknown Title';
        const thumbnail = videoData.thumbnail || videoData.image;
        const duration = videoData.timestamp || videoData.duration || 'N/A';
        const views = videoData.views ? videoData.views.toLocaleString() : 'N/A';

        // Send song info with thumbnail
        await conn.sendMessage(from, {
            image: { url: thumbnail },
            caption: `┏━❑ *SONG INFO* ━━━━━━━━━\n┃\n┃ 🎵 *Title:* ${title}\n┃ ⏱️ *Duration:* ${duration}\n┃ 👁️ *Views:* ${views}\n┃ 🔗 *URL:* ${videoUrl}\n┃\n┗━━━━━━━━━━━━━━━━━━━━\n⏳ *Downloading MP3...*\n\n> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Change reaction to downloading
        await conn.sendMessage(from, {
            react: { text: "⬇️", key: mek.key }
        });

        try {
            // Try primary API
            const fallbackApi = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
            const fallbackResponse = await axios.get(fallbackApi, { timeout: 30000 });
            const fallbackData = fallbackResponse.data;

            if (fallbackData?.status && fallbackData.audio) {
                // Send as audio
                await conn.sendMessage(from, {
                    audio: { url: fallbackData.audio },
                    mimetype: "audio/mpeg",
                    fileName: `${title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp3`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });

                // Send as document
                await conn.sendMessage(from, {
                    document: { url: fallbackData.audio },
                    mimetype: "audio/mpeg",
                    fileName: `${title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp3`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });

                // Success reaction
                await conn.sendMessage(from, {
                    react: { text: "✅", key: mek.key }
                });

            } else {
                // Try backup API
                const apiUrl = `https://meta-api.zone.id/downloader/youtube?url=${encodeURIComponent(videoUrl)}`;
                const response = await axios.get(apiUrl, { timeout: 30000 });
                const data = response.data;

                let audioUrl = data?.result?.audio || data?.result?.url;

                if (audioUrl) {
                    // Send as audio
                    await conn.sendMessage(from, {
                        audio: { url: audioUrl },
                        mimetype: "audio/mpeg",
                        fileName: `${title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp3`,
                        contextInfo: getContextInfo({ sender: sender })
                    }, { quoted: fkontak });

                    // Send as document
                    await conn.sendMessage(from, {
                        document: { url: audioUrl },
                        mimetype: "audio/mpeg",
                        fileName: `${title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp3`,
                        contextInfo: getContextInfo({ sender: sender })
                    }, { quoted: fkontak });

                    // Success reaction
                    await conn.sendMessage(from, {
                        react: { text: "✅", key: mek.key }
                    });

                } else {
                    throw new Error('No audio URL found');
                }
            }

        } catch (error) {
            console.error("Song download error:", error);
            
            // Error reaction
            await conn.sendMessage(from, {
                react: { text: "❌", key: mek.key }
            });

            await conn.sendMessage(from, {
                text: `❌ *Failed to download audio*\n\n📌 *Reason:* ${error.message}\n\n> ${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

    } catch (error) {
        console.error("Song command error:", error);
        await conn.sendMessage(from, {
            text: `⚠️ *Error:* ${error.message}\n\n> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
