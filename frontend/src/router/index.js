import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Recruits from '../views/Recruits.vue'
import RecruitDetails from '../views/RecruitDetails.vue'
import Groups from '../views/Groups.vue'
import GroupDetails from '../views/GroupDetails.vue'
import MyGroups from '../views/MyGroups.vue'
import MyGroupDetails from '../views/MyGroupDetails.vue'
import MakeGroup from '../views/MakeGroup.vue'
import Mail from '../views/Mail.vue'
import Profile from '../views/Profile.vue'
import { useAuth } from '../composables/useAuth'

const routes = [
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  { path: '/recruits', name: 'Recruits', component: Recruits, meta: { requiresAuth: true } },
  {
    path: '/recruits/:id',
    name: 'RecruitDetails',
    component: RecruitDetails,
    meta: { requiresAuth: true },
    props: true
  },
  { path: '/groups', name: 'Groups', component: Groups, meta: { requiresAuth: true } },
  {
    path: '/groups/:id',
    name: 'GroupDetails',
    component: GroupDetails,
    meta: { requiresAuth: true },
    props: true
  },
  { path: '/my-groups', name: 'MyGroups', component: MyGroups, meta: { requiresAuth: true } },
  { path: '/my-groups/new', name: 'MakeGroup', component: MakeGroup, meta: { requiresAuth: true } },
  {
    path: '/my-groups/:id',
    name: 'MyGroupDetails',
    component: MyGroupDetails,
    meta: { requiresAuth: true },
    props: true
  },
  { path: '/profile', name: 'Profile', component: Profile, meta: { requiresAuth: true } },
  { path: '/mail', name: 'Mail', component: Mail, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const { isLoggedIn, restore } = useAuth()
  await restore()

  if (to.meta.requiresAuth && !isLoggedIn.value) {
    return { name: 'Login', query: { redirect: to.fullPath } }
  }
  if ((to.name === 'Login' || to.name === 'Register') && isLoggedIn.value) {
    return { name: 'Home' }
  }
})

export default router
