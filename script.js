const {
  getSiteData,
  getSession,
  login,
  register,
  logout,
  createCard,
  createKnowledgeItem,
  normalizeSiteData,
  uploadImage,
} = window.FUXCSite;

const sectionButtons = Array.from(document.querySelectorAll("[data-target]"));
const railDots = Array.from(document.querySelectorAll(".rail-dot"));
const panels = Array.from(document.querySelectorAll(".panel"));
const filterBar = document.getElementById("filter-bar");
const cardGrid = document.getElementById("card-grid");
const visibleCount = document.getElementById("visible-count");
const knowledgeGrid = document.getElementById("knowledge-grid");
const knowledgeVisibleCount = document.getElementById("knowledge-visible-count");
const adminEntry = document.getElementById("admin-entry");
const heroSecondaryAction = document.getElementById("hero-secondary-action");
const catalogUser = document.getElementById("catalog-user");
const catalogAddButton = document.getElementById("catalog-add-button");
const catalogLogoutButton = document.getElementById("catalog-logout-button");
const catalogViewAll = document.getElementById("catalog-view-all");
const knowledgeUser = document.getElementById("knowledge-user");
const knowledgeAddButton = document.getElementById("knowledge-add-button");
const knowledgeLogoutButton = document.getElementById("knowledge-logout-button");

const authModal = document.getElementById("auth-modal");
const authTabs = Array.from(document.querySelectorAll(".auth-tab"));
const authForm = document.getElementById("auth-form");
const authUsernameInput = document.getElementById("auth-username");
const authPasswordInput = document.getElementById("auth-password");
const authConfirmField = document.getElementById("auth-confirm-field");
const authPasswordConfirmInput = document.getElementById("auth-password-confirm");
const authInviteField = document.getElementById("auth-invite-field");
const authInviteCodeInput = document.getElementById("auth-invite-code");
const authPrimaryButton = document.getElementById("auth-primary-button");
const authNote = document.getElementById("auth-note");
const authError = document.getElementById("auth-error");

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

const knowledgeCreatorModal = document.getElementById("knowledge-creator-modal");
const knowledgeCreatorForm = document.getElementById("knowledge-creator-form");
const knowledgeTitleInput = document.getElementById("knowledge-title-input");
const knowledgeUrlInput = document.getElementById("knowledge-url-input");
const knowledgeDescriptionInput = document.getElementById("knowledge-description-input");
const knowledgeTagsInput = document.getElementById("knowledge-tags-input");
const knowledgeCreatorError = document.getElementById("knowledge-creator-error");

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
let session = {
  authenticated: false,
  username: "",
  role: "guest",
  isAdmin: false,
};
let activeModalCardId = "";
let authMode = "login";
let filterChips = [];

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
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

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
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
  document.getElementById("hero-secondary-action").textContent = "梦想共创";
}

function applyCatalogContent() {
  document.getElementById("catalog-section-tag").textContent = siteData.catalog.sectionTag;
  document.getElementById("catalog-title").textContent = siteData.catalog.title;
  document.getElementById("catalog-description").textContent = siteData.catalog.description;
}

function applyKnowledgeContent() {
  document.getElementById("knowledge-section-tag").textContent = siteData.knowledge.sectionTag;
  document.getElementById("knowledge-title").textContent = siteData.knowledge.title;
  document.getElementById("knowledge-description").textContent = siteData.knowledge.description;
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
  const previewCards = filtered.slice(0, 9);

  cardGrid.innerHTML = previewCards
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

  if (catalogViewAll) {
    const hasMore = filtered.length > 9;
    catalogViewAll.hidden = !hasMore;
    catalogViewAll.href = filter === "all" ? "./cards.html" : `./cards.html?filter=${encodeURIComponent(filter)}`;
  }
}

