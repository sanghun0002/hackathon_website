document.addEventListener('DOMContentLoaded', () => {
  const allValleyData = {
    "무흘 계곡": {
        image_url: "/images/map_muhuel.png",
        sections: [
            // 아래 좌표들은 이미지의 중심을 기준으로 한 정확한 비율 값입니다.
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
            { name: "삼계리 1구역", top: "86%", left: "83%", width: "5%", height: "5%" },
            { name: "삼계리 2구역", top: "70%", left: "80%", width: "5%", height: "5%" },
            { name: "삼계리 3구역", top: "35%", left: "48%", width: "5%", height: "5%" },
            { name: "삼계리 4구역", top: "30%", left: "35%", width: "5%", height: "5%" },
            { name: "삼계리 5구역", top: "30%", left: "17%", width: "5%", height: "5%" }
      ]
    }
  };

  let selectedValley = localStorage.getItem('selectedValley');
  const displayElement = document.getElementById('selected-valley-display');
  const mapContainer = document.getElementById('image-map-container');
  const nextBtn = document.getElementById('next-step-btn');
  const loadingMsg = document.getElementById('loading-message');

  if (!allValleyData[selectedValley]) {
    const key = Object.keys(allValleyData).find(
      k => k.replace(/\s/g, '') === (selectedValley || '').replace(/\s/g, '')
    );
    if (key) selectedValley = key;
  }

  if (!selectedValley || !allValleyData[selectedValley]) {
    alert('이전 단계에서 유효한 계곡을 선택해주세요.');
    window.location.href = 'booking-step2.html';
    return;
  }

  const valley = allValleyData[selectedValley];
  displayElement.textContent = selectedValley;

  const img = new Image();
  img.id = 'valley-map-image';
  img.alt = `${selectedValley} 구역 지도`;
  img.src = valley.image_url;
  img.className = 'block max-w-full h-auto select-none';

  // 2) 이미지 로드 성공 시
  img.onload = () => {
    // 로딩 메시지 제거 (있을 때만)
    if (loadingMsg) loadingMsg.remove();

    // 클릭 영역 생성
    valley.sections.forEach(section => {
      // 접근성과 포커스를 위해 button 사용 권장
      const area = document.createElement('button');
      area.type = 'button';
      area.className = 'section-clickable-area';
      area.setAttribute('aria-label', section.name);
      area.title = section.name;

      // 위치/크기
      area.style.position = 'absolute';
      area.style.top = section.top;
      area.style.left = section.left;
      area.style.width = section.width;
      area.style.height = section.height;

      // (선택) 좌표를 중심 기준으로 쓸 경우 주석 해제
      area.style.transform = 'translate(-50%, -50%)';

      // 항상 이미지 위로
      area.style.zIndex = '10';

      // 클릭 핸들러
      area.addEventListener('click', () => {
        localStorage.setItem('selectedSection', section.name);

        // 즉시 이동 패턴
        window.location.href = 'booking-step4.html';

        // 버튼 패턴을 쓸 경우:
        // if (nextBtn) nextBtn.disabled = false;
      });

      mapContainer.appendChild(area);
    });
  };

  // 3) 이미지 로드 실패 시
  img.onerror = () => {
    if (loadingMsg) {
      loadingMsg.textContent = '지도를 불러오지 못했습니다. 이미지 경로를 확인해주세요.';
      loadingMsg.classList.add('text-red-600', 'font-medium');
    } else {
      alert('지도를 불러오지 못했습니다. 이미지 경로를 확인해주세요.');
    }
  };

  // 컨테이너는 이미 HTML에서 relative, 이미지만 붙이면 됨
  mapContainer.appendChild(img);
});
