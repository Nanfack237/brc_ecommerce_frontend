export default defineEventHandler(async (event) => {
  const response = await fetch('https://api.brcmarket.cm/sitemap.xml')
  const xml = await response.text()

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})