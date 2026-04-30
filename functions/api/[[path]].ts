type Role = "admin" | "midwife" | "customer";

type D1Result<T> = {
  results?: T[];
  success: boolean;
  meta?: unknown;
};

type D1PreparedStatement = {
  bind: (...values: unknown[]) => D1PreparedStatement;
  first: <T = unknown>() => Promise<T | null>;
  all: <T = unknown>() => Promise<D1Result<T>>;
  run: () => Promise<unknown>;
};

type D1Database = {
  prepare: (query: string) => D1PreparedStatement;
};

type Env = {
  DB: D1Database;
};

type PagesFunction<E> = (context: { request: Request; env: E }) => Response | Promise<Response>;

type User = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string | null;
  specialty?: string | null;
  clinic?: string | null;
};

type SessionUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar_url?: string | null;
};

type LoginBody = {
  email?: string;
  password?: string;
};

type RegisterBody = LoginBody & {
  name?: string;
};

type CustomerBody = RegisterBody;

type ProfileBody = {
  name?: string;
  avatar_url?: string;
};

type CreateMidwifeBody = RegisterBody & {
  specialty?: string;
  clinic?: string;
};

type UpdateMidwifeBody = CreateMidwifeBody & {
  avatar_url?: string;
  distance?: string;
  rating?: number;
  reviews?: number;
};

type SendMessageBody = {
  body?: string;
  midwifeId?: number;
  threadId?: number;
};

type AppointmentBody = {
  customerId?: number;
  midwifeId?: number;
  title?: string;
  date?: string;
  time?: string;
  place?: string;
  mode?: "Klinik" | "Online";
  status?: "Akan datang" | "Selesai" | "Dibatalkan";
  notes?: string;
};

const json = (data: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...corsHeaders(),
      ...(init.headers ?? {}),
    },
  });

const corsHeaders = () => ({
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  "access-control-allow-headers": "content-type,authorization",
});

const readJson = async <T>(request: Request): Promise<T> => {
  try {
    return (await request.json()) as T;
  } catch {
    return {} as T;
  }
};

const randomToken = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const toHex = (buffer: ArrayBuffer) =>
  [...new Uint8Array(buffer)].map((byte) => byte.toString(16).padStart(2, "0")).join("");

