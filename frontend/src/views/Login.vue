<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

const username = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function onSubmit() {
  if (!username.value || !password.value) {
    error.value = 'Both fields are required.'
    return
  }
  error.value = ''
  busy.value = true
  try {
    await login(username.value, password.value)
    router.push(route.query.redirect || { name: 'Home' })
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section>
    <h1>Login</h1>
    <p>Speak your name and passphrase to pass the gate.</p>
    <form @submit.prevent="onSubmit">
      <label>
        Username
        <input v-model="username" type="text" autocomplete="username" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" autocomplete="current-password" />
      </label>
      <p v-if="error" class="error">{{ error }}</p>
      <button type="submit" :disabled="busy">{{ busy ? 'Opening the gates…' : 'Enter' }}</button>
    </form>
    <div class="divider"></div>
    <p class="muted">No account yet? <router-link to="/register">Register</router-link></p>
  </section>
</template>
