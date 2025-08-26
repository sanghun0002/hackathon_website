document.addEventListener('DOMContentLoaded', () => {
    // === Sample data for decks based on selected section ===
    // This is hardcoded data. In a real-world app, this would be fetched from a server.
    const deckData = {
        "제1곡 봉비암": [
            { id: "1-1", number: 1, capacity: 4, isBooked: false },
            { id: "1-2", number: 2, capacity: 4, isBooked: true },
            { id: "1-3", number: 3, capacity: 6, isBooked: false },
            { id: "1-4", number: 4, capacity: 8, isBooked: false },
            { id: "1-5", number: 5, capacity: 4, isBooked: true }
        ],
        "제2곡 한강대": [
            { id: "2-1", number: 1, capacity: 6, isBooked: false },
            { id: "2-2", number: 2, capacity: 4, isBooked: false }
        ],
        "제3곡 무학정": [
            { id: "3-1", number: 1, capacity: 8, isBooked: true },
            { id: "3-2", number: 2, capacity: 4, isBooked: false }
        ],
        "제4곡 임압": [
            { id: "4-1", number: 1, capacity: 4, isBooked: false },
            { id: "4-2", number: 2, capacity: 6, isBooked: false }
        ],
        "제5곡 사인암": [
            { id: "5-1", number: 1, capacity: 6, isBooked: false }
        ],
        "제6곡 옥류동": [
            { id: "6-1", number: 1, capacity: 4, isBooked: false },
            { id: "6-2", number: 2, capacity: 4, isBooked: false },
            { id: "6-3", number: 3, capacity: 8, isBooked: false }
        ]
        // Add data for other sections as needed.
    };

    // --- Retrieve data from localStorage ---
    const selectedDate = localStorage.getItem('selectedDate');
    const selectedRegion = localStorage.getItem('selectedRegion');
    const selectedValley = localStorage.getItem('selectedValley');
    const selectedSection = localStorage.getItem('selectedSection');

    // --- Get DOM elements ---
    const bookingInfoDisplay = document.getElementById('booking-info-display');
    const deckListContainer = document.getElementById('deck-list-container');
    const nextStepBtn = document.getElementById('next-step-btn');
    const loadingMessage = document.getElementById('loading-message');

    // --- State variables ---
    let selectedDeck = null; // Stores the currently selected deck

    // --- Validation: Check if necessary data exists ---
    if (!selectedSection) {
        alert('유효한 구역 정보가 없습니다. 이전 단계로 돌아갑니다.');
        window.location.href = 'booking-step3.html';
        return;
    }

    // --- Display booking information to the user ---
    bookingInfoDisplay.textContent = `${selectedValley} > ${selectedSection}`;

    // --- Generate deck list dynamically ---
    const decks = deckData[selectedSection];

    if (decks && decks.length > 0) {
        // Remove loading message
        if (loadingMessage) {
            loadingMessage.remove();
        }

        decks.forEach(deck => {
            const deckCard = document.createElement('div');
            deckCard.className = `p-4 rounded-lg shadow-md flex flex-col items-center cursor-pointer transform transition-transform hover:scale-105 ${deck.isBooked ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-blue-50 text-blue-900 deck-card'}`;
            
            deckCard.innerHTML = `
                <div class="text-2xl font-bold mb-2">평상 ${deck.number}</div>
                <div class="text-sm">수용인원: ${deck.capacity}인</div>
                ${deck.isBooked ? '<div class="mt-2 text-sm font-bold text-red-600">예약 완료</div>' : '<div class="mt-2 text-sm font-bold text-green-600">예약 가능</div>'}
            `;

            // Add click event listener for available decks
            if (!deck.isBooked) {
                deckCard.addEventListener('click', () => {
                    // Deselect previous card
                    if (selectedDeck) {
                        selectedDeck.classList.remove('selected');
                    }

                    // Select current card
                    deckCard.classList.add('selected');
                    selectedDeck = deckCard;

                    // Store selected deck info and enable next button
                    localStorage.setItem('selectedDeck', JSON.stringify(deck));
                    nextStepBtn.disabled = false;
                });
            }

            deckListContainer.appendChild(deckCard);
        });
    } else {
        if (loadingMessage) {
            loadingMessage.textContent = '선택된 구역에 평상이 없습니다.';
        }
    }

    // --- Event listener for the "Next" button ---
    nextStepBtn.addEventListener('click', () => {
        if (selectedDeck) {
            // Already handled in the deckCard click event, this is a fallback.
            // The localStorage is set, so just redirect.
            window.location.href = 'booking-check.html';
        } else {
            alert('평상을 먼저 선택해주세요.');
        }
    });

    // --- Handle back button from browser ---
    window.addEventListener('popstate', () => {
        if (nextStepBtn) {
            nextStepBtn.disabled = true;
        }
    });

});
