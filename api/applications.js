const { db, init } = require('./_db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const { name, age, favorite_song, phone } = req.body || {};
    if (!name || !favorite_song || !phone || !age)
      return res.status(400).json({ error: 'Bütün xanaları doldur' });

    const n = Number(age);
    if (!Number.isInteger(n) || n < 14 || n > 99)
      return res.status(400).json({ error: 'Yaş yanlışdır' });

    const cleanName = String(name).replace(/[<>]/g, '').trim().slice(0, 60);
    const cleanSong = String(favorite_song).replace(/[<>]/g, '').trim().slice(0, 100);
    const cleanPhone = String(phone).replace(/[<>]/g, '').trim().slice(0, 30);
    if (!cleanName || !cleanSong || !cleanPhone)
      return res.status(400).json({ error: 'Düzgün məlumatları daxil et' });

    const sql = db();
    await init(sql);

    const rows = await sql`
      INSERT INTO applications(name, age, favorite_song, phone, status, crew_id)
      VALUES(${cleanName}, ${n}, ${cleanSong}, ${cleanPhone}, 'pending', nextval('crew_id_seq'))
      RETURNING id, name, favorite_song, crew_id, status
    `;
    const row = rows[0];

    res.status(201).json({
      ok: true,
      id: row.id,
      name: row.name,
      favorite_song: row.favorite_song,
      crew_id: row.crew_id,
      status: row.status,
      ticket_url: `/ticket.html?id=${row.id}`
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
};