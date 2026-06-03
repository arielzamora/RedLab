# ADR 0006 - Autorización por Roles para la Eliminación de Publicaciones

## Estado
Aceptado

## Contexto
Se requiere que los usuarios tengan un atributo `perfil` con valor por defecto `"usuario"`, el cual puede cambiarse a `"administrador"`. En el feed de publicaciones, la acción de borrar una publicación debe estar permitida únicamente para el autor de la misma o para un usuario con rol de administrador.

## Decisión
Se decidió implementar el control de acceso a dos niveles:
1. **JWT Payload:** Se actualizó el payload del token JWT generado durante el login para incluir el rol del usuario (`role: user.perfil`). Esto permite que el backend extraiga el rol del token sin necesidad de consultar la base de datos en cada validación de permisos.
2. **Lógica de Backend:** En `PublicationsService.removeWithRole(id, userId, role)`, se valida si el ID del usuario autenticado coincide con el del autor de la publicación (`pub.autor`), O si el rol del usuario extraído del JWT es `"administrador"`. Si ninguna de las dos condiciones se cumple, el servidor deniega la acción y arroja una excepción `UnauthorizedException` (código HTTP 401).
3. **Lógica de Frontend:** El componente `PostCard` compara el `currentUserId` con el ID del autor, y además verifica si el `currentUserRole` es `"administrador"`. El botón de eliminar se oculta de la vista si el usuario no cumple con alguno de estos dos criterios.

## Consecuencias
- **Positivas:** Seguridad por diseño al implementar la protección de recursos tanto en el cliente (ocultando el botón) como en el servidor (denegando la petición HTTP malintencionada).
- **Positivas:** El uso de roles en el token JWT evita realizar consultas adicionales a MongoDB, reduciendo la latencia de las peticiones protegidas.
