# FDE Profile Credibility Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the FDE profile more credible by replacing self-scored fit claims with evidence-led readiness and case proof.

**Architecture:** This is a static-site content pass. `index.html` owns the public profile markup, styles, and small readiness/playground interactions. `scripts/validate-profile-site.mjs` owns static validation for credibility, required sections, and links.

**Tech Stack:** Static HTML, CSS, vanilla JavaScript, Node.js built-in test runner.

## Global Constraints

- No new dependencies.
- Keep Wonderful.ai as the first concrete target, not the only target.
- Do not invent production AI-agent deployments.
- Do not attach the `30M+` proof to Job Market.
- Do not change CV/PDF artifacts in this pass.

---

### Task 1: Update Static Validation

**Files:**
- Modify: `scripts/validate-profile-site.mjs`

**Interfaces:**
- Consumes: `index.html` as a static text file.
- Produces: Validation coverage for the scroll-driven readiness ramp, case evidence section, self-built playground framing, recruiter-facing copy, and removal of old self-score claims.

- [ ] **Step 1: Replace old fit assertions**

Change the main profile test to require `case-evidence`, `Scroll the evidence`, `data-scroll-ramp`, scroll listener code, and recruiter-facing copy.

- [ ] **Step 2: Add credibility guardrails**

Add assertions that `99% match`, `100% match`, and `From 80% strong engineer to 100% after onboarding` are absent.

- [ ] **Step 3: Run validation and confirm RED**

Run: `node --test scripts/validate-profile-site.mjs`

Expected: FAIL because `index.html` still has the old percentage fit framing or outdated recruiter-facing sections.

### Task 2: Update Profile Content And Interaction

**Files:**
- Modify: `index.html`

**Interfaces:**
- Consumes: Existing CSS classes and JavaScript patterns in `index.html`.
- Produces: Updated public page with a scroll-driven readiness ramp, evidence cases, clarified playground, mini-lab links, recruiter-facing proof sections, and less Wonderful.ai dominance.

- [ ] **Step 1: Update top-level copy**

Change metadata, nav label, hero eyebrow, match section heading, match lead, and Wonderful.ai language to say `first concrete target` where useful.

- [ ] **Step 2: Replace the percentage meter with scroll progress**

Use `data-scroll-ramp`, `data-ramp-stage`, and a scroll listener that updates the visible percentage, bar width, active stage, and copy as the reader moves through the evidence sections.

- [ ] **Step 3: Add case evidence section**

Insert `section id="case-evidence"` after `fde-proof` and before `skills`. Use three case cards with `Customer pain`, `Owned`, `Result`, and `FDE signal`.

- [ ] **Step 4: Rewrite proof and skills sections**

Remove the self-conscious `Not a lifelong FDE yet` framing. Replace it with `Evidence before claims` and recruiter-facing screening copy. Make cards visually even with bottom-aligned tags.

- [ ] **Step 5: Clarify playground proof**

Update the playground headline and copy to state it is a self-built reasoning artifact and add links to the three existing mini deployment lab pages.

- [ ] **Step 6: Run validation and confirm GREEN**

Run: `node --test scripts/validate-profile-site.mjs`

Expected: PASS.
