const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const urlInput = document.getElementById('urlInput');
const progressBar = document.querySelector('.progress-bar');
const progress = document.getElementById('progress');
const resultBox = document.getElementById('result');
const mediaPreview = document.getElementById('mediaPreview');
const shareLink = document.getElementById('shareLink');
const copyBtn = document.getElementById('copyBtn');

uploadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  const mediaUrl = urlInput.value.trim();
  const formData = new FormData();

  if (file) {
    formData.append('image', file);
  } else if (mediaUrl) {
    try {
      const response = await fetch(mediaUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Unable to fetch the provided URL.');
      const blob = await response.blob();
      const filename = mediaUrl.split('/').pop().split('?')[0] || 'media';
      formData.append('image', blob, filename);
    } catch (error) {
      alert('Error fetching media from URL. Make sure it’s a valid public link.');
      console.error(error);
      return;
    }
  } else {
    alert('Please select a file or enter a media URL.');
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';
  progressBar.style.display = 'block';
  progress.style.width = '0%';

  const xhr = new XMLHttpRequest();
  xhr.open('POST', '/upload'); // Backend endpoint

  xhr.upload.onprogress = (e) => {
    if (e.lengthComputable) {
      const percent = Math.round((e.loaded / e.total) * 100);
      progress.style.width = percent + '%';
    }
  };

  xhr.onload = () => {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload';
    progressBar.style.display = 'none';

    if (xhr.status === 200) {
      try {
        // Expecting JSON from backend
        const { url } = JSON.parse(xhr.responseText);
        if (url) {
          resultBox.classList.remove('hidden');
          shareLink.value = url;

          if (/\.(mp4|webm|mov|avi|mkv)$/i.test(url)) {
            mediaPreview.innerHTML = `<video src="${url}" controls></video>`;
          } else if (/\.(mp3|wav|ogg)$/i.test(url)) {
            mediaPreview.innerHTML = `<audio src="${url}" controls></audio>`;
          } else {
            mediaPreview.innerHTML = `<img src="${url}" alt="preview">`;
          }
        } else {
          alert('No URL returned from server.');
        }
      } catch (err) {
        alert('Unexpected response from server.');
        console.error(err);
      }
    } else {
      alert('Upload failed.');
    }
  };

  xhr.onerror = () => {
    alert('Network error while uploading.');
  };

  xhr.send(formData);
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(shareLink.value);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
});

/* --- Purple particle animation --- */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];
function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize();

for (let i = 0; i < 100; i++) {
  particles.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    size: Math.random() * 3 + 1,
    speed: Math.random() * 1 + 0.5,
    color: ['#9d4edd', '#6a0dad', '#4b0082'][Math.floor(Math.random() * 3)],
  });
}
function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = p.color;
    ctx.shadowColor = p.color;
    ctx.shadowBlur = 10;
    ctx.fill();
    p.y += p.speed;
    if (p.y > canvas.height) p.y = -10;
  });
  requestAnimationFrame(drawParticles);
}
drawParticles();
