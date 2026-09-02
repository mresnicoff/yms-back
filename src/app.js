const express = require("express");
const cors = require("cors");

// Rutas existentes
const warehouseRoutes = require("./modules/warehouses/warehouse.routes");
const authRoutes = require("./modules/auth/auth.routes");
const slotRoutes = require("./modules/slots/slot.routes");
const appointmentRoutes = require("./modules/appointments/appointment.routes");
const checkInRoutes = require("./modules/checkins/checkin.routes");
const dockOperationRoutes = require("./modules/dock-operations/dock-operation.routes");
const documentValidationRoutes = require("./modules/document-validation/document-validation.routes");
const dispatchRoutes = require("./modules/dispatches/dispatch.routes");
const requiredDocumentRoutes = require("./modules/required-documents/required-document.routes");
const driverRoutes = require("./modules/drivers/driver.routes");
const supplierRoutes = require("./modules/suppliers/supplier.routes");
const vehicleTypeRoutes = require("./modules/vehicle-types/vehicle-type.routes");
const dockGroupRoutes = require("./modules/dock-groups/dock-group.routes");
const truckRoutes = require("./modules/trucks/truck.routes");
const documentRoutes = require("./modules/documents/document.routes");
const documentTypeRoutes = require("./modules/document-types/document-type.routes");
const path =require("path");
// Nuevo módulo de WhatsApp
const whatsappRoutes = require("./modules/whatsapp/whatsapp.routes");

const app = express();

app.use(cors({
  origin: "http://localhost:5173"
}));

app.use(express.json());
app.use(
  "/uploads",
  express.static(
    path.join(
      __dirname,
      "../uploads")))
    
// Registro de endpoints
app.use("/api/document-validation", documentValidationRoutes);
app.use("/api/warehouses", warehouseRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/checkins", checkInRoutes);
app.use("/api/dock-operations", dockOperationRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/vehicle-types", vehicleTypeRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/dispatches", dispatchRoutes);
app.use("/api/document-types", documentTypeRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/required-documents", requiredDocumentRoutes);
app.use("/api/dock-groups", dockGroupRoutes);
app.use("/api/trucks", truckRoutes);
app.use("/api/slots", slotRoutes);

// Endpoint de WhatsApp
app.use("/api/whatsapp", whatsappRoutes);

module.exports = app;