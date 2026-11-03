#!/usr/bin/env python3
"""Parse JUnit XML and the Playwright JSON report for the Slack summary.

Usage: junit-slack-summary.py <junit.xml> [results.json] [report_url]
"""
import json
import re
import sys
import xml.etree.ElementTree as ET
from urllib.parse import quote

TC_CODE = re.compile(r"^(TC\d+)\b")
MAX_ROWS = 40
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


def failure_detail(node: ET.Element | None) -> str:
    if node is None:
        return ""
    msg = (node.attrib.get("message") or node.text or "").strip()
    if not msg:
        return ""
    line = re.split(r"[\r\n]+", msg)[0].strip()
    line = re.sub(r"\s+", " ", line)
    if len(line) > 140:
        line = line[:137] + "…"
    return line


def case_row(
    title: str,
    failed: bool,
    test_id: str,
    report_url: str,
    skipped: bool = False,
    detail: str = "",
) -> dict:
    """Pass and fail share a monospace line. Only failures carry a report link."""
    title = display_name(title)
    if skipped:
        mark = "⏭"
    else:
        mark = "❌" if failed else "✅"
    code_match = TC_CODE.match(title)
    if code_match:
        code = code_match.group(1)
        rest = title[code_match.end() :]
    else:
        code = title
        rest = ""
    url = ""
    if failed and report_url and test_id and not skipped:
        url = report_url.split("#", 1)[0] + "#?testId=" + quote(test_id, safe="")
    return {
        "mark": mark,
        "code": code,
        "rest": rest,
        "url": url,
        "detail": detail if failed else "",
    }


def cap_rows(rows: list[dict], report_url: str) -> list[dict]:
    if len(rows) <= MAX_ROWS:
        return rows
    extra = len(rows) - MAX_ROWS
    more_url = report_url.split("#", 1)[0] if report_url else ""
    return rows[:MAX_ROWS] + [
        {"mark": "", "code": f"… +{extra} more", "rest": "", "url": more_url}
    ]


def cases_from_junit(root: ET.Element) -> list[dict]:
    rows: list[dict] = []
    for tc in root.iter("testcase"):
        title = tc.attrib.get("name") or "unknown"
        if tc.find("skipped") is not None:
            rows.append(case_row(title, False, "", "", skipped=True))
            continue
        failure = tc.find("failure")
        if failure is None:
            failure = tc.find("error")
        rows.append(case_row(title, failure is not None, "", "", detail=failure_detail(failure)))
    return rows


def details_by_title(root: ET.Element) -> dict[str, list[str]]:
    grouped: dict[str, list[str]] = {}
    for tc in root.iter("testcase"):
        failure = tc.find("failure")
        if failure is None:
            failure = tc.find("error")
        if failure is None:
            continue
        title = display_name(tc.attrib.get("name") or "unknown")
        grouped.setdefault(title, []).append(failure_detail(failure))
    return grouped


def walk_specs(node: dict, specs: list[dict]) -> None:
    for spec in node.get("specs") or []:
        specs.append(spec)
    for child in node.get("suites") or []:
        if isinstance(child, dict):
            walk_specs(child, specs)


def cases_from_results(report: dict, report_url: str) -> list[dict]:
    specs: list[dict] = []
    for suite in report.get("suites") or []:
        if isinstance(suite, dict):
            walk_specs(suite, specs)
    rows: list[dict] = []
    for spec in specs:
        tests = spec.get("tests") or []
        status = ""
        if tests and isinstance(tests[0], dict):
            status = str(tests[0].get("status") or "")
        if status == "skipped":
            rows.append(case_row(str(spec.get("title") or "unknown"), False, "", "", skipped=True))
            continue
        failed = (not spec.get("ok")) or status in FAILED_STATUSES
        rows.append(
            case_row(
                str(spec.get("title") or "unknown"),
                failed,
                str(spec.get("id") or ""),
                report_url,
            )
        )
    return rows


def apply_junit_details(rows: list[dict], details: dict[str, list[str]]) -> None:
    pending = {title: list(lines) for title, lines in details.items()}
    for row in rows:
        if row["mark"] != "❌":
            continue
        title = f"{row['code']}{row['rest']}"
        lines = pending.get(title) or []
        if not lines:
            continue
        row["detail"] = lines.pop(0)


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
        "rows": [],
    }
    case_rows: list[dict] = []
    junit_details: dict[str, list[str]] = {}
    try:
        root = ET.parse(junit_path).getroot()
        junit_details = details_by_title(root)
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
        case_rows = cases_from_junit(root)
    except Exception:
        pass

    if results_path:
        try:
            with open(results_path, encoding="utf-8") as handle:
                report = json.load(handle)
            linked = cases_from_results(report, report_url)
            if linked:
                apply_junit_details(linked, junit_details)
                case_rows = linked
        except Exception:
            pass

    out["rows"] = cap_rows(case_rows, report_url)
    print(json.dumps(out))


if __name__ == "__main__":
    main()
