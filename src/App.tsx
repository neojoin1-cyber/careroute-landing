import React, { useState } from 'react';
import {
  Mail,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  FileText,
  Download
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
      <div className="bg-orange-600 text-white text-sm sm:text-base py-3 px-4 text-center font-bold tracking-wide">
        선착순 무료 배포 중! 부모님 외출·여행 필수 가이드 (PDF)
      </div>

      {/* ----------------- HERO SECTION ----------------- */}
      <header className="bg-white pt-16 pb-12 px-4 sm:px-6 lg:px-8 border-b border-gray-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm sm:text-base mb-6 border border-blue-200">
            <ShieldCheck className="w-5 h-5" /> 검증된 안심 외출 설계법
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5 tracking-tight">
            부모님 모시는 일정,<br />
            <span className="text-orange-600">이제 무리하게 짜지 마세요</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-600 font-medium mb-10 leading-relaxed max-w-2xl mx-auto">
            70대 부모님도 편안한 실전 동선 가이드를<br className="sm:hidden" /> 무료로 보내드립니다.
          </p>

          <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-8 relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="이메일 주소를 입력하세요"
                  className={`block w-full pl-12 pr-4 py-4 md:py-4 border-2 ${status === 'error' ? 'border-red-500 bg-red-50' : 'border-gray-200 bg-gray-50'} rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 text-gray-900 text-lg font-medium transition-all`}
                  disabled={status === 'success' || status === 'loading'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'success' || status === 'loading'}
                className="w-full sm:w-auto px-8 py-4 md:py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl transition-all flex justify-center items-center disabled:bg-gray-400"
              >
                {status === 'loading' ? '처리 중...' : '실전 가이드 다운로드'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-base font-bold mt-4 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 mr-2" /> {errorMessage}
              </p>
            )}
            {status === 'success' && (
              <div className="mt-6 flex flex-col items-center p-5 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-700 font-bold text-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 mr-2" /> 신청 완료! 즉시 다운로드가 가능합니다.
                </p>
                <a
                  href="/guide.pdf"
                  download="CareRoute_외출여행_체크리스트.pdf"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" /> PDF 파일 다운로드
                </a>
              </div>
            )}
            {status !== 'success' && (
              <p className="text-sm text-gray-500 mt-4 flex items-center justify-center font-medium">
                <ShieldCheck className="w-4 h-4 mr-1 text-gray-400" /> 스팸 메일을 보내지 않으며 언제든 취소할 수 있습니다.
              </p>
            )}
          </form>
        </div>
      </header>

      {/* ----------------- IMAGE SECTION (인포그래픽) ----------------- */}
      <section className="py-12 px-4 sm:px-6 bg-gray-100 flex-grow">
        <div className="max-w-5xl mx-auto flex flex-col items-center">
          <p className="text-gray-500 text-sm font-bold mb-4 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-200 flex items-center">
            <FileText className="w-4 h-4 mr-2 text-gray-400" /> 아래 가이드북 전문을 PDF로 보내드립니다
          </p>
          <div className="bg-white p-2 sm:p-4 rounded-2xl shadow-sm border border-gray-200 w-full">
            {/* 대표님이 올려주신 이미지가 /infographic_final_v3.png 로 저장되어 있다고 가정하고 불러옵니다. */}
            <img
              src="/infographic_final_v3.png"
              alt="부모님과 함께하는 편안한 외출 가이드 인포그래픽"
              className="w-full h-auto rounded-xl object-contain bg-gray-50"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                e.currentTarget.parentElement?.insertAdjacentHTML('beforeend', '<div class="py-20 text-center text-gray-400 font-medium">여기에 인포그래픽 이미지가 표시됩니다.<br/>(public 폴더에 infographic_final_v3.png 파일을 넣어주세요)</div>');
              }}
            />
          </div>
        </div>
      </section>

      {/* ----------------- TARGET AUDIENCE (심플하게 수정) ----------------- */}
      <section className="py-12 px-4 sm:px-6 bg-white border-t border-gray-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold text-center text-gray-800 mb-6">이런 분들께 강력히 추천합니다!</h2>
          <div className="bg-blue-50/50 rounded-xl p-5 sm:p-8 border border-blue-100">
            <ul className="space-y-3">
              {[
                "부모님과 여행 및 나들이를 계획 중인 분",
                "오래 걷거나 계단 오르기를 힘들어 하시는 부모님",
                "부모님과의 동선, 식사, 휴식 등으로 고민이신 분"
              ].map((text, idx) => (
                <li key={idx} className="flex items-center justify-center text-sm sm:text-base text-gray-700 font-medium">
                  <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-3 flex-shrink-0"></div>
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ----------------- BOTTOM CTA (하단 폼 추가) ----------------- */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50 border-t border-gray-200 border-b">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">
            지금 바로 신청하세요!
          </h2>
          <form onSubmit={handleSubmit} className="max-w-lg mx-auto relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="이메일 주소를 입력하세요"
                  className={`block w-full pl-12 pr-4 py-4 md:py-4 border-2 ${status === 'error' ? 'border-red-500 bg-red-50' : 'border-gray-300 bg-white'} rounded-xl focus:ring-4 focus:ring-orange-100 focus:border-orange-500 text-gray-900 text-lg font-medium transition-all`}
                  disabled={status === 'success' || status === 'loading'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'success' || status === 'loading'}
                className="w-full sm:w-auto px-8 py-4 md:py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl transition-all flex justify-center items-center disabled:bg-gray-400"
              >
                {status === 'loading' ? '처리 중...' : '실전 가이드 다운로드'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-base font-bold mt-4 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 mr-2" /> {errorMessage}
              </p>
            )}
            {status === 'success' && (
              <div className="mt-6 flex flex-col items-center p-5 bg-green-50 rounded-xl border border-green-200">
                <p className="text-green-700 font-bold text-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 mr-2" /> 신청 완료! 즉시 다운로드가 가능합니다.
                </p>
                <a
                  href="/guide.pdf"
                  download="CareRoute_외출여행_체크리스트.pdf"
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg flex items-center transition-colors"
                >
                  <Download className="w-5 h-5 mr-2" /> PDF 파일 다운로드
                </a>
              </div>
            )}
            {status !== 'success' && (
              <p className="text-sm text-gray-500 mt-4 flex items-center justify-center font-medium">
                <ShieldCheck className="w-4 h-4 mr-1 text-gray-400" /> 스팸 메일을 보내지 않으며 언제든 취소할 수 있습니다.
              </p>
            )}
          </form>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="bg-gray-50 border-t border-gray-200 text-gray-500 py-10 px-4 sm:px-6 text-sm text-center sm:text-left">
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
