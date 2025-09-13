import os
import json
import subprocess
import traceback
import re
from pathlib import Path
from dotenv import load_dotenv
from datetime import datetime
import boto3
from botocore.config import Config

# === Load AWS credentials & env ===
load_dotenv()
BASE_URL = os.getenv("BASE_URL", "http://localhost:8989")  # can be overridden in .env
ROUTE_MAP_PATH = Path("route-map.json")  # optional: { "src/page/home.jsx": "/home" }

# === Paths ===
JSX_FOLDER = Path("src/page")
REPORT_PATH = Path("accessibility-report.json")  # legacy single report (kept for compatibility)
CHECK_SCRIPT_PATH = Path("accessibility-check.js")  # node script invoked per page
BACKUP_ROOT = Path("a11y_backups")

# === Globals set per-file during processing ===
JSX_PATH = None
BACKUP_PATH = None
FIX_SUGGESTIONS_PATH = None

# === Node axe+playwright script (CLI: --url, --out) ===
ACCESSIBILITY_CHECK_JS = r"""
const { chromium } = require('playwright');
const AxeBuilder = require('@axe-core/playwright').default;
const fs = require('fs');

function parseArg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  if (i !== -1 && i + 1 < process.argv.length) return process.argv[i + 1];
  return fallback;
}

(async () => {
  const url = parseArg('--url', 'http://localhost:8989/');
  const outPath = parseArg('--out', 'accessibility-report.json');

  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('domcontentloaded');

  const results = await new AxeBuilder({ page }).analyze();

  // Enrich color-contrast nodes with color info
  results.violations.forEach(v => {
    if (v.id === 'color-contrast') {
      v.nodes.forEach(n => {
        const summary = n.failureSummary || '';
        const ratioMatch = summary.match(/contrast of ([\d\.]+):1/i);
        const fgMatch = summary.match(/Foreground:\s*(#[0-9a-fA-F]{3,6})/i);
        const bgMatch = summary.match(/Background:\s*(#[0-9a-fA-F]{3,6})/i);
        if (fgMatch) n.fg = fgMatch[1];
        if (bgMatch) n.bg = bgMatch[1];
        if (ratioMatch) n.contrast = parseFloat(ratioMatch[1]);
      });
    }
  });

  fs.mkdirSync(require('path').dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify({ url, ...results }, null, 2));
  console.log(`Accessibility report saved: ${outPath}`);

  await browser.close();
})();
"""

# ---------- Helpers ----------
def write_check_script():
    CHECK_SCRIPT_PATH.write_text(ACCESSIBILITY_CHECK_JS.strip(), encoding="utf-8")

def run_playwright_audit(url: str, output_path: Path) -> dict | None:
    try:
        print(f"▶ Running Axe + Playwright audit for {url}")
        subprocess.run(
            ["node", str(CHECK_SCRIPT_PATH), "--url", url, "--out", str(output_path)],
            check=True
        )
        if output_path.exists():
            with output_path.open("r", encoding="utf-8") as f:
                return json.load(f)
        print(f"⚠ No report found at {output_path}")
        return None
    except subprocess.CalledProcessError as e:
        print("Error running accessibility-check.js:")
        print(getattr(e, "stderr", e))
        return None

