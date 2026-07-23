import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const requiredIndexSections = [
  'help',
  'chatbot-lab',
  'star-stories',
  'ai-product',
  'wonderful-fit',
  'links'
];

async function readText(path) {
  return readFile(path, 'utf8');
}

test('main profile is FDE-first and recruiter-readable', async () => {
  const html = await readText('index.html');

  assert.match(html, /Forward Deployed Engineer/i);
  assert.match(html, /Wonderful\.ai/i);
  assert.match(html, /Try the live chatbot|Try the demo/i);
  assert.match(html, /first concrete target/i);
  assert.match(html, /6\+ years/i);
  assert.match(html, /I'm here to help/i);
  assert.match(html, /Why Wonderful, why me/i);
  assert.match(html, /Zalo/i);

  for (const id of requiredIndexSections) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `Missing #${id}`);
  }

  assert.match(html, /Customer Workflow Chatbot/i, 'Profile should expose an agent/workflow project signal.');
  assert.match(html, /STAR stories/i, 'Profile needs structured interview evidence.');
  assert.match(html, /Zalo lead matching|Recruiter support/i, 'Demo needs concrete recruiting-product examples.');
  assert.match(html, /advisory, onsite implementation, and an enterprise platform/i, 'Profile should show understanding of Wonderful product motion.');
  assert.match(html, /href=["']\/bio\.html["']/i, 'Detailed bio should move to a subpage.');
  assert.match(html, /prefers-reduced-motion/, 'Reduced-motion CSS guard is required.');
});

test('main profile does not expose confusing raw markdown, old claims, or floating assistant UI', async () => {
  const html = await readText('index.html');

  assert.doesNotMatch(html, /href=["'][^"']+\.md["']/, 'Do not link recruiters to raw Markdown files.');
  assert.doesNotMatch(html, /Partner Solution Engineer/i, 'Do not present PSE as a target role.');
  assert.doesNotMatch(html, /Customer Solution Engineer/i, 'Do not present CSE as a target role.');
  assert.doesNotMatch(html, /SA\/PSE\/CSE|Solution Architect/i, 'Do not dilute the page with adjacent-role positioning.');
  assert.doesNotMatch(html, /Live deployment reasoning demo/i, 'Remove the confusing agent demo framing.');
  assert.doesNotMatch(html, /profile-assistant|data-open-assistant|data-assistant-topic/i, 'Floating assistant should be removed.');
  assert.doesNotMatch(html, /background-size:\s*44px 44px/i, 'Grid background should be removed.');
  assert.doesNotMatch(html, /50% permission coverage|permission-control coverage by 50%|50% coverage/i, 'Remove unclear permission coverage claim.');
  assert.doesNotMatch(html, /99% match|100% match/i, 'Remove self-scored match claims.');
  assert.doesNotMatch(html, /From 80% strong engineer to 100% after onboarding/i, 'Replace percentage fit framing with evidence-led readiness.');
  assert.doesNotMatch(html, /Not a lifelong FDE yet/i, 'Remove self-conscious FDE framing.');
});

test('landing evidence is concrete enough for a recruiter to understand fit', async () => {
  const html = await readText('index.html');

  const requiredPhrases = [
    'ZNS',
    '80M',
    '30% operational overhead reduction',
    '40% faster partner onboarding',
    'Job Market',
    'SOX-compliant',
    'Vietnam',
    'almost $300M'
  ];

  for (const phrase of requiredPhrases) {
    assert.match(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Missing proof phrase: ${phrase}`);
  }
});

test('STAR evidence shows proof instead of self-scored fit', async () => {
  const html = await readText('index.html');

  const requiredCasePhrases = [
    'Job Market workflow automation',
    'Recruiter onboarding support',
    'AI matching cost at Zalo scale',
    'Leading a team that levels up',
    'Situation',
    'Task',
    'Action',
    'Result',
    'all members were promoted'
  ];

  for (const phrase of requiredCasePhrases) {
    assert.match(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Missing case evidence phrase: ${phrase}`);
  }
});

test('profile exposes an interactive FDE chatbot project', async () => {
  const html = await readText('index.html');

  const requiredChatbotPhrases = [
    'Customer Workflow Chatbot',
    'Try the live chatbot',
    'Ask the bot',
    'data-chat-form',
    'data-chat-input',
    'data-chat-log',
    'data-prompt',
    '/api/agent',
    'localWorkflowReply',
    'Zalo lead matching',
    'Recruiter support',
    'tool route',
    'guardrail',
    'metric',
    'next step',
    'data-visit-beacon'
  ];

  for (const phrase of requiredChatbotPhrases) {
    assert.match(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Missing chatbot phrase: ${phrase}`);
  }

  assert.match(html, /href=["']#chatbot-lab["']/i, 'Primary flow should link to the chatbot lab.');
  assert.match(html, /fetch\(["']\/api\/agent["']/i, 'Chatbot should call the local agent API.');
  assert.match(html, /aria-live=["']polite["']/i, 'Chatbot output should be announced accessibly.');
});

test('chatbot layout is viewport-safe and follows the cleaner reference pattern', async () => {
  const html = await readText('index.html');

  assert.match(html, /--google-blue/i, 'Design system should expose Google-inspired color tokens.');
  assert.match(html, /--surface/i, 'Design system should use a neutral surface token.');
  assert.match(html, /grid-template-columns:\s*minmax\(0,\s*0\.92fr\)\s+minmax\(360px,\s*1\.08fr\)/i, 'Chatbot should be a two-column product surface on desktop.');
  assert.match(html, /@media\s*\(max-width:\s*860px\)[\s\S]*\.chat-shell\s*\{[\s\S]*grid-template-columns:\s*1fr/i, 'Chatbot should collapse to one column before tablet/mobile.');
  assert.match(html, /\.chat-log\s*\{[\s\S]*height:\s*clamp\(180px,\s*28vh,\s*280px\)/i, 'Chat log height must be viewport-relative, not a fixed oversized block.');
  assert.match(html, /\.chat-insights\s*\{[\s\S]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/i, 'Readout should wrap into readable two-column rows.');
  assert.match(html, /overflow-wrap:\s*anywhere/i, 'Long route/metric strings need wrapping protection.');
  assert.doesNotMatch(html, /grid-template-columns:\s*minmax\(250px,\s*0\.3fr\)\s+minmax\(0,\s*1fr\)/i, 'Remove the old heavy sidebar shell.');
  assert.doesNotMatch(html, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+minmax\(260px,\s*0\.34fr\)/i, 'Remove the nested three-column chatbot layout.');
  assert.doesNotMatch(html, /height:\s*380px/i, 'Fixed 380px chat log caused mobile layout break.');
});

test('visit notification is wired for Telegram without exposing secrets', async () => {
  const html = await readText('index.html');
  const visitApi = await readText('api/visit.js');

  assert.match(html, /sendVisitBeacon/i);
  assert.match(html, /navigator\.sendBeacon|fetch\(["']\/api\/visit["']/i);
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

test('recruiter-facing sections avoid talking to itself', async () => {
  const html = await readText('index.html');

  assert.match(html, /structured proof, not a longer resume/i);
  assert.match(html, /Give me one messy workflow/i);
  assert.match(html, /Why Wonderful, why me/i);
  assert.doesNotMatch(html, /Researched FDE roles consistently ask/i);
});

test('local static links referenced by the profile are present', async () => {
  const html = `${await readText('index.html')}\n${await readText('bio.html')}`;
  const localHrefs = [...html.matchAll(/href=["']([^"']+)["']/g)]
    .map((match) => match[1])
    .filter((href) => href.startsWith('/') && !href.startsWith('//'))
    .filter((href) => !href.startsWith('/#'));

  for (const href of localHrefs) {
    const path = href.replace(/^\//, '').split('#')[0];
    if (!path || path === 'index.html') continue;
    assert.equal(existsSync(path), true, `Broken local link: ${href}`);
  }
});

test('legacy markdown URLs redirect to the profile instead of rendering raw markdown', async () => {
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

test('profile content stays credible and avoids implementation placeholders', async () => {
  const html = await readText('index.html');

  assert.doesNotMatch(html, /TBD|TODO|FIXME|lorem ipsum/i, 'Profile contains placeholder text');
  assert.doesNotMatch(html, /production customer deployment of this lab/i, 'Profile overstates mockup scope');
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
});
