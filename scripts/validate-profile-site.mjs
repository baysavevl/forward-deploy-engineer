import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const pages = [
  'index.html',
  'diagnose.html',
  'explain.html',
  'toolkit.html',
  'why-wonderful.html',
  'why-me.html',
  'let-me-help.html',
  'bio.html'
];

async function readText(path) {
  return readFile(path, 'utf8');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('landing is a Wonderful FDE product hub, not a long one-page resume', async () => {
  const html = await readText('index.html');

  const required = [
    'Wonderful FDE Workbench',
    'Forward Deployed Engineer, shown as a working product',
    "I'm here to help Wonderful deploy enterprise agents in Vietnam",
    'This is not a long resume page',
    'Agent Deployment Diagnostic',
    'Wonderful motion explained',
    'FDE conversation kit',
    'Why Wonderful',
    'Why me',
    'Let me help',
    'Give me one messy customer workflow',
    'data-chatbot',
    'data-chat-form',
    'data-chat-input',
    'data-chat-log',
    'data-prompt',
    'aria-live="polite"',
    'data-visit-beacon'
  ];

  for (const phrase of required) {
    assert.match(html, new RegExp(escapeRegex(phrase), 'i'), `Missing landing phrase: ${phrase}`);
  }

  assert.match(html, /href=["']\/diagnose\.html["']/i);
  assert.match(html, /href=["']\/explain\.html["']/i);
  assert.match(html, /href=["']\/toolkit\.html["']/i);
  assert.match(html, /href=["']\/why-wonderful\.html["']/i);
  assert.match(html, /href=["']\/why-me\.html["']/i);
  assert.match(html, /href=["']\/let-me-help\.html["']/i);
  assert.match(html, /href=["']\/bio\.html["']/i);
});

test('landing stays clean and avoids the previous confusing framing', async () => {
  const html = await readText('index.html');

  assert.doesNotMatch(html, /FDE ROLES - WONDERFUL\.AI FIRST CONCRETE TARGET/i);
  assert.doesNotMatch(html, /href=["'][^"']+\.md["']/i, 'Do not link recruiters to raw Markdown files.');
  assert.doesNotMatch(html, /Partner Solution Engineer|Customer Solution Engineer|SA\/PSE\/CSE/i);
  assert.doesNotMatch(html, /99% match|100% match|Not a lifelong FDE yet/i);
  assert.doesNotMatch(html, /id=["']star-stories["']|id=["']ai-product["']|id=["']wonderful-fit["']/i, 'STAR detail belongs on subpages now.');
});

test('shared workbench design protects layout across viewport sizes', async () => {
  const css = await readText('assets/fde-workbench.css');

  assert.match(css, /box-sizing:\s*border-box/i);
  assert.match(css, /overflow-x:\s*hidden/i);
  assert.match(css, /overflow-wrap:\s*anywhere/i);
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*0\.82fr\)\s+minmax\(390px,\s*0\.72fr\)/i);
  assert.match(css, /\.chat-log\s*\{[\s\S]*height:\s*clamp\(180px,\s*25vh,\s*260px\)/i);
  assert.match(css, /@media\s*\(max-width:\s*1040px\)[\s\S]*grid-template-columns:\s*1fr/i);
  assert.match(css, /@media\s*\(max-width:\s*920px\)[\s\S]*\.nav\s*\{[\s\S]*display:\s*none/i);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*grid-template-columns:\s*1fr/i);
  assert.match(css, /prefers-reduced-motion/i);
  assert.doesNotMatch(css, /height:\s*380px/i);
  assert.doesNotMatch(css, /background-size:\s*44px 44px/i);
});

test('chatbot project is interactive and uses the local agent API with fallback', async () => {
  const html = await readText('index.html');
  const js = await readText('assets/fde-workbench.js');
  const api = await readText('api/agent.js');

  for (const phrase of ['Lead matching', 'Recruiter support', 'Risky action', 'tool route', 'guardrail', 'metric']) {
    assert.match(html, new RegExp(escapeRegex(phrase), 'i'), `Missing chatbot UI phrase: ${phrase}`);
  }

  assert.match(js, /fetch\(["']\/api\/agent["']/i);
  assert.match(js, /localWorkflowReply/i);
  assert.match(js, /navigator\.sendBeacon|fetch\(["']\/api\/visit["']/i);
  assert.match(api, /Wonderful is an AI transformation partner/i);
  assert.match(api, /advisory, onsite implementation/i);
  assert.match(api, /platform ownership/i);
  assert.match(api, /enterprise angle is scale, governance, security, compliance, and privacy/i);
});

test('diagnostic page provides a separate five-question tool', async () => {
  const html = await readText('diagnose.html');
  const js = await readText('assets/fde-workbench.js');

  for (const phrase of [
    'Agent Deployment Diagnostic',
    'Five questions',
    'What should the first agent improve',
    'How ready is the data',
    'Where must the agent live',
    'What is the risk level',
    'What proves value',
    'data-diagnostic',
    'data-result-workflow',
    'data-result-route',
    'data-result-guardrail',
    'data-result-metric',
    'data-result-next'
  ]) {
    assert.match(html, new RegExp(escapeRegex(phrase), 'i'), `Missing diagnostic phrase: ${phrase}`);
  }

  assert.match(js, /diagnosticRules/i);
  assert.match(js, /updateDiagnostic/i);
});

test('explainer and toolkit pages provide reference-style tools', async () => {
  const explainer = await readText('explain.html');
  const toolkit = await readText('toolkit.html');
  const js = await readText('assets/fde-workbench.js');

  for (const phrase of ['Wonderful, translated into deployment work', 'Advisory', 'Onsite implementation', 'Platform ownership', 'Governance', 'AI cost']) {
    assert.match(explainer, new RegExp(escapeRegex(phrase), 'i'), `Missing explainer phrase: ${phrase}`);
  }

  for (const phrase of ['FDE conversation kit', 'CTO', 'Business owner', 'Operations', 'Hiring team', 'What I would ask', 'What evidence I bring', 'How I would answer']) {
    assert.match(toolkit, new RegExp(escapeRegex(phrase), 'i'), `Missing toolkit phrase: ${phrase}`);
  }

  assert.match(js, /const concepts/i);
  assert.match(js, /const stakeholders/i);
  assert.match(js, /bindExplainer/i);
  assert.match(js, /bindToolkit/i);
});

test('why pages answer the interview problem with STAR proof and product understanding', async () => {
  const whyWonderful = await readText('why-wonderful.html');
  const whyMe = await readText('why-me.html');
  const help = await readText('let-me-help.html');

  for (const phrase of ['AI transformation partner', 'advisory', 'onsite implementation', 'governed platform', '100+ paying clients', '30+ locations', 'Almost $300M', 'Vietnam is on the Q3 map']) {
    assert.match(whyWonderful, new RegExp(escapeRegex(phrase), 'i'), `Missing Wonderful proof: ${phrase}`);
  }

  for (const phrase of ['AI matching cost at Zalo scale', 'Situation', 'Task', 'Action', 'Result', '80M-user ecosystem', '40%', '30%', 'all team members were promoted', 'Sales owns pipeline']) {
    assert.match(whyMe, new RegExp(escapeRegex(phrase), 'i'), `Missing Why me proof: ${phrase}`);
  }

  for (const phrase of ['Give me one messy customer workflow', 'First 30 days', 'Learn the platform and playbooks', 'Map first customer workflows', 'Build a narrow pilot', 'Make it ownable', 'AI that improves products and operations']) {
    assert.match(help, new RegExp(escapeRegex(phrase), 'i'), `Missing help proof: ${phrase}`);
  }
});

test('visit notification is wired for Telegram without exposing secrets', async () => {
  const visitApi = await readText('api/visit.js');
  const js = await readText('assets/fde-workbench.js');

  assert.match(js, /sendVisitBeacon/i);
  assert.match(visitApi, /TELEGRAM_BOT_TOKEN/);
  assert.match(visitApi, /TELEGRAM_VISIT_CHAT_ID/);
  assert.match(visitApi, /TELEGRAM_CHAT_ID/);
  assert.match(visitApi, /sendMessage/);
  assert.match(visitApi, /inline_keyboard/);
  assert.match(visitApi, /Mark lead/);
  assert.match(visitApi, /Info/);
  assert.match(visitApi, /Block/);
  assert.doesNotMatch(visitApi, /\b\d{8,}:[A-Za-z0-9_-]{20,}\b/, 'Telegram bot token must not be hardcoded.');
});

test('all local static links referenced by public pages are present', async () => {
  const html = (await Promise.all(pages.map((page) => readText(page)))).join('\n');
  const localHrefs = [...html.matchAll(/href=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((href) => href.startsWith('/') && !href.startsWith('//'))
    .filter((href) => !href.startsWith('/#'));

  for (const href of localHrefs) {
    const path = href.replace(/^\//, '').split(/[?#]/)[0];
    if (!path || path === 'index.html') continue;
    assert.equal(existsSync(path), true, `Broken local link: ${href}`);
  }
});

test('legacy markdown URLs redirect to the bio page instead of rendering raw markdown', async () => {
  const config = JSON.parse(await readText('vercel.json'));
  const redirects = config.redirects || [];

  assert.deepEqual(
    redirects.find((rule) => rule.source === '/profile/role-fit-profile.md'),
    { source: '/profile/role-fit-profile.md', destination: '/bio.html#experience', permanent: false }
  );
  assert.deepEqual(
    redirects.find((rule) => rule.source === '/profile/application-kit.md'),
    { source: '/profile/application-kit.md', destination: '/bio.html#experience', permanent: false }
  );
});

test('bio subpage carries detailed infographic content off the landing page', async () => {
  const html = await readText('bio.html');

  assert.match(html, /Bio infographic/i);
  assert.match(html, /id=["']experience["']/i);
  assert.match(html, /id=["']skills["']/i);
  assert.match(html, /id=["']education["']/i);
  assert.match(html, /Lead Software Engineer, Zalo/i);
  assert.match(html, /80M/i);
  assert.match(html, /AI workflows/i);
  assert.match(html, /href=["']\/#bot["']/i);
});

test('profile content stays credible and avoids implementation placeholders', async () => {
  const html = (await Promise.all(pages.map((page) => readText(page)))).join('\n');

  assert.doesNotMatch(html, /TBD|TODO|FIXME|lorem ipsum/i, 'Profile contains placeholder text');
  assert.doesNotMatch(html, /production customer deployment of this lab/i, 'Profile overstates mockup scope');
});