# ...existing code...
def clean_updated_jsx(raw_jsx: str) -> str:
    """
    Safer cleaning:
    - Strip code fences / assistant chatter only.
    - Do NOT inject new aria-labels.
    - Remove malformed / unquoted aria-label attributes.
    - Do not touch normal JSX structure.
    """
    text = raw_jsx.strip()

    # Remove single leading/trailing fenced code blocks
    text = re.sub(r'^```(?:[a-zA-Z0-9_-]+)?\s*', '', text)
    text = re.sub(r'\s*```$', '', text)

    # Drop obvious narrator / preface lines
    throwaway_prefix = re.compile(
        r'^\s*(here\'?s|here is|updated jsx|updated code|the key changes|summary of changes|assistant:)\b',
        re.IGNORECASE
    )
    cleaned_lines = []
    for line in text.splitlines():
        if throwaway_prefix.match(line.strip()):
            continue
        # Skip bullet commentary
        if re.match(r'^\s*[-*]\s', line):
            continue
        cleaned_lines.append(line)
    text = "\n".join(cleaned_lines)

    # Remove any injected full html wrappers
    text = re.sub(r'(?is)<!DOCTYPE[^>]*>', '', text)
    text = re.sub(r'(?is)</?(html|head|body)[^>]*>', '', text)

    # Remove placeholder / omission comments the model might add
    text = re.sub(
        r'\{\s*/\*\s*(other content|unchanged|placeholder|omitted|rows omitted|table content)\s*\*/\s*\}',
        '',
        text,
        flags=re.IGNORECASE
    )

    # Normalize redundant alt values (remove the word image/photo/picture if present)
    text = re.sub(r'alt\s*=\s*"([^"]*?)\b(?:image|photo|picture)\b([^"]*?)"', r'alt="\1\2"', text, flags=re.IGNORECASE)

    # Remove empty style=""
    text = re.sub(r'style\s*=\s*"\s*"', '', text)

    # Remove malformed unquoted aria-label attributes (e.g. aria-label=About ...)
    # Strategy: drop aria-label= followed by non-quote up to next > or attribute boundary.
    text = re.sub(r'\saria-label=(?!["\']).*?(?=[\s>/])', '', text)

    # Remove duplicated stray leading ">" fragments produced by bad merges
    text = re.sub(r'>\s*">', '">', text)

    # Collapse accidental duplication of a Button or Typography start tag lines
    text = re.sub(r'(</?(Button|Typography)\b[^>]*>)\s*\1+', r'\1', text)

    # Final trim
    return text.strip()

def add_aria_labels_to_buttons(jsx: str) -> str:
    def replace(m):
        attrs, inner = m.group(1), m.group(2).strip()
        if 'aria-label=' in attrs or not inner:
            return m.group(0)
        if attrs.strip().endswith('/'):
            attrs = attrs.strip()[:-1]
        return f'<Button{attrs} aria-label="{inner}">{inner}</Button>'
    return re.sub(r"<Button([^>]*)>(.*?)</Button>", replace, jsx, flags=re.DOTALL)

def add_aria_labels_to_icons(jsx: str) -> str:
    def replace(m):
        tag, attrs = m.group(1), m.group(2).strip()
        if 'aria-label=' not in attrs:
            label = "Edit icon" if tag.lower().startswith("edit") else "Trash icon"
            return f'<{tag} {attrs} aria-label="{label}" />'
        return m.group(0)
    return re.sub(r"<(Edit|Trash)([^>]*)/>", replace, jsx, flags=re.IGNORECASE)

def add_aria_labels_to_typography(jsx: str) -> str:
    """
    Add aria-label to Typography elements that don't already have one.
    Automatically quotes and escapes the value for JSX.
    """
    def replace(match):
        attrs = match.group(1)
        inner = match.group(2).strip()
        # Skip if already has aria-label or if no content
        if 'aria-label=' in attrs or not inner:
            return match.group(0)
        # Clean up the inner text for aria-label (remove HTML tags, React expressions)
        clean_text = re.sub(r'<[^>]+>', '', inner)  # Remove HTML tags
        clean_text = re.sub(r'\{[^}]*\}', '', clean_text)  # Remove React expressions
        clean_text = re.sub(r'\s+', ' ', clean_text).strip()  # Normalize whitespace
        clean_text = clean_text.replace('"', '&quot;')  # Escape quotes
        # For React intl.formatMessage, extract message ID if present
        if '{intl.formatMessage' in inner:
            id_match = re.search(r"id:\s*['\"]([^'\"]+)['\"]", inner)
            if id_match:
                message_id = id_match.group(1).replace('-', ' ').replace('_', ' ')
                clean_text = message_id.title()
        # Limit length
        if len(clean_text) > 100:
            clean_text = clean_text[:97] + '...'
        # Only add aria-label if meaningful
        if clean_text and len(clean_text) > 2:
            if attrs.strip():
                return f'<Typography{attrs} aria-label={inner}>{inner}</Typography>'
            else:
                return f'<Typography aria-label={inner}>{inner}</Typography>'
        return match.group(0)
    return re.sub(r"<Typography([^>]*)>(.*?)</Typography>", replace, jsx, flags=re.DOTALL) 

