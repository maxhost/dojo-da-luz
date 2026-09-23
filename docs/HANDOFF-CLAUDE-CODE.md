# Handoff — rediseño mobile-first del administrador (2026-09-22)

Este corte deja rediseñados el acceso, la navegación y todos los editores de páginas del
backoffice. Los cambios están **sin commit y sin desplegar**. El estado funcional general
del proyecto y la deuda de producto siguen viviendo en `docs/TASKS.md`.

## Qué se hizo

### Login y shell del administrador

- Login centrado, compacto y táctil, separado visualmente del panel autenticado.
- Sidebar oscuro permanente en escritorio con las 14 secciones reales del admin.
- Drawer accesible en móvil: abre desde la barra superior y cierra con botón, fondo o
  `Escape`.
- Estado activo, email y cierre de sesión integrados en el sidebar.
- La portada `/admin` dejó de duplicar todo el menú y ahora funciona como bienvenida y
  explicación breve.
- El área de trabajo pasó a un contenedor más amplio (`max-w-5xl`).

Archivos centrales: `src/layouts/Admin.astro`, `src/pages/admin/entrar.astro` y
`src/pages/admin/index.astro`.

### Patrón común para los editores de páginas

Se aplicó el mismo patrón a Home, Aulas, Adultos, Crianças, Aikido, O dojo, Eventos,
Outras artes, Escolas, Professor y Contactos:

- cabecera editorial uniforme;
- selector de idiomas fijo, abreviado en móvil;
- cambio de idioma sin perder campos todavía no publicados;
- selector «Ir a una sección» en móvil;
- mini sidebar de secciones fijo en escritorio;
- secciones en tarjetas blancas con jerarquía clara;
- acción de publicación flotante al pie;
- avisos consistentes sobre lo que solo se cambia en portugués;
- controles y áreas táctiles pensados desde móvil.

`src/components/admin/NavegacionEditor.astro` es el componente nuevo que centraliza el
mini sidebar y el selector móvil. `EditorPestanas.astro` centraliza el selector de idiomas
para casi todos los editores; Home conserva su montaje específico porque también publica
media y parcerías por flujos separados.

### Controles compartidos

- `CampoTexto.astro`: controles de al menos 44 px, foco visible, bordes y errores más
  claros.
- `CampoImagen.astro`: miniaturas responsivas, botones más grandes y mejor estado visual.
- `TablaFilas.astro`: filas como tarjetas, inputs móviles y acciones «Añadir/Quitar» más
  explícitas.
- `TablaMedios.astro`: tarjetas de imagen/vídeo, previews responsivas y controles táctiles.
- `EditorParcerias.astro`: rejilla y botones alineados con el sistema nuevo.

La lógica de publicación, validación, concurrencia, propagación desde portugués y subida
de imágenes no se cambió.

## Cobertura comprobada

Una búsqueda final sobre `src/pages/admin/paginas` y sus formularios confirmó que ningún
editor editorial conserva la estructura visual anterior. Los formularios que aún usan el
estilo original son otras áreas del backoffice:

- `FormularioAjustes.astro` (`/admin/ajustes`);
- `FormularioDojo.astro` (alta y edición de fichas en `/admin/dojos`).

Esos dos son el siguiente frente natural si se quiere que **todo** el backoffice, no solo
los editores de páginas, comparta el patrón.

## Estado del árbol de trabajo

Hay 31 archivos modificados y un archivo nuevo. Todo pertenece a este rediseño; no hay
commit creado. Antes de continuar, revisar con:

```sh
git status --short
git diff --check
git diff --stat
```

No hacer reset ni descartar: el conjunto completo es intencional y las piezas compartidas
dependen unas de otras.

## Verificación ejecutada

```sh
npm run typecheck   # 123 archivos, 0 errores / 0 warnings / 0 hints
npm test            # 53/53
npm run build       # build server de Vercel completo
git diff --check    # limpio
```

No hay script `lint` en `package.json`. No se hizo commit, push ni deploy en este corte.

## Cómo seguir

1. Implementar la **spec 0050**, cerrada, siguiendo el ADR-0046. Codex deja la UI base en
   `ContactForm.astro` y `FormModal.astro`; Claude Code implementa la entidad, el CRUD, la
   propagación de traducciones, las referencias `formId`, el endpoint y Resend. No derivar
   opciones de horarios desde Dojos: son texto independiente administrado en el formulario.
2. Revisar visualmente los editores en móvil real o emulación estrecha, sobre todo listas
   largas, galería y la barra flotante de publicación.
3. Si el patrón queda aprobado, aplicarlo a `/admin/ajustes` y a crear/editar Dojos.
4. Crear un commit único del sistema visual del admin o separarlo en dos commits:
   `shell/login` y `editores mobile-first`.
5. Después del deploy, comprobar login, drawer móvil, cambio de idioma sin pérdida y una
   publicación de prueba en portugués y otra traducción.
