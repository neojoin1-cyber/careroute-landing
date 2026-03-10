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
  ClipboardList
} from 'lucide-react';

// ----------------------------------------------------------------------
// [중요] Firebase 데이터베이스 설정
// Firebase 콘솔에서 발급받은 아래의 설정값을 채워넣으세요.
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

// Firebase 초기화 및 Firestore DB 연결
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
// ----------------------------------------------------------------------

export default function App() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 이메일 유효성 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('error');
      setErrorMessage('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setStatus('loading');

    try {
      // 구글 클라우드(Firestore) 데이터베이스에 이메일 저장
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email,
        source: "shorts_landing",
        createdAt: serverTimestamp() // 가입된 시간 자동 기록
      });

      setStatus('success');
      setEmail('');
    } catch (error) {
      console.error("이메일 저장 실패:", error);
      setStatus('error');
      setErrorMessage('데이터베이스 연결 중 문제가 발생하거나 올바른 설정이 필요합니다.');
    }
  };

  return (
    <div className="font-sans text-gray-900 bg-gray-50 min-h-screen break-keep">
      <div className="bg-blue-700 text-white text-sm sm:text-base py-3 px-4 text-center font-bold tracking-wide">
        선착순 무료 배포 중! 부모님 외출·여행 필수 가이드
      </div>

      <header className="bg-white pt-8 pb-10 px-4 sm:px-6 lg:px-8 shadow-sm">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-block bg-blue-100 text-blue-800 font-bold px-4 py-1.5 rounded-full text-sm sm:text-base mb-5 shadow-sm">
            ✨ 부모님이 덜 힘든 외출·여행 계획
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4 tracking-tight">
            부모님 모시는 일정, <br />
            <span className="text-orange-600">이제 무리하게 짜지 마세요</span>
          </h1>
          <p className="text-base sm:text-xl text-gray-700 font-medium mb-6 leading-relaxed">
            70대 부모님도 편안한 실전 동선 가이드를<br className="sm:hidden" /> 무료로 보내드립니다.
          </p>

          <form onSubmit={handleSubmit} className="max-w-lg mx-auto mb-6 relative">
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
                  className={`block w-full pl-12 pr-4 py-4 md:py-5 border-2 ${status === 'error' ? 'border-red-500' : 'border-gray-300'} rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-600 bg-gray-50 text-lg font-medium transition-all`}
                  disabled={status === 'success' || status === 'loading'}
                />
              </div>
              <button
                type="submit"
                disabled={status === 'success' || status === 'loading'}
                className="w-full sm:w-auto px-6 py-4 md:py-5 bg-orange-600 hover:bg-orange-700 text-white font-bold text-lg rounded-xl transition-all flex justify-center items-center shadow-lg disabled:bg-gray-400 transform hover:scale-[1.02] active:scale-95"
              >
                {status === 'loading' ? '처리 중...' : '실전 가이드 무료로 받기'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-base font-bold mt-3 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 mr-1" /> {errorMessage}
              </p>
            )}
            {status === 'success' && (
              <div className="mt-4 flex flex-col items-center p-4 bg-green-50 rounded-xl border border-green-200 shadow-sm">
                <p className="text-green-700 font-bold text-base flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 mr-2" /> 가이드 신청 완료! 아래 버튼을 눌러주세요.
                </p>
                <a
                  href="/guide.pdf"
                  download="CareRoute_외출여행_체크리스트.pdf"
                  className="bg-green-600 hover:bg-green-700 text-white font-extrabold py-3 px-8 rounded-xl flex items-center shadow-lg transition-transform transform hover:scale-105"
                >
                  <FileText className="w-5 h-5 mr-2" /> PDF 가이드 지금 다운로드하기
                </a>
              </div>
            )}
            {status !== 'success' && (
              <p className="text-sm text-gray-500 mt-4 flex items-center justify-center font-medium">
                <ShieldCheck className="w-4 h-4 mr-1 text-gray-400" /> 스팸 메일을 보내지 않으며 언제든 취소할 수 있습니다.
              </p>
            )}
          </form>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-center text-left shadow-sm max-w-lg mx-auto">
            <div className="bg-blue-600 text-white p-3 rounded-xl mr-4 flex-shrink-0">
              <FileText className="w-7 h-7" />
            </div>
            <div>
              <p className="text-sm text-blue-700 font-extrabold mb-1">입력 즉시 100% 무료 제공</p>
              <p className="text-base sm:text-lg font-bold text-gray-900 leading-snug">
                부모님 외출 시 절대 놓치면 안 되는 10가지 체크리스트 (PDF)
              </p>
            </div>
          </div>
        </div>
      </header>

      <section className="py-16 px-4 sm:px-6 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
            "효도하려고 떠난 여행,<br className="sm:hidden" /> 부모님이 더 지치진 않으셨나요?"
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 font-medium">
            자녀들이 흔히 하는 4가지 치명적인 실수를 확인하세요.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-orange-100 flex gap-4 items-start">
            <div className="bg-orange-50 p-2 text-orange-600 rounded-lg flex-shrink-0 mt-1">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">과도하게 많이 걷는 일정</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">자식 체력 기준의 빽빽한 동선은 부모님을 금방 지치게 만듭니다.</p>
            </div>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-orange-100 flex gap-4 items-start">
            <div className="bg-orange-50 p-2 text-orange-600 rounded-lg flex-shrink-0 mt-1">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">식당 선택 및 대기 시간 실패</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">긴 웨이팅이나 입맛에 안 맞는 음식은 외출 전체의 기분을 망칩니다.</p>
            </div>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-orange-100 flex gap-4 items-start">
            <div className="bg-orange-50 p-2 text-orange-600 rounded-lg flex-shrink-0 mt-1">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">계단이 많은 예쁜 관광지</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">풍경보다 중요한 것은 무릎에 부담이 가는지 여부입니다.</p>
            </div>
          </div>
          <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-orange-100 flex gap-4 items-start">
            <div className="bg-orange-50 p-2 text-orange-600 rounded-lg flex-shrink-0 mt-1">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">중간 휴식 시간이 없는 동선</h3>
              <p className="text-base sm:text-lg text-gray-600 leading-relaxed">중간중간 앉아서 쉴 수 있는 카페나 벤치가 없으면 갈등이 생기기 쉽습니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-blue-800 text-white py-16 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4 leading-tight">CareRoute는 이렇게 해결합니다</h2>
            <p className="text-blue-100 text-lg sm:text-xl font-medium">부모님의 체력과 눈높이에 맞춘 완벽한 일정을 제안합니다.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-blue-900 p-8 rounded-2xl text-center">
              <Heart className="w-10 h-10 text-orange-400 mx-auto mb-5" />
              <h3 className="font-extrabold text-xl mb-3">체력과 이동 부담 최소화</h3>
              <p className="text-blue-100 text-base leading-relaxed">오래 걷거나 계단 오르기 없이도 아름다운 풍경을 즐길 수 있는 동선을 알려드립니다.</p>
            </div>
            <div className="bg-blue-900 p-8 rounded-2xl text-center">
              <Map className="w-10 h-10 text-orange-400 mx-auto mb-5" />
              <h3 className="font-extrabold text-xl mb-3">물 흐르듯 편안한 동선 설계</h3>
              <p className="text-blue-100 text-base leading-relaxed">산책 후 바로 식사, 그리고 가까운 카페로 이어지는 부드러운 일정을 제안합니다.</p>
            </div>
            <div className="bg-blue-900 p-8 rounded-2xl text-center">
              <Coffee className="w-10 h-10 text-orange-400 mx-auto mb-5" />
              <h3 className="font-extrabold text-xl mb-3">무리한 계획 사전 예방</h3>
              <p className="text-blue-100 text-base leading-relaxed">자녀의 의욕만 앞선 무리한 계획 대신, 부모님이 여유롭게 즐길 수 있도록 돕습니다.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-12">
          <div className="w-full md:w-1/2 flex justify-center">
            <div className="bg-gradient-to-br from-blue-50 to-orange-50 w-full max-w-sm aspect-[3/4] rounded-2xl shadow-xl border border-gray-200 flex flex-col p-8 items-center text-center justify-center relative overflow-hidden transform hover:-translate-y-2 transition-transform">
              <div className="absolute top-0 w-full h-5 bg-orange-500" />
              <FileText className="w-20 h-20 text-blue-700 mb-6" />
              <h3 className="font-extrabold text-2xl text-gray-900 mb-5 leading-tight">
                부모님과 함께할 때<br /><br />절대 놓치면 안 되는<br />
                <span className="text-blue-700 text-3xl mt-2 block">10가지 체크리스트</span>
              </h3>
              <div className="mt-4 px-4 py-2 bg-white rounded-full text-sm font-bold text-orange-600 shadow-sm border border-orange-100">
                무료 다운로드 제공
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-6 leading-tight">지금 바로 적용할 수 있는<br />실전 노하우를 담았습니다.</h2>
            <ul className="space-y-6 mb-10">
              <li className="flex items-start">
                <CheckCircle className="w-7 h-7 text-blue-600 mr-4 flex-shrink-0" />
                <span className="text-gray-800 text-lg sm:text-xl font-medium">외출 전 무조건 확인해야 할 10가지 핵심 원칙</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-7 h-7 text-blue-600 mr-4 flex-shrink-0" />
                <span className="text-gray-800 text-lg sm:text-xl font-medium">걷는 시간을 반으로 줄이는 일정 설계의 비밀</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-7 h-7 text-blue-600 mr-4 flex-shrink-0" />
                <span className="text-gray-800 text-lg sm:text-xl font-medium">부모님이 만족하는 식당과 카페 고르는 기준</span>
              </li>
              <li className="flex items-start">
                <CheckCircle className="w-7 h-7 text-blue-600 mr-4 flex-shrink-0" />
                <span className="text-gray-800 text-lg sm:text-xl font-medium">자녀들이 가장 흔하게 하는 실수 100% 예방</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- 신뢰성 보강: 인포그래픽 기반 미리보기 섹션 --- */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50 border-t border-gray-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 font-bold px-4 py-1.5 rounded-full text-sm sm:text-base mb-4">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              검증된 안심 외출 설계법
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
              가이드북 핵심 요약 미리보기
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 font-medium leading-relaxed max-w-3xl mx-auto">
              부모님과의 외출 만족도는 <strong>'얼마나 많이 보느냐'</strong>가 아니라 <strong>'얼마나 덜 힘드냐'</strong>에 달려 있습니다.<br className="hidden sm:block" />
              WHO(세계보건기구) 및 NIH(미국국립보건원) 고령층 활동 가이드라인에 기초한 가장 안전한 설계법입니다.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
              <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Heart className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">'많이'보다 '안정적인' 일정</h3>
              <p className="text-gray-600 leading-relaxed">
                과도한 보행을 피하고 부모님의 체력에 맞춘 여유로운 동선을 설계하세요.
              </p>
            </div>

            {/* Card 2 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
              <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Compass className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">평지 중심의 동선 확보</h3>
              <p className="text-gray-600 leading-relaxed">
                계단과 경사를 피하고 엘리베이터, 평지 산책로, 벤치가 있는 장소를 선택해야 합니다.
              </p>
            </div>

            {/* Card 3 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
              <div className="bg-orange-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">90분 단위의 필수 휴식</h3>
              <p className="text-gray-600 leading-relaxed">
                피로 누적을 방지하기 위해 일정 사이사이에 반드시 충분한 휴식 구간을 포함하세요.
              </p>
            </div>

            {/* Card 4 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
              <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Coffee className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">식당 선택 최우선 규칙</h3>
              <p className="text-gray-600 leading-relaxed">
                맛집보다는 짧은 대기 시간, 등받이 좌석, 화장실 접근성이 좋은 식당이 최고의 선택입니다.
              </p>
            </div>

            {/* Card 5 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
              <div className="bg-blue-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <Map className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">반나절 추천 코스 설계</h3>
              <p className="text-gray-600 leading-relaxed">
                이동 권 환경, 편의 시설 유무, 비상 대비(날씨, 컨디션) 등을 고려한 안전한 코스를 알려드립니다.
              </p>
            </div>

            {/* Card 6 */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 transform hover:-translate-y-1 transition-transform">
              <div className="bg-orange-50 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
                <ClipboardList className="w-7 h-7 text-orange-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">실전 체크리스트 제공</h3>
              <p className="text-gray-600 leading-relaxed">
                외출 전부터 귀가할 때까지 놓치기 쉬운 세부 요소들을 한 장의 가이드로 완벽히 정리했습니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-center text-gray-900 mb-10">이런 분들께 강력히 추천합니다!</h2>
          <div className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border border-gray-200">
            <ul className="space-y-5">
              <li className="flex items-center text-lg sm:text-xl text-gray-800 font-medium">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mr-5 flex-shrink-0"></div>부모님과 <strong>국내여행</strong>이나 <strong>효도여행</strong>을 계획 중인 분
              </li>
              <li className="flex items-center text-lg sm:text-xl text-gray-800 font-medium">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mr-5 flex-shrink-0"></div>부모님과 주말에 <strong>카페나 식당, 산책</strong>을 자주 가시는 분
              </li>
              <li className="flex items-center text-lg sm:text-xl text-gray-800 font-medium">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mr-5 flex-shrink-0"></div>부모님이 <strong>오래 걷거나 계단 오르는 것</strong>을 힘들어하시는 분
              </li>
              <li className="flex items-center text-lg sm:text-xl text-gray-800 font-medium">
                <div className="w-2.5 h-2.5 bg-orange-500 rounded-full mr-5 flex-shrink-0"></div>부모님이 식사 메뉴나 휴식 시간에 민감해서 <strong>신경이 쓰이는 분</strong>
              </li>
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-12">1분이면 준비가 끝납니다</h2>
          <div className="grid sm:grid-cols-3 gap-10 relative">
            <div className="hidden sm:block absolute top-[48px] left-[16.66%] right-[16.66%] h-1 bg-gray-100" z-index="-1"></div>

            <div className="relative bg-white pt-4">
              <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-6 border-8 border-white shadow-sm z-10 relative">1</div>
              <h3 className="font-extrabold text-2xl mb-3 text-gray-900">이메일 입력</h3>
              <p className="text-gray-600 text-lg leading-relaxed">PDF 가이드를 받으실<br />이메일 주소를 남겨주세요.</p>
            </div>
            <div className="relative bg-white pt-4">
              <div className="w-20 h-20 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-6 border-8 border-white shadow-sm z-10 relative">2</div>
              <h3 className="font-extrabold text-2xl mb-3 text-gray-900">가이드 즉시 수신</h3>
              <p className="text-gray-600 text-lg leading-relaxed">입력하신 이메일로<br />체크리스트가 바로 발송됩니다.</p>
            </div>
            <div className="relative bg-white pt-4">
              <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-3xl font-extrabold mx-auto mb-6 border-8 border-white shadow-sm z-10 relative">3</div>
              <h3 className="font-extrabold text-2xl mb-3 text-gray-900">완벽한 출발!</h3>
              <p className="text-gray-600 text-lg leading-relaxed">자료를 참고하여 부모님께 맞는<br />최적의 일정을 만들어보세요.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 bg-gray-50 pb-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-10">자주 묻는 질문</h2>
          <div className="space-y-5">
            {[
              { q: "비용이 발생하는 유료 자료인가요?", a: "아닙니다. 입력하신 메일로 체크리스트 PDF가 즉시 100% 무료로 발송됩니다." },
              { q: "어떤 구체적인 내용을 받을 수 있나요?", a: "부모님의 체력을 고려한 동선 짜는 법, 식당 실패 없이 고르는 법, 보호자가 놓치기 쉬운 휴식 포인트 등 당장 실전에 사용할 수 있는 10가지 원칙을 담았습니다." },
              { q: "부모님 연세가 80대 이상이어도 도움이 될까요?", a: "네, 고령의 부모님이나 거동이 불편하신 분들과의 이동 시에도 무리가 없도록 가장 안전하고 보수적인 기준으로 작성되었습니다." }
            ].map((faq, idx) => (
              <div key={idx} className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="flex items-center font-bold text-gray-900 mb-3 text-lg sm:text-xl">
                  <span className="text-blue-600 mr-3 text-xl font-black">Q.</span> {faq.q}
                </h3>
                <p className="text-gray-700 text-base sm:text-lg pl-8 leading-relaxed">A. {faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 bg-blue-900 text-white text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl sm:text-5xl font-extrabold mb-6 leading-tight">
            지금 바로 신청하세요!<br className="sm:hidden" /> 무료 배포가 곧 종료됩니다.
          </h2>
          <p className="text-blue-100 text-lg sm:text-xl mb-12 font-medium">이메일 주소만 적고, 부모님 여행 실패율을 0%로 만들어보세요.</p>

          <form onSubmit={handleSubmit} className="max-w-lg mx-auto relative mb-12 sm:mb-0">
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
                placeholder="받으실 이메일 주소 입력"
                className={`flex-1 px-5 py-4 sm:py-5 border-2 ${status === 'error' ? 'border-red-400 focus:ring-red-400' : 'border-transparent focus:ring-blue-400'} rounded-xl focus:ring-4 focus:outline-none text-gray-900 text-lg font-bold shadow-lg`}
                disabled={status === 'success' || status === 'loading'}
              />
              <button
                type="submit"
                disabled={status === 'success' || status === 'loading'}
                className="w-full sm:w-auto px-8 py-4 sm:py-5 bg-orange-600 hover:bg-orange-700 text-white font-extrabold text-lg sm:text-xl rounded-xl transition-all flex justify-center items-center shadow-xl disabled:bg-gray-500"
              >
                {status === 'loading' ? '처리 중...' : '10초 만에 가이드 받기'}
              </button>
            </div>

            {status === 'error' && (
              <p className="text-red-300 text-base font-bold mt-4 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 mr-2" /> {errorMessage}
              </p>
            )}
            {status === 'success' && (
              <div className="mt-6 flex flex-col items-center p-5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <p className="text-green-300 font-bold text-lg flex items-center justify-center mb-4">
                  <CheckCircle className="w-6 h-6 mr-2" /> 신청 완료! 즉시 다운로드가 가능합니다.
                </p>
                <a
                  href="/guide.pdf"
                  download="CareRoute_외출여행_체크리스트.pdf"
                  className="bg-white text-blue-700 hover:bg-gray-100 font-extrabold py-4 px-10 rounded-xl flex items-center shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all transform hover:scale-105"
                >
                  <FileText className="w-6 h-6 mr-2" /> PDF 파일 다운로드
                </a>
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 text-sm sm:text-base pb-28 sm:pb-12 text-center sm:text-left">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
          <div>
            <span className="text-white font-bold text-2xl tracking-tight mb-3 block">CareRoute</span>
            <p className="text-gray-400 mb-4 leading-relaxed">
              부모님이 덜 힘든 외출·여행 동선을 더 편하게 계획하도록 돕습니다.
            </p>
            <p className="text-gray-400 text-sm font-medium">관리자 문의: kbe@daum.net</p>
          </div>
          <div className="text-gray-500 text-sm md:text-right mt-2 md:mt-0">
            <p className="mb-3">© {new Date().getFullYear()} CareRoute. All rights reserved.</p>
            <p className="leading-relaxed">
              본 페이지에서 수집된 이메일은 가이드 제공 및 <br className="hidden sm:block" />
              신규 서비스 안내 목적 외에는 사용되지 않습니다.
            </p>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-0 w-full sm:hidden p-4 bg-white/90 backdrop-blur-sm border-t border-gray-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.15)] z-50">
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="w-full py-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white font-black text-lg rounded-xl shadow-[0_4px_14px_0_rgba(249,115,22,0.39)] flex items-center justify-center tracking-wide active:scale-95 transition-transform"
        >
          무료 가이드 지금 바로 받기 <ArrowRight className="w-5 h-5 ml-2 font-bold" />
        </button>
      </div>

    </div>
  );
}
