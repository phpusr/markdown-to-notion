markdown-to-notion
===

This script import markdown notes to Notion

## Requirements

- `nodejs`
- `PostgresQL` - for local cache of imported notes

## How to run

1. Create db and table `imported_notes` using script `db.sql`

```bash
sudo -u postgres createdb notion-test
sudo -u postgres psql -d notion-test -f db.sql
```

2. Get `NOTION_TOKEN` and give access to your note where the data will be imported
   - [Create your integration in Notion](https://developers.notion.com/docs/create-a-notion-integration#getting-started)
 
3. Run the script specifying the folder with markdown notes

```bash
export NOTION_TOKEN 'secret_notion_token'
export DB_HOST 'localhost'
export DB_NAME 'notion'
export DB_USER 'notion'
export DB_PASSWORD 'notion-password'

node index.js --import /path/to/notes
```

4. Some notes may not import correctly. [Solutions](https://github.com/tryfabric/martian#working-with-notions-limits)

```bash
node index.js --show-errors
```

5. After correcting the original notes that were imported with an error, they can be imported again

```bash
node index.js --import-with-errors /path/no/notes
```
