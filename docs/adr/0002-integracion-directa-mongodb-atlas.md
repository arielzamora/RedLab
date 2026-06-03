# 0002 - Integración Directa a MongoDB Atlas Evadiendo Fallos de DNS SRV

**Fecha:** 2026-06-01  
**Estado:** Aceptado

## 1. Contexto y Problema
El backend necesita persistir datos de usuarios y publicaciones en una base de datos centralizada. Se configuraron las credenciales de MongoDB Atlas en la nube. Sin embargo, al conectarse mediante la cadena estándar `mongodb+srv://`, el servidor NestJS comenzó a fallar arrojando el error `querySrv ECONNREFUSED`. Este es un problema muy común en entornos Windows y ciertos proveedores de internet locales cuyos resolvedores de DNS no soportan consultas de registros SRV.

## 2. Decisión Tomada
Se decidió reestructurar la estrategia de conexión en el archivo `.env` del backend:
1. **Bypassear la resolución de DNS SRV:** En lugar de utilizar la URI resumida `mongodb+srv://`, se determinaron a nivel de red los Shards físicos y el ReplicaSet asociados al cluster de Atlas.
2. **Cadena de Conexión Directa:** Se implementó en el archivo `.env` una URI clásica apuntando explícitamente a los tres shards en el puerto `27017` (`ac-bqvt2ht-shard-00-00`, `ac-bqvt2ht-shard-00-01`, `ac-bqvt2ht-shard-00-02`) y declarando explícitamente el réplica set `atlas-zmk3bc-shard-0`.
3. **Variables de Entorno Globales:** Cargar las variables usando `@nestjs/config` para evitar almacenar contraseñas en texto plano en el repositorio Git.

## 3. Consecuencias (Pros y Contras)
- **Positivas:** 
  - Estabilidad absoluta de conexión: el backend conecta al instante de forma robusta e independiente de la red o DNS de la computadora local.
  - Mayor seguridad al gestionar las credenciales localmente mediante archivos `.env` ignorados por Git.
- **Negativas / Riesgos:**
  - La cadena de conexión extendida es más larga y requiere conocer explícitamente el ReplicaSet y Shards asignados por Atlas, lo cual requirió una ingeniería inversa corta pero efectiva desde la consola del sistema.
