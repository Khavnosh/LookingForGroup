<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { user } = useAuth()
</script>

<template>
  <section>
    <h1>Dashboard</h1>
    <p class="muted">Welcome back, {{ user?.username }}. The tavern is busy tonight.</p>

    <div class="divider"></div>

    <h2>What would you do?</h2>
    <div class="row">
      <button @click="router.push({ name: 'Recruits' })">Look For Recruits</button>
      <button @click="router.push({ name: 'Groups' })">Look For Groups</button>
      <button @click="router.push({ name: 'MyGroups' })">My Groups</button>
      <button class="quiet" @click="router.push({ name: 'Mail' })">Check Mail</button>
      <button class="quiet" @click="router.push({ name: 'Profile' })">My Profile</button>
    </div>
  </section>
</template>
