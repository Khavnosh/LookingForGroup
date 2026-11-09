<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../composables/useAuth'

const router = useRouter()

const groups = ref([])
const search = ref('')
const error = ref('')
const loading = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const query = search.value.trim() ? `?search=${encodeURIComponent(search.value.trim())}` : ''
    groups.value = (await api(`/api/groups${query}`)).groups
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

function routeToGroupDetail(id) {
  router.push({ name: 'GroupDetails', params: { id } })
}

onMounted(load)
</script>

<template>
  <section>
    <h1>Look For Groups</h1>
    <p>Search groups by name or project tag, then ask to join.</p>

    <form @submit.prevent="load">
      <input v-model="search" type="search" placeholder="Search by name or project tag" />
      <button type="submit">Search</button>
    </form>

    <p v-if="error">{{ error }}</p>
    <p v-else-if="loading">Loading…</p>
    <p v-else-if="groups.length === 0">No groups found.</p>

    <ul>
      <li v-for="group in groups" :key="group.id" @click="routeToGroupDetail(group.id)">
        <strong>{{ group.name }}</strong>
        <span>{{ group.description }}</span>
        <span>Tags: {{ group.tags.map((tag) => tag.name).join(', ') || 'none' }}</span>
        <span>Owner: {{ group.owner.username }} · {{ group.memberCount }} member(s)</span>
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
