<template>
  <section>
    <h1>Profile</h1>
    <div @click="editName()">Name: {{ user.name }}</div><br>
    <div @click="editDesc()">Who Am I? <br> {{ user.description }}</div>
    <div> My Interests: </div>
    <div v-for="tag in recruit.tags">
            {{ tag.name }}
    </div>
    <button @click="addTag()"> + </button>
    <br>
    <div @click="editEmail()">Email: {{ user.email }}</div><br>
    <div @click="editDiscordTag()">Discord tag: {{ user.discord }}</div>
  </section>
</template>

<script setup>
import { useRoute } from 'vue-router';

const user = ref()
  

</script>
