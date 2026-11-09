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
    <p v-if="error">{{ error }}</p>

    <button @click="router.push({ name: 'MakeGroup' })">Make Group</button>

    <h2>Owned Groups</h2>
    <p v-if="owned.length === 0">You don't own any groups yet.</p>
    <ul>
      <li v-for="group in owned" :key="group.id" @click="router.push({ name: 'MyGroupDetails', params: { id: group.id } })">
        <strong>{{ group.name }}</strong>
        <span>{{ group.tags.map((tag) => tag.name).join(', ') || 'no tags' }}</span>
      </li>
    </ul>

    <h2>Joined Groups</h2>
    <p v-if="joined.length === 0">You haven't joined any groups yet.</p>
    <ul>
      <li v-for="group in joined" :key="group.id" @click="router.push({ name: 'GroupDetails', params: { id: group.id } })">
        <strong>{{ group.name }}</strong>
        <span>{{ group.tags.map((tag) => tag.name).join(', ') || 'no tags' }}</span>
      </li>
    </ul>
  </section>
</template>

<style scoped>
ul {
  list-style: none;
  padding: 0;
}
li {
  border: 1px solid #ddd;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}
li span {
  display: block;
  color: #666;
}
button {
  margin: 0.5rem 0 1rem;
}
</style>
