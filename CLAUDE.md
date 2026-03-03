# CLAUDE.md — gabriSite

This file guides AI assistants (Claude Code and similar tools) working in this repository.

---

## Project Status

**This is a new, empty repository.** No source files have been committed yet. This CLAUDE.md will be updated as the project is built out.

- **Repository**: Gabrie2K/gabriSite
- **Remote**: `http://local_proxy@127.0.0.1:32163/git/Gabrie2K/gabriSite`
- **Created**: 2026-03-03

---

## Repository Overview

`gabriSite` is a personal/portfolio website project. The exact tech stack has not yet been established. Update this section once a framework and toolchain are chosen.

---

## Development Branch Conventions

- All AI-assisted work must be done on branches following the pattern: `claude/<description>-<session-id>`
- Never push directly to `main` or `master` without explicit permission
- Use `git push -u origin <branch-name>` for all pushes

---

## Git Workflow

```bash
# Create and switch to a feature branch
git checkout -b feature/<feature-name>

# Stage specific files (avoid git add -A to prevent accidentally committing secrets)
git add <file1> <file2>

# Commit with a descriptive message
git commit -m "feat: describe the change"

# Push with upstream tracking
git push -u origin <branch-name>
```

### Commit Message Format

Use [Conventional Commits](https://www.conventionalcommits.org/):

| Prefix | When to use |
|--------|-------------|
| `feat:` | New feature |
| `fix:` | Bug fix |
| `chore:` | Tooling, config, maintenance |
| `docs:` | Documentation changes |
| `style:` | Formatting, no logic change |
| `refactor:` | Code restructuring, no behavior change |
| `test:` | Adding or updating tests |

---

## File & Directory Structure (Planned)

Update this section once the project structure is established. A typical web project layout:

```
gabriSite/
├── CLAUDE.md          # This file
├── README.md          # User-facing project documentation
├── package.json       # Node dependencies and scripts (if applicable)
├── src/               # Application source code
├── public/            # Static assets
├── tests/             # Test files
└── .github/           # CI/CD workflows (if applicable)
```

---

## Key Conventions for AI Assistants

1. **Read before editing** — always read a file before modifying it
2. **Minimal changes** — only change what is directly requested; avoid unrelated refactors
3. **No secrets in commits** — never commit `.env` files, API keys, or credentials
4. **Prefer editing over creating** — modify existing files rather than creating new ones
5. **Security first** — avoid XSS, SQL injection, command injection, and other OWASP Top 10 issues
6. **Ask before destructive actions** — confirm before `git reset --hard`, force-push, file deletion, or overwriting uncommitted work

---

## Environment Setup

> **To be filled in** once dependencies and toolchain are decided.

```bash
# Example (update when stack is chosen)
npm install        # Install dependencies
npm run dev        # Start development server
npm run build      # Production build
npm run test       # Run tests
npm run lint       # Run linter
```

---

## Testing

> **To be filled in** once a testing framework is chosen.

- Run tests before committing
- All new features should include corresponding tests
- Do not mark a task complete if tests are failing

---

## Linting & Formatting

> **To be filled in** once ESLint/Prettier or equivalent is configured.

- Run the linter before pushing
- Follow the project's formatter settings (do not override with personal preferences)

---

## Updating This File

Update CLAUDE.md whenever:
- A new framework, library, or tool is added
- Project conventions change
- New scripts or workflows are established
- The directory structure changes significantly
