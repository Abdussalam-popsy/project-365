---
description: Teach the implementation through accurate, beginner-friendly lessons before delivery and commits.
trigger: always_on
---

# Learning is part of the feature

- This is a learning/practice repository. Do not wait for the user to remind you to explain the code.
- For substantive changes to an experiment or template, create or update its own `lessons.md` before considering the work complete and before any requested commit.
- Use the `code-lessons` skill. If it is not listed, read `.devin/skills/code-lessons/SKILL.md` from this repository.
- Explain actual files, unfamiliar syntax, why the structure was chosen, how values and indexes move between arrays/components/DOM elements, and the maths with concrete input/output examples. A feature summary or changelog is not enough.
- Keep the main reading path short. Put depth inside `<details>` sections titled `@file: relative/path — explained`, with a source link, small accurate snippets, plain-English translations, and prediction exercises.
- Update stale explanations when implementation changes. Never describe illustrative examples as code that already exists. Preserve useful history only when clearly labelled as history.
- For new experiments, use `scripts/new.sh`: it carries the portable learning rule and a lesson starter into the generated directory. A starter containing prompts is not a completed lesson.
- Before committing, compare changed source files with their lessons, verify examples/commands as appropriate, and point the user to the lesson file. This rule does not authorize commits or pushes; obtain the usual explicit permission.
