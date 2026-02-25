<script setup lang="ts">
// --- ÉTAT DU TUNNEL D'ACHAT ---

  useHead({
    title: 'Checkout',
    titleTemplate: (titleChunk) => {
      return titleChunk ? `${titleChunk} - BRC Market` : 'BRC Market';
    },
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  })
const currentStep = ref(1)
const steps = [
  { id: 1, title: 'Adresse', desc: 'Vos coordonnées', icon: 'i-heroicons-home' },
  { id: 2, title: 'Livraison', desc: 'Mode d\'envoi', icon: 'i-heroicons-truck' },
  { id: 3, title: 'Paiement', desc: 'Mode de règlement', icon: 'i-heroicons-credit-card' }
]

// --- DONNÉES DU FORMULAIRE ---
const form = ref({
  nom: '', prenom: '', telephone: '', email: '',
  ville: '', quartier: '', infosPlus: '', whatsapp: '',
  shipping: 'standard', 
  payment: 'cash' // Valeur par défaut
})

// --- CALCULS DYNAMIQUES ---
const subtotal = 254000 // Prix Smart TV ROCH 55"
const shippingFees = computed(() => form.value.shipping === 'express' ? 10000 : 5000)
const total = computed(() => subtotal + shippingFees.value)

const canGoNext = computed(() => {
  if (currentStep.value === 1) return form.value.nom && form.value.telephone && form.value.ville
  return true
})


// Liste exhaustive des villes et quartiers principaux
const locations = {
  'Douala': ['Akwa', 'Bonapriso', 'Bonamoussadi', 'Kotto', 'Logbessou', 'Bépanda', 'Deido', 'Village', 'Ndogbong', 'Bonabéri'],
  'Yaoundé': ['Bastos', 'Ngousso', 'Omnisports', 'Mendong', 'Biyem-Assi', 'Etoudi', 'Emana', 'Odza', 'Damas', 'Nsam'],
  'Bafoussam': ['Tamda', 'Djeleng', 'Banengo', 'Houkaha'],
  'Garoua': ['Lopéré', 'Roumdé Adjia', 'Yelwa'],
  'Bamenda': ['Commercial Avenue', 'Up Station', 'Nkwen'],
  'Kribi': ['Cité des Palmiers', 'Dimbambe', 'Eboundja'],
  'Limbe': ['Down Beach', 'Bota', 'Mile 4'],
  'Buea': ['Molyko', 'Check Point', 'Bonduma'],
  'Dschang': ['Foréké', 'Tsinfing'],
  'Ngaoundéré': ['Baladji', 'Dang']
}

const villes = Object.keys(locations)

// Liste dynamique des quartiers basée sur la ville sélectionnée
const quartiersDisponibles = computed(() => {
  return form.value.ville ? locations[form.value.ville] : []
})

// Réinitialiser le quartier si la ville change
watch(() => form.value.ville, () => {
  form.value.quartier = ''
})
</script>

