// composables/useCloudinary.ts
// ─────────────────────────────────────────────────────────────────────────────
// Upload direct vers Cloudinary (unsigned preset)
// Les URLs retournées sont stockées dans la DB via le ProductController
// ─────────────────────────────────────────────────────────────────────────────

export const useCloudinary = () => {
  const config = useRuntimeConfig()

  // Ces valeurs viennent de .env (runtimeConfig)
  const CLOUD_NAME  = config.public.cloudinaryCloudName   // ex: dxyz123abc
  const UPLOAD_PRESET = config.public.cloudinaryUploadPreset // ex: brc_market

  /**
   * Upload un seul fichier File vers Cloudinary
   * Retourne l'URL sécurisée (https://res.cloudinary.com/...)
   */
  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', UPLOAD_PRESET)
    formData.append('folder', 'brc_market/products')

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    )

    if (!response.ok) {
      throw new Error(`Cloudinary upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.secure_url as string
  }

  /**
   * Upload plusieurs fichiers en parallèle
   * Retourne un tableau d'URLs
   */
  const uploadImages = async (files: File[]): Promise<string[]> => {
    return Promise.all(files.map(uploadImage))
  }

  /**
   * Supprime une image Cloudinary via son public_id
   * ⚠️  La suppression côté client nécessite une signature (signed) —
   *     on délègue donc la suppression au backend Laravel si besoin.
   *     Cette fonction est fournie pour usage serveur uniquement.
   */
  const extractPublicId = (url: string): string => {
    // "https://res.cloudinary.com/cloud/image/upload/v123/brc_market/products/abc.jpg"
    // → "brc_market/products/abc"
    const parts = url.split('/upload/')
    if (parts.length < 2) return ''
    const withVersion = parts[1]
    const withoutVersion = withVersion.replace(/^v\d+\//, '')
    return withoutVersion.replace(/\.[^/.]+$/, '') // enlève l'extension
  }

  return { uploadImage, uploadImages, extractPublicId }
}