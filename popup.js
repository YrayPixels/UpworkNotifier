// Popup script for Upwork Job Notifier
class PopupManager {
  constructor() {
    this.elements = {};
    this.settings = {};
    this.init();
  }

  init() {
    this.cacheElements();
    this.bindEvents();
    this.loadSettings();
    this.checkPermissions();
  }

  cacheElements() {
    this.elements = {
      status: document.getElementById('status'),
      lastCheck: document.getElementById('lastCheck'),
      jobsTracked: document.getElementById('jobsTracked'),
      notificationToggle: document.getElementById('notificationToggle'),
      emailToggle: document.getElementById('emailToggle'),
      aiToggle: document.getElementById('aiToggle'),
      checkInterval: document.getElementById('checkInterval'),
      emailAddress: document.getElementById('emailAddress'),
      openaiApiKey: document.getElementById('openaiApiKey'),
      testApiKey: document.getElementById('testApiKey'),
      clearApiKey: document.getElementById('clearApiKey'),
      apiKeyStatus: document.getElementById('apiKeyStatus'),
      checkNow: document.getElementById('checkNow'),
      saveSettings: document.getElementById('saveSettings'),
      testExtraction: document.getElementById('testExtraction'),
      loading: document.getElementById('loading'),
      message: document.getElementById('message')
    };
  }

  bindEvents() {
    // Toggle switches
    this.elements.notificationToggle.addEventListener('click', () => {
      this.toggleSwitch(this.elements.notificationToggle);
      this.updateSettings();
    });

    this.elements.emailToggle.addEventListener('click', () => {
      this.toggleSwitch(this.elements.emailToggle);
      this.updateSettings();
    });

    this.elements.aiToggle.addEventListener('click', () => {
      this.toggleSwitch(this.elements.aiToggle);
      this.updateSettings();
    });

    // Buttons
    this.elements.checkNow.addEventListener('click', () => {
      this.checkNow();
    });

    this.elements.saveSettings.addEventListener('click', () => {
      this.saveSettings();
    });

    this.elements.testExtraction.addEventListener("click", () => {
      this.testExtraction();
    });

    // Form inputs
    this.elements.checkInterval.addEventListener('change', () => {
      this.updateSettings();
    });

    this.elements.emailAddress.addEventListener('input', () => {
      this.updateSettings();
    });

    this.elements.openaiApiKey.addEventListener('input', () => {
      this.updateSettings();
    });

    // Test API key button
    this.elements.testApiKey.addEventListener('click', () => {
      this.testApiKey();
    });

    // Clear API key button
    this.elements.clearApiKey.addEventListener('click', () => {
      this.clearApiKey();
    });
  }

