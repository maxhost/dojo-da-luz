---
spec: 0031
fecha: 2026-09-21
estado: cerrada
resumen: Los logos de parceiros salen de `HomeView.astro` y pasan a `content/partners.json`, editables en cantidad libre desde la seccion 06 del editor de Home, con subida a R2 por fila.
disjunta: si
archivos: content/partners.json, src/lib/partners.ts, src/lib/partners-edicion.ts, src/components/admin/EditorParcerias.astro, src/components/HomeView.astro, src/pages/admin/paginas/home.astro
---

# 0031 — Parcerias editables desde el backoffice

## Problema

La seccion "06 · Parcerias" del editor de Home solo deja tocar el rotulo y el titulo. Los
ocho logos que la Home pinta debajo son una constante `PARTNERS` en
`src/components/HomeView.astro`: sumar un parceiro, cambiarle el logo o sacar uno que ya no
lo es exige editar un componente y desplegar. El cliente no puede hacer ninguna de las tres.

Y los archivos son los de Wix (`static.wixstatic.com`), igual que el resto del media: el dia
que esa cuenta se cierre, la seccion queda con ocho imagenes rotas.

## Alcance

**Entra:**

- `content/partners.json`: la lista, compartida por los cuatro idiomas (ADR-0027). Se migran
  los ocho logos actuales tal cual estan, incluidas las dos ampliaciones que hoy son clases
  de Tailwind —`scale-[1.45]` en el logo "55+" y `scale-[2.25]` en el ultimo— como
  `escala: 1.45` y `escala: 2.25`.
- `src/lib/partners.ts`: el schema zod y la lectura validada en el build, igual que
  `dojos.ts`.
- `src/components/HomeView.astro`: la rejilla lee la lista en vez de la constante. Cero
  parceiros = la seccion no se pinta.
- `src/lib/partners-edicion.ts`: leer y guardar contra `content/partners.json`, con sha.
- `src/components/admin/EditorParcerias.astro`: la lista editable dentro de la seccion 06,
  en su propio `<form>`.
- `src/pages/admin/paginas/home.astro`: atiende ese POST ademas del de cada idioma.
- **Cantidad libre.** El formulario pinta siempre una fila vacia de mas: llenarla agrega.
  Vaciar el nombre y la direccion de una fila la borra. Es el patron que ya usa
  `EditorHorarios` y no necesita JavaScript.

**No entra:**

- **Reordenar con flechas o arrastrando.** El orden es el de la lista y se cambia editando
  los campos. Con ocho filas a la vista, un control de orden es mas cosas que romper que
  valor.
- **Borrar de R2.** Sacar un parceiro de la lista deja su imagen en el bucket (spec 0030).
- **Enlace al sitio del parceiro.** Hoy los logos no son enlaces; hacerlos enlazables es
  contenido nuevo y decision del cliente, no de esta spec.
- Parcerias en otras paginas. Es una seccion de la Home.

## Diseño

**Un archivo compartido y un formulario aparte.** El editor de Home publica **un idioma por
POST**, contra `content/<locale>/home.json` y con el `sha` de ese archivo. Los parceiros son
un quinto archivo sin idioma: van en su propio `<form>`, con su propio `sha` y su propio
commit. El POST se distingue por un campo oculto `formulario=parcerias`; el del idioma sigue
llegando con `idioma`.

**Los campos de una fila.** `nombre` —lo que se lee como `alt`, que es lo unico que ve quien
navega sin ver— , `src` —la direccion de la imagen, con el `CampoImagen` de la spec 0030, o
sea pegar, subir a R2 o elegir de la galeria— y `escala`, un numero opcional para el logo que
trae aire de mas. Nada de clases de CSS: el editor no edita estructura (ADR-0026).

**Fila vacia = fila que no existe.** `filas()` de `forms.ts` ya devuelve las filas indexadas
y `vacia()` descarta las que no se llenaron. Agregar es escribir en la ultima; borrar es
vaciar. La consecuencia buscada: **no hay boton de borrar que se pueda apretar sin querer**,
y no hace falta confirmacion.

