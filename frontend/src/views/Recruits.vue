<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../composables/useAuth'

const router = useRouter()

const recruits = ref([])
const search = ref('')
const error = ref('')
const loading = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const query = search.value.trim() ? `?search=${encodeURIComponent(search.value.trim())}` : ''
    recruits.value = (await api(`/api/recruits${query}`)).recruits
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function routeToRecruitDetail(id) {
  router.push({ name: 'RecruitDetails', params: { id } })
}

onMounted(load)
</script>

<template>
  <section>
    <h1>Look For Recruits</h1>
    <p>Look into some possible recruits for your indie project!</p>

    <form @submit.prevent="load">
      <input v-model="search" type="search" placeholder="Search by name or interest tag" />
      <button type="submit">Search</button>
    </form>

    <p v-if="error">{{ error }}</p>
    <p v-else-if="loading">Loading…</p>
    <p v-else-if="recruits.length === 0">No recruits found.</p>

    <ul>
      <li v-for="recruit in recruits" :key="recruit.id" @click="routeToRecruitDetail(recruit.id)">
        <strong>{{ recruit.username }}</strong>
        <span>Interested in: {{ recruit.tags.map((tag) => tag.name).join(', ') || 'nothing yet' }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
form {
  margin: 1rem 0;
}
ul {
  list-style: none;
  padding: 0;
}
li {
  border: 1px solid #ddd;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}
li span {
  display: block;
  color: #666;
}
</style>
