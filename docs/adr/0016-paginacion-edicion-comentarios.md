# ADR 0016 - Paginación y Edición de Comentarios Embebidos

## Estado
Aceptado

## Contexto
El Sprint #3 requiere la visualización en pantalla grande de una publicación individual junto con sus comentarios. Dado que una publicación popular puede acumular cientos de comentarios, no es óptimo ni eficiente cargar todos los comentarios de una sola vez al cargar la publicación. Además, el usuario debe tener la opción de corregir o editar sus comentarios, debiendo mostrarse claramente que el texto original ha sido modificado.

## Decisión
Se implementaron las siguientes decisiones de diseño para la gestión de comentarios:
1. **Rutas específicas para Comentarios:** Aunque los comentarios siguen estando almacenados como una colección embebida dentro del documento de `Publication` en MongoDB (manteniendo la decisión del ADR 0010), se añaden controladores específicos para listarlos y modificarlos de manera aislada (`GET /publications/:id/comments` y `PUT /publications/:id/comments/:commentId`).
2. **Paginación y Ordenación Descendente (GET):**
   - El endpoint `GET` de comentarios devuelve los comentarios ordenados cronológicamente de manera descendente (los más recientes primero).
   - Se admite paginación basada en parámetros `limit` y `offset`.
   - El frontend consume inicialmente un lote limitado (5 comentarios) y proporciona un botón interactivo "Cargar más" que trae la siguiente tanda sin perder de vista los anteriores.
3. **Edición Segura (PUT):**
   - Se agrega el campo `modificado: boolean` con valor por defecto `false` en el esquema de comentarios.
   - Cuando el autor del comentario envía una petición `PUT`, se reemplaza el texto y se actualiza `modificado = true`.
   - El frontend verifica si el usuario autenticado coincide con el autor para habilitar el botón "Editar", que despliega un editor de texto inline y muestra la etiqueta `(Editado)` en el comentario una vez guardado.

## Consecuencias
- **Positivas:**
  - Cargas iniciales rápidas de la página de publicación detalle gracias a la paginación de comentarios.
  - Menor consumo de ancho de banda y menor carga de renderizado en el navegador.
  - Flexibilidad para el usuario de corregir errores tipográficos en sus comentarios, garantizando la transparencia para otros lectores con la etiqueta de edición.
- **Negativas:**
  - Mongoose debe simular el ordenamiento y segmentación en memoria al ser comentarios embebidos y no una colección raíz separada en MongoDB, lo cual es manejable debido a los volúmenes típicos de comentarios por post.
