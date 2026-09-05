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
      <div className="border-b border-zinc-800/80 pb-6">
        <div className="inline-flex items-center space-x-2 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-0.5 text-xs font-medium text-amber-300">
          <Layers className="h-3.5 w-3.5" />
          <span>Door 2: Bring My Own Study Material</span>
        </div>
        <h1 className="mt-3 font-serif text-3xl font-normal text-zinc-100 sm:text-4xl">
          Bring what you studied
        </h1>
        <p className="mt-2 text-sm text-zinc-400 max-w-2xl leading-relaxed">
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
              className="rounded-xl border border-amber-500/30 bg-[#0f111a] p-6 shadow-xl"
            >
              <div className="flex items-center space-x-2 text-xs font-mono uppercase tracking-wider text-amber-400">
                <Sparkles className="h-4 w-4" />
                <span>We found this concept</span>
              </div>

              {/* Concept Name */}
              <div className="mt-4">
                <span className="text-xs font-mono uppercase text-zinc-500 block mb-1">
                  Concept:
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-normal text-zinc-100">
                  {extractedCandidate.concept_name}
                </h2>
                <div className="mt-1 flex items-center space-x-2">
                  <span className="rounded bg-zinc-800 px-2 py-0.5 text-[11px] font-mono uppercase text-zinc-300">
                    {extractedCandidate.domain}
                  </span>
                  <span className="text-xs font-mono text-zinc-500">
                    Difficulty: {extractedCandidate.approximate_difficulty || 'Applied'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="mt-3 text-sm text-zinc-300 leading-relaxed">
                {extractedCandidate.description}
              </p>

              {/* Underlying Skill */}
              <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-950/60 p-4">
                <span className="text-xs font-mono uppercase text-zinc-400 block mb-1 font-semibold">
                  Underlying skill:
                </span>
                <p className="text-sm font-medium text-amber-300">
                  {extractedCandidate.underlying_skill}
                </p>
              </div>

              {/* Capabilities */}
              <div className="mt-6">
                <span className="text-xs font-mono uppercase text-zinc-400 block mb-2 font-semibold">
                  Capabilities:
                </span>
                <ul className="space-y-2 rounded-lg border border-zinc-800/80 bg-zinc-900/30 p-4">
                  {extractedCandidate.capabilities.map((cap, idx) => (
                    <li key={idx} className="flex items-start space-x-2 text-sm text-zinc-200">
                      <span className="text-emerald-400 font-bold select-none">✓</span>
                      <span>{cap}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Actions: [Use This Concept] [Choose Another] */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-800/80 pt-6">
                <div className="text-xs text-zinc-400 font-mono">
                  Confirm to route into the existing Challenge & Evaluation Engine.
                </div>

                <div className="flex items-center space-x-3 w-full sm:w-auto">
                  <button
                    id="choose-another-concept-btn"
                    type="button"
                    onClick={handleChooseAnother}
                    className="flex-1 sm:flex-initial rounded-lg border border-zinc-700 bg-zinc-800/80 px-4 py-2.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition-colors"
                  >
                    Choose Another
                  </button>

                  <button
                    id="confirm-use-concept-btn"
                    type="button"
                    onClick={handleConfirmConcept}
                    className="flex-1 sm:flex-initial flex items-center justify-center space-x-2 rounded-lg bg-amber-400 px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-all hover:bg-amber-300 shadow-md"
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
              className="rounded-xl border border-rose-900/50 bg-rose-950/20 p-6 sm:p-8"
            >
              <div className="flex items-center space-x-2 text-rose-400">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <h2 className="font-serif text-xl font-normal text-rose-200">
                  We're not confident enough to identify the concept.
                </h2>
              </div>

              <div className="mt-4 rounded-lg bg-zinc-950/80 border border-zinc-800 p-4 text-xs font-mono text-zinc-300 space-y-2">
                <div>
                  <span className="text-zinc-500 uppercase text-[10px] block">Extractor Evaluation:</span>
                  <p className="mt-0.5 text-zinc-300">
                    {extractedCandidate.insufficient_reason ||
                      extractedCandidate.confidence_reasoning ||
                      "The provided material lacks structured operational principles, defined algorithms, or concrete trade-offs."}
                  </p>
                </div>
                <div className="text-[11px] text-zinc-500">
                  Confidence score: {Math.round((extractedCandidate.confidence_score || 0) * 100)}% (threshold required: 65%)
                </div>
              </div>

              <div className="mt-4 rounded-lg bg-zinc-900/40 p-4 text-xs text-zinc-400 space-y-2 border border-zinc-800/60">
                <div className="font-semibold text-zinc-300 font-mono text-[11px] uppercase">
                  How to get high confidence:
                </div>
                <ul className="list-disc list-inside space-y-1 text-zinc-400">
                  <li>Include specific definitions, formulas, or operational mechanisms.</li>
                  <li>Describe the underlying technical constraints, parameters, or trade-offs.</li>
                  <li>Avoid informal chat logs, fragmented bullet points, or meeting greetings.</li>
                </ul>
              </div>

              {/* Low confidence: Do not generate a challenge */}
              <div className="mt-6 flex items-center justify-between pt-4 border-t border-zinc-800/80">
                <span className="text-xs text-rose-400/90 font-mono">
                  Challenge generation blocked due to low confidence.
                </span>
                <button
                  id="refine-material-btn"
                  onClick={handleChooseAnother}
                  className="rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
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
            <div className="text-xs font-mono uppercase tracking-wider text-zinc-400 mb-3">
              Supported Input Formats
            </div>

            {/* 1. Paste Text (Active) */}
            <button
              id="tab-mode-paste"
              type="button"
              onClick={() => setActiveSourceType('paste_text')}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all ${
                activeSourceType === 'paste_text'
                  ? 'border-amber-500/40 bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileText className={`h-4 w-4 ${activeSourceType === 'paste_text' ? 'text-amber-400' : 'text-zinc-500'}`} />
                <div>
                  <div className="font-medium text-xs sm:text-sm">Paste Text</div>
                  <div className="text-[10px] text-zinc-500">Raw notes, guides, articles</div>
                </div>
              </div>
              <span className="rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-mono px-1.5 py-0.5">
                Active
              </span>
            </button>

            {/* 2. Upload PDF */}
            <button
              id="tab-mode-pdf"
              type="button"
              onClick={() => setActiveSourceType('pdf')}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all ${
                activeSourceType === 'pdf'
                  ? 'border-amber-500/40 bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <UploadCloud className={`h-4 w-4 ${activeSourceType === 'pdf' ? 'text-amber-400' : 'text-zinc-500'}`} />
                <div>
                  <div className="font-medium text-xs sm:text-sm">Upload PDF</div>
                  <div className="text-[10px] text-zinc-500">Research papers, slides</div>
                </div>
              </div>
              <span className="rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono px-1.5 py-0.5">
                Step 10
              </span>
            </button>

            {/* 3. Upload DOCX */}
            <button
              id="tab-mode-docx"
              type="button"
              onClick={() => setActiveSourceType('docx')}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all ${
                activeSourceType === 'docx'
                  ? 'border-amber-500/40 bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileCode className={`h-4 w-4 ${activeSourceType === 'docx' ? 'text-amber-400' : 'text-zinc-500'}`} />
                <div>
                  <div className="font-medium text-xs sm:text-sm">Upload DOCX</div>
                  <div className="text-[10px] text-zinc-500">Word documents, outlines</div>
                </div>
              </div>
              <span className="rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono px-1.5 py-0.5">
                Step 11
              </span>
            </button>

            {/* 4. Audio upload */}
            <button
              id="tab-mode-audio"
              type="button"
              onClick={() => setActiveSourceType('audio')}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all ${
                activeSourceType === 'audio'
                  ? 'border-amber-500/40 bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <FileAudio className={`h-4 w-4 ${activeSourceType === 'audio' ? 'text-amber-400' : 'text-zinc-500'}`} />
                <div>
                  <div className="font-medium text-xs sm:text-sm">Audio upload</div>
                  <div className="text-[10px] text-zinc-500">Lectures, voice memos</div>
                </div>
              </div>
              <span className="rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono px-1.5 py-0.5">
                Step 12
              </span>
            </button>

            {/* 5. Video upload */}
            <button
              id="tab-mode-video"
              type="button"
              onClick={() => setActiveSourceType('video')}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all ${
                activeSourceType === 'video'
                  ? 'border-amber-500/40 bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Video className={`h-4 w-4 ${activeSourceType === 'video' ? 'text-amber-400' : 'text-zinc-500'}`} />
                <div>
                  <div className="font-medium text-xs sm:text-sm">Video upload</div>
                  <div className="text-[10px] text-zinc-500">Screen recordings, talks</div>
                </div>
              </div>
              <span className="rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono px-1.5 py-0.5">
                Step 13
              </span>
            </button>

            {/* 6. YouTube URL */}
            <button
              id="tab-mode-youtube"
              type="button"
              onClick={() => setActiveSourceType('youtube')}
              className={`flex w-full items-center justify-between rounded-lg border p-3 text-left text-sm transition-all ${
                activeSourceType === 'youtube'
                  ? 'border-amber-500/40 bg-zinc-800 text-zinc-100 shadow-sm'
                  : 'border-zinc-800/80 bg-zinc-900/40 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Youtube className={`h-4 w-4 ${activeSourceType === 'youtube' ? 'text-amber-400' : 'text-zinc-500'}`} />
                <div>
                  <div className="font-medium text-xs sm:text-sm">YouTube URL</div>
                  <div className="text-[10px] text-zinc-500">Video transcript extraction</div>
                </div>
              </div>
              <span className="rounded bg-zinc-800 text-zinc-400 text-[10px] font-mono px-1.5 py-0.5">
                Step 14
              </span>
            </button>

            {/* Pre-fill quick samples */}
            <div className="pt-4 border-t border-zinc-800/80">
              <span className="text-[11px] font-mono uppercase text-zinc-500 block mb-2">
                Quick Test Samples:
              </span>
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleLoadSample('postgres-window')}
                  className="w-full text-left text-xs text-zinc-400 hover:text-amber-300 truncate font-mono block rounded p-1 hover:bg-zinc-800/50"
                >
                  • PostgreSQL Window Framing
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('rag-embeddings')}
                  className="w-full text-left text-xs text-zinc-400 hover:text-amber-300 truncate font-mono block rounded p-1 hover:bg-zinc-800/50"
                >
                  • Vector Embeddings & RAG
                </button>
                <button
                  type="button"
                  onClick={() => handleLoadSample('low-confidence-sample')}
                  className="w-full text-left text-xs text-rose-400/80 hover:text-rose-300 truncate font-mono block rounded p-1 hover:bg-zinc-800/50"
                >
                  • Low-Confidence Notes Test
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Input Viewport */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-6 lg:col-span-2">
            {activeSourceType === 'paste_text' ? (
              /* Active: Paste Text Form */
              <form onSubmit={handleProcessAndExtract} className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Topic or Material Title
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">Optional</span>
                </div>

                <input
                  id="material-title-input"
                  type="text"
                  value={materialTitle}
                  onChange={(e) => setMaterialTitle(e.target.value)}
                  placeholder="e.g. PostgreSQL Window Functions, Vector Embeddings in RAG..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 px-3.5 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />

                <div className="flex items-center justify-between pt-2">
                  <label className="text-xs font-mono uppercase tracking-wider text-zinc-300">
                    Study Content / Notes
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">
                    {wordCount} words • {charCount} chars
                  </span>
                </div>

                <textarea
                  id="material-paste-textarea"
                  rows={10}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  placeholder="Paste the notes, explanations, code patterns, or article excerpts you just studied. ForgeMind will extract the latent capability model..."
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-950 p-3.5 text-xs font-mono leading-relaxed text-zinc-200 placeholder-zinc-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />

                {extractionError && (
                  <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-3 text-xs text-rose-300 flex items-center space-x-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{extractionError}</span>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <div className="flex items-center space-x-1.5 text-xs text-zinc-500">
                    <Info className="h-3.5 w-3.5 shrink-0" />
                    <span>Reference material is stripped during challenge generation.</span>
                  </div>

                  <button
                    id="submit-material-paste-btn"
                    type="submit"
                    disabled={!pastedText.trim() || processingStatus === 'PROCESSING'}
                    className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded-lg bg-amber-400 px-5 py-2.5 text-xs font-semibold text-zinc-950 transition-all hover:bg-amber-300 disabled:opacity-40 disabled:pointer-events-none shadow"
                  >
                    {processingStatus === 'PROCESSING' ? (
                      <span className="flex items-center space-x-2">
                        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-zinc-950 border-t-transparent" />
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
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800/80 border border-zinc-700 text-amber-400">
                  {activeSourceType === 'pdf' && <UploadCloud className="h-6 w-6" />}
                  {activeSourceType === 'docx' && <FileCode className="h-6 w-6" />}
                  {activeSourceType === 'audio' && <FileAudio className="h-6 w-6" />}
                  {activeSourceType === 'video' && <Video className="h-6 w-6" />}
                  {activeSourceType === 'youtube' && <Youtube className="h-6 w-6" />}
                </div>

                <div>
                  <h3 className="font-serif text-lg font-medium text-zinc-200">
                    {activeSourceType === 'pdf' && 'PDF Document Extraction'}
                    {activeSourceType === 'docx' && 'Word (.DOCX) Extraction'}
                    {activeSourceType === 'audio' && 'Audio Speech-to-Text Adapter'}
                    {activeSourceType === 'video' && 'Video Multimodal Extractor'}
                    {activeSourceType === 'youtube' && 'YouTube Lecture Transcript Adapter'}
                  </h3>
                  <div className="mt-2 inline-flex items-center space-x-1.5 rounded-full border border-amber-500/20 bg-amber-500/5 px-3 py-1 text-xs font-mono text-amber-300">
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

                <p className="mx-auto max-w-md text-xs text-zinc-400 leading-relaxed">
                  ForgeMind does not simulate fake extraction. Dedicated media parsers for{' '}
                  <strong className="text-zinc-300 uppercase">{activeSourceType.replace('_', ' ')}</strong>{' '}
                  will be implemented in the scheduled input-expansion steps. In the meantime, you can copy and paste your text directly into the <strong>Paste Text</strong> tab.
                </p>

                <div className="pt-2">
                  <button
                    onClick={() => setActiveSourceType('paste_text')}
                    className="inline-flex items-center space-x-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-xs font-medium text-zinc-200 hover:bg-zinc-700 transition-colors"
                  >
                    <span>Switch to Paste Text</span>
                    <ArrowRight className="h-3.5 w-3.5 text-amber-400" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Door 2 Pipeline Flow Architecture Indicator */}
      <div className="mt-14 border-t border-zinc-800/80 pt-6">
        <div className="text-[10px] font-mono tracking-widest uppercase text-zinc-500 mb-3">
          Door 2 Execution Architecture
        </div>
        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono text-zinc-400">
          <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-zinc-300">Study Material</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-zinc-300">Normalized Text</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-zinc-300">Concept Extraction</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="rounded bg-zinc-900 border border-zinc-800 px-2 py-1 text-zinc-300">Capability Model</span>
          <ChevronRight className="h-3 w-3 text-zinc-600" />
          <span className="rounded bg-amber-500/10 border border-amber-500/30 px-2 py-1 text-amber-300 font-semibold">Existing Challenge Engine</span>
        </div>
      </div>
    </div>
  );
};
