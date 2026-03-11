import React, { useState } from 'react';
import {
  Mail,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  FileText,
  Download,
  MapPin,
  Heart,
  Coffee
} from 'lucide-react';

// ----------------------------------------------------------------------
// [중요] Firebase 데이터베이스 설정
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

export default function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setStatus('loading');

    try {
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email,
        source: "shorts_landing",
        createdAt: serverTimestamp()
      });

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error("이메일 저장 실패:", error);
      setStatus('error');
      const rawError = error instanceof Error ? error.message : JSON.stringify(error);
      setErrorMessage(`데이터베이스 에러: ${rawError}`);
    }
  };

  return (
    <div className="font-sans text-gray-900 bg-gray-50 min-h-screen break-keep flex flex-col">

      {/* ----------------- TOP BANNER ----------------- */}
      <div className="bg-orange-600 text-white text-xs sm:text-sm py-2 px-4 text-center tracking-wide z-10 relative">
        선착순 무료 배포 | 70대 이상 부모님 안심 외출 가이드 (PDF)
      </div>

      {/* ----------------- HERO SECTION (모바일 첫 화면에 모든 요소가 보이도록 설계) ----------------- */}
      <header 
        className="bg-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 border-b border-gray-200 flex flex-col justify-center relative" 
        style={{ minHeight: 'calc(100svh - 36px)' }}
      >
        <div className="max-w-4xl mx-auto text-center w-full">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 font-bold px-3 py-1.5 rounded-full text-xs sm:text-sm mb-5 border border-blue-100">
            <ShieldCheck className="w-4 h-4" /> 검증된 안심 외출 설계법
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
            부모님 모시는 외출,<br />
            <span className="text-orange-600">더 이상 무거운 숙제가 아닙니다.</span>
          </h1>
          <p className="text-sm sm:text-lg text-gray-600 font-medium mb-8 leading-relaxed max-w-2xl mx-auto">
            계단, 화장실, 식당 동선까지.<br className="sm:hidden" /> 
            부모님의 체력을 고려한 '안심 외출 체크리스트'를 즉시 보내드립니다.
          </p>

          <form onSubmit={handleSubmit} className="max-w-lg mx-auto w-full relative mb-4">
            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="이메일 주소를 입력하세요"
                  className={`block w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 border-2 ${status === 'error' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 text-gray-900 text-base sm:text-lg font-medium transition-all`}
                  disabled={status === 'success' || status === 'loading'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'success' || status === 'loading'}
                className="w-full px-6 py-3.5 sm:py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base sm:text-lg rounded-xl transition-all flex justify-center items-center disabled:bg-gray-400 shadow-md"
              >
                {status === 'loading' ? '처리 중...' : '무료 자료 받기'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm sm:text-base font-bold mt-3 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-1.5" /> {errorMessage}
              </p>
            )}
            {status === 'success' && (
              <div className="mt-4 flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-700 font-bold text-base flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 mr-1.5" /> 신청 완료! 즉시 다운로드가 가능합니다.
                </p>
                <a
                  href="/guide.pdf"
                  download="CareRoute_외출여행_체크리스트.pdf"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center transition-colors text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 mr-2" /> PDF 파일 다운로드
                </a>
              </div>
            )}
            {status !== 'success' && (
              <p className="text-xs sm:text-sm text-gray-500 mt-3 flex items-center justify-center font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-gray-400" /> 스팸을 보내지 않으며 언제든 구독 취소가 가능합니다.
              </p>
            )}
          </form>
        </div>
      </header>

      {/* ----------------- PROBLEM & SOLUTION (더 직관적인 텍스트 및 카드형 UI) ----------------- */}
      <section className="py-14 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 block">이런 고민, 해보신 적 있으신가요?</h2>
            <p className="text-gray-600 text-sm sm:text-base block">부모님과의 뜻깊은 외출을 주저하게 만드는 현실적인 문제들입니다.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-12">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <MapPin className="text-orange-600 w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">예측 불가능한 동선</h3>
              <p className="text-sm text-gray-600 leading-relaxed">식당 앞 갑작스러운 높은 계단, 좁고 불편한 화장실 위치 때문에 당황스러웠던 경험</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Heart className="text-orange-600 w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">저하되는 체력</h3>
              <p className="text-sm text-gray-600 leading-relaxed">"이제 그만 앉자." 부모님의 무릎 건강과 체력을 고려한 적절한 휴식처 탐색의 어려움</p>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center sm:items-start text-center sm:text-left">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-4">
                <Coffee className="text-orange-600 w-6 h-6" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">메뉴 및 환경</h3>
              <p className="text-sm text-gray-600 leading-relaxed">시끄럽지 않고 속이 편안한 메뉴를 갖춘 어르신 친화적 식당을 매번 찾아야 하는 수고로움</p>
            </div>
          </div>
          
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-orange-500"></div>
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-5 flex items-center">
              <FileText className="w-6 h-6 mr-2 text-orange-600" />
              그래서, 가이드북에 이런 내용을 담았습니다.
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start text-sm sm:text-base text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">식당/카페 필수 체크리스트</strong> : 화장실 위치, 단차, 소음 정도 등 필수 확인 요소</span>
              </li>
              <li className="flex items-start text-sm sm:text-base text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">동선 계획 가이드</strong> : 적절한 휴식 빈도와 돌발 상황 시의 대안 경로 설정 방법</span>
              </li>
              <li className="flex items-start text-sm sm:text-base text-gray-700">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2.5 flex-shrink-0 mt-0.5" />
                <span><strong className="text-gray-900">비상 상황 대비 팁</strong> : 이동 거리 내 의료진 접근성 판단 및 필요 약품 체크</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ----------------- INFOGRAPHIC SECTION (비중 축소) ----------------- */}
      <section className="py-12 px-4 sm:px-6 bg-white border-y border-gray-100">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gray-400 text-xs sm:text-sm font-bold mb-4 tracking-wider">
            [ 요약 인포그래픽 ]
          </p>
          <div className="bg-gray-50 p-2 sm:p-4 rounded-xl border border-gray-100 w-full">
            <img
              src="/infographic_final_v3.png"
              alt="부모님과 함께하는 편안한 외출 가이드 인포그래픽 요약"
              className="w-full h-auto rounded-lg object-contain mix-blend-multiply"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        </div>
      </section>

      {/* ----------------- PAID SERVICE SECTION (차분하고 신뢰감 있게) ----------------- */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-b border-gray-200">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white p-6 sm:p-10 rounded-2xl shadow-sm border border-slate-200">
            <div className="flex flex-col items-center text-center">
              <div className="inline-block bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1.5 rounded-full mb-5 tracking-wide">
                프리미엄 선택 서비스
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 block leading-snug">
                일정 계획이 막막하시다면?<br className="sm:hidden" /> 전문가의 맞춤 검수를 받아보세요.
              </h2>
              <p className="text-sm sm:text-base text-gray-600 mb-8 max-w-xl leading-relaxed">
                바쁜 일상 속에서 부모님의 체력과 취향에 완벽히 맞는 동선을 짜는 것은 쉽지 않습니다. 
                가족의 소중한 시간을 위해, 계획하신 일정을 전문가의 시선으로 꼼꼼히 살펴보고 현실적인 대안을 제안해 드립니다.
              </p>
              
              <div className="w-full bg-slate-50 rounded-xl p-5 sm:p-6 mb-8 text-left border border-slate-100">
                <h4 className="font-bold text-gray-800 mb-4 text-sm sm:text-base">이런 상황에 권해드립니다:</h4>
                <ul className="space-y-3 text-sm sm:text-base text-gray-600">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
                    짜놓은 동선에 어르신이 걷기 힘든 계단이나 험한 길은 없는지 확신이 안 서는 경우
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
                    부모님이 드시기에 속이 편안하고 조용한 식당 대안이 필요하신 경우
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400 mr-2 flex-shrink-0 mt-0.5" />
                    갑작스러운 컨디션 저하에 대비한 짧고 편안한 '플랜B' 동선이 필요하신 경우
                  </li>
                </ul>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-500 mb-5">
                편안한 마음으로 아래 이메일을 통해 대략적인 일정을 문의주시면, 검수 가능 여부와 세부 절차를 안내해 드립니다.
              </p>
              <a 
                href="mailto:kbe@daum.net" 
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-medium text-sm sm:text-base rounded-xl transition-all shadow-sm"
              >
                kbe@daum.net 으로 검수 가능 여부 묻기
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- BOTTOM CTA ----------------- */}
      <section className="py-16 px-4 sm:px-6 bg-orange-50 border-b border-orange-100">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 block">
            성공적인 외출의 첫걸음,
          </h2>
          <p className="text-gray-700 text-base sm:text-lg mb-8 font-medium">안심 외출 가이드로 먼저 준비하세요.</p>
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto relative">
            <div className="flex flex-col gap-3">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="이메일 주소를 입력하세요"
                  className={`block w-full pl-11 sm:pl-12 pr-4 py-3 sm:py-4 border-2 ${status === 'error' ? 'border-red-500 bg-red-50' : 'border-white bg-white shadow-sm'} rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 text-gray-900 text-base sm:text-lg font-medium transition-all`}
                  disabled={status === 'success' || status === 'loading'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'success' || status === 'loading'}
                className="w-full px-6 py-3.5 sm:py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base sm:text-lg rounded-xl transition-all flex justify-center items-center disabled:bg-gray-400 shadow-md"
              >
                {status === 'loading' ? '처리 중...' : '무료 자료 받기'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm sm:text-base font-bold mt-4 flex items-center justify-center">
                <AlertCircle className="w-4 h-4 mr-1.5" /> {errorMessage}
              </p>
            )}
            {status === 'success' && (
              <div className="mt-4 flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-700 font-bold text-base flex items-center justify-center mb-3">
                  <CheckCircle className="w-5 h-5 mr-1.5" /> 신청 완료! 즉시 다운로드가 가능합니다.
                </p>
                <a
                  href="/guide.pdf"
                  download="CareRoute_외출여행_체크리스트.pdf"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center transition-colors text-sm sm:text-base"
                >
                  <Download className="w-4 h-4 mr-2" /> PDF 파일 다운로드
                </a>
              </div>
            )}
            {status !== 'success' && (
              <p className="text-xs sm:text-sm text-gray-500 mt-3 flex items-center justify-center font-medium">
                <ShieldCheck className="w-3.5 h-3.5 mr-1 text-gray-400" /> 스팸을 보내지 않으며 언제든 구독 취소가 가능합니다.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="bg-white text-gray-500 py-10 px-4 sm:px-6 text-sm text-center sm:text-left border-t border-gray-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-4">
          <div>
            <span className="text-gray-900 font-bold text-xl tracking-tight mb-2 block">CareRoute</span>
            <p className="mb-2">부모님이 덜 힘든 외출·여행 동선을 계획하도록 돕습니다.</p>
            <p>문의: kbe@daum.net</p>
          </div>
          <div className="text-sm md:text-right mt-2 md:mt-0">
            <p className="mb-2">© {new Date().getFullYear()} CareRoute. All rights reserved.</p>
            <p>이메일은 가이드 제공 목적 외에는 사용되지 않습니다.</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