function renderKnowledgeItems() {
  const items = Array.isArray(siteData.knowledgeItems) ? siteData.knowledgeItems : [];
  knowledgeVisibleCount.textContent = String(items.length).padStart(2, "0");

  knowledgeGrid.innerHTML = items
    .map(
      (item) => `
        <a class="knowledge-card" href="${escapeHtml(item.url)}">
          <div class="card-top">
            <span class="card-type">Knowledge</span>
            ${isCardNew(item) ? '<span class="card-badge is-new">NEW</span>' : ""}
          </div>
          <div>
            <h3>${escapeHtml(item.title)}</h3>
            <p class="card-description">${escapeHtml(item.description)}</p>
          </div>
          <div class="card-meta card-meta-secondary">
            <span>BY: ${escapeHtml(item.ownerUsername || "FUXC.TEAM")}</span>
            <span>${escapeHtml(formatCardTime(item.createdAt))}</span>
          </div>
          <div class="tag-list">
            ${item.tags.map((tag) => `<span>${escapeHtml(tag)}</span>`).join("")}
          </div>
        </a>
      `
    )
    .join("");
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

function openAuthModal() {
  authError.hidden = true;
  authForm.reset();
  setAuthMode("login");
  authModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => {
    authUsernameInput.focus();
  }, 0);
}

function closeAuthModal() {
  authModal.hidden = true;
  if (creatorModal.hidden && knowledgeCreatorModal.hidden && cardModal.hidden) {
    document.body.classList.remove("modal-open");
  }
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
  if (authModal.hidden && knowledgeCreatorModal.hidden && cardModal.hidden) {
    document.body.classList.remove("modal-open");
  }
}

function openKnowledgeCreatorModal() {
  knowledgeCreatorError.hidden = true;
  knowledgeCreatorModal.hidden = false;
  document.body.classList.add("modal-open");
  window.setTimeout(() => {
    knowledgeTitleInput.focus();
  }, 0);
}

function closeKnowledgeCreatorModal() {
  knowledgeCreatorModal.hidden = true;
  if (authModal.hidden && creatorModal.hidden && cardModal.hidden) {
    document.body.classList.remove("modal-open");
  }
}

function resetCreatorForm() {
  creatorForm.reset();
  creatorPreview.textContent = "暂无截图预览";
  creatorError.hidden = true;
}

function resetKnowledgeCreatorForm() {
  knowledgeCreatorForm.reset();
  knowledgeCreatorError.hidden = true;
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

  adminEntry.hidden = !session.isAdmin;
  catalogUser.hidden = !session.authenticated;
  catalogLogoutButton.hidden = !session.authenticated;
  catalogAddButton.hidden = !isMember;
  knowledgeUser.hidden = !session.authenticated;
  knowledgeLogoutButton.hidden = !session.authenticated;
  knowledgeAddButton.hidden = !isMember;

  if (session.authenticated) {
    const label = session.isAdmin
      ? `${session.username} · 管理员`
      : `${session.username} · 成员`;
    catalogUser.textContent = label;
    knowledgeUser.textContent = label;
  }
}

