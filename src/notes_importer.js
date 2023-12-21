import { lstatSync, readdirSync, readFileSync, existsSync } from 'node:fs'
import { markdownToBlocks } from '@tryfabric/martian'
import { addBlocks, archivePage, createPage } from './notion_api.js'
import { addImportStatus, loadImportStatuses, updateImportStatus } from './db.js'


const importedNotes = {}

export async function importNotes(notesDir, onlyWithErrors = false) {
  const importedNoteList = await loadImportStatuses()
  importedNoteList.forEach(noteInfo => importedNotes[noteInfo.filePath] = noteInfo)
  console.info(`\nLoaded already imported ${importedNoteList.length} notes`)

  // noinspection JSValidateTypes
  let files
  if (onlyWithErrors) {
    files = importedNoteList.filter(it => it.error).map(it => it.filePath)
  } else {
    files = getNotesFiles(notesDir).files
  }

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

  console.info('\nDONE.')
}

export async function importNotesWithErrors(notesDir) {
  const notes = (await loadImportStatuses()).filter(it => it.error)
  let fileIndex = 0

  for (const noteInfo of notes) {
    const progress = Math.round(++fileIndex / notes.length * 100)
    console.log(`\n[${progress}%][${fileIndex}/${notes.length}] ${noteInfo.filePath}`)
    console.log('-'.repeat(100) + '\n')
    const filePath = `${notesDir}/${noteInfo.filePath}`

    noteInfo.imported = true
    noteInfo.error = null

    if (!existsSync(filePath)) {
      console.log(`File: "${filePath}" was deleted and will be archive in Notion`)
      try {
        await archivePage(noteInfo.noteId)
      } catch (e) {
        noteInfo.imported = false
        noteInfo.error = e.body || e
        console.error(`ERROR with note id: ${noteInfo.id}`)
      }

      await updateImportStatus(noteInfo)
      continue
    }

    noteInfo.data = ''
    try {
      noteInfo.data = readFileSync(filePath, 'utf8')
    } catch (e) {
      console.error('error in file: ', noteInfo.filePath, '\n', e)
    }

    if (!noteInfo.data) {
      console.log(`File: "${filePath}" is empty`)
      continue
    }

    const blocks = markdownToBlocks(noteInfo.data)
    try {
      await addBlocks({ parentId: noteInfo.noteId, blocks })
    } catch (e) {
      noteInfo.imported = false
      noteInfo.error = e.body || e
      console.error('ERROR')
    }
    await updateImportStatus(noteInfo)
  }
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

function getNotesFiles(notesDir) {
  const filesAndDirs = readdirSync(notesDir, { recursive: true })
  // noinspection JSValidateTypes
  const files = filesAndDirs.filter(it => lstatSync(`${notesDir}/${it}`).isFile())
  return { filesAndDirs, files }
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

export async function getImportedNotesStatus(notesDir) {
  const notesCount = getNotesFiles(notesDir).filesAndDirs.length
  const importedNotes = await loadImportStatuses()
  const importedCount = importedNotes.length
  const importedWithErrorsCount = importedNotes.filter(it => !it.imported).length
  const importedWithoutErrorsCount = importedCount - importedWithErrorsCount

  return {
    notesCount: notesCount,
    importedCount,
    importedWithErrorsCount,
    importedWithoutErrorsCount,
    progress: Math.round(importedCount / notesCount * 100)
  }
}

export async function getImportedWithErrorsNotes() {
  return (await loadImportStatuses()).filter(it => it.error)
}
