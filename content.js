(function () {
  const DEFAULT_SITE_DATA = {
    hero: {
      kicker: "FUXC.TEAM / AI MADE, ZERO CODE SHIPPED",
      lead: "AI Native Showcase",
      title: "一念即现，所想即得",
      subtitle: "Thought is action, inspiration is creation.",
      description:
        "把脑海里的想法，变成真正能被点击、使用、传播的产品。这里收纳了我用 AI 零代码打造的 Agent、浏览器插件与 Skill。",
      primaryActionText: "查看作品列表",
      secondaryActionText: "梦想共创",
    },
    catalog: {
      sectionTag: "Build Library",
      title: "我的 AI 零代码作品库",
      description:
        "第二屏聚合展示我做过的 Agent、浏览器插件与 Skill。下面先放了一组可直接替换的示例卡片，你后续只需要改后台里的数据即可。",
    },
    knowledge: {
      sectionTag: "Knowledge Share",
      title: "知识共享",
      description:
        "把值得反复传播的页面、文档和方法论沉淀在这里。点击卡片即可直接进入链接。",
    },
    appTypes: [
      {
        id: "agent",
        label: "Agent",
      },
      {
        id: "extension",
        label: "浏览器插件",
      },
      {
        id: "skill",
        label: "Skill",
      },
    ],
    cards: [
      {
        id: "card-agent-lead",
        type: "agent",
        label: "Agent",
        badge: "Sample",
        title: "线索推进 Agent",
        description:
          "自动梳理线索来源、补全上下文，并把下一步动作推到你的待办流里。这里是示例卡片，后续可以替换成真实项目名称。",
        stack: "AI + Automation",
        mode: "Zero-code workflow",
        tags: ["Lead Flow", "Follow-up", "Prompt Routing"],
        githubUrl: "https://github.com/",
        screenshot: "",
      },
      {
        id: "card-agent-knowledge",
        type: "agent",
        label: "Agent",
        badge: "Sample",
        title: "知识整编 Agent",
        description:
          "把分散在网页、文档、对话里的信息提炼为可直接执行的摘要、清单和 SOP，适合展示复杂能力场景。",
        stack: "Research Agent",
        mode: "Live synthesis",
        tags: ["Knowledge", "SOP", "Summary"],
        githubUrl: "https://github.com/",
        screenshot: "",
      },
      {
        id: "card-extension-webclip",
        type: "extension",
        label: "Browser Extension",
        badge: "Sample",
        title: "网页快取插件",
        description:
          "在浏览器里一键提炼页面重点、截取关键信息，并触发后续 AI 工作流，让浏览即生产成为常态。",
        stack: "Chrome / Edge",
        mode: "In-browser action",
        tags: ["Clip", "Web Context", "One-click"],
        githubUrl: "https://github.com/",
        screenshot: "",
      },
      {
        id: "card-extension-overlay",
        type: "extension",
        label: "Browser Extension",
        badge: "Sample",
        title: "场景增强插件",
        description:
          "针对特定业务页面注入额外能力，把原本静态的信息页变成可分析、可追踪、可协同的操作台。",
        stack: "Browser Augment",
        mode: "Context overlay",
        tags: ["Overlay", "Insight", "Workflow"],
        githubUrl: "https://github.com/",
        screenshot: "",
      },
      {
        id: "card-skill-pagegen",
        type: "skill",
        label: "Skill",
        badge: "Sample",
        title: "页面生成 Skill",
        description:
          "把产品想法、界面草图或需求段落，快速转成真实网页结构与视觉表达，适合展示你的生产力能力库。",
        stack: "Codex Skill",
        mode: "Prompt to page",
        tags: ["UI Build", "HTML", "Design Token"],
        githubUrl: "https://github.com/",
        screenshot: "",
      },
      {
        id: "card-skill-orchestrate",
        type: "skill",
        label: "Skill",
        badge: "Sample",
        title: "流程编排 Skill",
        description:
          "把重复出现的分析、生成、校验步骤打包为可复用能力，让复杂任务通过自然语言稳定复现。",
        stack: "Reusable Ability",
        mode: "Workflow package",
        tags: ["Chain", "Guardrail", "Reuse"],
        githubUrl: "https://github.com/",
        screenshot: "",
      },
    ],
    knowledgeItems: [
      {
        id: "knowledge-intent-ux-ppt",
        title: "意图发现 · AI UX 的下一次范式转移",
        url: "./items/intent-ux-ppt/intent-ux-ppt.html",
        description:
          "以横向叙事方式呈现的示例页面，讨论 AI 时代里交互入口从功能导航转向意图理解的产品机会。",
        tags: ["Intent UX", "Presentation", "Example"],
        ownerUsername: "",
        ownerRole: "",
        createdAt: "",
        updatedAt: "",
      },
    ],
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function createId() {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }

    return `card-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  function createTypeId(label = "") {
    const base = String(label || "")
      .trim()
      .toLowerCase()
      .replace(/[\s_]+/g, "-")
      .replace(/[^a-z0-9-\u4e00-\u9fa5]+/g, "")
      .replace(/^-+|-+$/g, "");

    return base || `type-${Date.now().toString(36)}`;
  }

  function normalizeAppType(type, index) {
    const label = String(type?.label || "").trim() || `类型 ${index + 1}`;
    return {
      id: String(type?.id || "").trim() || createTypeId(label),
      label,
    };
  }

  function getCardLabel(appTypes, typeId) {
    const matched = Array.isArray(appTypes)
      ? appTypes.find((item) => item.id === typeId)
      : null;

    return matched?.label || String(typeId || "").trim() || "未分类";
  }

  function normalizeCard(card, index) {
    const type = String(card.type || "").trim() || DEFAULT_SITE_DATA.appTypes[0].id;

    return {
      id: card.id || createId(),
      type,
      label: card.label || "",
      badge: typeof card.badge === "string" ? card.badge : "Sample",
      title: card.title || `未命名项目 ${index + 1}`,
      description: card.description || "",
      stack: card.stack || "",
      mode: card.mode || "",
      tags: Array.isArray(card.tags)
        ? card.tags.filter(Boolean)
        : String(card.tags || "")
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),
      githubUrl: card.githubUrl || "",
      screenshot: card.screenshot || "",
      ownerUsername: card.ownerUsername || "",
      ownerRole: card.ownerRole || "",
      createdAt: card.createdAt || "",
      updatedAt: card.updatedAt || "",
    };
  }

  function normalizeKnowledgeItem(item, index) {
    return {
      id: item.id || createId(),
      title: item.title || `未命名知识 ${index + 1}`,
      url: item.url || "",
      description: item.description || "",
      tags: Array.isArray(item.tags)
        ? item.tags.filter(Boolean)
        : String(item.tags || "")
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
      ownerUsername: item.ownerUsername || "",
      ownerRole: item.ownerRole || "",
      createdAt: item.createdAt || "",
      updatedAt: item.updatedAt || "",
    };
  }

  function normalizeSiteData(data) {
    const merged = clone(DEFAULT_SITE_DATA);
    const input = data || {};

    merged.hero = {
      ...merged.hero,
      ...(input.hero || {}),
      secondaryActionText: "梦想共创",
    };

    merged.catalog = {
      ...merged.catalog,
      ...(input.catalog || {}),
    };

    merged.knowledge = {
      ...merged.knowledge,
      ...(input.knowledge || {}),
    };

    merged.appTypes = Array.isArray(input.appTypes) && input.appTypes.length > 0
      ? input.appTypes.map(normalizeAppType)
      : merged.appTypes.map(normalizeAppType);

    merged.cards = Array.isArray(input.cards) && input.cards.length > 0
      ? input.cards.map((card, index) => {
          const normalizedCard = normalizeCard(card, index);
          return {
            ...normalizedCard,
            label: getCardLabel(merged.appTypes, normalizedCard.type),
          };
        })
      : merged.cards.map((card, index) => {
          const normalizedCard = normalizeCard(card, index);
          return {
            ...normalizedCard,
            label: getCardLabel(merged.appTypes, normalizedCard.type),
        };
      });

    merged.knowledgeItems = Array.isArray(input.knowledgeItems) && input.knowledgeItems.length > 0
      ? input.knowledgeItems.map((item, index) => normalizeKnowledgeItem(item, index))
      : merged.knowledgeItems.map((item, index) => normalizeKnowledgeItem(item, index));

    return merged;
  }

  async function requestJson(url, options = {}) {
    const response = await fetch(url, {
      credentials: "same-origin",
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      const error = new Error(data.error || "Request failed");
      error.status = response.status;
      error.payload = data;
      throw error;
    }

    return data;
  }

  async function getSiteData() {
    try {
      const response = await fetch("/api/content", {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error("Failed to load content");
      }

      const data = await response.json();
      return normalizeSiteData(data);
    } catch (error) {
      return normalizeSiteData(DEFAULT_SITE_DATA);
    }
  }

  async function saveSiteData(data) {
    const normalized = normalizeSiteData(data);
    const saved = await requestJson("/api/content", {
      method: "PUT",
      body: JSON.stringify({
        siteData: normalized,
      }),
    });
    return normalizeSiteData(saved);
  }

  async function resetSiteData() {
    const saved = await requestJson("/api/content", {
      method: "DELETE",
    });
    return normalizeSiteData(saved);
  }

  async function login({ username, password }) {
    return requestJson("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
    });
  }

  async function register({ username, password, inviteCode }) {
    return requestJson("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
        inviteCode,
      }),
    });
  }

  async function logout() {
    return requestJson("/api/auth/logout", {
      method: "POST",
      body: JSON.stringify({}),
    });
  }

  async function getSession() {
    return requestJson("/api/auth/me", {
      method: "GET",
    });
  }

  async function uploadImage({ dataUrl, filename }) {
    return requestJson("/api/upload", {
      method: "POST",
      body: JSON.stringify({
        dataUrl,
        filename,
      }),
    });
  }

  async function createCard(card) {
    return requestJson("/api/cards", {
      method: "POST",
      body: JSON.stringify(card),
    });
  }

  async function createKnowledgeItem(item) {
    return requestJson("/api/knowledge-items", {
      method: "POST",
      body: JSON.stringify(item),
    });
  }

  async function getMembers() {
    return requestJson("/api/members", {
      method: "GET",
    });
  }

  async function deleteMember(memberId) {
    return requestJson("/api/members", {
      method: "DELETE",
      body: JSON.stringify({
        memberId,
      }),
    });
  }

  function createEmptyCard() {
    return normalizeCard({
      id: "",
      type: DEFAULT_SITE_DATA.appTypes[0].id,
      label: DEFAULT_SITE_DATA.appTypes[0].label,
      badge: "New",
      title: "",
      description: "",
      stack: "",
      mode: "",
      tags: [],
      githubUrl: "",
      screenshot: "",
      ownerUsername: "",
      ownerRole: "",
    });
  }

  function createEmptyKnowledgeItem() {
    return normalizeKnowledgeItem({
      id: "",
      title: "",
      url: "",
      description: "",
      tags: [],
      ownerUsername: "",
      ownerRole: "",
    });
  }

  window.FUXCSite = {
    DEFAULT_SITE_DATA: clone(DEFAULT_SITE_DATA),
    getSiteData,
    saveSiteData,
    resetSiteData,
    normalizeSiteData,
    normalizeCard,
    normalizeKnowledgeItem,
    normalizeAppType,
    createEmptyCard,
    createEmptyKnowledgeItem,
    login,
    register,
    logout,
    getSession,
    uploadImage,
    createCard,
    createKnowledgeItem,
    getMembers,
    deleteMember,
  };
})();
