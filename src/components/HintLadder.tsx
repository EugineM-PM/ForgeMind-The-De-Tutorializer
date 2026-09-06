import React, { useState } from 'react';
import {
  GeneratedChallenge,
  Concept,
  ChallengeHintState,
  LearnerAttempt,
  EvaluationVerdict
} from '../types';
import { HINT_TIER_DEFINITIONS } from '../services/hintService';
import {
  Lightbulb,
  Lock,
  Unlock,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Flag,
  ArrowRight,
  ShieldAlert,
  FileCheck,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface HintLadderProps {
  challenge: GeneratedChallenge;
  concept: Concept;
  hintState: ChallengeHintState;
  latestAttempt: LearnerAttempt | null;
  onRequestHint: (tier: number) => Promise<void>;
  onRetry: () => void;
  onFlagReview: (reason: string) => Promise<void>;
  isRequestingHint: boolean;
}

export const HintLadder: React.FC<HintLadderProps> = ({
  challenge,
  concept,
  hintState,
  latestAttempt,
  onRequestHint,
  onRetry,
  onFlagReview,
  isRequestingHint
}) => {
  const [showOverrideInput, setShowOverrideInput] = useState(false);
  const [overrideRationale, setOverrideRationale] = useState('');
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);
  const [overrideSuccess, setOverrideSuccess] = useState(false);

  const lastVerdict: EvaluationVerdict | null = latestAttempt?.evaluation?.verdict || null;
  const isCorrect = lastVerdict === 'CORRECT';
  const isNeedsClarification = lastVerdict === 'NEEDS_CLARIFICATION' || hintState.progression_frozen;

  const currentTier = hintState.current_tier;
  const nextTier = currentTier + 1;

  // Determine if next tier is requestable
  const canRequestNext =
    !isCorrect &&
    !isNeedsClarification &&
    nextTier <= 5 &&
    (nextTier === 1
      ? lastVerdict === 'PARTIALLY_CORRECT' || lastVerdict === 'WRONG_APPROACH'
      : hintState.attempts_since_last_hint >= 1 &&
        (lastVerdict === 'PARTIALLY_CORRECT' || lastVerdict === 'WRONG_APPROACH'));

  const needsRetryBeforeNext =
    !isCorrect &&
    !isNeedsClarification &&
    currentTier >= 1 &&
    nextTier <= 5 &&
    hintState.attempts_since_last_hint < 1;

  const handleFlagSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingOverride) return;
    setIsSubmittingOverride(true);
    try {
      await onFlagReview(overrideRationale);
      setOverrideSuccess(true);
      setShowOverrideInput(false);
    } catch (err) {
      console.error('Failed to submit evaluation override:', err);
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  return (
    <div id="hint-ladder-container" className="mt-8 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="flex items-center space-x-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-50 text-[#006BFF]">
            <Lightbulb className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="font-display text-lg font-bold text-slate-900">
                Progressive Hint Ladder
              </h3>
              <span className="rounded-full bg-blue-50 border border-blue-200 px-2.5 py-0.5 text-xs font-semibold text-[#006BFF]">
                Tier {currentTier} of 5
              </span>
              {hintState.solution_revealed && (
                <span className="rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  solution_revealed = true
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Strict step-by-step guidance. No automatic hints. Learner must explicitly request each tier after retrying.
            </p>
          </div>
        </div>

        {/* Retry Button Quick Access if unlocked */}
        {currentTier >= 1 && !isCorrect && (
          <button
            id="retry-with-hints-btn"
            type="button"
            onClick={onRetry}
            className="inline-flex items-center space-x-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
          >
            <RotateCcw className="h-3.5 w-3.5 text-[#006BFF]" />
            <span>
              {isNeedsClarification ? 'Clarify & Retry Attempt' : `Retry Challenge with Tier ${currentTier}`}
            </span>
          </button>
        )}
      </div>

      {/* STATUS: NEEDS_CLARIFICATION BANNER */}
      {isNeedsClarification && (
        <div id="clarification-frozen-banner" className="mt-5 rounded-2xl border border-purple-200 bg-purple-50/70 p-4">
          <div className="flex items-start space-x-3">
            <HelpCircle className="h-5 w-5 text-purple-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-900">
                  Hint Progression Frozen
                </span>
                <span className="text-xs text-purple-700">
                  Current State Preserved (Tier {currentTier})
                </span>
              </div>
              <p className="mt-1 text-xs text-purple-800 leading-relaxed">
                The evaluator returned <strong>NEEDS_CLARIFICATION</strong>. Your formulation lacked sufficient substantive explanation, constraints verification, or was ambiguous.
                Hint progression is strictly frozen and cannot advance until you clarify your submission.
              </p>
              <div className="mt-3 flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onRetry}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 px-3.5 py-1.5 text-xs font-semibold text-white transition-colors shadow-sm"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Clarify or Retry Submission</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STATUS: CORRECT BANNER */}
      {isCorrect && (
        <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 flex-shrink-0" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                Capability Verified — Full Independence Demonstrated
              </h4>
              <p className="text-xs text-emerald-800 mt-0.5">
                Your submission satisfied all structural milestones. No further hints are needed for this challenge.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5-TIER HINT LADDER LIST */}
      <div className="mt-6 space-y-4">
        {[1, 2, 3, 4, 5].map((tierNum) => {
          const tierDef = HINT_TIER_DEFINITIONS[tierNum];
          const isUnlocked = hintState.unlocked_tiers.includes(tierNum);
          const isNext = tierNum === nextTier;
          const isFuture = tierNum > nextTier;
          const storedHint = challenge.hints?.find((h) => h.tier === tierNum);

          return (
            <div
              key={tierNum}
              id={`hint-tier-${tierNum}`}
              className={`rounded-2xl border transition-all duration-200 ${
                isUnlocked
                  ? tierNum === 5
                    ? 'border-emerald-200 bg-emerald-50/30'
                    : 'border-blue-200 bg-blue-50/20'
                  : isNext
                  ? canRequestNext
                    ? 'border-[#006BFF]/40 bg-blue-50/10'
                    : 'border-slate-200 bg-slate-50/40'
                  : 'border-slate-200/60 bg-slate-50/20 opacity-60'
              }`}
            >
              {/* Tier Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-5">
                <div className="flex items-center space-x-3.5">
                  <div
                    className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold ${
                      isUnlocked
                        ? tierNum === 5
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-blue-100 text-[#006BFF]'
                        : isNext && canRequestNext
                        ? 'bg-slate-100 text-[#006BFF] border border-blue-200'
                        : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {isUnlocked ? <Unlock className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold tracking-wider uppercase text-slate-900">
                        {tierDef.fullTitle}
                      </span>
                      <span className="text-xs text-slate-500 font-normal">
                        — {tierDef.shortDesc}
                      </span>
                    </div>

                    {storedHint && (
                      <span className="text-xs font-medium text-[#006BFF] block mt-0.5">
                        {storedHint.title}
                      </span>
                    )}
                  </div>
                </div>

                {/* Status / Actions */}
                <div className="flex items-center space-x-3 sm:self-center">
                  {isUnlocked && (
                    <span className="inline-flex items-center space-x-1 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs text-emerald-700 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Unlocked</span>
                    </span>
                  )}

                  {/* Action for the NEXT tier */}
                  {!isUnlocked && isNext && !isCorrect && (
                    <>
                      {canRequestNext ? (
                        <button
                          id={`request-hint-${tierNum}-btn`}
                          type="button"
                          disabled={isRequestingHint}
                          onClick={() => onRequestHint(tierNum)}
                          className={`inline-flex items-center space-x-2 rounded-xl px-4 py-2 text-xs font-semibold transition-all shadow-sm ${
                            tierNum === 5
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-[#006BFF] text-white hover:bg-[#005CE6]'
                          }`}
                        >
                          <Unlock className="h-3.5 w-3.5" />
                          <span>
                            {isRequestingHint
                              ? 'Unlocking...'
                              : tierNum === 5
                              ? 'Reveal Reference Solution (Tier 5)'
                              : `Request Hint ${tierNum} (${tierDef.name})`}
                          </span>
                        </button>
                      ) : needsRetryBeforeNext ? (
                        <div className="flex items-center space-x-2 text-xs text-slate-600">
                          <span className="text-slate-400">Locked:</span>
                          <button
                            type="button"
                            onClick={onRetry}
                            className="inline-flex items-center space-x-1 text-[#006BFF] hover:underline font-semibold text-xs"
                          >
                            <span>Submit retry attempt with Tier {currentTier} first</span>
                            <ArrowRight className="h-3 w-3" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 font-medium">
                          {isNeedsClarification ? 'Frozen until clarified' : 'Locked — Awaiting attempt evaluation'}
                        </span>
                      )}
                    </>
                  )}

                  {/* Future tiers */}
                  {isFuture && (
                    <span className="text-xs text-slate-400 font-medium">
                      Locked — Future tiers remain hidden
                    </span>
                  )}
                </div>
              </div>

              {/* Unlocked Content Section */}
              {isUnlocked && (
                <div className="border-t border-slate-100 bg-slate-50/60 p-5 space-y-3">
                  {tierNum < 5 && storedHint && (
                    <div>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {storedHint.hint}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-slate-200/60 pt-3">
                        <div className="flex items-center space-x-2 text-xs text-slate-500">
                          <span>Independence impact:</span>
                          <span className="text-amber-700 font-medium">{storedHint.penaltyDescription}</span>
                        </div>

                        {!isCorrect && (
                          <button
                            type="button"
                            onClick={onRetry}
                            className="inline-flex items-center space-x-1.5 rounded-xl bg-[#006BFF] hover:bg-[#005CE6] text-white px-3.5 py-1.5 text-xs font-semibold transition-colors shadow-sm"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Apply Hint & Retry</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* TIER 5: FULL MODEL SOLUTION REVEAL */}
                  {tierNum === 5 && (
                    <div id="solution-reveal-panel" className="space-y-4">
                      <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                        <div className="flex items-center space-x-2 text-emerald-800">
                          <FileCheck className="h-4 w-4" />
                          <h4 className="text-xs font-bold uppercase tracking-wider">
                            Full Model Reference Solution & Trade-Off Defense
                          </h4>
                        </div>
                        <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
                          solution_revealed = true
                        </span>
                      </div>

                      {storedHint && (
                        <div className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs text-slate-700 leading-relaxed shadow-sm">
                          <strong className="text-slate-900 block mb-1">Model Synthesis:</strong>
                          {storedHint.hint}
                        </div>
                      )}

                      <div className="rounded-xl border border-slate-200 bg-slate-900 p-4 shadow-sm">
                        <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 block mb-2">
                          Reference Solution
                        </span>
                        <pre className="overflow-x-auto text-xs font-mono text-slate-200 whitespace-pre-wrap leading-relaxed max-h-96">
                          {challenge.referenceSolution}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* STEP 5: EVALUATION OVERRIDE (Available After Tier 4) */}
      {currentTier >= 4 && (
        <div id="evaluation-override-card" className="mt-8 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Flag className="h-4 w-4 text-[#006BFF]" />
                <h4 className="text-sm font-bold text-slate-900 font-display">
                  Still think your answer was valid?
                </h4>
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                If your technical approach was sound, adhered to all scenario constraints, or used a legitimate alternative reasoning path despite the automated evaluation verdict, you can flag this evaluation for instructor audit.
              </p>
            </div>

            {hintState.evaluation_flagged || overrideSuccess ? (
              <div className="inline-flex items-center space-x-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#006BFF]">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Flagged for Review</span>
              </div>
            ) : (
              <button
                id="open-override-btn"
                type="button"
                onClick={() => setShowOverrideInput(!showOverrideInput)}
                className="inline-flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
              >
                <span>Flag Evaluation / Request Review</span>
                {showOverrideInput ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>

          {/* If already flagged */}
          {(hintState.evaluation_flagged || overrideSuccess) && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-slate-700">
              <div className="flex items-center justify-between text-xs font-semibold text-[#006BFF] mb-1">
                <span>Evaluation Flag Persisted in Evidence Ledger</span>
                <span>{new Date(hintState.flagged_at || Date.now()).toLocaleDateString()}</span>
              </div>
              <p className="text-xs text-slate-600">
                Rationale: &ldquo;{hintState.flagged_review_reason || overrideRationale || 'Learner flagged evaluation for instructor review.'}&rdquo;
              </p>
            </div>
          )}

          {/* Override Form */}
          {showOverrideInput && !hintState.evaluation_flagged && !overrideSuccess && (
            <form onSubmit={handleFlagSubmit} className="mt-4 border-t border-slate-200 pt-4 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Why do you believe your answer was valid? (Defense / Trade-Off Rationale)
                </label>
                <textarea
                  value={overrideRationale}
                  onChange={(e) => setOverrideRationale(e.target.value)}
                  placeholder="Explain which constraints your response satisfied and why your technical alternative is legitimate..."
                  rows={3}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:border-[#006BFF] focus:outline-none focus:ring-1 focus:ring-[#006BFF]"
                />
              </div>

              <div className="flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowOverrideInput(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingOverride || !overrideRationale.trim()}
                  className="inline-flex items-center space-x-1.5 rounded-xl bg-[#006BFF] px-4 py-2 text-xs font-semibold text-white hover:bg-[#005CE6] transition-colors disabled:opacity-50 shadow-sm"
                >
                  <Flag className="h-3 w-3" />
                  <span>{isSubmittingOverride ? 'Persisting Flag...' : 'Confirm & Persist Flag'}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
