const { makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion } = require('@whiskeysockets/baileys');
const Pino = require('pino');
const qrTerminal = require('qrcode-terminal');

// Jina la bot yako
const BOT_NAME = '『 Fᵣₐₙcₑ 조용한 』';
const PREFIX = '#';

async function startBot() {
    // Weka session folder
    const { state, saveCreds } = await useMultiFileAuthState('./session');
    const { version } = await fetchLatestBaileysVersion();
    
    // Unda bot connection
    const sock = makeWASocket({
        version,
        auth: state,
        printQRInTerminal: true,
        logger: Pino({ level: 'silent' }),
        browser: ['France Bot', 'Chrome', '1.0.0']
    });
    
    // Hifadhi credentials
    sock.ev.on('creds.update', saveCreds);
    
    // Angalia connection status
    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect, qr } = update;
        
        // Onyesha QR code kwenye terminal
        if (qr) {
            console.log('🔴 SCAN THIS QR CODE WITH YOUR WHATSAPP:');
            qrTerminal.generate(qr, { small: true });
        }
        
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                console.log('🔄 Bot inaunganisha tena...');
                startBot();
            }
        } else if (connection === 'open') {
            console.log(`✅ ${BOT_NAME} IMEWASHA!`);
            console.log(`📌 Prefix: ${PREFIX}`);
        }
    });
    
    // Hushughulikia ujumbe
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;
        
        const from = msg.key.remoteJid;
        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        
        // Command: #ping
        if (text === PREFIX + 'ping') {
            await sock.sendMessage(from, { text: '🏓 Pong! Bot iko online!' });
        }
        
        // Command: #menu
        if (text === PREFIX + 'menu') {
            const menu = `
╭━━━━━━━━━━━━━━━━━━╮
┃   『 ${BOT_NAME} 』
┃━━━━━━━━━━━━━━━━━━┃
┃ ✨ *COMMANDS*
┃━━━━━━━━━━━━━━━━━━┃
┃ #ping  - Angalia bot status
┃ #menu  - Onyesha menu hii
┃ #owner - Wasiliana na owner
╰━━━━━━━━━━━━━━━━━━╯
            `;
            await sock.sendMessage(from, { text: menu });
        }
        
        // Command: #owner
        if (text === PREFIX + 'owner') {
            await sock.sendMessage(from, { text: '👨‍💻 Owner: France Tech\n📱 Channel: https://whatsapp.com/channel/0029VbBZ14b5Ejxym9XVNF2e' });
        }
    });
}

// Anza bot
startBot().catch(console.error);
