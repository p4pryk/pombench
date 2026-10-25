import {defineConfig,type Plugin} from 'vite';
import fs from 'node:fs';
import path from 'node:path';
import type {Catalog} from './src/types.ts';
import {publishedModels} from './src/catalog.ts';
import {matchesPublished,renderSeoDocument,routeFromPath,routePath,siteMap,robotsText} from './src/seo.ts';
const catalog=()=>JSON.parse(fs.readFileSync('public/results/index.json','utf8')) as Catalog;
function staticSeo():Plugin{return {name:'static-seo',configureServer(server){server.middlewares.use(async(req,res,next)=>{
 const pathname=new URL(req.url??'/','http://localhost').pathname,r=routeFromPath(pathname);const missingModel=r.startsWith('model/')&&!matchesPublished(catalog(),r.slice(6));
 if(pathname==='/sitemap.xml'||pathname==='/robots.txt'){res.setHeader('Content-Type',pathname.endsWith('.xml')?'application/xml; charset=utf-8':'text/plain; charset=utf-8');res.end(pathname.endsWith('.xml')?siteMap(catalog()):robotsText);return}
 if(!pathname.includes('.')&&!/^\/(?:@|src\/|assets\/|results\/|node_modules\/)/.test(pathname)&&(r==='missing'||missingModel)){
  const template=fs.readFileSync('index.html','utf8');res.statusCode=404;res.setHeader('Content-Type','text/html; charset=utf-8');res.end(await server.transformIndexHtml('/404/',template));return
 }
 next();
 })},transformIndexHtml:{order:'post',handler(html,ctx){return ctx.server?renderSeoDocument(html,catalog(),routeFromPath((ctx.originalUrl??ctx.path).split('?')[0])):html}},closeBundle(){
 const root=path.resolve('dist'),template=fs.readFileSync(path.join(root,'index.html'),'utf8'),c=catalog();
 for(const route of ['gallery','compare','method',...publishedModels(c.models).map(m=>'model/'+m.id)]){const out=path.join(root,routePath(route),'index.html');fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,renderSeoDocument(template,c,route))}
 fs.writeFileSync(path.join(root,'404.html'),renderSeoDocument(template,c,'missing'));
 fs.writeFileSync(path.join(root,'sitemap.xml'),siteMap(c));fs.writeFileSync(path.join(root,'robots.txt'),robotsText);
 console.log(`Pre-rendered ${3+publishedModels(c.models).length} indexable pages, video sitemap and robots.txt for pombench.com.`);
 }}}
export default defineConfig({plugins:[{name:'private-evidence',configureServer(server){server.middlewares.use((req,res,next)=>{let p='';try{p=decodeURIComponent((req.url??'/').split('?')[0])}catch{res.statusCode=400;res.end();return}if(/\/(?:runs|scripts|tests|spec|node_modules\/\.cache)(?:\/|$)/.test(p)||p.includes('/@fs/')){res.statusCode=403;res.end('Private benchmark evidence');return}next()})}},staticSeo()],server:{watch:{ignored:['**/runs/**','**/spec/**','**/scripts/**','**/.env*']},host:'127.0.0.1',port:4175,strictPort:true,fs:{strict:true,deny:['**/runs/**','**/scripts/**','**/tests/**','.env','.env.*','**/*.pem','**/*.key','**/.git/**']}},build:{target:'es2022'}});
