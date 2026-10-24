import type {Model} from './types';
export const emptySourceHash='e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
export type Outcome={kind:'film'|'empty'|'runtime'|'pending'|'unavailable';title:string;detail:string;note:string;stages:{label:string;value:string}[]};
export function outcome(m:Model):Outcome{
 const u=m.finalUsage??m.usage;const empty=m.sourceHash===emptySourceHash,limited=['max_tokens','incomplete','length'].includes(m.stopReason??'');
 const reasoningOnly=!!u?.output_tokens&&u.reasoning_output_tokens===u.output_tokens;
 let kind:Outcome['kind'],title:string,detail:string,note='';
 if(m.status==='deployment-blocked'){kind='unavailable';title='Awaiting provider setup';detail='The model has not received the animation brief. Its deployment needs additional organization information before the provider can accept requests.';note='No animation attempt or quality result is attributed to this model.';}
 else if(m.status==='provider-unavailable'){kind='unavailable';title='Provider endpoint unavailable';detail='Azure reports the deployment as ready, but the provider endpoint does not recognize the deployed model. No animation response has been received.';note='This is provider availability, not an animation quality result.';}
 else if(m.completionPending){kind='pending';title='Model is repairing its scene';detail='The previous source had an execution problem. The model is receiving its own code and the real browser diagnostics to return a complete corrected scene.';}
 else if(m.repairUnavailable){kind='unavailable';title='Repair response unavailable';detail='The initial scene had an execution error. The model was given the code and browser feedback, but its repair request ended without a complete provider response. No final film could be recorded.';note=m.repairUnavailable;}
 else if(m.video){kind='film';title='Full animation recorded';detail='The submitted scene produced a complete 12-second film. Watch the actual movement, anatomy and interaction with the scene.';note=m.loopRequired===false?'This is a narrative short, not a loop. Inspect the bone retrieval and the final turn toward the viewer.':m.technicalChecks?.loop===false?'Loop discontinuity detected: the final boundary frame does not match the opening frame.':m.technicalChecks?.loop===true?'Opening and closing frames match. Inspect the transition in playback to judge whether movement flows naturally.':'Loop continuity has not been verified.';}
 else if(m.providerTruncation){kind='unavailable';title='Provider ended the response early';detail=`The provider marked the response as truncated after ${m.providerTruncation.reported.toLocaleString('en-US')} output tokens, below the requested ${m.providerTruncation.requested.toLocaleString('en-US')}. The incomplete source could not produce a full recording.`;note='This result includes a provider-side truncation; it does not establish failure under the requested output allowance.';}
 else if(empty){kind='empty';title='No animation code returned';detail=limited?'The response reached the shared output limit before returning an HTML scene. There was no animation code to execute or record.':'The provider response contained no HTML scene. There was no animation code to execute or record.';note=reasoningOnly?`All ${u!.output_tokens.toLocaleString('en-US')} output tokens were reported as reasoning. Input and output usage are still included in the cost.`:'The original response and its usage are retained; no replacement animation has been inserted.';}

 else if(m.status==='render-error'&&limited){kind='runtime';title='Animation code was cut off';detail='The response reached its output-token limit and returned an incomplete scene. The browser could not record a full animation from that source.';note='The final source and all reported usage are retained.';}
 else if(m.status==='render-error'){kind='runtime';title='Animation could not run';detail=m.errors?.length?'The model returned source code, but the browser encountered an execution error before a full film could be recorded.':'The returned scene did not satisfy the browser rendering interface, so a complete film could not be recorded.';note=m.errors?.[0]?.split('\n')[0]??'The source and capture diagnostics are available below.';}
 else if(m.status==='pending'||m.status==='generated'){kind='pending';title=m.workflowPhase==='generating'?'Generating the Pomeranian scene':m.workflowPhase==='recording'?'Recording the animation':m.status==='pending'?'Generation pending':'Recording pending';detail=m.workflowPhase==='generating'?'The model is building its own scene from the shared brief. The recording will appear here when generation and capture finish.':'This result is not complete yet. No visual outcome is claimed before recording finishes.';}
 else{kind='unavailable';title=m.status==='generation-unavailable'?'Generation unavailable':'Recording unavailable';detail=m.status==='infrastructure-unavailable'?'The recording environment was unavailable. This is an infrastructure issue, not a judgement of the model’s animation.':'The provider request did not produce an available result. No animation quality is inferred.';note=m.errors?.[0]?.split('\n')[0]??'';}
 const code=empty?'No HTML returned':m.sourceHash?'Source received':'Not available';
 return {kind,title,detail,note,stages:[{label:'Provider response',value:m.repairUnavailable?'Initial response received; repair interrupted':m.usage?'Received with token usage':m.status==='pending'?'Pending':'Unavailable'},{label:'Animation source',value:code},{label:'Browser recording',value:m.video?'360 frames recorded':kind==='empty'?'No scene to record':kind==='runtime'?'Stopped before completion':kind==='pending'?'Pending':'Unavailable'},{label:'Published film',value:m.video?'12 s · 30 fps · 960 × 540':'Not available'}]};
}
export const realismCriteria=[
 ['Pomeranian identity','A compact miniature spitz with a dense double coat, neck ruff, upright ears, short muzzle and plumed tail curled over its back.'],
 ['Grounded movement','Paws plant during running, braking, entry and reverse steps. The body and coat respond to weight transfer.'],
 ['Doghouse occlusion','The dog enters through the doorway. Walls and the threshold hide the correct body parts without clipping.'],
 ['Bone interaction','One bone leaves its resting place, is gripped between the jaws and travels with the muzzle without floating or duplication.'],
 ['Turn toward the viewer','The dog steps and rotates coherently to face the camera, keeping the bone in its mouth and its proportions consistent.'],
 ['Fur, light and finish','Volume, directional coat, coherent shadows and a readable front-facing final pose with subtle living motion.']
];

export function sceneNotice(m:Model):{title:string;detail:string}|null{
 if(!m.video)return null;
 if(m.framingReview&&m.framingReview.sourceHash===m.sourceHash&&m.framingReview.status==='framing-failed')return {title:'Scene outside the frame',detail:m.framingReview.note};
 if(m.technicalChecks?.motion===false)return {title:'Limited visible movement',detail:'Little movement was detected in the recorded images. The action may be static or outside the frame; this is a recording limitation, not a visual-quality score.'};
 return null;
}
