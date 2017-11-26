<template>
  <nav>
    <router-link
      :to="item.slug"
      :key="item.slug"
      :class="{'is-selected': selected.slug === item.slug}"
      v-for="item in items"
    >
      {{ item.label }}
    </router-link>
  </nav>
</template>

<script>
  export default {
    props: {
      items: Array,
      selected: Object,
    },
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
