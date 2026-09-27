---
spec: 0059
fecha: 2026-09-27
estado: cerrada
resumen: Boton «Copiar» en /admin/formularios que publica un duplicado activo «<nombre> (copia)» con id nuevo, las cuatro traducciones y sin paginas asignadas, y abre su editor
disjunta: si
archivos: src/lib/formularios-copia.ts, src/lib/formularios-copia.test.ts, src/lib/formularios-edicion.ts, src/lib/formularios-edicion.test.ts, src/pages/admin/formularios/index.astro, src/pages/admin/formularios/[id]/copiar.ts, src/pages/admin/formularios/[id].astro
---

# 0059 — Copiar un formulario

## Problema

Para armar un formulario parecido a uno existente hay que crearlo de cero, campo por campo, y
volver a traducirlo a tres idiomas. El cliente pidio el 2026-09-27 un «Copiar» en el listado.
Layout aprobado por el cliente en el chat antes de implementar (regla de CLAUDE.md para UI).

## Alcance

**Entra:**
- Boton **Copiar** en cada tarjeta de `/admin/formularios`, activos y archivados, junto a
  Archivar/Reactivar y con su mismo estilo.
- `POST /admin/formularios/<id>/copiar` (con el `sha` del listado) publica **de inmediato** un
  formulario nuevo:
  - `nombre`: `<nombre original> (copia)`; el cliente lo edita despues.
  - `id`: `idDesdeNombre(nombre de la copia, ids existentes)` — nunca repite uno existente.
  - `estado`: `activo` (decision del cliente). Ninguna pagina lo referencia: el sitio publico
    no cambia.
  - campos, opciones, textos del boton y mensaje de exito **en los cuatro idiomas**, iguales al
    original. Los ids de campos y opciones se conservan: son locales a cada formulario.
- Exito: redirect `303` al editor de la copia con `?copiado=si` y el aviso «Copia creada.
  Estás editando la copia: el original no cambió.»
- Fallo (sha viejo, original inexistente, repo caido): redirect `303` al listado con
  `?fallo=<motivo>`, igual que Archivar.

**No entra:**
- Copiar asignaciones a paginas, o elegir nombre/estado antes de copiar.
- Cambios en el sitio publico o en el endpoint de envio.

## Diseño

- `copiaDe(original, idsExistentes)` — pura, en `formularios-copia.ts` (archivo aparte: `formularios-edicion.ts` pasaba el limite de 300 lineas del hook): `structuredClone`
  del original con `id`, `nombre` y `estado` nuevos. Testeable sin red.
- `copiarFormulario(id, sha)` — lee la lista, 404 si el original no esta, arma la copia y
  publica con `publicarLista` (mismo camino que alta/archivado): valida el archivo entero con
  `formulariosSchema` y rechaza con 409 si el `sha` cambio. **Doble clic**: el segundo POST
  llega con el `sha` viejo y da conflicto; no se crean dos copias. Como el navegador mostraria
  la respuesta del segundo (el error) y no la del primero, el boton **se deshabilita al
  enviar** («Copiando…») y se rehabilita en `pageshow` (volver con Atras).
- `idDesdeNombre` recorta a 48 **antes** de limpiar guiones: al reves, un nombre largo con
  «(copia)» dejaba un id terminado en `-` (hallazgo de la revision; afecta tambien al alta).
- Commit: `contenido: copia del formulario <id original> desde el backoffice`.

## Archivos

| Archivo | Accion |
|---|---|
| `src/lib/formularios-copia.ts` | crear: `copiaDe` y `copiarFormulario` |
| `src/lib/formularios-copia.test.ts` | crear: tests de `copiaDe` |
| `src/lib/formularios-edicion.ts` | editar: exportar `publicarLista` y `sinRepositorio`; orden recorte/limpieza en `idDesdeNombre` |
| `src/lib/formularios-edicion.test.ts` | editar: test del id sin guion final |
| `src/pages/admin/formularios/[id]/copiar.ts` | crear: endpoint POST |
| `src/pages/admin/formularios/index.astro` | editar: boton Copiar |
| `src/pages/admin/formularios/[id].astro` | editar: aviso `?copiado=si` |

### Disjunta?

Ninguna spec abierta toca estos archivos. Disjunta.

## Verificacion

- [ ] Tests de `copiaDe`: id nuevo y distinto aunque ya exista una copia; nombre con
      «(copia)»; estado activo aunque el original este archivado; traducciones identicas; el
      original no se muta; la lista resultante valida con `formulariosSchema`.
- [ ] `copiarFormulario` y el endpoint corridos de verdad en modo `disco` sobre un worktree:
      el archivo gana exactamente un formulario, el original queda byte a byte igual, el
      redirect va a `?copiado=si`; con `sha` viejo (doble clic) va a `?fallo=` y no escribe.
- [ ] `npm test` y `npm run build` en verde.
- [ ] En el BO real (lo hace el cliente, login): el boton aparece, copia y abre el editor.

## Abierto

Nada.
