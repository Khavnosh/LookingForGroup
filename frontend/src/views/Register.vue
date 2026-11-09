<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const router = useRouter()
const { register } = useAuth()

const username = ref('')
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function onSubmit() {
  if (!username.value || !email.value || !password.value) {
    error.value = 'All fields are required.'
    return
  }
  error.value = ''
  busy.value = true
  try {
    await register(username.value, email.value, password.value)
    router.push({ name: 'Home' })
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section>
    <h1>Register</h1>
    <form @submit.prevent="onSubmit">
      <label>
        Username
        <input v-model="username" type="text" autocomplete="username" />
      </label>
      <label>
        Email
        <input v-model="email" type="email" autocomplete="email" />
      </label>
      <label>
        Password
        <input v-model="password" type="password" autocomplete="new-password" />
      </label>
      <p v-if="error">{{ error }}</p>
      <button type="submit" :disabled="busy">{{ busy ? 'Creating…' : 'Create account' }}</button>
    </form>
    <p>Already have an account? <router-link to="/login">Log in</router-link></p>
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
