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
    
    // 自動的に次の問題へ進む
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(newAnswers[currentQuestion + 1]);
      } else {
        setShowResult(true);
      }
    }, 500);
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
      case 'n': return '⚲ Neuter';
      default: return gender;
    }
  };

  const getGenderStyle = (gender: string) => {
    switch (gender) {
      case 'm': return 'bg-gradient-to-r from-transparent to-blue-500 dark:to-blue-600';
      case 'f': return 'bg-gradient-to-r from-transparent to-pink-500 dark:to-pink-600';
      case 'n': return 'bg-gradient-to-r from-transparent to-gray-500 dark:to-gray-600';
      default: return 'bg-gradient-to-r from-transparent to-gray-500 dark:to-gray-600';
    }
  };

  const getGenderSymbol = (gender: string) => {
    switch (gender) {
      case 'm': return '♂';
      case 'f': return '♀';
      case 'n': return '⚲';
      default: return '?';
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
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-50" 
          onClick={onClose}
        />
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-8 border border-stone-200 dark:border-stone-700 pointer-events-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-center mt-4 text-stone-600 dark:text-stone-400">Loading quiz...</p>
          </div>
        </div>
      </>
    );
  }

  if (!quizStarted) {
    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-50" 
          onClick={onClose}
        />
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-8 m-4 max-w-md w-full border border-stone-200 dark:border-stone-700 shadow-xl pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                Gender Quiz
              </h2>
              <button
                onClick={onClose}
                className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-center mb-6">
              Test your knowledge of noun genders! You&apos;ll get 10 random words from French, German, and Spanish.
            </p>
            <div className="flex justify-center">
              <button
                onClick={() => setQuizStarted(true)}
                className="bg-amber-800 text-white px-6 py-2 rounded-xl hover:bg-amber-900 transition-colors flex items-center justify-center font-bold"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Quiz
            </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showResult) {
    const score = calculateScore();
    const percentage = Math.round((score / questions.length) * 100);

    return (
      <>
        <div 
          className="fixed inset-0 bg-black bg-opacity-30 z-50" 
          onClick={onClose}
        />
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-8 m-4 max-w-md w-full border border-stone-200 dark:border-stone-700 shadow-xl pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
                Quiz Complete!
              </h2>
              <button
                onClick={onClose}
                className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-amber-800 dark:text-amber-600 mb-2">
              {score}/{questions.length}
            </div>
            <div className="text-lg text-stone-600 dark:text-stone-400">
              {percentage}% correct
            </div>
          </div>
          
          <div className="space-y-2 mb-6 max-h-40 overflow-y-auto">
            {questions.map((q, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <span className="text-stone-600 dark:text-stone-400">
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
              className="flex-1 bg-amber-800 text-white px-4 py-2 rounded-xl hover:bg-amber-900 transition-colors flex items-center justify-center font-bold"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </button>
            <button
              onClick={onClose}
              className="flex-1 bg-stone-500 text-white px-4 py-2 rounded-xl hover:bg-stone-600 transition-colors font-bold"
            >
              Close
            </button>
          </div>
          </div>
        </div>
      </>
    );
  }

  const question = questions[currentQuestion];
  if (!question) return null;

  return (
    <>
      <div 
        className="fixed inset-0 bg-black bg-opacity-30 z-50" 
        onClick={onClose}
      />
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="bg-stone-100 dark:bg-stone-800 rounded-2xl p-8 m-4 max-w-md w-full border border-stone-200 dark:border-stone-700 shadow-xl pointer-events-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100">
              Question {currentQuestion + 1}/{questions.length}
            </h2>
            <button
              onClick={onClose}
              className="text-stone-500 hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200 p-1 rounded-full hover:bg-stone-200 dark:hover:bg-stone-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

        <div className="text-center mb-6">
          <div className="text-sm text-stone-500 dark:text-stone-400 mb-2">
            {getLanguageFlag(question.language)}
          </div>
          <div className="text-2xl font-bold text-stone-800 dark:text-stone-100 mb-2">
            {question.translation}
          </div>
          <div className="text-lg text-stone-600 dark:text-stone-300">
            ({question.english})
          </div>
        </div>

        <div className="space-y-3 mb-6">
          {question.options.map((option) => (
            <button
              key={option}
              onClick={() => handleAnswer(option)}
              className={`relative w-full p-3 rounded-xl text-left transition-colors font-medium overflow-hidden ${
                selectedAnswer === option
                  ? 'bg-amber-800 text-white'
                  : 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600'
              }`}
            >
              {/* Gender gradient background */}
              <div className={`absolute inset-0 ${getGenderStyle(option)} opacity-30`}></div>
              
              {/* Gender symbol background */}
              <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none select-none ${
                option === 'n' ? 'right-3' : 'right-2'
              }`} style={{ transform: option === 'n' ? 'translateY(-50%) translateX(-2px)' : 'translateY(-50%)' }}>
                <span className="text-white text-3xl font-bold opacity-40" aria-hidden="true">
                  {getGenderSymbol(option)}
                </span>
              </div>
              
              {/* Main content */}
              <div className="relative">
                {getGenderLabel(option)}
              </div>
            </button>
          ))}
        </div>

        </div>
      </div>
    </>
  );
}