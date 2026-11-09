import { computed, reactive } from 'vue'

const state = reactive({
  user: null,
  token: localStorage.getItem('token'),
})

let restorePromise = null

async function api(path, { method = 'GET', body } = {}) {
  const res = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(state.token ? { Authorization: `Bearer ${state.token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

function setSession(data) {
  state.token = data.token
  state.user = data.user
  localStorage.setItem('token', data.token)
  restorePromise = Promise.resolve(data.user)
}

function clearSession() {
  state.token = null
  state.user = null
  localStorage.removeItem('token')
  restorePromise = null
}

export function useAuth() {
  const user = computed(() => state.user)
  const isLoggedIn = computed(() => !!state.user)

  async function login(username, password) {
    setSession(await api('/api/login', { method: 'POST', body: { username, password } }))
  }

  async function register(username, email, password) {
    setSession(await api('/api/register', { method: 'POST', body: { username, email, password } }))
  }

  function logout() {
    clearSession()
  }

  // Called from the router guard so a hard refresh keeps the session.
  function restore() {
    if (!state.token) return Promise.resolve(null)
    if (!restorePromise) {
      restorePromise = api('/api/me')
        .then((data) => {
          state.user = data.user
          return data.user
        })
        .catch(() => {
          clearSession()
          return null
        })
    }
    return restorePromise
  }

  return { user, isLoggedIn, login, register, logout, restore }
}
