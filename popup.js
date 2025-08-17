// Popup script for Upwork Job Notifier
class PopupManager {
  constructor() {
    this.elements = {};
    this.settings = {};
    this.init();
  }

  init() {
    console.log("🔧 Initializing PopupManager...");

    // Cache all elements
    this.cacheElements();

    // Check if all critical elements are present
    const criticalElements = [
      "status",
      "lastCheck",
      "jobsTracked",
      "notificationToggle",
      "emailToggle",
      "aiToggle",
      "checkInterval",
      "emailAddress",
      "aiProvider",
      "openaiApiKey",
      "testOpenAIKey",
      "clearOpenAIKey",
      "openAIKeyStatus",
      "geminiApiKey",
      "testGeminiKey",
      "clearGeminiKey",
      "geminiKeyStatus",
      "validateAI",
      "checkNow",
      "saveSettings",
      "testExtraction",
      "checkContentScript",
      "validateAndSave",
      "message",
    ];

    const missingElements = criticalElements.filter((id) => !this.elements[id]);

    if (missingElements.length === 0) {
      console.log(
        "✅ All critical elements found, proceeding with initialization"
      );
      this.loadSettings();
      this.bindEvents();
      this.updateUI();
    } else {
      console.error("❌ Missing elements:", missingElements);
      this.showMessage(
        "Error: Some UI elements failed to load. Please refresh the popup.",
        "error"
      );
    }
  }

  cacheElements() {
    console.log("🔍 Caching elements...");

    const elementIds = [
      "status",
      "lastCheck",
      "jobsTracked",
      "notificationToggle",
      "emailToggle",
      "aiToggle",
      "checkInterval",
      "emailAddress",
      "aiProvider",
      "openaiApiKey",
      "testOpenAIKey",
      "clearOpenAIKey",
      "openAIKeyStatus",
      "geminiApiKey",
      "testGeminiKey",
      "clearGeminiKey",
      "geminiKeyStatus",
      "validateAI",
      "checkNow",
      "saveSettings",
      "testExtraction",
      "checkContentScript",
      "validateAndSave",
      "message",
    ];

    elementIds.forEach((id) => {
      this.elements[id] = document.getElementById(id);
      if (this.elements[id]) {
        console.log(`  ✅ ${id}: Found`);
      } else {
        console.log(`  ❌ ${id}: Missing`);
      }
    });
  }

