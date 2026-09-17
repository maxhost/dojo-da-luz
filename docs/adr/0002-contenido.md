---
adr: 0002
fecha: 2026-09-17
estado: aceptada
resumen: El contenido es JSON en el repo; el backoffice commitea via API de GitHub y el push dispara el build. Git es el historial de versiones.
---

# 0002 — Modelo de contenido y pipeline de publicacion

## Contexto

El admin tiene que poder cambiar textos e imagenes sin tocar codigo. La propuesta inicial
era guardar el contenido en Postgres con versionado propio (borradores, historial, quien
edito que). El cliente la rechazo por sobre-ingenieria, con razon: son ~10 paginas que
cambian unas pocas veces al mes.

## Decision

**El contenido vive como JSON en el repo. No hay contenido en la base de datos.**

```
content/
  pt/inicio.json   es/inicio.json   fr/accueil.json   en/home.json
  pt/aikido.json   ...
```

Flujo de publicacion:

1. El admin edita en `/admin/contenido`. La UI muestra los 4 idiomas por campo.
2. Al guardar, el backoffice hace un commit a `main` via API de GitHub.
3. El push dispara el build. El sitio se regenera entero (~10 paginas, segundos).

## Consecuencias

- **El versionado sale gratis.** Git ya es el historial: quien edito que, cuando, y
  rollback con un revert. Cero codigo escrito para eso — que era exactamente la objecion.
- **El sitio publico no depende de la DB ni de nada en runtime.** Si Neon se suspende o R2
  se cae, el HTML sigue servido igual de rapido. Esta propiedad es la que protege el SEO.
- **Nada de ISR ni revalidacion on-demand.** Deliberado: son APIs propietarias y atan el
  proyecto al host (ver ADR-0001, riesgo Vercel).
- Latencia de publicacion ~1-2 min. Con esta frecuencia de edicion, irrelevante.
- **Requiere un token de GitHub con scope de escritura** en variables de entorno del
  backoffice. Es el unico secreto con poder de escribir codigo — repo privado y token de
  acceso fino limitado a este repo.

## Medios

- **Imagenes**: se bajan las ~32 originales de `static.wixstatic.com`. Al subir una imagen
  nueva, el backoffice genera los tamaños con `sharp` y los sube a R2 como AVIF/WebP.
  `<img srcset>` plano, sin optimizacion en runtime — de nuevo, para no atarse al host.
- **Videos**: los 4 de las paginas de video son embeds de YouTube. **No se auto-hospedan.**
  Se sirven con una fachada (miniatura + click carga el iframe), que es la diferencia entre
  ~0kB y ~700kB de JS de YouTube por pagina.
