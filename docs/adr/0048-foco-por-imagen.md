---
adr: 0048
fecha: 2026-09-25
estado: aceptada
resumen: Las imagenes en riesgo de recorte mal encuadrado guardan un punto focal (object-position) elegido con un clic, no un recorte real — mas simple, no destructivo y sirve para cualquier caja donde se use la misma imagen.
---

# 0048 — Foco por imagen, no recorte real

## Contexto

Las fotos de `/dojo` y `/professor-pablo-duran` recortaban la cara: son archivos
verticales subidos por el BO, metidos en cajas horizontales con `object-cover` y sin
`object-position`, que por default recorta centrado. Se arreglo con `object-top` fijo en
esas tres imagenes (spec previa a esta, sesion del 2026-09-25).

Auditando el resto del sitio para el mismo problema aparecio el caso que este ADR
resuelve: las tarjetas de `/eventos` **no son retratos, son flyers de diseño libre** con
texto y logos en cualquier parte del cuadro. Bajando y simulando el recorte real de las
cuatro:

- La foto de Franck Noël en Praga **esta rota hoy**: el recorte centrado deja solo el
  cuello, sin cara. `object-top` la arregla.
- La foto de Franck Noël en Valencia **esta bien hoy**: el recorte centrado muestra el
  retrato completo. El mismo `object-top` la rompe — arriba queda solo el titulo en
  blanco, la foto entera desaparece del recuadro.

Un valor de CSS fijo por pagina no puede acertar las dos a la vez porque cada flyer pone
la foto en un lugar distinto del diseño. El problema no es la caja: es que cada imagen
necesita su propio punto de recorte, y hoy no hay forma de elegirlo desde el BO.

## Decision

**Cada imagen que lo necesite guarda un punto focal — no un recorte.**

Un punto focal es dos numeros (0-100, 0-100) que dicen que parte de la imagen tiene que
seguir visible pase lo que pase. Se renderiza como `object-position: X% Y%` en el `<img>`,
y punto: la imagen entera sigue viajando intacta, sin generar un archivo nuevo ni una
version recortada. Si la misma imagen se usara en dos cajas de proporcion distinta, el
mismo punto focal funciona razonablemente en las dos — el crop lo sigue calculando el
navegador con `object-fit: cover`, solo que centrado en el punto elegido y no en el medio.

Se elige con un clic sobre la imagen completa (sin recortar, sin achicar) mostrada donde
ya se edita la foto — no un modal aparte, siguiendo ADR-0029 ("cada cosa se edita donde se
ve"). Una vista previa al lado muestra como queda con la proporcion real de la tarjeta.

**Se descarto un recorte real** (arrastrar un rectangulo, con zoom): mas trabajo de UI
(canvas, manejo de aspect ratio, generar y subir un archivo nuevo por cada uso si la misma
foto aparece en cajas distintas) para resolver el mismo problema que un punto ya resuelve.
El punto focal no sirve para acercar o alejar la imagen, pero eso no es lo que esta roto
hoy: lo que esta roto es que el sujeto queda fuera de cuadro, y reposicionar alcanza.

## Consecuencias

- Vacio (sin foco elegido) sigue siendo centrado, que es el comportamiento de hoy: nadie
  pierde nada por no haber elegido un foco todavia.
- No reemplaza los arreglos ya hechos a mano (`object-top` en `/dojo` y
  `/professor-pablo-duran`): esos quedan como estan, no son imagenes que necesiten un foco
  distinto segun donde se usen.
- El alcance de la spec que sigue (0052) es **solo las fotos de `/eventos`**, que es donde
  se demostro el problema. Extender el foco a otras paginas es otra spec, cuando aparezca
  un caso real — no antes.
