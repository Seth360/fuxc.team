const qualityTabs = Array.from(document.querySelectorAll("[data-quality-tab]"));
const qualityPanels = Array.from(document.querySelectorAll("[data-quality-panel]"));
const searchInput = document.querySelector("#hubSearch");
const editorPanel = document.querySelector("#editorPanel");
const editorBackdrop = document.querySelector("#editorBackdrop");
const editorTitle = document.querySelector("#editorTitle");
const editForm = document.querySelector("#editForm");
const editTitleLabel = document.querySelector('label[for="editTitle"]');
const editTitle = document.querySelector("#editTitle");
const editDescField = document.querySelector("#editDescField");
const editDesc = document.querySelector("#editDesc");
const editCategoryField = document.querySelector("#editCategoryField");
const editCategory = document.querySelector("#editCategory");
const editTagsField = document.querySelector("#editTags")?.closest(".field");
const editTags = document.querySelector("#editTags");
const editHrefField = document.querySelector("#editHref")?.closest(".field");
const editHref = document.querySelector("#editHref");
const closeEditor = document.querySelector("#closeEditor");
const cancelEditor = document.querySelector("#cancelEditor");
const deleteCard = document.querySelector("#deleteCard");
const qualityReportView = document.querySelector("#qualityReportView");
const backToQualityList = document.querySelector("#backToQualityList");
const embeddedReportFrame = document.querySelector("#embeddedReportFrame");
const embeddedReportTitle = document.querySelector("#embeddedReportTitle");
const embeddedReportSummary = document.querySelector("#embeddedReportSummary");
const embeddedReportDate = document.querySelector("#embeddedReportDate");
const embeddedReportScore = document.querySelector("#embeddedReportScore");
const openReportUpload = document.querySelector("#openReportUpload");
const reportUploadPanel = document.querySelector("#reportUploadPanel");
const reportUploadForm = document.querySelector("#reportUploadForm");
const reportUploadTitle = document.querySelector("#reportUploadTitle");
const reportTitleInput = document.querySelector("#reportTitleInput");
const reportFileInput = document.querySelector("#reportFileInput");
const reportFileName = document.querySelector("#reportFileName");
const closeReportUpload = document.querySelector("#closeReportUpload");
const cancelReportUpload = document.querySelector("#cancelReportUpload");
const editCurrentReport = document.querySelector("#editCurrentReport");
const deleteCurrentReport = document.querySelector("#deleteCurrentReport");
const openAssetEditor = document.querySelector("#openAssetEditor");
const assetDetailView = document.querySelector("#assetDetailView");
const assetDetailCategory = document.querySelector("#assetDetailCategory");
const assetDetailTitle = document.querySelector("#assetDetailTitle");
const assetDetailDesc = document.querySelector("#assetDetailDesc");
const assetDetailHref = document.querySelector("#assetDetailHref");
const assetDetailTags = document.querySelector("#assetDetailTags");
const backToAssetList = document.querySelector("#backToAssetList");
const deleteAsset = document.querySelector("#deleteAsset");
const editAsset = document.querySelector("#editAsset");
const openAssetUrl = document.querySelector("#openAssetUrl");
const planningDetailPanel = document.querySelector("#planningDetailPanel");
const closePlanningDetail = document.querySelector("#closePlanningDetail");
const planningDetailStage = document.querySelector("#planningDetailStage");
const planningDetailDesc = document.querySelector("#planningDetailDesc");
const planningDetailOwners = document.querySelector("#planningDetailOwners");
const planningDetailHref = document.querySelector("#planningDetailHref");
const planningDetailStageSelect = document.querySelector("#planningDetailStageSelect");
const deletePlanningTask = document.querySelector("#deletePlanningTask");
const editPlanningTask = document.querySelector("#editPlanningTask");
const openPlanningUrl = document.querySelector("#openPlanningUrl");
const planningEditorPanel = document.querySelector("#planningEditorPanel");
const planningEditorTitle = document.querySelector("#planningEditorTitle");
const closePlanningEditor = document.querySelector("#closePlanningEditor");
const planningForm = document.querySelector("#planningForm");
const planningDescInput = document.querySelector("#planningDescInput");
const planningOwnerOptions = document.querySelector("#planningOwnerOptions");
const planningHrefInput = document.querySelector("#planningHrefInput");
const openPlanningHrefInput = document.querySelector("#openPlanningHrefInput");
const planningStageSelect = document.querySelector("#planningStageSelect");
const cancelPlanningEditor = document.querySelector("#cancelPlanningEditor");
const deletePlanningFromEditor = document.querySelector("#deletePlanningFromEditor");
const openPlanningImport = document.querySelector("#openPlanningImport");
const planningImportPanel = document.querySelector("#planningImportPanel");
const closePlanningImport = document.querySelector("#closePlanningImport");
const planningImportForm = document.querySelector("#planningImportForm");
const planningImportText = document.querySelector("#planningImportText");
const cancelPlanningImport = document.querySelector("#cancelPlanningImport");
const storageKey = "shareagent-uxhub-cards:v1";
const reportStorageKey = "shareagent-uxhub-reports:v1";
const reportOrderStorageKey = "shareagent-uxhub-report-order:v1";
const assetStorageKey = "shareagent-uxhub-assets:v1";
const planningStorageKey = "shareagent-uxhub-planning:v1";
const remoteConfig = window.UXHUB_CONFIG || {};
const remoteApiBaseUrl = (remoteConfig.apiBaseUrl || "").replace(/\/$/, "");
const remoteDataUrl = remoteApiBaseUrl.endsWith("/data") || remoteApiBaseUrl.includes("uxhub-data")
  ? remoteApiBaseUrl
  : `${remoteApiBaseUrl}/data`;
const remoteWriteToken = remoteConfig.writeToken || "";
const editableCollections = ["links", "rivals", "members"];
let cardStore = loadCardStore();
let reportStore = loadReportStore();
let reportOrderStore = loadReportOrderStore();
let assetStore = loadAssetStore();
let planningStore = loadPlanningStore();
let assetStoreHasSource = localStorage.getItem(assetStorageKey) !== null;
let remoteReady = false;
let remoteSaveTimer = null;
let activeCard = null;
let activeCardId = null;
let activeMode = "edit";
let activeCollection = "links";
let activeReportCard = null;
let activeReportMode = "add";
let activeReportId = null;
let reportOrderSavedDuringDrop = false;
let activeAssetId = null;
let activeAssetCategory = "all";
let activePlanningId = null;
let activePlanningMode = "add";
let activePlanningStage = "planning";

const assetCategoryLabels = {
  design: "设计文件",
  spec: "规范",
  skill: "Skill",
  doc: "其他文档",
};

const planningStages = [
  { id: "planning", label: "规划中" },
  { id: "review", label: "待评审" },
  { id: "frontend", label: "交付前端" },
  { id: "restored", label: "已还原/多语质检" },
  { id: "online", label: "已上线" },
];

const defaultPlanningStore = [
  {
    id: "planning-home-entry",
    desc: "首页高频入口与质量评分联动体验梳理",
    owners: ["姓名"],
    href: "index.html",
    stage: "planning",
  },
  {
    id: "planning-quality-upload",
    desc: "设计质检报告上传、更新、删除链路验收",
    owners: ["姓名"],
    href: "quality.html",
    stage: "review",
  },
];

const defaultAssetStore = [
  {
    id: "asset-main-design",
    title: "ShareAgent 主设计稿",
    category: "design",
    desc: "首页、会话、设置与核心任务流的最新设计源文件入口。",
    href: "#",
    tags: ["设计文件", "Figma"],
  },
  {
    id: "asset-chat-flow",
    title: "对话体验流程图",
    category: "design",
    desc: "沉淀用户输入、Agent 响应、异常处理和追问补全路径。",
    href: "#",
    tags: ["设计文件", "流程"],
  },
  {
    id: "asset-component-spec",
    title: "组件状态规范",
    category: "spec",
    desc: "按钮、输入框、卡片、弹层在默认、悬停、禁用和错误态下的交付口径。",
    href: "#",
    tags: ["规范", "组件"],
  },
  {
    id: "asset-responsive-checklist",
    title: "响应式验收清单",
    category: "spec",
    desc: "桌面、窄屏和移动视口下的布局断点、换行与可点击区域检查项。",
    href: "#",
    tags: ["规范", "验收"],
  },
  {
    id: "asset-prompt-skill",
    title: "ShareAgent Prompt Skill",
    category: "skill",
    desc: "用于体验评审、页面走查和交付检查的提示词与执行步骤。",
    href: "#",
    tags: ["Skill", "评审"],
  },
  {
    id: "asset-review-log",
    title: "评审纪要与决策记录",
    category: "doc",
    desc: "记录体验方案取舍、版本结论和后续动作，方便回溯项目上下文。",
    href: "#",
    tags: ["其他文档", "记录"],
  },
];

