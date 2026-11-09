<template>
  <section>
    <h1>Recruits</h1>
    <p>Look into some possible recruits for your indie project!</p>
  </section>

  <div v-for="recruit in recruits" @click="routeToRecruitDetail(recruit.id)">
    <div> {{ recruit.name }}</div>
    <div>
        <p>Interested in: </p>
        <div v-for="tag in recruit.tags">
            {{ tag.name }}
        </div>
    </div>
  </div>
</template>

<script setup>

import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const route = useRoute()
const router = useRouter()
const { login } = useAuth()

const recruits = ref([])

function routeToRecruitDetail(id){
    // route to recruit's detail here
    router.push(route.query.redirect || { name: 'RecruitDetails' })
}

</script>