def add_tabindex_to_focusable(jsx: str) -> str:
    pattern = r"<(span|Typography|p|Table|TableCell|TableHead)([^>]*)>(.*?)</\1>|<(TableCell)([^>]*)/>"
    def patch(m):
        tag = m.group(1) or m.group(4)
        attrs = m.group(2) or m.group(5) or ""
        content = m.group(3) or ""
        if 'tabindex=' not in attrs.lower():
            if tag in ["TableCell"]:
                return f'<{tag}{attrs} tabIndex="0" />'
            return f'<{tag}{attrs} tabIndex="0">{content}</{tag}>'
        return m.group(0)
    return re.sub(pattern, patch, jsx, flags=re.IGNORECASE | re.DOTALL)

def restore_table_from_backup(updated_jsx):
    try:
        backup = BACKUP_PATH.read_text(encoding='utf-8')
        match = re.search(r"<Table.*?</Table>", backup, flags=re.DOTALL)
        if not match:
            print("Could not extract <Table> from backup.")
            return updated_jsx
        print("🛠️ Restoring <Table> from backup.")
        return re.sub(r"<Table.*?</Table>", match.group(0), updated_jsx, flags=re.DOTALL)
    except Exception:
        print("Error restoring <Table> from backup.")
        print(traceback.format_exc())
        return updated_jsx

def generate_fix_suggestions(violations):
    try:
        prompt = (
            "\n\nHuman: You are an expert React accessibility engineer. Below is a JSON array of accessibility violations "
            "detected in a JSX webpage. For each violation:\n"
            "- Identify the JSX element in the `htmlSnippet` field.\n"
            "- Fix the element by adding accessibility attributes like `aria-label`, `role`, `tabIndex`, etc.\n"
            "- For color-contrast violations:\n"
            "  - Use the `fg` (foreground), `bg` (background), and `contrast` values from the input.\n"
            "  - If contrast < 4.5:1, suggest a new foreground or background color to meet WCAG 2.1 AA (≥ 4.5:1).\n"
            "  - Only update the `style={{ color: ..., backgroundColor: ... }}` part of the JSX tag or its `className` if applicable.\n"
            "  - Do NOT remove any styles, props, or attributes.\n"
            "\n"
            "Strict rules:\n"
            "- ONLY modify the JSX element shown in the `htmlSnippet`.\n"
            "- DO NOT remove or replace any unrelated code.\n"
            "- DO NOT write comments like `// logic unchanged` or `// styles unchanged`.\n"
            "- DO NOT remove or rewrite styles, logic, imports, or component structure.\n"
            "- DO NOT reformat or restructure surrounding JSX.\n"
            "- Return ONLY valid JSX elements — one per violation.\n"
            "\n"
            "Violations:\n" + json.dumps(violations, indent=2) +
            "\n\nAssistant:"
        )

        bedrock = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION"))
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-5-sonnet-20240620-v1:0",
            accept="application/json",
            contentType="application/json",
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "messages": [{ "role": "user", "content": prompt }],
                "max_tokens": 3000,
                "temperature": 0.4,
                "stop_sequences": ["\n\nHuman:"]
            }),
        )

        body = json.loads(response["body"].read())
        completion = body.get("content", [{}])[0].get("text", "").strip()
        cleaned = clean_updated_jsx(completion)
        FIX_SUGGESTIONS_PATH.write_text(cleaned, encoding="utf-8")
        print(f"💡 Fix suggestions saved: {FIX_SUGGESTIONS_PATH}")
        return cleaned
    except Exception as e:
        print("Failed to generate fix suggestions:", e)
        traceback.print_exc()
        return ""

