<template>
  <div class="min-h-screen bg-[#f4f6fa] font-sans">

    <!-- TOP NAV -->
    <div class="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-[#e60012] font-black text-lg tracking-tight">SHOP<span class="text-[#274a82]">CM</span></span>
          <span class="hidden sm:block text-gray-200">|</span>
          <span class="hidden sm:block text-xs text-gray-400 font-medium">Mon espace client</span>
        </div>
        <div class="flex items-center gap-3">
          <button class="relative w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
            <UIcon name="i-heroicons-bell" class="w-4 h-4 text-gray-500" />
            <span class="absolute top-1 right-1 w-2 h-2 bg-[#e60012] rounded-full"></span>
          </button>
          <div class="w-8 h-8 rounded-full bg-[#274a82] flex items-center justify-center text-white text-xs font-black">
            {{ userInitials }}
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div class="flex gap-6">

        <!-- SIDEBAR -->
        <aside class="hidden lg:flex flex-col w-56 flex-shrink-0 gap-3">
          <!-- Profil card -->
          <div class="bg-white rounded-sm border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center">
            <div class="relative mb-3">
              <div class="w-16 h-16 rounded-full bg-gradient-to-br from-[#274a82] to-[#e60012] flex items-center justify-center text-white text-xl font-black shadow-md">
                {{ userInitials }}
              </div>
              <button class="absolute bottom-0 right-0 w-5 h-5 bg-[#e60012] rounded-full flex items-center justify-center shadow">
                <UIcon name="i-heroicons-camera" class="w-2.5 h-2.5 text-white" />
              </button>
            </div>
            <p class="text-sm font-black text-gray-800">{{ user.firstName }} {{ user.lastName }}</p>
            <p class="text-[10px] text-gray-400 mt-0.5">{{ user.email }}</p>
            <div class="mt-2 px-2 py-0.5 bg-green-50 border border-green-100 rounded-sm">
              <span class="text-[9px] font-black text-green-600 uppercase tracking-wide">Compte vérifié</span>
            </div>
          </div>

          <!-- Nav menu -->
          <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'w-full flex items-center gap-3 px-4 py-3 text-left transition-all border-l-2 text-xs font-bold',
                activeTab === tab.id
                  ? 'border-l-[#e60012] bg-[#e60012]/5 text-[#e60012]'
                  : 'border-l-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              ]"
            >
              <UIcon :name="tab.icon" class="w-4 h-4 flex-shrink-0" />
              <span>{{ tab.label }}</span>
              <span v-if="tab.badge" class="ml-auto bg-[#e60012] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                {{ tab.badge }}
              </span>
            </button>
          </div>

          <!-- Déconnexion -->
          <button class="w-full flex items-center gap-3 px-4 py-3 text-xs font-bold text-gray-400 hover:text-[#e60012] transition-colors bg-white rounded-sm border border-gray-100 shadow-sm">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4" />
            Déconnexion
          </button>
        </aside>

        <!-- MOBILE TAB BAR -->
        <div class="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 flex shadow-lg">
          <button
            v-for="tab in tabs.slice(0, 5)"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors text-[9px] font-black',
              activeTab === tab.id ? 'text-[#e60012]' : 'text-gray-400'
            ]"
          >
            <UIcon :name="tab.icon" class="w-5 h-5" />
            {{ tab.shortLabel }}
          </button>
        </div>

        <!-- MAIN CONTENT -->
        <main class="flex-1 min-w-0 pb-20 lg:pb-0">

          <!-- ===== OVERVIEW ===== -->
          <div v-if="activeTab === 'overview'" class="flex flex-col gap-5">
            <!-- Stats cards -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div v-for="stat in stats" :key="stat.label"
                class="bg-white rounded-sm border border-gray-100 shadow-sm p-4 flex flex-col gap-2">
                <div :class="['w-8 h-8 rounded-sm flex items-center justify-center', stat.bg]">
                  <UIcon :name="stat.icon" :class="['w-4 h-4', stat.color]" />
                </div>
                <div>
                  <p class="text-2xl font-black text-gray-900 leading-none">{{ stat.value }}</p>
                  <p class="text-[10px] text-gray-400 font-medium mt-1">{{ stat.label }}</p>
                </div>
              </div>
            </div>

            <!-- Dernières commandes -->
            <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-1 h-4 bg-[#e60012] rounded-full"></div>
                  <h2 class="text-sm font-black text-gray-800">Commandes récentes</h2>
                </div>
                <button @click="activeTab = 'orders'" class="text-[11px] font-black text-[#274a82] hover:text-[#e60012] transition-colors">
                  Voir tout →
                </button>
              </div>
              <div class="divide-y divide-gray-50">
                <div v-for="order in recentOrders.slice(0, 3)" :key="order.id"
                  class="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors cursor-pointer">
                  <div class="w-10 h-10 rounded-sm bg-gray-100 overflow-hidden flex-shrink-0">
                    <img :src="order.image" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-black text-gray-800 truncate">{{ order.productName }}</p>
                    <p class="text-[10px] text-gray-400">{{ order.date }} · #{{ order.id }}</p>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-xs font-black text-gray-900">{{ order.total.toLocaleString() }} FCFA</p>
                    <span :class="['text-[9px] font-black px-1.5 py-0.5 rounded-sm', statusStyle(order.status).class]">
                      {{ statusStyle(order.status).label }}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Favoris rapides -->
            <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-1 h-4 bg-[#274a82] rounded-full"></div>
                  <h2 class="text-sm font-black text-gray-800">Mes favoris</h2>
                </div>
                <button @click="activeTab = 'favorites'" class="text-[11px] font-black text-[#274a82] hover:text-[#e60012] transition-colors">
                  Voir tout →
                </button>
              </div>
              <div class="flex gap-3 p-4 overflow-x-auto">
                <div v-for="fav in favorites.slice(0, 4)" :key="fav.id"
                  class="flex-shrink-0 w-28 group cursor-pointer">
                  <div class="relative h-24 rounded-sm overflow-hidden bg-gray-100 mb-2">
                    <img :src="fav.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <div v-if="fav.discount" class="absolute top-1 left-1 bg-[#e60012] text-white text-[8px] font-black px-1 py-0.5 rounded-sm">
                      -{{ fav.discount }}%
                    </div>
                  </div>
                  <p class="text-[10px] font-semibold text-gray-700 line-clamp-2 leading-tight">{{ fav.name }}</p>
                  <p class="text-[11px] font-black text-gray-900 mt-0.5">{{ fav.price.toLocaleString() }} <span class="text-[8px]">FCFA</span></p>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== COMMANDES ===== -->
          <div v-if="activeTab === 'orders'" class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-black text-gray-800">Mes commandes</h2>
              <!-- Filtres statut -->
              <div class="flex gap-1.5">
                <button
                  v-for="f in orderFilters"
                  :key="f.value"
                  @click="orderFilter = f.value"
                  :class="[
                    'text-[10px] font-black px-3 py-1.5 rounded-sm border transition-all',
                    orderFilter === f.value
                      ? 'bg-[#274a82] text-white border-[#274a82]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#274a82]'
                  ]"
                >
                  {{ f.label }}
                </button>
              </div>
            </div>

            <div class="flex flex-col gap-3">
              <div
                v-for="order in filteredOrders"
                :key="order.id"
                class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden"
              >
                <!-- Order header -->
                <div class="px-4 py-3 bg-gray-50/70 border-b border-gray-100 flex items-center justify-between flex-wrap gap-2">
                  <div class="flex items-center gap-3">
                    <p class="text-[11px] font-black text-gray-700">Commande <span class="text-[#274a82]">#{{ order.id }}</span></p>
                    <span class="text-gray-300">·</span>
                    <p class="text-[10px] text-gray-400">{{ order.date }}</p>
                  </div>
                  <span :class="['text-[10px] font-black px-2 py-1 rounded-sm', statusStyle(order.status).class]">
                    {{ statusStyle(order.status).label }}
                  </span>
                </div>

                <!-- Order product -->
                <div class="flex items-center gap-3 p-4">
                  <div class="w-14 h-14 rounded-sm bg-gray-100 overflow-hidden flex-shrink-0">
                    <img :src="order.image" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-black text-gray-800 truncate">{{ order.productName }}</p>
                    <p class="text-[10px] text-gray-400 mt-0.5">Qté: {{ order.qty }} · {{ order.category }}</p>
                    <div class="flex items-center gap-2 mt-1.5">
                      <div v-if="order.status === 'delivered'" class="flex-1 bg-gray-100 rounded-full h-1">
                        <div class="bg-green-500 h-1 rounded-full w-full"></div>
                      </div>
                      <div v-else-if="order.status === 'shipped'" class="flex-1 bg-gray-100 rounded-full h-1">
                        <div class="bg-[#274a82] h-1 rounded-full w-3/4"></div>
                      </div>
                      <div v-else-if="order.status === 'processing'" class="flex-1 bg-gray-100 rounded-full h-1">
                        <div class="bg-yellow-400 h-1 rounded-full w-1/3"></div>
                      </div>
                      <div v-else class="flex-1 bg-gray-100 rounded-full h-1">
                        <div class="bg-gray-300 h-1 rounded-full w-1/6"></div>
                      </div>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-sm font-black text-gray-900">{{ order.total.toLocaleString() }}</p>
                    <p class="text-[9px] text-gray-400 font-semibold">FCFA</p>
                  </div>
                </div>

                <!-- Order actions -->
                <div class="px-4 pb-4 flex gap-2 flex-wrap">
                  <button class="text-[10px] font-black text-[#274a82] border border-[#274a82]/30 hover:bg-[#274a82] hover:text-white px-3 py-1.5 rounded-sm transition-all flex items-center gap-1">
                    <UIcon name="i-heroicons-eye" class="w-3 h-3" />
                    Détails
                  </button>
                  <button v-if="order.status === 'delivered'" class="text-[10px] font-black text-[#e60012] border border-[#e60012]/30 hover:bg-[#e60012] hover:text-white px-3 py-1.5 rounded-sm transition-all flex items-center gap-1">
                    <UIcon name="i-heroicons-star" class="w-3 h-3" />
                    Laisser un avis
                  </button>
                  <button v-if="order.status === 'delivered'" class="text-[10px] font-black text-gray-500 border border-gray-200 hover:bg-gray-50 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1">
                    <UIcon name="i-heroicons-arrow-path" class="w-3 h-3" />
                    Commander à nouveau
                  </button>
                  <button v-if="order.status === 'pending'" class="text-[10px] font-black text-red-500 border border-red-200 hover:bg-red-50 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1">
                    <UIcon name="i-heroicons-x-mark" class="w-3 h-3" />
                    Annuler
                  </button>
                  <button v-if="order.status === 'shipped'" class="text-[10px] font-black text-green-600 border border-green-200 hover:bg-green-50 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1">
                    <UIcon name="i-heroicons-truck" class="w-3 h-3" />
                    Suivre la livraison
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== FAVORIS ===== -->
          <div v-if="activeTab === 'favorites'" class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-black text-gray-800">Mes favoris <span class="text-gray-400 font-medium">({{ favorites.length }})</span></h2>
            </div>
            <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              <div v-for="fav in favorites" :key="fav.id"
                class="group bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
                <div class="relative h-36 overflow-hidden">
                  <div v-if="fav.discount" class="absolute top-2 left-2 z-10 bg-[#e60012] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                    -{{ fav.discount }}%
                  </div>
                  <button
                    @click="removeFavorite(fav.id)"
                    class="absolute top-2 right-2 z-10 w-6 h-6 bg-white/90 shadow rounded-full flex items-center justify-center text-[#e60012] hover:bg-[#e60012] hover:text-white transition-colors"
                  >
                    <UIcon name="i-heroicons-heart-solid" class="w-3 h-3" />
                  </button>
                  <img :src="fav.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
                <div class="p-3">
                  <p class="text-[11px] font-semibold text-gray-700 line-clamp-2 leading-snug mb-2 h-8">{{ fav.name }}</p>
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm font-black text-gray-900">{{ fav.price.toLocaleString() }} <span class="text-[9px]">FCFA</span></p>
                      <p v-if="fav.oldPrice" class="text-[9px] text-gray-400 line-through">{{ fav.oldPrice.toLocaleString() }} FCFA</p>
                    </div>
                    <button class="w-7 h-7 rounded-sm bg-[#274a82] hover:bg-[#e60012] flex items-center justify-center text-white transition-colors shadow-sm">
                      <UIcon name="i-heroicons-shopping-cart" class="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== AVIS ===== -->
          <div v-if="activeTab === 'reviews'" class="flex flex-col gap-4">
            <div class="flex items-center justify-between">
              <h2 class="text-sm font-black text-gray-800">Mes avis</h2>
              <div class="flex gap-1.5">
                <button
                  v-for="f in reviewFilters"
                  :key="f"
                  @click="reviewFilter = f"
                  :class="[
                    'text-[10px] font-black px-3 py-1.5 rounded-sm border transition-all',
                    reviewFilter === f
                      ? 'bg-[#274a82] text-white border-[#274a82]'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-[#274a82]'
                  ]"
                >
                  {{ f }}
                </button>
              </div>
            </div>

            <!-- Avis à laisser -->
            <div v-if="reviewFilter === 'À laisser'" class="flex flex-col gap-3">
              <div v-for="order in deliveredWithoutReview" :key="order.id"
                class="bg-white rounded-sm border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                <div class="w-12 h-12 rounded-sm bg-gray-100 overflow-hidden flex-shrink-0">
                  <img :src="order.image" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-black text-gray-800 truncate">{{ order.productName }}</p>
                  <p class="text-[10px] text-gray-400">Livré le {{ order.date }}</p>
                </div>
                <button
                  @click="openReviewModal(order)"
                  class="flex-shrink-0 text-[10px] font-black bg-[#e60012] text-white px-3 py-2 rounded-sm hover:bg-[#c4000f] transition-colors"
                >
                  Donner mon avis
                </button>
              </div>
              <div v-if="deliveredWithoutReview.length === 0"
                class="bg-white rounded-sm border border-gray-100 shadow-sm p-8 text-center">
                <UIcon name="i-heroicons-check-circle" class="w-10 h-10 text-green-400 mx-auto mb-2" />
                <p class="text-xs font-black text-gray-500">Tous vos achats ont été évalués !</p>
              </div>
            </div>

            <!-- Avis publiés -->
            <div v-if="reviewFilter === 'Publiés'" class="flex flex-col gap-3">
              <div v-for="review in reviews" :key="review.id"
                class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
                <div class="flex items-start gap-4 p-4">
                  <div class="w-12 h-12 rounded-sm bg-gray-100 overflow-hidden flex-shrink-0">
                    <img :src="review.productImage" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-black text-gray-800 truncate mb-1">{{ review.productName }}</p>
                    <!-- Étoiles -->
                    <div class="flex items-center gap-0.5 mb-2">
                      <UIcon
                        v-for="i in 5"
                        :key="i"
                        :name="i <= review.rating ? 'i-heroicons-star-solid' : 'i-heroicons-star'"
                        :class="['w-3 h-3', i <= review.rating ? 'text-yellow-400' : 'text-gray-200']"
                      />
                      <span class="text-[10px] text-gray-400 ml-1">{{ review.date }}</span>
                    </div>
                    <p class="text-[11px] text-gray-600 leading-relaxed">{{ review.comment }}</p>
                  </div>
                  <button class="flex-shrink-0 w-7 h-7 rounded-sm bg-gray-100 hover:bg-[#e60012]/10 hover:text-[#e60012] flex items-center justify-center text-gray-400 transition-colors">
                    <UIcon name="i-heroicons-pencil-square" class="w-3.5 h-3.5" />
                  </button>
                </div>
                <div class="px-4 pb-3 flex items-center gap-2 border-t border-gray-50 pt-2">
                  <UIcon name="i-heroicons-hand-thumb-up" class="w-3 h-3 text-gray-400" />
                  <span class="text-[10px] text-gray-400">{{ review.helpful }} personnes ont trouvé cet avis utile</span>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== PROFIL ===== -->
          <div v-if="activeTab === 'profile'" class="flex flex-col gap-5">
            <h2 class="text-sm font-black text-gray-800">Mes informations</h2>

            <!-- Infos personnelles -->
            <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-sm bg-[#274a82]/10 flex items-center justify-center">
                    <UIcon name="i-heroicons-user" class="w-3.5 h-3.5 text-[#274a82]" />
                  </div>
                  <h3 class="text-xs font-black text-gray-800">Informations personnelles</h3>
                </div>
                <button
                  @click="editMode.personal = !editMode.personal"
                  :class="['text-[10px] font-black px-3 py-1.5 rounded-sm border transition-all',
                    editMode.personal
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'text-[#274a82] border-[#274a82]/30 hover:bg-[#274a82] hover:text-white'
                  ]"
                >
                  {{ editMode.personal ? '✓ Sauvegarder' : 'Modifier' }}
                </button>
              </div>
              <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div v-for="field in personalFields" :key="field.key">
                  <label class="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-wide">{{ field.label }}</label>
                  <input
                    v-model="userEdit[field.key]"
                    :type="field.type || 'text'"
                    :disabled="!editMode.personal"
                    :class="[
                      'w-full border rounded-sm px-3 py-2.5 text-sm text-gray-800 transition-all',
                      editMode.personal
                        ? 'border-[#274a82]/40 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 bg-white'
                        : 'border-gray-100 bg-gray-50/50 cursor-not-allowed text-gray-500'
                    ]"
                  />
                </div>
              </div>
            </div>

            <!-- Mot de passe -->
            <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-sm bg-[#e60012]/10 flex items-center justify-center">
                    <UIcon name="i-heroicons-lock-closed" class="w-3.5 h-3.5 text-[#e60012]" />
                  </div>
                  <h3 class="text-xs font-black text-gray-800">Mot de passe</h3>
                </div>
                <button
                  @click="editMode.password = !editMode.password"
                  :class="['text-[10px] font-black px-3 py-1.5 rounded-sm border transition-all',
                    editMode.password
                      ? 'bg-green-50 text-green-600 border-green-200'
                      : 'text-[#e60012] border-[#e60012]/30 hover:bg-[#e60012] hover:text-white'
                  ]"
                >
                  {{ editMode.password ? '✓ Sauvegarder' : 'Modifier' }}
                </button>
              </div>
              <div class="p-5 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div v-for="field in passwordFields" :key="field.key">
                  <label class="block text-[10px] font-black text-gray-500 mb-1.5 uppercase tracking-wide">{{ field.label }}</label>
                  <input
                    v-model="passwordEdit[field.key]"
                    type="password"
                    :placeholder="field.placeholder"
                    :disabled="!editMode.password"
                    :class="[
                      'w-full border rounded-sm px-3 py-2.5 text-sm transition-all',
                      editMode.password
                        ? 'border-[#e60012]/40 focus:outline-none focus:border-[#e60012] focus:ring-1 focus:ring-[#e60012]/20 bg-white text-gray-800'
                        : 'border-gray-100 bg-gray-50/50 cursor-not-allowed text-gray-300'
                    ]"
                  />
                </div>
              </div>
            </div>

            <!-- Adresses -->
            <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <div class="w-7 h-7 rounded-sm bg-teal-100 flex items-center justify-center">
                    <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5 text-teal-600" />
                  </div>
                  <h3 class="text-xs font-black text-gray-800">Adresses de livraison</h3>
                </div>
                <button class="text-[10px] font-black text-teal-600 border border-teal-200 hover:bg-teal-50 px-3 py-1.5 rounded-sm transition-all flex items-center gap-1">
                  <UIcon name="i-heroicons-plus" class="w-3 h-3" />
                  Ajouter
                </button>
              </div>
              <div class="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div v-for="addr in addresses" :key="addr.id"
                  :class="[
                    'border rounded-sm p-4 relative transition-all cursor-pointer',
                    addr.default ? 'border-[#274a82] bg-[#274a82]/5' : 'border-gray-200 hover:border-[#274a82]/40'
                  ]"
                >
                  <div v-if="addr.default" class="absolute top-2 right-2 bg-[#274a82] text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                    Par défaut
                  </div>
                  <div class="flex items-start gap-2 mb-2">
                    <UIcon name="i-heroicons-home" class="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p class="text-xs font-black text-gray-800">{{ addr.label }}</p>
                      <p class="text-[10px] text-gray-500 mt-0.5">{{ addr.street }}</p>
                      <p class="text-[10px] text-gray-500">{{ addr.city }}, {{ addr.country }}</p>
                    </div>
                  </div>
                  <div class="flex gap-2 mt-3">
                    <button class="text-[9px] font-black text-[#274a82] border border-[#274a82]/30 px-2 py-1 rounded-sm hover:bg-[#274a82]/5 transition-colors">
                      Modifier
                    </button>
                    <button v-if="!addr.default" class="text-[9px] font-black text-gray-400 border border-gray-200 px-2 py-1 rounded-sm hover:bg-red-50 hover:text-[#e60012] transition-colors">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <div class="bg-white rounded-sm border border-gray-100 shadow-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-gray-50 flex items-center gap-2.5">
                <div class="w-7 h-7 rounded-sm bg-yellow-100 flex items-center justify-center">
                  <UIcon name="i-heroicons-bell" class="w-3.5 h-3.5 text-yellow-600" />
                </div>
                <h3 class="text-xs font-black text-gray-800">Préférences de notifications</h3>
              </div>
              <div class="p-5 flex flex-col gap-3">
                <div v-for="notif in notifications" :key="notif.key" class="flex items-center justify-between">
                  <div>
                    <p class="text-xs font-black text-gray-700">{{ notif.label }}</p>
                    <p class="text-[10px] text-gray-400">{{ notif.desc }}</p>
                  </div>
                  <div
                    @click="notif.enabled = !notif.enabled"
                    :class="[
                      'w-10 h-5 rounded-full relative transition-colors cursor-pointer',
                      notif.enabled ? 'bg-[#274a82]' : 'bg-gray-200'
                    ]"
                  >
                    <span :class="['absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform', notif.enabled ? 'translate-x-5' : 'translate-x-0.5']" />
                  </div>
                </div>
              </div>
            </div>
          </div>

        </main>
      </div>
    </div>

    <!-- MODAL AVIS -->
    <div v-if="reviewModal.open" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/40" @click="reviewModal.open = false"></div>
      <div class="relative bg-white rounded-sm shadow-2xl w-full max-w-md overflow-hidden">
        <div class="px-5 py-4 border-b border-gray-100 flex items-center justify-between bg-[#274a82]">
          <h3 class="text-sm font-black text-white">Laisser un avis</h3>
          <button @click="reviewModal.open = false" class="text-white/60 hover:text-white transition-colors">
            <UIcon name="i-heroicons-x-mark" class="w-4 h-4" />
          </button>
        </div>
        <div class="p-5 flex flex-col gap-4">
          <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-sm">
            <div class="w-10 h-10 rounded-sm bg-gray-200 overflow-hidden">
              <img v-if="reviewModal.order" :src="reviewModal.order.image" class="w-full h-full object-cover" />
            </div>
            <p class="text-xs font-black text-gray-800">{{ reviewModal.order?.productName }}</p>
          </div>
          <!-- Étoiles interactives -->
          <div>
            <label class="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-2 block">Note <span class="text-[#e60012]">*</span></label>
            <div class="flex gap-1">
              <button
                v-for="i in 5"
                :key="i"
                @click="reviewModal.rating = i"
                @mouseover="reviewModal.hover = i"
                @mouseleave="reviewModal.hover = 0"
              >
                <UIcon
                  name="i-heroicons-star-solid"
                  :class="['w-7 h-7 transition-colors', (reviewModal.hover || reviewModal.rating) >= i ? 'text-yellow-400' : 'text-gray-200']"
                />
              </button>
            </div>
          </div>
          <div>
            <label class="text-[10px] font-black text-gray-500 uppercase tracking-wide mb-1.5 block">Votre avis <span class="text-[#e60012]">*</span></label>
            <textarea
              v-model="reviewModal.comment"
              rows="4"
              placeholder="Partagez votre expérience avec ce produit..."
              class="w-full border border-gray-200 rounded-sm px-3 py-2.5 text-sm text-gray-800 placeholder-gray-300 focus:outline-none focus:border-[#274a82] focus:ring-1 focus:ring-[#274a82]/20 resize-none transition-all"
            ></textarea>
          </div>
          <div class="flex gap-2 pt-1">
            <button @click="reviewModal.open = false" class="flex-1 border border-gray-200 rounded-sm py-2.5 text-xs font-black text-gray-500 hover:bg-gray-50 transition-colors">
              Annuler
            </button>
            <button @click="submitReview" class="flex-1 bg-[#e60012] hover:bg-[#c4000f] text-white rounded-sm py-2.5 text-xs font-black transition-colors shadow-md">
              Publier l'avis
            </button>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// User data
