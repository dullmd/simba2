const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "funmenu",
    alias: ["fmenu", "gamesmenu"],
    desc: "Show all fun & games commands",
    category: "fun",
    react: "🎮",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const funMenu = `╭─❖〔 🐢 FUN & GAMES MENU 🐢 〕❖─╮
*│*
*│ 🎮 GAMES*
*│*
*│ 🎱 .8ball <question>*
*│    Ask magic 8-ball*
*│*
*│ 🔢 .guess*
*│    Number guessing game*
*│*
*│ 🧩 .riddle*
*│    Get a riddle to solve*
*│*
*│ ✅ .answer <answer>*
*│    Answer the riddle*
*│*
*│ 🎮 .tictactoe @user*
*│    Play tic-tac-toe*
*│*
*│ 🧮 .math <expression>*
*│    Solve math problem*
*│*
*│*
*│ 🎭 FUN COMMANDS*
*│*
*│ 🤔 .truth*
*│    Random truth question*
*│*
*│ 😈 .dare*
*│    Random dare challenge*
*│*
*│ ❤️ .ship @user1 @user2*
*│    Love calculator*
*│*
*│ ⭐ .rate <text>*
*│    Rate something*
*│*
*│ 😂 .joke*
*│    Random joke*
*│*
*│ 💭 .quote*
*│    Inspirational quote*
*│*
*│ 💕 .compliment @user*
*│    Give a compliment*
*│*
*│ 🎲 .roll [sides]*
*│    Roll a dice*
*│*
*│ 🪙 .flipcoin*
*│    Flip a coin*
*│*
*│ 🎰 .lottery*
*│    Try your luck*
*│*
*│ ⚔️ .fight @user*
*│    Fight someone*
*│*
*│*
*│ 👤 USER RATINGS*
*│ 💻 .hack @user*
*│    Hack someone*
*│*
*│ 👀 .stalk @user*
*│    Stalk someone*
*│*
*│ 🧠 .iq @user*
*│    Check IQ*
*│*
*│ 💅 .beauty @user*
*│    Beauty rate*
*│*
*│ 🌈 .gayrate @user*
*│    Gay meter*
*│*
*│ 💰 .richrate @user*
*│    Rich meter*
*│*
*│*
*│ 🎭 ACTIONS*
*│ 😴 .sleep*
*│    Go to sleep*
*│*
*│ 💃 .dance*
*│    Show moves*
*│*
*│ 😢 .cry*
*│    Express sadness*
*│*
*│ 😂 .laugh*
*│    Have a laugh*
*│*
*│ 🖼️ .meme*
*│    Random meme*
*│*
*│ 🔥 .roast @user*
*│    Friendly roast*
*│*
*│ 🎭 .character <name>*
*│    Character profile*
*│*
*│ 💑 .couple*
*│    Love facts & tips*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: funMenu,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Funmenu error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
