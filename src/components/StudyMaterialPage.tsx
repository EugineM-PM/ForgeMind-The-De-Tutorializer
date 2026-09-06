import React, { useState, useRef } from 'react';
import {
  FileText,
  FileCode,
  UploadCloud,
  FileAudio,
  Video,
  Youtube,
  Sparkles,
  ArrowRight,
  Info,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  Check,
  Layers,
  Lock,
  Clock,
  ChevronRight,
  RefreshCw,
  Upload
} from 'lucide-react';
import {
  ViewTab,
  Concept,
  StudyMaterialSourceType,
  ContentProcessingStatus,
  NormalizedStudyContent,
  ExtractedConceptCandidate
} from '../types';
import {
  createNormalizedContent,
  extractConceptFromStudyMaterial,
  SAMPLE_STUDY_MATERIALS
} from '../services/normalizedContentService';
import { saveConfirmedUserConcept } from '../services/userConceptService';
import {
  STUDY_MATERIAL_LIMITS,
  validateStudyMaterialFile,
  sanitizeText,
  stripHtml
} from '../utils/sanitizer';

interface StudyMaterialPageProps {
  onNavigate: (tab: ViewTab) => void;
  onConceptConfirmed: (concept: Concept) => void;
}

export const StudyMaterialPage: React.FC<StudyMaterialPageProps> = ({
  onNavigate,
  onConceptConfirmed
}) => {
  const [activeSourceType, setActiveSourceType] = useState<StudyMaterialSourceType>('paste_text');
  const [materialTitle, setMaterialTitle] = useState<string>('');
  const [pastedText, setPastedText] = useState<string>('');
  const [processingStatus, setProcessingStatus] = useState<ContentProcessingStatus>('READY');
  const [normalizedContent, setNormalizedContent] = useState<NormalizedStudyContent | null>(null);
  const [extractedCandidate, setExtractedCandidate] = useState<ExtractedConceptCandidate | null>(null);
  const [extractionError, setExtractionError] = useState<string | null>(null);

  // Load pre-configured sample text
  const handleLoadSample = (sampleId: string) => {
    const sample = SAMPLE_STUDY_MATERIALS.find((s) => s.id === sampleId);
    if (!sample) return;
    setActiveSourceType('paste_text');
    setMaterialTitle(sample.title);
    setPastedText(sample.text);
    setExtractedCandidate(null);
    setExtractionError(null);
    setProcessingStatus('READY');
  };

  // Process text and extract concept
  const handleProcessAndExtract = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pastedText.trim()) return;

    setExtractionError(null);
    setExtractedCandidate(null);
    setProcessingStatus('PROCESSING');

    // Step 7: Create common normalized-content object
    const normalized = createNormalizedContent({
      source_type: activeSourceType,
      source_name: materialTitle.trim() || 'Untitled Study Material',
      raw_text: pastedText,
      language: 'en',
      status: 'PROCESSING'
    });

    setNormalizedContent(normalized);

    try {
      const result = await extractConceptFromStudyMaterial(normalized);

      if (!result.success || !result.candidate) {
        setProcessingStatus('FAILED');
        setExtractionError(result.error || 'Unable to extract concept from the provided material.');
        return;
      }

      setProcessingStatus('READY');
      setExtractedCandidate(result.candidate);
    } catch (err: any) {
      setProcessingStatus('FAILED');
      setExtractionError(err.message || 'Processing pipeline error.');
    }
  };

  // Step 7 User Confirmation
  const handleConfirmConcept = () => {
    if (!extractedCandidate || !normalizedContent) return;

    // Store the concept as user-owned with source_type = USER_GENERATED
    const savedConcept = saveConfirmedUserConcept(extractedCandidate, normalizedContent);

    // Route it directly into the existing Challenge Engine
    onConceptConfirmed(savedConcept);
  };

  // Reset to choose another
  const handleChooseAnother = () => {
    setExtractedCandidate(null);
    setExtractionError(null);
    setProcessingStatus('READY');
  };

  // Word count and char count for UI
  const charCount = pastedText.length;
  const wordCount = pastedText.trim() ? pastedText.trim().split(/\s+/).length : 0;

  return (
    <div id="study-material-page" className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="border-b border-slate-200/80 pb-6">
        <div className="inline-flex items-center space-x-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#006BFF]">
          <Layers className="h-3.5 w-3.5" />
          <span>Door 2: Bring My Own Study Material</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Bring what you studied
        </h1>
        <p className="mt-2 text-sm text-slate-600 max-w-2xl leading-relaxed">
          Feed notes, articles, or documentation you just studied. ForgeMind normalizes the content, extracts the latent capability model, and prepares an unreferenced novel challenge.
        </p>
      </div>

      {/* STATE 1: Extraction Candidate Returned */}
      {extractedCandidate ? (
        <div className="mt-8 space-y-6">
          {extractedCandidate.is_confident ? (
            /* High Confidence: Concept Confirmation Card */
            <div
              id="concept-confirmation-card"
              className="rounded-3xl border border-blue-200 bg-white p-6 sm:p-8 shadow-card"
            >
              <div className="flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#006BFF]">
                <Sparkles className="h-4 w-4" />
                <span>We found this concept</span>
              </div>

              {/* Concept Name */}
              <div className="mt-4">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Concept:
                </span>
                <h2 className="font-display text-2xl sm:text-3xl font-bold text-slate-900">
                  {extractedCandidate.concept_name}
                </h2>
                <div className="mt-2 flex items-center space-x-2">
                  <span className="rounded-full bg-blue-50 border border-blue-200 px-3 py-0.5 text-xs font-semibold text-[#006BFF] uppercase">
                    {extractedCandidate.domain}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    Difficulty: {extractedCandidate.approximate_difficulty || 'Applied'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-4 text-sm text-slate-600 leading-relaxed">
                {extractedCandidate.description}
              </p>

              {/* Underlying Skill */}
              <div className="mt-6 rounded-2xl border border-slate-100 bg-slate-50/80 p-5">
                <span className="text-xs uppercase text-slate-500 block mb-1 font-semibold">
                  Underlying skill:
                </span>
                <p className="text-sm font-semibold text-slate-900">
                  "{extractedCandidate.underlying_skill}"
                </p>
              </div>

              {/* Capabilities */}
              <div className="mt-6">
                <span className="text-xs uppercase text-slate-500 block mb-2 font-semibold">
                  Extracted Capabilities:
                </span>
                <ul className="space-y-2 rounded-2xl border border-slate-100 bg-slate-50/60 p-5">
                  {extractedCandidate.capabilities.map((cap, idx) => (
                    <li key={idx} className="flex items-start space-x-2.5 text-sm text-slate-700 font-medium">
                      <span className="text-emerald-600 font-bold select-none">✓</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions: [Use This Concept] [Choose Another] */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100 pt-6">
                <div className="text-xs text-slate-500 font-medium">
                  Confirm to route into the existing Challenge & Evaluation Engine.
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    id="choose-another-concept-btn"
                    type="button"
                    onClick={handleChooseAnother}
                    className="flex-1 sm:flex-initial rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                  >
                    Choose Another
                  </button>

                  <button
                    id="confirm-use-concept-btn"
                    type="button"
                    onClick={handleConfirmConcept}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 rounded-xl bg-[#006BFF] px-6 py-2.5 text-xs font-semibold text-white transition-all hover:bg-[#005CE6] shadow-sm active:scale-[0.98]"
                  >
                    <span>Use This Concept</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* LOW CONFIDENCE: Extraction Insufficient */
            <div
              id="low-confidence-notice"
              className="rounded-3xl border border-rose-200 bg-rose-50/50 p-6 sm:p-8"
            >
              <div className="flex items-center space-x-2 text-rose-700">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h2 className="font-display text-xl font-bold text-rose-900">
                  We're not confident enough to identify the concept.
                </h2>
              </div>

              <div className="mt-4 rounded-2xl bg-white border border-rose-100 p-5 text-xs text-slate-700 space-y-2 shadow-sm">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-semibold block">Extractor Evaluation:</span>
                  <p className="mt-1 text-slate-700">
                    {extractedCandidate.insufficient_reason ||
                      extractedCandidate.confidence_reasoning ||
                      "The provided material lacks structured operational principles, defined algorithms, or concrete trade-offs."}
                  </p>
                </div>
                <div className="text-[11px] text-slate-500 font-medium pt-2 border-t border-slate-100">
                  Confidence score: {Math.round((extractedCandidate.confidence_score || 0) * 100)}% (threshold required: 65%)
                </div>
              </div>

              <div className="mt-4 rounded-2xl bg-white/70 p-5 text-xs text-slate-600 space-y-2 border border-rose-100">
                <div className="font-semibold text-slate-900 text-[11px] uppercase">
                  How to get high confidence:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-600">
                  <li>Include specific definitions, formulas, or operational mechanisms.</li>
                  <li>Describe the underlying technical constraints, parameters, or trade-offs.</li>
                  <li>Avoid informal chat logs, fragmented bullet points, or meeting greetings.</li>
                </ul>
              </div>

              {/* Low confidence: Do not generate a challenge */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-rose-200/60">
                <span className="text-xs text-rose-700 font-semibold">
                  Challenge generation blocked due to low confidence.
                </span>
                <button
                  id="refine-material-btn"
                  onClick={handleChooseAnother}
                  className="rounded-xl bg-white border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-sm"
                >
                  Refine Study Material
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* STATE 2: Input Selection & Processing Interface */
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column: Format Selectors */}
          <div className="space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Supported Input Formats
            </div>

            {/* 1. Paste Text (Active) */}
            <button
              id="tab-mode-paste"
              type="button"
              onClick={() => setActiveSourceType('paste_text')}
              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-sm transition-all ${
                activeSourceType === 'paste_text'
                  ? 'border-blue-300 bg-white text-slate-900 shadow-md ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className={`h-4 w-4 ${activeSourceType === 'paste_text' ? 'text-[#006BFF]' : 'text-slate-400'}`} />
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Paste Text</div>
                  <div className="text-[10px] text-slate-400">Raw notes, guides, articles</div>
                </div>
              </div>
              <span className="rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold px-2 py-0.5">
                Active
              </span>
            </button>

            {/* 2. Upload PDF */}
            <button
              id="tab-mode-pdf"
              type="button"
              onClick={() => setActiveSourceType('pdf')}
              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-sm transition-all ${
                activeSourceType === 'pdf'
                  ? 'border-blue-300 bg-white text-slate-900 shadow-md ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <UploadCloud className={`h-4 w-4 ${activeSourceType === 'pdf' ? 'text-[#006BFF]' : 'text-slate-400'}`} />
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Upload PDF</div>
                  <div className="text-[10px] text-slate-400">Research papers, slides</div>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5">
                Step 10
              </span>
            </button>

            {/* 3. Upload DOCX */}
            <button
              id="tab-mode-docx"
              type="button"
              onClick={() => setActiveSourceType('docx')}
              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-sm transition-all ${
                activeSourceType === 'docx'
                  ? 'border-blue-300 bg-white text-slate-900 shadow-md ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileCode className={`h-4 w-4 ${activeSourceType === 'docx' ? 'text-[#006BFF]' : 'text-slate-400'}`} />
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Upload DOCX</div>
                  <div className="text-[10px] text-slate-400">Word documents, outlines</div>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5">
                Step 11
              </span>
            </button>

            {/* 4. Audio upload */}
            <button
              id="tab-mode-audio"
              type="button"
              onClick={() => setActiveSourceType('audio')}
              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-sm transition-all ${
                activeSourceType === 'audio'
                  ? 'border-blue-300 bg-white text-slate-900 shadow-md ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileAudio className={`h-4 w-4 ${activeSourceType === 'audio' ? 'text-[#006BFF]' : 'text-slate-400'}`} />
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Audio upload</div>
                  <div className="text-[10px] text-slate-400">Lectures, voice memos</div>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5">
                Step 12
              </span>
            </button>

            {/* 5. Video upload */}
            <button
              id="tab-mode-video"
              type="button"
              onClick={() => setActiveSourceType('video')}
              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-sm transition-all ${
                activeSourceType === 'video'
                  ? 'border-blue-300 bg-white text-slate-900 shadow-md ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Video className={`h-4 w-4 ${activeSourceType === 'video' ? 'text-[#006BFF]' : 'text-slate-400'}`} />
                <div>
                  <div className="font-semibold text-xs sm:text-sm">Video upload</div>
                  <div className="text-[10px] text-slate-400">Screen recordings, talks</div>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5">
                Step 13
              </span>
            </button>

            {/* 6. YouTube URL */}
            <button
              id="tab-mode-youtube"
              type="button"
              onClick={() => setActiveSourceType('youtube')}
              className={`flex w-full items-center justify-between rounded-2xl border p-3.5 text-left text-sm transition-all ${
                activeSourceType === 'youtube'
                  ? 'border-blue-300 bg-white text-slate-900 shadow-md ring-1 ring-blue-500/20'
                  : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:bg-white'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Youtube className={`h-4 w-4 ${activeSourceType === 'youtube' ? 'text-[#006BFF]' : 'text-slate-400'}`} />
                <div>
                  <div className="font-semibold text-xs sm:text-sm">YouTube URL</div>
                  <div className="text-[10px] text-slate-400">Video transcript extraction</div>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 text-slate-500 text-[10px] font-medium px-2 py-0.5">
                Step 14
              </span>
            </button>

            {/* Pre-fill quick samples */}
            <div className="pt-4 border-t border-slate-200">
              <span className="text-[11px] font-semibold uppercase text-slate-400 block mb-2">
                Quick Test Samples:
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleLoadSample('postgres-window')}
                  className="w-full text-left text-xs text-slate-600 hover:text-[#006BFF] truncate font-medium block rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
                >
                  • PostgreSQL Window Framing
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('rag-embeddings')}
                  className="w-full text-left text-xs text-slate-600 hover:text-[#006BFF] truncate font-medium block rounded-lg p-1.5 hover:bg-slate-100 transition-colors"
                >
                  • Vector Embeddings & RAG
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('low-confidence-sample')}
                  className="w-full text-left text-xs text-rose-600 hover:text-rose-700 truncate font-medium block rounded-lg p-1.5 hover:bg-rose-50 transition-colors"
                >
                  • Low-Confidence Notes Test
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Input Viewport */}
          <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-card lg:col-span-2">
            {activeSourceType === 'paste_text' ? (
              /* Active: Paste Text Form */
              <form onSubmit={handleProcessAndExtract} className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Topic or Material Title
                  </label>
                  <span className="text-xs text-slate-400">Optional</span>
                </div>

                <input
                  id="material-title-input"
                  type="text"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="e.g. PostgreSQL Window Functions, Vector Embeddings in RAG..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-[#006BFF] focus:outline-none focus:ring-2 focus:ring-[#006BFF]/20 shadow-sm"
                />

                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Study Content / Notes
                  </label>
                  <span className="text-xs text-slate-400 font-medium">
                    {wordCount} words • {charCount} chars
                  </span>
                </div>

                <textarea
                  id="material-paste-textarea"
                  rows={10}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste the notes, explanations, code patterns, or article excerpts you just studied. ForgeMind will extract the latent capability model..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50/50 p-4 text-xs font-mono leading-relaxed text-slate-900 placeholder-slate-400 focus:border-[#006BFF] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#006BFF]/20 transition-all shadow-inner"
                />

                {extractionError && (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{extractionError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                    <Info className="h-3.5 w-3.5 shrink-0 text-[#006BFF]" />
                    <span>Reference material is stripped during challenge generation.</span>
                  </div>

                  <button
                    id="submit-material-paste-btn"
                    type="submit"
                    disabled={!pastedText.trim() || processingStatus === 'PROCESSING'}
                    className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-xl bg-[#006BFF] px-6 py-3 text-xs font-semibold text-white transition-all hover:bg-[#005CE6] disabled:opacity-40 disabled:pointer-events-none shadow-sm active:scale-[0.98]"
                  >
                    {processingStatus === 'PROCESSING' ? (
                      <span className="flex items-center space-x-2">
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        <span>Extracting Capability Model...</span>
                      </span>
                    ) : (
                      <>
                        <span>Extract Concept & Capability Model</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            ) : (
              /* Honest Expansion Notice: Input Adapter coming in next step */
              <div className="py-8 px-4 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#006BFF]">
                  {activeSourceType === 'pdf' && <UploadCloud className="h-7 w-7" />}
                  {activeSourceType === 'docx' && <FileCode className="h-7 w-7" />}
                  {activeSourceType === 'audio' && <FileAudio className="h-7 w-7" />}
                  {activeSourceType === 'video' && <Video className="h-7 w-7" />}
                  {activeSourceType === 'youtube' && <Youtube className="h-7 w-7" />}
                </div>

                <div>
                  <h3 className="font-display text-xl font-bold text-slate-900">
                    {activeSourceType === 'pdf' && 'PDF Document Extraction'}
                    {activeSourceType === 'docx' && 'Word (.DOCX) Extraction'}
                    {activeSourceType === 'audio' && 'Audio Speech-to-Text Adapter'}
                    {activeSourceType === 'video' && 'Video Multimodal Extractor'}
                    {activeSourceType === 'youtube' && 'YouTube Lecture Transcript Adapter'}
                  </h3>
                  <div className="mt-2 inline-flex items-center space-x-1.5 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-semibold text-[#006BFF]">
                    <Clock className="h-3 w-3" />
                    <span>
                      Coming in next input-expansion step (
                      {activeSourceType === 'pdf' && 'Step 10'}
                      {activeSourceType === 'docx' && 'Step 11'}
                      {activeSourceType === 'audio' && 'Step 12'}
                      {activeSourceType === 'video' && 'Step 13'}
                      {activeSourceType === 'youtube' && 'Step 14'}
                      )
                    </span>
                  </div>
                </div>

                <p className="mx-auto max-w-md text-xs text-slate-600 leading-relaxed">
                  ForgeMind does not simulate fake extraction. Dedicated media parsers for{' '}
                  <strong className="text-slate-800 uppercase">{activeSourceType.replace('_', ' ')}</strong>{' '}
                  will be implemented in the scheduled input-expansion steps. In the meantime, you can copy and paste your text directly into the <strong>Paste Text</strong> tab.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveSourceType('paste_text')}
                    className="inline-flex items-center space-x-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
                  >
                    <span>Switch to Paste Text</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#006BFF]" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Door 2 Pipeline Flow Architecture Indicator */}
      <div className="mt-14 border-t border-slate-200 pt-6">
        <div className="text-[10px] font-semibold tracking-widest uppercase text-slate-400 mb-3">
          Door 2 Execution Architecture
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600">
          <span className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-slate-700 shadow-sm">Study Material</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-slate-700 shadow-sm">Normalized Text</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-slate-700 shadow-sm">Concept Extraction</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="rounded-lg bg-white border border-slate-200 px-3 py-1 text-slate-700 shadow-sm">Capability Model</span>
          <ChevronRight className="h-3 w-3 text-slate-400" />
          <span className="rounded-lg bg-blue-50 border border-blue-200 px-3 py-1 text-[#006BFF] font-semibold shadow-sm">Existing Challenge Engine</span>
        </div>
      </div>
    </div>
  );
};
