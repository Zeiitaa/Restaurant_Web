<script setup>
// import navbar from './components/navbar.vue';
// import Footer from './components/footer.vue';
import { RouterView, useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <!-- <navbar v-if="!route.meta.hideNavbar" /> -->
  <RouterView />
  <!-- <Footer></Footer> -->
</template>

<style scoped></style>
