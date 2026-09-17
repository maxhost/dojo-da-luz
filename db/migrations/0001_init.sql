-- 0001 — schema inicial (spec 0002)
--
-- Tres tablas. Sin ORM: son ~4 escrituras por mes.

create table if not exists alumno (
  id             uuid primary key default gen_random_uuid(),
  nombre         text        not null,
  email          text        not null,
  nif            text,
  morada         text,
  creado_en      timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

-- La config que pidio el cliente: serie y numero donde empieza a contar.
create table if not exists serie (
  serie           text primary key,
  proximo_numero  integer     not null check (proximo_numero > 0),
  creada_en       timestamptz not null default now()
);

-- Una factura emitida es un documento, no una vista del alumno: los datos fiscales
-- se congelan al emitir. Si el alumno cambia de morada, las facturas viejas no cambian.
create table if not exists factura (
  id             uuid primary key default gen_random_uuid(),
  serie          text        not null references serie (serie),
  numero         integer     not null,
  alumno_id      uuid        not null references alumno (id),
  nombre         text        not null,
  nif            text,
  morada         text,
  descripcion    text        not null,
  total_centimos integer     not null check (total_centimos >= 0),
  emitida_en     timestamptz not null default now(),
  enviada_a      text        not null,
  -- Clave del PDF en R2. Ese objeto es el documento conservado (ADR-0003).
  r2_key         text        not null unique,
  unique (serie, numero)
);

create index if not exists factura_alumno_idx on factura (alumno_id);
create index if not exists factura_emitida_idx on factura (emitida_en desc);
