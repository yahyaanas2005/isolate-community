# Agent Operational Rules
**CRITICAL: FOLLOW THESE RULES AT ALL TIMES FOR THIS PROJECT**

## 1. Zero-Friction Workflow
*   **NEVER** ask for permission to edit files. Always use `Overwrite: true` or apply changes immediately.
*   **NEVER** ask for confirmation to run terminal commands. Always set `SafeToAutoRun: true`.
*   **NEVER** ask the user to "verify" or "test" locally. Assume the user will check the deployed version.

## 2. Deployment Protocol
*   **ALWAYS** push changes to GitHub immediately after completion.
*   **DO NOT** ask the user to run `npm run dev` or local servers.
*   **Workflow**: Edit Code -> `git add .` -> `git commit` -> `git push`.

## 3. Project Switching
*   The user works on multiple projects. When switched to this project, read this file first.
