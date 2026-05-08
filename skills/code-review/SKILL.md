---
name: code-review
description: >
  Performs a structured code review of one or more files using a consistent
  rubric (bugs, security, performance, readability, maintainability). After
  each review the skill writes a feedback profile so future reviews remember
  what the team cares about most. Use this skill whenever someone asks to
  review, check, audit, or critique a code file, even if they just say
  "look at this file" or "what do you think of this code".
---

# Code Review Skill

## What this skill does

1. Reads the target file(s)
2. Loads any existing review preferences from `skills/code-review/review-profile.json`
3. Performs a structured review across five dimensions
4. Presents findings in a clear, actionable format
5. Asks for feedback and writes an updated profile so the next review is better calibrated

---

## Step 1 — Load the review profile

Before starting, check whether `skills/code-review/review-profile.json` exists.
If it does, read it and let its contents shape emphasis and tone.
If it doesn't, start with the default weights below.

Default profile:
```json
{
  "focus_areas": ["bugs", "security", "performance", "readability", "maintainability"],
  "priority_weights": {
    "bugs": 5,
    "security": 4,
    "performance": 3,
    "readability": 3,
    "maintainability": 3
  },
  "team_preferences": [],
  "skip_areas": []
}
```

Higher weight = lead with that section and be more thorough.
`skip_areas` = omit those dimensions entirely this run.
`team_preferences` = specific rules the team has asked to enforce.

---

## Step 2 — Read the file(s)

Read each target file in full. Note:
- Language / framework
- Approximate size and complexity
- Any immediately obvious issues before the structured pass

---

## Step 3 — Structured review

Work through each active dimension in priority order. For each finding:

- **Severity**: 🔴 Critical · 🟠 Major · 🟡 Minor · 🔵 Suggestion
- **Location**: file + line number or function name
- **Finding**: what the problem is and *why* it matters
- **Fix**: a concrete, copy-pasteable suggestion (code snippet preferred)

### Dimensions

**Bugs** — Logic errors, edge cases, off-by-one, unhandled nulls/undefined, incorrect types, broken control flow.

**Security** — XSS, injection risks, exposed secrets, unsafe dependencies, missing input validation, insecure defaults.

**Performance** — Unnecessary re-renders, N+1 queries, missing memoisation where it helps, expensive operations in hot paths, large bundle contributions.

**Readability** — Unclear naming, overly complex expressions, missing or misleading comments, inconsistent style, dead code.

**Maintainability** — Duplication, tight coupling, missing abstractions, components/functions doing too much, fragile assumptions.

---

## Step 4 — Summary table

After the findings, output a compact summary:

```
| Dimension       | Issues found | Highest severity |
|-----------------|-------------|-----------------|
| Bugs            | N           | 🔴 / 🟠 / 🟡 / — |
| Security        | N           | ...             |
| Performance     | N           | ...             |
| Readability     | N           | ...             |
| Maintainability | N           | ...             |
```

Then a one-paragraph **overall verdict**: is this code ready to merge, needs minor fixes, or needs significant rework?

---

## Step 5 — Collect feedback and update the profile

After presenting the review, ask:

> "Was this review useful? Anything I focused on too much or too little?
> Any team rules I should remember for next time?"

When the user responds, update `skills/code-review/review-profile.json`:
- Raise the weight of dimensions the user wanted more of
- Lower or add to `skip_areas` for dimensions they found unhelpful
- Append any new rules to `team_preferences`
- Write a short `last_updated` note

Example updated profile:
```json
{
  "focus_areas": ["bugs", "security", "performance", "readability", "maintainability"],
  "priority_weights": {
    "bugs": 5,
    "security": 5,
    "performance": 2,
    "readability": 4,
    "maintainability": 3
  },
  "team_preferences": [
    "Flag any href='#' dead links in Next.js pages",
    "Check that all <html> tags have a lang attribute"
  ],
  "skip_areas": [],
  "last_updated": "2025-05-08 — user asked for more security focus, less performance"
}
```

This means every review makes the next one smarter without the user having to repeat themselves.

---

## Tone and format

- Be direct. Developers can handle honest feedback.
- Explain *why* something is a problem, not just that it is.
- Always pair a finding with a fix — don't just flag things.
- If the code is genuinely good, say so. Don't invent problems to seem thorough.
- Keep the total response scannable: use the structured format, don't write essays.
