import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import LoginView from "../views/LoginView.vue";
import BrokerView from "../views/BrokerView.vue";
import AdminView from "../views/AdminView.vue";
import { useAuth } from "../composables/useAuth";

const routes: RouteRecordRaw[] = [
  { path: "/", name: "login", component: LoginView },
  { path: "/broker", name: "broker", component: BrokerView },
  { path: "/admin", name: "admin", component: AdminView },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to, from, next) => {
  const { currentUser, isLoaded, fetchMe } = useAuth();

  if (!isLoaded.value) {
    await fetchMe();
  }

  const isAuth = !!currentUser.value;
  const isAdmin = currentUser.value?.isAdmin ?? false;

  // Если уже залогинен, не пускаем на страницу логина
  if (to.name === "login" && isAuth) {
    next({ name: "broker" });
    return;
  }

  // Если не залогинен – пускаем только на login
  if (to.name !== "login" && !isAuth) {
    next({ name: "login" });
    return;
  }

  // Админка только для isAdmin
  if (to.name === "admin" && !isAdmin) {
    next({ name: "broker" });
    return;
  }

  next();
});

export default router;
