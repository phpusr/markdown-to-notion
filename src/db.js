import pg from 'pg'

const pool = new pg.Pool({
  host: 'localhost',
  database: 'notion',
  user: 'phpusr'
})

//await addNoteInfo({ title: 'test', filePath: 'testpath', imported: true })

export async function addImportStatus({ noteId, title, filePath, imported, error }) {
  const text = 'INSERT INTO imported_notes(note_id, title, file_path, imported, error) VALUES($1, $2, $3, $4, $5)'
  const values = [noteId, title, filePath, imported, error]
  const res = await pool.query(text, values)
  //console.log(res)
}

