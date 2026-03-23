const {
  getSiteData,
  getSession,
  createCard,
  normalizeSiteData,
  uploadImage,
} = window.FUXCSite;

const filterBar = document.getElementById("cards-filter-bar");
const cardGrid = document.getElementById("cards-page-grid");
const visibleCount = document.getElementById("cards-visible-count");
const cardsPageUser = document.getElementById("cards-page-user");
const cardsPageAddButton = document.getElementById("cards-page-add-button");
const cardModal = document.getElementById("card-modal");
const modalVisual = document.getElementById("modal-visual");
const modalLabel = document.getElementById("modal-label");
const modalTitle = document.getElementById("modal-title");
const modalDescription = document.getElementById("modal-description");
const modalMeta = document.getElementById("modal-meta");
const modalTags = document.getElementById("modal-tags");
const modalGithubLink = document.getElementById("modal-github-link");
const creatorModal = document.getElementById("creator-modal");
const creatorForm = document.getElementById("creator-form");
const creatorTypeInput = document.getElementById("creator-type");
const creatorTitleInput = document.getElementById("creator-title");
const creatorDescriptionInput = document.getElementById("creator-description");
const creatorStackInput = document.getElementById("creator-stack");
const creatorModeInput = document.getElementById("creator-mode");
const creatorTagsInput = document.getElementById("creator-tags");
const creatorGithubInput = document.getElementById("creator-github");
const creatorScreenshotInput = document.getElementById("creator-screenshot");
const creatorScreenshotFileInput = document.getElementById("creator-screenshot-file");
const creatorPreview = document.getElementById("creator-preview");
const creatorError = document.getElementById("creator-error");

