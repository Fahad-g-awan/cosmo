# cosmediate-opensearch-mapping

Manual Lambda for OpenSearch **index lifecycle** (CREATE, MIGRATE, TRUNCATE, DELETE).

Set `env`, `action`, and `target` in `index.mjs` before invoke.

## Layout

- `lib/schemas/` — index mappings (`base`, `admin`, `patient`, `mappingFor`)
- `legacy/` — other entity index schemas (**reference only**, not wired)
- `lib/operations.mjs` — create / migrate / truncate / delete
- `lib/constants.mjs` — `TARGET`, `ACTION`, `ENV`, shard/replica defaults
