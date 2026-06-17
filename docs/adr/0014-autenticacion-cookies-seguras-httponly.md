# ADR 0014 - Sesión y Autenticación Segura mediante Cookies HttpOnly

## Estado
Aceptado

## Contexto
En la implementación inicial del sistema de autenticación, el token JWT devuelto tras el inicio de sesión se guardaba en el `localStorage` del navegador y el frontend lo enviaba manualmente en la cabecera `Authorization: Bearer <token>` de cada petición HTTP. Aunque funcional, este enfoque es vulnerable a ataques de secuestro de sesión a través de **XSS (Cross-Site Scripting)**; si un atacante logra ejecutar código JavaScript malicioso en el cliente, podría leer el almacenamiento local y robar el token de sesión.

## Decisión
Se decidió migrar la gestión de sesiones a **Cookies Seguras de tipo HttpOnly**:
1. **Emisión Centralizada:** Tras el login o registro exitoso, el backend escribe una cookie de sesión llamada `access_token` usando la cabecera `Set-Cookie`.
2. **Propiedades de Seguridad de la Cookie:**
   - **`httpOnly: true`:** Impide que scripts del lado del cliente (incluyendo código JavaScript propio o de terceros en Angular) puedan leer o modificar la cookie, anulando los ataques XSS directos de secuestro de sesión.
   - **`secure: true`:** Asegura que la cookie solo viaje en canales encriptados HTTPS en entornos de producción.
   - **`sameSite: 'none'`:** Es indispensable debido a que el frontend y el backend están alojados en dominios independientes en Azure; permite que el navegador comparta de forma segura cookies cross-site.
3. **Petición con Credenciales en Angular:** Se modificó el interceptor HTTP de Angular ([auth.interceptor.ts](file:///c:/Repos/Progra4-2026/red-social/frontend/src/app/core/interceptors/auth.interceptor.ts)) para inyectar `withCredentials: true` en todas las peticiones, permitiendo al navegador adjuntar la cookie de forma automática.
4. **Cierre de Sesión:** Se creó el endpoint `POST /auth/logout` en el backend para limpiar la cookie de sesión mediante `res.clearCookie('access_token')`.
5. **Configuración Estricta de CORS:** En `main.ts`, se configuró CORS con orígenes explícitos (`credentials: true` y lista blanca de dominios), ya que las especificaciones web impiden usar comodines (`*`) cuando se habilita el intercambio de cookies.

## Consecuencias
- **Positivas:**
  - Mitigación completa de robo de tokens JWT mediante vulnerabilidades XSS.
  - El navegador se encarga automáticamente de persistir, enviar y expirar las cookies sin requerir lógica manual compleja en el cliente.
- **Negativas:**
  - Requiere obligatoriamente HTTPS y certificados SSL válidos en producción debido al flag `SameSite=None`.
  - Exige una configuración rígida y explícita de CORS en el backend, impidiendo el uso de orígenes públicos universales (`*`).
