const appointmentService =
  require("./appointment.service");

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

    console.error(error);

    res.status(400).json({
      message: error.message
    });

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

    console.error(error);

    res.status(400).json({
      message: error.message
    });

  }

}

module.exports = {
  create,
  getAll
};