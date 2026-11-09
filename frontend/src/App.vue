<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from './composables/useAuth'

const router = useRouter()
const { user, isLoggedIn, logout } = useAuth()

function onLogout() {
  logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <nav>
    <router-link to="/">Home</router-link>
    <template v-if="isLoggedIn">
      <span>Hi, {{ user.username }}</span>
      <button @click="onLogout">Log out</button>
    </template>
    <template v-else>
      <router-link to="/login">Login</router-link>
      <router-link to="/register">Register</router-link>
    </template>
  </nav>
  <router-view />
</template>

<style scoped>
nav {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #ddd;
}
</style>
