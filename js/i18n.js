/**
 * Seed 芥子 — Internationalization (i18n) Module
 * Loads language packs from JSON files with inline fallback, and supports dynamic switching.
 */

const I18n = (() => {
  const STORAGE_KEY = 'seed-lang';
  const SUPPORTED_LANGS = ['zh', 'en'];
  let currentLang = 'zh';
  let langData = {};
  let listeners = [];
  let switching = false; // Prevent concurrent language switches

  /* ---- Inline fallback data (ensures i18n works even without server / fetch) ---- */
  const FALLBACK = {
    zh: {"nav":{"features":"核心优势","languages":"语言支持","pricing":"方案","guide":"使用教程","faq":"常见问题","getStarted":"立即体验"},"hero":{"badge":"WebAssembly 字节码保护","slogan":"芥子纳须弥，代码藏乾坤。","subtitle":"WebAssembly 字节码保护工具，帮助开发者将编译后的程序进行深度加固，防止逆向工程、代码窃取和未授权使用。","cta":"立即开始","ctaSecondary":"了解更多","securityFeatures":"安全增强能力"},"problem":{"title":"为什么需要 Seed？","subtitle":"标准 .wasm 文件几乎是\"明文\"状态 —— 任何人都可以用反编译工具轻松还原你的代码逻辑。","items":[{"pain":"算法被逆向还原","solution":"多层加固保护，让反编译结果无法理解"},{"pain":"代码被竞对抄袭","solution":"深度混淆，代码结构面目全非"},{"pain":"产品被无限制使用","solution":"内置有效期和使用次数控制"},{"pain":"二进制文件被篡改","solution":"数字签名 + 完整性校验，篡改即失效"},{"pain":"分发后失去控制","solution":"商业授权系统，精准管控每一份副本"}]},"protection":{"title":"三级渐进式保护","subtitle":"根据安全需求和性能要求灵活选择保护级别","recommended":"推荐","perfImpact":"性能影响","levels":[{"name":"L1","label":"基础保护","stars":2,"perf":"极低","desc":"一般性保护，快速部署"},{"name":"L2","label":"推荐方案","stars":3,"perf":"极低","desc":"兼顾安全与性能，适合大多数场景","recommended":true},{"name":"L3","label":"深度保护","stars":4,"perf":"低","desc":"高安全需求，核心算法保护"}]},"security":{"title":"十重安全增强","subtitle":"覆盖从数据到代码、从静态分析到动态调试的全方位防护","features":[{"icon":"🔐","name":"数据保护","desc":"常量、密钥、URL 等敏感数据自动混淆"},{"icon":"👁️‍🗨️","name":"名称隐藏","desc":"函数名、接口名完全不可见"},{"icon":"🌀","name":"代码混淆","desc":"控制流打乱 + 代码膨胀 + 指令变形"},{"icon":"✍️","name":"数字签名","desc":"文件完整性验证，篡改即检测"},{"icon":"🔑","name":"密钥安全","desc":"多级密钥派生体系，杜绝密钥关联"},{"icon":"🛡️","name":"反调试","desc":"动态调试检测与对抗"},{"icon":"⏱️","name":"使用限制","desc":"有效期 + 运行次数双重管控"},{"icon":"🚫","name":"防篡改","desc":"限制信息完整性保护，修改即失效"},{"icon":"📜","name":"商业授权","desc":"编码工具自带授权管控，精准分发"},{"icon":"📦","name":"自解压分发","desc":"单文件分发，开箱即用"}]},"languages":{"title":"14 种编程语言支持","subtitle":"无论你的项目使用什么语言，Seed 都能保护","tier1Label":"第一梯队 — 原生支持","tier2Label":"第二梯队 — 工具链支持","tier1":["Rust","C/C++","Go","Zig","AssemblyScript"],"tier2":["Java","Kotlin","Scala","C#","JavaScript","Python","Dart","Ruby","Objective-C"]},"stats":{"title":"近零性能损耗","items":[{"value":"< 0.1%","label":"文件体积增长"},{"value":"< 1%","label":"运行时额外开销"},{"value":"≈ 0%","label":"二次运行开销"},{"value":"14","label":"支持语言数"}]},"workflow":{"title":"四步完成加固","subtitle":"只需四步，你的代码就从\"裸奔\"变为\"全副武装\"","steps":[{"num":"01","title":"准备代码","desc":"编写你的业务逻辑和核心算法"},{"num":"02","title":"编译为 Wasm","desc":"使用对应语言的工具链编译为 .wasm 文件"},{"num":"03","title":"Seed 加固","desc":"一行命令完成深度保护"},{"num":"04","title":"安全分发","desc":"以加固后的形态交付给用户"}]},"useCases":{"title":"谁在使用 Seed？","items":[{"icon":"🏢","name":"软件厂商","desc":"保护核心算法和业务逻辑的知识产权"},{"icon":"🎮","name":"游戏开发者","desc":"防止外挂和反编译，保护游戏逻辑"},{"icon":"🔐","name":"安全公司","desc":"加固安全敏感模块，防止分析"},{"icon":"📊","name":"数据处理","desc":"保护数据处理算法和分析模型"},{"icon":"🤖","name":"AI / ML","desc":"保护推理模型和特征工程代码"},{"icon":"💰","name":"金融科技","desc":"保护交易算法和风控模型"}]},"distribution":{"title":"灵活的分发方式","modes":[{"name":"标准分发","product":"加固工具 + 运行时","scenario":"内部使用、可信环境"},{"name":"自加固分发","product":"受保护的加固工具 + 运行时","scenario":"对外分发、防止工具被分析"},{"name":"单文件分发","product":"单一可执行文件","scenario":"最终用户交付，开箱即用","recommended":true}]},"faq":{"title":"常见问题","items":[{"q":"Seed 会影响程序功能吗？","a":"不会。Seed 的保护是透明的，加固后的程序功能与原始程序完全一致。"},{"q":"加固后的程序会变慢吗？","a":"几乎不会。L2 推荐方案的运行时额外开销不到 1%，二次运行几乎为零开销。"},{"q":"支持哪些操作系统？","a":"Seed 目前支持 macOS 和 Linux，Windows 支持即将推出。"},{"q":"可以保护任意大小的程序吗？","a":"是的。Seed 已在从 125 字节到 48 MB 的 WebAssembly 程序上完成测试，均表现稳定。"},{"q":"保护后的文件会变大很多吗？","a":"不会。文件体积增长不到 0.1%，仅增加极少量的元数据开销。"}]},"footer":{"copyright":"© 2026 Seed 芥子. 保留所有权利。","tagline":"让每一行代码都安全无忧。"},"guide":{"pageTitle":"使用教程 — Seed 芥子","backText":"返回首页","title":"使用教程","subtitle":"了解如何使用 Seed 芥子（自解压版）保护和运行你的 WebAssembly 程序。","tocTitle":"目录","toc":["概述","准备工作","加固你的程序","运行受保护的程序","分发给最终用户","高级用法"],"footerText":"💡 更多问题请联系 Seed 芥子技术支持团队。","sections":[]},"faqPage":{"pageTitle":"常见问题 — Seed 芥子","backText":"返回首页","title":"常见问题","subtitle":"关于 Seed 芥子你想知道的一切。","categories":[],"footerText":"没有找到你的问题？欢迎联系我们的技术支持团队。"},"contact":{"pageTitle":"申请体验 — Seed 芥子","backText":"返回首页","title":"申请体验 Seed 芥子","subtitle":"填写以下信息，我们会尽快与您联系并提供试用版本。","form":{"labelName":"姓名","labelCompany":"公司 / 组织","labelEmail":"工作邮箱","labelPlatform":"目标平台","labelLanguage":"主要编程语言","labelUseCase":"使用场景描述","optPlatformDefault":"请选择","optLangDefault":"请选择","optLangOther":"其他","submitText":"提交申请","placeholderName":"请输入您的姓名","placeholderCompany":"公司或组织名称（可选）","placeholderEmail":"you@company.com","placeholderUseCase":"请简要描述您的使用场景，例如：保护核心算法、防止代码逆向等..."},"success":{"title":"申请已提交！","message":"感谢您的兴趣，我们会在 1-2 个工作日内通过邮件与您联系。"},"note":"我们重视您的隐私，提交的信息仅用于试用申请处理。","mail":{"subject":"Seed 芥子试用申请 - {name}","fieldName":"姓名","fieldCompany":"公司","fieldEmail":"邮箱","fieldPlatform":"目标平台","fieldLanguage":"编程语言","fieldUseCase":"使用场景","notFilled":"未填写","notSelected":"未选择"}}},
    en: {"nav":{"features":"Features","languages":"Languages","pricing":"Plans","guide":"Guide","faq":"FAQ","getStarted":"Get Started"},"hero":{"badge":"WebAssembly Bytecode Protection","slogan":"Hide your logic. Ship with confidence.","subtitle":"A WebAssembly bytecode protection tool that deeply hardens compiled programs against reverse engineering, code theft, and unauthorized use.","cta":"Get Started","ctaSecondary":"Learn More","securityFeatures":"Security Features"},"problem":{"title":"Why Seed?","subtitle":"Standard .wasm files are essentially \"plaintext\" — anyone can easily reverse-engineer your code logic with decompilation tools.","items":[{"pain":"Algorithm reverse-engineered","solution":"Multi-layer hardening makes decompilation results incomprehensible"},{"pain":"Code stolen by competitors","solution":"Deep obfuscation renders code structure unrecognizable"},{"pain":"Unlimited unauthorized usage","solution":"Built-in expiry and usage count controls"},{"pain":"Binary files tampered","solution":"Digital signature + integrity check, tamper = invalid"},{"pain":"Loss of control after distribution","solution":"Commercial licensing system for precise control of every copy"}]},"protection":{"title":"3-Level Progressive Protection","subtitle":"Flexibly choose protection levels based on security needs and performance requirements","recommended":"Recommended","perfImpact":"Perf. Impact","levels":[{"name":"L1","label":"Basic","stars":2,"perf":"Minimal","desc":"General protection, fast deployment"},{"name":"L2","label":"Recommended","stars":3,"perf":"Minimal","desc":"Balance of security and performance, fits most scenarios","recommended":true},{"name":"L3","label":"Maximum","stars":4,"perf":"Low","desc":"High-security needs, core algorithm protection"}]},"security":{"title":"10 Security Enhancements","subtitle":"Comprehensive protection from data to code, from static analysis to dynamic debugging","features":[{"icon":"🔐","name":"Data Protection","desc":"Auto-obfuscate constants, keys, URLs and sensitive data"},{"icon":"👁️‍🗨️","name":"Name Hiding","desc":"Function and interface names completely invisible"},{"icon":"🌀","name":"Code Obfuscation","desc":"Control flow disruption + code bloating + instruction morphing"},{"icon":"✍️","name":"Digital Signature","desc":"File integrity verification, tamper detection"},{"icon":"🔑","name":"Key Security","desc":"Multi-level key derivation, eliminate key correlation"},{"icon":"🛡️","name":"Anti-Debugging","desc":"Dynamic debugging detection and countermeasures"},{"icon":"⏱️","name":"Usage Limits","desc":"Expiry + run count dual control"},{"icon":"🚫","name":"Anti-Tamper","desc":"Limit info integrity protection, modification = invalid"},{"icon":"📜","name":"Commercial License","desc":"Built-in licensing for precise distribution control"},{"icon":"📦","name":"Self-Extract","desc":"Single-file distribution, ready out of the box"}]},"languages":{"title":"14 Programming Languages","subtitle":"Whatever language your project uses, Seed can protect it","tier1Label":"Tier 1 — Native Support","tier2Label":"Tier 2 — Toolchain Support","tier1":["Rust","C/C++","Go","Zig","AssemblyScript"],"tier2":["Java","Kotlin","Scala","C#","JavaScript","Python","Dart","Ruby","Objective-C"]},"stats":{"title":"Near-Zero Performance Overhead","items":[{"value":"< 0.1%","label":"File Size Increase"},{"value":"< 1%","label":"Runtime Overhead"},{"value":"≈ 0%","label":"Cached Run Overhead"},{"value":"14","label":"Languages Supported"}]},"workflow":{"title":"Four Steps to Fortify","subtitle":"In just four steps, your code goes from exposed to fully armored","steps":[{"num":"01","title":"Write Code","desc":"Develop your business logic and core algorithms"},{"num":"02","title":"Compile to Wasm","desc":"Use your language's toolchain to compile to .wasm"},{"num":"03","title":"Seed Harden","desc":"One command for deep protection"},{"num":"04","title":"Ship Securely","desc":"Deliver in hardened form to your users"}]},"useCases":{"title":"Who Uses Seed?","items":[{"icon":"🏢","name":"Software Vendors","desc":"Protect IP of core algorithms and business logic"},{"icon":"🎮","name":"Game Developers","desc":"Prevent cheats and decompilation, protect game logic"},{"icon":"🔐","name":"Security Firms","desc":"Harden security-sensitive modules against analysis"},{"icon":"📊","name":"Data Processing","desc":"Protect data processing algorithms and analytics models"},{"icon":"🤖","name":"AI / ML","desc":"Protect inference models and feature engineering code"},{"icon":"💰","name":"FinTech","desc":"Protect trading algorithms and risk models"}]},"distribution":{"title":"Flexible Distribution","modes":[{"name":"Standard","product":"Encoder + Runtime","scenario":"Internal use, trusted environments"},{"name":"Self-Hardened","product":"Protected encoder + Runtime","scenario":"External distribution, prevent tool analysis"},{"name":"Single File","product":"Single executable","scenario":"End-user delivery, ready to use","recommended":true}]},"faq":{"title":"FAQ","items":[{"q":"Does Seed affect program functionality?","a":"No. Seed's protection is transparent — the hardened program functions identically to the original."},{"q":"Will hardened programs run slower?","a":"Barely. The recommended L2 plan adds less than 1% runtime overhead, with near-zero overhead on cached runs."},{"q":"Which operating systems are supported?","a":"Seed currently supports macOS and Linux. Windows support is coming soon."},{"q":"Can it protect programs of any size?","a":"Yes. Seed has been tested on WebAssembly programs ranging from 125 bytes to 48 MB, all performing stably."},{"q":"Will protected files become much larger?","a":"No. File size growth is under 0.1%, adding only minimal metadata overhead."}]},"footer":{"copyright":"© 2026 Seed. All rights reserved.","tagline":"Keep every line of code safe and sound."},"guide":{"pageTitle":"User Guide — Seed","backText":"Back to Home","title":"User Guide","subtitle":"Learn how to use Seed (self-extracting edition) to protect and run your WebAssembly programs.","tocTitle":"Contents","toc":["Overview","Preparation","Harden Your Program","Run Protected Program","Distribute to Users","Advanced Usage"],"footerText":"💡 For more questions, please contact the Seed support team.","sections":[]},"faqPage":{"pageTitle":"FAQ — Seed","backText":"Back to Home","title":"FAQ","subtitle":"Everything you need to know about Seed.","categories":[],"footerText":"Can't find your question? Feel free to contact our support team."},"contact":{"pageTitle":"Request Access — Seed","backText":"Back to Home","title":"Request Access to Seed","subtitle":"Fill in the form below and we'll get back to you with a trial version.","form":{"labelName":"Name","labelCompany":"Company / Organization","labelEmail":"Work Email","labelPlatform":"Target Platform","labelLanguage":"Primary Language","labelUseCase":"Use Case Description","optPlatformDefault":"Select","optLangDefault":"Select","optLangOther":"Other","submitText":"Submit Request","placeholderName":"Your name","placeholderCompany":"Company or organization (optional)","placeholderEmail":"you@company.com","placeholderUseCase":"Briefly describe your use case, e.g., protecting core algorithms, preventing reverse engineering..."},"success":{"title":"Request Submitted!","message":"Thank you for your interest. We'll contact you via email within 1-2 business days."},"note":"We respect your privacy. Information submitted is only used for trial request processing.","mail":{"subject":"Seed Trial Request - {name}","fieldName":"Name","fieldCompany":"Company","fieldEmail":"Email","fieldPlatform":"Platform","fieldLanguage":"Language","fieldUseCase":"Use Case","notFilled":"N/A","notSelected":"N/A"}}}
  };

  /**
   * Detect initial language from: URL param > localStorage > browser lang
   */
  function detectLang() {
    // 1. URL param: ?lang=en
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlLang = urlParams.get('lang');
      if (urlLang && SUPPORTED_LANGS.includes(urlLang)) return urlLang;
    } catch (e) { /* ignore */ }

    // 2. localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
    } catch (e) { /* localStorage may be disabled in private mode */ }

    // 3. Browser language
    const browserLang = navigator.language || navigator.userLanguage;
    if (browserLang && browserLang.startsWith('zh')) return 'zh';

    return 'en';
  }

  /**
   * Load a language pack JSON — try fetch first (with timeout), fall back to inline data
   */
  async function loadLang(lang) {
    // Always ensure we have fallback data as a safety net
    const fallback = FALLBACK[lang] || null;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 2000);
      const resp = await fetch(`data/i18n/${lang}.json`, { signal: controller.signal });
      clearTimeout(timeout);
      if (!resp.ok) throw new Error(`Failed to load ${lang}.json`);
      return await resp.json();
    } catch (e) {
      console.warn(`[i18n] Fetch failed for ${lang}, using inline fallback.`, e.message || e);
      return fallback;
    }
  }

  /**
   * Get nested value from object by dot-path, e.g. "hero.slogan"
   */
  function getNestedValue(obj, path) {
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined ? o[k] : null), obj);
  }

  /**
   * Apply translations to all elements with data-i18n attribute
   */
  function applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(langData, key);
      if (value !== null && typeof value === 'string') {
        el.textContent = value;
      }
    });
  }

  /**
   * Update HTML lang attribute and page title
   */
  function updatePageMeta() {
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
    // Update title
    const titleKey = currentLang === 'zh'
      ? 'Seed 芥子 — WebAssembly 字节码保护工具'
      : 'Seed — WebAssembly Bytecode Protection Tool';
    document.title = titleKey;
  }

  /**
   * Initialize i18n
   */
  async function init() {
    currentLang = detectLang();
    let data = await loadLang(currentLang);
    if (!data) {
      data = FALLBACK[currentLang] || FALLBACK['zh'] || null;
    }
    if (data) {
      langData = data;
      applyTranslations();
      updatePageMeta();
    }
    return currentLang;
  }

  /**
   * Switch language
   */
  async function switchLang(lang) {
    if (!SUPPORTED_LANGS.includes(lang)) return;
    if (lang === currentLang && Object.keys(langData).length > 0) return;
    if (switching) {
      console.warn('[i18n] Switch already in progress, skipping.');
      return;
    }

    switching = true;
    try {
      let data = await loadLang(lang);
      // If loadLang returned null, try inline FALLBACK as last resort
      if (!data) {
        data = FALLBACK[lang] || null;
      }
      if (data) {
        currentLang = lang;
        langData = data;
        try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* localStorage may be disabled */ }
        applyTranslations();
        updatePageMeta();
        // Notify listeners
        listeners.forEach(fn => {
          try { fn(lang, langData); } catch (e) { console.error('[i18n] Listener error:', e); }
        });
      }
    } finally {
      switching = false;
    }
  }

  /**
   * Toggle between zh and en
   */
  function toggle() {
    const next = currentLang === 'zh' ? 'en' : 'zh';
    return switchLang(next);
  }

  /**
   * Get current language data
   */
  function getData() { return langData; }
  function getLang() { return currentLang; }

  /**
   * Register a listener for language changes
   */
  function onChange(fn) { listeners.push(fn); }

  /**
   * Get a translation by key
   */
  function t(key) {
    return getNestedValue(langData, key) || key;
  }

  return { init, switchLang, toggle, getData, getLang, onChange, t };
})();
