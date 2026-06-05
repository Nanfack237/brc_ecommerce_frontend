// server/routes/sitemap.xml.ts
import { defineEventHandler, setHeader } from 'h3'

export default defineEventHandler(async (event) => {
  const xml = await $fetch('https://api.brcmarket.cm/sitemap.xml', {
    responseType: 'text'
  })
  
  setHeader(event, 'Content-Type', 'application/xml')
  return xml
})