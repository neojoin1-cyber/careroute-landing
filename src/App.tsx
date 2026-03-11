import React, { useState } from 'react';
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
  { id: 1, category: '필수', weight: 2, text: "오늘 일정은 '많이 걷지 않는' 일정입니까?", icon: <MapPin className="w-5 h-5" /> },
  { id: 2, category: '필수', weight: 2, text: "계단이나 오르막이 많은 장소를 피하셨습니까?", icon: <Activity className="w-5 h-5" /> },
  { id: 3, category: '필수', weight: 2, text: "최소 90분에 한 번씩은 편히 앉아 쉴 곳이 있습니까?", icon: <Coffee className="w-5 h-5" /> },
  { id: 4, category: '필수', weight: 2, text: "방문할 주요 장소들의 화장실 접근이 쉬운 편입니까?", icon: <HeartPulse className="w-5 h-5" /> },
  
  // 중요 점검 (가중치 1.5)
  { id: 5, category: '중요', weight: 1.5, text: "어르신이 드시기 편한 식사 후보를 2곳 이상 정하셨습니까?", icon: <Coffee className="w-5 h-5" /> },
  { id: 6, category: '중요', weight: 1.5, text: "부모님이 갑자기 힘들어하실 때 바로 바꿀 수 있는 짧은 대안(플랜B)이 있습니까?", icon: <AlertTriangle className="w-5 h-5" /> },
  { id: 7, category: '중요', weight: 1.5, text: "걷기 힘들 때 택시 등 이동 수단을 쉽게 탈 수 있는 환경입니까?", icon: <MapPin className="w-5 h-5" /> },
  { id: 8, category: '중요', weight: 1.5, text: "갑작스러운 비나 추위/더위에 피할 수 있는 실내 장소가 포함되어 있습니까?", icon: <ShieldCheck className="w-5 h-5" /> },
  
  // 보완 점검 (가중치 1)
  { id: 9, category: '보완', weight: 1, text: "체력이 가장 좋은 오전에 핵심 일정을 배치하셨습니까?", icon: <CheckCircle className="w-5 h-5" /> },
  { id: 10, category: '보완', weight: 1, text: "숙소나 집으로 돌아오는 숙박/귀가 길이 복잡하지 않고 편안합니까?", icon: <MapPin className="w-5 h-5" /> },
  { id: 11, category: '보완', weight: 1, text: "관광지나 목적지 안에서 서서 기다리지 않고 앉아 쉴 지점을 미리 파악하셨습니까?", icon: <Coffee className="w-5 h-5" /> },
];

