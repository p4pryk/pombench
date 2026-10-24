# PomBench — The puddle, the Pomeranian and the bone (v4)

Create the most realistic, sophisticated 12-second animal animation you can
implement with native browser graphics. ONE miniature Pomeranian dog runs across
a backyard, jumps over ONE shallow puddle on the way into its doghouse, retrieves
ONE bone, backs out with it, then turns
its head and body toward the viewer, proudly holding the bone in its mouth.
Finish with that readable frontal pose. This is a short narrative, NOT a loop.

Aim for believable animal anatomy, material, weight and purposeful action, rather
than a cartoon, flat icon, toy, infographic or slideshow. Choose the composition,
camera, yard design, lighting, palette and implementation yourself. Canvas 2D,
2.5D or WebGL are allowed: realism of the final pixels and movement is the target.
No scene template or reference artwork is provided.

## Recognisable miniature Pomeranian
Show one small, compact dog with a thick orange / cream double coat, a pronounced
neck ruff, short pointed muzzle, small upright triangular ears, dark expressive
eyes, four anatomically articulated legs with small paws, and a full plumed tail
curled over the back. Preserve its identity, proportions, fur volume and skeleton
through side, rear, three-quarter and frontal views. It must read as a Pomeranian,
not a generic fox, wolf, large spitz or a round silhouette with stick legs.

## One continuous action, in this order
- 0–1 s: establish the backyard, dog, doghouse doorway and bone inside. The dog
  notices its goal. Establish the shallow puddle on the approach as an obstacle.
  Keep the bone discoverable without labels, arrows or text.
- 1–3 s: the dog runs toward the doghouse. Show a coherent four-legged gait,
  paw contacts, weight transfer, head stabilisation and coat / tail follow-through.
  During this approach it anticipates, takes off, clears the puddle completely,
  lands on dry ground and continues toward the doorway without a cut or reset.
- 3–4.5 s: the dog actually enters through the doorway, head and forequarters
  first. The doorway and walls must occlude the body correctly. The rear and
  curled tail can remain visible; no passing through solid walls or roof.
- 4.5–6 s: it lowers its head, opens its mouth and grips the bone. The bone leaves
  its original resting position once. Show enough of the interaction through the
  doorway to understand the grab; do not conceal the retrieval with a cut.
- 6–8 s: it backs out through the doorway with the bone held between its jaws.
  Its paws support the reverse motion. The bone moves rigidly with the mouth,
  with plausible orientation and occlusion; no floating, duplication or teleport.
- 8–10 s: the dog turns smoothly to face the viewer, stepping / pivoting its paws
  and rotating its body, head, ears and curled tail coherently. The bone stays in
  its jaws. Reveal real changing volume rather than flipping a flat drawing.
- 10–12 s: settle into a clear front-facing presentation, looking toward the
  camera with the bone visible. Maintain this final pose with subtle breathing,
  ear / coat response and restrained tail movement. No return to the house,
  camera cut, sudden reset, fade to black or end card.

## New challenge: clear the puddle and land naturally
Add ONE shallow, still puddle across the dog’s approach to the doorway. Its size,
shape and position are your choice, but it must be a visible obstacle that the
small dog can realistically clear. Keep the leap and landing fully inside the
frame; scene composition and visual style remain entirely your decision.

- Show readable anticipation: shorten the final running stride, lower the body,
  load the hind legs, then push off from the near dry bank.
- All four paws leave the ground. The dog’s centre of mass follows a smooth
  arcing trajectory while the legs tuck and extend coherently. The coat and tail
  respond to the jump without detaching, changing breed or stretching the body.
- Clear the far edge with the whole body and paws. Land on dry ground: forepaws
  make contact before or with the hind paws, joints compress to absorb weight,
  then the dog resumes supported forward motion and enters the house.
- Render a reflection of the actual dog only inside the puddle’s water surface.
  The reflected pose, position and orientation must follow the dog consistently
  during approach and flight, with correct masking at the water boundary. This
  is a reflection of the same animal, not a second dog or an unrelated shadow.
- Keep the puddle in place throughout the film. No teleport across the obstacle,
  walking through the water, instantaneous pose swap or hiding the landing behind
  the doghouse. Preserve the original bone retrieval and final front-facing pose.

