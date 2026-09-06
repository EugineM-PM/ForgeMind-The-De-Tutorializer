import React, { useState, useMemo } from 'react';
import { Search, ArrowRight, Layers, HelpCircle, Sparkles, Filter, X, Gauge } from 'lucide-react';
import { Concept, Domain } from '../types';
import { getConcepts, DOMAINS } from '../data/concepts';

interface ConceptExplorerPageProps {
  onSelectConcept: (concept: Concept) => void;
}

export const ConceptExplorerPage: React.FC<ConceptExplorerPageProps> = ({ onSelectConcept }) => {
  const [selectedDomain, setSelectedDomain] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const allConcepts = useMemo(() => getConcepts(undefined, undefined, true), []);

  const filteredConcepts = useMemo(() => {
    return allConcepts.filter((c) => {
      const matchesDomain = selectedDomain === 'All' || c.domain === selectedDomain;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.underlyingSkill.toLowerCase().includes(q) ||
        c.domain.toLowerCase().includes(q);
      return matchesDomain && matchesSearch;
    });
  }, [allConcepts, selectedDomain, searchQuery]);

  const domainCounts = useMemo(() => {
    const counts: Record<string, number> = { All: allConcepts.length };
    DOMAINS.forEach((d) => {
      counts[d] = allConcepts.filter((c) => c.domain === d).length;
    });
    return counts;
  }, [allConcepts]);

  return (
    <div id="concept-explorer-page" className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-8">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <div className="inline-flex items-center space-x-2 rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-xs font-semibold text-[#006BFF]">
              <span>Path A • Verified Concept Library</span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              What do you want to prove?
            </h1>
            <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
              Select a core concept to inspect the skill benchmark, calibrate your readiness, and tackle an unfamiliar novel challenge under zero-reference conditions.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-medium text-slate-500">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>{allConcepts.length} verified capability models ready</span>
          </div>
        </div>

        {/* Controls: Search and Filters */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="concept-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts or underlying skills..."
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-all focus:border-[#006BFF] focus:outline-none focus:ring-2 focus:ring-[#006BFF]/20"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Domain Category Filter Tabs (Pill style) */}
          <div className="flex flex-wrap items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            {['All', ...DOMAINS].map((domain) => {
              const isActive = selectedDomain === domain;
              const count = domainCounts[domain] || 0;
              return (
                <button
                  key={domain}
                  id={`filter-tab-${domain.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => setSelectedDomain(domain)}
                  className={`flex items-center space-x-2 rounded-full px-4 py-2 text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-50 text-[#006BFF] ring-1 ring-[#006BFF]/30 shadow-sm'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:text-slate-900'
                  }`}
                >
                  <span>{domain}</span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] ${
                      isActive ? 'bg-[#006BFF]/15 text-[#006BFF]' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Concept Cards Grid */}
      <div className="mt-8">
        {filteredConcepts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredConcepts.map((concept) => {
              return (
                <div
                  key={concept.id}
                  id={`concept-card-${concept.id}`}
                  onClick={() => onSelectConcept(concept)}
                  className="group relative flex flex-col justify-between rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card hover:shadow-xl hover:border-blue-300 transition-all cursor-pointer"
                >
                  <div>
                    {/* Top Row: Domain Tag & Difficulty */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase ${
                            concept.domain === 'Product Management'
                              ? 'bg-blue-50 text-[#006BFF] border border-blue-100'
                              : concept.domain === 'AI / Technology'
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          }`}
                        >
                          {concept.domain}
                        </span>
                        {concept.sourceType === 'USER_GENERATED' && (
                          <span className="rounded-full bg-amber-50 border border-amber-200 text-amber-800 px-2 py-0.5 text-[10px] font-semibold">
                            BYO Notes
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 flex items-center space-x-1 font-medium">
                        <Gauge className="h-3.5 w-3.5 text-blue-500" />
                        <span>{concept.approximateDifficulty || 'Applied'}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="mt-4 font-display text-lg font-bold text-slate-900 group-hover:text-[#006BFF] transition-colors leading-snug">
                      {concept.name}
                    </h3>

                    {/* Concept Core Description */}
                    <p className="mt-2 text-xs leading-relaxed text-slate-600 line-clamp-2">
                      {concept.description}
                    </p>

                    {/* Skill Tested */}
                    <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50/80 p-3">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[#006BFF] font-semibold">
                        Skill Tested
                      </div>
                      <p className="mt-1 text-xs text-slate-700 leading-snug line-clamp-2 font-medium">
                        "{concept.underlyingSkill}"
                      </p>
                    </div>
                  </div>

                  {/* Card Bottom CTA */}
                  <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                    <span className="text-xs text-slate-400 group-hover:text-slate-600 transition-colors">
                      Select for preview
                    </span>
                    <span className="flex items-center space-x-1 text-xs font-semibold text-[#006BFF] group-hover:text-[#0050C7]">
                      <span>View Preview</span>
                      <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div
            id="concepts-empty-state"
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-white py-16 text-center shadow-sm"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <Search className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900">No concepts found</h3>
            <p className="mt-1.5 max-w-sm text-xs text-slate-500">
              No matching modules for "{searchQuery}" in{' '}
              {selectedDomain === 'All' ? 'any domain' : selectedDomain}.
            </p>
            <div className="mt-5 flex items-center space-x-3">
              <button
                id="empty-state-reset-btn"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedDomain('All');
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                Reset Search & Filters
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
