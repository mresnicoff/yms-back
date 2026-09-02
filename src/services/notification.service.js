const axios = require("axios");

// Notificaciones por WhatsApp vía la API oficial de Meta (Cloud API),
// usando una plantilla de utilidad ya aprobada por Meta.
//
// Reemplaza al bot anterior basado en whatsapp-web.js/Puppeteer, que:
//   1) no puede correr en funciones serverless (Vercel) porque necesita un
//      proceso persistente con un navegador headless,
//   2) simulaba ser WhatsApp Web (no es un canal oficial de Meta) y podía
//      resultar en el bloqueo del número.
//
// Variables de entorno requeridas:
//   WHATSAPP_TOKEN               token permanente del system user del WABA
//   WHATSAPP_PHONE_NUMBER_ID     ID del número de teléfono emisor en el WABA
//   WHATSAPP_TEMPLATE_DOCK       nombre de la plantilla de utilidad aprobada
//                                 (default: "asignacion_dock")
//   WHATSAPP_TEMPLATE_LANG       código de idioma de la plantilla
//                                 (default: "es_AR")
//
// La plantilla debe estar dada de alta y aprobada en el WABA con dos
// variables de cuerpo en este orden: {{1}} = nombre del conductor,
// {{2}} = código del dock.

const GRAPH_API_VERSION = "v21.0";

const formatPhoneE164 = (phone) => {
  // Nos quedamos solo con dígitos y agregamos el prefijo de Argentina (549)
  // si vino en formato local de 10 dígitos.
  let cleanPhone = String(phone).replace(/\D/g, "");

  if (cleanPhone.length === 10) {
    cleanPhone = `549${cleanPhone}`;
  }

  return cleanPhone;
};

const sendDockAssignment = async ({ phone, driverName, dockCode }) => {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
  const templateName = process.env.WHATSAPP_TEMPLATE_DOCK || "asignacion_dock";
  const templateLang = process.env.WHATSAPP_TEMPLATE_LANG || "es_AR";

  if (!token || !phoneNumberId) {
    console.error(
      "WhatsApp Cloud API no está configurada (faltan WHATSAPP_TOKEN / WHATSAPP_PHONE_NUMBER_ID); no se envió la notificación."
    );
    return null;
  }

  const to = formatPhoneE164(phone);

  try {
    const response = await axios.post(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${phoneNumberId}/messages`,
      {
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: templateName,
          language: { code: templateLang },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: String(driverName || "") },
                { type: "text", text: String(dockCode || "") }
              ]
            }
          ]
        }
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;
  } catch (error) {
    const details = error.response?.data || error.message;
    console.error("Error al enviar la notificación por WhatsApp:", details);
    // No relanzamos el error: una falla al notificar por WhatsApp no debería
    // hacer fallar la asignación del dock en sí.
    return null;
  }
};

module.exports = {
  sendDockAssignment
};
