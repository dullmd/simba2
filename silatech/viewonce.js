const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const { downloadContentFromMessage } = require('@whiskeysockets/baileys');

cmd({
    pattern: "vv",
    alias: ["antivv", "avv", "viewonce", "open"],
    desc: "Open view-once messages",
    category: "owner",
    react: "👁️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isOwner }) => {
    try {
        const fromMe = mek.key.fromMe;
        const isCreator = fromMe || isOwner;
        const quoted = mek.message?.extendedTextMessage?.contextInfo?.quotedMessage;

        if (!isCreator) {
            return await conn.sendMessage(from, {
                text: "🚫 Owner only command!",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (!quoted) {
            return await conn.sendMessage(from, {
                text: "*𝙷𝙰𝚂 𝙰𝙽𝚈𝙾𝙽𝙴 𝚂𝙴𝙽𝚃 𝚈𝙾𝚄 𝙿𝚁𝙸𝚅𝙰𝚃𝙴 𝙿𝙷𝙾𝚃𝙾, 𝚅𝙸𝙳𝙴𝙾 𝙾𝚁 𝙰𝚄𝙳𝙸𝙾 🥺 𝙰𝙽𝙳 𝚈𝙾𝚄 𝚆𝙰𝙽𝚃 𝚃𝙾 𝚂𝙴𝙴 𝙸𝚃 🤔*\n\n*𝚃𝙷𝙴𝙽 𝚆𝚁𝙸𝚃𝙴 𝙻𝙸𝙺𝙴 𝚃𝙷𝙸𝚂 ☺️*\n\n*❮𝚅𝚅❯*\n\n*𝚃𝙷𝙴𝙽 𝚃𝙷𝙰𝚃 𝙿𝚁𝙸𝚅𝙰𝚃𝙴 𝙿𝙷𝙾𝚃𝙾, 𝚅𝙸𝙳𝙴𝙾 𝙾𝚁 𝙰𝚄𝙳𝙸𝙾 𝚆𝙸𝙻𝙻 𝙾𝙿𝙴𝙽 🥰*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let type = Object.keys(quoted)[0];
        if (!["imageMessage", "videoMessage", "audioMessage"].includes(type)) {
            return await conn.sendMessage(from, {
                text: "*𝚈𝙾𝚄 𝙾𝙽𝙻𝚈 𝙽𝙴𝙴𝙳 𝚃𝙾 𝙼𝙴𝙽𝚃𝙸𝙾𝙽 𝚃𝙷𝙴 𝙿𝙷𝙾𝚃𝙾, 𝚅𝙸𝙳𝙴𝙾 𝙾𝚁 𝙰𝚄𝙳𝙸𝙾 🥺*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const stream = await downloadContentFromMessage(quoted[type], type.replace("Message", ""));
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        let sendContent = {};
        if (type === "imageMessage") {
            sendContent = {
                image: buffer,
                caption: quoted[type]?.caption || "",
                mimetype: quoted[type]?.mimetype || "image/jpeg"
            };
        } else if (type === "videoMessage") {
            sendContent = {
                video: buffer,
                caption: quoted[type]?.caption || "",
                mimetype: quoted[type]?.mimetype || "video/mp4"
            };
        } else if (type === "audioMessage") {
            sendContent = {
                audio: buffer,
                mimetype: quoted[type]?.mimetype || "audio/mp4",
                ptt: quoted[type]?.ptt || false
            };
        }

        await conn.sendMessage(from, sendContent, { quoted: fkontak });
        
        await conn.sendMessage(from, {
            react: { text: '😍', key: mek.key }
        });

    } catch (error) {
        await conn.sendMessage(from, {
            text: `*𝙿𝙻𝙴𝙰𝚂𝙴 𝚆𝚁𝙸𝚃𝙴 ❮𝚅𝚅❯ 𝙰𝙶𝙰𝙸𝙽 🥺*\n\n_Error:_ ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
