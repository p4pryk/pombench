import type {Model} from './types.ts';
export const generatedTokens=(model:Model)=>model.usage?.output_tokens;
export function newestFirst(a:Model,b:Model){return (b.releasedAt??'').localeCompare(a.releasedAt??'')||a.name.localeCompare(b.name)}
export function comparisonModels(models:Model[],ids:string[],count:number){const ready=publishedModels(models).sort(newestFirst),selected:Model[]=[];for(const id of ids){const m=ready.find(m=>m.id===id);if(m&&!selected.some(x=>x.id===id))selected.push(m);if(selected.length===count)break}for(const m of ready){if(selected.length>=count)break;if(!selected.some(x=>x.id===m.id))selected.push(m)}return selected}

// Publication requires a completed recording, not merely a deployment or token receipt.
// index.json also lists unpublished runs (render-error, provider-unavailable) and their usage.
// The site does not link to them. Leaving those records in the public file is an owner decision.
export const publishedModels=(models:Model[])=>models.filter(m=>m.status==='captured'&&!!m.video&&!!m.poster);
