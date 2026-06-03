# ADR 0009 - Arquitectura Angular basada en Componentes Standalone

## Estado
Aceptado

## Contexto
En versiones anteriores de Angular, el uso de `NgModule` era obligatorio, lo que incrementaba el acoplamiento y dificultaba la carga perezosa (lazy loading) limpia de componentes individuales. Angular 21 permite omitir por completo los módulos tradicionales a favor de componentes autocontenidos.

## Decisión
Se decidió construir el frontend de la red social usando exclusivamente la arquitectura de **Standalone Components**:
1. **Configuración Global:** `app.config.ts` declara los proveedores comunes (rutas, cliente HTTP, interceptores) para toda la aplicación usando `provideRouter` y `provideHttpClient` en lugar de importar módulos globales.
2. **Importaciones Explícitas:** Cada componente de Angular (`Login`, `Registro`, `Publicaciones`, `MiPerfil`, `PostCard`) declara sus propias dependencias en su metadato `@Component({ standalone: true, imports: [...] })` (por ejemplo, `FormsModule`, `CommonModule`, `RouterLink`).
3. **Facilidad de Integración:** Permite reutilizar componentes atómicos como `PostCard` directamente importándolo en otros componentes de manera transparente.

## Consecuencias
- **Positivas:** Simplificación drástica de la base de código eliminando archivos `*.module.ts` innecesarios.
- **Positivas:** Mayor facilidad de mantenimiento y mejor rendimiento de compilación y carga al tener dependencias declaradas a nivel de componente.
