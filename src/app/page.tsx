"use client";

import { useState } from 'react';

type Competitor = {
  name: string;
  url: string;
};

type CampaignResult = {
  url: string;
  campaignMessage: string;
  targetAudience?: { description: string; link: string | null };
  keyFeatures?: { feature: string; link: string | null }[];
  evidenceQuote?: { quote: string; link: string | null };
};

type UrgencyResult = {
  url: string;
  urgencyAndClaims?: { text: string; category: string; link: string | null }[];
};

type Saving = {
  discountType: string;
  targetAudience: string;
  location: string;
  description: string;
};

type SavingsResult = {
  url: string;
  savings: Saving[];
  screenshots: string[]; // base64 strings
};

type ShippingResult = {
  url: string;
  freeShippingAvailable: boolean;
  freeShippingThreshold: string;
  twoDayDelivery: string;
  sameDayDelivery: string;
  storePickup: string;
  storeDeliveryFee: string;
  additionalNotes: string;
  sourceUrl: string;
  error?: string;
};

type PaymentProvider = {
  name: string;
  type: string;
};

type InstallmentPlan = {
  description: string;
  months: number | null;
  interestFree: boolean;
};

type PaymentsResult = {
  url: string;
  providers: PaymentProvider[];
  installmentPlans: InstallmentPlan[];
  minimumPurchase: string;
  creditCardOffers: string;
  additionalNotes: string;
  sourceUrl: string;
  error?: string;
};

type RewardItem = {
  description: string;
  rewardType: string;
  percentage: string | null;
  condition: string | null;
};

type RewardsResult = {
  url: string;
  programName: string;
  rewards: RewardItem[];
  membershipRequired: boolean;
  membershipBenefits: string;
  sweepstakes: string | null;
  additionalNotes: string;
  sourceUrl: string;
  error?: string;
};

type TradeInDevice = {
  category: string;
  estimatedCredit: string;
  description: string | null;
};

type TradeInResult = {
  url: string;
  programName: string;
  tradeInAvailable: boolean;
  eligibleDevices: TradeInDevice[];
  instantCredit: boolean;
  mailInOption: boolean;
  bonusOffers: string | null;
  conditions: string;
  additionalNotes: string;
  sourceUrl: string;
  error?: string;
};

