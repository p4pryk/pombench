import {test} from 'node:test';import assert from 'node:assert/strict';import {outcome,emptySourceHash,sceneNotice} from '../src/outcome';import type {Model} from '../src/types';
const model=(extra:Partial<Model>)=>({id:'sample',name:'Sample',provider:'Example',version:'1',status:'render-error',reasoningEffort:'low',technicalTotal:7,...extra}) as Model;
test('a reasoning-only capped response has a specific diagnosis rather than a fabricated runtime error',()=>{const r=outcome(model({sourceHash:emptySourceHash,stopReason:'max_tokens',usage:{input_tokens:10,output_tokens:16384,reasoning_output_tokens:16384,total_tokens:16394,cached_input_tokens:0,cache_write_input_tokens:0}}));assert.equal(r.kind,'empty');assert.match(r.detail,/output limit/);assert.match(r.note,/All 16,384/);assert.equal(r.stages[2].value,'No scene to record')});
test('a complete film with a loop defect remains playable and reports the specific limitation',()=>{const r=outcome(model({status:'captured',video:'/film.mp4',technicalChecks:{loop:false} as Model['technicalChecks']}));assert.equal(r.kind,'film');assert.match(r.note,/Loop discontinuity/);assert.equal(r.stages[2].value,'360 frames recorded')});
test('runtime errors, pending generations and infrastructure failures stay distinct',()=>{assert.match(outcome(model({errors:['ReferenceError: missing is not defined\n at frame']})).note,/ReferenceError/);assert.equal(outcome(model({status:'pending'})).kind,'pending');assert.match(outcome(model({status:'infrastructure-unavailable'})).detail,/infrastructure/)});

test('the Pomeranian film is a narrative ending, not a failed loop',()=>{const r=outcome(model({status:'captured',video:'/dog.mp4',loopRequired:false,technicalChecks:{loop:false} as Model['technicalChecks']}));assert.equal(r.kind,'film');assert.match(r.note,/not a loop/);assert.doesNotMatch(r.note,/discontinuity/)});

test('provider onboarding and unavailable deployments are not presented as failed model animations',()=>{const onboarding=outcome(model({status:'deployment-blocked'}));assert.equal(onboarding.kind,'unavailable');assert.match(onboarding.title,/provider setup/);assert.match(onboarding.detail,/has not received/);const endpoint=outcome(model({status:'provider-unavailable'}));assert.match(endpoint.title,/endpoint unavailable/);assert.match(endpoint.note,/not an animation quality result/)});

test('truncated source is explained as an output-budget failure rather than a made-up JavaScript exception',()=>{const r=outcome(model({status:'render-error',stopReason:'length',sourceHash:'received-truncated-source',errors:[]}));assert.match(r.title,/cut off/);assert.match(r.detail,/output-token limit/);assert.equal(r.kind,'runtime')});

test('an early provider truncation is distinct from exhausting the requested budget',()=>{const r=outcome(model({status:'render-error',stopReason:'incomplete',providerTruncation:{requested:32768,reported:12106}}));assert.equal(r.kind,'unavailable');assert.match(r.title,/Provider ended/);assert.match(r.detail,/below the requested 32,768/);assert.doesNotMatch(r.title,/output-budget failure/)});

test('capture success cannot hide a failed motion check or a source-bound framing failure',()=>{
 const film=model({status:'captured',video:'/film.mp4',sourceHash:'current',technicalChecks:{motion:false} as Model['technicalChecks']});
 assert.match(sceneNotice(film)!.title,/Limited visible movement/);
 assert.match(sceneNotice({...film,framingReview:{sourceHash:'current',status:'framing-failed',note:'Dog is below the canvas.',reviewedAt:'2026-10-24'}})!.title,/outside the frame/);
 assert.match(sceneNotice({...film,framingReview:{sourceHash:'old',status:'framing-failed',note:'Stale review',reviewedAt:'2026-10-24'}})!.title,/Limited visible movement/);
 assert.equal(sceneNotice({...film,technicalChecks:{motion:true} as Model['technicalChecks']}),null);
 assert.equal(sceneNotice({...film,video:undefined}),null);
});
