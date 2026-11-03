#!/usr/bin/env python3
"""Parse JUnit XML and the Playwright JSON report for the Slack summary.

Usage: junit-slack-summary.py <junit.xml> [results.json] [report_url]
"""
import json
import re
import sys
import xml.etree.ElementTree as ET
from urllib.parse import quote

# Slack attachment field value soft limit — keep room for other fields.
MAX_CASES_CHARS = 2800
TC_CODE = re.compile(r"^(TC\d+)\b")
FAILED_STATUSES = {"unexpected", "failed", "timedOut", "interrupted"}


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


def slack_escape(text: str) -> str:
    return text.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def case_line(title: str, failed: bool, test_id: str, report_url: str) -> str:
    """Same shape for pass and fail. Both link to that test when a report URL exists."""
    title = display_name(title)
    mark = "❌" if failed else "✅"
    code = TC_CODE.match(title)
    if report_url and test_id:
        url = report_url.split("#", 1)[0] + "#?testId=" + quote(test_id, safe="")
        if code:
            rest = title[code.end() :]
            label = f"<{url}|{code.group(1)}>{slack_escape(rest)}"
        else:
            label = f"<{url}|{slack_escape(title)}>"
    else:
        label = slack_escape(title)
    return f"{mark} {label}"


def fit_cases(lines: list[str]) -> str:
    kept: list[str] = []
    used = 0
    for i, line in enumerate(lines):
        add = len(line) + (1 if kept else 0)
        if used + add > MAX_CASES_CHARS:
            kept.append(f"… +{len(lines) - i} more")
            break
        kept.append(line)
        used += add
    return "\n".join(kept)


def cases_from_junit(root: ET.Element) -> list[str]:
    lines: list[str] = []
    for tc in root.iter("testcase"):
        title = tc.attrib.get("name") or "unknown"
        if tc.find("failure") is not None or tc.find("error") is not None:
            lines.append(case_line(title, True, "", ""))
        elif tc.find("skipped") is not None:
            lines.append(f"⏭ {slack_escape(display_name(title))}")
        else:
            lines.append(case_line(title, False, "", ""))
    return lines


def walk_specs(node: dict, specs: list[dict]) -> None:
    for spec in node.get("specs") or []:
        specs.append(spec)
    for child in node.get("suites") or []:
        if isinstance(child, dict):
            walk_specs(child, specs)


def cases_from_results(report: dict, report_url: str) -> list[str]:
    specs: list[dict] = []
    for suite in report.get("suites") or []:
        if isinstance(suite, dict):
            walk_specs(suite, specs)
    lines: list[str] = []
    for spec in specs:
        tests = spec.get("tests") or []
        status = ""
        if tests and isinstance(tests[0], dict):
            status = str(tests[0].get("status") or "")
        if status == "skipped":
            lines.append(f"⏭ {slack_escape(display_name(spec.get('title') or 'unknown'))}")
            continue
        failed = (not spec.get("ok")) or status in FAILED_STATUSES
        lines.append(
            case_line(
                str(spec.get("title") or "unknown"),
                failed,
                str(spec.get("id") or ""),
                report_url,
            )
        )
    return lines


def main() -> None:
    junit_path = sys.argv[1] if len(sys.argv) > 1 else "reports/junit.xml"
    results_path = sys.argv[2] if len(sys.argv) > 2 else ""
    report_url = sys.argv[3].strip() if len(sys.argv) > 3 else ""
    out = {
        "summary": "n/a",
        "bar": "n/a",
        "duration": "n/a",
        "failed": "",
        "cases": "",
    }
    case_lines: list[str] = []
    try:
        root = ET.parse(junit_path).getroot()
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
        case_lines = cases_from_junit(root)
    except Exception:
        pass

    if results_path:
        try:
            with open(results_path, encoding="utf-8") as handle:
                report = json.load(handle)
            linked = cases_from_results(report, report_url)
            if linked:
                case_lines = linked
        except Exception:
            pass

    if case_lines:
        out["cases"] = fit_cases(case_lines)
    print(json.dumps(out))


if __name__ == "__main__":
    main()
