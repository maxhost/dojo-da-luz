---
adr: 0015
fecha: 2026-09-18
estado: aceptada
resumen: Un unico admin con email y contraseña, sesion por cookie opaca en Neon y recuperacion por Resend. Supersede la fila Auth del ADR-0001 y descarta Neon Auth.
---

# 0015 — Auth del backoffice

## Contexto

El ADR-0001 dijo "magic link por email, 1 admin, sin roles" sin saber que el proyecto Neon
traia `neon_auth` provisionado. Eso dejo una decision abierta anotada en `docs/TASKS.md`:
Neon Auth o implementacion propia. El cliente la cierra con un requisito explicito:
**formulario de login con email y contraseña, un solo usuario, y recuperacion de
contraseña**. Magic link ya no cumple el pedido.

## Decision

**Auth propia, minima, con la sesion en Neon. Sin Neon Auth, sin libreria de auth.**

| Pieza | Eleccion | Por que |
|---|---|---|
| Identidad | Una fila en `admin`. Sin registro, sin roles, sin invitaciones | Es una persona. Un `unique` sobre una columna constante impide que exista una segunda. |
| Hash | `scrypt` de `node:crypto` (N=2^15, r=8, p=1, salt 16B) | Sin dependencias nativas: argon2 y bcrypt traen binarios que complican el bundle serverless. scrypt es memory-hard y viene en el runtime. |
| Comparacion | `timingSafeEqual` | Evita el oraculo por tiempo. |
| Sesion | Token opaco de 32 bytes; en la DB se guarda solo su `sha256` | Revocacion inmediata y cero secretos de firma que rotar. |
| Cookie | `HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=8h` | `Lax` alcanza: el BO no recibe POST cross-site. |
| Reset | Token de 32 bytes, hash en DB, 30 min, **un solo uso**; al consumirlo se borran todas las sesiones | Una contraseña nueva tiene que echar al que estuviera dentro. |
| Email | Resend | Ya es la decision del ADR-0003 para facturas. Un proveedor, un DKIM. |
| Rate limit | 5 fallos por email en 15 min → 429 | Una contraseña de un solo usuario es el unico secreto: sin freno, es fuerza bruta gratis. |

**No se enumera usuarios.** `POST /admin/recuperar` responde lo mismo exista o no el email,
y tarda lo mismo.

## Alternativas descartadas

- **Neon Auth** — resuelve sesiones y providers, pero para un usuario sin roles es
  andamiaje puro, y mete un SDK y una dependencia de runtime con Neon en el BO. El coste
  de lo propio aca son ~120 lineas.
- **JWT en cookie** — no se puede revocar sin una lista de revocacion, que es exactamente
  la tabla de sesiones que el JWT pretendia evitar.
- **Magic link** (ADR-0001) — el cliente pidio contraseña. Se puede sumar despues sin
  tocar este modelo: seria otro camino hacia la misma tabla de sesiones.

## Consecuencias

- El BO deja de ser estatico: necesita `prerender = false` y `DATABASE_URL` en runtime.
  El sitio publico no se entera (ADR-0001 sigue intacto).
- Hace falta una migracion nueva: `admin`, `admin_session`, `admin_reset`,
  `admin_login_attempt`.
- **Sin 2FA.** Aceptado: un usuario, superficie minima, y el dominio no mueve dinero.
- Resend necesita DKIM/SPF en el dominio para entregar bien. Hasta que exista dominio, los
  emails de recuperacion salen del remitente de pruebas de Resend y solo llegan a la
  direccion verificada de la cuenta. Es una limitacion de entrega, no de diseño.
- La contraseña inicial no se commitea: se siembra con un comando que lee la variable de
  entorno y escribe el hash.
