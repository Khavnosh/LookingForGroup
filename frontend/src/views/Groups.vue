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
    <p>Seek out companies gathering to forge something worth playing.</p>

    <div class="row">
      <input v-model="search" type="search" placeholder="Search by name or project tag" @keyup.enter="load" />
      <button @click="load">Search</button>
    </div>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="loading" class="muted">Searching…</p>
    <p v-else-if="groups.length === 0" class="muted">No groups found.</p>

    <ul class="list">
      <li v-for="group in groups" :key="group.id" class="entry" @click="routeToGroupDetail(group.id)">
        <span class="name">{{ group.name }}</span>
        <span class="meta">{{ group.description }}</span>
        <div class="tags">
          <span v-for="tag in group.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
        </div>
        <span class="meta">Led by {{ group.owner.username }} · {{ group.memberCount }} member(s)</span>
      </li>
    </ul>
  </section>
</template>
