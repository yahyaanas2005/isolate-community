# Agent Operational Rules
**CRITICAL: FOLLOW THESE RULES AT ALL TIMES FOR THIS PROJECT**

## 1. Project Identity & Deployment Target
*   **PRIMARY PROJECT**: `isolate-community-rcmg`
*   **GITHUB REPO**: `yahyaanas2005/isolate-community`
*   **DEPLOYMENT RULE**: All pushes to `main` auto-deploy to `isolate-community-rcmg`.
*   **IGNORE**: Any other Vercel projects (e.g., `isolate-community`) linked to this repo. They are stale/duplicates.
*   **VERIFICATION**: When checking status, ONLY look for `isolate-community-rcmg`.

## 2. Development Workflow (BATCH CHANGES)
*   **KEEP CHANGES LOCAL** - Do NOT push to GitHub after every small change.
*   **BATCH DEPLOYMENTS** - Only push to GitHub when explicitly asked by user OR after significant milestones.
*   **REASON**: Vercel has deployment caps. Minimize "WIP" deployments.
*   **WORKFLOW**: Edit Code → Test Locally (if needed) → Keep accumulating changes → Push only on user request.

## 3. Environment & Configuration (NEVER TOUCH)
*   **NEVER** modify `.env.local` or `.vercel/project.json` unless explicitly asked.
*   **NEVER** run `vercel link` command. Use Git for deployment always.
*   **CURRENT CONFIG**:
    - Vercel Project: `isolate-community-rcmg`
    - Live URL: [Check Vercel Dashboard]
    - DB: Supabase (Production)

## 4. GitHub Push Protocol
*   Only push when:
    1. User explicitly requests deployment/push
    2. Significant feature is complete (after 2-4 hours of work)
    3. Critical bug fix needed on live site
*   Always use meaningful commit messages.

## 5. File Safety
*   **NEVER** delete files without explicit user permission.
*   **ALWAYS** use `Overwrite: true` for code edits (no asking).
*   **BACKUP** critical changes in commit history.
