# 0003 - Seguridad y Sesiones: Hashing con bcrypt y Tokens JWT

**Fecha:** 2026-06-01  
**Estado:** Aceptado

## 1. Contexto y Problema
El sistema requiere autenticar usuarios de forma segura. Guardar contraseñas en texto plano representa un fallo crítico de seguridad. Asimismo, para realizar acciones protegidas (como crear o borrar publicaciones), es necesario que el servidor identifique fehacientemente qué usuario está realizando la petición en cada momento, sin forzarlo a loguearse en cada interacción y sin utilizar cookies pesadas o sesiones de memoria RAM en el servidor que impidan el escalamiento horizontal.

## 2. Decisión Tomada
Se adoptó una arquitectura estándar de seguridad basada en **criptografía** y **tokens de sesión**:
1. **Hashing de Contraseñas (bcrypt):** Se implementó la encriptación unidireccional de contraseñas usando un factor de costo (salt) de 10 durante el registro de usuarios, y verificación atómica con `bcrypt.compare` al iniciar sesión.
2. **JSON Web Tokens (JWT):** Tras el inicio de sesión exitoso, el backend genera un token JWT firmado que almacena información segura del usuario (`id`, `username`, `email`) y expira en 1 hora.
3. **Session Local Storage & Custom Modals:** El frontend de Angular almacena este token de forma segura en el almacenamiento local del navegador (`localStorage`) para enviar la cabecera `Authorization: Bearer <token>` en peticiones futuras. Se implementó un control de alertas dinámico para interceptar errores de validación sin alertas nativas del sistema.

## 3. Consecuencias (Pros y Contras)
- **Positivas:** 
  - Almacenamiento seguro: en caso de filtración de la base de datos, las contraseñas reales de los usuarios nunca son expuestas gracias a bcrypt.
  - API Stateless (Sin estado): el servidor NestJS es ligero y escalable porque no mantiene sesiones en memoria; solo valida la firma criptográfica del JWT entrante.
  - Sesión fluida: el usuario no pierde el acceso mientras navega en el cliente de Angular.
- **Negativas / Riesgos:**
  - El token almacenado en `localStorage` puede ser vulnerable a ataques XSS si el frontend importa scripts de terceros no validados, riesgo controlado al no usar librerías externas no confiables en el bundle de Angular.
