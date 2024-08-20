import { port } from '../js/header.js';

document.addEventListener("DOMContentLoaded", function() {
    const textarea = document.getElementById('source-text');
    const maxChars = 5000;

    textarea.addEventListener('input', function() {
        // Giới hạn số ký tự
        if (this.value.length > maxChars) {
            this.value = this.value.substring(0, maxChars);
            showCustomAlert('You have reached the maximum number of characters allowed.');
        }

        // Reset height to auto to get the natural height
        this.style.height = 'auto';
        // Set height to scrollHeight to ensure it expands with content
        this.style.height = `${this.scrollHeight}px`;
    });

    // Thực hiện một lần khi trang được tải để đảm bảo chiều cao đúng ngay từ đầu
    textarea.dispatchEvent(new Event('input'));

    function showCustomAlert(message) {
        let alertBox = document.getElementById('custom-alert');
        if (!alertBox) {
            alertBox = document.createElement('div');
            alertBox.id = 'custom-alert';
            alertBox.className = 'custom-alert';
            document.body.appendChild(alertBox);
        }
        alertBox.textContent = message;
        alertBox.classList.add('show');
        setTimeout(() => {
            alertBox.classList.remove('show');
        }, 2000); // Thời gian hiển thị thông báo, ví dụ 2000ms (2 giây)
    }
});

document.addEventListener("DOMContentLoaded", function() {
    function setupCustomSelect(selectElement) {
        var selected = selectElement.querySelector('.select-selected');
        var items = selectElement.querySelector('.select-items');

        selected.addEventListener('click', function() {
            items.classList.toggle('select-hide');
        });

        var options = items.querySelectorAll('.select-option');
        options.forEach(function(option) {
            option.addEventListener('click', function() {
                var value = this.getAttribute('data-value');
                var text = this.innerText;

                selected.innerText = text;
                items.classList.add('select-hide');

                // Cập nhật giá trị của thẻ select gốc nếu cần
                var originalSelect = selectElement.querySelector('select');
                if (originalSelect) {
                    originalSelect.value = value;
                }
            });
        });
    }

    // Thiết lập dropdown cho tất cả các custom select
    var customSelects = document.querySelectorAll('.custom-select');
    customSelects.forEach(setupCustomSelect);

    // Đóng dropdown khi nhấp bên ngoài
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.custom-select')) {
            customSelects.forEach(function(select) {
                var items = select.querySelector('.select-items');
                items.classList.add('select-hide');
            });
        }
    });
});
//Xóa từ trong input, output
document.addEventListener('DOMContentLoaded', function() {
    function setupClearTextareaFeature() {
        const sourceText = document.getElementById('source-text');
        const translatedText = document.getElementById('translated-text');
        const clearTextareaButton = document.getElementById('clear-textarea');

        function toggleClearButton() {
            clearTextareaButton.style.display = sourceText.value ? 'block' : 'none';
        }

        function clearTextarea() {
            sourceText.value = '';
            translatedText.innerHTML = ''; // Xóa nội dung của translated-text
            toggleClearButton();
            document.getElementById('char-count').innerText = '0/5000';
            document.getElementById('source-copy-img').src = '../Image/no-copy-icon.png';
            document.getElementById('target-copy-img').src = '../Image/no-copy-icon.png';
            document.getElementById('source-audio-img').src = '../Image/no-voice-icon.png';
            document.getElementById('target-audio-img').src = '../Image/no-voice-icon.png';
            document.getElementById('source-audio').removeAttribute('src');
            document.getElementById('target-audio').removeAttribute('src');
            document.getElementById('source-audio').pause();
            document.getElementById('target-audio').pause();


            // Đặt lại chiều cao của các ô khi nội dung bị xóa
            sourceText.style.height = 'auto';
            translatedText.style.height = 'auto';
        }

        sourceText.addEventListener('input', toggleClearButton);
        clearTextareaButton.addEventListener('click', clearTextarea);

        // Gọi hàm này để đảm bảo nút clear có trạng thái chính xác khi trang được tải
        toggleClearButton();
    }

    // Gọi hàm khi trang đã tải xong
    setupClearTextareaFeature();
});

