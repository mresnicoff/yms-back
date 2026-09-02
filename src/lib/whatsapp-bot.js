/**
 * lib/whatsapp-bot.js
 */
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const path = require('path');

const CONFIG = {
    sessionId: 'mi-bot',
    authPath: path.resolve(__dirname, '../.wwebjs_auth'),
    mensajesAutomaticos: []
};

let client = null;
let listo = false;
const intervalos = [];

function iniciar() {
    if (client) {
        console.log('⚠️ El bot ya está iniciado.');
        return;
    }

    client = new Client({
        authStrategy: new LocalAuth({
            clientId: CONFIG.sessionId,
            dataPath: CONFIG.authPath
        }),
        puppeteer: {
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu'
            ]
        }
    });

    // 1. Manejo del QR
    client.on('qr', (qr) => {
        console.clear();
        console.log('📌 Escaneá el siguiente código QR para vincular WhatsApp:');
        qrcode.generate(qr, { small: true });
    });

    // 2. Evento READY (Agregado: asigna estado listo)
    client.on('ready', () => {
        listo = true;
        console.log('✅ Bot listo y conectado a WhatsApp.');
        _iniciarMensajesAutomaticos();
    });

    // 3. Mensaje entrante
    client.on('message', async (msg) => {
        if (msg.fromMe) return;
        await onMensajeRecibido(msg);
    });

    // 4. Desconexión
    client.on('disconnected', (razon) => {
        console.log('⚠️ Bot desconectado:', razon);
        listo = false;
        client = null;
        intervalos.forEach(clearInterval);
        intervalos.length = 0;
    });

    client.initialize();
}

async function onMensajeRecibido(msg) {
    const texto = (msg.body || '').trim().toLowerCase();
    const from = msg.from;

    console.log(`📩 Mensaje de ${from}: ${texto}`);

    if (texto === 'hola') {
        await enviar(from, '¡Hola! ¿En qué te puedo ayudar?');
        return;
    }

    if (texto === 'ayuda') {
        await enviar(from, 'Comandos disponibles:\n- *hola*\n- *ayuda*');
        return;
    }
}

async function enviar(numero, mensaje) {
    if (!listo || !client) {
        console.error('❌ El bot no está listo para enviar mensajes.');
        return false;
    }

    const chatId = numero.includes('@') ? numero : `${numero}@c.us`;

    try {
        await client.sendMessage(chatId, mensaje);
        console.log(`✉️ Mensaje enviado a ${chatId}`);
        return true;
    } catch (err) {
        console.error(`❌ Error enviando a ${chatId}:`, err.message);
        return false;
    }
}

async function enviarATodos(numeros, mensaje) {
    for (const numero of numeros) {
        await enviar(numero, mensaje);
    }
}

function _iniciarMensajesAutomaticos() {
    for (const item of CONFIG.mensajesAutomaticos) {
        const id = setInterval(async () => {
            console.log(`⏰ Enviando mensaje automático a ${item.numero}...`);
            await enviar(item.numero, item.mensaje);
        }, item.intervaloMs);

        intervalos.push(id);
    }
}

function programarMensaje(numero, mensaje, delayMs) {
    setTimeout(async () => {
        await enviar(numero, mensaje);
    }, delayMs);
}

async function detener() {
    intervalos.forEach(clearInterval);
    intervalos.length = 0;
    if (client) {
        await client.destroy();
        client = null;
        listo = false;
        console.log('🛑 Bot detenido.');
    }
}

module.exports = {
    iniciar,
    detener,
    enviar,
    enviarATodos,
    programarMensaje,
    estaListo: () => listo
};
