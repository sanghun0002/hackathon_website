document.addEventListener('DOMContentLoaded', () => {
    // (이전 답변에서 제공한 리사이징 기능이 포함된 return.js 전체 코드)
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const uploadButton = document.getElementById('uploadButton');
    const resultDiv = document.getElementById('result');

    const backendUrl = 'https://image-analyzer-wduj.onrender.com/predict';

    function resizeImage(file, maxWidth, maxHeight, quality) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target.result;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    let width = img.width;
                    let height = img.height;
                    if (width > height) {
                        if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
                    } else {
                        if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);
                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, { type: 'image/jpeg', lastModified: Date.now() }));
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }

    if (imageInput) {
        imageInput.addEventListener('change', (event) => {
            const file = event.target.files?.[0];
            if (file) {
                preview.src = URL.createObjectURL(file);
                uploadButton.disabled = false;
                resultDiv.textContent = '사진이 준비되었습니다. 인증 버튼을 눌러주세요.';
            }
        });
    }

    if (uploadButton) {
        uploadButton.disabled = true;
        uploadButton.addEventListener('click', async () => {
            const originalFile = imageInput.files?.[0];
            if (!originalFile) {
                alert('사진을 먼저 촬영해주세요!');
                return;
            }
            resultDiv.textContent = '🤖 사진 크기 최적화 및 분석 중...';
            uploadButton.disabled = true;
            try {
                const resizedFile = await resizeImage(originalFile, 800, 800, 0.8);
                const formData = new FormData();
                formData.append('file', resizedFile);
                const response = await fetch(backendUrl, { method: 'POST', body: formData });
                if (!response.ok) { throw new Error(`서버 응답 오류: ${response.status}`); }
                const data = await response.json();
                switch (data.status) {
                    case 'CLEAN': resultDiv.textContent = '✅ 반납 되었습니다. 이용해 주셔서 감사합니다.'; break;
                    case 'DIRTY': resultDiv.textContent = '❌ 다시 청소한 후 인증 부탁드립니다.'; break;
                    case 'NO_PYEONGSANG': resultDiv.textContent = '⚠️ 평상이 인식되지 않습니다. 평상이 보이도록 다시 촬영해주세요.'; break;
                    default: resultDiv.textContent = '알 수 없는 오류가 발생했습니다.';
                }
            } catch (error) {
                console.error('통신 오류:', error);
                resultDiv.textContent = '🔌 서버와 통신 중 오류가 발생했습니다. 서버가 켜져 있는지 확인해주세요.';
            } finally {
                uploadButton.disabled = false;
            }
        });
    }
});
