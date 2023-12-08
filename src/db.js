import pg from 'pg'

const pool = new pg.Pool({
  host: 'localhost',
  database: 'notion',
  user: 'phpusr'
})

export async function loadImportStatuses() {
  const res = await pool.query({
    text: 'SELECT * FROM imported_notes'
  })
  return res.rows
}

export async function addImportStatus({ noteId, title, filePath, imported, error }) {
  await pool.query({
    text: 'INSERT INTO imported_notes("noteId", title, "filePath", imported, error) VALUES($1, $2, $3, $4, $5)',
    values: [noteId, title, filePath, imported, error]
  })
}