  bindEvents() {
    console.log("🔗 Binding event listeners...");

    // Toggle switches
    if (this.elements.notificationToggle) {
      this.elements.notificationToggle.addEventListener("click", async () => {
        this.settings.notificationsEnabled =
          !this.settings.notificationsEnabled;
        this.updateToggleUI(
          "notificationToggle",
          this.settings.notificationsEnabled
        );
        console.log(
          "🔄 Notifications toggled:",
          this.settings.notificationsEnabled
        );
        await this.forceSaveSettings(); // Force save immediately
      });
    }

    if (this.elements.emailToggle) {
      this.elements.emailToggle.addEventListener("click", async () => {
        this.settings.emailEnabled = !this.settings.emailEnabled;
        this.updateToggleUI("emailToggle", this.settings.emailEnabled);
        console.log("🔄 Email toggled:", this.settings.emailEnabled);
        await this.forceSaveSettings(); // Force save immediately
      });
    }

    if (this.elements.aiToggle) {
      this.elements.aiToggle.addEventListener("click", async () => {
        this.settings.aiEnabled = !this.settings.aiEnabled;
        this.updateToggleUI("aiToggle", this.settings.aiEnabled);
        console.log("🔄 AI proposals toggled:", this.settings.aiEnabled);

        // Validate API key configuration when enabling
        if (this.settings.aiEnabled) {
          const hasOpenAIKey =
            this.settings.openaiApiKey &&
            this.settings.openaiApiKey.trim() !== "";
          const hasGeminiKey =
            this.settings.geminiApiKey &&
            this.settings.geminiApiKey.trim() !== "";

          if (!hasOpenAIKey && !hasGeminiKey) {
            this.showMessage(
              "⚠️ Please add an API key before enabling AI proposals!",
              "error"
            );
            // Revert the toggle
            this.settings.aiEnabled = false;
            this.updateToggleUI("aiToggle", false);
            return;
          }
        }

        await this.forceSaveSettings(); // Force save immediately
      });
    }

    // Form inputs
    if (this.elements.checkInterval) {
      this.elements.checkInterval.addEventListener("change", (e) => {
        this.settings.checkInterval = parseFloat(e.target.value);
      });
    }

    if (this.elements.emailAddress) {
      this.elements.emailAddress.addEventListener("input", (e) => {
        this.settings.emailAddress = e.target.value;
      });
    }

    if (this.elements.openaiApiKey) {
      this.elements.openaiApiKey.addEventListener("input", (e) => {
        this.settings.openaiApiKey = e.target.value;
      });
    }

    if (this.elements.geminiApiKey) {
      this.elements.geminiApiKey.addEventListener("input", (e) => {
        this.settings.geminiApiKey = e.target.value;
      });
    }

    // AI Provider selection
    if (this.elements.aiProvider) {
      this.elements.aiProvider.addEventListener("change", (e) => {
        this.settings.aiProvider = e.target.value;
        this.updateAIProviderUI();
        this.updateAIConfigStatus(); // Update status when provider changes
        console.log("🔄 AI provider changed to:", this.settings.aiProvider);
      });
    }

    // Buttons
    if (this.elements.checkNow) {
      this.elements.checkNow.addEventListener("click", () => {
        this.checkForNewJobs();
      });
    }

    if (this.elements.saveSettings) {
      this.elements.saveSettings.addEventListener("click", () => {
        this.saveSettings();
      });
    }

    if (this.elements.testExtraction) {
      this.elements.testExtraction.addEventListener("click", () => {
        this.testExtraction();
      });
    }

    if (this.elements.checkContentScript) {
      this.elements.checkContentScript.addEventListener("click", () => {
        this.checkContentScriptStatus();
      });
    }

    // API Key testing
    if (this.elements.testOpenAIKey) {
      this.elements.testOpenAIKey.addEventListener("click", () => {
        this.testOpenAIKey();
      });
    }

    if (this.elements.clearOpenAIKey) {
      this.elements.clearOpenAIKey.addEventListener("click", () => {
        this.clearOpenAIKey();
      });
    }

    if (this.elements.testGeminiKey) {
      this.elements.testGeminiKey.addEventListener("click", () => {
        this.testGeminiKey();
      });
    }

    if (this.elements.clearGeminiKey) {
      this.elements.clearGeminiKey.addEventListener("click", () => {
        this.clearGeminiKey();
      });
    }

    if (this.elements.validateAI) {
      this.elements.validateAI.addEventListener("click", () => {
        this.validateAIConfiguration();
      });
    }

    if (this.elements.validateAndSave) {
      this.elements.validateAndSave.addEventListener("click", () => {
        this.validateAndSaveSettings();
      });
    }

    console.log("✅ Event listeners bound successfully");
  }

  updateAIProviderUI() {
    const openaiSection = document.getElementById("openaiSection");
    const geminiSection = document.getElementById("geminiSection");

    if (!openaiSection || !geminiSection) {
      console.error("❌ AI provider sections not found");
      return;
    }

    if (this.settings.aiProvider === "gemini") {
      openaiSection.style.display = "none";
      geminiSection.style.display = "block";
      console.log("🔄 Switched to Gemini provider");
    } else {
      openaiSection.style.display = "block";
      geminiSection.style.display = "none";
      console.log("🔄 Switched to OpenAI provider");
    }
  }

  async checkContentScriptStatus() {
    try {
      this.showMessage("Checking content script status...", "info");
      const status = await this._getContentScriptStatus();

      if (status.loaded) {
        this.showMessage("✅ Content script is loaded and ready!", "success");
        console.log("✅ Content script status:", status);
      } else {
        this.showMessage(
          `❌ Content script not ready: ${status.error}`,
          "error"
        );
        console.log("❌ Content script status:", status);
      }
    } catch (error) {
      console.error("❌ Error checking content script status:", error);
      this.showMessage("Error checking content script status!", "error");
    }
  }