**La validacion es la misma del build.** El POST arma la lista, la valida con el schema de
`partners.ts` y, si falla, no publica nada y devuelve los errores por fila. Es lo que ya hace
el editor de Home con `homeSchema`.

**Escala como numero, no como clase.** El render aplica `style="transform: scale(N)"` cuando
hay `escala`. Una clase de Tailwind armada en runtime no sobrevive al purgado, y ademas
seria pedirle CSS al cliente.

## Archivos

| Archivo | Accion |
|---|---|
| `content/partners.json` | crear — los ocho logos actuales |
| `src/lib/partners.ts` | crear — schema y lectura validada |
| `src/lib/partners-edicion.ts` | crear — leer y guardar con sha |
| `src/components/admin/EditorParcerias.astro` | crear — la lista editable |
| `src/components/HomeView.astro` | editar — la rejilla lee el JSON |
| `src/pages/admin/paginas/home.astro` | editar — atiende el POST de parcerias |
| `src/lib/forms.ts` | editar — armar la lista desde el `FormData` |
| `src/lib/partners.test.ts` | crear — la frontera de la fila vacia |
| `src/components/admin/CampoImagen.astro` | editar — `requerido` opcional: la fila de mas esta vacia |

### Disjunta?

**Si.** La unica spec abierta es la 0030, cuyos archivos son `src/lib/{r2,medios}.ts` y
`src/pages/admin/medios/**`. Esta spec consume el `CampoImagen` de la 0030 y le agrega una
prop —`requerido`, que por defecto sigue siendo `true`—: la 0030 ya esta implementada, asi
que es un cambio compatible, no una colision.

## Verificacion

Hecho:

- [x] `astro check` 0/0/0, `npm test` **17/17** (6 nuevos) y `npm run build` con las 44 rutas.
- [x] **La Home construida no cambia**: la seccion sigue teniendo los mismos ocho `<img>`,
      con los mismos `src` y los mismos `alt`, y las dos ampliaciones ahora salen como
      `style="transform: scale(1.45)"` y `scale(2.25)` en vez de clases de Tailwind.
- [x] **Cero parceiros = ninguna seccion**: con `content/partners.json` en `[]`, el HTML
      construido de la portada no tiene `id="parcerias"`. Con los ocho, lo tiene una vez.
- [x] La fila vacia del final no se publica; vaciar una del medio borra esa y no corre a las
      de abajo; `1,45` se guarda como `1.45`; una escala ilegible falla en el schema con la
      ruta `0.escala` en vez de desaparecer en silencio.
- [x] `/admin/paginas/home` sigue redirigiendo a `/admin/entrar` sin sesion, y la portada en
      `astro dev` pinta la seccion leyendo el JSON.

Pendiente, necesita una sesion del backoffice:

- [ ] Agregar un parceiro con una imagen subida a R2 deja una fila mas en
      `content/partners.json` en `main` y el logo aparece en la Home publicada.
- [ ] Vaciar una fila la saca del JSON y de la Home.
- [ ] Dos pestañas abiertas: la segunda en publicar recibe el aviso de conflicto y no pisa
      nada.

## Abierto

- **La verificacion en el BO necesita una sesion y no se puede hacer desde esta maquina.**
  No hay forma de entrar sin contraseña, y `.env` no se lee desde el agente. El camino de
  datos —leer el formulario, validar, detectar que no hubo cambios, detectar conflicto de
  `sha`— esta cubierto por tests; lo que falta es apretar el boton.
- **Nada mas bloqueante.** Queda anotado para cuando el cliente lo pida: hoy los logos no
  enlazan al sitio del parceiro, y las imagenes siguen siendo las de Wix hasta que alguien
  las vuelva a subir desde el BO —lo cual esta spec recien hace posible.
