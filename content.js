// Content script for Upwork Job Notifier
console.log("🚀 Upwork Content Script Loading...");

// CV data directly embedded in this file
const CV_DATA = `Moses Erhinyodavwe  
moseserhinyodavwe2@gmail.com 08132532430 
linkedin.com/in/moses-erhinyodavwe-6b52b116a 

Summary 
Hey there! I'm Moses Erhinyodavwe, a passionate problem solver and software developer. With a knack for probleming solving, I've had the pleasure of working on diverse projects, both independently and as a team player. 

As a Full Stack Developer at Silex Secure Lab, I lead a dynamic team in delivering top-notch products for clients. Whether it's converting Figma designs into high-quality code, managing databases, or designing intuitive user interfaces, I thrive on the exciting intersection of creativity and technology. 

My journey includes contributing my skills to impactful projects like the National University Commission's data reporting and analytical application and building e-commerce platforms such as GalleryBebe and GAPA AUTO PARTS. I am an expert in frontend and backend development, utilizing tools like ReactJS, Laravel, and MySQL to craft seamless and robust systems. 

Experience 

Senior Software Engineer
PixelDat
PixelDat is a web3 company that is the Gaming section of solana, they are focused in building high scalable solana dApps and games.
April 2024 - Present

- Implemented figma designs to code, with high precision and accuracy.
- Designed and implemented the work flow for the telegram bot of their product, PUMPMILITIA.
- Implemented Email Template Design.
- I wrote scalable and secure smart contracts on the solana blockchain network.
-  I wrote smart contracts to handle pre-sale and also a whitelist-gated sale.
- I built this website from start to finish https://www.pumpmilitia.io/.

Tools Used: NextJs, ReactJs, Redux, Typescript, MaterialUI, TailwindCss, Rust, Anchor, SolanaWeb3js, MetaPlex and SolanaSpl Library.

Software Engineer
Monirates 
Monirate is a fintech company that focuses on bridging the gap in cross border payments by providing liquidity and interface for cross border payments.
Sep 2023 - April 2024
I worked as an all systems Frontend Engineer, working both on mobile applications and also web applications.
Designed an Emailing Template for Internal Mailing and marketing mails that increased sales by 50%. 
Implemented the CRM tool that helped increase sales.
Worked with the backend team to provide an easily navigable dashboard for the admin to track applications data

Tools Used: NextJs, ReactJs, Redux, Typescript, MaterialUI, TailwindCss.

Senior Software Engineer
Ynet Interactive 
Ynet Interactive is a company that works with other companies to help build custom applications for them and provide them support. Ynet projects are across different areas Although they have their own product a CRM tool CallSavvy

Backend Engineer-Ynet (Insure.IO)
Feb 2024 - May 2024 
- Designed a persistent layer for authentication and Verification. 
-Designed a role based navigation for the site that is powered by Laravel middleware classes 

Fullstack Engineer-Ynet (CallSavvy)
Nov 2023 - May 2024
Designed the UI for CallSavvy Calendar Scheduling system 
- Implemented chat system with both Instagram and Twitter API. 
- Implemented full AI chat improved system 

Fullstack Engineer-Ynet (Medic360)
Nov 2023 - Jan 2024 (3 months) 
- Working closely with the CTO to create custom product and provide support to applications - Designed and built Emergency response management system for Medic360 app: This process included consuming and creating API's for the mobile app using Cordova 
Team Lead-Arik
SILEX SECURE LAB LTD 
Nov 2022 - Dec 2023 (1 year 2 months) 
I worked with junior team members to review and edit their code, create and design systems, provide mental and technical support to team members and help with project Management 
- Designed and implemented the figma design to Code. 
- Created API's that I used for the implementation 
- Optimized the Endpoints and application to increase load time and reaction by 20%> 
Team Lead-GalleryBebe 
Jan 2023 - Nov 2023 (11 months) 
Full Stack Engineer- National University Commission 
Dec 2022 - Nov 2023 (1 year) 

Full Stack Developer-GAPA 
Nov 2022 - May 2023 (7 months) 
I worked as an all time staff and while working based on tasks worked on. Worked with a team to deliver top notch products for clients who engage the services of the company. 
-implemented instant email notification and increased sales by 10%. 
-optimized the warehouse modules and increased store inventory by 100%. 
- Designed and created the accounting module to make accounting and calculations for the accountant by a glance very easy. 
Tools I used here include FrontEnd Stacks and BackEnd Stacks such as Laravel and PHP. Created and Consumed REST API's, while implementing top notch security Algo 

Education 
University of Ilorin 
B.forestry and wildlife, Forest Management/Forest Resources Management (Sep 2016 - Sep 2021)
Holberton School 
Computer Software Engineering 
Jun 2022 - Aug 2024 

Turbine Builders Cohort
Expert in Rust and Anchor
Jun- Aug 2 024 
Licenses & Certifications 
Complete JavaScript, XML, AJAX and React Bootcamp - Hands-On - YouAccel UC-c0222f79-9fb2-4cad-b28c-cda3ca035b7d 
Introduction to FrontEnd Development - Coursera Course Certificates PUVDEQMHNFG9 
Introduction to Backend Development - Coursera Course Certificates WM2QVDQ26P8E 

Skills 
MySQL   •   React   •   Web Technologies   •   Application Development   •   Mobile Applications   •   React Native   •   Node.js   •   Tailwind CSS   •   REST APIs   •   Twilo`;

class UpworkContentScript {
  constructor() {
    console.log("🔧 UpworkContentScript constructor called");
    this.jobData = [];
    this.observer = null;
    this.floatingButton = null;
    this.aiProposalButton = null;
    this.cvData = null;
    this.init();
  }

