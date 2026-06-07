# ADR 0010 - Modelo de Comentarios Embebidos (Subdocumentos) en Publicaciones

## Estado
Aceptado

## Contexto
Para el Sprint 2 se solicitó que las publicaciones muestren sus correspondientes comentarios. Al trabajar con una base de datos NoSQL como MongoDB (vía Mongoose), debíamos decidir si estructurar los comentarios en una colección independiente vinculada por IDs (relación referenciada) o incrustarlos directamente dentro de cada documento de la publicación (subdocumentos embebidos).

## Decisión
Se decidió diseñar los comentarios como **subdocumentos embebidos** directamente en el esquema `Publication` bajo el campo `comentarios` (de tipo `[CommentSchema]`). 
Los motivos para esta elección son:
1. **Acceso de Lectura Optimizado:** En una red social, las publicaciones y sus comentarios se consultan conjuntamente de manera frecuente. Al estar embebidos, se recupera toda la información en una sola lectura de disco sin requerir operaciones `$lookup` (joins) costosas.
2. **Ciclo de Vida Acoplado:** Un comentario no tiene sentido de existir sin la publicación a la que pertenece. Al eliminarse (física o lógicamente) un post, sus comentarios se gestionan automáticamente dentro del mismo documento.
3. **Tamaño del Documento Controlado:** Aunque MongoDB tiene un límite de 16MB por documento, el volumen de comentarios promedio para las publicaciones de esta red social universitaria se mantiene muy por debajo de ese límite, haciendo viable y eficiente esta estrategia.

## Consecuencias
- **Positivas:** Reducción drástica del número de consultas a la base de datos y simplificación en la lógica del backend al crear y recuperar comentarios.
- **Positivas:** La actualización de un post con comentarios nuevos se maneja atómicamente a través de métodos nativos de Mongoose como `.push()` y `.save()`.
- **Negativas:** Si una publicación llegase a tener decenas de miles de comentarios, el documento podría crecer significativamente, lo cual requeriría en el futuro migrar a una colección híbrida o paginación interna de comentarios mediante una colección separada.
