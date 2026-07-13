# FDE Profile Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the public profile into an FDE-first technical dossier with selective interactions, a Wonderful.ai fit zone, and three deployed mini project labs linked from the main page.

**Architecture:** Keep the current static-site architecture: `index.html` for the profile, `/api/agent.js` for the existing Gemini demo, and static mini project pages under `projects/`. Add a Node built-in validation script that checks required sections, links, interaction hooks, and proof claims without introducing a build step.

**Tech Stack:** Static HTML/CSS/JavaScript, Node.js built-in test runner, existing Vercel project `forward-deploy-engineer`, existing GitHub repo `baysavevl/forward-deploy-engineer`, Vercel CLI for production deployment.

## Global Constraints

- Primary identity is Forward Deployed Engineer for enterprise AI deployments.
- Do not make the site read as "AI agent builder only"; the durable claim is turning messy customer workflows into reliable production systems.
- SA/PSE/CSE strengths appear as supporting skill zones, not competing identities.
- Wonderful.ai gets a dedicated fit zone, but the whole site must not become Wonderful-only.
- Keep the existing `/api/agent.js` demo behavior and existing CV/download links.
- Create mini project pages under `projects/` and link them from the main profile.
- Mini projects are mockup proof artifacts, not claims of customer production deployments.
- Interactions must be selective and clean: stage selectors, role/skill selectors, scenario tabs, and checklist toggles only where they clarify proof.
- Respect keyboard access and reduced-motion preferences.
- No heavy frontend framework or build step unless a clear implementation blocker appears.
- GitHub MCP is not available in this session; use authenticated `gh` CLI and `git`.

---

## File Structure

- Modify: `index.html`
  - Full profile redesign, selective interactions, mini-lab links, Wonderful.ai fit zone, and existing demo preservation.
- Keep: `api/agent.js`
  - Existing Gemini-backed demo endpoint. No planned changes unless verification exposes a regression.
- Create: `projects/deployment-blueprint-lab.html`
  - Interactive mock FDE workflow from customer request to scoped production rollout.
- Create: `projects/agent-eval-harness.html`
  - Mock eval dashboard for bilingual cases, unsafe-action gates, and launch readiness.
- Create: `projects/partner-integration-runbook.html`
  - Mock partner onboarding runbook with API contract, source-of-truth mapping, failure modes, and handoff checklist.
- Create: `scripts/validate-profile-site.mjs`
  - Node built-in validation for required sections, links, local static pages, and interaction hooks.
- Modify: `docs/superpowers/plans/2026-07-13-fde-profile-redesign-implementation.md`
  - Track implementation progress by checking off steps during execution.

---

### Task 1: Add Static Site Validation

**Files:**
- Create: `scripts/validate-profile-site.mjs`

**Interfaces:**
- Consumes: local static files: `index.html`, `projects/deployment-blueprint-lab.html`, `projects/agent-eval-harness.html`, `projects/partner-integration-runbook.html`.
- Produces: command `node --test scripts/validate-profile-site.mjs` that exits non-zero until required profile sections and mini project files exist.

- [x] **Step 1: Write the failing validation test**

Create `scripts/validate-profile-site.mjs` with this content:

```js
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
    assert.match(html, new RegExp(page.path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `Missing link to ${page.path}`);
  }
});

test('mini deployment labs exist and expose focused interactions', async () => {
  for (const page of projectPages) {
    assert.equal(existsSync(page.path), true, `${page.path} should exist`);
    const html = await readText(page.path);

    assert.match(html, new RegExp(page.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), `${page.path} missing title`);
    assert.match(html, /href=["']\/?index\.html|href=["']\//, `${page.path} needs a profile backlink`);
    assert.match(html, /Forward Deployed|FDE/i, `${page.path} needs FDE framing`);
    assert.match(html, /mockup|simulated|lab/i, `${page.path} must disclose that it is a proof artifact`);

    for (const phrase of page.required) {
      assert.match(html, new RegExp(phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'), `${page.path} missing ${phrase}`);
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
```

- [x] **Step 2: Run validation to verify it fails**

Run:

```bash
node --test scripts/validate-profile-site.mjs
```

Expected: FAIL because `index.html` does not yet contain the new section IDs and `projects/*.html` do not exist.

- [x] **Step 3: Commit the failing validation harness**

Run:

```bash
git add scripts/validate-profile-site.mjs
git commit -m "test(profile): add static site validation"
```

---

