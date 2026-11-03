const GITHUB_DISPATCH_URL =
    "https://api.github.com/repos/Xsights-Development/xlm-e2e-playwright/actions/workflows/e2e-playwright.yml/dispatches";

const ACTIONS_URL =
    "https://github.com/Xsights-Development/xlm-e2e-playwright/actions/workflows/e2e-playwright.yml";

/**
 * TEMP: use feature branch until i18n workflow is merged to main.
 * Revert to "main" after merge.
 */
const WORKFLOW_REF = "main";

/**
 * Fixed Slack slash → Worker paths:
 *   /xlm-test          → /all      → farm + overview panels
 *   /xlm-test-farm     → /farm     → farm only
 *   /xlm-test-overview → /overview → shared suites (languages / i18n)
 *
 * Path /overview no longer runs Playwright project "overview".
 * Overview panel specs still run via /all.
 */
const VALID_PATHS = new Set(["farm", "overview", "all"]);

function githubHeaders(env) {
    return {
        Authorization: `Bearer ${env.GH_PAT}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "XLM-E2E-Trigger-Worker",
    };
}

function pathKeyFromUrl(pathname) {
    const path = pathname.replace(/\/$/, "") || "/";
    if (path === "/farm" || path === "/") return "farm";
    if (path === "/overview") return "overview";
    if (path === "/all") return "all";
    return null;
}

/**
 * Map Worker path → workflow_dispatch inputs.
 * /overview = shared entry (languages); farm/all unchanged.
 */
function resolveDispatch(pathKey) {
    if (pathKey === "farm") {
        return {
            pathKey,
            project: "farm",
            languages: "off",
            label: "farm",
        };
    }
    if (pathKey === "all") {
        return {
            pathKey,
            project: "all",
            languages: "off",
            label: "all",
        };
    }
    if (pathKey === "overview") {
        return {
            pathKey,
            project: "i18n",
            languages: "on",
            label: "languages",
        };
    }
    return null;
}

function dispatchWorkflow(env, { project, languages }) {
    const slackNotify = String(env.XLM_SLACK_NOTIFY || "on")
        .trim()
        .toLowerCase();
    const inputs = {
        project,
        grep: "",
        languages,
        target: String(env.E2E_TARGET || "dev").trim().toLowerCase() === "staging" ? "staging" : "dev",
        // Workflow input name; maps to XLM_SLACK_NOTIFY in the Notify Slack step.
        xlm_slack_notify: slackNotify === "off" ? "off" : "on",
    };
    return fetch(GITHUB_DISPATCH_URL, {
        method: "POST",
        headers: {
            ...githubHeaders(env),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ref: WORKFLOW_REF,
            inputs,
        }),
    });
}

function isAuthorized(request, env) {
    const secret = String(env.HOOK_SECRET || "").trim();
    if (!secret) return false;

    const url = new URL(request.url);
    const key = String(url.searchParams.get("key") || "").trim();
    if (key && key === secret) return true;

    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Basic ")) return false;

    try {
        const decoded = atob(auth.slice(6));
        const colon = decoded.indexOf(":");
        const user = (colon >= 0 ? decoded.slice(0, colon) : decoded).trim();
        const pass = (colon >= 0 ? decoded.slice(colon + 1) : "").trim();
        return user === secret || pass === secret;
    } catch {
        return false;
    }
}

function isSlackRequest(request) {
    return (
        request.headers.has("X-Slack-Signature") ||
        request.headers.get("Content-Type")?.includes("application/x-www-form-urlencoded")
    );
}

function slackMessage(dispatch) {
    let title;
    if (dispatch.pathKey === "all") {
        title = "✅ *E2E* started — farm + overview.";
    } else if (dispatch.pathKey === "farm") {
        title = "✅ *E2E Farm* started.";
    } else if (dispatch.pathKey === "overview") {
        title =
            "✅ *E2E Languages* started _(shared suite via `/xlm-test-overview`)_.";
    } else {
        title = `✅ *E2E ${dispatch.label}* started.`;
    }

    const note = "_Test results will show up here once the workflow finishes._";
    return `${title}\n${note}\n<${ACTIONS_URL}|_View this run_>`;
}

function tokensMatch(provided, expected) {
    const encoder = new TextEncoder();
    const left = encoder.encode(String(provided));
    const right = encoder.encode(String(expected));
    if (left.byteLength !== right.byteLength) {
        const dummy = new Uint8Array(left.byteLength);
        crypto.subtle.timingSafeEqual(left, dummy);
        return false;
    }
    return crypto.subtle.timingSafeEqual(left, right);
}

function decodeSegment(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return null;
    }
}

function parseReportRequest(pathname) {
    const parts = pathname.split("/").filter(Boolean);
    if (parts.length < 4 || parts[0] !== "r") return null;

    const token = decodeSegment(parts[1]);
    const runId = decodeSegment(parts[2]);
    if (!token || !runId || !/^\d+$/.test(runId)) return null;

    const rest = [];
    for (const part of parts.slice(3)) {
        const decoded = decodeSegment(part);
        if (!decoded || decoded === "." || decoded === "..") return null;
        rest.push(decoded);
    }
    return { token, key: `runs/${runId}/${rest.join("/")}` };
}

function contentTypeForKey(key) {
    const ext = key.includes(".") ? key.slice(key.lastIndexOf(".") + 1).toLowerCase() : "";
    switch (ext) {
        case "html":
        case "htm":
            return "text/html; charset=utf-8";
        case "js":
        case "mjs":
            return "text/javascript; charset=utf-8";
        case "css":
            return "text/css; charset=utf-8";
        case "json":
            return "application/json";
        case "png":
            return "image/png";
        case "jpg":
        case "jpeg":
            return "image/jpeg";
        case "gif":
            return "image/gif";
        case "svg":
            return "image/svg+xml";
        case "webp":
            return "image/webp";
        case "woff":
            return "font/woff";
        case "woff2":
            return "font/woff2";
        case "txt":
        case "md":
            return "text/plain; charset=utf-8";
        default:
            return "application/octet-stream";
    }
}

async function serveReport(request, env) {
    if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method not allowed\n", { status: 405 });
    }

    const parsed = parseReportRequest(new URL(request.url).pathname);
    const expected = String(env.REPORT_TOKEN || "");
    if (!parsed || !expected || !env.REPORTS || !tokensMatch(parsed.token, expected)) {
        return new Response("Not found\n", { status: 404 });
    }

    const object = await env.REPORTS.get(parsed.key);
    if (!object) return new Response("Not found\n", { status: 404 });

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("Cache-Control", "private, max-age=300");
    if (!headers.has("content-type")) {
        headers.set("content-type", contentTypeForKey(parsed.key));
    }
    return new Response(request.method === "HEAD" ? null : object.body, {
        status: 200,
        headers,
    });
}

function jsonResponse(body, status = 200) {
    return new Response(body, {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

function slackResponse(text, status = 200) {
    return jsonResponse(
        JSON.stringify({
            response_type: "in_channel",
            text,
        }),
        status,
    );
}

function respondUnauthorized(request) {
    if (isSlackRequest(request)) {
        return slackResponse(
            "❌ Unauthorized. Contact the E2E team if the slash command URL needs updating.",
            401,
        );
    }
    return new Response(
        "Unauthorized — check HOOK_SECRET.\n" +
            "Try: curl -u 'HOOK_SECRET:' -X POST 'https://…/overview'\n",
        { status: 401 },
    );
}

function respondNotFound(request) {
    if (isSlackRequest(request)) {
        return slackResponse(
            "❌ Invalid path. Use `/xlm-test` (all), `/xlm-test-farm`, or `/xlm-test-overview` (languages).",
            404,
        );
    }
    return jsonResponse(
        JSON.stringify({
            ok: false,
            error:
                "Unknown path. Use POST /farm, /all, or /overview (shared: languages).",
        }),
        404,
    );
}

function respondOk(request, dispatch) {
    if (isSlackRequest(request)) {
        return slackResponse(slackMessage(dispatch));
    }
    return jsonResponse(
        JSON.stringify({
            ok: true,
            message: `E2E ${dispatch.label} triggered`,
            path: dispatch.pathKey,
            project: dispatch.project,
            languages: dispatch.languages,
            ref: WORKFLOW_REF,
            workflow_url: ACTIONS_URL,
        }),
    );
}

function respondGithubError(request, status, bodyText) {
    if (isSlackRequest(request)) {
        return slackResponse(
            `❌ Failed to start E2E (GitHub ${status}).\n\`\`\`${bodyText.slice(0, 500)}\`\`\``,
            502,
        );
    }
    return new Response(`${bodyText}\n`, { status: 502 });
}