  async loadSettings() {
    try {
      const response = await chrome.runtime.sendMessage({ action: 'getStatus' });
      
      if (response) {
        this.settings = response;
        this.updateUI();
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.showMessage('Error loading settings', 'error');
    }
  }

  updateUI() {
    // Update status
    this.elements.status.textContent = this.settings.isEnabled ? 'Active' : 'Inactive';
    this.elements.status.style.color = this.settings.isEnabled ? '#28a745' : '#dc3545';

    // Update last check time
    if (this.settings.lastCheckedCount !== undefined) {
      this.elements.jobsTracked.textContent = this.settings.lastCheckedCount;
    }

    // Update toggle switches
    this.updateToggleSwitch(this.elements.notificationToggle, this.settings.isEnabled);
    this.updateToggleSwitch(this.elements.emailToggle, this.settings.emailSettings?.enabled || false);
    this.updateToggleSwitch(this.elements.aiToggle, this.settings.openAISettings?.enabled || false);

    // Update form inputs
    if (this.settings.checkInterval) {
      this.elements.checkInterval.value = Math.floor(this.settings.checkInterval / (60 * 1000));
    }

    if (this.settings.emailSettings?.email) {
      this.elements.emailAddress.value = this.settings.emailSettings.email;
    }

    if (this.settings.openAISettings?.apiKey) {
      this.elements.openaiApiKey.value = this.settings.openAISettings.apiKey;
    }
  }

  updateToggleSwitch(element, isActive) {
    if (isActive) {
      element.classList.add('active');
    } else {
      element.classList.remove('active');
    }
  }

  toggleSwitch(element) {
    element.classList.toggle('active');
  }

  async updateSettings() {
    const isEnabled = this.elements.notificationToggle.classList.contains('active');
    const emailEnabled = this.elements.emailToggle.classList.contains('active');
    const aiEnabled = this.elements.aiToggle.classList.contains('active');
    const checkInterval = parseInt(this.elements.checkInterval.value) * 60 * 1000; // Convert to milliseconds
    const emailAddress = this.elements.emailAddress.value;
    const openaiApiKey = this.elements.openaiApiKey.value;

    this.settings = {
      ...this.settings,
      isEnabled,
      checkInterval,
      emailSettings: {
        ...this.settings.emailSettings,
        enabled: emailEnabled,
        email: emailAddress
      },
      openAISettings: {
        ...this.settings.openAISettings,
        enabled: aiEnabled,
        apiKey: openaiApiKey
      }
    };
  }

  async saveSettings() {
    try {
      this.showLoading(true);
      
      await this.updateSettings();
      
      const response = await chrome.runtime.sendMessage({
        action: 'updateSettings',
        checkInterval: this.settings.checkInterval,
        emailSettings: this.settings.emailSettings,
        openAISettings: this.settings.openAISettings
      });

      if (response && response.success) {
        this.showMessage('Settings saved successfully!', 'success');
        // Clear API key status after saving
        this.elements.apiKeyStatus.textContent = '';
        this.elements.apiKeyStatus.className = '';
      } else {
        this.showMessage('Error saving settings', 'error');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      this.showMessage('Error saving settings', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async testApiKey() {
    const apiKey = this.elements.openaiApiKey.value.trim();
    
    if (!apiKey) {
      this.showApiKeyStatus('Please enter an API key first', 'error');
      return;
    }

    if (!apiKey.startsWith('sk-')) {
      this.showApiKeyStatus('Invalid API key format. Should start with "sk-"', 'error');
      return;
    }

    try {
      this.elements.testApiKey.disabled = true;
      this.elements.testApiKey.textContent = '🧪 Testing...';
      this.showApiKeyStatus('Testing API key...', 'info');
      
      const response = await chrome.runtime.sendMessage({
        action: 'testApiKey',
        apiKey: apiKey
      });

      if (response && response.success) {
        this.showApiKeyStatus('✅ API key is valid!', 'success');
        this.elements.testApiKey.textContent = '✅ Valid';
        this.elements.testApiKey.style.background = '#28a745';
        this.elements.testApiKey.style.color = 'white';
        
        // Reset button after 3 seconds
        setTimeout(() => {
          this.elements.testApiKey.textContent = '🧪 Test API Key';
          this.elements.testApiKey.style.background = '';
          this.elements.testApiKey.style.color = '';
          this.elements.testApiKey.disabled = false;
        }, 3000);
      } else {
        this.showApiKeyStatus('❌ API key test failed: ' + (response?.error || 'Unknown error'), 'error');
        this.elements.testApiKey.textContent = '❌ Failed';
        this.elements.testApiKey.style.background = '#dc3545';
        this.elements.testApiKey.style.color = 'white';
        
        // Reset button after 3 seconds
        setTimeout(() => {
          this.elements.testApiKey.textContent = '🧪 Test API Key';
          this.elements.testApiKey.style.background = '';
          this.elements.testApiKey.style.color = '';
          this.elements.testApiKey.disabled = false;
        }, 3000);
      }
    } catch (error) {
      console.error('Error testing API key:', error);
      this.showApiKeyStatus('❌ Error testing API key: ' + error.message, 'error');
      this.elements.testApiKey.textContent = '🧪 Test API Key';
      this.elements.testApiKey.disabled = false;
    }
  }

  showApiKeyStatus(message, type) {
    this.elements.apiKeyStatus.textContent = message;
    this.elements.apiKeyStatus.className = type;
    
    // Clear status after 5 seconds for success/info, keep error messages longer
    if (type !== 'error') {
      setTimeout(() => {
        this.elements.apiKeyStatus.textContent = '';
        this.elements.apiKeyStatus.className = '';
      }, 5000);
    }
  }

  clearApiKey() {
    this.elements.openaiApiKey.value = '';
    this.elements.apiKeyStatus.textContent = '';
    this.elements.apiKeyStatus.className = '';
    this.showMessage('API key cleared', 'success');
    
    // Update settings to disable AI proposals if API key is cleared
    if (this.settings.openAISettings?.enabled) {
      this.elements.aiToggle.classList.remove('active');
      this.updateSettings();
    }
  }

  async testExtraction() {
    try {
      this.showLoading(true);
      this.elements.testExtraction.disabled = true;
      this.elements.testExtraction.textContent = '🧪 Testing...';
      
      // Get the current active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      console.log('🔍 Current tab:', {
        id: tab.id,
        url: tab.url,
        title: tab.title,
        status: tab.status
      });
      
      if (!tab.url.includes('upwork.com')) {
        this.showMessage('Please navigate to an Upwork job page first', 'error');
        return;
      }
      
      // Check if we can access the tab
      if (tab.status !== 'complete') {
        this.showMessage('Page is still loading. Please wait for the page to fully load and try again.', 'error');
        return;
      }
      
      // Check if content script is loaded by trying to inject it first
      try {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ['content.js']
        });
        console.log('✅ Content script injected successfully');
      } catch (injectError) {
        console.log('⚠️ Content script injection failed, trying direct message...');
      }
      
      // Wait a moment for the script to initialize
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Try to send message to content script
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { action: 'testExtraction' });
      } catch (messageError) {
        if (messageError.message.includes('Receiving end does not exist')) {
          // Content script not loaded, try to inject and retry
          console.log('🔄 Content script not loaded, injecting and retrying...');
          
          try {
            await chrome.scripting.executeScript({
              target: { tabId: tab.id },
              files: ['content.js']
            });
            
            // Wait for script to initialize
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Try again
            response = await chrome.tabs.sendMessage(tab.id, { action: 'testExtraction' });
          } catch (retryError) {
            throw new Error('Failed to load content script after retry: ' + retryError.message);
          }
        } else {
          throw messageError;
        }
      }
      
      if (response && response.success) {
        this.showMessage('Job extraction test completed! Check console for details.', 'success');
      } else {
        this.showMessage('Job extraction test failed: ' + (response?.error || 'Unknown error'), 'error');
      }
    } catch (error) {
      console.error('Error testing extraction:', error);
      
      let userMessage = 'Error testing extraction: ' + error.message;
      
      // Provide more helpful error messages
      if (error.message.includes('Receiving end does not exist')) {
        userMessage = 'Content script not loaded. Please refresh the page and try again.';
      } else if (error.message.includes('Cannot access')) {
        userMessage = 'Cannot access this page. Please ensure you are on an Upwork job page.';
      } else if (error.message.includes('Failed to load content script')) {
        userMessage = 'Failed to load extension script. Please refresh the page and try again.';
      }
      
      this.showMessage(userMessage, 'error');
      
      // Try alternative approach - inject script directly and execute
      console.log('🔄 Trying alternative approach with direct script injection...');
      try {
        const result = await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: this.performExtractionTest
        });
        
