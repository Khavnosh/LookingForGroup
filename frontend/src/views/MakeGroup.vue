<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { api } from '../composables/useAuth'

const router = useRouter()

const name = ref('')
const description = ref('')
const allTags = ref([])
const selectedTags = ref([])
const error = ref('')
const busy = ref(false)

onMounted(async () => {
  allTags.value = (await api('/api/tags')).tags
})

function toggleTag(tag) {
  const i = selectedTags.value.indexOf(tag.name)
  if (i === -1) selectedTags.value.push(tag.name)
  else selectedTags.value.splice(i, 1)
}

function isPicked(tag) {
  return selectedTags.value.includes(tag.name)
}

async function onSubmit() {
  if (!name.value.trim() || !description.value.trim()) {
    error.value = 'Name and description are required.'
    return
  }
  error.value = ''
  busy.value = true
  try {
    const data = await api('/api/groups', {
      method: 'POST',
      body: { name: name.value.trim(), description: description.value.trim(), tags: selectedTags.value },
    })
    router.push({ name: 'MyGroupDetails', params: { id: data.group.id } })
  } catch (err) {
    error.value = err.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <section>
    <h1>Make Group</h1>
    <form @submit.prevent="onSubmit">
      <label>
        Group Name
        <input v-model="name" type="text" />
      </label>
      <label>
        Description
        <textarea v-model="description" rows="3"></textarea>
      </label>
      <div>
        Project Tags
        <label v-for="tag in allTags" :key="tag.id">
          <input type="checkbox" :checked="isPicked(tag)" @change="toggleTag(tag)" />
          {{ tag.name }}
        </label>
      </div>
      <p v-if="error">{{ error }}</p>
      <button type="submit" :disabled="busy">{{ busy ? 'Creating…' : 'Create Group' }}</button>
    </form>
  </section>
</template>

<style scoped>
label {
  display: block;
  margin-bottom: 0.75rem;
}
input[type='text'],
textarea {
  display: block;
  width: 100%;
  max-width: 24rem;
}
input[type='checkbox'] {
  display: inline;
  width: auto;
  margin-right: 0.35rem;
}
button {
  margin-top: 0.5rem;
}
</style>
