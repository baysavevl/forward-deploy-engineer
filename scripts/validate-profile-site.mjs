import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const requiredIndexSections = [
  'operating-system',
  'human-story',
  'skill-map',
  'case-evidence',
  'wonderful-fit',
  'mini-labs',
  'demo',
  'links'
];

const projectPages = [
  {
    path: 'projects/deployment-blueprint-lab.html',
    title: 'Deployment Blueprint Lab',
    required: ['data-blueprint-stage', 'Customer chaos', 'Production outcome']
  },
  {
    path: 'projects/agent-eval-harness.html',
    title: 'Agent Eval Harness',
    required: ['data-eval-scenario', 'Unsafe action', 'Launch gate']
  },
  {
    path: 'projects/partner-integration-runbook.html',
    title: 'Partner Integration Runbook',
    required: ['data-runbook-tab', 'Source of truth', 'Escalation path']
  }
];

async function readText(path) {
  return readFile(path, 'utf8');
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

test('main profile exposes the FDE-first information architecture', async () => {
  const html = await readText('index.html');

  assert.match(html, /Forward Deployed/i);
  assert.match(html, /messy customer workflows|messy last mile|customer workflows/i);
  assert.match(html, /Wonderful\.ai|Wonderful-style/i);
  assert.match(html, /Solution Architect/i);
  assert.match(html, /Partner Solution Engineer/i);
  assert.match(html, /Customer Solution Engineer/i);

  for (const id of requiredIndexSections) {
    assert.match(html, new RegExp(`id=["']${id}["']`), `Missing #${id}`);
  }

  assert.match(html, /data-stage=/, 'Deployment operating system needs selectable stages.');
  assert.match(html, /data-skill-zone=/, 'Skill map needs selectable supporting zones.');
  assert.match(html, /prefers-reduced-motion/, 'Reduced-motion CSS guard is required.');
});

test('main profile links every mini deployment lab', async () => {
  const html = await readText('index.html');

  for (const page of projectPages) {
    assert.match(html, new RegExp(escapeRegExp(page.path)), `Missing link to ${page.path}`);
  }
});

test('mini deployment labs exist and expose focused interactions', async () => {
  for (const page of projectPages) {
    assert.equal(existsSync(page.path), true, `${page.path} should exist`);
    const html = await readText(page.path);

    assert.match(html, new RegExp(escapeRegExp(page.title)), `${page.path} missing title`);
    assert.match(html, /href=["']\/?index\.html|href=["']\//, `${page.path} needs a profile backlink`);
    assert.match(html, /Forward Deployed|FDE/i, `${page.path} needs FDE framing`);
    assert.match(html, /mockup|simulated|lab/i, `${page.path} must disclose that it is a proof artifact`);

    for (const phrase of page.required) {
      assert.match(html, new RegExp(escapeRegExp(phrase), 'i'), `${page.path} missing ${phrase}`);
    }
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

test('profile content stays credible and avoids implementation placeholders', async () => {
  const files = ['index.html', ...projectPages.map((page) => page.path)];

  for (const file of files) {
    const html = await readText(file);
    assert.doesNotMatch(html, /TBD|TODO|FIXME|lorem ipsum/i, `${file} contains placeholder text`);
    assert.doesNotMatch(html, /production customer deployment of this lab/i, `${file} overstates mockup scope`);
  }
});
