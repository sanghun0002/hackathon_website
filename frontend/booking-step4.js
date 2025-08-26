document.addEventListener('DOMContentLoaded', () => {
  // --- 좌표 기반 deckData 정의 ---
  const deckData = {
    "삼계리 1구역": {
      image_url: "./images/samgyeri/samgyeri_part1.png",
      decks: [
        { id: "1-1", name: "평상 1", top: "30%", left: "40%", width: "6%", height: "6%", capacity: 4, isBooked: false },
        { id: "1-2", name: "평상 2", top: "50%", left: "60%", width: "6%", height: "6%", capacity: 4, isBooked: true },
        { id: "1-3", name: "평상 3", top: "70%", left: "30%", width: "6%", height: "6%", capacity: 6, isBooked: false }
      ]
    },
    "삼계리 2구역": {
      image_url: "./images/samgyeri/samgyeri_part2.png",
      decks: [
        { id: "2-1", name: "평상 1", top: "40%", left: "45%", width: "6%", height: "6%", capacity: 6, isBooked: false },
        { id: "2-2", name: "평상 2", top: "65%", left: "55%", width: "6%", height: "6%", capacity: 4, isBooked: false }
      ]
    },
    "삼계리 3구역": {
      image_url: "./images/samgyeri/samgyeri_part3.png",
      decks: [
        { id: "3-1", name: "평상 1", top: "30%", left: "50%", width: "6%", height: "6%", capacity: 8, isBooked: true },
        { id: "3-2", name: "평상 2", top: "55%", left: "60%", width: "6%", height: "6%", capacity: 4, isBooked: false }
      ]
    },
    "삼계리 4구역": {
      image_url: "./images/samgyeri/samgyeri_part4.png",
      decks: [
        { id: "4-1", name: "평상 1", top: "40%", left: "40%", width: "6%", height: "6%", capacity: 4, isBooked: false },
        { id: "4-2", name: "평상 2", top: "65%", left: "65%", width: "6%", height: "6%", capacity: 6, isBooked: false }
      ]
    },
    "삼계리 5구역": {
      image_url: "./images/samgyeri/samgyeri_part5.png",
      decks: [
        { id: "5-1", name: "평상 1", top: "50%", left: "50%", width: "6%", height: "6%", capacity: 6, isBooked: false }
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
    btn.className = `absolute rounded-full border-2 
      ${deck.isBooked ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-400 hover:bg-green-500'}`;
    btn.style.top = deck.top;
    btn.style.left = deck.left;
    btn.style.width = deck.width;
    btn.style.height = deck.height;
    btn.style.transform = 'translate(-50%, -50%)';
    btn.title = `${deck.name} (${deck.capacity}인)`;

    if (!deck.isBooked) {
      btn.addEventListener('click', () => {
        // 이전 선택 해제
        if (selectedBtn) selectedBtn.classList.remove('ring-4', 'ring-blue-500');
        // 현재 선택 강조
        btn.classList.add('ring-4', 'ring-blue-500');
        selectedBtn = btn;

        localStorage.setItem('selectedDeck', JSON.stringify(deck));
        payBtn.disabled = false;
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
    window.location.href = 'booking-check.html';
  });
});
