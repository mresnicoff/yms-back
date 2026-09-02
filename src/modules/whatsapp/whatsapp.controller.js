const whatsappService = require('./whatsapp.service');

const connect = async (req, res) => {
  try {
    const { plannerName } = req.body;
    if (!plannerName) {
      return res.status(400).json({ error: 'El nombre del planner es obligatorio' });
    }

    // Iniciamos la sesión en background
    whatsappService.startSession(plannerName);

    return res.json({ message: 'Proceso de conexión iniciado' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getStatus = (req, res) => {
  const currentStatus = whatsappService.getStatus();
  return res.json(currentStatus);
};

const disconnect = async (req, res) => {
  try {
    await whatsappService.logoutSession();
    return res.json({ message: 'Sesión cerrada correctamente' });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

module.exports = {
  connect,
  getStatus,
  disconnect
};