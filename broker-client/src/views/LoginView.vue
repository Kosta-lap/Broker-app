<template>
  <div class="row justify-content-center">
    <div class="col-md-7 col-lg-6">
      <div class="card p-4">
        <h3 class="mb-3">Вход в приложение</h3>

        <ul class="nav nav-tabs mb-3">
          <li class="nav-item">
            <button class="nav-link" :class="{ active: mode === 'login' }" @click="mode = 'login'; error = ''" type="button">
              Вход
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link" :class="{ active: mode === 'register' }" @click="mode = 'register'; error = ''" type="button">
              Регистрация брокера
            </button>
          </li>
        </ul>

        <!-- Вход -->
        <form v-if="mode === 'login'" @submit.prevent="onLogin">
          <div class="mb-3">
            <label class="form-label">Брокер</label>
            <select v-model="loginName" class="form-select">
              <option value="">— Выберите брокера —</option>
              <option v-for="b in brokers" :key="b.id" :value="b.name">
                {{ b.name }} <span v-if="b.isAdmin">[admin]</span>
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Пароль</label>
            <input v-model="loginPassword" type="password" class="form-control" />
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <button type="submit" class="btn btn-outline-info">Войти</button>
            <span class="text-danger" v-if="error">{{ error }}</span>
          </div>
        </form>

        <!-- Регистрация -->
        <form v-else @submit.prevent="onRegister">
          <div class="mb-3">
            <label class="form-label">Имя брокера</label>
            <input v-model="regName" type="text" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label">Пароль</label>
            <input v-model="regPassword" type="password" class="form-control" />
          </div>

          <div class="mb-3">
            <label class="form-label">Начальный баланс</label>
            <input v-model.number="regBalance" type="number" class="form-control" min="0" />
          </div>

          <div class="d-flex justify-content-between align-items-center">
            <button type="submit" class="btn btn-outline-info">Зарегистрировать</button>
            <span class="text-danger" v-if="error">{{ error }}</span>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api/http";
import type { Broker } from "../types";
import { useAuth } from "../composables/useAuth";

const router = useRouter();
const { login } = useAuth();

const brokers = ref<Broker[]>([]);
const error = ref("");

const mode = ref<"login" | "register">("login");

// login
const loginName = ref("");
const loginPassword = ref("");

// register
const regName = ref("");
const regPassword = ref("");
const regBalance = ref(100000);

const loadBrokers = async () => {
  const { data } = await api.get<Broker[]>("/brokers");
  brokers.value = data;
};

onMounted(() => {
  loadBrokers().catch((e) => {
    console.error(e);
    error.value = "Ошибка загрузки списка брокеров";
  });
});

const onLogin = async () => {
  error.value = "";
  if (!loginName.value.trim() || !loginPassword.value) {
    error.value = "Укажите брокера и пароль";
    return;
  }
  try {
    await login(loginName.value.trim(), loginPassword.value);
    router.push({ name: "broker" });
  } catch (e: any) {
    console.error(e);
    error.value = e?.response?.data?.message ?? "Ошибка входа";
  }
};

const onRegister = async () => {
  error.value = "";

  if (!regName.value.trim() || !regPassword.value) {
    error.value = "Имя и пароль обязательны";
    return;
  }

  try {
    const { data } = await api.post<Broker>("/brokers", {
      name: regName.value.trim(),
      balance: regBalance.value,
      password: regPassword.value,
    });

    await login(data.name, regPassword.value);
    router.push({ name: "broker" });
  } catch (e: any) {
    console.error(e);
    error.value = e?.response?.data?.message ?? "Ошибка регистрации";
  }
};
</script>
