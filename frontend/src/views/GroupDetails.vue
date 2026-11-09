<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../composables/useAuth'

const route = useRoute()

const group = ref(null)
const error = ref('')
const notice = ref('')

onMounted(async () => {
  try {
    group.value = (await api(`/api/groups/${route.params.id}`)).group
  } catch (err) {
    error.value = err.message
  }
})

async function requestToJoin() {
  error.value = ''
  notice.value = ''
  try {
    await api('/api/mails', { method: 'POST', body: { kind: 'join', groupId: group.value.id } })
    notice.value = 'Request to Join sent. It is waiting in the owner’s Mail.'
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <section>
    <p v-if="error" class="error">{{ error }}</p>
    <template v-else-if="group">
      <h1>{{ group.name }}</h1>

      <b>Led by</b>
      <p>{{ group.owner.username }}</p>

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

      <button @click="requestToJoin">Request to Join Group</button>
      <p v-if="notice" class="notice">{{ notice }}</p>
    </template>
  </section>
</template>
