import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const requiredIndexSections = [
  'match-check',
  'fde-proof',
  'case-evidence',
  'skills',
  'experience',
  'chatbot-lab',
  'playground',
  'education',
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
  assert.match(html, /Try the live chatbot/i);
  assert.match(html, /first concrete target/i);
  assert.match(html, /6\+ years/i);
  assert.match(html, /Experience/i);
  assert.match(html, /Education/i);
  assert.match(html, /Zalo/i);

  for (const id of requiredIndexSections) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `Missing #${id}`);
  }

  assert.match(html, /data-company=["']wonderful["']/, 'Recruiter match flow needs Wonderful.ai option.');
  assert.match(html, /Customer workflow agent/i, 'Profile should lead with an agent/workflow project signal.');
  assert.match(html, /Recruiter scorecard/i, 'Profile needs a concise screenable scorecard.');
  assert.match(html, /hot lead|recruiter chatbot|lead matching/i, 'Playground needs concrete recruiting-product examples.');
  assert.match(html, /self-built reasoning artifact/i, 'Playground must be framed as a self-built reasoning artifact.');
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

test('experience evidence is concrete enough for a recruiter to understand fit', async () => {
  const html = await readText('index.html');

  const requiredPhrases = [
    'ZNS',
    'previous product',
    '50k',
    '30% operational overhead reduction',
    '40% faster partner onboarding',
    'LifeService',
    'Job Market',
    'SOX-compliant',
    'Vietnam/APAC'
  ];

  for (const phrase of requiredPhrases) {
    assert.match(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Missing proof phrase: ${phrase}`);
  }
});

test('case evidence shows proof instead of self-scored fit', async () => {
  const html = await readText('index.html');

  const requiredCasePhrases = [
    'Job Market workflow automation',
    'Recruiter onboarding support',
    'ZNS / business messaging reliability',
    'Customer pain',
    'Owned',
    'Result',
    'FDE signal'
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
    'tool route',
    'guardrail',
    'metric',
    'next step'
  ];

  for (const phrase of requiredChatbotPhrases) {
    assert.match(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Missing chatbot phrase: ${phrase}`);
  }

  assert.match(html, /href=["']#chatbot-lab["']/i, 'Primary flow should link to the chatbot lab.');
  assert.match(html, /fetch\(["']\/api\/agent["']/i, 'Chatbot should call the local agent API.');
  assert.match(html, /aria-live=["']polite["']/i, 'Chatbot output should be announced accessibly.');
});

test('recruiter-facing sections avoid talking to itself', async () => {
  const html = await readText('index.html');

  assert.match(html, /Evidence before claims/i);
  assert.match(html, /If you are screening me for FDE/i);
  assert.match(html, /What to screen me for first/i);
  assert.doesNotMatch(html, /Researched FDE roles consistently ask/i);
});

test('local static links referenced by the profile are present', async () => {
  const html = await readText('index.html');
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
    { source: '/profile/role-fit-profile.md', destination: '/#experience', permanent: false }
  );
  assert.deepEqual(
    redirects.find((rule) => rule.source === '/profile/application-kit.md'),
    { source: '/profile/application-kit.md', destination: '/#experience', permanent: false }
  );
});

test('profile content stays credible and avoids implementation placeholders', async () => {
  const html = await readText('index.html');

  assert.doesNotMatch(html, /TBD|TODO|FIXME|lorem ipsum/i, 'Profile contains placeholder text');
  assert.doesNotMatch(html, /production customer deployment of this lab/i, 'Profile overstates mockup scope');
});
