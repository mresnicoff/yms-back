const appointmentService =
  require("./appointment.service");
const { sendError } = require("../../lib/errors");

async function create(req, res) {

  try {

    const data = {
      ...req.body,

      supplierId:
        req.user.role === "SUPPLIER"
          ? req.user.supplierId
          : req.body.supplierId
    };

    const appointment =
      await appointmentService.createAppointment(
        data
      );

    res.status(201).json(appointment);

  } catch (error) {

    sendError(res, error, "No se pudo crear el turno. Intentá nuevamente.");

  }

}
async function getAll(req, res) {

  try {

    const appointments =
      await appointmentService.getAppointments(
        req.user
      );

    res.status(200).json(
      appointments
    );

  } catch (error) {

    sendError(res, error, "No se pudieron obtener los turnos.");

  }

}

module.exports = {
  create,
  getAll
};