const uploadInput = document.getElementById("upload");
const originalCanvas = document.getElementById("original"); 
const processedCanvas = document.getElementById("processed");
const processedCanvas16 = document.createElement("canvas");
const processedCanvas32 = document.createElement("canvas");
const processedCanvas64 = document.createElement("canvas");

const generateBtn = document.createElement("button");
generateBtn.textContent = "Generate";
document.body.appendChild(generateBtn);

const fileInput = document.createElement("input");
fileInput.type = "file";
fileInput.multiple = true;
fileInput.accept = "image/*";
fileInput.webkitdirectory = true;
fileInput.style.display = "none";
document.body.appendChild(fileInput);

// Seed 입력을 위한 UI 요소 추가
const seedInput = document.createElement("input");
seedInput.type = "text";
seedInput.placeholder = "Enter seed (optional)";
document.body.appendChild(seedInput);

// 시드 히스토리 표시 영역 추가
const seedHistoryDiv = document.createElement("div");
seedHistoryDiv.style.marginTop = "10px";
document.body.appendChild(seedHistoryDiv);

// 현재 사용중인 seed와 파일명을 표시할 요소
const infoDiv = document.createElement("div");
document.body.appendChild(infoDiv);

// 결과 JSON을 표시할 요소 추가
const resultDiv = document.createElement("div");
resultDiv.style.marginTop = "20px";
resultDiv.style.whiteSpace = "pre";
document.body.appendChild(resultDiv);

// 미리보기 이미지를 표시할 컨테이너
const previewContainer = document.createElement("div");
previewContainer.style.marginTop = "20px";
previewContainer.style.display = "flex";
previewContainer.style.flexWrap = "wrap";
previewContainer.style.gap = "10px";
document.body.appendChild(previewContainer);

let currentSeed = null;
let lastUploadedFile = null;
let seedHistory = [];
let usedColors = [];

// 시드 히스토리 UI 업데이트 함수
function updateSeedHistory() {
  seedHistoryDiv.innerHTML = '<strong>최근 사용된 시드:</strong><br>';
  seedHistory.slice(-5).forEach(seed => {
    const seedBtn = document.createElement('button');
    seedBtn.textContent = seed;
    seedBtn.style.margin = '2px';
    seedBtn.onclick = () => {
      seedInput.value = seed;
      if (lastUploadedFile) {
        renderWithSeed(seed, lastUploadedFile);
      }
    };
    seedHistoryDiv.appendChild(seedBtn);
  });
}

// 미리보기 이미지 생성 함수
function createPreviewImage(seed, file, processedImageUrl) {
  const previewDiv = document.createElement("div");
  previewDiv.style.textAlign = "center";
  
  const img = document.createElement("img");
  img.src = processedImageUrl;
  img.style.maxWidth = "200px";
  img.style.maxHeight = "200px";
  
  const label = document.createElement("div");
  label.textContent = `Seed: ${seed} | ${file.name}`;
  label.style.fontSize = "12px";
  label.style.marginTop = "5px";
  
  previewDiv.appendChild(img);
  previewDiv.appendChild(label);
  previewContainer.appendChild(previewDiv);
}

// 시드로 이미지 렌더링하는 함수
async function renderWithSeed(seed, file) {
  currentSeed = Number(seed);
  seededRandom = new SeededRandom(currentSeed);
  usedColors = []; // 색상 초기화
  
  if (!seedHistory.includes(currentSeed)) {
    seedHistory.push(currentSeed);
    updateSeedHistory();
  }
  
  try {
    const img = await createImageFromFile(file);
    processImage(img);
    infoDiv.textContent = `Current Seed: ${currentSeed} | File: ${file.name}`;
    
    // 결과 JSON 생성 및 표시
    const result = {
      seed: currentSeed,
      originalSize: `${file.name}`,
      colorSet: usedColors
    };
    
    resultDiv.textContent = JSON.stringify(result, null, 2);
    
    // 미리보기 이미지 추가
    createPreviewImage(currentSeed, file, processedCanvas16.toDataURL());
    createPreviewImage(currentSeed, file, processedCanvas32.toDataURL());
    createPreviewImage(currentSeed, file, processedCanvas64.toDataURL());
  } catch (error) {
    console.error('이미지 렌더링 중 오류:', error);
  }
}

