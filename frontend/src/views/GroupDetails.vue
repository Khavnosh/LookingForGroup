<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api, useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { user } = useAuth()

const group = ref(null)
const members = ref([])
const error = ref('')
const notice = ref('')

const isMember = computed(() => members.value.some((member) => member.id === user.value?.id))

onMounted(async () => {
  try {
    group.value = (await api(`/api/groups/${route.params.id}`)).group
    members.value = (await api(`/api/groups/${route.params.id}/members`)).members
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

async function leaveGroup() {
  if (!confirm('Leave this group?')) return
  error.value = ''
  notice.value = ''
  try {
    await api(`/api/groups/${group.value.id}/leave`, { method: 'POST' })
    const back = router.options.history.state.back || ''
    router.push(back.startsWith('/my-groups') ? { name: 'MyGroups' } : { name: 'Groups' })
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

      <div class="divider"></div>

      <h2>Member List</h2>
      <p v-if="members.length === 0" class="muted">No members yet.</p>
      <ul class="list">
        <li v-for="member in members" :key="member.id" class="entry" style="cursor: default">
          <span class="name">{{ member.username }}</span>
          <span class="meta">{{ member.id === group.owner.id ? 'Owner' : member.role }}</span>
        </li>
      </ul>

      <div class="divider"></div>

      <button v-if="isMember" class="danger" @click="leaveGroup">Leave Group</button>
      <button v-else @click="requestToJoin">Request to Join Group</button>
      <p v-if="notice" class="notice">{{ notice }}</p>
    </template>
  </section>
</template>
