import React, { useState, useEffect, useRef } from 'react';
import { 
  biology2ndPaperQuestions 
} from './data/biology2ndPaperQuestions';
import { 
  Play, 
  RotateCcw, 
  Award, 
  BookOpen, 
  HelpCircle, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  ListRestart, 
  Bookmark, 
  Info,
  Menu,
  X
} from 'lucide-react';

export default function App() {
  // --- STATE ---
  const [examActive, setExamActive] = useState(false);
  const [examSubmitted, setExamSubmitted] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: 'A' | 'B' | 'C' | 'D' }
  const [markedQuestions, setMarkedQuestions] = useState([]); // [questionId]
  const [timerLeft, setTimerLeft] = useState(null); // seconds
  const [startTime, setStartTime] = useState(null);
  const [timeTaken, setTimeTaken] = useState(0); // seconds
  const [questionsList, setQuestionsList] = useState([]); // Selected questions for current session
  
  // Confirmation Modal state
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  
  // Mobile navigation drawer state
  const [showMobileDrawer, setShowMobileDrawer] = useState(false);

  // Review Filter
  const [reviewFilter, setReviewFilter] = useState('all'); // 'all' | 'wrong' | 'unanswered' | 'marked'

  // Leaderboard & Student Name states
  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem('hsc_bio_leaderboard');
    return saved ? JSON.parse(saved) : [];
  });
  const [studentName, setStudentName] = useState(() => {
    return localStorage.getItem('hsc_bio_studentName') || '';
  });
  const [activeLandingTab, setActiveLandingTab] = useState('start'); // 'start' | 'leaderboard'
  const [subTab, setSubTab] = useState('leaderboard'); // 'leaderboard' | 'personal'
  const [searchProgressName, setSearchProgressName] = useState('');

  useEffect(() => {
    if (studentName && !searchProgressName) {
      setSearchProgressName(studentName);
    }
  }, [studentName]);

  useEffect(() => {
    localStorage.setItem('hsc_bio_leaderboard', JSON.stringify(leaderboard));
  }, [leaderboard]);

  useEffect(() => {
    localStorage.setItem('hsc_bio_studentName', studentName);
  }, [studentName]);

  // Exam Configuration
  const [config, setConfig] = useState({
    mode: 'practice', // 'full' | 'practice' | 'random' | 'chapter' | 'custom'
    selectedChapters: [],
    questionCount: 25,
    hasTimer: true,
    timerMinutes: 25,
    randomizeQuestions: true,
    randomizeOptions: false
  });

  // Unique list of chapters
  const allChapters = [
    "Chapter 1: Animal Diversity & Classification",
    "Chapter 2: Animal Introduction (Hydra, Grasshopper, Rohu)",
    "Chapter 3: Human Physiology: Digestion & Absorption",
    "Chapter 4: Human Physiology: Blood & Circulation",
    "Chapter 5: Human Physiology: Breathing & Respiration",
    "Chapter 6: Human Physiology: Waste & Excretion",
    "Chapter 7: Human Physiology: Locomotion & Movement",
    "Chapter 8: Human Physiology: Coordination & Control",
    "Chapter 9: Continuity of Life (Reproduction)",
    "Chapter 10: Body Defense (Immunology)",
    "Chapter 11: Genetics & Evolution",
    "Chapter 12: Animal Behavior"
  ];

  // Ref for timer
  const timerRef = useRef(null);

  // --- LOCAL STORAGE PERSISTENCE ---
  // Load saved state on mount
  useEffect(() => {
    const savedActive = localStorage.getItem('hsc_bio_examActive');
    if (savedActive === 'true') {
      try {
        const savedAnswers = JSON.parse(localStorage.getItem('hsc_bio_answers')) || {};
        const savedMarked = JSON.parse(localStorage.getItem('hsc_bio_markedQuestions')) || [];
        const savedIndex = parseInt(localStorage.getItem('hsc_bio_currentIndex'), 10) || 0;
        const savedQuestions = JSON.parse(localStorage.getItem('hsc_bio_questionsList')) || [];
        const savedTimeLeft = localStorage.getItem('hsc_bio_timerLeft');
        const savedStartTime = localStorage.getItem('hsc_bio_startTime');
        const savedConfig = JSON.parse(localStorage.getItem('hsc_bio_config')) || {};
        const savedSubmitted = localStorage.getItem('hsc_bio_submitted') === 'true';
        const savedTimeTaken = parseInt(localStorage.getItem('hsc_bio_timeTaken'), 10) || 0;

        setAnswers(savedAnswers);
        setMarkedQuestions(savedMarked);
        setCurrentQuestionIndex(savedIndex);
        setQuestionsList(savedQuestions);
        setStartTime(savedStartTime ? parseInt(savedStartTime, 10) : null);
        setConfig(prev => ({ ...prev, ...savedConfig }));
        setExamActive(true);
        setExamSubmitted(savedSubmitted);
        setTimeTaken(savedTimeTaken);

        if (savedTimeLeft !== null && savedTimeLeft !== 'undefined') {
          setTimerLeft(parseInt(savedTimeLeft, 10));
        }
      } catch (e) {
        console.error("Error loading saved exam state:", e);
      }
    }
  }, []);

  // Save state when it changes
  useEffect(() => {
    if (examActive) {
      localStorage.setItem('hsc_bio_examActive', 'true');
      localStorage.setItem('hsc_bio_answers', JSON.stringify(answers));
      localStorage.setItem('hsc_bio_markedQuestions', JSON.stringify(markedQuestions));
      localStorage.setItem('hsc_bio_currentIndex', currentQuestionIndex.toString());
      localStorage.setItem('hsc_bio_questionsList', JSON.stringify(questionsList));
      localStorage.setItem('hsc_bio_config', JSON.stringify(config));
      localStorage.setItem('hsc_bio_submitted', examSubmitted.toString());
      localStorage.setItem('hsc_bio_timeTaken', timeTaken.toString());
      if (timerLeft !== null) {
        localStorage.setItem('hsc_bio_timerLeft', timerLeft.toString());
      }
      if (startTime !== null) {
        localStorage.setItem('hsc_bio_startTime', startTime.toString());
      }
    } else {
      // Clear persistence if exam is not active
      localStorage.removeItem('hsc_bio_examActive');
      localStorage.removeItem('hsc_bio_answers');
      localStorage.removeItem('hsc_bio_markedQuestions');
      localStorage.removeItem('hsc_bio_currentIndex');
      localStorage.removeItem('hsc_bio_questionsList');
      localStorage.removeItem('hsc_bio_timerLeft');
      localStorage.removeItem('hsc_bio_startTime');
      localStorage.removeItem('hsc_bio_submitted');
      localStorage.removeItem('hsc_bio_timeTaken');
    }
  }, [examActive, answers, markedQuestions, currentQuestionIndex, questionsList, timerLeft, startTime, config, examSubmitted, timeTaken]);

  // --- WARN BEFORE LEAVING ACTIVE EXAM ---
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (examActive && !examSubmitted) {
        e.preventDefault();
        e.returnValue = 'Are you sure you want to leave? Your answers are saved, but the timer will continue running.';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [examActive, examSubmitted]);

  // --- TIMER EFFECT ---
  useEffect(() => {
    if (examActive && !examSubmitted && config.hasTimer && timerLeft !== null) {
      timerRef.current = setInterval(() => {
        setTimerLeft(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            submitExam(true); // Auto submit when timer hits zero
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [examActive, examSubmitted, config.hasTimer, timerLeft]);

  // --- HANDLERS ---
  const handleStartNewExam = (customConfig = null) => {
    const activeConfig = customConfig || config;
    
    // Filter questions based on configuration
    let filtered = [...biology2ndPaperQuestions];
    
    // Chapter filter
    if (activeConfig.selectedChapters.length > 0) {
      filtered = filtered.filter(q => activeConfig.selectedChapters.includes(q.chapter));
    }

    // Shuffle questions if requested
    if (activeConfig.randomizeQuestions) {
      filtered.sort(() => Math.random() - 0.5);
    }

    // Limit count
    let count = parseInt(activeConfig.questionCount, 10);
    if (activeConfig.mode === 'full') {
      count = 500;
    }
    filtered = filtered.slice(0, count);

    // If randomizeOptions is enabled, we shuffle the A, B, C, D maps.
    // For now we keep them stable but we can support random choice rendering.
    
    // Initialize states
    setQuestionsList(filtered);
    setAnswers({});
    setMarkedQuestions([]);
    setCurrentQuestionIndex(0);
    setExamSubmitted(false);
    setShowSubmitModal(false);
    
    const totalSec = activeConfig.hasTimer ? activeConfig.timerMinutes * 60 : null;
    setTimerLeft(totalSec);
    setStartTime(Date.now());
    setTimeTaken(0);
    setExamActive(true);
  };

  const handleSelectOption = (questionId, optionKey) => {
    if (examSubmitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionKey
    }));
  };

  const handleToggleMarkForReview = (questionId) => {
    if (examSubmitted) return;
    setMarkedQuestions(prev => {
      if (prev.includes(questionId)) {
        return prev.filter(id => id !== questionId);
      } else {
        return [...prev, questionId];
      }
    });
  };

  const submitExam = (autoSubmit = false) => {
    if (timerRef.current) clearInterval(timerRef.current);
    
    // Calculate final time taken
    let finalTimeTaken = 0;
    if (startTime) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const totalAllocated = config.timerMinutes * 60;
      finalTimeTaken = config.hasTimer ? Math.min(elapsed, totalAllocated) : elapsed;
      setTimeTaken(finalTimeTaken);
    }

    // Calculate final score
    let finalCorrect = 0;
    questionsList.forEach(q => {
      if (answers[q.id] === q.correctAnswer) {
        finalCorrect++;
      }
    });

    const finalPercent = questionsList.length > 0 ? Math.round((finalCorrect / questionsList.length) * 100) : 0;

    // Save to leaderboard database
    const newRecord = {
      id: Date.now(),
      name: studentName.trim() || 'অজ্ঞাত শিক্ষার্থী 🐾',
      score: finalCorrect,
      total: questionsList.length,
      percentage: finalPercent,
      timeTaken: finalTimeTaken,
      mode: config.mode,
      chapters: config.selectedChapters.length > 0 ? config.selectedChapters : allChapters,
      date: new Date().toLocaleDateString('bn-BD') + ' ' + new Date().toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit', hour12: true })
    };

    setLeaderboard(prev => [newRecord, ...prev]);

    setExamSubmitted(true);
    setShowSubmitModal(false);
    
    // If it was autosubmitted, alert the user
    if (autoSubmit) {
      alert("⏱️ Time is up! Your exam has been submitted automatically.");
    }
  };

  const resetToLanding = () => {
    if (window.confirm("Return to home? Your current exam progress will be cleared.")) {
      setExamActive(false);
      setExamSubmitted(false);
      setAnswers({});
      setMarkedQuestions([]);
      setQuestionsList([]);
      setCurrentQuestionIndex(0);
      setTimerLeft(null);
      setStartTime(null);
      setTimeTaken(0);
    }
  };

  const handleModeChange = (mode) => {
    let qCount = 25;
    let mins = 25;
    let chaptersSelected = [];

    if (mode === 'full') {
      qCount = 500;
      mins = 500; // 500 questions = 500 mins
    } else if (mode === 'practice') {
      qCount = 25;
      mins = 25;
    } else if (mode === 'random') {
      qCount = 50;
      mins = 50;
    }

    setConfig(prev => ({
      ...prev,
      mode,
      questionCount: qCount,
      timerMinutes: mins,
      selectedChapters: chaptersSelected
    }));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!examActive || examSubmitted || showSubmitModal) return;

      const activeQ = questionsList[currentQuestionIndex];
      if (!activeQ) return;

      if (e.key === 'ArrowRight' || e.key === 'd') {
        if (currentQuestionIndex < questionsList.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        if (currentQuestionIndex > 0) {
          setCurrentQuestionIndex(prev => prev - 1);
        }
      } else if (e.key.toLowerCase() === 'm') {
        handleToggleMarkForReview(activeQ.id);
      } else if (['1', '2', '3', '4'].includes(e.key)) {
        const optionKeys = ['A', 'B', 'C', 'D'];
        handleSelectOption(activeQ.id, optionKeys[parseInt(e.key) - 1]);
      } else if (e.key.toLowerCase() === 'a') {
        handleSelectOption(activeQ.id, 'A');
      } else if (e.key.toLowerCase() === 'b') {
        handleSelectOption(activeQ.id, 'B');
      } else if (e.key.toLowerCase() === 'c') {
        handleSelectOption(activeQ.id, 'C');
      } else if (e.key.toLowerCase() === 'd' && e.key !== 'd') {
        handleSelectOption(activeQ.id, 'D');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [examActive, examSubmitted, currentQuestionIndex, questionsList, showSubmitModal]);

  // --- STATS CALCULATION ---
  const totalQuestions = questionsList.length;
  const answeredCount = Object.keys(answers).length;
  const unansweredCount = totalQuestions - answeredCount;
  const markedCount = markedQuestions.length;

  let correctCount = 0;
  let wrongCount = 0;
  if (examSubmitted) {
    questionsList.forEach(q => {
      const userAns = answers[q.id];
      if (userAns === q.correctAnswer) {
        correctCount++;
      } else if (userAns) {
        wrongCount++;
      }
    });
  }

  const score = correctCount;
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  const getPerformanceFeedback = () => {
    if (percentage >= 90) return { label: "Excellent 🌟", color: "text-emerald-600 bg-emerald-50 border-emerald-200" };
    if (percentage >= 75) return { label: "Very Good ✨", color: "text-sakura-600 bg-sakura-50 border-sakura-200" };
    if (percentage >= 50) return { label: "Good 🌸", color: "text-lavender-600 bg-lavender-50 border-lavender-200" };
    return { label: "Needs Improvement 💖", color: "text-roseGold-600 bg-roseGold-50 border-roseGold-200" };
  };

  // Format seconds to HH:MM:SS
  const formatTime = (secs) => {
    if (secs === null || isNaN(secs)) return '--:--:--';
    const hrs = Math.floor(secs / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    const remainingSecs = secs % 60;
    return [
      hrs.toString().padStart(2, '0'),
      mins.toString().padStart(2, '0'),
      remainingSecs.toString().padStart(2, '0')
    ].join(':');
  };

  // --- UI RENDER HELPER ---
  const currentQuestion = questionsList[currentQuestionIndex];

  return (
    <div className="min-h-screen girly-sparkles font-sans flex flex-col transition-all duration-300 relative">
      
      {/* Cute Floating Cats Background decoration */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none opacity-30">
        <span className="absolute text-5xl top-[10%] left-[5%] animate-float-slow opacity-60">🐱</span>
        <span className="absolute text-4xl top-[40%] left-[8%] animate-float-medium opacity-50">🐈</span>
        <span className="absolute text-3xl top-[75%] left-[4%] animate-float-slow opacity-40">🐾</span>
        <span className="absolute text-5xl top-[15%] right-[6%] animate-float-medium opacity-65">🐈‍⬛</span>
        <span className="absolute text-4xl top-[50%] right-[10%] animate-float-slow opacity-55">🐱</span>
        <span className="absolute text-3xl top-[80%] right-[5%] animate-float-medium opacity-45">🐾</span>
      </div>

      {/* --- HEADER NAVBAR --- */}
      <header className="sticky top-0 z-40 glass-panel-heavy border-b border-sakura-100 py-3.5 px-4 sm:px-6 shadow-sakura-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl sm:text-3xl animate-float-slow">🐈</span>
            <div>
              <h1 className="font-display font-bold text-slate-800 text-lg sm:text-xl tracking-tight leading-tight">
                HSC 2026 <span className="text-sakura-500">Biology 2nd</span>
              </h1>
              <p className="text-[10px] sm:text-xs text-slate-500 font-semibold tracking-wider uppercase flex items-center gap-1">
                Hard & Trap MCQ Simulator • <span className="text-sakura-500 font-bold">Created by Mishkat 🐾</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {examActive && (
              <button
                onClick={resetToLanding}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-slate-600 hover:text-sakura-600 bg-slate-100 hover:bg-sakura-50 border border-slate-200 hover:border-sakura-200 transition-all duration-200"
              >
                <Home className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Quit Exam</span>
              </button>
            )}
            <span className="hidden sm:flex text-xs items-center gap-1.5 bg-sakura-100 text-sakura-700 px-3 py-1 rounded-full font-bold shadow-sakura-sm">
              Batch 2026 🎓
            </span>
          </div>
        </div>
      </header>

      {/* --- MAIN PAGE CONTENT CONTAINER --- */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 sm:px-6 sm:py-8 z-10 relative">
        
        {/* ==================================================
            1. LANDING/CONFIG PAGE VIEW
            ================================================== */}
        {!examActive && (
          <div className="max-w-3xl mx-auto space-y-6 animate-slide-up">
            
            {/* Banner */}
            <div className="text-center space-y-3 py-6 px-4 bg-gradient-to-br from-sakura-100 via-roseGold-100 to-lavender-100 rounded-3xl border border-sakura-200 shadow-sakura">
              <span className="inline-block text-4xl animate-bounce">🐱🧬🌸</span>
              <h2 className="font-display text-2xl sm:text-4xl font-extrabold text-slate-800 leading-tight">
                Master Biology 2nd Paper
              </h2>
              <p className="text-slate-600 text-sm sm:text-base max-w-lg mx-auto">
                Test your knowledge with <span className="font-bold text-sakura-600">500 Original Hard & Trap Questions</span> designed explicitly for Bangladesh HSC 2026 Batch!
              </p>
              
              {/* Local Storage Restore Alert */}
              {localStorage.getItem('hsc_bio_examActive') === 'true' && (
                <div className="mt-6 inline-flex flex-col sm:flex-row gap-3 items-center justify-center p-3 bg-white/70 backdrop-blur-md rounded-2xl border border-sakura-300 shadow-sm animate-pulse-subtle">
                  <span className="text-xs font-semibold text-slate-700">
                    📂 Found an unfinished active exam progress!
                  </span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setExamActive(true);
                      }}
                      className="px-4 py-1.5 text-xs font-bold text-white bg-sakura-500 hover:bg-sakura-600 rounded-xl transition-all shadow-sm"
                    >
                      Continue Exam
                    </button>
                    <button
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                    >
                      Discard & Start New
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Tab Selector */}
            <div className="flex gap-2 p-1 bg-white/60 backdrop-blur-md rounded-2xl border border-sakura-100 max-w-sm mx-auto shadow-sakura-sm">
              <button
                onClick={() => setActiveLandingTab('start')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeLandingTab === 'start'
                    ? 'bg-sakura-500 text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-sakura-500'
                }`}
              >
                📝 পরীক্ষা শুরু করো
              </button>
              <button
                onClick={() => setActiveLandingTab('leaderboard')}
                className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  activeLandingTab === 'leaderboard'
                    ? 'bg-sakura-500 text-white shadow-sm font-extrabold'
                    : 'text-slate-500 hover:text-sakura-500'
                }`}
              >
                🏆 মেধা তালিকা ও রেকর্ড
              </button>
            </div>

            {/* Config Box */}
            {activeLandingTab === 'start' && (
              <div className="glass-panel-heavy p-6 sm:p-8 rounded-3xl shadow-sakura space-y-6">
                <h3 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-sakura-500" />
                  Configure Your Examination
                </h3>

                {/* Student Name Input */}
                <div className="p-4 bg-white/40 border border-sakura-100 rounded-2xl space-y-2.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                    🐱 তোমার নাম লেখো (Enter Student Name)
                  </label>
                  <input
                    type="text"
                    placeholder="যেমন: মাইশা রহমান 🌸"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white/90 text-slate-700 text-sm font-semibold focus:border-sakura-350 focus:ring-2 focus:ring-sakura-200 outline-none transition-all shadow-inner"
                  />
                </div>

              <div className="space-y-6">
                
                {/* Mode Select */}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                    Select Exam Mode
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'full', label: '🌸 Full Exam (500 Qs)', desc: 'Complete 500 question bank' },
                      { key: 'practice', label: '✍️ Practice Exam', desc: 'Select questions & timer' },
                      { key: 'random', label: '🎲 Random Exam', desc: 'Randomly choose queries' },
                      { key: 'chapter', label: '📖 Chapter-wise', desc: 'Test specific chapters' },
                      { key: 'custom', label: '⚙️ Custom Exam', desc: 'Fully customize all parameters' }
                    ].map((m) => (
                      <button
                        key={m.key}
                        onClick={() => handleModeChange(m.key)}
                        className={`p-3.5 rounded-2xl border text-left transition-all duration-200 flex flex-col justify-between ${
                          config.mode === m.key 
                            ? 'bg-gradient-to-br from-sakura-50 to-sakura-100/50 border-sakura-400 ring-2 ring-sakura-200/50 shadow-sm'
                            : 'border-slate-200 hover:border-sakura-300 hover:bg-sakura-50/20 bg-white'
                        }`}
                      >
                        <span className="text-xs font-bold text-slate-800">{m.label}</span>
                        <span className="text-[10px] text-slate-400 font-medium leading-none mt-1">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chapter Select */}
                {(config.mode === 'chapter' || config.mode === 'custom') && (
                  <div className="p-4 bg-white/40 rounded-2xl border border-sakura-100">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Select Biology 2nd Paper Chapters (Zoology)
                    </label>
                    <p className="text-[10px] text-slate-400 mb-3">You can select one or multiple chapters to test.</p>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {allChapters.map((ch) => {
                        const isSelected = config.selectedChapters.includes(ch);
                        return (
                          <button
                            key={ch}
                            onClick={() => {
                              setConfig(prev => {
                                const exists = prev.selectedChapters.includes(ch);
                                return {
                                  ...prev,
                                  selectedChapters: exists 
                                    ? prev.selectedChapters.filter(c => c !== ch)
                                    : [...prev.selectedChapters, ch]
                                };
                              });
                            }}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl border text-left text-xs transition-all ${
                              isSelected
                                ? 'bg-sakura-50 border-sakura-300 font-semibold text-sakura-700'
                                : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-sakura-50/20'
                            }`}
                          >
                            <span>{ch}</span>
                            <span className={`w-4 h-4 rounded-full flex items-center justify-center border text-[9px] ${
                              isSelected ? 'bg-sakura-500 border-sakura-500 text-white' : 'border-slate-300'
                            }`}>
                              {isSelected && '✓'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Question Count and Timer Limits */}
                {config.mode !== 'full' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* Questions Count */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Number of Questions
                      </label>
                      <select
                        value={config.questionCount}
                        onChange={(e) => setConfig(prev => ({ ...prev, questionCount: parseInt(e.target.value) }))}
                        className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 text-sm focus:border-sakura-300 focus:ring-2 focus:ring-sakura-200 outline-none"
                      >
                        {[10, 25, 50, 100, 200, 500].map(val => (
                          <option key={val} value={val}>{val} Questions</option>
                        ))}
                      </select>
                    </div>

                    {/* Timer Options */}
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Exam Timer Mode
                      </label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setConfig(prev => ({ ...prev, hasTimer: true }))}
                          className={`flex-1 p-2.5 text-xs font-bold rounded-xl border transition-all ${
                            config.hasTimer 
                              ? 'bg-sakura-500 border-sakura-500 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-sakura-50/10'
                          }`}
                        >
                          Enable Timer
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfig(prev => ({ ...prev, hasTimer: false }))}
                          className={`flex-1 p-2.5 text-xs font-bold rounded-xl border transition-all ${
                            !config.hasTimer 
                              ? 'bg-sakura-500 border-sakura-500 text-white shadow-sm'
                              : 'bg-white border-slate-200 text-slate-600 hover:bg-sakura-50/10'
                          }`}
                        >
                          No Timer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Custom Minutes Input if Timer is Enabled */}
                {config.hasTimer && config.mode !== 'full' && (
                  <div className="p-3 bg-sakura-50/30 rounded-2xl border border-sakura-100 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-sakura-500 animate-pulse" />
                      <div>
                        <span className="text-xs font-bold text-slate-700 block">Set Custom Timer Duration</span>
                        <span className="text-[10px] text-slate-400">Default is 1 minute per question.</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="1"
                        max="600"
                        value={config.timerMinutes}
                        onChange={(e) => setConfig(prev => ({ ...prev, timerMinutes: parseInt(e.target.value) || 1 }))}
                        className="w-16 p-1.5 text-center font-bold text-slate-700 bg-white border border-slate-200 rounded-lg focus:border-sakura-300 outline-none text-sm"
                      />
                      <span className="text-xs font-bold text-slate-500">mins</span>
                    </div>
                  </div>
                )}

                {/* Shuffling Options Toggles */}
                {config.mode === 'custom' && (
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-2.5 p-3 bg-white/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-sakura-50/10 transition-all">
                      <input
                        type="checkbox"
                        checked={config.randomizeQuestions}
                        onChange={(e) => setConfig(prev => ({ ...prev, randomizeQuestions: e.target.checked }))}
                        className="accent-sakura-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-600">Shuffle Questions</span>
                    </label>
                    <label className="flex items-center gap-2.5 p-3 bg-white/60 border border-slate-200 rounded-xl cursor-pointer hover:bg-sakura-50/10 transition-all">
                      <input
                        type="checkbox"
                        checked={config.randomizeOptions}
                        onChange={(e) => setConfig(prev => ({ ...prev, randomizeOptions: e.target.checked }))}
                        className="accent-sakura-500 w-4 h-4"
                      />
                      <span className="text-xs font-bold text-slate-600">Shuffle Options</span>
                    </label>
                  </div>
                )}
              </div>

              {/* Start Button */}
              <button
                onClick={() => handleStartNewExam()}
                className="w-full mt-8 py-4 bg-gradient-to-r from-sakura-500 via-roseGold-500 to-lavender-500 hover:from-sakura-600 hover:to-lavender-600 text-white font-display font-extrabold text-base rounded-2xl shadow-sakura hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 flex items-center justify-center gap-2 btn-sparkle-glow"
              >
                <Play className="w-5 h-5 fill-white" />
                Start Examination
              </button>
            </div>
            )}
            {activeLandingTab === 'leaderboard' && (
              <div className="glass-panel-heavy p-6 sm:p-8 rounded-3xl shadow-sakura space-y-6 animate-scale-in">
                
                {/* Header Title */}
                <div className="text-center space-y-2">
                  <span className="text-4xl animate-bounce">🏆</span>
                  <h3 className="font-display text-xl font-black text-slate-800">
                    মেধা তালিকা ও পরীক্ষার রেকর্ড
                  </h3>
                  <p className="text-xs text-slate-400 font-bold uppercase">
                    HSC 2026 Biology 2nd Paper (Zoology)
                  </p>
                </div>

                {/* Sub-tabs selector */}
                <div className="flex border-b border-sakura-100 pb-1 gap-4 text-xs font-bold justify-center">
                  <button
                    onClick={() => setSubTab('leaderboard')}
                    className={`pb-2 px-2 transition-all ${
                      subTab === 'leaderboard'
                        ? 'border-b-2 border-sakura-500 text-sakura-600'
                        : 'text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    👑 টপ ১০ র‍্যাঙ্কিং (Top Rankings)
                  </button>
                  <button
                    onClick={() => setSubTab('personal')}
                    className={`pb-2 px-2 transition-all ${
                      subTab === 'personal'
                        ? 'border-b-2 border-sakura-500 text-sakura-600'
                        : 'text-slate-400 hover:text-slate-650'
                    }`}
                  >
                    📊 ব্যক্তিগত অগ্রগতি (My Progress Dashboard)
                  </button>
                </div>

                {/* VIEW A: Rankings Table */}
                {subTab === 'leaderboard' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        🌟 গ্লোবাল লিডারবোর্ড
                      </h4>
                      {leaderboard.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6 bg-white/40 border border-sakura-100 rounded-2xl">
                          এখনো কোনো রেকর্ড নেই। পরীক্ষা দিয়ে প্রথম স্থান অর্জন করো! 🌸
                        </p>
                      ) : (
                        <div className="overflow-x-auto rounded-2xl border border-sakura-100 bg-white/40 shadow-sm">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-sakura-50 border-b border-sakura-100 font-extrabold text-slate-700">
                                <th className="p-3 text-center">স্থান (Rank)</th>
                                <th className="p-3">শিক্ষার্থী (Name)</th>
                                <th className="p-3 text-center">স্কোর (Score)</th>
                                <th className="p-3 text-center">শতকরা (Percentage)</th>
                                <th className="p-3 text-center">সময় (Time)</th>
                                <th className="p-3 text-center">মোড (Mode)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-sakura-50">
                              {[...leaderboard]
                                .sort((a, b) => {
                                  if (b.percentage !== a.percentage) {
                                    return b.percentage - a.percentage;
                                  }
                                  return a.timeTaken - b.timeTaken;
                                })
                                .slice(0, 10)
                                .map((record, index) => {
                                  let medal = (index + 1).toString();
                                  if (index === 0) medal = '🥇';
                                  if (index === 1) medal = '🥈';
                                  if (index === 2) medal = '🥉';
                                  return (
                                    <tr key={record.id} className="hover:bg-sakura-50/20 font-medium text-slate-650 transition-colors">
                                      <td className="p-3 text-center font-bold text-base">{medal}</td>
                                      <td className="p-3 font-semibold text-slate-800 flex items-center gap-1.5">
                                        <span>🐱</span>
                                        <span>{record.name}</span>
                                      </td>
                                      <td className="p-3 text-center font-bold">{record.score} / {record.total}</td>
                                      <td className="p-3 text-center text-sakura-600 font-extrabold">{record.percentage}%</td>
                                      <td className="p-3 text-center font-mono">{formatTime(record.timeTaken)}</td>
                                      <td className="p-3 text-center uppercase text-[10px] font-bold text-slate-400">{record.mode}</td>
                                    </tr>
                                  );
                                })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>

                    {/* Recent Attempts logs */}
                    {leaderboard.length > 0 && (
                      <div className="space-y-3 pt-2">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            📜 সাম্প্রতিক প্রচেষ্টাসমূহ (Recent Attempts)
                          </h4>
                          <button
                            onClick={() => {
                              if (window.confirm("তুমি কি সব ইতিহাস ও লিডারবোর্ড তথ্য মুছে ফেলতে চাও?")) {
                                setLeaderboard([]);
                              }
                            }}
                            className="text-[10px] font-bold text-rose-500 hover:text-rose-600 hover:underline"
                          >
                            ইতিহাস মুছুন (Clear All)
                          </button>
                        </div>
                        <div className="max-h-64 overflow-y-auto rounded-2xl border border-slate-200 bg-white/30 pr-1">
                          <div className="divide-y divide-slate-100">
                            {leaderboard.map((record) => (
                              <div key={record.id} className="p-3 flex items-center justify-between gap-4 hover:bg-slate-50/40 text-xs transition-colors">
                                <div>
                                  <span className="font-bold text-slate-800 block">{record.name}</span>
                                  <span className="text-[10px] text-slate-400 block font-semibold">{record.date} • {record.mode.toUpperCase()}</span>
                                </div>
                                <div className="text-right">
                                  <span className="font-extrabold text-sakura-500 block">{record.score}/{record.total} ({record.percentage}%)</span>
                                  <span className="text-[10px] text-slate-400 font-mono block">সময়: {formatTime(record.timeTaken)}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* VIEW B: Personal Analytics Dashboard */}
                {subTab === 'personal' && (
                  <div className="space-y-6">
                    
                    {/* Search Input */}
                    <div className="p-4 bg-white/40 border border-sakura-100 rounded-2xl space-y-2">
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                        🔎 নাম দিয়ে তোমার অগ্রগতি অনুসন্ধান করো (Search Your Progress)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          placeholder="যেমন: মাইশা রহমান"
                          value={searchProgressName}
                          onChange={(e) => setSearchProgressName(e.target.value)}
                          className="flex-1 p-2.5 rounded-xl border border-slate-200 bg-white/95 text-slate-700 text-sm font-semibold focus:border-sakura-300 focus:ring-2 focus:ring-sakura-200 outline-none"
                        />
                        {studentName && (
                          <button
                            onClick={() => setSearchProgressName(studentName)}
                            className="px-3.5 py-2 text-xs font-bold bg-sakura-50 text-sakura-600 border border-sakura-200 rounded-xl hover:bg-sakura-100 transition-all"
                          >
                            My Name
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Render stats if found */}
                    {(() => {
                      const records = leaderboard.filter(r => r.name.trim().toLowerCase() === searchProgressName.trim().toLowerCase() && r.name.trim() !== '');
                      
                      if (!searchProgressName.trim()) {
                        return (
                          <p className="text-xs text-slate-400 text-center py-8">
                            উপরের বক্সে তোমার নাম টাইপ করে ব্যক্তিগত ড্যাশবোর্ড চালু করো! 🐾
                          </p>
                        );
                      }

                      if (records.length === 0) {
                        return (
                          <div className="text-center py-8 bg-white/40 border border-slate-200 rounded-2xl space-y-2">
                            <span className="text-2xl">😿</span>
                            <p className="text-xs text-slate-500 font-semibold">
                              "{searchProgressName}" নামে কোনো পরীক্ষার রেকর্ড খুঁজে পাওয়া যায়নি!
                            </p>
                            <p className="text-[10px] text-slate-400">
                              অনুগ্রহ করে সঠিক নাম লিখুন বা পরীক্ষা সম্পন্ন করে রেকর্ড তৈরি করুন।
                            </p>
                          </div>
                        );
                      }

                      // Math calculations
                      const totalTests = records.length;
                      const scores = records.map(r => r.score);
                      const totals = records.map(r => r.total);
                      const percentages = records.map(r => r.percentage);
                      const times = records.map(r => r.timeTaken);

                      const highestPercent = Math.max(...percentages);
                      const highestRecord = records.find(r => r.percentage === highestPercent);
                      const avgPercent = Math.round(percentages.reduce((a, b) => a + b, 0) / totalTests);
                      const totalTime = times.reduce((a, b) => a + b, 0);

                      // Chapter Analytics
                      const chapterStats = {};
                      records.forEach(r => {
                        if (r.chapters && Array.isArray(r.chapters)) {
                          r.chapters.forEach(ch => {
                            if (!chapterStats[ch]) {
                              chapterStats[ch] = { sum: 0, count: 0 };
                            }
                            chapterStats[ch].sum += r.percentage;
                            chapterStats[ch].count += 1;
                          });
                        }
                      });

                      const chapterList = Object.entries(chapterStats).map(([ch, stat]) => ({
                        chapter: ch,
                        accuracy: Math.round(stat.sum / stat.count)
                      })).sort((a, b) => b.accuracy - a.accuracy);

                      const strongestChapter = chapterList.length > 0 ? chapterList[0] : null;
                      const weakestChapter = chapterList.length > 1 ? chapterList[chapterList.length - 1] : null;

                      return (
                        <div className="space-y-6 animate-scale-in">
                          
                          {/* Greetings & Quick Info */}
                          <div className="p-4 bg-gradient-to-r from-sakura-50 to-lavender-50 border border-sakura-150 rounded-2xl text-center">
                            <h4 className="font-display font-black text-slate-800 text-sm flex items-center justify-center gap-1">
                              🐈 স্বাগতম, {searchProgressName}!
                            </h4>
                            <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                              তোমার সম্পূর্ণ পরীক্ষার অগ্রগতি বিশ্লেষণ নিচে দেওয়া হলো।
                            </p>
                          </div>

                          {/* Stats Grid */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-white border border-slate-100 rounded-2xl text-center shadow-sm">
                              <span className="block text-xl font-black text-sakura-500 font-display">{totalTests}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase">মোট পরীক্ষা (Tests)</span>
                            </div>
                            <div className="p-3 bg-white border border-slate-100 rounded-2xl text-center shadow-sm">
                              <span className="block text-xl font-black text-lavender-500 font-display">{avgPercent}%</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase">গড় নম্বর (Avg Accuracy)</span>
                            </div>
                            <div className="p-3 bg-white border border-slate-100 rounded-2xl text-center shadow-sm">
                              <span className="block text-xl font-black text-emerald-500 font-display">{highestPercent}%</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase">সর্বোচ্চ স্কোর (Best)</span>
                            </div>
                            <div className="p-3 bg-white border border-slate-100 rounded-2xl text-center shadow-sm">
                              <span className="block text-xl font-black text-roseGold-600 font-display">{formatTime(Math.round(totalTime / totalTests))}</span>
                              <span className="text-[9px] text-slate-400 font-bold uppercase">গড় সময় (Avg Time)</span>
                            </div>
                          </div>

                          {/* Chapter Strengths & Weaknesses */}
                          {chapterList.length > 0 && (
                            <div className="p-4 bg-white/60 border border-sakura-100 rounded-2xl space-y-3 shadow-inner">
                              <span className="text-xs font-bold text-slate-600 block uppercase tracking-wider border-b border-slate-100 pb-1.5">
                                📊 অধ্যায়ভিত্তিক দক্ষতা বিশ্লেষণ (Chapter Analytics)
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                                {strongestChapter && (
                                  <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl space-y-1">
                                    <span className="font-extrabold text-emerald-700 block text-[10px] uppercase">
                                      ⭐ সবচেয়ে সবল অধ্যায় (Strongest)
                                    </span>
                                    <span className="font-bold text-slate-700 block truncate">{strongestChapter.chapter.split(':').slice(1).join(':').trim() || strongestChapter.chapter}</span>
                                    <span className="font-black text-emerald-600 text-sm">{strongestChapter.accuracy}% গড় নির্ভুলতা</span>
                                  </div>
                                )}
                                {weakestChapter && (
                                  <div className="p-3 bg-rose-50 border border-rose-150 rounded-xl space-y-1">
                                    <span className="font-extrabold text-rose-700 block text-[10px] uppercase">
                                      ⚠️ আরও অনুশীলনের প্রয়োজন (Weakest)
                                    </span>
                                    <span className="font-bold text-slate-700 block truncate">{weakestChapter.chapter.split(':').slice(1).join(':').trim() || weakestChapter.chapter}</span>
                                    <span className="font-black text-rose-600 text-sm">{weakestChapter.accuracy}% গড় নির্ভুলতা</span>
                                  </div>
                                )}
                              </div>

                              {/* Tested Chapters Accuracy list */}
                              <div className="pt-2 space-y-2">
                                <span className="text-[10px] font-bold text-slate-400 block uppercase">অংশগ্রহণকৃত অধ্যায়সমূহের রেকর্ড (Tested Chapters)</span>
                                <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                                  {chapterList.map(item => (
                                    <div key={item.chapter} className="flex items-center justify-between text-xs p-1.5 bg-white/70 rounded-lg border border-slate-100">
                                      <span className="font-semibold text-slate-650 truncate max-w-[200px] sm:max-w-xs">{item.chapter}</span>
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                        item.accuracy >= 80 ? 'bg-emerald-100 text-emerald-700' : item.accuracy >= 50 ? 'bg-lavender-100 text-lavender-700' : 'bg-rose-100 text-rose-700'
                                      }`}>
                                        {item.accuracy}% Accuracy
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Personal Attempt Timeline */}
                          <div className="space-y-3">
                            <span className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                              📈 তোমার প্রচেষ্টা ইতিহাস (Attempt History)
                            </span>
                            <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 bg-white/40">
                              <div className="divide-y divide-slate-100">
                                {records.map((r, idx) => (
                                  <div key={r.id} className="p-3 flex items-center justify-between text-xs hover:bg-sakura-50/10 transition-colors">
                                    <div>
                                      <span className="font-bold text-slate-800">প্রচেষ্টা #{totalTests - idx}</span>
                                      <span className="block text-[10px] text-slate-400 font-semibold mt-0.5">{r.date} • {r.mode.toUpperCase()}</span>
                                    </div>
                                    <div className="text-right">
                                      <span className="font-black text-sakura-500 block">{r.score} / {r.total} ({r.percentage}%)</span>
                                      <span className="block text-[10px] text-slate-400 font-mono">সময়: {formatTime(r.timeTaken)}</span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>

                        </div>
                      );
                    })()}
                  </div>
                )}

              </div>
            )}
            
            {/* Guidelines Footer */}
            <div className="text-center text-xs text-slate-400 space-y-1 py-4">
              <p>🌸 Built for premium responsive display on Mobile, Tablet & PC.</p>
              <p>Designed and crafted for Bangladesh HSC 2026 Batch Students.</p>
            </div>
          </div>
        )}

        {/* ==================================================
            2. ACTIVE EXAM VIEW (OR RESULT REVIEW)
            ================================================== */}
        {examActive && (
          <div className="space-y-6">
            
            {/* HEADER SUBBAR: Progress, Mode, Timer, Mobile Menu Toggle */}
            <div className="glass-panel p-4 rounded-2xl shadow-sakura-sm border border-sakura-100 flex flex-col md:flex-row gap-4 items-center justify-between">
              
              {/* Info and Progress Bar */}
              <div className="w-full md:w-auto flex-1 flex items-center gap-4">
                <div className="hidden sm:block">
                  <span className="px-3 py-1 bg-sakura-50 border border-sakura-200 text-sakura-600 text-xs font-bold rounded-lg uppercase tracking-wider">
                    {config.mode} Exam
                  </span>
                </div>
                <div className="flex-1 max-w-md">
                  <div className="flex justify-between items-center text-xs font-bold text-slate-600 mb-1">
                    <span>Progress</span>
                    <span>{answeredCount} / {totalQuestions} Answered</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                    <div 
                      className="h-full bg-gradient-to-r from-sakura-400 to-lavender-400 transition-all duration-300"
                      style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Timer Bar */}
              <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-3 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
                {config.hasTimer && !examSubmitted ? (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-extrabold ${
                    timerLeft < 120 
                      ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse' 
                      : 'bg-white border-sakura-100 text-slate-700'
                  }`}>
                    <Clock className="w-4 h-4 text-sakura-500" />
                    <span className="font-mono text-base tracking-wider">{formatTime(timerLeft)}</span>
                  </div>
                ) : config.hasTimer && examSubmitted ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>Time Taken: {formatTime(timeTaken)}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-600 text-xs font-bold">
                    <Clock className="w-4 h-4" />
                    <span>Untimed Practice</span>
                  </div>
                )}

                {/* Mobile Drawer Trigger */}
                <button
                  onClick={() => setShowMobileDrawer(true)}
                  className="md:hidden p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-sakura-600"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* TWO-COLUMN GRID: Left (Main Card), Right (Side Panel - Grid & Controls) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* LEFT 2/3 COLUMN: Main question viewport */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Result Card: Displayed ONLY after submission */}
                {examSubmitted && (
                  <div className="glass-panel-heavy p-6 rounded-3xl border border-sakura-200 shadow-sakura animate-scale-in text-center space-y-4">
                    <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-sakura-100 to-lavender-100 flex items-center justify-center text-3xl shadow-inner">
                      🏆
                    </div>
                    <div className="space-y-1">
                      <h3 className="font-display font-extrabold text-2xl text-slate-800">
                        Exam Results Summary
                      </h3>
                      <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
                        HSC 2026 Biology 2nd Paper
                      </p>
                    </div>

                    {/* Stats Ring/Badges */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto py-2">
                      <div className="p-3 bg-white/70 border border-slate-100 rounded-2xl shadow-sm">
                        <span className="block text-2xl font-black text-sakura-500 font-display">{score} / {totalQuestions}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Your Score</span>
                      </div>
                      <div className="p-3 bg-white/70 border border-slate-100 rounded-2xl shadow-sm">
                        <span className="block text-2xl font-black text-lavender-500 font-display">{percentage}%</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Percentage</span>
                      </div>
                      <div className="p-3 bg-white/70 border border-slate-100 rounded-2xl shadow-sm">
                        <span className="block text-2xl font-black text-emerald-500 font-display">{correctCount}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Correct</span>
                      </div>
                      <div className="p-3 bg-white/70 border border-slate-100 rounded-2xl shadow-sm">
                        <span className="block text-2xl font-black text-rose-400 font-display">{wrongCount}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Wrong</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2.5 justify-center py-2">
                      <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${getPerformanceFeedback().color}`}>
                        Performance: {getPerformanceFeedback().label}
                      </span>
                      <span className="px-4 py-1.5 rounded-full text-xs font-bold bg-slate-100 border border-slate-200 text-slate-600">
                        Unanswered: {unansweredCount}
                      </span>
                    </div>

                    {/* Review Filters Selection Bar */}
                    <div className="border-t border-sakura-100/50 pt-4 flex flex-wrap gap-2 justify-center">
                      {[
                        { key: 'all', label: '📖 All Questions' },
                        { key: 'wrong', label: '❌ Wrong Answers Only' },
                        { key: 'unanswered', label: '❓ Unanswered Only' },
                        { key: 'marked', label: '❤️ Marked for Review' }
                      ].map(btn => (
                        <button
                          key={btn.key}
                          onClick={() => setReviewFilter(btn.key)}
                          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                            reviewFilter === btn.key 
                              ? 'bg-sakura-500 border-sakura-500 text-white shadow-sm'
                              : 'bg-white hover:bg-sakura-50/20 border-slate-200 text-slate-600'
                          }`}
                        >
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Primary Question Card view */}
                {(!examSubmitted || 
                  (examSubmitted && questionsList.filter(q => {
                    if (reviewFilter === 'wrong') return answers[q.id] !== q.correctAnswer && answers[q.id] !== undefined;
                    if (reviewFilter === 'unanswered') return answers[q.id] === undefined;
                    if (reviewFilter === 'marked') return markedQuestions.includes(q.id);
                    return true;
                  }).length > 0)
                ) ? (
                  (() => {
                    // Filter the questions list if we are in review mode
                    let renderQ = currentQuestion;
                    let renderIdx = currentQuestionIndex;

                    if (examSubmitted) {
                      const filteredList = questionsList.filter((q, idx) => {
                        if (reviewFilter === 'wrong') return answers[q.id] !== q.correctAnswer && answers[q.id] !== undefined;
                        if (reviewFilter === 'unanswered') return answers[q.id] === undefined;
                        if (reviewFilter === 'marked') return markedQuestions.includes(q.id);
                        return true;
                      });

                      // Make sure the active index aligns
                      const found = filteredList[currentQuestionIndex] || filteredList[0];
                      if (found) {
                        renderQ = found;
                        renderIdx = questionsList.findIndex(x => x.id === found.id);
                      } else {
                        return (
                          <div className="p-8 text-center bg-white/70 border border-slate-200 rounded-3xl text-slate-400">
                            No questions match the current filter. Try selecting "All Questions".
                          </div>
                        );
                      }
                    }

                    const selectedOption = answers[renderQ.id];
                    const isMarked = markedQuestions.includes(renderQ.id);

                    return (
                      <div className="glass-panel-heavy p-6 sm:p-8 rounded-3xl border border-sakura-150 shadow-sakura animate-scale-in">
                        
                        {/* Tags / Details Bar */}
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-400 block tracking-wide uppercase">
                            Question {renderIdx + 1} of {totalQuestions}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                              renderQ.difficulty === 'Trap'
                                ? 'bg-rose-50 border-rose-200 text-rose-600 animate-pulse'
                                : renderQ.difficulty === 'Very Hard'
                                ? 'bg-lavender-50 border-lavender-200 text-lavender-600'
                                : 'bg-roseGold-50 border-roseGold-200 text-roseGold-600'
                            }`}>
                              🔥 {renderQ.difficulty}
                            </span>
                            <span className="px-2.5 py-0.5 bg-slate-100 border border-slate-200 text-slate-600 rounded-full text-[10px] font-bold">
                              {renderQ.topic}
                            </span>
                          </div>
                        </div>

                        {/* Chapter title context */}
                        <div className="mb-3 px-3 py-1 bg-sakura-50/20 border-l-2 border-sakura-400 text-slate-600 text-xs font-semibold">
                          {renderQ.chapter}
                        </div>

                        {/* Question Text */}
                        <h4 className="font-display font-extrabold text-slate-800 text-base sm:text-lg mb-6 leading-relaxed">
                          {renderQ.question}
                        </h4>

                        {/* Options list */}
                        <div className="space-y-3">
                          {Object.entries(renderQ.options).map(([key, value]) => {
                            const isSelected = selectedOption === key;
                            const isCorrect = renderQ.correctAnswer === key;
                            
                            // Visual states
                            let cardStyle = "border-slate-200 hover:border-sakura-200 hover:bg-sakura-50/10 bg-white/70";
                            let iconEl = null;

                            if (!examSubmitted) {
                              if (isSelected) {
                                cardStyle = "bg-gradient-to-br from-sakura-50/50 to-sakura-100/50 border-sakura-400 ring-2 ring-sakura-200/50 font-semibold shadow-sm";
                              }
                            } else {
                              // Submitted - Review mode options markup
                              if (isCorrect) {
                                cardStyle = "bg-emerald-50/60 border-emerald-400 text-emerald-800 font-bold ring-2 ring-emerald-100";
                                iconEl = <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
                              } else if (isSelected && !isCorrect) {
                                cardStyle = "bg-rose-50/60 border-rose-400 text-rose-800 font-semibold ring-2 ring-rose-100";
                                iconEl = <XCircle className="w-5 h-5 text-rose-500" />;
                              } else if (isSelected) {
                                cardStyle = "bg-slate-100 border-slate-400 text-slate-700";
                              } else {
                                cardStyle = "bg-white/40 border-slate-200 opacity-60";
                              }
                            }

                            return (
                              <button
                                key={key}
                                disabled={examSubmitted}
                                onClick={() => handleSelectOption(renderQ.id, key)}
                                className={`w-full p-4 rounded-2xl border text-left text-sm transition-all duration-200 flex items-center justify-between gap-4 outline-none ${cardStyle}`}
                              >
                                <div className="flex items-center gap-3">
                                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${
                                    isSelected 
                                      ? 'bg-sakura-500 border-sakura-500 text-white' 
                                      : 'bg-slate-50 border-slate-200 text-slate-500'
                                  }`}>
                                    {key}
                                  </span>
                                  <span className="flex-1 font-medium">{value}</span>
                                </div>
                                {iconEl}
                              </button>
                            );
                          })}
                        </div>

                        {/* Explanation Box (Post-submission only) */}
                        {examSubmitted && (
                          <div className="mt-6 p-5 bg-gradient-to-br from-lavender-50/50 to-sakura-50/30 border border-sakura-150 rounded-2xl shadow-inner space-y-2 animate-slide-up">
                            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 uppercase tracking-wide">
                              <Info className="w-4 h-4 text-sakura-500" />
                              Scientific Explanation
                            </span>
                            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                              {renderQ.explanation}
                            </p>
                          </div>
                        )}

                        {/* Card controls (Bottom Next/Prev/Mark actions) */}
                        <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between gap-2">
                          <button
                            onClick={() => {
                              if (renderIdx > 0) {
                                // Find previous item matching the filter if in review mode
                                if (examSubmitted) {
                                  const list = questionsList.filter(q => {
                                    if (reviewFilter === 'wrong') return answers[q.id] !== q.correctAnswer && answers[q.id] !== undefined;
                                    if (reviewFilter === 'unanswered') return answers[q.id] === undefined;
                                    if (reviewFilter === 'marked') return markedQuestions.includes(q.id);
                                    return true;
                                  });
                                  const currentPos = list.findIndex(x => x.id === renderQ.id);
                                  if (currentPos > 0) {
                                    const prevItem = list[currentPos - 1];
                                    setCurrentQuestionIndex(questionsList.findIndex(y => y.id === prevItem.id));
                                  }
                                } else {
                                  setCurrentQuestionIndex(prev => prev - 1);
                                }
                              }
                            }}
                            disabled={examSubmitted ? false : currentQuestionIndex === 0}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-sakura-500 hover:border-sakura-200 disabled:opacity-40 text-xs font-bold flex items-center gap-1 bg-white transition-all"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            Prev
                          </button>

                          {!examSubmitted && (
                            <button
                              onClick={() => handleToggleMarkForReview(renderQ.id)}
                              className={`px-4 py-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                                isMarked
                                  ? 'bg-roseGold-100 border-roseGold-300 text-roseGold-700 font-semibold'
                                  : 'bg-white border-slate-200 text-slate-500 hover:text-roseGold-500'
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isMarked ? 'fill-roseGold-500 text-roseGold-500' : ''}`} />
                              {isMarked ? 'Marked' : 'Mark for Review'}
                            </button>
                          )}

                          <button
                            onClick={() => {
                              if (renderIdx < totalQuestions - 1) {
                                if (examSubmitted) {
                                  const list = questionsList.filter(q => {
                                    if (reviewFilter === 'wrong') return answers[q.id] !== q.correctAnswer && answers[q.id] !== undefined;
                                    if (reviewFilter === 'unanswered') return answers[q.id] === undefined;
                                    if (reviewFilter === 'marked') return markedQuestions.includes(q.id);
                                    return true;
                                  });
                                  const currentPos = list.findIndex(x => x.id === renderQ.id);
                                  if (currentPos < list.length - 1) {
                                    const nextItem = list[currentPos + 1];
                                    setCurrentQuestionIndex(questionsList.findIndex(y => y.id === nextItem.id));
                                  }
                                } else {
                                  setCurrentQuestionIndex(prev => prev + 1);
                                }
                              }
                            }}
                            disabled={examSubmitted ? false : currentQuestionIndex === totalQuestions - 1}
                            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-sakura-500 hover:border-sakura-200 disabled:opacity-40 text-xs font-bold flex items-center gap-1 bg-white transition-all"
                          >
                            Next
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  <div className="p-8 text-center bg-white/70 border border-slate-200 rounded-3xl text-slate-400">
                    No questions match the current filter. Try selecting "All Questions".
                  </div>
                )}
              </div>

              {/* RIGHT 1/3 COLUMN: Status panel & Question grid (Hidden on mobile by default) */}
              <div className="hidden md:block lg:col-span-1 space-y-6">
                
                {/* Status Box */}
                <div className="glass-panel p-5 rounded-3xl border border-sakura-100 shadow-sakura-sm space-y-4">
                  <h4 className="font-display font-bold text-slate-800 text-sm flex items-center gap-1.5 border-b border-slate-100 pb-3">
                    <Award className="w-4 h-4 text-sakura-500" />
                    Examination Controls
                  </h4>

                  {/* Summary Counters */}
                  <div className="grid grid-cols-3 gap-2 py-1">
                    <div className="text-center p-2 bg-sakura-50/50 rounded-xl border border-sakura-100/50">
                      <span className="block text-sm font-black text-sakura-600">{answeredCount}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Answered</span>
                    </div>
                    <div className="text-center p-2 bg-slate-50 rounded-xl border border-slate-200/50">
                      <span className="block text-sm font-black text-slate-500">{unansweredCount}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Remaining</span>
                    </div>
                    <div className="text-center p-2 bg-roseGold-50 rounded-xl border border-roseGold-150">
                      <span className="block text-sm font-black text-roseGold-600">{markedCount}</span>
                      <span className="text-[9px] text-slate-400 font-bold uppercase">Marked</span>
                    </div>
                  </div>

                  {/* Buttons */}
                  {!examSubmitted ? (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="w-full py-3 bg-gradient-to-r from-sakura-500 to-sakura-600 hover:from-sakura-600 hover:to-sakura-700 text-white font-display font-extrabold text-xs sm:text-sm rounded-xl shadow-sakura hover:shadow transition-all duration-200 uppercase tracking-wider"
                    >
                      Submit Examination
                    </button>
                  ) : (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          if (window.confirm("Retake the exam with the same configuration?")) {
                            handleStartNewExam();
                          }
                        }}
                        className="w-full py-3 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white font-display font-extrabold text-xs rounded-xl shadow-sakura hover:shadow transition-all duration-200 flex items-center justify-center gap-1.5"
                      >
                        <ListRestart className="w-4 h-4" />
                        Retake Same Exam
                      </button>
                      
                      {wrongCount > 0 && (
                        <button
                          onClick={() => {
                            if (window.confirm("Start a practice test containing only the questions you answered incorrectly?")) {
                              // Filter out only the wrong questions
                              const wrongList = questionsList.filter(q => answers[q.id] !== q.correctAnswer && answers[q.id] !== undefined);
                              setQuestionsList(wrongList);
                              setAnswers({});
                              setMarkedQuestions([]);
                              setCurrentQuestionIndex(0);
                              setExamSubmitted(false);
                              const totalSec = config.hasTimer ? wrongList.length * 60 : null;
                              setTimerLeft(totalSec);
                              setStartTime(Date.now());
                              setTimeTaken(0);
                            }
                          }}
                          className="w-full py-3 bg-white border border-rose-300 text-rose-600 font-display font-extrabold text-xs rounded-xl hover:bg-rose-50 transition-all duration-200 flex items-center justify-center gap-1.5"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Retry Wrong Questions
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Navigation Grid (Desktop View) */}
                <div className="glass-panel p-5 rounded-3xl border border-sakura-100 shadow-sakura-sm space-y-3">
                  <span className="text-xs font-bold text-slate-600 block uppercase tracking-wider">
                    Question Navigator
                  </span>
                  
                  {/* Grid layout */}
                  <div className="grid grid-cols-5 gap-2 max-h-72 overflow-y-auto pr-1 py-1">
                    {questionsList.map((q, idx) => {
                      const isCurrent = idx === currentQuestionIndex;
                      const hasAns = answers[q.id] !== undefined;
                      const isMarked = markedQuestions.includes(q.id);

                      // Submitted markers
                      let btnBg = "bg-white text-slate-500 border-slate-200 hover:border-sakura-200";
                      
                      if (!examSubmitted) {
                        if (isCurrent) {
                          btnBg = "bg-sakura-500 border-sakura-500 text-white font-bold ring-2 ring-sakura-200 shadow-sm";
                        } else if (isMarked) {
                          btnBg = "bg-roseGold-100 border-roseGold-300 text-roseGold-700 font-semibold";
                        } else if (hasAns) {
                          btnBg = "bg-sakura-100 border-sakura-200 text-sakura-700 font-semibold";
                        }
                      } else {
                        // Post-submission colors
                        const isCorrect = answers[q.id] === q.correctAnswer;
                        if (isCurrent) {
                          btnBg = `ring-2 ring-indigo-300 font-bold border-indigo-500 ${
                            hasAns ? (isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'bg-slate-300 text-slate-700'
                          }`;
                        } else if (hasAns) {
                          btnBg = isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-rose-500 border-rose-600 text-white';
                        } else {
                          btnBg = 'bg-slate-200 border-slate-350 text-slate-500';
                        }
                      }

                      return (
                        <button
                          key={q.id}
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`h-9 text-xs font-bold rounded-lg border flex items-center justify-center transition-all ${btnBg}`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="border-t border-slate-100 pt-3 grid grid-cols-2 gap-y-2 gap-x-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-wide">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-sakura-100 border border-sakura-200"></span>
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-white border border-slate-200"></span>
                      <span>Unanswered</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-roseGold-100 border border-roseGold-200"></span>
                      <span>Marked</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded bg-sakura-500"></span>
                      <span>Current</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* ==================================================
          3. SUBMIT CONFIRMATION MODAL
          ================================================== */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fade-in">
          <div className="glass-panel-heavy p-6 sm:p-8 rounded-3xl max-w-sm w-full border border-sakura-200 shadow-sakura text-center space-y-5 animate-scale-in">
            <span className="text-4xl">⏱️</span>
            <div className="space-y-1.5">
              <h3 className="font-display font-extrabold text-xl text-slate-800">
                Submit Examination?
              </h3>
              <p className="text-xs text-slate-500 leading-normal">
                Are you sure you want to finish the exam? You will not be able to change your answers.
              </p>
            </div>

            {/* Quick summary check */}
            <div className="bg-sakura-50/30 rounded-2xl border border-sakura-100 p-3.5 grid grid-cols-3 gap-2 text-center">
              <div>
                <span className="block text-sm font-bold text-sakura-600">{answeredCount}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Answered</span>
              </div>
              <div>
                <span className="block text-sm font-bold text-slate-500">{unansweredCount}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Unanswered</span>
              </div>
              <div>
                <span className="block text-sm font-bold text-roseGold-600">{markedCount}</span>
                <span className="text-[9px] text-slate-400 font-bold uppercase">Marked</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={() => submitExam()}
                className="w-full py-3 bg-gradient-to-r from-sakura-500 to-sakura-600 hover:from-sakura-600 hover:to-sakura-700 text-white font-display font-extrabold text-xs rounded-xl shadow-sakura transition-all uppercase tracking-wider"
              >
                Submit Exam
              </button>
              <button
                onClick={() => setShowSubmitModal(false)}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 font-display font-bold text-xs rounded-xl transition-all"
              >
                Continue Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================
          4. MOBILE DRAWER / SIDE-SHEET (QUESTION NAVIGATOR)
          ================================================== */}
      {showMobileDrawer && (
        <div className="fixed inset-0 z-50 flex justify-end md:hidden bg-slate-900/30 backdrop-blur-sm animate-fade-in">
          <div className="w-80 max-w-xs h-full bg-white/95 backdrop-blur-lg border-l border-sakura-150 p-6 flex flex-col justify-between shadow-xl animate-slide-up">
            
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-sm font-black text-slate-800 font-display uppercase tracking-wider flex items-center gap-1.5">
                  <Bookmark className="w-4 h-4 text-sakura-500" />
                  Navigator
                </span>
                <button
                  onClick={() => setShowMobileDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Summary counters in Drawer */}
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                <div className="p-2 bg-sakura-50 border border-sakura-100/50 rounded-xl">
                  <span className="block text-slate-700 text-xs">{answeredCount}</span>
                  <span className="text-[8px] text-slate-400 uppercase">Ans</span>
                </div>
                <div className="p-2 bg-slate-50 border border-slate-200/50 rounded-xl">
                  <span className="block text-slate-700 text-xs">{unansweredCount}</span>
                  <span className="text-[8px] text-slate-400 uppercase">Unans</span>
                </div>
                <div className="p-2 bg-roseGold-50 border border-roseGold-150 rounded-xl">
                  <span className="block text-slate-700 text-xs">{markedCount}</span>
                  <span className="text-[8px] text-slate-400 uppercase">Mark</span>
                </div>
              </div>

              {/* Grid scroll area */}
              <div className="grid grid-cols-4 gap-2 overflow-y-auto max-h-[50vh] pr-1 py-1">
                {questionsList.map((q, idx) => {
                  const isCurrent = idx === currentQuestionIndex;
                  const hasAns = answers[q.id] !== undefined;
                  const isMarked = markedQuestions.includes(q.id);

                  let btnBg = "bg-white text-slate-500 border-slate-200";
                  if (!examSubmitted) {
                    if (isCurrent) btnBg = "bg-sakura-500 border-sakura-500 text-white font-bold ring-2 ring-sakura-200 shadow-sm";
                    else if (isMarked) btnBg = "bg-roseGold-100 border-roseGold-300 text-roseGold-700";
                    else if (hasAns) btnBg = "bg-sakura-100 border-sakura-200 text-sakura-700";
                  } else {
                    const isCorrect = answers[q.id] === q.correctAnswer;
                    if (isCurrent) btnBg = `ring-2 ring-indigo-300 font-bold border-indigo-500 ${hasAns ? (isCorrect ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white') : 'bg-slate-350'}`;
                    else if (hasAns) btnBg = isCorrect ? 'bg-emerald-500 border-emerald-600 text-white' : 'bg-rose-500 border-rose-600 text-white';
                    else btnBg = 'bg-slate-200 text-slate-500 border-slate-300';
                  }

                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setCurrentQuestionIndex(idx);
                        setShowMobileDrawer(false);
                      }}
                      className={`h-9 text-xs font-bold rounded-lg border flex items-center justify-center transition-all ${btnBg}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bottom Actions inside Drawer */}
            <div className="border-t border-slate-100 pt-4 space-y-2">
              {!examSubmitted ? (
                <button
                  onClick={() => {
                    setShowMobileDrawer(false);
                    setShowSubmitModal(true);
                  }}
                  className="w-full py-3 bg-gradient-to-r from-sakura-500 to-sakura-600 text-white font-display font-extrabold text-xs rounded-xl shadow-sakura uppercase tracking-wider"
                >
                  Submit Exam
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (window.confirm("Retake the exam with the same configuration?")) {
                        setShowMobileDrawer(false);
                        handleStartNewExam();
                      }
                    }}
                    className="w-full py-2.5 bg-sakura-500 text-white font-display font-extrabold text-xs rounded-xl shadow-sakura flex items-center justify-center gap-1.5"
                  >
                    <ListRestart className="w-3.5 h-3.5" />
                    Retake Same
                  </button>
                  {wrongCount > 0 && (
                    <button
                      onClick={() => {
                        if (window.confirm("Start a practice test containing only the questions you answered incorrectly?")) {
                          setShowMobileDrawer(false);
                          const wrongList = questionsList.filter(q => answers[q.id] !== q.correctAnswer && answers[q.id] !== undefined);
                          setQuestionsList(wrongList);
                          setAnswers({});
                          setMarkedQuestions([]);
                          setCurrentQuestionIndex(0);
                          setExamSubmitted(false);
                          const totalSec = config.hasTimer ? wrongList.length * 60 : null;
                          setTimerLeft(totalSec);
                          setStartTime(Date.now());
                          setTimeTaken(0);
                        }
                      }}
                      className="w-full py-2.5 bg-white border border-rose-300 text-rose-600 font-display font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Retry Wrongs
                    </button>
                  )}
                </div>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- FOOTER BANNER --- */}
      <footer className="py-6 px-4 text-center text-[10px] sm:text-xs text-slate-400 font-medium bg-white/40 border-t border-sakura-100/50 mt-12 space-y-1 z-10 relative">
        <p>🐱 Website created by <span className="font-bold text-sakura-500">Mishkat</span> with love 🌸</p>
        <p>🌸 HSC 2026 Batch Bangladesh — Zoology Board Exam simulator.</p>
        <p>All rights reserved. Not affiliated with any official education board.</p>
      </footer>

    </div>
  );
}