def apply_claude_fixes_to_jsx():
    try:
        if not JSX_PATH.exists() or not FIX_SUGGESTIONS_PATH.exists():
            raise FileNotFoundError("Required JSX or fix-suggestions file missing.")

        original_jsx = JSX_PATH.read_text(encoding='utf-8')
        fix_suggestions = FIX_SUGGESTIONS_PATH.read_text(encoding='utf-8')

        prompt = (
            "\n\nHuman: Here is a full React JSX file and some small JSX fragments that apply accessibility fixes "
            "like `aria-label`, `role`, `alt`, `tabIndex`, etc.\n"
            "- Your job is to **patch** the full JSX file by replacing matching elements with their fixed versions.\n"
            "- Keep the entire JSX file intact — do NOT remove any sections like <Button>, <img>, <Table>.\n"
            "- Do NOT add summaries, comments, or extra headers like 'The key changes'.\n"
            "- Output only the updated JSX file — no explanations.\n"
            "- Only apply the fixes provided — DO NOT invent new changes.\n\n"
            f"Original JSX:\n\n{original_jsx}\n\nFix Fragments:\n\n{fix_suggestions}\n\nAssistant:"
        )

        print("✉️ Sending JSX + fixes to Claude via Bedrock...")
        config = Config(
            connect_timeout=60,
            read_timeout=600,
            retries={
                'max_attempts': 3,
                'mode': 'adaptive'
            }
        )

        bedrock = boto3.client("bedrock-runtime", region_name=os.getenv("AWS_REGION"))
        response = bedrock.invoke_model(
            modelId="anthropic.claude-3-5-sonnet-20240620-v1:0",
            accept="application/json",
            contentType="application/json",
            body=json.dumps({
                "anthropic_version": "bedrock-2023-05-31",
                "messages": [{ "role": "user", "content": prompt }],
                "max_tokens": 2000,
                "temperature": 0.3,
                "stop_sequences": ["\n\nHuman:"]
            }),
        )

        body = json.loads(response["body"].read())
        raw_output = body.get("content", [{}])[0].get("text", "").strip()
        updated_jsx = clean_updated_jsx(raw_output)
        updated_jsx = add_aria_labels_to_buttons(updated_jsx)
        updated_jsx = add_tabindex_to_focusable(updated_jsx)
        updated_jsx = add_aria_labels_to_icons(updated_jsx)
        updated_jsx = add_aria_labels_to_typography(updated_jsx)

        if not BACKUP_PATH.exists():
            BACKUP_PATH.write_text(original_jsx, encoding='utf-8')

        if any(k in updated_jsx.lower() for k in ["placeholder", "// table", "<TableBody></TableBody>"]):
            print("⚠️ Detected placeholder or missing content — restoring original table block.")
            updated_jsx = restore_table_from_backup(updated_jsx)

        # Inject a tiny summary (kept from your base)
        summary_comment = (
            "{/*\n"
            "  Accessibility Fix Summary:\n"
            "  - Applied `aria-label` for images, links, and search input.\n"
            "  - Added `role` for the wrapper div.\n"
            '  - Used `scope="row"` for table row headers.\n'
            "*/}\n"
        )

        if "Accessibility Fix Summary" not in updated_jsx:
            import_match = re.search(r"(import\s.+?;\s*)+", updated_jsx)
            if import_match:
                insert_at = import_match.end()
                updated_jsx = updated_jsx[:insert_at] + "\n" + summary_comment + updated_jsx[insert_at:]
            else:
                updated_jsx = summary_comment + updated_jsx

        JSX_PATH.write_text(updated_jsx, encoding='utf-8')
        print(f"✅ JSX updated: {JSX_PATH}")

    except Exception:
        print("Error applying JSX fixes:")
        print(traceback.format_exc())

def enrich_color_contrast_violations(violations):
    for v in violations:
        if v.get("id") == "color-contrast":
            for node in v.get("nodes", []):
                summary = node.get("failureSummary", "")
                fg_match = re.search(r"Foreground:\s*(#(?:[0-9a-fA-F]{3,6}))", summary)
                bg_match = re.search(r"Background:\s*(#(?:[0-9a-fA-F]{3,6}))", summary)
                contrast_match = re.search(r"contrast of\s*([\d.]+):1", summary)
                if fg_match: node["fg"] = fg_match.group(1)
                if bg_match: node["bg"] = bg_match.group(1)
                if contrast_match: node["contrast"] = float(contrast_match.group(1))
    return violations

def create_pr():
    try:
        branch_name = f"a11y-fix-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
        base_branch = "dev"
        commit_message = f"Automated accessibility fixes for {JSX_PATH.name}"

        print("🔍 Checking for JSX changes...")
        result = subprocess.run(["git", "diff", "--quiet", str(JSX_PATH)])
        if result.returncode == 0:
            print("No changes to commit.")
            return

        subprocess.run(["git", "checkout", "-b", branch_name], check=True)
        subprocess.run(["git", "add", str(JSX_PATH), str(BACKUP_PATH), str(FIX_SUGGESTIONS_PATH)], check=True)
        subprocess.run(["git", "commit", "-m", commit_message], check=True)
        subprocess.run(["git", "push", "--set-upstream", "origin", branch_name], check=True)
        # If you re-enable GH CLI, add it here.
    except Exception as e:
        print(f"Failed to create PR: {str(e)}")

