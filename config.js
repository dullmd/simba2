module.exports = {
    // ============================================
    // 📌 MONGODB CONNECTION
    // ============================================
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://malvintech11_db_user:0SBgxRy7WsQZ1KTq@cluster0.xqgaovj.mongodb.net/',
    
    // ============================================
    // 📌 BOT CONFIGURATION
    // ============================================
    PREFIX: '.',
    NO_PREFIX: 'true', // Enable commands without prefix
    AUTO_AI: 'true', // Auto chatbot AI
    AUTO_VIEW_STATUS: 'true',
    AUTO_LIKE_STATUS: 'true',
    AUTO_RECORDING: 'true',
    AUTO_LIKE_EMOJI: ['💋', '😶', '✨️', '💗', '🎈', '🎉', '🥳', '❤️', '🧫', '🐢'],
    
    // ============================================
    // 📌 BOT INFO
    // ============================================
    OWNER_NUMBER: '255612491554',
    OWNER_NAME: '𝐒𝐈𝐋𝐀 𝐌𝐃',
    BOT_NAME: '𝚂𝙸𝙻𝙰-𝙼𝙳',
    BOT_FOOTER: '> © 𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝚂𝙸𝙻𝙰-𝙼𝙳',
    version: '2.0.0',
    
    // ============================================
    // 📌 MEDIA & LINKS
    // ============================================
    IMAGE_PATH: 'https://raw.githubusercontent.com/dullmd/simba2/refs/heads/main/sila/silatz/sila_image.jpg',
    RCD_IMAGE_PATH: 'https://raw.githubusercontent.com/dullmd/simba2/refs/heads/main/sila/silatz/sila-logo.jpg',
    GROUP_INVITE_LINK: 'https://chat.whatsapp.com/IdGNaKt80DEBqirc2ek4ks',
    CHANNEL_LINK: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
    
    // ============================================
    // 📌 NEWSLETTER JIDS
    // ============================================
    NEWSLETTER_JIDS: ['120363402325089913@newsletter'],
    
    // ============================================
    // 📌 SYSTEM CONFIG
    // ============================================
    MAX_RETRIES: 3,
    OTP_EXPIRY: 300000,

    // Add this to your config.js
    GITHUB_REPO: 'https://github.com/dullmd/simba2', // Your GitHub repo
    
    // ============================================
    // 📌 AUTO-REPLY MESSAGES
    // ============================================
    autoReplies: {
        'hi': '*𝙷𝚎𝚕𝚕𝚘! 👋 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚑𝚎𝚕𝚙 𝚢𝚘𝚞 𝚝𝚘𝚍𝚊𝚢?*',
        'mambo': '*𝙿𝚘𝚊 𝚜𝚊𝚗𝚊! 👋 𝙽𝚒𝚔𝚞𝚜𝚊𝚒𝚍𝚒𝚎 𝙺𝚞𝚑𝚞𝚜𝚞?*',
        'hey': '*𝙷𝚎𝚢 𝚝𝚑𝚎𝚛𝚎! 😊*',
        'hello': '*𝙷𝚒 𝚝𝚑𝚎𝚛𝚎! 😊*',
        'bot': '*𝚈𝚎𝚜, 𝙸 𝚊𝚖 𝚂𝙸𝙻𝙰 𝙼𝙳! 🤖*',
        'thanks': '*𝚈𝚘𝚞\'𝚛𝚎 𝚠𝚎𝚕𝚌𝚘𝚖𝚎! 😊*'
    }
};
