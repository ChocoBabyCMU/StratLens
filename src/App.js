// App.js
import React, { useState, useEffect } from 'react';
import { Search, Filter, Globe, BarChart2, Layers, MessageSquare, Shield, Menu, X, ChevronRight, AlertTriangle, Download, Share2 } from 'lucide-react';

// NewsAPI.org API key - you'll need to replace this with your own
// Sign up at https://newsapi.org/register to get a free API key
const NEWS_API_KEY = '9a085c68010446329dc5142fb4edc5b0';
const NEWS_API_URL = 'https://newsapi.org/v2';

// Helper function to determine source type
const determineSourceType = (source) => {
  if (!source) return 'Other';
  
  // Comprehensive mapping of news sources by type
  const sourceCategories = {
    Western: [
      // US Sources
      'new york times', 'nyt', 'washington post', 'wsj', 'wall street journal', 
      'cnn', 'fox news', 'msnbc', 'abc news', 'cbs news', 'nbc news', 'usa today',
      'politico', 'the hill', 'axios', 'bloomberg', 'business insider', 'forbes', 
      'huffington post', 'huffpost', 'vox', 'vice', 'the atlantic', 'time magazine',
      'newsweek', 'national review', 'the new yorker', 'the federalist', 'slate',
      'defenseone', 'defense news', 'military times', 'stars and stripes', 'the daily beast',
      
      // UK Sources
      'bbc', 'guardian', 'telegraph', 'financial times', 'the times', 'independent', 
      'daily mail', 'sky news', 'the economist', 'reuters', 'apnews', 'associated press',
      
      // European Sources
      'deutsche welle', 'france 24', 'der spiegel', 'le monde', 'le figaro', 'afp',
      'euronews', 'politico.eu', 'eu observer', 'euractiv',
      
      // Australian/NZ Sources
      'abc.net.au', 'the australian', 'sydney morning herald', 'smh.com', 'news.com.au',
      'nzherald', 'tvnz', 'rnz'
    ],
    
    regional: [
      // Singapore
      'channel news asia', 'cna', 'straits times', 'straitstimes', 'today online',
      'todayonline', 'mothership', 'zaobao', 'the new paper', 'tnp', 'berita harian',
      'tamil murasu', 'singapore government', 'mindef.gov.sg',
      
      // Southeast Asia
      'south china morning post', 'scmp', 'jakarta post', 'the star malaysia', 
      'new straits times', 'nst.com', 'malay mail', 'bangkok post', 'the nation thailand',
      'vietnam news', 'tuoi tre', 'manila bulletin', 'philippine daily inquirer', 'inquirer.net',
      'abs-cbn', 'rappler', 'the phnom penh post', 'khmer times', 'irrawaddy', 'coconuts',
      
      // East Asia
      'japan times', 'asahi shimbun', 'yomiuri', 'mainichi', 'kyodo news',
      'korea herald', 'korea times', 'chosun ilbo', 'dong-a ilbo', 'joongang daily',
      'taipei times', 'the china post', 'focus taiwan', 'hong kong free press', 'hkfp'
    ],
    
    international: [
      'al jazeera', 'france24', 'russia today', 'rt.com', 'sputnik', 'dw.com',
      'deutsche welle', 'trt world', 'turkish radio', 'nhk world', 'arirang',
      'press tv', 'efe', 'swissinfo', 'kyodo', 'the japan times', 
      'middle east eye', 'the jerusalem post', 'haaretz', 'dawn.com',
      'the hindu', 'times of india', 'gulf news', 'arab news',
      'african news agency', 'africa news'
    ],
    
    'state-owned': [
      // China
      'xinhua', 'global times', 'china daily', 'people\'s daily', 'cgtn', 'cctv',
      'china news service', 'china.org.cn', 'ecns.cn',
      
      // Russia
      'tass', 'ria novosti', 'rossiyskaya gazeta', 'russia-1', 'russia-24',
      
      // Middle East
      'al arabiya', 'saudi press agency', 'wam', 'emirates news agency',
      'qatar news agency', 'kuna', 'petra news', 'saba news',
      
      // Other regions
      'bernama', 'antara news', 'vietnam news agency', 'yonhap', 'kazinform',
      'belta', 'akipress', 'anadolu agency', 'trt', 'doordarshan', 'all india radio',
      'itar-tass', 'interfax', 'kcna'
    ],
    
    'think tank': [
      'foreign policy', 'foreign affairs', 'the diplomat', 'war on the rocks', 
      'rsis', 'lowy institute', 'brookings', 'csis', 'rand corporation',
      'heritage foundation', 'council on foreign relations', 'cfr.org', 'chatham house',
      'royal united services', 'rusi.org', 'carnegie endowment', 'sipri',
      'international crisis group', 'stratfor', 'jane\'s', 'jamestown foundation',
      'center for naval analyses', 'iiss.org', 'aspi', 'wilson center',
      'belfer center', 'institute for defense analyses', 'hudson institute'
    ]
  };
  
  // Normalize source name for comparison
  const sourceLower = source.toLowerCase().trim();
  
  // Check each category
  for (const [category, sourceList] of Object.entries(sourceCategories)) {
    if (sourceList.some(s => sourceLower.includes(s))) {
      return category;
    }
  }
  
  // Special cases based on country domains
  if (sourceLower.endsWith('.sg') || 
      sourceLower.includes('singapore') || 
      sourceLower.includes('spore')) {
    return 'regional';
  }
  
  if (sourceLower.endsWith('.my') || 
      sourceLower.endsWith('.id') || 
      sourceLower.endsWith('.th') || 
      sourceLower.endsWith('.vn') || 
      sourceLower.endsWith('.ph') || 
      sourceLower.endsWith('.kh') || 
      sourceLower.endsWith('.mm') || 
      sourceLower.endsWith('.la') || 
      sourceLower.endsWith('.bn')) {
    return 'regional';
  }
  
  if (sourceLower.endsWith('.cn') || 
      sourceLower.endsWith('.ru') || 
      sourceLower.includes('gov.') || 
      sourceLower.includes('.gov')) {
    return 'state-owned';
  }
  
  // News agencies are often considered international
  if (sourceLower.includes('news agency') || 
      sourceLower.includes('press agency') || 
      sourceLower.includes('newswire')) {
    return 'international';
  }
  
  // Default to 'Other' if no mapping is found
  return 'Other';
};

