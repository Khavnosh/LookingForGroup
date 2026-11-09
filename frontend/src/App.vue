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
  <header class="topbar">
    <div class="sigil">Looking For Group</div>
    <nav>
      <template v-if="isLoggedIn">
        <router-link to="/">Dashboard</router-link>
        <router-link to="/recruits">Look For Recruits</router-link>
        <router-link to="/groups">Look For Groups</router-link>
        <router-link to="/my-groups">My Groups</router-link>
        <router-link to="/mail">Mail</router-link>
        <router-link to="/profile">My Profile</router-link>
        <span class="muted">{{ user.username }}</span>
        <button class="quiet" @click="onLogout">Log-out</button>
      </template>
      <template v-else>
        <router-link to="/login">Login</router-link>
        <router-link to="/register">Register</router-link>
      </template>
    </nav>
  </header>
  <router-view />
</template>
