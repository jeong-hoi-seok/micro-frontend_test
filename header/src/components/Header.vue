<template>
  <header class="header">
    <div class="header-logo">MicroFE</div>
    <nav class="header-nav">
      <a href="#" class="nav-link">Home</a>
      <a href="#" class="nav-link">About</a>
      <a href="#" class="nav-link">Contact</a>
    </nav>
    <div class="header-badge">Vue {{ vueVersion }}</div>
  </header>
</template>

<script>
import { version } from "vue";

export default {
  name: "AppHeader",
  data() {
    return {
      vueVersion: version,
    };
  },
};
</script>

<style scoped>
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #1a1a2e;
  color: #fff;
  padding: 16px 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.header-logo {
  font-size: 22px;
  font-weight: bold;
  color: #e94560;
}

.header-nav {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: #eee;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.2s;
}

.nav-link:hover {
  color: #e94560;
}

.header-badge {
  background: rgba(233, 69, 96, 0.2);
  color: #e94560;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}
</style>
