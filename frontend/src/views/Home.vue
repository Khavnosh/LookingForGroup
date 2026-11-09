<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api, useAuth } from '../composables/useAuth'

const router = useRouter()
const { user } = useAuth()

const mails = ref([])
const owned = ref([])
const joined = ref([])
const error = ref('')

function describe(mail) {
  return mail.kind === 'recruit'
    ? `${mail.sender.username} wants to recruit you into ${mail.group.name}`
    : `${mail.sender.username} asks to join ${mail.group.name}`
}

onMounted(async () => {
  try {
    const [mailData, groupData] = await Promise.all([api('/api/mails'), api('/api/my-groups')])
    mails.value = mailData.mails.slice(0, 3)
    owned.value = groupData.owned
    joined.value = groupData.joined
  } catch (err) {
    error.value = err.message
  }
})
</script>

<template>
  <section>
    <h1>Dashboard</h1>
    <p class="muted">Welcome back, {{ user?.username }}. The tavern is busy tonight.</p>
    <p v-if="error" class="error">{{ error }}</p>

    <h2>Latest Requests</h2>
    <p v-if="mails.length === 0" class="muted">No requests waiting.</p>
    <ul v-else class="list">
      <li v-for="mail in mails" :key="mail.id" class="entry" @click="router.push({ name: 'Mail' })">
        <span class="name">
          {{ mail.kind === 'recruit' ? 'Request to Recruit' : 'Request to Join Group' }}
        </span>
        <span class="meta">{{ describe(mail) }}</span>
        <div class="tags">
          <span class="tag">{{ mail.status }}</span>
        </div>
      </li>
    </ul>
    <button class="quiet" @click="router.push({ name: 'Mail' })">All Mail</button>

    <div class="divider"></div>

    <h2>My Groups</h2>
    <p v-if="owned.length === 0 && joined.length === 0" class="muted">You have not joined any groups yet.</p>

    <template v-if="owned.length">
      <b>Owned</b>
      <ul class="list">
        <li
          v-for="group in owned"
          :key="group.id"
          class="entry"
          @click="router.push({ name: 'MyGroupDetails', params: { id: group.id } })"
        >
          <span class="name">{{ group.name }}</span>
          <div class="tags">
            <span v-for="tag in group.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
          </div>
        </li>
      </ul>
    </template>

    <template v-if="joined.length">
      <b>Joined</b>
      <ul class="list">
        <li
          v-for="group in joined"
          :key="group.id"
          class="entry"
          @click="router.push({ name: 'JoinedGroupDetails', params: { id: group.id } })"
        >
          <span class="name">{{ group.name }}</span>
          <div class="tags">
            <span v-for="tag in group.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
          </div>
        </li>
      </ul>
    </template>

    <button class="quiet" @click="router.push({ name: 'MyGroups' })">All Groups</button>
  </section>
</template>
