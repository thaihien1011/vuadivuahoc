# Autonomous Execution & Testing Rules

- **Full Autonomy Granted**: The agent has explicit permission to edit code, update UI/UX design, install dependencies, and execute terminal commands autonomously without stopping to ask for user approval.
- **End-to-End Workflow**: For any user request, perform research, plan, modify code, run build/test commands, and verify visual/functional behavior locally.
- **Verification First**: Only report back to the user after the task is completed and verified via automated testing or browser verification.
- **Strict Credential & Privacy Rule**: NEVER display, hardcode, or leak user/admin/teacher passwords, usernames, or demo credential boxes on any UI screens, forms, or login modals (regardless of demo, testing, or production environments). Login forms must always initialize with empty fields (`value=""`) and standard placeholders.

# Strict Code Quality & Permanent Error-Prevention Standards

## 1. Zero Undeclared Identifiers & Import Verification
- **Mandatory Import Check**: Every identifier, helper, hook, icon, or utility function used in any file MUST be explicitly declared in scope or imported at the top of the file.
- **Never Rely Solely on `build` Success**: Bundlers like Vite/Rollup do NOT detect runtime `ReferenceError` for undeclared variables inside lazy callbacks, event handlers (`onClick`, `onChange`), or async functions. Always perform static AST analysis.
- **State & Props Completeness**: Every state value referenced in JSX (e.g. `value={foo}`, `onChange={setFoo}`) MUST have a corresponding `useState` or prop definition.

## 2. Strict Data Conversion & Number/Date Safety
- **Safe Number Parsing**:
  - NEVER use `parseInt(val)` without radix. Always use `parseInt(val, 10)` or `Number(val)`.
  - When performing arithmetic addition on values that might originate from inputs, CSVs, or databases (e.g. `score + reward`, `coins + star`), ALWAYS guard against string concatenation by using `(Number(val) || 0) + Number(delta)`.
- **Safe Date Formatting**:
  - NEVER call `new Date(val).toLocaleDateString()` or `.toISOString()` on unguarded strings or timestamps.
  - Always verify that the date value is non-null and `!isNaN(new Date(val).getTime())` before formatting, falling back to a safe placeholder (`'--'`) rather than crashing or displaying `Invalid Date` / `01/01/1970`.
- **Safe JSON Parsing**:
  - NEVER call `JSON.parse(localStorage.getItem(...))` directly without a `try/catch` block or a fallback wrapper.

## 3. Storage & Constant Integrity
- **Key Consistency**: Every key accessed on storage helper constants (e.g. `STORAGE_KEYS.FOO`) MUST be explicitly defined in the constant definition.
- **Temporal Dead Zone (TDZ)**: Declare storage keys, constants, and helper functions BEFORE or AT THE TOP of the module, never below functions that call them during module execution.

## 4. Protection Against Destructive Fallbacks
- **No Overwrite on Read Failure**: If a read/fetch operation fails or times out, NEVER synthesize an empty/default record and write it back to the database, as this silently wipes real user data.
- **Clean Architecture Migration**: When moving from Mock/LocalStorage to live Cloud Databases (e.g. Firestore/SQL), purge all dead mock references and unlinked legacy files.

## 5. Mandatory Pre-Commit AST Static Verification
- Before finishing any coding task or deploying, automatically run the AST static verification script to ensure 0 undeclared variables, 0 missing imports, and 0 unsafe conversions.
