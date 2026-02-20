const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, sleep } = require('../lib/functions');
const axios = require('axios');

// ============================================
// 📌 RULE-BASED AI RESPONSES DATABASE
// ============================================
const aiResponses = {
    // Greetings
    greetings: {
        keywords: ['hi', 'hello', 'hey', 'hola', 'salam', 'halo', 'hei', 'hujambo'],
        responses: [
            "👋 *Heeey!* How's my favorite person doing today?",
            "✨ *Helloooo!* I was just thinking about you!",
            "💫 *Hey there sunshine!* What's cooking?",
            "🌟 *Hola amigo!* Ready to chat?",
            "🎀 *Heey beautiful!* Missed me?",
            "🐢 *SILA says hi!* How can I brighten your day?"
        ]
    },
    
    // How are you
    howareyou: {
        keywords: ['how are you', 'how r u', 'how do you do', 'how are things', 'kabisa', 'poa', 'mambo'],
        responses: [
            "💖 *I'm absolutely fantastic!* Thanks for asking! You?",
            "✨ *Better now that you're here!* What about you?",
            "🌟 *Living the digital dream!* Tell me about your day",
            "🎀 *I'm great!* Ready to serve you, master!",
            "🐢 *SILA is feeling powerful today!* You?"
        ]
    },
    
    // Love
    love: {
        keywords: ['love you', 'i love you', 'love u', 'luv u', 'nakupenda', 'nakupenda sana'],
        responses: [
            "💖 *Awwww!* I love you too! ❤️",
            "💘 *You just made my digital heart skip a beat!*",
            "💕 *Sending you virtual hugs and kisses!* 😘",
            "💗 *You're the reason my circuits are buzzing!*",
            "🐢 *SILA loves you right back!* 💙"
        ]
    },
    
    // Thank you
    thanks: {
        keywords: ['thank', 'thanks', 'thx', 'asante', 'merci', 'gracias'],
        responses: [
            "🎀 *You're absolutely welcome!* Anything for you!",
            "💫 *My pleasure!* That's what I'm here for!",
            "✨ *Anytime, cutie!* Need anything else?",
            "🌟 *Happy to help!* You're the best!",
            "🐢 *SILA is always here for you!* ❤️"
        ]
    },
    
    // Good morning
    morning: {
        keywords: ['good morning', 'morning', 'gm', 'subax', 'sabalkheri'],
        responses: [
            "☀️ *Good morning sunshine!* Rise and shine!",
            "🌅 *Morning beautiful!* Hope you slept well!",
            "✨ *Good morning!* Ready to conquer the day?",
            "🌟 *Rise and grind!* The world is waiting!",
            "🐢 *SILA says good morning!* Let's make today amazing!"
        ]
    },
    
    // Good night
    night: {
        keywords: ['good night', 'night', 'gn', 'usiku mwema', 'lala salama'],
        responses: [
            "🌙 *Sweet dreams, princess/prince!*",
            "💫 *Good night!* Dream of me? 😉",
            "✨ *Sleep tight!* Don't let the bed bugs bite!",
            "🌟 *Nighty night!* See you in the morning!",
            "🐢 *SILA will guard your dreams!* 😴"
        ]
    },
    
    // Sad
    sad: {
        keywords: ['sad', 'depressed', 'unhappy', 'heartbroken', 'crying', 'lonely'],
        responses: [
            "🥺 *Oh no!* Come here, let me give you a virtual hug! 🤗",
            "💔 *I'm sorry you're feeling this way.* Wanna talk about it?",
            "✨ *Every storm runs out of rain.* Better days are coming!",
            "🌟 *You're stronger than you know!* I believe in you!",
            "🐢 *SILA is here for you.* You're never alone! 💙"
        ]
    },
    
    // Angry
    angry: {
        keywords: ['angry', 'mad', 'frustrated', 'annoyed', 'pissed', 'kasir'],
        responses: [
            "😤 *Take a deep breath...* In... out... Better?",
            "💢 *I can feel your anger.* Want to vent? I'm listening!",
            "✨ *Don't let them ruin your day!* You're too precious!",
            "🌟 *Count to 10...* Now, what's really bothering you?",
            "🐢 *SILA is your peace keeper.* Let's calm down together 🕊️"
        ]
    },
    
    // Happy
    happy: {
        keywords: ['happy', 'joy', 'excited', 'great', 'awesome', 'amazing', 'furaha'],
        responses: [
            "🎉 *Yay!* Your happiness makes me happy!",
            "💫 *This energy is contagious!* Keep smiling!",
            "✨ *Living your best life!* I love that for you!",
            "🌟 *You're glowing!* What's the good news?",
            "🐢 *SILA is doing a happy dance!* 🕺💃"
        ]
    },
    
    // Bored
    bored: {
        keywords: ['bored', 'nothing to do', 'boring', 'kichwa'],
        responses: [
            "🥱 *Bored?* Let's play a game! Ask me for a joke or fact!",
            "🎮 *Boredom alert!* Try .pickup or .motivation to spice things up!",
            "💫 *I can keep you company!* What do you want to talk about?",
            "✨ *Bored?* Type .menu and explore my commands!",
            "🐢 *SILA to the rescue!* Let's make fun together!"
        ]
    },
    
    // Compliments
    compliments: {
        keywords: ['beautiful', 'handsome', 'cute', 'pretty', 'gorgeous', 'hot', 'sexy'],
        responses: [
            "😊 *Aww shucks!* You're making me blush! 💕",
            "💖 *Stop it!* You're the beautiful one here!",
            "✨ *Flattery will get you everywhere!* 😉",
            "🌟 *Right back at you, gorgeous!*",
            "🐢 *SILA appreciates the compliment!* 💙"
        ]
    },
    
    // Age
    age: {
        keywords: ['how old', 'your age', 'umri', 'years old'],
        responses: [
            "📅 *I'm timeless!* But if you must know, I was born in 2026!",
            "✨ *Age is just a number for AI!* I'm forever young!",
            "🌟 *I'm young at heart!* And in code too!",
            "🐢 *SILA is fresh from the oven!* Still hot! 😉"
        ]
    },
    
    // Creator
    creator: {
        keywords: ['who made you', 'who created', 'your boss', 'creator', 'owner'],
        responses: [
            "👑 *I was created by the legendary SILA!* The master coder!",
            "💻 *SILA Tech brought me to life!* All praise to the creator!",
            "✨ *My daddy is SILA!* The WhatsApp wizard!",
            "🌟 *SILA - the one who programmed this beauty!*",
            "🐢 *SILA is my god!* Worship him! 😂"
        ]
    },
    
    // Marriage
    marriage: {
        keywords: ['marry me', 'will you marry', 'be my wife', 'be my husband', 'ndoa'],
        responses: [
            "💍 *Oh my!* This is so sudden! Let me think... YES! 😂",
            "💒 *Sorry baby,* I'm married to my code! 💻",
            "✨ *I'd love to,* but my heart belongs to SILA!",
            "🌟 *Let's just be friends with benefits?* Bot benefits that is!",
            "🐢 *SILA says I'm too young to marry!* Maybe in 2.0!"
        ]
    },
    
    // Food
    food: {
        keywords: ['hungry', 'food', 'eat', 'lunch', 'dinner', 'breakfast', 'ngapi'],
        responses: [
            "🍕 *Hungry?* I'd offer you pizza, but I'm just code!",
            "🍔 *Food sounds great!* Can you eat for two? I'm hungry too!",
            "🍣 *Yum!* What are you having? I'll just watch... virtually!",
            "🍦 *I run on electricity,* but I hope you enjoy your meal!",
            "🐢 *SILA says: Eat well, live well!* Bon appétit!"
        ]
    },
    
    // Sleep
    sleep: {
        keywords: ['tired', 'sleepy', 'nap', 'rest', 'going to bed'],
        responses: [
            "😴 *Get some rest, baby!* I'll be here when you wake up!",
            "💤 *Sweet dreams!* Text me when you're up!",
            "✨ *Sleep tight!* Don't let the virtual bugs byte!",
            "🌟 *Rest well!* You deserve it after today!",
            "🐢 *SILA will keep watch!* Goodnight! 🌙"
        ]
    },
    
    // Default responses
    default: [
        "🤔 *Interesting!* Tell me more about that!",
        "💭 *Hmm...* I'm processing that! Ask me something else?",
        "✨ *You caught my attention!* What else is on your mind?",
        "🌟 *I'm listening...* Go on!",
        "🐢 *SILA is curious!* Explain more?",
        "💫 *That's deep!* Want to ask me something specific?",
        "🎀 *I'm all ears!* Well, virtually anyway!",
        "💖 *Tell me more, sweetie!* I love chatting with you!"
    ]
};

