import { ref, watchEffect } from "vue";


const isDarkMode = ref<boolean>(
  localStorage.getItem("theme") === "dark" ||
    (!localStorage.getItem("theme") &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
);

watchEffect(() => {
  if (isDarkMode.value) {
    document.documentElement.classList.add("dark");
    localStorage.setItem("theme", "dark");
  } else {
    document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", "light");
  }
});

export function useTheme() {
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
  };

  return { isDarkMode, toggleTheme };
}
