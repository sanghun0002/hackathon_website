document.addEventListener('DOMContentLoaded', () => {
  const deckData = {
    "삼계리 1구역": {
      image_url: "./images/samgyeri/samgyeri_part1.png",
      decks: [
        { id: "1-1", number: 1, capacity: 4, isBooked: false },
        { id: "1-2", number: 2, capacity: 4, isBooked: true },
        { id: "1-3", number: 3, capacity: 6, isBooked: false },
      ]
    },
    "삼계리 2구역": {
      image_url: "./images/samgyeri/samgyeri_part2.png",
      decks: [
        { id: "2-1", number: 1, capacity: 6, isBooked: false },
        { id: "2-2", number: 2, capacity: 4, isBooked: false }
      ]
    },
    "삼계리 3구역": {
      image_url: "./images/samgyeri/samgyeri_part3.png",
      decks: [
        { id: "3-1", number: 1, capacity: 8, isBooked: true },
        { id: "3-2", number: 2, capacity: 4, isBooked: false }
      ]
    },
    "삼계리 4구역": {
      image_url: "./images/samgyeri/samgyeri_part4.png",
      decks: [
        { id: "4-1", number: 1, capacity: 4, isBooked: false },
        { id: "4-2", number: 2, capacity: 6, isBooked: false }
      ]
    },
    "삼계리 5구역": {
      image_url: "./images/samgyeri/samgyeri_part5.png",
      decks: [
        { id: "5-1", number: 1, capacity: 6, isBooked: false }
      ]
    },
    "제6곡 옥류동": {
      image_url: "./images/okryudong.jpg",
      decks: [
        { id: "6-1", number: 1, capacity: 4, isBooked: false },
        { id: "6-2", number: 2, capacity: 4, isBooked: false },
        { id: "6-3", number: 3, capacity: 8, isBooked: false }
      ]
    }
  };

  // --- localStorage에서 가져오기 ---
  const selectedValley  = localStorage.getItem('selectedValley');
  const selectedSection = localStorage.getItem('selectedSection');

  // --- DOM ---
  const bookingInfoDisplay = document.getElementById('booking-info-display');
  const deckListContainer  = document.getElementById('deck-list-container');
  const loadingMessage     = document.getElementById('loading-message');
  const deckSectionImage   = document.getElementById('deck-section-image');
  const payBtn             = document.getElementById('payment-btn');  // ← 버튼 id 맞춤

  // --- 유효성 검사 ---
  if (!selectedSection) {
    alert('유효한 구역 정보가 없습니다. 이전 단계로 돌아갑니다.');
    window.location.href = 'booking-step3.html';
    return;
  }

  bookingInfoDisplay.textContent = `${selectedValley} > ${selectedSection}`;

  const sectionData = deckData[selectedSection];
  if (!sectionData) {
    if (loadingMessage) loadingMessage.textContent = '선택된 구역의 정보를 찾을 수 없습니다.';
    console.error('deckData에 해당 섹션 키가 없음:', selectedSection);
    return;
  }

  // --- 이미지 로드 ---
  deckSectionImage.alt = `${selectedSection} 안내 이미지`;
  deckSectionImage.src = sectionData.image_url; // 경로가 맞는지 확인(./images/... 권장)

  deckSectionImage.onerror = () => {
    console.error('구역 이미지 로드 실패:', sectionData.image_url);
    // UI 메시지
    const fal = document.createElement('div');
    fal.className = 'text-center text-red-600 font-medium my-2';
    fal.textContent = '구역 이미지를 불러오지 못했습니다.';
    deckSectionImage.replaceWith(fal);
  };

  // --- 평상 카드 생성 ---
  let selectedDeckCard = null;

  function enablePayButton(deck) {
    localStorage.setItem('selectedDeck', JSON.stringify(deck));
    payBtn.disabled = false;
  }

  function renderDecks() {
    const decks = sectionData.decks || [];
    if (loadingMessage) loadingMessage.remove();

    if (!decks.length) {
      const p = document.createElement('p');
      p.className = 'col-span-full text-center text-gray-500';
      p.textContent = '선택된 구역에 평상이 없습니다.';
      deckListContainer.appendChild(p);
      return;
    }

    decks.forEach(deck => {
      const card = document.createElement('div');
      card.className =
        `p-4 rounded-lg shadow-md flex flex-col items-center transform transition-transform
         ${deck.isBooked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-50 text-blue-900 deck-card cursor-pointer hover:scale-105'}`;

      card.innerHTML = `
        <div class="text-2xl font-bold mb-2">평상 ${deck.number}</div>
        <div class="text-sm">수용인원: ${deck.capacity}인</div>
        ${deck.isBooked
          ? '<div class="mt-2 text-sm font-bold text-red-600">예약 완료</div>'
          : '<div class="mt-2 text-sm font-bold text-green-600">예약 가능</div>'}
      `;

      if (!deck.isBooked) {
        card.addEventListener('click', () => {
          if (selectedDeckCard) selectedDeckCard.classList.remove('selected');
          card.classList.add('selected');
          selectedDeckCard = card;
          enablePayButton(deck);
        });
      }

      deckListContainer.appendChild(card);
    });
  }

  renderDecks();

  // --- 결제 버튼 → 다음 페이지 이동 ---
  payBtn.addEventListener('click', () => {
    if (!selectedDeckCard) {
      alert('평상을 먼저 선택해주세요.');
      return;
    }
    window.location.href = 'booking-check.html';
  });

  // 브라우저 뒤로가기 시 버튼 로직
  window.addEventListener('popstate', () => {
    payBtn.disabled = true;
  });
});