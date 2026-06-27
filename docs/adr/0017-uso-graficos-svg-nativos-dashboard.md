# ADR 0017: Uso de Gráficos SVG Nativos en Angular para el Dashboard de Estadísticas

## Estado
Aceptado

## Contexto
El Dashboard de Estadísticas para los administradores requiere representar tres tipos de gráficos interactivos y adaptables (Barras, Línea de Área, y Donut circular) en función de un rango de fecha seleccionado. 

Frecuentemente, la integración de librerías externas de gráficos (como Chart.js o Ng2-charts) en proyectos con versiones recientes de Angular (como v21) introduce problemas de compatibilidad en el tipado, conflictos de dependencias de peer-dependencies, y sobrecarga en el peso final del bundle.

## Decisión
Se decide no utilizar librerías de gráficos externas. En su lugar, se implementan gráficos SVG nativos en Angular, manipulando directamente los atributos de renderizado (`viewBox`, `<rect>`, `<path>` para líneas y áreas, y `<circle>` con `stroke-dasharray` / `stroke-dashoffset` para la torta/donut).

## Consecuencias
- **Éxito de compilación al 100%**: Sin problemas de versiones incompatibles de dependencias externas.
- **Rendimiento**: Peso nulo de bundle adicional y velocidad extrema de renderizado directamente en el DOM.
- **Estética premium**: Control total de las transiciones CSS y del sistema de variables de color del proyecto (incluyendo gradientes y efectos hover en HSL).
- **Adaptabilidad**: Responsividad nativa mediante el uso correcto del viewBox en SVG.
