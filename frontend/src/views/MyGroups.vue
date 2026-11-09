<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../composables/useAuth'

const router = useRouter()

const owned = ref([])
const joined = ref([])
const error = ref('')

onMounted(async () => {
  try {
    const data = await api('/api/my-groups')
    owned.value = data.owned
    joined.value = data.joined
  } catch (err) {
    error.value = err.message
  }
})
</script>

<template>
  <section>
    <h1>My Groups</h1>
    <p class="muted">Companies you lead, and companies that took you in.</p>
    <p v-if="error" class="error">{{ error }}</p>

    <button @click="router.push({ name: 'MakeGroup' })">Make Group</button>

    <div class="divider"></div>

    <h2>Owned Groups</h2>
    <p v-if="owned.length === 0" class="muted">You don't own any groups yet.</p>
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

    <h2>Joined Groups</h2>
    <p v-if="joined.length === 0" class="muted">You haven't joined any groups yet.</p>
    <ul class="list">
      <li
        v-for="group in joined"
        :key="group.id"
        class="entry"
        @click="router.push({ name: 'GroupDetails', params: { id: group.id } })"
      >
        <span class="name">{{ group.name }}</span>
        <div class="tags">
          <span v-for="tag in group.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
        </div>
      </li>
    </ul>
  </section>
</template>
