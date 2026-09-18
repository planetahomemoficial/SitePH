(function () {
  var STORAGE_KEY = "ph-theme";
  var saved = null;
  try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
  var theme = saved || "light";
  document.documentElement.setAttribute("data-theme", theme);

  function updateIcon(btn, theme) {
    if (!btn) return;
    btn.textContent = theme === "dark" ? "☀️" : "🌙";
    btn.setAttribute("aria-label", theme === "dark" ? "Ativar modo claro" : "Ativar modo escuro");
  }

  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".theme-toggle");
    updateIcon(btn, theme);
    if (btn) {
      btn.addEventListener("click", function () {
        theme = theme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", theme);
        try { localStorage.setItem(STORAGE_KEY, theme); } catch (e) {}
        updateIcon(btn, theme);
      });
    }

    var navToggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (navToggle && nav) {
      navToggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("is-open");
        navToggle.textContent = isOpen ? "✕" : "☰";
        navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
      });
      nav.querySelectorAll("a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("is-open");
          navToggle.textContent = "☰";
        });
      });
    }
  });
})();
