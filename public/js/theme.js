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

    var carousel = document.getElementById("hero-carousel");
    if (carousel) {
      var slides = carousel.querySelectorAll(".hero-slide");
      var dots = carousel.querySelectorAll(".hero-dot");
      var current = 0;
      var timer = null;

      function goTo(index) {
        slides[current].classList.remove("is-active");
        if (dots[current]) dots[current].classList.remove("is-active");
        current = index;
        slides[current].classList.add("is-active");
        if (dots[current]) dots[current].classList.add("is-active");
      }

      function next() {
        goTo((current + 1) % slides.length);
      }

      function start() {
        if (slides.length > 1) {
          timer = setInterval(next, 6000);
        }
      }

      function stop() {
        if (timer) clearInterval(timer);
      }

      dots.forEach(function (dot) {
        dot.addEventListener("click", function () {
          stop();
          goTo(parseInt(dot.getAttribute("data-index"), 10));
          start();
        });
      });

      carousel.addEventListener("mouseenter", stop);
      carousel.addEventListener("mouseleave", start);
      start();
    }

    var navToggle = document.querySelector(".nav-toggle");
    var nav = document.querySelector(".main-nav");
    if (navToggle && nav) {
      navToggle.addEventListener("click", function () {
        var isOpen = nav.classList.toggle("is-open");
        navToggle.textContent = isOpen ? "✕" : "☰";
        navToggle.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
      });
      nav.querySelectorAll(".nav-dropdown a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("is-open");
          navToggle.textContent = "☰";
        });
      });
      nav.querySelectorAll(".main-nav > ul > li > a").forEach(function (link) {
        link.addEventListener("click", function () {
          nav.classList.remove("is-open");
          navToggle.textContent = "☰";
        });
      });
    }

    document.querySelectorAll(".nav-group-toggle").forEach(function (toggle) {
      toggle.addEventListener("click", function (e) {
        e.stopPropagation();
        var group = toggle.closest(".nav-group");
        var isOpen = group.classList.contains("is-open");
        document.querySelectorAll(".nav-group.is-open").forEach(function (g) {
          if (g !== group) g.classList.remove("is-open");
        });
        group.classList.toggle("is-open", !isOpen);
        toggle.setAttribute("aria-expanded", String(!isOpen));
      });
    });

    document.addEventListener("click", function (e) {
      if (!e.target.closest(".nav-group")) {
        document.querySelectorAll(".nav-group.is-open").forEach(function (g) {
          g.classList.remove("is-open");
        });
      }
    });
  });
})();