//Hoán đổi
document.addEventListener('DOMContentLoaded', function() {
    function setupSwapFeature() {
        const sourceText = document.getElementById('source-text');
        const translatedText = document.getElementById('translated-text');
        const arrowBidirectional = document.querySelector('.arrow-bidirectional');
        const sourceLanguage = document.getElementById('source');
        const targetLanguage = document.getElementById('target');
        const sourceAudioElement = document.getElementById('source-audio');
        const targetAudioElement = document.getElementById('target-audio');
        const sourceAudioImg = document.getElementById('source-audio-img');
        const targetAudioImg = document.getElementById('target-audio-img');

        function swapTextAndLanguages() {

            // Hoán đổi ngôn ngữ giữa sourceLanguage và targetLanguage
            const tempLanguage = sourceLanguage.innerText;
            sourceLanguage.innerText = targetLanguage.innerText;
            targetLanguage.innerText = tempLanguage;

            if (translatedText.innerHTML != "") {
                // Dừng âm thanh trước khi hoán đổi
                if (sourceAudioElement) {
                    sourceAudioElement.pause();
                    sourceAudioElement.currentTime = 0; // Đặt thời gian phát lại về đầu
                    sourceAudioImg.src = '../Image/voice-icon.png'; // Đặt lại biểu tượng âm thanh
                }
                if (targetAudioElement) {
                    targetAudioElement.pause();
                    targetAudioElement.currentTime = 0; // Đặt thời gian phát lại về đầu
                    targetAudioImg.src = '../Image/voice-icon.png'; // Đặt lại biểu tượng âm thanh
                }
                // Hoán đổi nội dung giữa sourceText và translatedText
                const tempText = sourceText.value;
                sourceText.value = translatedText.innerHTML;
                translatedText.innerHTML = tempText;

                // Hoán đổi âm thanh
                const tempAudio = sourceAudioElement.src;
                sourceAudioElement.src = targetAudioElement.src;
                targetAudioElement.src = tempAudio;

                // Đặt lại chiều cao của các ô sau khi hoán đổi
                // sourceText.style.height = 'auto';
                // translatedText.style.height = 'auto';
            }
        }

        if (arrowBidirectional) {
            arrowBidirectional.addEventListener('click', swapTextAndLanguages);
        } else {
            console.error('Element with class "arrow-bidirectional" not found.');
        }
    }

    // Gọi hàm khi trang đã tải xong
    setupSwapFeature();
});

let currentPlayingAudio = null;

export function toggleAudio(type) {
    let audioElement, imgElement;
    if (type === 'source') {
        audioElement = document.getElementById('source-audio');
        imgElement = document.getElementById('source-audio-img');
    } else if (type === 'target') {
        audioElement = document.getElementById('target-audio');
        imgElement = document.getElementById('target-audio-img');
    }

    if (audioElement) {
        if (audioElement.src && audioElement.src != null) {
            // Nếu có âm thanh đang phát và khác với âm thanh hiện tại
            if (currentPlayingAudio && currentPlayingAudio !== audioElement) {
                // Dừng âm thanh hiện tại
                currentPlayingAudio.pause();
                currentPlayingAudio.currentTime = 0;
                // Đổi lại hình ảnh nút của âm thanh đang phát trước đó
                document.getElementById(currentPlayingAudio.dataset.imgId).src = '../Image/voice-icon.png';
            }

            // Đổi trạng thái của âm thanh hiện tại
            if (audioElement.paused) {
                imgElement.src = '../Image/stop-icon.png';
                audioElement.play();
                currentPlayingAudio = audioElement;
            } else {
                imgElement.src = '../Image/voice-icon.png';
                audioElement.pause();
                audioElement.currentTime = 0;
                currentPlayingAudio = null;
            }

            audioElement.onended = function() {
                imgElement.src = '../Image/voice-icon.png';
                currentPlayingAudio = null;
            };

            // Gán id của imgElement vào dataset của audioElement
            audioElement.dataset.imgId = imgElement.id;
        } else {
            showCustomAlert('No audio available.');
        }
    } else {
        showCustomAlert('Audio element not found.');
    }
}

export function copyText(type) {
    let textToCopy;
    if (type === 'source') {
        textToCopy = document.getElementById('source-text').value;
    } else if (type === 'target') {
        textToCopy = document.getElementById('translated-text').innerText;
    }

    if (textToCopy == "") {
        showCustomAlert('Cannot be copied!');
    } else {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showCustomAlert('Copied to clipboard!');
            }).catch(err => {
                console.error('Failed to copy text: ', err);
            });
        } else {
            // Fallback for older browsers
            let textarea = document.createElement('textarea');
            textarea.value = textToCopy;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showCustomAlert('Copied to clipboard!');
        }
    }
}

document.addEventListener("DOMContentLoaded", function() {
    const textarea = document.getElementById('source-text');
    const charCount = document.getElementById('char-count');
    const maxChars = 5000;

    textarea.addEventListener('input', function() {
        // Giới hạn số ký tự
        if (this.value.length > maxChars) {
            this.value = this.value.substring(0, maxChars);
            showCustomAlert('You have reached the maximum number of characters allowed.');
        }

        // Cập nhật số ký tự
        charCount.textContent = `${this.value.length}/${maxChars}`;

        // Reset height to auto to get the natural height
        this.style.height = 'auto';
        // Set height to scrollHeight to ensure it expands with content
        this.style.height = `${this.scrollHeight}px`;

        document.getElementById('source-copy-img').src = '../Image/no-copy-icon.png';
        document.getElementById('target-copy-img').src = '../Image/no-copy-icon.png';
        document.getElementById('source-audio-img').src = '../Image/no-voice-icon.png';
        document.getElementById('target-audio-img').src = '../Image/no-voice-icon.png';
        document.getElementById('source-audio').removeAttribute('src');
        document.getElementById('target-audio').removeAttribute('src');
        document.getElementById('source-audio').pause();
        document.getElementById('target-audio').pause();
        document.getElementById('translated-text').innerHTML = "";
    });

    // Thực hiện một lần khi trang được tải để đảm bảo chiều cao đúng ngay từ đầu
    textarea.dispatchEvent(new Event('input'));
});

