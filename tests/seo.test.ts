import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pageSeo,modelDescription,modelEditorial,modelPath,renderSeoDocument,routeFromPath,routePath,legacyRoute,siteMap,siteOrigin,modelSlug,modelByKey,modelTitle,modelTimestamp,FIRST_PUBLISHED_AT,BROWSE_HEADING,rivalsFor,footerInner} from '../src/seo';
import {publishedModels} from '../src/catalog';
import type {Catalog} from '../src/types';
const c=JSON.parse(fs.readFileSync('public/results/index.json','utf8')) as Catalog,m=c.models.find(m=>m.video)!,argon=c.models.find(m=>m.id==='gemini-4-argon')!,dotted=c.models.find(model=>model.id==='kimi-k3.1-pro')!;
test('clean routes and legacy bookmarks resolve to one canonical model address',()=>{
 for(const r of ['gallery','compare','method','model/'+m.id])assert.equal(routeFromPath(routePath(r)),r.startsWith('model/')?'model/'+modelSlug(m.id):r);
 assert.equal(modelByKey(c.models,modelSlug(dotted.id))?.id,dotted.id);assert.equal(routeFromPath('/animations/'+dotted.id+'/'),'model/'+dotted.id);assert.equal(modelSlug(dotted.id),'kimi-k3-1-pro');
 assert.equal(legacyRoute('#model/'+m.id),'model/'+m.id);assert.equal(legacyRoute('#main-content'),null);assert.equal(routeFromPath('/anything-unpublished/'),'missing');
 const d=pageSeo(c,'model/'+m.id);assert.equal(d.canonical,siteOrigin+modelPath(m));assert.equal(d.canonical.includes('#'),false);assert.match(d.title,new RegExp(m.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.equal(pageSeo(c,'model/never-published').valid,false);
});
test('model descriptions use actual run evidence and disclose the framing correction',()=>{
 assert.match(modelDescription(m,c).join(' '),/independent offline browser/);assert.ok(modelDescription(m,c).join(' ').includes(m.usage!.output_tokens.toLocaleString('en-US')));assert.match(modelDescription(argon,c).join(' '),/feedback-assisted framing correction/);assert.ok(modelEditorial(m,c).includes('href="/animations/'));assert.equal(modelEditorial(m,c).includes('href="#model'),false);
 const noPrice={...m,price:undefined};assert.match(modelDescription(noPrice,c).join(' '),/verified API price is unavailable/);assert.doesNotMatch(modelDescription(noPrice,c).join(' '),/\$0\.0000/);
});
test('static pages expose unique metadata, visible content and real VideoObjects without running JavaScript',()=>{
 const template=fs.readFileSync('index.html','utf8');const html=renderSeoDocument(template,c,'model/'+m.id);assert.match(html,/<video /);assert.match(html,/application\/ld\+json/);assert.ok(html.includes(m.video!));assert.ok(html.includes('How '+m.name+' performed'));assert.equal((html.match(/<title>/g)??[]).length,1);assert.equal((html.match(/name="description"/g)??[]).length,1);assert.ok(modelTitle(m.name).length<=65);assert.ok(pageSeo(c,'model/'+m.id).description.length<=160);
 const d=pageSeo(c,'model/'+m.id);const v=d.structuredData['@graph'].find((x:any)=>x['@type']==='VideoObject') as any;assert.equal(v.contentUrl,siteOrigin+m.video);assert.equal(v.duration,'PT12S');assert.equal(v.uploadDate,modelTimestamp(m,c));assert.equal(modelTimestamp(dotted,c),FIRST_PUBLISHED_AT);assert.equal('aggregateRating' in v,false);assert.equal(d.structuredData['@graph'].some((x:any)=>x.license),false);
 const gallery=renderSeoDocument(template,c,'gallery');assert.ok(gallery.includes(modelPath(m)));assert.match(gallery,/An LLM coding benchmark you can watch/);const missing=renderSeoDocument(template,c,'missing');assert.match(missing,/noindex,follow/);assert.equal(missing.includes('rel="canonical"'),false);assert.equal(missing.includes('property="og:url"'),false);assert.equal(JSON.stringify(pageSeo(c,'method').structuredData).includes('"license"'),false);
});
test('video sitemap includes playable model pages and excludes private and unavailable records',()=>{
 const xml=siteMap(c);assert.match(xml,/xmlns:video=/);for(const model of c.models){if(model.video&&model.poster)assert.ok(xml.includes(siteOrigin+modelPath(model)));else assert.equal(xml.includes(siteOrigin+modelPath(model)),false)}assert.equal((xml.match(/<video:video>/g)??[]).length,c.models.filter(x=>x.video&&x.poster).length);assert.doesNotMatch(xml,/#model|\/runs\/|localhost|\.azure\.com/);assert.ok(xml.includes('<lastmod>'));assert.ok(xml.includes('<video:family_friendly>yes</video:family_friendly>'));assert.ok(xml.includes(siteOrigin+'/animations/glm-5-3/'));assert.ok(xml.includes(siteOrigin+'/animations/xiaomi-mimo-v2-6-pro/'));
});
test('homepage and method copy do not bake in a model count',()=>{
 const home=pageSeo(c,'gallery');
 assert.equal(home.title,'AI Coding Benchmark: Every Model, One Test | PomBench');
 assert.ok(home.title.length<=65);assert.ok(home.description.length<=160);
 assert.match(home.description,/AI coding benchmark/);assert.doesNotMatch(home.title,/\d/);
 assert.doesNotMatch(home.description,/\d+\s+(models|LLMs)/i);assert.doesNotMatch(home.imageAlt,/\d+\s+LLMs/);
 assert.match(home.imageAlt,/AI coding benchmark/);
 const template=fs.readFileSync('index.html','utf8'),gallery=renderSeoDocument(template,c,'gallery'),method=renderSeoDocument(template,c,'method');
 assert.match(gallery,/one little dog, every model/);assert.doesNotMatch(gallery,/one little dog, \d+ models/);
 assert.match(gallery,new RegExp(BROWSE_HEADING));assert.doesNotMatch(gallery,/Browse all \d+/);assert.doesNotMatch(method,/Browse all \d+/);
 assert.match(modelEditorial(m,c),/All models/);assert.doesNotMatch(modelEditorial(m,c),/All \d+ models/);
 const list=home.structuredData['@graph'].find((x:any)=>x['@type']==='ItemList') as {numberOfItems:number};
 assert.equal(list.numberOfItems,c.models.filter(model=>model.status==='captured'&&model.video&&model.poster).length);
 const client=fs.readFileSync('src/main.ts','utf8');
 assert.doesNotMatch(client,/Browse all \$\{/);assert.doesNotMatch(client,/count-bubble/);
 assert.doesNotMatch(client,/\$\{publishedModels\([^)]*\)\.length\} (published model animations|completed animations)/);
});
test('GLM 5.3 Flash has its own page, description, rivals and sitemap video entry',()=>{
 const flash=c.models.find(model=>model.id==='glm-5.3-flash')!,glm=c.models.find(model=>model.id==='FW-GLM-5.3')!,ready=publishedModels(c.models);
 assert.equal(flash.name,'GLM 5.3 Flash');assert.equal(modelSlug(flash.id),'glm-5-3-flash');assert.equal(modelSlug('FW-GLM-5.3'),'glm-5-3');
 for(const id of ['FW-GLM-5.3-Flash','GLM-5.3-Flash','glm-5.3-flash','FW.GLM.5.3.Flash'])assert.equal(modelSlug(id),'glm-5-3-flash');
 assert.equal(modelPath(flash),'/animations/glm-5-3-flash/');assert.notEqual(modelPath(flash),modelPath(glm));
 const seo=pageSeo(c,'model/'+flash.id);assert.equal(seo.valid,true);assert.equal(seo.canonical,siteOrigin+'/animations/glm-5-3-flash/');
 assert.equal(seo.title,modelTitle(flash.name));assert.ok(seo.title.length<=65);assert.ok(seo.description.length<=160);
 assert.match(seo.title,/^GLM 5\.3 Flash Benchmark:/);assert.doesNotMatch(seo.title,/\d+\s+(models|LLMs)/);
 assert.match(seo.description,/22,545 output tokens/);assert.match(seo.description,/known API cost \$0\.0116/);assert.match(seo.description,/Compare GLM 5\.3 Flash vs GLM 5\.3/);
 assert.doesNotMatch(seo.description,/\d+\s+(models|LLMs)/);
 const body=modelDescription(flash,c).join(' ');assert.match(body,/22,545 output tokens/);assert.match(body,/\$0\.0116/);assert.match(body,/rank \d+ of \d+/);
 assert.deepEqual(rivalsFor(flash,ready).map(model=>model.name),['GLM 5.3','DeepSeek V4.1 Flash','Gemini 3.8 Flash']);
 assert.equal(rivalsFor(glm,ready)[0].name,'GLM 5.3 Flash');
 assert.equal(modelTimestamp(flash,c),c.publishedAt);
 const xml=siteMap(c),block=xml.split('<url>').find(part=>part.includes('/animations/glm-5-3-flash/'));
 assert.ok(block);assert.match(block!,/<video:video>/);assert.match(block!,/<video:content_loc>https:\/\/pombench.com\/results\/glm-5\.3-flash\/animation\.mp4<\/video:content_loc>/);assert.match(block!,/<video:thumbnail_loc>https:\/\/pombench.com\/results\/glm-5\.3-flash\/poster\.png<\/video:thumbnail_loc>/);assert.ok(block!.includes('<lastmod>'+c.publishedAt+'</lastmod>'));
 const other=modelEditorial(glm,c);assert.match(other.split('id="latest"')[1],/href="\/animations\/glm-5-3-flash\/"/);assert.match(footerInner(c),/href="\/animations\/glm-5-3-flash\/"/);
 for(const model of ready){const page=pageSeo(c,'model/'+model.id);assert.ok(page.title.length<=65,model.id);assert.ok(page.description.length<=160,model.id);assert.equal(page.canonical,siteOrigin+modelPath(model));}
});
