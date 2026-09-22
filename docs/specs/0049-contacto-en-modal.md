---
spec: 0049
fecha: 2026-09-21
estado: borrador
resumen: El boton del cierre de la Home deja de abrir mailto:EMAIL-PENDENTE y abre el formulario de contacto en un modal pensado para movil; el formulario se extrae a un componente reutilizable.
disjunta: si
archivos: src/components/{FormularioContacto,ModalContacto,HomeView,ContactView}.astro, src/lib/schemas.ts
---

# 0049 — El contacto en un modal

> **Esta spec queda en `borrador` a proposito.** Lo que pide el cliente se puede construir
> hoy, pero el formulario que va adentro **todavia no envia nada**, y eso es una decision
> que no es de esta spec. Ver "Abierto" antes de implementar.

## Problema

**El boton del cierre de la Home abre `mailto:EMAIL-PENDENTE`.** Esta escrito en
`HomeView.astro:195` y sale en las cuatro homes de produccion: al tocarlo se abre el cliente
de correo con `EMAIL-PENDENTE` como destinatario. Es el CTA final de la pagina principal.

Su bloque hermano —`trial`, el de la clase de prueba— ya paso a abrir un modal en la spec
0035 y el comentario del schema lo dice; este quedo atras.

El cliente eligio el destino: **el mismo formulario que tiene la pagina de contacto**, en un
modal **pensado para movil**.

## Alcance

**Entra:**

- **`FormularioContacto.astro`**: el formulario que hoy esta escrito dentro de
  `ContactView` se extrae a un componente con sus etiquetas como props. `/contactos` lo usa
  y **su HTML no cambia** — eso es lo que se verifica.
- **`ModalContacto.astro`**: un `<dialog>` con ese formulario adentro, **mobile first**:
  ancho completo y pegado abajo en movil, centrado y acotado en escritorio, con scroll
  interno si el teclado virtual come la pantalla, cierre por `Esc` y por el boton, y foco
  al primer campo al abrir.
- El boton del cierre de la Home abre ese modal. **Se borra el `mailto:`.**
- Los textos del modal salen del contenido que **ya existe**: `contact.formTitle` y
  `contact.fields.*` de cada idioma. No se crea ni un campo nuevo.

**No entra:**

- **Hacer que el formulario envie.** Ver "Abierto". Es lo que decide si esta spec sale.
- **El modal de `FormModal.astro`**, que carga un Google Form en un `<iframe>` y lo usan
  adultos, crianças, Iaido y Tai Chi. Ese no se toca: son formularios externos distintos.
- **Poner el modal en mas paginas.** Solo el cierre de la Home. El resto de los CTA ya
  tienen su destino.

## Diseño

El formulario de `/contactos` sale de la vista tal como esta —los cuatro campos, el boton y
la linea de aviso— y pasa a recibir sus textos por props. `ContactView` lo llama con lo
mismo que usaba, asi que **su HTML construido tiene que quedar identico**: es la señal que
prueba que la extraccion no cambio nada.

El modal reusa el mecanismo de `FormModal` (`<dialog>` + `showModal()`), que ya funciona en
las cuatro paginas de audiencia y no necesita JavaScript de terceros.

**Mobile first, concreto:** en movil el `<dialog>` va `w-full` pegado al borde inferior, con
`max-h-[90vh]` y `overflow-y-auto`, para que el teclado virtual no tape el boton. En
escritorio, centrado con `max-w-lg`. El titulo del `<dialog>` es `contact.formTitle`, que ya
esta traducido en los cuatro idiomas.

## Archivos

| Archivo | Acción |
|---|---|
| `src/components/FormularioContacto.astro` | crear (extraído de `ContactView`) |
| `src/components/ModalContacto.astro` | crear |
| `src/components/ContactView.astro` | editar (usa el componente) |
| `src/components/HomeView.astro` | editar (fuera el `mailto:`, entra el modal) |

### Disjunta?

**Sí** con 0045, 0046 y 0048. Toca `HomeView.astro`, que la 0047 también toca — si van
juntas, **0047 primero**.

## Verificación

- [ ] `astro check` 0/0/0, tests sin regresiones, build 44 rutas.
- [ ] **Cero `mailto:` en las 44 páginas construidas.** Hoy hay uno por home.
- [ ] Las 4 páginas de `/contactos` quedan **byte a byte iguales** tras extraer el
      formulario: la extracción no es un rediseño.
- [ ] El modal abre con el botón, cierra con `Esc` y con el botón, y el foco entra al primer
      campo y **no se escapa** del diálogo mientras está abierto.
- [ ] Capturas a **390 px de ancho** (móvil) y 1280 px: en móvil el botón de enviar queda
      visible con el teclado abierto — comprobado con la captura, no razonado.
- [ ] Los textos del modal están en los cuatro idiomas, sin cadenas nuevas en el código.

## Abierto — **hay que resolver esto antes de implementar**

**El formulario de contacto no envía nada.** Hoy su botón es
`<button type="button" disabled>` y debajo hay una línea que explica que el envío está
pendiente (`fields.pending`). Es así desde la spec 0014 y la 0042 lo dejó anotado.

Si esta spec se implementa tal cual, **el CTA principal de la Home abre un formulario con el
botón desactivado.** Es más honesto que el `mailto:` roto de hoy, pero no es una conversión.

Tres caminos, y hay que elegir uno:

1. **Hacer que envíe primero** (spec propia): endpoint, Resend —ya está en el stack por el
   ADR-0003—, protección contra spam y a qué dirección llega. Es la opción correcta y es la
   que convierte el pedido en algo útil. Ahora además hay un campo de email en Ajustes, que
   es la mitad del dato que faltaba.
2. **Implementar el modal ya**, aceptando que muestra el aviso de envío pendiente. Saca el
   `mailto:` roto de producción, que es una mejora real, y el modal queda listo para el día
   que el formulario funcione.
3. **Apuntar el botón al Google Form de la clase experimental** con el `FormModal` que ya
   funciona. Es lo único que convierte hoy mismo, pero cambia el significado del CTA: el
   cierre de la Home es "conocer el dojo", no "apuntarme a una clase de prueba".

**Mi recomendación: 1 y después 2**, y si urge tener algo que funcione esta semana, 2 sola
—porque quitar el `mailto:EMAIL-PENDENTE` de producción no debería esperar a una spec de
formularios.
