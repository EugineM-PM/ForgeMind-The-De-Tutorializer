import React from 'react';
import { ArrowLeft, ArrowRight, ShieldCheck, Lock, Award, Gauge, Sparkles, BookOpen } from 'lucide-react';
import { Concept, ViewTab } from '../types';

interface ConceptPreviewPageProps {
  concept: Concept;
  onBackToExplorer: () => void;
  onProveThis: () => void;
  onNavigate: (tab: ViewTab) => void;
}

export const ConceptPreviewPage: React.FC<ConceptPreviewPageProps> = ({
  concept,
  onBackToExplorer,
  onProveThis,
  onNavigate
}) => {
  const domainColors = {
    'Product Management': 'border-blue-200 bg-blue-50 text-[#006BFF]',
    'AI / Technology': 'border-purple-200 bg-purple-50 text-purple-700',
    'SQL / Data': 'border-emerald-200 bg-emerald-50 text-emerald-700'
  };

  const difficultyColor = 
    concept.approximateDifficulty?.includes('Advanced') || concept.difficultyLevels.includes('Advanced')
      ? 'text-amber-800 border-amber-200 bg-amber-50'
      : 'text-blue-800 border-blue-200 bg-blue-50';

  return (
    <div id="concept-preview-page" className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <button
          id="preview-back-btn"
          onClick={onBackToExplorer}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Concept Explorer</span>
        </button>

        <div className="flex items-center space-x-2 text-xs font-medium text-slate-400">
          <span>Path A: Verified Library</span>
          <span className="text-slate-300">/</span>
          <span className="text-slate-700 font-semibold">{concept.name}</span>
        </div>
      </div>

      {/* Main Concept Preview Card */}
      <div className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-card">
        {/* Domain Badge & Status */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${
              domainColors[concept.domain] || 'border-slate-200 bg-slate-100 text-slate-700'
            }`}
          >
            {concept.domain}
          </span>

          <div className="inline-flex items-center space-x-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <Lock className="h-3 w-3" />
            <span>Reference Stripped Upon Entry</span>
          </div>
        </div>

        {/* 1. Concept Name */}
        <h1
          id="preview-concept-name"
          className="mt-6 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl"
        >
          {concept.name}
        </h1>

        {/* 2. Short Description */}
        <p
          id="preview-concept-description"
          className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg"
        >
          {concept.description}
        </p>

        {/* 3. Skill Being Tested & 4. Approximate Challenge Difficulty */}
        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Skill Being Tested */}
          <div
            id="preview-skill-tested"
            className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 transition-colors"
          >
            <div className="flex items-center space-x-2 text-[#006BFF]">
              <Award className="h-4 w-4" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                Skill Being Tested
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-900">
              "{concept.underlyingSkill}"
            </p>
            <div className="mt-3 text-xs text-slate-500">
              Evaluates structural thinking under authentic real-world constraints.
            </div>
          </div>

          {/* Approximate Challenge Difficulty */}
          <div
            id="preview-challenge-difficulty"
            className="rounded-2xl border border-slate-100 bg-slate-50/80 p-6 transition-colors"
          >
            <div className="flex items-center space-x-2 text-slate-600">
              <Gauge className="h-4 w-4 text-[#006BFF]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider">
                Approximate Difficulty
              </span>
            </div>

            <div className="mt-3 flex items-center space-x-2">
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${difficultyColor}`}
              >
                {concept.approximateDifficulty || 'Applied (Practitioner)'}
              </span>
            </div>

            {/* Difficulty Scale Dots */}
            <div className="mt-4 flex items-center space-x-2 text-xs text-slate-500">
              <span>Spectrum:</span>
              {['Foundational', 'Applied', 'Advanced'].map((level) => {
                const isIncluded = concept.difficultyLevels.includes(level as any);
                return (
                  <span
                    key={level}
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                      isIncluded
                        ? 'bg-blue-50 text-[#006BFF] ring-1 ring-[#006BFF]/20 font-semibold'
                        : 'text-slate-400 bg-slate-100'
                    }`}
                  >
                    {level}
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Challenge Ground Rules (Transparent execution contract) */}
        <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/70 p-6">
          <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-slate-700">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>What happens when you click "Prove This"</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3 text-xs text-slate-600">
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <strong className="text-slate-900 font-semibold block mb-1">1. Novel Scenario</strong>
              You receive an unfamiliar edge-case situation never seen in standard tutorials.
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <strong className="text-slate-900 font-semibold block mb-1">2. Zero Cribbing</strong>
              Notes, formulas, and search shortcuts are stripped. You solve from synthesis.
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <strong className="text-slate-900 font-semibold block mb-1">3. Capability Audit</strong>
              Your response is evaluated against milestone reasoning and trade-off defense.
            </div>
          </div>
        </div>

        {/* Primary CTA Transition */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-6 sm:flex-row">
          <button
            id="preview-choose-another-btn"
            onClick={onBackToExplorer}
            className="w-full text-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors sm:w-auto"
          >
            ← Explore other concepts
          </button>

          <button
            id="prove-this-btn"
            onClick={onProveThis}
            className="group flex w-full items-center justify-center space-x-2 rounded-xl bg-[#006BFF] px-8 py-3.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#005CE6] active:scale-[0.99] sm:w-auto"
          >
            <span>Prove This</span>
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};
