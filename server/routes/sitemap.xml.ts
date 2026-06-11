export default defineEventHandler(async (event) => {
  const xml = await $fetch<string>('https://api.brcmarket.cm/sitemap.xml', {
    responseType: 'text',
  })

  setHeader(event, 'Content-Type', 'application/xml; charset=utf-8')
  return xml
})