# ADR 0015 - Autenticación: Duración de Sesión Corta y Refresco de Token

## Estado
Aceptado

## Contexto
Por motivos de seguridad informática y control de acceso robusto, se requiere que la sesión activa del usuario tenga una duración máxima de 15 minutos en el servidor. Sin embargo, cerrar la sesión de forma abrupta a los 15 minutos sin interactuar con el usuario arruinaría la experiencia de usuario (UX). Se necesita una estrategia que combine la expiración corta en el backend con una forma amigable de extender la sesión de forma interactiva en el frontend.

## Decisión
Se decidió implementar el siguiente esquema de duración y refresco de tokens:
1. **Expiración de Token en 15 Minutos:** La duración del token JWT firmado por NestJS se ha reducido de 1 hora a `15m` (`signOptions: { expiresIn: '15m' }` en `auth.module.ts`).
2. **Expiración de Cookies a los 15 Minutos:** La cookie `access_token` generada por el backend en el login o refresco de token se configura con una vida máxima de 15 minutos (`maxAge: 900000` ms).
3. **Flujo de Advertencia en Frontend:**
   - Al iniciar sesión con éxito o pasar la validación inicial, se dispara un evento centralizado (`sessionStarted`) y se inicia un temporizador de 10 minutos en el componente raíz (`App`).
   - Al finalizar estos 10 minutos, aparece un modal advirtiendo al usuario que su sesión expirará en 5 minutos y consultando si desea extenderla.
   - Si la respuesta es afirmativa, se llama al endpoint `POST /auth/refrescar`, el cual valida el token actual y responde con un nuevo token JWT renovando la cookie del navegador por otros 15 minutos, reiniciando a su vez el temporizador de 10 minutos en el cliente.
   - Si el usuario decide cerrar sesión o transcurren los 5 minutos del modal de advertencia sin interacción, se limpia el almacenamiento del cliente y se le redirige de forma automática al `/login`.

## Consecuencias
- **Positivas:**
  - Reducción del riesgo ante ataques de secuestro de sesión (session hijacking) gracias a tokens de corta duración.
  - Mayor seguridad en ordenadores compartidos (universitarios).
  - Buena experiencia de usuario (UX) al evitar el cierre de sesión inesperado mediante una alerta proactiva y sencilla de extender con un solo click.
- **Negativas:**
  - Incremento del flujo de peticiones recurrentes al backend (`/auth/refrescar`) cada 10-15 minutos por parte de usuarios activos.
