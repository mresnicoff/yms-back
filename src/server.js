require("dotenv").config();
const whatsappBot =require("./lib/whatsapp-bot");

const app = require("./app");

const PORT = process.env.PORT || 3000;
whatsappBot.iniciar();
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});