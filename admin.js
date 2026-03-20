const {
  getAdminSession,
  getSiteData,
  saveSiteData,
  resetSiteData,
  normalizeSiteData,
  createEmptyCard,
  normalizeCard,
  logoutAdmin,
  uploadImage,
} = window.FUXCSite;

const heroFields = {
  kicker: document.getElementById("hero-kicker-input"),
  lead: document.getElementById("hero-lead-input"),
  title: document.getElementById("hero-title-input"),
  subtitle: document.getElementById("hero-subtitle-input"),
  description: document.getElementById("hero-description-input"),
  primaryActionText: document.getElementById("hero-primary-input"),
  secondaryActionText: document.getElementById("hero-secondary-input"),
};

const catalogFields = {
  sectionTag: document.getElementById("catalog-tag-input"),
  title: document.getElementById("catalog-title-input"),
  description: document.getElementById("catalog-description-input"),
};

const navButtons = Array.from(document.querySelectorAll("[data-page]"));
const pagePanels = Array.from(document.querySelectorAll("[data-page-panel]"));
const adminCardList = document.getElementById("admin-card-list");
const cardModal = document.getElementById("card-modal");
const cardModalTitle = document.getElementById("card-modal-title");
const cardForm = document.getElementById("card-form");
const cardIdInput = document.getElementById("card-id-input");
const cardTypeInput = document.getElementById("card-type-input");
const cardLabelInput = document.getElementById("card-label-input");
const cardBadgeInput = document.getElementById("card-badge-input");
const cardTitleInput = document.getElementById("card-title-input");
const cardDescriptionInput = document.getElementById("card-description-input");
const cardStackInput = document.getElementById("card-stack-input");
const cardModeInput = document.getElementById("card-mode-input");
const cardTagsInput = document.getElementById("card-tags-input");
const cardGithubInput = document.getElementById("card-github-input");
const cardScreenshotInput = document.getElementById("card-screenshot-input");
const cardScreenshotFileInput = document.getElementById("card-screenshot-file-input");
const cardPreview = document.getElementById("card-preview");

let siteData = normalizeSiteData({});

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function switchPage(pageId) {
  navButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.page === pageId);
  });

  pagePanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.pagePanel === pageId);
  });
}

async function refreshData() {
  siteData = normalizeSiteData(await getSiteData());
  fillHeroFields();
  fillCatalogFields();
  renderCardList();
}

function fillHeroFields() {
  Object.entries(heroFields).forEach(([key, input]) => {
    input.value = siteData.hero[key] || "";
  });
}

function fillCatalogFields() {
  Object.entries(catalogFields).forEach(([key, input]) => {
    input.value = siteData.catalog[key] || "";
  });
}

function renderCardList() {
  adminCardList.innerHTML = siteData.cards
    .map(
      (card) => `
        <article class="admin-card-item">
          <p class="admin-eyebrow">${escapeHtml(card.label)}</p>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.description)}</p>
          <div class="admin-card-meta">
            ${card.stack ? `<span>${escapeHtml(card.stack)}</span>` : ""}
            ${card.mode ? `<span>${escapeHtml(card.mode)}</span>` : ""}
            ${card.githubUrl ? "<span>GitHub</span>" : ""}
          </div>
          <div class="admin-card-actions">
            <button class="admin-button admin-button-primary" type="button" data-edit-card="${card.id}">
              编辑
            </button>
            <button class="admin-button admin-button-ghost" type="button" data-delete-card="${card.id}">
              删除
            </button>
          </div>
        </article>
      `
    )
    .join("");
}

function updatePreview(src, title) {
  if (!src) {
    cardPreview.textContent = "暂无截图预览";
    return;
  }
  cardPreview.innerHTML = `<img src="${src}" alt="${escapeHtml(title || "卡片")} 截图预览" />`;
}

function resetCardForm() {
  const empty = createEmptyCard();
  cardIdInput.value = "";
  cardTypeInput.value = empty.type;
  cardLabelInput.value = empty.label;
  cardBadgeInput.value = empty.badge;
  cardTitleInput.value = "";
  cardDescriptionInput.value = "";
  cardStackInput.value = "";
  cardModeInput.value = "";
  cardTagsInput.value = "";
  cardGithubInput.value = "";
  cardScreenshotInput.value = "";
  cardScreenshotFileInput.value = "";
  updatePreview("", "");
  cardModalTitle.textContent = "新建卡片";
}

function openCardModal() {
  cardModal.hidden = false;
}

function closeCardModal() {
  cardModal.hidden = true;
}

function loadCardIntoForm(cardId) {
  const card = siteData.cards.find((item) => item.id === cardId);
  if (!card) {
    return;
  }

  cardIdInput.value = card.id;
  cardTypeInput.value = card.type;
  cardLabelInput.value = card.label;
  cardBadgeInput.value = card.badge;
  cardTitleInput.value = card.title;
  cardDescriptionInput.value = card.description;
  cardStackInput.value = card.stack;
  cardModeInput.value = card.mode;
  cardTagsInput.value = card.tags.join(", ");
  cardGithubInput.value = card.githubUrl;
  cardScreenshotInput.value = card.screenshot;
  cardScreenshotFileInput.value = "";
  updatePreview(card.screenshot, card.title);
  cardModalTitle.textContent = "编辑卡片";
  openCardModal();
}

