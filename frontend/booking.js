document.addEventListener('DOMContentLoaded', () => {
    const nextBtn = document.getElementById('next-step-btn');
    const hiddenDateInput = document.getElementById('date-input');

    let bookingSelection = {
        date: null
    };

    const today = new Date();
    const twoWeeksLater = new Date();
    twoWeeksLater.setDate(today.getDate() + 14);

    flatpickr("#calendar-area", {
        inline: true,
        dateFormat: "Y-m-d",
        minDate: "today",
        maxDate: twoWeeksLater,
        locale: 'ko',
        onReady: (selectedDates, dateStr, instance) => {
            nextBtn.disabled = true;
        },
        onChange: (selectedDates, dateStr, instance) => {
            if (dateStr) {
                hiddenDateInput.value = dateStr;
                bookingSelection.date = dateStr;
                nextBtn.disabled = false;
            } else {
                bookingSelection.date = null;
                nextBtn.disabled = true;
            }
        }
    });

    if (nextBtn) {
        nextBtn.onclick = () => {
            if (bookingSelection.date) {
                // 수정: localStorage에 날짜를 저장하고 페이지를 이동합니다.
                localStorage.setItem('selectedDate', bookingSelection.date);
                window.location.href = 'booking-step2.html'; // URL 파라미터 제거
            } else {
                alert('날짜를 먼저 선택해주세요.');
            }
        };
    }
});
