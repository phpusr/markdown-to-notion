import { lstatSync, readdirSync, readFileSync } from 'node:fs'
import { markdownToBlocks } from '@tryfabric/martian'
import { addBlocks, createPage } from './notion_api.js'
import { addImportStatus } from './db.js'


await importNotes()

async function importNotes() {
  const notesDir = '/home/phpusr/tmp/notes/NOTES/car';
  const files = readdirSync(notesDir, {recursive: true}).slice(0, 6)

  for (const relFilePath of files) {
    const filePath = `${notesDir}/${relFilePath}`
    if (!lstatSync(filePath).isFile()) {
      continue
    }

    let data = ''
    try {
      data = readFileSync(`${notesDir}/${relFilePath}`, 'utf8')
    } catch (e) {
      console.error('error in file: ', relFilePath)
      console.error(e)
      continue
    }

    const noteInfo = { title: relFilePath, filePath: relFilePath, data  }
    await saveNoteToNotion(noteInfo)
    await addImportStatus(noteInfo)
  }
}

async function saveNoteToNotion(noteInfo) {
  const page = await createPage({ title: noteInfo.title })
  noteInfo.noteId = page.id

  console.log(`\n${noteInfo.filePath}`)
  console.log('-'.repeat(30) + '\n')

  const blocks = markdownToBlocks(noteInfo.data)
  try {
    await addBlocks({ parentId: page.id, blocks })
    noteInfo.imported = true
  } catch (e) {
    noteInfo.imported = false
    noteInfo.error = JSON.stringify(e)
    console.error('ERROR')
  }
}
