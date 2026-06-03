# TP Red Social - Monorepo

Este proyecto es una red social de alta fidelidad diseñada siguiendo lineamientos modernos de UX/UI inspirados en Facebook. Está implementado como un **Monorepo** que integra un backend robusto y escalable en **NestJS** con un frontend interactivo y rápido en **Angular**.

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
