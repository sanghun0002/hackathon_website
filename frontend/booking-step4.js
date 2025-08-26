document.addEventListener('DOMContentLoaded', () => {
  // --- 좌표 기반 deckData 정의 ---
  const deckData = {
    "삼계리 1구역": {
      image_url: "./images/samgyeri/samgyeri_part1.png",
      decks: [
        { id: "1-1", name: "평상 1", top: "60%", left: "43%", width: "6%", height: "6%", capacity: 4, isBooked: false },
        { id: "1-2", name: "평상 2", top: "64.5%", left: "54%", width: "6%", height: "6%", capacity: 4, isBooked: true },
        { id: "1-3", name: "평상 3", top: "64%", left: "66%", width: "6%", height: "6%", capacity: 6, isBooked: false }
      ]
    },
    "삼계리 2구역": {
      image_url: "./images/samgyeri/samgyeri_part2.png",
      decks: [
        { id: "2-1", name: "평상 1", top: "40%", left: "16%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "2-2", name: "평상 2", top: "37%", left: "25%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "2-3", name: "평상 3", top: "38%", left: "31.5%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "2-4", name: "평상 4", top: "42%", left: "38.5%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "2-5", name: "평상 5", top: "46%", left: "46.5%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "2-6", name: "평상 6", top: "49%", left: "53%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "2-7", name: "평상 7", top: "52%", left: "59.5%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "2-8", name: "평상 8", top: "55.5%", left: "65%", width: "6%", height: "6%", capacity: 4, isBooked: false }
      ]
    },
    "삼계리 3구역": {
      image_url: "./images/samgyeri/samgyeri_part3.png",
      decks: [
        { id: "3-1", name: "평상 1", top: "48.5%", left: "28%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "3-2", name: "평상 2", top: "50%", left: "37.2%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "3-3", name: "평상 3", top: "53%", left: "46.5%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "3-4", name: "평상 4", top: "56.5%", left: "53.5%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "3-5", name: "평상 5", top: "60%", left: "62%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "3-6", name: "평상 6", top: "65.5%", left: "70%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "3-7", name: "평상 7", top: "68%", left: "77.5%", width: "6%", height: "6%", capacity: 6, isBooked: false }
      ]
    },
    "삼계리 4구역": {
      image_url: "./images/samgyeri/samgyeri_part4.png",
      decks: [
        { id: "4-1", name: "평상 1", top: "59.5%", left: "39.5%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "4-2", name: "평상 2", top: "52%", left: "53%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "4-3", name: "평상 3", top: "51.5%", left: "67%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "4-4", name: "평상 4", top: "44.5%", left: "77%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "4-5", name: "평상 5", top: "39%", left: "88%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "4-6", name: "평상 6", top: "76%", left: "23%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "4-7", name: "평상 7", top: "93%", left: "36%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "4-8", name: "평상 8", top: "70.5%", left: "51.5%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "4-9", name: "평상 9", top: "83.5%", left: "67%", width: "6%", height: "6%", capacity: 6, isBooked: false }
      ]
    },
    "삼계리 5구역": {
      image_url: "./images/samgyeri/samgyeri_part5.png",
      decks: [
        { id: "5-1", name: "평상 1", top: "67.5%", left: "38%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "5-2", name: "평상 2", top: "60%", left: "50.5%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "5-3", name: "평상 3", top: "53%", left: "59.5%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "5-4", name: "평상 4", top: "47%", left: "67%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "5-5", name: "평상 5", top: "43.5%", left: "76%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "5-6", name: "평상 6", top: "36.5%", left: "85%", width: "6%", height: "6%", capacity: 6, isBooked: false }
      ]
    },
    "제6곡 옥류동": {
      image_url: "./images/okryudong.jpg",
      decks: [
        { id: "6-1", name: "평상 1", top: "30%", left: "30%", width: "6%", height: "6%", capacity: 4, isBooked: false },
        { id: "6-2", name: "평상 2", top: "50%", left: "50%", width: "6%", height: "6%", capacity: 4, isBooked: false },
        { id: "6-3", name: "평상 3", top: "70%", left: "70%", width: "6%", height: "6%", capacity: 8, isBooked: false }
      ]
    }
  };

  // --- localStorage ---
  const selectedValley  = localStorage.getItem('selectedValley');
  const selectedSection = localStorage.getItem('selectedSection');

  // --- DOM elements ---
  const bookingInfoDisplay = document.getElementById('booking-info-display');
  const deckSectionImage   = document.getElementById('deck-section-image');
  const deckListContainer  = document.getElementById('deck-list-container');
  const loadingMessage     = document.getElementById('loading-message');
  const payBtn             = document.getElementById('payment-btn');

  if (!selectedSection) {
    alert('유효한 구역 정보가 없습니다. 이전 단계로 돌아갑니다.');
    window.location.href = 'booking-step3.html';
    return;
  }

  bookingInfoDisplay.textContent = `${selectedValley} > ${selectedSection}`;

  const sectionData = deckData[selectedSection];
  if (!sectionData) {
    if (loadingMessage) loadingMessage.textContent = '선택된 구역의 정보를 찾을 수 없습니다.';
    return;
  }

  // 이미지 세팅
  deckSectionImage.src = sectionData.image_url;
  deckSectionImage.alt = `${selectedSection} 구역 이미지`;

  // hotspot container 준비
  const hotspotContainer = document.createElement('div');
  hotspotContainer.style.position = 'absolute';
  hotspotContainer.style.top = 0;
  hotspotContainer.style.left = 0;
  hotspotContainer.style.width = '100%';
  hotspotContainer.style.height = '100%';
  hotspotContainer.id = "deck-hotspot-container";

  // 평상 버튼 생성
  let selectedBtn = null;
sectionData.decks.forEach(deck => {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'absolute deck-dot';
  // 위치/크기(%)
  btn.style.top = deck.top;
  btn.style.left = deck.left;
  btn.style.width = deck.width;
  btn.style.height = deck.height;
  btn.style.transform = 'translate(-50%, -50%)';
  btn.title = `${deck.name} · 수용 ${deck.capacity}인`;

  if (deck.isBooked) {
    // 예약 불가 스타일
    btn.classList.add('unavailable', 'bg-gray-400'); // 비활성 + 회색
    // 접근성 정보
    btn.setAttribute('aria-disabled', 'true');
  } else {
    // 예약 가능 스타일
    btn.classList.add('available', 'bg-emerald-400');
    btn.addEventListener('mouseenter', () => { btn.classList.add('scale-105'); });
    btn.addEventListener('mouseleave', () => { btn.classList.remove('scale-105'); });

    // 클릭해서 선택
    btn.addEventListener('click', () => {
      if (selectedBtn) selectedBtn.classList.remove('selected');
      btn.classList.add('selected');

      selectedBtn = btn;
      localStorage.setItem('selectedDeck', JSON.stringify(deck));
      document.getElementById('payment-btn').disabled = false;
    });
  }

  hotspotContainer.appendChild(btn);
});

  // 이미지 부모에 hotspot 붙이기
  deckSectionImage.parentElement.appendChild(hotspotContainer);

  // 결제 버튼
  payBtn.addEventListener('click', () => {
    if (!selectedBtn) {
      alert('평상을 먼저 선택해주세요.');
      return;
    }
    window.location.href = 'booking-payment.html';
  });
});
