markdown-to-notion
===

This script import markdown notes to Notion.

## requirements

- `nodejs`
- `PostgresQL` - for local cache of imported notes

## How to run

1. Get `NOTION_TOKEN` and give access to your note where the data will be imported
   - [Create your integration in Notion](https://developers.notion.com/docs/create-a-notion-integration#getting-started)
 
2. Run the script specifying the folder with notes

```bash
export NOTION_TOKEN 'secret_notion_token'
export DB_HOST 'localhost'
export DB_NAME 'notion'
export DB_USER 'notion'
export DB_PASSWORD 'notion-password'

node index.js --import /path/no/notes
```

3. Some notes may not import correctly. [Solutions](https://github.com/tryfabric/martian#working-with-notions-limits)

> There is no such command yet

```bash
node index.js --show-errors
```

4. After correcting the original notes that were imported with an error, they can be imported again

> There is no such command yet

```bash
node index.js --import-with-errors /path/no/notes
```
