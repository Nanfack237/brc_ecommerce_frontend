<script setup lang="ts">
const { requireAdmin } = useAuth()
requireAdmin()

import { ref, computed, watch, onMounted, onUnmounted } from 'vue'

useHead({ title: 'BRC Market - Analytiques' })

const config      = useRuntimeConfig()
const API         = config.public.apiBase
const token       = useCookie('auth_token')
const authHeaders = computed(() => ({ Authorization: `Bearer ${token.value}` }))

interface DayData {
  day: string
  date: string
  connections: number
  newUsers: number
  returning: number
}
interface Session {
  id: number
  name: string
  email: string
  role: string
  device: string
  location: string
  time: string
  online: boolean
}
interface Device {
  label: string
  percent: number
  color: string
}
interface City {
  name: string
  count: number
  percent: number
}
interface Stats {
  total_users: number
  online_now: number
  total_connections: number
  new_users: number
  returning_users: number
  avg_per_day: number
}

const period  = ref<'7j' | '30j' | '90j'>('7j')
const daysMap = { '7j': 7, '30j': 30, '90j': 90 }

const loading    = ref(true)
const stats      = ref<Stats | null>(null)
const chartData  = ref<DayData[]>([])
const sessions   = ref<Session[]>([])
const devices    = ref<Device[]>([])
const cities     = ref<City[]>([])
const hourlyData = ref<number[]>(Array(24).fill(0))

async function fetchAll() {
  loading.value = true
  const days = daysMap[period.value]
  const opts = { baseURL: API, headers: authHeaders.value }

  try {
    const [statsRes, dailyRes, sessionsRes, devicesRes, citiesRes, hourlyRes] = await Promise.all([
      $fetch<Stats>(`/admin/analytics/stats?days=${days}`, opts),
      $fetch<DayData[]>(`/admin/analytics/daily?days=${days}`, opts),
      $fetch<Session[]>('/admin/analytics/sessions', opts),
      $fetch<Device[]>('/admin/analytics/devices', opts),
      $fetch<City[]>('/admin/analytics/cities', opts),
      $fetch<number[]>('/admin/analytics/hourly', opts),
    ])

    stats.value      = statsRes
    chartData.value  = dailyRes
    sessions.value   = sessionsRes
    hourlyData.value = hourlyRes
    devices.value    = devicesRes.length ? devicesRes : [
      { label: 'Mobile',   percent: 0, color: 'bg-[#274a82]' },
      { label: 'Desktop',  percent: 0, color: 'bg-[#e60012]' },
      { label: 'Tablette', percent: 0, color: 'bg-gray-300'  },
    ]
    cities.value = citiesRes
  } catch (err) {
    console.error('Analytics error:', err)
  } finally {
    loading.value = false
  }
}

let interval: ReturnType<typeof setInterval>
onMounted(() => { fetchAll(); interval = setInterval(fetchAll, 30_000) })
onUnmounted(() => clearInterval(interval))
watch(period, fetchAll)

const onlineNow        = computed(() => stats.value?.online_now ?? 0)
const totalConnections = computed(() => stats.value?.total_connections ?? 0)
const totalNew         = computed(() => stats.value?.new_users ?? 0)
const totalReturning   = computed(() => stats.value?.returning_users ?? 0)
const avgPerDay        = computed(() => stats.value?.avg_per_day ?? 0)

const peakDay = computed(() =>
  chartData.value.length
    ? chartData.value.reduce((a, b) => a.connections > b.connections ? a : b)
    : { day: '–', date: '', connections: 0, newUsers: 0, returning: 0 }
)

const maxVal = computed(() => {
  if (!chartData.value.length) return 1
  return Math.max(...chartData.value.map(d => d.connections), 1) * 1.15
})

const barHeight = (val: number) => `${(val / maxVal.value) * 100}%`

const retentionRate = computed(() => {
  const total = totalNew.value + totalReturning.value
  return total > 0 ? Math.round((totalReturning.value / total) * 100) : 0
})

const retentionDash = computed(() => `${retentionRate.value} ${100 - retentionRate.value}`)
const newDash       = computed(() => `${100 - retentionRate.value} ${retentionRate.value}`)
const newDashOffset = computed(() => `-${retentionRate.value}`)

