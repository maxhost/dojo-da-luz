# Cabecera y navegación

## Papel dentro del paisaje

La cabecera es el límite superior del lienzo. No flota ni acompaña el scroll: al cruzarla
comienza el cielo. Una regla `line` separa navegación y hero.

## Móvil

- Padding horizontal 20 px; altura mínima 76 px, sin altura fija.
- “Dojo da Luz” en Newsreader 20 px a la izquierda.
- “Menu” a la derecha mediante `details/summary`, área táctil mínima 44 px.
- Panel paper, borde 1 px; orden Inicio, Clases, Aikido, Dojo, Contacto.
- Idiomas PT, ES, FR y EN tras una regla.
- Sin sello, kanji ni sol en la marca: el sol pertenece al contenido de Inicio.

## Desktop

Marca en columnas 1–3, navegación 5–10 e idiomas 11–12. `details` se sustituye por enlaces
visibles con CSS responsive; no JavaScript. La cabecera no es sticky.

## Contrato

```json
{
  "brandName": "Dojo da Luz",
  "brandDescriptor": "Aikido · Lisboa",
  "menuLabel": "Menu",
  "navItems": [
    { "page": "home", "label": "Início" },
    { "page": "classes", "label": "Aulas" },
    { "page": "aikido", "label": "Aikido" },
    { "page": "dojo", "label": "O dojo" },
    { "page": "contact", "label": "Contacto" }
  ],
  "languageLabel": "Idioma"
}
```

Rutas e `hreflang` salen de código tipado. Los labels admiten ±30 % sin ancho fijo.