  init() {
    console.log("🚀 UpworkContentScript initializing...");
    console.log("🔍 Current page:", window.location.href);
    console.log("🔍 Document ready state:", document.readyState);

    // Wait for page to load
    if (document.readyState === "loading") {
      console.log("⏳ Page still loading, waiting for DOMContentLoaded...");
      document.addEventListener("DOMContentLoaded", () => {
        console.log("✅ DOMContentLoaded fired, creating buttons...");
        this.createButtons();
      });
    } else {
      console.log("✅ Page already loaded, creating buttons immediately...");
      this.createButtons();
    }

    // Also try to create buttons after a delay as backup
    setTimeout(() => {
      if (!this.floatingButton || !this.aiProposalButton) {
        console.log("🔄 Backup button creation after timeout...");
        this.createButtons();
      }
    }, 3000);

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.action === "extractJobs") {
        const jobs = this.extractJobsFromPage();
        sendResponse({ jobs });
      } else if (request.action === "newJobsFound") {
        // Refresh the jobs panel when new jobs are found
        this.populateJobsPanel();
        console.log("🔄 Jobs panel refreshed due to new jobs");
      } else if (request.action === "testExtraction") {
        // Test job extraction on current page
        this.testJobExtraction();
        return true; // Keep message channel open for async response
      }
    });
  }

  createButtons() {
    console.log("🔧 Creating buttons...");

    try {
      this.startMonitoring();
      this.createFloatingButton();
      this.createAIProposalButton();
      this.loadCVData();

      console.log("✅ Buttons created successfully");
      console.log(
        "  - Floating button:",
        this.floatingButton ? "✅ Created" : "❌ Failed"
      );
      console.log(
        "  - AI button:",
        this.aiProposalButton ? "✅ Created" : "❌ Failed"
      );
    } catch (error) {
      console.error("❌ Error creating buttons:", error);

      // Retry after a short delay
      setTimeout(() => {
        console.log("🔄 Retrying button creation...");
        this.createButtons();
      }, 1000);
    }
  }

  // Manual button creation method for testing
  manualCreateButtons() {
    console.log("🔧 Manual button creation called...");
    this.createButtons();
  }

  createFloatingButton() {
    // Only show on Upwork pages
    if (!window.location.hostname.includes("upwork.com")) {
      console.log("⚠️ Not on Upwork page, skipping floating button creation");
      return;
    }

    console.log("🔧 Creating floating button...");

    // Create floating button
    this.floatingButton = document.createElement("div");
    this.floatingButton.id = "upwork-notifier-floating-btn";
    this.floatingButton.innerHTML = `
      <div class="floating-btn-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span class="floating-btn-text">Check Jobs</span>
      </div>
      <div class="floating-jobs-panel" style="display: none;">
        <div class="jobs-panel-header">
          <h3>Tracked Jobs</h3>
          <button class="close-panel-btn">×</button>
        </div>
        <div class="jobs-list"></div>
      </div>
    `;

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      #upwork-notifier-floating-btn {
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 50%;
        box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
        cursor: pointer;
        z-index: 10000;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: none;
        outline: none;
      }

      #upwork-notifier-floating-btn:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
      }

      #upwork-notifier-floating-btn:active {
        transform: translateY(0) scale(0.95);
      }

      .floating-btn-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        height: 100%;
      }

      .floating-btn-text {
        font-size: 8px;
        font-weight: 600;
        margin-top: 2px;
        line-height: 1;
      }

      #upwork-notifier-floating-btn.loading {
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }

      #upwork-notifier-floating-btn.success {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      }

      #upwork-notifier-floating-btn.error {
        background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
      }

      /* Jobs Panel */
      .floating-jobs-panel {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 400px;
        max-height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10001;
        overflow: hidden;
        border: 1px solid #e1e5e9;
      }

      .jobs-panel-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }

      .jobs-panel-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .close-panel-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s;
      }

      .close-panel-btn:hover {
        background: rgba(255,255,255,0.2);
      }

      .jobs-list {
        max-height: 400px;
        overflow-y: auto;
        padding: 0;
      }

      .job-item {
        padding: 15px 20px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        transition: background 0.3s;
      }

      .job-item:hover {
        background: #f8f9fa;
      }

      .job-item:last-child {
        border-bottom: none;
      }

      .job-title {
        font-weight: 600;
        color: #333;
        margin-bottom: 5px;
        font-size: 14px;
        line-height: 1.3;
      }

      .job-budget {
        color: #667eea;
        font-weight: 500;
        font-size: 12px;
        margin-bottom: 3px;
      }

      .job-type {
        color: #666;
        font-size: 11px;
        margin-bottom: 3px;
      }

      .job-posted {
        color: #999;
        font-size: 10px;
      }

      .no-jobs {
        padding: 30px 20px;
        text-align: center;
        color: #666;
        font-size: 14px;
      }

      .new-job {
        background: linear-gradient(135deg, #e8f5e8 0%, #f0f8f0 100%);
        border-left: 4px solid #28a745;
      }

      .new-badge {
        position: absolute;
        top: 10px;
        right: 15px;
        background: #28a745;
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        text-transform: uppercase;
      }

      .job-item {
        position: relative;
      }

      /* Notification tooltip */
      .floating-btn-tooltip {
        position: absolute;
        bottom: 70px;
        right: 0;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 8px 12px;
        border-radius: 6px;
        font-size: 12px;
        white-space: nowrap;
        opacity: 0;
        transform: translateY(10px);
        transition: all 0.3s ease;
        pointer-events: none;
        z-index: 10001;
      }

      .floating-btn-tooltip.show {
        opacity: 1;
        transform: translateY(0);
      }

      .floating-btn-tooltip::after {
        content: '';
        position: absolute;
        top: 100%;
        right: 20px;
        border: 5px solid transparent;
        border-top-color: rgba(0, 0, 0, 0.8);
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(this.floatingButton);

    // Add click event
    this.floatingButton.addEventListener("click", () => {
      this.handleFloatingButtonClick();
    });

    // Add close panel event
    const closeBtn = this.floatingButton.querySelector(".close-panel-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hideJobsPanel();
      });
    }

    // Add hover tooltip
    this.floatingButton.addEventListener("mouseenter", () => {
      this.showTooltip("Click to check for new jobs");
    });

    this.floatingButton.addEventListener("mouseleave", () => {
      this.hideTooltip();
    });

    // Special styling for most-recent page
    if (window.location.pathname.includes("/nx/find-work/most-recent")) {
      this.floatingButton.style.background =
        "linear-gradient(135deg, #28a745 0%, #20c997 100%)";
      this.floatingButton.querySelector(".floating-btn-text").textContent =
        "Check Now";
    }

    console.log("✅ Floating button created and added to page");
  }

  createAIProposalButton() {
    // Only show on Upwork job application pages (not job finding pages)
    if (
      !window.location.hostname.includes("upwork.com") ||
      !window.location.pathname.includes("/nx/proposals/job/")
    ) {
      return;
    }

    // Create floating button
    this.aiProposalButton = document.createElement("div");
    this.aiProposalButton.id = "upwork-notifier-ai-proposal-btn";
    this.aiProposalButton.innerHTML = `
      <div class="floating-btn-content">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span class="floating-btn-text">AI Cover Letter</span>
      </div>
      <div class="floating-ai-proposal-panel" style="display: none;">
        <div class="ai-proposal-header">
          <h3>AI Cover Letter Generator</h3>
          <button class="close-panel-btn">×</button>
        </div>
        <div class="ai-proposal-content"></div>
      </div>
    `;

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
                   #upwork-notifier-ai-proposal-btn {
        position: fixed;
        bottom: 110px;
        right: 30px;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #4CAF50 0%, #45B649 100%);
        border-radius: 50%;
        box-shadow: 0 4px 20px rgba(76, 175, 80, 0.4);
        cursor: pointer;
        z-index: 10000;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        border: none;
        outline: none;
        animation: float 3s ease-in-out infinite;
      }

      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-5px); }
      }

      #upwork-notifier-ai-proposal-btn:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: 0 6px 25px rgba(76, 175, 80, 0.6);
        animation: none;
      }

      #upwork-notifier-ai-proposal-btn:active {
        transform: translateY(0) scale(0.95);
      }

      #upwork-notifier-ai-proposal-btn::before {
        content: '🤖';
        position: absolute;
        top: -8px;
        right: -8px;
        background: #ff6b6b;
        color: white;
        border-radius: 50%;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        animation: pulse 2s infinite;
      }

      .floating-btn-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        width: 100%;
        height: 100%;
      }

      .floating-btn-text {
        font-size: 8px;
        font-weight: 600;
        margin-top: 2px;
        line-height: 1;
      }

      #upwork-notifier-ai-proposal-btn.loading {
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }

      #upwork-notifier-ai-proposal-btn.success {
        background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
      }

      #upwork-notifier-ai-proposal-btn.error {
        background: linear-gradient(135deg, #dc3545 0%, #fd7e14 100%);
      }

      /* AI Proposal Panel */
      .floating-ai-proposal-panel {
        position: absolute;
        bottom: 70px;
        right: 0;
        width: 400px;
        max-height: 500px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        z-index: 10001;
        overflow: hidden;
        border: 1px solid #e1e5e9;
      }

      .ai-proposal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15px 20px;
        background: linear-gradient(135deg, #4CAF50 0%, #45B649 100%);
        color: white;
      }

      .ai-proposal-header h3 {
        margin: 0;
        font-size: 16px;
        font-weight: 600;
      }

      .close-panel-btn {
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: background 0.3s;
      }

      .close-panel-btn:hover {
        background: rgba(255,255,255,0.2);
      }

      .ai-proposal-content {
        padding: 20px;
        overflow-y: auto;
        max-height: 400px;
      }

      .ai-proposal-content p {
        margin-bottom: 15px;
        line-height: 1.6;
        font-size: 14px;
      }

      .ai-proposal-content strong {
        color: #333;
      }

      .ai-proposal-content .job-details {
        margin-top: 20px;
        padding-top: 15px;
        border-top: 1px dashed #eee;
      }

      .ai-proposal-content .job-details h4 {
        margin-top: 0;
        margin-bottom: 10px;
        font-size: 15px;
        color: #555;
      }

      .ai-proposal-content .job-details p {
        margin-bottom: 5px;
        font-size: 13px;
        color: #666;
      }

      .ai-proposal-content .job-details .job-title {
        font-size: 16px;
        color: #333;
        margin-bottom: 5px;
      }

      .ai-proposal-content .job-details .job-budget {
        color: #4CAF50;
        font-weight: 500;
        font-size: 14px;
        margin-bottom: 3px;
      }

      .ai-proposal-content .job-details .job-type {
        color: #555;
        font-size: 12px;
        margin-bottom: 3px;
      }

      .ai-proposal-content .job-details .job-posted {
        color: #999;
        font-size: 11px;
      }

      .ai-proposal-content .job-details .new-badge {
        position: absolute;
        top: 10px;
        right: 15px;
        background: #28a745;
        color: white;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 10px;
        text-transform: uppercase;
      }

      /* Insert Button Styles */
      #insert-cover-letter-btn {
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
      }

      #insert-cover-letter-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
      }

      #insert-cover-letter-btn:active {
        transform: translateY(0);
      }

      #insert-cover-letter-btn:disabled {
        cursor: not-allowed;
        opacity: 0.8;
      }

      /* Success and Error States */
      #insert-cover-letter-btn.success {
        background: #28a745 !important;
        animation: pulse 1s ease-in-out;
      }

      #insert-cover-letter-btn.error {
        background: #dc3545 !important;
        animation: shake 0.5s ease-in-out;
      }

      @keyframes pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-5px); }
        75% { transform: translateX(5px); }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(this.aiProposalButton);

    // Add click event
    this.aiProposalButton.addEventListener("click", () => {
      this.handleAIProposalButtonClick();
    });

    // Add close panel event
    const closeBtn = this.aiProposalButton.querySelector(".close-panel-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        this.hideAIProposalPanel();
      });
    }

    // Add hover tooltip
    this.aiProposalButton.addEventListener("mouseenter", () => {
      this.showTooltip("Click to generate AI cover letter");
    });

    this.aiProposalButton.addEventListener("mouseleave", () => {
      this.hideTooltip();
    });
  }

  showTooltip(message) {
    // Remove existing tooltip
    const existingTooltip = document.querySelector(".floating-btn-tooltip");
    if (existingTooltip) {
      existingTooltip.remove();
    }

    // Create new tooltip
    const tooltip = document.createElement("div");
    tooltip.className = "floating-btn-tooltip";
    tooltip.textContent = message;

    this.floatingButton.appendChild(tooltip);

    // Show tooltip
    setTimeout(() => {
      tooltip.classList.add("show");
    }, 10);
  }

  hideTooltip() {
    const tooltip = document.querySelector(".floating-btn-tooltip");
    if (tooltip) {
      tooltip.classList.remove("show");
      setTimeout(() => {
        tooltip.remove();
      }, 300);
    }
  }

  async handleFloatingButtonClick() {
    try {
      // Check if panel is already open
      const panel = this.floatingButton.querySelector(".floating-jobs-panel");
      if (panel && panel.style.display !== "none") {
        this.hideJobsPanel();
        return;
      }

      // Show jobs panel first
      this.showJobsPanel();

      // Add loading state
      this.floatingButton.classList.add("loading");
      this.floatingButton.classList.remove("success", "error");

      // Extract current jobs
      const currentJobs = this.extractJobsFromPage();

      // Send to background script for comparison
      const response = await chrome.runtime.sendMessage({
        action: "checkJobsFromPage",
        jobs: currentJobs,
        pageUrl: window.location.href,
      });

      if (response && response.success) {
        // Show success state
        this.floatingButton.classList.remove("loading");
        this.floatingButton.classList.add("success");

        if (response.newJobsCount > 0) {
          this.showTooltip(
            `Found ${response.newJobsCount} new job${
              response.newJobsCount > 1 ? "s" : ""
            }!`
          );
          // Immediately refresh the jobs panel to show new jobs
          this.populateJobsPanel();
        } else {
          this.showTooltip("No new jobs found");
        }

        // Reset to normal state after 2 seconds
        setTimeout(() => {
          this.floatingButton.classList.remove("success");
        }, 2000);
      } else {
        throw new Error("Failed to check jobs");
      }
    } catch (error) {
      console.error("Error checking jobs:", error);

      // Show error state
      this.floatingButton.classList.remove("loading");
      this.floatingButton.classList.add("error");
      this.showTooltip("Error checking jobs");

      // Reset to normal state after 2 seconds
      setTimeout(() => {
        this.floatingButton.classList.remove("error");
      }, 2000);
    }
  }

  async handleAIProposalButtonClick() {
    try {
      // Check if panel is already open
      const panel = this.aiProposalButton.querySelector(
        ".floating-ai-proposal-panel"
      );
      if (panel && panel.style.display !== "none") {
        this.hideAIProposalPanel();
        return;
      }

      // Show AI proposal panel first
      this.showAIProposalPanel();

      // Add loading state
      this.aiProposalButton.classList.add("loading");
      this.aiProposalButton.classList.remove("success", "error");

      // Check if CV data is available
      if (!this.cvData) {
        throw new Error(
          "CV data not loaded. Please ensure cv.txt file is present."
        );
      }

      console.log("🔍 Starting AI proposal generation...");

      // Get job details from the current page
      const job = this.extractJobDataFromApplicationPage();
      console.log("📋 Extracted job data:", job);

      if (!job || !job.title || job.title === "Job Title Not Found") {
        throw new Error(
          "Could not find job details to draft proposal. Please ensure you are on a job application page and the page has fully loaded."
        );
      }

      // Validate that we have enough data
      if (!job.description || job.description === "Description not available") {
        console.warn(
          "⚠️ Limited job description available, proposal quality may be affected"
        );
      }

      console.log("🚀 Sending job data to AI for proposal generation...");

      // Send job details to background script for AI processing
      const response = await chrome.runtime.sendMessage({
        action: "draftAIProposal",
        job: job,
        cvData: this.cvData,
      });

      if (response && response.success) {
        console.log("✅ AI proposal generated successfully");

        // Show success state
        this.aiProposalButton.classList.remove("loading");
        this.aiProposalButton.classList.add("success");

        // Display the generated proposal
        this.displayAIProposal(response.proposal);

        // Reset to normal state after 2 seconds
        setTimeout(() => {
          this.aiProposalButton.classList.remove("success");
        }, 2000);
      } else {
        throw new Error(
          "Failed to draft AI proposal: " + (response?.error || "Unknown error")
        );
      }
    } catch (error) {
      console.error("❌ Error drafting AI proposal:", error);

      // Show error state
      this.aiProposalButton.classList.remove("loading");
      this.aiProposalButton.classList.add("error");

      // Display error message in the panel
      const content = this.aiProposalButton.querySelector(
        ".ai-proposal-content"
      );
      if (content) {
        let errorMessage = error.message;
        let suggestion = "";

        // Provide helpful suggestions based on error type
        if (error.message.includes("job details")) {
          suggestion =
            "Try refreshing the page and ensuring it has fully loaded before generating a proposal.";
        } else if (error.message.includes("CV data")) {
          suggestion =
            "Please check that your CV data is properly configured in the extension.";
        } else if (error.message.includes("API")) {
          suggestion =
            "Please check your OpenAI API key in the extension settings.";
        } else {
          suggestion =
            "Please try again or check the console for more details.";
        }

        content.innerHTML = `
          <div style="color: #dc3545; text-align: center; padding: 20px;">
            <h4>❌ Error Generating Proposal</h4>
            <p><strong>Error:</strong> ${errorMessage}</p>
            <p style="font-size: 12px; margin-top: 10px; color: #666;">
              <strong>Suggestion:</strong> ${suggestion}
            </p>
            <div style="margin-top: 15px; padding: 15px; background: #f8f9fa; border-radius: 8px; text-align: left;">
              <h5 style="margin-top: 0; color: #333;">Debug Information:</h5>
              <p style="font-size: 11px; margin: 5px 0;"><strong>Page URL:</strong> ${
                window.location.href
              }</p>
              <p style="font-size: 11px; margin: 5px 0;"><strong>Page Title:</strong> ${
                document.title
              }</p>
              <p style="font-size: 11px; margin: 5px 0;"><strong>CV Data:</strong> ${
                this.cvData ? "Loaded" : "Not loaded"
              }</p>
              <p style="font-size: 11px; margin: 5px 0;"><strong>Extension Version:</strong> 2.0</p>
            </div>
          </div>
        `;
      }

      this.showTooltip("Error drafting AI proposal: " + error.message);

      // Reset to normal state after 2 seconds
      setTimeout(() => {
        this.aiProposalButton.classList.remove("error");
      }, 2000);
    }
  }

  showJobsPanel() {
    const panel = this.floatingButton.querySelector(".floating-jobs-panel");
    if (panel) {
      panel.style.display = "block";
      this.populateJobsPanel();
    }
  }

  hideJobsPanel() {
    const panel = this.floatingButton.querySelector(".floating-jobs-panel");
    if (panel) {
      panel.style.display = "none";
    }
  }

  showAIProposalPanel() {
    const panel = this.aiProposalButton.querySelector(
      ".floating-ai-proposal-panel"
    );
    if (panel) {
      panel.style.display = "block";
    }
  }

  hideAIProposalPanel() {
    const panel = this.aiProposalButton.querySelector(
      ".floating-ai-proposal-panel"
    );
    if (panel) {
      panel.style.display = "none";
    }
  }

  async populateJobsPanel() {
    const jobsList = this.floatingButton.querySelector(".jobs-list");
    if (!jobsList) return;

    try {
      // Get tracked jobs from background script
      const response = await chrome.runtime.sendMessage({
        action: "getTrackedJobs",
      });

      if (response && response.jobs && response.jobs.length > 0) {
        jobsList.innerHTML = response.jobs
          .map((job, index) => {
            // Check if this is a new job (within last 5 minutes)
            const isNew =
              job.timestamp && Date.now() - job.timestamp < 5 * 60 * 1000;
            const newClass = isNew ? "new-job" : "";

            return `
            <div class="job-item ${newClass}" onclick="window.open('${
              job.link || "#"
            }', '_blank')">
              <div class="job-title">${job.title || "Unknown Job"}</div>
              <div class="job-budget">${
                job.budget || "Budget not specified"
              }</div>
              <div class="job-type">${
                job.jobType || "Job type not specified"
              }</div>
              <div class="job-posted">${
                job.postedTime || "Posted time unknown"
              }</div>
              ${isNew ? '<div class="new-badge">NEW</div>' : ""}
            </div>
          `;
          })
          .join("");
      } else {
        jobsList.innerHTML =
          '<div class="no-jobs">No recent jobs found (older than 5 minutes are automatically cleared)</div>';
      }
    } catch (error) {
      console.error("Error populating jobs panel:", error);
      jobsList.innerHTML = '<div class="no-jobs">Error loading jobs</div>';
    }
  }

  async loadCVData() {
    try {
      // Use the CV_DATA variable that's already loaded
      this.cvData = CV_DATA;
      console.log("CV data loaded successfully");
    } catch (error) {
      console.error("Error loading CV data:", error);
      this.cvData = null;
    }
  }

  displayAIProposal(proposal) {
    const content = this.aiProposalButton.querySelector(".ai-proposal-content");
    if (content) {
      content.innerHTML = ""; // Clear previous content
      if (proposal) {
        content.innerHTML = `
          <div style="margin-bottom: 20px;">
            <h4 style="color: #333; margin-bottom: 15px; font-size: 16px;">Generated AI Proposal</h4>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; border-left: 4px solid #4CAF50; margin-bottom: 15px; max-height: 200px; overflow-y: auto;">
              <div style="white-space: pre-wrap; line-height: 1.6; font-size: 14px; color: #333; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                ${
                  proposal.fullProposal ||
                  proposal.introduction + "\n\n" + proposal.closing
                }
              </div>
            </div>
          </div>
          
          <div class="job-details">
            <h4 style="color: #555; margin-bottom: 10px; font-size: 15px;">Job Details</h4>
            <p style="margin-bottom: 5px; font-size: 13px; color: #666;"><strong>Title:</strong> ${
              proposal.jobTitle
            }</p>
            <p style="margin-bottom: 5px; font-size: 13px; color: #666;"><strong>Budget:</strong> ${
              proposal.budget
            }</p>
            <p style="margin-bottom: 5px; font-size: 13px; color: #666;"><strong>Type:</strong> ${
              proposal.jobType
            }</p>
            <p style="margin-bottom: 5px; font-size: 13px; color: #666;"><strong>Posted:</strong> ${
              proposal.postedTime
            }</p>
            ${
              proposal.skills && proposal.skills.length > 0
                ? `<p style="margin-bottom: 5px; font-size: 13px; color: #666;"><strong>Skills:</strong> ${proposal.skills.join(
                    ", "
                  )}</p>`
                : ""
            }
          </div>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee;">
            <button id="insert-cover-letter-btn" style="background: #4CAF50; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 600; width: 100%; margin-bottom: 10px;">
              📝 Insert into Cover Letter Field
            </button>
            <p style="font-size: 12px; color: #666; text-align: center;">
              <strong>Note:</strong> Click the button above to automatically insert the generated cover letter into the textarea.
            </p>
          </div>
        `;

        // Add event listener for the insert button
        const insertBtn = content.querySelector("#insert-cover-letter-btn");
        if (insertBtn) {
          insertBtn.addEventListener("click", () => {
            this.insertProposalIntoCoverLetter(
              proposal.fullProposal ||
                proposal.introduction + "\n\n" + proposal.closing
            );
          });
        }
      } else {
        content.innerHTML = "<p>No AI proposal generated yet.</p>";
      }
    }
  }

  async insertProposalIntoCoverLetter(proposalText) {
    try {
      console.log("🔍 Looking for cover letter textarea...");

      // UNIVERSAL TEXTAREA SELECTORS - Multiple fallback options
      const textareaSelectors = [
        // Primary selectors (most common)
        'textarea[aria-labelledby="cover_letter_label"]',
        'textarea[aria-labelledby*="cover"]',
        'textarea[aria-labelledby*="letter"]',
        'textarea[aria-labelledby*="proposal"]',

        // Data attribute selectors
        'textarea[data-test="cover-letter"]',
        'textarea[data-test="proposal"]',
        'textarea[data-test="message"]',
        'textarea[data-test="description"]',

        // Class-based selectors
        "textarea.cover-letter",
        "textarea.proposal",
        "textarea.message",
        "textarea.description",
        'textarea[class*="cover"]',
        'textarea[class*="letter"]',
        'textarea[class*="proposal"]',
        'textarea[class*="message"]',

        // Name and ID selectors
        'textarea[name*="cover"]',
        'textarea[name*="letter"]',
        'textarea[name*="proposal"]',
        'textarea[name*="message"]',
        'textarea[id*="cover"]',
        'textarea[id*="letter"]',
        'textarea[id*="proposal"]',
        'textarea[id*="message"]',

        // Placeholder text selectors
        'textarea[placeholder*="cover"]',
        'textarea[placeholder*="letter"]',
        'textarea[placeholder*="proposal"]',
        'textarea[placeholder*="message"]',
        'textarea[placeholder*="describe"]',
        'textarea[placeholder*="explain"]',

        // Label-based selectors
        'textarea[aria-label*="cover"]',
        'textarea[aria-label*="letter"]',
        'textarea[aria-label*="proposal"]',
        'textarea[aria-label*="message"]',
      ];

      // Helper function to find textarea with multiple selectors
      const findTextarea = () => {
        for (const selector of textareaSelectors) {
          try {
            const textarea = document.querySelector(selector);
            if (textarea && textarea.offsetParent !== null) {
              // Check if visible
              console.log("✅ Found textarea with selector:", selector);
              return textarea;
            }
          } catch (e) {
            // Skip invalid selectors
            continue;
          }
        }
        return null;
      };

      // Try to find the textarea
      let textarea = findTextarea();

      if (!textarea) {
        console.log(
          "🔍 Primary selectors failed, trying fallback approaches..."
        );

        // Fallback 1: Look for any textarea that might be the cover letter
        const allTextareas = document.querySelectorAll("textarea");
        if (allTextareas.length > 0) {
          // Filter textareas by size and position (cover letters are usually larger)
          const visibleTextareas = Array.from(allTextareas).filter(
            (t) =>
              t.offsetParent !== null && // Visible
              t.offsetHeight > 100 && // Reasonable height
              t.offsetWidth > 200 // Reasonable width
          );

          if (visibleTextareas.length > 0) {
            // Use the largest textarea (most likely to be the cover letter)
            textarea = visibleTextareas.reduce((largest, current) =>
              current.offsetHeight * current.offsetWidth >
              largest.offsetHeight * largest.offsetWidth
                ? current
                : largest
            );
            console.log("✅ Found textarea using fallback size-based approach");
          }
        }
      }

      if (textarea) {
        console.log("📝 Inserting proposal into textarea...");

        // Insert the proposal text
        textarea.value = proposalText;

        // Trigger input event to ensure Upwork recognizes the change
        textarea.dispatchEvent(new Event("input", { bubbles: true }));
        textarea.dispatchEvent(new Event("change", { bubbles: true }));

        // Show success message
        this.showTooltip("Cover letter inserted successfully! ✨");

        // Scroll to the textarea
        textarea.scrollIntoView({ behavior: "smooth", block: "center" });

        // Highlight the textarea briefly
        textarea.style.border = "2px solid #4CAF50";
        textarea.style.boxShadow = "0 0 10px rgba(76, 175, 80, 0.3)";
        setTimeout(() => {
          textarea.style.border = "";
          textarea.style.boxShadow = "";
        }, 3000);

        console.log("✅ Cover letter inserted into textarea successfully");

        // Update the button to show success state
        const insertBtn = document.querySelector("#insert-cover-letter-btn");
        if (insertBtn) {
          insertBtn.textContent = "✅ Inserted Successfully!";
          insertBtn.style.background = "#28a745";
          insertBtn.disabled = true;

          // Reset button after 3 seconds
          setTimeout(() => {
            insertBtn.textContent = "📝 Insert into Cover Letter Field";
            insertBtn.style.background = "#4CAF50";
            insertBtn.disabled = false;
          }, 3000);
        }
      } else {
        console.log("❌ No suitable textarea found");
        throw new Error(
          "No textarea found for cover letter. Please ensure you are on a job application page with a cover letter field."
        );
      }
    } catch (error) {
      console.error("❌ Error inserting cover letter:", error);
      this.showTooltip("Error inserting cover letter: " + error.message);

      // Show error state on button
      const insertBtn = document.querySelector("#insert-cover-letter-btn");
      if (insertBtn) {
        insertBtn.textContent = "❌ Error - Try Again";
        insertBtn.style.background = "#dc3545";

        // Reset button after 3 seconds
        setTimeout(() => {
          insertBtn.textContent = "📝 Insert into Cover Letter Field";
          insertBtn.style.background = "#4CAF50";
        }, 3000);
      }
    }
  }

  startMonitoring() {
    // Extract initial jobs
    this.extractJobsFromPage();

    // Set up mutation observer to watch for new jobs
    this.observer = new MutationObserver((mutations) => {
      let shouldExtract = false;

      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              // Check if new job elements were added
              if (
                this.isJobElement(node) ||
                node.querySelector('[data-test="job-tile"]')
              ) {
                shouldExtract = true;
              }
            }
          });
        }
      });

      if (shouldExtract) {
        console.log("🔄 New job elements detected, extracting...");
        setTimeout(() => this.extractJobsFromPage(), 1000);
      }
    });

    // Start observing
    this.observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Also set up periodic checking for dynamic content
    this.setupPeriodicChecking();
  }

  setupPeriodicChecking() {
    // Check for new jobs every 30 seconds while on the page
    setInterval(() => {
      if (window.location.pathname.includes("/nx/find-work/most-recent")) {
        console.log("🔄 Periodic job check on page...");
        this.extractJobsFromPage();
      }
    }, 30000); // 30 seconds
  }

  isJobElement(element) {
    const jobSelectors = [
      '[data-test="job-tile"]',
      ".job-tile",
      '[data-qa="job-tile"]',
      ".up-card-section",
    ];

    return jobSelectors.some(
      (selector) => element.matches(selector) || element.querySelector(selector)
    );
  }

  extractJobsFromPage() {
    const jobs = [];

    // Based on the actual Upwork HTML structure
    const jobSelectors = [
      'section[data-ev-sublocation="job_feed_tile"]',
      "section.air3-card-section",
      '[data-test="job-tile"]',
      ".job-tile",
    ];

    let jobElements = [];
    for (const selector of jobSelectors) {
      jobElements = document.querySelectorAll(selector);
      if (jobElements.length > 0) break;
    }

    jobElements.forEach((element, index) => {
      try {
        const job = this.extractJobData(element, index);
        if (job.title && job.id) {
          jobs.push(job);
        }
      } catch (error) {
        console.error("Error extracting job data:", error);
      }
    });

    this.jobData = jobs;

    // Send jobs to background script for automatic processing
    chrome.runtime.sendMessage({
      action: "jobsExtracted",
      jobs: jobs,
      pageUrl: window.location.href,
    });

    console.log(`📋 Extracted ${jobs.length} jobs from page`);

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

    // Extract job link - based on actual structure
    let jobLink = "";
    const linkElement = element.querySelector(
      "h3.job-tile-title a, .job-tile-title a"
    );
    if (linkElement) {
      jobLink = linkElement.href;
    }

    // Extract job skills/tags - based on actual structure
    const skillSelectors = [
      "ul.air3-token-wrap a.air3-token",
      ".air3-token-wrap a",
      '[data-test="attr-item"]',
    ];

    let skills = [];
    for (const selector of skillSelectors) {
      const skillElements = element.querySelectorAll(selector);
      if (skillElements.length > 0) {
        skills = Array.from(skillElements).map((el) => el.textContent.trim());
        break;
      }
    }

    // Extract job type and contractor tier
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

    return {
      id: jobId,
      title: title,
      budget: budget,
      description: description,
      link: jobLink,
      skills: skills,
      jobType: jobType,
      postedTime: postedTime,
      timestamp: Date.now(),
      index: index,
    };
  }

  extractJobDataFromApplicationPage() {
    try {
      console.log("🔍 Extracting job data from application page...");
      console.log("🔍 Current URL:", window.location.href);
      console.log("🔍 Page title:", document.title);

      // SIMPLE AND EFFECTIVE EXTRACTION
      let title = "";
      let description = "";
      let budget = "";
      let jobType = "";
      let postedTime = "";
      let skills = [];

      // 1. TITLE EXTRACTION - Look for the main job title
      const titleSelectors = [
        'h1[data-test="job-title"]',
        "h1.job-title",
        'h1[class*="title"]',
        'h2[data-test="job-title"]',
        "h2.job-title",
        'h3[data-test="job-title"]',
        "h3.job-title",
        '[data-test="job-title"]',
        "h1",
        "h2",
        "h3",
      ];

      for (const selector of titleSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          title = element.textContent.trim();
          console.log("✅ Title found:", title);
          break;
        }
      }

      // 2. DESCRIPTION EXTRACTION - Look for the main job description
      const descSelectors = [
        '[data-test="job-description"]',
        ".job-description",
        ".description",
        '[class*="description"]',
        '[class*="content"]',
        "main",
        "article",
      ];

      for (const selector of descSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          const text = element.textContent.trim();
          if (text.length > 100 && text.length < 5000) {
            description = text;
            console.log("✅ Description found, length:", text.length);
            break;
          }
        }
      }

      // 3. BUDGET EXTRACTION - Look for currency amounts
      const allText = document.body.textContent;
      const budgetPatterns = [
        /\$[\d,]+/g, // $100, $1,000
        /\€[\d,]+/g, // €100, €1,000
        /\£[\d,]+/g, // £100, £1,000
        /\d+\s*(?:USD|EUR|GBP|hour|day|week|month)/gi, // 100 USD, 50/hour
      ];

      for (const pattern of budgetPatterns) {
        const matches = allText.match(pattern);
        if (matches && matches.length > 0) {
          budget = matches[0];
          console.log("✅ Budget found:", budget);
          break;
        }
      }

      // 4. JOB TYPE EXTRACTION - Look for experience level or job type
      const typePatterns = [
        /(Entry Level|Intermediate|Expert|Beginner|Advanced|Junior|Senior)/gi,
        /(Fixed-price|Hourly|Recurring)/gi,
        /(Less than 1 month|1 to 3 months|3 to 6 months|6\+ months)/gi,
      ];

      for (const pattern of typePatterns) {
        const match = allText.match(pattern);
        if (match) {
          jobType = match[0];
          console.log("✅ Job type found:", jobType);
          break;
        }
      }

      // 5. POSTED TIME EXTRACTION - Look for date patterns
      const datePatterns = [
        /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/gi,
        /\d+\s+(?:hour|day|week|month)s?\s+ago/gi,
        /Posted\s+(?:on\s+)?(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}/gi,
      ];

      for (const pattern of datePatterns) {
        const match = allText.match(pattern);
        if (match) {
          postedTime = match[0];
          console.log("✅ Posted time found:", postedTime);
          break;
        }
      }

      // 6. SKILLS EXTRACTION - Look for skill tags
      const skillSelectors = [
        ".air3-token",
        ".air3-token-wrap span",
        'span[class*="air3-token"]',
        '[class*="skill"]',
        '[class*="tag"]',
      ];

      for (const selector of skillSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          skills = Array.from(elements)
            .map((el) => el.textContent.trim())
            .filter((text) => text.length > 0 && text.length < 50);
          if (skills.length > 0) {
            console.log("✅ Skills found:", skills.length);
            break;
          }
        }
      }

      // 7. FALLBACK EXTRACTION - If we still don't have key data, try harder
      if (!title || title.length < 10) {
        // Look for any heading that might be a job title
        const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
        for (const heading of headings) {
          const text = heading.textContent.trim();
          if (
            text.length > 10 &&
            text.length < 100 &&
            (text.includes("Developer") ||
              text.includes("Engineer") ||
              text.includes("Designer") ||
              text.includes("React") ||
              text.includes("Frontend") ||
              text.includes("Backend"))
          ) {
            title = text;
            console.log("✅ Title found via fallback:", title);
            break;
          }
        }
      }

      if (!description || description.length < 100) {
        // Look for the longest text block that might be a description
        const paragraphs = document.querySelectorAll("p, div");
        let longestText = "";
        let maxLength = 0;

        for (const p of paragraphs) {
          const text = p.textContent.trim();
          if (
            text.length > 100 &&
            text.length < 2000 &&
            (text.includes("need") ||
              text.includes("should") ||
              text.includes("project") ||
              text.includes("work") ||
              text.includes("looking for"))
          ) {
            if (text.length > maxLength) {
              maxLength = text.length;
              longestText = text;
            }
          }
        }

        if (longestText) {
          description = longestText;
          console.log(
            "✅ Description found via fallback, length:",
            longestText.length
          );
        }
      }

      // 8. FINAL DATA ASSEMBLY
      const finalTitle = title || "Job Title (Extraction Failed)";
      const finalDescription = description || "Description extraction failed";
      const finalBudget = budget || "Budget unknown";
      const finalJobType = jobType || "Job type unknown";
      const finalPosted = postedTime || "Posted time unknown";
      const finalSkills =
        skills.length > 0 ? skills : ["Skills extraction failed"];

      // Generate unique ID
      const jobId = btoa(finalTitle + finalBudget + Date.now()).slice(0, 20);

      const jobData = {
        id: jobId,
        title: finalTitle,
        description: finalDescription,
        jobType: finalJobType,
        budget: finalBudget,
        duration: "Duration not specified",
        skills: finalSkills,
        postedTime: finalPosted,
        timestamp: Date.now(),
      };

      console.log("✅ Job data extracted successfully:", jobData);
      console.log("📊 Extraction Summary:");
      console.log("  - Title:", finalTitle ? "✅ Found" : "❌ Missing");
      console.log(
        "  - Description:",
        finalDescription
          ? `✅ Found (${finalDescription.length} chars)`
          : "❌ Missing"
      );
      console.log("  - Budget:", finalBudget ? "✅ Found" : "❌ Missing");
      console.log("  - Job Type:", finalJobType ? "✅ Found" : "❌ Missing");
      console.log(
        "  - Skills:",
        finalSkills.length > 0
          ? `✅ Found (${finalSkills.length} skills)`
          : "❌ Missing"
      );
      console.log("  - Posted:", finalPosted ? "✅ Found" : "❌ Missing");

      return jobData;
    } catch (error) {
      console.error(
        "❌ Error extracting job data from application page:",
        error
      );

      // Return fallback data on error
      return {
        id: "error-" + Date.now(),
        title: "Job Title (Extraction Failed)",
        description:
          "Description extraction failed due to error: " + error.message,
        jobType: "Job type unknown",
        budget: "Budget unknown",
        duration: "Duration unknown",
        skills: ["Skills extraction failed"],
        postedTime: "Posted time unknown",
        timestamp: Date.now(),
      };
    }
  }

  // Method to get current jobs
  getCurrentJobs() {
    return this.jobData;
  }

  testJobExtraction() {
    console.log("🧪 Testing job extraction...");

    try {
      // Log page structure first
      this.logPageStructure();

      // Try to extract job data
      const jobData = this.extractJobDataFromApplicationPage();

      console.log("🧪 Test extraction result:", jobData);

      // Validate the extracted data
      const validation = {
        title:
          jobData.title && jobData.title !== "Job Title (Extraction Failed)",
        description:
          jobData.description &&
          jobData.description !== "Description extraction failed",
        budget: jobData.budget && jobData.budget !== "Budget unknown",
        jobType: jobData.jobType && jobData.jobType !== "Job type unknown",
        posted:
          jobData.postedTime && jobData.postedTime !== "Posted time unknown",
        skills:
          jobData.skills &&
          jobData.skills.length > 0 &&
          !jobData.skills.includes("Skills extraction failed"),
      };

      console.log("🧪 Data validation:", validation);

      const successCount = Object.values(validation).filter(Boolean).length;
      const totalFields = Object.keys(validation).length;

      console.log(
        `🧪 Extraction success rate: ${successCount}/${totalFields} (${Math.round(
          (successCount / totalFields) * 100
        )}%)`
      );

      return {
        success: successCount > 0,
        data: jobData,
        validation: validation,
        successRate: `${successCount}/${totalFields}`,
        message:
          successCount === totalFields
            ? "Perfect extraction!"
            : successCount > totalFields / 2
            ? "Good extraction with some missing data"
            : "Poor extraction - most data missing",
      };
    } catch (error) {
      console.error("🧪 Test extraction failed:", error);
      return {
        success: false,
        error: error.message,
        data: null,
      };
    }
  }

  // Log page structure for debugging
  logPageStructure() {
    console.log("🔍 Page Structure Analysis:");
    console.log("  - URL:", window.location.href);
    console.log("  - Title:", document.title);
    console.log(
      "  - Headings:",
      document.querySelectorAll("h1, h2, h3, h4, h5, h6").length
    );
    console.log("  - Paragraphs:", document.querySelectorAll("p").length);
    console.log("  - Divs:", document.querySelectorAll("div").length);
    console.log("  - Spans:", document.querySelectorAll("span").length);

    // Log all headings
    const headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    console.log("  - Heading texts:");
    headings.forEach((h, i) => {
      console.log(`    ${i + 1}. ${h.tagName}: "${h.textContent.trim()}"`);
    });

    // Log potential job description elements
    const descElements = document.querySelectorAll(
      '[class*="description"], [class*="content"], [class*="body"]'
    );
    console.log("  - Potential description elements:", descElements.length);
    descElements.forEach((el, i) => {
      const text = el.textContent.trim();
      if (text.length > 50) {
        console.log(
          `    ${i + 1}. ${el.tagName}[${el.className}]: "${text.substring(
            0,
            100
          )}..."`
        );
      }
    });

    // Log potential budget elements
    const budgetElements = document.querySelectorAll(
      '[class*="budget"], [class*="rate"], [class*="amount"], [class*="price"]'
    );
    console.log("  - Potential budget elements:", budgetElements.length);
    budgetElements.forEach((el, i) => {
      console.log(
        `    ${i + 1}. ${el.tagName}[${
          el.className
        }]: "${el.textContent.trim()}"`
      );
    });
  }
}

// Initialize content script
const contentScript = new UpworkContentScript(); 