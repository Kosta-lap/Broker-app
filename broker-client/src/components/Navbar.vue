<template>
    <nav class="navbar navbar-expand-lg navbar-dark">
        <div class="container-fluid p-0">
            <RouterLink to="/" class="navbar-brand">Broker App</RouterLink>

            <button class="navbar-toggler" data-bs-toggle="collapse" data-bs-target="#nav">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div id="nav" class="collapse navbar-collapse justify-content-end">
                <ul class="navbar-nav">
                    <li class="nav-item" v-if="!user">
                        <RouterLink to="/" class="nav-link">Вход</RouterLink>
                    </li>
                    <li class="nav-item" v-if="user">
                        <RouterLink to="/broker" class="nav-link">Личный кабинет</RouterLink>
                    </li>
                    <li class="nav-item" v-if="user?.isAdmin">
                        <RouterLink to="/admin" class="nav-link">Админ-панель</RouterLink>
                    </li>
                </ul>

                <button v-if="user" class="btn btn-outline-danger" @click="onLogout">
                    Выйти
                </button>
            </div>
        </div>
    </nav>
    <div>
        <span class="navbar-text me-3" v-if="user">
            Брокер: <strong>{{ user.name }}</strong>
            <span v-if="user.isAdmin" class="badge bg-info text-dark ms-2">Admin</span>
        </span>
    </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { RouterLink, useRouter } from "vue-router";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { currentUser, logout } = useAuth();

const user = computed(() => currentUser.value);

const onLogout = async () => {
    await logout();
    router.push({ name: "login" });
};

</script>
