import { importNotes } from './src/notes_importer.js'

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
    default:
      printHelp()
  }
}

function printHelp() {
  console.info("--help - Print help")
  console.info("--import \"/data/notes\" - Import markdown notes from directory")
  console.info("--status - Show count of imported notes")
  console.info("--clean-db - Clean local cache db with imported notes")
}