function respondHealth(env) {
    const hasHookSecret = Boolean(env.HOOK_SECRET);
    const hasGhPat = Boolean(env.GH_PAT);
    const ok = hasHookSecret && hasGhPat;
    return jsonResponse(
        JSON.stringify({
            ok,
            service: "xlm-e2e-trigger",
            ref: WORKFLOW_REF,
            paths: {
                "/farm": "farm",
                "/all": "farm + overview panels",
                "/overview": "languages (shared)",
                "/health": "liveness",
            },
            env: {
                HOOK_SECRET: hasHookSecret,
                GH_PAT: hasGhPat,
                REPORT_TOKEN: Boolean(env.REPORT_TOKEN),
                REPORTS: Boolean(env.REPORTS),
            },
        }),
        ok ? 200 : 503,
    );
}

export default {
    async fetch(request, env, ctx) {
        const url = new URL(request.url);
        const path = url.pathname.replace(/\/$/, "") || "/";

        if (path === "/health" || path === "/healthy") {
            if (request.method !== "GET" && request.method !== "HEAD") {
                return new Response("Method not allowed\n", { status: 405 });
            }
            return respondHealth(env);
        }

        if (path.startsWith("/r/")) {
            return serveReport(request, env);
        }

        if (request.method !== "POST") {
            return new Response("Method not allowed\n", { status: 405 });
        }

        if (!env.GH_PAT) {
            return new Response("GH_PAT not configured\n", { status: 500 });
        }
        if (!env.HOOK_SECRET) {
            return new Response("HOOK_SECRET not configured\n", { status: 500 });
        }

        if (!isAuthorized(request, env)) {
            return respondUnauthorized(request);
        }

        const pathKey = pathKeyFromUrl(url.pathname);
        if (!pathKey || !VALID_PATHS.has(pathKey)) {
            return respondNotFound(request);
        }

        const dispatch = resolveDispatch(pathKey);
        if (!dispatch) {
            return respondNotFound(request);
        }

        // Always await GitHub — ok:true previously hid 422/401 (dispatch was fire-and-forget).
        const res = await dispatchWorkflow(env, dispatch);
        if (res.status !== 204) {
            const bodyText = await res.text();
            console.error("GitHub dispatch failed", res.status, bodyText);
            return respondGithubError(request, res.status, bodyText);
        }

        if (request.headers.get("X-Wait-For-Github") === "1") {
            return new Response(
                `E2E started (path=${dispatch.pathKey}, project=${dispatch.project}, languages=${dispatch.languages}, ref=${WORKFLOW_REF})\n${ACTIONS_URL}\n`,
                {
                    status: 200,
                    headers: { "Content-Type": "text/plain" },
                },
            );
        }

        return respondOk(request, dispatch);
    },
};
