# TP Red Social - Monorepo

Este proyecto es una red social de alta fidelidad diseñada siguiendo lineamientos modernos de UX/UI inspirados en Facebook. Está implementado como un **Monorepo** que integra un backend robusto y escalable en **NestJS** con un frontend interactivo y rápido en **Angular**.

### 🌐 Demo en Producción
Puedes acceder a la versión desplegada en vivo a través del siguiente enlace:
👉 **[utnLab - Enlace de Despliegue](https://zealous-wave-07377ba0f.7.azurestaticapps.net/)**

---

## 🚀 Arquitectura y Tecnologías

El proyecto se divide de forma limpia en dos directorios principales:

*   **[`backend/`](file:///C:/Repos/Progra4-2026/red-social/backend)**: Desarrollado en **NestJS 11**, utiliza **Mongoose** como ORM para la integración transparente con **MongoDB Atlas** (en la nube). Implementa seguridad con hashing de contraseñas vía **bcrypt** y sesiones de usuario con **JWT (JSON Web Tokens)**.
*   **[`frontend/`](file:///C:/Repos/Progra4-2026/red-social/frontend)**: Desarrollado en **Angular 21**, utiliza una estructura moderna basada en **Standalone Components**, controladores reactivos y sistemas de estilos personalizados por variables HSL en Vanilla CSS.

---

## 🛠️ Comandos de Ejecución (Monorepo)

Desde la carpeta raíz del proyecto (`red-social`), puedes gestionar y correr ambas aplicaciones de manera centralizada sin necesidad de navegar manualmente entre carpetas:

### 1. Instalación Inicial de Dependencias
Instala todas las dependencias del frontend y del backend con un solo comando:
```bash
npm run install:all
```

### 2. Iniciar el Backend (NestJS)
Levanta el servidor backend en modo desarrollo (escuchando en el puerto `3000` y conectándose a MongoDB Atlas):
```bash
npm run start:backend
```

### 3. Iniciar el Frontend (Angular)
Levanta el servidor de desarrollo de Angular (disponible en `http://localhost:4200`):
```bash
npm run start:frontend
```

---

## 📝 Decisiones de Arquitectura (ADR)

Siguiendo las mejores prácticas de la industria, registramos de manera transparente las decisiones de arquitectura que tomamos en este proyecto. Puedes ver los detalles en la carpeta de documentación de decisiones de arquitectura:

*   **[ADR 0001 - Estructura Monorepo NestJS & Angular](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0001-arquitectura-monorepo-nestjs-angular.md)**: Adopción del esquema monorepo con scripts centralizados.
*   **[ADR 0002 - Integración Directa a MongoDB Atlas sin DNS SRV](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0002-integracion-directa-mongodb-atlas.md)**: Configuración en `.env` mediante formato de shards directo para evadir fallos de resolución de DNS de Node.js.
*   **[ADR 0003 - Seguridad y Sesiones: Hashing con bcrypt y Tokens JWT](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0003-autenticacion-jwt-hashing-bcrypt.md)**: Implementación de encriptación de credenciales en base de datos y control de sesión con expiración.
*   **[ADR 0004 - Carga de Imágenes de Perfil con Multer y Almacenamiento Local](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0004-carga-imagenes-multer-almacenamiento-local.md)**: Almacenamiento de archivos con Multer en el backend, servicio estático y generación de URLs dinámicas absolutas.
*   **[ADR 0005 - Inyección Automática de JWT con Interceptores HTTP en Angular](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0005-interceptores-http-angular-sesion-global.md)**: Automatización de cabeceras de autorización mediante un interceptor funcional en Angular.
*   **[ADR 0006 - Autorización por Roles para la Eliminación de Publicaciones](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0006-autorizacion-roles-borrado-publicaciones.md)**: Control de accesos multinivel en frontend y backend para permitir la eliminación de posts por autor o administrador.
*   **[ADR 0007 - Validaciones Robustas en Formularios de Registro y Login](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0007-validaciones-robustas-formularios.md)**: Validación dual cliente/servidor para la complejidad de contraseñas e integridad de datos.
*   **[ADR 0008 - Sistema de Modales Personalizados para Feedback de Usuario](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0008-sistema-modal-feedback-usuario.md)**: Implementación de modales personalizados en reemplazo de las alertas nativas bloqueantes del navegador.
*   **[ADR 0009 - Arquitectura Angular basada en Componentes Standalone](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0009-diseño-arquitectura-standalone-angular.md)**: Migración hacia componentes independientes autogestionados y desuso de NgModules globales.
*   **[ADR 0010 - Modelo de Comentarios Embebidos en Publicaciones](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0010-modelo-comentarios-embebidos-publicaciones.md)**: Diseño y persistencia de comentarios en un subdocumento embebido dentro del esquema de publicaciones.
*   **[ADR 0011 - Paginación y Ordenamiento mediante Agregaciones](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0011-paginacion-ordenamiento-publicaciones-agregacion.md)**: Consultas avanzadas de agregación en MongoDB para ordenar dinámicamente publicaciones por fecha o cantidad de likes.
*   **[ADR 0012 - Carga de Imágenes en Publicaciones con Multer](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0012-carga-imagenes-publicaciones-multer.md)**: Implementación inicial de carga de archivos en el feed usando Multer en local.
*   **[ADR 0013 - Almacenamiento en Azure Blob Storage](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0013-almacenamiento-imagenes-azure-blob-storage.md)**: Integración híbrida con Azure Blob Storage y fallback a almacenamiento local según el entorno.
*   **[ADR 0014 - Autenticación Segura con Cookies HttpOnly](file:///C:/Repos/Progra4-2026/red-social/docs/adr/0014-autenticacion-cookies-seguras-httponly.md)**: Implementación de sesiones robustas basadas en cookies HttpOnly SameSite=None para seguridad mejorada contra ataques XSS.
*   **[ADR 0015 - Duración de Sesión Corta y Refresco de Token](file:///c:/Repos/Progra4-2026/red-social/docs/adr/0015-autenticacion-duracion-sesion-refresco-token.md)**: Expiración corta de 15 minutos en JWT/cookies, temporizador proactivo de 10 minutos y refresco interactivo de token.
*   **[ADR 0016 - Paginación y Edición de Comentarios Embebidos](file:///c:/Repos/Progra4-2026/red-social/docs/adr/0016-paginacion-edicion-comentarios.md)**: Carga incremental de comentarios de 5 en 5, orden cronológico descendente y actualización del estado de edición inline.
