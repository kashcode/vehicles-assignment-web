<template>
<section style="margin-top: 20px;">
  <div class="container">    
    <router-view />
  </div>  
</section>
</template>
<script>
export default {
  name: "App",
  created() {
    if (
      "-ms-scroll-limit" in document.documentElement.style &&
      "-ms-ime-align" in document.documentElement.style
    ) {
      // detect it's IE11
      window.addEventListener(
        "hashchange",
        (event) => {
          var currentPath = window.location.hash.slice(1);
          if (this.$route.path !== currentPath) {
            this.$router.push(currentPath);
          }
        },
        false
      );
    }
  },
};
</script>
