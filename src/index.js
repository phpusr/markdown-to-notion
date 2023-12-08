import { lstatSync, readdirSync, readFileSync } from 'node:fs'
import { markdownToBlocks } from '@tryfabric/martian'
import { addBlocks, createPage } from './notion_api.js'
import { addImportStatus } from './db.js'


const notesDir = '/home/phpusr/tmp/notes/NOTES/car'
const importedNotes = {}
await importNotes()

async function importNotes() {
  // noinspection JSValidateTypes
  const files = readdirSync(notesDir, { recursive: true })
    .filter(it => lstatSync(`${notesDir}/${it}`).isFile())

  for (const relFilePath of files) {
    createParentNotes(relFilePath)

    let data = ''
    try {
      const filePath = `${notesDir}/${relFilePath}`
      data = readFileSync(`${notesDir}/${relFilePath}`, 'utf8')
    } catch (e) {
      console.error('error in file: ', relFilePath, '\n', e)
      continue
    }

    const noteInfo = {
      title: relFilePath.split('/').pop().split('.')[0],
      filePath: relFilePath,
      data
    }
    console.log(noteInfo)
    await saveNoteToNotion(noteInfo)
  }
}

function createParentNotes(relFilePath) {
  let dirPath = notesDir
  for (const dir of relFilePath.split('/').slice(0, -1)) {
    dirPath += '/' + dir
    if (importedNotes.hasOwnProperty(dirPath)) {
      console.info(`dir ${dirPath} already exists`)
      continue
    }

    console.log('dir', dir)
  }
}

async function saveNoteToNotion(noteInfo) {
  if (importedNotes.hasOwnProperty(noteInfo.filePath)) {
    console.info(`Note ${noteInfo.filePath} already exists`)
    return
  }

  const page = await createPage({ title: noteInfo.title })
  noteInfo.noteId = page.id
  importedNotes[noteInfo.filePath] = noteInfo

  console.log(`\n${noteInfo.filePath}`)
  console.log('-'.repeat(30) + '\n')

  if (!noteInfo.data) {
    return
  }

  const blocks = markdownToBlocks(noteInfo.data)
  try {
    await addBlocks({ parentId: page.id, blocks })
    noteInfo.imported = true
  } catch (e) {
    noteInfo.imported = false
    noteInfo.error = JSON.stringify(e)
    console.error('ERROR')
  }

  await addImportStatus(noteInfo)
}
