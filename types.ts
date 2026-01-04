
export enum QuestionType {
  MCQ = "MCQ Typ A",
  KPRIM = "Kprim",
  GROUPING = "Gruppierungsfrage",
  FREETEXT = "Freitextfrage"
}

export interface Question {
  id: string;
  number: number;
  type: QuestionType | string;
  author: string;
  question: string;
  options?: string[];
  correct_answer?: string;
  mapping?: {
    Richtig: string[];
    Falsch: string[];
  };
  groups?: Record<string, string[]>;
  user_answer?: string;
  score?: number;
  note?: string;
}

export interface ExamData {
  examination_data: {
    exam_title: string;
    date: string;
    total_questions: number;
  };
  questions: Question[];
}

export interface UserAnswer {
  questionId: string;
  mcqSelection?: string;
  kprimAnswers?: Record<string, 'Richtig' | 'Falsch'>;
  groupingAnswers?: Record<string, string>;
  freeText?: string;
  isChecked?: boolean; // New: track if user requested feedback for this question in training mode
}

export interface PracticeConfig {
  numQuestions: number;
  immediateFeedback: boolean;
  randomize: boolean;
}
