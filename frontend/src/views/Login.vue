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
    <form @submit.prevent="onSubmit">
      <label>
        Username
        <input v-model="username" type="text" autocomplete="username" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" autocomplete="current-password" />
      </label>
      <p v-if="error">{{ error }}</p>
      <button type="submit" :disabled="busy">{{ busy ? 'Logging in…' : 'Log in' }}</button>
    </form>
    <p>No account? <router-link to="/register">Register</router-link></p>
  </section>
</template>

<style scoped>
section {
  max-width: 20rem;
}
label {
  display: block;
  margin-bottom: 0.75rem;
}
input {
  display: block;
  width: 100%;
}
p {
  color: crimson;
}
button {
  margin-top: 0.5rem;
}
</style>