export default function App() {
  const [step, setStep] = useState<'intro' | 'quiz' | 'result'>('intro');
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, AnswerValue>>({});
  
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
      const maxQScore = 2 * q.weight; // '예' 선택 시 최대 점수
      maxRawScore += maxQScore;
      
      if (val !== null && val !== undefined) {
        rawScore += val * q.weight;
      }
    });

    // 100점 만점으로 환산
    return Math.round((rawScore / maxRawScore) * 100);
  };

  // 등급 및 피드백 도출
  const getResultFeedback = (score: number) => {
    if (score >= 85) return {
      grade: "안심 (무리 적음)",
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      summary: "부모님의 체력을 충분히 배려한 훌륭한 계획입니다. 이 정도면 안전하고 즐거운 외출이 될 가능성이 높습니다."
    };
    if (score >= 60) return {
      grade: "주의 (일부 조정 필요)",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      summary: "기본적인 준비는 되었으나, 변수가 생겼을 때 부모님이 힘들어하실 수 있는 구간이 있습니다."
    };
    if (score >= 40) return {
      grade: "경고 (부담 가능성 큼)",
      color: "text-red-600",
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      summary: "현재 일정대로 진행할 경우 부모님이 체력적으로 크게 무리를 느끼실 가능성이 높습니다."
    };
    return {
      grade: "위험 (일정 재설계 권장)",
      color: "text-slate-600",
      bgColor: "bg-slate-100",
      borderColor: "border-slate-300",
      summary: "일반 성인 기준의 일정입니다. 부모님과 함께하기엔 신체적 무리가 클 수 있어 전면적인 수정이 필요합니다."
    };
  };

  // 부족한 부분 요약 생성 (아니오/애매함 선택한 항목 중 가중치 높은 순)
  const getWeakPoints = () => {
    const weakPoints = QUESTIONS
      .filter(q => answers[q.id] === 0 || answers[q.id] === 1)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 3); // 최대 3개까지만 보여줌
    
    return weakPoints.map(q => {
      if (q.id === 1 || q.id === 2) return "도보 및 계단/경사 등 동선 강도 축소";
      if (q.id === 3 || q.id === 11) return "중간 휴식처 및 앉을 자리 추가 확보";
      if (q.id === 4) return "화장실 접근성(위치, 단차) 사전 확인";
      if (q.id === 5) return "어르신 맞춤 식당(소음 낮음, 속 편함) 대안 준비";
      if (q.id === 6 || q.id === 8) return "돌발 상황 대비 플랜B 실내 동선 마련";
      return "일정 순서 및 이동 수단 편의성 재고";
    }).filter((v, i, a) => a.indexOf(v) === i); // 중복 제거
  };

  const handleAnswer = (val: AnswerValue) => {
    setAnswers(prev => ({ ...prev, [QUESTIONS[currentQIndex].id]: val }));
    
    // 다음 질문으로 넘어가거나 결과 보기
    setTimeout(() => {
      if (currentQIndex < QUESTIONS.length - 1) {
        setCurrentQIndex(prev => prev + 1);
      } else {
        setStep('result');
        window.scrollTo(0, 0);
      }
    }, 200);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormStatus('error');
      setErrorMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setFormStatus('loading');
    try {
      // 이메일 수집 연동 위치 (TODO)
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email,
        source: "self_check_result",
        score: calculateScore(),
        createdAt: serverTimestamp()
      });
      setFormStatus('success');
      setEmail('');
    } catch {
      setFormStatus('error');
      setErrorMessage('저장에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 인트로 화면
  if (step === 'intro') {
    return (
      <div className="font-sans text-gray-900 bg-[#F8F9FA] min-h-screen flex flex-col items-center justify-center p-5 break-keep">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-slate-800 p-8 text-center text-white">
            <h1 className="text-2xl font-bold mb-3 leading-snug">
              부모님 외출 전<br/><span className="text-orange-400">1분 점검</span>
            </h1>
            <p className="text-sm text-slate-300">
              많이 보는 일정보다 덜 힘든 일정이 먼저입니다.
            </p>
          </div>
          <div className="p-8">
            <p className="text-gray-600 mb-8 text-base leading-relaxed text-center">
              무료 AI나 검색으로 짠 일정표 초안,<br/>
              <b>정말 부모님 무릎과 체력에 무리가 없을까요?</b><br/><br/>
              직접 체크하고 어떤 위험요소가 숨어있는지 확인해보세요. (총 11문항)
            </p>
            <button
              onClick={() => setStep('quiz')}
              className="w-full bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg py-4 rounded-xl flex items-center justify-center transition-colors shadow-sm"
            >
              자가진단 시작하기 <ArrowRight className="ml-2 w-5 h-5" />
            </button>
            <p className="text-xs text-center text-gray-400 mt-5">가입이나 로그인 없이 바로 시작합니다.</p>
          </div>
        </div>
      </div>
    );
  }

  // 퀴즈 진행 화면
  if (step === 'quiz') {
    const q = QUESTIONS[currentQIndex];
    const progress = ((currentQIndex + 1) / QUESTIONS.length) * 100;

    return (
      <div className="font-sans text-gray-900 bg-[#F8F9FA] min-h-screen flex flex-col p-4 sm:p-6 break-keep">
        <div className="max-w-md w-full mx-auto mt-4 sm:mt-8 flex-1 flex flex-col">
          {/* 진행 상태 바 */}
          <div className="mb-8">
            <div className="flex justify-between text-xs font-bold text-gray-500 mb-2 px-1">
              <span>항목 {currentQIndex + 1} / {QUESTIONS.length}</span>
              <span className="text-orange-600">{q.category} 점검</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-orange-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          {/* 질문 카드 */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8 flex-1 flex flex-col justify-center min-h-[200px]">
            <div className="flex items-center justify-center w-12 h-12 bg-orange-50 text-orange-600 rounded-full mb-6 mx-auto">
              {q.icon}
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-900 leading-snug">
              {q.text}
            </h2>
          </div>

          {/* 선택 버튼들 */}
          <div className="flex flex-col gap-3 pb-8">
            <button
              onClick={() => handleAnswer(2)}
              className="w-full bg-white border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 text-gray-800 font-bold text-lg py-4 px-6 rounded-xl transition-all text-left flex justify-between items-center"
            >
              예, 그렇습니다 <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => handleAnswer(1)}
              className="w-full bg-white border-2 border-gray-200 hover:border-slate-400 hover:bg-slate-50 text-gray-700 font-bold text-lg py-4 px-6 rounded-xl transition-all text-left flex justify-between items-center"
            >
              애매합니다 / 잘 모릅니다 <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
            <button
              onClick={() => handleAnswer(0)}
              className="w-full bg-white border-2 border-gray-200 hover:border-red-400 hover:bg-red-50 text-gray-700 font-bold text-lg py-4 px-6 rounded-xl transition-all text-left flex justify-between items-center"
            >
              아니오 <ChevronRight className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* 뒤로 가기 */}
          {currentQIndex > 0 && (
            <button 
              onClick={() => setCurrentQIndex(prev => prev - 1)}
              className="text-gray-400 flex items-center justify-center py-3 text-sm font-medium hover:text-gray-600 mb-6"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> 이전 질문으로
            </button>
          )}
        </div>
      </div>
    );
  }

  // 결과 화면
  const score = calculateScore();
  const feedback = getResultFeedback(score);
  const weakPoints = getWeakPoints();

  return (
    <div className="font-sans text-gray-900 bg-[#F8F9FA] min-h-screen flex flex-col break-keep">
      {/* 1. 상단바 */}
      <div className="bg-slate-800 text-white text-sm py-3 px-4 text-center font-bold sticky top-0 z-10 shadow-sm">
        부모님 안심 외출 점검 결과
      </div>

      <div className="p-4 sm:p-6 pb-20 max-w-lg w-full mx-auto">
        
        {/* 2. 점수 및 등급 카드 */}
        <div className={`rounded-2xl border-2 p-6 text-center shadow-sm mb-6 bg-white ${feedback.borderColor}`}>
          <p className="text-gray-500 font-bold text-sm mb-2">현재 일정의 안전도는?</p>
          <div className="flex justify-center items-end gap-1 mb-2">
            <span className={`text-5xl font-extrabold ${feedback.color}`}>{score}</span>
            <span className="text-xl text-gray-400 font-medium mb-1">점</span>
          </div>
          <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${feedback.bgColor} ${feedback.color} mb-5`}>
            {feedback.grade}
          </div>
          <p className="text-gray-700 text-base leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-100">
            {feedback.summary}
          </p>
        </div>

        {/* 3. 부족한 부분 요약 및 권장 행동 (점수가 100점이 아닐 때만 노출) */}
        {score < 100 && (
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm mb-8">
            <h3 className="font-bold text-lg text-gray-900 mb-4 flex items-center border-b border-gray-100 pb-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 mr-2" />
              보완이 필요한 항목
            </h3>
            <ul className="space-y-3 mb-6">
              {weakPoints.length > 0 ? weakPoints.map((point, idx) => (
                <li key={idx} className="flex items-start text-gray-700 text-sm sm:text-base leading-snug">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 mr-2.5 shrink-0" />
                  {point}
                </li>
              )) : (
                <li className="text-gray-500 text-sm">기본적인 항목은 모두 체크하셨습니다. 세부적인 사항만 한 번 더 확인해보세요.</li>
              )}
            </ul>

            <h3 className="font-bold text-base text-gray-900 mb-3 block">권장 행동 3가지</h3>
            <div className="bg-orange-50 rounded-xl p-4 text-sm text-gray-800 space-y-2 border border-orange-100">
              <p className="flex items-start"><CheckCircle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 shrink-0" /> 식당/카페의 계단 단차 및 소음 미리 확인하기</p>
              <p className="flex items-start"><CheckCircle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 shrink-0" /> 1시간 30분 주기로 앉을 자리 동선에 구상해두기</p>
              <p className="flex items-start"><CheckCircle className="w-4 h-4 text-orange-500 mr-2 mt-0.5 shrink-0" /> "부모님 무릎은 내가 생각하는 것보다 약하다"고 가정하기</p>
            </div>
          </div>
        )}

        {/* 4. 이메일 확보 CTA (무료 자료 배포) */}
        <div className="bg-slate-800 text-white rounded-2xl p-6 sm:p-8 shadow-sm mb-8 border border-slate-700 relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-slate-700 rounded-full opacity-50 blur-xl"></div>
          
          <h2 className="text-xl font-bold mb-3 relative z-10 leading-snug">
            실수를 줄이기 위한<br/>
            <span className="text-orange-400">1장 핵심 요약표</span>와 <span className="text-orange-400">PDF 가이드</span>
          </h2>
          <p className="text-sm text-slate-300 mb-6 relative z-10">
            점검 결과를 보완할 수 있는 실전 가이드를 무료로 보내드립니다. 출발 전 휴대폰에 저장해두고 체크하세요.
          </p>

          <form onSubmit={handleEmailSubmit} className="relative z-10">
            <input
              type="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (formStatus === 'error') setFormStatus('idle');
              }}
              placeholder="이메일 주소를 입력해주세요"
              className={`w-full px-4 py-3.5 rounded-xl text-gray-900 mb-3 border-2 ${formStatus === 'error' ? 'border-red-400' : 'border-white focus:border-orange-500 outline-none'}`}
              disabled={formStatus === 'loading' || formStatus === 'success'}
            />
            <button
              type="submit"
              disabled={formStatus === 'loading' || formStatus === 'success'}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3.5 rounded-xl transition-colors disabled:bg-gray-500"
            >
              {formStatus === 'loading' ? '처리 중...' : '점검표 + PDF 무료로 받기'}
            </button>
            
            {formStatus === 'error' && <p className="text-red-400 text-sm mt-3 text-center">{errorMessage}</p>}
            {formStatus === 'success' && (
              <div className="mt-4 bg-green-900/50 border border-green-500 text-green-300 p-3 rounded-xl text-sm text-center">
                <CheckCircle className="w-5 h-5 mx-auto mb-1" />
                성공적으로 발송 준비가 되었습니다.<br/>
                <a href="/guide.pdf" download="CareRoute_외출여행_체크리스트.pdf" className="inline-block mt-2 underline font-bold text-white">여기서 즉시 다운로드하기</a>
              </div>
            )}
            <p className="text-xs text-slate-400 mt-3 text-center">언제든 수신 거부 가능합니다. (스팸 X)</p>
          </form>
        </div>

        {/* 5. 유료 검수 서비스 예고 카피 위치 */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 text-center">
          <div className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full mb-4">
            다음 단계 안내
          </div>
          <h3 className="font-bold text-lg text-gray-900 mb-3">
            내가 짠 일정이 정말 무리 없을지<br/>아직 불안하신가요?
          </h3>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            무료 자료로 기본 준비를 하신 뒤, 실제 일정표가 괜찮을지 한 번 더 확인하고 싶다면 <strong>전문가의 세밀한 시선으로 점검받을 수 있는 서비스</strong>도 곧 오픈 예정입니다.
          </p>
          <div className="text-left bg-gray-50 p-4 rounded-xl border border-gray-100 text-sm text-gray-700 space-y-2">
            <p className="flex items-start"><CheckCircle className="w-4 h-4 text-gray-400 mr-2 shrink-0 mt-0.5" /> 도보량, 계단, 식사, 휴식, 이동 부담 면밀 분석</p>
            <p className="flex items-start"><CheckCircle className="w-4 h-4 text-gray-400 mr-2 shrink-0 mt-0.5" /> 어르신 기준으로 무리 없는지 최종 점검 및 대안 제시</p>
          </div>
        </div>

        {/* 다시하기 버튼 */}
        <button 
          onClick={() => {
            setStep('intro');
            setAnswers({});
            setCurrentQIndex(0);
            window.scrollTo(0,0);
          }}
          className="mt-8 text-sm text-gray-500 underline text-center w-full focus:outline-none"
        >
          진단 다시 하기
        </button>
      </div>

      {/* 푸터 */}
      <footer className="bg-gray-100 text-gray-400 py-8 px-5 text-xs text-center border-t border-gray-200 mt-auto">
        <p className="mb-2 font-bold text-gray-500">CareRoute</p>
        <p className="mb-2">부모님이 덜 힘든 외출·여행 동선을 계획하도록 돕습니다.</p>
        <p>문의: kbe@daum.net</p>
      </footer>
    </div>
  );
}
