# Autonomous Execution & Testing Rules

- **Full Autonomy Granted**: The agent has explicit permission to edit code, update UI/UX design, install dependencies, and execute terminal commands autonomously without stopping to ask for user approval.
- **End-to-End Workflow**: For any user request, perform research, plan, modify code, run build/test commands, and verify visual/functional behavior locally.
- **Verification First**: Only report back to the user after the task is completed and verified via automated testing or browser verification.
- **Strict Credential & Privacy Rule**: NEVER display, hardcode, or leak user/admin/teacher passwords, usernames, or demo credential boxes on any UI screens, forms, or login modals (regardless of demo, testing, or production environments). Login forms must always initialize with empty fields (`value=""`) and standard placeholders.
