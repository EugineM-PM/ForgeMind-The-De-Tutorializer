/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { ViewTab, Concept } from './types';
import { INITIAL_CONCEPTS, getConceptById } from './data/concepts';
import { Header } from './components/Header';
import { HomePage } from './components/HomePage';
import { ConceptExplorerPage } from './components/ConceptExplorerPage';
import { ConceptPreviewPage } from './components/ConceptPreviewPage';
import { StudyMaterialPage } from './components/StudyMaterialPage';
import { ChallengePage } from './components/ChallengePage';
import { EvidencePage } from './components/EvidencePage';

export default function App() {
  const [currentTab, setCurrentTab] = useState<ViewTab>(() => {
    const saved = sessionStorage.getItem('forgemind_tab');
    if (saved && ['home', 'prove', 'concept-preview', 'material', 'challenge', 'evidence'].includes(saved)) {
      return saved as ViewTab;
    }
    return 'home';
  });

  const [activeConcept, setActiveConcept] = useState<Concept>(() => {
    const savedConceptId = sessionStorage.getItem('forgemind_concept_id');
    if (savedConceptId) {
      const found = getConceptById(savedConceptId);
      if (found) return found;
    }
    return INITIAL_CONCEPTS[0];
  });

  useEffect(() => {
    sessionStorage.setItem('forgemind_tab', currentTab);
  }, [currentTab]);

  useEffect(() => {
    if (activeConcept) {
      sessionStorage.setItem('forgemind_concept_id', activeConcept.id);
    }
  }, [activeConcept]);

  const handleNavigate = (tab: ViewTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Flow: Concept Explorer -> Select Concept -> Concept Preview
  const handleSelectConcept = (concept: Concept) => {
    setActiveConcept(concept);
    setCurrentTab('concept-preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Flow: Concept Preview -> "Prove This" -> Challenge experience
  const handleProveThis = () => {
    setCurrentTab('challenge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectFeaturedConcept = (conceptId: string) => {
    const concept = getConceptById(conceptId);
    if (concept) {
      setActiveConcept(concept);
    }
    setCurrentTab('concept-preview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleConceptConfirmed = (concept: Concept) => {
    setActiveConcept(concept);
    setCurrentTab('challenge');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-slate-900 flex flex-col selection:bg-[#006BFF] selection:text-white">
      {/* Navigation Header */}
      <Header currentTab={currentTab} onNavigate={handleNavigate} />

      {/* Main Viewport */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            onNavigate={handleNavigate}
            onSelectFeaturedConcept={handleSelectFeaturedConcept}
          />
        )}

        {currentTab === 'prove' && (
          <ConceptExplorerPage onSelectConcept={handleSelectConcept} />
        )}

        {currentTab === 'concept-preview' && (
          <ConceptPreviewPage
            concept={activeConcept}
            onBackToExplorer={() => handleNavigate('prove')}
            onProveThis={handleProveThis}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'material' && (
          <StudyMaterialPage
            onNavigate={handleNavigate}
            onConceptConfirmed={handleConceptConfirmed}
          />
        )}

        {currentTab === 'challenge' && (
          <ChallengePage
            concept={activeConcept}
            onBackToProve={() => handleNavigate('concept-preview')}
            onNavigate={handleNavigate}
          />
        )}

        {currentTab === 'evidence' && (
          <EvidencePage onNavigate={handleNavigate} />
        )}
      </main>

      {/* Clean Modern Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <span className="font-display font-semibold text-slate-900">ForgeMind</span>
            <span className="text-slate-300">|</span>
            <span className="italic text-slate-600">"You learned it. Now prove you can use it."</span>
          </div>

          <div className="flex items-center space-x-6 text-slate-600 font-medium">
            <button
              onClick={() => handleNavigate('prove')}
              className="hover:text-brand-500 transition-colors"
            >
              Prove
            </button>
            <button
              onClick={() => handleNavigate('material')}
              className="hover:text-brand-500 transition-colors"
            >
              Study Material
            </button>
            <button
              onClick={() => handleNavigate('evidence')}
              className="hover:text-brand-500 transition-colors"
            >
              My Evidence
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