const hashPassword = async (password: string, salt = randomToken()) => {
  const encoded = new TextEncoder().encode(`${salt}:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return `${salt}:${toHex(digest)}`;
};

const verifyPassword = async (password: string, stored: string) => {
  const [salt, expected] = stored.split(":");
  if (!salt || !expected) return false;
  const hashed = await hashPassword(password, salt);
  return hashed === stored;
};

const publicUser = (user: SessionUser): User => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar_url: user.avatar_url ?? null,
});

const getSession = async (request: Request, env: Env) => {
  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;

  return env.DB.prepare(
    `SELECT users.id, users.name, users.email, users.role, users.avatar_url
     FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.token = ? AND sessions.expires_at > datetime('now')`,
  )
    .bind(token)
    .first<SessionUser>();
};

const requireSession = async (request: Request, env: Env) => {
  const session = await getSession(request, env);
  if (!session) return { response: json({ error: "Login diperlukan" }, { status: 401 }) };
  return { session };
};

const createSession = async (env: Env, userId: number) => {
  const token = randomToken();
  await env.DB.prepare(
    "INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, datetime('now', '+30 days'))",
  )
    .bind(userId, token)
    .run();
  return token;
};

const seedIfNeeded = async (env: Env) => {
  const row = await env.DB.prepare("SELECT COUNT(*) AS total FROM users").first<{ total: number }>();
  if ((row?.total ?? 0) > 0) return;

  const adminHash = await hashPassword("admin123");
  const bidanHash = await hashPassword("bidan123");
  const customerHash = await hashPassword("ibu123");
  const midwife = {
    name: "Bidan Titik",
    email: "rina@bidankita.test",
    specialty: "Kehamilan & Persalinan",
    clinic: "Klinik Bidan Titik",
    distance: "2.3 km dari lokasi Anda",
    rating: 4.9,
    reviews: 128,
  };

  await env.DB.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .bind("Admin BidanKita", "admin@bidankita.test", adminHash, "admin")
    .run();
  await env.DB.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .bind("Ayu Pratiwi", "ayu@example.test", customerHash, "customer")
    .run();

  await env.DB.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)")
    .bind(midwife.name, midwife.email, bidanHash, "midwife")
    .run();
  const user = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(midwife.email).first<{ id: number }>();
  if (!user) return;
  await env.DB.prepare(
    "INSERT INTO midwife_profiles (user_id, specialty, clinic, distance, rating, reviews) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(user.id, midwife.specialty, midwife.clinic, midwife.distance, midwife.rating, midwife.reviews)
    .run();
};

const requireAdmin = async (request: Request, env: Env) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result;
  if (result.session.role !== "admin") {
    return { response: json({ error: "Hanya admin yang bisa mengelola bidan" }, { status: 403 }) };
  }
  return result;
};

const isStaff = (user: SessionUser) => user.role === "admin" || user.role === "midwife";

const handleRegister = async (request: Request, env: Env) => {
  const body = await readJson<RegisterBody>(request);
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";

  if (!name || !email || password.length < 6) {
    return json({ error: "Nama, email, dan password minimal 6 karakter wajib diisi" }, { status: 400 });
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: number }>();
  if (existing) return json({ error: "Email sudah terdaftar" }, { status: 409 });

  const hash = await hashPassword(password);
  await env.DB.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')")
    .bind(name, email, hash)
    .run();

  const user = await env.DB.prepare("SELECT id, name, email, role FROM users WHERE email = ?")
    .bind(email)
    .first<SessionUser>();
  if (!user) return json({ error: "Akun gagal dibuat" }, { status: 500 });

  const token = await createSession(env, user.id);
  return json({ token, user: publicUser(user) }, { status: 201 });
};

const handleLogin = async (request: Request, env: Env) => {
  const body = await readJson<LoginBody>(request);
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!email || !password) return json({ error: "Email dan password wajib diisi" }, { status: 400 });

  const user = await env.DB.prepare("SELECT id, name, email, role, avatar_url, password_hash FROM users WHERE email = ?")
    .bind(email)
    .first<SessionUser & { password_hash: string }>();
  if (!user || !(await verifyPassword(password, user.password_hash))) {
    return json({ error: "Email atau password salah" }, { status: 401 });
  }

  const token = await createSession(env, user.id);
  return json({ token, user: publicUser(user) });
};

const handleMe = async (request: Request, env: Env) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result.response;
  return json({ user: publicUser(result.session) });
};

const handleProfileUpdate = async (request: Request, env: Env) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result.response;
  const body = await readJson<ProfileBody>(request);
  const name = body.name?.trim() || result.session.name;
  const current = await env.DB.prepare("SELECT avatar_url FROM users WHERE id = ?")
    .bind(result.session.id)
    .first<{ avatar_url: string | null }>();
  const avatar = body.avatar_url === undefined ? (current?.avatar_url ?? null) : body.avatar_url.trim() || null;

  if (avatar && avatar.length > 750_000) {
    return json({ error: "Ukuran foto terlalu besar. Gunakan foto di bawah 500 KB." }, { status: 400 });
  }

  await env.DB.prepare("UPDATE users SET name = ?, avatar_url = ? WHERE id = ?")
    .bind(name, avatar, result.session.id)
    .run();

  const user = await env.DB.prepare("SELECT id, name, email, role, avatar_url FROM users WHERE id = ?")
    .bind(result.session.id)
    .first<SessionUser>();
  if (!user) return json({ error: "Profil tidak ditemukan" }, { status: 404 });

  return json({ user: publicUser(user) });
};

const handleMidwives = async (env: Env) => {
  const rows = await env.DB.prepare(
    `SELECT users.id, users.name, users.email, users.role, users.avatar_url, midwife_profiles.specialty, midwife_profiles.clinic,
            midwife_profiles.distance, midwife_profiles.rating, midwife_profiles.reviews
     FROM users
     LEFT JOIN midwife_profiles ON midwife_profiles.user_id = users.id
     WHERE users.role = 'midwife'
     ORDER BY users.id
     LIMIT 1`,
  ).all();
  return json({ midwives: rows.results ?? [] });
};

const handleCreateMidwife = async (request: Request, env: Env) => {
  const result = await requireAdmin(request, env);
  if ("response" in result) return result.response;

  const body = await readJson<CreateMidwifeBody>(request);
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!name || !email || password.length < 6) {
    return json({ error: "Nama, email, dan password minimal 6 karakter wajib diisi" }, { status: 400 });
  }

  const total = await env.DB.prepare("SELECT COUNT(*) AS total FROM users WHERE role = 'midwife'").first<{ total: number }>();
  if ((total?.total ?? 0) >= 1) {
    return json({ error: "Aplikasi disetel untuk satu bidan saja. Edit bidan yang sudah ada." }, { status: 409 });
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: number }>();
  if (existing) return json({ error: "Email bidan sudah terdaftar" }, { status: 409 });

  const hash = await hashPassword(password);
  await env.DB.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'midwife')")
    .bind(name, email, hash)
    .run();
  const user = await env.DB.prepare("SELECT id, name, email, role, avatar_url FROM users WHERE email = ?")
    .bind(email)
    .first<SessionUser>();
  if (!user) return json({ error: "Akun bidan gagal dibuat" }, { status: 500 });

  await env.DB.prepare(
    "INSERT INTO midwife_profiles (user_id, specialty, clinic, distance, rating, reviews) VALUES (?, ?, ?, ?, ?, ?)",
  )
    .bind(user.id, body.specialty ?? "KIA & Kehamilan", body.clinic ?? "Klinik BidanKita", "Baru", 5, 0)
    .run();

  return json({ midwife: publicUser(user) }, { status: 201 });
};

const customerSelect = `SELECT id, name, email, role, avatar_url, created_at FROM users WHERE role = 'customer'`;

const handleCustomers = async (request: Request, env: Env) => {
  const result = await requireAdmin(request, env);
  if ("response" in result) return result.response;

  const rows = await env.DB.prepare(`${customerSelect} ORDER BY created_at DESC, id DESC`).all();
  return json({ customers: rows.results ?? [] });
};

const handleCustomerDirectory = async (request: Request, env: Env) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result.response;
  if (!isStaff(result.session)) return json({ error: "Hanya admin atau bidan yang bisa melihat customer" }, { status: 403 });

  const rows = await env.DB.prepare(`${customerSelect} ORDER BY name ASC`).all();
  return json({ customers: rows.results ?? [] });
};

const handleCreateCustomer = async (request: Request, env: Env) => {
  const result = await requireAdmin(request, env);
  if ("response" in result) return result.response;

  const body = await readJson<CustomerBody>(request);
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password ?? "";
  if (!name || !email || password.length < 6) {
    return json({ error: "Nama, email, dan password minimal 6 karakter wajib diisi" }, { status: 400 });
  }

  const existing = await env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first<{ id: number }>();
  if (existing) return json({ error: "Email customer sudah terdaftar" }, { status: 409 });

  await env.DB.prepare("INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, 'customer')")
    .bind(name, email, await hashPassword(password))
    .run();
  const created = await env.DB.prepare(`${customerSelect} AND email = ?`).bind(email).first();
  return json({ customer: created }, { status: 201 });
};

const handleUpdateCustomer = async (request: Request, env: Env, customerId: number) => {
  const result = await requireAdmin(request, env);
  if ("response" in result) return result.response;

  const existing = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'customer'")
    .bind(customerId)
    .first<{ id: number }>();
  if (!existing) return json({ error: "Customer tidak ditemukan" }, { status: 404 });

  const body = await readJson<CustomerBody>(request);
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!name || !email) return json({ error: "Nama dan email customer wajib diisi" }, { status: 400 });

  const duplicate = await env.DB.prepare("SELECT id FROM users WHERE email = ? AND id != ?")
    .bind(email, customerId)
    .first<{ id: number }>();
  if (duplicate) return json({ error: "Email sudah dipakai akun lain" }, { status: 409 });

  await env.DB.prepare("UPDATE users SET name = ?, email = ? WHERE id = ?").bind(name, email, customerId).run();
  if (body.password) {
    if (body.password.length < 6) return json({ error: "Password minimal 6 karakter" }, { status: 400 });
    await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?")
      .bind(await hashPassword(body.password), customerId)
      .run();
  }

  const customer = await env.DB.prepare(`${customerSelect} AND id = ?`).bind(customerId).first();
  return json({ customer });
};

const handleDeleteCustomer = async (request: Request, env: Env, customerId: number) => {
  const result = await requireAdmin(request, env);
  if ("response" in result) return result.response;

  const existing = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'customer'")
    .bind(customerId)
    .first<{ id: number }>();
  if (!existing) return json({ error: "Customer tidak ditemukan" }, { status: 404 });

  await env.DB.prepare("DELETE FROM chat_messages WHERE thread_id IN (SELECT id FROM chat_threads WHERE customer_id = ?)")
    .bind(customerId)
    .run();
  await env.DB.prepare("DELETE FROM chat_threads WHERE customer_id = ?").bind(customerId).run();
  await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(customerId).run();
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(customerId).run();

  return json({ ok: true });
};

const handleUpdateMidwife = async (request: Request, env: Env, midwifeId: number) => {
  const result = await requireAdmin(request, env);
  if ("response" in result) return result.response;

  const existing = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'midwife'")
    .bind(midwifeId)
    .first<{ id: number }>();
  if (!existing) return json({ error: "Bidan tidak ditemukan" }, { status: 404 });

  const body = await readJson<UpdateMidwifeBody>(request);
  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  if (!name || !email) return json({ error: "Nama dan email bidan wajib diisi" }, { status: 400 });

  const duplicate = await env.DB.prepare("SELECT id FROM users WHERE email = ? AND id != ?")
    .bind(email, midwifeId)
    .first<{ id: number }>();
  if (duplicate) return json({ error: "Email sudah dipakai akun lain" }, { status: 409 });

  const current = await env.DB.prepare("SELECT avatar_url FROM users WHERE id = ?")
    .bind(midwifeId)
    .first<{ avatar_url: string | null }>();
  const avatar = body.avatar_url === undefined ? (current?.avatar_url ?? null) : body.avatar_url.trim() || null;

  await env.DB.prepare("UPDATE users SET name = ?, email = ?, avatar_url = ? WHERE id = ?")
    .bind(name, email, avatar, midwifeId)
    .run();
  if (body.password) {
    if (body.password.length < 6) return json({ error: "Password minimal 6 karakter" }, { status: 400 });
    await env.DB.prepare("UPDATE users SET password_hash = ? WHERE id = ?")
      .bind(await hashPassword(body.password), midwifeId)
      .run();
  }

  await env.DB.prepare(
    `INSERT INTO midwife_profiles (user_id, specialty, clinic, distance, rating, reviews)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET
       specialty = excluded.specialty,
       clinic = excluded.clinic,
       distance = excluded.distance,
       rating = excluded.rating,
       reviews = excluded.reviews`,
  )
    .bind(
      midwifeId,
      body.specialty ?? "KIA & Kehamilan",
      body.clinic ?? "Klinik BidanKita",
      body.distance ?? "Tersedia konsultasi online",
      body.rating ?? 5,
      body.reviews ?? 0,
    )
    .run();

  const rows = await env.DB.prepare(
    `SELECT users.id, users.name, users.email, users.role, users.avatar_url, midwife_profiles.specialty, midwife_profiles.clinic,
            midwife_profiles.distance, midwife_profiles.rating, midwife_profiles.reviews
     FROM users
     LEFT JOIN midwife_profiles ON midwife_profiles.user_id = users.id
     WHERE users.id = ?`,
  )
    .bind(midwifeId)
    .all();
  return json({ midwife: rows.results?.[0] ?? null });
};

const handleDeleteMidwife = async (request: Request, env: Env, midwifeId: number) => {
  const result = await requireAdmin(request, env);
  if ("response" in result) return result.response;

  const existing = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'midwife'")
    .bind(midwifeId)
    .first<{ id: number }>();
  if (!existing) return json({ error: "Bidan tidak ditemukan" }, { status: 404 });

  await env.DB.prepare("DELETE FROM chat_messages WHERE thread_id IN (SELECT id FROM chat_threads WHERE midwife_id = ?)")
    .bind(midwifeId)
    .run();
  await env.DB.prepare("DELETE FROM chat_threads WHERE midwife_id = ?").bind(midwifeId).run();
  await env.DB.prepare("DELETE FROM midwife_profiles WHERE user_id = ?").bind(midwifeId).run();
  await env.DB.prepare("DELETE FROM sessions WHERE user_id = ?").bind(midwifeId).run();
  await env.DB.prepare("DELETE FROM users WHERE id = ?").bind(midwifeId).run();

  return json({ ok: true });
};

const ensureThread = async (env: Env, customerId: number, midwifeId: number) => {
  const existing = await env.DB.prepare(
    "SELECT id FROM chat_threads WHERE customer_id = ? AND midwife_id = ? ORDER BY updated_at DESC LIMIT 1",
  )
    .bind(customerId, midwifeId)
    .first<{ id: number }>();
  if (existing) return existing.id;

  await env.DB.prepare("INSERT INTO chat_threads (customer_id, midwife_id, subject) VALUES (?, ?, ?)")
    .bind(customerId, midwifeId, "Konsultasi Bidan")
    .run();
  const created = await env.DB.prepare(
    "SELECT id FROM chat_threads WHERE customer_id = ? AND midwife_id = ? ORDER BY id DESC LIMIT 1",
  )
    .bind(customerId, midwifeId)
    .first<{ id: number }>();
  return created?.id ?? 0;
};

const handleThreads = async (request: Request, env: Env) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result.response;
  const user = result.session;

  if (user.role === "admin") {
    const rows = await env.DB.prepare(
      `SELECT chat_threads.*, customers.name AS customer_name, midwives.name AS midwife_name
              , customers.avatar_url AS customer_avatar_url, midwives.avatar_url AS midwife_avatar_url
         FROM chat_threads
         JOIN users customers ON customers.id = chat_threads.customer_id
         JOIN users midwives ON midwives.id = chat_threads.midwife_id
         ORDER BY updated_at DESC`,
    ).all();
    return json({ threads: rows.results ?? [] });
  }

  const query =
    user.role === "midwife"
      ? `SELECT chat_threads.*, customers.name AS customer_name, midwives.name AS midwife_name
              , customers.avatar_url AS customer_avatar_url, midwives.avatar_url AS midwife_avatar_url
         FROM chat_threads
         JOIN users customers ON customers.id = chat_threads.customer_id
         JOIN users midwives ON midwives.id = chat_threads.midwife_id
         WHERE midwife_id = ?
         ORDER BY updated_at DESC`
      : `SELECT chat_threads.*, customers.name AS customer_name, midwives.name AS midwife_name
              , customers.avatar_url AS customer_avatar_url, midwives.avatar_url AS midwife_avatar_url
         FROM chat_threads
         JOIN users customers ON customers.id = chat_threads.customer_id
         JOIN users midwives ON midwives.id = chat_threads.midwife_id
         WHERE customer_id = ?
         ORDER BY updated_at DESC`;
  const rows = await env.DB.prepare(query).bind(user.id).all();
  return json({ threads: rows.results ?? [] });
};

const handleMessages = async (request: Request, env: Env, url: URL) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result.response;
  const user = result.session;

  const midwifeId = Number(url.searchParams.get("midwifeId") ?? 0);
  const threadParam = Number(url.searchParams.get("threadId") ?? 0);
  const threadId = threadParam || (midwifeId ? await ensureThread(env, user.id, midwifeId) : 0);
  if (!threadId) return json({ error: "Thread chat tidak ditemukan" }, { status: 400 });

  const thread = await env.DB.prepare(
    `SELECT chat_threads.*, customers.name AS customer_name, midwives.name AS midwife_name,
            customers.avatar_url AS customer_avatar_url, midwives.avatar_url AS midwife_avatar_url
     FROM chat_threads
     JOIN users customers ON customers.id = chat_threads.customer_id
     JOIN users midwives ON midwives.id = chat_threads.midwife_id
     WHERE chat_threads.id = ?`,
  ).bind(threadId).first<{
    id: number;
    customer_id: number;
    midwife_id: number;
  }>();
  if (!thread) return json({ error: "Thread chat tidak ditemukan" }, { status: 404 });
  if (user.role !== "admin" && user.id !== thread.customer_id && user.id !== thread.midwife_id) {
    return json({ error: "Tidak punya akses ke thread ini" }, { status: 403 });
  }

  const messages = await env.DB.prepare(
    `SELECT chat_messages.id, chat_messages.thread_id, chat_messages.sender_id, chat_messages.body,
            chat_messages.created_at, users.name AS sender_name, users.role AS sender_role,
            users.avatar_url AS sender_avatar_url
     FROM chat_messages
     JOIN users ON users.id = chat_messages.sender_id
     WHERE thread_id = ?
     ORDER BY chat_messages.id ASC`,
  )
    .bind(threadId)
    .all();
  return json({ thread, messages: messages.results ?? [] });
};

const handleSendMessage = async (request: Request, env: Env) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result.response;
  const user = result.session;
  const body = await readJson<SendMessageBody>(request);
  const message = body.body?.trim();
  if (!message) return json({ error: "Pesan tidak boleh kosong" }, { status: 400 });

  const threadId = body.threadId || (body.midwifeId ? await ensureThread(env, user.id, body.midwifeId) : 0);
  if (!threadId) return json({ error: "Thread chat tidak ditemukan" }, { status: 400 });

  const thread = await env.DB.prepare("SELECT * FROM chat_threads WHERE id = ?").bind(threadId).first<{
    id: number;
    customer_id: number;
    midwife_id: number;
  }>();
  if (!thread) return json({ error: "Thread chat tidak ditemukan" }, { status: 404 });
  if (user.role !== "admin" && user.id !== thread.customer_id && user.id !== thread.midwife_id) {
    return json({ error: "Tidak punya akses ke thread ini" }, { status: 403 });
  }

  await env.DB.prepare("INSERT INTO chat_messages (thread_id, sender_id, body) VALUES (?, ?, ?)")
    .bind(threadId, user.id, message)
    .run();
  await env.DB.prepare("UPDATE chat_threads SET updated_at = datetime('now') WHERE id = ?").bind(threadId).run();

  return handleMessages(
    new Request(`${new URL(request.url).origin}/api/chat/messages?threadId=${threadId}`, {
      headers: request.headers,
    }),
    env,
    new URL(`${new URL(request.url).origin}/api/chat/messages?threadId=${threadId}`),
  );
};

const appointmentSelect = `
  SELECT appointments.*,
         customers.name AS customer_name,
         customers.avatar_url AS customer_avatar_url,
         midwives.name AS midwife_name,
         midwives.avatar_url AS midwife_avatar_url
  FROM appointments
  JOIN users customers ON customers.id = appointments.customer_id
  JOIN users midwives ON midwives.id = appointments.midwife_id
`;

const appointmentAccessWhere = (user: SessionUser) => {
  if (user.role === "admin") return "";
  if (user.role === "midwife") return "WHERE appointments.midwife_id = ?";
  return "WHERE appointments.customer_id = ?";
};

const handleAppointments = async (request: Request, env: Env) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result.response;
  const user = result.session;
  const where = appointmentAccessWhere(user);
  const statement = env.DB.prepare(`${appointmentSelect} ${where} ORDER BY appointments.date ASC, appointments.time ASC, appointments.id DESC`);
  const rows = user.role === "admin" ? await statement.all() : await statement.bind(user.id).all();
  return json({ appointments: rows.results ?? [] });
};

const firstMidwifeId = async (env: Env) => {
  const row = await env.DB.prepare("SELECT id FROM users WHERE role = 'midwife' ORDER BY id LIMIT 1").first<{ id: number }>();
  return row?.id ?? 0;
};

const resolveAppointmentActors = async (env: Env, user: SessionUser, body: AppointmentBody) => {
  const customerId = user.role === "customer" ? user.id : Number(body.customerId ?? 0);
  const midwifeId = user.role === "midwife" ? user.id : Number(body.midwifeId ?? 0) || (await firstMidwifeId(env));
  return { customerId, midwifeId };
};

const validateAppointmentBody = (body: AppointmentBody) => {
  const title = body.title?.trim();
  const date = body.date?.trim();
  const time = body.time?.trim();
  const place = body.place?.trim();
  const mode = body.mode === "Online" ? "Online" : "Klinik";
  const status = body.status ?? "Akan datang";
  const notes = body.notes?.trim() ?? "";

  if (!title || !date || !time || !place) return { error: "Layanan, tanggal, jam, dan tempat wajib diisi" };
  if (!["Akan datang", "Selesai", "Dibatalkan"].includes(status)) return { error: "Status janji tidak valid" };
  return { title, date, time, place, mode, status, notes };
};

const canAccessAppointment = (user: SessionUser, appointment: { customer_id: number; midwife_id: number }) =>
  user.role === "admin" || user.id === appointment.customer_id || user.id === appointment.midwife_id;

const handleCreateAppointment = async (request: Request, env: Env) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result.response;
  const user = result.session;
  const body = await readJson<AppointmentBody>(request);
  const validated = validateAppointmentBody(body);
  if ("error" in validated) return json({ error: validated.error }, { status: 400 });

  const { customerId, midwifeId } = await resolveAppointmentActors(env, user, body);
  if (!customerId || !midwifeId) return json({ error: "Customer dan bidan wajib dipilih" }, { status: 400 });
  if (user.role === "customer" && body.customerId && Number(body.customerId) !== user.id) {
    return json({ error: "Customer hanya bisa membuat janji untuk akunnya sendiri" }, { status: 403 });
  }

  const customer = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'customer'").bind(customerId).first<{ id: number }>();
  const midwife = await env.DB.prepare("SELECT id FROM users WHERE id = ? AND role = 'midwife'").bind(midwifeId).first<{ id: number }>();
  if (!customer || !midwife) return json({ error: "Customer atau bidan tidak ditemukan" }, { status: 404 });

  await env.DB.prepare(
    `INSERT INTO appointments (customer_id, midwife_id, title, date, time, place, mode, status, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(customerId, midwifeId, validated.title, validated.date, validated.time, validated.place, validated.mode, validated.status, validated.notes)
    .run();

  const created = await env.DB.prepare(`${appointmentSelect} WHERE appointments.customer_id = ? AND appointments.midwife_id = ? ORDER BY appointments.id DESC LIMIT 1`)
    .bind(customerId, midwifeId)
    .first();
  return json({ appointment: created }, { status: 201 });
};

const handleUpdateAppointment = async (request: Request, env: Env, appointmentId: number) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result.response;
  const user = result.session;
  const existing = await env.DB.prepare("SELECT * FROM appointments WHERE id = ?").bind(appointmentId).first<{
    id: number;
    customer_id: number;
    midwife_id: number;
  }>();
  if (!existing) return json({ error: "Janji kunjungan tidak ditemukan" }, { status: 404 });
  if (!canAccessAppointment(user, existing)) return json({ error: "Tidak punya akses ke janji ini" }, { status: 403 });

  const body = await readJson<AppointmentBody>(request);
  const validated = validateAppointmentBody(body);
  if ("error" in validated) return json({ error: validated.error }, { status: 400 });
  const { customerId, midwifeId } = await resolveAppointmentActors(env, user, body);
  const nextCustomerId = isStaff(user) ? customerId || existing.customer_id : existing.customer_id;
  const nextMidwifeId = user.role === "admin" ? midwifeId || existing.midwife_id : existing.midwife_id;

  await env.DB.prepare(
    `UPDATE appointments
     SET customer_id = ?, midwife_id = ?, title = ?, date = ?, time = ?, place = ?, mode = ?, status = ?, notes = ?, updated_at = datetime('now')
     WHERE id = ?`,
  )
    .bind(
      nextCustomerId,
      nextMidwifeId,
      validated.title,
      validated.date,
      validated.time,
      validated.place,
      validated.mode,
      validated.status,
      validated.notes,
      appointmentId,
    )
    .run();

  const updated = await env.DB.prepare(`${appointmentSelect} WHERE appointments.id = ?`).bind(appointmentId).first();
  return json({ appointment: updated });
};

const handleDeleteAppointment = async (request: Request, env: Env, appointmentId: number) => {
  const result = await requireSession(request, env);
  if ("response" in result) return result.response;
  const user = result.session;
  const existing = await env.DB.prepare("SELECT * FROM appointments WHERE id = ?").bind(appointmentId).first<{
    id: number;
    customer_id: number;
    midwife_id: number;
  }>();
  if (!existing) return json({ error: "Janji kunjungan tidak ditemukan" }, { status: 404 });
  if (!canAccessAppointment(user, existing)) return json({ error: "Tidak punya akses ke janji ini" }, { status: 403 });

  await env.DB.prepare("DELETE FROM appointments WHERE id = ?").bind(appointmentId).run();
  return json({ ok: true });
};

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method === "OPTIONS") return new Response(null, { headers: corsHeaders() });

  await seedIfNeeded(env);

  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/?/, "");
  const method = request.method;

  try {
    if (method === "POST" && path === "auth/register") return handleRegister(request, env);
    if (method === "POST" && path === "auth/login") return handleLogin(request, env);
    if (method === "GET" && path === "auth/me") return handleMe(request, env);
    if ((method === "PUT" || method === "PATCH") && path === "auth/profile") return handleProfileUpdate(request, env);
    if (method === "GET" && path === "midwives") return handleMidwives(env);
    if (method === "GET" && path === "customers") return handleCustomerDirectory(request, env);
    if (method === "POST" && path === "admin/midwives") return handleCreateMidwife(request, env);
    const midwifeMatch = path.match(/^admin\/midwives\/(\d+)$/);
    if ((method === "PUT" || method === "PATCH") && midwifeMatch) {
      return handleUpdateMidwife(request, env, Number(midwifeMatch[1]));
    }
    if (method === "DELETE" && midwifeMatch) return handleDeleteMidwife(request, env, Number(midwifeMatch[1]));
    if (method === "GET" && path === "admin/customers") return handleCustomers(request, env);
    if (method === "POST" && path === "admin/customers") return handleCreateCustomer(request, env);
    const customerMatch = path.match(/^admin\/customers\/(\d+)$/);
    if ((method === "PUT" || method === "PATCH") && customerMatch) {
      return handleUpdateCustomer(request, env, Number(customerMatch[1]));
    }
    if (method === "DELETE" && customerMatch) return handleDeleteCustomer(request, env, Number(customerMatch[1]));
    if (method === "GET" && path === "chat/threads") return handleThreads(request, env);
    if (method === "GET" && path === "chat/messages") return handleMessages(request, env, url);
    if (method === "POST" && path === "chat/messages") return handleSendMessage(request, env);
    if (method === "GET" && path === "appointments") return handleAppointments(request, env);
    if (method === "POST" && path === "appointments") return handleCreateAppointment(request, env);
    const appointmentMatch = path.match(/^appointments\/(\d+)$/);
    if ((method === "PUT" || method === "PATCH") && appointmentMatch) {
      return handleUpdateAppointment(request, env, Number(appointmentMatch[1]));
    }
    if (method === "DELETE" && appointmentMatch) return handleDeleteAppointment(request, env, Number(appointmentMatch[1]));

    return json({ error: "Endpoint tidak ditemukan" }, { status: 404 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Terjadi kesalahan server";
    return json({ error: message }, { status: 500 });
  }
};
