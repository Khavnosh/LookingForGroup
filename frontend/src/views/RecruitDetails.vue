<template>
  <section>
    <h1>{{ recruit.name}}</h1>
    <b>Who Am I?</b><br>
    <p>{{ recruit.details }}</p>
    <b>Interests:</b><br>
    <div v-for="tag in recruit.tags">
        <div>
            {{ tag.name }}
        </div>
    </div>
  </section>
</template>

<script setup>
    import { ref } from 'vue'
    import { useRoute, useRouter } from 'vue-router'
    import { useAuth } from '../composables/useAuth'

    const recruit = ref([])

</script>
