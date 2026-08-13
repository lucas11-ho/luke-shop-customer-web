import fs from 'node:fs';import path from 'node:path';
const root=process.cwd();const allowed=['.js','.jsx','.css','.html','.json','.md','.yml','.yaml','.bat','.example','.nvmrc','.gitignore'];let count=0;
function walk(dir){for(const name of fs.readdirSync(dir)){if(['node_modules','dist','.git'].includes(name))continue;const p=path.join(dir,name);const s=fs.statSync(p);if(s.isDirectory())walk(p);else{count++;if(p.endsWith('check-source.mjs'))continue;const text=fs.readFileSync(p,'utf8');if(text.includes('NODE_TLS_REJECT_UNAUTHORIZED'+'=0'))throw new Error(`TLS bypass found: ${p}`);}}}
walk(root);console.log(`PASS source safety scan (${count} files checked)`);
