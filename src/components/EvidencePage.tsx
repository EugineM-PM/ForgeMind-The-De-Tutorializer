import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  ArrowRight,
  Lock,
  FileText,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Sparkles,
  Layers,
  Check,
  AlertTriangle,
  HelpCircle,
  Clock,
  Quote,
  Trash2,
  SlidersHorizontal
} from 'lucide-react';
import { ViewTab, LearnerAttempt, ConceptCapabilityEvidence } from '../types';
import {
  getAllAttempts,
  seedSampleEvidenceForRice,
  clearAllAttempts
} from '../services/attemptService';
import {
  getAllConceptEvidenceProfiles,
  getConceptEvidenceProfileById
} from '../services/evidenceService';
import { INITIAL_CONCEPTS } from '../data/concepts';

interface EvidencePageProps {
  onNavigate: (tab: ViewTab) => void;
}

export const EvidencePage: React.FC<EvidencePageProps> = ({ onNavigate }) => {
  const [attempts, setAttempts] = useState<LearnerAttempt[]>(() => getAllAttempts());
  const [profiles, setProfiles] = useState<ConceptCapabilityEvidence[]>(() =>
    getAllConceptEvidenceProfiles()
  );
  const [selectedConceptFilter, setSelectedConceptFilter] = useState<string>('ALL');
  const [expandedAuditConceptId, setExpandedAuditConceptId] = useState<string | null>(null);
  const [expandedAttemptId, setExpandedAttemptId] = useState<string | null>(null);
  const [showSeedSuccess, setShowSeedSuccess] = useState<boolean>(false);

  // Reload profiles whenever attempts change
  const refreshEvidence = () => {
    const freshAttempts = getAllAttempts();
    setAttempts(freshAttempts);
    setProfiles(getAllConceptEvidenceProfiles());
  };

  const handleSeedRiceExample = () => {
    seedSampleEvidenceForRice();
    refreshEvidence();
    setSelectedConceptFilter('ALL');
    setShowSeedSuccess(true);
    setTimeout(() => setShowSeedSuccess(false), 3000);
  };

  const handleClearEvidence = () => {
    if (window.confirm('Clear all recorded capability evidence? This action cannot be undone.')) {
      clearAllAttempts();
      refreshEvidence();
    }
  };

  const toggleAuditConcept = (conceptId: string) => {
    setExpandedAuditConceptId(expandedAuditConceptId === conceptId ? null : conceptId);
  };

  const toggleAttemptExpand = (attemptId: string) => {
    setExpandedAttemptId(expandedAttemptId === attemptId ? null : attemptId);
  };

  // Filter profiles
  const visibleProfiles =
    selectedConceptFilter === 'ALL'
      ? profiles
      : profiles.filter((p) => p.concept_id === selectedConceptFilter);

  return (
    <div id="evidence-page" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-slate-200/80 pb-6">
        <div>
          <div className="inline-flex items-center space-x-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#006BFF]">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Capability Evidence Ledger</span>
          </div>
          <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            My Evidence
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
            ForgeMind does not reduce performance to a generic numerical score or arbitrary completion certificate.
            Every attempt becomes grounded evidence of what you can actually apply unassisted.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 self-start sm:self-auto">
          <button
            id="seed-sample-evidence-btn"
            onClick={handleSeedRiceExample}
            className="flex items-center space-x-1.5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold text-[#006BFF] hover:bg-blue-100 transition-colors shadow-sm"
            title="Load the 4-attempt RICE Prioritization evidence profile"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Load RICE Sample (4 Attempts)</span>
          </button>

          {attempts.length > 0 && (
            <button
              onClick={handleClearEvidence}
              className="flex items-center space-x-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-500 hover:text-rose-600 hover:border-rose-200 transition-colors shadow-sm"
              title="Reset all recorded attempts"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {showSeedSuccess && (
        <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800 flex items-center justify-between transition-all">
          <span>Loaded 4 realistic challenges/attempts for <strong>RICE Prioritization</strong> matching the Step 6 evidence rubric.</span>
          <span className="text-[10px] font-mono text-emerald-700 font-bold px-2 py-0.5 bg-emerald-100 rounded-full">SUCCESS</span>
        </div>
      )}

      {/* Concept Filter (when multiple concepts have evidence) */}
      {profiles.length > 1 && (
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-slate-400 uppercase flex items-center space-x-1 mr-2">
            <SlidersHorizontal className="h-3 w-3" />
            <span>Concepts:</span>
          </span>
          <button
            onClick={() => setSelectedConceptFilter('ALL')}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
              selectedConceptFilter === 'ALL'
                ? 'bg-[#006BFF] text-white shadow-sm'
                : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
            }`}
          >
            All Concepts ({profiles.length})
          </button>
          {profiles.map((p) => (
            <button
              key={p.concept_id}
              onClick={() => setSelectedConceptFilter(p.concept_id)}
              className={`rounded-full px-3.5 py-1 text-xs font-semibold transition-all ${
                selectedConceptFilter === p.concept_id
                  ? 'bg-[#006BFF] text-white shadow-sm'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {p.concept_name} ({p.challenges_attempted})
            </button>
          ))}
        </div>
      )}

      {/* Main Evidence Content */}
      {visibleProfiles.length > 0 ? (
        <div className="mt-8 space-y-8">
          {visibleProfiles.map((profile) => (
            <div
              key={profile.concept_id}
              id={`concept-evidence-${profile.concept_id}`}
              className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card transition-all hover:shadow-card-hover"
            >
              {/* Concept Title & Context Header */}
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-100 pb-5">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold uppercase text-slate-600">
                      {profile.domain}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      Concept ID: {profile.concept_id}
                    </span>
                  </div>
                  <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                    {profile.concept_name}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <div className="text-sm font-bold text-[#006BFF]">
                    Challenges attempted: {profile.challenges_attempted}
                  </div>
                  <div className="text-xs text-slate-400 font-medium mt-0.5">
                    {profile.autonomous_attempts} autonomous · {profile.total_attempts - profile.autonomous_attempts} guided
                  </div>
                </div>
              </div>

              {/* Underlying Skill Model */}
              <div className="mt-4 text-xs text-slate-600">
                <span className="text-slate-400 uppercase text-[10px] font-semibold block mb-0.5">
                  Capability Model
                </span>
                <span className="italic text-slate-700 font-medium">{profile.underlying_skill}</span>
              </div>

              {/* Evidence Categories (Demonstrated vs Developing vs Insufficient Evidence) */}
              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Demonstrated Section */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
                  <div className="flex items-center justify-between mb-3 border-b border-emerald-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-emerald-600 font-bold">✓</span>
                      <h3 className="text-xs font-semibold tracking-wider text-emerald-800 uppercase">
                        Demonstrated
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-emerald-700">
                      {profile.demonstrated.length} capability milestone{profile.demonstrated.length !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {profile.demonstrated.length > 0 ? (
                    <ul className="space-y-3">
                      {profile.demonstrated.map((item, idx) => (
                        <li key={idx} className="space-y-1">
                          <div className="flex items-start space-x-2 text-sm text-slate-900">
                            <span className="text-emerald-600 font-bold select-none">✓</span>
                            <span className="font-semibold text-slate-900">{item.capability}</span>
                          </div>
                          <div className="ml-5 text-xs text-slate-600 flex items-center space-x-2">
                            <span>{item.notes}</span>
                          </div>
                          {item.evidenceQuotes.length > 0 && (
                            <div className="ml-5 mt-1 rounded-xl bg-white p-3 text-xs text-slate-700 border border-emerald-100 shadow-sm font-mono">
                              <span className="text-slate-400 block text-[9px] uppercase font-bold mb-0.5">Grounded citation:</span>
                              &ldquo;{item.evidenceQuotes[0]}&rdquo;
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">
                      No capabilities verified as demonstrated yet.
                    </p>
                  )}
                </div>

                {/* 2. Developing Section */}
                <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
                  <div className="flex items-center justify-between mb-3 border-b border-amber-200 pb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-amber-600 font-bold">△</span>
                      <h3 className="text-xs font-semibold tracking-wider text-amber-800 uppercase">
                        Developing
                      </h3>
                    </div>
                    <span className="text-xs font-semibold text-amber-700">
                      {profile.developing.length} area{profile.developing.length !== 1 ? 's' : ''} for growth
                    </span>
                  </div>

                  {profile.developing.length > 0 ? (
                    <ul className="space-y-3">
                      {profile.developing.map((item, idx) => (
                        <li key={idx} className="space-y-1">
                          <div className="flex items-start space-x-2 text-sm text-slate-900">
                            <span className="text-amber-600 font-bold select-none">△</span>
                            <span className="font-semibold text-slate-900">{item.capability}</span>
                          </div>
                          <div className="ml-5 text-xs text-amber-900 font-medium">
                            {item.notes}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-xs text-slate-400 italic py-2">
                      No active developing milestones flagged.
                    </p>
                  )}
                </div>
              </div>

              {/* 3. Insufficient Evidence Section (if applicable) */}
              {profile.insufficient_evidence.length > 0 && (
                <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <HelpCircle className="h-4 w-4 text-slate-400" />
                    <span className="text-xs uppercase text-slate-600 font-semibold tracking-wider">
                      Insufficient Evidence ({profile.insufficient_evidence.length})
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mb-2">
                    These milestones require additional distinct challenges with specific boundary conditions to corroborate:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {profile.insufficient_evidence.map((item, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center space-x-1.5 rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700 shadow-sm"
                      >
                        <span className="text-slate-400">○</span>
                        <span>{item.capability}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* "Also show" Metrics Matrix (Exact Match to Step 6 Specification) */}
              <div className="mt-6 border-t border-slate-100 pt-5">
                <div className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 mb-3">
                  Observed Attempt Profile (Latest Challenge)
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {/* Confidence before challenge */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                      Confidence before challenge
                    </span>
                    <div className="mt-1 text-xl font-bold text-slate-900">
                      {profile.confidence_before_challenge} / 5
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Metacognitive calibration
                    </span>
                  </div>

                  {/* Observed outcome */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                      Observed outcome
                    </span>
                    <div className="mt-1">
                      {profile.observed_outcome ? (
                        <span
                          className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase ${
                            profile.observed_outcome === 'CORRECT'
                              ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                              : profile.observed_outcome === 'PARTIALLY_CORRECT'
                              ? 'bg-amber-50 border border-amber-200 text-amber-700'
                              : profile.observed_outcome === 'WRONG_APPROACH'
                              ? 'bg-rose-50 border border-rose-200 text-rose-700'
                              : 'bg-purple-50 border border-purple-200 text-purple-700'
                          }`}
                        >
                          {profile.observed_outcome.replace('_', ' ')}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">None</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {profile.evaluator_confidence ? `${Math.round(profile.evaluator_confidence * 100)}% evaluator certainty` : 'Grounded evaluation'}
                    </span>
                  </div>

                  {/* Hints used */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                      Hints used
                    </span>
                    <div className="mt-1 text-xl font-bold text-slate-900">
                      {profile.hints_used}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {profile.hints_used === 0 ? 'Fully Autonomous' : `Tier ${profile.hints_used} reached`}
                    </span>
                  </div>

                  {/* Retries & Solution Reveal */}
                  <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
                    <span className="text-[10px] font-semibold uppercase text-slate-400 block">
                      Solution revealed
                    </span>
                    <div className="mt-1 text-base font-semibold">
                      {profile.solution_revealed ? (
                        <span className="text-amber-600">Yes (Scaffolded)</span>
                      ) : (
                        <span className="text-emerald-600">No (Protected)</span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {profile.retry_count} retries logged
                    </span>
                  </div>
                </div>
              </div>

              {/* Audit Ledger Expandable Button */}
              <div className="mt-6 border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <button
                  onClick={() => toggleAuditConcept(profile.concept_id)}
                  className="flex items-center space-x-2 text-xs font-semibold text-[#006BFF] hover:text-[#005CE6] transition-colors"
                >
                  <FileText className="h-3.5 w-3.5" />
                  <span>
                    {expandedAuditConceptId === profile.concept_id
                      ? 'Hide Attempt Audit Trail'
                      : `Inspect Audit Trail (${profile.attempts.length} Recorded Attempt${profile.attempts.length !== 1 ? 's' : ''})`}
                  </span>
                  {expandedAuditConceptId === profile.concept_id ? (
                    <ChevronUp className="h-3.5 w-3.5" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5" />
                  )}
                </button>

                <div className="text-xs text-slate-400 font-medium">
                  {profile.attempts.length > 1
                    ? 'Multiple attempts accumulated into profile'
                    : 'Provisional evidence — 1 attempt'}
                </div>
              </div>

              {/* Expanded Immutable Attempt Records */}
              {expandedAuditConceptId === profile.concept_id && (
                <div className="mt-4 space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5">
                  <div className="flex items-center justify-between text-xs text-slate-500 border-b border-slate-200 pb-2 font-semibold uppercase">
                    <span>IMMUTABLE EVIDENCE LEDGER</span>
                    <span>{profile.attempts.length} ENTRIES</span>
                  </div>

                  {profile.attempts.map((att) => {
                    const isAttExpanded = expandedAttemptId === att.attempt_id;
                    const dateStr = new Date(att.created_at).toLocaleString();
                    const verdictStr = att.verdict || att.evaluation?.verdict || 'PENDING';
                    const hintsVal = att.hint_tier_reached ?? att.hint_tier_used ?? 0;

                    return (
                      <div
                        key={att.attempt_id}
                        className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-xs font-bold text-slate-900">
                                Attempt #{att.attempt_number}
                              </span>
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase ${
                                  verdictStr === 'CORRECT'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : verdictStr === 'PARTIALLY_CORRECT'
                                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                    : verdictStr === 'WRONG_APPROACH'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-purple-50 text-purple-700 border border-purple-200'
                                }`}
                              >
                                {verdictStr.replace('_', ' ')}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                                Pre-Confidence: {att.confidence_before_attempt} / 5
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600">
                                {hintsVal === 0 ? '0 Hints' : `Tier ${hintsVal} Hint`}
                              </span>
                              {att.solution_revealed && (
                                <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                                  Solution Revealed
                                </span>
                              )}
                              {att.evaluation_flag && (
                                <span className="rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                                  Flagged Review
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-400">
                              ID: {att.attempt_id} • Date: {dateStr} • Retries: {att.retry_count}
                            </div>
                          </div>

                          <button
                            onClick={() => toggleAttemptExpand(att.attempt_id)}
                            className="self-end sm:self-auto rounded-lg p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                          >
                            {isAttExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </button>
                        </div>

                        {isAttExpanded && (
                          <div className="mt-4 border-t border-slate-100 pt-4 space-y-3">
                            {/* Demonstrations in this attempt */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                              <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3">
                                <span className="text-[10px] font-bold text-emerald-800 block uppercase mb-1">
                                  Demonstrated Capabilities
                                </span>
                                {(att.demonstrated_capabilities || att.evaluation?.demonstrated_capabilities || []).length > 0 ? (
                                  <ul className="space-y-1">
                                    {(att.demonstrated_capabilities || att.evaluation?.demonstrated_capabilities || []).map((c, i) => (
                                      <li key={i} className="flex items-start space-x-1.5 text-slate-800">
                                        <span className="text-emerald-600 font-bold">✓</span>
                                        <span>{c}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">None verified.</span>
                                )}
                              </div>

                              <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-3">
                                <span className="text-[10px] font-bold text-amber-800 block uppercase mb-1">
                                  Missing Capabilities
                                </span>
                                {(att.missing_capabilities || att.evaluation?.missing_capabilities || []).length > 0 ? (
                                  <ul className="space-y-1">
                                    {(att.missing_capabilities || att.evaluation?.missing_capabilities || []).map((c, i) => (
                                      <li key={i} className="flex items-start space-x-1.5 text-slate-700">
                                        <span className="text-amber-600 font-bold">△</span>
                                        <span>{c}</span>
                                      </li>
                                    ))}
                                  </ul>
                                ) : (
                                  <span className="text-slate-400 italic text-[11px]">None flagged.</span>
                                )}
                              </div>
                            </div>

                            {/* Grounded Evidence Excerpts */}
                            {(att.evidence || att.evaluation?.evidence || []).length > 0 && (
                              <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                                <span className="text-[10px] font-bold text-slate-700 block uppercase mb-1.5">
                                  Grounded Citations
                                </span>
                                <div className="space-y-1.5">
                                  {(att.evidence || att.evaluation?.evidence || []).map((ev, i) => (
                                    <div key={i} className="text-xs font-mono text-slate-800 bg-white p-2 rounded-lg border border-slate-200/70 shadow-sm">
                                      {ev}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Feedback */}
                            {att.evaluation?.brief_feedback && (
                              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-700">
                                <span className="text-[10px] font-bold text-slate-500 block uppercase mb-1">
                                  Evaluator Note
                                </span>
                                {att.evaluation.brief_feedback}
                              </div>
                            )}

                            {/* Unedited Response */}
                            <div>
                              <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                                Learner Formulation
                              </span>
                              <pre className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 text-xs font-mono text-slate-800 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                                {att.response}
                              </pre>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        /* Empty State: Prompt to Prove or Load Sample */
        <div className="mt-10 rounded-3xl border border-slate-200/90 bg-white p-8 text-center sm:p-12 shadow-card">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#006BFF]">
            <Lock className="h-6 w-6" />
          </div>

          <h2 className="mt-5 font-display text-2xl font-bold text-slate-900">
            No capability evidence recorded yet.
          </h2>

          <p className="mx-auto mt-2.5 max-w-md text-sm leading-relaxed text-slate-600">
            ForgeMind does not issue arbitrary points or participation badges. Complete your first unreferenced challenge to record verifiable capability evidence.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              id="start-first-proof-btn"
              onClick={() => onNavigate('prove')}
              className="flex items-center space-x-2 rounded-xl bg-[#006BFF] px-6 py-3 text-xs font-semibold text-white transition-all hover:bg-[#005CE6] shadow-sm"
            >
              <span>Start Your First Challenge</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={handleSeedRiceExample}
              className="flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#006BFF]" />
              <span>Load RICE Sample Profile</span>
            </button>
          </div>
        </div>
      )}

      {/* Evidence Framework Principles (Clean, anti-gamified) */}
      <div className="mt-14 border-t border-slate-200 pt-8">
        <div className="text-xs font-semibold tracking-widest text-slate-400 uppercase mb-3">
          Capability Assessment Principles
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 text-xs leading-relaxed text-slate-600">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="font-semibold text-slate-900 mb-1 flex items-center space-x-1.5">
              <span className="text-emerald-600 font-bold">✓</span>
              <span>Evidence Over Scores</span>
            </div>
            <p>
              We reject arbitrary 0–100 scores. Instead, we record specific demonstrated milestones vs developing areas observable in novel scenarios.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="font-semibold text-slate-900 mb-1 flex items-center space-x-1.5">
              <span className="text-amber-600 font-bold">△</span>
              <span>Accumulation Over Single Attempts</span>
            </div>
            <p>
              Mastery cannot be claimed from one attempt. Multiple attempts for the same concept accumulate evidence across varied constraints and domain contexts.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="font-semibold text-slate-900 mb-1 flex items-center space-x-1.5">
              <Lock className="h-3.5 w-3.5 text-[#006BFF]" />
              <span>Concealed Reference Integrity</span>
            </div>
            <p>
              Hidden evaluation prompts and reference solutions remain strictly concealed to protect the integrity of future unreferenced tests.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