const hourlyMax     = computed(() => Math.max(...hourlyData.value, 1))
const peakHourIdx   = computed(() => hourlyData.value.indexOf(Math.max(...hourlyData.value)))
const peakHourLabel = computed(() => { const h = peakHourIdx.value; return `${h}h – ${h + 1}h` })
const uniqueUsers   = computed(() => totalNew.value + Math.round(totalReturning.value * 0.6))

const chartDataDisplay = computed(() => {
  if (period.value === '90j') return chartData.value.filter((_, i) => i % 3 === 0)
  if (period.value === '30j') return chartData.value.filter((_, i) => i % 2 === 0)
  return chartData.value
})

const roleConfig: Record<string, { label: string; color: string }> = {
  client:      { label: 'Client',      color: 'bg-gray-100 text-gray-600' },
  admin:       { label: 'Admin',       color: 'bg-[#274a82]/10 text-[#274a82]' },
  super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-700' },
  livreur:     { label: 'Livreur',     color: 'bg-orange-100 text-orange-600' },
  user:        { label: 'Staff',       color: 'bg-blue-100 text-blue-600' },
}

const hourColor = (val: number) => {
  const ratio = val / hourlyMax.value
  if (ratio >= 0.85) return 'bg-[#e60012]'
  if (ratio >= 0.5)  return 'bg-[#274a82]'
  return 'bg-gray-200'
}

const initials = (name: string) =>
  name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
</script>

