<script setup lang="ts">
import { ref, computed } from 'vue'

const loading = ref(false)

const form = ref({
  fullName: '',
  phone: '',
  email: '',
  city: '',
  address: '',
  paymentMethod: 'orange' // orange | mtn | card | cash
})

const paymentLabel = computed(() => {
  switch (form.value.paymentMethod) {
    case 'orange':
      return 'Paiement immédiat via Orange Money'
    case 'mtn':
      return 'Paiement immédiat via MTN Mobile Money'
    case 'card':
      return 'Paiement immédiat par carte bancaire'
    case 'cash':
      return 'Paiement à la livraison'
    default:
      return ''
  }
})

const submitOrder = () => {
  loading.value = true

  setTimeout(() => {
    loading.value = false
    alert(paymentLabel.value + ' ✅')
  }, 1500)
}
</script>

<template>
  <UContainer class="py-10 max-w-5xl">
    <!-- HEADER -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold">Finaliser la commande</h1>
      <p class="text-gray-500">
        Renseignez vos informations et choisissez votre moyen de paiement
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- LEFT : LIVRAISON -->
      <div class="lg:col-span-2 space-y-6">
        <UCard>
          <h2 class="font-semibold mb-4 flex items-center gap-2">
            <UIcon name="i-heroicons-map-pin" />
            Informations de livraison
          </h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <UInput v-model="form.fullName" placeholder="Nom complet" />
            <UInput v-model="form.phone" placeholder="Téléphone" />
            <UInput v-model="form.email" placeholder="Email" />
            <UInput v-model="form.city" placeholder="Ville" />
          </div>

          <UTextarea
            v-model="form.address"
            placeholder="Adresse complète"
            class="mt-4"
          />
        </UCard>
      </div>

      <!-- RIGHT : RÉSUMÉ + PAIEMENT -->
      <UCard class="h-fit sticky top-6">
        <h2 class="text-lg font-semibold mb-4">Résumé de la commande</h2>

        <!-- RÉSUMÉ -->
        <div class="space-y-3 text-sm mb-6">
          <div class="flex justify-between">
            <span>Sous-total</span>
            <span>149 000 FCFA</span>
          </div>

          <div class="flex justify-between">
            <span>Livraison</span>
            <span>3 000 FCFA</span>
          </div>

          <UDivider />

          <div class="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span class="text-[#e60012]">152 000 FCFA</span>
          </div>
        </div>

        <!-- PAIEMENT -->
        <h3 class="font-semibold mb-3">Moyen de paiement</h3>

        <div class="grid grid-cols-2 gap-3">
          <!-- ORANGE -->
          <div
            @click="form.paymentMethod = 'orange'"
            class="cursor-pointer border rounded-lg p-3 flex items-center gap-3 hover:border-[#e60012]"
            :class="form.paymentMethod === 'orange' && 'border-[#e60012]'"
          >
            <img src="/images/about-us1.jpg" class="h-6" />
            <span class="text-sm font-medium">Orange Money</span>
          </div>

          <!-- MTN -->
          <div
            @click="form.paymentMethod = 'mtn'"
            class="cursor-pointer border rounded-lg p-3 flex items-center gap-3 hover:border-[#e60012]"
            :class="form.paymentMethod === 'mtn' && 'border-[#e60012]'"
          >
            <img src="/images/about-us1.jpg" class="h-6" />
            <span class="text-sm font-medium">MTN MoMo</span>
          </div>

          <!-- CARTE -->
          <div
            @click="form.paymentMethod = 'card'"
            class="cursor-pointer border rounded-lg p-3 flex items-center gap-3 hover:border-[#e60012]"
            :class="form.paymentMethod === 'card' && 'border-[#e60012]'"
          >
            <img src="/images/about-us1.jpg" class="h-6" />
            <span class="text-sm font-medium">Carte bancaire</span>
          </div>

          <!-- CASH -->
          <div
            @click="form.paymentMethod = 'cash'"
            class="cursor-pointer border rounded-lg p-3 flex items-center gap-3 hover:border-[#e60012]"
            :class="form.paymentMethod === 'cash' && 'border-[#e60012]'"
          >
            <UIcon name="i-heroicons-truck" class="w-6 h-6" />
            <span class="text-sm font-medium">À la livraison</span>
          </div>
        </div>

        <!-- MESSAGE -->
        <div class="mt-4 text-sm text-gray-600">
          ✅ <strong>{{ paymentLabel }}</strong>
        </div>

        <!-- ACTION -->
        <UButton
          block
          size="lg"
          class="mt-6 bg-[#e60012] hover:bg-red-700"
          icon="i-heroicons-lock-closed"
          :loading="loading"
          @click="submitOrder"
        >
          {{
            form.paymentMethod === 'cash'
              ? 'Valider la commande'
              : 'Payer maintenant'
          }}
        </UButton>

        <p class="text-xs text-gray-500 mt-3 text-center">
          🔒 Paiement sécurisé
        </p>
      </UCard>
    </div>
  </UContainer>
</template>
