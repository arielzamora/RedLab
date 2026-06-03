# ADR 0007 - Validaciones Robustas en Formularios de Registro y Login

## Estado
Aceptado

## Contexto
Tanto para el registro como para el inicio de sesión, el sistema requiere garantizar la calidad de los datos de entrada y la seguridad de la información. Específicamente, se necesita que el correo y el nombre de usuario sean únicos, que las contraseñas tengan un nivel mínimo de complejidad (al menos 8 caracteres, una mayúscula y un número), y que en el registro se valide la coincidencia de contraseñas.

## Decisión
Se decidió implementar un esquema de validación dual (cliente y servidor):
1. **Validación del Lado del Cliente (Angular):**
   - Uso de expresiones regulares (`/^(?=.*[A-Z])(?=.*\d).{8,}$/`) para verificar de forma dinámica la complejidad de la contraseña antes del envío de datos.
   - Comparación estricta de las variables de formulario `password` y `repetirPassword` en el componente de registro.
   - Bloqueo de envío y retroalimentación inmediata al usuario a través del sistema de modales ante cualquier campo faltante o inválido.
2. **Validación del Lado del Servidor (NestJS):**
   - Verificación de unicidad de correo y nombre de usuario en la base de datos MongoDB antes de guardar. Si ya existen, el backend devuelve un error estructurado 400 Bad Request.
   - Procesamiento robusto del formato multipart/form-data usando `FormData` para soportar la carga híbrida de archivos e información de usuario al mismo tiempo.

## Consecuencias
- **Positivas:** Mayor seguridad e integridad de datos al evitar que contraseñas débiles o duplicadas lleguen a almacenarse.
- **Positivas:** UX fluida al advertir al usuario de fallos en los datos antes de realizar peticiones de red innecesarias.
