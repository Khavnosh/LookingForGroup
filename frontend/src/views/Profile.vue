<script setup>
import { onMounted, ref } from 'vue'
import { api, useAuth } from '../composables/useAuth'

const { setUser } = useAuth()

const profile = ref(null)
const draft = ref(null)
const newTag = ref('')
const error = ref('')
const editing = ref(false)

async function load() {
  error.value = ''
  try {
    profile.value = (await api('/api/me')).user
  } catch (err) {
    error.value = err.message
  }
}

function editProfile() {
  draft.value = { ...profile.value, tags: profile.value.tags.map((tag) => ({ ...tag })) }
  editing.value = true
}

function cancelEdit() {
  editing.value = false
  draft.value = null
  newTag.value = ''
}

function addTag() {
  const name = newTag.value.trim()
  if (name && !draft.value.tags.some((tag) => tag.name.toLowerCase() === name.toLowerCase())) {
    draft.value.tags.push({ id: null, name })
  }
  newTag.value = ''
}

function removeTag(id) {
  draft.value.tags = draft.value.tags.filter((tag) => tag.id !== id)
}

async function confirmEdit() {
  if (!confirm('Save these profile changes?')) return
  error.value = ''
  try {
    await api('/api/me', {
      method: 'PUT',
      body: {
        username: draft.value.username,
        email: draft.value.email,
        description: draft.value.description,
        discordTag: draft.value.discordTag,
        availability: draft.value.availability,
      },
    })

    const before = new Set(profile.value.tags.map((tag) => tag.name))
    const after = new Set(draft.value.tags.map((tag) => tag.name))
    for (const tag of draft.value.tags) {
      if (!before.has(tag.name)) await api('/api/me/tags', { method: 'POST', body: { name: tag.name } })
    }
    for (const tag of profile.value.tags) {
      if (!after.has(tag.name)) await api(`/api/me/tags/${tag.id}`, { method: 'DELETE' })
    }

    await load()
    setUser(profile.value)
    cancelEdit()
  } catch (err) {
    error.value = err.message
  }
}

onMounted(load)
</script>

<template>
  <section v-if="profile">
    <h1>My Profile</h1>
    <p v-if="error">{{ error }}</p>

    <template v-if="!editing">
      <div>Name: {{ profile.username }}</div>
      <div>Who Am I? {{ profile.description || '—' }}</div>
      <div>My Interests: {{ profile.tags.map((tag) => tag.name).join(', ') || '—' }}</div>
      <div>Availability: {{ profile.availability || '—' }}</div>
      <div>Email: {{ profile.email }}</div>
      <div>Discord tag: {{ profile.discordTag || '—' }}</div>
      <button @click="editProfile">Edit Profile</button>
    </template>

    <template v-else>
      <label>
        Name
        <input v-model="draft.username" type="text" />
      </label>
      <label>
        Who Am I?
        <textarea v-model="draft.description" rows="3"></textarea>
      </label>
      <div>
        My Interests
        <div v-for="tag in draft.tags" :key="tag.id ?? tag.name">
          {{ tag.name }}
          <button type="button" @click="removeTag(tag.id)">x</button>
        </div>
        <input v-model="newTag" type="text" placeholder="Add an interest tag" @keyup.enter="addTag" />
        <button type="button" @click="addTag">+</button>
      </div>
      <label>
        Availability
        <input v-model="draft.availability" type="text" />
      </label>
      <label>
        Email
        <input v-model="draft.email" type="email" />
      </label>
      <label>
        Discord tag
        <input v-model="draft.discordTag" type="text" />
      </label>
      <button @click="confirmEdit">Save</button>
      <button @click="cancelEdit">Cancel</button>
    </template>
  </section>
</template>

<style scoped>
label {
  display: block;
  margin-bottom: 0.75rem;
}
input,
textarea {
  display: block;
  width: 100%;
  max-width: 20rem;
}
button {
  margin: 0.5rem 0.5rem 0 0;
}
</style>
