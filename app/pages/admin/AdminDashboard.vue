<template>
  <div class="min-h-screen bg-[#0f1117] text-white font-sans flex">

    <!-- SIDEBAR -->
    <aside :class="['fixed inset-y-0 left-0 z-40 flex flex-col transition-all duration-300 bg-[#161b27] border-r border-white/5', sidebarOpen ? 'w-60' : 'w-16']">
      <!-- Logo -->
      <div class="h-14 flex items-center px-4 border-b border-white/5 flex-shrink-0">
        <span v-if="sidebarOpen" class="text-white font-black text-base tracking-tight">
          SHOP<span class="text-[#e60012]">CM</span>
          <span class="ml-2 text-[9px] font-bold text-white/30 uppercase tracking-widest">Admin</span>
        </span>
        <span v-else class="text-[#e60012] font-black text-base">S</span>
      </div>

      <!-- Nav -->
      <nav class="flex-1 py-4 flex flex-col gap-0.5 overflow-y-auto px-2">
        <button
          v-for="item in navItems"
          :key="item.id"
          @click="activeTab = item.id"
          :class="[
            'flex items-center gap-3 rounded-sm px-3 py-2.5 transition-all text-left w-full group',
            activeTab === item.id
              ? 'bg-[#e60012] text-white'
              : 'text-white/40 hover:text-white hover:bg-white/5'
          ]"
        >
          <UIcon :name="item.icon" class="w-4 h-4 flex-shrink-0" />
          <span v-if="sidebarOpen" class="text-xs font-bold truncate">{{ item.label }}</span>
          <span v-if="sidebarOpen && item.badge" class="ml-auto bg-white/20 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">{{ item.badge }}</span>
        </button>
      </nav>

      <!-- Admin info -->
      <div v-if="sidebarOpen" class="p-3 border-t border-white/5">
        <div class="flex items-center gap-2.5 p-2 rounded-sm bg-white/5">
          <div class="w-7 h-7 rounded-full bg-gradient-to-br from-[#e60012] to-[#274a82] flex items-center justify-center text-white text-[10px] font-black flex-shrink-0">AD</div>
          <div class="min-w-0">
            <p class="text-[11px] font-black text-white truncate">Admin Principal</p>
            <p class="text-[9px] text-white/30 truncate">admin@shopcm.cm</p>
          </div>
        </div>
      </div>
    </aside>

    <!-- MAIN -->
    <div :class="['flex-1 flex flex-col transition-all duration-300', sidebarOpen ? 'ml-60' : 'ml-16']">

      <!-- TOP BAR -->
      <header class="h-14 bg-[#161b27] border-b border-white/5 flex items-center justify-between px-5 flex-shrink-0 sticky top-0 z-30">
        <div class="flex items-center gap-4">
          <button @click="sidebarOpen = !sidebarOpen" class="w-8 h-8 rounded-sm bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <UIcon name="i-heroicons-bars-3" class="w-4 h-4 text-white/60" />
          </button>
          <div class="hidden sm:flex items-center gap-2 bg-white/5 border border-white/10 rounded-sm px-3 py-2 w-52">
            <UIcon name="i-heroicons-magnifying-glass" class="w-3.5 h-3.5 text-white/30" />
            <input type="text" placeholder="Rechercher..." class="bg-transparent text-xs text-white placeholder-white/20 outline-none w-full" />
          </div>
        </div>
        <div class="flex items-center gap-3">
          <!-- Live indicator -->
          <div class="hidden sm:flex items-center gap-1.5 bg-green-500/10 border border-green-500/20 rounded-sm px-2.5 py-1.5">
            <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
            <span class="text-[10px] font-black text-green-400">{{ liveVisitors }} en ligne</span>
          </div>
          <button class="relative w-8 h-8 rounded-sm bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <UIcon name="i-heroicons-bell" class="w-4 h-4 text-white/60" />
            <span class="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#e60012] rounded-full"></span>
          </button>
          <div class="w-8 h-8 rounded-sm bg-gradient-to-br from-[#e60012] to-[#274a82] flex items-center justify-center text-white text-[10px] font-black">AD</div>
        </div>
      </header>

      <!-- PAGE CONTENT -->
      <main class="flex-1 overflow-auto p-5">

        <!-- ===== OVERVIEW ===== -->
        <div v-if="activeTab === 'overview'" class="flex flex-col gap-5">

          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-lg font-black text-white">Tableau de bord</h1>
              <p class="text-xs text-white/30">Samedi 28 Février 2026 · Vue d'ensemble</p>
            </div>
            <div class="flex gap-2">
              <button
                v-for="period in ['7j', '30j', '90j']"
                :key="period"
                @click="selectedPeriod = period"
                :class="['text-[10px] font-black px-3 py-1.5 rounded-sm transition-all border',
                  selectedPeriod === period
                    ? 'bg-[#e60012] border-[#e60012] text-white'
                    : 'border-white/10 text-white/40 hover:text-white hover:border-white/30'
                ]"
              >{{ period }}</button>
            </div>
          </div>

          <!-- KPI Cards -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div v-for="kpi in kpis" :key="kpi.label"
              class="bg-[#161b27] border border-white/5 rounded-sm p-4 relative overflow-hidden group hover:border-white/10 transition-all">
              <div :class="['absolute top-0 right-0 w-16 h-16 rounded-bl-full opacity-10', kpi.accent]"></div>
              <div class="flex items-start justify-between mb-3">
                <div :class="['w-8 h-8 rounded-sm flex items-center justify-center', kpi.iconBg]">
                  <UIcon :name="kpi.icon" :class="['w-4 h-4', kpi.iconColor]" />
                </div>
                <span :class="['text-[10px] font-black px-1.5 py-0.5 rounded-sm', kpi.trend > 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-[#e60012]']">
                  {{ kpi.trend > 0 ? '+' : '' }}{{ kpi.trend }}%
                </span>
              </div>
              <p class="text-2xl font-black text-white">{{ kpi.value }}</p>
              <p class="text-[10px] text-white/30 mt-0.5">{{ kpi.label }}</p>
            </div>
          </div>

          <!-- Charts Row -->
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">

            <!-- Visitors Chart -->
            <div class="lg:col-span-2 bg-[#161b27] border border-white/5 rounded-sm p-5">
              <div class="flex items-center justify-between mb-5">
                <div>
                  <h3 class="text-sm font-black text-white">Visiteurs & Commandes</h3>
                  <p class="text-[10px] text-white/30">Sur les 7 derniers jours</p>
                </div>
                <div class="flex gap-3 text-[10px]">
                  <span class="flex items-center gap-1.5 text-white/50"><span class="w-2 h-2 rounded-full bg-[#274a82]"></span>Visiteurs</span>
                  <span class="flex items-center gap-1.5 text-white/50"><span class="w-2 h-2 rounded-full bg-[#e60012]"></span>Commandes</span>
                </div>
              </div>
              <!-- SVG Bar Chart -->
              <div class="relative h-36">
                <svg viewBox="0 0 700 144" class="w-full h-full" preserveAspectRatio="none">
                  <!-- Grid lines -->
                  <line v-for="i in 4" :key="i" :x1="0" :x2="700" :y1="i*36" :y2="i*36" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
                  <!-- Visitor bars -->
                  <rect v-for="(d, i) in chartData" :key="'v'+i"
                    :x="i * 100 + 5" :y="144 - d.visitors * 1.3" :width="40" :height="d.visitors * 1.3"
                    fill="#274a82" rx="2" opacity="0.8"/>
                  <!-- Order bars -->
                  <rect v-for="(d, i) in chartData" :key="'o'+i"
                    :x="i * 100 + 50" :y="144 - d.orders * 1.3" :width="40" :height="d.orders * 1.3"
                    fill="#e60012" rx="2" opacity="0.8"/>
                </svg>
                <!-- X labels -->
                <div class="flex justify-around mt-2">
                  <span v-for="d in chartData" :key="d.day" class="text-[9px] text-white/20 font-bold">{{ d.day }}</span>
                </div>
              </div>
            </div>

            <!-- Traffic Sources -->
            <div class="bg-[#161b27] border border-white/5 rounded-sm p-5">
              <h3 class="text-sm font-black text-white mb-1">Sources de trafic</h3>
              <p class="text-[10px] text-white/30 mb-4">Ce mois-ci</p>
              <div class="flex flex-col gap-3">
                <div v-for="source in trafficSources" :key="source.name">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-[10px] font-bold text-white/60">{{ source.name }}</span>
                    <span class="text-[10px] font-black text-white">{{ source.percent }}%</span>
                  </div>
                  <div class="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div :style="{ width: source.percent + '%' }" :class="['h-full rounded-full transition-all duration-700', source.color]"></div>
                  </div>
                </div>
              </div>
              <div class="mt-4 pt-4 border-t border-white/5">
                <p class="text-[10px] text-white/30 mb-1">Total visiteurs ce mois</p>
                <p class="text-xl font-black text-white">{{ totalVisitors.toLocaleString() }}</p>
                <p class="text-[10px] text-green-400 mt-0.5">↑ +18.4% vs mois dernier</p>
              </div>
            </div>
          </div>

          <!-- Bottom Row -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <!-- Recent Orders -->
            <div class="bg-[#161b27] border border-white/5 rounded-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 class="text-sm font-black text-white">Commandes récentes</h3>
                <button @click="activeTab = 'orders'" class="text-[10px] font-black text-[#e60012] hover:underline">Voir tout →</button>
              </div>
              <div class="divide-y divide-white/5">
                <div v-for="order in recentOrders.slice(0,5)" :key="order.id" class="flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition-colors">
                  <div class="w-8 h-8 rounded-sm bg-white/5 overflow-hidden flex-shrink-0">
                    <img :src="order.image" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-black text-white truncate">{{ order.customer }}</p>
                    <p class="text-[9px] text-white/30">{{ order.product }} · {{ order.date }}</p>
                  </div>
                  <div class="text-right">
                    <p class="text-[11px] font-black text-white">{{ order.total.toLocaleString() }}</p>
                    <span :class="['text-[8px] font-black px-1.5 py-0.5 rounded-sm', statusStyle(order.status).class]">{{ statusStyle(order.status).label }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Top Products -->
            <div class="bg-[#161b27] border border-white/5 rounded-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                <h3 class="text-sm font-black text-white">Produits les + vendus</h3>
                <button @click="activeTab = 'products'" class="text-[10px] font-black text-[#e60012] hover:underline">Voir tout →</button>
              </div>
              <div class="divide-y divide-white/5">
                <div v-for="(prod, i) in topProducts" :key="prod.id" class="flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition-colors">
                  <span :class="['w-5 h-5 rounded-sm text-[9px] font-black flex items-center justify-center flex-shrink-0', i === 0 ? 'bg-yellow-400/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-400' : 'bg-white/5 text-white/30']">{{ i + 1 }}</span>
                  <div class="w-8 h-8 rounded-sm bg-white/5 overflow-hidden flex-shrink-0">
                    <img :src="prod.image" class="w-full h-full object-cover" />
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-black text-white truncate">{{ prod.name }}</p>
                    <p class="text-[9px] text-white/30">{{ prod.sales }} ventes</p>
                  </div>
                  <p class="text-[11px] font-black text-white flex-shrink-0">{{ (prod.revenue / 1000).toFixed(0) }}K</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== COMMANDES ===== -->
        <div v-if="activeTab === 'orders'" class="flex flex-col gap-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <h1 class="text-lg font-black text-white">Gestion des commandes</h1>
            <div class="flex gap-2 flex-wrap">
              <button
                v-for="f in orderFilters" :key="f.value"
                @click="orderFilter = f.value"
                :class="['text-[10px] font-black px-3 py-1.5 rounded-sm border transition-all',
                  orderFilter === f.value ? 'bg-[#e60012] border-[#e60012] text-white' : 'border-white/10 text-white/40 hover:text-white'
                ]"
              >{{ f.label }} <span v-if="f.count" class="ml-1 opacity-60">({{ f.count }})</span></button>
            </div>
          </div>

          <div class="bg-[#161b27] border border-white/5 rounded-sm overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/5">
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Commande</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide hidden sm:table-cell">Client</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide hidden md:table-cell">Produit</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Total</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Statut</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-white/2 transition-colors group">
                  <td class="px-4 py-3">
                    <p class="text-[11px] font-black text-white">#{{ order.id }}</p>
                    <p class="text-[9px] text-white/30">{{ order.date }}</p>
                  </td>
                  <td class="px-4 py-3 hidden sm:table-cell">
                    <div class="flex items-center gap-2">
                      <div class="w-6 h-6 rounded-full bg-gradient-to-br from-[#274a82] to-[#e60012] flex items-center justify-center text-white text-[8px] font-black flex-shrink-0">
                        {{ order.customer[0] }}
                      </div>
                      <p class="text-[11px] text-white/70 font-medium">{{ order.customer }}</p>
                    </div>
                  </td>
                  <td class="px-4 py-3 hidden md:table-cell">
                    <p class="text-[11px] text-white/50 truncate max-w-[160px]">{{ order.product }}</p>
                  </td>
                  <td class="px-4 py-3">
                    <p class="text-[11px] font-black text-white">{{ order.total.toLocaleString() }} F</p>
                  </td>
                  <td class="px-4 py-3">
                    <select
                      :value="order.status"
                      @change="updateOrderStatus(order.id, $event.target.value)"
                      :class="['text-[9px] font-black px-2 py-1 rounded-sm border-0 outline-none cursor-pointer', statusStyle(order.status).class]"
                    >
                      <option value="pending">En attente</option>
                      <option value="processing">En cours</option>
                      <option value="shipped">Expédié</option>
                      <option value="delivered">Livré</option>
                      <option value="cancelled">Annulé</option>
                    </select>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-1.5">
                      <button class="w-6 h-6 rounded-sm bg-white/5 hover:bg-[#274a82] flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <UIcon name="i-heroicons-eye" class="w-3 h-3" />
                      </button>
                      <button class="w-6 h-6 rounded-sm bg-white/5 hover:bg-[#e60012] flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <UIcon name="i-heroicons-trash" class="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== PRODUITS ===== -->
        <div v-if="activeTab === 'products'" class="flex flex-col gap-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <h1 class="text-lg font-black text-white">Gestion des produits</h1>
            <button class="flex items-center gap-2 bg-[#e60012] hover:bg-[#c4000f] text-white text-xs font-black px-4 py-2 rounded-sm transition-colors shadow-lg">
              <UIcon name="i-heroicons-plus" class="w-3.5 h-3.5" />
              Nouveau produit
            </button>
          </div>

          <!-- Filtres + Recherche -->
          <div class="flex gap-3 flex-wrap">
            <div class="flex items-center gap-2 bg-[#161b27] border border-white/10 rounded-sm px-3 py-2 flex-1 min-w-[180px]">
              <UIcon name="i-heroicons-magnifying-glass" class="w-3.5 h-3.5 text-white/30" />
              <input v-model="productSearch" type="text" placeholder="Rechercher un produit..." class="bg-transparent text-xs text-white placeholder-white/20 outline-none w-full" />
            </div>
            <select v-model="productCategoryFilter" class="bg-[#161b27] border border-white/10 rounded-sm px-3 py-2 text-xs text-white/60 outline-none">
              <option value="">Toutes catégories</option>
              <option v-for="c in productCategories" :key="c" :value="c">{{ c }}</option>
            </select>
            <select v-model="productStatusFilter" class="bg-[#161b27] border border-white/10 rounded-sm px-3 py-2 text-xs text-white/60 outline-none">
              <option value="">Tous statuts</option>
              <option value="published">Publié</option>
              <option value="draft">Brouillon</option>
              <option value="out_of_stock">Rupture</option>
            </select>
          </div>

          <div class="bg-[#161b27] border border-white/5 rounded-sm overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/5">
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Produit</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide hidden sm:table-cell">Catégorie</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Prix</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide hidden md:table-cell">Stock</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Statut</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="prod in filteredProducts" :key="prod.id" class="hover:bg-white/2 transition-colors">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-sm bg-white/5 overflow-hidden flex-shrink-0">
                        <img :src="prod.image" class="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p class="text-[11px] font-black text-white line-clamp-1 max-w-[160px]">{{ prod.name }}</p>
                        <p class="text-[9px] text-white/30">{{ prod.brand }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 hidden sm:table-cell">
                    <span class="text-[10px] text-white/50 bg-white/5 px-2 py-0.5 rounded-sm">{{ prod.category }}</span>
                  </td>
                  <td class="px-4 py-3">
                    <p class="text-[11px] font-black text-white">{{ prod.price.toLocaleString() }}</p>
                    <p v-if="prod.oldPrice" class="text-[9px] text-white/30 line-through">{{ prod.oldPrice.toLocaleString() }}</p>
                  </td>
                  <td class="px-4 py-3 hidden md:table-cell">
                    <span :class="['text-[10px] font-black', prod.stock === 0 ? 'text-[#e60012]' : prod.stock < 5 ? 'text-yellow-400' : 'text-green-400']">
                      {{ prod.stock === 0 ? 'Rupture' : prod.stock + ' unités' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <button
                      @click="toggleProductStatus(prod)"
                      :class="['text-[9px] font-black px-2 py-1 rounded-sm transition-all',
                        prod.status === 'published' ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' :
                        prod.status === 'draft' ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20' :
                        'bg-red-500/10 text-[#e60012] hover:bg-red-500/20'
                      ]"
                    >
                      {{ prod.status === 'published' ? 'Publié' : prod.status === 'draft' ? 'Brouillon' : 'Rupture' }}
                    </button>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-1.5">
                      <button class="w-6 h-6 rounded-sm bg-white/5 hover:bg-[#274a82] flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <UIcon name="i-heroicons-pencil-square" class="w-3 h-3" />
                      </button>
                      <button class="w-6 h-6 rounded-sm bg-white/5 hover:bg-[#e60012] flex items-center justify-center text-white/40 hover:text-white transition-all">
                        <UIcon name="i-heroicons-trash" class="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== CLIENTS ===== -->
        <div v-if="activeTab === 'clients'" class="flex flex-col gap-4">
          <div class="flex items-center justify-between flex-wrap gap-3">
            <h1 class="text-lg font-black text-white">Gestion des clients</h1>
            <div class="flex items-center gap-2 bg-[#161b27] border border-white/10 rounded-sm px-3 py-2 w-52">
              <UIcon name="i-heroicons-magnifying-glass" class="w-3.5 h-3.5 text-white/30" />
              <input v-model="clientSearch" type="text" placeholder="Rechercher..." class="bg-transparent text-xs text-white placeholder-white/20 outline-none w-full" />
            </div>
          </div>

          <!-- Stats clients -->
          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div v-for="s in clientStats" :key="s.label" class="bg-[#161b27] border border-white/5 rounded-sm p-4">
              <p class="text-xl font-black text-white">{{ s.value }}</p>
              <p class="text-[10px] text-white/30 mt-0.5">{{ s.label }}</p>
            </div>
          </div>

          <div class="bg-[#161b27] border border-white/5 rounded-sm overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/5">
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Client</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide hidden sm:table-cell">Inscrit le</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide hidden md:table-cell">Commandes</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide hidden md:table-cell">Total dépensé</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Statut</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="client in filteredClients" :key="client.id" class="hover:bg-white/2 transition-colors">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div :class="['w-8 h-8 rounded-full flex items-center justify-center text-white text-[10px] font-black flex-shrink-0', client.blocked ? 'bg-[#e60012]/30' : 'bg-gradient-to-br from-[#274a82] to-[#e60012]']">
                        {{ client.name[0] }}
                      </div>
                      <div>
                        <p class="text-[11px] font-black text-white">{{ client.name }}</p>
                        <p class="text-[9px] text-white/30">{{ client.email }}</p>
                      </div>
                    </div>
                  </td>
                  <td class="px-4 py-3 hidden sm:table-cell">
                    <p class="text-[10px] text-white/40">{{ client.joinDate }}</p>
                  </td>
                  <td class="px-4 py-3 hidden md:table-cell">
                    <p class="text-[11px] font-bold text-white">{{ client.orders }}</p>
                  </td>
                  <td class="px-4 py-3 hidden md:table-cell">
                    <p class="text-[11px] font-black text-white">{{ client.spent.toLocaleString() }} F</p>
                  </td>
                  <td class="px-4 py-3">
                    <span :class="['text-[9px] font-black px-2 py-1 rounded-sm', client.blocked ? 'bg-red-500/10 text-[#e60012]' : 'bg-green-500/10 text-green-400']">
                      {{ client.blocked ? 'Bloqué' : 'Actif' }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex gap-1.5">
                      <button class="w-6 h-6 rounded-sm bg-white/5 hover:bg-[#274a82] flex items-center justify-center text-white/40 hover:text-white transition-all" title="Voir profil">
                        <UIcon name="i-heroicons-eye" class="w-3 h-3" />
                      </button>
                      <button
                        @click="toggleBlock(client)"
                        :class="['w-6 h-6 rounded-sm flex items-center justify-center transition-all', client.blocked ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20' : 'bg-red-500/10 text-[#e60012] hover:bg-red-500/20']"
                        :title="client.blocked ? 'Débloquer' : 'Bloquer'"
                      >
                        <UIcon :name="client.blocked ? 'i-heroicons-lock-open' : 'i-heroicons-no-symbol'" class="w-3 h-3" />
                      </button>
                      <button class="w-6 h-6 rounded-sm bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/40 hover:text-white transition-all" title="Envoyer email">
                        <UIcon name="i-heroicons-envelope" class="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== STOCK ===== -->
        <div v-if="activeTab === 'stock'" class="flex flex-col gap-4">
          <h1 class="text-lg font-black text-white">Gestion du stock</h1>

          <!-- Alertes stock -->
          <div v-if="lowStockProducts.length > 0" class="bg-yellow-500/5 border border-yellow-500/20 rounded-sm p-4 flex items-start gap-3">
            <UIcon name="i-heroicons-exclamation-triangle" class="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <p class="text-xs font-black text-yellow-400">{{ lowStockProducts.length }} produit(s) en stock faible</p>
              <p class="text-[10px] text-yellow-400/60 mt-0.5">Réapprovisionnez ces produits pour éviter les ruptures</p>
            </div>
          </div>

          <!-- Résumé stock -->
          <div class="grid grid-cols-3 gap-3">
            <div class="bg-[#161b27] border border-white/5 rounded-sm p-4">
              <p class="text-2xl font-black text-white">{{ products.length }}</p>
              <p class="text-[10px] text-white/30">Produits actifs</p>
            </div>
            <div class="bg-[#161b27] border border-yellow-500/10 rounded-sm p-4">
              <p class="text-2xl font-black text-yellow-400">{{ lowStockProducts.length }}</p>
              <p class="text-[10px] text-white/30">Stock faible (≤ 5)</p>
            </div>
            <div class="bg-[#161b27] border border-red-500/10 rounded-sm p-4">
              <p class="text-2xl font-black text-[#e60012]">{{ outOfStockProducts.length }}</p>
              <p class="text-[10px] text-white/30">En rupture</p>
            </div>
          </div>

          <div class="bg-[#161b27] border border-white/5 rounded-sm overflow-hidden">
            <table class="w-full">
              <thead>
                <tr class="border-b border-white/5">
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Produit</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">SKU</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Stock actuel</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Seuil alerte</th>
                  <th class="text-left px-4 py-3 text-[10px] font-black text-white/30 uppercase tracking-wide">Ajuster</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-white/5">
                <tr v-for="prod in products" :key="prod.id" class="hover:bg-white/2 transition-colors">
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-3">
                      <div class="w-9 h-9 rounded-sm bg-white/5 overflow-hidden flex-shrink-0">
                        <img :src="prod.image" class="w-full h-full object-cover" />
                      </div>
                      <p class="text-[11px] font-black text-white line-clamp-1 max-w-[150px]">{{ prod.name }}</p>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <p class="text-[10px] text-white/30 font-mono">{{ prod.sku || 'N/A' }}</p>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-2">
                      <div class="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div :style="{ width: Math.min(prod.stock / 50 * 100, 100) + '%' }"
                          :class="['h-full rounded-full', prod.stock === 0 ? 'bg-[#e60012]' : prod.stock < 5 ? 'bg-yellow-400' : 'bg-green-400']">
                        </div>
                      </div>
                      <span :class="['text-[11px] font-black', prod.stock === 0 ? 'text-[#e60012]' : prod.stock < 5 ? 'text-yellow-400' : 'text-white']">
                        {{ prod.stock }}
                      </span>
                    </div>
                  </td>
                  <td class="px-4 py-3">
                    <span class="text-[10px] text-white/30">5 unités</span>
                  </td>
                  <td class="px-4 py-3">
                    <div class="flex items-center gap-1.5">
                      <button @click="prod.stock = Math.max(0, prod.stock - 1)" class="w-6 h-6 rounded-sm bg-white/5 hover:bg-[#e60012]/20 hover:text-[#e60012] flex items-center justify-center text-white/40 transition-all text-sm font-bold">−</button>
                      <span class="text-xs font-black text-white w-8 text-center">{{ prod.stock }}</span>
                      <button @click="prod.stock += 1" class="w-6 h-6 rounded-sm bg-white/5 hover:bg-green-500/20 hover:text-green-400 flex items-center justify-center text-white/40 transition-all text-sm font-bold">+</button>
                      <button class="ml-1 text-[9px] font-black text-white/30 border border-white/10 hover:border-[#274a82] hover:text-[#274a82] px-2 py-1 rounded-sm transition-all">
                        Réappro.
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- ===== ANALYTICS ===== -->
        <div v-if="activeTab === 'analytics'" class="flex flex-col gap-5">
          <h1 class="text-lg font-black text-white">Analytics & Visiteurs</h1>

          <!-- Stats visiteurs -->
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div v-for="s in analyticsStats" :key="s.label" class="bg-[#161b27] border border-white/5 rounded-sm p-4">
              <div class="flex items-center justify-between mb-2">
                <UIcon :name="s.icon" class="w-4 h-4 text-white/20" />
                <span :class="['text-[9px] font-black', s.up ? 'text-green-400' : 'text-[#e60012]']">{{ s.up ? '↑' : '↓' }} {{ s.change }}</span>
              </div>
              <p class="text-2xl font-black text-white">{{ s.value }}</p>
              <p class="text-[10px] text-white/30">{{ s.label }}</p>
            </div>
          </div>

          <!-- Visiteurs par jour (gros chart) -->
          <div class="bg-[#161b27] border border-white/5 rounded-sm p-5">
            <div class="flex items-center justify-between mb-5">
              <div>
                <h3 class="text-sm font-black text-white">Trafic journalier</h3>
                <p class="text-[10px] text-white/30">30 derniers jours — {{ totalMonthVisitors.toLocaleString() }} visiteurs au total</p>
              </div>
            </div>
            <!-- Line chart SVG -->
            <div class="relative h-40">
              <svg viewBox="0 0 900 160" class="w-full h-full" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="visitGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#274a82" stop-opacity="0.4"/>
                    <stop offset="100%" stop-color="#274a82" stop-opacity="0"/>
                  </linearGradient>
                  <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#e60012" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="#e60012" stop-opacity="0"/>
                  </linearGradient>
                </defs>
                <!-- Grid -->
                <line v-for="i in 4" :key="i" x1="0" x2="900" :y1="i*40" :y2="i*40" stroke="rgba(255,255,255,0.04)" stroke-width="1"/>
                <!-- Visitor area -->
                <path :d="visitorAreaPath" fill="url(#visitGrad)" />
                <path :d="visitorLinePath" fill="none" stroke="#274a82" stroke-width="2" stroke-linecap="round"/>
                <!-- Conversion line -->
                <path :d="conversionLinePath" fill="none" stroke="#e60012" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="4,3"/>
              </svg>
            </div>
            <div class="flex justify-between mt-2 px-1">
              <span v-for="(label, i) in monthLabels" :key="i" class="text-[8px] text-white/20">{{ label }}</span>
            </div>
          </div>

          <!-- Tableau pages populaires + Appareils -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">

            <div class="bg-[#161b27] border border-white/5 rounded-sm overflow-hidden">
              <div class="px-5 py-4 border-b border-white/5">
                <h3 class="text-sm font-black text-white">Pages les plus visitées</h3>
              </div>
              <div class="divide-y divide-white/5">
                <div v-for="(page, i) in topPages" :key="i" class="flex items-center gap-3 px-5 py-3 hover:bg-white/2 transition-colors">
                  <span class="text-[10px] font-black text-white/20 w-4">{{ i + 1 }}</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-[11px] font-bold text-white truncate">{{ page.path }}</p>
                    <div class="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div :style="{ width: (page.visits / topPages[0].visits * 100) + '%' }" class="h-full bg-[#274a82] rounded-full"></div>
                    </div>
                  </div>
                  <div class="text-right flex-shrink-0">
                    <p class="text-[11px] font-black text-white">{{ page.visits.toLocaleString() }}</p>
                    <p class="text-[9px] text-white/30">{{ page.bounce }}% rebond</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="bg-[#161b27] border border-white/5 rounded-sm p-5">
              <h3 class="text-sm font-black text-white mb-4">Appareils utilisés</h3>
              <!-- Donut chart SVG -->
              <div class="flex items-center gap-6">
                <svg viewBox="0 0 120 120" class="w-28 h-28 flex-shrink-0">
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#274a82" stroke-width="18"
                    :stroke-dasharray="`${devices[0].percent * 2.827} ${282.7}`" stroke-dashoffset="0" transform="rotate(-90 60 60)"/>
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#e60012" stroke-width="18"
                    :stroke-dasharray="`${devices[1].percent * 2.827} ${282.7}`" :stroke-dashoffset="`-${devices[0].percent * 2.827}`" transform="rotate(-90 60 60)"/>
                  <circle cx="60" cy="60" r="45" fill="none" stroke="#374151" stroke-width="18"
                    :stroke-dasharray="`${devices[2].percent * 2.827} ${282.7}`" :stroke-dashoffset="`-${(devices[0].percent + devices[1].percent) * 2.827}`" transform="rotate(-90 60 60)"/>
                  <text x="60" y="55" text-anchor="middle" class="text-xs" font-size="10" fill="white" font-weight="900">Total</text>
                  <text x="60" y="70" text-anchor="middle" font-size="8" fill="rgba(255,255,255,0.4)">visites</text>
                </svg>
                <div class="flex flex-col gap-3">
                  <div v-for="d in devices" :key="d.name" class="flex items-center gap-2">
                    <span :class="['w-2.5 h-2.5 rounded-sm flex-shrink-0', d.color]"></span>
                    <div>
                      <p class="text-[11px] font-black text-white">{{ d.name }}</p>
                      <p class="text-[9px] text-white/30">{{ d.percent }}% · {{ d.sessions.toLocaleString() }} sessions</p>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pays top -->
              <div class="mt-5 pt-4 border-t border-white/5">
                <p class="text-[10px] font-black text-white/30 uppercase tracking-wide mb-3">Top pays</p>
                <div class="flex flex-col gap-2">
                  <div v-for="country in topCountries" :key="country.name" class="flex items-center gap-2">
                    <span class="text-sm">{{ country.flag }}</span>
                    <span class="text-[10px] text-white/60 flex-1">{{ country.name }}</span>
                    <div class="w-16 h-1 bg-white/5 rounded-full overflow-hidden">
                      <div :style="{ width: country.percent + '%' }" class="h-full bg-[#274a82] rounded-full"></div>
                    </div>
                    <span class="text-[10px] font-black text-white">{{ country.percent }}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== FAVORIS ADMIN ===== -->
        <div v-if="activeTab === 'favorites'" class="flex flex-col gap-4">
          <h1 class="text-lg font-black text-white">Produits les plus mis en favoris</h1>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div v-for="(prod, i) in mostFavorited" :key="prod.id"
              class="bg-[#161b27] border border-white/5 rounded-sm overflow-hidden hover:border-white/10 transition-all group">
              <div class="relative h-36 overflow-hidden">
                <img :src="prod.image" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                <div class="absolute top-2 left-2 flex items-center gap-1 bg-black/50 rounded-sm px-1.5 py-0.5">
                  <span :class="['text-[9px] font-black', i === 0 ? 'text-yellow-400' : i === 1 ? 'text-gray-300' : 'text-orange-400']">#{{ i + 1 }}</span>
                </div>
                <div class="absolute top-2 right-2 flex items-center gap-1 bg-[#e60012]/80 rounded-sm px-1.5 py-0.5">
                  <UIcon name="i-heroicons-heart-solid" class="w-2.5 h-2.5 text-white" />
                  <span class="text-[9px] font-black text-white">{{ prod.favorites }}</span>
                </div>
              </div>
              <div class="p-3">
                <p class="text-[11px] font-black text-white truncate">{{ prod.name }}</p>
                <div class="flex items-center justify-between mt-2">
                  <p class="text-xs font-black text-white/60">{{ prod.price.toLocaleString() }} FCFA</p>
                  <div class="flex items-center gap-1">
                    <UIcon name="i-heroicons-shopping-cart" class="w-3 h-3 text-white/20" />
                    <span class="text-[9px] text-white/30">{{ prod.addedToCart }} paniers</span>
                  </div>
                </div>
                <div class="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                  <div :style="{ width: (prod.favorites / mostFavorited[0].favorites * 100) + '%' }" class="h-full bg-[#e60012] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- ===== AVIS ===== -->
        <div v-if="activeTab === 'reviews'" class="flex flex-col gap-4">
          <h1 class="text-lg font-black text-white">Modération des avis</h1>
          <div class="flex flex-col gap-3">
            <div v-for="review in adminReviews" :key="review.id"
              class="bg-[#161b27] border rounded-sm overflow-hidden transition-all"
              :class="review.approved ? 'border-white/5' : 'border-yellow-500/20'"
            >
              <div class="flex items-start gap-4 p-4">
                <div class="w-10 h-10 rounded-sm bg-white/5 overflow-hidden flex-shrink-0">
                  <img :src="review.productImage" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2 flex-wrap mb-1">
                    <p class="text-[11px] font-black text-white">{{ review.author }}</p>
                    <span class="text-white/20">·</span>
                    <p class="text-[10px] text-white/40">{{ review.productName }}</p>
                    <span class="text-white/20">·</span>
                    <p class="text-[9px] text-white/30">{{ review.date }}</p>
                  </div>
                  <div class="flex gap-0.5 mb-2">
                    <UIcon v-for="i in 5" :key="i" name="i-heroicons-star-solid" :class="['w-3 h-3', i <= review.rating ? 'text-yellow-400' : 'text-white/10']" />
                  </div>
                  <p class="text-[11px] text-white/60 leading-relaxed">{{ review.comment }}</p>
                </div>
                <div class="flex flex-col gap-1.5 flex-shrink-0">
                  <button
                    @click="review.approved = true"
                    :class="['w-7 h-7 rounded-sm flex items-center justify-center transition-all text-xs', review.approved ? 'bg-green-500/20 text-green-400' : 'bg-white/5 text-white/30 hover:bg-green-500/20 hover:text-green-400']"
                    title="Approuver"
                  >
                    <UIcon name="i-heroicons-check" class="w-3.5 h-3.5" />
                  </button>
                  <button
                    @click="review.approved = false"
                    :class="['w-7 h-7 rounded-sm flex items-center justify-center transition-all', !review.approved ? 'bg-red-500/20 text-[#e60012]' : 'bg-white/5 text-white/30 hover:bg-red-500/20 hover:text-[#e60012]']"
                    title="Rejeter"
                  >
                    <UIcon name="i-heroicons-x-mark" class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div class="px-4 pb-3 flex items-center gap-2">
                <span :class="['text-[9px] font-black px-2 py-0.5 rounded-sm', review.approved ? 'bg-green-500/10 text-green-400' : 'bg-yellow-500/10 text-yellow-400']">
                  {{ review.approved ? 'Approuvé' : 'En attente de modération' }}
                </span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const sidebarOpen = ref(true)
const activeTab = ref('overview')
const selectedPeriod = ref('7j')
const liveVisitors = ref(47)

const navItems = [
  { id: 'overview',   label: 'Vue d\'ensemble',  icon: 'i-heroicons-squares-2x2',       badge: null },
  { id: 'orders',     label: 'Commandes',         icon: 'i-heroicons-shopping-bag',      badge: '12' },
  { id: 'products',   label: 'Produits',          icon: 'i-heroicons-tag',               badge: null },
  { id: 'stock',      label: 'Stock',             icon: 'i-heroicons-cube',              badge: '3' },
  { id: 'clients',    label: 'Clients',           icon: 'i-heroicons-users',             badge: null },
  { id: 'favorites',  label: 'Favoris',           icon: 'i-heroicons-heart',             badge: null },
  { id: 'reviews',    label: 'Avis',              icon: 'i-heroicons-star',              badge: '5' },
  { id: 'analytics',  label: 'Analytics',         icon: 'i-heroicons-chart-bar',         badge: null },
]

// KPIs
const kpis = ref([
  { label: 'Chiffre d\'affaires', value: '4.2M FCFA', trend: 12.4, icon: 'i-heroicons-currency-dollar', iconBg: 'bg-[#274a82]/20', iconColor: 'text-[#274a82]', accent: 'bg-[#274a82]' },
  { label: 'Commandes totales',   value: '284',        trend: 8.1,  icon: 'i-heroicons-shopping-bag',    iconBg: 'bg-[#e60012]/20',  iconColor: 'text-[#e60012]', accent: 'bg-[#e60012]' },
  { label: 'Visiteurs uniques',   value: '12 847',     trend: 18.4, icon: 'i-heroicons-users',           iconBg: 'bg-green-500/20',  iconColor: 'text-green-400', accent: 'bg-green-500' },
  { label: 'Taux conversion',     value: '3.2%',       trend: -1.2, icon: 'i-heroicons-arrow-trending-up', iconBg: 'bg-yellow-500/20', iconColor: 'text-yellow-400', accent: 'bg-yellow-500' },
])

// Chart data
const chartData = [
  { day: 'Lun', visitors: 89, orders: 42 },
  { day: 'Mar', visitors: 72, orders: 31 },
  { day: 'Mer', visitors: 105, orders: 67 },
  { day: 'Jeu', visitors: 91, orders: 55 },
  { day: 'Ven', visitors: 110, orders: 78 },
  { day: 'Sam', visitors: 85, orders: 44 },
  { day: 'Dim', visitors: 60, orders: 28 },
]

const trafficSources = [
  { name: 'Recherche organique', percent: 42, color: 'bg-[#274a82]' },
  { name: 'Réseaux sociaux',     percent: 28, color: 'bg-[#e60012]' },
  { name: 'Direct',              percent: 18, color: 'bg-green-500' },
  { name: 'Email marketing',     percent: 8,  color: 'bg-yellow-400' },
  { name: 'Référents',           percent: 4,  color: 'bg-purple-400' },
]
const totalVisitors = ref(12847)

// Orders
const orderFilter = ref('Tous')
const orderFilters = [
  { value: 'Tous', label: 'Tous', count: null },
  { value: 'pending', label: 'En attente', count: 5 },
  { value: 'processing', label: 'En cours', count: 4 },
  { value: 'shipped', label: 'Expédié', count: 3 },
  { value: 'delivered', label: 'Livré', count: null },
  { value: 'cancelled', label: 'Annulé', count: null },
]

const recentOrders = ref([
  { id: 'CM9001', customer: 'Jean Mbala',      product: 'iPhone 15 Pro',           date: '28 Fév 2026', total: 820000, status: 'pending',    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=60&q=80' },
  { id: 'CM9000', customer: 'Alice Ngo',       product: 'MacBook Air M2',          date: '28 Fév 2026', total: 920000, status: 'processing', image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=60&q=80' },
  { id: 'CM8999', customer: 'Paul Essomba',    product: 'Samsung S24 Ultra',       date: '27 Fév 2026', total: 485000, status: 'shipped',    image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=60&q=80' },
  { id: 'CM8998', customer: 'Marie Atangana',  product: 'AirPods Pro 2',           date: '27 Fév 2026', total: 185000, status: 'delivered',  image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=60&q=80' },
  { id: 'CM8997', customer: 'Eric Biyong',     product: 'PS5 Standard',            date: '26 Fév 2026', total: 320000, status: 'cancelled',  image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=60&q=80' },
  { id: 'CM8996', customer: 'Sophie Kotto',    product: 'Dell XPS 15',             date: '26 Fév 2026', total: 1100000,status: 'pending',    image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=60&q=80' },
  { id: 'CM8995', customer: 'David Owona',     product: 'JBL Charge 5',            date: '25 Fév 2026', total: 75000,  status: 'delivered',  image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=60&q=80' },
])

const filteredOrders = computed(() => {
  if (orderFilter.value === 'Tous') return recentOrders.value
  return recentOrders.value.filter(o => o.status === orderFilter.value)
})

function updateOrderStatus(id, status) {
  const order = recentOrders.value.find(o => o.id === id)
  if (order) order.status = status
}

function statusStyle(status) {
  const map = {
    delivered:  { label: 'Livré',      class: 'bg-green-500/20 text-green-400' },
    shipped:    { label: 'Expédié',    class: 'bg-blue-500/20 text-blue-400' },
    processing: { label: 'En cours',   class: 'bg-yellow-500/20 text-yellow-400' },
    pending:    { label: 'En attente', class: 'bg-white/10 text-white/50' },
    cancelled:  { label: 'Annulé',    class: 'bg-red-500/20 text-[#e60012]' },
  }
  return map[status] || { label: status, class: 'bg-white/10 text-white/40' }
}

// Products
const productSearch = ref('')
const productCategoryFilter = ref('')
const productStatusFilter = ref('')
const productCategories = ['Smartphones', 'Informatique', 'Audio', 'Gaming', 'TV', 'Accessoires']

const products = ref([
  { id: 1, name: 'iPhone 15 Pro Max 256Go', brand: 'Apple',   category: 'Smartphones', price: 820000, oldPrice: 920000, stock: 8,  status: 'published', sku: 'APL-IP15PM', image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=60&q=80' },
  { id: 2, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Smartphones', price: 485000, oldPrice: null,   stock: 3,  status: 'published', sku: 'SAM-S24U',   image: 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=60&q=80' },
  { id: 3, name: 'MacBook Air M2 13"',       brand: 'Apple',   category: 'Informatique', price: 920000, oldPrice: null,   stock: 5,  status: 'published', sku: 'APL-MBA-M2',  image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=60&q=80' },
  { id: 4, name: 'Sony WH-1000XM5',          brand: 'Sony',    category: 'Audio',        price: 195000, oldPrice: 230000, stock: 0,  status: 'out_of_stock', sku: 'SNY-WH5',  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=60&q=80' },
  { id: 5, name: 'PS5 Edition Standard',     brand: 'Sony',    category: 'Gaming',       price: 320000, oldPrice: 380000, stock: 2,  status: 'published', sku: 'SNY-PS5-STD', image: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=60&q=80' },
  { id: 6, name: 'Dell XPS 15 i7 32Go',      brand: 'Dell',    category: 'Informatique', price: 1100000,oldPrice: null,   stock: 4,  status: 'published', sku: 'DLL-XPS15',   image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=60&q=80' },
  { id: 7, name: 'AirPods Pro 2ème gen',     brand: 'Apple',   category: 'Audio',        price: 185000, oldPrice: 210000, stock: 12, status: 'published', sku: 'APL-APP2',    image: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=60&q=80' },
  { id: 8, name: 'iPad Air 5 WiFi 64Go',     brand: 'Apple',   category: 'Accessoires',  price: 380000, oldPrice: null,   stock: 0,  status: 'draft',     sku: 'APL-IPAD5',   image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=60&q=80' },
])

const filteredProducts = computed(() => {
  return products.value.filter(p => {
    const matchSearch = !productSearch.value || p.name.toLowerCase().includes(productSearch.value.toLowerCase())
    const matchCat = !productCategoryFilter.value || p.category === productCategoryFilter.value
    const matchStatus = !productStatusFilter.value || p.status === productStatusFilter.value
    return matchSearch && matchCat && matchStatus
  })
})

const lowStockProducts = computed(() => products.value.filter(p => p.stock > 0 && p.stock <= 5))
const outOfStockProducts = computed(() => products.value.filter(p => p.stock === 0))
const topProducts = computed(() => [...products.value].sort((a, b) => b.price - a.price).slice(0, 5).map((p, i) => ({ ...p, sales: [48, 35, 29, 22, 17][i], revenue: p.price * [48, 35, 29, 22, 17][i] })))

function toggleProductStatus(prod) {
  const cycle = { published: 'draft', draft: 'published', out_of_stock: 'published' }
  prod.status = cycle[prod.status] || 'published'
}

// Clients
const clientSearch = ref('')
const clients = ref([
  { id: 1, name: 'Jean Mbala',     email: 'jean@gmail.com',   joinDate: '12 Jan 2025', orders: 8,  spent: 1850000, blocked: false },
  { id: 2, name: 'Alice Ngo',      email: 'alice@gmail.com',  joinDate: '25 Fév 2025', orders: 5,  spent: 920000,  blocked: false },
  { id: 3, name: 'Paul Essomba',   email: 'paul@yahoo.com',   joinDate: '01 Mar 2025', orders: 12, spent: 3200000, blocked: false },
  { id: 4, name: 'Marie Atangana', email: 'marie@gmail.com',  joinDate: '14 Mar 2025', orders: 2,  spent: 370000,  blocked: false },
  { id: 5, name: 'Eric Biyong',    email: 'eric@outlook.com', joinDate: '20 Avr 2025', orders: 0,  spent: 0,       blocked: true  },
  { id: 6, name: 'Sophie Kotto',   email: 'sophie@gmail.com', joinDate: '05 Mai 2025', orders: 7,  spent: 2100000, blocked: false },
  { id: 7, name: 'David Owona',    email: 'david@gmail.com',  joinDate: '18 Juin 2025',orders: 3,  spent: 560000,  blocked: false },
])

const filteredClients = computed(() => {
  if (!clientSearch.value) return clients.value
  return clients.value.filter(c =>
    c.name.toLowerCase().includes(clientSearch.value.toLowerCase()) ||
    c.email.toLowerCase().includes(clientSearch.value.toLowerCase())
  )
})

const clientStats = computed(() => [
  { label: 'Total clients', value: clients.value.length },
  { label: 'Actifs ce mois', value: clients.value.filter(c => !c.blocked && c.orders > 0).length },
  { label: 'Bloqués', value: clients.value.filter(c => c.blocked).length },
  { label: 'Nouveaux (7j)', value: 3 },
])

function toggleBlock(client) {
  client.blocked = !client.blocked
}

// Analytics
const analyticsStats = [
  { label: 'Sessions totales',  value: '18 432', change: '+18.4%', up: true,  icon: 'i-heroicons-users' },
  { label: 'Pages vues',        value: '74 829', change: '+12.1%', up: true,  icon: 'i-heroicons-eye' },
  { label: 'Taux de rebond',    value: '38.2%',  change: '-3.4%',  up: true,  icon: 'i-heroicons-arrow-uturn-left' },
  { label: 'Durée moy. session',value: '4m 12s', change: '+0.8%',  up: true,  icon: 'i-heroicons-clock' },
]

const totalMonthVisitors = ref(18432)

// Generate 30-day visitor data for line chart
const dailyVisitors = Array.from({ length: 30 }, (_, i) => Math.floor(400 + Math.random() * 400 + Math.sin(i / 3) * 150))
const maxV = Math.max(...dailyVisitors)

const visitorLinePath = computed(() => {
  const pts = dailyVisitors.map((v, i) => `${(i / 29) * 900},${160 - (v / maxV) * 140}`)
  return 'M' + pts.join(' L')
})

const visitorAreaPath = computed(() => {
  const pts = dailyVisitors.map((v, i) => `${(i / 29) * 900},${160 - (v / maxV) * 140}`)
  return 'M0,160 L' + pts.join(' L') + ' L900,160 Z'
})

const conversionLinePath = computed(() => {
  const pts = dailyVisitors.map((v, i) => `${(i / 29) * 900},${160 - (v / maxV * 0.6) * 140}`)
  return 'M' + pts.join(' L')
})

const monthLabels = ['1', '5', '10', '15', '20', '25', '30']

const trafficSourcesAll = trafficSources

const topPages = [
  { path: '/accueil',               visits: 8420, bounce: 28 },
  { path: '/produits/smartphones',  visits: 5241, bounce: 35 },
  { path: '/produits/informatique', visits: 3892, bounce: 42 },
  { path: '/panier',                visits: 2104, bounce: 18 },
  { path: '/produits/gaming',       visits: 1847, bounce: 51 },
  { path: '/checkout',              visits: 1203, bounce: 12 },
]

const devices = [
  { name: 'Mobile',  percent: 62, sessions: 11428, color: 'bg-[#274a82]' },
  { name: 'Desktop', percent: 30, sessions: 5530,  color: 'bg-[#e60012]' },
  { name: 'Tablette',percent: 8,  sessions: 1474,  color: 'bg-gray-600' },
]

const topCountries = [
  { name: 'Cameroun',       flag: '🇨🇲', percent: 68 },
  { name: 'Côte d\'Ivoire', flag: '🇨🇮', percent: 12 },
  { name: 'Sénégal',        flag: '🇸🇳', percent: 8  },
  { name: 'France',         flag: '🇫🇷', percent: 7  },
  { name: 'Gabon',          flag: '🇬🇦', percent: 5  },
]

// Favoris
const mostFavorited = products.value.slice(0, 6).map((p, i) => ({
  ...p,
  favorites: [284, 201, 178, 145, 112, 89][i],
  addedToCart: [156, 98, 134, 72, 88, 45][i],
}))

// Admin Reviews
const adminReviews = ref([
  { id: 1, author: 'Jean Mbala',     productName: 'iPhone 15 Pro Max', productImage: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=60&q=80', rating: 5, date: '27 Fév 2026', comment: 'Excellent produit, livraison rapide et emballage parfait. Je recommande ce site à tous !', approved: true },
  { id: 2, author: 'Marie Atangana', productName: 'AirPods Pro 2',     productImage: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=60&q=80', rating: 4, date: '26 Fév 2026', comment: 'Bon produit mais la livraison a pris plus de temps que prévu. Le service client a bien géré.', approved: false },
  { id: 3, author: 'Paul Essomba',   productName: 'PS5 Standard',      productImage: 'https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=60&q=80', rating: 5, date: '25 Fév 2026', comment: 'Console reçue en parfait état, le prix est imbattable au Cameroun !', approved: false },
  { id: 4, author: 'Alice Ngo',      productName: 'MacBook Air M2',    productImage: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=60&q=80', rating: 3, date: '24 Fév 2026', comment: 'Le produit est bon mais j\'aurais souhaité plus d\'informations sur les garanties.', approved: true },
])
</script>