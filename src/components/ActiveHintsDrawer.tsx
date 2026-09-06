import React, { useState } from 'react';
import { GeneratedChallenge, ChallengeHintState } from '../types';
import { HINT_TIER_DEFINITIONS } from '../services/hintService';
import { Lightbulb, ChevronDown, ChevronUp, Unlock, CheckCircle2 } from 'lucide-react';

interface ActiveHintsDrawerProps {
  challenge: GeneratedChallenge;
  hintState: ChallengeHintState;
}

export const ActiveHintsDrawer: React.FC<ActiveHintsDrawerProps> = ({
  challenge,
  hintState
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (hintState.current_tier === 0 || hintState.unlocked_tiers.length === 0) {
    return null;
  }

  return (
    <div
      id="active-hints-drawer"
      className="mb-6 rounded-2xl border border-blue-200 bg-blue-50/50 p-4 sm:p-5 transition-all shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-100 text-[#006BFF]">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#006BFF]">
                Active Guidance (Unlocked Tiers 1–{hintState.current_tier})
              </span>
              <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-[#006BFF] border border-blue-200">
                Retry Attempt Mode
              </span>
            </div>
            <p className="text-xs text-slate-500">
              Apply this guidance to revise your reasoning and address missing milestones.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors shadow-sm"
        >
          <span>{isExpanded ? 'Hide Guidance' : 'Show Guidance'}</span>
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-2.5 border-t border-blue-100 pt-3">
          {hintState.unlocked_tiers.map((tierNum) => {
            const tierDef = HINT_TIER_DEFINITIONS[tierNum];
            const storedHint = challenge.hints?.find((h) => h.tier === tierNum);
            if (!storedHint && tierNum !== 5) return null;

            return (
              <div
                key={tierNum}
                className="rounded-xl border border-slate-200 bg-white p-3.5 text-xs shadow-sm"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#006BFF] text-xs uppercase tracking-wider">
                      {tierDef.fullTitle}
                    </span>
                    {storedHint && (
                      <span className="text-xs text-slate-500 font-medium">
                        • {storedHint.title}
                      </span>
                    )}
                  </div>
                  <span className="inline-flex items-center space-x-1 text-xs font-semibold text-emerald-600">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Unlocked</span>
                  </span>
                </div>

                <p className="text-slate-700 text-xs leading-relaxed">
                  {storedHint ? storedHint.hint : challenge.referenceSolution}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
