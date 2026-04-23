const express = require("express");
const router = express.Router();

const tiendasController = require("../controllers/tiendas.controller.js");

// GET ALL
router.get("/", tiendasController.obtenerTiendas);

// GET BY ID
router.get("/:id", tiendasController.obtenerTiendaPorId);

// CREATE
router.post("/", tiendasController.crearTienda);

// UPDATE
router.put("/:id", tiendasController.actualizarTienda);

// DELETE (baja lógica)
router.delete("/:id", tiendasController.eliminarTienda);

module.exports = router;