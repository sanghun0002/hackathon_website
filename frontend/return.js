document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const preview = document.getElementById('preview');
    const uploadButton = document.getElementById('uploadButton');
    const resultDiv = document.getElementById('result');

    const backendUrl = 'https://image-analyzer-wduj.onrender.com/predict';

    // --- 이미지 리사이징 함수 (새로 추가) ---
    // 이 함수는 사진 파일의 크기를 줄여주는 역할을 합니다.
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
                        if (width > maxWidth) {
                            height *= maxWidth / width;
                            width = maxWidth;
                        }
                    } else {
                        if (height > maxHeight) {
                            width *= maxHeight / height;
                            height = maxHeight;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    canvas.toBlob((blob) => {
                        resolve(new File([blob], file.name, {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        }));
                    }, 'image/jpeg', quality);
                };
                img.onerror = reject;
            };
            reader.onerror = reject;
        });
    }

    // 사진을 선택(촬영)하면 미리보기를 보여주는 기능
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

    // '인증하기' 버튼 클릭 이벤트 처리
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
                // --- 핵심 변경 부분 ---
                // 원본 파일을 보내기 전에 이미지 크기를 줄입니다. (가로/세로 최대 800px, 품질 80%)
                const resizedFile = await resizeImage(originalFile, 800, 800, 0.8);
                console.log(`Original size: ${(originalFile.size / 1024 / 1024).toFixed(2)} MB`);
                console.log(`Resized size: ${(resizedFile.size / 1024).toFixed(2)} KB`);

                const formData = new FormData();
                // 원본 파일 대신 리사이징된 파일로 FormData 생성
                formData.append('file', resizedFile);

                const response = await fetch(backendUrl, {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error(`서버 응답 오류: ${response.status}`);
                }

                const data = await response.json();

                switch (data.status) {
                    case 'CLEAN':
                        resultDiv.textContent = '✅ 반납 되었습니다. 이용해 주셔서 감사합니다.';
                        break;
                    case 'DIRTY':
                        resultDiv.textContent = '❌ 다시 청소한 후 인증 부탁드립니다.';
                        break;
                    case 'NO_PYEONGSANG':
                        resultDiv.textContent = '⚠️ 평상이 인식되지 않습니다. 평상이 보이도록 다시 촬영해주세요.';
                        break;
                    default:
                        resultDiv.textContent = '알 수 없는 오류가 발생했습니다.';
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