uploadInput.addEventListener("change", handleImageUpload);
generateBtn.addEventListener("click", () => fileInput.click());
fileInput.addEventListener("change", handleGenerate);

// 시드 입력 시 자동 렌더링
seedInput.addEventListener("change", () => {
  if (lastUploadedFile && seedInput.value) {
    renderWithSeed(seedInput.value, lastUploadedFile);
  }
});

// 의사 난수 생성기
class SeededRandom {
  constructor(seed) {
    this.seed = seed;
  }

  random() {
    const x = Math.sin(this.seed++) * 10000;
    return x - Math.floor(x);
  }
}

let seededRandom = new SeededRandom(Date.now());

async function handleGenerate(event) {
  const files = Array.from(event.target.files);
  const imageFiles = files.filter(file => file.type.startsWith('image/'));
  
  currentSeed = seedInput.value ? Number(seedInput.value) : Date.now();
  if (!seedHistory.includes(currentSeed)) {
    seedHistory.push(currentSeed);
    updateSeedHistory();
  }
  seededRandom = new SeededRandom(currentSeed);
  
  const folderGroups = {};
  imageFiles.forEach(file => {
    const path = file.webkitRelativePath;
    const folder = path.split('/')[0];
    if (!folderGroups[folder]) {
      folderGroups[folder] = [];
    }
    folderGroups[folder].push(file);
  });

  for (const [folder, images] of Object.entries(folderGroups)) {
    for (const imageFile of images) {
      try {
        const img = await createImageFromFile(imageFile);
        await processImage(img);
        
        // 결과 JSON 생성
        const result = {
          seed: currentSeed,
          originalSize: `${imageFile.name}`,
          colorSet: usedColors
        };
        
        resultDiv.textContent = JSON.stringify(result, null, 2);
        
        infoDiv.textContent = `Current Seed: ${currentSeed} | File: ${imageFile.name}`;
        
        // 각 크기별로 저장
        const sizes = [
          { canvas: processedCanvas16, size: 16 },
          { canvas: processedCanvas32, size: 32 },
          { canvas: processedCanvas64, size: 64 }
        ];
        
        for (const {canvas, size} of sizes) {
          const link = document.createElement('a');
          link.download = `${folder}/comp/processed_${size}x${size}_${currentSeed}_${imageFile.name}`;
          link.href = canvas.toDataURL('image/png', 1.0);
          link.click();
        }
      } catch (error) {
        console.error(`이미지 처리 중 오류 발생: ${imageFile.name}`, error);
      }
    }
  }
}

function createImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    
    img.onload = () => {
      // 16x16 크기로 조정
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = 16;
      tempCanvas.height = 16;
      const tempCtx = tempCanvas.getContext('2d');
      tempCtx.imageSmoothingEnabled = false;
      tempCtx.drawImage(img, 0, 0, 16, 16);
      
      const resizedImg = new Image();
      resizedImg.onload = () => resolve(resizedImg);
      resizedImg.src = tempCanvas.toDataURL();
    };
    img.onerror = () => reject(new Error('이미지 로드 실패'));
    
    reader.onload = (e) => {
      img.src = e.target.result;
    };
    reader.onerror = () => reject(new Error('파일 읽기 실패'));
    reader.readAsDataURL(file);
  });
}

function handleImageUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  lastUploadedFile = file;

  currentSeed = seedInput.value ? Number(seedInput.value) : Date.now();
  if (!seedHistory.includes(currentSeed)) {
    seedHistory.push(currentSeed);
    updateSeedHistory();
  }
  seededRandom = new SeededRandom(currentSeed);
  usedColors = []; // 색상 초기화
  
  createImageFromFile(file)
    .then(img => {
      processImage(img);
      
      // 결과 JSON 생성
      const result = {
        seed: currentSeed,
        originalSize: `${file.name}`,
        colorSet: usedColors
      };
      
      resultDiv.textContent = JSON.stringify(result, null, 2);
      
      infoDiv.textContent = `Current Seed: ${currentSeed} | File: ${file.name}`;
      
      // 16x16, 32x32, 64x64 크기로 변환
      const sizes = [
        { canvas: processedCanvas16, size: 16 },
        { canvas: processedCanvas32, size: 32 },
        { canvas: processedCanvas64, size: 64 }
      ];
      
      sizes.forEach(({canvas, size}) => {
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(processedCanvas, 0, 0, size, size);
      });
    })
    .catch(error => console.error('이미지 업로드 중 오류:', error));
}

