
import React from 'react';
import { Question, QuestionType, UserAnswer } from '../types';

interface Props {
  question: Question;
  userAnswer?: UserAnswer;
  onAnswerChange: (answer: UserAnswer) => void;
  isSubmitted: boolean;
  showFeedback?: boolean; // Explicitly control feedback display
}

const QuestionRenderer: React.FC<Props> = ({ question, userAnswer, onAnswerChange, isSubmitted, showFeedback }) => {
  const type = question.type as QuestionType;
  const feedbackActive = isSubmitted || showFeedback;

  const handleMcqChange = (option: string) => {
    if (feedbackActive) return;
    onAnswerChange({
      questionId: question.id,
      mcqSelection: option
    });
  };

  const handleKprimChange = (item: string, value: 'Richtig' | 'Falsch') => {
    if (feedbackActive) return;
    const current = userAnswer?.kprimAnswers || {};
    onAnswerChange({
      questionId: question.id,
      kprimAnswers: { ...current, [item]: value }
    });
  };

  const handleGroupingChange = (item: string, group: string) => {
    if (feedbackActive) return;
    const current = userAnswer?.groupingAnswers || {};
    onAnswerChange({
      questionId: question.id,
      groupingAnswers: { ...current, [item]: group }
    });
  };

  const handleFreeTextChange = (text: string) => {
    if (feedbackActive) return;
    onAnswerChange({
      questionId: question.id,
      freeText: text
    });
  };

  const renderMCQ = () => (
    <div className="space-y-3">
      {question.options?.map((option, idx) => {
        const isCorrect = feedbackActive && option === question.correct_answer;
        const isSelected = userAnswer?.mcqSelection === option;
        const isWrong = feedbackActive && isSelected && option !== question.correct_answer;
        
        let containerClass = "flex items-start p-4 border rounded-xl cursor-pointer transition-all ";
        if (isCorrect) containerClass += "bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 ";
        else if (isWrong) containerClass += "bg-red-50 border-red-500 ";
        else if (isSelected) containerClass += "border-indigo-500 bg-indigo-50 ";
        else containerClass += "border-slate-200 hover:bg-slate-50 ";

        return (
          <label key={idx} className={containerClass}>
            <input
              type="radio"
              name={`q-${question.id}`}
              className={`mt-1 w-4 h-4 ${isCorrect ? 'text-emerald-600' : 'text-indigo-600'} border-slate-300 focus:ring-indigo-500`}
              checked={isSelected}
              onChange={() => handleMcqChange(option)}
              disabled={feedbackActive}
            />
            <div className="ml-3 flex-1 flex items-center justify-between">
              <span className={`text-slate-700 leading-tight ${isCorrect ? 'font-bold' : ''}`}>
                {option}
              </span>
              {isCorrect && (
                <span className="text-emerald-600 text-xs font-bold bg-white px-2 py-1 rounded border border-emerald-200 ml-2">RICHTIG</span>
              )}
              {isWrong && (
                <span className="text-red-600 text-xs font-bold bg-white px-2 py-1 rounded border border-red-200 ml-2">IHRE WAHL</span>
              )}
            </div>
          </label>
        );
      })}
    </div>
  );

  const renderKprim = () => {
    const items = [...(question.mapping?.Richtig || []), ...(question.mapping?.Falsch || [])].sort();
    return (
      <div className="overflow-x-auto border border-slate-200 rounded-xl">
        <table className="w-full text-sm">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-slate-600">Aussage</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 w-24">Richtig</th>
              <th className="px-4 py-3 text-center font-semibold text-slate-600 w-24">Falsch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.map((item, idx) => {
              const actual = question.mapping?.Richtig.includes(item) ? 'Richtig' : 'Falsch';
              const userSelection = userAnswer?.kprimAnswers?.[item];
              const isWrong = feedbackActive && userSelection && userSelection !== actual;

              return (
                <tr key={idx} className={`${isWrong ? 'bg-red-50' : feedbackActive ? 'bg-slate-50' : ''}`}>
                  <td className="px-4 py-4 text-slate-700 flex items-center gap-2">
                    {isWrong && <span className="text-red-500">✕</span>}
                    {!isWrong && feedbackActive && userSelection && <span className="text-emerald-500">✓</span>}
                    {item}
                  </td>
                  <td className={`px-4 py-4 text-center ${feedbackActive && actual === 'Richtig' ? 'bg-emerald-50/50 ring-1 ring-inset ring-emerald-200' : ''}`}>
                    <input 
                      type="radio" 
                      name={`kprim-${question.id}-${idx}`} 
                      className="w-4 h-4 text-indigo-600"
                      checked={userSelection === 'Richtig'}
                      onChange={() => handleKprimChange(item, 'Richtig')}
                      disabled={feedbackActive}
                    />
                  </td>
                  <td className={`px-4 py-4 text-center ${feedbackActive && actual === 'Falsch' ? 'bg-emerald-50/50 ring-1 ring-inset ring-emerald-200' : ''}`}>
                    <input 
                      type="radio" 
                      name={`kprim-${question.id}-${idx}`} 
                      className="w-4 h-4 text-indigo-600"
                      checked={userSelection === 'Falsch'}
                      onChange={() => handleKprimChange(item, 'Falsch')}
                      disabled={feedbackActive}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  const renderGrouping = () => {
    if (!question.groups) return null;
    const allItems: string[] = (Object.values(question.groups) as string[][]).flat().sort();
    const groupNames = Object.keys(question.groups);

    return (
      <div className="space-y-4">
        {allItems.map((item, idx) => {
          const actualGroup = groupNames.find(gn => question.groups![gn].includes(item));
          const userGroup = userAnswer?.groupingAnswers?.[item];
          const isWrong = feedbackActive && userGroup && userGroup !== actualGroup;

          return (
            <div key={idx} className={`p-4 border rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${isWrong ? 'bg-red-50 border-red-500' : feedbackActive && userGroup ? 'bg-slate-50 border-slate-200' : 'border-slate-200'}`}>
              <span className="text-slate-700 font-medium flex items-center gap-2">
                 {isWrong && <span className="text-red-500">✕</span>}
                 {!isWrong && feedbackActive && userGroup && <span className="text-emerald-500">✓</span>}
                 {item}
              </span>
              <div className="flex flex-wrap gap-3">
                {groupNames.map(group => {
                   const isCorrectGroup = feedbackActive && group === actualGroup;
                   return (
                    <label key={group} className={`flex items-center space-x-2 cursor-pointer px-3 py-1.5 rounded-lg border transition-all ${isCorrectGroup ? 'bg-emerald-50 border-emerald-400 text-emerald-700 ring-1 ring-emerald-400 font-bold' : 'border-transparent'}`}>
                      <input 
                        type="radio" 
                        name={`group-${question.id}-${idx}`} 
                        className="w-4 h-4 text-indigo-600"
                        checked={userGroup === group}
                        onChange={() => handleGroupingChange(item, group)}
                        disabled={feedbackActive}
                      />
                      <span className="text-sm">{group}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderFreeText = () => (
    <div className="space-y-4">
      <textarea
        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all h-32"
        placeholder="Geben Sie Ihre Antwort hier ein..."
        value={userAnswer?.freeText || ''}
        onChange={(e) => handleFreeTextChange(e.target.value)}
        disabled={feedbackActive}
      />
      {feedbackActive && (
        <div className="p-6 bg-amber-50 border border-amber-200 rounded-2xl">
          <h4 className="text-amber-800 font-bold text-sm mb-2 uppercase tracking-wider">Lösungshinweis</h4>
          <p className="text-amber-700 text-sm leading-relaxed italic">
            Vergleichen Sie Ihre Antwort mit dem medizinischen Kontext oder nutzen Sie die KI-Erklärung für detailliertes Feedback.
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="prose prose-slate max-w-none">
        <h3 className="text-xl font-bold text-slate-800 leading-snug">{question.question}</h3>
        <div className="flex items-center gap-3 mt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span className="bg-slate-100 px-2 py-1 rounded">Typ: {question.type}</span>
          <span className="bg-slate-100 px-2 py-1 rounded">Autor: {question.author}</span>
        </div>
      </div>

      <div className="mt-8">
        {type === QuestionType.MCQ && renderMCQ()}
        {type === QuestionType.KPRIM && renderKprim()}
        {type === QuestionType.GROUPING && renderGrouping()}
        {type === QuestionType.FREETEXT && renderFreeText()}
      </div>
    </div>
  );
};

export default QuestionRenderer;
