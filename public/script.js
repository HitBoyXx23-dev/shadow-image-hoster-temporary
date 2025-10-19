const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const urlInput = document.getElementById('urlInput');
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
    const response = await fetch(mediaUrl);
    const blob = await response.blob();
    const filename = mediaUrl.split('/').pop().split('?')[0] || 'media';
    formData.append('image', blob, filename);
  } else {
    alert('Please select a file or enter a media URL.');
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';

  try {
    const res = await fetch('/upload', { method: 'POST', body: formData });
    const text = await res.text();
    const match = text.match(/href="([^"]+)"/);
    const link = match ? match[1] : null;

    if (link) {
      resultBox.classList.remove('hidden');
      shareLink.value = link;
      if (/\.(mp4|webm|mov|avi|mkv)$/i.test(link)) {
        mediaPreview.innerHTML = `<video src="${link}" controls></video>`;
      } else if (/\.(mp3|wav|ogg)$/i.test(link)) {
        mediaPreview.innerHTML = `<audio src="${link}" controls></audio>`;
      } else {
        mediaPreview.innerHTML = `<img src="${link}" alt="preview">`;
      }
    } else {
      alert('Upload failed.');
    }
  } catch (err) {
    alert('Error uploading file.');
    console.error(err);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload';
  }
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(shareLink.value);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => (copyBtn.textContent = 'Copy'), 1500);
});

/* --- Purple particle background --- */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
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
