const { db, init } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).end();
  try {
    const rawId = req.query?.id || req.query?.crew_id || req.query?.crew;
    const id = parseInt(rawId);
    if (!id || isNaN(id)) return res.status(400).json({ error: 'ID lazimdir' });

    const sql = db();
    await init(sql);

    // Every valid application receives a ticket immediately.
    // Phone number and other private application data are never returned here.
    const rows = await sql`
      SELECT id, name, favorite_song, crew_id, status
      FROM applications
      WHERE (id = ${id} OR crew_id = ${id}) AND crew_id IS NOT NULL
      ORDER BY id ASC
      LIMIT 1
    `;

    if (!rows.length) return res.status(404).json({ error: 'Bilet tapilmadi' });
    const row = rows[0];
    res.status(200).json({
      id: row.id,
      name: row.name,
      favorite_song: row.favorite_song,
      crew_id: row.crew_id,
      status: row.status
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};