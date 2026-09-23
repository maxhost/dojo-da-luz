---
adr: 0047
fecha: 2026-09-22
estado: aceptada
resumen: Un formulario asignado a una pagina no se puede archivar — el boton queda deshabilitado y el POST responde 409 —, y por eso una asignacion siempre apunta a un formulario activo.
---

# 0047 — Archivar un formulario solo si no lo usa nadie

## Contexto

El ADR-0046 decidio lo contrario: *"Archivar impide nuevas asignaciones, pero no borra el
formulario ni rompe una asignacion existente. El backoffice debe advertir donde se usa
antes de archivarlo."* Este ADR **supersede ese parrafo**; el resto del 0046 sigue vigente.

Al implementarlo aparecio el costo de esa permisividad: si un CTA puede apuntar a un
formulario archivado, cada pantalla que muestra un formulario tiene dos estados validos
—activo y archivado-pero-en-uso— y hay que decidir en cada una que hacer con el segundo.
El selector del editor tenia que ofrecer la opcion archivada solo si era la asignada y
etiquetarla, la pestaña traducida tenia que pintar un nombre de un formulario que ya no
esta en el listado activo, y el listado tenia que explicar un aviso que no impedia nada.
Nada de eso le sirve a la persona que administra el sitio: archivar un formulario que un
boton publico esta usando no tiene ningun caso de uso legitimo — es un error.

## Decision

Archivar es una operacion **condicionada**: se permite solo si ninguna pagina referencia
ese `formId`.

- El listado deshabilita el boton «Archivar» de un formulario en uso y dice por que.
- El POST a `/admin/formularios/<id>/archivar` valida igual y responde **409** con el
  aviso que nombra las paginas que hay que cambiar primero. El boton deshabilitado es
  comodidad; la regla vive en el servicio.
- La lectura de referencias que decide el bloqueo es **estricta**: si un archivo de
  contenido no se puede leer, el archivado falla en vez de suponer que no hay usos. El
  listado sigue siendo tolerante — un archivo ilegible no puede dejar la pantalla en
  blanco.

Reactivar no se condiciona: nunca rompe nada.

## Consecuencias

- Una asignacion valida apunta **siempre** a un formulario activo. El selector del editor
  ofrece solo activos y no necesita el caso «archivado pero asignado».
- Para retirar un formulario hay un orden: primero reasignar los botones, despues
  archivar. Es un paso mas, y es el que evita el modal vacio en produccion.
- El bloqueo se lee del **portugues**: el `formId` se siembra desde ahi a los otros tres
  idiomas, asi que las cuatro copias dicen lo mismo.
- Si algun dia una pagina puede quedarse sin formulario —un CTA opcional—, la regla no
  cambia: esa pagina deja de referenciarlo y recien entonces se archiva.
