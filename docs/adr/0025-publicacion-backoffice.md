---
fecha: 2026-09-21
resumen: El backoffice publica commiteando a `main`; el destino lo decide el modo de ejecución —disco en `astro dev`, GitHub en producción—, la serialización canónica la impone el schema de zod y la concurrencia se controla con el blob sha de git.
---

# ADR-0025 — Cómo publica el backoffice

## Estado

Aceptada.

## Contexto

El ADR-0002 decidió que el contenido es JSON en el repo y que el backoffice lo escribe
commiteando; la spec 0021 lo implementa. Al construirlo aparecieron tres cosas que el
diseño original no resolvía y que se descubren solo escribiendo archivos de verdad.

**El destino de la publicación no puede depender de una variable suelta.** La primera
versión elegía backend según hubiera o no `GITHUB_TOKEN` en el entorno. En `astro dev` esa
variable la aporta el shell, y el shell de esta máquina tiene un token vencido —el mismo
que ya rompía `git push` y que `docs/TASKS.md` documenta desde el 2026-09-19. Resultado:
el backoffice entero respondía 401 en local, y si el token hubiera sido válido habría
publicado contra el repo real desde una sesión de desarrollo.

**El orden de las claves del JSON lo fija zod, no el archivo.** `safeParse` devuelve un
objeto nuevo construido en el orden en que el schema declara sus campos. `homeSchema`
declara `resumen` segundo, pero los cuatro `home.json` lo tenían último, porque la spec
0023 lo agregó al final. El primer guardado desde el BO movía el bloque entero: seis
líneas de ruido en un diff que debía tener una.

**Dos personas pueden editar el mismo archivo.** El cliente en el BO y un agente en el
repo, sin coordinación.

## Decisión

**El backend lo decide el modo de ejecución, no la presencia del token.** `astro dev`
escribe en el disco; producción commitea contra la API de GitHub. `BO_PUBLICAR=github|disco`
fuerza el otro camino cuando hay que probarlo a mano. Sin `GITHUB_TOKEN` en producción, la
publicación falla con un error que lo nombra, igual que `DATABASE_URL` en `src/lib/db.ts`.

Escribir al disco en desarrollo no es un simulacro: es el mismo camino, con el mismo
control de concurrencia y la misma serialización. Un guardado local se ve en el sitio local
inmediatamente, y la spec queda verificable sin el PAT del dueño del repo.

**La serialización canónica es la del schema.** Se publica `JSON.stringify(datos, null, 2)`
sobre el objeto que devuelve zod, nunca sobre el que arma el formulario. Los cinco archivos
de contenido se normalizaron a ese orden en el mismo commit, con los mismos datos.

**La concurrencia se controla con el blob sha de git** —`sha1("blob <n>\0" + contenido)`,
el object id real—, que los dos backends calculan igual. El formulario lo lleva escondido;
al guardar se relee el archivo y, si el sha cambió, no se escribe nada y se avisa. GitHub
hace la misma comprobación del lado del servidor: 409 o 422 son el mismo caso.

## Consecuencias

- Un guardado del BO produce un diff mínimo: cambiar una frase cambia una línea. Es lo que
  hace que el historial de ediciones del cliente sea legible en git.
- El contenido del repo queda atado al orden de declaración de los schemas. Reordenar un
  campo en `src/lib/content.ts` reordena el archivo en el siguiente guardado. Es ruido de
  una sola vez, no una pérdida de datos.
- El editor no puede romper el sitio: lo que no valida contra el schema del build no llega
  al repo. El modo de falla se corre de "la web se cayó" a "el formulario no me deja
  guardar", que es donde tiene que estar.
- Dos ediciones simultáneas no se pisan, pero la que pierde se rehace a mano: no hay merge.
  Con un solo admin es el compromiso correcto.
- En desarrollo el BO escribe archivos reales del working tree. Guardar en `/admin` deja el
  repo sucio, igual que editar el JSON a mano.
