
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { ExamData, Question, UserAnswer, QuestionType, PracticeConfig } from './types';
import QuestionRenderer from './components/QuestionRenderer';
import { getQuestionExplanation } from './services/geminiService';

type AppView = 'UPLOAD' | 'CONFIG' | 'QUIZ';

const DEFAULT_EXAM_DATA: ExamData = {
  examination_data: {
    exam_title: "Medizinische Grundlagen - Trainings-Set",
    date: "2024-05-20",
    total_questions: 10
  },
  questions: [
    {
      id: "demo-1",
      number: 1,
      type: QuestionType.MCQ,
      author: "MedExam Team",
      question: "Welches Organ ist primär für die Filterung des Blutes und die Harnbildung verantwortlich?",
      options: ["Herz", "Lunge", "Niere", "Leber"],
      correct_answer: "Niere"
    },
    {
      id: "demo-2",
      number: 2,
      type: QuestionType.KPRIM,
      author: "MedExam Team",
      question: "Beurteilen Sie die folgenden Aussagen zum menschlichen Skelett (Richtig/Falsch):",
      mapping: {
        Richtig: ["Der Oberschenkelknochen ist der längste Knochen.", "Erwachsene haben normalerweise 206 Knochen."],
        Falsch: ["Die Kniescheibe gehört zum Schultergürtel.", "Säuglinge haben weniger Knochen als Erwachsene."]
      }
    },
    {
      id: "demo-3",
      number: 3,
      type: QuestionType.GROUPING,
      author: "MedExam Team",
      question: "Ordnen Sie die Vitamine ihrer Löslichkeit zu:",
      groups: {
        "Fettlöslich": ["Vitamin A", "Vitamin D", "Vitamin E", "Vitamin K"],
        "Wasserlöslich": ["Vitamin C", "Vitamin B12"]
      }
    },
    {
      id: "demo-4",
      number: 4,
      type: QuestionType.MCQ,
      author: "MedExam Team",
      question: "Welche Herzklappe trennt den linken Vorhof von der linken Herzkammer?",
      options: ["Trikuspidalklappe", "Mitralklappe", "Aortenklappe", "Pulmonalklappe"],
      correct_answer: "Mitralklappe"
    },
    {
      id: "demo-5",
      number: 5,
      type: QuestionType.MCQ,
      author: "MedExam Team",
      question: "Welche Blutgruppe gilt als Universalspender für Erythrozytenkonzentrate?",
      options: ["Blutgruppe A", "Blutgruppe B", "Blutgruppe AB", "Blutgruppe 0"],
      correct_answer: "Blutgruppe 0"
    },
    {
      id: "demo-6",
      number: 6,
      type: QuestionType.KPRIM,
      author: "MedExam Team",
      question: "Beurteilen Sie Aussagen zur Atmung (Richtig/Falsch):",
      mapping: {
        Richtig: ["Das Zwerchfell ist der wichtigste Atemmuskel.", "Gasaustausch findet in den Alveolen statt."],
        Falsch: ["Einatmen ist ein passiver Vorgang.", "Die Luftröhre teilt sich zuerst in die Bronchiolen."]
      }
    },
    {
      id: "demo-7",
      number: 7,
      type: QuestionType.MCQ,
      author: "MedExam Team",
      question: "Wo wird das Hormon Insulin primär produziert?",
      options: ["Schilddrüse", "Nebenniere", "Bauchspeicheldrüse", "Hypophyse"],
      correct_answer: "Bauchspeicheldrüse"
    },
    {
      id: "demo-8",
      number: 8,
      type: QuestionType.GROUPING,
      author: "MedExam Team",
      question: "Ordnen Sie die Zellorganellen ihrer Hauptfunktion zu:",
      groups: {
        "Energiegewinnung": ["Mitochondrien"],
        "Proteinsynthese": ["Ribosomen", "Raues ER"],
        "Abfallentsorgung": ["Lysosomen"]
      }
    },
    {
      id: "demo-9",
      number: 9,
      type: QuestionType.MCQ,
      author: "MedExam Team",
      question: "Welcher Teil des Gehirns ist primär für die Koordination und das Gleichgewicht zuständig?",
      options: ["Großhirn", "Kleinhirn", "Zwischenhirn", "Nachhirn"],
      correct_answer: "Kleinhirn"
    },
    {
      id: "demo-10",
      number: 10,
      type: QuestionType.MCQ,
      author: "MedExam Team",
      question: "Welcher Abschnitt des Verdauungstrakts folgt direkt auf den Magen?",
      options: ["Leerdarm (Jejunum)", "Krummdarm (Ileum)", "Zwölffingerdarm (Duodenum)", "Blinddarm (Caecum)"],
      correct_answer: "Zwölffingerdarm (Duodenum)"
    }
  ]
};

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('UPLOAD');
  const [examDataPool, setExamDataPool] = useState<ExamData | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, UserAnswer>>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [loadingExplanation, setLoadingExplanation] = useState<string | null>(null);
  const [explanation, setExplanation] = useState<string | null>(null);

  const [practiceConfig, setPracticeConfig] = useState<PracticeConfig>({
    numQuestions: 10,
    immediateFeedback: true,
    randomize: true
  });

  // Smooth scroll to top when submitting
  useEffect(() => {
    if (isSubmitted) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [isSubmitted]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          setExamDataPool(json);
          setPracticeConfig(prev => ({
            ...prev,
            numQuestions: Math.min(10, json.questions.length)
          }));
          setView('CONFIG');
        } catch (err) {
          alert("Fehler: Ungültige JSON-Datei.");
        }
      };
      reader.readAsText(file);
    }
  };

  const loadDemoData = () => {
    setExamDataPool(DEFAULT_EXAM_DATA);
    setPracticeConfig({
      numQuestions: 10,
      immediateFeedback: true,
      randomize: true
    });
    setView('CONFIG');
  };

  const startTest = () => {
    if (!examDataPool) return;
    let pool = [...examDataPool.questions];
    if (practiceConfig.randomize) {
      pool = pool.sort(() => Math.random() - 0.5);
    }
    setActiveQuestions(pool.slice(0, practiceConfig.numQuestions));
    setCurrentIndex(0);
    setUserAnswers({});
    setIsSubmitted(false);
    setExplanation(null);
    setView('QUIZ');
  };

  const handleAnswerChange = (answer: UserAnswer) => {
    setUserAnswers(prev => ({
      ...prev,
      [answer.questionId]: answer
    }));
  };

  const checkAnswer = useCallback((q: Question, ans: UserAnswer | undefined): 'correct' | 'incorrect' | 'unanswered' => {
    if (!ans) return 'unanswered';
    if (q.type === QuestionType.MCQ) {
      if (!ans.mcqSelection) return 'unanswered';
      return ans.mcqSelection === q.correct_answer ? 'correct' : 'incorrect';
    } else if (q.type === QuestionType.KPRIM) {
      const items = [...(q.mapping?.Richtig || []), ...(q.mapping?.Falsch || [])];
      if (!ans.kprimAnswers || Object.keys(ans.kprimAnswers).length < items.length) return 'unanswered';
      const correctCount = items.reduce((acc: number, item: string) => {
        const actual = q.mapping?.Richtig.includes(item) ? 'Richtig' : 'Falsch';
        return acc + (ans.kprimAnswers?.[item] === actual ? 1 : 0);
      }, 0);
      return correctCount === items.length ? 'correct' : 'incorrect';
    } else if (q.type === QuestionType.GROUPING) {
      const allItems = (Object.values(q.groups || {}) as string[][]).flat();
      if (!ans.groupingAnswers || Object.keys(ans.groupingAnswers).length < allItems.length) return 'unanswered';
      const correctCount = allItems.reduce((acc: number, item: string) => {
        const actualGroup = Object.keys(q.groups || {}).find(gn => q.groups![gn].includes(item));
        return acc + (ans.groupingAnswers?.[item] === actualGroup ? 1 : 0);
      }, 0);
      return correctCount === allItems.length ? 'correct' : 'incorrect';
    }
    return 'unanswered';
  }, []);

  const score = useMemo(() => {
    return activeQuestions.reduce((total, q) => {
      return total + (checkAnswer(q, userAnswers[q.id]) === 'correct' ? 1 : 0);
    }, 0);
  }, [activeQuestions, userAnswers, checkAnswer]);

  const finishTest = () => {
    // Immediate submission as per user request
    setIsSubmitted(true);
  };

  const currentQuestion = useMemo(() => activeQuestions[currentIndex] || null, [activeQuestions, currentIndex]);

  const fetchAIExplanation = async () => {
    if (!currentQuestion) return;
    setLoadingExplanation(currentQuestion.id);
    setExplanation(null);
    const result = await getQuestionExplanation(currentQuestion, userAnswers[currentQuestion.id]);
    setExplanation(result);
    setLoadingExplanation(null);
  };

  if (view === 'UPLOAD') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center space-y-8 border border-slate-100">
          <div className="w-20 h-20 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-200">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">MedExam Master</h1>
            <p className="text-slate-500 leading-relaxed text-sm">Prüfungstrainer für Medizinstudenten</p>
          </div>
          <div className="flex flex-col gap-4">
            <div className="relative group">
              <input type="file" accept=".json" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
              <div className="p-6 border-2 border-dashed border-slate-200 rounded-2xl group-hover:border-indigo-400 group-hover:bg-indigo-50 transition-all flex flex-col items-center">
                <svg className="w-10 h-10 text-slate-300 group-hover:text-indigo-500 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className="text-sm font-semibold text-slate-600">JSON-Datei hochladen</span>
              </div>
            </div>
            <div className="relative flex items-center py-1">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] uppercase font-bold tracking-widest">oder</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>
            <button 
              onClick={loadDemoData}
              className="w-full bg-white border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50 p-4 rounded-2xl font-bold text-indigo-600 transition-all flex items-center justify-center gap-3 shadow-sm active:scale-95"
            >
              Demo-Training (10 Fragen)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'CONFIG' && examDataPool) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-slate-50">
        <div className="max-w-xl w-full bg-white p-8 md:p-10 rounded-3xl shadow-xl space-y-8 border border-slate-100">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-slate-900 leading-tight">{examDataPool.examination_data.exam_title}</h2>
            <p className="text-slate-500 mt-2 text-sm uppercase font-bold tracking-widest">Konfiguration</p>
          </div>
          <div className="space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-bold text-slate-700 flex justify-between">
                <span>Anzahl der Fragen</span>
                <span className="text-indigo-600 font-black">{practiceConfig.numQuestions} / {examDataPool.questions.length}</span>
              </label>
              <input 
                type="range" 
                min="1" 
                max={examDataPool.questions.length} 
                value={practiceConfig.numQuestions} 
                onChange={(e) => setPracticeConfig({...practiceConfig, numQuestions: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setPracticeConfig({...practiceConfig, immediateFeedback: !practiceConfig.immediateFeedback})}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-3 ${practiceConfig.immediateFeedback ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${practiceConfig.immediateFeedback ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {practiceConfig.immediateFeedback && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Sofort-Feedback</span>
                  <span className="text-[10px] text-slate-500">Antworten direkt prüfen.</span>
                </div>
              </button>
              <button 
                onClick={() => setPracticeConfig({...practiceConfig, randomize: !practiceConfig.randomize})}
                className={`p-4 rounded-2xl border-2 transition-all text-left flex items-start gap-3 ${practiceConfig.randomize ? 'border-indigo-600 bg-indigo-50' : 'border-slate-100 hover:border-slate-200'}`}
              >
                <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center ${practiceConfig.randomize ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                  {practiceConfig.randomize && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div>
                  <span className="font-bold text-slate-900 block text-sm">Zufallsmodus</span>
                  <span className="text-[10px] text-slate-500">Fragen durchmischen.</span>
                </div>
              </button>
            </div>
          </div>
          <div className="pt-4 flex flex-col gap-3">
            <button onClick={startTest} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-2xl font-bold shadow-lg shadow-indigo-100 transition-all active:scale-95">Starten</button>
            <button onClick={() => setView('UPLOAD')} className="w-full text-slate-500 hover:text-slate-700 font-medium text-xs transition-colors">Zurück zur Dateiauswahl</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={() => setView('CONFIG')} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h2 className="text-sm font-bold text-slate-900 leading-none truncate max-w-[150px] md:max-w-xs">{examDataPool?.examination_data.exam_title}</h2>
            <div className="flex items-center gap-2 mt-1">
               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${practiceConfig.immediateFeedback ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                 {practiceConfig.immediateFeedback ? 'Training' : 'Prüfung'}
               </span>
               <span className="text-[10px] text-slate-400 font-medium">{currentIndex + 1} / {activeQuestions.length}</span>
            </div>
          </div>
        </div>
        <div>
          {isSubmitted ? (
            <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold text-xs border border-emerald-100 shadow-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Score: {score} / {activeQuestions.length}
            </div>
          ) : (
            <button 
              onClick={finishTest} 
              className="bg-red-600 hover:bg-red-700 text-white px-4 md:px-6 py-2 rounded-xl font-bold text-xs shadow-lg shadow-red-100 transition-all active:scale-95"
            >
              Beenden
            </button>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-10">
        {isSubmitted && (
          <div id="results-card" className="mb-8 bg-white border border-slate-100 rounded-3xl p-6 md:p-8 shadow-2xl flex flex-col md:flex-row items-center gap-6 animate-in fade-in slide-in-from-top-6 duration-700">
            <div className={`w-28 h-28 md:w-36 md:h-36 rounded-full flex flex-col items-center justify-center border-8 flex-shrink-0 ${score / activeQuestions.length >= 0.6 ? 'border-emerald-500 text-emerald-600' : 'border-red-500 text-red-600'}`}>
              <span className="text-3xl font-black">{Math.round((score / activeQuestions.length) * 100)}%</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">{score}/{activeQuestions.length} Pkt.</span>
            </div>
            <div className="flex-1 space-y-3 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-bold text-slate-900">Training beendet</h2>
              <p className="text-sm text-slate-500 leading-relaxed">Der Test wurde ausgewertet. Sie können jetzt jede Frage unten im Detail prüfen oder eine neue Session starten.</p>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start pt-2">
                <button onClick={() => setView('CONFIG')} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100">Neuer Test</button>
                <button onClick={startTest} className="bg-slate-100 text-slate-600 px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-200 transition-all">Nochmal von vorn</button>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden mb-12">
          <div className="p-6 md:p-12">
            {currentQuestion && (
              <QuestionRenderer 
                question={currentQuestion} 
                userAnswer={userAnswers[currentQuestion.id]}
                onAnswerChange={handleAnswerChange}
                isSubmitted={isSubmitted}
                showFeedback={practiceConfig.immediateFeedback && userAnswers[currentQuestion.id]?.isChecked}
              />
            )}
            <div className="mt-12 flex flex-col gap-4">
              {practiceConfig.immediateFeedback && !isSubmitted && !userAnswers[currentQuestion?.id]?.isChecked && (
                 <button 
                  onClick={() => handleAnswerChange({...userAnswers[currentQuestion!.id], questionId: currentQuestion!.id, isChecked: true})}
                  disabled={checkAnswer(currentQuestion!, userAnswers[currentQuestion!.id]) === 'unanswered'}
                  className="w-fit bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md transition-all active:scale-95 disabled:opacity-30"
                >
                  Antwort Überprüfen
                </button>
              )}
              {(isSubmitted || (practiceConfig.immediateFeedback && userAnswers[currentQuestion?.id]?.isChecked)) && (
                <div className="pt-8 border-t border-slate-100">
                  {!explanation && !loadingExplanation ? (
                    <button onClick={fetchAIExplanation} className="flex items-center gap-2 text-indigo-600 font-bold hover:text-indigo-700 group transition-colors text-xs">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center group-hover:bg-indigo-100">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      </div>
                      KI-Erklärung anfordern
                    </button>
                  ) : (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                      <p className="text-slate-900 font-bold text-[10px] uppercase tracking-widest mb-2">
                        {loadingExplanation ? 'Analysiere...' : 'Erklärung'}
                      </p>
                      {loadingExplanation ? (
                        <div className="space-y-2 animate-pulse">
                          <div className="h-2.5 bg-slate-200 rounded w-full"></div>
                          <div className="h-2.5 bg-slate-200 rounded w-5/6"></div>
                        </div>
                      ) : (
                        <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{explanation}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="bg-slate-50 border-t border-slate-100 p-6 flex justify-between items-center">
            <button 
              disabled={currentIndex === 0} 
              onClick={() => { setCurrentIndex(prev => prev - 1); setExplanation(null); }} 
              className="px-5 py-2 rounded-xl font-bold text-slate-500 hover:bg-slate-200 disabled:opacity-20 transition-all"
            >
              Zurück
            </button>
            <div className="flex gap-2">
              <button 
                onClick={() => {
                  if (currentIndex < activeQuestions.length - 1) {
                    setCurrentIndex(prev => prev + 1);
                    setExplanation(null);
                  } else {
                    if (!isSubmitted) {
                      finishTest();
                    } else {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }
                }}
                className={`px-8 py-2.5 rounded-xl font-bold transition-all shadow-md active:scale-95 ${
                  currentIndex < activeQuestions.length - 1 
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100' 
                  : isSubmitted 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-100' 
                    : 'bg-red-600 hover:bg-red-700 text-white shadow-red-100'
                }`}
              >
                {currentIndex < activeQuestions.length - 1 ? 'Nächste' : isSubmitted ? 'Zum Ergebnis ↑' : 'Beenden & Auswerten'}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Persistent Navigation Dots */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-2xl rounded-full px-6 py-3 flex gap-2 max-w-[90vw] overflow-x-auto no-scrollbar scroll-smooth z-40">
        {activeQuestions.map((q, idx) => {
          const ans = userAnswers[q.id];
          const isActive = currentIndex === idx;
          const status = checkAnswer(q, ans);
          const feedback = isSubmitted || (practiceConfig.immediateFeedback && ans?.isChecked);
          
          let baseClasses = "w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold transition-all border-2 ";
          
          if (feedback) {
            if (status === 'correct') {
              baseClasses += isActive ? "bg-emerald-500 border-emerald-500 text-white scale-110 shadow-lg" : "bg-emerald-50 border-emerald-200 text-emerald-600";
            } else if (status === 'incorrect') {
              baseClasses += isActive ? "bg-red-500 border-red-500 text-white scale-110 shadow-lg" : "bg-red-50 border-red-200 text-red-600";
            } else {
              baseClasses += isActive ? "bg-slate-600 border-slate-600 text-white scale-110 shadow-lg" : "bg-slate-100 border-slate-200 text-slate-400";
            }
          } else {
            if (isActive) {
              baseClasses += "bg-indigo-600 border-indigo-600 text-white scale-110 shadow-lg shadow-indigo-200";
            } else if (ans && status !== 'unanswered') {
              baseClasses += "border-indigo-200 text-indigo-600 bg-indigo-50";
            } else {
              baseClasses += "border-slate-100 text-slate-400 hover:border-slate-200";
            }
          }
          
          return (
            <button 
              key={idx} 
              onClick={() => { setCurrentIndex(idx); setExplanation(null); }} 
              className={baseClasses}
              title={`Frage ${idx + 1}`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default App;
