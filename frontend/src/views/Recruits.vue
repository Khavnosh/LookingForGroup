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
    <p>Scout the tavern for adventurers whose skills suit your quest.</p>

    <div class="row">
      <input v-model="search" type="search" placeholder="Search by name or interest tag" @keyup.enter="load" />
      <button @click="load">Search</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading" class="muted">Scouting…</p>
    <p v-else-if="recruits.length === 0" class="muted">No recruits found.</p>

    <ul class="list">
      <li v-for="recruit in recruits" :key="recruit.id" class="entry" @click="routeToRecruitDetail(recruit.id)">
        <span class="name">{{ recruit.username }}</span>
        <span class="meta">Interested in: {{ recruit.tags.map((tag) => tag.name).join(', ') || 'nothing yet' }}</span>
      </li>
    </ul>
  </section>
</template>