function showCustomAlert(message) {
    let alertBox = document.getElementById('custom-alert');
    if (!alertBox) {
        alertBox = document.createElement('div');
        alertBox.id = 'custom-alert';
        alertBox.className = 'custom-alert';
        document.body.appendChild(alertBox);
    }
    alertBox.textContent = message;
    alertBox.classList.add('show');
    setTimeout(() => {
        alertBox.classList.remove('show');
    }, 3000); // Thời gian hiển thị thông báo, ví dụ 2000ms (2 giây)
}

document.addEventListener("DOMContentLoaded", function() {
    const requestOptions = {
        method: "GET",
        redirect: "follow"
    };

    fetch(`http://localhost:${port}/api/v1/translate/language`, requestOptions)
        .then((response) => response.json())
        .then((languages) => {
            const sourceSelectItems = document.querySelector('.custom-select #source + .select-items');
            const targetSelectItems = document.querySelector('.custom-select #target + .select-items');
            const selectSelectedSource = document.querySelector('.custom-select #source');
            const selectSelectedTarget = document.querySelector('.custom-select #target');

            // Clear existing options
            sourceSelectItems.innerHTML = '';
            targetSelectItems.innerHTML = '';

            // Add new options
            languages.forEach(language => {
                const sourceOptionElement = document.createElement('div');
                const targetOptionElement = document.createElement('div');

                sourceOptionElement.classList.add('select-option');
                targetOptionElement.classList.add('select-option');

                sourceOptionElement.innerText = language.replace(/_/g, ' '); // Replace underscores with spaces
                targetOptionElement.innerText = language.replace(/_/g, ' ');

                sourceOptionElement.addEventListener('click', function() {
                    selectSelectedSource.innerText = sourceOptionElement.innerText;
                    sourceSelectItems.classList.add('select-hide');
                });

                targetOptionElement.addEventListener('click', function() {
                    selectSelectedTarget.innerText = targetOptionElement.innerText;
                    targetSelectItems.classList.add('select-hide');
                });

                sourceSelectItems.appendChild(sourceOptionElement);
                targetSelectItems.appendChild(targetOptionElement);
            });

            // Set default selected option
            selectSelectedSource.innerText = "Vietnamese";
            selectSelectedTarget.innerText = "English";
        })
        .catch((error) => console.error('Error fetching languages:', error));
});

document.querySelector('.arrow-container').addEventListener('click', function() {
    const inputText = document.getElementById('source-text').value;

    // Lấy phần tử đã được chọn
    const selectedSourceOption = document.querySelector('#source');
    const selectedTargetOption = document.querySelector('#target');

    // Lấy nội dung văn bản từ phần tử đã chọn
    const sourceLanguage = selectedSourceOption ? selectedSourceOption.innerText : '';
    const targetLanguage = selectedTargetOption ? selectedTargetOption.innerText : '';

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ "inputText": inputText });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    if (inputText == "") {
        showCustomAlert('Please enter translation!');
    } else {
        fetch(`http://localhost:${port}/api/v1/translate/${sourceLanguage}/${targetLanguage}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result.status === "NOT_FOUND") {
                    // Hiển thị thông báo lỗi nếu không tìm thấy bản dịch
                    // document.getElementById('translated-text').innerText = "Translation not available.";
                    showCustomAlert('Please enter word!');
                    console.log(result.message);
                } else {
                    // Hiển thị kết quả dịch nếu có
                    document.getElementById('translated-text').innerText = result.translatedText;

                    // Cập nhật hình ảnh biểu tượng copy
                    document.getElementById('source-copy-img').src = '../Image/copy-icon.png';
                    document.getElementById('target-copy-img').src = '../Image/copy-icon.png';

                    // Cập nhật nguồn âm thanh
                    updateAudioSources(result.inputVoice, result.translatedVoice);
                }
            })
            .catch(error => console.log('error', error));
    }
});

function updateAudioSources(inputVoice, translatedVoice) {
    const sourceAudioElement = document.getElementById('source-audio');
    const targetAudioElement = document.getElementById('target-audio');
    const imgSourceElement = document.getElementById('source-audio-img');
    const imgTargetElement = document.getElementById('target-audio-img');

    if (sourceAudioElement) {
        if (inputVoice != null) {
            sourceAudioElement.src = inputVoice;
            imgSourceElement.src = '../Image/voice-icon.png';
        } else {
            sourceAudioElement.removeAttribute('src');
            imgSourceElement.src = '../Image/no-voice-icon.png'
        }
    }

    if (targetAudioElement) {
        if (translatedVoice != null) {
            targetAudioElement.src = translatedVoice;
            imgTargetElement.src = '../Image/voice-icon.png';
        } else {
            targetAudioElement.removeAttribute('src');
            imgTargetElement.src = '../Image/no-voice-icon.png'
        }
    }
}