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

const app = express();

const allowedOrigins = Array.from(
  new Set([
    "http://localhost:5173",
    "http://www.ymspro.com.ar",
    "https://www.ymspro.com.ar",
    "http://ymspro.com.ar",
    "https://ymspro.com.ar",
    ...((process.env.FRONTEND_URL || "")
      .split(",")
      .map((origin) => origin.trim().replace(/\/$/, ""))
      .filter(Boolean))
  ])
);

// Configuración unificada de CORS
const corsOptions = {
  origin: function (origin, callback) {
    // Permite requests sin cabecera 'origin' (ej. Postman, llamadas servidor a servidor o healthchecks)
    if (!origin) return callback(null, true);

    const cleanOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(cleanOrigin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
  optionsSuccessStatus: 200
};

// Se aplican las opciones de CORS a todas las rutas y a las solicitudes OPTIONS (preflight)
app.use(cors(corsOptions));
app.options("/*splat", cors(corsOptions));

app.use(express.json());

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

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

// Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({ message: "Recurso no encontrado." });
});

// Manejador de errores global
app.use((err, req, res, next) => {
  if (err && err.message === "Not allowed by CORS") {
    return res.status(403).json({ message: "Origen no permitido por CORS." });
  }

  if (err && err.isAppError) {
    return res.status(err.statusCode || 400).json({ message: err.message });
  }

  console.error(err);

  res.status(500).json({
    message: "Ocurrió un error inesperado en el servidor."
  });
});

module.exports = app;
