#!/usr/bin/env python3
"""Parse JUnit XML for Slack E2E summary (stdout: JSON)."""
import json
import sys
import xml.etree.ElementTree as ET


def pass_rate_bar(passed: int, total: int, width: int = 12) -> str:
    if total <= 0:
        return "n/a"
    ratio = passed / total
    filled = max(0, min(width, int(round(ratio * width))))
    pct = int(round(ratio * 100))
    blocks = "\u2588" * filled + "\u2591" * (width - filled)
    return f"{blocks} {pct}% ({passed}/{total})"


def main() -> None:
    path = sys.argv[1] if len(sys.argv) > 1 else "reports/junit.xml"
    out = {"summary": "n/a", "bar": "n/a", "duration": "n/a", "failed": ""}
    try:
        root = ET.parse(path).getroot()
        suites = list(root.iter("testsuite"))
        tests = sum(int(s.attrib.get("tests", 0)) for s in suites)
        failures = sum(int(s.attrib.get("failures", 0)) for s in suites)
        errors = sum(int(s.attrib.get("errors", 0)) for s in suites)
        seconds = sum(float(s.attrib.get("time", 0) or 0) for s in suites)
        failed_count = failures + errors
        passed = max(tests - failed_count, 0)
        out["summary"] = f"{passed} passed, {failed_count} failed ({tests} total)"
        out["bar"] = pass_rate_bar(passed, tests)
        out["duration"] = f"{seconds:.1f}s" if seconds else "n/a"
        names = []
        for tc in root.iter("testcase"):
            if tc.find("failure") is not None or tc.find("error") is not None:
                name = tc.attrib.get("name") or "unknown"
                suite = tc.attrib.get("classname") or ""
                names.append(f"{suite}.{name}" if suite else name)
        if names:
            shown = names[:15]
            text = "\n".join(shown)
            if len(names) > 15:
                text += f"\n… +{len(names) - 15} more"
            out["failed"] = text
    except Exception:
        pass
    print(json.dumps(out))


if __name__ == "__main__":
    main()