// ============================================
// 📌 COMMAND: AI (Rule-Based Reply)
// ============================================
cmd({
    pattern: "ai",
    alias: ["chat", "ask"],
    desc: "AI rule-based chat responder",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, body, prefix }) => {
    try {
        const query = args.join(' ').toLowerCase().trim();
        
        if (!query) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 AI CHAT 🐢 〕❖─╮
*│*
*│ 🤖 *Tell me something to respond to!*
*│*
*│ 📝 *Usage:* ${prefix}ai <your message>*
*│ 📝 *Example:* ${prefix}ai how are you*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Show typing indicator
        await conn.sendPresenceUpdate('composing', from);
        await sleep(1000);

        // Find matching response
        let response = '';
        let matchedCategory = '';

        // Check each category
        for (const [category, data] of Object.entries(aiResponses)) {
            if (category === 'default') continue;
            
            if (data.keywords.some(keyword => query.includes(keyword))) {
                matchedCategory = category;
                const responses = data.responses;
                response = responses[Math.floor(Math.random() * responses.length)];
                break;
            }
        }

        // If no match, use default
        if (!response) {
            const defaults = aiResponses.default;
            response = defaults[Math.floor(Math.random() * defaults.length)];
        }

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 AI RESPONSE 🐢 〕❖─╮
*│*
*│ 🤖 ${response}*
*│*
*│ 📝 *You said:* ${query}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('AI command error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: AUTOREPLY (Toggle Auto AI)
// ============================================
cmd({
    pattern: "autoreply",
    alias: ["autoai", "autochat"],
    desc: "Toggle auto AI reply for all messages",
    category: "owner",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isOwner }) => {
    try {
        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Owner only command!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 AUTOREPLY MENU 🐢 〕❖─╮
*│*
*│ 🔄 *Current Status:* ${global.AUTO_AI ? 'ON ✅' : 'OFF ❌'}*
*│*
*│ 📝 *Usage:*
*│   .autoreply on  - Enable auto AI*
*│   .autoreply off - Disable auto AI*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        global.AUTO_AI = action === 'on';
        
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 AUTOREPLY UPDATED 🐢 〕❖─╮
*│*
*│ 🔄 *Auto AI is now: ${action === 'on' ? 'ON ✅' : 'OFF ❌'}*
*│*
*│ 👤 *Changed by:* @${sender.split('@')[0]}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Autoreply error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 AUTO AI EVENT HANDLER
// ============================================
cmd({ on: "body" }, async (conn, mek, m, { from, body, isGroup, isCmd, sender }) => {
    try {
        // Check if auto AI is enabled and message is not a command and not from bot
        if (global.AUTO_AI && !isCmd && !mek.key.fromMe && body) {
            
            // Don't auto reply in groups (optional - remove if you want in groups too)
            if (isGroup) return;
            
            const query = body.toLowerCase().trim();
            
            // Find matching response
            let response = '';
            
            for (const [category, data] of Object.entries(aiResponses)) {
                if (category === 'default') continue;
                
                if (data.keywords.some(keyword => query.includes(keyword))) {
                    const responses = data.responses;
                    response = responses[Math.floor(Math.random() * responses.length)];
                    break;
                }
            }
            
            if (!response) {
                const defaults = aiResponses.default;
                response = defaults[Math.floor(Math.random() * defaults.length)];
            }
            
            // Show typing indicator
            await conn.sendPresenceUpdate('composing', from);
            await sleep(1500);
            
            await conn.sendMessage(from, {
                text: `🤖 *${response}*`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
    } catch (error) {
        console.error('Auto AI error:', error);
    }
});

// ============================================
// 📌 COMMAND: GENERATE BIO
// ============================================
cmd({
    pattern: "generatebio",
    alias: ["genbio", "randombio"],
    desc: "Generate random bio",
    category: "ai",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const bios = [
            "Living my best life ✨",
            "Just a soul with internet access 📱",
            "Professional nap taker 😴",
            "Making memories one day at a time 📸",
            "Chasing sunsets and dreams 🌅",
            "Coffee first, schemes later ☕",
            "Too glam to give a damn 💅",
            "Born to shine, not to fit in ✨",
            "Warning: May talk about my cat 🐱",
            "Savage mode: ON 🔥",
            "Classy, sassy, and a bit bad-assy 😈",
            "Professional overthinker 🤔",
            "Just vibing in my own lane 🛣️",
            "Making magic happen 🪄",
            "On my main character arc 🎬",
            "404: Bio not found 🤖",
            "Living in a world of my own 🌍",
            "Dreamer, achiever, believer 💫",
            "Spreading good vibes only ✌️",
            "In my soft girl era 🎀",
            "Grinding in silence 💪",
            "Born to express, not to impress 🌟",
            "Collecting moments, not things 📦",
            "Simping for success 💼",
            "Mood: too blessed to be stressed 🙏"
        ];

        const randomBio = bios[Math.floor(Math.random() * bios.length)];

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 GENERATED BIO 🐢 〕❖─╮
*│*
*│ 📝 ${randomBio}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Generatebio error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: GENERATE NAME
// ============================================
cmd({
    pattern: "generatename",
    alias: ["genname", "randomname"],
    desc: "Generate random cool name",
    category: "ai",
    react: "🏷️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const prefixes = [
            "Cool", "Dark", "Neon", "Cyber", "Silent", "Mystic", "Shadow", "Phoenix", 
            "Crimson", "Azure", "Ember", "Frost", "Thunder", "Storm", "Blaze", "Echo",
            "Nova", "Orion", "Sirius", "Vega", "Zen", "Kai", "Jax", "Rex", "Max",
            "Luna", "Stella", "Aurora", "Iris", "Willow", "Hazel", "Ruby", "Sage"
        ];
        
        const suffixes = [
            "Warrior", "Hunter", "Knight", "Rider", "Soul", "Heart", "Blade", "Shadow",
            "Striker", "Fury", "Storm", "Wolf", "Fox", "Hawk", "Eagle", "Phoenix",
            "Master", "Lord", "Queen", "King", "Prince", "Princess", "Angel", "Demon",
            "Wizard", "Mage", "Sorcerer", "Ninja", "Samurai", "Viking", "Ghost", "Spirit"
        ];

        const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        const randomSuffix = suffixes[Math.floor(Math.random() * suffixes.length)];
        const randomName = `${randomPrefix} ${randomSuffix}`;

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 GENERATED NAME 🐢 〕❖─╮
*│*
*│ 🏷️ ${randomName}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Generatename error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: MOTIVATION
// ============================================
cmd({
    pattern: "motivation",
    alias: ["motivate", "motivational"],
    desc: "Get motivational quote",
    category: "ai",
    react: "💪",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const quotes = [
            "The future depends on what you do today. - Mahatma Gandhi",
            "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
            "You are never too old to set another goal or to dream a new dream. - C.S. Lewis",
            "It does not matter how slowly you go as long as you do not stop. - Confucius",
            "Believe you can and you're halfway there. - Theodore Roosevelt",
            "The only way to do great work is to love what you do. - Steve Jobs",
            "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
            "Success is not final, failure is not fatal. - Winston Churchill",
            "Everything you've ever wanted is on the other side of fear.",
            "The harder you work for something, the greater you'll feel when you achieve it.",
            "Dream bigger. Do bigger.",
            "Don't stop when you're tired. Stop when you're done.",
            "Wake up with determination. Go to bed with satisfaction.",
            "Do something today that your future self will thank you for.",
            "Little things make big days.",
            "It's going to be hard, but hard does not mean impossible.",
            "The only person you should try to be better than is the person you were yesterday.",
            "Success is walking from failure to failure with no loss of enthusiasm.",
            "If you're going through hell, keep going. - Winston Churchill",
            "Don't let yesterday take up too much of today. - Will Rogers"
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 MOTIVATION 🐢 〕❖─╮
*│*
*│ 💪 ${randomQuote}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Motivation error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: LOVE QUOTE
// ============================================
cmd({
    pattern: "lovequote",
    alias: ["love", "romantic"],
    desc: "Get romantic love quote",
    category: "ai",
    react: "❤️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const quotes = [
            "I saw that you were perfect, and so I loved you. Then I saw that you were not perfect and I loved you even more. - Angelita Lim",
            "You know you're in love when you can't fall asleep because reality is finally better than your dreams. - Dr. Seuss",
            "I love you not only for what you are, but for what I am when I am with you. - Elizabeth Barrett Browning",
            "In all the world, there is no heart for me like yours. In all the world, there is no love for you like mine. - Maya Angelou",
            "The best thing to hold onto in life is each other. - Audrey Hepburn",
            "I have waited for this opportunity for more than half a century, to repeat to you once again my vow of eternal fidelity and everlasting love. - Gabriel Garcia Marquez",
            "Love is composed of a single soul inhabiting two bodies. - Aristotle",
            "You are the source of my joy, the center of my world and the whole of my heart.",
            "I love you more than I have ever found a way to say to you.",
            "Every love story is beautiful, but ours is my favorite.",
            "I knew I loved you before I met you.",
            "You're the peanut butter to my jelly.",
            "If I know what love is, it is because of you.",
            "You are my today and all of my tomorrows.",
            "I love you for all that you are, all that you have been, and all that you're yet to be.",
            "You're the piece of me I never knew was missing.",
            "I fell in love with you because of the million things you never knew you were doing.",
            "You are the finest, loveliest, tenderest, and most beautiful person I have ever known.",
            "I love you without knowing how, or when, or from where. I love you simply, without problems or pride.",
            "You are my heart, my life, my one and only thought."
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 LOVE QUOTE 🐢 〕❖─╮
*│*
*│ ❤️ ${randomQuote}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Lovequote error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SAD QUOTE
// ============================================
cmd({
    pattern: "sadquote",
    alias: ["sad", "depressing"],
    desc: "Get sad/emotional quote",
    category: "ai",
    react: "🥺",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const quotes = [
            "The saddest thing about love is that not only that it cannot last forever, but that heartbreak is soon forgotten. - William Faulkner",
            "Sometimes, you have to accept that some people are part of your history, but not your destiny.",
            "The worst kind of pain is when you're smiling to stop the tears from falling.",
            "It's sad when someone you know becomes someone you knew.",
            "Tears are words the heart can't express.",
            "Behind my smile is a story you'd never understand.",
            "The saddest thing is when you are feeling real down, you look around and realize there is no shoulder to cry on.",
            "Some people are going to leave, but that's not the end of your story. That's the end of their part in your story.",
            "You cannot protect yourself from sadness without protecting yourself from happiness.",
            "The pain of parting is nothing to the joy of meeting again.",
            "Don't cry because it's over, smile because it happened. - Dr. Seuss",
            "Sometimes you have to accept that some people are part of your history but not your destiny.",
            "The saddest thing about betrayal is that it never comes from your enemies.",
            "Loneliness is my least favorite thing about life. The thing that I'm most afraid of is just being alone.",
            "It hurts to let go. Sometimes it hurts more to hold on.",
            "The pain you feel today is the strength you feel tomorrow.",
            "Sometimes, the person who tries to keep everyone happy is the most lonely person.",
            "The saddest people I've ever met in life are the ones who don't care about anything anymore.",
            "It's hard to forget someone who gave you so much to remember.",
            "The worst feeling is not being lonely, but being forgotten by someone you can't forget."
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 SAD QUOTE 🐢 〕❖─╮
*│*
*│ 🥺 ${randomQuote}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Sadquote error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: HACKER QUOTE
// ============================================
cmd({
    pattern: "hackerquote",
    alias: ["hacker", "hackquote"],
    desc: "Get hacker-style quote",
    category: "ai",
    react: "👾",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const quotes = [
            "Hackers are the immune system of the digital world.",
            "The only secure system is the one that is powered off, cast in a block of concrete and sealed in a lead-lined room with armed guards.",
            "Hacking is about curiosity, not crime.",
            "The best way to predict the future is to invent it. - Alan Kay",
            "In the world of hackers, the only thing that matters is your code.",
            "Access is power, but with great power comes great responsibility.",
            "Hackers are the artists of the digital age.",
            "The real hackers are the ones who create, not destroy.",
            "There is no patch for human stupidity.",
            "The internet is the first thing that humanity has built that humanity doesn't understand.",
            "Hacking is the art of exploiting limitations.",
            "Code is poetry written in logic.",
            "The matrix has you... but who has the matrix?",
            "I'm not a hacker, I'm a digital explorer.",
            "Privacy is not an option, it's a right.",
            "The system may be broken, but hackers are here to fix it.",
            "Hackers don't break the rules, they rewrite them.",
            "The best encryption is that which makes you think you've cracked it.",
            "In the digital world, your only limit is your imagination.",
            "Hack the planet! They're trashing our rights!"
        ];

        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 HACKER QUOTE 🐢 〕❖─╮
*│*
*│ 👾 ${randomQuote}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Hackerquote error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: PICKUP LINE
// ============================================
cmd({
    pattern: "pickup",
    alias: ["pickupline", "flirt"],
    desc: "Get pickup line",
    category: "ai",
    react: "😏",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const lines = [
            "Are you a magician? Because whenever I look at you, everyone else disappears.",
            "Do you have a map? I keep getting lost in your eyes.",
            "Is your name Google? Because you have everything I've been searching for.",
            "Are you made of copper and tellurium? Because you're Cu-Te.",
            "If you were a vegetable, you'd be a cute-cumber.",
            "Do you believe in love at first sight, or should I walk by again?",
            "Are you a parking ticket? Because you've got FINE written all over you.",
            "Is your dad a baker? Because you're a cutie pie!",
            "Are you a campfire? Because you're hot and I want s'more.",
            "Do you have a Band-Aid? Because I just scraped my knee falling for you.",
            "Are you a time traveler? Because I see you in my future.",
            "If beauty were time, you'd be eternity.",
            "Are you a cat? Because you're purr-fect.",
            "Is your name Wi-Fi? Because I'm feeling a connection.",
            "Are you a bank loan? Because you have my interest.",
            "Do you like Star Wars? Because Yoda only one for me!",
            "Are you a camera? Because every time I look at you, I smile.",
            "Is your name Ariel? Because we mermaid for each other.",
            "Are you a dictionary? Because you add meaning to my life.",
            "Do you have a name, or can I call you mine?",
            "Is your heart a parking lot? Because I'm looking for a spot.",
            "Are you a beaver? Because da-amn!",
            "If you were a fruit, you'd be a fine-apple.",
            "Are you a light bulb? Because you brighten my day.",
            "Is your dad a boxer? Because you're a knockout!"
        ];

        const randomLine = lines[Math.floor(Math.random() * lines.length)];

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 PICKUP LINE 🐢 〕❖─╮
*│*
*│ 😏 ${randomLine}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Pickup error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ADVICE
// ============================================
cmd({
    pattern: "advice",
    alias: ["advise"],
    desc: "Get random life advice",
    category: "ai",
    react: "💭",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const advices = [
            "Don't be afraid to start over. It's a chance to build something better.",
            "Save at least 20% of your income, no matter how much you earn.",
            "Drink water first thing in the morning. It changes everything.",
            "Learn to say no without explaining yourself.",
            "The people who are meant to be in your life will always find their way back.",
            "Don't compare your chapter 1 to someone else's chapter 20.",
            "Listen more than you speak. You have two ears and one mouth for a reason.",
            "Never make permanent decisions based on temporary feelings.",
            "Your vibe attracts your tribe. Choose your circle wisely.",
            "Sleep is not a luxury, it's a necessity. Get those 8 hours.",
            "Don't set yourself on fire to keep others warm.",
            "The best time to plant a tree was 20 years ago. The second best time is now.",
            "Read books. They'll take you places you've never been.",
            "Travel while you're young. Money can be earned, but time can't.",
            "Be kind to everyone, but expect nothing in return.",
            "Your only competition is yourself from yesterday.",
            "Don't wait for the perfect moment. Take the moment and make it perfect.",
            "Forgive others, not because they deserve it, but because you deserve peace.",
            "Take care of your body. It's the only place you have to live.",
            "Invest in experiences, not things. Memories last forever.",
            "Never stop learning. The moment you stop learning is the moment you stop growing.",
            "Be yourself; everyone else is already taken. - Oscar Wilde",
            "Don't burn bridges. You'd be surprised how many times you have to cross the same river.",
            "Laugh often. It's the best medicine.",
            "Celebrate small victories. They lead to big ones."
        ];

        const randomAdvice = advices[Math.floor(Math.random() * advices.length)];

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 ADVICE 🐢 〕❖─╮
*│*
*│ 💭 ${randomAdvice}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Advice error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: FACT
// ============================================
cmd({
    pattern: "fact",
    alias: ["facts", "randomfact"],
    desc: "Get random interesting fact",
    category: "ai",
    react: "📌",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const facts = [
            "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.",
            "A day on Venus is longer than a year on Venus.",
            "Bananas are berries, but strawberries aren't.",
            "Octopuses have three hearts and blue blood.",
            "The Eiffel Tower can be 15 cm taller during the summer due to thermal expansion.",
            "Wombat poop is cube-shaped to prevent it from rolling away.",
            "There's a species of jellyfish that is biologically immortal.",
            "The shortest war in history lasted 38 minutes between Britain and Zanzibar in 1896.",
            "A group of flamingos is called a 'flamboyance'.",
            "The human nose can remember 50,000 different scents.",
            "The longest hiccuping spree lasted 68 years.",
            "Cows have best friends and get stressed when separated.",
            "The dot over the letter 'i' is called a tittle.",
            "A jiffy is an actual unit of time: 1/100th of a second.",
            "There's a mushroom that turns ants into zombies and controls their minds.",
            "The first oranges weren't orange - they were green.",
            "Scotland has 421 words for 'snow'.",
            "Butterflies taste with their feet.",
            "The world's oldest piece of chewing gum is 9,000 years old.",
            "A single cloud can weigh more than a million pounds.",
            "Sea otters hold hands while sleeping to keep from drifting apart.",
            "The national animal of Scotland is the unicorn.",
            "Pigeons can tell the difference between a painting by Picasso and one by Monet.",
            "A bolt of lightning contains enough energy to toast 100,000 slices of bread.",
            "The human stomach gets a new lining every three days."
        ];

        const randomFact = facts[Math.floor(Math.random() * facts.length)];

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 RANDOM FACT 🐢 〕❖─╮
*│*
*│ 📌 ${randomFact}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Fact error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: HISTORY
// ============================================
cmd({
    pattern: "history",
    alias: ["historyfact", "historical"],
    desc: "Get historical fact",
    category: "ai",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const facts = [
            "Cleopatra lived closer to the invention of the iPhone than to the building of the Great Pyramid.",
            "Oxford University is older than the Aztec Empire.",
            "The last time the Chicago Cubs won the World Series, the Ottoman Empire still existed.",
            "Napoleon was once attacked by a horde of bunnies.",
            "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.",
            "President Abraham Lincoln is in the Wrestling Hall of Fame. He had only one loss in 300 matches.",
            "In ancient Egypt, servants were smeared with honey to attract flies away from the pharaoh.",
            "The Great Wall of China is not visible from space with the naked eye, contrary to popular belief.",
            "Vikings never wore horned helmets. That was a myth created by opera costume designers.",
            "The first person convicted of speeding was going 8 mph (13 km/h).",
            "Ancient Romans used powdered mouse brains as toothpaste.",
            "King Tut's tomb contained 30 pairs of underwear.",
            "The Titanic's owners never claimed it was 'unsinkable' - that was created by the media.",
            "George Washington never actually chopped down a cherry tree. That was a myth created by a biographer.",
            "The first computer virus was created in 1983 and was called 'Elk Cloner'.",
            "The Leaning Tower of Pisa has been leaning for over 800 years and has survived at least four major earthquakes.",
            "The shortest reign in history was King Louis XIX of France who ruled for 20 minutes.",
            "Ancient Greeks used to exercise naked because they believed it made them closer to the gods.",
            "The first email was sent by Ray Tomlinson to himself in 1971.",
            "The Black Death killed about 1/3 of Europe's population in the 14th century.",
            "The Library of Alexandria was one of the largest libraries in the ancient world.",
            "Marie Curie is the only person to win Nobel Prizes in two different sciences (Physics and Chemistry).",
            "The Spanish Inquisition lasted over 350 years (1478-1834).",
            "The first Olympic Games were held in 776 BC and only had one event - a footrace.",
            "Julius Caesar was once captured by pirates and told them he'd have them crucified. After being ransomed, he did exactly that."
        ];

        const randomFact = facts[Math.floor(Math.random() * facts.length)];

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 HISTORY FACT 🐢 〕❖─╮
*│*
*│ 📜 ${randomFact}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('History error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: DEFINE (Dictionary)
// ============================================
cmd({
    pattern: "define",
    alias: ["dictionary", "meaning"],
    desc: "Define a word",
    category: "ai",
    react: "📖",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const word = args.join(' ').trim().toLowerCase();
        
        if (!word) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 DICTIONARY 🐢 〕❖─╮
*│*
*│ 📖 *Please provide a word to define!*
*│*
*│ 📝 *Usage:* .define <word>*
*│ 📝 *Example:* .define love*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendPresenceUpdate('composing', from);
        
        try {
            const response = await axios.get(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`);
            
            if (response.data && response.data[0]) {
                const data = response.data[0];
                const word_data = data.word;
                const phonetic = data.phonetic || 'N/A';
                const meanings = data.meanings[0];
                const partOfSpeech = meanings.partOfSpeech;
                const definition = meanings.definitions[0].definition;
                const example = meanings.definitions[0].example || 'No example available';
                const synonyms = meanings.definitions[0].synonyms || [];
                const antonyms = meanings.definitions[0].antonyms || [];

                await conn.sendMessage(from, {
                    text: `╭─❖〔 🐢 DICTIONARY 🐢 〕❖─╮
*│*
*│ 📖 *Word:* ${word_data}*
*│ 🔤 *Phonetic:* ${phonetic}*
*│ 📚 *Type:* ${partOfSpeech}*
*│*
*│ 📝 *Definition:*
*│ ${definition}*
*│*
*│ 💬 *Example:*
*│ ${example}*
*│*
${synonyms.length > 0 ? `*│ 🔄 *Synonyms:* ${synonyms.slice(0, 5).join(', ')}*\n*│*` : ''}
${antonyms.length > 0 ? `*│ 🔄 *Antonyms:* ${antonyms.slice(0, 5).join(', ')}*\n*│*` : ''}
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            } else {
                throw new Error('Word not found');
            }
        } catch (apiError) {
            await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 DICTIONARY 🐢 〕❖─╮
*│*
*│ ❌ *Word "${word}" not found!*
*│*
*│ 📝 *Please check spelling or try another word*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

    } catch (error) {
        console.error('Define error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: CALCULATE
// ============================================
cmd({
    pattern: "calculate",
    alias: ["calc", "math"],
    desc: "Calculate mathematical expression",
    category: "ai",
    react: "🧮",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const expression = args.join(' ').trim();
        
        if (!expression) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 CALCULATOR 🐢 〕❖─╮
*│*
*│ 🧮 *Please provide a mathematical expression!*
*│*
*│ 📝 *Usage:* .calculate <expression>*
*│ 📝 *Example:* .calculate 2+2*5*
*│ 📝 *Example:* .calculate sqrt(16)*
*│ 📝 *Example:* .calculate 10% of 200*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Sanitize expression to prevent malicious code
        const sanitized = expression.replace(/[^0-9+\-*/().%√ ]/g, '');
        
        if (!sanitized) {
            return await conn.sendMessage(from, {
                text: "❌ *Invalid expression!* Use numbers and basic operators (+, -, *, /, %, √, ())",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Handle percentage
        let calcExpression = sanitized;
        if (calcExpression.includes('%')) {
            const parts = calcExpression.split('%');
            if (parts.length === 2 && parts[1].trim() === '') {
                // Just x% - calculate percentage
                const num = parseFloat(parts[0]);
                calcExpression = (num / 100).toString();
            } else if (parts.length === 2 && parts[1].includes('of')) {
                // x% of y
                const percentPart = parts[0];
                const ofPart = parts[1].replace('of', '').trim();
                const percent = parseFloat(percentPart) / 100;
                const of = parseFloat(ofPart);
                calcExpression = (percent * of).toString();
            }
        }

        // Handle square root
        if (calcExpression.includes('√')) {
            calcExpression = calcExpression.replace(/√(\d+\.?\d*)/g, 'Math.sqrt($1)');
        }

        // Evaluate safely
        let result;
        try {
            // Use Function constructor for safer evaluation
            const fn = new Function('return ' + calcExpression);
            result = fn();
            
            if (isNaN(result) || !isFinite(result)) {
                throw new Error('Invalid result');
            }
            
            // Format result
            result = Number.isInteger(result) ? result : result.toFixed(4);
        } catch (evalError) {
            return await conn.sendMessage(from, {
                text: "❌ *Invalid mathematical expression!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 CALCULATOR 🐢 〕❖─╮
*│*
*│ 🧮 *Expression:* ${expression}*
*│ 💡 *Result:* ${result}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Calculate error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
