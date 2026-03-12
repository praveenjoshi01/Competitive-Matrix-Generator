"use client";

import { useState } from 'react';

type Competitor = {
  name: string;
  url: string;
};

type MatrixResult = {
  url: string;
  campaignMessage: string;
  targetAudience?: { description: string; link: string | null };
  keyFeatures?: { feature: string; link: string | null }[];
  evidenceQuote?: { quote: string; link: string | null };
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

export default function Home() {
  const [baseCompany, setBaseCompany] = useState('');
  const [location, setLocation] = useState('');
  const [apiKey, setApiKey] = useState('');
  
  const [loadingCompetitors, setLoadingCompetitors] = useState(false);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  
  const [manualName, setManualName] = useState('');
  const [manualUrl, setManualUrl] = useState('');

  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [matrixResults, setMatrixResults] = useState<MatrixResult[]>([]);
  
  const [loadingSavings, setLoadingSavings] = useState(false);
  const [savingsResults, setSavingsResults] = useState<SavingsResult[]>([]);
  
  const [loadingShipping, setLoadingShipping] = useState(false);
  const [shippingResults, setShippingResults] = useState<ShippingResult[]>([]);
  
  const [loadingPayments, setLoadingPayments] = useState(false);
  const [paymentsResults, setPaymentsResults] = useState<PaymentsResult[]>([]);
  
  const [loadingRewards, setLoadingRewards] = useState(false);
  const [rewardsResults, setRewardsResults] = useState<RewardsResult[]>([]);
  
  const [error, setError] = useState('');

  const handleFindCompetitors = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!baseCompany || !location || !apiKey) {
      setError('Please fill in Base Company, Location, and OpenAI API Key');
      return;
    }
    setError('');
    setLoadingCompetitors(true);
    setCompetitors([]);

    try {
      const res = await fetch('/api/competitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company: baseCompany, location, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch competitors');
      
      setCompetitors(data.competitors || []);
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

  const handleGenerateMatrix = async () => {
    if (competitors.length === 0) {
      setError('No competitors selected');
      return;
    }
    if (!apiKey) {
      setError('API Key is missing');
      return;
    }
    
    setError('');
    setLoadingMatrix(true);
    setMatrixResults([]);

    const urls = competitors.map(c => c.url);

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, apiKey }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate matrix');
      
      setMatrixResults(data.matrix || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoadingMatrix(false);
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
    
    setError('');
    setLoadingSavings(true);
    setSavingsResults([]);

    const urls = competitors.map(c => c.url);

    try {
      const res = await fetch('/api/savings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, apiKey }),
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
    
    setError('');
    setLoadingShipping(true);
    setShippingResults([]);

    const urls = competitors.map(c => c.url);

    try {
      const res = await fetch('/api/shipping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, apiKey }),
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
    
    setError('');
    setLoadingPayments(true);
    setPaymentsResults([]);

    const urls = competitors.map(c => c.url);

    try {
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, apiKey }),
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
    
    setError('');
    setLoadingRewards(true);
    setRewardsResults([]);

    const urls = competitors.map(c => c.url);

    try {
      const res = await fetch('/api/rewards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ urls, apiKey }),
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
            <h3 className="text-lg leading-6 font-medium text-gray-900">1. Define Target Market</h3>
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
                <h3 className="text-lg leading-6 font-medium text-gray-900">2. Refine Competitors</h3>
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

              <div className="mt-6 flex flex-col gap-4">
                <button
                  type="button"
                  onClick={handleGenerateMatrix}
                  disabled={loadingMatrix}
                  className="w-full inline-flex justify-center py-3 px-4 border border-transparent shadow-sm text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loadingMatrix ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Extracting Market Data...
                    </span>
                  ) : "Generate Comparison Matrix"}
                </button>
                
                <button
                  type="button"
                  onClick={handleGenerateSavings}
                  disabled={loadingSavings}
                  className="w-full inline-flex justify-center py-3 px-4 border border-indigo-200 shadow-sm text-base font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loadingSavings ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Crawling & Capturing Screenshots (Heavier Scan)...
                    </span>
                  ) : "Extract Highest Savings (Browser Scan)"}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateShipping}
                  disabled={loadingShipping}
                  className="w-full inline-flex justify-center py-3 px-4 border border-teal-200 shadow-sm text-base font-medium rounded-md text-teal-700 bg-teal-50 hover:bg-teal-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50"
                >
                  {loadingShipping ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-teal-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Searching for Shipping Policies...
                    </span>
                  ) : "Extract Shipping & Delivery (Page Scan)"}
                </button>

                <button
                  type="button"
                  onClick={handleGeneratePayments}
                  disabled={loadingPayments}
                  className="w-full inline-flex justify-center py-3 px-4 border border-amber-200 shadow-sm text-base font-medium rounded-md text-amber-700 bg-amber-50 hover:bg-amber-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50"
                >
                  {loadingPayments ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-amber-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Crawling Checkout & Finance Options...
                    </span>
                  ) : "Extract Flexible Payments (Runtime Discovery)"}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateRewards}
                  disabled={loadingRewards}
                  className="w-full inline-flex justify-center py-3 px-4 border border-purple-200 shadow-sm text-base font-medium rounded-md text-purple-700 bg-purple-50 hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {loadingRewards ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-purple-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Scanning Rewards &amp; Loyalty Programs...
                    </span>
                  ) : "Extract Rewards & Loyalty Programs"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Matrix Results */}
        {matrixResults.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">3. Comparison Matrix</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Extracted data points from competitor websites.</p>
            </div>
            <div className="border-t border-gray-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor Name (URL)</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Message</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target Audience</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Key Features</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Evidence Quote</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {matrixResults.map((result, idx) => {
                    const comp = competitors.find(c => c.url === result.url);
                    return (
                      <tr key={idx}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 align-top">
                          {comp?.name || 'Unknown'}<br/>
                          <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-900 break-words">{result.url}</a>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 align-top">
                          {result.campaignMessage}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 align-top">
                          {result.targetAudience ? (
                            <>
                              <p>{result.targetAudience.description}</p>
                              {result.targetAudience.link && (
                                <a href={result.targetAudience.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-900 mt-1 inline-block">
                                  [Verify Audience]
                                </a>
                              )}
                            </>
                          ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 align-top">
                           {result.keyFeatures && result.keyFeatures.length > 0 ? (
                               <ul className="list-disc pl-4 space-y-2">
                                   {result.keyFeatures.map((feat, i) => (
                                     <li key={i}>
                                       {feat.feature}
                                       {feat.link && (
                                         <a href={feat.link} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-900 ml-2">
                                           [View Feature]
                                         </a>
                                       )}
                                     </li>
                                   ))}
                               </ul>
                           ) : 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600 italic font-serif align-top border-l-2 border-gray-100 min-h-full">
                          <div className="flex flex-col h-full justify-between">
                            <div>{result.evidenceQuote ? `"${result.evidenceQuote.quote}"` : 'N/A'}</div>
                            {result.evidenceQuote?.link && (
                              <a href={result.evidenceQuote.link} target="_blank" rel="noopener noreferrer" className="not-italic font-sans text-xs text-indigo-600 hover:text-indigo-900 mt-2 block font-medium">
                                [Source Link]
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Urgency & Claims Section */}
        {matrixResults.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">4. Urgency & Claims</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Specific persuasive language and credibility assertions.</p>
            </div>
            <div className="border-t border-gray-200 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matrixResults.map((result, idx) => {
                  const comp = competitors.find(c => c.url === result.url);
                  return (
                    <div key={idx} className="bg-gray-50 rounded-xl p-5 border border-gray-200 shadow-sm flex flex-col">
                      <div className="mb-4">
                        <span className="text-sm font-bold text-gray-900">{comp?.name || 'Unknown'}</span>
                        <p className="text-xs text-indigo-600 truncate">{result.url}</p>
                      </div>
                      
                      {result.urgencyAndClaims && result.urgencyAndClaims.length > 0 ? (
                        <div className="space-y-4">
                          {result.urgencyAndClaims.map((item, cIdx) => (
                            <div key={cIdx} className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                              <div className="flex justify-between items-start mb-2">
                                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                  item.category === 'Urgency' ? 'bg-red-100 text-red-700' :
                                  item.category === 'Claim' ? 'bg-blue-100 text-blue-700' :
                                  item.category === 'Both' ? 'bg-purple-100 text-purple-700' :
                                  'bg-gray-100 text-gray-700'
                                }`}>
                                  {item.category}
                                </span>
                                {item.link && (
                                  <a href={item.link} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 font-medium hover:underline">
                                    [Source]
                                  </a>
                                )}
                              </div>
                              <p className="text-sm text-gray-700 font-medium italic">"{item.text}"</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">No specific urgency or claims detected.</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Highest Savings Section */}
        {savingsResults.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">5. Highest Savings Gallery</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Visual evidence of hero banners and top deals.</p>
            </div>
            <div className="border-t border-gray-200 p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {savingsResults.map((result, idx) => {
                  const comp = competitors.find(c => c.url === result.url);
                  return (
                    <div key={idx} className="bg-gray-50 rounded-2xl overflow-hidden border border-gray-200 shadow-sm flex flex-col">
                      <div className="p-4 bg-white border-b border-gray-100 flex justify-between items-center">
                         <span className="font-bold text-gray-900">{comp?.name || 'Unknown'}</span>
                         <a href={result.url} target="_blank" rel="noopener noreferrer" className="text-xs text-indigo-600 hover:text-indigo-900 truncate max-w-[200px]">{result.url}</a>
                      </div>

                      {/* Screenshot Gallery */}
                      {result.screenshots && result.screenshots.length > 0 ? (
                        <div className="relative h-64 bg-black group">
                          <div className="flex h-full overflow-x-auto snap-x snap-mandatory no-scrollbar text-white">
                            {result.screenshots.map((shot, sIdx) => (
                              <div key={sIdx} className="flex-none w-full h-full snap-center flex items-center justify-center relative">
                                <img src={`data:image/png;base64,${shot}`} alt={`Slide ${sIdx + 1}`} className="max-h-full max-w-full object-contain" />
                                <div className="absolute top-2 right-2 bg-black/50 text-[10px] px-2 py-1 rounded-md">
                                  Slide {sIdx + 1} / {result.screenshots.length}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="h-64 flex items-center justify-center bg-gray-200 text-gray-400 italic">
                          No screenshots captured.
                        </div>
                      )}

                      {/* Savings Metadata */}
                      <div className="p-5 space-y-4 flex-grow">
                        {result.savings && result.savings.length > 0 ? (
                           <div className="grid grid-cols-1 gap-3">
                             {result.savings.map((val, i) => (
                               <div key={i} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm">
                                  <div className="flex flex-wrap gap-2 mb-2">
                                     <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight bg-green-100 text-green-700">{val.discountType}</span>
                                     <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight bg-blue-100 text-blue-700">{val.targetAudience}</span>
                                     <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight bg-gray-100 text-gray-600">{val.location}</span>
                                  </div>
                                  <p className="text-sm font-medium text-gray-800">{val.description}</p>
                               </div>
                             ))}
                           </div>
                        ) : (
                          <p className="text-sm text-gray-400 italic text-center py-4">No specific savings data extracted.</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Shipping & Delivery Comparison */}
        {shippingResults.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-12">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">6. Shipping & Delivery Comparison</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Comparative logistics and fulfillment options.</p>
            </div>
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
                    const comp = competitors.find(c => c.url === result.url);
                    return (
                      <tr key={idx}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                          {comp?.name || 'Unknown'}<br/>
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
          </div>
        )}
        {/* Flexible Payments Comparison */}
        {paymentsResults.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-12">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">7. Flexible Payments Comparison</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Financing, installment plans, and third-party payment providers.</p>
            </div>
            <div className="border-t border-gray-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Partners</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Financing Terms</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Threshold</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Store Credit Card</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Additional Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {paymentsResults.map((result, idx) => {
                    const comp = competitors.find(c => c.url === result.url);
                    return (
                      <tr key={idx}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                          {comp?.name || 'Unknown'}<br/>
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
          </div>
        )}
        {/* Rewards & Loyalty Comparison */}
        {rewardsResults.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-12">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">8. Rewards & Loyalty Comparison</h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">Rewards programs, cashback offers, loyalty clubs, and sweepstakes.</p>
            </div>
            <div className="border-t border-gray-200 overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Competitor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rewards</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Membership</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member Benefits</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sweepstakes</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rewardsResults.map((result, idx) => {
                    const comp = competitors.find(c => c.url === result.url);
                    return (
                      <tr key={idx}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900 align-top">
                          {comp?.name || 'Unknown'}<br/>
                          {result.error ? (
                            <span className="text-[10px] text-red-500 font-bold uppercase italic">{result.error}</span>
                          ) : (
                            <a href={result.sourceUrl || '#'} target="_blank" rel="noopener noreferrer" className="text-[10px] text-indigo-600 hover:text-indigo-900 font-mono">[Rewards Page]</a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900 font-bold align-top">
                          {result.programName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 align-top">
                          {result.rewards?.length > 0 ? (
                            <ul className="space-y-2">
                              {result.rewards.map((r, rIdx) => {
                                const type = (r.rewardType || '').toLowerCase();
                                let badgeClass = 'bg-gray-100 text-gray-700';
                                if (type === 'cashback') badgeClass = 'bg-green-100 text-green-700';
                                if (type === 'points') badgeClass = 'bg-blue-100 text-blue-700';
                                if (type === 'sweepstakes') badgeClass = 'bg-yellow-100 text-yellow-800';
                                if (type === 'discount') badgeClass = 'bg-purple-100 text-purple-700';

                                return (
                                  <li key={rIdx} className="leading-tight">
                                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight ${badgeClass} mr-2`}>
                                      {r.rewardType || 'Other'}
                                    </span>
                                    {r.percentage && <span className="text-green-700 font-bold text-sm mr-1">{r.percentage}</span>}
                                    <span className="text-sm text-gray-700">{r.description || ''}</span>
                                    {r.condition && <span className="text-xs text-gray-400 block ml-1 italic">{r.condition}</span>}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : <span className="text-gray-400 italic text-xs">None found</span>}
                        </td>
                        <td className="px-6 py-4 align-top text-center">
                          {result.membershipRequired ? (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700">REQUIRED</span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-green-100 text-green-700">OPEN</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-700 align-top max-w-xs">
                          {result.membershipBenefits || 'N/A'}
                        </td>
                        <td className="px-6 py-4 text-sm align-top max-w-xs">
                          {result.sweepstakes ? (
                            <span className="text-yellow-700 font-bold">{result.sweepstakes}</span>
                          ) : (
                            <span className="text-gray-400 italic">None active</span>
                          )}
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
          </div>
        )}
      </div>
    </main>
  );
}
