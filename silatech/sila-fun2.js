const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, sleep } = require('../lib/functions');

// ============================================
// 📌 GET TARGET USER
// ============================================
function getTargetUser(mek, args, sender) {
    if (mek.quoted) return mek.quoted.sender;
    if (mek.mentionedJid && mek.mentionedJid.length > 0) return mek.mentionedJid[0];
    if (args[0]) {
        let number = args[0].replace(/[^0-9]/g, '');
        if (number.length >= 10) return number + '@s.whatsapp.net';
    }
    return sender; // Default to self if no target
}

// ============================================
// 📌 FORMAT FUN MESSAGE
// ============================================
function formatFunMessage(title, content, targetName = '', actorName = '') {
    return `╭─❖〔 🐢 ${title} 🐢 〕❖─╮
*│*
*│ ${content}*
*│*
${targetName ? `*│ 👤 Target: ${targetName}*\n` : ''}${actorName ? `*│ 🎭 By: ${actorName}*\n` : ''}*│*
╰─❖〔 🐢 𝙵𝚞𝚗 𝚃𝚒𝚖𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;
}

// ============================================
// 📌 GET RANDOM PERCENTAGE
// ============================================
function randomPercentage(min = 0, max = 100) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ============================================
// 📌 COMMAND: ROLL DICE
// ============================================
cmd({
    pattern: "roll",
    alias: ["dice", "rolldice"],
    desc: "Roll a dice (1-6)",
    category: "fun",
    react: "🎲",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const sides = args[0] ? parseInt(args[0]) : 6;
        const maxSides = Math.min(Math.max(sides, 2), 100); // Between 2 and 100
        
        const result = Math.floor(Math.random() * maxSides) + 1;
        const emoji = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'][result - 1] || '🎲';

        await conn.sendMessage(from, {
            text: formatFunMessage('DICE ROLL', 
                `🎲 *You rolled a ${result}*\n${emoji}`, 
                '', `@${sender.split('@')[0]}`),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Roll error:', error);
    }
});

// ============================================
// 📌 COMMAND: FLIP COIN
// ============================================
cmd({
    pattern: "flipcoin",
    alias: ["coinflip", "flip"],
    desc: "Flip a coin (Heads/Tails)",
    category: "fun",
    react: "🪙",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const result = Math.random() < 0.5 ? 'HEADS' : 'TAILS';
        const emoji = result === 'HEADS' ? '👑' : '🪙';

        await conn.sendMessage(from, {
            text: formatFunMessage('COIN FLIP', 
                `🪙 *It's ${result}!* ${emoji}`, 
                '', `@${sender.split('@')[0]}`),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Flipcoin error:', error);
    }
});

