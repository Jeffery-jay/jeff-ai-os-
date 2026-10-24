# JEFF AI — Build Log

A dated record of every change to this project, why it was made, and how to undo it.
Newest entries at the top. Maintained by Folk (AI assistant) with each code change.

---

## 2026-10-24 — Short-term memory + saved chat history
**What changed**
- `index.html`: the site now saves the last 24 messages in the browser (localStorage), restores them on reload, and a "+ New chat" button clears them.
- `worker.js`: accepts the recent conversation history from the site (capped to 12 turns, texts capped at 4,000 chars) so JEFF can see recent context when replying.
**Why**: JEFF previously forgot each message immediately; follow-up questions like "make day 4 shorter" didn't work.
**To undo**: revert commits `0989b37` (memory) and the chat-history commit on `main`.

## 2026-10-24 — Task Engine v1
**What changed**
- `worker.js`: messages starting with `task:` switch Gemini into executor mode (structured deliverable, stated assumptions, ends with a `STATUS:` line, never claims real-world actions).
- `index.html`: task replies render as a highlighted TASK RESULT card with a Copy button.
**Why**: turn JEFF from a chatbot into an agent that produces usable work products.
**To undo**: revert commit `64df498` and redeploy the previous Worker (backup in `worker/worker.js` history).

## 2026-10-24 — Worker backup
**What changed**
- Added `worker/worker.js` to this repo: an exact copy of the deployed Cloudflare Worker at the time.
**Why**: the Worker code previously lived only in Cloudflare with no version control.
**To undo**: delete `worker/worker.js`.

## 2026-10-24 — Live-site fixes (CORS + model)
**What changed**
- Worker: added CORS/OPTIONS preflight handling (was returning 405, causing "Network error" on the site) and replaced the retired model `gemini-2.0-flash` (shut down June 2026) with `gemini-3.6-flash`.
- Discovered the live site is https://jeffery-jay.github.io/jeff-ai-os-/ — the repo with the trailing dash. The no-dash `jeff-ai-os` repo is empty, which is why that URL 404s.
**To undo**: not needed; these were fixes to restore working behavior.

## 2026-10-09 — Original build
- Cloudflare Worker `jeff-ai-agentdev` deployed, Gemini tests passed (HTTP 200).
- GitHub Pages site published; README.md and agent.py created (agent.py is still an empty placeholder).

---

## Known issues / next steps
- [ ] Error seen once after page refresh ("Gemini cannot perform that request") — not one of our error messages; watching for recurrence, need exact screenshot.
- [ ] Memory is per-browser only; true saved memory (server-side) is a future milestone.
- [ ] `agent.py` is an empty placeholder.
- [ ] Stray `landing.html` from an Android Harness test is in the workspace, not committed.
- [ ] Empty `jeff-ai-os` (no dash) repo causes a 404 at that URL; consider deleting or filling it.
