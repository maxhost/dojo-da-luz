-- 0002 — backoffice: admin, sesiones e intentos de login (spec 0019)
--
-- La tabla de reset no esta aca a proposito: llega con la spec 0022, cuando exista
-- Resend. No se crean tablas que hoy nadie escribe.

create table if not exists admin (
  id             uuid        primary key default gen_random_uuid(),
  email          text        not null unique,
  -- Formato: scrypt$N$r$p$salt_b64$hash_b64 (ADR-0015).
  password_hash  text        not null,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now(),
  -- Un solo admin, enforced por la DB y no por una review de codigo.
  solo_uno       boolean     not null default true unique check (solo_uno)
);

-- Se guarda sha256(token), no el token: leer esta tabla no alcanza para iniciar sesion.
create table if not exists admin_session (
  token_sha256 text        primary key,
  admin_id     uuid        not null references admin (id) on delete cascade,
  creada_en    timestamptz not null default now(),
  expira_en    timestamptz not null
);

create index if not exists admin_session_expira_idx on admin_session (expira_en);

-- Freno de fuerza bruta: la contraseña del unico admin es el unico secreto del BO.
create table if not exists admin_login_attempt (
  id         bigserial   primary key,
  email      text        not null,
  exito      boolean     not null,
  ocurrio_en timestamptz not null default now()
);

create index if not exists admin_login_attempt_idx on admin_login_attempt (email, ocurrio_en desc);
