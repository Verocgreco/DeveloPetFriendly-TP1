const express = require("express");
const router = express.Router();

const logisticaController = require("../controllers/logistica.controller.js");

// GET todas las operaciones de logística
router.get("/", logisticaController.obtenerLogistica);

// GET una operación específica por ID
router.get("/:id", logisticaController.obtenerOperacionPorId);

// POST nueva operación de logística
router.post("/", logisticaController.crearOperacion);

// PUT modificar/actualizar una operación existente (El que reemplaza al "PUSH")
router.put("/:id", logisticaController.actualizarOperacion);

// DELETE eliminar o dar de baja una operación
router.delete("/:id", logisticaController.eliminarOperacion);

module.exports = router;