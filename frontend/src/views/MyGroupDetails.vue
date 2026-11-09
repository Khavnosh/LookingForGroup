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
    <p v-if="error" class="error">{{ error }}</p>
    <template v-else-if="group">
      <h1>{{ group.name }}</h1>

      <b>Description</b>
      <p>{{ group.description }}</p>

      <b>Project Tags</b>
      <div class="tags">
        <span v-for="tag in group.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
        <span v-if="group.tags.length === 0" class="muted">None recorded</span>
      </div>

      <b>Members</b>
      <p>{{ group.memberCount }}</p>

      <div class="divider"></div>

      <p class="muted">Group management — editing the profile, member roles and removals — comes next.</p>
    </template>
  </section>
</template>
