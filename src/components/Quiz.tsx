'use client';

import { useState, useEffect } from 'react';
import { Play, RotateCcw, Check, X } from 'lucide-react';
import { SUPPORTED_LANGUAGES } from '@/types';
import { AudioButton } from './AudioButton';
import { Button } from './ui/Button';
import { getGenderStyle, getGenderSymbol, getGenderLabel } from '@/utils/genderStyles';

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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | 'center'>('center');

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
    
    if (currentQuestion < questions.length - 1) {
      // 現在の問題を左にスライドアウト
      setSlideDirection('left');
      setIsTransitioning(true);
      
      setTimeout(() => {
        // 問題を切り替えて右から開始
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(newAnswers[currentQuestion + 1]);
        setSlideDirection('right');
        
        // すぐに中央にスライドイン
        setTimeout(() => {
          setSlideDirection('center');
          setIsTransitioning(false);
        }, 50);
      }, 400);
    } else {
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    }
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
    setIsTransitioning(false);
    setSlideDirection('center');
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
            <div className="flex justify-center items-center space-x-1 mx-auto">
              <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0s' }}></div>
              <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.3s' }}></div>
              <div className="w-1.5 h-1.5 bg-solarized-base01 dark:bg-solarized-base0 rounded-full animate-pulse" style={{ animationDuration: '1.5s', animationDelay: '0.6s' }}></div>
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Object.entries(SUPPORTED_LANGUAGES).map(([code, name]) => (
                  <Button
                    key={code}
                    variant={selectedLanguage === code ? 'selected' : 'secondary'}
                    size="sm"
                    onClick={() => setSelectedLanguage(code)}
                  >
                    {name}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex justify-center">
              <Button
                onClick={handleStartQuiz}
                disabled={!selectedLanguage || isLoading}
                variant="primary"
                size="md"
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
            </Button>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (showResult) {
    const score = calculateScore();

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
            <div className="text-4xl font-bold text-solarized-orange">
              {score}/{questions.length}
            </div>
          </div>
          
          <div className="space-y-2 mb-6">
            {questions.map((q, index) => (
              <div key={index} className="flex items-center justify-between text-sm mr-2">
                <span className="text-solarized-base01 dark:text-solarized-base1">
                  {getLanguageFlag(q.language)} {q.translation} ({q.english})
                </span>
                <div className="flex items-center ml-4">
                  <span className={`mr-2 font-bold text-lg ${
                    q.correctGender === 'm' ? 'text-blue-500' :
                    q.correctGender === 'f' ? 'text-red-500' :
                    'text-yellow-600'
                  }`}>
                    {getGenderSymbol(q.correctGender)}
                  </span>
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
            <Button
              onClick={restartQuiz}
              variant="primary"
              className="flex-1"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button
              onClick={onClose}
              variant="secondary"
              className="flex-1"
            >
              Close
            </Button>
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
        <div className="bg-solarized-base2 dark:bg-solarized-base02 rounded-2xl p-8 m-4 max-w-md w-full min-h-[500px] border border-solarized-base1 dark:border-solarized-base01 shadow-xl pointer-events-auto animate-in slide-in-from-bottom-4 fade-in duration-300">
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

        {/* Question content with slide animation */}
        <div className="overflow-hidden min-h-[350px] flex items-center">
          <div className={`w-full transition-all duration-400 ease-in-out ${
            slideDirection === 'left' ? '-translate-x-full opacity-0' :
            slideDirection === 'right' ? 'translate-x-full opacity-0' :
            'translate-x-0 opacity-100'
          }`}>
            <div className="text-center mb-6">
              <div className="text-sm text-solarized-base00 dark:text-solarized-base0 mb-2">
                {getLanguageFlag(question.language)}
              </div>
              <div className="relative mb-2">
                <div className="text-2xl font-bold text-solarized-base01 dark:text-solarized-base1">
                  {question.translation}
                </div>
                <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                  <AudioButton 
                    text={question.translation} 
                    language={question.language}
                  />
                </div>
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
                  disabled={isTransitioning}
                  className={`relative w-full p-3 rounded-xl text-left transition-all duration-300 font-medium overflow-hidden transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed ${
                    selectedAnswer === option
                      ? 'bg-solarized-orange text-white scale-[1.02]'
                      : 'bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 hover:bg-stone-300 dark:hover:bg-stone-600'
                  }`}
                >
                  {/* Gender gradient background */}
                  <div className="absolute inset-0 opacity-40" style={getGenderStyle(option)}></div>
                  
                  {/* Gender symbol background */}
                  <div className={`absolute top-1/2 transform -translate-y-1/2 pointer-events-none select-none ${
                    option === 'n' ? 'right-4' : 'right-2'
                  }`} style={option === 'n' ? { marginLeft: '-4px' } : {}}>
                    <span className={`text-white font-bold opacity-40 ${
                      option === 'n' ? 'text-2xl' : 'text-5xl'
                    }`} aria-hidden="true">
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

        </div>
      </div>
    </>
  );
}