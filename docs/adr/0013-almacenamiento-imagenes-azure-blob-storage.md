# ADR 0013 - Almacenamiento de Imágenes en la Nube con Azure Blob Storage y Fallback Local

## Estado
Aceptado

## Contexto
El almacenamiento local de imágenes en el servidor backend (implementado en fases anteriores del monorepo mediante Multer y guardado directo en `./uploads`) presenta problemas de persistencia en entornos de producción en la nube (como Azure App Service). Debido a que los contenedores en la nube pueden reiniciarse, escalarse horizontalmente o recrearse, los archivos locales subidos por los usuarios se perderían. Se requiere una solución persistente, duradera y de alta disponibilidad para guardar y servir las imágenes de perfil y publicaciones.

## Decisión
Se decidió implementar una arquitectura de almacenamiento en la nube basada en **Azure Blob Storage**:
1. **SDK Oficial de Azure:** Se incorporó el paquete `@azure/storage-blob` en el backend para la comunicación directa con los servicios de almacenamiento de Azure.
2. **Servicio Unificado de Almacenamiento ([StorageService](file:///c:/Repos/Progra4-2026/red-social/backend/src/common/storage.service.ts)):** Se diseñó una interfaz y servicio único para subir imágenes que encapsula la lógica.
3. **Estrategia Híbrida (Fallback Local):** El servicio lee la variable de entorno `STORAGE_PROVIDER`. Si es igual a `azure` y existe una cadena de conexión válida en `AZURE_STORAGE_CONNECTION_STRING`, sube el archivo al contenedor de Azure Blob Storage y devuelve el URL público. Si la configuración no está presente, guarda el archivo en el almacenamiento local `./uploads` utilizando la ruta absoluta calculada mediante `process.cwd()` para garantizar el correcto funcionamiento en desarrollo sin requerir claves cloud.
4. **Carga en Memoria:** Se eliminó la configuración de `diskStorage` de Multer en los controladores para recibir los archivos en memoria (`file.buffer`) y enviarlos en flujo al storage correspondiente.

## Consecuencias
- **Positivas:** 
  - Las imágenes subidas por los usuarios son persistentes y no se borran al reiniciar o redesplegar el servidor backend en Azure.
  - Se permite el escalado horizontal del servidor, ya que todas las instancias leen y escriben del mismo almacén central de objetos.
  - Desarrollo local simplificado: los desarrolladores que no cuenten con credenciales de Azure pueden seguir probando la carga de archivos localmente.
- **Negativas:**
  - Dependencia de una cuenta de Azure activa y cargos asociados al uso de ancho de banda y almacenamiento de objetos.
