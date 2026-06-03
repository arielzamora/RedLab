# ADR 0005 - Inyección Automática de JWT con Interceptores HTTP en Angular

## Estado
Aceptado

## Contexto
El backend requiere que las peticiones a endpoints protegidos (como `/publications` y la edición de perfil `/users/:id`) incluyan un token JWT válido en las cabeceras HTTP (`Authorization: Bearer <token>`). Agregar manualmente esta cabecera a cada petición dentro de los servicios de Angular genera código repetitivo y es propenso a errores.

## Decisión
Se decidió implementar un **HTTP Interceptor funcional** (`authInterceptor`) en Angular para automatizar la inserción de las cabeceras de autenticación:
1. **Recuperación del Token:** El interceptor intenta leer el token JWT almacenado en el `localStorage` en cada petición saliente.
2. **Inyección de Cabecera:** Si el token existe, se clona la petición HTTP original y se le añade la cabecera `Authorization: Bearer <token>`.
3. **Registro Centralizado:** Se registró en la configuración global de la aplicación (`app.config.ts`) mediante `provideHttpClient(withInterceptors([authInterceptor]))`.

## Consecuencias
- **Positivas:** Reducción drástica de código duplicado en los servicios de datos (`Auth` y `Publication`).
- **Positivas:** Seguridad mejorada al centralizar el manejo de tokens en un único lugar.
- **Negativas:** Se debe asegurar de no inyectar el token en peticiones externas a APIs de terceros ajenos a la aplicación si se integran a futuro (se resolvería agregando validaciones de URL en el interceptor).
