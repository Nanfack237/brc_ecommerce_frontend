<script setup lang="ts">
useHead({
  title: 'BRC Market',
  titleTemplate: (t) => `${t} - Infrastructure & Déploiement IT`,
  link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }],
})

const heroDesc    = "Réseau, serveurs, câblage et cloud — BRC Market déploie et gère votre infrastructure informatique professionnelle."
const sectionDesc = "Des solutions robustes pour connecter, sécuriser et faire évoluer votre système d'information."
const ctaTitle    = "Un projet d'infrastructure à planifier ?"
const ctaDesc     = "Audit gratuit — Réponse sous 24 heures en jours ouvrés."

const services = [
  {
    icon: 'i-heroicons-signal',
    title: 'Réseau LAN & Wi-Fi',
    desc: "Conception et installation de réseaux filaires et sans fil pour bureaux, entrepôts et campus. Configuration des switches, routeurs, points d'accès Wi-Fi 6 et segmentation VLAN.",
    tags: ['Switch', 'Routeur', 'Wi-Fi 6', 'VLAN'],
    color: '#274a82',
  },
  {
    icon: 'i-heroicons-server-stack',
    title: 'Déploiement de Serveurs',
    desc: "Installation et configuration de serveurs physiques ou virtuels : Windows Server, Linux (Ubuntu, Debian, CentOS), configuration RAID, partage réseau NAS et gestion des sauvegardes.",
    tags: ['Windows Server', 'Linux', 'NAS', 'RAID'],
    color: '#e60012',
  },
  {
    icon: 'i-heroicons-building-office',
    title: 'Active Directory & GPO',
    desc: "Mise en place d'Active Directory (AD DS), création et gestion des comptes utilisateurs, groupes de sécurité, stratégies de groupe (GPO), DNS et DHCP d'entreprise.",
    tags: ['AD DS', 'GPO', 'DNS', 'DHCP'],
    color: '#16a34a',
  },
  {
    icon: 'i-heroicons-cube-transparent',
    title: 'Virtualisation',
    desc: "Déploiement de solutions VMware ESXi, Microsoft Hyper-V ou Proxmox pour optimiser vos ressources matérielles, réduire les coûts et faciliter la gestion de vos serveurs.",
    tags: ['VMware', 'Hyper-V', 'Proxmox', 'VMs'],
    color: '#d97706',
  },
  {
    icon: 'i-heroicons-arrows-right-left',
    title: 'Câblage & Baie de Brassage',
    desc: "Câblage structuré Cat5e, Cat6, Cat6A et fibre optique. Installation et organisation de baies de brassage, documentation réseau complète et certification des prises.",
    tags: ['Cat6', 'Fibre', 'Patch Panel', 'RJ45'],
    color: '#7c3aed',
  },
  {
    icon: 'i-heroicons-cloud',
    title: 'Cloud & Sauvegarde Distante',
    desc: "Migration vers le cloud (Azure, Google Workspace, Microsoft 365), sauvegardes automatiques distantes et plan de reprise d'activité (PRA) en cas de sinistre.",
    tags: ['Azure', 'M365', 'Backup', 'PRA'],
    color: '#0369a1',
  },
]
</script>

<template>
  <div class="bg-[#f4f4f4] min-h-screen pb-20">

    <!-- HERO BANNER -->
    <section class="relative h-[320px] md:h-[400px] flex items-center justify-center overflow-hidden">
      <img
        src="/images/infrastructure-banner.jpg"
        class="absolute inset-0 w-full h-full object-cover"
        alt="Infrastructure & Déploiement IT"
      />
      <div class="absolute inset-0 bg-black/60"></div>
      <div class="relative z-10 text-center px-6">
        <h1 class="text-4xl md:text-5xl font-bold text-white mb-4">
          Infrastructure &amp; Déploiement IT
        </h1>
        <p class="text-gray-200 max-w-2xl mx-auto text-lg">{{ heroDesc }}</p>
      </div>
    </section>

    <!-- SERVICES -->
    <div class="max-w-7xl mx-auto px-4 py-16">

      <div class="text-center mb-12">
        <span class="inline-block bg-[#274a82]/10 text-[#274a82] text-xs font-bold uppercase tracking-widest px-4 py-1.5 rounded-full mb-3">
          Nos solutions
        </span>
        <h2 class="text-3xl font-bold text-gray-900">Infrastructure IT</h2>
        <p class="text-gray-500 mt-2 max-w-xl mx-auto">{{ sectionDesc }}</p>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="s in services"
          :key="s.title"
          class="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-1 p-7 group"
        >
          <div
            class="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
            :style="{ backgroundColor: s.color + '15' }"
          >
            <UIcon
              :name="s.icon"
              class="w-7 h-7 transition-transform group-hover:scale-110"
              :style="{ color: s.color }"
            />
          </div>
          <h3 class="text-base font-bold text-gray-900 mb-3">{{ s.title }}</h3>
          <p class="text-sm text-gray-500 leading-relaxed mb-5">{{ s.desc }}</p>
          <div class="flex flex-wrap gap-2">
            <span
              v-for="tag in s.tags"
              :key="tag"
              class="text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full"
              :style="{ backgroundColor: s.color + '12', color: s.color }"
            >{{ tag }}</span>
          </div>
        </div>
      </div>

      <!-- CTA -->
      <div class="mt-14 bg-[#274a82] rounded-3xl px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p class="text-white font-bold text-xl mb-1">{{ ctaTitle }}</p>
          <p class="text-blue-200 text-sm">{{ ctaDesc }}</p>
        </div>
        <div class="flex flex-col sm:flex-row gap-3 flex-shrink-0">
          <NuxtLink to="/contact">
            <UButton color="error" size="lg" icon="i-heroicons-clipboard-document-list">
              Demander un audit
            </UButton>
          </NuxtLink>
          <a href="https://wa.me/c/237689205751" target="_blank">
            <UButton variant="outline" size="lg" icon="i-simple-icons-whatsapp" class="text-white border-white/40 hover:bg-white/10">
              WhatsApp
            </UButton>
          </a>
        </div>
      </div>

    </div>
  </div>
</template>