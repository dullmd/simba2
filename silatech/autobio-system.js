const { cmd } = global;
const config = require('../config');
const fs = require('fs-extra');
const path = require('path');

// Auto Bio System - Hii ina-run kwenye background
cmd({ on: "ready" }, async (conn) => {
    try {
        const featuresPath = path.join(__dirname, '..', 'database', 'features.json');
        
        // Array ya bios
        const bios = [
            "🌟 𝚂𝙸𝙻𝙰 𝙼𝙳 - 𝚈𝚘𝚞𝚛 𝚞𝚕𝚝𝚒𝚖𝚊𝚝𝚎 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙 𝚋𝚘𝚝",
            "🚀 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝙸𝙻𝙰 𝚃𝚎𝚌𝚑𝚗𝚘𝚕𝚘𝚐𝚒𝚎𝚜",
            "💫 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎!",
            "🎯 𝙵𝚊𝚜𝚝, 𝚂𝚎𝚌𝚞𝚛𝚎 & 𝚁𝚎𝚕𝚒𝚊𝚋𝚕𝚎",
            "🤖 𝚂𝙸𝙻𝙰 𝙼𝙳 - 𝚈𝚘𝚞𝚛 𝚍𝚒𝚐𝚒𝚝𝚊𝚕 𝚊𝚜𝚜𝚒𝚜𝚝𝚊𝚗𝚝",
            "⚡ 𝙱𝚎𝚜𝚝 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙 𝙱𝚘𝚝 𝚎𝚟𝚎𝚛",
            "🐢 𝚂𝙸𝙻𝙰 𝙼𝙳 - 𝙿𝚛𝚎𝚖𝚒𝚞𝚖 𝙱𝚘𝚝 2026",
            "💙 𝙱𝚕𝚞𝚎 𝚒𝚗 𝙱𝚕𝚊𝚌𝚔 𝙴𝚍𝚒𝚝𝚒𝚘𝚗",
            "👑 𝙲𝚛𝚎𝚊𝚝𝚎𝚍 𝚋𝚢 𝚂𝙸𝙻𝙰",
            "📱 𝙰𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 24/7"
        ];

        let currentBioIndex = 0;
        
        // Change bio every 30 minutes
        setInterval(async () => {
            try {
                // Check if auto bio is enabled
                let features = {};
                try {
                    features = JSON.parse(fs.readFileSync(featuresPath, 'utf8'));
                } catch {
                    features = { AUTO_BIO: 'yes' };
                }

                if (features.AUTO_BIO === 'yes' || config.AUTO_BIO === 'true') {
                    const newBio = bios[currentBioIndex];
                    
                    // Update WhatsApp bio
                    await conn.updateProfileStatus(newBio);
                    console.log('✅ Auto bio updated:', newBio);
                    
                    // Move to next bio
                    currentBioIndex = (currentBioIndex + 1) % bios.length;
                }
            } catch (error) {
                console.error('❌ Auto bio update error:', error);
            }
        }, 30 * 60 * 1000); // 30 minutes

        // Set initial bio
        try {
            await conn.updateProfileStatus(bios[0]);
            console.log('✅ Initial bio set');
        } catch (error) {
            console.error('❌ Initial bio error:', error);
        }

    } catch (error) {
        console.error('❌ Auto bio system error:', error);
    }
});
