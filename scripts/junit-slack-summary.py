#!/usr/bin/env python3
"""Parse JUnit XML for Slack E2E summary (stdout: JSON)."""
import json
import re
import sys
import xml.etree.ElementTree as ET

# Slack attachment field value soft limit — keep room for other fields.
MAX_CASES_CHARS = 2800
MAX_FAILED_LINES = 15


def pass_rate_bar(passed: int, total: int, width: int = 12) -> str:
    if total <= 0:
        return "n/a"
    ratio = passed / total
    filled = max(0, min(width, int(round(ratio * width))))
    pct = int(round(ratio * 100))
    blocks = "\u2588" * filled + "\u2591" * (width - filled)
    return f"{blocks} {pct}% ({passed}/{total})"


def display_name(raw: str) -> str:
    """Strip Playwright project prefix: 'i18n › TC01: …' → 'TC01: …'."""
    name = (raw or "unknown").strip()
    if " › " in name:
        name = name.split(" › ", 1)[-1]
    return name


def failure_hint(tc: ET.Element) -> str:
    node = tc.find("failure")
    if node is None:
        node = tc.find("error")
    if node is None:
        return ""
    msg = (node.attrib.get("message") or node.text or "").strip()
    if not msg:
        return ""
    # First meaningful line, collapse whitespace.
    line = re.split(r"[\r\n]+", msg)[0].strip()
    line = re.sub(r"\s+", " ", line)
    if len(line) > 120:
        line = line[:117] + "…"
    return line


def main() -> None:
    path = sys.argv[1] if len(sys.argv) > 1 else "reports/junit.xml"
    out = {
        "summary": "n/a",
        "bar": "n/a",
        "duration": "n/a",
        "failed": "",
        "cases": "",
    }
    try:
        root = ET.parse(path).getroot()
        suites = list(root.iter("testsuite"))
        tests = sum(int(s.attrib.get("tests", 0)) for s in suites)
        failures = sum(int(s.attrib.get("failures", 0)) for s in suites)
        errors = sum(int(s.attrib.get("errors", 0)) for s in suites)
        skipped = sum(int(s.attrib.get("skipped", 0)) for s in suites)
        seconds = sum(float(s.attrib.get("time", 0) or 0) for s in suites)
        failed_count = failures + errors
        passed = max(tests - failed_count - skipped, 0)
        out["summary"] = (
            f"{passed} passed, {failed_count} failed"
            + (f", {skipped} skipped" if skipped else "")
            + f" ({tests} total)"
        )
        out["bar"] = pass_rate_bar(passed, tests)
        out["duration"] = f"{seconds:.1f}s" if seconds else "n/a"

        case_lines: list[str] = []
        failed_lines: list[str] = []
        for tc in root.iter("testcase"):
            title = display_name(tc.attrib.get("name") or "unknown")
            if tc.find("failure") is not None or tc.find("error") is not None:
                mark = "❌"
                hint = failure_hint(tc)
                line = f"{mark} {title}" + (f" — {hint}" if hint else "")
                case_lines.append(line)
                failed_lines.append(line)
            elif tc.find("skipped") is not None:
                case_lines.append(f"⏭ {title}")
            else:
                case_lines.append(f"✅ {title}")

        if failed_lines:
            shown = failed_lines[:MAX_FAILED_LINES]
            text = "\n".join(shown)
            if len(failed_lines) > MAX_FAILED_LINES:
                text += f"\n… +{len(failed_lines) - MAX_FAILED_LINES} more"
            out["failed"] = text

        if case_lines:
            # Fit as many case lines as Slack field allows.
            kept: list[str] = []
            used = 0
            for i, line in enumerate(case_lines):
                add = len(line) + (1 if kept else 0)
                if used + add > MAX_CASES_CHARS:
                    kept.append(f"… +{len(case_lines) - i} more")
                    break
                kept.append(line)
                used += add
            out["cases"] = "\n".join(kept)
    except Exception:
        pass
    print(json.dumps(out))


if __name__ == "__main__":
    main()
