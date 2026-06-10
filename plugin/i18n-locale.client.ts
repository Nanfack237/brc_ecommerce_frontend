export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter()

  router.afterEach(() => {
    const saved = localStorage.getItem('locale')
    if (!saved || !['fr', 'en'].includes(saved)) return

    const i18n = nuxtApp.$i18n as any
    if (i18n && saved !== i18n.locale.value) {
      i18n.setLocale(saved)
    }
  })
})