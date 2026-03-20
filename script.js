const {
  getSiteData,
  normalizeSiteData,
} = window.FUXCSite;

const sectionButtons = Array.from(document.querySelectorAll("[data-target]"));
const railDots = Array.from(document.querySelectorAll(".rail-dot"));
const panels = Array.from(document.querySelectorAll(".panel"));
const filterChips = Array.from(document.querySelectorAll(".filter-chip"));
const cardGrid = document.getElementById("card-grid");
const visibleCount = document.getElementById("visible-count");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const cardModal = document.getElementById("card-modal");
const modalVisual = document.getElementById("modal-visual");
const modalLabel = document.getElementById("modal-label");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalMeta = document.getElementById("modal-meta");
const modalTags = document.getElementById("modal-tags");
const modalGithubLink = document.getElementById("modal-github-link");

let activeFilter = "all";
let siteData = normalizeSiteData({});
let activeModalCardId = "";

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function scrollToPanel(panelId) {
  const target = document.getElementById(panelId);
  if (!target) {
    return;
  }

  target.scrollIntoView({
    behavior: reducedMotion ? "auto" : "smooth",
    block: "start",
  });
}

function updateRail(sectionId) {
  railDots.forEach((dot) => {
    dot.classList.toggle("is-active", dot.dataset.target === sectionId);
  });
}

function applyHeroContent() {
  document.getElementById("hero-kicker").textContent = siteData.hero.kicker;
  document.getElementById("hero-lead").textContent = siteData.hero.lead;
  document.getElementById("hero-title").textContent = siteData.hero.title;
  document.getElementById("hero-subtitle").textContent = siteData.hero.subtitle;
  document.getElementById("hero-description").textContent = siteData.hero.description;
  document.getElementById("hero-primary-action").textContent = siteData.hero.primaryActionText;
  document.getElementById("hero-secondary-action").textContent = siteData.hero.secondaryActionText;
}

function applyCatalogContent() {
  document.getElementById("catalog-section-tag").textContent = siteData.catalog.sectionTag;
  document.getElementById("catalog-title").textContent = siteData.catalog.title;
  document.getElementById("catalog-description").textContent = siteData.catalog.description;
}

function getFilteredCards(filter) {
  return filter === "all"
    ? siteData.cards
    : siteData.cards.filter((item) => item.type === filter);
}

function isCardNew(card) {
  if (!card.createdAt) {
    return false;
  }

  const createdTime = new Date(card.createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return false;
  }

  return Date.now() - createdTime <= 2 * 24 * 60 * 60 * 1000;
}

function renderCardBadge(card) {
  if (isCardNew(card)) {
    return '<span class="card-badge is-new">NEW</span>';
  }

  if (!card.badge) {
    return "";
  }

  return `<span class="card-badge">${escapeHtml(card.badge)}</span>`;
}

function renderCards(filter) {
  const filtered = getFilteredCards(filter);
  visibleCount.textContent = String(filtered.length).padStart(2, "0");

  cardGrid.innerHTML = filtered
    .map(
      (item) => `
        <button class="work-card" type="button" data-card-id="${escapeHtml(item.id)}">
          <div class="card-top">
            <span class="card-type">${escapeHtml(item.label)}</span>
            ${renderCardBadge(item)}
          </div>
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="card-description">${escapeHtml(item.description)}</p>
          </div>
          <div class="card-meta">
            ${item.stack ? `<span>${escapeHtml(item.stack)}</span>` : ""}
            ${item.mode ? `<span>${escapeHtml(item.mode)}</span>` : ""}
          </div>
          <div class="tag-list">
            ${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
        </button>
      `
    )
    .join("");
}

function renderModal(card) {
  modalLabel.textContent = card.label;
  modalTitle.textContent = card.title;
  modalDescription.textContent = card.description;
  modalMeta.innerHTML = [card.stack, card.mode]
    .filter(Boolean)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  modalTags.innerHTML = card.tags
    .map((tag) => `<span>${escapeHtml(tag)}</span>`)
    .join("");

  if (card.githubUrl) {
    modalGithubLink.href = card.githubUrl;
    modalGithubLink.classList.remove("is-disabled");
  } else {
    modalGithubLink.href = "#";
    modalGithubLink.classList.add("is-disabled");
  }

  modalVisual.innerHTML = card.screenshot
    ? `<img src="${escapeHtml(card.screenshot)}" alt="${escapeHtml(card.title)} 截图" />`
    : `<div class="card-modal-placeholder">${escapeHtml(card.title)}</div>`;
}

function openModal(cardId) {
  const card = siteData.cards.find((item) => item.id === cardId);
  if (!card) {
    return;
  }

  activeModalCardId = cardId;
  renderModal(card);
  document.body.classList.add("modal-open");
  cardModal.hidden = false;
}

function closeModal() {
  activeModalCardId = "";
  cardModal.hidden = true;
  document.body.classList.remove("modal-open");
}

async function refreshSiteData() {
  siteData = normalizeSiteData(await getSiteData());
  applyHeroContent();
  applyCatalogContent();
  renderCards(activeFilter);

  if (activeModalCardId) {
    const currentCard = siteData.cards.find((item) => item.id === activeModalCardId);
    if (currentCard) {
      renderModal(currentCard);
    } else {
      closeModal();
    }
  }
}

sectionButtons.forEach((button) => {
  button.addEventListener("click", (event) => {
    const target = event.currentTarget.dataset.target;
    if (!target) {
      return;
    }

    event.preventDefault();
    scrollToPanel(target);
  });
});

filterChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    activeFilter = chip.dataset.filter || "all";
    filterChips.forEach((button) => {
      const isActive = button === chip;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-selected", String(isActive));
    });
    renderCards(activeFilter);
  });
});

cardGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-card-id]");
  if (!card) {
    return;
  }
  openModal(card.dataset.cardId);
});

cardModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-modal]")) {
    closeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cardModal.hidden) {
    closeModal();
  }
});

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        updateRail(entry.target.dataset.section);
      }
    });
  },
  {
    threshold: 0.55,
  }
);

panels.forEach((panel) => sectionObserver.observe(panel));

refreshSiteData();
