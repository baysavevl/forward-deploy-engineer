import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const requiredIndexSections = [
  'match-check',
  'fde-proof',
  'experience',
  'education',
  'wonderful-fit',
  'profile-assistant',
  'links'
];

async function readText(path) {
  return readFile(path, 'utf8');
}

test('main profile is FDE-first and recruiter-readable', async () => {
  const html = await readText('index.html');

  assert.match(html, /Forward Deployed Engineer/i);
  assert.match(html, /Wonderful\.ai/i);
  assert.match(html, /99% match|100% match/i);
  assert.match(html, /Experience/i);
  assert.match(html, /Education/i);
  assert.match(html, /Zalo/i);

  for (const id of requiredIndexSections) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `Missing #${id}`);
  }

  assert.match(html, /data-company=["']wonderful["']/, 'Recruiter match flow needs Wonderful.ai option.');
  assert.match(html, /data-assistant-topic=/, 'Floating assistant needs selectable profile topics.');
  assert.match(html, /prefers-reduced-motion/, 'Reduced-motion CSS guard is required.');
});

test('main profile does not expose confusing raw markdown or unrelated role positioning', async () => {
  const html = await readText('index.html');

  assert.doesNotMatch(html, /href=["'][^"']+\.md["']/, 'Do not link recruiters to raw Markdown files.');
  assert.doesNotMatch(html, /Partner Solution Engineer/i, 'Do not present PSE as a target role.');
  assert.doesNotMatch(html, /Customer Solution Engineer/i, 'Do not present CSE as a target role.');
  assert.doesNotMatch(html, /SA\/PSE\/CSE|Solution Architect/i, 'Do not dilute the page with adjacent-role positioning.');
  assert.doesNotMatch(html, /Live deployment reasoning demo/i, 'Remove the confusing agent demo framing.');
  assert.doesNotMatch(html, /projects\/deployment-blueprint-lab|projects\/agent-eval-harness|projects\/partner-integration-runbook/, 'Mini labs should not be linked from the main profile.');
});

test('experience evidence is concrete enough for a recruiter to understand fit', async () => {
  const html = await readText('index.html');

  const requiredPhrases = [
    '30M+',
    'millions of daily business messages',
    '30% operational overhead reduction',
    '40% faster partner onboarding',
    '50% permission coverage',
    'SOX-compliant',
    'Vietnam/APAC'
  ];

  for (const phrase of requiredPhrases) {
    assert.match(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `Missing proof phrase: ${phrase}`);
  }
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