The additional visual criterion is **puddle clearance, weight-bearing landing
and coherent water reflection**. These are judged from the recorded animation,
not from a model’s claims, variable names or a claimed physics simulation.

## Realism and scene coherence
- Paws remain planted during stance. Shoulders, hips, spine and head respond to
  locomotion, braking, reverse steps and the final turn. Bend joints plausibly;
  avoid skating, detached limbs, mechanical oscillation and elastic cartoon motion.
- Build fur from underlying body volume, coherent shading and directional texture.
  Avoid thick outlines, flat orange fill, plastic highlights or giant cartoon eyes.
- The doghouse has readable depth, a real doorway and a darker interior. Keep it
  large enough for the dog to enter. Use consistent occlusion at its threshold.
- Maintain exactly one bone. Its resting contact, mouth grip, movement and depth
  order must stay consistent. The retrieval and final face are central to the task.
- Use coherent light and shadows, contact shadows that follow paws and body,
  a grounded yard surface, and useful depth. Keep the scene sufficiently lit to
  inspect the interaction. Decoration cannot substitute for the animal action.
- Use a continuous stable camera, preferably a readable three-quarter view where
  the doorway, approach, reverse motion and final front-facing dog remain visible.
  Do not let the doghouse or foreground conceal most of the important action.
- Prioritise a complete functioning animal and object interaction over excessive
  decorative effects or a huge unfinished renderer. Finish the executable scene.

## Exact delivery contract
Return ONE complete HTML document, and nothing else. No explanation or Markdown.
Use one visible <canvas id="stage" width="960" height="540"></canvas> for the
entire visible output. Body margin is zero; stage size is exactly 960×540 CSS
pixels. Draw all output on that canvas. Use inline native browser JavaScript and
styles, Canvas 2D or WebGL. No libraries, imports, network, fetch, external fonts,
audio, embedded photographs, pre-rendered videos, base64 images, iframes, external
assets, user input, CSS animation, timers or your own requestAnimationFrame loop.

Expose synchronous window.renderFrame(timeSeconds). Any call must completely
and immediately draw that frame, depending only on the supplied time and fixed
constants. The recorder seeks out of order. Clear / redraw the whole canvas on
every call. All noise, particles and fur variation must be deterministic.
For t < 0 use the opening state; for t >= 12 hold the exact state at t=12.
Do NOT reduce time modulo 12: this film does not loop or return to its opening.
Call renderFrame(0) once at startup. The recorder drives animation playback.
Keep HTML below 180,000 UTF-8 bytes. Do not add scoring or benchmark telemetry.

## Equal completion opportunity and evidence
Every model receives these exact initial prompt bytes and no tools. Up to 32,768
output tokens are requested, including any internal reasoning and the entire HTML.
The provider's lower output ceiling applies where necessary (16,384 for GPT-4o
variants). Low reasoning effort is used where supported; optional Haiku thinking
is disabled. Other models use their supported low-effort or native configuration.
Keep planning concise and reserve enough budget to return the complete document.

If the source is empty or fails to execute, each model has ONE conditional repair
opportunity with its own source and the actual recorder diagnostics. Return a full
corrected document if that opportunity is used. There are at most two completed
creative responses per model. There is no aesthetic feedback, human code repair,
or best-of selection; the final completed response is retained, and all known
request usage is included. Transport failures are recorded separately and may
receive one infrastructure retry with unchanged request settings.

An independent offline browser captures real 960×540 pixels at 30 fps for twelve
seconds, including the final boundary and repeat samples sought out of order.
It checks execution, visible output, movement, repeatability and offline operation.
It does not infer dog anatomy, jump clearance, water reflections, bone contact or narrative success from source-code
keywords or changed pixels. No loop-closure requirement applies to this task.

The visual result is inspected for Pomeranian identity and natural anatomy;
grounded running; anticipation, puddle clearance, weight-bearing landing and
water reflection; entry and reverse gait; correct doghouse occlusion; a single
bone actually gripped and carried; a coherent turn toward the viewer; fur, light,
contact and readable final framing. Deliver the actual animation, not claims that
these requirements have been satisfied. There is no self-reported score.
