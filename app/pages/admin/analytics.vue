<script setup lang="ts">
const { requireAdmin } = useAuth()
requireAdmin()
import { ref, computed } from 'vue'

useHead({ title: 'BRC Market - Analytiques' })

// ── Period selector ───────────────────────────────────────────────────────
const period = ref<'7j' | '30j' | '90j'>('7j')

// ── Connexions par jour (mock) ────────────────────────────────────────────
const data7j = [
  { day: 'Lun', date: '02/12', connections: 34, newUsers: 8,  returning: 26 },
  { day: 'Mar', date: '03/12', connections: 51, newUsers: 14, returning: 37 },
  { day: 'Mer', date: '04/12', connections: 42, newUsers: 10, returning: 32 },
  { day: 'Jeu', date: '05/12', connections: 68, newUsers: 19, returning: 49 },
  { day: 'Ven', date: '06/12', connections: 79, newUsers: 22, returning: 57 },
  { day: 'Sam', date: '07/12', connections: 95, newUsers: 31, returning: 64 },
  { day: 'Dim', date: '08/12', connections: 58, newUsers: 12, returning: 46 },
]

const data30j = Array.from({ length: 30 }, (_, i) => ({
  day: `J${i + 1}`,
  date: `${String(i + 1).padStart(2, '0')}/12`,
  connections: Math.floor(30 + Math.random() * 80),
  newUsers:    Math.floor(5 + Math.random() * 25),
  returning:   Math.floor(20 + Math.random() * 55),
}))

const chartData = computed(() => period.value === '7j' ? data7j : data30j.slice(0, period.value === '30j' ? 30 : 90))

const maxVal = computed(() => Math.max(...chartData.value.map(d => d.connections)) * 1.15)

const barHeight = (val: number) => `${(val / maxVal.value) * 100}%`

// ── Stats cards ────────────────────────────────────────────────────────────
const totalConnections = computed(() => chartData.value.reduce((s, d) => s + d.connections, 0))
const totalNew         = computed(() => chartData.value.reduce((s, d) => s + d.newUsers, 0))
const totalReturning   = computed(() => chartData.value.reduce((s, d) => s + d.returning, 0))
const avgPerDay        = computed(() => Math.round(totalConnections.value / chartData.value.length))
const peakDay          = computed(() => chartData.value.reduce((a, b) => a.connections > b.connections ? a : b))

// ── Online users (mock realtime) ──────────────────────────────────────────
const onlineNow = ref(12)
setInterval(() => { onlineNow.value = Math.max(5, onlineNow.value + Math.floor(Math.random() * 5) - 2) }, 3000)

// ── Recent sessions ────────────────────────────────────────────────────────
const sessions = ref([
  { id: 1, name: 'Jean Mbala',    email: 'jean@test.cm',   role: 'client',      device: 'Chrome / Windows',  location: 'Douala',   time: 'il y a 2 min',  online: true  },
  { id: 2, name: 'Marie Nguema',  email: 'marie@test.cm',  role: 'client',      device: 'Safari / iPhone',   location: 'Yaoundé',  time: 'il y a 5 min',  online: true  },
  { id: 3, name: 'Paul Biya',     email: 'paul@test.cm',   role: 'admin',       device: 'Firefox / Linux',   location: 'Douala',   time: 'il y a 12 min', online: true  },
  { id: 4, name: 'Alice Nkomo',   email: 'alice@test.cm',  role: 'client',      device: 'Chrome / Android',  location: 'Bafoussam',time: 'il y a 28 min', online: false },
  { id: 5, name: 'David Tchamba', email: 'david@test.cm',  role: 'client',      device: 'Edge / Windows',    location: 'Douala',   time: 'il y a 1h',     online: false },
  { id: 6, name: 'Sophie Ekwalla',email: 'sophie@brc.cm',  role: 'super_admin', device: 'Chrome / Mac',      location: 'Douala',   time: 'il y a 1h 30',  online: false },
])