let activeFilter = "all";
let siteData = normalizeSiteData({});
let session = {
  authenticated: false,
  username: "",
  role: "guest",
  isAdmin: false,
};
let activeModalCardId = "";
let filterChips = [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatCardTime(value) {
  if (!value) {
    return "时间待补充";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function getErrorMessage(error, fallback) {
  if (error?.payload?.error) {
    return error.payload.error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function getAppTypes() {
  return Array.isArray(siteData.appTypes) && siteData.appTypes.length > 0
    ? siteData.appTypes
    : [{ id: "all", label: "全部" }];
}

function renderFilterBar() {
  const buttons = [
    '<button class="filter-chip is-active" data-filter="all" role="tab" aria-selected="true">全部</button>',
    ...getAppTypes().map(
      (type) => `
        <button class="filter-chip" data-filter="${escapeHtml(type.id)}" role="tab" aria-selected="false">
          ${escapeHtml(type.label)}
        </button>
      `
    ),
  ];

  filterBar.innerHTML = buttons.join("");
  filterChips = Array.from(filterBar.querySelectorAll(".filter-chip"));
  filterChips.forEach((chip) => {
    chip.addEventListener("click", () => {
      setActiveFilter(chip.dataset.filter || "all");
    });
  });
}

function renderTypeOptions(selectElement, selectedType = "") {
  const appTypes = getAppTypes();
  const options = getAppTypes()
    .map(
      (type) => `
        <option value="${escapeHtml(type.id)}" ${type.id === selectedType ? "selected" : ""}>
          ${escapeHtml(type.label)}
        </option>
      `
    )
    .join("");

  selectElement.innerHTML = options;
  const hasSelected = appTypes.some((type) => type.id === selectedType);
  if (hasSelected) {
    selectElement.value = selectedType;
  } else if (appTypes[0]) {
    selectElement.value = appTypes[0].id;
  }
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
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

function getFilteredCards() {
  return activeFilter === "all"
    ? siteData.cards
    : siteData.cards.filter((item) => item.type === activeFilter);
}

function renderModal(card) {
  modalLabel.textContent = card.label;
  modalTitle.textContent = card.title;
  modalDescription.textContent = card.description;
  modalMeta.innerHTML = [
    card.stack,
    card.mode,
    `BY: ${card.ownerUsername || "FUXC.TEAM"}`,
    formatCardTime(card.createdAt),
  ]
    .filter(Boolean)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
  modalTags.innerHTML = card.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("");

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

function openCreatorModal() {
  creatorError.hidden = true;
  creatorModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => {
    creatorTitleInput.focus();
  }, 0);
}

function closeCreatorModal() {
  creatorModal.hidden = true;
  if (cardModal.hidden) {
    document.body.classList.remove("modal-open");
  }
}

function resetCreatorForm() {
  creatorForm.reset();
  creatorPreview.textContent = "暂无截图预览";
  creatorError.hidden = true;
}

function updateCreatorPreview(src, title) {
  if (!src) {
    creatorPreview.textContent = "暂无截图预览";
    return;
  }

  creatorPreview.innerHTML = `<img src="${src}" alt="${escapeHtml(title || "卡片")} 截图预览" />`;
}

function updateAuthUI() {
  const isMember = session.authenticated && !session.isAdmin;
  cardsPageUser.hidden = !session.authenticated;
  cardsPageAddButton.hidden = !isMember;

  if (session.authenticated) {
    cardsPageUser.textContent = session.isAdmin
      ? `${session.username} · 管理员`
      : `${session.username} · 成员`;
  }
}

async function refreshSession() {
  session = await getSession().catch(() => ({
    authenticated: false,
    username: "",
    role: "guest",
    isAdmin: false,
  }));
  updateAuthUI();
}

function updateUrl() {
  const url = new URL(window.location.href);
  if (activeFilter === "all") {
    url.searchParams.delete("filter");
  } else {
    url.searchParams.set("filter", activeFilter);
  }
  window.history.replaceState({}, "", url);
}

function setActiveFilter(nextFilter) {
  const validFilters = new Set(["all", ...getAppTypes().map((type) => type.id)]);
  activeFilter = validFilters.has(nextFilter) ? nextFilter : "all";

  filterChips.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });

  updateUrl();
  renderCards();
}

function renderCards() {
  const filtered = getFilteredCards();
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
          <div class="card-meta card-meta-secondary">
            <span>BY: ${escapeHtml(item.ownerUsername || "FUXC.TEAM")}</span>
            <span>${escapeHtml(formatCardTime(item.createdAt))}</span>
          </div>
          <div class="tag-list">
            ${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
        </button>
      `
    )
    .join("");
}

async function init() {
  await refreshSession();
  siteData = normalizeSiteData(await getSiteData());
  renderFilterBar();
  renderTypeOptions(creatorTypeInput, creatorTypeInput.value);
  const params = new URLSearchParams(window.location.search);
  setActiveFilter(params.get("filter") || "all");
}

cardGrid.addEventListener("click", (event) => {
  const card = event.target.closest("[data-card-id]");
  if (!card) {
    return;
  }

  openModal(card.dataset.cardId);
});

cardsPageAddButton.addEventListener("click", () => {
  resetCreatorForm();
  openCreatorModal();
});

cardModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-modal]")) {
    closeModal();
  }
});

creatorModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-creator]")) {
    closeCreatorModal();
  }
});

creatorScreenshotInput.addEventListener("input", () => {
  updateCreatorPreview(creatorScreenshotInput.value.trim(), creatorTitleInput.value.trim());
});

creatorScreenshotFileInput.addEventListener("change", async () => {
  const file = creatorScreenshotFileInput.files[0];
  if (!file) {
    updateCreatorPreview(creatorScreenshotInput.value.trim(), creatorTitleInput.value.trim());
    return;
  }

  const dataUrl = await readImageFile(file);
  updateCreatorPreview(dataUrl, creatorTitleInput.value.trim());
});

creatorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  (async () => {
    let screenshot = creatorScreenshotInput.value.trim();
    const file = creatorScreenshotFileInput.files[0];

    if (file) {
      const dataUrl = await readImageFile(file);
      const upload = await uploadImage({
        dataUrl,
        filename: file.name || creatorTitleInput.value.trim() || "card-image",
      });
      screenshot = upload.url;
    }

    await createCard({
      type: creatorTypeInput.value,
      title: creatorTitleInput.value.trim(),
      description: creatorDescriptionInput.value.trim(),
      stack: creatorStackInput.value.trim(),
      mode: creatorModeInput.value.trim(),
      tags: creatorTagsInput.value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      githubUrl: creatorGithubInput.value.trim(),
      screenshot,
    });

    resetCreatorForm();
    closeCreatorModal();
    siteData = normalizeSiteData(await getSiteData());
    setActiveFilter("all");
  })().catch((error) => {
    creatorError.textContent = getErrorMessage(error, "提交卡片失败，请稍后再试。");
    creatorError.hidden = false;
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    if (!creatorModal.hidden) {
      closeCreatorModal();
      return;
    }

    if (!cardModal.hidden) {
      closeModal();
    }
  }
});

init();
