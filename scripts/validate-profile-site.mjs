import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const pages = [
  'index.html',
  'diagnose.html',
  'toolkit.html',
  'why-wonderful.html',
  'why-me.html'
];

const removedPages = [
  'explain.html',
  'bio.html',
  'let-me-help.html',
  'projects/deployment-blueprint-lab.html',
  'projects/agent-eval-harness.html',
  'projects/partner-integration-runbook.html'
];

async function readText(path) {
  return readFile(path, 'utf8');
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('landing is an English Forward Deployed Engineer hiring brief', async () => {
  const html = await readText('index.html');

  const required = [
    'Vinh Luu - Forward Deployed Engineer',
    'Forward Deployed Engineer',
    'I turn ambiguous enterprise problems into production AI systems.',
    'Profile summary',
    'Production AI delivery across product, systems, and customers.',
    'What I can own as a Forward Deployed Engineer',
    'From customer pain to production system.',
    'Skill map',
    'Working skills for deployed AI systems.',
    'Customer discovery and scoping',
    'Solution architecture',
    'Enterprise integration',
    'AI workflow delivery',
    'Governance and safety',
    'Reusable delivery assets',
    'Run live case',
    'Open CV',
    'https://www.linkedin.com/in/vinhluulinked/',
    'AI deployment assistant',
    'Live case room: convert ambiguity into an AI deployment plan.',
    'Eval harness',
    'Technical case',
    'AI matching at Zalo scale: quality, trust, and safe rollout.',
    'Wonderful match',
    'Role attributes matched to evidence.',
    'Supporting material',
    'Evidence package.',
    'VinhLuu_Forward_Deploy_Engineer.pdf',
    'data-chatbot',
    'data-chat-form',
    'data-chat-input',
    'data-chat-log',
    'data-prompt',
    'data-planner',
    'data-generate-plan',
    'aria-live="polite"',
    'data-visit-beacon'
  ];

  for (const phrase of required) {
    assert.match(html, new RegExp(escapeRegex(phrase), 'i'), `Missing landing phrase: ${phrase}`);
  }

  assert.match(html, /<html lang=["']en["']>/i);
  assert.match(html, /href=["']\/why-wonderful\.html["']/i);
  assert.match(html, /href=["']\/why-me\.html["']/i);
  assert.match(html, /href=["']\/output\/pdf\/VinhLuu_Forward_Deploy_Engineer\.pdf["']/i);
  assert.match(html, /href=["']#skill-map["']/i);
  assert.doesNotMatch(html, /href=["']\/explain\.html["']/i);
  assert.doesNotMatch(html, /href=["']\/bio\.html["']/i);
  assert.doesNotMatch(html, /href=["']\/let-me-help\.html["']/i);
  assert.doesNotMatch(html, /href=["']\/projects\//i);
});

test('public pages stay English-only and avoid amateur framing', async () => {
  const html = (await Promise.all(pages.map((page) => readText(page)))).join('\n');
  const vietnameseCharacters = /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ]/;

  assert.doesNotMatch(html, vietnameseCharacters, 'Public site should stay English-only.');
  assert.doesNotMatch(html, /lang=["']vi["']/i);
  assert.doesNotMatch(html, /FDE ROLES - WONDERFUL\.AI FIRST CONCRETE TARGET/i);
  assert.doesNotMatch(html, /Google SA|Google Architect|The reference is|Last section fixed/i);
  assert.doesNotMatch(html, /This is not a company fan page|Open these only|Bio infographic/i);
  assert.doesNotMatch(html, /Give me a messy workflow\. I will scope|Give me one messy customer workflow/i);
  assert.doesNotMatch(html, /The clearest proof|I build stuff|Run fit ramp|Small playground/i);
  assert.doesNotMatch(html, /quiet at first|FDE-shaped|almost ready/i);
  assert.doesNotMatch(html, /Interview recovery|first-round|first interview|This is the last impression/i);
  assert.doesNotMatch(html, /30-second recruiter read|Why bring Vinh|technical round|Read this as role fit|The relevant question is simple/i);
  assert.doesNotMatch(html, /Hiring screen|Next round|Everything a hiring team needs|Move to hiring manager review|Ask him to design/i);
  assert.doesNotMatch(html, /AI cost simulator|data-cost-lab|Token cost per useful match/i);
  assert.doesNotMatch(html, /href=["']\/let-me-help\.html["']/i);
  assert.doesNotMatch(html, /href=["'][^"']+\.md["']/i, 'Do not link recruiters to raw Markdown files.');
});

test('removed noisy surfaces are not public pages anymore', async () => {
  for (const page of removedPages) {
    assert.equal(existsSync(page), false, `${page} should not remain as a public page`);
  }

  const config = JSON.parse(await readText('vercel.json'));
  const redirects = config.redirects || [];
  for (const source of ['/bio.html', '/explain.html', '/let-me-help.html', '/projects/deployment-blueprint-lab.html']) {
    assert.ok(redirects.some((rule) => rule.source === source), `Missing redirect for ${source}`);
  }
});

test('shared design protects layout across viewport sizes', async () => {
  const css = await readText('assets/fde-workbench.css');

  assert.match(css, /box-sizing:\s*border-box/i);
  assert.match(css, /overflow-x:\s*hidden/i);
  assert.match(css, /overflow-wrap:\s*anywhere/i);
  assert.match(css, /grid-template-columns:\s*minmax\(0,\s*0\.82fr\)\s+minmax\(390px,\s*0\.72fr\)/i);
  assert.match(css, /\.chat-log\s*\{[\s\S]*height:\s*clamp\(180px,\s*25vh,\s*260px\)/i);
  assert.match(css, /@media\s*\(max-width:\s*1040px\)[\s\S]*grid-template-columns:\s*1fr/i);
  assert.match(css, /@media\s*\(max-width:\s*1040px\)[\s\S]*\.page-hero\s+\.hero-grid/i);
  assert.match(css, /@media\s*\(max-width:\s*920px\)[\s\S]*\.nav\s*\{[\s\S]*display:\s*none/i);
  assert.match(css, /@media\s*\(max-width:\s*760px\)[\s\S]*grid-template-columns:\s*1fr/i);
  assert.match(css, /prefers-reduced-motion/i);
  assert.match(css, /shortlist-card/i);
  assert.match(css, /capability-grid/i);
  assert.match(css, /skill-grid/i);
  assert.match(css, /proof-matrix/i);
  assert.match(css, /proof-grid\s*\{[\s\S]*repeat\(3,\s*minmax\(0,\s*1fr\)\)/i);
  assert.doesNotMatch(css, /height:\s*380px/i);
  assert.doesNotMatch(css, /background-size:\s*44px 44px/i);
  assert.doesNotMatch(css, /cost-lab|slider-grid|cost-output/i);
});

test('chatbot project is interactive and English-only', async () => {
  const html = await readText('index.html');
  const js = await readText('assets/fde-workbench.js');
  const api = await readText('api/agent.js');

  for (const phrase of ['Lead matching', 'Recruiter support', 'Risky action', 'tool route', 'guardrail', 'metric']) {
    assert.match(html, new RegExp(escapeRegex(phrase), 'i'), `Missing chatbot UI phrase: ${phrase}`);
  }

  assert.match(js, /fetch\(["']\/api\/agent["']/i);
  assert.match(js, /AbortController/i);
  assert.match(js, /localWorkflowReply/i);
  assert.match(js, /navigator\.sendBeacon|fetch\(["']\/api\/visit["']/i);
  assert.match(api, /Always answer in English/i);
  assert.match(api, /Mention Wonderful only when the user asks about company fit or role match/i);
  assert.match(api, /GEMINI_TIMEOUT_MS/i);
  assert.match(api, /controller\.abort/i);
  assert.doesNotMatch(api, /Vietnamese|focusVi|Response language:\s*Vietnamese/i);
});

test('homepage includes a real work-sample layer for recruiters and hiring managers', async () => {
  const html = await readText('index.html');
  const js = await readText('assets/fde-workbench.js');
  const css = await readText('assets/fde-workbench.css');

  for (const phrase of [
    'Flagship work sample',
    'Live case room: convert ambiguity into an AI deployment plan.',
    'data-review-mode="recruiter"',
    'data-review-mode="manager"',
    'Trace view',
    'data-trace-intent',
    'data-trace-policy',
    'Eval harness',
    'Technical case',
    'AI matching at Zalo scale',
    'Signal filter',
    'Architecture review',
    'Skill map',
    'Working skills for deployed AI systems',
    'Business translation',
    'Engage enterprise customers and uncover operational pain',
    'Convert open-ended requirements into scalable architecture',
    'Build AI-powered agents that integrate with workflows',
    'Own production outcomes and continuous improvement'
  ]) {
    assert.match(html, new RegExp(escapeRegex(phrase), 'i'), `Missing work-sample phrase: ${phrase}`);
  }

  assert.match(js, /workflowSamples/i);
  assert.match(js, /deploymentPlans/i);
  assert.match(js, /bindPlanner/i);
  assert.doesNotMatch(js, /bindCostLab|data-cost/i);
  assert.match(css, /planner-grid/i);
  assert.match(css, /brief-console/i);
  assert.match(css, /eval-table/i);
});

test('diagnostic and toolkit remain useful supporting tools', async () => {
  const diagnostic = await readText('diagnose.html');
  const toolkit = await readText('toolkit.html');
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
    'Useful match rate',
    'Efficiency metric',
    'Pilot one segment'
  ]) {
    assert.match(diagnostic, new RegExp(escapeRegex(phrase), 'i'), `Missing diagnostic phrase: ${phrase}`);
  }

  for (const phrase of [
    'FDE conversation kit',
    'CTO',
    'Business owner',
    'Operations',
    'People',
    'What I would ask',
    'What evidence I bring',
    'How I would answer',
    'Which systems are source of truth',
    'Zalo-scale production',
    'start read-only, add eval gates, expose traces'
  ]) {
    assert.match(toolkit, new RegExp(escapeRegex(phrase), 'i'), `Missing toolkit phrase: ${phrase}`);
  }

  assert.match(js, /diagnosticRules/i);
  assert.match(js, /updateDiagnostic/i);
  assert.match(js, /const stakeholders/i);
  assert.match(js, /bindToolkit/i);
  assert.doesNotMatch(js, /bindExplainer|const concepts/i);
});

test('Wonderful match and evidence pages answer the role evidence problem', async () => {
  const match = await readText('why-wonderful.html');
  const evidence = await readText('why-me.html');

  for (const phrase of [
    'Enterprise AI deployment, mapped to my operating strengths',
    'What the role requires in practice',
    'Customer discovery in local enterprise environments',
    'Architecture that survives real business load',
    'AI agents connected to actual workflows',
    'Production ownership, not demo ownership',
    'Governance and reliability mindset',
    'Reusable delivery assets',
    'Public references used for context'
  ]) {
    assert.match(match, new RegExp(escapeRegex(phrase), 'i'), `Missing Wonderful match proof: ${phrase}`);
  }

  for (const phrase of [
    'Matching quality at Zalo scale',
    'Situation',
    'Task',
    'Action',
    'Result',
    '80M-user ecosystem',
    '40%',
    '30%',
    'all team members were promoted',
    'Technical conviction, not generic sales talk'
  ]) {
    assert.match(evidence, new RegExp(escapeRegex(phrase), 'i'), `Missing evidence proof: ${phrase}`);
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

test('legacy markdown and removed page URLs redirect to focused surfaces', async () => {
  const config = JSON.parse(await readText('vercel.json'));
  const redirects = config.redirects || [];

  assert.deepEqual(
    redirects.find((rule) => rule.source === '/profile/role-fit-profile.md'),
    { source: '/profile/role-fit-profile.md', destination: '/why-me.html', permanent: false }
  );
  assert.deepEqual(
    redirects.find((rule) => rule.source === '/profile/application-kit.md'),
    { source: '/profile/application-kit.md', destination: '/why-me.html', permanent: false }
  );
  assert.deepEqual(
    redirects.find((rule) => rule.source === '/bio.html'),
    { source: '/bio.html', destination: '/output/pdf/VinhLuu_Forward_Deploy_Engineer.pdf', permanent: false }
  );
  assert.deepEqual(
    redirects.find((rule) => rule.source === '/explain.html'),
    { source: '/explain.html', destination: '/why-wonderful.html', permanent: false }
  );
  assert.deepEqual(
    redirects.find((rule) => rule.source === '/let-me-help.html'),
    { source: '/let-me-help.html', destination: '/#workbench', permanent: false }
  );
});

test('profile content stays credible and avoids implementation placeholders', async () => {
  const html = (await Promise.all(pages.map((page) => readText(page)))).join('\n');

  assert.doesNotMatch(html, /TBD|TODO|FIXME|lorem ipsum/i, 'Profile contains placeholder text');
  assert.doesNotMatch(html, /production customer deployment of this lab/i, 'Profile overstates mockup scope');
});
