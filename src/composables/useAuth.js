import { ref, computed, watchEffect } from "vue";

// In a real application, this would connect to a backend authentication system
// This is a simplified version for demonstration purposes
export function useAuth() {
  // Admin credentials (in a real app, this would be handled securely on the server)
  const ADMIN_PASSWORD = "admin123";

  // Authentication state
  const isAuthenticated = ref(false);
  const authError = ref("");

  // Check if user is already authenticated (from localStorage)
  const initAuth = () => {
    const savedAuth = localStorage.getItem("deixa_auth");
    if (savedAuth === "true") {
      isAuthenticated.value = true;
    }
  };

  // Save authentication state to localStorage
  watchEffect(() => {
    localStorage.setItem("deixa_auth", isAuthenticated.value);
  });

  // Login function
  const login = (password) => {
    if (password === ADMIN_PASSWORD) {
      isAuthenticated.value = true;
      authError.value = "";
      return true;
    } else {
      authError.value = "Contraseña incorrecta";
      return false;
    }
  };

  // Logout function
  const logout = () => {
    isAuthenticated.value = false;
    localStorage.removeItem("deixa_auth");
  };

  // Initialize authentication state
  initAuth();

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    authError,
    login,
    logout,
  };
}
