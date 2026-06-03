# 0001 - Estructura Monorepo para NestJS (Backend) & Angular (Frontend)

**Fecha:** 2026-06-01  
**Estado:** Aceptado

## 1. Contexto y Problema
El desarrollo de la "Red Social" del TP requiere construir dos sistemas independientes que interactúen estrechamente: un backend de API RESTful y un cliente de interfaz gráfica (frontend). Era necesario elegir si gestionar estos proyectos en repositorios separados (multi-repo) o unificarlos en un solo espacio de trabajo (monorepo) de forma que facilite la instalación y la ejecución simultánea a los desarrolladores del equipo.

## 2. Decisión Tomada
Se eligió adoptar una arquitectura de **Monorepo** bajo la siguiente estructura:
1. **Unificación en raíz:** Se ubican las carpetas `/backend` y `/frontend` en el mismo directorio principal.
2. **Scripts Centralizados:** Se configuró el archivo `package.json` en la raíz del monorepo con scripts específicos de `npm` (como `start:frontend`, `start:backend` e `install:all`) para permitir correr y preparar todo el entorno de trabajo desde una sola consola.
3. **Control de versiones único:** Un solo archivo `.gitignore` y repositorio de Git general para todo el proyecto, facilitando el despliegue sincronizado del equipo.

## 3. Consecuencias (Pros y Contras)
- **Positivas:** 
  - Proceso de inducción al proyecto sumamente simple: un solo `git clone` descarga todo el ecosistema.
  - Ejecución fluida de dependencias desde una única consola.
  - Consistencia en el versionado: una rama de Git representa un cambio que incluye código tanto de backend como de frontend simultáneamente.
- **Negativas / Riesgos:**
  - El tamaño del repositorio puede incrementarse al almacenar las carpetas `node_modules` de ambos entornos, aunque se mitiga al estar debidamente ignorados por Git.
