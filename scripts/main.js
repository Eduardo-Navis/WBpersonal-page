const heroBackground = new Image();
heroBackground.src = window.matchMedia("(min-width: 761px)").matches
  ? "assets/Acad.jpg"
  : "assets/W/WB.png";

function revealHeroContent() {
  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => document.documentElement.classList.add("is-ready"));
  });
}

if (heroBackground.complete) {
  revealHeroContent();
} else {
  heroBackground.addEventListener("load", revealHeroContent, { once: true });
  heroBackground.addEventListener("error", revealHeroContent, { once: true });
}

const topbar = document.querySelector(".topbar");
const hero = document.querySelector(".hero");
let previousScrollY = window.scrollY;

function updateHeaderState() {
  if (!topbar || !hero) return;
  const currentScrollY = Math.max(window.scrollY, 0);

  topbar.classList.toggle("is-scrolled", currentScrollY > 12);
  topbar.classList.toggle("is-compact", hero.getBoundingClientRect().bottom <= 70);

  if (currentScrollY <= 150) {
    topbar.classList.remove("is-hidden");
  } else if (currentScrollY > previousScrollY) {
    topbar.classList.add("is-hidden");
  } else if (currentScrollY < previousScrollY) {
    topbar.classList.remove("is-hidden");
  }

  previousScrollY = currentScrollY;
}

window.addEventListener("scroll", updateHeaderState, { passive: true });
window.addEventListener("resize", updateHeaderState);
updateHeaderState();

const revealItems = document.querySelectorAll("[data-reveal]");

const revealObserver = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      entry.target.setAttribute("data-reveal", "visible");
      observer.unobserve(entry.target);
    });
  },
  { threshold: 0.16, rootMargin: "0px 0px -6%" }
);

revealItems.forEach((item) => revealObserver.observe(item));

const caseNames = document.querySelectorAll("[data-case-name]");

if (caseNames.length) {
  const caseNameObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.setAttribute("data-case-name", "visible");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.45, rootMargin: "0px 0px -8%" }
  );

  caseNames.forEach((caseName) => caseNameObserver.observe(caseName));
}

const goalCards = document.querySelectorAll(".goal-card");

goalCards.forEach((card) => {
  const trigger = card.querySelector(".goal-card__trigger");

  trigger.addEventListener("click", () => {
    const willOpen = !card.classList.contains("is-open");

    goalCards.forEach((item) => {
      item.classList.remove("is-open");
      item.querySelector(".goal-card__trigger").setAttribute("aria-expanded", "false");
      item.querySelector(".goal-card__details").setAttribute("aria-hidden", "true");
    });

    if (willOpen) {
      card.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      card.querySelector(".goal-card__details").setAttribute("aria-hidden", "false");
    }
  });
});

const typewriter = document.querySelector("[data-typewriter]");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (typewriter && !reduceMotion.matches) {
  const words = ["evoluir", "melhorar", "crescer", "construir", "recuperar"];
  const wait = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));
  let wordIndex = 0;

  async function cycleTypewriter() {
    while (true) {
      await wait(1800);

      const currentWord = words[wordIndex];
      for (let length = currentWord.length - 1; length >= 0; length -= 1) {
        typewriter.textContent = currentWord.slice(0, length);
        await wait(58 + Math.random() * 34);
      }

      await wait(220);
      wordIndex = (wordIndex + 1) % words.length;
      const nextWord = words[wordIndex];

      for (let length = 1; length <= nextWord.length; length += 1) {
        typewriter.textContent = nextWord.slice(0, length);
        await wait(82 + Math.random() * 55);
      }
    }
  }

  cycleTypewriter();
}
