const fs = require("fs");
const path = require("path");

const Estadistica = require("../models/estadisticas.model");

const rutaArchivo = path.join(
    __dirname,
    "../data/transacciones.json"
);


// LEER TRANSACCIONES
const leerTransacciones = () => {
    const data = fs.readFileSync(
        rutaArchivo,
        "utf-8"
    );

    return JSON.parse(data);
};


// GET REPORTE GENERAL
const obtenerReporteHotSale = (req, res) => {

    try {

        const transacciones =
            leerTransacciones();

        let totalVentas =
            transacciones.length;

        let dineroTotal = 0;

        let ganancias = 0;

        let inconsistencias = 0;


        transacciones.forEach(t => {

            dineroTotal +=
                t.monto_total;

            ganancias +=
                t.split_pagos
                 .comision_techretail;

            if (
                t.estado_conciliacion ===
                "Inconsistencia Detectada"
            ) {
                inconsistencias++;
            }

        });


        const porcentajeError =
            totalVentas > 0
                ? (
                    inconsistencias /
                    totalVentas *
                    100
                  ).toFixed(2)
                : "0.00";


        const estadoGeneral =
            porcentajeError > 5
                ? "Alerta Crítica: Revisar Pasarela"
                : "Operación Estable";


        const reporte =
            new Estadistica(

                "Campaña Hot Sale - TechRetail Solutions",

                new Date().toISOString(),

                {
                    total_ventas_procesadas:
                        totalVentas,

                    volumen_total_dinero:
                        dineroTotal,

                    ganancias_plataforma:
                        ganancias
                },

                {
                    inconsistencias_pasarela:
                        inconsistencias,

                    tasa_de_error:
                        porcentajeError + "%",

                    estado_general:
                        estadoGeneral
                }
            );


        res.json(reporte);

    } catch (error) {

        res.status(500).json({
            mensaje:
            "Error al generar el reporte"
        });

    }
};


module.exports = {
    obtenerReporteHotSale
};