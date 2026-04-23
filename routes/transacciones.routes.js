const express = require("express");
const router = express.Router();

const transaccionController = require("../controllers/transacciones.controller.js");

// GET ALL
router.get("/", transaccionController.obtenerTransacciones);

// GET BY ID
router.get("/:id", transaccionController.obtenerTransaccionPorId);

// CREATE
router.post("/", transaccionController.crearTransaccion);

// UPDATE
router.put("/:id", transaccionController.actualizarTransaccion);

// DELETE
router.delete("/:id", transaccionController.eliminarTransaccion);

module.exports = router;