// Helper function to analyze tone (this would be replaced with NLP in a real app)
const analyzeTone = (title, description) => {
  if (!title && !description) return 'neutral';
  
  const fullText = `${title || ''} ${description || ''}`.toLowerCase();
  
  // More comprehensive keyword lists for better tone analysis
  const positiveKeywords = [
    // Positive assessment
    'enhance', 'strengthen', 'improve', 'success', 'positive', 'advantage', 'benefit', 
    'efficient', 'effective', 'progress', 'achievement', 'advancement', 'breakthrough',
    'innovation', 'solution', 'opportunity', 'partnership', 'cooperation', 'collaboration',
    'alliance', 'prosperity', 'growth', 'development', 'stability', 'secure', 'robust',
    
    // Positive actions
    'bolster', 'boost', 'elevate', 'upgrade', 'modernize', 'advance', 'excel',
    'succeed', 'accomplish', 'achieve', 'facilitate', 'enable', 'empower',
    
    // Positive adjectives
    'successful', 'valuable', 'beneficial', 'promising', 'favorable', 'positive',
    'significant', 'important', 'crucial', 'essential', 'vital', 'key',
    'strategic', 'innovative', 'cutting-edge', 'state-of-the-art', 'leading',
    'world-class', 'premier', 'exceptional', 'outstanding'
  ];
  
  const negativeKeywords = [
    // Negative assessment
    'concern', 'risk', 'threat', 'danger', 'issue', 'problem', 'critic', 'criticism',
    'question', 'fear', 'warn', 'warning', 'challenge', 'difficulty', 'tension',
    'conflict', 'dispute', 'controversy', 'crisis', 'emergency', 'disaster',
    'catastrophe', 'failure', 'setback', 'decline', 'deterioration', 'instability',
    
    // Negative actions
    'oppose', 'reject', 'condemn', 'denounce', 'criticize', 'blame', 'accuse',
    'undermine', 'weaken', 'damage', 'harm', 'hurt', 'violate', 'infringe',
    
    // Negative adjectives
    'dangerous', 'harmful', 'threatening', 'problematic', 'controversial',
    'contentious', 'disputed', 'divisive', 'hostile', 'aggressive', 'provocative',
    'destabilizing', 'worrying', 'concerning', 'troubling', 'alarming', 'disturbing',
    'inadequate', 'insufficient', 'flawed', 'defective', 'deficient', 'poor'
  ];
  
  // Neutral terms that shouldn't influence the analysis
  const neutralizingKeywords = [
    'say', 'says', 'said', 'announce', 'announces', 'announced', 'report', 'reports', 'reported',
    'state', 'states', 'stated', 'claim', 'claims', 'claimed', 'according'
  ];
  
  // Words that can negate meaning
  const negationWords = ['not', 'no', 'never', 'neither', 'nor', 'none', 'unlikely', 'deny', 'denies', 'denied'];
  
  // Check for neutralizing terms
  const hasNeutralizers = neutralizingKeywords.some(term => fullText.includes(term));
  
  // Weight neutralizing terms slightly
  const neutralWeight = hasNeutralizers ? 0.8 : 1;
  
  // Count positive and negative keywords, accounting for negation
  let positiveCount = 0;
  let negativeCount = 0;
  
  // Check for positive words, considering negations
  positiveKeywords.forEach(keyword => {
    if (fullText.includes(keyword)) {
      // Check if there's a negation word within 5 words before the keyword
      const keywordIndex = fullText.indexOf(keyword);
      const priorText = fullText.substring(Math.max(0, keywordIndex - 30), keywordIndex);
      const hasNegation = negationWords.some(negWord => priorText.includes(` ${negWord} `));
      
      // If negated, count as negative instead
      if (hasNegation) {
        negativeCount++;
      } else {
        positiveCount++;
      }
    }
  });
  
  // Check for negative words, considering negations
  negativeKeywords.forEach(keyword => {
    if (fullText.includes(keyword)) {
      // Check if there's a negation word within 5 words before the keyword
      const keywordIndex = fullText.indexOf(keyword);
      const priorText = fullText.substring(Math.max(0, keywordIndex - 30), keywordIndex);
      const hasNegation = negationWords.some(negWord => priorText.includes(` ${negWord} `));
      
      // If negated, count as positive instead
      if (hasNegation) {
        positiveCount++;
      } else {
        negativeCount++;
      }
    }
  });
  
  // Apply neutralizing weight
  positiveCount *= neutralWeight;
  negativeCount *= neutralWeight;
  
  // Context-specific bias for defense articles
  // Defense articles often have a security focus which can skew negative
  const defenseContext = 1.2; // Slight positive adjustment for defense context
  
  positiveCount *= defenseContext;
  
  // Determine tone based on weighted counts
  if (positiveCount > negativeCount + 1) return 'supportive';
  if (negativeCount > positiveCount + 1) return 'critical';
  return 'neutral';
};