const user = ref({
  firstName: 'Jean',
  lastName: 'Dupont',
  email: 'jean.dupont@gmail.com',
  phone: '+237 6 99 88 77 66',
  birthdate: '1990-05-15',
})

const userEdit = ref({ ...user.value })
const userInitials = computed(() => `${user.value.firstName[0]}${user.value.lastName[0]}`)

const passwordEdit = ref({ current: '', newPass: '', confirm: '' })
const editMode = ref({ personal: false, password: false })

// Tabs
const activeTab = ref('overview')
const tabs = [
  { id: 'overview',   label: 'Tableau de bord',  shortLabel: 'Accueil', icon: 'i-heroicons-home',          badge: null },
  { id: 'orders',     label: 'Mes commandes',     shortLabel: 'Commandes', icon: 'i-heroicons-shopping-bag', badge: 3 },
  { id: 'favorites',  label: 'Mes favoris',       shortLabel: 'Favoris', icon: 'i-heroicons-heart',          badge: null },
  { id: 'reviews',    label: 'Mes avis',          shortLabel: 'Avis', icon: 'i-heroicons-star',              badge: 2 },
  { id: 'profile',    label: 'Mon profil',        shortLabel: 'Profil', icon: 'i-heroicons-user-circle',     badge: null },
]

// Stats
const stats = [
  { label: 'Commandes totales', value: 12, icon: 'i-heroicons-shopping-bag',    bg: 'bg-[#274a82]/10', color: 'text-[#274a82]' },
  { label: 'En cours',          value: 2,  icon: 'i-heroicons-truck',            bg: 'bg-yellow-100',    color: 'text-yellow-600' },
  { label: 'Favoris',           value: 8,  icon: 'i-heroicons-heart',            bg: 'bg-[#e60012]/10', color: 'text-[#e60012]' },
  { label: 'Avis publiés',      value: 5,  icon: 'i-heroicons-star',             bg: 'bg-green-100',     color: 'text-green-600' },
]

