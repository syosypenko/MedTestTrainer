# MedExam Master

An interactive medical exam practice application built with React and TypeScript, powered by Google's Gemini AI for intelligent feedback and explanations.

<img width="437" height="480" alt="Screenshot 2026-01-05 at 00 53 31" src="https://github.com/user-attachments/assets/13cfe9fb-ab2d-4f1f-b14c-fc54c23393fc" />

<img width="520" height="411" alt="Screenshot 2026-01-05 at 00 53 19" src="https://github.com/user-attachments/assets/58e12f41-b105-4ccb-bd88-7ecbbc6e40d7" />

<img width="1433" height="704" alt="Screenshot 2026-01-05 at 00 54 09" src="https://github.com/user-attachments/assets/f26f57ab-6a3b-41ab-b4d6-1a740c939802" />

## 📋 Features

- **Multiple Question Types Support:**
  - MCQ (Multiple Choice Questions - Type A)
  - KPrim (True/False evaluation questions)
  - Grouping Questions (Categorization tasks)
  - Free Text Questions

- **Flexible Practice Modes:**
  - Upload your own exam JSON files
  - Configure practice sessions (number of questions, randomization)
  - Immediate feedback mode or end-of-quiz review
  - AI-powered explanations using Google Gemini

- **Smart Learning Experience:**
  - Real-time answer validation
  - Intelligent feedback on correct and incorrect answers
  - Progress tracking
  - Score calculation and performance summary

- **User-Friendly Interface:**
  - Clean, modern UI with responsive design
  - Drag-and-drop file upload
  - Progress indicators
  - Navigation between questions
  - Keyboard shortcuts support

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite
- **AI Integration:** Google Gemini AI (@google/genai)
- **Styling:** CSS with custom components

## 📦 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd MedExamMaster
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory:
```
API_KEY=your_google_gemini_api_key
```

4. Start the development server:
```bash
npm run dev
```

## 📝 Usage

### Starting a Practice Session

1. **Upload an Exam File:** 
   - Drag and drop a JSON file or click to browse
   - The file should follow the exam data structure (see below)

2. **Configure Your Practice:**
   - Set the number of questions to practice
   - Choose whether to enable immediate feedback
   - Optionally randomize question order

3. **Take the Quiz:**
   - Answer questions one by one
   - Request AI explanations for any question
   - Navigate freely between questions
   - Submit to see your final score

### Exam Data Format

The application expects JSON files in the following structure:

```json
{
  "examination_data": {
    "exam_title": "Your Exam Title",
    "date": "2024-01-05",
    "total_questions": 10
  },
  "questions": [
    {
      "id": "q1",
      "number": 1,
      "type": "MCQ Typ A",
      "author": "Author Name",
      "question": "Question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "correct_answer": "Option 1"
    }
  ]
}
```

## 🏗️ Project Structure

```
MedExamMaster/
├── App.tsx                      # Main application component
├── index.tsx                    # Application entry point
├── types.ts                     # TypeScript type definitions
├── components/
│   └── QuestionRenderer.tsx     # Question display component
├── services/
│   └── geminiService.ts        # Google Gemini AI integration
└── metadata.json               # Application metadata
```

## 🚀 Build & Deploy

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available for educational purposes.

## 🔗 Links

- Live Demo: [https://medexam-master-230454825548.us-west1.run.app/](https://medexam-master-230454825548.us-west1.run.app/)
