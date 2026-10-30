document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  const storedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  let currentTheme = storedTheme || (systemPrefersDark ? 'dark' : 'light');
  document.body.setAttribute('data-theme', currentTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.body.setAttribute('data-theme', currentTheme);
      localStorage.setItem('theme', currentTheme);
    });
  }
});