<template>
  <UContainer class="py-10 bg-slate-50/50 min-h-screen">
    
    <div class="max-w-4xl mx-auto mb-12">
      <div class="flex items-center justify-between relative">
        <div v-for="step in steps" :key="step.id" class="flex flex-col items-center z-10 flex-1">
          <div 
            class="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-2 shadow-sm"
            :class="currentStep >= step.id ? 'bg-[#e60012] border-[#e60012] text-white' : 'bg-white border-gray-100 text-gray-400'"
          >
            <UIcon :name="step.icon" class="w-6 h-6" />
          </div>
          <div class="text-center mt-3">
            <p class="text-sm font-bold text-slate-800 tracking-tight">{{ step.title }}</p>
            <p class="text-[10px] text-slate-400 font-bold">{{ step.desc }}</p>
          </div>
        </div>
        <div class="absolute top-6 left-0 w-full h-0.5 bg-gray-100 -z-0"></div>
        <div class="absolute top-6 left-0 h-0.5 bg-[#e60012] transition-all duration-700 -z-0" :style="{ width: `${(currentStep - 1) * 50}%` }"></div>
      </div>
    </div>

    <div class="grid grid-cols-12 gap-8 max-w-6xl mx-auto">
      
      <div class="col-span-12 lg:col-span-8">
        <div class="bg-white p-8 rounded-xl shadow-sm border border-gray-100 min-h-[500px] flex flex-col">
          
          <Transition name="fade" mode="out-in">
            <div v-if="currentStep === 1" key="step1" class="space-y-8">
              <div class="flex items-center gap-3 border-b border-gray-50 pb-4">
                <span class="w-7 h-7 bg-[#e60012] text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <h2 class="text-xl font-bold text-slate-800">Coordonnées de livraison</h2>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
              
              <UFormGroup label="Nom *" name="nom">
                <UInput v-model="form.nom" icon="i-heroicons-user" placeholder="Nom" size="xl" variant="soft" class="w-full" />
              </UFormGroup>

              <UFormGroup label="Prénom *"  name="prenom">
                <UInput v-model="form.prenom" icon="i-heroicons-user" placeholder="Prénom" size="xl" variant="soft" class="w-full" />
              </UFormGroup>

              <UFormGroup label="Numéro de Téléphone *"  name="telephone">
                <UInput v-model="form.telephone" icon="i-heroicons-phone" placeholder="677..." size="xl" variant="soft" class="w-full" />
              </UFormGroup>

              <UFormGroup label="Email">
                <UInput v-model="form.email" icon="i-heroicons-envelope" placeholder="exemple@mail.com" size="xl" variant="soft" class="w-full" />
              </UFormGroup>

              <UFormGroup label="Ville *"  name="ville">
                <USelectMenu v-model="form.ville" :items=villes placeholder="Sélectionnez" size="xl" variant="soft" searchable searchable-placeholder="Rechercher une ville..." class="w-full" />
              </UFormGroup>

              <UFormGroup label="Quartier *">
                <USelectMenu 
                  v-model="form.quartier" 
                  :items="quartiersDisponibles" 
                  :disabled="!form.ville"
                  :placeholder="form.ville ? 'Choisir un quartier' : 'Sélectionnez d\'abord la ville'" 
                  size="xl" 
                  variant="soft" 
                  class="w-full"
                  searchable
                />
              </UFormGroup>

              <UFormGroup label="Instructions de livraison (facultatif)" class="col-span-1 md:col-span-2">
                <UTextarea
                  v-model="form.infosPlus"
                  placeholder="Points de repère ou instructions..."
                  size="xl"
                  variant="soft"
                  :rows="3"
                  class="w-full"
                  autoresize
                />
              </UFormGroup>
            </div>
            </div>

            <div v-else-if="currentStep === 2" key="step2" class="space-y-6">
              <div class="flex items-center gap-3 border-b border-gray-50 pb-4">
                <span class="w-7 h-7 bg-[#e60012] text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <h2 class="text-xl font-bold text-slate-800">Mode d'expédition</h2>
              </div>
              <div class="space-y-4">
                <div v-for="opt in [{id:'standard', n:'Standard', d:'24h-48h', p:5000}, {id:'express', n:'Express', d:'Le jour même', p:10000}]" 
                     :key="opt.id" @click="form.shipping = opt.id"
                     class="p-5 border-2 rounded-xl cursor-pointer flex justify-between items-center transition-all"
                     :class="form.shipping === opt.id ? 'border-[#e60012] bg-red-50/10' : 'border-gray-50 hover:border-gray-100'">
                  <div class="flex items-center gap-4">
                    <UIcon :name="opt.id === 'standard' ? 'i-heroicons-truck' : 'i-heroicons-bolt'" class="w-8 h-8 text-slate-400" />
                    <div><p class="font-bold">{{ opt.n }}</p><p class="text-xs text-slate-500">{{ opt.d }}</p></div>
                  </div>
                  <span class="font-black">{{ opt.p.toLocaleString() }} FCFA</span>
                </div>
              </div>
            </div>

            <div v-else key="step3" class="space-y-6">
              <div class="flex items-center gap-3 border-b border-gray-50 pb-4">
                <span class="w-7 h-7 bg-[#e60012] text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <h2 class="text-xl font-bold text-slate-800">Mode de paiement</h2>
              </div>
              
              <div class="grid grid-cols-1 gap-4">
                <div @click="form.payment = 'om'" 
                     class="group p-5 border-2 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                     :class="form.payment === 'om' ? 'border-orange-500 bg-orange-50/20' : 'border-gray-50'">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white font-black">OM</div>
                    <div><p class="font-bold">Orange Money</p><p class="text-xs text-slate-500">Paiement via compte Orange</p></div>
                  </div>
                  <URadio v-model="form.payment" value="om" color="orange" />
                </div>

                <div @click="form.payment = 'momo'" 
                     class="group p-5 border-2 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                     :class="form.payment === 'momo' ? 'border-yellow-400 bg-yellow-50/20' : 'border-gray-50'">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-blue-900 font-black text-xs text-center leading-tight">MTN<br>MoMo</div>
                    <div><p class="font-bold">MTN Mobile Money</p><p class="text-xs text-slate-500">Rapide et sécurisé</p></div>
                  </div>
                  <URadio v-model="form.payment" value="momo" color="yellow" />
                </div>

                <div @click="form.payment = 'cash'" 
                     class="group p-5 border-2 rounded-xl cursor-pointer flex items-center justify-between transition-all"
                     :class="form.payment === 'cash' ? 'border-[#274a82] bg-blue-50/20' : 'border-gray-50'">
                  <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-[#274a82] rounded-lg flex items-center justify-center text-white">
                      <UIcon name="i-heroicons-banknotes" class="w-6 h-6" />
                    </div>
                    <div><p class="font-bold">Paiement à la livraison</p><p class="text-xs text-slate-500">Payez en espèces à la réception</p></div>
                  </div>
                  <URadio v-model="form.payment" value="cash" />
                </div>
              </div>
            </div>
          </Transition>

          <div class="mt-auto flex justify-between pt-8 border-t border-gray-50">
            <UButton v-if="currentStep > 1" @click="currentStep--" variant="ghost" color="gray" class="font-bold uppercase text-xs">Retour</UButton>
            <div v-else></div>
            <UButton @click="currentStep === 3 ? null : currentStep++" :disabled="!canGoNext"
                     class="bg-[#274a82] hover:bg-[#e60012] text-white font-black px-12 py-4 uppercase tracking-widest rounded-lg">
              {{ currentStep === 3 ? 'Finaliser l\'achat' : 'Continuer' }}
            </UButton>
          </div>
        </div>
      </div>

      <div class="col-span-12 lg:col-span-4">
        <div class="sticky top-10 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="p-6 bg-slate-50/50 border-b border-gray-100">
            <h3 class="font-black text-slate-800  text-xl tracking-widest">Résumé de la commande</h3>
          </div>
          <div class="p-6 space-y-4">
            <div class="flex justify-between items-baseline">
              <span class="text-slate-500 font-bold uppercase text-[11px]">Total à payer</span>
              <span class="text-2xl font-black text-[#274a82]">{{ total.toLocaleString() }} FCFA</span>
            </div>
            <div class="space-y-3 pt-4 border-t border-gray-50 text-sm">
              <div class="flex justify-between"><span>Sous-total</span><span class="font-bold">{{ subtotal.toLocaleString() }} FCFA</span></div>
              <div class="flex justify-between"><span>Livraison</span><span class="font-bold text-[#e60012]">+ {{ shippingFees.toLocaleString() }} FCFA</span></div>
            </div>
            
            <div class="pt-4 border-t border-gray-50">
              <div class="flex gap-2">
                <UInput placeholder="Code promo" class="flex-1" size="sm" variant="soft" />
                <UButton color="black" size="sm" class="px-4 font-bold text-[10px] uppercase">Appliquer</UButton>
              </div>
            </div>

            <div class="pt-6 flex flex-col gap-3">
              <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                <UIcon name="i-heroicons-shield-check" class="w-4 h-4" /> Paiement 100% sécurisé
              </div>
              <div class="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase">
                <UIcon name="i-heroicons-truck" class="w-4 h-4" /> Livraison garantie par BRC
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </UContainer>
</template>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.fade-enter-from { opacity: 0; transform: translateY(10px); }
.fade-leave-to { opacity: 0; transform: translateY(-10px); }

:deep(.u-input-variant-soft) {
  background-color: #f8fafc !important;
  border: 1px solid #f1f5f9 !important;
}
:deep(.u-input-variant-soft:focus) {
  border-color: #e60012 !important;
  background-color: #fff !important;
}

:deep(.u-form-group-label) {
  display: block !important;
  color: #0f172a !important; /* Slate 900 */
  opacity: 1 !important;
}

/* S'assurer que le wrapper ne réduit pas l'espace du label */
:deep(.u-form-group-wrapper) {
  margin-top: 4px;
}
</style>