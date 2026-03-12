<<<<<<< HEAD
# Competitive-Matrix-Generator
Identify top competitors and extract their core campaign strategy automatically using AI.
=======
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
- **Anti-Bot Handling**: Includes advanced logic for cookie banner dismissal (OneTrust, TrustArc, "Accept Cookies", etc.) and lazy-loading triggers for sophisticated enterprise sites.

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
   git clone <your-repo-url>
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
>>>>>>> 6d46dfe (Initial commit: AI-powered Competitive Matrix Generator with multi-dimensional extraction and deep browser scanning)