### Task 2: Redesign Main Profile Page

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: existing assets under `assets/`, existing CV/profile links, existing demo DOM IDs used by current script: `messages`, `agent-input`, `agent-form`, `route-output`, `guardrail-output`, `metric-output`, `next-step-output`, `agent-state`, `agent-source`.
- Produces: required section IDs from Task 1, stage buttons with `data-stage`, skill-zone buttons with `data-skill-zone`, mini-lab links, preserved demo behavior.

- [x] **Step 1: Replace top-level navigation**

In `index.html`, update the topbar navigation to point to:

```html
<nav class="nav" aria-label="Profile navigation">
  <a href="#operating-system">Operating system</a>
  <a href="#skill-map">Skill map</a>
  <a href="#case-evidence">Evidence</a>
  <a href="#wonderful-fit">Wonderful.ai</a>
  <a href="#mini-labs">Labs</a>
  <a href="#demo">Demo</a>
  <a class="nav-icon" href="https://www.linkedin.com/in/vinhluulinked/" target="_blank" rel="noreferrer" aria-label="LinkedIn profile">...</a>
</nav>
```

Keep the existing LinkedIn SVG inside the nav icon.

- [x] **Step 2: Rework the hero content**

Replace the hero copy with content that includes:

```html
<span class="label">Forward Deployed Engineer for enterprise AI deployments</span>
<h1>I deploy AI into the messy last mile of enterprise workflows.</h1>
<p class="hero-copy">
  I turn unclear customer operations into production software: discovery, architecture,
  partner integrations, guardrails, observability, rollout, and measurable business impact.
  My edge is Zalo-scale conversational systems plus Vietnam/APAC customer context.
</p>
```

Add a hero proof strip with these exact metrics:

```html
<div class="hero-proof" aria-label="Profile proof metrics">
  <div><strong>30M+</strong><span>Vietnam messaging user context</span></div>
  <div><strong>Millions</strong><span>daily business messages</span></div>
  <div><strong>Hundreds</strong><span>partner integrations</span></div>
  <div><strong>30%</strong><span>ops overhead reduction</span></div>
  <div><strong>40%</strong><span>faster partner onboarding</span></div>
  <div><strong>50%</strong><span>permission coverage lift</span></div>
</div>
```

- [x] **Step 3: Add the Deployment Operating System section**

Add a section with `id="operating-system"` after the hero. It must include six buttons:

```html
<button class="stage-button is-active" type="button" data-stage="discover">Discover</button>
<button class="stage-button" type="button" data-stage="architect">Architect</button>
<button class="stage-button" type="button" data-stage="build">Build</button>
<button class="stage-button" type="button" data-stage="guard">Guard</button>
<button class="stage-button" type="button" data-stage="launch">Launch</button>
<button class="stage-button" type="button" data-stage="compound">Compound</button>
```

Add a details panel with these IDs:

```html
<strong id="stage-title">Discover the real workflow</strong>
<p id="stage-copy">...</p>
<span id="stage-proof">...</span>
<span id="stage-artifact">...</span>
```

Implement a `deploymentStages` object in the page script with keys `discover`, `architect`, `build`, `guard`, `launch`, and `compound`. Each key must provide `title`, `copy`, `proof`, and `artifact`.

- [x] **Step 4: Add the human story section**

Add a section with `id="human-story"` and concise copy that says:

```html
<p>
  I started as a backend engineer because I liked making systems hold under real traffic.
  At Zalo, that moved closer to the customer edge: partners, product, sales, finance, and ops.
  The lesson I kept seeing is that the hard part is rarely the demo. The hard part is making
  software survive real workflows, unclear ownership, old systems, local language, and production pressure.
</p>
```

- [x] **Step 5: Add the skill strength map**

Add a section with `id="skill-map"` and three supporting-zone buttons:

```html
<button class="zone-button is-active" type="button" data-skill-zone="sa">Solution Architect</button>
<button class="zone-button" type="button" data-skill-zone="pse">Partner Solution Engineer</button>
<button class="zone-button" type="button" data-skill-zone="cse">Customer Solution Engineer</button>
```

Add a panel with IDs:

```html
<strong id="zone-title">Architecture that survives production</strong>
<p id="zone-copy">...</p>
<span id="zone-proof">...</span>
```

Implement a `skillZones` object with keys `sa`, `pse`, and `cse`.

- [x] **Step 6: Add case evidence and Wonderful.ai fit sections**

Add `id="case-evidence"` with five proof cards:

1. Zalo Business Messaging.
2. SOX-compliant reporting and billing.
3. Partner onboarding blueprints.
4. Trust and permission controls.
5. AI-assisted product and delivery workflows.

