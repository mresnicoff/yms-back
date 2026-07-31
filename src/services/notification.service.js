const axios = require("axios");

const sendDockAssignment = async ({
  phone,
  driverName,
  dockCode
}) => {
  console.log({
  phone,
  driverName,
  dockCode
});

  const response = await axios.post(
    `https://graph.facebook.com/v25.0/${process.env.META_PHONE_NUMBER_ID}/messages`,
    {
      messaging_product: "whatsapp",
      to: phone,
      type: "template",
      template: {
        name: "asignacion_dock",
        language: {
          code: "es"
        },
        components: [
          {
            type: "body",
            parameters: [
              {
                type: "text",
                text: driverName
              },
              {
                type: "text",
                text: dockCode
              }
            ]
          }
        ]
      }
    },
    {
      headers: {
        Authorization: `Bearer ${process.env.META_ACCESS_TOKEN}`,
        "Content-Type": "application/json"
      }
    }
  );

  return response.data;

};

module.exports = {
  sendDockAssignment
};