function loadCardStore() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || {};
  } catch (error) {
    return {};
  }
}

function saveCardStore() {
  localStorage.setItem(storageKey, JSON.stringify(cardStore));
  scheduleRemoteSave();
}

function loadReportStore() {
  try {
    return JSON.parse(localStorage.getItem(reportStorageKey)) || [];
  } catch (error) {
    return [];
  }
}

function saveReportStore() {
  localStorage.setItem(reportStorageKey, JSON.stringify(reportStore));
  scheduleRemoteSave();
}

function loadReportOrderStore() {
  try {
    return JSON.parse(localStorage.getItem(reportOrderStorageKey)) || {};
  } catch (error) {
    return {};
  }
}

function saveReportOrderStore() {
  localStorage.setItem(reportOrderStorageKey, JSON.stringify(reportOrderStore));
  scheduleRemoteSave();
}

function loadAssetStore() {
  try {
    return JSON.parse(localStorage.getItem(assetStorageKey)) || [];
  } catch (error) {
    return [];
  }
}

function saveAssetStore() {
  localStorage.setItem(assetStorageKey, JSON.stringify(assetStore));
  scheduleRemoteSave();
}

function loadPlanningStore() {
  try {
    return JSON.parse(localStorage.getItem(planningStorageKey)) || [];
  } catch (error) {
    return [];
  }
}

function savePlanningStore() {
  localStorage.setItem(planningStorageKey, JSON.stringify(planningStore));
  scheduleRemoteSave();
}

function getSharedData() {
  return {
    cards: cardStore,
    reports: reportStore,
    reportOrder: reportOrderStore,
    assets: assetStore,
    planning: planningStore,
  };
}

function applySharedData(data) {
  if (!data || typeof data !== "object") return;
  if (data.cards && typeof data.cards === "object") {
    cardStore = data.cards;
    localStorage.setItem(storageKey, JSON.stringify(cardStore));
  }
  if (Array.isArray(data.reports)) {
    reportStore = data.reports;
    localStorage.setItem(reportStorageKey, JSON.stringify(reportStore));
  }
  if (data.reportOrder && typeof data.reportOrder === "object") {
    reportOrderStore = data.reportOrder;
    localStorage.setItem(reportOrderStorageKey, JSON.stringify(reportOrderStore));
  }
  if (Array.isArray(data.assets)) {
    assetStore = data.assets;
    assetStoreHasSource = true;
    localStorage.setItem(assetStorageKey, JSON.stringify(assetStore));
  }
  if (Array.isArray(data.planning)) {
    planningStore = data.planning;
    localStorage.setItem(planningStorageKey, JSON.stringify(planningStore));
  }
}

async function loadRemoteData() {
  if (!remoteApiBaseUrl) return false;
  try {
    const response = await fetch(remoteDataUrl, {
      headers: { accept: "application/json" },
    });
    if (!response.ok) throw new Error(`Remote data request failed: ${response.status}`);
    applySharedData(await response.json());
    remoteReady = true;
    return true;
  } catch (error) {
    console.warn("UX Hub remote data unavailable; using local data.", error);
    remoteReady = false;
    return false;
  }
}

async function saveRemoteData() {
  if (!remoteApiBaseUrl || !remoteReady) return;
  const headers = {
    "content-type": "application/json",
  };
  if (remoteWriteToken) headers["x-uxhub-token"] = remoteWriteToken;
  try {
    const response = await fetch(remoteDataUrl, {
      method: "PUT",
      headers,
      body: JSON.stringify(getSharedData()),
    });
    if (!response.ok) throw new Error(`Remote save failed: ${response.status}`);
  } catch (error) {
    console.warn("UX Hub remote save failed; local data is still preserved.", error);
  }
}

function scheduleRemoteSave() {
  if (!remoteApiBaseUrl || !remoteReady) return;
  window.clearTimeout(remoteSaveTimer);
  remoteSaveTimer = window.setTimeout(saveRemoteData, 180);
}

function getStorageCollection(collection) {
  return collection === "link" ? "links" : collection;
}

