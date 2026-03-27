<template>
  <div>
    <NuxtPwaManifest />  <!-- ← AJOUTER ICI (tout en haut dans le div) -->
    <UToaster position="top-right" />
    <AppLoader v-if="loading" />

    <template v-if="isLivreurPage">
      <div class="min-h-screen bg-gray-50">
        <LivreurHeader />
        <div class="flex">
          <LivreurSideBar />
          <main class="flex-1 min-w-0 p-6 min-h-[calc(100vh-4rem)]">
            <NuxtPage />
          </main>
        </div>
      </div>
    </template>

    <template v-else-if="isAdminPage">
      <div class="min-h-screen bg-gray-50">
        <AdminHeader />
        <div class="flex">
          <AdminSideBar />
          <main class="flex-1 min-w-0 p-6 min-h-[calc(100vh-4rem)]">
            <NuxtPage />
          </main>
        </div>
      </div>
    </template>

    <template v-else-if="isComptePage">
      <AppHeader />
      <div class="min-h-screen bg-gray-50">
        <UContainer class="py-8">
          <div class="flex gap-6 items-start">
            <CompteAccountSideBar />
            <main class="flex-1 min-w-0">
              <NuxtPage />
            </main>
          </div>
        </UContainer>
      </div>
      <AppFooter />
    </template>

    <template v-else>
      <HeroBanner />
      <AppHeader />
      <main>
        <NuxtPage />
      </main>
      <Popup />
      <AppFooter />
      <ChatBot />
    </template>

    <PwaPrompt />  <!-- ← AJOUTER ICI (tout en bas avant le </div>) -->
  </div>
</template>