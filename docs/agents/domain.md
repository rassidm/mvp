# Domain docs

This repo uses a **single-context** layout for domain documentation.

## Layout

- **`CONTEXT.md`** at the repo root: high-level domain knowledge, glossary, invariants, and context for understanding the codebase.
- **`docs/adr/`**: Architecture Decision Records documenting significant technical decisions.

## Consumer rules

**For agents:**

1. **Read `CONTEXT.md` first** when entering a new codebase or answering domain questions.
2. **Search `docs/adr/*.md`** when investigating architectural decisions, technology choices, or "why is it built this way" questions.
3. **Don't assume `CONTEXT.md` is complete.** If domain knowledge is missing, ask the user or infer from code, then offer to update `CONTEXT.md`.
4. **Keep `CONTEXT.md` current.** When you learn something significant about the domain that isn't documented, propose adding it.
5. **Write new ADRs** when making architectural decisions. Use the format in `docs/adr/template.md` if it exists, otherwise follow the standard ADR structure (Context, Decision, Consequences).

**For humans:**

- If an agent's output shows it misunderstood the domain, check whether `CONTEXT.md` covers it. If not, add it.
- Use ADRs to explain *why* a decision was made, not just *what* was decided. Future you (and future agents) will thank you.
