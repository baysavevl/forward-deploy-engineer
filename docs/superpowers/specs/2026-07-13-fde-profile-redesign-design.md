# FDE Profile Redesign Design

## Objective

Redesign `forward-deploy-engineer.vercel.app` into a high-signal, visually memorable profile for Vinh Luu, optimized primarily for Forward Deployed Engineer roles and secondarily for adjacent customer-facing technical roles: Solution Architect, Partner Solution Engineer, and Customer Solution Engineer.

The page must make Vinh look stronger than a normal resume page by proving operating range: customer discovery, systems architecture, integrations, production ownership, AI-agent deployment readiness, stakeholder fluency, and Vietnam/APAC market advantage.

## Positioning

Primary identity:

> Forward Deployed Engineer for enterprise AI deployments.

This must not read as "AI agent builder only." The durable claim is broader:

> I turn messy customer workflows into reliable production systems.

AI agents are the current deployment arena and the sharpest role-fit context, especially for Wonderful.ai. The broader FDE skill includes APIs, messaging systems, data flows, auth boundaries, compliance/auditability, observability, rollout, partner onboarding, and adoption after launch.

Supporting role signals:

- Solution Architect: architecture strategy, scale, regulated workflows, reliability.
- Partner Solution Engineer: partner discovery, integration workshops, onboarding blueprints.
- Customer Solution Engineer: stakeholder communication, live troubleshooting, adoption support.

These supporting roles should appear as skill zones, not as competing identities.

## Research Inputs

Local source material:

- Current `index.html` public profile and live Gemini-backed demo.
- `profile/role-fit-profile.md` and `profile/application-kit.md`.
- Current FDE CV HTML/TeX/PDF.
- Downloaded Solution Architect, Partner Solution Engineer, Forward Deployed Engineer, and Tech PR resume exports.
- `EV Search_JD_Deployed Engineer.pdf`, which describes a global AI startup expanding in APAC/Vietnam and needing FDEs for enterprise AI agents.

External calibration:

- Palantir FDSE materials emphasize embedded customer engineering, broad technical problem solving, production systems, data/workflow integration, and customer feedback loops.
- Wonderful.ai materials emphasize governed enterprise agents across channels, local deployment teams, multilingual/cultural context, regulated industries, and production adoption.
- FDE resume guidance emphasizes end-to-end ownership, measurable customer impact, production systems, customer/stakeholder exposure, and reusable frameworks.

## Content Architecture

### 1. Hero: FDE First

Purpose: make the role fit unmistakable in the first viewport.

Headline direction:

> I deploy AI into the messy last mile of enterprise workflows.

Supporting copy should say Vinh connects customer ambiguity to production software: discovery, architecture, integrations, observability, guardrails, and business impact. Mention Zalo-scale production ownership and Vietnam/APAC fluency.

Hero proof strip:

- 30M+ user messaging context.
- Millions of daily business messages.
- Hundreds of partner integrations.
- 30% operational overhead reduction.
- 40% faster partner onboarding.
- 50% guardrail/permission coverage improvement.

Primary actions:

- Download ATS CV.
- View role-fit notes.
- Try deployment demo.
- LinkedIn.

### 2. Signature Wow: Deployment Operating System

Purpose: give the page a memorable interaction without turning it into a gimmick.

Visual concept: a live operating map that transforms "customer chaos" into "production AI outcome."

Stages:

1. Discover: business pain, actors, systems, success metric.
2. Architect: API boundaries, data sources, auth, source of truth.
3. Build: agent workflow, tool route, retrieval, state, prompts.
4. Guard: evals, policy checks, human fallback, audit trace.
5. Launch: canary, monitoring, incident path, metric review.
6. Compound: reusable blueprint, docs, partner enablement, product feedback.

Interaction:

- Hover/click a stage to reveal Vinh evidence.
- Show one proof metric per stage.
- Include a subtle animated trace line when motion is allowed.
- Respect `prefers-reduced-motion`.

### 3. Human Story

Purpose: make the page readable by humans, not just recruiters and ATS-style scanners.

Tone: direct, grounded, personal, not sentimental.

Story beats:

- Started as a software engineer building real backend systems.
- Grew inside Zalo, Vietnam's largest messaging platform.
- Moved closer to the customer edge: partners, product, sales, finance, ops.
- Learned that the hardest work is not a demo, but making the system work under real constraints.
- Now strongest at the FDE intersection: customer ambiguity, system design, production ownership, and business impact.

This section should be shorter than the proof sections.

### 4. Skill Strength Map

Purpose: answer "how strong is he?" directly.

Organize around FDE strength first:

- Customer discovery and workflow mapping.
- Enterprise architecture and integration.
- Production systems and reliability.
- AI agents, LLM workflows, evals, and guardrails.
- Business and stakeholder ownership.
- Vietnam/APAC market and language advantage.

Then include supporting role zones:

