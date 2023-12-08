import { Client } from '@notionhq/client'

const ROOT_PAGE_ID = 'f2888000d2ac4153b7858a2415935546'

const notion = new Client({
  auth: process.env.NOTION_TOKEN
})

let rootPageId = null

export async function createPage({ title, pageId }) {
  if (!pageId) {
    if (!rootPageId) {
      // Creating root page with date
      rootPageId = (await createPage({
        title: new Date().toLocaleDateString(),
        pageId: ROOT_PAGE_ID
      })).id
    }
    pageId = rootPageId
  }

  return await notion.pages.create({
    parent: { type: 'page_id', page_id: pageId },
    properties: {
      title: [
        { text: { content: title } }
      ]
    }
  })
}

export async function addBlocks({ parentId, blocks }){
  return await notion.blocks.children.append({
    block_id: parentId,
    children: blocks
  })
}