function processImage(img) {
  const originalCtx = originalCanvas.getContext("2d", { willReadFrequently: true });
  const processedCtx = processedCanvas.getContext("2d", { willReadFrequently: true });

  originalCanvas.width = img.width;
  originalCanvas.height = img.height;
  originalCtx.drawImage(img, 0, 0);

  const imgData = originalCtx.getImageData(0, 0, img.width, img.height);
  const data = imgData.data;

  const excludeColors = [
    {color: [255, 255, 255], tolerance: 3},
    {color: [57, 57, 70], tolerance: 2}
  ];

  function isExcludedColor(r, g, b) {
    return excludeColors.some(({color, tolerance}) => {
      return Math.abs(r - color[0]) <= tolerance &&
             Math.abs(g - color[1]) <= tolerance &&
             Math.abs(b - color[2]) <= tolerance;
    });
  }

  const pixelArray = [];
  const exclusionMask = [];
  const colorHistogram = new Map();
  
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];

      if (isExcludedColor(r, g, b)) {
        exclusionMask.push(true);
        data[idx] = r;
        data[idx + 1] = g;
        data[idx + 2] = b;
      } else {
        exclusionMask.push(false);
        const positionWeight = 0.2; 
        pixelArray.push([
          r, g, b,
          (x / img.width) * positionWeight,
          (y / img.height) * positionWeight
        ]);
        
        const colorKey = `${Math.floor(r/10)},${Math.floor(g/10)},${Math.floor(b/10)}`;
        colorHistogram.set(colorKey, (colorHistogram.get(colorKey) || 0) + 1);
      }
    }
  }

  const k = Math.min(8, Math.max(4, Math.floor(colorHistogram.size / 50)));
  const clusters = kMeans(pixelArray, k, 150);
  
  const clusterColors = Array(k).fill().map(() => ({r: 0, g: 0, b: 0, count: 0}));
  let pixelIdx = 0;
  for (let i = 0; i < pixelArray.length; i++) {
    const cluster = clusters[i];
    clusterColors[cluster].r += pixelArray[i][0];
    clusterColors[cluster].g += pixelArray[i][1];
    clusterColors[cluster].b += pixelArray[i][2];
    clusterColors[cluster].count++;
  }

  const newColors = clusterColors.map(({r, g, b, count}) => {
    if (count === 0) return [0, 0, 0];
    const avgR = r / count;
    const avgG = g / count;
    const avgB = b / count;
    
    const variation = 120;
    const hueShift = seededRandom.random() * 30 - 15;
    
    const [h, s, l] = rgbToHsl(avgR, avgG, avgB);
    const newH = (h + hueShift + 360) % 360;
    const newS = Math.min(100, s * (1 + (seededRandom.random() - 0.5) * 0.3));
    const newL = Math.min(100, l * (1 + (seededRandom.random() - 0.5) * 0.2));
    
    const [newR, newG, newB] = hslToRgb(newH, newS, newL);
    
    const color = [
      Math.min(255, Math.max(0, newR + (seededRandom.random() - 0.5) * variation)),
      Math.min(255, Math.max(0, newG + (seededRandom.random() - 0.5) * variation)),
      Math.min(255, Math.max(0, newB + (seededRandom.random() - 0.5) * variation))
    ];
    
    // 사용된 색상 저장
    usedColors.push({
      r: Math.round(color[0]),
      g: Math.round(color[1]), 
      b: Math.round(color[2]),
      hex: '#' + Math.round(color[0]).toString(16).padStart(2,'0') + 
           Math.round(color[1]).toString(16).padStart(2,'0') + 
           Math.round(color[2]).toString(16).padStart(2,'0')
    });
    
    return color;
  });

  let pixelIndex = 0;
  for (let y = 0; y < img.height; y++) {
    for (let x = 0; x < img.width; x++) {
      const idx = (y * img.width + x) * 4;
      if (!exclusionMask[pixelIndex]) {
        const clusterIndex = clusters[pixelIndex];
        const baseColor = newColors[clusterIndex];
        const originalColor = [data[idx], data[idx + 1], data[idx + 2]];
        const scaledColor = scaleColorWithHarmony(baseColor, originalColor);
        data[idx] = scaledColor[0];
        data[idx + 1] = scaledColor[1];
        data[idx + 2] = scaledColor[2];
        pixelIndex++;
      }
    }
  }

  imgData.data.set(data);
  processedCanvas.width = img.width;
  processedCanvas.height = img.height;
  processedCtx.putImageData(imgData, 0, 0);
}