- SA zone: scale, architecture, SOX-grade workflow, high-throughput systems.
- PSE zone: partner integrations, workshops, onboarding blueprints, feedback loops.
- CSE zone: live debugging, communication, adoption, operational handoff.

### 5. Case Evidence

Purpose: convert skills into defensible proof.

Cards:

- Zalo Business Messaging: sub-second delivery, millions of daily business messages, partner integration surface.
- SOX-compliant reporting/billing workflow: ambiguous stakeholder requirements to production, 30% operational overhead reduction.
- Partner onboarding system: prototypes, blueprints, documentation, 40% faster onboarding.
- Trust and permission controls: 50% coverage lift across a 30M+ user surface.
- AI-assisted product and delivery workflows: classification, content-quality signals, draft generation, structured outputs, eval loops, human guardrails.

Each card should answer:

- Situation.
- What Vinh owned.
- Systems touched.
- Business result.
- FDE skill demonstrated.

### 6. Wonderful.ai Fit Zone

Purpose: dedicated zone for the target company without making the entire site too narrow.

Frame:

> Why Wonderful.ai should care.

Map Wonderful needs to Vinh proof:

- Local deployment teams in every market -> native Vietnamese, professional English, APAC/Vietnam context.
- Enterprise agents across voice/chat/email/back office -> production conversational messaging and business workflow integration.
- Governed agents in regulated industries -> SOX workflow, permission controls, auditability, guardrails.
- Existing enterprise systems and messy workflows -> partner integrations, legacy/modern stacks, API boundaries.
- Production adoption, not demos -> observability, back-pressure, rollout, operational ownership.

Include one concise "Why me for Wonderful" answer:

> Wonderful needs engineers who can make AI work inside real customer environments. My edge is that I already operate at that boundary: high-scale messaging, enterprise partner integrations, regulated workflows, and Vietnam market context.

### 7. Live Deployment Demo

Purpose: proof artifact, not the whole profile.

Keep the current bilingual Gemini-backed demo, but reposition it after the evidence sections. It should demonstrate FDE reasoning:

- scope customer workflow,
- identify source of truth,
- design tool route,
- define guardrail,
- propose evals,
- launch and monitor.

Improve surrounding copy so it is clear this is a deployment reasoning demo, not a support chatbot.

### 8. Links and Application Package

Keep clear links to:

- ATS CV PDF.
- CV HTML.
- LaTeX source.
- Role-fit notes.
- Application kit.
- LinkedIn.

## Visual Direction

Overall: premium technical dossier with a human-readable story layer.

Palette:

- Deep ink: `#0b1020`
- Panel ink: `#111827`
- Paper: `#fbfcff`
- Line: `#d8dee9`
- Signal cyan: `#1dd3ff`
- Deployment green: `#21c77a`
- Warning amber: `#ffb020`
- Human accent: `#e65f4b`

Avoid a one-note blue/slate dashboard. Use dark surfaces for the hero and operating system, then use clean white sections for proof and story.

Typography:

- Display: strong, technical, restrained.
- Body: highly readable system sans.
- Data labels: compact utility styling.

Layout:

- Hero must show the name and FDE role immediately.
- Content should be dense enough for fast scanning but not cramped.
- Cards should be used only for repeated proof items and tool panels.
- No nested cards.
- No marketing landing-page filler.

Signature detail:

- The "Deployment Operating System" should look like a live trace, not a decorative diagram.
- The page should feel fantastic because the proof is organized and interactive, not because of excessive animation.

## Interaction And State

- Smooth stage selection in the Deployment Operating System.
- Keyboard-accessible buttons/tabs for stages.
- Reduced-motion fallback.
- Existing chat demo remains usable on desktop and mobile.
- Mobile layout stacks proof cleanly and preserves all metrics without horizontal overflow.

## Success Criteria

- A recruiter understands within 10 seconds that Vinh is primarily targeting FDE work.
- A hiring manager can see that Vinh's strength is broader than AI prompt work.
- Wonderful.ai has a dedicated section that feels tailored to the company and role.
- SA/PSE/CSE strengths are visible as preference/supporting zones, not confusing alternate targets.
- The page feels more "wow" than the current version while staying credible and human-readable.
- All claims are traceable to existing CV/profile source material or public company/role research.

## Out Of Scope

- Do not invent production AI-agent deployments Vinh has not actually done.
- Do not make the page only about Wonderful.ai.
- Do not overstate voice/telephony depth; position it as adjacent to conversational messaging and actively rampable.
- Do not remove the existing CV/download assets.
- Do not replace the static site with a heavy framework unless required by implementation constraints.

## Implementation Notes

The current site is a single static `index.html` with an `/api/agent.js` Vercel function for the demo. Keep this architecture unless a clear problem appears. The redesign can be implemented with scoped HTML/CSS/JS edits in `index.html`, preserving existing asset paths and demo API behavior.

