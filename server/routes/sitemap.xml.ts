export default defineEventHandler(async (event) => {
  const response = await fetch('https://api.brcmarket.cm/sitemap.xml')
  const xml = await response.text()

  console.log('Sitemap length:', xml.length)
  console.log('First 500 chars:', xml.substring(0, 500))

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})