async function saveCurrentData(nextData) {
  siteData = await saveSiteData(nextData);
  return siteData;
}

async function saveHero() {
  await saveCurrentData({
    ...siteData,
    hero: {
      ...siteData.hero,
      kicker: heroFields.kicker.value.trim(),
      lead: heroFields.lead.value.trim(),
      title: heroFields.title.value.trim(),
      subtitle: heroFields.subtitle.value.trim(),
      description: heroFields.description.value.trim(),
      primaryActionText: heroFields.primaryActionText.value.trim(),
      secondaryActionText: heroFields.secondaryActionText.value.trim(),
    },
  });
}

async function saveCatalog() {
  await saveCurrentData({
    ...siteData,
    catalog: {
      ...siteData.catalog,
      sectionTag: catalogFields.sectionTag.value.trim(),
      title: catalogFields.title.value.trim(),
      description: catalogFields.description.value.trim(),
    },
  });
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ""));
    reader.onerror = () => reject(new Error("图片读取失败"));
    reader.readAsDataURL(file);
  });
}

async function handleCardSubmit(event) {
  event.preventDefault();

  let screenshot = cardScreenshotInput.value.trim();
  const file = cardScreenshotFileInput.files[0];

  if (file) {
    const dataUrl = await readImageFile(file);
    const upload = await uploadImage({
      dataUrl,
      filename: file.name || cardTitleInput.value.trim() || "card-image",
    });
    screenshot = upload.url;
  }

  const nextCard = normalizeCard({
    id: cardIdInput.value.trim(),
    type: cardTypeInput.value,
    label: cardLabelInput.value.trim(),
    badge: cardBadgeInput.value.trim(),
    title: cardTitleInput.value.trim(),
    description: cardDescriptionInput.value.trim(),
    stack: cardStackInput.value.trim(),
    mode: cardModeInput.value.trim(),
    tags: cardTagsInput.value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    githubUrl: cardGithubInput.value.trim(),
    screenshot,
  });

  const exists = siteData.cards.some((card) => card.id === nextCard.id);
  const nextCards = exists
    ? siteData.cards.map((card) => (card.id === nextCard.id ? nextCard : card))
    : [...siteData.cards, nextCard];

  await saveCurrentData({
    ...siteData,
    cards: nextCards,
  });

  renderCardList();
  closeCardModal();
  resetCardForm();
}

navButtons.forEach((button) => {
  button.addEventListener("click", () => {
    switchPage(button.dataset.page);
  });
});

document.getElementById("save-hero").addEventListener("click", async () => {
  await saveHero();
});

document.getElementById("save-catalog").addEventListener("click", async () => {
  await saveCatalog();
});

document.getElementById("create-card").addEventListener("click", () => {
  resetCardForm();
  openCardModal();
});

document.getElementById("reset-card-form").addEventListener("click", () => {
  resetCardForm();
});

document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await logoutAdmin();
  } finally {
    window.location.replace("./login.html");
  }
});

document.getElementById("reset-site").addEventListener("click", async () => {
  const confirmed = window.confirm("确定要恢复默认内容吗？当前后台修改的内容会被覆盖。");
  if (!confirmed) {
    return;
  }
  siteData = await resetSiteData();
  await refreshData();
  resetCardForm();
});

adminCardList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-card]");
  if (editButton) {
    loadCardIntoForm(editButton.dataset.editCard);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-card]");
  if (!deleteButton) {
    return;
  }

  const cardId = deleteButton.dataset.deleteCard;
  const card = siteData.cards.find((item) => item.id === cardId);
  if (!card) {
    return;
  }

  const confirmed = window.confirm(`确定删除卡片“${card.title}”吗？`);
  if (!confirmed) {
    return;
  }

  await saveCurrentData({
    ...siteData,
    cards: siteData.cards.filter((item) => item.id !== cardId),
  });
  renderCardList();
});

cardModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-card-modal]")) {
    closeCardModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cardModal.hidden) {
    closeCardModal();
  }
});

cardScreenshotInput.addEventListener("input", () => {
  updatePreview(cardScreenshotInput.value.trim(), cardTitleInput.value.trim());
});

cardScreenshotFileInput.addEventListener("change", async () => {
  const file = cardScreenshotFileInput.files[0];
  if (!file) {
    updatePreview(cardScreenshotInput.value.trim(), cardTitleInput.value.trim());
    return;
  }
  const dataUrl = await readImageFile(file);
  updatePreview(dataUrl, cardTitleInput.value.trim());
});

cardForm.addEventListener("submit", (event) => {
  handleCardSubmit(event).catch(() => {
    window.alert("卡片保存失败，请检查截图文件、环境变量或 Vercel Blob 配置后重试。");
  });
});

async function init() {
  const session = await getAdminSession().catch(() => ({ authenticated: false }));
  if (!session.authenticated) {
    window.location.replace("./login.html");
    return;
  }

  await refreshData();
  switchPage("copy");
  resetCardForm();
}

init();
