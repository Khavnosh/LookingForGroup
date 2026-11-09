<script setup>
import { onMounted, ref } from 'vue'
import { api } from '../composables/useAuth'

const mails = ref([])
const error = ref('')
const busyId = ref(null)

async function load() {
  error.value = ''
  try {
    mails.value = (await api('/api/mails')).mails
  } catch (err) {
    error.value = err.message
  }
}

async function decide(mail, action) {
  busyId.value = mail.id
  error.value = ''
  try {
    await api(`/api/mails/${mail.id}/${action}`, { method: 'POST' })
    await load()
  } catch (err) {
    error.value = err.message
  } finally {
    busyId.value = null
  }
}

function describe(mail) {
  return mail.kind === 'recruit'
    ? `${mail.sender.username} wants to recruit you into ${mail.group.name}`
    : `${mail.sender.username} asks to join ${mail.group.name}`
}

onMounted(load)
</script>

<template>
  <section>
    <h1>Mail</h1>
    <p>Sealed requests to recruit and to join. You are the one who answers.</p>

    <p v-if="error" class="error">{{ error }}</p>
    <p v-else-if="mails.length === 0" class="muted">No mail yet.</p>

    <ul class="list">
      <li v-for="mail in mails" :key="mail.id" class="entry" style="cursor: default">
        <span class="name">
          {{ mail.kind === 'recruit' ? 'Request to Recruit' : 'Request to Join Group' }}
        </span>
        <span class="meta">{{ describe(mail) }}</span>
        <div class="tags">
          <span class="tag">{{ mail.status }}</span>
        </div>
        <template v-if="mail.status === 'pending'">
          <button :disabled="busyId === mail.id" @click="decide(mail, 'accept')">Accept</button>
          <button class="quiet" :disabled="busyId === mail.id" @click="decide(mail, 'deny')">Deny</button>
        </template>
      </li>
    </ul>
  </section>
</template>
