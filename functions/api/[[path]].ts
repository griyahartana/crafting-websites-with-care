type Env = Record<string, never>;

type PagesFunction<E> = (context: { request: Request; env: E; params: Record<string, string | string[]> }) => Response | Promise<Response>;

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...init.headers,
    },
  });

export const onRequest: PagesFunction<Env> = async ({ request, params }) => {
  const pathParam = params.path;
  const path = Array.isArray(pathParam) ? pathParam.join("/") : pathParam || "";

  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "access-control-allow-origin": "*",
        "access-control-allow-methods": "GET, OPTIONS",
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

  return json(
    {
      error: "Endpoint belum tersedia",
      message: "Backend SaaS LayerFarm OS belum diaktifkan untuk endpoint ini.",
    },
    { status: 404 },
  );
};
