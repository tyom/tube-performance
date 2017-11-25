<template>
  <nav>
    <a :href="`/${item.slug}`" v-for="item in items" :class="{'is-selected': item.isSelected}">
      {{ item.label }}
    </a>
  </nav>
</template>

<script>
  export default {
    props: ['items']
  }
</script>

<style scoped>
  nav {
    background: #24322d;
    display: flex;
  }

  a {
    color: #fff;
    text-decoration: none;
    padding: 20px;
    opacity: .9;
  }

  a:hover {
    background-color: #ffffff0f;
    opacity: 1;
  }

  a:active {
    background-color: #ffffff22;
    opacity: 1;
  }

  .is-selected,
  .is-selected:hover {
    background-color: #ffffffdd;
    opacity: 1;
    font-weight: bold;
    color: #24322d;
  }
</style>