function createCardId(collection) {
  if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
  return `${collection}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getCardData(card, collection) {
  const title = card.querySelector(".card-title")?.textContent.trim() || "未命名卡片";
  const desc = collection === "members" ? (card.dataset.memberDesc || "") : (card.querySelector(".card-desc")?.textContent.trim() || "");
  const tags = Array.from(card.querySelectorAll(".tag")).map((tag) => tag.textContent.trim()).filter(Boolean);
  return {
    id: card.dataset.cardId || createCardId(collection),
    collection,
    title,
    desc,
    tags,
    href: card.getAttribute("href") || "#",
  };
}

function collectDefaultCards(collection) {
  const grid = document.querySelector(`[data-card-grid="${collection}"]`);
  if (!grid) return [];
  return Array.from(grid.querySelectorAll(".editable-card")).map((card) => getCardData(card, collection));
}

function seedCardStoreFromPage() {
  let changed = false;
  editableCollections.forEach((collection) => {
    const defaults = collectDefaultCards(collection);
    if (!defaults.length) return;
    if (!Array.isArray(cardStore[collection])) {
      cardStore[collection] = defaults;
      changed = true;
    }
  });
  if (changed) {
    localStorage.setItem(storageKey, JSON.stringify(cardStore));
    scheduleRemoteSave();
  }
}

function seedAssetStore() {
  if (assetStoreHasSource) return;
  assetStore = defaultAssetStore.map((asset) => ({ ...asset, tags: [...asset.tags] }));
  assetStoreHasSource = true;
  localStorage.setItem(assetStorageKey, JSON.stringify(assetStore));
  scheduleRemoteSave();
}

function seedPlanningStore() {
  if (localStorage.getItem(planningStorageKey) !== null || planningStore.length) return;
  planningStore = defaultPlanningStore.map((task) => ({ ...task, owners: [...task.owners] }));
  localStorage.setItem(planningStorageKey, JSON.stringify(planningStore));
  scheduleRemoteSave();
}

function renderAllData() {
  editableCollections.forEach(renderCollection);
  renderReportStore();
  renderAssetStore();
  renderPlanningStore();
  renderQualityAverages();
  renderOverviewStats();
}

async function initSharedData() {
  await loadRemoteData();
  seedCardStoreFromPage();
  seedAssetStore();
  seedPlanningStore();
  renderAllData();
}

function switchQualityTab(tabName) {
  closeEmbeddedReport(false);
  qualityTabs.forEach((tab) => {
    tab.classList.toggle("is-active", tab.dataset.qualityTab === tabName);
  });
  qualityPanels.forEach((panel) => {
    panel.classList.toggle("is-active", panel.dataset.qualityPanel === tabName);
  });
}

function openEmbeddedReport(card, updateHash = true) {
  if (!qualityReportView || !embeddedReportFrame) return;
  const reportUrl = card.dataset.reportUrl;
  if (!reportUrl) return;
  activeReportCard = card;
  if (embeddedReportTitle) embeddedReportTitle.textContent = card.dataset.reportTitle || "质检报告";
  if (embeddedReportSummary) embeddedReportSummary.textContent = card.dataset.reportSummary || card.dataset.reportBody || "";
  if (embeddedReportDate) embeddedReportDate.textContent = card.dataset.reportDate || "";
  if (embeddedReportScore) embeddedReportScore.textContent = "设计质量 " + (card.dataset.reportScore || "");
  if (editCurrentReport) editCurrentReport.hidden = false;
  if (deleteCurrentReport) deleteCurrentReport.hidden = false;
  document.body.classList.add("is-report-open");
  if (reportUrl.startsWith("data:")) {
    embeddedReportFrame.src = reportUrl;
  } else {
    embeddedReportFrame.src = reportUrl;
  }
  if (updateHash && history.pushState) history.pushState(null, "", "#" + (card.dataset.reportId || "report"));
}

function closeEmbeddedReport(updateHash = true) {
  if (!qualityReportView) return;
  document.body.classList.remove("is-report-open");
  activeReportCard = null;
  if (updateHash && history.pushState && document.body.dataset.activePage === "quality") history.pushState(null, "", "#zh");
}

function syncEmbeddedReportMetrics() {
  if (!embeddedReportFrame || !activeReportCard) return;
  try {
    const doc = embeddedReportFrame.contentDocument;
    if (!doc) return;
    const metricCards = Array.from(doc.querySelectorAll(".metric-card"));
    const scoreValue = metricCards.find((card) => card.querySelector(".metric-card-label")?.textContent.trim() === "评分")?.querySelector(".metric-card-value");
    const riskValue = metricCards.find((card) => card.querySelector(".metric-card-label")?.textContent.trim() === "风险等级")?.querySelector(".metric-card-value");
    if (scoreValue && activeReportCard.dataset.reportScore) {
      scoreValue.textContent = activeReportCard.dataset.reportScore;
      scoreValue.classList.toggle("metric-danger", Number(activeReportCard.dataset.reportScore) < 80);
    }
    if (riskValue && activeReportCard.dataset.reportScore) {
      const score = Number(activeReportCard.dataset.reportScore);
      riskValue.textContent = score >= 80 ? "LOW" : score >= 70 ? "MEDIUM" : "HIGH";
      riskValue.classList.toggle("metric-danger", score < 80);
    }
  } catch (error) {
    return;
  }
}

function resizeEmbeddedReport() {
  if (!embeddedReportFrame) return;
  try {
    const doc = embeddedReportFrame.contentDocument;
    if (!doc || !doc.documentElement) return;
    const bodyHeight = doc.body ? doc.body.scrollHeight : 0;
    embeddedReportFrame.style.height = Math.max(720, doc.documentElement.scrollHeight, bodyHeight) + "px";
  } catch (error) {
    embeddedReportFrame.style.height = "960px";
  }
}

function getActiveQualityTab() {
  return document.querySelector(".quality-tab.is-active")?.dataset.qualityTab || "zh";
}

function getReportScoreFromHtml(html) {
  const match = html.match(/<p[^>]*class=["'][^"']*metric-card-value[^"']*["'][^>]*>\s*(\d{1,3})\s*<\/p>/i);
  if (!match) return "86";
  return match[1];
}

function getScoreTone(score) {
  const numericScore = Number(score);
  if (numericScore >= 80) return "high";
  if (numericScore >= 70) return "mid";
  return "low";
}

const defaultReportScoresByCategory = {
  zh: [86],
  i18n: [],
};

function getDefaultReportScores(category) {
  const grid = document.querySelector(`[data-report-grid="${category}"]`);
  if (!grid) return defaultReportScoresByCategory[category] || [];
  return Array.from(grid.querySelectorAll("[data-report-score]:not([data-report-custom])"))
    .map((card) => Number(card.dataset.reportScore))
    .filter((score) => Number.isFinite(score));
}

function getStoredReportScores(category) {
  return reportStore
    .filter((report) => (report.category || "zh") === category)
    .map((report) => Number(report.score))
    .filter((score) => Number.isFinite(score));
}

function getAverageReportScore(category) {
  const scores = [...getDefaultReportScores(category), ...getStoredReportScores(category)];
  if (!scores.length) return null;
  return Math.round(scores.reduce((total, score) => total + score, 0) / scores.length);
}

function renderQualityAverages() {
  document.querySelectorAll("[data-quality-average-score]").forEach((scoreNode) => {
    const category = scoreNode.dataset.qualityAverageScore;
    const averageScore = getAverageReportScore(category);
    const ringScore = averageScore === null ? 0 : averageScore;
    scoreNode.textContent = averageScore === null ? "--" : String(averageScore);
    scoreNode.dataset.scoreTone = averageScore === null ? "low" : getScoreTone(averageScore);
    scoreNode.style.setProperty("--score", ringScore);
  });
}

function getVisibleCardCount(selector) {
  return document.querySelectorAll(selector).length;
}

function renderOverviewStats() {
  const planningTodoNode = document.querySelector('[data-overview-count="planningTodo"]');
  const planningOnlineNode = document.querySelector('[data-overview-caption="planningOnline"]');
  const todoCount = planningStore.filter((task) => ["planning", "review"].includes(task.stage || "planning")).length;
  const onlineCount = planningStore.filter((task) => task.stage === "online").length;
  if (planningTodoNode) planningTodoNode.textContent = String(todoCount);
  if (planningOnlineNode) planningOnlineNode.textContent = `${onlineCount} 个需即将关闭`;

  const rivalCountNode = document.querySelector('[data-overview-count="rivals"]');
  if (rivalCountNode) rivalCountNode.textContent = String(getVisibleCardCount('[data-card-grid="rivals"] .editable-card'));

  const assetCountNode = document.querySelector('[data-overview-count="assets"]');
  const assetCaptionNode = document.querySelector('[data-overview-caption="assets"]');
  if (!assetCountNode && !assetCaptionNode) return;
  if (assetCountNode) assetCountNode.textContent = String(assetStore.length || defaultAssetStore.length);
  if (assetCaptionNode) assetCaptionNode.textContent = Object.values(assetCategoryLabels).join("、");
}

function getReportSummary(title) {
  return `${title} 的设计质检报告。`;
}

function getReportUrl(report) {
  if (report.url) return report.url;
  if (report.html) return `data:text/html;charset=utf-8,${encodeURIComponent(report.html)}`;
  return "";
}

function getReportHtml(report) {
  return report.html || "";
}

function createReportCard(report) {
  const card = document.createElement("a");
  const score = String(report.score || getReportScoreFromHtml(getReportHtml(report)));
  card.className = "directory-card quality-card";
  card.href = `#${report.id}`;
  card.dataset.reportId = report.id;
  card.dataset.reportCustom = "true";
  card.dataset.reportUrl = getReportUrl(report);
  card.dataset.reportTitle = report.title;
  card.dataset.reportDate = report.date;
  card.dataset.reportScore = score;
  card.dataset.reportSummary = getReportSummary(report.title);
  card.dataset.reportBody = getReportSummary(report.title);
  card.innerHTML = `
    <div>
      <div class="card-main-row"><span class="card-logo">${report.title.trim().slice(0, 1) || "报"}</span><div class="card-title"></div></div>
      <div class="card-desc"></div>
      <div class="quality-meta"><span class="tag"></span><span class="tag">上传报告</span></div>
    </div>
    <span class="score-ring" data-score-tone="${getScoreTone(score)}" style="--score: ${score}">${score}</span>
  `;
  card.querySelector(".card-title").textContent = report.title;
  card.querySelector(".card-desc").textContent = getReportSummary(report.title);
  card.querySelector(".tag").textContent = report.date;
  card.addEventListener("click", (event) => {
    event.preventDefault();
    openEmbeddedReport(card);
  });
  return card;
}

function getAssetCategoryLabel(category) {
  return assetCategoryLabels[category] || "未分类";
}

function getAssetLogoText(asset) {
  const label = getAssetCategoryLabel(asset.category);
  if (asset.category === "skill") return "AI";
  const source = asset.title?.trim() || label;
  return source.slice(0, 2).toUpperCase();
}

function getNormalizedAsset(asset = {}) {
  return {
    id: asset.id || createCardId("asset"),
    title: asset.title || "未命名资产",
    category: asset.category || "",
    desc: asset.desc || "暂无简介。",
    href: asset.href || "",
    tags: Array.isArray(asset.tags) ? asset.tags : [],
  };
}

function getActiveAsset() {
  return assetStore.find((asset) => asset.id === activeAssetId) || null;
}

function createAssetCard(assetData) {
  const asset = getNormalizedAsset(assetData);
  const card = document.createElement("button");
  card.className = "directory-card asset-card";
  card.type = "button";
  card.dataset.assetCard = "";
  card.dataset.assetId = asset.id;
  card.dataset.assetKind = asset.category;

  const content = document.createElement("div");
  const row = document.createElement("div");
  row.className = "card-main-row";
  const logo = document.createElement("span");
  logo.className = "card-logo";
  logo.textContent = getAssetLogoText(asset);
  const titleNode = document.createElement("div");
  titleNode.className = "card-title";
  titleNode.textContent = asset.title;
  row.append(logo, titleNode);

  const descNode = document.createElement("p");
  descNode.className = "card-desc";
  descNode.textContent = asset.desc;
  content.append(row, descNode);

  const tagWrap = document.createElement("div");
  tagWrap.className = "card-tags";
  renderTags({ querySelector: () => tagWrap }, asset.tags.length ? asset.tags : [getAssetCategoryLabel(asset.category)]);
  card.append(content, tagWrap);
  card.addEventListener("click", () => openAssetDetail(asset.id));
  return card;
}

