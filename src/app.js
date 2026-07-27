const express = require("express");

const warehouseRoutes = require("./modules/warehouses/warehouse.routes");
const authRoutes =require("./modules/auth/auth.routes");
const slotRoutes = require("./modules/slots/slot.routes");
const appointmentRoutes =require("./modules/appointments/appointment.routes");
const checkInRoutes =require("./modules/checkins/checkin.routes");
const dockOperationRoutes = require("./modules/dock-operations/dock-operation.routes");
const app = express();
const cors = require("cors");
const driverRoutes =require("./modules/drivers/driver.routes");
const supplierRoutes =require("./modules/suppliers/supplier.routes");
const vehicleTypeRoutes =require("./modules/vehicle-types/vehicle-type.routes");
const dockGroupRoutes =require("./modules/dock-groups/dock-group.routes");
const truckRoutes =require("./modules/trucks/truck.routes");
app.use(cors({
origin: "http://localhost:5173"
}));
app.use(express.json());

app.use("/api/warehouses", warehouseRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/checkins", checkInRoutes);
app.use( "/api/dock-operations", dockOperationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/suppliers",supplierRoutes);
app.use( "/api/vehicle-types", vehicleTypeRoutes);
app.use("/api/drivers",driverRoutes);


app.use("/api/dock-groups", dockGroupRoutes);

app.use("/api/trucks",truckRoutes);

app.use("/api/slots", slotRoutes);

module.exports = app;