// Format article data from API to our app's format
const formatArticle = (article, index) => {
  return {
    id: index,
    title: article.title,
    source: article.source.name,
    sourceType: determineSourceType(article.source.name),
    date: new Date(article.publishedAt).toISOString().split('T')[0],
    tone: analyzeTone(article.title, article.description || ''),
    snippet: article.description || 'No description available',
    url: article.url,
    image: article.urlToImage || '/api/placeholder/500/300'
  };
};

// Tone badge component
const ToneBadge = ({ tone }) => {
  const colors = {
    supportive: "bg-emerald-100 text-emerald-800 border-emerald-200",
    neutral: "bg-blue-100 text-blue-800 border-blue-200",
    critical: "bg-rose-100 text-rose-800 border-rose-200"
  };
  
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${colors[tone]}`}>
      {tone.charAt(0).toUpperCase() + tone.slice(1)}
    </span>
  );
};

// Source type badge component
const SourceTypeBadge = ({ type }) => {
  const colors = {
    regional: "bg-indigo-100 text-indigo-800 border-indigo-200",
    Western: "bg-violet-100 text-violet-800 border-violet-200",
    international: "bg-amber-100 text-amber-800 border-amber-200",
    "think tank": "bg-slate-100 text-slate-800 border-slate-200",
    "state-owned": "bg-teal-100 text-teal-800 border-teal-200",
    "Other": "bg-gray-100 text-gray-800 border-gray-200"
  };
  
  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full border ${colors[type] || colors.Other}`}>
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </span>
  );
};

