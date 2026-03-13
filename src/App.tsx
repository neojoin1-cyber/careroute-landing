import React, { useState, useEffect } from 'react';
import {
  CheckCircle, ShieldCheck,
  MapPin, Coffee, ChevronRight, AlertTriangle, 
  Activity, ArrowRight, ArrowLeft, HeartPulse,
} from 'lucide-react';

// ----------------------------------------------------------------------
// [중요] Firebase 데이터베이스 설정 (기존과 동일)
// ----------------------------------------------------------------------
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBQN_UnvehAafGv4I0Zk1f5wLTUjxbXU78",
  authDomain: "careroute-landing.firebaseapp.com",
  projectId: "careroute-landing",
  storageBucket: "careroute-landing.firebasestorage.app",
  messagingSenderId: "870183120356",
  appId: "1:870183120356:web:a70af85d7ad77f6d516bf1",
  measurementId: "G-SRJC7313Q7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// ----------------------------------------------------------------------

// 질문 데이터 구조
type AnswerValue = 2 | 1 | 0 | null; // 예(2), 애매함(1), 아니오(0)
type Category = '필수' | '중요' | '보완';

interface Question {
  id: number;
  category: Category;
  weight: number;
  text: string;
  icon: React.ReactNode;
}

const QUESTIONS: Question[] = [
  // 필수 점검 (가중치 2)
  { id: 1, category: '필수', weight: 2, text: "오늘 일정은 '많이 걷지 않는' 일정입니까?", icon: <MapPin className="w-6 h-6" /> },
  { id: 2, category: '필수', weight: 2, text: "계단이나 오르막이 많은 장소를 피하셨습니까?", icon: <Activity className="w-6 h-6" /> },
  { id: 3, category: '필수', weight: 2, text: "최소 90분에 한 번씩은 편히 앉아 쉴 곳이 있습니까?", icon: <Coffee className="w-6 h-6" /> },
  { id: 4, category: '필수', weight: 2, text: "방문할 주요 장소의 화장실 접근이 쉬운 편입니까?", icon: <HeartPulse className="w-6 h-6" /> },
  
  // 중요 점검 (가중치 1.5)
  { id: 5, category: '중요', weight: 1.5, text: "어르신이 드시기 편한 식사 후보를 2곳 이상 정하셨습니까?", icon: <Coffee className="w-6 h-6" /> },
  { id: 6, category: '중요', weight: 1.5, text: "부모님이 힘들어하실 때 바로 바꿀 대안(플랜B)이 있습니까?", icon: <AlertTriangle className="w-6 h-6" /> },
  { id: 7, category: '중요', weight: 1.5, text: "걷기 힘들 때 택시 등 이동 수단을 쉽게 탈 수 있습니까?", icon: <MapPin className="w-6 h-6" /> },
  { id: 8, category: '중요', weight: 1.5, text: "비나 추위/더위를 피할 수 있는 실내 장소가 포함되어 있습니까?", icon: <ShieldCheck className="w-6 h-6" /> },
  
  // 보완 점검 (가중치 1)
  { id: 9, category: '보완', weight: 1, text: "체력이 가장 좋은 오전에 핵심 일정을 배치하셨습니까?", icon: <CheckCircle className="w-6 h-6" /> },
  { id: 10, category: '보완', weight: 1, text: "숙소나 집으로 돌아오는 귀가 길이 복잡하지 않고 편안합니까?", icon: <MapPin className="w-6 h-6" /> },
  { id: 11, category: '보완', weight: 1, text: "목적지 안에서 서서 기다리지 않고 앉아 쉴 지점을 파악하셨습니까?", icon: <Coffee className="w-6 h-6" /> },
];

