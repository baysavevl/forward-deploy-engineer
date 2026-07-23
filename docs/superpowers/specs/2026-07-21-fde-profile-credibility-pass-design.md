# FDE Profile Credibility Pass Design

## Objective

Improve the public FDE profile so it keeps the current strong positioning while reading as more credible to recruiters and hiring managers. The pass should reduce self-scored fit language, add concrete work evidence, clarify honest ramp areas, and make the playground read as a self-built reasoning artifact rather than a claimed production deployment.

## Scope

- Modify `index.html` only for public profile content, section structure, small CSS additions, and the existing client-side readiness interaction.
- Modify `scripts/validate-profile-site.mjs` so the static validation protects the new credibility framing.
- Do not add dependencies, frameworks, external services, or new production claims.
- Do not change CV/PDF artifacts in this pass.

## Content Decisions

- Replace the `80% / 92% / 99% / 100%` fit meter with a scroll-driven readiness ramp. The percentage is a reading progress aid, not a match score.
- The scroll ramp uses concrete stages: foundation, workflow, production, and onboarding upside.
- Keep Wonderful.ai as the first concrete target, but make the page useful for FDE roles broadly.
- Add a case evidence section with three recruiter-readable proof cards:
  - Job Market workflow automation.
  - Recruiter onboarding support.
  - ZNS / business messaging reliability.
- Each case must state the customer/workflow pain, what Vinh owned, the result, and the FDE signal.
- Clarify that the playground is a small self-built reasoning artifact, not a production customer deployment.
- Preserve honest boundaries around voice/telephony and new internal customer stacks.
- Remove self-conscious copy such as "Not a lifelong FDE yet" and use recruiter-facing screening language instead.
- Keep proof cards visually balanced, with consistent card heights and compact tags aligned to the bottom.

## Success Criteria

- A recruiter can scan the first half of the page without getting stuck on unsupported self-score claims.
- A hiring manager sees concrete evidence before the Wonderful.ai-specific mapping.
- The page still has a clear FDE identity and does not become a generic resume page.
- Validation fails if the old `99% match` or `100% match` framing returns.
- Validation fails if the old self-conscious FDE framing returns.
- All local links remain valid.