// ============================================
// 📌 COMMAND: LOTTERY
// ============================================
cmd({
    pattern: "lottery",
    alias: ["luck", "draw"],
    desc: "Try your luck in lottery",
    category: "fun",
    react: "🎰",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const numbers = [];
        for (let i = 0; i < 6; i++) {
            numbers.push(Math.floor(Math.random() * 49) + 1);
        }
        
        const jackpot = Math.random() < 0.01; // 1% chance to win jackpot
        const prize = jackpot ? '💰 JACKPOT! $1,000,000' : 
                     Math.random() < 0.1 ? '🎁 You won $100' : 
                     Math.random() < 0.3 ? '🍀 You won $10' : '😢 Better luck next time';

        await conn.sendMessage(from, {
            text: formatFunMessage('LOTTERY', 
                `🎰 *Your numbers:* ${numbers.join(' - ')}\n` +
                `✨ *Result:* ${prize}`, 
                '', `@${sender.split('@')[0]}`),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Lottery error:', error);
    }
});

// ============================================
// 📌 COMMAND: FIGHT
// ============================================
cmd({
    pattern: "fight",
    alias: ["battle", "duel"],
    desc: "Fight with someone",
    category: "fun",
    react: "⚔️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const target = getTargetUser(mek, args, sender);
        const isSelf = target === sender;
        
        const fighter1 = isSelf ? 'You' : `@${sender.split('@')[0]}`;
        const fighter2 = isSelf ? 'yourself' : `@${target.split('@')[0]}`;
        
        const fighter1Health = 100;
        const fighter2Health = 100;
        
        const moves = [
            '🔥 *Fire Punch*', '⚡ *Thunder Strike*', '💥 *Mega Kick*',
            '👊 *Strong Punch*', '🌀 *Tornado Kick*', '✨ *Magic Blast*',
            '🗡️ *Dagger Slash*', '🏹 *Arrow Shot*', '🔨 *Hammer Smash*'
        ];
        
        const winner = Math.random() < 0.5 ? fighter1 : fighter2;
        const loser = winner === fighter1 ? fighter2 : fighter1;
        
        const fightLog = [];
        for (let i = 0; i < 3; i++) {
            const move = moves[Math.floor(Math.random() * moves.length)];
            const damage = Math.floor(Math.random() * 30) + 10;
            fightLog.push(`*Round ${i+1}:* ${fighter1} uses ${move} (${damage} damage)`);
        }
        
        const fightText = `⚔️ *BATTLE BEGINS!*\n\n` +
                         `${fightLog.join('\n')}\n\n` +
                         `🏆 *WINNER: ${winner}*\n` +
                         `💀 *Loser: ${loser}*`;

        await conn.sendMessage(from, {
            text: formatFunMessage('BATTLE ARENA', 
                fightText, 
                isSelf ? '' : `@${target.split('@')[0]}`, 
                `@${sender.split('@')[0]}`),
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: isSelf ? [sender] : [sender, target] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Fight error:', error);
    }
});

// ============================================
// 📌 COMMAND: HACK
// ============================================
cmd({
    pattern: "hack",
    alias: ["hackuser", "cyber"],
    desc: "Hack someone (fun)",
    category: "fun",
    react: "💻",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const target = getTargetUser(mek, args, sender);
        const isSelf = target === sender;
        
        const targetName = isSelf ? 'themself' : `@${target.split('@')[0]}`;
        
        const hackingMessages = [
            '🔍 *Scanning IP address...*',
            '📡 *Bypassing firewall...*',
            '🔓 *Cracking passwords...*',
            '📱 *Accessing device...*',
            '📸 *Downloading photos...*',
            '💳 *Stealing credit cards...*',
            '📧 *Reading messages...*',
            '📍 *Tracking location...*',
            '🔐 *Decrypting files...*',
            '💾 *Copying data...*'
        ];
        
        await conn.sendMessage(from, {
            text: `💻 *HACKING ${targetName.toUpperCase()}...*`
        }, { quoted: fkontak });
        
        for (let msg of hackingMessages) {
            await sleep(800);
            await conn.sendMessage(from, { text: msg });
        }
        
        await sleep(1000);
        
        const password = Math.random().toString(36).substring(2, 10);
        const email = `hacked_${Math.random().toString(36).substring(2, 8)}@darkweb.com`;
        const ip = `${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
        
        const hackResult = `✅ *HACK COMPLETE!*\n\n` +
                          `📱 *Device:* ${['iPhone 15', 'Samsung S24', 'Google Pixel', 'OnePlus 12'][Math.floor(Math.random()*4)]}\n` +
                          `🔑 *Password:* ${password}\n` +
                          `📧 *Email:* ${email}\n` +
                          `📍 *IP Address:* ${ip}\n` +
                          `💰 *Bank Balance:* $${Math.floor(Math.random()*1000000)}\n` +
                          `📸 *Photos Found:* ${Math.floor(Math.random()*1000)}\n` +
                          `💬 *Messages:* ${Math.floor(Math.random()*5000)}`;

        await conn.sendMessage(from, {
            text: formatFunMessage('HACKED', 
                hackResult, 
                isSelf ? '' : `@${target.split('@')[0]}`, 
                `@${sender.split('@')[0]}`),
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: isSelf ? [sender] : [sender, target] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Hack error:', error);
    }
});

// ============================================
// 📌 COMMAND: STALK
// ============================================
cmd({
    pattern: "stalk",
    alias: ["stalkuser", "creep"],
    desc: "Stalk someone (fun)",
    category: "fun",
    react: "👀",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const target = getTargetUser(mek, args, sender);
        const isSelf = target === sender;
        
        const targetName = isSelf ? 'You' : `@${target.split('@')[0]}`;
        
        const activities = [
            '📱 *Checking WhatsApp status...*',
            '📍 *Tracking location...*',
            '📸 *Viewing profile photos...*',
            '💬 *Reading last messages...*',
            '🕒 *Checking last seen...*',
            '🎵 *Listening to music...*',
            '📺 *Watching videos...*',
            '🛒 *Shopping online...*',
            '🏃 *Going for a run...*',
            '🍕 *Eating pizza...*'
        ];
        
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        
        const stalkInfo = `🔍 *STALK REPORT FOR ${targetName}*\n\n` +
                         `🕒 *Last Online:* ${Math.floor(Math.random()*60)} minutes ago\n` +
                         `📱 *Device:* ${['iPhone', 'Samsung', 'Google Pixel', 'Xiaomi'][Math.floor(Math.random()*4)]}\n` +
                         `📍 *Location:* ${['Home', 'Work', 'Gym', 'Cafe', 'School'][Math.floor(Math.random()*5)]}\n` +
                         `💬 *Status:* "${['Chilling', 'Busy', 'Sleeping', 'Working', 'Party time'][Math.floor(Math.random()*5)]}"\n` +
                         `🎵 *Currently:* ${randomActivity}\n` +
                         `📸 *Posts today:* ${Math.floor(Math.random()*10)}\n` +
                         `❤️ *Likes received:* ${Math.floor(Math.random()*1000)}`;

        await conn.sendMessage(from, {
            text: formatFunMessage('STALKER', 
                stalkInfo, 
                isSelf ? '' : `@${target.split('@')[0]}`, 
                `@${sender.split('@')[0]}`),
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: isSelf ? [sender] : [sender, target] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Stalk error:', error);
    }
});

// ============================================
// 📌 COMMAND: IQ TEST
// ============================================
cmd({
    pattern: "iq",
    alias: ["iqtest", "smart"],
    desc: "Check someone's IQ",
    category: "fun",
    react: "🧠",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const target = getTargetUser(mek, args, sender);
        const isSelf = target === sender;
        
        const iq = randomPercentage(50, 180);
        let grade = '';
        let emoji = '';
        
        if (iq < 70) { grade = 'Very Low'; emoji = '😶'; }
        else if (iq < 90) { grade = 'Below Average'; emoji = '🤔'; }
        else if (iq < 110) { grade = 'Average'; emoji = '😐'; }
        else if (iq < 130) { grade = 'Above Average'; emoji = '😏'; }
        else if (iq < 150) { grade = 'Gifted'; emoji = '🧐'; }
        else { grade = 'Genius'; emoji = '🧠✨'; }

        const result = `🧠 *IQ Score: ${iq}*\n` +
                      `📊 *Level: ${grade}* ${emoji}\n` +
                      `📝 *Analysis: ${['Normal human', 'Kinda smart', 'Very intelligent', 'Super genius'][Math.floor(Math.random()*4)]}*`;

        await conn.sendMessage(from, {
            text: formatFunMessage('IQ TEST', 
                result, 
                isSelf ? '' : `@${target.split('@')[0]}`, 
                isSelf ? `@${sender.split('@')[0]}` : ''),
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: isSelf ? [sender] : [sender, target] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('IQ error:', error);
    }
});

// ============================================
// 📌 COMMAND: BEAUTY RATE
// ============================================
cmd({
    pattern: "beauty",
    alias: ["beautyrate", "pretty"],
    desc: "Rate someone's beauty",
    category: "fun",
    react: "💅",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const target = getTargetUser(mek, args, sender);
        const isSelf = target === sender;
        
        const rate = randomPercentage(60, 100);
        let comment = '';
        
        if (rate < 70) comment = '💫 Pretty cute';
        else if (rate < 80) comment = '✨ Very attractive';
        else if (rate < 90) comment = '🌟 Gorgeous';
        else if (rate < 100) comment = '💖 Absolutely stunning';
        else comment = '👑 Perfect 10/10!';

        const result = `💅 *Beauty Rate: ${rate}%*\n` +
                      `💬 *Comment: ${comment}*\n` +
                      `✨ *Vibe: ${['Angel', 'Model', 'Star', 'Queen/King'][Math.floor(Math.random()*4)]}*`;

        await conn.sendMessage(from, {
            text: formatFunMessage('BEAUTY RATE', 
                result, 
                isSelf ? '' : `@${target.split('@')[0]}`, 
                isSelf ? `@${sender.split('@')[0]}` : ''),
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: isSelf ? [sender] : [sender, target] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Beauty error:', error);
    }
});

// ============================================
// 📌 COMMAND: GAY RATE
// ============================================
cmd({
    pattern: "gayrate",
    alias: ["gay", "gaymeter"],
    desc: "Check gay rate",
    category: "fun",
    react: "🌈",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const target = getTargetUser(mek, args, sender);
        const isSelf = target === sender;
        
        const rate = randomPercentage(0, 100);
        let comment = '';
        
        if (rate < 10) comment = '🏳️‍🌈 Straight as an arrow';
        else if (rate < 30) comment = '🌈 A little curious';
        else if (rate < 50) comment = '🌈 Getting there';
        else if (rate < 70) comment = '🌈 Definitely gay';
        else if (rate < 90) comment = '🌈 Super gay';
        else comment = '🌈🌈🌈 Ultra gay!';

        const result = `🌈 *Gay Rate: ${rate}%*\n` +
                      `💬 *Comment: ${comment}*\n` +
                      `🏳️‍🌈 *Pride Level: ${['Low', 'Medium', 'High', 'Maximum'][Math.floor(rate/25)]}*`;

        await conn.sendMessage(from, {
            text: formatFunMessage('GAY METER', 
                result, 
                isSelf ? '' : `@${target.split('@')[0]}`, 
                isSelf ? `@${sender.split('@')[0]}` : ''),
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: isSelf ? [sender] : [sender, target] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Gayrate error:', error);
    }
});

// ============================================
// 📌 COMMAND: RICH RATE
// ============================================
cmd({
    pattern: "richrate",
    alias: ["rich", "wealth"],
    desc: "Check how rich someone is",
    category: "fun",
    react: "💰",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const target = getTargetUser(mek, args, sender);
        const isSelf = target === sender;
        
        const rate = randomPercentage(0, 100);
        const money = Math.floor(Math.random() * 1000000000);
        
        let status = '';
        if (rate < 20) status = '😢 Broke';
        else if (rate < 40) status = '💵 Getting by';
        else if (rate < 60) status = '💰 Comfortable';
        else if (rate < 80) status = '💎 Rich';
        else if (rate < 95) status = '👑 Very Rich';
        else status = '🤑 Billionaire';

        const result = `💰 *Wealth Rate: ${rate}%*\n` +
                      `💵 *Bank Balance: $${money.toLocaleString()}*\n` +
                      `📊 *Status: ${status}*\n` +
                      `🏠 *Properties: ${Math.floor(Math.random()*10)}*\n` +
                      `🚗 *Cars: ${Math.floor(Math.random()*5)}*`;

        await conn.sendMessage(from, {
            text: formatFunMessage('RICH METER', 
                result, 
                isSelf ? '' : `@${target.split('@')[0]}`, 
                isSelf ? `@${sender.split('@')[0]}` : ''),
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: isSelf ? [sender] : [sender, target] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Richrate error:', error);
    }
});

// ============================================
// 📌 COMMAND: SLEEP
// ============================================
cmd({
    pattern: "sleep",
    alias: ["sleepy", "nap"],
    desc: "Go to sleep",
    category: "fun",
    react: "😴",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const sleepStages = [
            '😴 *Yawning...*',
            '🛏️ *Lying down...*',
            '😪 *Closing eyes...*',
            '💤 *Falling asleep...*',
            '😴 *Snoring... Zzz...*'
        ];
        
        for (let stage of sleepStages) {
            await conn.sendMessage(from, { text: stage });
            await sleep(800);
        }
        
        await conn.sendMessage(from, {
            text: formatFunMessage('SLEEP', 
                '💤 *Good night! Sleep tight!* 😴', 
                '', `@${sender.split('@')[0]}`),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Sleep error:', error);
    }
});

// ============================================
// 📌 COMMAND: DANCE
// ============================================
cmd({
    pattern: "dance",
    alias: ["dancing"],
    desc: "Show some dance moves",
    category: "fun",
    react: "💃",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const dances = [
            '💃 *Salsa!* 🕺',
            '🕺 *Disco fever!* ✨',
            '💃 *Hip hop!* 🎵',
            '🕺 *Breakdance!* ⚡',
            '💃 *Ballet!* 🩰',
            '🕺 *Moonwalk!* 👑'
        ];
        
        const randomDance = dances[Math.floor(Math.random() * dances.length)];
        
        await conn.sendMessage(from, {
            text: formatFunMessage('DANCE', 
                `🎵 *Let's dance!*\n\n${randomDance}\n\n💫 *Keep moving!*`, 
                '', `@${sender.split('@')[0]}`),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Dance error:', error);
    }
});

