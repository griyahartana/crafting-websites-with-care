type Env = {
  LAYERFARM_STATE: {
    get: (key: string, type?: "json") => Promise<unknown>;
    put: (key: string, value: string) => Promise<void>;
  };
};

type PagesFunction<E> = (context: { request: Request; env: E; params: Record<string, string | string[]> }) => Response | Promise<Response>;

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
      ...init.headers,
    },
  });

const ADMIN_EMAIL = "admin@hartanafarm.my.id";
const ADMIN_PASSWORD = "hartanafarm123";
const stateKey = `farm-state:${ADMIN_EMAIL}`;

const unauthorized = () => json({ error: "Login admin diperlukan" }, { status: 401 });

const isAdminRequest = (request: Request) => {
  const authorization = request.headers.get("authorization") || "";
  const encoded = authorization.startsWith("Basic ") ? authorization.slice(6) : "";
  if (!encoded) return false;

  try {
    const decoded = atob(encoded);
    return decoded === `${ADMIN_EMAIL}:${ADMIN_PASSWORD}`;
  } catch {
    return false;
  }
};

export const onRequest: PagesFunction<Env> = async ({ request, env, params }) => {
  const pathParam = params.path;
  const paramsPath = Array.isArray(pathParam) ? pathParam.join("/") : pathParam || "";
  const urlPath = new URL(request.url).pathname.replace(/^\/api\/?/, "");
  const path = urlPath || paramsPath;

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, PUT, OPTIONS",
        "access-control-allow-headers": "content-type, authorization",
      },
    });
  }

  if (request.method === "GET" && (path === "" || path === "health")) {
    return json({
      app: "LayerFarm OS",
      status: "ok",
      project: "hartanafarm",
      domain: "hartanafarm.my.id",
      timestamp: new Date().toISOString(),
    });
  }

  if (path === "admin-state") {
    if (!isAdminRequest(request)) return unauthorized();

    if (request.method === "GET") {
      const record = await env.LAYERFARM_STATE.get(stateKey, "json");
      return json(
        record || {
          state: null,
          updatedAt: null,
          updatedBy: ADMIN_EMAIL,
        },
      );
    }

    if (request.method === "PUT") {
      const body = (await request.json().catch(() => null)) as { state?: unknown } | null;
      if (!body || typeof body !== "object" || !("state" in body)) {
        return json({ error: "Payload state tidak valid" }, { status: 400 });
      }

      const record = {
        state: body.state,
        updatedAt: new Date().toISOString(),
        updatedBy: ADMIN_EMAIL,
      };
      await env.LAYERFARM_STATE.put(stateKey, JSON.stringify(record));
      return json(record);
    }
  }

  return json(
    {
      error: "Endpoint belum tersedia",
      message: "Backend SaaS LayerFarm OS belum diaktifkan untuk endpoint ini.",
    },
    { status: 404 },
  );
};
