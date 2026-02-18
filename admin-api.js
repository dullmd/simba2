const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const os = require('os');
const fs = require('fs-extra');
const path = require('path');

// Import models from pair.js
const Session = mongoose.model('Session');
const Settings = mongoose.model('Settings');

// Stats endpoint
router.get('/stats', async (req, res) => {
    try {
        const totalSessions = await Session.countDocuments();
        const activeSessions = global.activeSockets?.size || 0;
        
        const memory = process.memoryUsage();
        const memoryMB = Math.round(memory.heapUsed / 1024 / 1024);
        
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        
        res.json({
            totalSessions,
            activeSessions,
            memory: `${memoryMB}MB`,
            uptime: `${hours}h ${minutes}m`,
            platform: os.platform(),
            nodeVersion: process.version
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all sessions
router.get('/sessions', async (req, res) => {
    try {
        const sessions = await Session.find({}).sort({ updatedAt: -1 });
        
        const formatted = sessions.map(s => ({
            number: s.number,
            active: global.activeSockets?.has(s.number) || false,
            lastActive: s.updatedAt ? new Date(s.updatedAt).toLocaleString() : 'Never',
            createdAt: s.createdAt ? new Date(s.createdAt).toLocaleString() : 'Unknown'
        }));
        
        res.json({ sessions: formatted });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reconnect all sessions
router.post('/reconnect-all', async (req, res) => {
    try {
        const sessions = await Session.find({});
        let success = 0;
        
        for (const session of sessions) {
            try {
                const number = session.number;
                if (!global.activeSockets?.has(number)) {
                    // Call reconnect function from pair.js
                    const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
                    await global.EmpirePair?.(number, mockRes);
                    success++;
                    await new Promise(r => setTimeout(r, 1000));
                } else {
                    success++;
                }
            } catch (e) {
                console.error(`Failed to reconnect ${session.number}:`, e);
            }
        }
        
        res.json({ success, total: sessions.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reconnect single session
router.post('/reconnect', async (req, res) => {
    try {
        const { number } = req.body;
        if (!number) return res.status(400).json({ error: 'Number required' });
        
        const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
        await global.EmpirePair?.(number, mockRes);
        
        res.json({ success: true, message: `Reconnected ${number}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete session
router.post('/delete-session', async (req, res) => {
    try {
        const { number } = req.body;
        if (!number) return res.status(400).json({ error: 'Number required' });
        
        // Delete from MongoDB
        await Session.deleteMany({ number });
        await Settings.deleteOne({ number });
        
        // Close socket if active
        if (global.activeSockets?.has(number)) {
            global.activeSockets.get(number).ws.close();
            global.activeSockets.delete(number);
        }
        
        // Delete local session folder
        const sessionPath = path.join('./session', `session_${number}`);
        if (fs.existsSync(sessionPath)) {
            fs.removeSync(sessionPath);
        }
        
        res.json({ success: true, message: `Deleted ${number}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Follow newsletters
router.post('/follow-newsletters', async (req, res) => {
    try {
        const { jids } = req.body;
        if (!jids || !Array.isArray(jids)) {
            return res.status(400).json({ error: 'Invalid JIDs' });
        }
        
        // Save to config or process
        global.NEWSLETTER_JIDS = jids;
        
        // Follow for all active sockets
        if (global.activeSockets) {
            for (const [number, socket] of global.activeSockets) {
                for (const jid of jids) {
                    try {
                        await socket.newsletterFollow(jid);
                        await new Promise(r => setTimeout(r, 500));
                    } catch (e) {
                        console.error(`Failed to follow ${jid} for ${number}:`, e);
                    }
                }
            }
        }
        
        res.json({ success: true, followed: jids.length });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Join groups
router.post('/join-groups', async (req, res) => {
    try {
        const { links } = req.body;
        if (!links || !Array.isArray(links)) {
            return res.status(400).json({ error: 'Invalid links' });
        }
        
        let joined = 0;
        
        if (global.activeSockets) {
            for (const [number, socket] of global.activeSockets) {
                for (const link of links) {
                    try {
                        const inviteCodeMatch = link.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
                        if (inviteCodeMatch) {
                            await socket.groupAcceptInvite(inviteCodeMatch[1]);
                            joined++;
                            await new Promise(r => setTimeout(r, 1000));
                        }
                    } catch (e) {
                        console.error(`Failed to join ${link} for ${number}:`, e);
                    }
                }
            }
        }
        
        res.json({ success: true, joined });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Change MongoDB
router.post('/change-mongodb', async (req, res) => {
    try {
        const { uri } = req.body;
        if (!uri) return res.status(400).json({ error: 'URI required' });
        
        // Disconnect current
        await mongoose.disconnect();
        
        // Connect new
        await mongoose.connect(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        // Update environment variable
        process.env.MONGODB_URI = uri;
        
        res.json({ success: true, message: 'MongoDB changed' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test MongoDB connection
router.post('/test-mongo', async (req, res) => {
    try {
        const { uri } = req.body;
        
        const conn = await mongoose.createConnection(uri, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000
        });
        
        await conn.close();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// MongoDB stats
router.get('/mongo-stats', async (req, res) => {
    try {
        const sessions = await Session.countDocuments();
        const settings = await Settings.countDocuments();
        
        // Get database stats
        const db = mongoose.connection.db;
        const stats = await db.stats();
        
        const sizeMB = Math.round(stats.dataSize / 1024 / 1024);
        
        res.json({
            sessions,
            settings,
            size: `${sizeMB}MB`,
            collections: stats.collections,
            indexes: stats.indexes
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Logs endpoint
router.get('/logs', async (req, res) => {
    try {
        const logFile = path.join(__dirname, '../logs.txt');
        let logs = [];
        
        if (fs.existsSync(logFile)) {
            const content = fs.readFileSync(logFile, 'utf8');
            logs = content.split('\n')
                .filter(l => l.trim())
                .slice(-50)
                .map(l => {
                    const parts = l.split(' - ');
                    return {
                        time: parts[0] || new Date().toLocaleTimeString(),
                        level: parts[1]?.includes('ERROR') ? 'error' : 'info',
                        message: parts.slice(2).join(' - ') || l
                    };
                });
        }
        
        res.json({ logs });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Ping
router.get('/ping', (req, res) => {
    res.json({ 
        status: 'active', 
        activesession: global.activeSockets?.size || 0 
    });
});

module.exports = router;
