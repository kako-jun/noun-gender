'use client';

import { useState, useEffect } from 'react';
import { Play, RotateCcw, Check, X } from 'lucide-react';

interface QuizQuestion {
  id: number;
  english: string;
  translation: string;
  language: string;
  correctGender: string;
  options: string[];
  explanation: string;
}

interface QuizProps {
  onClose: () => void;
}

export function Quiz({ onClose }: QuizProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    loadQuestions();
  }, []);

  const loadQuestions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/quiz?languages=fr,de,es&count=10');
      const data = await response.json();
      setQuestions(data.questions || []);
      setAnswers(new Array(data.questions?.length || 0).fill(null));
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswer = (gender: string) => {
    setSelectedAnswer(gender);
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = gender;
    setAnswers(newAnswers);
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1]);
    } else {
      setShowResult(true);
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1]);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setAnswers(new Array(questions.length).fill(null));
    setShowResult(false);
    setQuizStarted(true);
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'm': return '♂ Masculine';
      case 'f': return '♀ Feminine';
      case 'n': return '○ Neuter';
      default: return gender;
    }
  };

  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = {
      'fr': '🇫🇷',
      'de': '🇩🇪',
      'es': '🇪🇸',
      'it': '🇮🇹',
      'pt': '🇵🇹',
      'ru': '🇷🇺'
    };
    return flags[lang] || '🌍';
  };

  const calculateScore = () => {
    return answers.filter((answer, index) => 
      answer === questions[index]?.correctGender
    ).length;
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4 text-gray-600 dark:text-gray-400">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 m-4 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">
            Gender Quiz
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
            Test your knowledge of noun genders! You'll get 10 random words from French, German, and Spanish.
          </p>
          <div className="flex space-x-3">
            <button
              onClick={() => setQuizStarted(true)}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Quiz
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 m-4 max-w-md w-full">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800 dark:text-gray-200">
            Quiz Complete!
          </h2>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-blue-500 mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-400">
              {percentage}% correct
            </div>
          </div>
          
          <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
            {questions.map((q, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">
                  {getLanguageFlag(q.language)} {q.english} → {q.translation}
                </span>
                <div className="flex items-center">
                  {answers[index] === q.correctGender ? (
                    <Check className="w-4 h-4 text-green-500" />
                  ) : (
                    <X className="w-4 h-4 text-red-500" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={restartQuiz}
              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 m-4 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            Question {currentQuestion + 1}/{questions.length}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mb-6">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {getLanguageFlag(question.language)} {question.language.toUpperCase()}
          </div>
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">
            {question.translation}
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-400">
            ({question.english})
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={`w-full p-3 rounded-lg text-left transition-colors ${
                selectedAnswer === option
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {getGenderLabel(option)}
            </button>
          ))}
        </div>

        <div className="flex justify-between">
          <button
            onClick={prevQuestion}
            disabled={currentQuestion === 0}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-400 transition-colors"
          >
            Previous
          </button>
          <button
            onClick={nextQuestion}
            disabled={!selectedAnswer}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
          >
            {currentQuestion === questions.length - 1 ? 'Finish' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}