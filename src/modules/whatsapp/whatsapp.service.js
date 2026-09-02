const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode');

let client = null;
let qrCodeData = null;
let status = 'DISCONNECTED'; // 'DISCONNECTED' | 'INITIALIZING' | 'CONNECTED'
let currentPlanner = null;

const sendMessage = async (to, message) => {
  if (!client || status !== 'CONNECTED') {
    throw new Error('El servicio de WhatsApp no está conectado.');
  }

  // 1. Limpiamos cualquier carácter no numérico
  let cleanPhone = to.replace(/\D/g, '');

  // 2. Si es un número local de Argentina (10 dígitos arrancando con '11' o similar), le agregamos '549'
  if (cleanPhone.length === 10) {
    cleanPhone = `549${cleanPhone}`;
  }

  // 3. Consultamos a WhatsApp por el ID válido (JID/LID) del número
  const numberDetails = await client.getNumberId(cleanPhone);

  if (!numberDetails) {
    throw new Error(`El número ${cleanPhone} no está registrado en WhatsApp.`);
  }

  // 4. Enviamos el mensaje usando el _serialized ID que devuelve WhatsApp directamente
  const response = await client.sendMessage(numberDetails._serialized, message);
  return response;
};

const startSession = async (plannerName) => {
  // Si ya hay una instancia corriendo, la cerramos limpiamente antes de abrir otra
  if (client) {
    await logoutSession();
  }

  status = 'INITIALIZING';
  qrCodeData = null;
  currentPlanner = plannerName;

  client = new Client({
    authStrategy: new LocalAuth({ clientId: 'planner-session' }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    }
  });

  client.on('qr', async (qr) => {
    try {
      qrCodeData = await qrcode.toDataURL(qr);
      console.log('📌 Nuevo QR listo para escanear');
    } catch (err) {
      console.error('Error generando Base64 del QR:', err);
    }
  });

  client.on('ready', () => {
    status = 'CONNECTED';
    qrCodeData = null;
    console.log(`✅ WhatsApp listo para el Planner: ${currentPlanner}`);
  });

  // Manejo seguro del cierre
  client.on('disconnected', async (reason) => {
    console.log('⚠️ Bot desconectado:', reason);
    status = 'DISCONNECTED';
    qrCodeData = null;
    currentPlanner = null;

    if (client) {
      try {
        client.removeAllListeners();
        await client.destroy();
      } catch (e) {
        // Ignoramos errores de destrucción si la ventana ya cerró
      } finally {
        client = null;
      }
    }
  });

  try {
    await client.initialize();
  } catch (error) {
    console.error('Error al inicializar cliente de WhatsApp:', error.message);
    status = 'DISCONNECTED';
    client = null;
  }
};

const getStatus = () => {
  return {
    status,
    qrCode: qrCodeData,
    planner: currentPlanner
  };
};

const logoutSession = async () => {
  if (client) {
    try {
      // 1. Desenganchamos los listeners para que no ejecuten el 'unlink' de LocalAuth que rompe Windows
      client.removeAllListeners();

      // 2. Destruimos la instancia de Puppeteer
      await client.destroy();
      console.log('Navegador de WhatsApp cerrado correctamente.');
    } catch (err) {
      console.error('Error al cerrar instancia:', err.message);
    } finally {
      client = null;
      status = 'DISCONNECTED';
      qrCodeData = null;
      currentPlanner = null;

      // 3. Le damos 1 segundo a Windows para liberar el bloqueo de archivos (EBUSY)
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
};

module.exports = {
  startSession,
  getStatus,
  logoutSession,
  sendMessage
};