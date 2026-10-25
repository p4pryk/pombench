import type {Catalog, Model} from './types.ts';
import {newestFirst, publishedModels} from './catalog.ts';

export const siteOrigin = 'https://pombench.com';
/** First public publication of this benchmark. Later catalog updates use Catalog.publishedAt. */
export const FIRST_PUBLISHED_AT = '2026-10-24T17:33:46.803982+00:00';
/** Models added or recaptured on 25 Oct 2026. Their pages use the catalog timestamp. */
export const EXTENSION_IDS = new Set(['claude-fable-5-1', 'FW-GLM-5.3', 'qwen3.8-max', 'mistral-large-4', 'xiaomi-mimo-v2.6-pro', 'glm-5.3-flash']);
/** Newest benchmark additions. They lead "Latest models tested" even when the API release date is older. */
const LATEST_WAVE_IDS = ['glm-5.3-flash'];

const SLUG_OVERRIDES: Record<string, string> = {
  'FW-Kimi-K3': 'kimi-k3',
  'FW-GLM-5.3': 'glm-5-3',
  'Llama-4-Maverick-17B-128E-Instruct-FP8': 'llama-4-maverick',
  'Llama-4-Scout-17B-16E-Instruct': 'llama-4-scout',
};

/** Hand-picked rivals from the 24 Oct keyword pass. Names only; ranks are computed from the live catalog. */
const HAND_RIVALS: Record<string, string[]> = {
  'Claude Haiku 4.5': ['Claude Opus 4.8', 'Claude Sonnet 5', 'Mistral Large 3'],
  'Claude Haiku 5.5': ['Claude Sonnet 5.5', 'Claude Opus 5.5', 'Muse Wonder'],
  'Claude Opus 4.8': ['Claude Sonnet 5', 'Claude Opus 5', 'Mistral Medium 3.5'],
  'Claude Opus 5': ['Claude Sonnet 5', 'Claude Opus 4.8', 'Gemini 3.5 Flash-Lite'],
  'Claude Opus 5.5': ['Claude Sonnet 5.5', 'Gemini 4 Argon', 'GPT-6.1 Sol'],
  'Claude Sonnet 5': ['Claude Opus 5', 'Claude Opus 4.8', 'GPT-5.6 Luna'],
  'Claude Sonnet 5.5': ['Claude Opus 5.5', 'Claude Haiku 5.5', 'GPT-6.1 Sol'],
  'Codestral 2501': ['Mistral Large 3', 'Mistral Medium 3.5', 'Llama 4 Maverick'],
  'DeepSeek V4 Pro': ['DeepSeek V4.1 Flash', 'GPT-5.5', 'Mistral Medium 3.5'],
  'DeepSeek V4.1 Flash': ['DeepSeek V4 Pro', 'GPT-6 Astra', 'Gemini 3.8 Flash'],
  'GPT-4.1 Mini': ['GPT-4.1 Nano', 'GPT-OSS 120B', 'Llama 4 Maverick'],
  'GPT-4.1 Nano': ['GPT-4.1 Mini', 'GPT-OSS 120B', 'Llama 4 Maverick'],
  'GPT-4o Mini': ['GPT-4.1 Mini', 'GPT-4.1 Nano', 'Codestral 2501'],
  'GPT-5 Mini': ['GPT-5 Nano', 'GPT-OSS 120B', 'Claude Haiku 4.5'],
  'GPT-5 Nano': ['GPT-5 Mini', 'GPT-OSS 120B', 'Claude Haiku 4.5'],
  'GPT-5.3 Codex': ['GPT-5.4', 'GPT-5.4 Mini', 'Gemini 3.1 Pro Preview'],
  'GPT-5.4': ['GPT-5.3 Codex', 'GPT-5.4 Mini', 'Gemini 3.1 Pro Preview'],
  'GPT-5.4 Mini': ['GPT-5.4 Nano', 'GPT-5.4', 'Gemini 3.1 Pro Preview'],
  'GPT-5.4 Nano': ['GPT-5.4 Mini', 'GPT-5.4', 'Gemini 3.1 Pro Preview'],
  'GPT-5.5': ['GPT-5.4 Mini', 'GPT-5.4 Nano', 'DeepSeek V4 Pro'],
  'GPT-5.6 Luna': ['GPT-5.6 Sol', 'GPT-5.6 Terra', 'Kimi K3'],
  'GPT-5.6 Sol': ['GPT-5.6 Luna', 'GPT-5.6 Terra', 'Kimi K3'],
  'GPT-5.6 Terra': ['GPT-5.6 Luna', 'GPT-5.6 Sol', 'Kimi K3'],
  'GPT-6 Astra': ['GPT-6 Luna', 'GPT-6 Sol', 'Gemini 3.8 Flash'],
  'GPT-6 Luna': ['GPT-6 Sol', 'GPT-6.1 Sol', 'Claude Opus 5.5'],
  'GPT-6 Sol': ['GPT-6 Luna', 'GPT-6.1 Sol', 'Claude Opus 5.5'],
  'GPT-6.1 Sol': ['GPT-6 Sol', 'Gemini 4 Argon', 'Claude Opus 5.5'],
  'GPT-OSS 120B': ['GPT-5 Mini', 'GPT-5 Nano', 'Claude Haiku 4.5'],
  'Gemini 3.1 Pro Preview': ['Gemini 3.5 Flash-Lite', 'Gemini 3.8 Flash', 'GPT-5.3 Codex'],
  'Gemini 3.5 Flash-Lite': ['Gemini 3.8 Flash', 'Gemini 4 Argon', 'Claude Opus 5'],
  'Gemini 3.8 Flash': ['Gemini 4 Argon', 'Gemini 3.5 Flash-Lite', 'GPT-6 Astra'],
  'Gemini 4 Argon': ['Gemini 3.8 Flash', 'Claude Opus 5.5', 'GPT-6.1 Sol'],
  'GLM 5.3': ['GLM 5.3 Flash', 'MAI-Thinking-1', 'Claude Fable 5.1'],
  'GLM 5.3 Flash': ['GLM 5.3', 'DeepSeek V4.1 Flash', 'Gemini 3.8 Flash'],
  'Grok 4.7': ['GPT-6.1 Sol', 'Claude Opus 5.5', 'Gemini 4 Argon'],
  'Kimi K3': ['Kimi K3.1 Pro', 'Claude Sonnet 5', 'GPT-5.6 Sol'],
  'Llama 4 Maverick': ['Llama 4 Scout', 'Muse Wonder', 'GPT-4.1 Mini'],
  'Llama 4 Scout': ['Llama 4 Maverick', 'Muse Wonder', 'GPT-4.1 Mini'],
  'MAI-Thinking-1': ['Claude Opus 5', 'Gemini 3.8 Flash', 'GPT-6 Astra'],
  'Mistral Large 3': ['Mistral Medium 3.5', 'Codestral 2501', 'Claude Haiku 4.5'],
  'Mistral Medium 3.5': ['Mistral Large 3', 'Codestral 2501', 'DeepSeek V4 Pro'],
  'Kimi K3.1 Pro': ['Kimi K3', 'Claude Opus 5.5', 'Gemini 4 Argon'],
  'Muse Wonder': ['Llama 4 Maverick', 'Llama 4 Scout', 'Gemini 4 Argon'],
};

