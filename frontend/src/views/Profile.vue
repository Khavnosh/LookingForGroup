<script setup>
import { onMounted, ref } from 'vue'
import { api, useAuth } from '../composables/useAuth'

const { setUser } = useAuth()

const profile = ref(null)
const draft = ref(null)
const newTag = ref('')
const allTags = ref([])
const error = ref('')
const editing = ref(false)

function isPicked(tag) {
  return draft.value.tags.some((t) => t.name === tag.name)
}

function toggleTag(tag) {
  if (isPicked(tag)) draft.value.tags = draft.value.tags.filter((t) => t.name !== tag.name)
  else draft.value.tags.push({ id: tag.id, name: tag.name })
}

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

function removeTag(name) {
  draft.value.tags = draft.value.tags.filter((tag) => tag.name !== name)
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

onMounted(async () => {
  await load()
  allTags.value = (await api('/api/tags')).tags
})
</script>

<template>
  <section v-if="profile">
    <h1>My Profile</h1>
    <p v-if="error" class="error">{{ error }}</p>

    <template v-if="!editing">
      <b>Name</b>
      <p>{{ profile.username }}</p>

      <b>Who Am I?</b>
      <p>{{ profile.description || 'Your tale is still unwritten.' }}</p>

      <b>My Interests</b>
      <div class="tags">
        <span v-for="tag in profile.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
        <span v-if="profile.tags.length === 0" class="muted">None recorded</span>
      </div>

      <b>Availability</b>
      <p>{{ profile.availability || '—' }}</p>

      <b>Email</b>
      <p>{{ profile.email }}</p>

      <b>Discord Tag</b>
      <p>{{ profile.discordTag || '—' }}</p>

      <div class="divider"></div>
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

      <label>My Interests</label>
      <div class="check-list">
        <label v-for="tag in allTags" :key="tag.id">
          <input type="checkbox" :checked="isPicked(tag)" @change="toggleTag(tag)" />
          {{ tag.name }}
        </label>
      </div>

      <div class="tags">
        <span v-for="tag in draft.tags.filter((t) => !allTags.some((o) => o.name === t.name))" :key="tag.name">
          {{ tag.name }}
          <button class="quiet" type="button" @click="removeTag(tag.name)">x</button>
        </span>
      </div>

      <div class="row">
        <input v-model="newTag" type="text" placeholder="Add your own tag" @keyup.enter="addTag" />
        <button class="quiet" type="button" @click="addTag">Add</button>
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
        Discord Tag
        <input v-model="draft.discordTag" type="text" />
      </label>

      <div class="divider"></div>
      <button @click="confirmEdit">Save</button>
      <button class="quiet" @click="cancelEdit">Cancel</button>
    </template>
  </section>
</template>
