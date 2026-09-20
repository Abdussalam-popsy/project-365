---
description: Maintain a beginner-friendly lessons.md for this template or experiment before delivery and commits.
trigger: always_on
---

# Explain the code as part of building it

- The user is learning. For substantive code changes, update the affected template or experiment's own `lessons.md` without waiting for a reminder, and do so before any requested commit.
- If the repository's `code-lessons` skill is available, use it. Otherwise follow the checklist below; this rule must also work when copied into a standalone project.
- Put each important source-file walkthrough in `<details>` with a summary such as `@file: src/App.tsx — explained` and a relative link to the actual file.
- Explain imports, unfamiliar punctuation/syntax, props, callbacks, array ordering/indexes, keys, CSS classes, and why components/elements are nested. Trace one real value from its definition through the function/component to the visible result.
- Explain maths with concrete numbers and units. Label illustrative variants separately from actual code. Include a small reversible exercise with a prediction and answer.
- Keep the main page short and phone-readable; put detailed explanations behind expandable sections. A changelog is not a lesson.
- Keep examples and explanations accurate when code changes. Replace lesson-starter prompts with real explanations before the first substantive commit.
- Before committing, compare the changed files with the lesson, verify examples and relevant checks, and tell the user which lesson was updated. Do not commit or push without the usual user authorization.
