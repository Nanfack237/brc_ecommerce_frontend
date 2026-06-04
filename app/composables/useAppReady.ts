const _appReady = ref(false)

export const useAppReady = () => {
  const setAppReady = () => { _appReady.value = true }
  return { appReady: readonly(_appReady), setAppReady }
}