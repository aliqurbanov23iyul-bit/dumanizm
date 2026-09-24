const { db, init } = require('./_db');

function auth(req) {
  const pass = process.env.ADMIN_PASSWORD;
  return pass && req.headers['x-admin-password'] === pass;
}

// Sanitize text
function san(s, max = 200) {
  if (typeof s !== 'string') return '';
  return s.replace(/[<>]/g, '').trim().slice(0, max);
}

module.exports = async (req, res) => {
  if (!auth(req)) return res.status(401).json({ error: 'Giriş yanlışdır' });
  try {
    const sql = db();
    await init(sql);

    if (req.method === 'GET') {
      const applications = await sql`SELECT id,name,age,favorite_song,phone,status,crew_id,created_at FROM applications ORDER BY created_at DESC`;
      const music = await sql`SELECT * FROM music ORDER BY position,id`;
      const rows = await sql`SELECT key,value FROM site_content`;
      return res.json({
        applications,
        music,
        content: Object.fromEntries(rows.map(x => [x.key, x.value]))
      });
    }

    if (req.method !== 'POST') return res.status(405).end();

    const b = req.body || {};

    if (b.action === 'addMusic') {
      const title = san(b.title, 100);
      const artist = san(b.artist, 80) || 'Duman';
      const audio_url = san(b.audio_url, 500);
      const cover_url = san(b.cover_url, 500);
      const position = parseInt(b.position) || 0;
      if (!title || !audio_url) return res.status(400).json({ error: 'Mahnı adı və audio URL lazımdır' });
      await sql`INSERT INTO music(title,artist,audio_url,cover_url,position) VALUES(${title},${artist},${audio_url},${cover_url},${position})`;

    } else if (b.action === 'deleteMusic') {
      const id = parseInt(b.id);
      if (!id) return res.status(400).json({ error: 'ID lazımdır' });
      await sql`DELETE FROM music WHERE id=${id}`;

    } else if (b.action === 'acceptApplication') {
      const id = parseInt(b.id);
      if (!id) return res.status(400).json({ error: 'ID lazımdır' });
      // Assign next crew_id if not already accepted
      const existing = await sql`SELECT status, crew_id FROM applications WHERE id=${id}`;
      if (!existing[0]) return res.status(404).json({ error: 'Tapilmadı' });
      if (existing[0].status === 'accepted') {
        // Already accepted
        await sql`UPDATE applications SET status='accepted' WHERE id=${id}`;
      } else {
        const nextCrew = await sql`SELECT COALESCE(MAX(crew_id),0)+1 AS next FROM applications`;
        const newCrewId = nextCrew[0].next;
        await sql`UPDATE applications SET status='accepted', crew_id=${newCrewId} WHERE id=${id}`;
      }

    } else if (b.action === 'rejectApplication') {
      const id = parseInt(b.id);
      if (!id) return res.status(400).json({ error: 'ID lazımdır' });
      await sql`UPDATE applications SET status='rejected' WHERE id=${id}`;

    } else if (b.action === 'deleteApplication') {
      const id = parseInt(b.id);
      if (!id) return res.status(400).json({ error: 'ID lazımdır' });
      await sql`DELETE FROM applications WHERE id=${id}`;

    } else if (b.action === 'content') {
      for (const k of ['hero_title', 'hero_text', 'rules']) {
        if (typeof b[k] === 'string') {
          const v = san(b[k], 2000);
          await sql`INSERT INTO site_content(key,value) VALUES(${k},${v}) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value`;
        }
      }

    } else {
      return res.status(400).json({ error: 'Naməlum əməliyyat' });
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};