import fs from 'node:fs';import path from 'node:path';import {execFileSync} from 'node:child_process';
const root=process.cwd();let files=[];
try{files=execFileSync('git',['ls-files','-z'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}).split('\0').filter(Boolean)}catch{}
function walk(name){const p=path.join(root,name);if(!fs.existsSync(p))return [];if(fs.lstatSync(p).isSymbolicLink())throw Error('Symbolic link in public package: '+name);return fs.statSync(p).isDirectory()?fs.readdirSync(p).flatMap(e=>walk(path.join(name,e))):[name]}
if(!files.length)files=['src','public','docs','.github','README.md','CONTRIBUTING.md','SECURITY.md','.env.example','.gitignore','.gitattributes','package.json','package-lock.json','index.html','tsconfig.json','vite.config.ts','playwright.config.ts','scripts/check-build.mjs','scripts/check-secrets.mjs','scripts/sanitize-public.mjs','scripts/smoke-build.mjs','tests/catalog.test.ts','tests/outcome.test.ts','tests/public-results.test.ts','tests/browser/app.spec.ts'].flatMap(walk);
const patterns=[
 ['private inference endpoint',/https?:\/\/[a-z0-9.-]+\.(?:openai\.azure\.com|services\.ai\.azure\.com|cognitiveservices\.azure\.com)/i],
 ['Azure resource identifier',/\/subscriptions\/[0-9a-f]{8}-[0-9a-f-]{27,}\//i],
 ['private local path',/\/(?:Users|home)\/[a-z0-9._-]+\//i],
 ['GitHub token',/\b(?:gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{30,})\b/],
 ['API token',/\bsk-(?:ant-[A-Za-z0-9_-]{20,}|proj-[A-Za-z0-9_-]{20,}|[A-Za-z0-9]{32,})\b/],
 ['private key',/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/],
 ['storage credential',/AccountKey=[A-Za-z0-9+/]{40,}/],
 ['AWS access key',/\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/]
];const failures=[];
for(const file of files){if(/^(?:runs|spec|sources|design|node_modules|dist|test-results)\//.test(file)||/(?:^|\/)\.env(?:\..*)?$/.test(file)&&!file.endsWith('.env.example')||/\.(?:pem|key|p12|pfx)$/.test(file)||/(?:^|\/)(?:request|response|generation|auth)\.json$/.test(file)){failures.push(file+': private file');continue}const p=path.join(root,file);if(!fs.existsSync(p)||fs.statSync(p).isDirectory())continue;const data=fs.readFileSync(p);if(data.includes(0))continue;const text=data.toString('utf8');for(const [label,pattern]of patterns)if(pattern.test(text))failures.push(file+': '+label)}
if(failures.length){console.error('Publication check failed:\n'+failures.join('\n'));process.exit(1)}
console.log(`Publication privacy check passed: ${files.length} files; no configured inference hosts, common credentials or private archives detected.`);
