const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, downloadMediaMessage } = require('../lib/functions');
const fs = require('fs-extra');
const path = require('path');
const Jimp = require('jimp');
const axios = require('axios');
const FormData = require('form-data');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// ============================================
// 📌 MEDIA MENU
// ============================================
cmd({
    pattern: "mediamenu",
    alias: ["mmenu", "media"],
    desc: "Show all media commands",
    category: "media",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const mediaMenu = `╭─❖〔 🐢 MEDIA MENU 🐢 〕❖─╮
*│*
*│ 🎨 STICKER COMMANDS*
*│*
*│ 🖼️ .sticker*
*│    Create sticker from image/video*
*│    (Reply to media)*
*│*
*│ 🖼️ .toimg*
*│    Convert sticker to image*
*│    (Reply to sticker)*
*│*
*│ 🎥 .tovideo*
*│    Convert sticker/gif to video*
*│    (Reply to sticker)*
*│*
*│ 📝 .attp <text>*
*│    Create animated text sticker*
*│*
*│*
*│ 🔧 EDITING COMMANDS*
*│*
*│ 🎭 .emojimix 🐢+🐱*
*│    Mix two emojis*
*│*
*│ 📸 .take*
*│    Take/crop sticker*
*│    (Reply to sticker)*
*│*
*│ ✂️ .crop <width> <height>*
*│    Crop image*
*│    (Reply to image)*
*│*
*│ 📏 .resize <width> <height>*
*│    Resize image*
*│    (Reply to image)*
*│*
*│ 🌫️ .blur <level>*
*│    Blur image (1-10)*
*│    (Reply to image)*
*│*
*│ 🔄 .invert*
*│    Invert image colors*
*│    (Reply to image)*
*│*
*│ ⚫ .grayscale*
*│    Make image black & white*
*│    (Reply to image)*
*│*
*│ ⚡ .trigger*
*│    Triggered effect*
*│    (Reply to image)*
*│*
*│ ⭕ .circle*
*│    Make image circular*
*│    (Reply to image)*
*│*
*│ ↔️ .flip*
*│    Flip image horizontally*
*│    (Reply to image)*
*│*
*│*
*│ 🌐 UTILITY*
*│*
*│ 🔤 .tr <lang> <text>*
*│    Translate text*
*│    Ex: .tr en Hola*
*│    Or: .tr es Hello*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: mediaMenu,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Mediamenu error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 STICKER COMMAND
// ============================================
cmd({
    pattern: "sticker",
    alias: ["s", "stiker"],
    desc: "Create sticker from image/video",
    category: "media",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const quoted = mek.quoted || mek;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!mime || (!mime.includes('image') && !mime.includes('video'))) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image or video with .sticker*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let mediaPath = await downloadMediaMessage(quoted, `sticker_${Date.now()}`, true);
        
        let stickerPath = `sticker_${Date.now()}.webp`;
        
        if (mime.includes('image')) {
            await execPromise(`ffmpeg -i "${mediaPath}" -vcodec libwebp -vf "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0,split[a][b];[a]palettegen[p];[b][p]paletteuse" -loop 0 -vsync 0 -y "${stickerPath}"`);
        } else {
            await execPromise(`ffmpeg -i "${mediaPath}" -vcodec libwebp -vf "scale='min(320,iw)':min'(320,ih)':force_original_aspect_ratio=decrease,fps=15,pad=320:320:-1:-1:color=white@0.0" -loop 0 -vsync 0 -y "${stickerPath}"`);
        }

        const stickerBuffer = await fs.readFile(stickerPath);
        
        await conn.sendMessage(from, {
            sticker: stickerBuffer,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(stickerPath);

    } catch (error) {
        console.error('Sticker error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 TOIMG (Sticker to Image)
// ============================================
cmd({
    pattern: "toimg",
    alias: ["toimage", "stickerimg"],
    desc: "Convert sticker to image",
    category: "media",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const quoted = mek.quoted;
        if (!quoted || !quoted.message?.stickerMessage) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to a sticker with .toimg*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const mediaPath = await downloadMediaMessage(quoted, `toimg_${Date.now()}`, true);
        const outputPath = `toimg_${Date.now()}.png`;
        
        await execPromise(`ffmpeg -i "${mediaPath}" "${outputPath}"`);
        
        await conn.sendMessage(from, {
            image: { url: outputPath },
            caption: "✅ *Converted to image*",
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(outputPath);

    } catch (error) {
        console.error('Toimg error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 TOVIDEO (Sticker/GIF to Video)
// ============================================
cmd({
    pattern: "tovideo",
    alias: ["tomp4", "sticker2video"],
    desc: "Convert sticker/gif to video",
    category: "media",
    react: "🎥",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const quoted = mek.quoted;
        if (!quoted || !quoted.message?.stickerMessage) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to a sticker with .tovideo*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const mediaPath = await downloadMediaMessage(quoted, `tovideo_${Date.now()}`, true);
        const outputPath = `tovideo_${Date.now()}.mp4`;
        
        await execPromise(`ffmpeg -i "${mediaPath}" -c:v libx264 -preset ultrafast -y "${outputPath}"`);
        
        await conn.sendMessage(from, {
            video: { url: outputPath },
            caption: "✅ *Converted to video*",
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(outputPath);

    } catch (error) {
        console.error('Tovideo error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 ATTP (Animated Text Sticker)
// ============================================
cmd({
    pattern: "attp",
    alias: ["textsticker"],
    desc: "Create animated text sticker",
    category: "media",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .attp <text>",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const apiUrl = `https://api.lolhuman.xyz/api/attp?apikey=beta&text=${encodeURIComponent(text)}`;
        const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
        
        await conn.sendMessage(from, {
            sticker: Buffer.from(response.data),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Attp error:', error);
        
        // Fallback to alternative API
        try {
            const apiUrl = `https://api.erdwpe.com/api/maker/attp?text=${encodeURIComponent(text)}`;
            const response = await axios.get(apiUrl, { responseType: 'arraybuffer' });
            
            await conn.sendMessage(from, {
                sticker: Buffer.from(response.data),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        } catch (fallbackError) {
            await conn.sendMessage(from, {
                text: `❌ *Error:* ${error.message}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
    }
});

// ============================================
// 📌 TRANSLATE (Google Translate)
// ============================================
cmd({
    pattern: "tr",
    alias: ["translate"],
    desc: "Translate text using Google Translate",
    category: "media",
    react: "🔤",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        let targetLang = 'en';
        let text = args.join(' ');
        
        // Check if first argument is language code
        const langCode = args[0]?.toLowerCase();
        const langRegex = /^[a-z]{2}$/;
        
        if (langRegex.test(langCode)) {
            targetLang = langCode;
            text = args.slice(1).join(' ');
        }
        
        // If no text, try quoted message
        if (!text && mek.quoted) {
            text = mek.quoted.message?.conversation || 
                   mek.quoted.message?.extendedTextMessage?.text || '';
        }
        
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .tr <lang> <text> or reply to message\nExample: .tr es Hello\nOr: .tr en Hola",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Google Translate API
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
        const response = await axios.get(url);
        
        const translated = response.data[0][0][0];
        const detectedLang = response.data[2];

        const result = `╭─❖〔 🐢 TRANSLATE 🐢 〕❖─╮
*│*
*│ 🔤 Original: ${text}*
*│ 🌐 Detected: ${detectedLang}*
*│ 🎯 Target: ${targetLang}*
*│*
*│ 📝 Result:*
*│ ${translated}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: result,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Translate error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 EMOJIMIX
// ============================================
cmd({
    pattern: "emojimix",
    alias: ["mixemoji"],
    desc: "Mix two emojis",
    category: "media",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ');
        if (!text || !text.includes('+')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .emojimix 🐢+🐱",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const [emoji1, emoji2] = text.split('+').map(e => e.trim());
        
        const apiUrl = `https://tenor.googleapis.com/v2/featured?key=AIzaSyAyimkuYQYF_FXVALexPuGQctUWRURdCYQ&contentfilter=high&media_filter=png_transparent&component=proactive&collection=emoji_kitchen_v5&q=${encodeURIComponent(emoji1)}_${encodeURIComponent(emoji2)}`;
        
        const response = await axios.get(apiUrl);
        
        if (!response.data.results || !response.data.results[0]) {
            throw new Error('No mix found');
        }

        const imgUrl = response.data.results[0].url;
        
        await conn.sendMessage(from, {
            image: { url: imgUrl },
            caption: `╭─❖〔 🐢 EMOJIMIX 🐢 〕❖─╮
*│ 🎭 ${emoji1} + ${emoji2}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Emojimix error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* Could not mix these emojis`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 TAKE (Crop Sticker)
// ============================================
cmd({
    pattern: "take",
    alias: ["cropsticker"],
    desc: "Take/crop sticker",
    category: "media",
    react: "📸",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const quoted = mek.quoted;
        if (!quoted || !quoted.message?.stickerMessage) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to a sticker with .take*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const mediaPath = await downloadMediaMessage(quoted, `take_${Date.now()}`, true);
        
        // Convert to webp with different settings
        const outputPath = `take_${Date.now()}.webp`;
        await execPromise(`ffmpeg -i "${mediaPath}" -vcodec libwebp -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -loop 0 -vsync 0 -y "${outputPath}"`);
        
        const stickerBuffer = await fs.readFile(outputPath);
        
        await conn.sendMessage(from, {
            sticker: stickerBuffer,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(outputPath);

    } catch (error) {
        console.error('Take error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 CROP
// ============================================
cmd({
    pattern: "crop",
    alias: ["cropimage"],
    desc: "Crop image",
    category: "media",
    react: "✂️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const quoted = mek.quoted || mek;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!mime || !mime.includes('image')) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image with .crop <width> <height>*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let width = 500, height = 500;
        if (args.length >= 2) {
            width = parseInt(args[0]) || 500;
            height = parseInt(args[1]) || 500;
        }

        const mediaPath = await downloadMediaMessage(quoted, `crop_${Date.now()}`, true);
        
        const image = await Jimp.read(mediaPath);
        await image.crop(0, 0, width, height);
        await image.writeAsync(`crop_${Date.now()}.jpg`);

        await conn.sendMessage(from, {
            image: { url: `crop_${Date.now()}.jpg` },
            caption: `✅ *Cropped to ${width}x${height}*`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(`crop_${Date.now()}.jpg`);

    } catch (error) {
        console.error('Crop error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 RESIZE
// ============================================
cmd({
    pattern: "resize",
    alias: ["resizeimage"],
    desc: "Resize image",
    category: "media",
    react: "📏",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const quoted = mek.quoted || mek;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!mime || !mime.includes('image')) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image with .resize <width> <height>*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let width = 800, height = 800;
        if (args.length >= 2) {
            width = parseInt(args[0]) || 800;
            height = parseInt(args[1]) || 800;
        }

        const mediaPath = await downloadMediaMessage(quoted, `resize_${Date.now()}`, true);
        
        const image = await Jimp.read(mediaPath);
        await image.resize(width, height);
        await image.writeAsync(`resize_${Date.now()}.jpg`);

        await conn.sendMessage(from, {
            image: { url: `resize_${Date.now()}.jpg` },
            caption: `✅ *Resized to ${width}x${height}*`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(`resize_${Date.now()}.jpg`);

    } catch (error) {
        console.error('Resize error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 BLUR
// ============================================
cmd({
    pattern: "blur",
    alias: ["blurimage"],
    desc: "Blur image",
    category: "media",
    react: "🌫️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const quoted = mek.quoted || mek;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!mime || !mime.includes('image')) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image with .blur <level (1-10)>*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let level = parseInt(args[0]) || 5;
        level = Math.min(10, Math.max(1, level)); // Clamp between 1-10

        const mediaPath = await downloadMediaMessage(quoted, `blur_${Date.now()}`, true);
        
        const image = await Jimp.read(mediaPath);
        image.blur(level);
        await image.writeAsync(`blur_${Date.now()}.jpg`);

        await conn.sendMessage(from, {
            image: { url: `blur_${Date.now()}.jpg` },
            caption: `✅ *Blurred (level ${level})*`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(`blur_${Date.now()}.jpg`);

    } catch (error) {
        console.error('Blur error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 INVERT
// ============================================
cmd({
    pattern: "invert",
    alias: ["invertimage", "negative"],
    desc: "Invert image colors",
    category: "media",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const quoted = mek.quoted || mek;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!mime || !mime.includes('image')) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image with .invert*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const mediaPath = await downloadMediaMessage(quoted, `invert_${Date.now()}`, true);
        
        const image = await Jimp.read(mediaPath);
        image.invert();
        await image.writeAsync(`invert_${Date.now()}.jpg`);

        await conn.sendMessage(from, {
            image: { url: `invert_${Date.now()}.jpg` },
            caption: "✅ *Colors inverted*",
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(`invert_${Date.now()}.jpg`);

    } catch (error) {
        console.error('Invert error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 GRAYSCALE
// ============================================
cmd({
    pattern: "grayscale",
    alias: ["grey", "bw", "blackwhite"],
    desc: "Convert image to black & white",
    category: "media",
    react: "⚫",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const quoted = mek.quoted || mek;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!mime || !mime.includes('image')) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image with .grayscale*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const mediaPath = await downloadMediaMessage(quoted, `gray_${Date.now()}`, true);
        
        const image = await Jimp.read(mediaPath);
        image.grayscale();
        await image.writeAsync(`gray_${Date.now()}.jpg`);

        await conn.sendMessage(from, {
            image: { url: `gray_${Date.now()}.jpg` },
            caption: "✅ *Converted to black & white*",
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(`gray_${Date.now()}.jpg`);

    } catch (error) {
        console.error('Grayscale error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 TRIGGER
// ============================================
cmd({
    pattern: "trigger",
    alias: ["triggered"],
    desc: "Create triggered effect",
    category: "media",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const quoted = mek.quoted || mek;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!mime || !mime.includes('image')) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image with .trigger*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const mediaPath = await downloadMediaMessage(quoted, `trigger_${Date.now()}`, true);
        
        // Use trigger API
        const form = new FormData();
        form.append('image', fs.createReadStream(mediaPath));
        
        const response = await axios.post('https://triggered-api.herokuapp.com/api/triggered', form, {
            headers: form.getHeaders(),
            responseType: 'arraybuffer'
        });

        await conn.sendMessage(from, {
            video: Buffer.from(response.data),
            caption: "⚡ *TRIGGERED!*",
            gifPlayback: true,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        fs.unlinkSync(mediaPath);

    } catch (error) {
        console.error('Trigger error:', error);
        
        // Fallback to local method
        try {
            const mediaPath = await downloadMediaMessage(quoted, `trigger_${Date.now()}`, true);
            const outputPath = `trigger_${Date.now()}.mp4`;
            
            await execPromise(`ffmpeg -i "${mediaPath}" -vf "eq=saturation=0,scale=320:320,format=yuv420p" -loop 5 -t 3 -y "${outputPath}"`);
            
            await conn.sendMessage(from, {
                video: { url: outputPath },
                caption: "⚡ *TRIGGERED!*",
                gifPlayback: true,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });

            fs.unlinkSync(mediaPath);
            fs.unlinkSync(outputPath);
        } catch (fallbackError) {
            await conn.sendMessage(from, {
                text: `❌ *Error:* ${error.message}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
    }
});

// ============================================
// 📌 CIRCLE
// ============================================
cmd({
    pattern: "circle",
    alias: ["circlecrop", "round"],
    desc: "Make image circular",
    category: "media",
    react: "⭕",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const quoted = mek.quoted || mek;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!mime || !mime.includes('image')) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image with .circle*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const mediaPath = await downloadMediaMessage(quoted, `circle_${Date.now()}`, true);
        
        const image = await Jimp.read(mediaPath);
        const size = Math.min(image.bitmap.width, image.bitmap.height);
        
        image.resize(size, size);
        
        // Create circular mask
        const circle = new Jimp(size, size, 0x00000000);
        const radius = size / 2;
        
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                const dx = x - radius;
                const dy = y - radius;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance <= radius) {
                    const rgba = Jimp.intToRGBA(image.getPixelColor(x, y));
                    circle.setPixelColor(Jimp.rgbaToInt(rgba.r, rgba.g, rgba.b, rgba.a), x, y);
                }
            }
        }
        
        await circle.writeAsync(`circle_${Date.now()}.png`);

        await conn.sendMessage(from, {
            image: { url: `circle_${Date.now()}.png` },
            caption: "✅ *Circular image created*",
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(`circle_${Date.now()}.png`);

    } catch (error) {
        console.error('Circle error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 FLIP
// ============================================
cmd({
    pattern: "flip",
    alias: ["fliph", "horizontal"],
    desc: "Flip image horizontally",
    category: "media",
    react: "↔️",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const quoted = mek.quoted || mek;
        const mime = (quoted.msg || quoted).mimetype || '';
        
        if (!mime || !mime.includes('image')) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image with .flip*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const mediaPath = await downloadMediaMessage(quoted, `flip_${Date.now()}`, true);
        
        const image = await Jimp.read(mediaPath);
        image.flip(true, false);
        await image.writeAsync(`flip_${Date.now()}.jpg`);

        await conn.sendMessage(from, {
            image: { url: `flip_${Date.now()}.jpg` },
            caption: "✅ *Image flipped horizontally*",
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Cleanup
        fs.unlinkSync(mediaPath);
        fs.unlinkSync(`flip_${Date.now()}.jpg`);

    } catch (error) {
        console.error('Flip error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