function renderAssetStore() {
  const grid = document.querySelector("[data-asset-grid]");
  if (!grid) return;
  grid.replaceChildren();
  const visibleAssets = assetStore.filter((asset) => activeAssetCategory === "all" || asset.category === activeAssetCategory);
  visibleAssets.forEach((asset) => grid.appendChild(createAssetCard(asset)));
  if (!visibleAssets.length) {
    const empty = document.createElement("div");
    empty.className = "asset-empty";
    empty.textContent = "当前分类暂无资产。";
    grid.appendChild(empty);
  }
}

function switchAssetTab(category) {
  activeAssetCategory = category || "all";
  document.querySelectorAll("[data-asset-tab]").forEach((tab) => {
    const isActive = tab.dataset.assetTab === activeAssetCategory;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });
  renderAssetStore();
}

function showAssetList() {
  document.body.classList.remove("is-asset-detail-open");
  if (assetDetailView) assetDetailView.setAttribute("aria-hidden", "true");
  activeAssetId = null;
}

function renderAssetDetail(asset) {
  if (!assetDetailView || !asset) return;
  const normalizedAsset = getNormalizedAsset(asset);
  if (assetDetailCategory) assetDetailCategory.textContent = getAssetCategoryLabel(normalizedAsset.category);
  if (assetDetailTitle) assetDetailTitle.textContent = normalizedAsset.title;
  if (assetDetailDesc) assetDetailDesc.textContent = normalizedAsset.desc;
  if (assetDetailHref) assetDetailHref.textContent = normalizedAsset.href || "暂无项目地址";
  if (assetDetailTags) {
    assetDetailTags.replaceChildren();
    (normalizedAsset.tags.length ? normalizedAsset.tags : [getAssetCategoryLabel(normalizedAsset.category)]).forEach((tagText) => {
      const tag = document.createElement("span");
      tag.className = "tag";
      tag.textContent = tagText;
      assetDetailTags.appendChild(tag);
    });
  }
  if (openAssetUrl) openAssetUrl.disabled = !normalizedAsset.href || normalizedAsset.href === "#";
}

function openAssetDetail(assetId) {
  const asset = assetStore.find((item) => item.id === assetId);
  if (!asset) return;
  activeAssetId = assetId;
  renderAssetDetail(asset);
  document.body.classList.add("is-asset-detail-open");
  if (assetDetailView) assetDetailView.setAttribute("aria-hidden", "false");
}

function openAssetEditorPanel(mode = "add", asset = null) {
  if (!editorPanel || !editForm) return;
  activeMode = mode;
  activeCollection = "assets";
  activeCard = null;
  activeCardId = asset?.id || null;
  editorTitle.textContent = mode === "edit" ? "编辑资产" : "添加资产";
  if (editTitleLabel) editTitleLabel.textContent = "标题";
  editTitle.value = asset?.title || "";
  editDesc.value = asset?.desc || "";
  editDescField.classList.remove("is-hidden");
  editCategoryField?.classList.remove("is-hidden");
  if (editCategory) editCategory.value = asset?.category || (activeAssetCategory === "all" ? "" : activeAssetCategory);
  editTagsField?.classList.remove("is-hidden");
  editHrefField?.classList.remove("is-hidden");
  editTags.value = (asset?.tags || []).join("，");
  editHref.value = asset?.href || "";
  if (deleteCard) deleteCard.hidden = true;
  editorPanel.classList.add("is-open");
  editorBackdrop?.classList.add("is-open");
  editorPanel.setAttribute("aria-hidden", "false");
  editTitle.focus();
}

function getAssetFormData() {
  return {
    title: editTitle.value.trim() || "未命名资产",
    category: editCategory?.value || "",
    desc: editDesc.value.trim(),
    href: editHref.value.trim(),
    tags: editTags.value.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean),
  };
}

function saveAssetForm() {
  const formData = getAssetFormData();
  if (activeMode === "add") {
    const nextAsset = {
      id: createCardId("asset"),
      ...formData,
    };
    assetStore.push(nextAsset);
    activeAssetId = nextAsset.id;
  } else if (activeCardId) {
    assetStore = assetStore.map((asset) => (asset.id === activeCardId ? { ...asset, ...formData } : asset));
    activeAssetId = activeCardId;
  }
  saveAssetStore();
  renderAssetStore();
  renderOverviewStats();
  closeEditorPanel();
  if (activeAssetId) openAssetDetail(activeAssetId);
}

function deleteActiveAsset() {
  if (!activeAssetId) return;
  assetStore = assetStore.filter((asset) => asset.id !== activeAssetId);
  saveAssetStore();
  renderAssetStore();
  renderOverviewStats();
  showAssetList();
}

function getPlanningStageLabel(stage) {
  return planningStages.find((item) => item.id === stage)?.label || "规划中";
}

function getTeamOwners() {
  const names = Array.isArray(cardStore.members)
    ? cardStore.members.map((member) => member.title).filter(Boolean)
    : [];
  return [...new Set(names.length ? names : ["姓名"])];
}

function createPlanningTaskId() {
  return `planning-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function getPlanningTask(taskId) {
  return planningStore.find((task) => task.id === taskId) || null;
}

function createPlanningCard(task) {
  const card = document.createElement("article");
  card.className = "planning-task-card";
  card.role = "button";
  card.tabIndex = 0;
  card.draggable = true;
  card.dataset.planningId = task.id;
  card.innerHTML = `
    <div class="planning-task-top">
      <p class="planning-task-desc"></p>
    </div>
    <div class="planning-owner-row" aria-label="负责人"></div>
  `;
  card.querySelector(".planning-task-desc").textContent = task.desc || "未命名体验项目";
  const topRow = card.querySelector(".planning-task-top");
  const ownerRow = card.querySelector(".planning-owner-row");
  (task.owners?.length ? task.owners : ["未指定"]).forEach((owner) => {
    const pill = document.createElement("span");
    pill.className = "planning-owner-pill";
    pill.textContent = owner;
    ownerRow.appendChild(pill);
  });
  if (task.href) {
    const linkButton = document.createElement("button");
    linkButton.className = "planning-address-btn";
    linkButton.type = "button";
    linkButton.setAttribute("aria-label", "打开地址");
    linkButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M13.6572 6.58616C14.8288 5.41459 14.8288 3.5151 13.6572 2.34352C12.4857 1.17195 10.5862 1.17195 9.41459 2.34352L7.29327 4.46484C7.0118 4.74632 6.79795 5.06981 6.65172 5.41513C6.53167 5.69863 6.45721 5.99685 6.42832 6.29861C6.42448 6.33875 6.42144 6.37896 6.41921 6.41921C6.37365 7.24163 6.66501 8.07922 7.29327 8.70748C7.66595 9.08016 8.11228 9.33429 8.5854 9.46987C8.57624 9.80334 8.48415 10.135 8.30912 10.4311C7.67824 10.2504 7.08309 9.91152 6.58616 9.41459C5.82179 8.65022 5.43144 7.65345 5.41513 6.65172C5.40956 6.31001 5.44752 5.9677 5.529 5.63386C5.53581 5.60596 5.54293 5.57812 5.55034 5.55034C5.72571 4.89366 6.07098 4.27292 6.58616 3.75774L8.70748 1.63642C10.2696 0.0743195 12.8022 0.0743195 14.3643 1.63642C15.9264 3.19851 15.9264 5.73117 14.3643 7.29327L12.243 9.41459C12.0303 9.62728 11.7996 9.81101 11.5559 9.96578C11.602 9.54739 11.5954 9.12428 11.5362 8.70723L13.6572 6.58616ZM10.5856 9.34903C10.5917 9.71931 10.5466 10.0903 10.4504 10.4504C10.275 11.1071 9.92977 11.7278 9.41459 12.243L7.29327 14.3643C5.73117 15.9264 3.19851 15.9264 1.63642 14.3643C0.0743195 12.8022 0.0743195 10.2696 1.63642 8.70748L3.75774 6.58616C3.97043 6.37348 4.20111 6.18975 4.44488 6.03497C4.39875 6.45337 4.40531 6.87647 4.46458 7.29353L2.34352 9.41459C1.17195 10.5862 1.17195 12.4857 2.34352 13.6572C3.5151 14.8288 5.41459 14.8288 6.58616 13.6572L8.70748 11.5359C8.98896 11.2544 9.20281 10.9309 9.34903 10.5856C9.48505 10.2644 9.56255 9.92429 9.58154 9.58154C9.6271 8.75913 9.33575 7.92153 8.70748 7.29327C8.33481 6.9206 7.88848 6.66647 7.41535 6.53089C7.42451 6.19742 7.51661 5.8658 7.69164 5.56962C8.32251 5.75039 8.91766 6.08923 9.41459 6.58616C10.179 7.35054 10.5693 8.34731 10.5856 9.34903Z" fill="#181C25"/>
      </svg>
    `;
    linkButton.addEventListener("click", (event) => {
      event.stopPropagation();
      window.open(task.href, "_blank", "noopener");
    });
    topRow.appendChild(linkButton);
  }
  card.addEventListener("dragstart", (event) => {
    card.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", task.id);
  });
  card.addEventListener("dragend", () => {
    card.classList.remove("is-dragging");
    document.querySelectorAll(".planning-column.is-drag-over").forEach((column) => column.classList.remove("is-drag-over"));
  });
  card.addEventListener("click", () => openPlanningEditor("edit", task.stage || "planning", task));
  card.addEventListener("keydown", (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    openPlanningEditor("edit", task.stage || "planning", task);
  });
  return card;
}

