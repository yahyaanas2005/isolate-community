# Agent Operational Rules
**CRITICAL: FOLLOW THESE RULES AT ALL TIMES FOR THIS PROJECT**

## 1. Development Workflow (BATCH CHANGES)
*   **KEEP CHANGES LOCAL** - Do NOT push to GitHub after every small change.
*   **BATCH DEPLOYMENTS** - Only push to GitHub when explicitly asked by user OR after 2-4 hours of accumulated work.
*   **REASON**: Vercel has deployment caps. Each GitHub push triggers auto-deployment.
*   **WORKFLOW**: Edit Code → Test Locally (if needed) → Keep accumulating changes → Push only on user request.

## 2. Environment & Configuration (NEVER TOUCH)
*   **NEVER** modify `.env.local`, `.vercel/project.json`, or Supabase settings unless explicitly asked.
*   **NEVER** run `vercel link` or any command that could disconnect/reconnect services.
*   **CURRENT VERIFIED CONFIG**:
    - Vercel Project: `isolate-community` (prj_bJrtUy0JNZhquENOg59sxSbgdQ8E)
    - Supabase: `lyzbhvfjagpjquoufbhh.supabase.co`
    - Live URL: https://isolate-community.vercel.app
    - Environment Variables: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (Production + Preview)

## 3. Quality Assurance (DOUBLE-CHECK EVERYTHING)
*   **VERIFY** before any database/config changes by reading current state first.
*   **TEST** builds locally with `npm run build` before pushing.
*   **NEVER** assume - always check actual file contents and command outputs.
*   **CROSS-CHECK** any Supabase SQL changes against existing schema.

## 4. GitHub Push Protocol
*   Only push when:
    1. User explicitly requests deployment/push
    2. Significant feature is complete (after 2-4 hours of work)
    3. Critical bug fix that user needs to test on live site
*   Always use meaningful commit messages describing ALL changes since last push.

## 5. File Safety
*   **NEVER** delete files without explicit user permission.
*   **ALWAYS** use `Overwrite: true` for code edits (no asking).
*   **BACKUP** critical changes in commit history.

## 6. Current Project Status
*   **Last Verified Working**: 2026-01-29 15:00 PKT
*   **Login/Auth**: ✅ Working
*   **All 28 Dashboard Modules**: ✅ UI Ready
*   **Database**: ✅ Supabase connected