// ── Device breakdown ──────────────────────────────────────────────────────
const devices = [
  { label: 'Mobile',  percent: 54, color: 'bg-[#274a82]' },
  { label: 'Desktop', percent: 35, color: 'bg-[#e60012]' },
  { label: 'Tablette',percent: 11, color: 'bg-gray-300' },
]

// ── Top cities ────────────────────────────────────────────────────────────
const cities = [
  { name: 'Douala',    count: 187, percent: 58 },
  { name: 'Yaoundé',   count: 94,  percent: 29 },
  { name: 'Bafoussam', count: 28,  percent: 9  },
  { name: 'Garoua',    count: 13,  percent: 4  },
]

const roleConfig: Record<string, { label: string; color: string }> = {
  client:      { label: 'Client',      color: 'bg-gray-100 text-gray-600' },
  admin:       { label: 'Admin',       color: 'bg-[#274a82]/10 text-[#274a82]' },
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
}

const initials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase()
</script>

<template>
  <div class="space-y-6">

    <!-- ── Page header ── -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-black text-gray-900">Analytiques</h1>
        <p class="text-gray-400 text-sm mt-0.5">Suivi des connexions et activité utilisateurs</p>
      </div>

      <!-- Period selector -->
      <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm">
        <button
          v-for="p in (['7j', '30j', '90j'] as const)" :key="p"
          @click="period = p"
          class="px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
          :class="period === p ? 'bg-[#274a82] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'"
        >
          {{ p === '7j' ? '7 jours' : p === '30j' ? '30 jours' : '90 jours' }}
        </button>
      </div>
    </div>

    <!-- ── KPI cards ── -->
    <div class="grid grid-cols-2 lg:grid-cols-5 gap-4">

      <!-- Online now — realtime -->
      <div class="bg-[#274a82] rounded-2xl p-5 col-span-2 lg:col-span-1 flex flex-col justify-between">
        <div class="flex items-center justify-between mb-3">
          <p class="text-white/70 text-xs font-bold uppercase tracking-wider">En ligne</p>
          <span class="flex items-center gap-1.5">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span class="text-green-400 text-[10px] font-bold">LIVE</span>
          </span>
        </div>
        <p class="text-4xl font-black text-white">{{ onlineNow }}</p>
        <p class="text-white/50 text-xs mt-1">utilisateurs actifs</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-4 h-4 text-[#274a82]" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ totalConnections.toLocaleString() }}</p>
        <p class="text-xs text-gray-400 mt-0.5">Connexions totales</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 rounded-xl bg-green-50 flex items-center justify-center">
            <UIcon name="i-heroicons-user-plus" class="w-4 h-4 text-green-600" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ totalNew }}</p>
        <p class="text-xs text-gray-400 mt-0.5">Nouveaux utilisateurs</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 rounded-xl bg-orange-50 flex items-center justify-center">
            <UIcon name="i-heroicons-arrow-path" class="w-4 h-4 text-orange-500" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ avgPerDay }}</p>
        <p class="text-xs text-gray-400 mt-0.5">Moy. par jour</p>
      </div>

      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
            <UIcon name="i-heroicons-trophy" class="w-4 h-4 text-[#e60012]" />
          </div>
        </div>
        <p class="text-2xl font-black text-gray-900">{{ peakDay.connections }}</p>
        <p class="text-xs text-gray-400 mt-0.5">Pic — {{ peakDay.day }} {{ peakDay.date }}</p>
      </div>

    </div>

    <!-- ── Bar chart + side stats ── -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">

      <!-- Bar chart -->
      <div class="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div class="flex items-center justify-between mb-6">
          <div>
            <h2 class="font-black text-gray-900">Connexions par jour</h2>
            <p class="text-xs text-gray-400 mt-0.5">Nouveaux vs utilisateurs de retour</p>
          </div>
          <!-- Legend -->
          <div class="flex items-center gap-4 text-xs font-semibold">
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-sm bg-[#274a82]" />
              Nouveaux
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-3 h-3 rounded-sm bg-[#274a82]/20" />
              Retour
            </span>
          </div>
        </div>

        <!-- Chart -->
        <div class="flex items-end gap-2 h-48">
          <div
            v-for="d in chartData" :key="d.date"
            class="flex-1 flex flex-col items-center gap-1 group"
          >
            <!-- Tooltip -->
            <div class="opacity-0 group-hover:opacity-100 transition-all absolute -translate-y-full bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-lg pointer-events-none whitespace-nowrap z-10">
              {{ d.connections }} connexions
            </div>

            <!-- Stacked bar -->
            <div class="w-full relative flex flex-col justify-end" :style="`height: 100%`">
              <div class="w-full rounded-t-lg overflow-hidden flex flex-col-reverse gap-0.5 transition-all" :style="`height: ${barHeight(d.connections)}`">
                <!-- Returning (bottom) -->
                <div
                  class="w-full bg-[#274a82]/20 transition-all"
                  :style="`height: ${(d.returning / d.connections) * 100}%`"
                />
                <!-- New users (top) -->
                <div
                  class="w-full bg-[#274a82] transition-all"
                  :style="`height: ${(d.newUsers / d.connections) * 100}%`"
                />
              </div>
            </div>

            <!-- Label -->
            <p class="text-[10px] text-gray-400 font-semibold">{{ d.day }}</p>
          </div>
        </div>

        <!-- Y-axis hints -->
        <div class="flex justify-between mt-3 border-t border-gray-50 pt-3">
          <span class="text-[10px] text-gray-300">0</span>
          <span class="text-[10px] text-gray-300">{{ Math.round(maxVal / 2) }}</span>
          <span class="text-[10px] text-gray-300">{{ Math.round(maxVal) }}</span>
        </div>
      </div>

      <!-- Devices + Cities -->
      <div class="flex flex-col gap-5">

        <!-- Devices -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 class="font-black text-gray-900 mb-4 text-sm">Appareils utilisés</h2>
          <div class="space-y-3">
            <div v-for="d in devices" :key="d.label">
              <div class="flex justify-between text-xs font-semibold mb-1">
                <span class="text-gray-600">{{ d.label }}</span>
                <span class="text-gray-900">{{ d.percent }}%</span>
              </div>
              <div class="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div class="h-full rounded-full transition-all" :class="d.color" :style="`width: ${d.percent}%`" />
              </div>
            </div>
          </div>
        </div>

        <!-- Top cities -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 class="font-black text-gray-900 mb-4 text-sm">Top villes</h2>
          <div class="space-y-3">
            <div v-for="(city, i) in cities" :key="city.name" class="flex items-center gap-3">
              <span class="text-xs font-black text-gray-300 w-4">{{ i + 1 }}</span>
              <div class="flex-1">
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-gray-700">{{ city.name }}</span>
                  <span class="text-gray-400">{{ city.count }}</span>
                </div>
                <div class="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full bg-[#e60012] rounded-full" :style="`width: ${city.percent}%`" />
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ── Retention donut ── -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

      <!-- Retention card -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-black text-gray-900 mb-1 text-sm">Taux de rétention</h2>
        <p class="text-xs text-gray-400 mb-5">Utilisateurs qui reviennent</p>

        <!-- Simple donut via SVG -->
        <div class="flex items-center justify-center mb-5">
          <div class="relative w-32 h-32">
            <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" stroke-width="3.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#274a82" stroke-width="3.5"
                stroke-dasharray="74 26"
                stroke-linecap="round"
              />
              <circle
                cx="18" cy="18" r="15.9" fill="none"
                stroke="#e60012" stroke-width="3.5"
                stroke-dasharray="26 74"
                stroke-dashoffset="-74"
                stroke-linecap="round"
              />
            </svg>
            <div class="absolute inset-0 flex flex-col items-center justify-center">
              <p class="text-2xl font-black text-gray-900">74%</p>
              <p class="text-[10px] text-gray-400">retour</p>
            </div>
          </div>
        </div>

        <div class="space-y-2">
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-[#274a82]" /> Utilisateurs de retour</span>
            <span class="font-bold text-gray-800">{{ totalReturning }}</span>
          </div>
          <div class="flex items-center justify-between text-xs">
            <span class="flex items-center gap-2"><span class="w-3 h-3 rounded-sm bg-[#e60012]" /> Nouveaux</span>
            <span class="font-bold text-gray-800">{{ totalNew }}</span>
          </div>
        </div>
      </div>

      <!-- Heures de pointe -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 class="font-black text-gray-900 mb-1 text-sm">Heures de pointe</h2>
        <p class="text-xs text-gray-400 mb-5">Activité moyenne sur 24h</p>
        <div class="flex items-end gap-1 h-24">
          <div
            v-for="h in [2,1,1,0,0,0,1,3,7,9,8,7,6,8,9,10,9,8,7,6,5,4,3,2]"
            :key="h"
            class="flex-1 rounded-t-sm transition-all"
            :class="h >= 9 ? 'bg-[#e60012]' : h >= 6 ? 'bg-[#274a82]' : 'bg-gray-200'"
            :style="`height: ${(h / 10) * 100}%`"
          />
        </div>
        <div class="flex justify-between mt-2 text-[10px] text-gray-300 font-medium">
          <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
        </div>
        <div class="flex items-center gap-3 mt-4 text-xs font-semibold">
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-[#e60012]" /> Très actif</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-[#274a82]" /> Actif</span>
          <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-sm bg-gray-200" /> Calme</span>
        </div>
      </div>

      <!-- Quick stats -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4">
        <h2 class="font-black text-gray-900 text-sm">Résumé période</h2>
        <div class="space-y-3">
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span class="text-xs text-gray-500 font-medium">Total connexions</span>
            <span class="font-black text-gray-900">{{ totalConnections.toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span class="text-xs text-gray-500 font-medium">Utilisateurs uniques</span>
            <span class="font-black text-gray-900">{{ (totalNew + Math.round(totalReturning * 0.6)).toLocaleString() }}</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span class="text-xs text-gray-500 font-medium">Taux de rétention</span>
            <span class="font-black text-green-600">74%</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span class="text-xs text-gray-500 font-medium">Heure de pointe</span>
            <span class="font-black text-[#274a82]">15h – 17h</span>
          </div>
          <div class="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
            <span class="text-xs text-gray-500 font-medium">Jour le + actif</span>
            <span class="font-black text-[#e60012]">{{ peakDay.day }} ({{ peakDay.connections }})</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ── Recent sessions ── -->
    <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-50">
        <div>
          <h2 class="font-black text-gray-900">Sessions récentes</h2>
          <p class="text-xs text-gray-400 mt-0.5">Dernières connexions utilisateurs</p>
        </div>
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          <span class="text-xs font-bold text-green-600">{{ onlineNow }} en ligne</span>
        </div>
      </div>

      <div class="divide-y divide-gray-50">
        <div
          v-for="session in sessions" :key="session.id"
          class="flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/50 transition"
        >
          <!-- Avatar + online dot -->
          <div class="relative flex-shrink-0">
            <div class="w-9 h-9 rounded-xl bg-[#274a82] flex items-center justify-center">
              <span class="text-white text-xs font-black">{{ initials(session.name) }}</span>
            </div>
            <span
              class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
              :class="session.online ? 'bg-green-400' : 'bg-gray-300'"
            />
          </div>

          <!-- User info -->
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2">
              <p class="text-sm font-semibold text-gray-800">{{ session.name }}</p>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold" :class="roleConfig[session.role].color">
                {{ roleConfig[session.role].label }}
              </span>
            </div>
            <p class="text-xs text-gray-400">{{ session.email }}</p>
          </div>

          <!-- Device -->
          <div class="hidden sm:block text-xs text-gray-400 min-w-0">
            <div class="flex items-center gap-1.5">
              <UIcon name="i-heroicons-computer-desktop" class="w-3.5 h-3.5" />
              {{ session.device }}
            </div>
          </div>

          <!-- Location -->
          <div class="hidden md:flex items-center gap-1.5 text-xs text-gray-400">
            <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
            {{ session.location }}
          </div>

          <!-- Time + status -->
          <div class="text-right flex-shrink-0">
            <p class="text-xs font-semibold" :class="session.online ? 'text-green-600' : 'text-gray-400'">
              {{ session.online ? 'En ligne' : session.time }}
            </p>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>