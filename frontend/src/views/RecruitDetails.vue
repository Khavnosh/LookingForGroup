<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../composables/useAuth'

const route = useRoute()

const recruit = ref(null)
const error = ref('')

onMounted(async () => {
  try {
    recruit.value = (await api(`/api/recruits/${route.params.id}`)).recruit
  } catch (err) {
    error.value = err.message
  }
})
</script>

<template>
  <section>
    <p v-if="error">{{ error }}</p>
    <template v-else-if="recruit">
      <h1>{{ recruit.username }}</h1>
      <b>Who Am I?</b>
      <p>{{ recruit.description || 'No description yet.' }}</p>
      <b>Interests:</b>
      <div v-for="tag in recruit.tags" :key="tag.id">{{ tag.name }}</div>
    </template>
  </section>
</template>
