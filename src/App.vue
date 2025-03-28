<script setup>
import DeixaBettingInterface from "./components/DeixaBettingInterface.vue";
</script>

<template>
  <DeixaBettingInterface />
</template>

<style>
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");

/* Reset some default styles that might interfere with our layout */
body {
  margin: 0;
  padding: 0;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
}

#app {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  display: block;
}

/* Add viewport meta tag for better mobile experience */
@media (min-width: 1024px) {
  body {
    display: block;
  }

  #app {
    display: block;
    grid-template-columns: none;
    padding: 0;
  }
}

/* Improve touch targets for mobile */
@media (max-width: 768px) {
  button,
  [role="button"],
  .category-button,
  .date-card,
  .action-button {
    min-height: 44px; /* Minimum touch target size */
  }
}

/* Fix iOS date input appearance */
@supports (-webkit-touch-callout: none) {
  input[type="date"] {
    -webkit-appearance: none;
    appearance: none;
    min-height: 44px;
  }
}
</style>
