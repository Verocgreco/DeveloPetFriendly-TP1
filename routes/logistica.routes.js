const express = require("express");
const router = express.Router();

const logisticaController = require("../controllers/logistica.controller.js");

// GET todas las operaciones de logística
router.get("/", logisticaController.obtenerLogistica);

// POST nueva operación de logística
router.post("/", logisticaController.crearOperacion);

module.exports = router;