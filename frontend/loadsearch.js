// 계곡 데이터를 객체 형태로 관리합니다. (사용자 요청에 따라 최신 정보로 업데이트)
const valleyData = {
    "서울특별시": [],
    "인천광역시": [],
    "경기도": [],
    "강원도": [],
    "충청북도": [],
    "충청남도": [],
    "전라북도": [],
    "전라남도": [],
    "경상북도": [
        {
            name: "무흘계곡",
            locations: [
                { section: "제 1곡 봉비암", address: "경북 성주군 수륜면 신정2길" },
                { section: "제 2곡 한강대", address: "경북 성주군 수륜면 수성3길 65" },
                { section: "제 3곡 무학정", address: "경북 성주군 금수강산면 성주로 684" },
                { section: "제 4곡 입암", address: "경상북도 성주군 수륜면 수륜3길 26-18" },
                { section: "제 5곡 사인암", address: "경상북도 성주군 금수강산면 성주로 11" },
                { section: "제 6곡 옥류동", address: "경북 김천시 증산면 증산로 1039" }
            ]
        },
        {
            name: "삼계리계곡",
            locations: [
                { section: "구역 1", address: "경북 청도군 운문면 운문로 1033-14" },
                { section: "구역 2", address: "경북 청도군 운문면 신원4길 18" },
                { section: "구역 3", address: "경상북도 청도군 운문면 운문로 1328-7" },
                { section: "구역 4", address: "경북 청도군 운문면 운문로 1430-8" },
                { section: "구역 5", address: "경상북도 청도군 운문면 운문로 1504-14" }
            ]
        }
    ],
    "경상남도": [],
    "제주특별자치도": []
};

// HTML 문서의 요소(element)들을 가져옵니다.
const provinceSelect = document.getElementById('province-select');
const valleySelect = document.getElementById('valley-select');
const searchBtn = document.getElementById('search-btn');
const resultsContainer = document.getElementById('results-container');

// 1. 페이지가 로드될 때 '도/특별시' 드롭다운 메뉴를 채우는 기능
document.addEventListener('DOMContentLoaded', () => {
    // valleyData 객체의 키(key)들을 가져와서(예: "서울특별시", "경상북도") 드롭다운 옵션으로 추가
    const provinces = Object.keys(valleyData);
    provinces.forEach(province => {
        const option = document.createElement('option');
        option.value = province;
        option.textContent = province;
        provinceSelect.appendChild(option);
    });
});

// 2. '도/특별시' 선택이 변경되었을 때 '계곡' 드롭다운 메뉴를 업데이트하는 기능
provinceSelect.addEventListener('change', () => {
    // 이전에 있던 계곡 목록을 초기화합니다.
    valleySelect.innerHTML = '<option value="">-- 계곡 선택 --</option>';

    const selectedProvince = provinceSelect.value;
    if (selectedProvince) {
        const valleys = valleyData[selectedProvince];

        // 선택한 '도/특별시'에 계곡 정보가 있는지 확인
        if (valleys.length > 0) {
            valleySelect.disabled = false;
            valleys.forEach(valley => {
                const option = document.createElement('option');
                option.value = valley.name;
                option.textContent = valley.name;
                valleySelect.appendChild(option);
            });
        } else {
            // 계곡 정보가 없으면 드롭다운을 비활성화하고 안내 문구 표시
            valleySelect.innerHTML = '<option value="">계곡 정보 없음</option>';
            valleySelect.disabled = true;
        }
    } else {
        // '도/특별시' 선택이 해제되면 계곡 드롭다운도 초기 상태로 변경
        valleySelect.disabled = true;
    }
});

// 3. '검색' 버튼을 클릭했을 때 결과를 표시하는 기능
searchBtn.addEventListener('click', () => {
    const selectedProvince = provinceSelect.value;
    const selectedValleyName = valleySelect.value;

    // '도/특별시'와 '계곡'이 모두 선택되었는지 확인
    if (!selectedProvince || !selectedValleyName) {
        alert('검색할 지역과 계곡을 모두 선택해주세요.');
        return; // 함수 실행 중단
    }

    // 결과 표시 영역을 초기화
    resultsContainer.innerHTML = '';

    // 선택된 계곡의 상세 정보(locations)를 찾습니다.
    const valley = valleyData[selectedProvince].find(v => v.name === selectedValleyName);

    if (valley && valley.locations.length > 0) {
        valley.locations.forEach(loc => {
            // 결과 항목을 담을 div 생성
            const resultItem = document.createElement('div');
            resultItem.className = 'result-item';

            // 주소를 URL 인코딩하여 카카오 지도 링크 생성
            const encodedAddress = encodeURIComponent(loc.address);
            const kakaoMapUrl = `https://map.kakao.com/link/search/${encodedAddress}`;

            // 결과 내용을 HTML로 구성 (계곡명 / 구역 / 주소 링크)
            resultItem.innerHTML = `
                <strong>${valley.name} / ${loc.section}</strong><br>
                주소: <a href="${kakaoMapUrl}" target="_blank">${loc.address}</a>
            `;

            // 완성된 결과 항목을 결과 표시 영역에 추가
            resultsContainer.appendChild(resultItem);
        });
    } else {
        resultsContainer.innerHTML = '<p>해당 계곡의 상세 정보가 없습니다.</p>';
    }
});
