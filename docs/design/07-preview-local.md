# Previsualización local

## Desarrollo

Desde la raíz del repositorio:

```sh
npm install
npm run dev -- --host 127.0.0.1
```

Abrir:

- Home: `http://localhost:4321/`

Usar las herramientas responsive del navegador a 375×812 px para revisar la intención
mobile first.

## Build estático

```sh
npm run typecheck
npm run build
```

Con el adapter actual, la home compilada queda en:

```text
.vercel/output/static/index.html
```

El HTML no debe contener `<script>`. Verificación:

```sh
if rg -n '<script[ >]' .vercel/output/static/index.html; then
  exit 1
fi
```

## Nota del entorno de Codex

El sandbox de esta sesión rechazó `bind(2)` sobre `127.0.0.1:4321` con `EPERM`. El build
y el artefacto estático sí se generaron; el bloqueo corresponde a apertura de puertos,
no a un error de Astro.