export const NAV_ITEMS: [string, string][] = [['gallery', 'AI coding benchmark'], ['compare', 'AI model comparison'], ['method', 'Method']];

export const escapeHtml = (v: unknown) => String(v ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');

function normalizedSlug(id: string) {
  return id.toLowerCase().replace(/[._\s]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function modelSlug(id: string) {
  if (SLUG_OVERRIDES[id]) return SLUG_OVERRIDES[id];
  const normalized = normalizedSlug(id);
  // Published id is glm-5.3-flash. Also accept an FW- prefixed alias so the page
  // stays on glm-5-3-flash and does not collide with glm-5-3.
  if (/^(?:fw-)?glm-5-3-flash$/.test(normalized)) return 'glm-5-3-flash';
  return normalized;
}

export const modelPath = (m: Pick<Model, 'id'>) => '/animations/' + modelSlug(m.id) + '/';
export const apiId = (m: Model) => m.apiModel || m.id;
export function modelByKey(models: Model[], key: string) {
  let decoded = key;
  try { decoded = decodeURIComponent(key); } catch { /* keep the raw segment */ }
  return models.find(m => m.id === decoded || m.id === key || modelSlug(m.id) === decoded || modelSlug(m.id) === modelSlug(decoded));
}
export const matchesPublished = (c: Catalog, key: string) => publishedModels(c.models).some(m => m.id === key || modelSlug(m.id) === key || modelSlug(m.id) === modelSlug(key));

export function routePath(route: string) {
  return route === 'gallery' ? '/' : route.startsWith('model/') ? modelPath({id: route.slice(6)}) : route === 'compare' || route === 'method' ? '/' + route + '/' : '/404/';
}
export function routeFromPath(path: string) {
  const p = path.replace(/\/+$/, '') || '/';
  if (p === '/') return 'gallery';
  if (p === '/compare' || p === '/method') return p.slice(1);
  const m = /^\/(?:animations|models)\/([^/]+)$/.exec(p);
  if (m) { try { return 'model/' + decodeURIComponent(m[1]); } catch { return 'missing'; } }
  return 'missing';
}
export function legacyRoute(hash: string) {
  const value = hash.replace(/^#/, '');
  if (['gallery', 'compare', 'method'].includes(value)) return value;
  if (/^model\/[^/]+$/.test(value)) { try { return decodeURIComponent(value); } catch { return null; } }
  return null;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function publishedLabel(iso: string) {
  const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
  return `${d} ${MONTHS[(m || 1) - 1]} ${y}`;
}
export const benchmarkName = (c: Catalog) => 'Benchmark ' + (c.version.startsWith('pombench-') ? c.version.slice('pombench-'.length) : c.version);
export const publishedLine = (c: Catalog) => `Results published ${publishedLabel(c.publishedAt)} · ${benchmarkName(c)}`;
export const modelTimestamp = (m: Model, c: Catalog) => EXTENSION_IDS.has(m.id) ? c.publishedAt : FIRST_PUBLISHED_AT;
const day = (iso: string) => iso.slice(0, 10);
const tokensOf = (m: Model) => m.usage?.output_tokens;
const tokenText = (m: Model) => tokensOf(m) === undefined ? 'unavailable' : tokensOf(m)!.toLocaleString('en-US');
const priced = (m: Model) => m.price?.usd != null;
export const costText = (m: Model) => priced(m) ? '$' + m.price!.usd.toFixed(4) : 'unavailable';
const costRankText = (m: Model) => priced(m) ? costText(m) : 'unavailable';

export function modelTitle(name: string) {
  const options = [
    `${name} Benchmark: Coding Test & Animation Result | PomBench`,
    `${name} Benchmark: Coding Test & Animation | PomBench`,
    `${name} Benchmark: Coding Test | PomBench`,
  ];
  return options.find(title => title.length <= 65) ?? options[2];
}

type RankTable = {tokenRank: Map<string, number>; costRank: Map<string, number>; n: number; nPriced: number};
function rankTable(models: Model[]): RankTable {
  const byTokens = [...models].sort((a, b) => (tokensOf(b) ?? -1) - (tokensOf(a) ?? -1) || a.name.localeCompare(b.name));
  const withPrice = models.filter(priced).sort((a, b) => a.price!.usd - b.price!.usd || a.name.localeCompare(b.name));
  return {
    tokenRank: new Map(byTokens.map((m, i) => [m.id, i + 1])),
    costRank: new Map(withPrice.map((m, i) => [m.id, i + 1])),
    n: models.length,
    nPriced: withPrice.length,
  };
}

function dateDistance(m: Model, other: Model) {
  const a = Date.parse((m.releasedAt ?? '1970-01-01') + 'T00:00:00Z');
  const b = Date.parse((other.releasedAt ?? '1970-01-01') + 'T00:00:00Z');
  return Math.abs(a - b);
}
function computedRivals(m: Model, models: Model[]) {
  const others = models.filter(x => x.id !== m.id);
  const byDate = (a: Model, b: Model) => dateDistance(m, a) - dateDistance(m, b) || a.name.localeCompare(b.name);
  const same = others.filter(x => x.provider === m.provider).sort(byDate);
  const cross = others.filter(x => x.provider !== m.provider).sort(byDate);
  const picked: Model[] = [];
  for (const item of same) { if (picked.length >= 2) break; picked.push(item); }
  for (const item of cross) { if (picked.length >= 3) break; picked.push(item); }
  return picked;
}
export function rivalsFor(m: Model, models: Model[]) {
  const named = HAND_RIVALS[m.name];
  if (named) {
    const found = named.map(name => models.find(x => x.name === name)).filter((x): x is Model => !!x);
    if (found.length) return found;
  }
  return computedRivals(m, models);
}
export function latestModels(models: Model[], excludeId?: string, count = 4) {
  const pool = models.filter(m => m.id !== excludeId);
  const lead = LATEST_WAVE_IDS.map(id => pool.find(m => m.id === id)).filter((m): m is Model => !!m);
  const rest = pool.filter(m => !lead.some(item => item.id === m.id)).sort(newestFirst);
  return [...lead, ...rest].slice(0, Math.max(count, lead.length));
}
const readyOf = (c: Catalog) => publishedModels(c.models);

function metaDescription(m: Model, rival: Model | undefined) {
  const costBit = priced(m) ? `known API cost ${costText(m)}` : 'verified price unavailable';
  const versus = rival ? rival.name : 'other models';
  const candidates = [
    `${m.name} coding test: watch the animation it coded. ${tokenText(m)} output tokens, ${costBit}. Compare ${m.name} vs ${versus}.`,
    `${m.name} coding test: watch the animation it coded. ${tokenText(m)} tokens, ${costBit}. Compare ${m.name} vs ${versus}.`,
    `${m.name} coding test: watch the animation it coded. ${tokenText(m)} tokens, ${costBit}. ${m.name} vs ${versus}.`,
  ];
  return candidates.find(text => text.length <= 160) ?? candidates[2];
}

function runNote(m: Model) {
  if (!m.framingRepair) return '';
  const scope = m.id === 'gemini-4-argon' ? 'both responses are counted in tokens and cost' : 'all completed responses are counted in tokens and cost';
  return `This result includes a feedback-assisted framing correction. The original film is retained, and ${scope}. `;
}

export function modelDescription(m: Model, c: Catalog) {
  const models = readyOf(c);
  const ranks = rankTable(models);
  const rivals = rivalsFor(m, models);
  const rival = rivals[0];
  const costClause = priced(m)
    ? `and the known API cost was ${costText(m)} (rank ${ranks.costRank.get(m.id)} of ${ranks.nPriced}, cheapest first). `
    : 'and a verified API price is unavailable for this run, so no cost is shown. ';
  const versus = rivals.slice(0, 2).map(item => item.name);
  const versusText = versus.length > 1 ? `${versus[0]} and ${versus[1]}` : (versus[0] ?? 'other models');
  const openrouter = m.inferenceSource === 'openrouter-api' ? ' This run was served through OpenRouter with one fixed upstream provider and fallbacks disabled.' : '';
  return [
    `${m.name} by ${m.provider} took the PomBench AI coding benchmark: every model gets the same prompt and writes self-contained browser code for a twelve-second scene: a Pomeranian runs across a backyard, jumps a puddle, enters its doghouse, retrieves a bone and turns toward the viewer. The video above is an independent offline browser recording of the code ${m.name} returned, captured at ${c.protocol.width} × ${c.protocol.height} and ${c.protocol.captureFps} fps, with no organizer edits to the code.`,
    `In this ${m.name} coding test the model produced ${tokenText(m)} output tokens, including provider-reported reasoning (rank ${ranks.tokenRank.get(m.id)} of ${ranks.n} by output tokens), ${costClause}${runNote(m)}Is ${m.name} good at coding? One task cannot answer that on its own, so this LLM coding benchmark lets you watch the result instead of reading a score: check the gait, the puddle jump and reflection, the doorway occlusion and whether the bone stays in the dog's mouth.${openrouter}`,
    `Then compare ${m.name} vs ${versusText} below, or open the AI model comparison to play up to four models on one synchronized timeline.`,
  ];
}

function vsHeading(m: Model, rivals: Model[]) {
  if (rivals.length >= 3) return `${m.name} vs ${rivals[0].name}, ${rivals[1].name} and ${rivals[2].name}`;
  if (rivals.length === 2) return `${m.name} vs ${rivals[0].name} and ${rivals[1].name}`;
  return rivals.length === 1 ? `${m.name} vs ${rivals[0].name}` : `${m.name} comparisons`;
}
export function comparePairPath(a: Pick<Model, 'id'>, b: Pick<Model, 'id'>) {
  return `/compare/?models=${modelSlug(a.id)},${modelSlug(b.id)}`;
}

export function modelEditorial(m: Model, c: Catalog) {
  const E = escapeHtml;
  const models = readyOf(c);
  const rivals = rivalsFor(m, models);
  const paragraphs = modelDescription(m, c);
  const latest = latestModels(models, m.id);
  const versus = rivals.slice(0, 2).map(item => item.name);
  const versusText = versus.length > 1 ? `${versus[0]} and ${versus[1]}` : (versus[0] ?? 'other models');
  const vs = rivals.map(rival => `<li><a href="${modelPath(rival)}">${E(m.name)} vs ${E(rival.name)}</a>: ${E(tokenText(m))} vs ${E(tokenText(rival))} output tokens; known API cost ${E(costRankText(m))} vs ${E(costRankText(rival))}. <a href="${comparePairPath(m, rival)}">Watch side by side</a></li>`).join('');
  return `<section class="model-editorial model-seo" aria-label="About this model's benchmark"><h2 id="how-performed">How ${E(m.name)} performed</h2><p>${E(paragraphs[0])}</p><p>${E(paragraphs[1])}</p><p>Then compare ${E(m.name)} vs ${E(versusText)} below, or open the <a href="/compare/">AI model comparison</a> to play up to four models on one synchronized timeline.</p></section><section class="model-vs" aria-labelledby="vs"><h2 id="vs">${E(vsHeading(m, rivals))}</h2><ul>${vs}</ul></section><section class="model-code" aria-labelledby="code"><h2 id="code">${E(m.name)} code</h2><p>${E(m.name)} wrote its own native browser animation code from the same prompt as every other model. One execution repair is available for empty, truncated or unexecutable code; the final response is kept, not a best-of selection.</p><p><a href="/results/PROMPT.md">Read the shared prompt</a> · <a href="/method/">How the LLM benchmark works</a></p></section><section class="model-latest" aria-labelledby="latest"><h3 id="latest">Latest models tested</h3><p class="related-models">${latest.map(item => `<a href="${modelPath(item)}">${E(item.name)}</a>`).join('')}<a href="/">All models</a></p></section>`;
}

export function factsList(m: Model) {
  const E = escapeHtml;
  const cost = priced(m) ? costText(m) : 'unavailable (no verified price)';
  return `<dl class="model-facts"><div class="model-stat"><dt>Vendor</dt><dd>${E(m.provider)}</dd></div><div class="model-stat"><dt>API model</dt><dd>${E(apiId(m))}</dd></div><div class="model-stat"><dt>Output tokens${m.unknownUsageRequests ? '*' : ''}</dt><dd>${E(tokenText(m))}</dd></div><div class="model-stat"><dt>Known API cost</dt><dd>${E(cost)}</dd></div></dl>`;
}

export function posterImg(m: Model, alt: string) {
  const base = m.base.replace(/\/$/, '');
  const small = `${base}/poster-480.webp`;
  const large = `${base}/poster-960.webp`;
  const E = escapeHtml;
  return `<img src="${E(small)}" srcset="${E(small)} 480w, ${E(large)} 960w" sizes="(max-width:600px) 92vw, 320px" width="960" height="540" loading="lazy" decoding="async" alt="${E(alt)}">`;
}
export function heroImg() {
  return `<img src="/assets/pomeranian-hero.webp" srcset="/assets/pomeranian-hero-800.webp 800w, /assets/pomeranian-hero.webp 1200w" sizes="(max-width:800px) 90vw, 560px" width="1200" height="800" alt="Illustration of a Pomeranian carrying a bone beside a doghouse" fetchpriority="high">`;
}
export function breadcrumb(m: Model) {
  const E = escapeHtml;
  return `<nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">PomBench</a> <span aria-hidden="true">›</span> <a href="/compare/">AI model comparison</a> <span aria-hidden="true">›</span> <span aria-current="page">${E(m.name)}</span></nav>`;
}
export function footerInner(c: Catalog) {
  const E = escapeHtml;
  const latest = latestModels(readyOf(c));
  return `<a class="footer-brand" href="/">PomBench</a><span>${E(publishedLine(c))}</span><a href="/compare/">AI model comparison</a><a href="/method/">LLM benchmark method</a><a href="/results/PROMPT.md">Shared prompt</a>${latest.map(m => `<a href="${modelPath(m)}">${E(m.name)}</a>`).join('')}`;
}
function extensionModels(c: Catalog) {
  return readyOf(c).filter(m => EXTENSION_IDS.has(m.id)).sort(newestFirst);
}
function linkedNames(models: Model[]) {
  return models.map(m => `<a href="${modelPath(m)}">${escapeHtml(m.name)}</a>`).join(', ');
}

export function galleryEditorial(c: Catalog) {
  const added = extensionModels(c);
  const addedSentence = added.length ? `<p>The ${escapeHtml(publishedLabel(c.publishedAt))} update adds ${linkedNames(added)}.</p>` : '';
  return `<section class="benchmark-intro"><h2>An LLM coding benchmark you can watch</h2><p>Most LLM benchmarks give you a single number. PomBench gives you the pixels: every model receives the same prompt and writes its own self-contained browser code for a twelve-second scene in which a Pomeranian runs, jumps a puddle, enters its doghouse, retrieves a bone and turns toward the camera. An independent offline browser records the result at ${c.protocol.width} × ${c.protocol.height} and ${c.protocol.captureFps} fps, and no organizer edits the model code.</p><p>Use it as a practical AI benchmark for creative coding: watch the movement, compare up to four models on one timeline, and check recorded output tokens and known API costs. It is a sample of animation programming, not an overall ranking of AI intelligence.</p>${addedSentence}<p><a href="/compare/">Open the AI model comparison</a> · <a href="/method/">How the LLM benchmark works</a> · <a href="/results/PROMPT.md">Read the shared prompt</a></p></section>`;
}
export function homeHero(c: Catalog) {
  const scene = c.version === 'pombench-v4' ? 'A Pomeranian, a puddle, a doghouse and a bone.' : 'A Pomeranian, a doghouse and a bone.';
  return `<section class="hero"><div class="hero-copy"><div class="eyebrow"><span class="tiny-paw">✦</span> THE LLM CODING BENCHMARK</div><h1>AI coding benchmark:<br><em>one little dog, every model.</em></h1><p class="lead">${escapeHtml(scene)}<br>The same coding brief, written as browser animation code by every model.</p><p class="meta-line">${escapeHtml(publishedLine(c))}</p><a class="button primary hero-cta" href="/compare/">Compare AI models <span>↗</span></a></div><figure class="hero-art">${heroImg()}</figure></section>`;
}

const FAQ = [
  ['Which AI is best for coding?', 'It depends on the task. PomBench tests one demanding task: writing a self-contained, twelve-second browser animation from a shared prompt. Watch the recordings to see which models produce coherent movement, then weigh output tokens and known API cost. It is one sample of programming ability, not an overall ranking.'],
  ['How do I compare AI models on PomBench?', 'Choose up to four models in the player above. Playback, seeking and speed are synchronized, so the same moment of the scene is shown for every model.'],
  ['Is every model given the same prompt?', 'Yes. Every model receives the same initial prompt and output allowance (32,768 tokens including reasoning, subject to lower provider ceilings). One execution repair is available for empty, truncated or unexecutable code, and no organizer edits model code.'],
  ['What do output tokens and known cost mean?', 'Output tokens are provider-reported and include reasoning once. Known cost uses recorded input and output at dated API rates, or the provider-reported charge for OpenRouter results. Missing prices are shown as unavailable, not zero.'],
] as const;

export function compareHead() {
  return `<section class="page-head"><h1>AI model comparison: four LLMs, one coding task</h1><p>Compare up to four models on the same twelve-second Pomeranian scene. The player synchronizes playback, seeking and speed, so you can inspect the same moment across models.</p><p>Every model writes its own native browser animation. Compare running, the puddle jump and reflection, doorway occlusion, bone retrieval and the final turn toward the camera. Output tokens include reasoning; known costs include completed responses and documented repairs.</p><noscript><p>Enable JavaScript for synchronized comparison, or open any model below to watch its recorded animation.</p></noscript></section>`;
}
export function compareTail(cards: string) {
  const faq = FAQ.map(([q, a]) => `<h3>${escapeHtml(q)}</h3><p>${escapeHtml(a)}${q.startsWith('Is every') ? ' <a href="/method/">Read the methodology</a>.' : ''}</p>`).join('');
  return `<section class="compare-seo"><h2>Looking for the best LLM for coding? Watch the same task side by side</h2><p>PomBench does not crown a single winner. It shows you how each LLM handles the same practical coding brief, a complete browser animation, and lets you judge the result yourself. Pick two to four models, press play, and compare movement, scene coherence, output tokens and known API cost on one timeline.</p></section><h2>All models in this AI model comparison</h2>${cards}<section class="faq"><h2>Which AI is best for coding? FAQ</h2>${faq}</section>`;
}
export function methodLinks(c: Catalog) {
  const models = readyOf(c);
  const latest = latestModels(models);
  const extra = extensionModels(c).filter(m => !latest.some(item => item.id === m.id));
  const links = [...latest, ...extra];
  return `<section class="method-links"><h2>The prompt and protocol</h2><p>Every model receives the same initial prompt. <a href="/results/PROMPT.md">Read the full shared prompt</a> or the <a href="/results/PROTOCOL.json">benchmark protocol (JSON)</a>. The complete result data is published as <a href="/results/index.json">results/index.json</a>.</p><h2>See the results</h2><p><a href="/">${BROWSE_HEADING}</a> · <a href="/compare/">Open the AI model comparison</a> · Latest: ${linkedNames(links)}</p></section>`;
}

export const BROWSE_HEADING = 'Browse the LLM coding benchmark results';
const HOME_TITLE = 'AI Coding Benchmark: Every Model, One Test | PomBench';
const HOME_DESCRIPTION = 'PomBench is an AI coding benchmark you can watch: every model writes code for the same 12-second Pomeranian animation. Compare output tokens and API costs.';
const COMPARE_TITLE = 'AI Model Comparison: Compare LLMs Side by Side | PomBench';
const COMPARE_DESCRIPTION = 'AI model comparison you can watch: play up to four LLMs side by side on the same coding task. Compare animation quality, output tokens and known API cost.';
const METHOD_TITLE = 'LLM Benchmark Method: How Our AI Coding Test Works | PomBench';
const METHOD_DESCRIPTION = 'How the PomBench LLM benchmark works: one shared prompt, original model code, an offline browser recording at 30 fps, recorded output tokens and known API cost.';

const logo = {'@type': 'ImageObject', url: siteOrigin + '/assets/logo-512.png', width: 512, height: 512};
function organization() {
  return {'@type': 'Organization', '@id': siteOrigin + '/#organization', name: 'PomBench', url: siteOrigin + '/', logo};
}
function website() {
  return {'@type': 'WebSite', '@id': siteOrigin + '/#website', name: 'PomBench', alternateName: 'PomBench AI coding benchmark', url: siteOrigin + '/', inLanguage: 'en', publisher: {'@id': siteOrigin + '/#organization'}};
}
function itemList(c: Catalog) {
  const models = readyOf(c).sort(newestFirst);
  return {'@type': 'ItemList', '@id': siteOrigin + '/#models', name: 'LLM coding benchmark results', numberOfItems: models.length, itemListOrder: 'https://schema.org/ItemListOrderDescending', itemListElement: models.map((m, i) => ({'@type': 'ListItem', position: i + 1, name: m.name, url: siteOrigin + modelPath(m)}))};
}
function breadcrumbList(items: {name: string; item: string}[], id?: string) {
  return {'@type': 'BreadcrumbList', ...(id ? {'@id': id} : {}), itemListElement: items.map((entry, i) => ({'@type': 'ListItem', position: i + 1, name: entry.name, item: entry.item}))};
}

export type PageSeo = {title: string; description: string; canonical: string | null; image: string; imageWidth: number; imageHeight: number; imageType: string; imageAlt: string; valid: boolean; model?: Model; structuredData: {'@context': string; '@graph': unknown[]}};

export function pageSeo(c: Catalog, route: string): PageSeo {
  const models = readyOf(c);
  const m = route.startsWith('model/') ? modelByKey(models, route.slice(6)) : undefined;
  const valid = ['gallery', 'compare', 'method'].includes(route) || !!m;
  const rivals = m ? rivalsFor(m, models) : [];
  const title = m ? modelTitle(m.name) : route === 'compare' ? COMPARE_TITLE : route === 'method' ? METHOD_TITLE : valid ? HOME_TITLE : 'Page not found | PomBench';
  const description = m ? metaDescription(m, rivals[0]) : route === 'compare' ? COMPARE_DESCRIPTION : route === 'method' ? METHOD_DESCRIPTION : valid ? HOME_DESCRIPTION : 'This PomBench page is unavailable. Explore the published model animations and the AI coding benchmark.';
  const canonical = valid ? siteOrigin + (m ? modelPath(m) : routePath(route)) : null;
  const hubImage = route === 'compare' ? '/assets/og-compare-1200x630.png' : '/assets/og-pombench-1200x630.jpg';
  const image = siteOrigin + (m?.poster ?? hubImage);
  const imageWidth = m ? 960 : 1200;
  const imageHeight = m ? 540 : 630;
  const imageType = m || route === 'compare' ? 'image/png' : 'image/jpeg';
  const imageAlt = m ? `${m.name} coding benchmark: animation frame` : route === 'compare' ? 'PomBench AI model comparison: four LLMs on one coding task' : 'PomBench AI coding benchmark: one Pomeranian animation, every model';
  const modified = day(c.publishedAt);
  const published = day(FIRST_PUBLISHED_AT);
  const graph: unknown[] = [organization(), website()];
  if (m && canonical) {
    const stamp = modelTimestamp(m, c);
    graph.push({
      '@type': 'WebPage', '@id': canonical + '#page', url: canonical, name: title, description, inLanguage: 'en',
      isPartOf: {'@id': siteOrigin + '/#website'}, datePublished: day(stamp), dateModified: day(stamp),
      primaryImageOfPage: image, about: {'@type': 'Thing', name: m.name, description: `${m.provider} language model, API model ${apiId(m)}`},
      mainEntity: {'@id': canonical + '#video'}, breadcrumb: {'@id': canonical + '#breadcrumb'},
    });
    graph.push({
      '@type': 'VideoObject', '@id': canonical + '#video', name: `${m.name} coding benchmark: PomBench Pomeranian animation`, description,
      thumbnailUrl: [image], uploadDate: stamp, duration: 'PT12S', contentUrl: siteOrigin + m.video, embedUrl: canonical + '#video',
      width: c.protocol.width, height: c.protocol.height, inLanguage: 'en', isFamilyFriendly: true,
      publisher: {'@id': siteOrigin + '/#organization'}, mainEntityOfPage: {'@id': canonical + '#page'},
    });
    graph.push(breadcrumbList([
      {name: 'PomBench', item: siteOrigin + '/'},
      {name: 'AI model comparison', item: siteOrigin + '/compare/'},
      {name: `${m.name} coding benchmark`, item: canonical},
    ], canonical + '#breadcrumb'));
  } else if (route === 'gallery') {
    graph.push({
      '@type': 'CollectionPage', '@id': siteOrigin + '/#page', url: siteOrigin + '/', name: title, description, inLanguage: 'en',
      isPartOf: {'@id': siteOrigin + '/#website'}, datePublished: published, dateModified: modified,
      primaryImageOfPage: image, mainEntity: {'@id': siteOrigin + '/#models'},
    });
    graph.push(itemList(c));
  } else if (route === 'compare') {
    graph.push({
      '@type': 'WebPage', '@id': siteOrigin + '/compare/#page', url: siteOrigin + '/compare/', name: title, description, inLanguage: 'en',
      isPartOf: {'@id': siteOrigin + '/#website'}, datePublished: published, dateModified: modified, mainEntity: {'@id': siteOrigin + '/#models'},
    });
    graph.push(breadcrumbList([{name: 'PomBench', item: siteOrigin + '/'}, {name: 'AI model comparison', item: siteOrigin + '/compare/'}]));
    graph.push(itemList(c));
    graph.push({'@type': 'FAQPage', '@id': siteOrigin + '/compare/#faq', mainEntity: FAQ.map(([name, text]) => ({'@type': 'Question', name, acceptedAnswer: {'@type': 'Answer', text: name.startsWith('How do I') ? text.replace(' above', '') : text}}))});
  } else if (route === 'method') {
    graph.push({
      '@type': 'WebPage', '@id': siteOrigin + '/method/#page', url: siteOrigin + '/method/', name: title, description, inLanguage: 'en',
      isPartOf: {'@id': siteOrigin + '/#website'}, datePublished: published, dateModified: modified, about: {'@id': siteOrigin + '/#dataset'},
    });
    graph.push(breadcrumbList([{name: 'PomBench', item: siteOrigin + '/'}, {name: 'LLM benchmark method', item: siteOrigin + '/method/'}]));
    graph.push({
      '@type': 'Dataset', '@id': siteOrigin + '/#dataset', name: 'PomBench v4: LLM coding benchmark results',
      description: `Results of the PomBench AI coding benchmark (${benchmarkName(c).toLowerCase()}, published ${publishedLabel(c.publishedAt)}). Each language model receives the same prompt and writes self-contained browser code for a twelve-second Pomeranian animation. The dataset lists, per model, the recorded animation (${c.protocol.width} x ${c.protocol.height}, ${c.protocol.captureFps} fps), provider-reported output tokens including reasoning, and known API cost at dated rates.`,
      url: siteOrigin + '/method/', sameAs: siteOrigin + '/', datePublished: published, dateModified: modified, version: c.version,
      creator: {'@id': siteOrigin + '/#organization'}, publisher: {'@id': siteOrigin + '/#organization'},
      isAccessibleForFree: true, inLanguage: 'en', keywords: ['AI coding benchmark', 'LLM coding benchmark', 'LLM benchmark', 'AI model comparison'],
      variableMeasured: ['Output tokens (including reasoning)', 'Known API cost (USD)', 'Recorded animation'],
      distribution: [{'@type': 'DataDownload', encodingFormat: 'application/json', contentUrl: siteOrigin + '/results/index.json'}],
    });
  }
  return {title, description, canonical, image, imageWidth, imageHeight, imageType, imageAlt, valid, model: m, structuredData: {'@context': 'https://schema.org', '@graph': valid ? graph : []}};
}

export function seoHead(c: Catalog, route: string) {
  const d = pageSeo(c, route);
  const E = escapeHtml;
  const canonical = d.canonical ? `<link rel="canonical" href="${E(d.canonical)}"><meta property="og:url" content="${E(d.canonical)}">` : '';
  const video = d.model?.video ? `<meta property="og:video" content="${E(siteOrigin + d.model.video)}"><meta property="og:video:type" content="video/mp4"><meta property="og:video:width" content="${c.protocol.width}"><meta property="og:video:height" content="${c.protocol.height}">` : '';
  const schema = d.valid ? `<script type="application/ld+json" id="page-schema">${JSON.stringify(d.structuredData).replaceAll('<', '\\u003c')}</script>` : '';
  return `<title>${E(d.title)}</title><meta name="description" content="${E(d.description)}"><meta name="robots" content="${d.valid ? 'index,follow,max-image-preview:large,max-video-preview:-1' : 'noindex,follow'}">${canonical}<meta property="og:site_name" content="PomBench"><meta property="og:type" content="${d.model ? 'video.other' : 'website'}"><meta property="og:title" content="${E(d.title)}"><meta property="og:description" content="${E(d.description)}"><meta property="og:image" content="${E(d.image)}"><meta property="og:image:width" content="${d.imageWidth}"><meta property="og:image:height" content="${d.imageHeight}"><meta property="og:image:type" content="${d.imageType}"><meta property="og:image:alt" content="${E(d.imageAlt)}">${video}<meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${E(d.title)}"><meta name="twitter:description" content="${E(d.description)}"><meta name="twitter:image" content="${E(d.image)}">${schema}`;
}

function staticCards(c: Catalog) {
  const E = escapeHtml;
  return `<div class="gallery" id="gallery-cards">${readyOf(c).sort(newestFirst).map(m => `<article class="model-card"><a class="card-image" href="${modelPath(m)}">${posterImg(m, `${m.name} coding benchmark animation preview`)}</a><div class="card-body"><h3><a href="${modelPath(m)}">${E(m.name)}</a></h3><p>${E(m.provider)} · ${E(tokenText(m))} output tokens</p><p>${priced(m) ? E(costText(m)) + ' known cost' : 'Known cost unavailable'}</p></div></article>`).join('')}</div>`;
}

function shell(c: Catalog, body: string) {
  const nav = NAV_ITEMS.map(([key, label]) => `<a href="${routePath(key)}">${escapeHtml(label)}</a>`).join('');
  return `<a class="skip" href="#main-content">Skip to content</a><header><a href="/" class="brand" aria-label="PomBench home">Pom<b>Bench</b></a><nav aria-label="Main navigation">${nav}</nav></header><main class="container" id="main-content">${body}</main><footer class="footer">${footerInner(c)}</footer>`;
}

export function staticBody(c: Catalog, route: string) {
  const E = escapeHtml;
  const d = pageSeo(c, route);
  const m = d.model;
  let body = '';
  if (m) {
    const rival = rivalsFor(m, readyOf(c))[0];
    const compareHref = rival ? comparePairPath(m, rival) : '/compare/';
    const compareLabel = rival ? `Compare ${m.name} vs ${rival.name}` : 'Compare AI models';
    body = `${breadcrumb(m)}<section class="model-head"><div><h1>${E(m.name)} coding benchmark</h1><p>${E(m.provider)} · API model <code>${E(apiId(m))}</code>${m.inferenceSource === 'openrouter-api' ? ' · via OpenRouter' : ''} · ${E(publishedLine(c))}</p></div><a class="button primary" href="${compareHref}">${E(compareLabel)} ↗</a></section><div class="model-layout"><div class="model-stage"><div class="screen"><video src="${E(m.video)}" poster="${E(m.poster)}" width="960" height="540" controls controlslist="nodownload" muted playsinline preload="metadata" aria-label="${E(m.name)} coding benchmark: recorded 12-second Pomeranian animation"></video></div>${modelEditorial(m, c)}</div><aside class="model-info"><section class="stats-panel"><h2>${E(m.name)} at a glance</h2>${factsList(m)}${m.framingRepair ? `<p>${E(m.framingRepair.note)}</p>` : ''}${m.priceUnavailableReason ? '<p class="stat-note">Cost unavailable: a verified price for this deployed version has not been found. Missing pricing is not treated as zero.</p>' : ''}</section></aside></div>`;
  } else if (route === 'gallery') {
    body = `${homeHero(c)}<h2>${BROWSE_HEADING}</h2><p>Each card opens one model's recorded animation with its output tokens and known API cost. Newest models first.</p>${staticCards(c)}${galleryEditorial(c)}`;
  } else if (route === 'compare') body = `${compareHead()}${compareTail(staticCards(c))}`;
  else if (route === 'method') body = methodDocument(c);
  else body = `<section class="page-head"><h1>Page not found</h1><p>This animation is not published or this address does not exist.</p><a class="button" href="/">Explore the model animations</a></section>`;
  return shell(c, body);
}

function methodDocument(c: Catalog) {
  const E = escapeHtml;
  return `<section class="method-head"><h1>How the PomBench LLM benchmark works</h1><p>One shared prompt. Original model code. Independently recorded pixels.</p><p class="meta-line">${E(publishedLine(c))}</p></section><div class="method-grid"><article><h2>The AI coding test: one shared task</h2><p>Each model creates a twelve-second scene: a Pomeranian runs through a backyard, jumps over a puddle, lands, enters its doghouse, retrieves a bone, backs out and faces the camera. Models choose their own layout, rendering style and lighting. No reference artwork or scene template is supplied.</p><h2>Seven things to look for</h2><ol>${(c.protocol.visualCriteria ?? []).map(item => `<li>${E(item)}</li>`).join('')}</ol></article><article><h2>Shared brief and recorded evidence</h2><p>Models accessed through Microsoft Foundry, Google Vertex AI and OpenRouter receive the same initial prompt. OpenRouter additions fix a named model and upstream provider with fallbacks disabled. Output tokens include reasoning and generated code. Empty, truncated or unexecutable code can receive a model-authored execution repair; all completed responses are counted. The final response is kept, not a best-of selection.</p><p>Gemini 4 Argon and Xiaomi MiMo-V2.6-Pro also received recorded visibility diagnostics to correct out-of-frame scenes. Their model pages identify the feedback-assisted corrections. All completed responses are included in tokens and cost; the original recordings are retained. No organizer manually edits model code. Browser checks cover execution, movement, repeatability and offline operation; they do not grade anatomy, visual realism or narrative success.</p><h2>Tokens and known cost</h2><p>An offline browser captures 360 frames at 960 × 540, at 30 fps. The site plays those recorded films. Provider-reported output includes reasoning once; known cost uses recorded input and output at dated API rates, or the terminal provider-reported charge for OpenRouter results. Missing receipts or prices remain unavailable, not zero.</p></article></div>${methodLinks(c)}`;
}

export function renderSeoDocument(template: string, c: Catalog, route: string) {
  return template.replace(/<title>[\s\S]*?<\/title>/, '').replace(/<meta name="description"[^>]*>/, '').replace('</head>', seoHead(c, route) + '</head>').replace('<div id="app"></div>', `<div id="app" data-prerendered="true">${staticBody(c, route)}</div>`);
}

export function siteMap(c: Catalog) {
  const E = escapeHtml;
  const hub = (path: string) => `<url><loc>${siteOrigin}${path}</loc><lastmod>${E(c.publishedAt)}</lastmod></url>`;
  const pages = readyOf(c).sort(newestFirst).map(m => {
    const seo = pageSeo(c, 'model/' + m.id);
    const stamp = modelTimestamp(m, c);
    return `<url><loc>${E(siteOrigin + modelPath(m))}</loc><lastmod>${E(stamp)}</lastmod><video:video><video:thumbnail_loc>${E(siteOrigin + m.poster)}</video:thumbnail_loc><video:title>${E(m.name + ' coding benchmark: PomBench Pomeranian animation')}</video:title><video:description>${E(seo.description)}</video:description><video:content_loc>${E(siteOrigin + m.video)}</video:content_loc><video:duration>12</video:duration><video:publication_date>${E(stamp)}</video:publication_date><video:family_friendly>yes</video:family_friendly></video:video></url>`;
  }).join('');
  return `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">${hub('/')}${hub('/compare/')}${hub('/method/')}${pages}</urlset>`;
}

export const robotsText = `User-agent: *\nAllow: /\nDisallow: /runs/\nDisallow: /scripts/\nDisallow: /spec/\nDisallow: /tests/\nSitemap: ${siteOrigin}/sitemap.xml\n`;
