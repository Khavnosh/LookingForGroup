<script setup>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { api } from '../composables/useAuth'

const route = useRoute()

const recruit = ref(null)
const myGroups = ref([])
const chosenGroupId = ref('')
const error = ref('')
const notice = ref('')

onMounted(async () => {
  try {
    recruit.value = (await api(`/api/recruits/${route.params.id}`)).recruit
    myGroups.value = (await api('/api/my-groups')).owned
  } catch (err) {
    error.value = err.message
  }
})

async function requestToRecruit() {
  error.value = ''
  notice.value = ''
  if (!chosenGroupId.value) {
    error.value = 'Pick one of your groups first.'
    return
  }
  try {
    await api('/api/mails', {
      method: 'POST',
      body: { kind: 'recruit', groupId: Number(chosenGroupId.value), toUserId: recruit.value.id },
    })
    notice.value = 'Request to Recruit sent. It is waiting in their Mail.'
  } catch (err) {
    error.value = err.message
  }
}
</script>

<template>
  <section>
    <p v-if="error" class="error">{{ error }}</p>
    <template v-else-if="recruit">
      <h1>{{ recruit.username }}</h1>

      <b>Who Am I?</b>
      <p>{{ recruit.description || 'This adventurer keeps their tale untold.' }}</p>

      <b>Interests</b>
      <div class="tags">
        <span v-for="tag in recruit.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
        <span v-if="recruit.tags.length === 0" class="muted">None recorded</span>
      </div>

      <div v-if="myGroups.length" class="divider"></div>

      <div v-if="myGroups.length">
        <b>Request to Recruit</b>
        <p class="muted">Invite this adventurer into one of your companies.</p>
        <div class="row">
          <select v-model="chosenGroupId">
            <option value="" disabled>Pick your group</option>
            <option v-for="group in myGroups" :key="group.id" :value="group.id">{{ group.name }}</option>
          </select>
          <button @click="requestToRecruit">Send Request</button>
        </div>
        <p v-if="notice" class="notice">{{ notice }}</p>
      </div>
    </template>
  </section>
</template>
