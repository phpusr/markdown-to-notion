import { readdirSync, readFileSync, lstatSync } from 'node:fs'
import { markdownToBlocks, markdownToRichText } from '@tryfabric/martian'
import { addBlocks, createPage } from './notion_api.js'


await importNotes()

async function importNotes() {
  const notesDir = '/home/phpusr/tmp/notes/NOTES/car';
  const files = readdirSync(notesDir, {recursive: true}).slice(0, 2)

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
    const blocks = markdownToBlocks(data)
    try {
      const res = await addBlocks({parentId: page.id, blocks})
    } catch (e) {
      console.error('ERROR', JSON.stringify(e))
    }
  }
}
