'use client';

import { useState, useEffect } from 'react';
import { Play, RotateCcw, Check, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/types';

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
  const [isLoading, setIsLoading] = useState(false);
  const [quizStarted, setQuizStarted] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const loadQuestions = async (language: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/quiz?languages=${language}&count=10`);
      const data = await response.json();
      setQuestions(data.questions || []);
      setAnswers(new Array(data.questions?.length || 0).fill(null));
      setQuizStarted(true);
    } catch (error) {
      console.error('Failed to load quiz:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = () => {
    if (selectedLanguage) {
      loadQuestions(selectedLanguage);
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
      case 'm': return 'bg-gradient-to-r from-solarized-base00 to-solarized-blue dark:from-solarized-base0 dark:to-solarized-blue';
      case 'f': return 'bg-gradient-to-r from-solarized-base00 to-solarized-magenta dark:from-solarized-base0 dark:to-solarized-magenta';
      case 'n': return 'bg-solarized-base00 dark:bg-solarized-base0';
      default: return 'bg-solarized-base00 dark:bg-solarized-base0';
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
          <div className="bg-solarized-base2 dark:bg-solarized-base02 rounded-2xl p-8 border border-solarized-base1 dark:border-solarized-base01 pointer-events-auto">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="text-center mt-4 text-solarized-base00 dark:text-solarized-base0">Loading quiz...</p>
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
          <div className="bg-solarized-base2 dark:bg-solarized-base02 rounded-2xl p-8 m-4 max-w-md w-full border border-solarized-base1 dark:border-solarized-base01 shadow-xl pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-solarized-base01 dark:text-solarized-base1">
                Gender Quiz
              </h2>
              <button
                onClick={onClose}
                className="text-solarized-base00 hover:text-solarized-base01 dark:text-solarized-base0 dark:hover:text-solarized-base1 p-1 rounded-full hover:bg-solarized-base3 dark:hover:bg-solarized-base03 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-solarized-base00 dark:text-solarized-base0 mb-6">
              Test your knowledge of noun genders!<br />
              Choose a language and get 10 random words to identify their gender.
            </p>
            
            {/* Language Selection */}
            <div className="mb-6">
              <p className="text-sm font-medium text-solarized-base01 dark:text-solarized-base1 mb-3 text-center">
                Select Language
              </p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <button
                    key={code}
                    onClick={() => setSelectedLanguage(code)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedLanguage === code
                        ? 'bg-solarized-blue text-white'
                        : 'bg-solarized-base3 dark:bg-solarized-base03 text-solarized-base01 dark:text-solarized-base1 hover:bg-solarized-base1 dark:hover:bg-solarized-base01 hover:text-solarized-base3 dark:hover:text-solarized-base03'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={handleStartQuiz}
                disabled={!selectedLanguage || isLoading}
                className="bg-solarized-orange text-white px-6 py-2 rounded-xl hover:bg-solarized-red transition-colors flex items-center justify-center font-bold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Loading...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Quiz
                </>
              )}
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
          <div className="bg-solarized-base2 dark:bg-solarized-base02 rounded-2xl p-8 m-4 max-w-md w-full border border-solarized-base1 dark:border-solarized-base01 shadow-xl pointer-events-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-solarized-base01 dark:text-solarized-base1">
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
            <div className="text-4xl font-bold text-solarized-orange mb-2">
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
              className="flex-1 bg-solarized-orange text-white px-4 py-2 rounded-xl hover:bg-solarized-red transition-colors flex items-center justify-center font-bold"
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
        <div className="bg-solarized-base2 dark:bg-solarized-base02 rounded-2xl p-8 m-4 max-w-md w-full border border-solarized-base1 dark:border-solarized-base01 shadow-xl pointer-events-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-solarized-base01 dark:text-solarized-base1">
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
          <div className="text-sm text-solarized-base00 dark:text-solarized-base0 mb-2">
            {getLanguageFlag(question.language)}
          </div>
          <div className="text-2xl font-bold text-solarized-base01 dark:text-solarized-base1 mb-2">
            {question.translation}
          </div>
          <div className="text-lg text-solarized-base00 dark:text-solarized-base0">
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
                  ? 'bg-solarized-orange text-white'
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