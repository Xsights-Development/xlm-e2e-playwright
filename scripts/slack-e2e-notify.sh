#!/usr/bin/env bash
# Post E2E workflow summary to Slack incoming webhook (CI only).
set -euo pipefail

if [ -z "${SLACK_WEBHOOK_URL:-}" ]; then
  echo "SLACK_WEBHOOK_URL not set — skip Slack notification"
  exit 0
fi

STATUS="${JOB_STATUS:-unknown}"
PROJECT="${INPUT_PROJECT:-all}"
GREP="${INPUT_GREP:-}"
RUN_URL="${RUN_URL:-}"
BRANCH="${GIT_BRANCH:-}"
ACTOR="${GIT_ACTOR:-}"
RUN_NUM="${RUN_NUMBER:-}"
REPO="${GIT_REPO:-}"
WORKFLOW="${WORKFLOW_NAME:-E2E Playwright}"
APP_HOST="${APP_URL_HOST:-n/a}"
if [ -n "$APP_HOST" ] && [ "$APP_HOST" != "n/a" ]; then
  APP_HOST=$(echo "$APP_HOST" | sed -E 's|^(https?://[^/]+).*|\1|')
fi

# Attachment sidebar colors (hex) — edit here to brand colors
case "$STATUS" in
  success)
    COLOR="#2EB886"
    EMOJI=":white_check_mark:"
    RESULT="Success"
    ;;
  cancelled)
    COLOR="#ECB22E"
    EMOJI=":warning:"
    RESULT="Cancelled"
    ;;
  failure)
    COLOR="#E01E5A"
    EMOJI=":x:"
    RESULT="Failure"
    ;;
  *)
    COLOR="#95A5A6"
    EMOJI=":grey_question:"
    RESULT="$STATUS"
    ;;
esac

JUNIT_JSON='{"summary":"n/a","bar":"n/a","duration":"n/a","failed":""}'
if [ -f reports/junit.xml ]; then
  JUNIT_JSON=$(python3 scripts/junit-slack-summary.py reports/junit.xml 2>/dev/null || echo "$JUNIT_JSON")
fi
JUNIT_SUMMARY=$(echo "$JUNIT_JSON" | jq -r '.summary')
PASS_RATE_BAR=$(echo "$JUNIT_JSON" | jq -r '.bar')
DURATION=$(echo "$JUNIT_JSON" | jq -r '.duration')
FAILED_LIST=$(echo "$JUNIT_JSON" | jq -r '.failed')

GREP_DISPLAY="${GREP:-(none)}"
if [ -z "$GREP" ]; then
  GREP_DISPLAY="(none)"
fi

FOOTER="${REPO} · ${WORKFLOW} · run #${RUN_NUM}"
TS=$(date -u +%s)

PAYLOAD=$(jq -n \
  --arg emoji "$EMOJI" \
  --arg result "$RESULT" \
  --arg project "$PROJECT" \
  --arg grep "$GREP_DISPLAY" \
  --arg url "$RUN_URL" \
  --arg color "$COLOR" \
  --arg junit "$JUNIT_SUMMARY" \
  --arg bar "$PASS_RATE_BAR" \
  --arg duration "$DURATION" \
  --arg branch "$BRANCH" \
  --arg actor "$ACTOR" \
  --arg host "$APP_HOST" \
  --arg failed "$FAILED_LIST" \
  --arg footer "$FOOTER" \
  --argjson ts "$TS" \
  '{
    text: ($emoji + " E2E Playwright — " + $result),
    attachments: [{
      color: $color,
      mrkdwn_in: ["fields", "text"],
      fields: (
        [
          {title: "Result", value: $result, short: true},
          {title: "Tests", value: $junit, short: true},
          {title: "Pass rate", value: $bar, short: false},
          {title: "Duration", value: $duration, short: true},
          {title: "Project", value: $project, short: true},
          {title: "Grep", value: $grep, short: true},
          {title: "Target", value: $host, short: true},
          {title: "Branch", value: $branch, short: true},
          {title: "Triggered by", value: $actor, short: true},
          {title: "Run", value: ("<" + $url + "|Open in GitHub Actions>"), short: false}
        ]
        + if ($failed | length) > 0 then
            [{title: "Failed tests", value: ("```\n" + $failed + "\n```"), short: false}]
          else [] end
      ),
      footer: $footer,
      ts: $ts
    }]
  }')

curl -sS -f -X POST -H 'Content-type: application/json' \
  --data "$PAYLOAD" "$SLACK_WEBHOOK_URL" \
  || echo "::warning::Slack notification failed (check SLACK_WEBHOOK_URL)"