function setAuthMode(nextMode) {
  authMode = nextMode === "register" ? "register" : "login";
  const isRegister = authMode === "register";

  authTabs.forEach((tab) => {
    const isActive = tab.dataset.authTab === authMode;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  authConfirmField.hidden = !isRegister;
  authPasswordConfirmInput.required = isRegister;
  authPasswordConfirmInput.disabled = !isRegister;
  authInviteField.hidden = !isRegister;
  authInviteCodeInput.required = isRegister;
  authInviteCodeInput.disabled = !isRegister;
  if (!isRegister) {
    authPasswordConfirmInput.value = "";
    authInviteCodeInput.value = "";
  }
  authPrimaryButton.textContent = isRegister ? "注册" : "登录";
  authNote.textContent = isRegister
    ? "注册时需要重复输入密码，使用邀请码才能完成注册。"
    : "普通用户登录后即可在应用库和知识共享里提交自己的内容。";
  authPasswordInput.autocomplete = isRegister ? "new-password" : "current-password";
  authError.hidden = true;
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

function setActiveFilter(nextFilter) {
  const validFilters = new Set(["all", ...getAppTypes().map((type) => type.id)]);
  activeFilter = validFilters.has(nextFilter) ? nextFilter : "all";
  filterChips.forEach((button) => {
    const isActive = button.dataset.filter === activeFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-selected", String(isActive));
  });
  renderCards(activeFilter);
}

async function refreshSiteData() {
  siteData = normalizeSiteData(await getSiteData());
  applyHeroContent();
  applyCatalogContent();
  applyKnowledgeContent();
  renderFilterBar();
  renderTypeOptions(creatorTypeInput, creatorTypeInput.value);
  renderCards(activeFilter);
  renderKnowledgeItems();

  if (activeModalCardId) {
    const currentCard = siteData.cards.find((item) => item.id === activeModalCardId);
    if (currentCard) {
      renderModal(currentCard);
    } else {
      closeModal();
    }
  }
}

async function handleAuthLogin(event) {
  event.preventDefault();

  if (authMode === "register") {
    await handleAuthRegister();
    return;
  }

  try {
    await login({
      username: authUsernameInput.value.trim(),
      password: authPasswordInput.value,
    });
    await refreshSession();
    closeAuthModal();
    scrollToPanel("catalog");
  } catch (error) {
    authError.textContent = getErrorMessage(error, "登录失败，请稍后再试。");
    authError.hidden = false;
  }
}

async function handleAuthRegister() {
  if (authPasswordInput.value !== authPasswordConfirmInput.value) {
    authError.textContent = "两次输入的密码不一致。";
    authError.hidden = false;
    return;
  }

  try {
    await register({
      username: authUsernameInput.value.trim(),
      password: authPasswordInput.value,
      inviteCode: authInviteCodeInput.value.trim(),
    });
    await refreshSession();
    closeAuthModal();
    scrollToPanel("catalog");
  } catch (error) {
    authError.textContent = getErrorMessage(error, "注册失败，请稍后再试。");
    authError.hidden = false;
  }
}

async function handleCreatorSubmit(event) {
  event.preventDefault();

  if (!session.authenticated || session.isAdmin) {
    closeCreatorModal();
    return;
  }

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
  setActiveFilter("all");
  await refreshSiteData();
  scrollToPanel("catalog");
}

async function handleKnowledgeCreatorSubmit(event) {
  event.preventDefault();

  if (!session.authenticated || session.isAdmin) {
    closeKnowledgeCreatorModal();
    return;
  }

  await createKnowledgeItem({
    title: knowledgeTitleInput.value.trim(),
    url: knowledgeUrlInput.value.trim(),
    description: knowledgeDescriptionInput.value.trim(),
    tags: knowledgeTagsInput.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
  });

  resetKnowledgeCreatorForm();
  closeKnowledgeCreatorModal();
  await refreshSiteData();
  scrollToPanel("knowledge");
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

heroSecondaryAction.addEventListener("click", () => {
  openAuthModal();
});

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setAuthMode(tab.dataset.authTab);
  });
});

catalogAddButton.addEventListener("click", () => {
  resetCreatorForm();
  openCreatorModal();
});

knowledgeAddButton.addEventListener("click", () => {
  resetKnowledgeCreatorForm();
  openKnowledgeCreatorModal();
});

catalogLogoutButton.addEventListener("click", async () => {
  await logout().catch(() => {});
  await refreshSession();
  closeAuthModal();
  closeCreatorModal();
  closeKnowledgeCreatorModal();
});

knowledgeLogoutButton.addEventListener("click", async () => {
  await logout().catch(() => {});
  await refreshSession();
  closeAuthModal();
  closeCreatorModal();
  closeKnowledgeCreatorModal();
});

authForm.addEventListener("submit", (event) => {
  handleAuthLogin(event).catch((error) => {
    authError.textContent = getErrorMessage(error, "认证失败，请稍后再试。");
    authError.hidden = false;
  });
});

authModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-auth]")) {
    closeAuthModal();
  }
});

creatorModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-creator]")) {
    closeCreatorModal();
  }
});

knowledgeCreatorModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-knowledge-creator]")) {
    closeKnowledgeCreatorModal();
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
  handleCreatorSubmit(event).catch((error) => {
    creatorError.textContent = getErrorMessage(error, "提交卡片失败，请稍后再试。");
    creatorError.hidden = false;
  });
});

knowledgeCreatorForm.addEventListener("submit", (event) => {
  handleKnowledgeCreatorSubmit(event).catch((error) => {
    knowledgeCreatorError.textContent = getErrorMessage(error, "提交内容失败，请稍后再试。");
    knowledgeCreatorError.hidden = false;
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
  if (event.key === "Escape") {
    if (!knowledgeCreatorModal.hidden) {
      closeKnowledgeCreatorModal();
      return;
    }

    if (!creatorModal.hidden) {
      closeCreatorModal();
      return;
    }

    if (!authModal.hidden) {
      closeAuthModal();
      return;
    }

    if (!cardModal.hidden) {
      closeModal();
    }
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

Promise.all([refreshSession(), refreshSiteData()]);