Add `id="wonderful-fit"` with a comparison table mapping Wonderful.ai needs to Vinh proof:

```html
<tr><th>Local deployment teams</th><td>Native Vietnamese, professional English, Vietnam/APAC messaging context.</td></tr>
<tr><th>Enterprise agents across channels</th><td>Production conversational messaging and workflow integration experience.</td></tr>
<tr><th>Governed regulated workflows</th><td>SOX-grade reporting, permission controls, auditability, guardrails.</td></tr>
<tr><th>Existing systems and messy workflows</th><td>Partner APIs, legacy and modern stacks, source-of-truth mapping.</td></tr>
<tr><th>Production adoption</th><td>Observability, back-pressure, rollout ownership, metric review.</td></tr>
```

- [x] **Step 7: Add mini labs and preserve demo/links**

Add `id="mini-labs"` before `id="demo"` with links to:

```html
<a href="/projects/deployment-blueprint-lab.html">Deployment Blueprint Lab</a>
<a href="/projects/agent-eval-harness.html">Agent Eval Harness</a>
<a href="/projects/partner-integration-runbook.html">Partner Integration Runbook</a>
```

Keep the existing demo DOM IDs so `/api/agent.js` and the current client script still work.

Ensure the links section has `id="links"` and retains links to:

```html
<a href="/output/pdf/VinhLuu_Forward_Deployed_Engineer_Wonderful_AI.pdf" download>ATS CV PDF</a>
<a href="/cv/VinhLuu_Forward_Deployed_Engineer_Wonderful_AI.html">CV HTML</a>
<a href="/cv/VinhLuu_Forward_Deployed_Engineer_Wonderful_AI.tex" download>LaTeX CV</a>
<a href="/profile/role-fit-profile.md">Role-fit notes</a>
<a href="/profile/application-kit.md">Application kit</a>
```

- [x] **Step 8: Run validation**

Run:

```bash
node --test scripts/validate-profile-site.mjs
```

Expected: still FAIL because mini project pages do not exist yet, but the main-profile assertions should pass.

- [x] **Step 9: Commit the main page redesign**

Run:

```bash
git add index.html
git commit -m "feat(profile): redesign FDE dossier"
```

---

### Task 3: Add Mini Deployment Labs

**Files:**
- Create: `projects/deployment-blueprint-lab.html`
- Create: `projects/agent-eval-harness.html`
- Create: `projects/partner-integration-runbook.html`

**Interfaces:**
- Consumes: main profile links from `/projects/*.html`.
- Produces: three static pages that pass `scripts/validate-profile-site.mjs`.

- [ ] **Step 1: Create the Deployment Blueprint Lab**

Create `projects/deployment-blueprint-lab.html` as a static page with:

- `<title>Deployment Blueprint Lab - Vinh Luu</title>`
- visible heading `Deployment Blueprint Lab`
- visible disclosure text containing `simulated FDE mockup`
- visible phrases `Customer chaos` and `Production outcome`
- at least three buttons with `data-blueprint-stage`
- backlink `<a href="/">Back to profile</a>`

Use stages `scope`, `architecture`, and `launch`.

- [ ] **Step 2: Create the Agent Eval Harness**

Create `projects/agent-eval-harness.html` as a static page with:

- `<title>Agent Eval Harness - Vinh Luu</title>`
- visible heading `Agent Eval Harness`
- visible disclosure text containing `simulated eval lab`
- visible phrases `Unsafe action` and `Launch gate`
- at least three buttons with `data-eval-scenario`
- backlink `<a href="/">Back to profile</a>`

Use scenarios `billing`, `booking`, and `card`.

- [ ] **Step 3: Create the Partner Integration Runbook**

Create `projects/partner-integration-runbook.html` as a static page with:

- `<title>Partner Integration Runbook - Vinh Luu</title>`
- visible heading `Partner Integration Runbook`
- visible disclosure text containing `simulated partner integration lab`
- visible phrases `Source of truth` and `Escalation path`
- at least three buttons with `data-runbook-tab`
- backlink `<a href="/">Back to profile</a>`

Use tabs `contract`, `failure`, and `handoff`.

- [ ] **Step 4: Run validation**

Run:

```bash
node --test scripts/validate-profile-site.mjs
```

Expected: PASS.

- [ ] **Step 5: Commit the mini labs**

Run:

```bash
git add projects/deployment-blueprint-lab.html projects/agent-eval-harness.html projects/partner-integration-runbook.html
git commit -m "feat(profile): add mini deployment labs"
```

---

### Task 4: Local Browser Verification

**Files:**
- Read: `index.html`
- Read: `projects/*.html`

