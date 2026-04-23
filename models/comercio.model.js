class Comercio {
    constructor(
        id,
        nombre_comercio,
        cuit,
        email_contacto,
        plan_suscripcion,
        comision_variable,
        estado = "Activo"
    ) {
        this.id = id;
        this.nombre_comercio = nombre_comercio;
        this.cuit = cuit;
        this.email_contacto = email_contacto;
        this.plan_suscripcion = plan_suscripcion;
        this.comision_variable = comision_variable;
        this.estado = estado;
    }
}

module.exports = Comercio;