document.addEventListener('DOMContentLoaded', () => {
  const allValleyData = {
    "무흘 계곡": {
        image_url: "/images/map_muhuel.png",
        sections: [
            { name: "제1곡 봉비암", top: "72%", left: "74%", width: "5%", height: "5%" },
            { name: "제2곡 한강대", top: "65%", left: "72%", width: "5%", height: "5%" },
            { name: "제3곡 무학정", top: "18%", left: "45%", width: "5%", height: "5%" },
            { name: "제4곡 임압",   top: "90%", left: "83%", width: "5%", height: "5%" },
            { name: "제5곡 사인암", top: "36%", left: "28%", width: "5%", height: "5%" },
            { name: "제6곡 옥류동", top: "42%", left: "20%", width: "5%", height: "5%" }
        ]
    },
    "삼계리 계곡": {
      image_url: "/images/map_samgyeri.png",
      sections: [
            { name: "삼계리 1구역", top: "86%", left: "85%", width: "5%", height: "5%" },
            { name: "삼계리 2구역", top: "70%", left: "80%", width: "5%", height: "5%" },
            { name: "삼계리 3구역", top: "33%", left: "50%", width: "5%", height: "5%" },
            { name: "삼계리 4구역", top: "20%", left: "36%", width: "5%", height: "5%" },
            { name: "삼계리 5구역", top: "21%", left: "20%", width: "5%", height: "5%" }
      ]
    }
  };

  // [수정] localStorage 대신 URL 파라미터에서 정보를 읽어옵니다.
  const urlParams = new URLSearchParams(window.location.search);
  const selectedDate = urlParams.get('date');
  let selectedValley = urlParams.get('valley');

  const displayElement = document.getElementById('selected-valley-display');
  const mapContainer = document.getElementById('image-map-container');
  const nextBtn = document.getElementById('next-step-btn');
  const loadingMsg = document.getElementById('loading-message');

  // [수정] 이전 페이지로 돌아갈 때도 URL 파라미터를 유지합니다.
  const prevBtn = document.querySelector('a[href="booking-step2.html"]');
  if (prevBtn) {
      prevBtn.href = `booking-step2.html?date=${selectedDate}`;
  }

  // 필수 정보가 없으면 첫 단계로 돌려보냅니다.
  if (!selectedDate || !selectedValley) {
    alert('필수 정보가 없습니다. 첫 단계부터 다시 시도해주세요.');
    window.location.href = 'booking.html';
    return;
  }

  // 보정(공백 차이 등)
  if (!allValleyData[selectedValley]) {
    const key = Object.keys(allValleyData).find(
      k => k.replace(/\s/g, '') === (selectedValley || '').replace(/\s/g, '')
    );
    if (key) selectedValley = key;
  }
  if (!selectedValley || !allValleyData[selectedValley]) {
    alert('이전 단계에서 유효한 계곡을 선택해주세요.');
    window.location.href = `booking-step2.html?date=${selectedDate}`;
    return;
  }

  const valley = allValleyData[selectedValley];
  displayElement.textContent = selectedValley;

  let selectedSectionName = null;
  let prevSelectedBtn = null;

  nextBtn.addEventListener('click', () => {
    if (!selectedSectionName) {
      alert('구역을 먼저 선택해주세요.');
      return;
    }
    // [수정] URL 파라미터에 모든 정보를 담아 다음 페이지로 이동합니다.
    const nextUrl = `booking-step4.html?date=${selectedDate}&valley=${encodeURIComponent(selectedValley)}&section=${encodeURIComponent(selectedSectionName)}`;
    window.location.href = nextUrl;
  });

  const img = new Image();
  img.id = 'valley-map-image';
  img.alt = `${selectedValley} 구역 지도`;
  img.src = valley.image_url;
  img.className = 'block max-w-full h-auto select-none';

  img.onload = () => {
    if (loadingMsg) loadingMsg.remove();

    valley.sections.forEach(section => {
      const area = document.createElement('button');
      area.type = 'button';
      area.className = 'section-clickable-area';
      area.setAttribute('aria-label', section.name);
      area.title = section.name;

      area.style.position = 'absolute';
      area.style.top = section.top;
      area.style.left = section.left;
      area.style.width = section.width;
      area.style.height = section.height;
      area.style.transform = 'translate(-50%, -50%)';
      area.style.zIndex = '10';

      area.addEventListener('click', () => {
        if (prevSelectedBtn) {
          prevSelectedBtn.classList.remove('selected');
          prevSelectedBtn.setAttribute('aria-pressed', 'false');
        }
        area.classList.add('selected');
        area.setAttribute('aria-pressed', 'true');
        prevSelectedBtn = area;

        selectedSectionName = section.name;
        nextBtn.disabled = false;
      });

      mapContainer.appendChild(area);
    });
  };

  img.onerror = () => {
    if (loadingMsg) {
      loadingMsg.textContent = '지도를 불러오지 못했습니다. 이미지 경로를 확인해주세요.';
      loadingMsg.classList.add('text-red-600', 'font-medium');
    } else {
      alert('지도를 불러오지 못했습니다. 이미지 경로를 확인해주세요.');
    }
  };

  mapContainer.appendChild(img);
});
