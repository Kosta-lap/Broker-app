<template>
    <div class="wrapper vh-100">
        <header class="py-3 bg-info-subtle">
            <div class="container">
                <Navbar />
            </div>
        </header>
        <main class="container py-4">
            <router-view />
        </main>
    </div>
</template>

<script setup lang="ts">
import Navbar from "./components/Navbar.vue";
</script>
