---
adr: 0046
fecha: 2026-09-22
estado: aceptada
resumen: Los formularios son una entidad global reutilizable relacionada por formId; portugués manda la estructura, los otros idiomas traducen, y las opciones son texto propio del formulario sin depender de Dojos.
---

# 0046 — Formularios reutilizables como entidad

## Contexto

Los CTA de aula experimental apuntaban a formularios externos mediante `formUrl`. El
formulario de Contactos estaba escrito dentro de su vista y no enviaba. El primer reemplazo
visual extrajo un formulario local, pero el sitio todavía no tiene una entidad que permita
a una persona no técnica crear formularios, definir sus campos o asignarlos a botones.

El formulario de aula experimental necesita horarios seleccionables. Aunque el sitio tiene
horarios estructurados de Dojos, el cliente decidió expresamente que **los horarios del
formulario son independientes**: pueden estar correctos aunque el contenido editorial esté
desactualizado, y viceversa.

## Decisión 1 — formulario como entidad, botón como referencia

Los formularios viven en `content/forms.json`, igual que Dojos, medios y parcerías son
entidades compartidas. Cada formulario tiene un `id` técnico estable, generado al crearlo,
y un `nombre` interno visible solo en el backoffice.

Los botones no guardan URLs ni copias del formulario. Guardan `formId`. En el editor de la
página el administrador elige por nombre y el JSON conserva el ID. Renombrar un formulario
no rompe las páginas que lo usan.

Archivar impide nuevas asignaciones, pero no borra el formulario ni rompe una asignación
existente. El backoffice debe advertir dónde se usa antes de archivarlo.

## Decisión 2 — portugués manda la estructura

Se conserva el patrón de los editores actuales:

- en Português se crean, eliminan y ordenan campos y opciones;
- allí se decide tipo, obligatoriedad y presentación;
- al guardar, la estructura se propaga a español, francés e inglés;
- cada pestaña traduce labels, ayudas, opciones, botón y confirmación;
- propagar estructura nunca pisa una traducción existente;
- un elemento nuevo nace en los otros idiomas con el texto portugués y marca «sin
  traducir».

Los IDs de campos y opciones son estables y no visibles. Son lo que permite reordenar y
traducir sin relacionar elementos por posición ni por texto.

## Decisión 3 — catálogo cerrado de campos, cantidad libre

No se construye un lenguaje de formularios. Los tipos permitidos son:

- `text` — texto corto;
- `textarea` — texto largo;
- `email`;
- `tel`;
- `number`;
- `date`;
- `singleChoice` — selección única;
- `multipleChoice` — selección múltiple.

Cada campo tiene label, ayuda opcional, posición y `required`. Los campos de selección
tienen una lista ordenable de opciones de texto, sin límite de cantidad. El administrador
elige la presentación:

- `singleChoice`: `radio` o `select`;
- `multipleChoice`: `checkbox` o `multiSelect`.

El sistema no decide la presentación según el número de opciones y no consume horarios,
direcciones ni ninguna otra entidad. «Horarios» es solo un label y sus opciones son texto
propio del formulario.

## Decisión 4 — contenido en archivo, envíos sin persistencia

La definición pertenece al contenido versionado y se publica por el mismo camino de GitHub
que el resto del backoffice. Las respuestas **no** se guardan en el repositorio ni en una
tabla de negocio: el servidor valida contra la definición publicada y entrega el mensaje
por Resend.

El destinatario y remitente son configuración del deployment:

- `FORM_TO_EMAIL` — casilla administrativa;
- `FORM_FROM_EMAIL` — remitente de un dominio verificado;
- `RESEND_API_KEY` — secreto del servidor.

El email escrito por el visitante se usa como `replyTo`, nunca como `from`. El cliente no
recibe ni conoce la API key ni el destinatario configurado.

## Consecuencias

- Una opción de horario puede diferir de Dojos a propósito; actualizar una no toca la otra.
- Una página puede cambiar de formulario sin cambiar el componente público.
- Un mismo formulario puede ser usado por varios CTA.
- El servidor no acepta campos definidos por el navegador: carga `formId`, valida IDs,
  tipos, opciones y obligatoriedad, y rechaza el resto.
- Si más adelante se necesita historial, CRM, adjuntos, lógica condicional o destinatarios
  por formulario, será otra decisión. Ninguno entra en esta entidad inicial.