export default function Home() {
  const [baseCompany, setBaseCompany] = useState('');
  const [location, setLocation] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  
  const [manualName, setManualName] = useState('');
  const [manualUrl, setManualUrl] = useState('');
  const [baseCompanyUrl, setBaseCompanyUrl] = useState('');

  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignResults, setCampaignResults] = useState<CampaignResult[]>([]);

  const [loadingUrgency, setLoadingUrgency] = useState(false);
  const [urgencyResults, setUrgencyResults] = useState<UrgencyResult[]>([]);
  
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [savingsResults, setSavingsResults] = useState<SavingsResult[]>([]);
  
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingResults, setShippingResults] = useState<ShippingResult[]>([]);
  
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentsResults, setPaymentsResults] = useState<PaymentsResult[]>([]);
  
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [rewardsResults, setRewardsResults] = useState<RewardsResult[]>([]);
  
  const [loadingTradeIn, setLoadingTradeIn] = useState(false);
  const [tradeInResults, setTradeInResults] = useState<TradeInResult[]>([]);
  
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    matrix: true,
    urgency: true,
    savings: true,
    shipping: true,
    payments: true,
    rewards: true,
    tradein: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const [error, setError] = useState('');

  const handleRunAll = async () => {
    handleGenerateCampaigns();
    handleGenerateUrgency();
    handleGenerateSavings();
    handleGenerateShipping();
    handleGeneratePayments();
    handleGenerateRewards();
    handleGenerateTradeIn();
  };

  const handleFindCompetitors = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseCompany || !location || !apiKey) {
      setError('Please fill in Base Company, Location, and OpenAI API Key');
      return;
    }
    setError('');
    setLoadingCompetitors(true);
    setCompetitors([]);
    setBaseCompanyUrl('');

    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: baseCompany, location, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch competitors');
      
      setCompetitors(data.competitors || []);
      setBaseCompanyUrl(data.baseCompanyUrl || '');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCompetitors(false);
    }
  };

  const handleAddManualCompetitor = () => {
    if (!manualName || !manualUrl) return;
    setCompetitors((prev) => [...prev, { name: manualName, url: manualUrl }]);
    setManualName('');
    setManualUrl('');
  };

  const handleRemoveCompetitor = (index: number) => {
    setCompetitors((prev) => prev.filter((_, i) => i !== index));
  };

  const handleGenerateCampaigns = async () => {
    if (competitors.length === 0) {
      setError('No competitors selected');
      return;
    }
    if (!apiKey) {
      setError('API Key is missing');
      return;
    }
    if (!baseCompanyUrl) {
      setError('Base company URL is missing. Please find competitors first.');
      return;
    }
    
    setError('');
    setLoadingCampaigns(true);
    setCampaignResults([]);

    const urlsToScrape = [baseCompanyUrl, ...competitors.map(c => c.url)];

    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsToScrape, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate campaigns');
      
      setCampaignResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleGenerateUrgency = async () => {
    if (competitors.length === 0) {
      setError('No competitors selected');
      return;
    }
    if (!apiKey) {
      setError('API Key is missing');
      return;
    }
    if (!baseCompanyUrl) {
      setError('Base company URL is missing. Please find competitors first.');
      return;
    }
    
    setError('');
    setLoadingUrgency(true);
    setUrgencyResults([]);

    const urlsToScrape = [baseCompanyUrl, ...competitors.map(c => c.url)];

    try {
      const res = await fetch('/api/urgency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsToScrape, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate urgency data');
      
      setUrgencyResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingUrgency(false);
    }
  };

  const handleGenerateSavings = async () => {
    if (competitors.length === 0) {
      setError('No competitors selected');
      return;
    }
    if (!apiKey) {
      setError('API Key is missing');
      return;
    }
    if (!baseCompanyUrl) {
      setError('Base company URL is missing. Please find competitors first.');
      return;
    }
    
    setError('');
    setLoadingSavings(true);
    setSavingsResults([]);

    // Include base company URL
    const urlsToScrape = [baseCompanyUrl, ...competitors.map(c => c.url)];

    try {
      const res = await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsToScrape, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate savings');
      
      setSavingsResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingSavings(false);
    }
  };

  const handleGenerateShipping = async () => {
    if (competitors.length === 0) {
      setError('No competitors selected');
      return;
    }
    if (!apiKey) {
      setError('API Key is missing');
      return;
    }
    if (!baseCompanyUrl) {
      setError('Base company URL is missing. Please find competitors first.');
      return;
    }
    
    setError('');
    setLoadingShipping(true);
    setShippingResults([]);

    const urlsToScrape = [baseCompanyUrl, ...competitors.map(c => c.url)];

    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsToScrape, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate shipping data');
      
      setShippingResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingShipping(false);
    }
  };

  const handleGeneratePayments = async () => {
    if (competitors.length === 0) {
      setError('No competitors selected');
      return;
    }
    if (!apiKey) {
      setError('API Key is missing');
      return;
    }
    if (!baseCompanyUrl) {
      setError('Base company URL is missing. Please find competitors first.');
      return;
    }
    
    setError('');
    setLoadingPayments(true);
    setPaymentsResults([]);

    // Include base company URL
    const urlsToScrape = [baseCompanyUrl, ...competitors.map(c => c.url)];

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsToScrape, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate payments data');
      
      setPaymentsResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleGenerateRewards = async () => {
    if (competitors.length === 0) {
      setError('No competitors selected');
      return;
    }
    if (!apiKey) {
      setError('API Key is missing');
      return;
    }
    if (!baseCompanyUrl) {
      setError('Base company URL is missing. Please find competitors first.');
      return;
    }
    
    setError('');
    setLoadingRewards(true);
    setRewardsResults([]);

    // Include base company URL
    const urlsToScrape = [baseCompanyUrl, ...competitors.map(c => c.url)];

    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsToScrape, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate rewards data');
      
      setRewardsResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingRewards(false);
    }
  };

  const handleGenerateTradeIn = async () => {
    if (competitors.length === 0) {
      setError('No competitors selected');
      return;
    }
    if (!apiKey) {
      setError('API Key is missing');
      return;
    }
    if (!baseCompanyUrl) {
      setError('Base company URL is missing. Please find competitors first.');
      return;
    }
    
    setError('');
    setLoadingTradeIn(true);
    setTradeInResults([]);

    // Include base company URL
    const urlsToScrape = [baseCompanyUrl, ...competitors.map(c => c.url)];

    try {
      const res = await fetch('/api/tradein', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls: urlsToScrape, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate trade-in data');
      
      setTradeInResults(data.data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingTradeIn(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Competitive Matrix Generator
          </h1>
          <p className="mt-4 text-xl text-gray-500">
            Identify top competitors and extract their core campaign messages automatically using AI.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Configuration Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">Define Target Market</h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">Enter a company, location, and your OpenAI key to find competitors.</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <form onSubmit={handleFindCompetitors} className="grid grid-cols-1 gap-y-6 sm:grid-cols-3 sm:gap-x-4">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-700">Base Company</label>
                <input type="text" id="company" value={baseCompany} onChange={(e) => setBaseCompany(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="e.g. OpenAI" />
              </div>
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                <input type="text" id="location" value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="e.g. Global" />
              </div>
              <div>
                <label htmlFor="apikey" className="block text-sm font-medium text-gray-700">OpenAI API Key</label>
                <input type="password" id="apikey" value={apiKey} onChange={(e) => setApiKey(e.target.value)} required className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="sk-..." />
              </div>
              <div className="sm:col-span-3">
                <button type="submit" disabled={loadingCompetitors} className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
                  {loadingCompetitors ? 'Finding Competitors...' : 'Find Top 5 Competitors'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Competitor List */}
        {competitors.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">Refine Competitors</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">Review AI-suggested competitors, or add your own.</p>
              </div>
            </div>
            <div className="border-t border-gray-200 p-4">
              <ul className="divide-y divide-gray-200">
                {competitors.map((comp, idx) => (
                  <li key={idx} className="py-4 flex items-center justify-between">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-gray-900">{comp.name}</span>
                      <a href={comp.url} target="_blank" rel="noopener noreferrer" className="text-sm text-indigo-600 hover:text-indigo-500">{comp.url}</a>
                    </div>
                    <button onClick={() => handleRemoveCompetitor(idx)} className="text-red-600 hover:text-red-900 text-sm font-medium">Remove</button>
                  </li>
                ))}
              </ul>

              {/* Add Manual Competitor */}
              <div className="mt-6 bg-gray-50 p-4 rounded-md">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Add Custom Competitor</h4>
                <div className="grid grid-cols-1 gap-y-4 sm:grid-cols-5 sm:gap-x-4 items-end">
                  <div className="sm:col-span-2">
                    <label htmlFor="manualName" className="block text-xs text-gray-500">Name</label>
                    <input type="text" id="manualName" value={manualName} onChange={(e) => setManualName(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="Company Name" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="manualUrl" className="block text-xs text-gray-500">Website URL</label>
                    <input type="url" id="manualUrl" value={manualUrl} onChange={(e) => setManualUrl(e.target.value)} className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md p-2 border" placeholder="https://..." />
                  </div>
                  <div className="sm:col-span-1">
                    <button type="button" onClick={handleAddManualCompetitor} className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                      Add
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <button
                  type="button"
                  onClick={handleRunAll}
                  disabled={loadingCampaigns || loadingUrgency || loadingSavings || loadingShipping || loadingPayments || loadingRewards || loadingTradeIn}
                  className="w-full mb-6 py-4 px-6 border-2 border-indigo-500 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 font-bold text-lg shadow-sm transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                >
                  <span className="text-2xl">⚡</span> Run All Scans & Extraction
                </button>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleGenerateCampaigns}
                    disabled={loadingCampaigns}
                    className="flex flex-col items-start p-4 border border-green-200 rounded-lg text-green-700 bg-green-50 hover:bg-green-100 transition-colors disabled:opacity-50"
                  >
                    <span className="font-bold">Campaign Messages</span>
                    <span className="text-xs text-green-600 mt-1">Slogans & marketing target</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateUrgency}
                    disabled={loadingUrgency}
                    className="flex flex-col items-start p-4 border border-green-300 rounded-lg text-green-800 bg-green-100 hover:bg-green-200 transition-colors disabled:opacity-50"
                  >
                    <span className="font-bold">Urgency & Claims</span>
                    <span className="text-xs text-green-700 mt-1">Hooks, Assertions & Countdowns</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateSavings}
                    disabled={loadingSavings}
                    className="flex flex-col items-start p-4 border border-indigo-200 rounded-lg text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors disabled:opacity-50"
                  >
                    <span className="font-bold">Highest Savings</span>
                    <span className="text-xs text-indigo-600 mt-1">Browser screenshots & banners</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateShipping}
                    disabled={loadingShipping}
                    className="flex flex-col items-start p-4 border border-teal-200 rounded-lg text-teal-700 bg-teal-50 hover:bg-teal-100 transition-colors disabled:opacity-50"
                  >
                    <span className="font-bold">Shipping & Delivery</span>
                    <span className="text-xs text-teal-600 mt-1">Policy discovery & logistics</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGeneratePayments}
                    disabled={loadingPayments}
                    className="flex flex-col items-start p-4 border border-amber-200 rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100 transition-colors disabled:opacity-50"
                  >
                    <span className="font-bold">Flexible Payments</span>
                    <span className="text-xs text-amber-600 mt-1">Checkout & finance partners</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateRewards}
                    disabled={loadingRewards}
                    className="flex flex-col items-start p-4 border border-purple-200 rounded-lg text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors disabled:opacity-50"
                  >
                    <span className="font-bold">Rewards & Loyalty</span>
                    <span className="text-xs text-purple-600 mt-1">Memberships & cashback</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGenerateTradeIn}
                    disabled={loadingTradeIn}
                    className="flex flex-col items-start p-4 border border-rose-200 rounded-lg text-rose-700 bg-rose-50 hover:bg-rose-100 transition-colors disabled:opacity-50"
                  >
                    <span className="font-bold">Trade-In & Buyback</span>
                    <span className="text-xs text-rose-600 mt-1">Device credit discovery</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Navigation Pills */}
        {(campaignResults.length > 0 || urgencyResults.length > 0 || savingsResults.length > 0 || shippingResults.length > 0 || paymentsResults.length > 0 || rewardsResults.length > 0 || tradeInResults.length > 0) && (
          <div className="sticky top-4 z-50 flex justify-center">
            <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-gray-200 flex gap-2 overflow-x-auto max-w-full no-scrollbar">
              {campaignResults.length > 0 && <button onClick={() => document.getElementById('section-matrix')?.scrollIntoView({ behavior: 'smooth' })} className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 hover:bg-green-200">Campaigns</button>}
              {urgencyResults.length > 0 && <button onClick={() => document.getElementById('section-urgency')?.scrollIntoView({ behavior: 'smooth' })} className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 hover:bg-green-200">Claims</button>}
              {savingsResults.length > 0 && <button onClick={() => document.getElementById('section-savings')?.scrollIntoView({ behavior: 'smooth' })} className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 hover:bg-indigo-200">Savings</button>}
              {shippingResults.length > 0 && <button onClick={() => document.getElementById('section-shipping')?.scrollIntoView({ behavior: 'smooth' })} className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-teal-100 text-teal-700 hover:bg-teal-200">Shipping</button>}
              {paymentsResults.length > 0 && <button onClick={() => document.getElementById('section-payments')?.scrollIntoView({ behavior: 'smooth' })} className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 hover:bg-amber-200">Payments</button>}
              {rewardsResults.length > 0 && <button onClick={() => document.getElementById('section-rewards')?.scrollIntoView({ behavior: 'smooth' })} className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700 hover:bg-purple-200">Rewards</button>}
              {tradeInResults.length > 0 && <button onClick={() => document.getElementById('section-tradein')?.scrollIntoView({ behavior: 'smooth' })} className="whitespace-nowrap px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-700 hover:bg-rose-200">Trade-In</button>}
            </div>
          </div>
        )}

        {/* Campaigns Results */}
        {campaignResults.length > 0 && (
          <div id="section-matrix" className="mt-12 scroll-mt-24">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg border-l-4 border-green-500">
              <button onClick={() => toggleSection('matrix')} className="w-full px-4 py-5 sm:px-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Campaign Message Comparison</h3>
                    <p className="mt-1 text-sm text-gray-500">Core marketing statements and slogans.</p>
                  </div>
                </div>
                <span className={`text-gray-400 transition-transform ${expandedSections.matrix ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {expandedSections.matrix && (
                <div className="border-t border-gray-200 overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor Name (URL)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Message</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Audience</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Features</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence Quote</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {campaignResults.map((result: CampaignResult, idx: number) => {
                        const compName = result.url === baseCompanyUrl ? baseCompany : competitors.find(c => c.url === result.url)?.name;
                        return (
                          <tr key={idx}>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top whitespace-nowrap">
                              {compName || 'Unknown'}<br/>
                              <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-900 break-words">{result.url}</a>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 align-top">{result.campaignMessage}</td>
                            <td className="px-6 py-4 text-sm text-gray-700 align-top">
                              {result.targetAudience ? (
                                <>
                                  <p>{result.targetAudience.description}</p>
                                  {result.targetAudience.link && (
                                    <a href={result.targetAudience.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-900 mt-1 inline-block">[Verify Audience]</a>
                                  )}
                                </>
                              ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700 align-top">
                              {result.keyFeatures && result.keyFeatures.length > 0 ? (
                                <ul className="list-disc pl-4 space-y-1">
                                  {result.keyFeatures.map((feat: { feature: string }, i: number) => (
                                    <li key={i}>{feat.feature}</li>
                                  ))}
                                </ul>
                              ) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-600 italic font-serif align-top border-l-2 border-gray-100">
                              {result.evidenceQuote ? `"${result.evidenceQuote.quote}"` : 'N/A'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Urgency & Claims */}
        {urgencyResults.length > 0 && (
          <div id="section-urgency" className="bg-white shadow overflow-hidden sm:rounded-lg mt-6 border-l-4 border-green-600 scroll-mt-24">
              <button 
                onClick={() => toggleSection('urgency')}
                className="w-full px-4 py-5 sm:px-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Urgency & Claims</h3>
                    <p className="mt-1 text-sm text-gray-500">Specific persuasive language and assertions.</p>
                  </div>
                </div>
                <span className={`text-gray-400 transition-transform ${expandedSections.urgency ? 'rotate-180' : ''}`}>▼</span>
              </button>
              
              {expandedSections.urgency && (
                <div className="border-t border-gray-200 p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {urgencyResults.map((result, idx) => {
                      const compName = result.url === baseCompanyUrl ? baseCompany : competitors.find(c => c.url === result.url)?.name;
                      return (
                        <div key={idx} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                          <span className="text-sm font-bold text-gray-900">{compName || 'Unknown'}</span>
                          <div className="mt-2 space-y-2">
                            {result.urgencyAndClaims?.map((item, cIdx) => (
                              <div key={cIdx} className="bg-white p-2 rounded border border-gray-100 text-xs">
                                <span className="font-bold text-red-600 uppercase text-[9px] block mb-1">{item.category}</span>
                                <p className="italic">"{item.text}"</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
        )}

        {/* Highest Savings Section */}
        {savingsResults.length > 0 && (
          <div id="section-savings" className={`bg-white shadow overflow-hidden sm:rounded-lg mt-12 border-l-4 border-indigo-500 scroll-mt-24`}>
            <button onClick={() => toggleSection('savings')} className="w-full px-4 py-5 sm:px-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Highest Savings Gallery</h3>
                  <p className="mt-1 text-sm text-gray-500">Visual evidence and banner ads.</p>
                </div>
              </div>
              <span className={`text-gray-400 transition-transform ${expandedSections.savings ? 'rotate-180' : ''}`}>▼</span>
            </button>
            {expandedSections.savings && (
              <div className="border-t border-gray-200 p-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {savingsResults.map((result, idx) => {
                    const compName = result.url === baseCompanyUrl ? baseCompany : competitors.find(c => c.url === result.url)?.name;
                    return (
                      <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 flex flex-col">
                        <div className="p-3 bg-white border-b flex justify-between items-center text-sm">
                           <span className="font-bold">{compName || 'Unknown'}</span>
                        </div>
                        <div className="relative h-64 bg-black">
                          <div className="flex h-full overflow-x-auto snap-x snap-mandatory text-white">
                            {result.screenshots.map((shot, sIdx) => (
                              <img key={sIdx} src={`data:image/png;base64,${shot}`} className="flex-none w-full h-full snap-center object-contain" />
                            ))}
                          </div>
                        </div>
                        <div className="p-4 space-y-2">
                           {result.savings.map((val, i) => (
                             <div key={i} className="bg-white p-2 rounded border text-sm italic font-medium">"{val.description}"</div>
                           ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Shipping & Delivery Comparison */}
        {shippingResults.length > 0 && (
          <div id="section-shipping" className="bg-white shadow overflow-hidden sm:rounded-lg mt-12 border-l-4 border-teal-500 scroll-mt-24">
            <button 
              onClick={() => toggleSection('shipping')}
              className="w-full px-4 py-5 sm:px-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Shipping & Delivery Comparison</h3>
                  <p className="mt-1 text-sm text-gray-500">Comparative logistics and fulfillment options.</p>
                </div>
              </div>
              <span className={`text-gray-400 transition-transform ${expandedSections.shipping ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {expandedSections.shipping && (
              <div className="border-t border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Free Shipping</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">2-Day Delivery</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Same-Day</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Pickup</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Additional Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {shippingResults.map((result, idx) => {
                      const compName = result.url === baseCompanyUrl ? baseCompany : competitors.find(c => c.url === result.url)?.name;
                      return (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                            {compName || 'Unknown'}<br/>
                            {result.error ? (
                              <span className="text-[10px] text-red-500 font-bold uppercase italic">{result.error}</span>
                            ) : (
                              <a href={result.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:text-indigo-900 font-mono">[Policy Source]</a>
                            )}
                          </td>
                          <td className="px-6 py-4 align-top">
                            {result.freeShippingAvailable ? (
                              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">AVAILABLE</span>
                            ) : (
                              <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700">NOT SEEN</span>
                            )}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-bold align-top whitespace-nowrap">
                            {result.freeShippingThreshold || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 align-top">
                            <span className={(result.twoDayDelivery || '').toLowerCase().includes('free') ? 'text-green-600 font-medium' : 'text-gray-700'}>
                              {result.twoDayDelivery || 'N/A'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 align-top">
                            {result.sameDayDelivery || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 align-top whitespace-nowrap font-medium">
                            {result.storePickup || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 italic align-top max-w-xs">
                            {result.additionalNotes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Flexible Payments Comparison */}
        {paymentsResults.length > 0 && (
          <div id="section-payments" className="bg-white shadow overflow-hidden sm:rounded-lg mt-12 border-l-4 border-amber-500 scroll-mt-24">
            <button 
              onClick={() => toggleSection('payments')}
              className="w-full px-4 py-5 sm:px-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Flexible Payments Comparison</h3>
                  <p className="mt-1 text-sm text-gray-500">Financing, installment plans, and providers.</p>
                </div>
              </div>
              <span className={`text-gray-400 transition-transform ${expandedSections.payments ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {expandedSections.payments && (
              <div className="border-t border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partners</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financing Terms</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Credit Card</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {paymentsResults.map((result, idx) => {
                      const compName = result.url === baseCompanyUrl ? baseCompany : competitors.find(c => c.url === result.url)?.name;
                      return (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                            {compName || 'Unknown'}<br/>
                            {result.error ? (
                              <span className="text-[10px] text-red-500 font-bold uppercase italic">{result.error}</span>
                            ) : (
                              <a href={result.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:text-indigo-900 font-mono">[Finance Page]</a>
                            )}
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="flex flex-wrap gap-2">
                              {result.providers?.length > 0 ? result.providers.map((p, pIdx) => {
                                const name = (p.name || '').toLowerCase();
                                let colorClass = 'bg-gray-100 text-gray-700';
                                if (name.includes('paypal')) colorClass = 'bg-yellow-100 text-yellow-800';
                                if (name.includes('affirm')) colorClass = 'bg-blue-100 text-blue-800';
                                if (name.includes('klarna')) colorClass = 'bg-pink-100 text-pink-800';
                                if (name.includes('afterpay')) colorClass = 'bg-emerald-100 text-emerald-800';
                                if (name.includes('zip')) colorClass = 'bg-indigo-100 text-indigo-800';
                                
                                return (
                                  <span key={pIdx} className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${colorClass}`}>
                                    {p.name || 'Unknown'}
                                  </span>
                                );
                              }) : <span className="text-gray-400 italic text-xs">None found</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 align-top">
                            {result.installmentPlans?.length > 0 ? (
                              <ul className="space-y-2">
                                {result.installmentPlans.map((plan, iIdx) => (
                                  <li key={iIdx} className="leading-tight">
                                    <span className={plan.interestFree ? 'text-green-600 font-bold' : ''}>
                                      {plan.description || 'Flexible Term'}
                                    </span>
                                  </li>
                                ))}
                              </ul>
                            ) : 'Standard payment only'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-bold align-top">
                            {result.minimumPurchase || 'None'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 align-top max-w-xs">
                            {result.creditCardOffers || 'N/A'}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 italic align-top max-w-xs">
                            {result.additionalNotes || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Rewards & Loyalty Comparison */}
        {rewardsResults.length > 0 && (
          <div id="section-rewards" className="bg-white shadow overflow-hidden sm:rounded-lg mt-12 border-l-4 border-purple-500 scroll-mt-24">
            <button 
              onClick={() => toggleSection('rewards')}
              className="w-full px-4 py-5 sm:px-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Rewards & Loyalty Comparison</h3>
                  <p className="mt-1 text-sm text-gray-500">Rewards programs, cashback offers, and loyalty clubs.</p>
                </div>
              </div>
              <span className={`text-gray-400 transition-transform ${expandedSections.rewards ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {expandedSections.rewards && (
              <div className="border-t border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rewards</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Benefits</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sweepstakes</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {rewardsResults.map((result, idx) => {
                      const compName = result.url === baseCompanyUrl ? baseCompany : competitors.find(c => c.url === result.url)?.name;
                      return (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                            {compName || 'Unknown'}<br/>
                            <a href={result.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:text-indigo-900 font-mono">[Rewards Page]</a>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-bold align-top">{result.programName || 'N/A'}</td>
                          <td className="px-6 py-4 align-top">
                            {result.rewards?.length > 0 ? (
                              <ul className="space-y-1">
                                {result.rewards.map((r, rIdx) => (
                                  <li key={rIdx} className="text-xs">
                                    <span className="font-bold text-indigo-600">{r.rewardType}:</span> {r.description}
                                  </li>
                                ))}
                              </ul>
                            ) : <span className="text-gray-400 italic text-xs">None listed</span>}
                          </td>
                          <td className="px-6 py-4 align-top">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${result.membershipRequired ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                              {result.membershipRequired ? 'REQUIRED' : 'OPEN'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-700 align-top">{result.membershipBenefits || 'N/A'}</td>
                          <td className="px-6 py-4 text-sm text-yellow-700 font-bold align-top">{result.sweepstakes || '-'}</td>
                          <td className="px-6 py-4 text-sm text-gray-500 italic align-top">{result.additionalNotes || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Trade-In & Buyback Comparison */}
        {tradeInResults.length > 0 && (
          <div id="section-tradein" className="bg-white shadow overflow-hidden sm:rounded-lg mt-12 border-l-4 border-rose-500 scroll-mt-24">
            <button 
              onClick={() => toggleSection('tradein')}
              className="w-full px-4 py-5 sm:px-6 flex justify-between items-center hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="text-left">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Trade-In & Buyback Comparison</h3>
                  <p className="mt-1 text-sm text-gray-500">Device credits and upgrade paths.</p>
                </div>
              </div>
              <span className={`text-gray-400 transition-transform ${expandedSections.tradein ? 'rotate-180' : ''}`}>▼</span>
            </button>
            
            {expandedSections.tradein && (
              <div className="border-t border-gray-200 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Eligible Devices</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Features</th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {tradeInResults.map((result, idx) => {
                      const compName = result.url === baseCompanyUrl ? baseCompany : competitors.find(c => c.url === result.url)?.name;
                      return (
                        <tr key={idx}>
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                            {compName || 'Unknown'}<br/>
                            <a href={result.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:text-indigo-900 font-mono">[Trade-In Page]</a>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 font-bold align-top">
                            {result.programName || 'N/A'}<br/>
                            {!result.tradeInAvailable && <span className="text-[10px] text-gray-400">(Unavailable)</span>}
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="flex flex-wrap gap-1">
                              {result.eligibleDevices?.map((d, dIdx) => (
                                <span key={dIdx} className="px-2 py-0.5 rounded bg-gray-100 text-[10px]">{d.category}: {d.estimatedCredit}</span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top">
                            <div className="space-y-1">
                              {result.instantCredit && <span className="block text-[10px] font-bold text-yellow-700">⚡ INSTANT CREDIT</span>}
                              {result.mailInOption && <span className="block text-[10px] font-bold text-sky-700">📦 MAIL-IN</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-500 italic align-top">{result.additionalNotes || '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
