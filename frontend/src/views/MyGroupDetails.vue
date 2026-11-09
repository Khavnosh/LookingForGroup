<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { api } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const groupId = route.params.id

const group = ref(null)
const members = ref([])
const allTags = ref([])
const draft = ref(null)
const error = ref('')
const notice = ref('')
const editing = ref(false)

const ROLES = ['member', 'officer', 'leader']

async function load() {
  error.value = ''
  try {
    group.value = (await api(`/api/groups/${groupId}`)).group
    members.value = (await api(`/api/groups/${groupId}/members`)).members
  } catch (err) {
    error.value = err.message
  }
}

function isPicked(tag) {
  return draft.value.tags.some((t) => t.name === tag.name)
}

function toggleTag(tag) {
  if (isPicked(tag)) draft.value.tags = draft.value.tags.filter((t) => t.name !== tag.name)
  else draft.value.tags.push({ id: tag.id, name: tag.name })
}

function editGroup() {
  draft.value = { ...group.value, tags: group.value.tags.map((tag) => ({ ...tag })) }
  editing.value = true
  notice.value = ''
}

function cancelEdit() {
  editing.value = false
  draft.value = null
}

async function saveGroup() {
  if (!confirm('Save these group changes?')) return
  error.value = ''
  try {
    await api(`/api/groups/${groupId}`, {
      method: 'PUT',
      body: {
        name: draft.value.name,
        description: draft.value.description,
        tags: draft.value.tags.map((tag) => tag.name),
      },
    })
    await load()
    cancelEdit()
    notice.value = 'Group updated.'
  } catch (err) {
    error.value = err.message
  }
}

async function saveRole(member) {
  if (!confirm(`Set ${member.username} to "${member.role}"?`)) return
  error.value = ''
  try {
    await api(`/api/groups/${groupId}/members/${member.id}`, {
      method: 'PUT',
      body: { role: member.role },
    })
    notice.value = `${member.username} is now ${member.role}.`
  } catch (err) {
    error.value = err.message
    await load()
  }
}

async function kickMember(member) {
  if (!confirm(`Remove ${member.username} from this group?`)) return
  error.value = ''
  try {
    await api(`/api/groups/${groupId}/members/${member.id}`, { method: 'DELETE' })
    await load()
    notice.value = `${member.username} was removed.`
  } catch (err) {
    error.value = err.message
  }
}

async function deleteGroup() {
  if (!confirm('Delete this group? This cannot be undone.')) return
  if (!confirm('Are you sure? Every member and tag link will be lost.')) return
  error.value = ''
  try {
    await api(`/api/groups/${groupId}`, { method: 'DELETE' })
    router.push({ name: 'MyGroups' })
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
  <section v-if="group">
    <h1>{{ editing ? 'Edit Group Profile' : group.name }}</h1>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="notice" class="notice">{{ notice }}</p>

    <!-- view / edit group profile -->
    <template v-if="!editing">
      <b>Description</b>
      <p>{{ group.description }}</p>

      <b>Project Tags</b>
      <div class="tags">
        <span v-for="tag in group.tags" :key="tag.id" class="tag">{{ tag.name }}</span>
        <span v-if="group.tags.length === 0" class="muted">None recorded</span>
      </div>

      <button @click="editGroup">Edit Group Profile</button>
      <button class="danger" @click="deleteGroup">Delete Group</button>
    </template>

    <template v-else>
      <label>
        Group Name
        <input v-model="draft.name" type="text" />
      </label>
      <label>
        Description
        <textarea v-model="draft.description" rows="3"></textarea>
      </label>

      <label>Project Tags</label>
      <div class="check-list">
        <label v-for="tag in allTags" :key="tag.id">
          <input type="checkbox" :checked="isPicked(tag)" @change="toggleTag(tag)" />
          {{ tag.name }}
        </label>
      </div>

      <button @click="saveGroup">Save</button>
      <button class="quiet" @click="cancelEdit">Cancel</button>
    </template>

    <div class="divider"></div>

    <!-- member list -->
    <h2>Member List</h2>
    <p v-if="members.length === 0" class="muted">No members yet.</p>
    <ul class="list">
      <li v-for="member in members" :key="member.id" class="entry" style="cursor: default">
        <span class="name">{{ member.username }}</span>
        <span class="meta">
          {{ member.id === group.owner.id ? 'Owner' : member.role }}
        </span>

        <template v-if="member.id !== group.owner.id">
          <div class="row">
            <select v-model="member.role">
              <option v-for="role in ROLES" :key="role" :value="role">{{ role }}</option>
            </select>
            <button @click="saveRole(member)">Edit Member Role</button>
            <button class="danger" @click="kickMember(member)">Kick Member</button>
          </div>
        </template>
      </li>
    </ul>
  </section>
</template>