// Article card component
const ArticleCard = ({ article, onCompare, isSelected }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow duration-200">
      <div className="h-40 overflow-hidden relative">
        <img 
          src={article.image} 
          alt={article.title} 
          className="w-full h-40 object-cover"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/api/placeholder/500/300";
          }}
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
          <span className="text-white text-xs font-medium">{article.source}</span>
        </div>
      </div>
      <div className="p-4">
        <div className="mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">{article.title}</h3>
          <p className="text-xs text-gray-500">{article.date}</p>
        </div>
        <div className="flex gap-2 mb-3 flex-wrap">
          <ToneBadge tone={article.tone} />
          <SourceTypeBadge type={article.sourceType} />
        </div>
        <p className="text-sm text-gray-700 mb-4 line-clamp-3">{article.snippet}</p>
        <div className="flex justify-between items-center">
          <button 
            onClick={() => onCompare(article)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors duration-200 ${isSelected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'border border-blue-600 text-blue-600 hover:bg-blue-50'}`}
          >
            {isSelected ? 'Selected' : 'Compare'}
          </button>
          <a 
            href={article.url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center"
          >
            Read <ChevronRight className="w-4 h-4 ml-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

// Article comparison component
const ComparisonView = ({ articles, onClear }) => {
  if (articles.length === 0) return null;
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6 border border-blue-100">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 flex items-center">
          <Share2 className="w-5 h-5 mr-2 text-blue-600" />
          Perspective Comparison
        </h2>
        <div className="flex gap-2">
          <button className="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200 flex items-center">
            <Download className="w-4 h-4 mr-1" /> Export
          </button>
          <button 
            onClick={onClear}
            className="text-sm px-3 py-1.5 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
          >
            Clear
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {articles.map(article => (
          <div key={article.id} className="border rounded-md p-4 bg-gray-50 hover:bg-blue-50 transition-colors duration-200">
            <div className="flex justify-between mb-2">
              <h3 className="font-medium text-gray-900 flex items-center">
                {article.source}
              </h3>
              <div className="flex gap-2">
                <ToneBadge tone={article.tone} />
                <SourceTypeBadge type={article.sourceType} />
              </div>
            </div>
            <h4 className="font-semibold mb-2 text-blue-800">{article.title}</h4>
            <p className="text-sm text-gray-700">{article.snippet}</p>
          </div>
        ))}
      </div>
      {articles.length < 2 && (
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
          <AlertTriangle className="w-5 h-5 text-amber-500 mr-2 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            Select at least one more article to see a meaningful comparison of different perspectives.
          </p>
        </div>
      )}
    </div>
  );
};

// Filters component
const Filters = ({ onFilterChange, activeFilters }) => {
  const [toneFilters, setToneFilters] = useState(activeFilters.tones || []);
  const [sourceFilters, setSourceFilters] = useState(activeFilters.sources || []);
  
  const handleToneChange = (tone) => {
    const newFilters = toneFilters.includes(tone)
      ? toneFilters.filter(t => t !== tone)
      : [...toneFilters, tone];
    
    setToneFilters(newFilters);
    onFilterChange({ tones: newFilters, sources: sourceFilters });
  };
  
  const handleSourceChange = (source) => {
    const newFilters = sourceFilters.includes(source)
      ? sourceFilters.filter(s => s !== source)
      : [...sourceFilters, source];
    
    setSourceFilters(newFilters);
    onFilterChange({ tones: toneFilters, sources: newFilters });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-100">
      <h3 className="font-semibold mb-4 flex items-center text-gray-800">
        <Filter className="w-4 h-4 mr-2 text-blue-600" /> Filters
      </h3>
      
      <div className="mb-5">
        <h4 className="text-sm font-medium mb-3 text-gray-700">Tone</h4>
        <div className="flex flex-wrap gap-2">
          {['supportive', 'neutral', 'critical'].map(tone => (
            <button
              key={tone}
              onClick={() => handleToneChange(tone)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors duration-200 ${
                toneFilters.includes(tone) 
                  ? tone === 'supportive' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' : 
                    tone === 'neutral' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                    'bg-rose-100 text-rose-800 border-rose-200'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {tone.charAt(0).toUpperCase() + tone.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-3 text-gray-700">Source Type</h4>
        <div className="flex flex-wrap gap-2">
          {['regional', 'Western', 'international', 'think tank', 'state-owned', 'Other'].map(source => (
            <button
              key={source}
              onClick={() => handleSourceChange(source)}
              className={`px-3 py-1.5 text-xs rounded-md border transition-colors duration-200 ${
                sourceFilters.includes(source) 
                  ? source === 'regional' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 
                    source === 'Western' ? 'bg-violet-100 text-violet-800 border-violet-200' : 
                    source === 'international' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                    source === 'think tank' ? 'bg-slate-100 text-slate-800 border-slate-200' :
                    source === 'state-owned' ? 'bg-teal-100 text-teal-800 border-teal-200' :
                    'bg-gray-100 text-gray-800 border-gray-200'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {source.charAt(0).toUpperCase() + source.slice(1)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Analytics component
const Analytics = ({ articles }) => {
  // Count articles by tone
  const toneCounts = articles.reduce((acc, article) => {
    acc[article.tone] = (acc[article.tone] || 0) + 1;
    return acc;
  }, {});
  
  // Count articles by source type
  const sourceTypeCounts = articles.reduce((acc, article) => {
    acc[article.sourceType] = (acc[article.sourceType] || 0) + 1;
    return acc;
  }, {});
  
  return (
    <div className="bg-white rounded-lg shadow-md p-5 mb-6 border border-gray-100">
      <h3 className="font-semibold mb-4 flex items-center text-gray-800">
        <BarChart2 className="w-4 h-4 mr-2 text-blue-600" /> Media Analysis
      </h3>
      
      <div className="mb-5">
        <h4 className="text-sm font-medium mb-3 text-gray-700">Coverage by Tone</h4>
        <div className="flex h-8 rounded-full overflow-hidden shadow-inner bg-gray-100">
          {Object.entries(toneCounts).map(([tone, count]) => {
            const colors = {
              supportive: "bg-emerald-500",
              neutral: "bg-blue-500",
              critical: "bg-rose-500"
            };
            const percentage = (count / articles.length) * 100;
            
            return (
              <div 
                key={tone}
                className={`${colors[tone]} relative flex items-center justify-center`}
                style={{ width: `${percentage}%` }}
                title={`${tone}: ${count} articles (${percentage.toFixed(1)}%)`}
              >
                {percentage > 15 && (
                  <span className="text-xs font-medium text-white">{Math.round(percentage)}%</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="flex mt-3 text-xs gap-4">
          {Object.entries(toneCounts).map(([tone, count]) => (
            <div key={tone} className="flex items-center">
              <span className={`inline-block w-3 h-3 mr-1 rounded-full ${
                tone === 'supportive' ? 'bg-emerald-500' : 
                tone === 'neutral' ? 'bg-blue-500' : 'bg-rose-500'
              }`}></span>
              <span className="font-medium">{tone.charAt(0).toUpperCase() + tone.slice(1)}:</span> {count}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <h4 className="text-sm font-medium mb-3 text-gray-700">Coverage by Source Type</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {Object.entries(sourceTypeCounts).map(([type, count]) => {
            const percentage = (count / articles.length) * 100;
            const colors = {
              regional: "bg-indigo-500",
              Western: "bg-violet-500",
              international: "bg-amber-500",
              "think tank": "bg-slate-500",
              "state-owned": "bg-teal-500",
              "Other": "bg-gray-500"
            };
            
            return (
              <div key={type} className="flex flex-col">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium flex items-center">
                    <span className={`inline-block w-2 h-2 mr-1 rounded-full ${colors[type] || colors.Other}`}></span>
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </span>
                  <span>{count} ({Math.round(percentage)}%)</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 shadow-inner">
                  <div 
                    className={`h-2 rounded-full ${colors[type] || colors.Other}`}
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Loading component
const LoadingIndicator = () => (
  <div className="flex justify-center items-center py-12">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
  </div>
);

// Error message component
const ErrorMessage = ({ message }) => (
  <div className="bg-rose-50 border border-rose-200 rounded-lg p-4 mb-6">
    <div className="flex items-start">
      <AlertTriangle className="w-5 h-5 text-rose-500 mr-3 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-rose-800 font-medium">Error Loading Articles</h3>
        <p className="text-rose-700 text-sm mt-1">{message}</p>
      </div>
    </div>
  </div>
);

// Main application component
const StratLens = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearched, setIsSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedArticles, setSelectedArticles] = useState([]);
  const [filters, setFilters] = useState({ tones: [], sources: [] });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const fetchArticles = async (query) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // For defense-related queries, adding some context to get more relevant results
      const searchContext = query.toLowerCase().includes('defense') || 
                            query.toLowerCase().includes('military') ? 
                            query : `${query} defense military`;
      
      // Fetch articles from NewsAPI
      const response = await fetch(
        `${NEWS_API_URL}/everything?q=${encodeURIComponent(searchContext)}&sortBy=relevancy&language=en&apiKey=${NEWS_API_KEY}`
      );
      
      if (!response.ok) {
        throw new Error(`News API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.status === 'error') {
        throw new Error(data.message || 'Unknown error from News API');
      }
      
      // Transform and format the articles
      const formattedArticles = data.articles
        .filter(article => article.title && article.description)
        .map((article, index) => formatArticle(article, index));
      
      setSearchResults(formattedArticles);
      setIsSearched(true);
    } catch (err) {
      console.error('Error fetching news:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSearch = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      fetchArticles(searchQuery);
    }
  };
  
  const handleCompare = (article) => {
    if (selectedArticles.find(a => a.id === article.id)) {
      setSelectedArticles(selectedArticles.filter(a => a.id !== article.id));
    } else {
      if (selectedArticles.length < 4) {
        setSelectedArticles([...selectedArticles, article]);
      }
    }
  };
  
  const clearComparison = () => {
    setSelectedArticles([]);
  };
  
  const applyFilters = (articles) => {
    if (filters.tones.length === 0 && filters.sources.length === 0) {
      return articles;
    }
    
    return articles.filter(article => {
      const toneMatch = filters.tones.length === 0 || filters.tones.includes(article.tone);
      const sourceMatch = filters.sources.length === 0 || filters.sources.includes(article.sourceType);
      return toneMatch && sourceMatch;
    });
  };
  
  const filteredResults = applyFilters(searchResults);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Shield className="w-6 h-6 mr-2 text-blue-300" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">StratLens</h1>
            </div>
            
            <div className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-sm text-blue-100 hover:text-white transition-colors duration-200 flex items-center font-medium">
                <Globe className="w-4 h-4 mr-2" /> Dashboard
              </a>
              <a href="#" className="text-sm text-blue-100 hover:text-white transition-colors duration-200 flex items-center font-medium">
                <Layers className="w-4 h-4 mr-2" /> Collections
              </a>
              <a href="#" className="text-sm text-blue-100 hover:text-white transition-colors duration-200 flex items-center font-medium">
                <MessageSquare className="w-4 h-4 mr-2" /> Reports
              </a>
            </div>
            
            <button 
              className="md:hidden text-blue-100 hover:text-white transition-colors duration-200"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </header>
      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="bg-blue-800 text-white md:hidden border-t border-blue-700 shadow-lg">
          <div className="container mx-auto px-4 py-2">
            <div className="flex flex-col space-y-3 py-2">
              <a href="#" className="py-2 px-3 hover:bg-blue-700 rounded-md transition-colors duration-200 flex items-center">
                <Globe className="w-4 h-4 mr-2" /> Dashboard
              </a>
              <a href="#" className="py-2 px-3 hover:bg-blue-700 rounded-md transition-colors duration-200 flex items-center">
                <Layers className="w-4 h-4 mr-2" /> Collections
              </a>
              <a href="#" className="py-2 px-3 hover:bg-blue-700 rounded-md transition-colors duration-200 flex items-center">
                <MessageSquare className="w-4 h-4 mr-2" /> Reports
              </a>
            </div>
          </div>
        </div>
      )}
      
      {/* Search bar */}
      <div className="bg-gradient-to-b from-blue-800 via-blue-700 to-blue-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-10">
          <h2 className="text-3xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-blue-200">Media Analysis Platform</h2>
          <p className="mb-8 max-w-2xl text-blue-100 leading-relaxed">
            Search for defense topics to analyze coverage across different media sources,
            identify narrative patterns, and compare perspectives.
          </p>
          
          <form onSubmit={handleSearch} className="flex w-full max-w-3xl">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search defense topics, regional issues, or military developments..."
              className="flex-grow px-4 py-3 rounded-l-lg text-gray-800 border-0 shadow-inner focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-r-lg flex items-center font-medium transition-colors duration-200 shadow-md"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Searching...
                </div>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" /> Search
                </>
              )}
            </button>
          </form>
        </div>
      </div>
      
      {/* Main content */}
      <main className="container mx-auto px-4 py-8">
        {isSearched && (
          <>
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800">
                Results for "{searchQuery}"
              </h2>
              <p className="text-gray-600">
                {filteredResults.length} articles from various sources
              </p>
            </div>
            
            {/* Error message */}
            {error && <ErrorMessage message={error} />}
            
            {/* Loading indicator */}
            {isLoading ? (
              <LoadingIndicator />
            ) : (
              <>
                {/* Comparison view */}
                {selectedArticles.length > 0 && (
                  <ComparisonView articles={selectedArticles} onClear={clearComparison} />
                )}
                
                {searchResults.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    {/* Left sidebar */}
                    <div className="lg:col-span-1">
                      <Filters onFilterChange={setFilters} activeFilters={filters} />
                      <Analytics articles={searchResults} />
                    </div>
                    
                    {/* Results */}
                    <div className="lg:col-span-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filteredResults.map(article => (
                          <ArticleCard 
                            key={article.id} 
                            article={article} 
                            onCompare={handleCompare}
                            isSelected={selectedArticles.some(a => a.id === article.id)}
                          />
                        ))}
                      </div>
                      
                      {filteredResults.length === 0 && (
                        <div className="bg-white rounded-lg shadow-md p-8 text-center">
                          <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                            <Search className="w-8 h-8 text-blue-600" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">No results found</h3>
                          <p className="text-gray-600">
                            Try adjusting your filters or search term to find more articles.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ) : !error && (
                  <div className="bg-white rounded-lg shadow-md p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-4">
                      <AlertTriangle className="w-8 h-8 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No articles found</h3>
                    <p className="text-gray-600">
                      Try searching for a different term or broadening your search criteria.
                    </p>
                  </div>
                )}
              </>
            )}
          </>
        )}
        
        {!isSearched && (
          <div className="text-center py-20">
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6">
              <Search className="w-12 h-12 text-blue-600" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-3">
              Search for Defense Topics
            </h2>
            <p className="text-gray-600 max-w-lg mx-auto">
              Enter keywords related to defense, security, or military developments 
              to analyze media coverage across different sources.
            </p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-10">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <Shield className="w-5 h-5 mr-2 text-blue-700" />
              <span className="text-sm text-gray-600 font-semibold">
                StratLens | Singapore Ministry of Defence
              </span>
            </div>
            <div className="text-sm text-gray-500">
              For official use only • Developed for MINDEF DXOs • 2025
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StratLens;
