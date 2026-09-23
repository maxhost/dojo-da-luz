-- 0003 — freno de envios de formularios (spec 0050)
--
-- Lo que NO hay aca es deliberado: las respuestas no se guardan. El servidor valida contra
-- la definicion publicada y entrega el mensaje por Resend (ADR-0046); esta tabla existe
-- solo para que el buzon del dojo no se pueda inundar desde una sola conexion.
--
-- Tampoco se guarda la IP: se guarda sha256(salt + ip). Leer esta tabla no dice quien
-- escribio, solo cuantas veces escribio el mismo de antes.

create table if not exists form_rate_limit (
  id         bigserial   primary key,
  ip_sha256  text        not null,
  form_id    text        not null,
  ocurrio_en timestamptz not null default now()
);

create index if not exists form_rate_limit_idx on form_rate_limit (ip_sha256, ocurrio_en desc);

-- La ventana es de una hora: lo viejo no sirve para decidir y se borra al escribir.
create index if not exists form_rate_limit_purga_idx on form_rate_limit (ocurrio_en);
