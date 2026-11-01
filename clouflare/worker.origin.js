const GITHUB_DISPATCH_URL =
    "https://api.github.com/repos/Xsights-Development/xlm-e2e-playwright/actions/workflows/e2e-playwright.yml/dispatches";

const ACTIONS_URL =
    "https://github.com/Xsights-Development/xlm-e2e-playwright/actions/workflows/e2e-playwright.yml";

const VALID_PROJECTS = new Set(["farm", "overview", "all"]);

function githubHeaders(env) {
    return {
        Authorization: `Bearer ${env.GH_PAT}`,
        Accept: "application/vnd.github+json",
        "X-GitHub-Api-Version": "2022-11-28",
        "User-Agent": "XLM-E2E-Trigger-Worker",
    };
}

function projectFromPath(pathname) {
    const path = pathname.replace(/\/$/, "") || "/";
    if (path === "/farm" || path === "/") return "farm";
    if (path === "/overview") return "overview";
    if (path === "/all") return "all";
    return null;
}

function dispatchWorkflow(env, project) {
    return fetch(GITHUB_DISPATCH_URL, {
        method: "POST",
        headers: {
            ...githubHeaders(env),
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            ref: "main",
            inputs: { project, grep: "" },
        }),
    });
}

function isAuthorized(request, env) {
    const secret = env.HOOK_SECRET;
    if (!secret) return false;

    const url = new URL(request.url);
    const key = url.searchParams.get("key");
    if (key && key === secret) return true;

    const auth = request.headers.get("Authorization");
    if (!auth || !auth.startsWith("Basic ")) return false;

    try {
        const decoded = atob(auth.slice(6));
        const colon = decoded.indexOf(":");
        const user = colon >= 0 ? decoded.slice(0, colon) : decoded;
        const pass = colon >= 0 ? decoded.slice(colon + 1) : "";
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

function slackMessage(project) {
    let title;
    if (project === "all") {
        title = "✅ *E2E* all projects started.";
    } else if (project === "farm") {
        title = "✅ *E2E Farm* started.";
    } else if (project === "overview") {
        title = "✅ *E2E Overview* started.";
    } else {
        title = `✅ *E2E ${project}* started.`;
    }

    const note = "_Test results will show up here once the workflow finishes._";

    return `${title}\n${note}\n<${ACTIONS_URL}|_View this run_>`;
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
    return new Response("Unauthorized\n", { status: 401 });
}

function respondNotFound(request) {
    if (isSlackRequest(request)) {
        return slackResponse(
            "❌ Invalid path. Use `/test-farm`, `/test-overview`, or `/test`.",
            404,
        );
    }
    return jsonResponse(
        JSON.stringify({
            ok: false,
            error: "Unknown path. Use POST /farm, /overview, or /all",
        }),
        404,
    );
}

function respondOk(request, project) {
    if (isSlackRequest(request)) {
        return slackResponse(slackMessage(project));
    }
    return jsonResponse(
        JSON.stringify({
            ok: true,
            message: `E2E ${project} triggered`,
            project,
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

export default {
    async fetch(request, env, ctx) {
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

        const project = projectFromPath(new URL(request.url).pathname);
        if (!project || !VALID_PROJECTS.has(project)) {
            return respondNotFound(request);
        }

        const ghPromise = dispatchWorkflow(env, project);

        if (request.headers.get("X-Wait-For-Github") === "1") {
            const res = await ghPromise;
            if (res.status !== 204) {
                return respondGithubError(request, res.status, await res.text());
            }
            return new Response(`E2E started (project=${project})\n${ACTIONS_URL}\n`, {
                status: 200,
                headers: { "Content-Type": "text/plain" },
            });
        }

        ctx.waitUntil(
            ghPromise.then(async (res) => {
                if (res.status !== 204) {
                    console.error("GitHub dispatch failed", res.status, await res.text());
                }
            }),
        );

        return respondOk(request, project);
    },
};
