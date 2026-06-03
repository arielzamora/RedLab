# ADR 0008 - Sistema de Modales Personalizados para Feedback de Usuario

## Estado
Aceptado

## Contexto
Las funciones nativas del navegador como `alert()` o `confirm()` bloquean el hilo principal de ejecución de JavaScript, tienen un diseño visual plano que rompe la estética de la aplicación y empeoran la experiencia de usuario general. Se requiere un mecanismo de retroalimentación elegante y no bloqueante.

## Decisión
Se decidió prohibir el uso de alertas nativas del navegador e implementar un sistema de ventanas emergentes (modales) personalizados integrados en los propios componentes de Angular:
1. **Estructura HTML/CSS en Angular:** Cada pantalla (`Login`, `Registro`, `Publicaciones`, `MiPerfil`) expone un contenedor modal condicional (`showModal`) utilizando el sistema de clases de estilos globales `.modal-backdrop`, `.modal-content` y `.modal-header`.
2. **Animaciones Fluidas:** Se agregaron transiciones dinámicas CSS (`@keyframes modalFadeIn`) para suavizar la aparición del modal en pantalla.
3. **Manejo del Estado:** Métodos genéricos `openModal` y `closeModal` dentro de los componentes controlan dinámicamente el título, cuerpo y estado del modal.

## Consecuencias
- **Positivas:** Interfaz limpia, coherente con la identidad visual inspirada en redes sociales modernas.
- **Positivas:** Control absoluto sobre el diseño responsivo del cuadro de diálogo, garantizando legibilidad tanto en móviles como en computadoras.
- **Negativas:** Introduce una pequeña cantidad de código repetitivo de UI en los componentes que requieren notificar errores o éxitos, aunque altamente modular y reutilizable.
