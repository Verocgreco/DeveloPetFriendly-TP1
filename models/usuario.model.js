class Usuario {
    constructor(
        id,
        nombre,
        email,
        rol,
        estado = "Activo"
    ) {
        this.id = id;
        this.nombre = nombre;
        this.email = email;
        this.rol = rol;
        this.estado = estado;
    }
}

module.exports = Usuario;