function renderPlanningStore() {
  document.querySelectorAll("[data-planning-list]").forEach((list) => {
    const stage = list.dataset.planningList;
    const tasks = planningStore.filter((task) => (task.stage || "planning") === stage);
    list.replaceChildren();
    if (!tasks.length) {
      const empty = document.createElement("div");
      empty.className = "planning-empty";
      empty.textContent = "暂无体验项目";
      list.appendChild(empty);
      return;
    }
    tasks.forEach((task) => list.appendChild(createPlanningCard(task)));
  });
  initPlanningDragAndDrop();
}

function populatePlanningStageSelect(selectNode, selectedStage) {
  if (!selectNode) return;
  selectNode.replaceChildren();
  planningStages.forEach((stage) => {
    if (selectNode.tagName !== "SELECT") {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "planning-stage-option";
      button.dataset.stageValue = stage.id;
      button.textContent = stage.label;
      const isSelected = stage.id === selectedStage;
      button.classList.toggle("is-active", isSelected);
      button.setAttribute("role", "radio");
      button.setAttribute("aria-checked", String(isSelected));
      button.addEventListener("click", () => {
        selectNode.querySelectorAll(".planning-stage-option").forEach((item) => {
          const active = item === button;
          item.classList.toggle("is-active", active);
          item.setAttribute("aria-checked", String(active));
        });
      });
      selectNode.appendChild(button);
      return;
    }
    const option = document.createElement("option");
    option.value = stage.id;
    option.textContent = stage.label;
    option.selected = stage.id === selectedStage;
    selectNode.appendChild(option);
  });
}

function populatePlanningOwnerOptions(selectedOwners = []) {
  if (!planningOwnerOptions) return;
  planningOwnerOptions.replaceChildren();
  getTeamOwners().forEach((owner) => {
    const label = document.createElement("label");
    label.className = "owner-check";
    const input = document.createElement("input");
    input.type = "checkbox";
    input.value = owner;
    input.checked = selectedOwners.includes(owner);
    label.append(input, document.createTextNode(owner));
    planningOwnerOptions.appendChild(label);
  });
}

function openPlanningDetail(taskId) {
  const task = getPlanningTask(taskId);
  if (!task || !planningDetailPanel) return;
  activePlanningId = task.id;
  if (planningDetailStage) planningDetailStage.textContent = getPlanningStageLabel(task.stage);
  if (planningDetailDesc) planningDetailDesc.textContent = task.desc || "未命名体验项目";
  if (planningDetailOwners) planningDetailOwners.textContent = task.owners?.length ? task.owners.join("、") : "未指定";
  if (planningDetailHref) planningDetailHref.textContent = task.href || "未填写";
  if (openPlanningUrl) openPlanningUrl.disabled = !task.href;
  populatePlanningStageSelect(planningDetailStageSelect, task.stage || "planning");
  planningDetailPanel.classList.add("is-open");
  editorBackdrop?.classList.add("is-open");
  planningDetailPanel.setAttribute("aria-hidden", "false");
}

function closePlanningDetailPanel() {
  if (!planningDetailPanel) return;
  planningDetailPanel.classList.remove("is-open");
  planningDetailPanel.setAttribute("aria-hidden", "true");
  if (!planningEditorPanel?.classList.contains("is-open") && !editorPanel?.classList.contains("is-open") && !reportUploadPanel?.classList.contains("is-open")) {
    editorBackdrop?.classList.remove("is-open");
  }
}

function openPlanningEditor(mode = "add", stage = "planning", task = null) {
  if (!planningEditorPanel || !planningForm) return;
  activePlanningMode = mode;
  activePlanningId = task?.id || null;
  activePlanningStage = task?.stage || stage;
  if (planningEditorTitle) planningEditorTitle.textContent = mode === "edit" ? "编辑体验项目" : "新建体验项目";
  if (planningDescInput) planningDescInput.value = task?.desc || "";
  if (planningHrefInput) planningHrefInput.value = task?.href || "";
  if (deletePlanningFromEditor) deletePlanningFromEditor.hidden = mode !== "edit";
  if (openPlanningHrefInput) openPlanningHrefInput.disabled = !task?.href;
  populatePlanningOwnerOptions(task?.owners || []);
  populatePlanningStageSelect(planningStageSelect, activePlanningStage);
  planningEditorPanel.classList.add("is-open");
  editorBackdrop?.classList.add("is-open");
  planningEditorPanel.setAttribute("aria-hidden", "false");
  planningDescInput?.focus();
}

function closePlanningEditorPanel() {
  if (!planningEditorPanel) return;
  planningEditorPanel.classList.remove("is-open");
  planningEditorPanel.setAttribute("aria-hidden", "true");
  if (!planningDetailPanel?.classList.contains("is-open") && !editorPanel?.classList.contains("is-open") && !reportUploadPanel?.classList.contains("is-open")) {
    editorBackdrop?.classList.remove("is-open");
  }
  activePlanningMode = "add";
}

function getSelectedPlanningOwners() {
  return Array.from(planningOwnerOptions?.querySelectorAll("input:checked") || []).map((input) => input.value);
}

function savePlanningForm() {
  const selectedStage = planningStageSelect?.tagName === "SELECT"
    ? planningStageSelect.value
    : planningStageSelect?.querySelector(".planning-stage-option.is-active")?.dataset.stageValue;
  const nextTask = {
    id: activePlanningId || createPlanningTaskId(),
    desc: planningDescInput?.value.trim() || "未命名体验项目",
    owners: getSelectedPlanningOwners(),
    href: planningHrefInput?.value.trim() || "",
    stage: selectedStage || activePlanningStage || "planning",
  };
  if (activePlanningMode === "edit" && activePlanningId) {
    planningStore = planningStore.map((task) => task.id === activePlanningId ? nextTask : task);
  } else {
    planningStore.push(nextTask);
  }
  savePlanningStore();
  renderPlanningStore();
  renderOverviewStats();
  closePlanningEditorPanel();
  activePlanningId = null;
}

function deleteActivePlanningTask() {
  if (!activePlanningId) return;
  planningStore = planningStore.filter((task) => task.id !== activePlanningId);
  savePlanningStore();
  renderPlanningStore();
  renderOverviewStats();
  closePlanningDetailPanel();
  activePlanningId = null;
}

function updateActivePlanningStage(stage) {
  if (!activePlanningId) return;
  planningStore = planningStore.map((task) => task.id === activePlanningId ? { ...task, stage } : task);
  savePlanningStore();
  renderPlanningStore();
  renderOverviewStats();
  openPlanningDetail(activePlanningId);
}

function movePlanningTaskToStage(taskId, stage) {
  if (!taskId || !stage) return;
  let changed = false;
  planningStore = planningStore.map((task) => {
    if (task.id !== taskId || task.stage === stage) return task;
    changed = true;
    return { ...task, stage };
  });
  if (!changed) return;
  savePlanningStore();
  renderPlanningStore();
  renderOverviewStats();
}

function initPlanningDragAndDrop() {
  document.querySelectorAll("[data-planning-stage]").forEach((column) => {
    if (column.dataset.dropReady === "true") return;
    column.dataset.dropReady = "true";
    column.addEventListener("dragover", (event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      column.classList.add("is-drag-over");
    });
    column.addEventListener("dragleave", (event) => {
      if (column.contains(event.relatedTarget)) return;
      column.classList.remove("is-drag-over");
    });
    column.addEventListener("drop", (event) => {
      event.preventDefault();
      column.classList.remove("is-drag-over");
      const taskId = event.dataTransfer.getData("text/plain");
      movePlanningTaskToStage(taskId, column.dataset.planningStage);
    });
  });
}