        if (result && result[0] && result[0].result) {
          this.showMessage('Alternative extraction test completed! Check console for details.', 'success');
          console.log('✅ Alternative extraction result:', result[0].result);
        }
      } catch (altError) {
        console.log('⚠️ Alternative approach also failed:', altError);
      }
    } finally {
      this.showLoading(false);
      this.elements.testExtraction.disabled = false;
      this.elements.testExtraction.textContent = '🧪 Test Job Extraction';
    }
  }

    // Function to be injected into the page for extraction testing
  performExtractionTest() {
    try {
      console.log('🧪 Performing extraction test directly in page context...');
      
      // Basic extraction logic that runs in the page context
      const pageInfo = {
        url: window.location.href,
        title: document.title,
        description: '',
        budget: '',
        skills: []
      };
      
      // Try to find job description
      const descriptionSelectors = [
        '[data-test="job-description"]',
        '.job-description',
        '.description',
        '[class*="description"]',
        '[class*="content"]',
        'main',
        'article'
      ];
      
      for (const selector of descriptionSelectors) {
        const element = document.querySelector(selector);
        if (element) {
          const text = element.textContent.trim();
          if (text.length > 100 && text.length < 5000) {
            pageInfo.description = text.substring(0, 200) + '...';
            break;
          }
        }
      }
      
      // Try to find budget
      const allText = document.body.textContent;
      const budgetMatch = allText.match(/\$[\d,]+/);
      if (budgetMatch) {
        pageInfo.budget = budgetMatch[0];
      }
      
      // Try to find skills
      const skillElements = document.querySelectorAll('.air3-token, [class*="skill"], [class*="tag"]');
      if (skillElements.length > 0) {
        pageInfo.skills = Array.from(skillElements).map(el => el.textContent.trim()).filter(text => text.length > 0).slice(0, 5);
      }
      
      console.log('📋 Page extraction results:', pageInfo);
      return pageInfo;
      
    } catch (error) {
      console.error('❌ Error in page context extraction:', error);
      return { error: error.message };
    }
  }

  // Check extension permissions and provide guidance
  async checkPermissions() {
    try {
      const permissions = await chrome.permissions.getAll();
      console.log('🔐 Extension permissions:', permissions);
      
      // Check if we have the necessary permissions
      const hasScripting = permissions.permissions.includes('scripting');
      const hasActiveTab = permissions.permissions.includes('activeTab');
      
      if (!hasScripting || !hasActiveTab) {
        console.warn('⚠️ Missing required permissions for job extraction testing');
        this.elements.testExtraction.style.opacity = '0.5';
        this.elements.testExtraction.title = 'Missing permissions: scripting, activeTab';
      }
    } catch (error) {
      console.error('Error checking permissions:', error);
    }
  }

  async checkNow() {
    try {
      this.showLoading(true);
      
      const response = await chrome.runtime.sendMessage({ action: 'checkNow' });
      
      if (response && response.success) {
        this.showMessage('Checking for new jobs...', 'success');
        
        // Refresh the status after a short delay
        setTimeout(() => {
          this.loadSettings();
        }, 2000);
      } else {
        this.showMessage('Error checking for jobs', 'error');
      }
    } catch (error) {
      console.error('Error checking for jobs:', error);
      this.showMessage('Error checking for jobs', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    this.elements.loading.style.display = show ? 'block' : 'none';
  }

  showMessage(text, type = 'success') {
    this.elements.message.textContent = text;
    this.elements.message.className = type;
    
    // Clear message after 3 seconds
    setTimeout(() => {
      this.elements.message.textContent = '';
      this.elements.message.className = '';
    }, 3000);
  }

  // Helper method to format time
  formatTime(timestamp) {
    if (!timestamp) return '-';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Less than 1 minute
      return 'Just now';
    } else if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diff < 86400000) { // Less than 1 day
      const hours = Math.floor(diff / 3600000);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString();
    }
  }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  const popup = new PopupManager();
}); 