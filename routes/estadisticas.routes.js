const express = require("express");
const router = express.Router();

const estadisticaController = require("../controllers/estadisticas.controller.js");

// GET REPORTE HOT SALE
router.get("/hotsale", estadisticaController.obtenerReporteHotSale);

module.exports = router;