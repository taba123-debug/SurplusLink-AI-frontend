import fs from 'node:fs';
const spec = JSON.parse(fs.readFileSync('openapi.json', 'utf8'));
function type(s) {
  if (s.$ref) return s.$ref.split('/').at(-1);
  if (s.anyOf) return s.anyOf.map(type).join(' | ');
  if (s.const !== undefined) return JSON.stringify(s.const);
  if (s.enum) return s.enum.map(x => JSON.stringify(x)).join(' | ');
  if (s.type === 'array') return `Array<${type(s.items)}>`;
  if (s.type === 'object') return s.properties ? `{ ${Object.entries(s.properties).map(([k,v]) => `${k}${s.required?.includes(k) ? '' : '?'}: ${type(v)}`).join('; ')} }` : `Record<string, ${typeof s.additionalProperties === 'object' ? type(s.additionalProperties) : 'unknown'}>`;
  return ({integer:'number', number:'number', boolean:'boolean', string:'string', null:'null'})[s.type] || 'unknown';
}
fs.writeFileSync('src/services/http/contracts.ts', '// Generated from the local FastAPI OpenAPI snapshot. Run node scripts/generate-api-types.mjs to regenerate.\n' + Object.entries(spec.components.schemas).map(([k,v]) => `export type ${k} = ${type(v)};`).join('\n') + '\n');