# ---------- Routing ----------
def load_route_map():
    if ROUTE_MAP_PATH.exists():
        try:
            with ROUTE_MAP_PATH.open("r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            print("⚠ route-map.json exists but is invalid JSON. Ignoring.")
    return {}

def file_path_to_route(file_path: Path, route_map: dict) -> str:
    # Priority: explicit route-map.json (relative Unix path keys)
    rel = file_path.relative_to(JSX_FOLDER)
    key1 = str(rel).replace("\\", "/")
    key2 = str(file_path).replace("\\", "/")
    if key1 in route_map:
        route = route_map[key1]
    elif key2 in route_map:
        route = route_map[key2]
    else:
        # Derive a route: "/dir/stem" without extension(s)
        route = "/" + rel.with_suffix("").as_posix()
    # Make full URL
    if route.startswith("http://") or route.startswith("https://"):
        return route
    return BASE_URL.rstrip("/") + "/" + route.lstrip("/")

# ---------- Page processing ----------
def process_report_for_current_file(report: dict):
    if not report:
        print("⚠ Skipping fixes (no report).")
        return

    violations = report.get("violations", [])
    if not violations:
        print("🎉 No accessibility issues found.")
        return

    # Split + enrich
    color_violations = [v for v in violations if v.get('id') == 'color-contrast']
    other_violations = [v for v in violations if v.get('id') != 'color-contrast']
    enriched_color_violations = enrich_color_contrast_violations(color_violations)

    # Apply fixes in two passes (as in your base)
    if generate_fix_suggestions(enriched_color_violations):
        apply_claude_fixes_to_jsx()
    if generate_fix_suggestions(other_violations):
        apply_claude_fixes_to_jsx()

    create_pr()

def process_jsx_file(file_path: Path, route_map: dict, consolidated: list):
    global JSX_PATH, BACKUP_PATH, FIX_SUGGESTIONS_PATH

    JSX_PATH = file_path
    relative = file_path.relative_to(JSX_FOLDER)
    # Per-file artifacts live under a11y_backups/<same-subdir>/
    BACKUP_PATH = BACKUP_ROOT / relative.with_name(relative.stem + "_backup" + file_path.suffix)
    FIX_SUGGESTIONS_PATH = BACKUP_ROOT / relative.with_name("fix-suggestions.txt")
    page_report_path = BACKUP_ROOT / relative.with_name("accessibility-report.json")

    # Ensure dirs
    BACKUP_ROOT.mkdir(parents=True, exist_ok=True)
    BACKUP_PATH.parent.mkdir(parents=True, exist_ok=True)

    # Route/URL for this page
    url = file_path_to_route(file_path, route_map)
    write_check_script()
    report = run_playwright_audit(url, page_report_path)

    # Save into consolidated memory (path + violations)
    if report and "violations" in report:
        consolidated.append({
            "page": str(relative).replace("\\", "/"),
            "url": report.get("url", url),
            "violations": report["violations"]
        })

    # Proceed with the same fix pipeline but scoped to this file/report
    process_report_for_current_file(report)

# ---------- Entry ----------
if __name__ == "__main__":
    route_map = load_route_map()
    consolidated = []

    # Scan both .jsx and .tsx to be safe
    targets = list(JSX_FOLDER.rglob("*.jsx")) + list(JSX_FOLDER.rglob("*.tsx"))
    if not targets:
        print(f"⚠ No JSX/TSX files found under {JSX_FOLDER.resolve()}")
    for jsx_file in targets:
        print(f"\n=== Processing {jsx_file} ===")
        try:
            process_jsx_file(jsx_file, route_map, consolidated)
        except Exception:
            print("❌ Failed while processing:", jsx_file)
            print(traceback.format_exc())

    # Write consolidated report (all pages)
    consolidated_path = Path("accessibility-report.json")
    with consolidated_path.open("w", encoding="utf-8") as f:
        json.dump({"pages": consolidated}, f, indent=2)
    print(f"\n✅ Consolidated report saved to {consolidated_path.resolve()}")

    # Also keep legacy single-report behavior if the last run created the legacy file
    # (Nothing else to do; per-page reports live in a11y_backups/**/accessibility-report.json)
