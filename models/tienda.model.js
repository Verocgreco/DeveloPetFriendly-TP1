class Tienda {
    constructor(
        id,
        nombre,
        comercio_id,
        ubicacion,
        estado = "Activa"
    ) {
        this.id = id;
        this.nombre = nombre;
        this.comercio_id = comercio_id;
        this.ubicacion = ubicacion;
        this.estado = estado;
    }
}

module.exports = Tienda;