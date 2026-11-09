<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../composables/useAuth'

const route = useRoute()

const group = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    group.value = (await api(`/api/groups/${route.params.id}`)).group
  } catch (err) {
    error.value = err.message
  }
})
</script>

<template>
  <section>
    <p v-if="error">{{ error }}</p>
    <template v-else-if="group">
      <h1>{{ group.name }}</h1>
      <b>Description:</b>
      <p>{{ group.description }}</p>
      <b>Project Tags:</b>
      <div v-for="tag in group.tags" :key="tag.id">{{ tag.name }}</div>
      <b>Members:</b> {{ group.memberCount }}
    </template>
  </section>
</template>
