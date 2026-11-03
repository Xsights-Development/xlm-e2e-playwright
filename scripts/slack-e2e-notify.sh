#!/usr/bin/env bash
# Post E2E workflow summary to Slack incoming webhook (CI only).
set -euo pipefail

# XLM_SLACK_NOTIFY=on|off — default on when webhook is set.
NOTIFY="$(echo "${XLM_SLACK_NOTIFY:-on}" | tr '[:upper:]' '[:lower:]' | tr -d '[:space:]')"
case "$NOTIFY" in
  off|0|false|no)
    echo "XLM_SLACK_NOTIFY=${NOTIFY} — skip Slack notification"
    exit 0
    ;;
esac

if [ -z "${SLACK_WEBHOOK_URL:-}" ]; then
  echo "SLACK_WEBHOOK_URL not set — skip Slack notification"
  exit 0
fi

STATUS="${JOB_STATUS:-unknown}"
PROJECT="${INPUT_PROJECT:-all}"
BRANCH="${GIT_BRANCH:-}"
ACTOR="${GIT_ACTOR:-}"
RUN_NUM="${RUN_NUMBER:-}"
REPO="${GIT_REPO:-}"
WORKFLOW="${WORKFLOW_NAME:-E2E Playwright}"
APP_HOST="${APP_URL_HOST:-n/a}"
REPORT_URL="${REPORT_URL:-}"
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

JUNIT_JSON='{"summary":"n/a","bar":"n/a","duration":"n/a","failed":"","cases":"","rows":[]}'
if [ -f reports/junit.xml ]; then
  JUNIT_JSON=$(python3 scripts/junit-slack-summary.py reports/junit.xml reports/results.json "${REPORT_URL:-}" 2>/dev/null || echo "$JUNIT_JSON")
fi
JUNIT_SUMMARY=$(echo "$JUNIT_JSON" | jq -r '.summary')
PASS_RATE_BAR=$(echo "$JUNIT_JSON" | jq -r '.bar')
DURATION=$(echo "$JUNIT_JSON" | jq -r '.duration')
CASE_ROWS=$(echo "$JUNIT_JSON" | jq -c '.rows // []')

REPORT_HINT="Open the report in the browser"
REPORT_LINK=""
if [ -n "$REPORT_URL" ]; then
  REPORT_LINK="<${REPORT_URL}|Open report>"
fi

FOOTER="${REPO} · ${WORKFLOW} · run #${RUN_NUM}"
TS=$(date -u +%s)

PAYLOAD=$(jq -n \
  --arg emoji "$EMOJI" \
  --arg result "$RESULT" \
  --arg project "$PROJECT" \
  --arg color "$COLOR" \
  --arg junit "$JUNIT_SUMMARY" \
  --arg bar "$PASS_RATE_BAR" \
  --arg duration "$DURATION" \
  --arg branch "$BRANCH" \
  --arg actor "$ACTOR" \
  --arg host "$APP_HOST" \
  --argjson rows "$CASE_ROWS" \
  --arg report_link "$REPORT_LINK" \
  --arg report_hint "$REPORT_HINT" \
  --arg footer "$FOOTER" \
  --argjson ts "$TS" \
  '{
    text: ("XLM E2E Playwright — " + $result),
    attachments: [{
      color: $color,
      fallback: ("XLM E2E Playwright — " + $result),
      blocks: (
        [
          {
            type: "section",
            fields: (
              [
                {type: "mrkdwn", text: ("*Result*\n" + $result)},
                {type: "mrkdwn", text: ("*Duration*\n" + $duration)},
                {type: "mrkdwn", text: ("*Tests*\n" + $junit)},
                {type: "mrkdwn", text: ("*Pass rate*\n" + $bar)},
                {type: "mrkdwn", text: ("*Target*\n" + $host)},
                {type: "mrkdwn", text: ("*Level*\n" + $project)},
                {type: "mrkdwn", text: ("*Branch*\n" + $branch)},
                {type: "mrkdwn", text: ("*Triggered by*\n" + $actor)}
              ]
              + if ($report_link | length) > 0 then
                  [{type: "mrkdwn", text: ("*Reports*\n" + $report_link + "\n_" + $report_hint + "_")}]
                else [] end
            )
          }
        ]
        + if ($rows | length) > 0 then
            [{type: "section", text: {type: "mrkdwn", text: "*Test cases*"}}]
            + (
                [$rows | to_entries | group_by(.key / 10 | floor)[] | map(.value)]
                | map({
                    type: "rich_text",
                    elements: map(
                      {
                        type: "rich_text_section",
                        elements: (
                          (if .mark != "" then [{type: "text", text: (.mark + " "), style: {code: true}}] else [] end)
                          + (
                              if .url != "" then
                                [{type: "link", url: .url, text: .code, style: {code: true}}]
                              else
                                [{type: "text", text: .code, style: {code: true}}]
                              end
                            )
                          + (if .rest != "" then [{type: "text", text: .rest, style: {code: true}}] else [] end)
                        )
                      }
                    )
                  })
              )
          else [] end
        + [{type: "context", elements: [{type: "mrkdwn", text: $footer}]}]
      )
    }]
  }')

curl -sS -f -X POST -H 'Content-type: application/json' \
  --data "$PAYLOAD" "$SLACK_WEBHOOK_URL" \
  || echo "::warning::Slack notification failed (check SLACK_WEBHOOK_URL)"
