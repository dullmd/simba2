const { cmd } = global;
const axios = require('axios');
const yts = require('yt-search');
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "song3",
    alias: ["mp33", "music", "song3"],
    desc: "Download song as MP3 from YouTube",
    category: "download",
    react: "🎵",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, q, prefix, reply, l, isOwner }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                       `*│*\n` +
                       `*│ 🐢 How To Use Song Downloader*\n` +
                       `*│*\n` +
                       `*│ ✦ ${prefix}song2 <song name>*\n` +
                       `*│   Example: ${prefix}song2 shape of you*\n` +
                       `*│*\n` +
                       `*│ ✦ ${prefix}song2 <YouTube URL>*\n` +
                       `*│   Example: ${prefix}song2 https://youtu.be/...*\n` +
                       `*│*\n` +
                       `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                       `> ${config.BOT_FOOTER}`,
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
                    text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                           `*│*\n` +
                           `*│ ❌ 𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝚕𝚒𝚗𝚔!*\n` +
                           `*│*\n` +
                           `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                           `> ${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
            
            const search = await yts({ videoId: videoId });
            if (search) videoData = search;
        } else {
            // Search for the song
            await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                       `*│*\n` +
                       `*│ 🔍 𝚂𝚎𝚊𝚛𝚌𝚑𝚒𝚗𝚐 𝚈𝚘𝚞𝚃𝚞𝚋𝚎 𝚏𝚘𝚛 "${q}"...*\n` +
                       `*│*\n` +
                       `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                       `> ${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            
            const search = await yts(q);
            if (!search || !search.all || search.all.length === 0) {
                await conn.sendMessage(from, {
                    react: { text: "❌", key: mek.key }
                });
                return await conn.sendMessage(from, {
                    text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                           `*│*\n` +
                           `*│ ❌ 𝙽𝚘 𝚛𝚎𝚜𝚞𝚕𝚝𝚜 𝚏𝚘𝚞𝚗𝚍 𝚏𝚘𝚛 "${q}"!*\n` +
                           `*│*\n` +
                           `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                           `> ${config.BOT_FOOTER}`,
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
                text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                       `*│*\n` +
                       `*│ ❌ 𝙲𝚘𝚞𝚕𝚍 𝚗𝚘𝚝 𝚐𝚎𝚝 𝚟𝚒𝚍𝚎𝚘 𝚒𝚗𝚏𝚘𝚛𝚖𝚊𝚝𝚒𝚘𝚗!*\n` +
                       `*│*\n` +
                       `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                       `> ${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const videoUrl = videoData.url;
        const title = videoData.title || 'Unknown Title';
        const thumbnail = videoData.thumbnail || videoData.image;
        const duration = videoData.timestamp || videoData.duration || 'N/A';
        const views = videoData.views ? videoData.views.toLocaleString() : 'N/A';

        // Create caption with song info
        const caption = `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                       `*│ 🐢 Song Found!*\n` +
                       `*│*\n` +
                       `*│ 🎵 Title : ${title.substring(0, 40)}*\n` +
                       `*│ ⏱️ Duration : ${duration}*\n` +
                       `*│ 👁️ Views : ${views}*\n` +
                       `*│ 🔗 Link : ${videoUrl}*\n` +
                       `*│*\n` +
                       `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                       `> ${config.BOT_FOOTER}`;

        // Create buttons for download options
        const buttons = [
            {
                buttonId: `${prefix}audiostream_${Buffer.from(videoUrl).toString('base64')}_${Buffer.from(title).toString('base64')}`,
                buttonText: { displayText: '🎵 𝙰𝚞𝚍𝚒𝚘 𝙼𝙿𝟹' },
                type: 1
            },
            {
                buttonId: `${prefix}audiodoc_${Buffer.from(videoUrl).toString('base64')}_${Buffer.from(title).toString('base64')}`,
                buttonText: { displayText: '📄 𝙰𝚞𝚍𝚒𝚘 𝙳𝚘𝚌' },
                type: 1
            }
        ];

        const buttonMessage = {
            image: { url: thumbnail },
            caption: caption,
            footer: config.BOT_FOOTER,
            buttons: buttons,
            headerType: 4,
            contextInfo: getContextInfo({ sender: sender })
        };

        // Send image with buttons
        await conn.sendMessage(from, buttonMessage, { quoted: fkontak });

        // Change reaction to indicate ready for download
        await conn.sendMessage(from, {
            react: { text: "✅", key: mek.key }
        });

    } catch (error) {
        console.error("Song command error:", error);
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                   `*│*\n` +
                   `*│ ⚠️ 𝙴𝚛𝚛𝚘𝚛: ${error.message.substring(0, 50)}*\n` +
                   `*│*\n` +
                   `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                   `> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// AUDIO STREAM BUTTON HANDLER
// ============================================
cmd({
    pattern: "audiostream",
    alias: ["audiomp3"],
    desc: "Handle audio stream button",
    category: "download",
    react: "🎵",
    filename: __filename,
    dontAddCommandList: true
}, async (conn, mek, m, { from, sender, args, q, prefix, reply, l }) => {
    try {
        if (!args[0]) return;

        // Decode the data from button
        const [encodedUrl, encodedTitle] = args;
        const videoUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
        const title = Buffer.from(encodedTitle, 'base64').toString('utf-8');

        await conn.sendMessage(from, {
            react: { text: "⬇️", key: mek.key }
        });

        // Download and send as audio stream
        const fallbackApi = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
        const fallbackResponse = await axios.get(fallbackApi, { timeout: 30000 });
        const fallbackData = fallbackResponse.data;

        if (fallbackData?.status && fallbackData.audio) {
            await conn.sendMessage(from, {
                audio: { url: fallbackData.audio },
                mimetype: "audio/mpeg",
                fileName: `${title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp3`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });

            await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                       `*│*\n` +
                       `*│ ✅ 𝙰𝚞𝚍𝚒𝚘 𝙼𝙿𝟹 𝚜𝚎𝚗𝚝 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢!*\n` +
                       `*│*\n` +
                       `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                       `> ${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });

            await conn.sendMessage(from, {
                react: { text: "✅", key: mek.key }
            });
        } else {
            throw new Error('No audio URL found');
        }

    } catch (error) {
        console.error("Audio stream error:", error);
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                   `*│*\n` +
                   `*│ ❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚊𝚞𝚍𝚒𝚘!*\n` +
                   `*│*\n` +
                   `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                   `> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// AUDIO DOC BUTTON HANDLER
// ============================================
cmd({
    pattern: "audiodoc",
    alias: ["audiodocument"],
    desc: "Handle audio document button",
    category: "download",
    react: "📄",
    filename: __filename,
    dontAddCommandList: true
}, async (conn, mek, m, { from, sender, args, q, prefix, reply, l }) => {
    try {
        if (!args[0]) return;

        // Decode the data from button
        const [encodedUrl, encodedTitle] = args;
        const videoUrl = Buffer.from(encodedUrl, 'base64').toString('utf-8');
        const title = Buffer.from(encodedTitle, 'base64').toString('utf-8');

        await conn.sendMessage(from, {
            react: { text: "⬇️", key: mek.key }
        });

        // Download and send as document
        const fallbackApi = `https://yt-dl.officialhectormanuel.workers.dev/?url=${encodeURIComponent(videoUrl)}`;
        const fallbackResponse = await axios.get(fallbackApi, { timeout: 30000 });
        const fallbackData = fallbackResponse.data;

        if (fallbackData?.status && fallbackData.audio) {
            await conn.sendMessage(from, {
                document: { url: fallbackData.audio },
                mimetype: "audio/mpeg",
                fileName: `${title.substring(0, 50).replace(/[^\w\s]/gi, '')}.mp3`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });

            await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                       `*│*\n` +
                       `*│ ✅ 𝙰𝚞𝚍𝚒𝚘 𝙳𝚘𝚌𝚞𝚖𝚎𝚗𝚝 𝚜𝚎𝚗𝚝 𝚜𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢!*\n` +
                       `*│*\n` +
                       `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                       `> ${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });

            await conn.sendMessage(from, {
                react: { text: "✅", key: mek.key }
            });
        } else {
            throw new Error('No audio URL found');
        }

    } catch (error) {
        console.error("Audio document error:", error);
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮\n` +
                   `*│*\n` +
                   `*│ ❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚊𝚞𝚍𝚒𝚘 𝚍𝚘𝚌𝚞𝚖𝚎𝚗𝚝!*\n` +
                   `*│*\n` +
                   `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯\n\n` +
                   `> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
