const { neon } = require('@neondatabase/serverless');

function db() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL yoxdur');
  return neon(process.env.DATABASE_URL);
}

async function init(sql) {
  // Applications table with status + crew_id
  await sql`
    CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      age INT NOT NULL,
      favorite_song TEXT NOT NULL,
      phone TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      crew_id INT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  // Add columns if upgrading from V1
  await sql`
    DO $$ BEGIN
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'pending';
    EXCEPTION WHEN others THEN NULL; END $$
  `;
  await sql`
    DO $$ BEGIN
      ALTER TABLE applications ADD COLUMN IF NOT EXISTS crew_id INT;
    EXCEPTION WHEN others THEN NULL; END $$
  `;

  // Music table
  await sql`
    CREATE TABLE IF NOT EXISTS music (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      artist TEXT DEFAULT 'Duman',
      audio_url TEXT NOT NULL,
      cover_url TEXT DEFAULT '',
      position INT DEFAULT 0,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
  await sql`
    DO $$ BEGIN
      ALTER TABLE music ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true;
    EXCEPTION WHEN others THEN NULL; END $$
  `;

  // Site content
  await sql`
    CREATE TABLE IF NOT EXISTS site_content (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL
    )
  `;

  // Crew ID sequence
  await sql`
    CREATE SEQUENCE IF NOT EXISTS crew_id_seq START 1
  `;
}

module.exports = { db, init };