// ============================================
// 📌 COMMAND: CRY
// ============================================
cmd({
    pattern: "cry",
    alias: ["sad", "weep"],
    desc: "Express sadness",
    category: "fun",
    react: "😢",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const cries = [
            '😢 *Sob sob...*',
            '😭 *Waaaah!*',
            '🥺 *Tears falling...*',
            '😿 *So sad...*',
            '💧 *Crying rivers...*'
        ];
        
        const randomCry = cries[Math.floor(Math.random() * cries.length)];
        
        await conn.sendMessage(from, {
            text: formatFunMessage('CRY', 
                `${randomCry}\n\n🤧 *Need a tissue?*`, 
                '', `@${sender.split('@')[0]}`),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Cry error:', error);
    }
});

// ============================================
// 📌 COMMAND: LAUGH
// ============================================
cmd({
    pattern: "laugh",
    alias: ["lol", "haha"],
    desc: "Have a good laugh",
    category: "fun",
    react: "😂",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const laughs = [
            '😂 *HAHAHA!*',
            '🤣 *LOL!*',
            '😆 *ROFL!*',
            '😹 *Can\'t stop laughing!*',
            '💀 *I\'m dead!*'
        ];
        
        const randomLaugh = laughs[Math.floor(Math.random() * laughs.length)];
        
        await conn.sendMessage(from, {
            text: formatFunMessage('LAUGH', 
                `${randomLaugh}\n\n😁 *That was funny!*`, 
                '', `@${sender.split('@')[0]}`),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Laugh error:', error);
    }
});

// ============================================
// 📌 COMMAND: MEME
// ============================================
cmd({
    pattern: "meme",
    alias: ["memes", "funny"],
    desc: "Get random meme",
    category: "fun",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        await conn.sendMessage(from, {
            text: "🔍 *Fetching a funny meme...*"
        }, { quoted: fkontak });

        // Using meme API
        const axios = require('axios');
        const response = await axios.get('https://meme-api.com/gimme');
        
        if (response.data && response.data.url) {
            await conn.sendMessage(from, {
                image: { url: response.data.url },
                caption: `╭─❖〔 🐢 MEME 🐢 〕❖─╮
*│*
*│ 📝 ${response.data.title || 'Random Meme'}*
*│*
*│ 👍 Upvotes: ${response.data.ups || 'N/A'}*
*│ 💬 Comments: ${response.data.comments || 'N/A'}*
*│*
╰─❖〔 🐢 𝙻𝚊𝚞𝚐𝚑 𝙾𝚞𝚝 𝙻𝚘𝚞𝚍 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        } else {
            // Fallback memes
            const fallbackMemes = [
                {
                    title: "When you finally understand the code",
                    url: "https://i.imgur.com/1.jpg"
                },
                {
                    title: "Programmer's life",
                    url: "https://i.imgur.com/2.jpg"
                },
                {
                    title: "Debugging be like",
                    url: "https://i.imgur.com/3.jpg"
                }
            ];
            
            const meme = fallbackMemes[Math.floor(Math.random() * fallbackMemes.length)];
            
            await conn.sendMessage(from, {
                text: formatFunMessage('MEME', 
                    `📝 *${meme.title}*\n\n🔗 ${meme.url}`, 
                    '', ''),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

    } catch (error) {
        console.error('Meme error:', error);
        
        // Fallback
        await conn.sendMessage(from, {
            text: formatFunMessage('MEME', 
                '😂 *Why did the programmer quit his job?*\n\nBecause he didn\'t get arrays!', 
                '', ''),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