function openPlanningImportPanel() {
  if (!planningImportPanel) return;
  if (planningImportText) planningImportText.value = "";
  planningImportPanel.classList.add("is-open");
  editorBackdrop?.classList.add("is-open");
  planningImportPanel.setAttribute("aria-hidden", "false");
  planningImportText?.focus();
}

function closePlanningImportPanel() {
  if (!planningImportPanel) return;
  planningImportPanel.classList.remove("is-open");
  planningImportPanel.setAttribute("aria-hidden", "true");
  if (!planningEditorPanel?.classList.contains("is-open") && !planningDetailPanel?.classList.contains("is-open") && !editorPanel?.classList.contains("is-open") && !reportUploadPanel?.classList.contains("is-open")) {
    editorBackdrop?.classList.remove("is-open");
  }
}

function parsePlanningImportText(text) {
  const normalized = text.trim();
  if (!normalized) return [];
  const chunks = normalized
    .split(/\n(?=\s*(?:\d+[\.\)、)]|[（(]?\d+[）)]))/)
    .map((chunk) => chunk.replace(/^\s*(?:\d+[\.\)、)]|[（(]?\d+[）)])\s*/, "").trim())
    .filter(Boolean);
  const rawTasks = chunks.length ? chunks : normalized.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  const owners = getTeamOwners();
  return rawTasks.map((desc) => {
    const matchedOwners = owners.filter((owner) => desc.includes(`@${owner}`));
    const cleanDesc = desc.replace(/@\S+/g, "").trim();
    return {
      id: createPlanningTaskId(),
      desc: cleanDesc || "未命名体验项目",
      owners: matchedOwners,
      href: "",
      stage: "planning",
    };
  });
}

function importPlanningTasks() {
  const tasks = parsePlanningImportText(planningImportText?.value || "");
  if (!tasks.length) return;
  planningStore.push(...tasks);
  savePlanningStore();
  renderPlanningStore();
  renderOverviewStats();
  closePlanningImportPanel();
}

function renderReportStore() {
  document.querySelectorAll('[data-report-custom="true"]').forEach((card) => card.remove());
  const sortedReports = [...reportStore].sort((a, b) => getReportSortIndex(a) - getReportSortIndex(b));
  sortedReports.forEach((report) => {
    const grid = document.querySelector(`[data-report-grid="${report.category || "zh"}"]`);
    if (grid) grid.appendChild(createReportCard(report));
  });
  applyReportOrder();
  initReportSorting();
  renderQualityAverages();
}

function getReportSortIndex(report) {
  const category = report.category || "zh";
  const order = reportOrderStore[category] || [];
  const index = order.indexOf(report.id);
  return index === -1 ? Number.MAX_SAFE_INTEGER : index;
}

function getReportCardId(card) {
  return card.dataset.reportId || "";
}

function applyReportOrder() {
  document.querySelectorAll("[data-report-grid]").forEach((grid) => {
    const order = reportOrderStore[grid.dataset.reportGrid] || [];
    if (!order.length) return;
    const cards = Array.from(grid.querySelectorAll(".quality-card"));
    cards.sort((a, b) => {
      const aIndex = order.indexOf(getReportCardId(a));
      const bIndex = order.indexOf(getReportCardId(b));
      return (aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex) - (bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex);
    });
    cards.forEach((card) => grid.appendChild(card));
  });
}

function persistReportOrder(grid) {
  const category = grid.dataset.reportGrid;
  if (!category) return;
  const orderedIds = Array.from(grid.querySelectorAll(".quality-card")).map(getReportCardId).filter(Boolean);
  reportOrderStore[category] = orderedIds;
  const rank = new Map(orderedIds.map((id, index) => [id, index]));
  reportStore = reportStore.map((report) => (
    (report.category || "zh") === category && rank.has(report.id) ? { ...report, order: rank.get(report.id) } : report
  ));
  saveReportOrderStore();
  saveReportStore();
}

function getDragAfterElement(container, x, y) {
  const draggableCards = [...container.querySelectorAll(".quality-card:not(.is-dragging)")];
  return draggableCards.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offsetY = y - box.top - box.height / 2;
    const offsetX = x - box.left - box.width / 2;
    const offset = Math.abs(offsetY) > Math.abs(offsetX) ? offsetY : offsetX;
    if (offset < 0 && offset > closest.offset) return { offset, element: child };
    return closest;
  }, { offset: Number.NEGATIVE_INFINITY, element: null }).element;
}

function initReportSorting() {
  document.querySelectorAll("[data-report-grid]").forEach((grid) => {
    if (grid.dataset.sortableReady !== "true") {
      grid.dataset.sortableReady = "true";
      grid.addEventListener("dragover", (event) => {
        event.preventDefault();
        const draggingCard = grid.querySelector(".quality-card.is-dragging");
        if (!draggingCard) return;
        const afterElement = getDragAfterElement(grid, event.clientX, event.clientY);
        if (afterElement) grid.insertBefore(draggingCard, afterElement);
        else grid.appendChild(draggingCard);
      });
      grid.addEventListener("drop", (event) => {
        event.preventDefault();
        reportOrderSavedDuringDrop = true;
        persistReportOrder(grid);
      });
      grid.addEventListener("dragend", () => {
        grid.querySelectorAll(".quality-card.is-dragging").forEach((card) => card.classList.remove("is-dragging"));
        if (!reportOrderSavedDuringDrop) persistReportOrder(grid);
        reportOrderSavedDuringDrop = false;
      });
    }

    grid.querySelectorAll(".quality-card").forEach((card) => {
      if (card.dataset.dragReady === "true") return;
      card.dataset.dragReady = "true";
      card.draggable = true;
      card.addEventListener("dragstart", (event) => {
        card.classList.add("is-dragging");
        event.dataTransfer.effectAllowed = "move";
        event.dataTransfer.setData("text/plain", getReportCardId(card));
      });
    });
  });
}

function openReportUploadPanel(mode = "add", report = null) {
  if (!reportUploadPanel || !reportUploadForm) return;
  activeReportMode = mode;
  activeReportId = report?.id || null;
  if (reportUploadTitle) reportUploadTitle.textContent = mode === "edit" ? "编辑报告" : "上传报告";
  if (reportTitleInput) reportTitleInput.value = report?.title || "";
  if (reportFileInput) reportFileInput.value = "";
  if (reportFileName) reportFileName.textContent = report?.fileName || report?.url || "选择 .html 文件";
  reportUploadPanel.classList.add("is-open");
  editorBackdrop?.classList.add("is-open");
  reportUploadPanel.setAttribute("aria-hidden", "false");
  reportTitleInput?.focus();
}

function closeReportUploadPanel() {
  if (!reportUploadPanel) return;
  reportUploadPanel.classList.remove("is-open");
  reportUploadPanel.setAttribute("aria-hidden", "true");
  if (!editorPanel?.classList.contains("is-open")) editorBackdrop?.classList.remove("is-open");
  activeReportMode = "add";
  activeReportId = null;
}

function getActiveCustomReport() {
  if (!activeReportCard?.dataset.reportCustom) return null;
  return reportStore.find((report) => report.id === activeReportCard.dataset.reportId) || null;
}

function readReportFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(String(reader.result || "")));
    reader.addEventListener("error", () => reject(reader.error || new Error("报告文件读取失败")));
    reader.readAsText(file);
  });
}

async function uploadReportFile(file, title) {
  const formData = new FormData();
  formData.append("title", title);
  formData.append("file", file);
  const uploadUrl = new URL("/api/reports", window.location.origin);
  const response = await fetch(uploadUrl, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) {
    let detail = "";
    try {
      detail = (await response.json()).error || "";
    } catch (error) {
      detail = await response.text();
    }
    throw new Error(`报告上传失败：${response.status}${detail ? ` ${detail}` : ""}`);
  }
  return response.json();
}

function openEditor(card) {
  if (!editorPanel || !editForm) return;
  activeCard = card;
  activeCardId = card.dataset.cardId || null;
  activeMode = "edit";
  activeCollection = getStorageCollection(card.dataset.cardType || "links");
  const isMember = activeCollection === "members";
  editorTitle.textContent = isMember ? "编辑成员" : "编辑卡片";
  if (editTitleLabel) editTitleLabel.textContent = isMember ? "姓名" : "标题";
  editTitle.value = card.querySelector(".card-title").textContent.trim();
  const descNode = card.querySelector(".card-desc");
  editDesc.value = isMember ? (card.dataset.memberDesc || "") : (descNode ? descNode.textContent.trim() : "");
  editDescField.classList.toggle("is-hidden", activeCollection === "links");
  editCategoryField?.classList.add("is-hidden");
  editTagsField?.classList.toggle("is-hidden", isMember);
  editHrefField?.classList.toggle("is-hidden", isMember);
  editTags.value = Array.from(card.querySelectorAll(".tag")).map((tag) => tag.textContent.trim()).join("，");
  editHref.value = card.getAttribute("href") || "";
  if (deleteCard) deleteCard.hidden = false;
  editorPanel.classList.add("is-open");
  editorBackdrop.classList.add("is-open");
  editorPanel.setAttribute("aria-hidden", "false");
  editTitle.focus();
}

