const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, sleep } = require('../lib/functions');
const axios = require('axios');

// ============================================
// 📌 TRUTH COMMAND
// ============================================
cmd({
    pattern: "truth",
    alias: ["truthquestion"],
    desc: "Get a random truth question",
    category: "fun",
    react: "🤔",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const truths = [
            "What's the most embarrassing thing you've ever done?",
            "Have you ever lied to your best friend?",
            "Who was your first crush?",
            "What's your biggest fear in a relationship?",
            "Have you ever cheated on a test?",
            "What's the worst date you've ever been on?",
            "Have you ever sent a text to the wrong person?",
            "What's your guilty pleasure?",
            "Have you ever stalked someone on social media?",
            "What's the most childish thing you still do?",
            "Have you ever pretended to be sick to avoid something?",
            "What's your biggest insecurity?",
            "Have you ever been in love?",
            "What's the weirdest dream you've ever had?",
            "Have you ever stolen anything?",
            "What's the most embarrassing purchase you've made?",
            "Have you ever broken someone's heart?",
            "What's your biggest regret?",
            "Have you ever lied on your resume?",
            "What's the most awkward moment you've experienced?"
        ];
        
        const randomTruth = truths[Math.floor(Math.random() * truths.length)];
        
        const truthText = `╭─❖〔 🐢 TRUTH 〕❖─╮
*│*
*│ 🤔 ${randomTruth}*
*│*
*│ 👤 For: @${sender.split('@')[0]}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: truthText,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Truth error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 DARE COMMAND
// ============================================
cmd({
    pattern: "dare",
    alias: ["darechallenge"],
    desc: "Get a random dare",
    category: "fun",
    react: "😈",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        dares = [
            "Do 10 pushups right now",
            "Send your last text message to the group",
            "Call someone and say 'I love you'",
            "Sing a song out loud",
            "Send a random emoji to your crush",
            "Post an embarrassing photo on your status",
            "Talk in an accent for the next 3 rounds",
            "Let someone write a status for you",
            "Do a handstand against the wall",
            "Speak in whispers for the next 10 minutes",
            "Let someone tickle you for 10 seconds",
            "Do your best dance move now",
            "Send a voice note saying 'I'm a monkey'",
            "Change your display name to 'Baby' for 1 hour",
            "Text your mom 'I'm pregnant/ I got someone pregnant'",
            "Eat something without using your hands",
            "Do 20 jumping jacks",
            "Let someone draw on your face with a pen",
            "Talk like a robot for 5 minutes",
            "Send your gallery's first photo to the group"
        ];
        
        const randomDare = dares[Math.floor(Math.random() * dares.length)];
        
        const dareText = `╭─❖〔 🐢 DARE 〕❖─╮
*│*
*│ 😈 ${randomDare}*
*│*
*│ 👤 For: @${sender.split('@')[0]}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: dareText,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Dare error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 SHIP COMMAND
// ============================================
cmd({
    pattern: "ship",
    alias: ["match", "lovecalculator"],
    desc: "Calculate love between two people",
    category: "fun",
    react: "❤️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        if (args.length < 2) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .ship @user1 @user2",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Get mentioned users
        let user1, user2;
        
        if (mek.mentionedJid && mek.mentionedJid.length >= 2) {
            user1 = mek.mentionedJid[0];
            user2 = mek.mentionedJid[1];
        } else {
            // Try to get from args
            const num1 = args[0].replace(/[^0-9]/g, '');
            const num2 = args[1].replace(/[^0-9]/g, '');
            user1 = num1 + '@s.whatsapp.net';
            user2 = num2 + '@s.whatsapp.net';
        }

        // Calculate love percentage
        const lovePercentage = Math.floor(Math.random() * 101);
        
        let loveMessage = '';
        let loveEmoji = '';
        
        if (lovePercentage < 30) {
            loveMessage = 'Not meant to be 😢';
            loveEmoji = '💔';
        } else if (lovePercentage < 50) {
            loveMessage = 'Could work with effort 💪';
            loveEmoji = '🤝';
        } else if (lovePercentage < 70) {
            loveMessage = 'Good match! 👍';
            loveEmoji = '💑';
        } else if (lovePercentage < 90) {
            loveMessage = 'Perfect couple! ❤️';
            loveEmoji = '💕';
        } else {
            loveMessage = 'Soulmates! Forever! 💖';
            loveEmoji = '💞';
        }

        // Create progress bar
        const filled = Math.floor(lovePercentage / 10);
        const empty = 10 - filled;
        const progressBar = '▓'.repeat(filled) + '░'.repeat(empty);

        const shipText = `╭─❖〔 🐢 LOVE CALCULATOR 🐢 〕❖─╮
*│*
*│ ❤️ SHIP RESULTS*
*│*
*│ 👤 @${user1.split('@')[0]}*
*│ 👤 @${user2.split('@')[0]}*
*│*
*│ 💘 Love: ${lovePercentage}%*
*│ ${progressBar}*
*│ ${loveEmoji} ${loveMessage}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: shipText,
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: [user1, user2] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Ship error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 RATE COMMAND
// ============================================
cmd({
    pattern: "rate",
    alias: ["rateme"],
    desc: "Rate something or someone",
    category: "fun",
    react: "⭐",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || 'you';
        const rating = Math.floor(Math.random() * 11);
        
        const stars = '⭐'.repeat(rating) + '☆'.repeat(10 - rating);
        
        const rateText = `╭─❖〔 🐢 RATE 〕❖─╮
*│*
*│ 🎯 Rating: ${text}*
*│*
*│ ${stars}*
*│ ${rating}/10*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: rateText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Rate error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 JOKE COMMAND
// ============================================
cmd({
    pattern: "joke",
    alias: ["jokes", "funny"],
    desc: "Get a random joke",
    category: "fun",
    react: "😂",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        // Try API first
        try {
            const response = await axios.get('https://v2.jokeapi.dev/joke/Any?type=single', {
                timeout: 5000
            });
            
            if (response.data && response.data.joke) {
                const jokeText = `╭─❖〔 🐢 JOKE 〕❖─╮
*│*
*│ 😂 ${response.data.joke}*
*│*
*│ 📌 Category: ${response.data.category}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

                return await conn.sendMessage(from, {
                    text: jokeText,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
        } catch (apiError) {
            console.log('Joke API failed, using local jokes');
        }

        // Local jokes fallback
        const jokes = [
            "Why don't scientists trust atoms? Because they make up everything!",
            "What do you call a fake noodle? An impasta!",
            "Why did the scarecrow win an award? Because he was outstanding in his field!",
            "Why don't eggs tell jokes? They'd crack each other up!",
            "What do you call a bear with no teeth? A gummy bear!",
            "Why couldn't the bicycle stand up by itself? It was two-tired!",
            "What did the grape do when he got stepped on? He let out a little wine!",
            "Why don't skeletons fight each other? They don't have the guts!",
            "What do you call a sleeping bull? A bulldozer!",
            "Why did the math book look sad? Because it had too many problems!"
        ];
        
        const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
        
        const jokeText = `╭─❖〔 🐢 JOKE 〕❖─╮
*│*
*│ 😂 ${randomJoke}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: jokeText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Joke error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 QUOTE COMMAND
// ============================================
cmd({
    pattern: "quote",
    alias: ["quotes", "inspire"],
    desc: "Get a random inspirational quote",
    category: "fun",
    react: "💭",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        // Try API first
        try {
            const response = await axios.get('https://api.quotable.io/random', {
                timeout: 5000
            });
            
            if (response.data && response.data.content) {
                const quoteText = `╭─❖〔 🐢 QUOTE 〕❖─╮
*│*
*│ 💭 "${response.data.content}"*
*│*
*│ 📝 — ${response.data.author}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

                return await conn.sendMessage(from, {
                    text: quoteText,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
        } catch (apiError) {
            console.log('Quote API failed, using local quotes');
        }

        // Local quotes fallback
        const quotes = [
            { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
            { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
            { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
            { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
            { text: "Everything you've ever wanted is on the other side of fear.", author: "Unknown" },
            { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
            { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
            { text: "The only impossible journey is the one you never begin.", author: "Tony Robbins" }
        ];
        
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        
        const quoteText = `╭─❖〔 🐢 QUOTE 〕❖─╮
*│*
*│ 💭 "${randomQuote.text}"*
*│*
*│ 📝 — ${randomQuote.author}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: quoteText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Quote error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMPLIMENT COMMAND
// ============================================
cmd({
    pattern: "compliment",
    alias: ["complimentme", "praise"],
    desc: "Give a compliment to someone",
    category: "fun",
    react: "💕",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        // Get target user
        let targetUser = sender;
        
        if (mek.mentionedJid && mek.mentionedJid.length > 0) {
            targetUser = mek.mentionedJid[0];
        } else if (mek.quoted) {
            targetUser = mek.quoted.sender;
        }

        const compliments = [
            "You have an amazing smile! 😊",
            "You're a ray of sunshine on a cloudy day ☀️",
            "Your kindness knows no bounds 💝",
            "You're smarter than you think 🧠",
            "You make the world a better place 🌍",
            "Your energy is absolutely contagious ⚡",
            "You're capable of amazing things 💪",
            "Your laugh is the best sound ever 🔊",
            "You're beautiful inside and out 💎",
            "You're a true friend to everyone 🫂",
            "You have such a great sense of humor 😄",
            "You're stronger than you know 🌟",
            "You light up every room you enter 💡",
            "You're one of a kind, never change ✨",
            "Your creativity inspires me 🎨"
        ];
        
        const randomCompliment = compliments[Math.floor(Math.random() * compliments.length)];
        
        const complimentText = `╭─❖〔 🐢 COMPLIMENT 〕❖─╮
*│*
*│ 💕 @${targetUser.split('@')[0]}*
*│*
*│ ✨ ${randomCompliment}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: complimentText,
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: [targetUser] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Compliment error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 ROAST COMMAND
// ============================================
cmd({
    pattern: "roast",
    alias: ["roastme", "burn"],
    desc: "Roast someone (friendly)",
    category: "fun",
    react: "🔥",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        // Get target user
        let targetUser = sender;
        
        if (mek.mentionedJid && mek.mentionedJid.length > 0) {
            targetUser = mek.mentionedJid[0];
        } else if (mek.quoted) {
            targetUser = mek.quoted.sender;
        }

        const roasts = [
            "You're not stupid; you just have bad luck thinking. 🤪",
            "If I had a face like yours, I'd sue my parents. 👶",
            "You're proof that evolution can go in reverse. 🐒",
            "I'd agree with you, but then we'd both be wrong. 🤝",
            "You bring everyone so much joy—when you leave the room. 🚪",
            "I'd explain it to you, but I left my crayons at home. 🖍️",
            "You're not pretty enough to be that dumb. 💁",
            "Somewhere out there, a tree is working hard to replace the oxygen you waste. 🌳",
            "You have the right to remain silent. Use it. 🤐",
            "If brains were dynamite, you couldn't blow your nose. 💥",
            "You're like a cloud. When you disappear, it's a beautiful day. ☁️",
            "You're so fake, even Google can't find you. 🔍",
            "Your secrets are always safe with me. I never listen. 👂",
            "You're so ugly, when you were born, the doctor slapped your mother. 👋"
        ];
        
        const randomRoast = roasts[Math.floor(Math.random() * roasts.length)];
        
        const roastText = `╭─❖〔 🐢 ROAST 〕❖─╮
*│*
*│ 🔥 @${targetUser.split('@')[0]}*
*│*
*│ 😈 ${randomRoast}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: roastText,
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: [targetUser] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Roast error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 8BALL COMMAND
// ============================================
cmd({
    pattern: "8ball",
    alias: ["magicball", "fortune"],
    desc: "Ask the magic 8-ball a question",
    category: "fun",
    react: "🎱",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const question = args.join(' ');
        
        if (!question) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .8ball <your question>\nExample: .8ball Will I be rich?",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const responses = [
            "Yes, definitely! ✅",
            "It is certain. 🔮",
            "Without a doubt. 💯",
            "Most likely. 📊",
            "Outlook good. 🌟",
            "Ask again later. 🔄",
            "Better not tell you now. 🤫",
            "Cannot predict now. 🤔",
            "Concentrate and ask again. 🧘",
            "Don't count on it. ❌",
            "My reply is no. 🙅",
            "Very doubtful. 🤨",
            "No way! 😱",
            "Absolutely not! 🚫",
            "Yes, but be patient. ⏳"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        const ballText = `╭─❖〔 🐢 MAGIC 8-BALL 🐢 〕❖─╮
*│*
*│ 🎱 Question: ${question}*
*│*
*│ 🔮 Answer: ${randomResponse}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: ballText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('8ball error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 TICTACTOE COMMAND (Multiplayer)
// ============================================
const tttGames = new Map();

cmd({
    pattern: "tictactoe",
    alias: ["ttt", "xoxo"],
    desc: "Play tic-tac-toe with someone",
    category: "fun",
    react: "🎮",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *Tic-tac-toe can only be played in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Check if there's an existing game
        if (tttGames.has(from)) {
            return await conn.sendMessage(from, {
                text: "❌ *A game is already in progress in this group!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Get opponent
        let opponent;
        if (mek.mentionedJid && mek.mentionedJid.length > 0) {
            opponent = mek.mentionedJid[0];
        } else if (args[0]) {
            const num = args[0].replace(/[^0-9]/g, '');
            opponent = num + '@s.whatsapp.net';
        } else {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .tictactoe @opponent",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (opponent === sender) {
            return await conn.sendMessage(from, {
                text: "❌ *You cannot play with yourself!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Initialize game
        const game = {
            board: ['⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜', '⬜'],
            players: [sender, opponent],
            turn: sender, // Player 1 starts (X)
            moves: 0,
            active: true
        };
        
        tttGames.set(from, game);

        const boardDisplay = displayBoard(game.board);
        
        const startText = `╭─❖〔 🐢 TIC-TAC-TOE 🐢 〕❖─╮
*│*
*│ 🎮 Game Started!*
*│*
*│ 👤 X: @${sender.split('@')[0]}*
*│ 👤 O: @${opponent.split('@')[0]}*
*│*
*│ 📍 Current Turn: @${sender.split('@')[0]} (X)*
*│*
*│ ${boardDisplay[0]} | ${boardDisplay[1]} | ${boardDisplay[2]}*
*│---+---+---*
*│ ${boardDisplay[3]} | ${boardDisplay[4]} | ${boardDisplay[5]}*
*│---+---+---*
*│ ${boardDisplay[6]} | ${boardDisplay[7]} | ${boardDisplay[8]}*
*│*
*│ 📝 Send number 1-9 to place your mark*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: startText,
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: [sender, opponent] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Tictactoe error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// Handle tic-tac-toe moves
cmd({ on: "body" }, async (conn, mek, m, { from, body, isGroup, sender }) => {
    try {
        if (!isGroup) return;
        if (!tttGames.has(from)) return;
        
        const game = tttGames.get(from);
        if (!game.active) return;
        
        // Check if it's this player's turn
        if (game.turn !== sender) return;
        
        // Check if move is a number 1-9
        const move = parseInt(body);
        if (isNaN(move) || move < 1 || move > 9) return;
        
        const index = move - 1;
        
        // Check if cell is empty
        if (game.board[index] !== '⬜') {
            await conn.sendMessage(from, {
                text: "❌ *That cell is already taken! Choose another.*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            return;
        }
        
        // Place mark
        const mark = game.turn === game.players[0] ? '❌' : '⭕';
        game.board[index] = mark;
        game.moves++;
        
        // Check for winner
        const winner = checkWinner(game.board);
        
        if (winner) {
            game.active = false;
            
            const boardDisplay = displayBoard(game.board);
            const winnerText = `╭─❖〔 🐢 TIC-TAC-TOE 🐢 〕❖─╮
*│*
*│ 🏆 GAME OVER!*
*│*
*│ 👑 Winner: @${game.turn.split('@')[0]}*
*│*
*│ ${boardDisplay[0]} | ${boardDisplay[1]} | ${boardDisplay[2]}*
*│---+---+---*
*│ ${boardDisplay[3]} | ${boardDisplay[4]} | ${boardDisplay[5]}*
*│---+---+---*
*│ ${boardDisplay[6]} | ${boardDisplay[7]} | ${boardDisplay[8]}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

            await conn.sendMessage(from, {
                text: winnerText,
                contextInfo: getContextInfo({ 
                    sender: sender, 
                    mentionedJid: [game.turn] 
                })
            }, { quoted: fkontak });
            
            tttGames.delete(from);
            return;
        }
        
        // Check for draw
        if (game.moves === 9) {
            game.active = false;
            
            const boardDisplay = displayBoard(game.board);
            const drawText = `╭─❖〔 🐢 TIC-TAC-TOE 🐢 〕❖─╮
*│*
*│ 🤝 IT'S A DRAW!*
*│*
*│ ${boardDisplay[0]} | ${boardDisplay[1]} | ${boardDisplay[2]}*
*│---+---+---*
*│ ${boardDisplay[3]} | ${boardDisplay[4]} | ${boardDisplay[5]}*
*│---+---+---*
*│ ${boardDisplay[6]} | ${boardDisplay[7]} | ${boardDisplay[8]}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

            await conn.sendMessage(from, {
                text: drawText,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            
            tttGames.delete(from);
            return;
        }
        
        // Switch turn
        game.turn = game.turn === game.players[0] ? game.players[1] : game.players[0];
        
        const boardDisplay = displayBoard(game.board);
        const turnText = `╭─❖〔 🐢 TIC-TAC-TOE 🐢 〕❖─╮
*│*
*│ 🎮 Game in Progress*
*│*
*│ 📍 Next Turn: @${game.turn.split('@')[0]} (${game.turn === game.players[0] ? '❌' : '⭕'})*
*│*
*│ ${boardDisplay[0]} | ${boardDisplay[1]} | ${boardDisplay[2]}*
*│---+---+---*
*│ ${boardDisplay[3]} | ${boardDisplay[4]} | ${boardDisplay[5]}*
*│---+---+---*
*│ ${boardDisplay[6]} | ${boardDisplay[7]} | ${boardDisplay[8]}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: turnText,
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: [game.turn] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Tic-tac-toe move error:', error);
    }
});

// Helper function to display board
function displayBoard(board) {
    return board.map(cell => {
        if (cell === '❌') return '❌';
        if (cell === '⭕') return '⭕';
        return '⬜';
    });
}

// Helper function to check winner
function checkWinner(board) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] !== '⬜' && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }
    return null;
}

// ============================================
// 📌 MATH COMMAND
// ============================================
cmd({
    pattern: "math",
    alias: ["calculate", "calc"],
    desc: "Solve a math problem",
    category: "fun",
    react: "🧮",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const expression = args.join(' ');
        
        if (!expression) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .math <expression>\nExample: .math 2+2*5",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Safe evaluation
        let result;
        try {
            // Remove any dangerous characters
            const safeExpr = expression.replace(/[^0-9+\-*/().]/g, '');
            result = eval(safeExpr);
        } catch (e) {
            result = 'Invalid expression';
        }

        const mathText = `╭─❖〔 🐢 MATH CALCULATOR 🐢 〕❖─╮
*│*
*│ 🧮 Expression: ${expression}*
*│*
*│ ✅ Result: ${result}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: mathText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Math error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 GUESS NUMBER GAME
// ============================================
const guessGames = new Map();

cmd({
    pattern: "guess",
    alias: ["guessnumber", "guessgame"],
    desc: "Start a number guessing game",
    category: "fun",
    react: "🔢",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        if (guessGames.has(from)) {
            return await conn.sendMessage(from, {
                text: "❌ *A guessing game is already active in this chat!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const secretNumber = Math.floor(Math.random() * 100) + 1;
        
        guessGames.set(from, {
            secret: secretNumber,
            attempts: 0,
            maxAttempts: 7,
            active: true
        });

        const guessText = `╭─❖〔 🐢 GUESS THE NUMBER 🐢 〕❖─╮
*│*
*│ 🔢 I'm thinking of a number*
*│    between 1 and 100*
*│*
*│ 🎯 You have 7 attempts*
*│*
*│ 📝 Send a number to guess*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: guessText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Guess game error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// Handle guess attempts
cmd({ on: "body" }, async (conn, mek, m, { from, body, sender }) => {
    try {
        if (!guessGames.has(from)) return;
        
        const game = guessGames.get(from);
        if (!game.active) return;
        
        const guess = parseInt(body);
        if (isNaN(guess) || guess < 1 || guess > 100) return;
        
        game.attempts++;
        
        let response = '';
        let gameOver = false;
        
        if (guess === game.secret) {
            response = `🎉 *Congratulations! You guessed it!*\n\n🔢 The number was ${game.secret}\n🎯 Attempts: ${game.attempts}`;
            gameOver = true;
        } else if (game.attempts >= game.maxAttempts) {
            response = `😢 *Game Over!*\n\n🔢 The number was ${game.secret}`;
            gameOver = true;
        } else if (guess < game.secret) {
            response = `📈 *Higher!* Guess ${game.attempts}/${game.maxAttempts}`;
        } else {
            response = `📉 *Lower!* Guess ${game.attempts}/${game.maxAttempts}`;
        }
        
        const resultText = `╭─❖〔 🐢 GUESS THE NUMBER 🐢 〕❖─╮
*│*
*│ ${response}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: resultText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        if (gameOver) {
            guessGames.delete(from);
        }

    } catch (error) {
        console.error('Guess attempt error:', error);
    }
});

// ============================================
// 📌 RIDDLE COMMAND
// ============================================
cmd({
    pattern: "riddle",
    alias: ["puzzle"],
    desc: "Get a riddle to solve",
    category: "fun",
    react: "🧩",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const riddles = [
            { question: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?", answer: "Echo" },
            { question: "You measure my life in hours and I serve you by expiring. I'm quick when I'm thin and slow when I'm fat. Wind is my enemy. What am I?", answer: "Candle" },
            { question: "I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?", answer: "Map" },
            { question: "What is seen in the middle of March and April that can't be seen at the beginning or end of either month?", answer: "R" },
            { question: "What word becomes shorter when you add two letters to it?", answer: "Short" },
            { question: "What has to be broken before you can use it?", answer: "Egg" },
            { question: "I'm tall when I'm young, and I'm short when I'm old. What am I?", answer: "Candle" },
            { question: "What month of the year has 28 days?", answer: "All of them" },
            { question: "What is full of holes but still holds water?", answer: "Sponge" },
            { question: "What question can you never answer yes to?", answer: "Are you asleep?" }
        ];
        
        const randomRiddle = riddles[Math.floor(Math.random() * riddles.length)];
        
        // Store answer for later
        global.riddleAnswers = global.riddleAnswers || new Map();
        global.riddleAnswers.set(from, randomRiddle.answer);

        const riddleText = `╭─❖〔 🐢 RIDDLE 〕❖─╮
*│*
*│ 🧩 ${randomRiddle.question}*
*│*
*│ 📝 Reply with .answer <your answer>*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: riddleText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Riddle error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 ANSWER COMMAND (for riddles)
// ============================================
cmd({
    pattern: "answer",
    alias: ["riddleanswer"],
    desc: "Answer a riddle",
    category: "fun",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const userAnswer = args.join(' ').toLowerCase().trim();
        
        if (!userAnswer) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .answer <your answer>",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        global.riddleAnswers = global.riddleAnswers || new Map();
        const correctAnswer = global.riddleAnswers.get(from);
        
        if (!correctAnswer) {
            return await conn.sendMessage(from, {
                text: "❌ *No active riddle! Use .riddle first*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isCorrect = correctAnswer.toLowerCase().includes(userAnswer) || 
                         userAnswer.includes(correctAnswer.toLowerCase());

        const resultText = `╭─❖〔 🐢 RIDDLE ANSWER 〕❖─╮
*│*
*│ ${isCorrect ? '✅ Correct! Well done!' : '❌ Wrong answer! Try again!'}*
*│*
*│ 📝 Correct answer: ${isCorrect ? '' : correctAnswer}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: resultText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        if (isCorrect) {
            global.riddleAnswers.delete(from);
        }

    } catch (error) {
        console.error('Answer error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 CHARACTER COMMAND
// ============================================
cmd({
    pattern: "character",
    alias: ["personality"],
    desc: "Get a random character description",
    category: "fun",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const name = args.join(' ') || `@${sender.split('@')[0]}`;
        
        const traits = [
            "Kind", "Brave", "Witty", "Charming", "Mysterious", 
            "Adventurous", "Loyal", "Creative", "Ambitious", "Patient",
            "Honest", "Humble", "Generous", "Passionate", "Optimistic"
        ];
        
        const randomTrait1 = traits[Math.floor(Math.random() * traits.length)];
        const randomTrait2 = traits[Math.floor(Math.random() * traits.length)];
        const randomTrait3 = traits[Math.floor(Math.random() * traits.length)];
        
        const randomAge = Math.floor(Math.random() * 30) + 18;
        const randomPower = Math.floor(Math.random() * 90) + 10;
        
        const characters = [
            "a wise wizard 🧙", "a brave knight ⚔️", "a mysterious elf 🧝", 
            "a clever rogue 🗡️", "a powerful mage 🔮", "a noble prince/princess 👑",
            "a fearless warrior 🛡️", "a cunning spy 🕵️", "a gentle healer 💊",
            "a dark sorcerer 🌑", "a forest guardian 🌳", "a dragon rider 🐉"
        ];
        
        const randomChar = characters[Math.floor(Math.random() * characters.length)];
        
        const charText = `╭─❖〔 🐢 CHARACTER PROFILE 🐢 〕❖─╯
*│*
*│ 🎭 Name: ${name}*
*│*
*│ 📋 Class: ${randomChar}*
*│ 📊 Level: ${randomPower}*
*│ 🎂 Age: ${randomAge}*
*│*
*│ ⚡ Traits:*
*│ ✦ ${randomTrait1}*
*│ ✦ ${randomTrait2}*
*│ ✦ ${randomTrait3}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: charText,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Character error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COUPLE COMMAND
// ============================================
cmd({
    pattern: "couple",
    alias: ["lovecouple", "shipping"],
    desc: "Get a random couple fact",
    category: "fun",
    react: "💑",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const couples = [
            { fact: "Couples who laugh together, last together! 😂", tip: "Make your partner laugh every day" },
            { fact: "Holding hands reduces stress and pain 🤝", tip: "Hold hands while walking" },
            { fact: "Couples who travel together have stronger bonds ✈️", tip: "Plan a trip together" },
            { fact: "Eye contact increases intimacy 👀", tip: "Stare into each other's eyes for 4 minutes" },
            { fact: "Couples who exercise together are happier 💪", tip: "Work out as a couple" },
            { fact: "Small gestures matter more than big gifts 🎁", tip: "Leave little love notes" },
            { fact: "Couples need 5 positive interactions for every negative one 💕", tip: "Focus on the good" },
            { fact: "Cuddling releases oxytocin (the love hormone) 🫂", tip: "Cuddle for at least 20 seconds" },
            { fact: "Couples who cook together stay together 🍳", tip: "Try new recipes as a team" },
            { fact: "Surprises keep the spark alive ✨", tip: "Plan unexpected dates" }
        ];
        
        const randomCouple = couples[Math.floor(Math.random() * couples.length)];
        
        const coupleText = `╭─❖〔 🐢 COUPLE CORNER 🐢 〕❖─╮
*│*
*│ 💑 Love Fact:*
*│ ${randomCouple.fact}*
*│*
*│ 💝 Love Tip:*
*│ ${randomCouple.tip}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: coupleText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Couple error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
