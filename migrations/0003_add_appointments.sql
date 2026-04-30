CREATE TABLE IF NOT EXISTS appointments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  midwife_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  place TEXT NOT NULL,
  mode TEXT NOT NULL CHECK (mode IN ('Klinik', 'Online')),
  status TEXT NOT NULL DEFAULT 'Akan datang' CHECK (status IN ('Akan datang', 'Selesai', 'Dibatalkan')),
  notes TEXT DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_appointments_customer ON appointments(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointments_midwife ON appointments(midwife_id);
CREATE INDEX IF NOT EXISTS idx_appointments_schedule ON appointments(date, time);