function openAddEditor(collection) {
  if (!editorPanel || !editForm) return;
  activeCard = null;
  activeCardId = null;
  activeMode = "add";
  activeCollection = getStorageCollection(collection);
  const isMember = activeCollection === "members";
  editorTitle.textContent = isMember ? "添加成员" : "添加卡片";
  if (editTitleLabel) editTitleLabel.textContent = isMember ? "姓名" : "标题";
  editTitle.value = "";
  editDesc.value = "";
  editDescField.classList.toggle("is-hidden", activeCollection === "links");
  editCategoryField?.classList.add("is-hidden");
  editTagsField?.classList.toggle("is-hidden", isMember);
  editHrefField?.classList.toggle("is-hidden", isMember);
  editTags.value = activeCollection === "members" ? "成员" : "";
  editHref.value = "";
  if (deleteCard) deleteCard.hidden = true;
  editorPanel.classList.add("is-open");
  editorBackdrop.classList.add("is-open");
  editorPanel.setAttribute("aria-hidden", "false");
  editTitle.focus();
}

function closeEditorPanel() {
  if (!editorPanel || !editorBackdrop) return;
  editorPanel.classList.remove("is-open");
  editorBackdrop.classList.remove("is-open");
  editorPanel.setAttribute("aria-hidden", "true");
  activeCard = null;
  activeCardId = null;
  if (deleteCard) deleteCard.hidden = true;
}

function getLogoText(title, collection) {
  if (collection === "members") return getMemberInitial(title);
  const trimmed = title.trim();
  return trimmed ? trimmed.slice(0, 1).toUpperCase() : "+";
}

function getMemberInitial(title) {
  const trimmed = title.trim();
  return trimmed ? trimmed.slice(0, 1) : "姓";
}

function renderTags(card, tags) {
  const tagWrap = card.querySelector(".card-tags");
  if (!tagWrap) return;
  tagWrap.replaceChildren();
  tags.forEach((tagText) => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = tagText;
    tagWrap.appendChild(tag);
  });
}

function createCard(data) {
  const collection = getStorageCollection(data.collection || "links");
  if (collection === "members") return createMemberPill(data);
  const card = document.createElement("a");
  card.className = "directory-card editable-card";
  card.dataset.cardType = collection;
  card.dataset.cardId = data.id;
  if (collection !== "members") {
    card.href = data.href || "#";
    card.target = "_blank";
    card.rel = "noopener";
  }

  const editButton = document.createElement("button");
  editButton.className = "edit-card-btn";
  editButton.type = "button";
  editButton.dataset.editCard = "";
  editButton.textContent = "编辑";

  const content = document.createElement("div");
  const row = document.createElement("div");
  row.className = "card-main-row";
  const logo = document.createElement("span");
  logo.className = "card-logo";
  logo.textContent = collection === "members" ? getMemberInitial(data.title) : getLogoText(data.title, collection);
  const titleNode = document.createElement("div");
  titleNode.className = "card-title";
  titleNode.textContent = data.title;
  row.append(logo, titleNode);
  content.append(row);
  if (collection !== "links") {
    const descNode = document.createElement("div");
    descNode.className = "card-desc";
    descNode.textContent = data.desc || "暂无简介。";
    content.append(descNode);
  }

  const tagWrap = document.createElement("div");
  tagWrap.className = "card-tags";
  card.append(editButton, content, tagWrap);
  renderTags(card, data.tags || []);
  bindEditableCard(card);
  return card;
}

function createMemberPill(data) {
  const card = document.createElement("article");
  card.className = "member-pill editable-card";
  card.dataset.cardType = "members";
  card.dataset.cardId = data.id;
  card.dataset.memberDesc = data.desc || "暂无简介。";
  card.tabIndex = 0;

  const logo = document.createElement("span");
  logo.className = "card-logo";
  logo.textContent = getMemberInitial(data.title);

  const titleNode = document.createElement("span");
  titleNode.className = "card-title";
  titleNode.textContent = data.title;

  card.append(logo, titleNode);
  bindEditableCard(card);
  return card;
}

function createMemberAddPill() {
  const button = document.createElement("button");
  button.className = "member-add-btn";
  button.type = "button";
  button.dataset.addCard = "members";
  button.textContent = "添加";
  button.addEventListener("click", () => openAddEditor("members"));
  return button;
}

function renderCollection(collection) {
  const grid = document.querySelector(`[data-card-grid="${collection}"]`);
  if (!grid || !Array.isArray(cardStore[collection])) return;
  grid.replaceChildren();
  cardStore[collection].forEach((item) => {
    grid.appendChild(createCard({ ...item, collection }));
  });
  if (collection === "members") grid.appendChild(createMemberAddPill());
  renderOverviewStats();
}

function renderActiveCollection() {
  renderCollection(activeCollection);
}

function bindEditableCard(card) {
  if (card.dataset.cardType === "members") {
    card.addEventListener("click", () => openEditor(card));
    card.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      openEditor(card);
    });
    return;
  }
  const button = card.querySelector("[data-edit-card]");
  if (!button) return;
  button.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openEditor(card);
  });
}

function getFormData() {
  if (activeCollection === "members") {
    return {
      title: editTitle.value.trim() || "未命名成员",
      desc: editDesc.value.trim(),
      tags: [],
      href: "",
    };
  }
  return {
    title: editTitle.value.trim() || "未命名卡片",
    desc: editDesc.value.trim(),
    tags: editTags.value.split(/[，,]/).map((tag) => tag.trim()).filter(Boolean),
    href: editHref.value.trim() || "#",
  };
}

document.querySelectorAll("[data-add-card]").forEach((button) => {
  button.addEventListener("click", () => {
    openAddEditor(button.dataset.addCard);
  });
});

if (openReportUpload) {
  openReportUpload.addEventListener("click", () => {
    openReportUploadPanel("add");
  });
}

if (reportFileInput) {
  reportFileInput.addEventListener("change", () => {
    const file = reportFileInput.files?.[0];
    if (reportFileName) reportFileName.textContent = file ? file.name : "选择 .html 文件";
  });
}

qualityTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    switchQualityTab(tab.dataset.qualityTab);
    if (history.replaceState) history.replaceState(null, "", "#" + tab.dataset.qualityTab);
  });
});

if (qualityTabs.length && location.hash) {
  const tabName = location.hash.replace("#", "");
  if (qualityTabs.some((tab) => tab.dataset.qualityTab === tabName)) switchQualityTab(tabName);
}

document.querySelectorAll("[data-report-title]").forEach((card) => {
  card.addEventListener("click", (event) => {
    event.preventDefault();
    if (card.dataset.reportUrl) {
      openEmbeddedReport(card);
      return;
    }
  });
});

if (backToQualityList) {
  backToQualityList.addEventListener("click", () => {
    closeEmbeddedReport();
  });
}

if (editCurrentReport) {
  editCurrentReport.addEventListener("click", () => {
    const report = getActiveCustomReport();
    if (report) {
      openReportUploadPanel("edit", report);
      return;
    }
    if (!activeReportCard) return;
    openReportUploadPanel("replace-static", {
      id: activeReportCard.dataset.reportId,
      title: activeReportCard.dataset.reportTitle || "",
      url: activeReportCard.dataset.reportUrl || "",
    });
  });
}

if (deleteCurrentReport) {
  deleteCurrentReport.addEventListener("click", () => {
    const report = getActiveCustomReport();
    if (report) {
      reportStore = reportStore.filter((item) => item.id !== report.id);
      saveReportStore();
      renderReportStore();
    } else if (activeReportCard) {
      activeReportCard.remove();
      renderQualityAverages();
    }
    closeEmbeddedReport();
  });
}

