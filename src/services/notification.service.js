const whatsappService = require('../modules/whatsapp/whatsapp.service');

const sendDockAssignment = async ({ phone, driverName, dockCode }) => {
  console.log('Enviando asignación de dock:', { phone, driverName, dockCode });

  // 1. Limpiamos el número de teléfono (removemos '+', espacios o guiones)
  const cleanPhone = phone.replace(/\D/g, '');

  // 2. Formateamos al ID estándar de WhatsApp (@c.us para chats individuales)
  const chatId = cleanPhone.endsWith('@c.us') ? cleanPhone : `${cleanPhone}@c.us`;

  // 3. Armamos el texto estructurado de la notificación
  const messageText = 
`🚛 *ASIGNACIÓN DE DOCK*

Hola *${driverName}*, 

Te asignamos el dock de carga/descarga:
📌 *Dock:* ${dockCode}

Por favor, dirígete a la posición indicando tu llegada al ingresar.`;

  // 4. Enviamos el mensaje utilizando el bot activo
  try {
    const response = await whatsappService.sendMessage(chatId, messageText);
    return response;
  } catch (error) {
    console.error('Error al enviar la notificación por WhatsApp:', error.message);
    throw error;
  }
};

module.exports = {
  sendDockAssignment
};