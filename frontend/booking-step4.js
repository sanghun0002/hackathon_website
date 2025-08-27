// async 키워드를 추가하여, 서버와 통신하는 비동기 코드를 깔끔하게 처리합니다.
document.addEventListener('DOMContentLoaded', async () => {
  // --- 좌표 기반 deckData 정의 (isBooked 속성은 이제 사용하지 않으므로 제거) ---
  const deckData = {
    "삼계리 1구역": {
      image_url: "./images/samgyeri/samgyeri_part1.png",
      decks: [
        { id: "samgyeri1-1", name: "평상 1", top: "60%", left: "43%", width: "6%", height: "6%", capacity: 4 },
        { id: "samgyeri1-2", name: "평상 2", top: "64.5%", left: "54%", width: "6%", height: "6%", capacity: 4 },
        { id: "samgyeri1-3", name: "평상 3", top: "64%", left: "66%", width: "6%", height: "6%", capacity: 6 }
      ]
    },
    "삼계리 2구역": {
      image_url: "./images/samgyeri/samgyeri_part2.png",
      decks: [
        { id: "samgyeri2-1", name: "평상 1", top: "40%", left: "16%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri2-2", name: "평상 2", top: "37%", left: "25%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri2-3", name: "평상 3", top: "38%", left: "31.5%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri2-4", name: "평상 4", top: "42%", left: "38.5%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri2-5", name: "평상 5", top: "46%", left: "46.5%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri2-6", name: "평상 6", top: "49%", left: "53%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri2-7", name: "평상 7", top: "52%", left: "59.5%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri2-8", name: "평상 8", top: "55.5%", left: "65%", width: "6%", height: "6%", capacity: 4 }
      ]
    },
    "삼계리 3구역": {
      image_url: "./images/samgyeri/samgyeri_part3.png",
      decks: [
        { id: "samgyeri3-1", name: "평상 1", top: "48.5%", left: "28%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri3-2", name: "평상 2", top: "50%", left: "37.2%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri3-3", name: "평상 3", top: "53%", left: "46.5%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri3-4", name: "평상 4", top: "56.5%", left: "53.5%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri3-5", name: "평상 5", top: "60%", left: "62%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri3-6", name: "평상 6", top: "65.5%", left: "70%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri3-7", name: "평상 7", top: "68%", left: "77.5%", width: "6%", height: "6%", capacity: 6 }
      ]
    },
    "삼계리 4구역": {
      image_url: "./images/samgyeri/samgyeri_part4.png",
      decks: [
        { id: "samgyeri4-1", name: "평상 1", top: "59.5%", left: "39.5%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri4-2", name: "평상 2", top: "52%", left: "53%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri4-3", name: "평상 3", top: "51.5%", left: "67%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri4-4", name: "평상 4", top: "44.5%", left: "77%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri4-5", name: "평상 5", top: "39%", left: "88%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri4-6", name: "평상 6", top: "76%", left: "23%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri4-7", name: "평상 7", top: "93%", left: "36%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri4-8", name: "평상 8", top: "70.5%", left: "51.5%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri4-9", name: "평상 9", top: "83.5%", left: "67%", width: "6%", height: "6%", capacity: 6 }
      ]
    },
    "삼계리 5구역": {
      image_url: "./images/samgyeri/samgyeri_part5.png",
      decks: [
        { id: "samgyeri5-1", name: "평상 1", top: "67.5%", left: "38%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri5-2", name: "평상 2", top: "60%", left: "50.5%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri5-3", name: "평상 3", top: "53%", left: "59.5%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri5-4", name: "평상 4", top: "47%", left: "69%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri5-5", name: "평상 5", top: "43.5%", left: "76%", width: "6%", height: "6%", capacity: 6 },
        { id: "samgyeri5-6", name: "평상 6", top: "36.5%", left: "85%", width: "6%", height: "6%", capacity: 6 }
      ]
    },
    "제1곡 봉비암": {
      image_url: "./images/muhuel/muhuel_1.png",
      decks: [
        { id: "muhuel1-1", name: "평상 1", top: "45%", left: "30.5%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel1-2", name: "평상 2", top: "40%", left: "42%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel1-3", name: "평상 3", top: "38.5%", left: "55%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel1-4", name: "평상 4", top: "37.5%", left: "66.5%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel1-5", name: "평상 5", top: "37%", left: "78.5%", width: "7%", height: "6%", capacity: 8 }
      ]
    },
    "제2곡 한강대": {
      image_url: "./images/muhuel/muhuel_2.png",
      decks: [
        { id: "muhuel2-1", name: "평상 1", top: "49%", left: "20%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel2-2", name: "평상 2", top: "47%", left: "31%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel2-3", name: "평상 3", top: "47.5%", left: "43%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel2-4", name: "평상 4", top: "46.5%", left: "53%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel2-5", name: "평상 5", top: "47%", left: "64.5%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel2-6", name: "평상 6", top: "50%", left: "76%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel2-7", name: "평상 7", top: "52.5%", left: "87%", width: "7%", height: "6%", capacity: 8 }
      ]
    },
    "제3곡 무학정": {
      image_url: "./images/muhuel/muhuel_3.png",
      decks: [
        { id: "muhuel3-1", name: "평상 1", top: "50%", left: "20%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel3-2", name: "평상 2", top: "51%", left: "33%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel3-3", name: "평상 3", top: "50%", left: "44%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel3-4", name: "평상 4", top: "50.5%", left: "56%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel3-5", name: "평상 5", top: "51.5%", left: "68.5%", width: "7%", height: "6%", capacity: 8 },
        { id: "muhuel3-6", name: "평상 6", top: "51.5%", left: "81%", width: "7%", height: "6%", capacity: 8 }
      ]
    },
    "제4곡 임압": {
      image_url: "./images/muhuel/muhuel_4.png",
      decks: [
        { id: "muhuel4-1", name: "평상 1", top: "45%", left: "29.5%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel4-2", name: "평상 2", top: "46%", left: "40%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel4-3", name: "평상 3", top: "44.2%", left: "49.5%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel4-4", name: "평상 4", top: "43.5%", left: "59.8%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel4-5", name: "평상 5", top: "45.6%", left: "70.8%", width: "7%", height: "6%", capacity: 4 }
      ]
    },
    "제5곡 사인암": {
      image_url: "./images/muhuel/muhuel_5.png",
      decks: [
        { id: "muhuel5-1", name: "평상 1", top: "58%", left: "25%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel5-2", name: "평상 2", top: "50%", left: "35.5%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel5-3", name: "평상 3", top: "45%", left: "45.2%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel5-4", name: "평상 4", top: "48%", left: "57.8%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel5-5", name: "평상 5", top: "48%", left: "69.2%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel5-6", name: "평상 6", top: "54.2%", left: "81%", width: "7%", height: "6%", capacity: 4 }
      ]
    },
    "제6곡 옥류동": {
      image_url: "./images/muhuel/muhuel_6.png",
      decks: [
        { id: "muhuel6-1", name: "평상 1", top: "39.5%", left: "24%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel6-2", name: "평상 2", top: "39.8%", left: "36%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel6-3", name: "평상 3", top: "38.4%", left: "46%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel6-4", name: "평상 4", top: "37.8%", left: "59.2%", width: "7%", height: "6%", capacity: 4 },
        { id: "muhuel6-5", name: "평상 5", top: "37.7%", left: "71.5%", width: "7%", height: "6%", capacity: 4 }
      ]
    }
  };

  // --- localStorage에서 정보 가져오기 ---
  const selectedDate = localStorage.getItem('selectedDate');
  const selectedValley  = localStorage.getItem('selectedValley');
  const selectedSection = localStorage.getItem('selectedSection');

  // --- DOM elements ---
  const bookingInfoDisplay = document.getElementById('booking-info-display');
  const deckSectionImage   = document.getElementById('deck-section-image');
  const payBtn             = document.getElementById('payment-btn');

  if (!selectedDate || !selectedSection) {
    alert('유효한 날짜 또는 구역 정보가 없습니다. 처음 단계부터 다시 시도해주세요.');
    window.location.href = 'booking.html';
    return;
  }

  bookingInfoDisplay.textContent = `[${selectedDate}] ${selectedValley} > ${selectedSection}`;

  const sectionData = deckData[selectedSection];
  if (!sectionData) {
    alert('선택된 구역의 정보를 찾을 수 없습니다.');
    return;
  }

  // 이미지 세팅
  deckSectionImage.src = sectionData.image_url;
  deckSectionImage.alt = `${selectedSection} 구역 이미지`;

  // ===============================================================
  // ===== [추가] 서버에서 실시간 예약 현황 가져오기 =====
  // ===============================================================
  let bookedDecksFromServer = [];
  try {
    const serverUrl = 'https://o70albxd7n.onrender.com';
    const response = await fetch(`${serverUrl}/api/bookings/status?date=${selectedDate}&section=${encodeURIComponent(selectedSection)}`);
    
    if (response.ok) {
      bookedDecksFromServer = await response.json();
      console.log(`[${selectedDate}] '${selectedSection}'의 예약된 평상 목록:`, bookedDecksFromServer);
    } else {
      console.error('서버에서 예약 현황을 불러오는 데 실패했습니다.');
    }
  } catch (error) {
    console.error('예약 현황 조회 중 네트워크 오류 발생:', error);
    alert('예약 현황을 불러오는 데 실패했습니다. 잠시 후 다시 시도해주세요.');
  }
  // ===============================================================

  // hotspot container 준비
  const hotspotContainer = document.createElement('div');
  hotspotContainer.style.position = 'absolute';
  hotspotContainer.style.top = '0';
  hotspotContainer.style.left = '0';
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

    // [수정] 서버에서 받은 bookedDecksFromServer 목록에 현재 평상이 포함되어 있는지 확인
    if (bookedDecksFromServer.includes(deck.name)) {
      // 예약 불가 스타일
      btn.classList.add('unavailable', 'bg-gray-400');
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
    window.location.href = 'booking-confirm.html';
  });
});
