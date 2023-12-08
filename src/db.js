import pg from 'pg'

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'notion',
  user: process.env.DB_USER || 'phpusr',
  password: process.env.DB_PASSWORD || ''
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

export async function cleanDb() {
  // noinspection SqlWithoutWhere
  await pool.query({
    text: 'DELETE FROM imported_notes'
  })
  console.info('The database has been cleared.')
}
