const { db, init } = require('./_db');

module.exports = async (req, res) => {
  try {
    const sql = db();
    await init(sql);
    // Only active music, no phone numbers exposed
    const music = await sql`
      SELECT id, title, artist, audio_url, cover_url
      FROM music
      WHERE active = true
      ORDER BY position, id
    `;
    const rows = await sql`SELECT key, value FROM site_content`;
    const content = Object.fromEntries(rows.map(x => [x.key, x.value]));
    res.setHeader('Cache-Control', 's-maxage=10, stale-while-revalidate=30');
    res.status(200).json({ music, content });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};