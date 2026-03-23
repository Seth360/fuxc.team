const {
  getSession,
  getSiteData,
  getMembers,
  deleteMember,
  saveSiteData,
  resetSiteData,
  normalizeSiteData,
  normalizeAppType,
  createEmptyCard,
  normalizeCard,
  logout,
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
const adminTypeList = document.getElementById("admin-type-list");
const adminMemberList = document.getElementById("admin-member-list");
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
const deleteCardInModalButton = document.getElementById("delete-card-in-modal");
const typeModal = document.getElementById("type-modal");
const typeModalTitle = document.getElementById("type-modal-title");
const typeForm = document.getElementById("type-form");
const typeIdInput = document.getElementById("type-id-input");
const typeLabelInput = document.getElementById("type-label-input");
const deleteTypeInModalButton = document.getElementById("delete-type-in-modal");
const adminToast = document.getElementById("admin-toast");
const adminToastMessage = document.getElementById("admin-toast-message");

let siteData = normalizeSiteData({});
let members = [];
let draggedCardId = "";
let toastTimer = null;

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

function formatDateTime(value) {
  if (!value) {
    return "未记录";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function showToast(message) {
  adminToastMessage.textContent = message;
  adminToast.hidden = false;

  if (toastTimer) {
    window.clearTimeout(toastTimer);
  }

  toastTimer = window.setTimeout(() => {
    adminToast.hidden = true;
  }, 2400);
}

function getAppTypes() {
  return Array.isArray(siteData.appTypes) && siteData.appTypes.length > 0
    ? siteData.appTypes
    : [{ id: "agent", label: "Agent" }];
}

function getAppTypeLabel(typeId) {
  const matched = getAppTypes().find((type) => type.id === typeId);
  return matched?.label || String(typeId || "").trim() || "未分类";
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

function syncCardLabelInput() {
  cardLabelInput.value = getAppTypeLabel(cardTypeInput.value);
  cardLabelInput.disabled = true;
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
  const [nextSiteData, memberResponse] = await Promise.all([
    getSiteData(),
    getMembers().catch(() => ({ members: [] })),
  ]);

  siteData = normalizeSiteData(nextSiteData);
  members = Array.isArray(memberResponse?.members) ? memberResponse.members : [];

  fillHeroFields();
  fillCatalogFields();
  renderTypeOptions(cardTypeInput, cardTypeInput.value);
  renderCardList();
  renderTypeList();
  renderMemberList();
}

function fillHeroFields() {
  Object.entries(heroFields).forEach(([key, input]) => {
    input.value = siteData.hero[key] || "";
  });

  heroFields.secondaryActionText.value = "梦想共创";
  heroFields.secondaryActionText.disabled = true;
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
        <article class="admin-card-item" draggable="true" data-card-id="${card.id}">
          <p class="admin-eyebrow">${escapeHtml(card.label)}</p>
          <span class="admin-card-grip">Drag</span>
          <h3>${escapeHtml(card.title)}</h3>
          <p>${escapeHtml(card.description)}</p>
          <div class="admin-card-meta">
            ${card.stack ? `<span>${escapeHtml(card.stack)}</span>` : ""}
            ${card.mode ? `<span>${escapeHtml(card.mode)}</span>` : ""}
            ${card.ownerUsername ? `<span>成员：${escapeHtml(card.ownerUsername)}</span>` : "<span>站点内置</span>"}
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

function renderTypeList() {
  adminTypeList.innerHTML = getAppTypes()
    .map((type) => {
      const typeCardCount = siteData.cards.filter((card) => card.type === type.id).length;
      return `
        <article class="admin-type-item">
          <div>
            <p class="admin-eyebrow">Type ID</p>
            <h3>${escapeHtml(type.label)}</h3>
            <p class="admin-type-meta">${escapeHtml(type.id)} · ${String(typeCardCount)} 张卡片</p>
          </div>
          <div class="admin-type-actions">
            <button class="admin-button admin-button-primary" type="button" data-edit-type="${type.id}">
              编辑
            </button>
            <button class="admin-button admin-button-ghost" type="button" data-delete-type="${type.id}">
              删除
            </button>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderMemberList() {
  if (!members.length) {
    adminMemberList.innerHTML = '<p class="admin-empty-state">还没有普通成员注册。</p>';
    return;
  }

  adminMemberList.innerHTML = members
    .map(
      (member) => {
        const memberCards = siteData.cards.filter((card) => card.ownerUsername === member.username);

        return `
        <article class="admin-member-item">
          <div class="admin-member-head">
            <div>
              <p class="admin-eyebrow">${escapeHtml(member.role)}</p>
              <h3>${escapeHtml(member.username)}</h3>
            </div>
            <div class="admin-member-head-actions">
              <span class="admin-member-badge">${String(member.cardCount || 0).padStart(2, "0")} 张卡片</span>
              <button class="admin-button admin-button-ghost" type="button" data-delete-member="${member.id}">
                删除成员
              </button>
            </div>
          </div>
          <div class="admin-member-meta">
            <span>注册时间：${escapeHtml(formatDateTime(member.createdAt))}</span>
            <span>最近登录：${escapeHtml(formatDateTime(member.lastLoginAt))}</span>
          </div>
          <div class="admin-member-card-previews">
            ${
              memberCards.length
                ? memberCards
                    .map(
                      (card) => `
                        <button class="admin-member-card-preview" type="button" data-edit-card="${card.id}">
                          <div class="admin-member-card-copy">
                            <strong>${escapeHtml(card.title)}</strong>
                            <p>${escapeHtml(card.description || "暂无简介")}</p>
                          </div>
                        </button>
                      `
                    )
                    .join("")
                : '<p class="admin-empty-state">该成员还没有创建卡片。</p>'
            }
          </div>
        </article>
      `;
      }
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
  renderTypeOptions(cardTypeInput, empty.type);
  syncCardLabelInput();
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
  deleteCardInModalButton.hidden = true;
}

function resetTypeForm() {
  typeIdInput.value = "";
  typeLabelInput.value = "";
  typeModalTitle.textContent = "新建类型";
  deleteTypeInModalButton.hidden = true;
}

function openCardModal() {
  cardModal.hidden = false;
}

function closeCardModal() {
  cardModal.hidden = true;
}

function openTypeModal() {
  typeModal.hidden = false;
}

function closeTypeModal() {
  typeModal.hidden = true;
}

function loadCardIntoForm(cardId) {
  const card = siteData.cards.find((item) => item.id === cardId);
  if (!card) {
    return;
  }

  cardIdInput.value = card.id;
  renderTypeOptions(cardTypeInput, card.type);
  syncCardLabelInput();
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
  deleteCardInModalButton.hidden = false;
  openCardModal();
}

function loadTypeIntoForm(typeId) {
  const type = getAppTypes().find((item) => item.id === typeId);
  if (!type) {
    return;
  }

  typeIdInput.value = type.id;
  typeLabelInput.value = type.label;
  typeModalTitle.textContent = "编辑类型";
  deleteTypeInModalButton.hidden = false;
  openTypeModal();
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
      secondaryActionText: "梦想共创",
    },
  });
  showToast("首屏内容已保存");
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
  showToast("第二屏标题已保存");
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

  const currentCard = siteData.cards.find((card) => card.id === cardIdInput.value.trim());
  const timestamp = new Date().toISOString();

  const nextCard = normalizeCard({
    id: cardIdInput.value.trim(),
    type: cardTypeInput.value,
    label: getAppTypeLabel(cardTypeInput.value),
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
    ownerUsername: currentCard?.ownerUsername || "",
    ownerRole: currentCard?.ownerRole || "",
    createdAt: currentCard?.createdAt || timestamp,
    updatedAt: timestamp,
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
  showToast(exists ? "应用卡片已更新" : "新应用已创建");
}

async function saveCardOrder(nextCards) {
  await saveCurrentData({
    ...siteData,
    cards: nextCards,
  });
  renderCardList();
  showToast("应用排序已保存");
}

async function saveTypeForm() {
  const label = typeLabelInput.value.trim();
  if (!label) {
    window.alert("请输入类型名称。");
    return;
  }

  const editingId = typeIdInput.value.trim();
  const existingTypes = getAppTypes();

  if (editingId) {
    const nextTypes = existingTypes.map((type) =>
      type.id === editingId
        ? {
            ...type,
            label,
          }
        : type
    );

    await saveCurrentData({
      ...siteData,
      appTypes: nextTypes,
      cards: siteData.cards.map((card) =>
        card.type === editingId
          ? {
              ...card,
              label,
            }
          : card
      ),
    });
    await refreshData();
    closeTypeModal();
    resetTypeForm();
    showToast("应用类型已更新");
    return;
  }

  const normalizedType = normalizeAppType({ label });
  let nextId = normalizedType.id;
  let suffix = 2;
  while (existingTypes.some((type) => type.id === nextId)) {
    nextId = `${normalizedType.id}-${suffix}`;
    suffix += 1;
  }

  await saveCurrentData({
    ...siteData,
    appTypes: [
      ...existingTypes,
      {
        ...normalizedType,
        id: nextId,
      },
    ],
  });
  await refreshData();
  closeTypeModal();
  resetTypeForm();
  showToast("应用类型已创建");
}

async function handleDeleteType(typeId) {
  const currentTypes = getAppTypes();
  if (currentTypes.length <= 1) {
    window.alert("至少需要保留一个应用类型。");
    return;
  }

  const currentType = currentTypes.find((type) => type.id === typeId);
  if (!currentType) {
    return;
  }

  const replacementType = currentTypes.find((type) => type.id !== typeId);
  const affectedCards = siteData.cards.filter((card) => card.type === typeId);
  const confirmed = window.confirm(
    affectedCards.length
      ? `删除类型“${currentType.label}”后，这 ${affectedCards.length} 张卡片将转移到“${replacementType.label}”。确定继续吗？`
      : `确定删除类型“${currentType.label}”吗？`
  );

  if (!confirmed) {
    return;
  }

  await saveCurrentData({
    ...siteData,
    appTypes: currentTypes.filter((type) => type.id !== typeId),
    cards: siteData.cards.map((card) =>
      card.type === typeId
        ? {
            ...card,
            type: replacementType.id,
            label: replacementType.label,
          }
        : card
    ),
  });
  await refreshData();
  closeTypeModal();
  resetTypeForm();
  showToast("应用类型已删除");
}

function clearDragStates() {
  Array.from(adminCardList.querySelectorAll(".admin-card-item")).forEach((item) => {
    item.classList.remove("is-dragging", "is-drag-over");
  });
}

function reorderCards(dragId, targetId, placeAfter = false) {
  if (!dragId || !targetId || dragId === targetId) {
    return siteData.cards;
  }

  const nextCards = [...siteData.cards];
  const fromIndex = nextCards.findIndex((card) => card.id === dragId);
  const targetIndex = nextCards.findIndex((card) => card.id === targetId);

  if (fromIndex === -1 || targetIndex === -1) {
    return siteData.cards;
  }

  const [draggedCard] = nextCards.splice(fromIndex, 1);
  let insertIndex = nextCards.findIndex((card) => card.id === targetId);

  if (placeAfter) {
    insertIndex += 1;
  }

  nextCards.splice(insertIndex, 0, draggedCard);
  return nextCards;
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

document.getElementById("create-type").addEventListener("click", () => {
  resetTypeForm();
  openTypeModal();
});

document.getElementById("reset-card-form").addEventListener("click", () => {
  resetCardForm();
});

document.getElementById("reset-type-form").addEventListener("click", () => {
  resetTypeForm();
});

deleteCardInModalButton.addEventListener("click", async () => {
  const cardId = cardIdInput.value.trim();
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
  renderMemberList();
  closeCardModal();
  resetCardForm();
  showToast("应用卡片已删除");
});

document.getElementById("logout-button").addEventListener("click", async () => {
  try {
    await logout();
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
  showToast("内容已恢复为默认值");
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
  showToast("应用卡片已删除");
});

adminTypeList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-type]");
  if (editButton) {
    loadTypeIntoForm(editButton.dataset.editType);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-type]");
  if (deleteButton) {
    await handleDeleteType(deleteButton.dataset.deleteType);
  }
});

adminMemberList.addEventListener("click", async (event) => {
  const editButton = event.target.closest("[data-edit-card]");
  if (editButton) {
    loadCardIntoForm(editButton.dataset.editCard);
    return;
  }

  const deleteButton = event.target.closest("[data-delete-member]");
  if (!deleteButton) {
    return;
  }

  const memberId = deleteButton.dataset.deleteMember;
  const member = members.find((item) => item.id === memberId);
  if (!member) {
    return;
  }

  const confirmed = window.confirm(`确定删除成员“${member.username}”及其创建的全部卡片吗？`);
  if (!confirmed) {
    return;
  }

  try {
    const result = await deleteMember(memberId);
    await refreshData();
    showToast(`已删除成员 ${member.username}，并移除 ${result.removedCardCount || 0} 张卡片`);
  } catch (error) {
    window.alert(`删除成员失败：${getErrorMessage(error, "请稍后再试。")}`);
  }
});

adminCardList.addEventListener("dragstart", (event) => {
  const card = event.target.closest(".admin-card-item");
  if (!card) {
    return;
  }

  draggedCardId = card.dataset.cardId || "";
  card.classList.add("is-dragging");
  event.dataTransfer.effectAllowed = "move";
  event.dataTransfer.setData("text/plain", draggedCardId);
});

adminCardList.addEventListener("dragover", (event) => {
  event.preventDefault();
  clearDragStates();

  const target = event.target.closest(".admin-card-item");
  if (target && target.dataset.cardId !== draggedCardId) {
    target.classList.add("is-drag-over");
  }
});

adminCardList.addEventListener("dragleave", (event) => {
  const target = event.target.closest(".admin-card-item");
  if (target) {
    target.classList.remove("is-drag-over");
  }
});

adminCardList.addEventListener("dragend", () => {
  draggedCardId = "";
  clearDragStates();
});

adminCardList.addEventListener("drop", async (event) => {
  event.preventDefault();

  const target = event.target.closest(".admin-card-item");
  clearDragStates();

  if (!target || !draggedCardId || target.dataset.cardId === draggedCardId) {
    draggedCardId = "";
    return;
  }

  const rect = target.getBoundingClientRect();
  const placeAfter = event.clientY > rect.top + rect.height / 2;
  const nextCards = reorderCards(draggedCardId, target.dataset.cardId, placeAfter);
  draggedCardId = "";

  if (nextCards !== siteData.cards) {
    await saveCardOrder(nextCards);
  }
});

cardModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-card-modal]")) {
    closeCardModal();
  }
});

typeModal.addEventListener("click", (event) => {
  if (event.target.closest("[data-close-type-modal]")) {
    closeTypeModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !cardModal.hidden) {
    closeCardModal();
  }
  if (event.key === "Escape" && !typeModal.hidden) {
    closeTypeModal();
  }
});

cardScreenshotInput.addEventListener("input", () => {
  updatePreview(cardScreenshotInput.value.trim(), cardTitleInput.value.trim());
});

cardTypeInput.addEventListener("change", () => {
  syncCardLabelInput();
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
  handleCardSubmit(event).catch((error) => {
    const message = getErrorMessage(
      error,
      "卡片保存失败，请检查截图文件、环境变量或 Vercel Blob 配置后重试。"
    );
    window.alert(`卡片保存失败：${message}`);
  });
});

typeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  saveTypeForm().catch((error) => {
    window.alert(`类型保存失败：${getErrorMessage(error, "请稍后再试。")}`);
  });
});

deleteTypeInModalButton.addEventListener("click", async () => {
  const typeId = typeIdInput.value.trim();
  if (!typeId) {
    return;
  }

  await handleDeleteType(typeId);
});

async function init() {
  const session = await getSession().catch(() => ({ authenticated: false, isAdmin: false }));
  if (!session.authenticated || !session.isAdmin) {
    window.location.replace("./login.html");
    return;
  }

  await refreshData();
  switchPage("copy");
  resetCardForm();
}

init();
