import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {pageSeo,modelDescription,modelEditorial,modelPath,renderSeoDocument,routeFromPath,routePath,legacyRoute,siteMap,siteOrigin} from '../src/seo';
import type {Catalog} from '../src/types';
const c=JSON.parse(fs.readFileSync('public/results/index.json','utf8')) as Catalog,m=c.models.find(m=>m.video)!,argon=c.models.find(m=>m.id==='gemini-4-argon')!;
test('clean routes and legacy bookmarks resolve to one canonical model address',()=>{
 for(const r of ['gallery','compare','method','model/'+m.id])assert.equal(routeFromPath(routePath(r)),r);
 assert.equal(legacyRoute('#model/'+m.id),'model/'+m.id);assert.equal(legacyRoute('#main-content'),null);assert.equal(routeFromPath('/anything-unpublished/'),'missing');
 const d=pageSeo(c,'model/'+m.id);assert.equal(d.canonical,siteOrigin+modelPath(m));assert.equal(d.canonical.includes('#'),false);assert.match(d.title,new RegExp(m.name.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')));assert.equal(pageSeo(c,'model/never-published').valid,false);
});
test('model descriptions use actual run evidence and disclose the framing correction',()=>{
 assert.match(modelDescription(m,c).join(' '),/independent offline browser/);assert.ok(modelDescription(m,c).join(' ').includes(m.usage!.output_tokens.toLocaleString('en-US')));assert.match(modelDescription(argon,c).join(' '),/feedback-assisted framing correction/);assert.ok(modelEditorial(m,c).includes('href="/models/'));assert.equal(modelEditorial(m,c).includes('href="#model'),false);
 const noPrice={...m,price:undefined};assert.match(modelDescription(noPrice,c).join(' '),/verified price is unavailable/);assert.doesNotMatch(modelDescription(noPrice,c).join(' '),/\$0\.0000/);
});
test('static pages expose unique metadata, visible content and real VideoObjects without running JavaScript',()=>{
 const template=fs.readFileSync('index.html','utf8');const html=renderSeoDocument(template,c,'model/'+m.id);assert.match(html,/<video /);assert.match(html,/application\/ld\+json/);assert.ok(html.includes(m.video!));assert.ok(html.includes('in the animation coding benchmark'));assert.equal((html.match(/<title>/g)??[]).length,1);assert.equal((html.match(/name="description"/g)??[]).length,1);
 const d=pageSeo(c,'model/'+m.id);const v=d.structuredData['@graph'].find((x:any)=>x['@type']==='VideoObject') as any;assert.equal(v.contentUrl,siteOrigin+m.video);assert.equal(v.duration,'PT12S');assert.equal(v.uploadDate,c.publishedAt);assert.equal('aggregateRating' in v,false);
 const gallery=renderSeoDocument(template,c,'gallery');assert.ok(gallery.includes(modelPath(m)));assert.match(gallery,/An AI coding benchmark you can watch/);assert.match(renderSeoDocument(template,c,'missing'),/noindex,follow/);
});
test('video sitemap includes playable model pages and excludes private and unavailable records',()=>{
 const xml=siteMap(c);assert.match(xml,/xmlns:video=/);for(const model of c.models){if(model.video&&model.poster)assert.ok(xml.includes(siteOrigin+modelPath(model)));else assert.equal(xml.includes(siteOrigin+modelPath(model)),false)}assert.equal((xml.match(/<video:video>/g)??[]).length,c.models.filter(x=>x.video&&x.poster).length);assert.doesNotMatch(xml,/#model|\/runs\/|localhost|\.azure\.com/);
});
