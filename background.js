// Background service worker for Upwork Job Notifier
class UpworkJobNotifier {
  constructor() {
    this.lastCheckedJobs = new Set();
    this.trackedJobsData = new Map(); // Store full job details
    this.checkInterval = 5 * 60 * 1000; // 5 minutes
    this.isEnabled = true;
    this.emailSettings = {
      enabled: false,
      email: "",
      smtpServer: "",
      smtpPort: 587,
      username: "",
      password: "",
    };
    this.openAISettings = {
      apiKey: "",
      geminiApiKey: "",
      enabled: false,
      provider: "openai"
    };

    this.init();
  }

  async init() {
    // Load saved settings
    await this.loadSettings();

    // Log current settings state
    console.log("🚀 Background script initialized with settings:", {
      isEnabled: this.isEnabled,
      emailEnabled: this.emailSettings.enabled,
      aiEnabled: this.openAISettings.enabled,
      aiProvider: this.openAISettings.provider,
      hasOpenAIKey: !!(this.openAISettings.apiKey && this.openAISettings.apiKey.trim()),
      hasGeminiKey: !!(this.openAISettings.geminiApiKey && this.openAISettings.geminiApiKey.trim())
    });

    // Validate API key configuration on startup
    this.validateApiKeyConfiguration();

    // Set up alarm for periodic checking
    chrome.alarms.create("checkJobs", {
      delayInMinutes: 0.5,
      periodInMinutes: 5,
    });

    // Listen for alarm events
    chrome.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === "checkJobs") {
        this.checkForNewJobs();
      }
    });

    // Listen for messages from popup
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true;
    });
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
        "lastCheckedJobs",
        "trackedJobsData",
        // Legacy support
        "isEnabled",
        "emailSettings",
        "openAISettings",
      ]);

      // New settings structure
      this.isEnabled =
        result.notificationsEnabled !== undefined
          ? result.notificationsEnabled
          : result.isEnabled !== undefined
          ? result.isEnabled
          : true;

      this.checkInterval = result.checkInterval || this.checkInterval;

      // Email settings
      this.emailSettings = {
        enabled:
          result.emailEnabled !== undefined
            ? result.emailEnabled
            : result.emailSettings?.enabled || false,
        email: result.emailAddress || result.emailSettings?.email || "",
        smtpServer: result.emailSettings?.smtpServer || "",
        smtpPort: result.emailSettings?.smtpPort || 587,
        username: result.emailSettings?.username || "",
        password: result.emailSettings?.password || "",
      };

      // AI settings
      this.openAISettings = {
        enabled:
          result.aiEnabled !== undefined
            ? result.aiEnabled
            : result.openAISettings?.enabled || false,
        apiKey: result.openaiApiKey || result.openAISettings?.apiKey || "",
        geminiApiKey:
          result.geminiApiKey || result.openAISettings?.geminiApiKey || "",
        provider:
          result.aiProvider || result.openAISettings?.provider || "openai",
      };

      this.lastCheckedJobs = new Set(result.lastCheckedJobs || []);

      // Load tracked jobs data
      if (result.trackedJobsData) {
        this.trackedJobsData = new Map(Object.entries(result.trackedJobsData));
      }

      console.log("📥 Settings loaded:", {
        isEnabled: this.isEnabled,
        checkInterval: this.checkInterval,
        emailSettings: this.emailSettings,
        openAISettings: this.openAISettings,
      });
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  }

  validateApiKeyConfiguration() {
    // Check if AI proposals are enabled but no API keys are configured
    if (this.openAISettings.enabled) {
      const hasOpenAIKey =
        this.openAISettings.apiKey && this.openAISettings.apiKey.trim() !== "";
      const hasGeminiKey =
        this.openAISettings.geminiApiKey &&
        this.openAISettings.geminiApiKey.trim() !== "";

      if (!hasOpenAIKey && !hasGeminiKey) {
        console.warn(
          "⚠️ AI proposals are enabled but no API keys are configured. Disabling AI proposals."
        );
        this.openAISettings.enabled = false;
        this.saveSettings();
      }
    }

    // Check if OpenAI API key format is valid
    if (
      this.openAISettings.apiKey &&
      !this.openAISettings.apiKey.startsWith("sk-")
    ) {
      console.warn(
        '⚠️ Invalid OpenAI API key format detected. API key should start with "sk-".'
      );
    }

    // Check if Gemini API key format is valid
    if (
      this.openAISettings.geminiApiKey &&
      !this.openAISettings.geminiApiKey.startsWith("AIza")
    ) {
      console.warn(
        '⚠️ Invalid Gemini API key format detected. API key should start with "AIza".'
      );
    }
  }

  async saveSettings() {
    try {
      // Limit tracked jobs to prevent quota issues
      const limitedTrackedJobs = {};
      const jobEntries = Array.from(this.trackedJobsData.entries());

      // Keep only the most recent 50 jobs
      const recentJobs = jobEntries
        .sort((a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0))
        .slice(0, 50);

      recentJobs.forEach(([key, value]) => {
        // Limit job data to essential fields to save space
        limitedTrackedJobs[key] = {
          id: value.id,
          title: value.title,
          budget: value.budget,
          jobType: value.jobType,
          postedTime: value.postedTime,
          timestamp: value.timestamp,
        };
      });

      // Save new settings structure
      const newSettings = {
        notificationsEnabled: this.isEnabled,
        emailEnabled: this.emailSettings.enabled,
        aiEnabled: this.openAISettings.enabled,
        checkInterval: this.checkInterval,
        emailAddress: this.emailSettings.email,
        aiProvider: this.openAISettings.provider,
        openaiApiKey: this.openAISettings.apiKey,
        geminiApiKey: this.openAISettings.geminiApiKey,
        lastCheckedJobs: Array.from(this.lastCheckedJobs),
        trackedJobsData: limitedTrackedJobs,
      };

      // Also save legacy structure for compatibility
      const legacySettings = {
        isEnabled: this.isEnabled,
        checkInterval: this.checkInterval,
        emailSettings: this.emailSettings,
        openAISettings: this.openAISettings,
        lastCheckedJobs: Array.from(this.lastCheckedJobs),
        trackedJobsData: limitedTrackedJobs,
      };

      // Save both structures
      await chrome.storage.sync.set(newSettings);
      await chrome.storage.sync.set(legacySettings);

      // Create a safe copy of settings for logging (without API keys)
      const safeSettings = {
        notificationsEnabled: this.isEnabled,
        emailEnabled: this.emailSettings.enabled,
        aiEnabled: this.openAISettings.enabled,
        provider: this.openAISettings.provider,
        openaiApiKey: this.openAISettings.apiKey
          ? this.openAISettings.apiKey.substring(0, 7) +
            "..." +
            this.openAISettings.apiKey.substring(
              this.openAISettings.apiKey.length - 4
            )
          : "Not set",
        geminiApiKey: this.openAISettings.geminiApiKey
          ? this.openAISettings.geminiApiKey.substring(0, 7) +
            "..." +
            this.openAISettings.geminiApiKey.substring(
              this.openAISettings.geminiApiKey.length - 4
            )
          : "Not set",
      };

      console.log("💾 Settings saved successfully:", safeSettings);
    } catch (error) {
      console.error("❌ Error saving settings:", error);
    }
  }

  async checkForNewJobs() {
    if (!this.isEnabled) return;

    try {
      console.log(
        "🔍 Checking for new jobs...",
        new Date().toLocaleTimeString()
      );

      const response = await fetch(
        "https://www.upwork.com/nx/find-work/most-recent",
        {
          method: "GET",
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          },
        }
      );

      if (!response.ok) {
        console.error("Failed to fetch Upwork jobs:", response.status);
        return;
      }

      const html = await response.text();
      const jobs = this.parseJobsFromHTML(html);
      const newJobs = this.findNewJobs(jobs);

      console.log(
        `📊 Found ${jobs.length} total jobs under 10 minutes, ${newJobs.length} new jobs`
      );

      if (newJobs.length > 0) {
        console.log(
          "🎉 New jobs found:",
          newJobs.map((job) => job.title)
        );
        // await this.notifyNewJobs(newJobs);
        // await this.sendEmailNotification(newJobs);
      }

      // Update last checked jobs and store job data
      jobs.forEach((job) => {
        this.lastCheckedJobs.add(job.id);
        this.trackedJobsData.set(job.id, job);
      });

      // Save immediately to ensure persistence
      await this.saveSettings();

      console.log("✅ Job check completed successfully");
    } catch (error) {
      console.error("❌ Error checking for new jobs:", error);
    }
  }

  parseJobsFromHTML(html) {
    const jobs = [];


    // Simple regex-based parsing since DOMParser isn't available in background
    // This is a fallback method - the content script handles most parsing
    try {
      // Extract job titles using regex
      const titleRegex =
        /<h3[^>]*class="[^"]*job-tile-title[^"]*"[^>]*>.*?<a[^>]*href="([^"]*)"[^>]*>([^<]+)<\/a>/g;
      const budgetRegex = /<span[^>]*data-test="budget"[^>]*>([^<]+)<\/span>/g;
      const postedTimeRegex = /<span[^>]*data-test="posted-on"[^>]*>([^<]+)<\/span>/g;

      let match;
      let jobIndex = 0;

      while ((match = titleRegex.exec(html)) !== null) {
        const jobLink = match[1];
        const jobTitle = match[2].trim();

        // Extract budget if available
        let budget = "";
        const budgetMatch = budgetRegex.exec(html);
        if (budgetMatch) {
          budget = budgetMatch[1].trim();
        }

        let postedTime = "";
        const postedTimeMatch = postedTimeRegex.exec(html);
        if (postedTimeMatch) {
          postedTime = postedTimeMatch[1].trim();
        }

        // If postedTime contains "hour" (e.g., "1 hour ago", "2 hours ago", etc.), skip adding this job
        if (/(\d+\s*hour)/i.test(postedTime) || /(\d+\s*hours)/i.test(postedTime)) {
          continue;
        }

        // Generate unique ID
        const jobId = btoa(jobTitle + budget + postedTime).slice(0, 20);

        const job = {
          id: jobId,
          title: jobTitle,
          budget: budget,
          description: "",
          link: jobLink,
          timestamp: Date.now(),
          index: jobIndex++,
        };

        jobs.push(job);
      }
    } catch (error) {
      console.error("Error parsing HTML with regex:", error);
    }

    return jobs;
  }

  extractJobData(element, index) {
    // Extract job title - based on actual Upwork HTML structure
    const titleSelectors = [
      "h3.job-tile-title a",
      ".job-tile-title a",
      'h3 a[href*="/jobs/"]',
      '[data-test="job-title"]',
      ".job-title",
    ];

    let title = "";
    for (const selector of titleSelectors) {
      const titleElement = element.querySelector(selector);
      if (titleElement) {
        title = titleElement.textContent.trim();
        break;
      }
    }

    // Extract job budget - based on actual structure
    const budgetSelectors = [
      'span[data-test="budget"]',
      '[data-test="budget"]',
      '.text-caption span[data-test="budget"]',
    ];

    let budget = "";
    for (const selector of budgetSelectors) {
      const budgetElement = element.querySelector(selector);
      if (budgetElement) {
        budget = budgetElement.textContent.trim();
        break;
      }
    }

    // Extract job description - based on actual structure
    const descSelectors = [
      'span[data-test="job-description-text"]',
      '[data-test="job-description-text"]',
      '.air3-line-clamp span[data-test="job-description-text"]',
    ];

    let description = "";
    for (const selector of descSelectors) {
      const descElement = element.querySelector(selector);
      if (descElement) {
        description = descElement.textContent.trim();
        break;
      }
    }

    // Extract job type
    const jobTypeSelectors = [
      'strong[data-test="job-type"]',
      '[data-test="job-type"]',
    ];

    let jobType = "";
    for (const selector of jobTypeSelectors) {
      const typeElement = element.querySelector(selector);
      if (typeElement) {
        jobType = typeElement.textContent.trim();
        break;
      }
    }

    // Extract posted time
    const postedSelectors = [
      'span[data-test="posted-on"]',
      '[data-test="posted-on"]',
    ];

    let postedTime = "";
    for (const selector of postedSelectors) {
      const postedElement = element.querySelector(selector);
      if (postedElement) {
        postedTime = postedElement.textContent.trim();
        break;
      }
    }

    // Generate unique ID based on content and job UID
    const jobUID = element.getAttribute("data-ev-opening_uid") || "";
    const jobId = jobUID || btoa(title + budget + description).slice(0, 20);

    const job = {
      id: jobId,
      title: title,
      budget: budget,
      description: description,
      jobType: jobType,
      postedTime: postedTime,
      timestamp: Date.now(),
    };

    if (job.postedTime.includes("hour") || job.postedTime.includes("hours")) {
      return null;
    }

    return job;
    // Only return jobs that are estimated to take under 10 minutes
  }

  extractBudgetAmount(budgetText) {
    if (!budgetText) return 0;

    // Extract numbers from budget text
    const matches = budgetText.match(/\$?(\d+(?:\.\d+)?)/);
    if (matches) {
      return parseFloat(matches[1]);
    }
    return 0;
  }

  findNewJobs(jobs) {
    return jobs.filter((job) => !this.lastCheckedJobs.has(job.id));
  }

  async notifyNewJobs(newJobs) {
    // Play notification sound
    this.playNotificationSound();

    const notificationOptions = {
      type: "basic",
      iconUrl: "icons/icon.svg",
      title: `New Quick Upwork Jobs Found!`,
      message: `Found ${newJobs.length} new job${
        newJobs.length > 1 ? "s" : ""
      } under 10 minutes`,
      priority: 2,
    };

    await chrome.notifications.create("new-jobs", notificationOptions);

    // Also show detailed notification for each job
    newJobs.forEach((job, index) => {
      setTimeout(async () => {
        await chrome.notifications.create(`job-${job.id}`, {
          type: "basic",
          iconUrl: "icons/icon.svg",
          title: `Quick Job: ${job.title}`,
          message: `Budget: ${job.budget}\n${job.description.substring(
            0,
            100
          )}...`,
          priority: 1,
        });
      }, index * 1000); // Stagger notifications
    });
  }

  playNotificationSound() {
    try {
      // Create audio context for notification sound
      const audioContext = new (window.AudioContext ||
        window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Could not play notification sound:", error);
    }
  }

  notifyContentScripts(newJobs) {
    try {
      // Send message to all content scripts
      chrome.tabs.query({ url: "*://www.upwork.com/*" }, (tabs) => {
        tabs.forEach((tab) => {
          chrome.tabs
            .sendMessage(tab.id, {
              action: "newJobsFound",
              newJobsCount: newJobs.length,
            })
            .catch((error) => {
              // Ignore errors if content script is not ready
              console.log("Could not notify content script:", error);
            });
        });
      });
    } catch (error) {
      console.error("Error notifying content scripts:", error);
    }
  }

  async sendEmailNotification(newJobs) {
    if (!this.emailSettings.enabled || !this.emailSettings.email) {
      return;
    }

    try {
      const emailBody = this.createEmailBody(newJobs);

      // Use a simple email service or your own SMTP
      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            service_id: "your_service_id", // You'll need to set up EmailJS
            template_id: "your_template_id",
            user_id: "your_user_id",
            template_params: {
              to_email: this.emailSettings.email,
              subject: `New Quick Upwork Jobs - ${newJobs.length} found (under 10 minutes)`,
              message: emailBody,
            },
          }),
        }
      );

      if (!response.ok) {
        console.error("Failed to send email notification");
      }
    } catch (error) {
      console.error("Error sending email notification:", error);
    }
  }

  async draftAIProposal(job, cvData) {
    console.log("🧠 draftAIProposal called with settings:", {
      enabled: this.openAISettings.enabled,
      provider: this.openAISettings.provider,
      hasOpenAIKey: !!(
        this.openAISettings.apiKey && this.openAISettings.apiKey.trim()
      ),
      hasGeminiKey: !!(
        this.openAISettings.geminiApiKey &&
        this.openAISettings.geminiApiKey.trim()
      ),
    });

    if (!this.openAISettings.enabled) {
      throw new Error(
        "AI proposal drafting is not enabled. Please enable it in the extension settings."
      );
    }

    const provider = this.openAISettings.provider || "openai";
    console.log("🔄 Using AI provider:", provider);

    if (provider === "openai") {
      if (
        !this.openAISettings.apiKey ||
        this.openAISettings.apiKey.trim() === ""
      ) {
        throw new Error(
          "OpenAI API key is not configured. Please add your OpenAI API key in the extension settings."
        );
      }
      return await this.draftOpenAIProposal(job, cvData);
    } else if (provider === "gemini") {
      if (
        !this.openAISettings.geminiApiKey ||
        this.openAISettings.geminiApiKey.trim() === ""
      ) {
        throw new Error(
          "Gemini API key is not configured. Please add your Gemini API key in the extension settings."
        );
      }
      return await this.draftGeminiProposal(job, cvData);
    } else {
      throw new Error(
        "Invalid AI provider selected. Please choose either OpenAI or Gemini."
      );
    }
  }

  async draftOpenAIProposal(job, cvData) {
    try {
      const prompt = this.createProposalPrompt(job, cvData);
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.openAISettings.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a freelance proposal writer. Write proposals in FIRST PERSON ('I', 'my', 'I will') as if the candidate is speaking directly to the client. Focus on solving their specific problems using the candidate's relevant skills. Keep proposals concise, professional, and solution-focused. NO email formatting, NO subject lines, NO contact details."
            },
            {
              role: "user",
              content: prompt
            }
          ],
          max_tokens: 800,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const proposalText = data.choices[0]?.message?.content || "";
      
      if (!proposalText) {
        throw new Error("No proposal generated from OpenAI");
      }

      // Parse the proposal into structured format
      const proposal = this.parseProposalResponse(proposalText, job);
      
      return proposal;
    } catch (error) {
      console.error("Error drafting OpenAI proposal:", error);
      throw error;
    }
  }

  async draftGeminiProposal(job, cvData) {
    try {
      const prompt = this.createProposalPrompt(job, cvData);
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${this.openAISettings.geminiApiKey}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `You are a freelance proposal writer. Write proposals in FIRST PERSON ('I', 'my', 'I will') as if the candidate is speaking directly to the client. Focus on solving their specific problems using the candidate's relevant skills. Keep proposals concise, professional, and solution-focused. NO email formatting, NO subject lines, NO contact details.

${prompt}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 800,
            topP: 0.8,
            topK: 40
          }
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Gemini API error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const proposalText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      
      if (!proposalText) {
        throw new Error("No proposal generated from Gemini");
      }

      // Parse the proposal into structured format
      const proposal = this.parseProposalResponse(proposalText, job);
      
      return proposal;
    } catch (error) {
      console.error("Error drafting Gemini proposal:", error);
      throw error;
    }
  }

  createProposalPrompt(job, cvData) {
    const jobDetails = `
Job Title: ${job.title || "Not specified"}
Budget: ${job.budget || "Not specified"}
Job Type: ${job.jobType || "Not specified"}
Posted: ${job.postedTime || "Not specified"}
Description: ${job.description || "Not specified"}
Skills Required: ${job.skills ? job.skills.join(", ") : "Not specified"}
`;

    const cvSummary = cvData ? `
Candidate CV Summary:
${cvData}
` : "No CV data available";

    return `Write a proposal for this Upwork job. Use ONLY the job details provided to understand what the client needs, then show how the candidate's specific skills will solve their problems.

JOB DETAILS:
${jobDetails}

CANDIDATE CV:
${cvSummary}

INSTRUCTIONS:
1. Analyze the job description to identify the client's specific problems and requirements
2. Pick 2-3 relevant skills from the candidate's CV that directly address those problems
3. Write a proposal in FIRST PERSON ("I") showing how those specific skills will solve the client's specific needs
4. Keep it concise (3-4 paragraphs)
5. NO subject line, NO contact details, NO email formatting
6. Start directly with the proposal content
7. Write as if the candidate is speaking directly to the client using "I", "my", "I will", etc.

PROPOSAL STRUCTURE:
- Paragraph 1: Show understanding of their specific problem from job description
- Paragraph 2: Explain how MY specific skills will solve it
- Paragraph 3: Outline what I will deliver and timeline
- Paragraph 4: Brief closing with confidence

FOCUS ON:
- Their specific problem (from job description)
- MY relevant skills (from CV)
- How MY skills solve their problem
- Clear deliverables and timeline

AVOID:
- Generic statements about being "the best"
- Long lists of unrelated skills
- Talking about background without connecting to their needs
- Email formatting or contact details
- Third person language (he/she/they)

Write a proposal in first person that directly addresses their job requirements using my relevant skills.`;
  }

  parseProposalResponse(proposalText, job) {
    // Split the proposal into introduction and closing
    const paragraphs = proposalText.split('\n\n').filter(p => p.trim());
    
    let introduction = "";
    let closing = "";
    
    if (paragraphs.length >= 2) {
      introduction = paragraphs[0];
      closing = paragraphs[paragraphs.length - 1];
    } else if (paragraphs.length === 1) {
      introduction = paragraphs[0];
      closing = "I'm excited about this opportunity and would love to discuss how I can help you achieve your goals. Please let me know if you have any questions or would like to discuss the project further.";
    }

    return {
      introduction: introduction || proposalText,
      closing: closing || "",
      jobTitle: job.title || "Job",
      budget: job.budget || "Not specified",
      jobType: job.jobType || "Not specified",
      postedTime: job.postedTime || "Not specified",
      skills: job.skills || [],
      fullProposal: proposalText
    };
  }

  async getCVData() {
    try {
      // Read CV data from the cv.txt file
      const response = await fetch(chrome.runtime.getURL('cv.txt'));
      if (!response.ok) {
        throw new Error('Failed to load CV data');
      }
      const cvData = await response.text();
      return { success: true, cvData };
    } catch (error) {
      console.error('Error loading CV data:', error);
      return { success: false, error: error.message, cvData: null };
    }
  }

  async handleDraftAIProposal(job, cvData, sendResponse) {
    try {
      const proposal = await this.draftAIProposal(job, cvData);
      sendResponse({
        success: true,
        proposal: proposal
      });
    } catch (error) {
      console.error('Error handling AI proposal draft:', error);
      sendResponse({
        success: false,
        error: error.message
      });
    }
  }

  async handleGetCVData(sendResponse) {
    try {
      const result = await this.getCVData();
      sendResponse(result);
    } catch (error) {
      console.error('Error handling CV data request:', error);
      sendResponse({
        success: false,
        error: error.message,
        cvData: null
      });
    }
  }

  async handleTestOpenAIKey(apiKey, sendResponse) {
    try {
      if (!apiKey || !apiKey.startsWith('sk-')) {
        sendResponse({
          success: false,
          error: 'Invalid OpenAI API key format. Should start with "sk-"'
        });
        return;
      }

      // Test the API key with a simple request
      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        sendResponse({
          success: true,
          message: 'OpenAI API key is valid'
        });
      } else {
        const errorData = await response.json();
        sendResponse({
          success: false,
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      console.error('Error testing OpenAI API key:', error);
      sendResponse({
        success: false,
        error: error.message || 'Network error occurred'
      });
    }
  }

  async handleTestGeminiKey(apiKey, sendResponse) {
    console.log('🧪 Background: Testing Gemini API key...');
    try {
      if (!apiKey || !apiKey.startsWith('AIza')) {
        console.log('❌ Background: Invalid Gemini API key format');
        sendResponse({
          success: false,
          error: 'Invalid Gemini API key format. Should start with "AIza"'
        });
        return;
      }

      console.log('✅ Background: Gemini API key format valid, testing API endpoint...');

      // Test the API key with a simple request
      console.log('🌐 Background: Making request to Gemini API...');
      const apiUrl = `https://generativelanguage.googleapis.com/v1/models?key=${apiKey}`;
      console.log('🔗 Background: API URL:', apiUrl.substring(0, 50) + '...');
      
      const response = await fetch(apiUrl, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log('📡 Background: Gemini API response status:', response.status, response.statusText);

      if (response.ok) {
        console.log('✅ Background: Gemini API key is valid');
        sendResponse({
          success: true,
          message: 'Gemini API key is valid'
        });
      } else {
        const errorData = await response.json();
        console.log('❌ Background: Gemini API error:', errorData);
        sendResponse({
          success: false,
          error: errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
        });
      }
    } catch (error) {
      console.error('Error testing Gemini API key:', error);
      sendResponse({
        success: false,
        error: error.message || 'Network error occurred'
      });
    }
  }

  createEmailBody(newJobs) {
    let body = `<h2>New Quick Upwork Jobs Found</h2>`;
    body += `<p>Found ${newJobs.length} new job${
      newJobs.length > 1 ? "s" : ""
    } under 10 minutes:</p>`;

    newJobs.forEach((job) => {
      body += `
        <div style="border: 1px solid #ddd; padding: 10px; margin: 10px 0;">
          <h3>${job.title}</h3>
          <p><strong>Budget:</strong> ${job.budget}</p>
          <p>${job.description}</p>
        </div>
      `;
    });

    return body;
  }

  async handleMessage(request, sender, sendResponse) {
    switch (request.action) {
      case "getStatus":
        sendResponse({
          success: true,
          data: {
            isEnabled: this.isEnabled,
            checkInterval: this.checkInterval,
            emailSettings: this.emailSettings,
            openAISettings: this.openAISettings,
            lastCheckedCount: this.lastCheckedJobs.size,
            lastCheck: this.lastCheckedJobs.size > 0 ? "Recently" : "Never",
            jobsTracked: this.lastCheckedJobs.size,
          },
        });
        break;

      case "toggleEnabled":
        this.isEnabled = request.enabled;
        this.saveSettings();
        sendResponse({ success: true });
        break;

      case "updateSettings":
        // Handle new settings structure
        if (request.settings) {
          this.isEnabled =
            request.settings.notificationsEnabled !== undefined
              ? request.settings.notificationsEnabled
              : this.isEnabled;

          this.checkInterval =
            request.settings.checkInterval || this.checkInterval;

          // Update email settings
          this.emailSettings.enabled =
            request.settings.emailEnabled !== undefined
              ? request.settings.emailEnabled
              : this.emailSettings.enabled;
          this.emailSettings.email =
            request.settings.emailAddress || this.emailSettings.email;

          // Update AI settings
          const oldAIEnabled = this.openAISettings.enabled;
          const oldAIProvider = this.openAISettings.provider;

          this.openAISettings.enabled =
            request.settings.aiEnabled !== undefined
              ? request.settings.aiEnabled
              : this.openAISettings.enabled;
          this.openAISettings.apiKey =
            request.settings.openaiApiKey || this.openAISettings.apiKey;
          this.openAISettings.geminiApiKey =
            request.settings.geminiApiKey || this.openAISettings.geminiApiKey;
          this.openAISettings.provider =
            request.settings.aiProvider || this.openAISettings.provider;

          console.log("🔄 AI Settings updated:", {
            enabled: `${oldAIEnabled} → ${this.openAISettings.enabled}`,
            provider: `${oldAIProvider} → ${this.openAISettings.provider}`,
            hasOpenAIKey: !!(
              this.openAISettings.apiKey && this.openAISettings.apiKey.trim()
            ),
            hasGeminiKey: !!(
              this.openAISettings.geminiApiKey &&
              this.openAISettings.geminiApiKey.trim()
            ),
          });

          console.log("🔄 Settings updated:", {
            notificationsEnabled: this.isEnabled,
            emailEnabled: this.emailSettings.enabled,
            aiEnabled: this.openAISettings.enabled,
            aiProvider: this.openAISettings.provider,
          });
        } else {
          // Legacy support
          this.checkInterval = request.checkInterval || this.checkInterval;
          this.emailSettings = request.emailSettings || this.emailSettings;

          // Validate OpenAI API key format before saving
          if (request.openAISettings) {
            if (request.openAISettings.enabled) {
              const hasOpenAIKey =
                request.openAISettings.apiKey &&
                request.openAISettings.apiKey.trim().startsWith("sk-");
              const hasGeminiKey =
                request.openAISettings.geminiApiKey &&
                request.openAISettings.geminiApiKey.trim().startsWith("AIza");

              if (!hasOpenAIKey && !hasGeminiKey) {
                sendResponse({
                  success: false,
                  error:
                    "AI proposals are enabled but no valid API keys are configured. Please add either an OpenAI or Gemini API key.",
                });
                return;
              }
            }
            this.openAISettings = request.openAISettings;
          }
        }

        await this.saveSettings();

        // Update alarm with new interval
        const intervalMinutes = this.checkInterval / (60 * 1000);
        chrome.alarms.clear("checkJobs");
        chrome.alarms.create("checkJobs", {
          delayInMinutes: intervalMinutes,
          periodInMinutes: intervalMinutes,
        });

        sendResponse({ success: true });
        break;

      case "checkNow":
        this.checkForNewJobs();
        sendResponse({ success: true });
        break;

      case "checkJobsFromPage":
        this.handleJobsFromPage(request.jobs, request.pageUrl, sendResponse);
        return true; // Keep message channel open for async response
        break;

      case "jobsExtracted":
        // Handle jobs extracted from content script
        if (request.jobs && request.jobs.length > 0) {
          console.log(
            `🔄 Processing ${request.jobs.length} jobs from content script`
          );
          this.processExtractedJobs(request.jobs);
        }
        break;

      case "getTrackedJobs":
        this.getTrackedJobs(sendResponse);
        return true; // Keep message channel open for async response
        break;

      case "draftAIProposal":
        this.handleDraftAIProposal(request.job, request.cvData, sendResponse);
        return true; // Keep message channel open for async response
        break;

      case "getCVData":
        this.handleGetCVData(sendResponse);
        return true; // Keep message channel open for async response
        break;

      case "updateOpenAISettings":
        this.openAISettings = request.settings || this.openAISettings;
        await this.saveSettings();
        sendResponse({ success: true });
        break;

      case "testOpenAIKey":
        this.handleTestOpenAIKey(request.apiKey, sendResponse);
        return true; // Keep message channel open for async response
        break;

      case "testGeminiKey":
        this.handleTestGeminiKey(request.apiKey, sendResponse);
        return true; // Keep message channel open for async response
        break;

      default:
        sendResponse({ error: "Unknown action" });
    }
  }

  async getTrackedJobs(sendResponse) {
    try {
      // Get full job details from tracked jobs data
      const jobs = Array.from(this.trackedJobsData.values());

      // Filter out jobs older than 5 minutes
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      const recentJobs = jobs.filter(
        (job) => job.timestamp && job.timestamp > fiveMinutesAgo
      );

      // Clean up old jobs from storage
      this.cleanupOldJobs();

      // Sort by timestamp (newest first)
      recentJobs.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

      sendResponse({
        success: true,
        jobs: recentJobs,
      });
    } catch (error) {
      console.error("Error getting tracked jobs:", error);
      sendResponse({
        success: false,
        error: error.message,
        jobs: [],
      });
    }
  }

  cleanupOldJobs() {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const jobsToRemove = [];

    // Find jobs older than 5 minutes
    for (const [jobId, job] of this.trackedJobsData.entries()) {
      if (job.timestamp && job.timestamp < fiveMinutesAgo) {
        jobsToRemove.push(jobId);
        this.lastCheckedJobs.delete(jobId);
      }
    }

    // Remove old jobs
    jobsToRemove.forEach((jobId) => {
      this.trackedJobsData.delete(jobId);
    });

    // Also limit total jobs to prevent storage issues
    const jobEntries = Array.from(this.trackedJobsData.entries());
    if (jobEntries.length > 50) {
      // Keep only the 50 most recent jobs
      const sortedJobs = jobEntries.sort(
        (a, b) => (b[1].timestamp || 0) - (a[1].timestamp || 0)
      );
      const jobsToKeep = sortedJobs.slice(0, 50);

      this.trackedJobsData.clear();
      jobsToKeep.forEach(([key, value]) => {
        this.trackedJobsData.set(key, value);
      });
    }

    // Save updated data
    if (jobsToRemove.length > 0 || jobEntries.length > 50) {
      this.saveSettings();
    }
  }

  async handleJobsFromPage(jobs, pageUrl, sendResponse) {
    try {
      const newJobs = this.findNewJobs(jobs);

      if (newJobs.length > 0) {
        await this.notifyNewJobs(newJobs);
        await this.sendEmailNotification(newJobs);
      }

      // Update last checked jobs
      jobs.forEach((job) => this.lastCheckedJobs.add(job.id));
      await this.saveSettings();

      sendResponse({
        success: true,
        newJobsCount: newJobs.length,
        totalJobs: jobs.length,
      });
    } catch (error) {
      console.error("Error handling jobs from page:", error);
      sendResponse({
        success: false,
        error: error.message,
      });
    }
  }

  processExtractedJobs(jobs) {
    // Process jobs extracted by content script
    // Filter out null jobs (jobs that don't meet the under 10 minutes criteria)
    const validJobs = jobs.filter((job) => job !== null);
    const newJobs = this.findNewJobs(validJobs);

    console.log(
      `🔍 Found ${newJobs.length} new jobs under 10 minutes from content script`
    );

    if (newJobs.length > 0) {
      console.log(
        "🎉 New jobs under 10 minutes detected:",
        newJobs.map((job) => job.title)
      );
      this.notifyNewJobs(newJobs);
      this.sendEmailNotification(newJobs);

      // Notify all content scripts about new jobs
      this.notifyContentScripts(newJobs);
    }

    // Update last checked jobs and store job data
    validJobs.forEach((job) => {
      this.lastCheckedJobs.add(job.id);
      this.trackedJobsData.set(job.id, job);
    });

    // Save immediately to ensure persistence
    this.saveSettings();
  }
}

// Initialize the notifier when the service worker starts
const notifier = new UpworkJobNotifier();
