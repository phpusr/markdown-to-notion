import { lstatSync, readdirSync, readFileSync } from 'node:fs'
import { markdownToBlocks } from '@tryfabric/martian'
import { addBlocks, createPage } from './notion_api.js'
import { addImportStatus, loadImportStatuses } from './db.js'


const importedNotes = {}

export async function importNotes(notesDir) {
  const importedNoteList = await loadImportStatuses()
  importedNoteList.forEach(noteInfo => importedNotes[noteInfo.filePath] = noteInfo)
  console.info(`\nLoaded already imported ${importedNoteList.length} notes`)

  // noinspection JSValidateTypes
  const files = readdirSync(notesDir, { recursive: true })
    .filter(it => lstatSync(`${notesDir}/${it}`).isFile())

  let fileIndex = 0
  for (const relFilePath of files) {
    const progress = Math.round(++fileIndex / files.length * 100)
    console.log(`\n[${progress}%][${fileIndex}/${files.length}] ${relFilePath}`)
    console.log('-'.repeat(100) + '\n')

    const parentId = await createParentNotes(relFilePath)

    let data = ''
    try {
      data = readFileSync(`${notesDir}/${relFilePath}`, 'utf8')
    } catch (e) {
      console.error('error in file: ', relFilePath, '\n', e)
      continue
    }

    const noteInfo = {
      title: relFilePath.split('/').pop().split('.')[0],
      filePath: relFilePath,
      parentId,
      data
    }
    //console.log(noteInfo)
    await saveNoteToNotion(noteInfo)
  }

  console.info('\nDONE')
}

async function createParentNotes(relFilePath) {
  let dirPath = ''
  let parentId = ''
  for (const dirName of relFilePath.split('/').slice(0, -1)) {
    if (dirPath) {
      dirPath += '/'
    }
    dirPath += dirName

    parentId = (await saveNoteToNotion({
      title: dirName,
      filePath: dirPath,
      parentId
    })).noteId
  }

  return parentId
}

async function saveNoteToNotion(noteInfo) {
  if (importedNotes.hasOwnProperty(noteInfo.filePath)) {
    console.info(` - Note "${noteInfo.filePath}" already exists`)
    return importedNotes[noteInfo.filePath]
  }

  const page = await createPage({ title: noteInfo.title, pageId: noteInfo.parentId })
  noteInfo.noteId = page.id
  noteInfo.imported = true
  importedNotes[noteInfo.filePath] = noteInfo

  if (noteInfo.data) {
    const blocks = markdownToBlocks(noteInfo.data)
    try {
      await addBlocks({parentId: page.id, blocks})
    } catch (e) {
      noteInfo.imported = false
      noteInfo.error = e.body || e
      console.error('ERROR')
    }
  }

  await addImportStatus(noteInfo)
  return noteInfo
}
