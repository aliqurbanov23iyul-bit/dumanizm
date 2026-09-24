const { db, init } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const token = String(req.query?.t || req.query?.token || '').trim();
    if (!/^[a-f0-9]{48}$/i.test(token)) return res.status(400).json({ error: 'Etibarlı bilet linki lazımdır' });

    const sql = db();
    await init(sql);
    const rows = await sql`
      SELECT name, favorite_song, crew_id, status
      FROM applications
      WHERE ticket_token = ${token} AND crew_id IS NOT NULL
      LIMIT 1
    `;
    if (!rows.length) return res.status(404).json({ error: 'Bilet tapılmadı' });

    res.setHeader('Cache-Control', 'private, no-store');
    res.status(200).json(rows[0]);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};