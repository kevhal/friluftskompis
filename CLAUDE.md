# Friluftskompis — repo memory

## Code review

After every code change, run the code-review skill against the modified file(s) before considering the task done. Use the findings to verify the change didn't introduce new issues and that existing ones were correctly resolved.

If the review surfaces any findings, apply fixes for all Critical and Major issues immediately, then re-run the skill to confirm they are resolved. Repeat this loop until the review comes back clean or only Minor/Suggestion-level findings remain.

The skill lives at `skills/code-review/SKILL.md` and maintains a review profile at `skills/code-review/review-profile.json` that accumulates team preferences over time.

## Lint

After every code change, run `pnpm lint` before considering the task done. Fix all errors before moving on. Warnings can be left if they are not actionable.
