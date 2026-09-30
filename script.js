// Mobile menu toggle
const toggle = document.querySelector('.menu-toggle');
const nav = document.getElementById('main-nav');

toggle.addEventListener('click', () => {
  const open = nav.classList.toggle('is-open');
  toggle.setAttribute('aria-expanded', open);
  toggle.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
});

// Close the menu after tapping a link
nav.querySelectorAll('a').forEach((link) =>
  link.addEventListener('click', () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
  })
);

// Current year in the footer
document.getElementById('year').textContent = new Date().getFullYear();
