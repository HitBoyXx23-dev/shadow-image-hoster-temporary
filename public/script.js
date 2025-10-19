const uploadBtn = document.getElementById('uploadBtn');
const fileInput = document.getElementById('fileInput');
const urlInput = document.getElementById('urlInput');
const resultBox = document.getElementById('result');
const preview = document.getElementById('preview');
const shareLink = document.getElementById('shareLink');
const copyBtn = document.getElementById('copyBtn');

uploadBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  const imageUrl = urlInput.value.trim();

  let formData = new FormData();

  if (file) {
    formData.append('image', file);
  } else if (imageUrl) {
    // fetch and convert the remote image to a Blob so we can upload it
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const filename = imageUrl.split('/').pop().split('?')[0] || 'image.jpg';
    formData.append('image', blob, filename);
  } else {
    alert('Please select a file or enter an image URL!');
    return;
  }

  uploadBtn.disabled = true;
  uploadBtn.textContent = 'Uploading...';

  try {
    const res = await fetch('/upload', {
      method: 'POST',
      body: formData
    });

    const text = await res.text(); // your backend returns HTML
    // extract the image URL
    const match = text.match(/href="([^"]+)"/);
    const link = match ? match[1] : null;

    if (link) {
      resultBox.classList.remove('hidden');
      preview.src = link;
      shareLink.value = link;
    } else {
      alert('Upload failed');
    }
  } catch (err) {
    alert('Error uploading image.');
    console.error(err);
  } finally {
    uploadBtn.disabled = false;
    uploadBtn.textContent = 'Upload';
  }
});

copyBtn.addEventListener('click', () => {
  navigator.clipboard.writeText(shareLink.value);
  copyBtn.textContent = 'Copied!';
  setTimeout(() => copyBtn.textContent = 'Copy', 1500);
});

/* --- Simple purple falling particle animation --- */
const canvas = document.getElementById('particles');
const ctx = canvas.getContext('2d');
let particles = [];

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

function createParticles() {
  for (let i = 0; i < 100; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      size: Math.random() * 3 + 1,
      speed: Math.random() * 1 + 0.5,
      color: ['#9d4edd', '#6a0dad', '#4b0082'][Math.floor(Math.random()*3)]
    });
  }
}
createParticles();

function drawParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
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
