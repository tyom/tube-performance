<template>
  <nav>
    <a :href="`/${item.slug}`" v-for="item in items">{{ item.label }}</a>
  </nav>
</template>

<script>
  export default {
    props: ['items']
  }
</script>

<style scoped>
  nav {
    border-bottom: 1px solid #ddd;
    padding: 20px;
  }

  nav a {
    margin-right: 10px;
  }
</style>
