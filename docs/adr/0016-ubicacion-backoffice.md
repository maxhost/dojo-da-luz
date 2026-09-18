---
adr: 0016
fecha: 2026-09-18
estado: aceptada
resumen: El backoffice vive en /admin del mismo proyecto, con noindex y guard por Host; el subdominio bo. se activa con una variable de entorno cuando exista el dominio.
---

# 0016 — Donde vive el backoffice

## Contexto

El cliente pidio el backoffice en un subdominio (`bo.<dominio>`) para que no se indexe.
Hoy no hay dominio propio: el sitio vive en `dojo-da-luz.vercel.app`, y sobre un dominio
de Vercel no se pueden crear subdominios propios. Construir contra un host que todavia no
existe seria escribir codigo sin poder verificarlo.

## Decision

**Las rutas del BO son `/admin/*` en el mismo proyecto Astro, y el subdominio se enchufa
despues con una variable de entorno — no con un refactor.**

1. Todas las rutas del BO tienen `prerender = false` y viven bajo `/admin`.
2. Toda respuesta del BO lleva `X-Robots-Tag: noindex, nofollow, noarchive`.
3. `robots.txt` publica `Disallow: /admin`.
4. **Guard por Host:** si `BO_HOST` esta definida, `/admin/*` responde 404 cuando el
   header `Host` no coincide. Si no esta definida, `/admin` responde en cualquier host
   (que es el caso de hoy, con la URL de Vercel).
5. Cuando exista el dominio: `bo.aikido-duran.com` apunta al mismo proyecto Vercel y se
   define `BO_HOST=bo.aikido-duran.com`. Desde ese momento el BO desaparece del dominio
   publico. Cero cambios de codigo.

## Alternativas descartadas

- **Proyecto Vercel separado para el BO** — duplica deploy, variables y build de un repo
  que igual es el mismo. Y el BO necesita los tipos y los schemas del contenido: partirlo
  obligaria a publicar un paquete compartido para ganar nada.
- **Esperar al dominio para construir el BO** — bloquea semanas de trabajo detras de un
  tramite de DNS del cliente.

## Consecuencias

- **Lo que impide la indexacion no es el subdominio**: es el muro de auth, el `noindex` y
  el `Disallow`. Un crawler no puede pasar el login. El subdominio suma aislamiento de
  cookies y separacion mental, no es el mecanismo de seguridad.
- Mientras `BO_HOST` no exista, `/admin` es alcanzable desde la URL publica. Es aceptable
  porque no hay dominio que proteger todavia y el contenido esta detras de login.
- El sitio publico sigue siendo 100% HTML estatico: las unicas funciones son `/api/health`
  y `/admin/*`.
