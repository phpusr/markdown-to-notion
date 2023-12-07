import { lstatSync, readdirSync, readFileSync } from 'node:fs'
import { markdownToBlocks } from '@tryfabric/martian'
import { addBlocks, createPage } from './notion_api.js'
import { addNoteInfo } from './db.js'


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

    const page = await createPage({title: relFilePath})

    console.log(`\n${relFilePath}`)
    console.log('-'.repeat(30) + '\n')
    //console.log(data);

    const noteInfo = { noteId: page.id, title: relFilePath, filePath: relFilePath  }

    const blocks = markdownToBlocks(data)
    try {
      await addBlocks({ parentId: page.id, blocks })
      noteInfo.imported = true
    } catch (e) {
      noteInfo.imported = false
      noteInfo.error = JSON.stringify(e)
      console.error('ERROR')
    }

    await addNoteInfo(noteInfo)
  }
}

