import React, { useState } from 'react';
import {
  Heart,
  Map,
  Coffee,
  AlertTriangle,
  Mail,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  FileText,
  Clock,
  Compass,
  ClipboardList,
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
    <div className="font-sans text-slate-800 bg-white min-h-screen break-keep selection:bg-amber-200">

      {/* ----------------- TOP BANNER ----------------- */}
      <div className="bg-amber-500 text-slate-900 text-sm sm:text-base py-3 px-4 text-center font-bold tracking-wide">
        선착순 무료 배포 중! 부모님 외출·여행 필수 가이드 (PDF)
      </div>

      {/* ----------------- HERO SECTION ----------------- */}
      <header className="bg-slate-900 pt-16 pb-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Abstract Background Element */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none"></div>

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-slate-800/80 backdrop-blur-md border border-slate-700 text-amber-400 font-bold px-5 py-2 rounded-full text-sm sm:text-base mb-8 shadow-sm">
            <ShieldCheck className="w-5 h-5" /> 전문가 기반 안심 외출 설계법
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white leading-tight mb-6 tracking-tight">
            부모님 모시는 일정,<br />
            <span className="text-amber-400">이제 무리하게 짜지 마세요</span>
          </h1>
          <p className="text-lg sm:text-2xl text-slate-300 font-medium mb-10 leading-relaxed max-w-2xl mx-auto">
            70대 부모님도 편안한 실전 동선 가이드를<br className="sm:hidden" /> 무료로 보내드립니다.
          </p>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto mb-8 relative">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                  <Mail className="h-6 w-6 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status === 'error') setStatus('idle');
                  }}
                  placeholder="이메일 주소를 입력하세요"
                  className={`block w-full pl-14 pr-4 py-4 md:py-5 border ${status === 'error' ? 'border-red-500' : 'border-slate-600'} rounded-2xl focus:ring-2 focus:ring-amber-400 focus:border-amber-400 bg-slate-800/80 backdrop-blur-md text-white placeholder-slate-400 text-lg sm:text-xl font-medium transition-all shadow-inner`}
                  disabled={status === 'success' || status === 'loading'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'success' || status === 'loading'}
                className="w-full sm:w-auto px-8 py-4 md:py-5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold text-lg sm:text-xl rounded-2xl transition-all flex justify-center items-center shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:bg-slate-700 disabled:text-slate-400 transform hover:-translate-y-1 active:scale-95 duration-200"
              >
                {status === 'loading' ? '처리 중...' : '가이드 즉시 받기'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-base font-bold mt-4 flex items-center justify-center bg-slate-800/80 py-2 rounded-lg border border-red-500/30">
                <AlertCircle className="w-5 h-5 mr-2" /> {errorMessage}
              </p>
            )}
            {status === 'success' && (
              <div className="mt-6 flex flex-col items-center p-6 bg-emerald-500/10 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-emerald-400 font-bold text-lg sm:text-xl flex items-center justify-center mb-5">
                  <CheckCircle className="w-7 h-7 mr-2" /> 가이드 신청 완료! 즉시 다운로드 하세요.
                </p>
                <a
                  href="/guide.pdf"
                  download="CareRoute_외출여행_체크리스트.pdf"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold py-4 px-10 rounded-xl flex items-center shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-1 hover:scale-105"
                >
                  <Download className="w-6 h-6 mr-2" /> PDF 가이드 지금 다운로드
                </a>
              </div>
            )}
            {status !== 'success' && (
              <p className="text-sm text-slate-400 mt-5 flex items-center justify-center font-medium">
                <ShieldCheck className="w-4 h-4 mr-1 text-slate-500" /> 스팸 메일을 보내지 않으며 언제든 취소할 수 있습니다.
              </p>
            )}
          </form>

          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-2xl p-5 flex items-center text-left max-w-lg mx-auto transition duration-300 hover:bg-slate-800/80">
            <div className="bg-slate-700 text-amber-400 p-3.5 rounded-xl mr-5 flex-shrink-0 shadow-inner">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-amber-400 font-bold mb-1 tracking-wide uppercase">입력 즉시 100% 무료 제공</p>
              <p className="text-base sm:text-lg font-bold text-white leading-snug">
                부모님 외출 시 절대 놓치면 안 되는 10가지 체크리스트 (PDF)
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* ----------------- PAIN POINTS ----------------- */}
      <section className="py-24 px-4 sm:px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-5 leading-tight">
            "효도하려고 떠난 여행,<br className="sm:hidden" /> 부모님이 더 지치진 않으셨나요?"
          </h2>
          <p className="text-lg sm:text-xl text-slate-600 font-medium">
            자녀들이 흔히 하는 4가지 치명적인 실수를 확인하세요.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 lg:gap-8">
          {[
            { title: "과도하게 많이 걷는 일정", desc: "자식 체력 기준의 빽빽한 동선은 부모님을 금방 지치게 만듭니다." },
            { title: "식당 선택 및 대기 시간 실패", desc: "긴 웨이팅이나 입맛에 안 맞는 음식은 외출 전체의 기분을 망칩니다." },
            { title: "계단이 많은 예쁜 관광지", desc: "풍경보다 중요한 것은 무릎에 부담이 가는지 여부입니다." },
            { title: "중간 휴식 시간이 없는 동선", desc: "중간중간 앉아서 쉴 수 있는 카페나 벤치가 없으면 갈등이 생기기 쉽습니다." }
          ].map((item, idx) => (
            <div key={idx} className="bg-white p-8 rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 flex gap-5 items-start transition duration-300 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1">
              <div className="bg-rose-50 p-3 text-rose-500 rounded-2xl flex-shrink-0 mt-1">
                <AlertTriangle className="w-7 h-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ----------------- CORE INFOGRAPHIC SUMMARY ----------------- */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50 border-t border-slate-200/60">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-indigo-100/50 text-indigo-700 font-bold px-4 py-1.5 rounded-full text-sm sm:text-base mb-5 border border-indigo-200">
              <ShieldCheck className="w-5 h-5 text-indigo-600" />
              검증된 안심 외출 설계법
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-slate-900 mb-6 leading-tight tracking-tight">
              가이드북 핵심 요약 미리보기
            </h2>
            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
              부모님과의 외출 만족도는 <strong>'얼마나 많이 보느냐'</strong>가 아니라 <strong>'얼마나 덜 힘드냐'</strong>에 달려 있습니다.<br className="hidden sm:block" />
              WHO 및 NIH 고령층 활동 가이드라인에 기초한 가장 안전한 설계법입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              { icon: Heart, color: "text-indigo-600", bg: "bg-indigo-50", title: "'많이'보다 '안정적인' 일정", desc: "과도한 보행을 피하고 부모님의 체력에 맞춘 여유로운 동선을 설계하세요." },
              { icon: Compass, color: "text-teal-600", bg: "bg-teal-50", title: "평지 중심의 동선 확보", desc: "계단과 경사를 피하고 엘리베이터, 평지 산책로, 벤치가 있는 장소를 선택해야 합니다." },
              { icon: Clock, color: "text-amber-600", bg: "bg-amber-50", title: "90분 단위의 필수 휴식", desc: "피로 누적을 방지하기 위해 일정 사이사이에 반드시 충분한 휴식 구간을 포함하세요." },
              { icon: Coffee, color: "text-rose-600", bg: "bg-rose-50", title: "식당 선택 최우선 규칙", desc: "맛집보다는 짧은 대기 시간, 등받이 좌석, 화장실 접근성이 좋은 식당이 최고의 선택입니다." },
              { icon: Map, color: "text-blue-600", bg: "bg-blue-50", title: "반나절 추천 코스 설계", desc: "이동 권 환경, 편의 시설 유무, 비상 대비 등을 고려한 안전한 코스를 알려드립니다." },
              { icon: ClipboardList, color: "text-purple-600", bg: "bg-purple-50", title: "실전 체크리스트 제공", desc: "외출 전부터 귀가할 때까지 놓치기 쉬운 세부 요소들을 한 장의 가이드로 완벽히 정리했습니다." }
            ].map((item, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 transform hover:-translate-y-2 transition-transform duration-300 hover:shadow-xl">
                <div className={`${item.bg} w-16 h-16 rounded-2xl flex items-center justify-center mb-6`}>
                  <item.icon className={`w-8 h-8 ${item.color}`} />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- HOW IT HELPS ----------------- */}
      <section className="bg-slate-900 text-white py-24 px-4 sm:px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-400 via-transparent to-transparent pointer-events-none"></div>
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-5 leading-tight tracking-tight">CareRoute 솔루션</h2>
            <p className="text-slate-300 text-lg sm:text-xl font-medium">부모님의 체력과 눈높이에 맞춘 완벽한 일정을 제안합니다.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-8">
            <div className="bg-slate-800/80 backdrop-blur-md p-10 rounded-3xl text-center border border-slate-700 hover:border-amber-500/50 transition-colors">
              <Heart className="w-12 h-12 text-amber-400 mx-auto mb-6" />
              <h3 className="font-extrabold text-2xl mb-4 text-white">체력 및 이동 부담 최소화</h3>
              <p className="text-slate-300 text-lg leading-relaxed">오래 걷거나 계단 오르기 없이도 아름다운 풍경을 즐길 수 있는 동선을 알려드립니다.</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-md p-10 rounded-3xl text-center border border-slate-700 hover:border-amber-500/50 transition-colors">
              <Map className="w-12 h-12 text-amber-400 mx-auto mb-6" />
              <h3 className="font-extrabold text-2xl mb-4 text-white">물 흐르듯 편안한 동선 설계</h3>
              <p className="text-slate-300 text-lg leading-relaxed">산책 후 바로 식사, 그리고 가까운 카페로 이어지는 부드러운 일정을 제안합니다.</p>
            </div>
            <div className="bg-slate-800/80 backdrop-blur-md p-10 rounded-3xl text-center border border-slate-700 hover:border-amber-500/50 transition-colors">
              <Coffee className="w-12 h-12 text-amber-400 mx-auto mb-6" />
              <h3 className="font-extrabold text-2xl mb-4 text-white">무리한 계획 사전 예방</h3>
              <p className="text-slate-300 text-lg leading-relaxed">자녀의 의욕만 앞선 무리한 계획 대신, 부모님이 여유롭게 즐길 수 있도록 돕습니다.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ----------------- TARGET AUDIENCE ----------------- */}
      <section className="py-24 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-900 mb-12 tracking-tight">이런 분들께 강력히 추천합니다!</h2>
          <div className="bg-slate-50 rounded-[2.5rem] p-8 sm:p-12 shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-slate-200">
            <ul className="space-y-6">
              {[
                "부모님과 국내여행이나 효도여행을 계획 중인 분",
                "부모님과 주말에 카페나 식당, 산책을 자주 가시는 분",
                "부모님이 오래 걷거나 계단 오르는 것을 힘들어하시는 분",
                "부모님이 식사 메뉴나 휴식 시간에 민감해서 신경이 쓰이는 분"
              ].map((text, idx) => (
                <li key={idx} className="flex items-start text-lg sm:text-xl text-slate-800 font-medium">
                  <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-5 flex-shrink-0 mt-0.5">
                    <div className="w-2.5 h-2.5 bg-amber-500 rounded-full"></div>
                  </div>
                  <span className="leading-snug pt-0.5">{text.replace(/국내여행|효도여행|카페나 식당, 산책|오래 걷거나 계단 오르는 것|신경이 쓰이는 분/g, match => `<strong>${match}</strong>`)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ----------------- 3 STEPS ----------------- */}
      <section className="py-24 px-4 sm:px-6 bg-slate-50 border-t border-b border-slate-200/60">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-16 tracking-tight">단 1분이면 준비가 끝납니다</h2>
          <div className="grid sm:grid-cols-3 gap-12 sm:gap-6 relative">
            <div className="hidden sm:block absolute top-[48px] left-[16.66%] right-[16.66%] h-0.5 bg-slate-200" style={{ zIndex: 0 }}></div>

            {[
              { num: 1, title: "이메일 입력", desc: "PDF 가이드를 받으실<br />이메일 주소를 남겨주세요." },
              { num: 2, title: "가이드 즉시 수신", desc: "입력하신 이메일로<br />체크리스트가 바로 발송됩니다." },
              { num: 3, title: "완벽한 출발!", desc: "자료를 참고하여 부모님께 맞는<br />최적의 일정을 만들어보세요." }
            ].map((step, idx) => (
              <div key={idx} className="relative z-10 bg-slate-50 pt-4">
                <div className={`w-24 h-24 ${idx === 2 ? 'bg-amber-100 text-amber-600' : 'bg-white text-slate-400 border-slate-100'} rounded-full flex items-center justify-center text-3xl font-black mx-auto mb-8 shadow-lg border-[6px] border-slate-50 transition-transform hover:scale-110 duration-300`}>
                  {step.num}
                </div>
                <h3 className="font-extrabold text-2xl mb-4 text-slate-900">{step.title}</h3>
                <p className="text-slate-600 text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: step.desc }}></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- FAQ ----------------- */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-center text-slate-900 mb-12 tracking-tight">자주 묻는 질문</h2>
          <div className="space-y-6">
            {[
              { q: "비용이 발생하는 유료 자료인가요?", a: "아닙니다. 입력하신 메일로 체크리스트 PDF가 즉시 100% 무료로 발송됩니다." },
              { q: "어떤 구체적인 내용을 받을 수 있나요?", a: "부모님의 체력을 고려한 동선 짜는 법, 식당 실패 없이 고르는 법, 보호자가 놓치기 쉬운 휴식 포인트 등 당장 실전에 사용할 수 있는 10가지 원칙을 담았습니다." },
              { q: "부모님 연세가 80대 이상이어도 도움이 될까요?", a: "네, 고령의 부모님이나 거동이 불편하신 분들과의 이동 시에도 무리가 없도록 가장 안전하고 보수적인 기준으로 작성되었습니다." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <h3 className="flex items-start font-bold text-slate-900 mb-3 text-xl sm:text-2xl leading-snug">
                  <span className="text-amber-500 mr-4 font-black">Q.</span> {faq.q}
                </h3>
                <p className="text-slate-600 text-lg sm:text-xl md:pl-10 leading-relaxed font-medium">A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ----------------- BOTTOM CTA ----------------- */}
      <section className="py-28 px-4 sm:px-6 bg-slate-900 text-white text-center relative overflow-hidden mt-10">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-4xl sm:text-5xl font-extrabold mb-6 leading-tight tracking-tight">
            지금 바로 신청하세요!<br /> <span className="text-amber-400">무료 배포가 곧 종료됩니다.</span>
          </h2>
          <p className="text-slate-300 text-lg sm:text-2xl mb-12 font-medium">이메일 주소만 적고, 부모님 여행 실패율을 0%로 만들어보세요.</p>

          <form onSubmit={handleSubmit} className="max-w-xl mx-auto relative mb-12 sm:mb-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="받으실 이메일 주소 입력"
                className={`flex-1 px-6 py-4 sm:py-5 border ${status === 'error' ? 'border-red-500 focus:ring-red-400' : 'border-slate-600 focus:ring-amber-400 focus:border-amber-400'} rounded-2xl focus:ring-2 focus:outline-none bg-slate-800/80 text-white placeholder-slate-400 text-lg sm:text-xl font-medium shadow-inner transition-all`}
                disabled={status === 'success' || status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'success' || status === 'loading'}
                className="w-full sm:w-auto px-10 py-4 sm:py-5 bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold text-lg sm:text-xl rounded-2xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:bg-slate-700 disabled:text-slate-400 transform hover:-translate-y-1 active:scale-95 duration-200"
              >
                {status === 'loading' ? '처리 중...' : '가이드 즉시 받기'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-red-400 text-base font-bold mt-4 flex items-center justify-center bg-slate-800/80 py-2 rounded-lg border border-red-500/30">
                <AlertCircle className="w-5 h-5 mr-2" /> {errorMessage}
              </p>
            )}
            {status === 'success' && (
              <div className="mt-6 flex flex-col items-center p-6 bg-emerald-500/10 backdrop-blur-md rounded-2xl border border-emerald-500/30 shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-500">
                <p className="text-emerald-400 font-bold text-lg sm:text-xl flex items-center justify-center mb-5">
                  <CheckCircle className="w-7 h-7 mr-2" /> 신청 완료! 즉시 다운로드가 가능합니다.
                </p>
                <a
                  href="/guide.pdf"
                  download="CareRoute_외출여행_체크리스트.pdf"
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-extrabold py-4 px-10 rounded-xl flex items-center shadow-[0_0_30px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-1 hover:scale-105"
                >
                  <Download className="w-6 h-6 mr-2" /> PDF 파일 다운로드
                </a>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ----------------- FOOTER ----------------- */}
      <footer className="bg-black text-slate-400 py-16 px-4 sm:px-6 text-sm sm:text-base pb-32 sm:pb-16 text-center sm:text-left">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div>
            <span className="text-white font-extrabold text-3xl tracking-tight mb-4 block">CareRoute</span>
            <p className="text-slate-400 mb-5 leading-relaxed text-base">
              부모님이 덜 힘든 외출·여행 동선을 더 편하게 계획하도록 돕습니다.
            </p>
            <p className="text-slate-500 text-sm font-medium">관리자 문의: kbe@daum.net</p>
          </div>
          <div className="text-slate-500 text-sm md:text-right mt-4 md:mt-0 font-medium">
            <p className="mb-3">© {new Date().getFullYear()} CareRoute. All rights reserved.</p>
            <p className="leading-relaxed">
              본 페이지에서 수집된 이메일은 가이드 제공 및 <br className="hidden sm:block" />
              신규 서비스 안내 목적 외에는 사용되지 않습니다.
            </p>
          </div>
        </div>
      </footer>

      {/* ----------------- MOBILE FLOATING CTA ----------------- */}
      <div className="fixed bottom-0 w-full sm:hidden p-4 bg-white/90 backdrop-blur-md border-t border-slate-200 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.15)] z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full py-4 bg-amber-500 text-slate-900 font-extrabold text-xl rounded-2xl shadow-[0_8px_20px_0_rgba(245,158,11,0.3)] flex items-center justify-center tracking-wide active:scale-95 transition-transform"
        >
          무료 가이드 즉시 받기 <ArrowRight className="w-6 h-6 ml-2 font-bold" />
        </button>
      </div>

    </div>
  );
}