// Orders
const orderFilter = ref('Tous')
const orderFilters = [
  { value: 'Tous', label: 'Tous' },
  { value: 'pending', label: 'En attente' },
  { value: 'processing', label: 'En cours' },
  { value: 'shipped', label: 'Expédié' },
  { value: 'delivered', label: 'Livré' },
]

const recentOrders = ref([
  { id: 'CM8842', productName: 'Samsung Galaxy S24 Ultra 256Go Noir', date: '24 Jan 2025', total: 485000, status: 'delivered', qty: 1, category: 'Smartphones', image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=80&q=80' },
  { id: 'CM8801', productName: 'MacBook Air M2 13" 8Go/256Go', date: '15 Jan 2025', total: 920000, status: 'shipped', qty: 1, category: 'Informatique', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=80&q=80' },
  { id: 'CM8790', productName: 'AirPods Pro 2ème génération', date: '02 Jan 2025', total: 185000, status: 'processing', qty: 1, category: 'Accessoires', image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=80&q=80' },
  { id: 'CM8750', productName: 'iPad Air 5 WiFi 64Go', date: '20 Déc 2024', total: 380000, status: 'delivered', qty: 1, category: 'Tablettes', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=80&q=80' },
  { id: 'CM8720', productName: 'Sony WH-1000XM5 Casque Bluetooth', date: '10 Déc 2024', total: 195000, status: 'pending', qty: 2, category: 'Audio', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=80&q=80' },
])

const filteredOrders = computed(() => {
  if (orderFilter.value === 'Tous') return recentOrders.value
  return recentOrders.value.filter(o => o.status === orderFilter.value)
})

function statusStyle(status) {
  const map = {
    delivered:  { label: 'Livré',      class: 'bg-green-100 text-green-700' },
    shipped:    { label: 'Expédié',    class: 'bg-[#274a82]/10 text-[#274a82]' },
    processing: { label: 'En cours',   class: 'bg-yellow-100 text-yellow-700' },
    pending:    { label: 'En attente', class: 'bg-gray-100 text-gray-600' },
    cancelled:  { label: 'Annulé',    class: 'bg-red-100 text-[#e60012]' },
  }
  return map[status] || { label: status, class: 'bg-gray-100 text-gray-600' }
}

// Favorites
const favorites = ref([
  { id: 1, name: 'iPhone 15 Pro Max 256Go Titane Naturel', price: 820000, oldPrice: 920000, discount: 11, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=200&q=80' },
  { id: 2, name: 'Samsung 65" QLED 4K Smart TV', price: 650000, oldPrice: null, discount: null, image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829e1?w=200&q=80' },
  { id: 3, name: 'PlayStation 5 Console Edition Standard', price: 320000, oldPrice: 380000, discount: 16, image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=200&q=80' },
  { id: 4, name: 'Dell XPS 15 Intel i7 32Go RAM', price: 1100000, oldPrice: null, discount: null, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=200&q=80' },
  { id: 5, name: 'JBL Charge 5 Enceinte Bluetooth', price: 75000, oldPrice: 90000, discount: 17, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200&q=80' },
  { id: 6, name: 'Xiaomi 13T Pro 256Go', price: 340000, oldPrice: null, discount: null, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200&q=80' },
])

function removeFavorite(id) {
  favorites.value = favorites.value.filter(f => f.id !== id)
}

// Reviews
const reviewFilter = ref('Publiés')
const reviewFilters = ['Publiés', 'À laisser']

const reviews = ref([
  { id: 1, productName: 'Samsung Galaxy S24 Ultra 256Go', productImage: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=80&q=80', rating: 5, date: '25 Jan 2025', comment: 'Excellent téléphone, l\'écran est magnifique et la batterie tient très bien toute la journée. Je recommande vivement !', helpful: 12 },
  { id: 2, productName: 'iPad Air 5 WiFi 64Go', productImage: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=80&q=80', rating: 4, date: '22 Déc 2024', comment: 'Très bonne tablette pour le travail et le divertissement. Légère et rapide. Juste dommage que le stockage de base soit limité.', helpful: 7 },
])

const deliveredWithoutReview = computed(() =>
  recentOrders.value.filter(o => o.status === 'delivered' && !reviews.value.some(r => r.productName === o.productName))
)

// Review modal
const reviewModal = ref({ open: false, order: null, rating: 0, hover: 0, comment: '' })
function openReviewModal(order) {
  reviewModal.value = { open: true, order, rating: 0, hover: 0, comment: '' }
}
function submitReview() {
  if (reviewModal.value.rating === 0 || !reviewModal.value.comment) return
  reviews.value.unshift({
    id: Date.now(),
    productName: reviewModal.value.order.productName,
    productImage: reviewModal.value.order.image,
    rating: reviewModal.value.rating,
    date: new Date().toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }),
    comment: reviewModal.value.comment,
    helpful: 0,
  })
  reviewModal.value.open = false
  reviewFilter.value = 'Publiés'
}

// Profile fields
const personalFields = [
  { key: 'firstName', label: 'Prénom' },
  { key: 'lastName',  label: 'Nom' },
  { key: 'email',     label: 'Email', type: 'email' },
  { key: 'phone',     label: 'Téléphone', type: 'tel' },
  { key: 'birthdate', label: 'Date de naissance', type: 'date' },
]

const passwordFields = [
  { key: 'current', label: 'Mot de passe actuel', placeholder: '••••••••' },
  { key: 'newPass', label: 'Nouveau mot de passe', placeholder: '••••••••' },
  { key: 'confirm', label: 'Confirmer', placeholder: '••••••••' },
]

const addresses = ref([
  { id: 1, label: 'Domicile', street: 'Rue Nkolobisson, Quartier Bastos', city: 'Yaoundé', country: 'Cameroun', default: true },
  { id: 2, label: 'Bureau', street: 'Avenue Kennedy, Plateau', city: 'Douala', country: 'Cameroun', default: false },
])

const notifications = ref([
  { key: 'orders',    label: 'Statut des commandes',      desc: 'Confirmations, expéditions, livraisons', enabled: true },
  { key: 'promo',     label: 'Promotions & offres',       desc: 'Ventes flash, codes promo exclusifs', enabled: true },
  { key: 'restock',   label: 'Retour en stock',           desc: 'Alertes pour vos favoris épuisés', enabled: false },
  { key: 'reviews',   label: 'Réponses à vos avis',      desc: 'Quand quelqu\'un répond à vos avis', enabled: true },
  { key: 'newsletter', label: 'Newsletter mensuelle',    desc: 'Actualités et nouveaux produits', enabled: false },
])
</script>