---
spec: 0019
fecha: 2026-09-18
estado: cerrada
resumen: Backoffice en /admin con login de un solo admin por email y contraseña, sesion en Neon, recuperacion por Resend, rate limit y noindex.
disjunta: si
archivos: db/migrations/0002_admin.sql, src/lib/auth.ts, src/lib/admin-session.ts, src/lib/email.ts, src/middleware.ts, src/pages/admin/**, src/layouts/Admin.astro, scripts/admin-seed.mjs, public/robots.txt
---

# 0019 — Backoffice: auth y shell

## Problema

No existe backoffice. Todo el contenido se edita a mano en el repo, que es exactamente lo
que el cliente no puede hacer. Antes de editar nada hace falta la puerta: un login que solo
pase una persona, y una forma de recuperar el acceso si pierde la contraseña.

La decision abierta que arrastraba `docs/TASKS.md` (Neon Auth o propio) queda cerrada en
el ADR-0015; donde vive el BO, en el ADR-0016.

## Alcance

**Entra:**

- Migracion `0002_admin.sql`: `admin`, `admin_session`, `admin_reset`, `admin_login_attempt`.
- `src/lib/auth.ts`: hash y verificacion `scrypt`, generacion de tokens, hash de tokens.
- `src/lib/admin-session.ts`: crear, leer, revocar sesion; helper `requireAdmin`.
- `src/lib/email.ts`: envio por Resend (una funcion, sin SDK: `fetch` a la API).
- `src/middleware.ts`: guard por `Host` (`BO_HOST`) y `X-Robots-Tag` en todo `/admin/*`.
- Pantallas: `/admin/entrar`, `/admin/recuperar`, `/admin/restablecer`, `/admin` (panel
  vacio con el nombre del admin y salir), `POST /admin/salir`.
- `scripts/admin-seed.mjs`: crea o actualiza el unico admin leyendo `ADMIN_EMAIL` y
  `ADMIN_PASSWORD` del entorno. No escribe nada al repo.
- `public/robots.txt` con `Disallow: /admin`.

**No entra:**

- Editar contenido. Ni dojos ni Home: eso es 0020 y 0021. El panel queda vacio a proposito.
- 2FA, roles, invitaciones, registro, "recordarme", sesiones multiples listadas.
- Alumnos y facturas (specs 0003/0004 originales, hoy sin numero nuevo).
- Subdominio real: hasta que exista dominio, `BO_HOST` queda sin definir (ADR-0016).

## Diseño

### Tablas

```sql
create table admin (
  id             uuid primary key default gen_random_uuid(),
  email          text        not null unique,
  password_hash  text        not null,          -- scrypt$N$r$p$salt_b64$hash_b64
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  -- Un solo admin, enforced por la DB y no por una review.
  solo_uno       boolean     not null default true unique check (solo_uno)
);

create table admin_session (
  token_sha256 text primary key,
  admin_id     uuid        not null references admin (id) on delete cascade,
  creada_en    timestamptz not null default now(),
  expira_en    timestamptz not null
);

create table admin_reset (
  token_sha256 text primary key,
  admin_id     uuid        not null references admin (id) on delete cascade,
  creado_en    timestamptz not null default now(),
  expira_en    timestamptz not null,
  usado_en     timestamptz
);

create table admin_login_attempt (
  id        bigserial   primary key,
  email     text        not null,
  exito     boolean     not null,
  ocurrio_en timestamptz not null default now()
);
```

### Contratos

| Ruta | Metodo | Comportamiento |
|---|---|---|
| `/admin/entrar` | GET | Formulario. Si ya hay sesion valida → 302 a `/admin`. |
| `/admin/entrar` | POST | 5 fallos del mismo email en 15 min → 429. Credenciales malas → 200 con error generico ("Email o contraseña incorrectos"), nunca cual de los dos. Bien → cookie `bo_session` y 302 a `/admin`. |
| `/admin/recuperar` | POST | Siempre la misma respuesta y el mismo texto, exista o no el email. Si existe, invalida resets previos y manda uno nuevo. |
| `/admin/restablecer` | GET | Token invalido, usado o vencido → pagina de error con enlace a pedir otro. |
| `/admin/restablecer` | POST | Minimo 12 caracteres. Al guardar: marca el token usado, borra **todas** las sesiones y redirige a `/admin/entrar`. |
| `/admin/salir` | POST | Borra la fila de sesion y la cookie. |
| `/admin` | GET | Requiere sesion. Sin sesion → 302 a `/admin/entrar`. |

Cookie: `bo_session`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=28800`.
En la DB se guarda `sha256(token)`: si alguien lee la tabla no puede iniciar sesion.

El middleware sale temprano si el path no empieza con `/admin`. Para `/admin/*`:
`X-Robots-Tag: noindex, nofollow, noarchive`, y 404 si `BO_HOST` esta definida y no
coincide con el header `Host`.

### Entorno

| Variable | Para que | Sin ella |
|---|---|---|
| `DATABASE_URL` | Ya existe | El BO no arranca |
| `RESEND_API_KEY` | Email de recuperacion | Login funciona; recuperar responde 503 y lo dice en el log |
| `BO_FROM_EMAIL` | Remitente | idem |
| `BO_HOST` | Guard de host (ADR-0016) | `/admin` responde en cualquier host |

## Archivos

| Archivo | Accion |
|---|---|
| `db/migrations/0002_admin.sql` | crear |
| `src/lib/auth.ts` | crear |
| `src/lib/admin-session.ts` | crear |
| `src/lib/email.ts` | crear |
| `src/middleware.ts` | crear |
| `src/layouts/Admin.astro` | crear |
| `src/pages/admin/index.astro` | crear |
| `src/pages/admin/entrar.astro` | crear |
| `src/pages/admin/recuperar.astro` | crear |
| `src/pages/admin/restablecer.astro` | crear |
| `src/pages/admin/salir.ts` | crear |
| `scripts/admin-seed.mjs` | crear |
| `public/robots.txt` | crear |
| `package.json` | editar (script `admin:seed`) |

### Disjunta?

**Si.** No toca `src/components/**`, `content/**` ni `src/lib/content.ts`, que es donde
viven 0020 y 0021.

## Verificacion

Señales que no escribe el agente:

- [ ] `npm run typecheck` limpio y `npm run build` sigue emitiendo las 36 paginas estaticas.
- [ ] Migracion aplicada: `\dt` en Neon muestra las 4 tablas nuevas.
- [ ] `node --test` (o script con exit code) sobre `auth.ts`: hash + verify de la misma
      contraseña da `true`; de otra da `false`; dos hashes de la misma contraseña difieren.
- [ ] `astro dev`: contraseña incorrecta → se ve el error generico y **no** se crea fila en
      `admin_session`; correcta → hay fila y `/admin` responde 200.
- [ ] Sin cookie, `curl -i /admin` → 302 a `/admin/entrar`.
- [ ] Seis POST seguidos con contraseña mala → el sexto responde 429.
- [ ] Flujo de reset completo: email recibido, link abre el formulario, segundo uso del
      mismo link → error, y la sesion que estaba abierta deja de servir.
- [ ] `curl -I /admin/entrar` incluye `X-Robots-Tag: noindex, nofollow, noarchive`.
- [ ] Con `BO_HOST=otro.example` en `.env`, `/admin/entrar` responde 404.

## Abierto

Nada bloqueante para construir. Para **verificar el email** hace falta del cliente:

- `RESEND_API_KEY` de la cuenta del proyecto.
- Direccion remitente. Sin dominio propio solo se puede usar el remitente de pruebas de
  Resend, que entrega unicamente a la casilla verificada de la cuenta. Alcanza para
  verificar el flujo; el remitente definitivo espera al DKIM del dominio.
- Email y contraseña inicial del admin (se cargan por entorno, no se commitean).