<template>
  <div class="space-y-4 sm:space-y-6">

    <!-- ── Page header ── -->
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-xl sm:text-2xl font-black text-gray-900">Analytiques</h1>
        <p class="text-gray-400 text-xs sm:text-sm mt-0.5">Suivi des connexions et activité utilisateurs</p>
      </div>
      <div class="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 shadow-sm self-start sm:self-auto">
        <button
          v-for="p in (['7j', '30j', '90j'] as const)" :key="p"
          @click="period = p"
          class="flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-lg text-xs font-bold transition-all"
          :class="period === p ? 'bg-[#274a82] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800'"
        >
          {{ p === '7j' ? '7 jours' : p === '30j' ? '30 jours' : '90 jours' }}
        </button>
      </div>
    </div>

    <!-- ── Skeleton ── -->
    <template v-if="loading">
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div v-for="i in 5" :key="i" class="h-24 sm:h-28 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
      <div class="h-56 sm:h-72 bg-gray-100 rounded-2xl animate-pulse" />
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="h-40 bg-gray-100 rounded-2xl animate-pulse" />
        <div class="h-40 bg-gray-100 rounded-2xl animate-pulse" />
      </div>
    </template>

    <template v-else>

      <!-- ── KPI cards ── -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">

        <!-- Online now -->
        <div class="bg-[#274a82] rounded-2xl p-4 sm:p-5 col-span-2 sm:col-span-1 flex flex-row sm:flex-col items-center sm:items-start justify-between sm:justify-between gap-3">
          <div class="flex flex-col">
            <p class="text-white/70 text-[10px] font-bold uppercase tracking-wider mb-1">En ligne</p>
            <p class="text-3xl sm:text-4xl font-black text-white leading-none">{{ onlineNow }}</p>
            <p class="text-white/50 text-[10px] mt-1">utilisateurs actifs</p>
          </div>
          <span class="flex items-center gap-1.5 flex-shrink-0">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span class="text-green-400 text-[10px] font-bold">LIVE</span>
          </span>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-blue-50 flex items-center justify-center mb-2 sm:mb-3">
            <UIcon name="i-heroicons-arrow-right-on-rectangle" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#274a82]" />
          </div>
          <p class="text-xl sm:text-2xl font-black text-gray-900">{{ totalConnections.toLocaleString() }}</p>
          <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5">Connexions totales</p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-green-50 flex items-center justify-center mb-2 sm:mb-3">
            <UIcon name="i-heroicons-user-plus" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
          </div>
          <p class="text-xl sm:text-2xl font-black text-gray-900">{{ totalNew }}</p>
          <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5">Nouveaux utilisateurs</p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-orange-50 flex items-center justify-center mb-2 sm:mb-3">
            <UIcon name="i-heroicons-arrow-path" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
          </div>
          <p class="text-xl sm:text-2xl font-black text-gray-900">{{ avgPerDay }}</p>
          <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5">Moy. par jour</p>
        </div>

        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <div class="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-red-50 flex items-center justify-center mb-2 sm:mb-3">
            <UIcon name="i-heroicons-trophy" class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#e60012]" />
          </div>
          <p class="text-xl sm:text-2xl font-black text-gray-900">{{ peakDay.connections }}</p>
          <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5 truncate">Pic — {{ peakDay.day }} {{ peakDay.date }}</p>
        </div>

      </div>

      <!-- ── Bar chart + Devices + Cities ── -->
      <div class="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">

        <!-- Bar chart -->
        <div class="xl:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <div class="flex items-start sm:items-center justify-between mb-4 sm:mb-6 gap-2">
            <div>
              <h2 class="font-black text-gray-900 text-sm sm:text-base">Connexions par jour</h2>
              <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5">Nouveaux vs utilisateurs de retour</p>
            </div>
            <div class="flex items-center gap-2 sm:gap-4 text-[10px] sm:text-xs font-semibold flex-shrink-0">
              <span class="flex items-center gap-1">
                <span class="w-2.5 h-2.5 rounded-sm bg-[#274a82]" /> Nouveaux
              </span>
              <span class="flex items-center gap-1">
                <span class="w-2.5 h-2.5 rounded-sm bg-[#274a82]/20" /> Retour
              </span>
            </div>
          </div>

          <div v-if="!chartData.length" class="flex flex-col items-center justify-center h-36 sm:h-48 text-gray-300">
            <UIcon name="i-heroicons-chart-bar" class="w-8 h-8 mb-2" />
            <p class="text-xs font-semibold">Aucune donnée pour cette période</p>
          </div>

          <div v-else class="flex items-end gap-1 sm:gap-2 h-36 sm:h-48">
            <div
              v-for="d in chartDataDisplay"
              :key="d.date"
              class="flex-1 flex flex-col items-center gap-1"
            >

              <!-- 🔴 VALEUR VISIBLE -->
              <p class="text-[9px] font-bold text-gray-700">
                {{ d.connections }}
              </p>

              <div class="w-full flex flex-col justify-end" style="height: 100%">
                <div
                  class="w-full rounded-t overflow-hidden flex flex-col-reverse"
                  :style="`height: ${barHeight(d.connections)}; min-height: 6px`"
                >
                  <div
                    class="w-full bg-[#274a82]/20"
                    :style="`height: ${d.connections ? (d.returning / d.connections) * 100 : 0}%`"
                  />
                  <div
                    class="w-full bg-[#274a82]"
                    :style="`height: ${d.connections ? (d.newUsers / d.connections) * 100 : 0}%`"
                  />
                </div>
              </div>

              <p class="text-[10px] text-gray-400 font-semibold">
                {{ d.day }}
              </p>
            </div>
          </div>

          <div class="flex justify-between mt-2 sm:mt-3 border-t border-gray-50 pt-2 sm:pt-3">
            <span class="text-[9px] sm:text-[10px] text-gray-300">0</span>
            <span class="text-[9px] sm:text-[10px] text-gray-300">{{ Math.round(maxVal / 2) }}</span>
            <span class="text-[9px] sm:text-[10px] text-gray-300">{{ Math.round(maxVal) }}</span>
          </div>
        </div>

        <!-- Devices + Cities -->
        <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4">

          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h2 class="font-black text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm">Appareils utilisés</h2>
            <div v-if="!devices.length" class="text-center py-4 text-xs text-gray-300">
              Aucune donnée encore collectée
            </div>
            <div v-else class="space-y-2 sm:space-y-3">
              <div v-for="d in devices" :key="d.label">
                <div class="flex justify-between text-xs font-semibold mb-1">
                  <span class="text-gray-600">{{ d.label }}</span>
                  <span class="text-gray-900">{{ d.percent }}%</span>
                </div>
                <div class="h-1.5 sm:h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div class="h-full rounded-full transition-all" :class="d.color" :style="`width: ${d.percent}%`" />
                </div>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
            <h2 class="font-black text-gray-900 mb-3 sm:mb-4 text-xs sm:text-sm">Top villes</h2>
            <div v-if="!cities.length" class="text-center py-4 text-xs text-gray-300">
              Aucune donnée encore collectée
            </div>
            <div v-else class="space-y-2 sm:space-y-3">
              <div v-for="(city, i) in cities" :key="city.name" class="flex items-center gap-2 sm:gap-3">
                <span class="text-[10px] sm:text-xs font-black text-gray-300 w-3 sm:w-4">{{ i + 1 }}</span>
                <div class="flex-1 min-w-0">
                  <div class="flex justify-between text-xs font-semibold mb-1">
                    <span class="text-gray-700 truncate mr-2">{{ city.name }}</span>
                    <span class="text-gray-400 flex-shrink-0">{{ city.count }}</span>
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

      <!-- ── Retention + Heures + Résumé ── -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">

        <!-- Retention donut -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 class="font-black text-gray-900 mb-0.5 text-xs sm:text-sm">Taux de rétention</h2>
          <p class="text-[10px] sm:text-xs text-gray-400 mb-4 sm:mb-5">Utilisateurs qui reviennent</p>
          <div class="flex items-center gap-4 sm:flex-col sm:items-stretch sm:gap-0">
            <div class="flex items-center justify-center sm:mb-4 flex-shrink-0">
              <div class="relative w-24 h-24 sm:w-32 sm:h-32">
                <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#f3f4f6" stroke-width="3.5" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#274a82" stroke-width="3.5"
                    :stroke-dasharray="retentionDash" stroke-linecap="round" />
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e60012" stroke-width="3.5"
                    :stroke-dasharray="newDash" :stroke-dashoffset="newDashOffset" stroke-linecap="round" />
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center">
                  <p class="text-lg sm:text-2xl font-black text-gray-900">{{ retentionRate }}%</p>
                  <p class="text-[9px] sm:text-[10px] text-gray-400">retour</p>
                </div>
              </div>
            </div>
            <div class="flex-1 space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm bg-[#274a82] flex-shrink-0" />
                  <span class="text-gray-600 text-[10px] sm:text-xs">De retour</span>
                </span>
                <span class="font-bold text-gray-800">{{ totalReturning }}</span>
              </div>
              <div class="flex items-center justify-between text-xs">
                <span class="flex items-center gap-1.5">
                  <span class="w-2.5 h-2.5 rounded-sm bg-[#e60012] flex-shrink-0" />
                  <span class="text-gray-600 text-[10px] sm:text-xs">Nouveaux</span>
                </span>
                <span class="font-bold text-gray-800">{{ totalNew }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Heures de pointe -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 class="font-black text-gray-900 mb-0.5 text-xs sm:text-sm">Heures de pointe</h2>
          <p class="text-[10px] sm:text-xs text-gray-400 mb-4 sm:mb-5">Activité sur les 30 derniers jours</p>
          <div class="flex items-end gap-px sm:gap-0.5 h-20 sm:h-24">
            <div
              v-for="(h, idx) in hourlyData" :key="idx"
              class="flex-1 rounded-t-sm transition-all"
              :class="hourColor(h)"
              :style="`height: ${hourlyMax > 0 ? (h / hourlyMax) * 100 : 0}%`"
            />
          </div>
          <div class="flex justify-between mt-1.5 sm:mt-2 text-[9px] sm:text-[10px] text-gray-300 font-medium">
            <span>0h</span><span>6h</span><span>12h</span><span>18h</span><span>23h</span>
          </div>
          <div class="flex items-center flex-wrap gap-x-3 gap-y-1 mt-3 sm:mt-4 text-[10px] sm:text-xs font-semibold">
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-[#e60012]" /> Très actif</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-[#274a82]" /> Actif</span>
            <span class="flex items-center gap-1"><span class="w-2.5 h-2.5 rounded-sm bg-gray-200" /> Calme</span>
          </div>
        </div>

        <!-- Résumé -->
        <div class="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6 sm:col-span-2 lg:col-span-1">
          <h2 class="font-black text-gray-900 text-xs sm:text-sm mb-3">Résumé période</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
            <div class="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-xl">
              <span class="text-[10px] sm:text-xs text-gray-500 font-medium">Total connexions</span>
              <span class="font-black text-gray-900 text-xs sm:text-sm">{{ totalConnections.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-xl">
              <span class="text-[10px] sm:text-xs text-gray-500 font-medium">Utilisateurs uniques</span>
              <span class="font-black text-gray-900 text-xs sm:text-sm">{{ uniqueUsers.toLocaleString() }}</span>
            </div>
            <div class="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-xl">
              <span class="text-[10px] sm:text-xs text-gray-500 font-medium">Taux de rétention</span>
              <span class="font-black text-green-600 text-xs sm:text-sm">{{ retentionRate }}%</span>
            </div>
            <div class="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-xl">
              <span class="text-[10px] sm:text-xs text-gray-500 font-medium">Heure de pointe</span>
              <span class="font-black text-[#274a82] text-xs sm:text-sm">{{ peakHourLabel }}</span>
            </div>
            <div class="flex items-center justify-between p-2.5 sm:p-3 bg-gray-50 rounded-xl sm:col-span-2 lg:col-span-1">
              <span class="text-[10px] sm:text-xs text-gray-500 font-medium">Jour le + actif</span>
              <span class="font-black text-[#e60012] text-xs sm:text-sm">{{ peakDay.day }} ({{ peakDay.connections }})</span>
            </div>
          </div>
        </div>

      </div>

      <!-- ── Sessions récentes ── -->
      <div class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div class="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-50">
          <div>
            <h2 class="font-black text-gray-900 text-sm sm:text-base">Sessions récentes</h2>
            <p class="text-[10px] sm:text-xs text-gray-400 mt-0.5">Dernières connexions</p>
          </div>
          <div class="flex items-center gap-1.5 sm:gap-2">
            <span class="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span class="text-[10px] sm:text-xs font-bold text-green-600">{{ onlineNow }} en ligne</span>
          </div>
        </div>

        <div v-if="!sessions.length" class="flex flex-col items-center justify-center py-10 text-gray-300">
          <UIcon name="i-heroicons-users" class="w-8 h-8 mb-2" />
          <p class="text-xs font-semibold">Aucune session récente</p>
        </div>

        <div v-else class="divide-y divide-gray-50">
          <div
            v-for="session in sessions" :key="session.id"
            class="flex items-center gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-3.5 hover:bg-gray-50/50 transition"
          >
            <div class="relative flex-shrink-0">
              <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-[#274a82] flex items-center justify-center">
                <span class="text-white text-[10px] sm:text-xs font-black">{{ initials(session.name) }}</span>
              </div>
              <span
                class="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full border-2 border-white"
                :class="session.online ? 'bg-green-400' : 'bg-gray-300'"
              />
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1.5 sm:gap-2">
                <p class="text-xs sm:text-sm font-semibold text-gray-800 truncate">{{ session.name }}</p>
                <span
                  class="px-1.5 sm:px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold flex-shrink-0"
                  :class="(roleConfig[session.role] ?? roleConfig.client).color"
                >
                  {{ (roleConfig[session.role] ?? roleConfig.client).label }}
                </span>
              </div>
              <p class="text-[10px] sm:text-xs text-gray-400 truncate">{{ session.email }}</p>
            </div>

            <div class="hidden md:flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
              <UIcon name="i-heroicons-computer-desktop" class="w-3.5 h-3.5" />
              <span class="truncate max-w-28">{{ session.device }}</span>
            </div>

            <div class="hidden lg:flex items-center gap-1.5 text-xs text-gray-400 flex-shrink-0">
              <UIcon name="i-heroicons-map-pin" class="w-3.5 h-3.5" />
              {{ session.location }}
            </div>

            <div class="text-right flex-shrink-0">
              <p class="text-[10px] sm:text-xs font-semibold" :class="session.online ? 'text-green-600' : 'text-gray-400'">
                {{ session.online ? 'En ligne' : session.time }}
              </p>
              <p class="text-[9px] text-gray-300 lg:hidden mt-0.5">{{ session.location }}</p>
            </div>
          </div>
        </div>
      </div>

    </template>
  </div>
</template>