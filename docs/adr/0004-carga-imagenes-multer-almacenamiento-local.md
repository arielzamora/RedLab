# ADR 0004 - Carga de Imágenes de Perfil con Multer y Almacenamiento Local

## Estado
Aceptado

## Contexto
El Sprint 3 requiere que la aplicación de red social soporte la carga de una imagen de perfil desde el formulario de registro y la actualización de perfil. El backend debe almacenar el archivo de manera apropiada y registrar la URL correspondiente en la base de datos de MongoDB.

## Decisión
Se decidió utilizar **Multer** (a través de `FileInterceptor` en NestJS) para gestionar la carga de archivos en el backend. 
Las especificaciones clave son:
1. **Destino de Almacenamiento:** Los archivos se guardan en el directorio `./uploads` en el servidor backend.
2. **Generación de Nombres Únicos:** Para evitar colisiones de nombres de archivos cargados por diferentes usuarios, se utiliza un generador de nombres que concatena el timestamp actual con un sufijo numérico aleatorio (`Date.now() + '-' + Math.round(Math.random() * 1e9)`), manteniendo la extensión original del archivo.
3. **Servicio Estático de Archivos:** Se configuró el backend de Express para exponer la carpeta `uploads` de manera estática en la ruta `/uploads` usando `useStaticAssets`.
4. **URL Dinámica:** El backend concatena dinámicamente el protocolo y el host de la petición (`req.protocol` y `req.get('host')`) para construir la URL absoluta y persistirla en el campo `imgUrl` del usuario. Esto permite un funcionamiento fluido tanto en el entorno de desarrollo local como en el despliegue de Azure sin configuraciones adicionales.

## Consecuencias
- **Positivas:** Implementación directa sin necesidad de configurar y costear un almacenamiento de objetos externo (como Azure Blob Storage o AWS S3) durante esta fase de prototipo.
- **Positivas:** La URL dinámica de imagen de perfil se adapta de forma automática al dominio local (`localhost:3000`) o de producción (`azurewebsites.net`).
- **Negativas:** En un entorno de producción real escalado horizontalmente (múltiples instancias de contenedores), el almacenamiento local de archivos requiere configuración de volúmenes persistentes compartidos o almacenamiento en la nube centralizado.
