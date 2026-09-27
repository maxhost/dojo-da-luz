---
spec: 0063
fecha: 2026-09-27
estado: cerrada
resumen: /contactos deja su formulario de maqueta y pinta la entidad «contacto» de content/forms.json, que envia por el mismo endpoint y Resend que los modales; el editor de Contactos elige el formulario con un selector
disjunta: si
archivos: content/forms.json, content/*/contact.json, src/lib/{schemas,contactos-edicion,traduccion,formularios-edicion}.ts, src/components/ContactView.astro, src/components/ContactForm.astro (borrado), src/components/admin/FormularioContactos.astro, src/pages/admin/paginas/contactos.astro
---

# 0063 — El formulario de /contactos envia por Resend

## Problema

`/contactos` tenia su propio formulario (`ContactForm.astro`) con el boton apagado a proposito y
el aviso «Envio pendente de configuração do email do dojo»: no estaba conectado a nada. Los
demas formularios del sitio ya envian por la entidad de la spec 0050. Plan aprobado por el
cliente el 2026-09-27, incluido el mensaje de confirmacion.

## Alcance

**Entra:**
- Formulario nuevo `contacto` («Contacto») en `content/forms.json`, activo: Nome (texto),
  Email (email), Assunto (texto), Mensagem (texto largo), los cuatro obligatorios, con las
  etiquetas y el boton que ya existian en los cuatro idiomas. Confirmacion: pt «Obrigado pela
  tua mensagem. Respondemos em breve.», es «Gracias por tu mensaje. Te respondemos pronto.»,
  fr «Merci pour ton message. Nous te répondons bientôt.», en «Thanks for your message. We'll
  get back to you soon.».
- `contact.json` (x4): `fields` sale, entra `formId: "contacto"`. Schema, `contactosDesdeForm`
  y `SEMBRADOS_CONTACTOS = ['formId']` (se elige en portugues y se siembra).
- `ContactView.astro` pinta `formTitle` + `FormularioPublico` (el de los modales). Un `formId`
  inexistente rompe el build, como en `FormModal`.
- Editor de Contactos: las 6 etiquetas se cambian por el selector `CampoFormulario`.
- `PAGINAS_CON_FORMULARIO` suma Contactos: aparece en «Se usa en…» y no deja archivar
  «Contacto» mientras la pagina lo use.
- `ContactForm.astro` se borra.

**No entra:** cambios al endpoint, a Resend o al limite de envios.

## Verificacion

- [x] `npm test` 110/110 y `npm run build` en verde.
- [x] HTML construido contra `HEAD` (worktree, hash del CSS neutralizado): cambian exactamente
      las 4 paginas de contacto y ninguna otra de las 44.
- [x] En las 4: `data-form-id="contacto"`, los 4 campos, confirmacion en su idioma, sin el
      aviso de envio pendiente.
- [x] `validarEnvio` + `componerEmail` con la entidad: envio valido con `replyTo` del visitante;
      rechaza mensaje vacio, email invalido y campo inventado.
- [x] Chromium, endpoint simulado, `/contactos` y `/es/contacto`: el POST lleva `formId`,
      `locale` y `source`; se oculta el formulario y aparece la confirmacion.
- [x] Copia temporal del editor de Contactos (sin login, modo disco): selector con «Contacto»,
      sin las etiquetas viejas; publicar portugues rearma los 4 `contact.json` byte a byte
      («No había cambios: no se publicó nada.»).
- [ ] El cliente manda un mensaje real desde `/contactos` en produccion y le llega al Gmail.
