import { getImportedWithErrorsNotes, getImportedNotesStatus, importNotes } from './src/notes_importer.js'
import { cleanDb } from './src/db.js'

await main()

async function main() {
  const args = process.argv.slice(2)
  const command = args[0]

  switch (command) {
    case '--help':
      printHelp()
      return
    case '--import':
      await importNotes(args[1])
      return
    case '--import-with-errors':
      await importNotes(args[1], true)
      return
    case '--status':
      await printStatus(args[1])
      return
    case '--clean-db':
      await cleanDb()
      return
    case '--show-errors':
      await showErrors()
      return
    default:
      printHelp()
  }
}

function printHelp() {
  console.info("--help - Print help")
  console.info("--import \"/data/notes\" - Import markdown notes from directory")
  console.info("--status \"/data/notes\" - Show count of imported notes")
  console.info("--clean-db - Clean local cache db with imported notes")
}

async function printStatus(notesDir) {
  const { importedCount, notesCount, importedWithErrorsCount, importedWithoutErrorsCount, progress } = await getImportedNotesStatus(notesDir)
  console.info(`Imported: ${importedCount}/${notesCount} [${progress}%]`)
  console.info(`Imported with errors: ${importedWithErrorsCount}`)
  console.info(`Imported without errors: ${importedWithoutErrorsCount}`)
}

async function showErrors() {
  (await getImportedWithErrorsNotes()).forEach((noteStatus, index) => {
    console.log(`${index + 1}. "${noteStatus.filePath}":`)
    console.log(`${noteStatus.error?.message || noteStatus.error}\n`)
  })
}