if (reportUploadForm) {
  reportUploadForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const title = reportTitleInput?.value.trim() || "未命名质检报告";
      const file = reportFileInput?.files?.[0] || null;
      const existingReport = activeReportId ? reportStore.find((report) => report.id === activeReportId) : null;
      if (!file && activeReportMode !== "edit") return;
      let uploaded = null;
      let html = "";
      if (file) {
        html = await readReportFile(file);
        uploaded = await uploadReportFile(file, title);
      } else if (existingReport?.html) {
        html = existingReport.html;
      }
      const nextReport = {
        id: activeReportId || `report-${Date.now()}-${Math.random().toString(16).slice(2)}`,
        title,
        html: uploaded ? "" : (existingReport?.html || ""),
        url: uploaded?.url || existingReport?.url || "",
        fileName: uploaded?.fileName || existingReport?.fileName || file?.name || "",
        score: file ? getReportScoreFromHtml(html) : (existingReport?.score || "86"),
        date: new Date().toISOString().slice(0, 10),
        category: getActiveQualityTab(),
      };
      if (activeReportMode === "replace-static" && activeReportCard) {
        activeReportCard.dataset.reportTitle = title;
        if (uploaded?.url) activeReportCard.dataset.reportUrl = uploaded.url;
        activeReportCard.dataset.reportScore = nextReport.score;
        activeReportCard.querySelector(".card-title").textContent = title;
        activeReportCard.querySelector(".card-desc").textContent = getReportSummary(title);
        const scoreRing = activeReportCard.querySelector(".score-ring");
        if (scoreRing) {
          scoreRing.textContent = nextReport.score;
          scoreRing.dataset.scoreTone = getScoreTone(nextReport.score);
          scoreRing.style.setProperty("--score", nextReport.score);
        }
        closeReportUploadPanel();
        openEmbeddedReport(activeReportCard);
        renderQualityAverages();
        return;
      }
      if (activeReportMode === "edit" && activeReportId) {
        reportStore = reportStore.map((report) => report.id === activeReportId ? { ...report, ...nextReport } : report);
      } else {
        reportStore.push(nextReport);
      }
      saveReportStore();
      renderReportStore();
      closeReportUploadPanel();
      const reportCard = document.querySelector(`[data-report-id="${nextReport.id}"]`);
      if (reportCard) openEmbeddedReport(reportCard);
    } catch (error) {
      console.error(error);
      if (reportFileName) reportFileName.textContent = `${error.message || "上传失败"}，请刷新页面后重试`;
    }
  });
}

if (closeReportUpload) closeReportUpload.addEventListener("click", closeReportUploadPanel);
if (cancelReportUpload) cancelReportUpload.addEventListener("click", closeReportUploadPanel);

if (embeddedReportFrame) {
  embeddedReportFrame.addEventListener("load", () => {
    syncEmbeddedReportMetrics();
    resizeEmbeddedReport();
  });
}

document.querySelectorAll("[data-asset-tab]").forEach((tab) => {
  tab.addEventListener("click", () => {
    switchAssetTab(tab.dataset.assetTab || "all");
  });
});

if (openAssetEditor) {
  openAssetEditor.addEventListener("click", () => {
    openAssetEditorPanel("add");
  });
}

if (backToAssetList) backToAssetList.addEventListener("click", showAssetList);

if (editAsset) {
  editAsset.addEventListener("click", () => {
    const asset = getActiveAsset();
    if (asset) openAssetEditorPanel("edit", asset);
  });
}

if (deleteAsset) deleteAsset.addEventListener("click", deleteActiveAsset);

if (openAssetUrl) {
  openAssetUrl.addEventListener("click", () => {
    const asset = getActiveAsset();
    if (!asset?.href || asset.href === "#") return;
    window.open(asset.href, "_blank", "noopener");
  });
}

document.querySelectorAll("[data-add-planning]").forEach((button) => {
  button.addEventListener("click", () => {
    openPlanningEditor("add", button.dataset.addPlanning || "planning");
  });
});

if (planningDetailStageSelect) {
  planningDetailStageSelect.addEventListener("change", () => {
    updateActivePlanningStage(planningDetailStageSelect.value);
  });
}

if (closePlanningDetail) closePlanningDetail.addEventListener("click", closePlanningDetailPanel);
if (deletePlanningTask) deletePlanningTask.addEventListener("click", deleteActivePlanningTask);

if (editPlanningTask) {
  editPlanningTask.addEventListener("click", () => {
    const task = getPlanningTask(activePlanningId);
    if (task) openPlanningEditor("edit", task.stage || "planning", task);
  });
}

if (openPlanningUrl) {
  openPlanningUrl.addEventListener("click", () => {
    const task = getPlanningTask(activePlanningId);
    if (!task?.href) return;
    window.open(task.href, "_blank", "noopener");
  });
}

if (planningHrefInput && openPlanningHrefInput) {
  planningHrefInput.addEventListener("input", () => {
    openPlanningHrefInput.disabled = !planningHrefInput.value.trim();
  });
  openPlanningHrefInput.addEventListener("click", () => {
    const href = planningHrefInput.value.trim();
    if (!href) return;
    window.open(href, "_blank", "noopener");
  });
}

if (deletePlanningFromEditor) {
  deletePlanningFromEditor.addEventListener("click", () => {
    deleteActivePlanningTask();
    closePlanningEditorPanel();
  });
}

if (openPlanningImport) openPlanningImport.addEventListener("click", openPlanningImportPanel);
if (closePlanningImport) closePlanningImport.addEventListener("click", closePlanningImportPanel);
if (cancelPlanningImport) cancelPlanningImport.addEventListener("click", closePlanningImportPanel);

if (planningImportForm) {
  planningImportForm.addEventListener("submit", (event) => {
    event.preventDefault();
    importPlanningTasks();
  });
}

if (planningForm) {
  planningForm.addEventListener("submit", (event) => {
    event.preventDefault();
    savePlanningForm();
  });
}

if (closePlanningEditor) closePlanningEditor.addEventListener("click", closePlanningEditorPanel);
if (cancelPlanningEditor) cancelPlanningEditor.addEventListener("click", closePlanningEditorPanel);

if (qualityTabs.length && location.hash === "#home-report") {
  const homeReportCard = document.querySelector('[data-report-id="home-report"]');
  if (homeReportCard) openEmbeddedReport(homeReportCard, false);
}

window.addEventListener("popstate", () => {
  if (location.hash === "#home-report") {
    const homeReportCard = document.querySelector('[data-report-id="home-report"]');
    if (homeReportCard) openEmbeddedReport(homeReportCard, false);
    return;
  }
  closeEmbeddedReport(false);
});

if (editForm) {
  editForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (activeCollection === "assets") {
      saveAssetForm();
      return;
    }
    const formData = getFormData();
    if (!Array.isArray(cardStore[activeCollection])) cardStore[activeCollection] = [];
    if (activeMode === "add") {
      cardStore[activeCollection].push({
        id: createCardId(activeCollection),
        collection: activeCollection,
        ...formData,
      });
      saveCardStore();
      renderActiveCollection();
      renderOverviewStats();
      closeEditorPanel();
      return;
    }
    if (!activeCardId) return;
    cardStore[activeCollection] = cardStore[activeCollection].map((item) => (
      item.id === activeCardId ? { ...item, collection: activeCollection, ...formData } : item
    ));
    saveCardStore();
    renderActiveCollection();
    renderOverviewStats();
    closeEditorPanel();
  });
}

if (deleteCard) {
  deleteCard.addEventListener("click", () => {
    if (!activeCardId || !Array.isArray(cardStore[activeCollection])) return;
    cardStore[activeCollection] = cardStore[activeCollection].filter((item) => item.id !== activeCardId);
    saveCardStore();
    renderActiveCollection();
    renderOverviewStats();
    closeEditorPanel();
  });
}

if (closeEditor) closeEditor.addEventListener("click", closeEditorPanel);
if (cancelEditor) cancelEditor.addEventListener("click", closeEditorPanel);
if (editorBackdrop) editorBackdrop.addEventListener("click", closeEditorPanel);
if (editorBackdrop) editorBackdrop.addEventListener("click", closeReportUploadPanel);
if (editorBackdrop) editorBackdrop.addEventListener("click", closePlanningDetailPanel);
if (editorBackdrop) editorBackdrop.addEventListener("click", closePlanningEditorPanel);
if (editorBackdrop) editorBackdrop.addEventListener("click", closePlanningImportPanel);

if (searchInput) {
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.trim().toLowerCase();
    const cards = Array.from(document.querySelectorAll(".directory-card"));
    cards.forEach((card) => {
      card.style.display = !query || card.textContent.toLowerCase().includes(query) ? "" : "none";
    });
  });
}

initSharedData();