export default function App() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // 스크롤 탑 이동 효과
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [step, currentQIndex]);

  // 이메일 폼 상태
  const [email, setEmail] = useState('');
  const [formStatus, setFormStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // 점수 계산
  const calculateScore = () => {
    let rawScore = 0;
    let maxRawScore = 0;

    QUESTIONS.forEach(q => {
      const val = answers[q.id];
      const maxQScore = 2 * q.weight;
      maxRawScore += maxQScore;
      
      if (val !== null && val !== undefined) {
        rawScore += val * q.weight;
      }
    });

    return Math.round((rawScore / maxRawScore) * 100);
  };

  // 등급 및 피드백 До출
  const getResultFeedback = (score: number) => {
    if (score >= 85) return {
      grade: "안심 단계",
      subText: "무리 적음",
      color: "text-blue-700",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      summary: "부모님의 체력을 충분히 배려한 계획입니다. 현재 준비하신 일정이라면 비교적 안전하고 즐거운 외출이 될 가능성이 높습니다."
    };
    if (score >= 60) return {
      grade: "주의 단계",
      subText: "일부 조정 필요",
      color: "text-green-700",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      summary: "기본적인 준비는 되었으나, 예상치 못한 변수가 생겼을 때 부모님이 다소 체력적 부담을 느끼실 수 있는 구간이 있습니다."
    };
    if (score >= 40) return {
      grade: "경고 단계",
      subText: "부담 가능성 큼",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      summary: "현재 일정대로 진행할 경우, 부모님이 체력적으로 크게 무리를 느끼실 가능성이 있습니다. 동선과 휴식 시간을 재검토해 보세요."
    };
    return {
      grade: "위험 단계",
      subText: "일정 전면 재설계 권장",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      summary: "일반 성인 기준에 맞춰진 일정일 수 있습니다. 부모님과 함께하시기엔 신체적 무리가 매우 커 전면적인 수정이 권장됩니다."
    };
  };

  const getWeakPoints = () => {
    const weakPoints = QUESTIONS
      .filter(q => answers[q.id] === 0 || answers[q.id] === 1)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3);
    
    return weakPoints.map(q => {
      if (q.id === 1 || q.id === 2) return "도보량 축소 및 계단/경사 구간 우회 필요";
      if (q.id === 3 || q.id === 11) return "중간 휴식처(착석 가능한 공간) 추가 확보";
      if (q.id === 4) return "동선 내 화장실 접근성(위치, 단차 여부) 사전 점검";
      if (q.id === 5) return "어르신 맞춤 식당(소음도, 메뉴 편의성) 대안 준비";
      if (q.id === 6 || q.id === 8) return "돌발 상황(날씨, 컨디션 저하) 대비 실내 플랜B 마련";
      return "일정 순서 조정 및 이동 수단 탑승 편의성 재고";
    }).filter((v, i, a) => a.indexOf(v) === i);
  };

  const handleAnswer = (val: AnswerValue) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentQIndex].id]: val }));
    
    setTimeout(() => {
      if (currentQIndex < QUESTIONS.length - 1) {
        setCurrentQIndex(prev => prev + 1);
        setIsTransitioning(false);
      } else {
        setStep('result');
        setIsTransitioning(false);
      }
    }, 250);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormStatus('error');
      setErrorMessage('올바른 이메일 주소를 입력해 주세요.');
      return;
    }

    setFormStatus('loading');
    try {
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email,
        source: "self_check_result_v2",
        score: calculateScore(),
        createdAt: serverTimestamp()
      });
      setFormStatus('success');
      setEmail('');
    } catch {
      setFormStatus('error');
      setErrorMessage('오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    }
  };

  // 1. 인트로 화면
  if (step === 'intro') {
    return (
      <div className="font-sans text-gray-900 bg-gray-50 flex flex-col items-center justify-center p-4 sm:p-5 break-keep" style={{ minHeight: '100svh' }}>
        <div className="max-w-md w-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full max-h-[850px]">
          <div className="bg-slate-800 p-8 sm:p-10 text-center text-white flex-shrink-0">
            <h1 className="text-2xl sm:text-3xl font-bold mb-4 leading-tight tracking-tight">
              부모님 외출 전<br/><span className="text-[#FF9D00]">1분 점검</span> 도구
            </h1>
            <p className="text-sm sm:text-base text-slate-300 font-medium">
              많이 보는 것보다 덜 힘든 일정이 중요합니다.
            </p>
          </div>
          
          <div className="p-8 sm:p-10 flex-grow flex flex-col justify-between">
            <div className="text-center mb-8">
              <p className="text-gray-700 text-[17px] leading-relaxed mb-6 font-medium">
                무료 AI나 검색으로 짠 일정표 초안,<br/>
                <strong className="text-slate-900 font-bold block mt-2 text-lg">정말 부모님 무릎과 체력에 무리가 없을까요?</strong>
              </p>
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-8 inline-block text-left relative overflow-hidden w-full">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>
                <p className="text-sm text-slate-600 leading-relaxed font-medium">
                  실제 외출 시 놓치기 쉬운 계단, 화장실 빈도, 휴식처 유무 등 <strong className="text-slate-800">11가지 핵심 위험요소</strong>를 빠르게 점검해 드립니다.
                </p>
              </div>
            </div>
            
            <div className="mt-auto">
              <button
                onClick={() => setStep('quiz')}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold text-lg sm:text-xl py-5 rounded-2xl flex items-center justify-center transition-all shadow-md active:scale-95 touch-manipulation"
              >
                자가진단 시작하기 <ArrowRight className="ml-2 w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <p className="text-xs text-center text-gray-400 mt-4 font-medium">개인정보 입력이나 로그인 없이 즉시 시작합니다.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. 퀴즈 진행 화면
  if (step === 'quiz') {
    const q = QUESTIONS[currentQIndex];
    const progress = ((currentQIndex + 1) / QUESTIONS.length) * 100;

    return (
      <div className="font-sans text-gray-900 bg-gray-50 flex flex-col p-4 sm:p-5 break-keep" style={{ minHeight: '100svh' }}>
        <div className="max-w-md w-full mx-auto flex-1 flex flex-col max-h-[900px]">
          
          {/* 진행 상태 바 */}
          <div className="mb-6 pt-2">
            <div className="flex justify-between items-center text-xs font-bold mb-2.5 px-1">
              <span className="text-slate-500">항목 {currentQIndex + 1} / {QUESTIONS.length}</span>
              {/* 필수 항목 강조 배지 */}
              {q.category === '필수' ? (
                <span className="bg-red-50 text-red-600 px-2.5 py-1 rounded-full border border-red-100 flex items-center">
                  <AlertTriangle className="w-3 h-3 mr-1" /> 필수 점검 중요도 높음
                </span>
              ) : (
                <span className="bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border border-slate-200">
                  {q.category} 점검
                </span>
              )}
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ease-out ${q.category === '필수' ? 'bg-red-500' : 'bg-slate-800'}`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 질문 카드 */}
          <div className={`bg-white rounded-3xl shadow-sm border p-6 sm:p-8 mb-6 flex-1 flex flex-col justify-center min-h-[220px] transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'} ${q.category === '필수' ? 'border-red-100 bg-red-50/10' : 'border-gray-200'}`}>
            <div className={`flex items-center justify-center w-14 h-14 rounded-full mb-6 mx-auto shadow-sm ${q.category === '필수' ? 'bg-red-100 text-red-600' : 'bg-slate-100 text-slate-700'}`}>
              {q.icon}
            </div>
            <h2 className="text-[22px] sm:text-[26px] font-bold text-center text-slate-900 leading-[1.4] tracking-tight">
              {q.text}
            </h2>
          </div>

          {/* 선택 버튼들 - 터치 영역 대폭 확대 */}
          <div className={`flex flex-col gap-3 sm:gap-4 pb-4 transition-opacity duration-200 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
            <button
              onClick={() => handleAnswer(2)}
              className="w-full bg-white border-2 border-slate-200 hover:border-blue-500 active:bg-blue-50 text-slate-800 font-bold text-lg sm:text-xl py-5 sm:py-6 px-6 sm:px-8 rounded-2xl transition-all text-left flex justify-between items-center touch-manipulation shadow-sm"
            >
              예, 그렇습니다 <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            </button>
            <button
              onClick={() => handleAnswer(1)}
              className="w-full bg-white border-2 border-slate-200 hover:border-slate-500 active:bg-slate-50 text-slate-700 font-bold text-lg sm:text-xl py-5 sm:py-6 px-6 sm:px-8 rounded-2xl transition-all text-left flex justify-between items-center touch-manipulation shadow-sm"
            >
              애매합니다 / 모릅니다 <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            </button>
            <button
              onClick={() => handleAnswer(0)}
              className="w-full bg-white border-2 border-slate-200 hover:border-orange-500 active:bg-orange-50 text-slate-700 font-bold text-lg sm:text-xl py-5 sm:py-6 px-6 sm:px-8 rounded-2xl transition-all text-left flex justify-between items-center touch-manipulation shadow-sm"
            >
              아니오 <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6 text-slate-400" />
            </button>
          </div>

          {/* 뒤로 가기 */}
          <div className="h-12 flex items-center justify-center">
            {currentQIndex > 0 && (
              <button 
                onClick={() => setCurrentQIndex(prev => prev - 1)}
                className="text-slate-400 flex items-center justify-center py-3 px-4 text-sm font-bold hover:text-slate-600 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> 이전 질문
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 3. 결과 화면
  const score = calculateScore();
  const feedback = getResultFeedback(score);
  const weakPoints = getWeakPoints();

  return (
    <div className="font-sans text-gray-900 bg-gray-50 flex flex-col break-keep" style={{ minHeight: '100svh' }}>
      
      <div className="p-4 sm:p-6 pb-20 max-w-lg w-full mx-auto pt-6">
        
        {/* 결과 타이틀 */}
        <h2 className="text-xl sm:text-2xl font-bold text-center text-slate-900 mb-6">
          현재 예상되는 일정 부담도
        </h2>

        {/* 점수 및 등급 카드 */}
        <div className={`rounded-3xl border-2 p-6 sm:p-8 text-center shadow-sm mb-6 bg-white relative overflow-hidden ${feedback.borderColor}`}>
          <div className={`absolute top-0 left-0 w-full h-1.5 ${feedback.bgColor.replace('bg-', 'bg-').replace('50', '400')}`}></div>
          <div className="flex justify-center flex-col items-center mb-5 mt-2">
            <span className={`text-[64px] font-extrabold leading-none tracking-tighter ${feedback.color}`}>{score}</span>
            <span className="text-lg text-slate-400 font-bold mt-1">/ 100점</span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm sm:text-base font-bold ${feedback.bgColor} ${feedback.color} mb-6 border ${feedback.borderColor}`}>
            {score < 85 && <AlertTriangle className="w-4 h-4" />}
            {score >= 85 && <CheckCircle className="w-4 h-4" />}
            {feedback.grade} ({feedback.subText})
          </div>
          <p className="text-slate-700 text-[15px] sm:text-base leading-relaxed bg-slate-50 p-4 sm:p-5 rounded-2xl border border-slate-100 font-medium text-left">
            {feedback.summary}
          </p>
        </div>

        {/* 부족한 부분 요약 및 권장 행동 */}
        {score < 100 && (
          <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 shadow-sm mb-8">
            <h3 className="font-bold text-lg sm:text-xl text-slate-900 mb-4 flex items-center border-b border-gray-100 pb-4">
              <CheckCircle className="w-5 h-5 text-slate-400 mr-2 shrink-0" />
              보완이 필요한 항목 요약
            </h3>
            <ul className="space-y-4 mb-8">
              {weakPoints.length > 0 ? weakPoints.map((point, idx) => (
                <li key={idx} className="flex items-start text-slate-700 text-[15px] sm:text-base leading-snug font-medium">
                  <div className="w-1.5 h-1.5 bg-slate-400 rounded-full mt-2 mr-3 shrink-0" />
                  {point}
                </li>
              )) : (
                <li className="text-slate-500 text-[15px]">기본적인 항목은 모두 체크하셨습니다. 세부 일정만 한 번 더 확인해 주세요.</li>
              )}
            </ul>

            <h3 className="font-bold text-lg sm:text-xl text-slate-900 mb-4 block border-b border-gray-100 pb-4">권장 행동 가이드</h3>
            <div className="bg-blue-50/50 rounded-2xl p-5 text-[15px] sm:text-base text-slate-800 space-y-3.5 border border-blue-100">
              <p className="flex items-start font-medium leading-snug"><CheckCircle className="w-5 h-5 text-blue-600 mr-2.5 mt-0.5 shrink-0" /> 식당이나 특정 장소 진입 시 계단 등 단차 여부 확인</p>
              <p className="flex items-start font-medium leading-snug"><CheckCircle className="w-5 h-5 text-blue-600 mr-2.5 mt-0.5 shrink-0" /> 최소 90분 간격으로 착석 가능한 동선(휴식처) 추가</p>
              <p className="flex items-start font-medium leading-snug"><CheckCircle className="w-5 h-5 text-blue-600 mr-2.5 mt-0.5 shrink-0" /> "부모님의 체력은 내가 생각하는 것보다 약하다"고 보수적으로 가정</p>
            </div>
          </div>
        )}

        {/* 이메일 확보 CTA (무료 자료 배포) */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-slate-800 rounded-bl-[100px] -z-0"></div>
          
          <div className="relative z-10">
            <h2 className="text-xl sm:text-2xl font-bold mb-3 leading-snug">
              안전한 일정을 위한<br/>
              <span className="text-[#FF9D00]">1장 체크 요약표</span>와 <span className="text-[#FF9D00]">상세 PDF</span>
            </h2>
            <p className="text-[14px] sm:text-[15px] text-slate-300 mb-6 leading-relaxed font-medium">
              점검하신 내용을 바탕으로, 실제 출발 전 바로 사용할 수 있는 실전 가이드를 메일로 무료 제공해 드립니다.
            </p>

            <form onSubmit={handleEmailSubmit}>
              <div className="bg-white/10 p-1.5 rounded-2xl mb-4 focus-within:ring-2 focus-within:ring-[#FF9D00] focus-within:bg-white/20 transition-all">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (formStatus === 'error') setFormStatus('idle');
                  }}
                  placeholder="이메일 주소를 입력해 주세요"
                  className={`w-full px-4 py-3.5 bg-transparent text-white placeholder-slate-400 border-none outline-none font-medium text-base`}
                  disabled={formStatus === 'loading' || formStatus === 'success'}
                />
              </div>
              <button
                type="submit"
                disabled={formStatus === 'loading' || formStatus === 'success'}
                className="w-full bg-[#FF9D00] hover:bg-[#E68A00] hover:scale-[0.99] active:scale-[0.97] text-slate-900 font-extrabold py-4 rounded-2xl transition-all disabled:bg-slate-600 disabled:text-slate-400 text-lg shadow-sm"
              >
                {formStatus === 'loading' ? '처리 중...' : '1장 요약표 + 상세 PDF 받기'}
              </button>
              
              {formStatus === 'error' && <p className="text-red-400 text-sm font-bold mt-3 text-center bg-red-900/40 py-2 rounded-lg">{errorMessage}</p>}
              {formStatus === 'success' && (
                <div className="mt-4 bg-green-500/20 border border-green-500/50 text-green-100 p-4 rounded-2xl text-[15px] text-center backdrop-blur-sm">
                  <CheckCircle className="w-6 h-6 mx-auto mb-2 text-green-400" />
                  <span className="font-bold block mb-1">성공적으로 발송 준비가 되었습니다.</span>
                  <a href="/guide.pdf" download="CareRoute_외출여행_체크리스트.pdf" className="inline-block mt-2 underline font-bold text-[#FF9D00] hover:text-[#FFAE33]">이곳을 눌러 즉시 다운로드하기</a>
                </div>
              )}
              <p className="text-[12px] text-slate-400 mt-4 text-center">절대 스팸 메일을 보내지 않으며 언제든 수신 거부가 가능합니다.</p>
            </form>
          </div>
        </div>

        {/* 유료 검수 서비스 예고 (차분하고 신뢰감 있게) */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 sm:p-8 text-center shadow-sm">
          <div className="inline-block bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1.5 rounded-full mb-5 tracking-wide">
            다음 단계 안내
          </div>
          <h3 className="font-bold text-lg sm:text-xl text-slate-900 mb-4 leading-snug">
            부모님과의 귀한 시간,<br/>전문가의 시선으로 한 번 더 점검해 보세요.
          </h3>
          <p className="text-[15px] text-slate-600 leading-relaxed mb-6 font-medium break-keep">
            무료 자료로 기본 원칙을 세우신 뒤, 내가 짠 특정 일정이 과연 안전할지 전문가의 면밀한 진단을 받을 수 있는 <strong className="text-slate-800">1:1 맞춤 검수 서비스</strong>를 곧 선보일 예정입니다.
          </p>
          <div className="text-left bg-slate-50 p-5 rounded-2xl text-[14px] sm:text-[15px] text-slate-700 space-y-3 font-medium border border-slate-100">
            <p className="flex items-start"><span className="text-slate-400 mr-2 mt-0.5">•</span> 식당 단차, 주변 화장실 등 환경 요인 파악</p>
            <p className="flex items-start"><span className="text-slate-400 mr-2 mt-0.5">•</span> 부모님 체력을 고려한 시점별 무리 구간 진단</p>
            <p className="flex items-start"><span className="text-slate-400 mr-2 mt-0.5">•</span> 컨디션 저하 시 즉각 교체 가능한 실내 대안 동선 제안</p>
          </div>
        </div>

        {/* 다시하기 버튼 */}
        <button 
          onClick={() => {
            setStep('intro');
            setAnswers({});
            setCurrentQIndex(0);
          }}
          className="mt-8 text-[15px] font-bold text-slate-400 hover:text-slate-600 underline text-center w-full focus:outline-none transition-colors"
        >
          진단표 처음부터 다시 하기
        </button>
      </div>

      {/* 푸터 */}
      <footer className="bg-white text-slate-400 py-10 px-6 text-[13px] text-center border-t border-gray-200 mt-auto">
        <div className="max-w-lg mx-auto">
          <p className="mb-2 font-black text-slate-300 text-lg tracking-tight">CareRoute</p>
          <p className="mb-3 font-medium">부모님이 덜 힘든 외출과 여행 동선을 계획하도록 돕습니다.</p>
          <p className="mb-6 font-medium">이메일/검수 문의: <a href="mailto:kbe@daum.net" className="text-slate-500 hover:text-slate-700 underline">kbe@daum.net</a></p>
          <p className="text-slate-300">© {new Date().getFullYear()} CareRoute. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
