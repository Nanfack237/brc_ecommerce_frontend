export default defineEventHandler(async () => {
  const xml = await $fetch('https://api.brcmarket.cm/sitemap.xml', {
    responseType: 'text',
  })

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  })
})