  async _getContentScriptStatus() {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab || !tab.url.includes("upwork.com")) {
        return { loaded: false, error: "Not on Upwork page" };
      }

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          return {
            hasTestFunction: typeof window.testJobExtraction === "function",
            hasExtractFunction:
              typeof window.extractJobDataFromApplicationPage === "function",
            url: window.location.href,
            title: document.title,
          };
        },
      });

      if (result && result[0] && result[0].result) {
        return { loaded: true, ...result[0].result };
      }
      return { loaded: false, error: "Failed to check content script" };
    } catch (error) {
      return { loaded: false, error: error.message };
    }
  }

  updateToggleUI(toggleId, isActive) {
    const toggle = this.elements[toggleId];
    if (toggle) {
      if (isActive) {
        toggle.classList.add("active");
      } else {
        toggle.classList.remove("active");
      }
    }
  }

  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get([
        "notificationsEnabled",
        "emailEnabled",
        "aiEnabled",
        "checkInterval",
        "emailAddress",
        "aiProvider",
        "openaiApiKey",
        "geminiApiKey",
      ]);

      this.settings = {
        notificationsEnabled: result.notificationsEnabled ?? true,
        emailEnabled: result.emailEnabled ?? false,
        aiEnabled: result.aiEnabled ?? false,
        checkInterval: result.checkInterval ?? 5,
        emailAddress: result.emailAddress ?? "",
        aiProvider: result.aiProvider ?? "openai",
        openaiApiKey: result.openaiApiKey ?? "",
        geminiApiKey: result.geminiApiKey ?? "",
      };

      console.log("📥 Settings loaded:", this.settings);
    } catch (error) {
      console.error("❌ Error loading settings:", error);
      this.settings = {
        notificationsEnabled: true,
        emailEnabled: false,
        aiEnabled: false,
        checkInterval: 5,
        emailAddress: "",
        aiProvider: "openai",
        openaiApiKey: "",
        geminiApiKey: "",
      };
    }
  }

  updateUI() {
    // Update toggle switches
    this.updateToggleUI(
      "notificationToggle",
      this.settings.notificationsEnabled
    );
    this.updateToggleUI("emailToggle", this.settings.emailEnabled);
    this.updateToggleUI("aiToggle", this.settings.aiEnabled);

    // Update form inputs
    if (this.elements.checkInterval) {
      this.elements.checkInterval.value = this.settings.checkInterval;
    }
    if (this.elements.emailAddress) {
      this.elements.emailAddress.value = this.settings.emailAddress;
    }
    if (this.elements.openaiApiKey) {
      this.elements.openaiApiKey.value = this.settings.openaiApiKey;
    }
    if (this.elements.geminiApiKey) {
      this.elements.geminiApiKey.value = this.settings.geminiApiKey;
    }
    if (this.elements.aiProvider) {
      this.elements.aiProvider.value = this.settings.aiProvider;
    }

    // Update AI provider UI
    this.updateAIProviderUI();

    // Show AI configuration status
    this.updateAIConfigStatus();

    // Load status
    this.loadStatus();
  }

  updateAIConfigStatus() {
    if (!this.elements.validateAI) return;

    const hasOpenAIKey =
      this.settings.openaiApiKey && this.settings.openaiApiKey.trim() !== "";
    const hasGeminiKey =
      this.settings.geminiApiKey && this.settings.geminiApiKey.trim() !== "";

    if (this.settings.aiEnabled) {
      if (this.settings.aiProvider === "openai" && hasOpenAIKey) {
        this.elements.validateAI.textContent = "✅ OpenAI Ready";
        this.elements.validateAI.className = "btn btn-secondary btn-small";
        this.elements.validateAI.style.background = "#28a745";
        this.elements.validateAI.style.color = "white";
      } else if (this.settings.aiProvider === "gemini" && hasGeminiKey) {
        this.elements.validateAI.textContent = "✅ Gemini Ready";
        this.elements.validateAI.className = "btn btn-secondary btn-small";
        this.elements.validateAI.style.background = "#28a745";
        this.elements.validateAI.style.color = "white";
      } else {
        this.elements.validateAI.textContent = "⚠️ Config Invalid";
        this.elements.validateAI.className = "btn btn-secondary btn-small";
        this.elements.validateAI.style.background = "#dc3545";
        this.elements.validateAI.style.color = "white";
      }
    } else {
      this.elements.validateAI.textContent = "🔍 Validate AI Config";
      this.elements.validateAI.className = "btn btn-secondary btn-small";
      this.elements.validateAI.style.background = "";
      this.elements.validateAI.style.color = "";
    }
  }

  async loadStatus() {
    try {
      const result = await chrome.runtime.sendMessage({ action: "getStatus" });
      if (result && result.success && result.data) {
        const data = result.data;

        // Update status display
        if (this.elements.status) {
          this.elements.status.textContent = data.isEnabled
            ? "Running"
            : "Stopped";
        }
        if (this.elements.lastCheck) {
          this.elements.lastCheck.textContent = data.lastCheck || "Never";
        }
        if (this.elements.jobsTracked) {
          this.elements.jobsTracked.textContent = data.jobsTracked || "0";
        }

        // Update settings from background script
        if (data.openAISettings) {
          this.settings.aiEnabled = data.openAISettings.enabled || false;
          this.settings.aiProvider = data.openAISettings.provider || "openai";
          this.settings.openaiApiKey = data.openAISettings.apiKey || "";
          this.settings.geminiApiKey = data.openAISettings.geminiApiKey || "";
        }

        if (data.emailSettings) {
          this.settings.emailEnabled = data.emailSettings.enabled || false;
          this.settings.emailAddress = data.emailSettings.email || "";
        }

        // Update UI to reflect current settings
        this.updateToggleUI("aiToggle", this.settings.aiEnabled);
        this.updateToggleUI("emailToggle", this.settings.emailEnabled);
        this.updateAIProviderUI();
        this.updateAIConfigStatus();

        console.log("📊 Status loaded and UI updated:", this.settings);
      }
    } catch (error) {
      console.error("❌ Error loading status:", error);
    }
  }

  async refreshSettingsFromStorage() {
    try {
      const result = await chrome.storage.sync.get([
        "notificationsEnabled",
        "emailEnabled",
        "aiEnabled",
        "checkInterval",
        "emailAddress",
        "aiProvider",
        "openaiApiKey",
        "geminiApiKey",
      ]);

      // Update local settings
      this.settings = {
        notificationsEnabled: result.notificationsEnabled ?? true,
        emailEnabled: result.emailEnabled ?? false,
        aiEnabled: result.aiEnabled ?? false,
        checkInterval: result.checkInterval ?? 5,
        emailAddress: result.emailAddress ?? "",
        aiProvider: result.aiProvider ?? "openai",
        openaiApiKey: result.openaiApiKey ?? "",
        geminiApiKey: result.geminiApiKey ?? "",
      };

      console.log("🔄 Settings refreshed from storage:", this.settings);

      // Update UI
      this.updateUI();

      return true;
    } catch (error) {
      console.error("❌ Error refreshing settings:", error);
      return false;
    }
  }

  async forceSaveSettings() {
    try {
      // Save to chrome storage
      await chrome.storage.sync.set(this.settings);
      console.log("💾 Settings force-saved:", this.settings);

      // Send to background script
      await chrome.runtime.sendMessage({
        action: "updateSettings",
        settings: this.settings,
      });

      // Refresh settings from storage to confirm
      await this.refreshSettingsFromStorage();

      this.showMessage("Settings saved and active!", "success");
      return true;
    } catch (error) {
      console.error("❌ Error force-saving settings:", error);
      this.showMessage("Error saving settings!", "error");
      return false;
    }
  }

  async saveSettings() {
    try {
      await chrome.storage.sync.set(this.settings);
      console.log("💾 Settings saved successfully");

      // Send settings to background script
      await chrome.runtime.sendMessage({
        action: "updateSettings",
        settings: this.settings,
      });

      this.showMessage("Settings saved successfully!", "success");
      return true;
    } catch (error) {
      console.error("❌ Error saving settings:", error);
      this.showMessage("Error saving settings!", "error");
      return false;
    }
  }

  async checkForNewJobs() {
    try {
      this.showMessage("Checking for new jobs...", "info");
      const result = await chrome.runtime.sendMessage({ action: "checkNow" });
      if (result.success) {
        this.showMessage(`Found ${result.data.count} new jobs!`, "success");
      } else {
        this.showMessage("No new jobs found.", "info");
      }
    } catch (error) {
      console.error("❌ Error checking for jobs:", error);
      this.showMessage("Error checking for jobs!", "error");
    }
  }

  async testExtraction() {
    try {
      this.showMessage("Testing job extraction...", "info");

      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });
      if (!tab) {
        this.showMessage("No active tab found!", "error");
        return;
      }

      // Check if we're on an Upwork page
      if (!tab.url.includes("upwork.com")) {
        this.showMessage(
          "Please navigate to an Upwork job page first!",
          "error"
        );
        return;
      }

      // First, try to inject the content script
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"],
        });
        console.log("✅ Content script injected successfully");
      } catch (injectError) {
        console.log("⚠️ Content script injection failed:", injectError);
        // Continue anyway - the script might already be loaded
      }

      // Wait a moment for the script to initialize
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Try to execute the test function
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          try {
            // Check if the content script is loaded
            if (typeof window.testJobExtraction === "function") {
              console.log("🧪 Running testJobExtraction...");
              return window.testJobExtraction();
            } else {
              console.log("❌ testJobExtraction function not found");
              return {
                error:
                  "Content script not loaded - testJobExtraction function missing",
              };
            }
          } catch (error) {
            console.error("❌ Error in test function:", error);
            return { error: `Execution error: ${error.message}` };
          }
        },
      });

      if (result && result[0] && result[0].result) {
        const data = result[0].result;
        if (data.error) {
          this.showMessage(`Extraction failed: ${data.error}`, "error");
          console.error("❌ Extraction error:", data.error);
        } else if (data.success) {
          this.showMessage(
            `✅ ${data.message} Success rate: ${data.successRate}`,
            "success"
          );
          console.log("✅ Extraction successful:", data);

          // Show detailed results
          if (data.data) {
            console.log("📋 Extracted Job Data:");
            console.log("  - Title:", data.data.title);
            console.log("  - Budget:", data.data.budget);
            console.log("  - Job Type:", data.data.jobType);
            console.log("  - Posted:", data.data.postedTime);
            console.log("  - Skills:", data.data.skills);
            console.log(
              "  - Description length:",
              data.data.description ? data.data.description.length : 0
            );
          }
        } else {
          this.showMessage(
            `Extraction completed but with issues: ${data.message}`,
            "info"
          );
          console.log("⚠️ Extraction with issues:", data);
        }
      } else {
        this.showMessage("Failed to execute extraction test", "error");
        console.error("❌ No result from extraction test");
      }
    } catch (error) {
      console.error("❌ Error testing extraction:", error);

      // Provide more helpful error messages
      let userMessage = "Error testing extraction!";
      if (error.message.includes("Cannot access")) {
        userMessage =
          "Cannot access this page. Please ensure you are on an Upwork job page.";
      } else if (error.message.includes("Failed to load content script")) {
        userMessage =
          "Failed to load extension script. Please refresh the page and try again.";
      } else if (error.message.includes("Receiving end does not exist")) {
        userMessage =
          "Content script not loaded. Please refresh the page and try again.";
      }

      this.showMessage(userMessage, "error");
    }
  }

  async testOpenAIKey() {
    try {
      if (!this.settings.openaiApiKey) {
        this.showMessage("Please enter an OpenAI API key first!", "error");
        return;
      }

      this.showMessage("Testing OpenAI API key...", "info");
      const result = await chrome.runtime.sendMessage({
        action: "testOpenAIKey",
        apiKey: this.settings.openaiApiKey,
      });

      if (result.success) {
        this.showMessage("OpenAI API key is valid!", "success");
        if (this.elements.openAIKeyStatus) {
          this.elements.openAIKeyStatus.textContent = "✅ Valid";
          this.elements.openAIKeyStatus.className =
            "status-span status-success";
        }
      } else {
        this.showMessage(
          `OpenAI API key test failed: ${result.error}`,
          "error"
        );
        if (this.elements.openAIKeyStatus) {
          this.elements.openAIKeyStatus.textContent = "❌ Invalid";
          this.elements.openAIKeyStatus.className = "status-span status-error";
        }
      }
    } catch (error) {
      console.error("❌ Error testing OpenAI key:", error);
      this.showMessage("Error testing OpenAI key!", "error");
    }
  }

  clearOpenAIKey() {
    this.settings.openaiApiKey = "";
    if (this.elements.openaiApiKey) {
      this.elements.openaiApiKey.value = "";
    }
    if (this.elements.openAIKeyStatus) {
      this.elements.openAIKeyStatus.textContent = "";
      this.elements.openAIKeyStatus.className = "status-span";
    }
    this.showMessage("OpenAI API key cleared!", "info");
  }

  async testGeminiKey() {
    try {
      if (!this.settings.geminiApiKey) {
        this.showMessage("Please enter a Gemini API key first!", "error");
        return;
      }

      this.showMessage("Testing Gemini API key...", "info");
      const result = await chrome.runtime.sendMessage({
        action: "testGeminiKey",
        apiKey: this.settings.geminiApiKey,
      });

      if (result.success) {
        this.showMessage("Gemini API key is valid!", "success");
        if (this.elements.geminiKeyStatus) {
          this.elements.geminiKeyStatus.textContent = "✅ Valid";
          this.elements.geminiKeyStatus.className =
            "status-span status-success";
        }
      } else {
        this.showMessage(
          `Gemini API key test failed: ${result.error}`,
          "error"
        );
        if (this.elements.geminiKeyStatus) {
          this.elements.geminiKeyStatus.textContent = "❌ Invalid";
          this.elements.geminiKeyStatus.className = "status-span status-error";
        }
      }
    } catch (error) {
      console.error("❌ Error testing Gemini key:", error);
      this.showMessage("Error testing Gemini key!", "error");
    }
  }

  clearGeminiKey() {
    this.settings.geminiApiKey = "";
    if (this.elements.geminiApiKey) {
      this.elements.geminiApiKey.value = "";
    }
    if (this.elements.geminiKeyStatus) {
      this.elements.geminiKeyStatus.textContent = "";
      this.elements.geminiKeyStatus.className = "status-span";
    }
    this.showMessage("Gemini API key cleared!", "info");
  }

  showMessage(message, type = "info") {
    if (this.elements.message) {
      this.elements.message.textContent = message;
      this.elements.message.className = `message-${type}`;

      // Auto-hide after 5 seconds
      setTimeout(() => {
        if (this.elements.message) {
          this.elements.message.textContent = "";
          this.elements.message.className = "";
        }
      }, 5000);
    }
  }

  validateAIConfiguration() {
    const hasOpenAIKey =
      this.settings.openaiApiKey && this.settings.openaiApiKey.trim() !== "";
    const hasGeminiKey =
      this.settings.geminiApiKey && this.settings.geminiApiKey.trim() !== "";

    if (this.settings.aiEnabled) {
      if (!hasOpenAIKey && !hasGeminiKey) {
        this.showMessage(
          "⚠️ AI proposals enabled but no API keys configured!",
          "error"
        );
        return false;
      }

      if (this.settings.aiProvider === "openai" && !hasOpenAIKey) {
        this.showMessage(
          "⚠️ OpenAI selected but no OpenAI API key configured!",
          "error"
        );
        return false;
      }

      if (this.settings.aiProvider === "gemini" && !hasGeminiKey) {
        this.showMessage(
          "⚠️ Gemini selected but no Gemini API key configured!",
          "error"
        );
        return false;
      }

      this.showMessage("✅ AI configuration is valid!", "success");
      return true;
    }

    return false;
  }

  async validateAndSaveSettings() {
    if (await this.validateAIConfiguration()) {
      await this.forceSaveSettings();
      this.showMessage("Settings validated and saved!", "success");
    } else {
      this.showMessage("Please fix AI configuration errors.", "error");
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 DOM loaded, initializing popup...");
  new PopupManager();
}); 