# ADR 0018: Registro y Gestión de Usuarios por Administradores (Alta y Baja Lógica)

## Estado
Aceptado

## Contexto
El sprint requiere dotar a los administradores de la capacidad de listar, registrar nuevos usuarios (con opción de asignarles perfil de "usuario" o "administrador") y habilitar/deshabilitar usuarios de forma lógica (soft delete).

Un usuario deshabilitado no debe poder iniciar sesión en la aplicación y debe recibir una notificación de que su cuenta ha sido deshabilitada al intentar el login.

## Decisión
Se decide:
1. Crear una directiva `appAdminOnly` para restringir visualmente elementos de administración en el frontend.
2. Crear un guard de NestJS `AdminGuard` para proteger las rutas de listado y modificación en el backend (`UsersController`).
3. Hashear de forma segura las contraseñas ingresadas por el administrador antes de guardar al usuario en la base de datos de MongoDB.
4. Modificar el flujo de login del backend (`AuthService`) para que verifique si `user.activo === false`, en cuyo caso lanza una excepción específica `UnauthorizedException` con el mensaje: "Usuario deshabilitado. No estás autorizado a ingresar."
5. Capturar dicho error en el componente de login del frontend para desplegar una advertencia clara al usuario en el sistema de modales.

## Consecuencias
- Seguridad mejorada al validar roles tanto en el frontend como en el backend.
- Experiencia de usuario (UX) óptima con mensajes de error específicos en lugar de errores genéricos de "credenciales inválidas".
- Integridad de los datos a través del uso de alta y baja lógica en lugar de borrado físico.