function scaleColorWithHarmony(baseColor, originalColor) {
  const luminance = (r, g, b) => {
    const sR = r / 255;
    const sG = g / 255;
    const sB = b / 255;
    return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
  };
  
  const lumOriginal = luminance(...originalColor);
  const lumBase = luminance(...baseColor);
  
  const scale = Math.pow(lumOriginal / (lumBase || 1), 0.8);
  const blend = 0.7 + seededRandom.random() * 0.2;
  
  return baseColor.map((c, i) => {
    const scaled = Math.round(c * scale);
    return Math.min(255, Math.max(0, 
      Math.round(scaled * blend + originalColor[i] * (1 - blend))
    ));
  });
}

function kMeans(pixels, k, maxIterations = 150) {
  const centroids = selectInitialCentroids(pixels, k);
  const assignments = Array(pixels.length).fill(0);
  
  let iteration = 0;
  let changed = true;
  let lastError = Infinity;
  
  while (changed && iteration < maxIterations) {
    changed = false;
    iteration++;
    let totalError = 0;

    for (let i = 0; i < pixels.length; i++) {
      const distances = centroids.map(c =>
        Math.sqrt(
          (pixels[i][0] - c[0]) ** 2 +
          (pixels[i][1] - c[1]) ** 2 +
          (pixels[i][2] - c[2]) ** 2 +
          (pixels[i][3] - c[3]) ** 2 +
          (pixels[i][4] - c[4]) ** 2
        )
      );
      const closestCluster = distances.indexOf(Math.min(...distances));
      totalError += Math.min(...distances);
      
      if (assignments[i] !== closestCluster) {
        assignments[i] = closestCluster;
        changed = true;
      }
    }

    const errorDelta = Math.abs(totalError - lastError) / lastError;
    if (errorDelta < 0.001) break;
    lastError = totalError;

    const newCentroids = Array(k).fill().map(() => [0, 0, 0, 0, 0]);
    const counts = Array(k).fill(0);
    
    for (let i = 0; i < pixels.length; i++) {
      const cluster = assignments[i];
      for (let j = 0; j < 5; j++) {
        newCentroids[cluster][j] += pixels[i][j];
      }
      counts[cluster]++;
    }

    for (let i = 0; i < k; i++) {
      if (counts[i] > 0) {
        for (let j = 0; j < 5; j++) {
          newCentroids[i][j] = newCentroids[i][j] / counts[i];
        }
      }
    }

    centroids.splice(0, k, ...newCentroids);
  }

  return assignments;
}

function selectInitialCentroids(pixels, k) {
  const centroids = [pixels[Math.floor(seededRandom.random() * pixels.length)]];
  
  while (centroids.length < k) {
    const distances = pixels.map(pixel => 
      Math.min(...centroids.map(c => 
        Math.sqrt(
          (pixel[0] - c[0]) ** 2 +
          (pixel[1] - c[1]) ** 2 +
          (pixel[2] - c[2]) ** 2 +
          (pixel[3] - c[3]) ** 2 +
          (pixel[4] - c[4]) ** 2
        )
      ))
    );
    
    const totalDistance = distances.reduce((a, b) => a + b, 0);
    let random = seededRandom.random() * totalDistance;
    let index = 0;
    
    while (random > 0) {
      random -= distances[index];
      index++;
    }
    index--;
    
    centroids.push(pixels[index]);
  }
  
  return centroids;
}

function generateHarmoniosColors(count) {
  const colors = [];
  const baseHue = seededRandom.random() * 360;
  
  for (let i = 0; i < count; i++) {
    const hue = (baseHue + (i * (360 / count))) % 360;
    const saturation = 20 + seededRandom.random() * 60;
    const lightness = 40 + seededRandom.random() * 40;
    
    const color = hslToRgb(hue, saturation, lightness);
    colors.push(color);
  }
  
  return colors;
}

function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;

  if (max === min) {
    h = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return [h * 360, s * 100, l * 100];
}

function hslToRgb(h, s, l) {
  h /= 360;
  s /= 100;
  l /= 100;
  
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }

  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
}
