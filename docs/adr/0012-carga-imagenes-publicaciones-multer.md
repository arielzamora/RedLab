# ADR 0012 - Carga de Imágenes en Publicaciones con Multer y Almacenamiento Local

## Estado
Aceptado

## Contexto
En el Sprint 2 se solicitó que al crear una publicación (POST), el usuario pueda adjuntar una imagen opcional. Esta imagen debe ser almacenada de manera persistente en el servidor de forma que pueda ser consultada públicamente por otros usuarios desde el feed.

## Decisión
Se decidió expandir el mecanismo de almacenamiento de archivos estáticos implementado previamente en el ADR 0004 para dar soporte a las publicaciones.
Los detalles de la solución son:
1. **Interceptor en Ruta de Publicación:** Se aplicó `FileInterceptor('imagen')` en el endpoint `POST /publications` para interceptar la carga de la imagen del post.
2. **Generación de Archivos:** Las imágenes se guardan de forma local bajo la misma carpeta `./uploads` en el servidor backend, utilizando un prefijo de archivo `post-` seguido de un timestamp y un número aleatorio (`post-uniqueSuffix.extension`).
3. **Persistencia en Documento:** En la base de datos se guarda la URL completa absoluta y dinámica construida dinámicamente utilizando el host de la petición (`req.protocol` y `req.get('host')`), guardándola en el campo `imgUrl` de la publicación.

## Consecuencias
- **Positivas:** Reutiliza toda la infraestructura de almacenamiento estático local ya establecida, evitando duplicar configuraciones o requerir dependencias extras.
- **Positivas:** Al estar guardados en un único directorio público accesible, el frontend puede renderizar las imágenes de las publicaciones de manera directa consumiendo la URL guardada.
- **Negativas:** Comparte las mismas limitaciones del ADR 0004 respecto al escalado horizontal, donde la persistencia requerirá a futuro ser migrada a un proveedor cloud de almacenamiento de objetos como AWS S3 o Cloudinary.
