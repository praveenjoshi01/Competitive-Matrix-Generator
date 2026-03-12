# Competitive Matrix & Market Intelligence Generator

An AI-powered market intelligence tool built with **Next.js** and **Crawlee**. This application automates the process of researching competitors, extracting their core marketing messages, and visualizing their promotional strategies through automated browser scans.

## 🚀 Key Features

### 1. AI-Driven Competitor Discovery
- Enter a base company and location to automatically identify the top 5 competitors in that market.
- Option to manually add or remove competitors for a tailored comparison.

### 2. Multi-Dimensional Comparison Matrix
Extracts and organizes granular data points from competitor homepages:
- **Campaign Message**: Core value propositions and slogans.
- **Target Audience**: Identification of specific user personas with verification links.
- **Key Features**: Direct mapping of product/service offerings.
- **Evidence Quotes**: Direct citations from websites for manual verification.

### 3. Urgency & Claims Analysis
Sophisticated classification of persuasive language:
- 🔴 **Urgency**: Time-sensitive pressure or scarcity (e.g., "Only 3 seats left!").
- 🔵 **Claim**: Bold assertions and credibility promises (e.g., "#1 Platform in the US").
- 🟣 **Both**: Statements combining credibility with time pressure.

### 4. "Highest Savings" Deep Browser Scan
Advanced scraping using **PlaywrightCrawler** to handle enterprise-grade sites:
- **Carousel Interaction**: Automatically clicks through hero sliders to capture all major banners.
- **Screenshot Gallery**: Captures and displays high-resolution visual evidence of top deals.
- **Deal Metadata**: Structured extraction of Discount Types (Percentage, Fixed, Tiered) and Target Audiences.
- **Anti-Bot Handling**: Includes advanced logic for cookie banner dismissal (OneTrust, TrustArc, "Accept Cookies", etc.) and lazy-loading triggers.

### 5. Flexible Payments & Financing (Runtime Discovery) 💳
Dynamically discovers and extracts financing options to help analyze customer affordability strategies:
- **Provider Identification**: Automatically detects BNPL partners like **Affirm, Klarna, Afterpay, PayPal Credit, and Zip**.
- **Run-time Partner Discovery**: AI-driven logic to identify new localized payment partners as they appear.
- **Financing Terms**: Comparison of interest-free periods, installment durations, and minimum purchase thresholds.
- **Store Credit Cards**: Extraction of store-branded credit card offers and their specific perks.

### 6. Shipping & Delivery Comparison 🚚
Automated discovery of shipping policy pages to compare logistics:
- **Free Shipping Thresholds**: Identifies exact spend requirements for free shipping.
- **Delivery Speed**: Compares 2-day, Same-day, and Standard delivery options.
- **Store Pickup**: Checks for Click & Collect or in-store fulfillment availability.

### 7. Rewards & Loyalty Programs 🏆
Scrapes and compares competitor rewards ecosystems:
- **Program Discovery**: Finds rewards/loyalty pages automatically via link analysis and fallback paths.
- **Reward Classification**: Color-coded badges for Cashback, Points, Sweepstakes, Discount, and Other reward types.
- **Membership Detection**: Identifies whether sign-up is required and lists exclusive member benefits.
- **Sweepstakes Tracking**: Highlights active giveaways and promotional sweepstakes.
- **Runtime Discovery**: AI-driven identification of new reward structures not explicitly pre-defined.

### 8. Trade-In & Device Buyback 💻
Analyzes customer upgrade paths and affordability via device exchange:
- **Program Discovery**: Automatically finds "Trade-In," "Buyback," or "Upgrade" pages.
- **Credit Evaluation**: Extracts estimated credit ranges for Laptops, Phones, Tablets, and more.
- **Incentive Tracking**: Highlights instant store credit availability and limited-time trade-in bonuses.
- **Logistics**: Identifies mail-in vs. in-store trade options and core equipment conditions.

### 9. Premium Modular Dashboard 💎
State-of-the-art UI/UX designed for rapid analysis:
- **Modular Accordion System**: Each data dimension is contained in a collapsible, color-coded section to reduce cognitive load.
- **Sticky Navigation Hub**: A floating navigation bar with scroll-to pills allows for instant jumping between different intelligence modules.
- **Master Pulse Control**: Top-level "Run All Scans" button to orchestrate the entire data extraction pipeline simultaneously.
- **Unnumbered Clean Design**: A modern, streamlined interface that prioritizes visual hierarchy and data readability.

### 10. Decoupled API Architecture 🏗️
Refactored for high performance and reliability:
- **Dedicated Service Folders**: Each intelligence module (Campaigns, Urgency, Savings, etc.) has its own dedicated API route folder.
- **Micro-focused AI Prompts**: Goal-specific prompts for each module to maximize extraction accuracy and reduce token overhead.
- **Parallel Processing**: Independent handlers allow the frontend to process and display results as they arrive, rather than waiting for a monolithic scrape to complete.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React, Tailwind CSS
- **Scraping Engine**: Crawlee (Cheerio for speed, Playwright for deep browser interaction)
- **Intelligence**: OpenAI GPT-4o-mini
- **Language**: TypeScript

## 🏁 Getting Started

### Prerequisites
- Node.js 18+
- An OpenAI API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/praveenjoshi01/Competitive-Matrix-Generator.git
   cd Competitive-Matrix-Generator
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Install Playwright Browsers:**
   ```bash
   npx playwright install chromium
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🛡️ Environment & Privacy
- **Stateless Execution**: Screenshots are handled as inline base64 strings to ensure the app remains stateless and compatible with serverless environments.
- **Local Research**: The `.knowledge/` directory contains local research dumps and is ignored by Git to prevent data leakage.

---
*Built for product managers, marketers, and GTM teams to move from "Checking websites" to "Strategic Analysis" in seconds.*
