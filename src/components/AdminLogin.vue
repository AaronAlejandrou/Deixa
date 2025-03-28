
<template>
  <div class="admin-login">
    <h3>Acceso Administrador</h3>
    <div class="login-form">
      <div class="form-group">
        <label for="password">Contraseña</label>
        <input
          type="password"
          id="password"
          v-model="password"
          @keyup.enter="handleLogin"
          placeholder="Ingrese la contraseña de administrador"
        />
      </div>
      <div v-if="authError" class="error-message">{{ authError }}</div>
      <button class="login-button" @click="handleLogin">Ingresar</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  authError: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["login"]);

const password = ref("");

function handleLogin() {
  emit("login", password.value);
}
</script>

<style scoped>
.admin-login {
  background-color: white;
  border-radius: 12px;
  border: 1px solid #a5b5a6;
  padding: 20px;
  max-width: 400px;
  margin: 0 auto 40px;
  font-family: "Inter", sans-serif;
}

h3 {
  color: #1f2937;
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 18px;
  font-weight: 600;
  text-align: center;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

label {
  font-size: 14px;
  color: #666;
}

input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
}

input:focus {
  outline: none;
  border-color: #a5b5a6;
}

.login-button {
  background-color: #a5b5a6;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px;
  font-family: "Inter", sans-serif;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #94a395;
}

.error-message {
  color: #e53e3e;
  font-size: 14px;
  text-align: center;
}
</style>