**Interfaces:**
- Consumes: completed static pages and validation script.
- Produces: local verification result and any needed follow-up patches.

- [ ] **Step 1: Start local static server**

Run:

```bash
python3 -m http.server 4173
```

Expected: server reports it is serving on `http://0.0.0.0:4173/`.

- [ ] **Step 2: Verify main pages respond**

In another command, run:

```bash
curl -I http://localhost:4173/
curl -I http://localhost:4173/projects/deployment-blueprint-lab.html
curl -I http://localhost:4173/projects/agent-eval-harness.html
curl -I http://localhost:4173/projects/partner-integration-runbook.html
```

Expected: each returns `HTTP/1.0 200 OK` or `HTTP/1.1 200 OK`.

- [ ] **Step 3: Run browser smoke test when Playwright is available**

Run:

```bash
npx playwright --version
```

If Playwright is available, run a browser check that opens `/`, clicks one `data-stage` button, one `data-skill-zone` button, and one mini-lab link. If Playwright is not available without installing packages, skip browser automation and use the static validation plus `curl` checks.

- [ ] **Step 4: Stop local static server**

Stop the `python3 -m http.server 4173` process.

- [ ] **Step 5: Commit verification fixes only if files changed**

If verification required fixes, run:

```bash
git add index.html projects scripts
git commit -m "fix(profile): polish local verification issues"
```

If no files changed, do not create an empty commit.

---

### Task 5: GitHub Push And Vercel Production Deployment

**Files:**
- Read: `.vercel/project.json`

**Interfaces:**
- Consumes: clean committed working tree, authenticated `gh`, authenticated Vercel CLI.
- Produces: pushed GitHub commits and production Vercel deployment URL.

- [ ] **Step 1: Verify authentication and clean status**

Run:

```bash
gh auth status
vercel whoami
git status --short --branch
```

Expected:

- `gh auth status` shows logged in account `baysavevl`.
- `vercel whoami` shows account `luuvinh8698-5545`.
- `git status` shows branch `main` ahead of `origin/main` only by committed work, with no untracked or unstaged files.

- [ ] **Step 2: Push to GitHub**

Run:

```bash
git push origin main
```

Expected: push succeeds to `https://github.com/baysavevl/forward-deploy-engineer.git`.

- [ ] **Step 3: Deploy to Vercel production**

Run from repo root:

```bash
vercel deploy --prod --yes
```

Expected: command returns a production deployment URL for the existing project `forward-deploy-engineer`.

- [ ] **Step 4: Inspect deployment**

Run:

```bash
vercel inspect <deployment-url>
```

Expected: deployment status is ready.

---

### Task 6: Production Link Verification

**Files:**
- Read: production URLs.

**Interfaces:**
- Consumes: production deployment URL from Task 5.
- Produces: final verification result.

- [ ] **Step 1: Verify production profile and mini labs**

Run:

```bash
curl -I https://forward-deploy-engineer.vercel.app/
curl -I https://forward-deploy-engineer.vercel.app/projects/deployment-blueprint-lab.html
curl -I https://forward-deploy-engineer.vercel.app/projects/agent-eval-harness.html
curl -I https://forward-deploy-engineer.vercel.app/projects/partner-integration-runbook.html
```

Expected: each returns `HTTP/2 200` or another successful 2xx status.

- [ ] **Step 2: Verify final local status**

Run:

```bash
git status --short --branch
```

Expected: `main...origin/main` with no untracked or unstaged files.

- [ ] **Step 3: Report final URLs**

Report:

- Main profile: `https://forward-deploy-engineer.vercel.app/`
- Deployment Blueprint Lab: `https://forward-deploy-engineer.vercel.app/projects/deployment-blueprint-lab.html`
- Agent Eval Harness: `https://forward-deploy-engineer.vercel.app/projects/agent-eval-harness.html`
- Partner Integration Runbook: `https://forward-deploy-engineer.vercel.app/projects/partner-integration-runbook.html`

---

## Self-Review

- Spec coverage: the plan covers FDE-first positioning, Wonderful.ai zone, SA/PSE/CSE support zones, selective interactions, mini project pages, validation, GitHub push, and Vercel deployment.
- Placeholder scan: the plan uses no TBD/TODO/FIXME placeholders and includes exact file paths and commands.
- Interface consistency: validation expects `operating-system`, `human-story`, `skill-map`, `case-evidence`, `wonderful-fit`, `mini-labs`, `demo`, and `links`; Task 2 creates those exact IDs. Validation expects three `projects/*.html` pages; Task 3 creates those exact paths.
