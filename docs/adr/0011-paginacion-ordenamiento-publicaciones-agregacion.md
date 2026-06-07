# ADR 0011 - Paginación y Ordenamiento de Publicaciones con MongoDB Aggregations

## Estado
Aceptado

## Contexto
El Sprint 2 requiere que el listado de publicaciones se muestre paginado (recibiendo parámetros de límite y desplazamiento/offset) y ordenado. Por defecto, debe ordenarse de manera cronológica inversa (fecha de creación), pero el usuario debe poder alternar para ordenar por popularidad (cantidad de "Me Gusta").

## Decisión
Se decidió implementar estas operaciones en el backend utilizando **Pipelines de Agregación de MongoDB** (`aggregate`) a través de Mongoose.
Las decisiones técnicas principales son:
1. **Agregación Dinámica:** Cuando el parámetro de ordenación es por likes (`sortBy=likes`), se inyecta la etapa `$addFields` que calcula el tamaño del array de likes (`likesCount: { $size: { $ifNull: ["$likes", []] } }`) y luego se ordena por este campo de forma descendente.
2. **Paginación en Servidor:** Se utilizan las etapas `$skip` y `$limit` al final del pipeline de agregación para asegurar que la base de datos solo retorne la porción solicitada de datos.
3. **Populación Post-Agregación:** Como los pipelines de agregación de MongoDB retornan objetos JSON planos, se utiliza la función `Model.populate()` para rellenar los datos relacionales de los autores del post y de los autores de los comentarios embebidos.

## Consecuencias
- **Positivas:** El cálculo de la popularidad y el ordenamiento se resuelven en la base de datos de manera altamente eficiente, evitando procesar miles de registros en la memoria del servidor de aplicaciones.
- **Positivas:** Permite una paginación flexible y escalable, reduciendo el ancho de banda transmitido entre backend y frontend.
- **Negativas:** La combinación de agregaciones y populaciones añade complejidad al código del servicio de publicaciones, requiriendo conversiones explícitas de IDs a `Types.ObjectId` para que las etapas de coincidencia (`$match`) funcionen adecuadamente.
