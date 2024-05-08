document.addEventListener("astro:page-load", () => {
  document.querySelector(".hamburger").addEventListener("click", () => {
    const nav = document.querySelector(".nav-links");
    nav.classList.toggle("expanded");
  });
});
