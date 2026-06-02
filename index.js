import * as THREE from 'three';
import { gsap } from 'gsap';

// ==========================================
// 1. Data Definition for the Gallery Plates
// ==========================================
const GALLERY_DATA = [
  {
    index: 0,
    title: "My Bestie",
    date: "Plate 01",
    image: "./assets/IMG20250625075500.jpg",
    desc: "Nuvu ante naku praname ah vishayam niku kuda thelusu emo life entha mandhi natho unna kani nuvu na pakkana unnapudu vachey feeling eh veru and i want a promise from you nannu apudu life vadhileyaku.",
    quote: "Nuvu ante naku praname.",
    pos: { x: 0, y: -2, z: -5 },
    camPos: { x: 0, y: 0.5, z: -1 },
    lookAt: { x: 0, y: 0.7, z: -5 }
  },
  {
    index: 1,
    title: "Thingaribuchi",
    date: "Plate 02",
    image: "./assets/IMG20250627084429.jpg",
    desc: "I love the way you are enjoying when you are with me , ah childishness entho istame naku kani nuvu adhi andhari dhaggara chupinchadame nachadhu naku .",
    quote: "Ah childishness entho istame naku.",
    pos: { x: 7, y: -2, z: -13 },
    camPos: { x: 6.8, y: 0.5, z: -9 },
    lookAt: { x: 7, y: 0.7, z: -13 }
  },
  {
    index: 2,
    title: "Caring partner",
    date: "Plate 03",
    image: "./assets/IMG20250627084631.jpg",
    desc: "Nuvuu nannu entha baga care chesthav ante life lo nuvu nannu ardham chesukuntanu inka evaru ardham chesukoleru anni bagane chesthav naku istaminavi thelusukuntav kani na mindset eh correct kadhu nuvu chesedhi correct eh kani na mindset theda em chesina nannu impress cheydaniki try chesthav .",
    quote: "Nuvuu nannu entha baga care chesthav...",
    pos: { x: 3, y: -2, z: -22 },
    camPos: { x: 2.8, y: 0.5, z: -18 },
    lookAt: { x: 3, y: 0.7, z: -22 }
  },
  {
    index: 3,
    title: "Life partner",
    date: "Plate 04",
    image: "./assets/IMG20250627091154.jpg",
    desc: "My life partner , andhariki life partner ante wife ledha lover kani naku life partner ante nuve that menas i don't wanna marry you ni frienship ni caring inka ni love anni na medha okka life partner ki anna ekkuva may be i am your second priority na life lo nuvu mathram apudu first priority eh I LOVE YOU .",
    quote: "I LOVE YOU.",
    pos: { x: -5, y: -2, z: -19 },
    camPos: { x: -4.8, y: 0.5, z: -15 },
    lookAt: { x: -5, y: 0.7, z: -19 }
  },
  {
    index: 4,
    title: "Supporter",
    date: "Plate 05",
    image: "./assets/IMG_20250627_151034.jpg",
    desc: "Life lo eh situation lo unna kani nuvu nannu motivate chesi cheyagalav ane namme first person nuve life lo prathithi vishayam lo vellupetti vachesa kani inka better ga sadisthav ane nammakham tho nathone unnav thanks for supporting and motivating me .",
    quote: "Thanks for supporting and motivating me.",
    pos: { x: -8, y: -2, z: -8 },
    camPos: { x: -7.8, y: 0.5, z: -4 },
    lookAt: { x: -8, y: 0.7, z: -8 }
  },
  {
    index: 5,
    title: "Secret Letter",
    date: "Plate 06",
    image: "./assets/love letter.jpg",
    desc: "The emotional bonding which we are having is very special to me and Iam very much thankful to you wish you a happy birthday once again ",
    quote: "The emotional bonding which we have is very special.",
    pos: { x: -14, y: -2, z: 0 },
    camPos: { x: -13.8, y: 0.5, z: 4.5 },
    lookAt: { x: -14, y: 0.7, z: 0 }
  }
];

// ==========================================
// 2. Variable Initialization
// ==========================================
let scene, camera, renderer;
let pedestals = [];
let frames = [];
let goldVeils = [];
let particlesGeometry;
let particleSystem;
let ambientLight, spotLight, goldAccentLight;
let ribbons = [];

let activeIndex = -1; // -1 is Hero introduction
let isTransitioning = false;
let isExhibitionEntered = false;
let raycaster, mouse;
let loadingManager;
const clock = new THREE.Clock();
clock.start();

// Parallax target variables
let mouseX = 0, mouseY = 0;
let targetCameraOffset = { x: 0, y: 0 };
let currentCameraOffset = { x: 0, y: 0 };

// New High-End variables
let volumetricBeams = [];
let orbitalRingGroups = [];
let isSlideshowPlaying = false;
let slideshowTimer = null;





// ==========================================
// 3. Application Entry
// ==========================================
window.addEventListener('DOMContentLoaded', () => {
  initLoadingManager();
  initThree();
  initLights();
  generateProceduralScene();
  setupInteractions();
  setup2DSparkleTrail();
  setupMusicPlayer();
  animate();
});

// ==========================================
// 4. Loader Setup & Texture Pre-loading
// ==========================================
function initLoadingManager() {
  const progressBar = document.getElementById('loader-progress-fill');
  const loader = document.getElementById('luxury-loader');
  
  loadingManager = new THREE.LoadingManager();
  
  loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const percentage = (itemsLoaded / itemsTotal) * 100;
    progressBar.style.width = `${percentage}%`;
  };
  
  loadingManager.onLoad = () => {
    setTimeout(() => {
      loader.classList.add('fade-out');
      // Set initial overview camera
      gsap.to(camera.position, {
        x: 0,
        y: 2,
        z: 6,
        duration: 3,
        ease: "power2.out"
      });
    }, 800);
  };
}

// ==========================================
// 5. Three.js Initialization
// ==========================================
function initThree() {
  const container = document.getElementById('canvas-container');
  
  scene = new THREE.Scene();
  // Set gorgeous fog matching the obsidian dark background
  scene.fog = new THREE.FogExp2(0x020205, 0.04);
  
  camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
  // Spawn camera far away for cinematic zoom in
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);
  
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  
  container.appendChild(renderer.domElement);
  
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  
  window.addEventListener('resize', onWindowResize);
}

// ==========================================
// 6. Realistic Lighting Setup
// ==========================================
function initLights() {
  // Soft ambient royal navy fill
  ambientLight = new THREE.AmbientLight(0x0e0c24, 1.25);
  scene.add(ambientLight);
  
  // Spotlight that tracks active pedestals
  spotLight = new THREE.SpotLight(0xfff5e0, 9);
  spotLight.position.set(0, 12, 5);
  spotLight.angle = Math.PI / 6;
  spotLight.penumbra = 0.8;
  spotLight.castShadow = true;
  spotLight.shadow.mapSize.width = 2048;
  spotLight.shadow.mapSize.height = 2048;
  spotLight.shadow.bias = -0.001;
  scene.add(spotLight);
  
  // Point light for glowing gold warmth
  goldAccentLight = new THREE.PointLight(0xf1d8a7, 4.5, 16);
  goldAccentLight.position.set(0, 1, -2);
  scene.add(goldAccentLight);
}

// ==========================================
// 7. Procedural Marble Texture Generator
// ==========================================
function createMarbleTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');
  
  // Base Warm Ivory Gradient
  const grad = ctx.createLinearGradient(0, 0, 512, 512);
  grad.addColorStop(0, '#faf8f2');
  grad.addColorStop(0.5, '#f5efe0');
  grad.addColorStop(1, '#eae1cf');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 512, 512);
  
  // Draw organic dark gray/brown veins
  ctx.strokeStyle = 'rgba(84, 78, 67, 0.12)';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  
  for (let i = 0; i < 12; i++) {
    ctx.lineWidth = Math.random() * 2 + 0.5;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, 0);
    ctx.bezierCurveTo(
      Math.random() * 512, Math.random() * 512,
      Math.random() * 512, Math.random() * 512,
      Math.random() * 512, 512
    );
    ctx.stroke();
  }
  
  // Gold veins for absolute premium feel
  ctx.strokeStyle = 'rgba(184, 146, 75, 0.45)';
  for (let i = 0; i < 6; i++) {
    ctx.lineWidth = Math.random() * 1.5 + 0.5;
    ctx.beginPath();
    ctx.moveTo(0, Math.random() * 512);
    ctx.bezierCurveTo(
      Math.random() * 512, Math.random() * 512,
      Math.random() * 512, Math.random() * 512,
      512, Math.random() * 512
    );
    ctx.stroke();
  }
  
  // Golden highlights
  ctx.strokeStyle = 'rgba(247, 230, 196, 0.6)';
  for (let i = 0; i < 3; i++) {
    ctx.lineWidth = Math.random() * 0.8;
    ctx.beginPath();
    ctx.moveTo(Math.random() * 512, 0);
    ctx.lineTo(Math.random() * 512, 512);
    ctx.stroke();
  }
  
  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 2);
  return texture;
}

// ==========================================
// 7.1 Programmatic Volumetric Beam Texture
// ==========================================
function createVolumetricBeamTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 16;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  
  // Vertical gradient from semi-transparent gold to completely transparent
  const grad = ctx.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0, 'rgba(241, 216, 167, 0.35)');
  grad.addColorStop(0.3, 'rgba(241, 216, 167, 0.12)');
  grad.addColorStop(1, 'rgba(241, 216, 167, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 16, 256);
  
  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ==========================================
// 8. Procedural Scene Generation
// ==========================================
function generateProceduralScene() {
  const marbleTexture = createMarbleTexture();
  const textureLoader = new THREE.TextureLoader(loadingManager);
  
  // Standard Materials
  const pedestalMaterial = new THREE.MeshStandardMaterial({
    map: marbleTexture,
    roughness: 0.08,
    metalness: 0.15,
    bumpMap: marbleTexture,
    bumpScale: 0.015
  });
  
  const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1d8a7,
    metalness: 0.95,
    roughness: 0.12,
    envMapIntensity: 1.5
  });
  
  // --- Create Pedestals & Photo Frames ---
  GALLERY_DATA.forEach((data, index) => {
    // A. The Sleek Marble Pedestal Cylinder
    const pedestalGeo = new THREE.CylinderGeometry(1.2, 1.4, 3, 32);
    const pedestalMesh = new THREE.Mesh(pedestalGeo, pedestalMaterial);
    pedestalMesh.position.set(data.pos.x, data.pos.y, data.pos.z);
    pedestalMesh.castShadow = true;
    pedestalMesh.receiveShadow = true;
    scene.add(pedestalMesh);
    pedestals.push(pedestalMesh);
    
    // B. Decorative Gold Top Ring
    const ringGeo = new THREE.TorusGeometry(1.22, 0.04, 16, 64);
    const ringMesh = new THREE.Mesh(ringGeo, goldMaterial);
    ringMesh.position.set(data.pos.x, data.pos.y + 1.5, data.pos.z);
    ringMesh.rotation.x = Math.PI / 2;
    scene.add(ringMesh);
    
    // E. Programmatic Volumetric Spotlight Cone (Draw for all pedestals!)
    const beamTexture = createVolumetricBeamTexture();
    const beamGeo = new THREE.CylinderGeometry(0.1, 2.5, 11, 32, 1, true);
    beamGeo.translate(0, -5.5, 0);
    const beamMat = new THREE.MeshBasicMaterial({
      map: beamTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
      depthWrite: false,
      opacity: index === 0 ? 0.22 : 0.02
    });
    const beamMesh = new THREE.Mesh(beamGeo, beamMat);
    beamMesh.position.set(data.pos.x, data.pos.y + 11, data.pos.z + 5);
    beamMesh.lookAt(data.pos.x, data.pos.y + 1, data.pos.z);
    beamMesh.rotateX(Math.PI / 2);
    scene.add(beamMesh);
    volumetricBeams.push(beamMesh);
    
    // Draw photo frames and orbital rings only for all photographic plates
    if (index < GALLERY_DATA.length) {
      // C. The Portrait Photo Frame Assembly
      const frameGroup = new THREE.Group();
      frameGroup.position.set(data.pos.x, data.pos.y + 3.1, data.pos.z);
      
      const photoWidth = 1.5;
      const photoHeight = 2.25;
      
      const photoTexture = textureLoader.load(data.image);
      photoTexture.colorSpace = THREE.SRGBColorSpace;
      photoTexture.generateMipmaps = true;
      photoTexture.minFilter = THREE.LinearMipmapLinearFilter;
      
      const photoGeo = new THREE.BoxGeometry(photoWidth, photoHeight, 0.04);
      const photoMat = new THREE.MeshStandardMaterial({
        map: photoTexture,
        roughness: 0.18,
        metalness: 0.05
      });
      
      const backMat = new THREE.MeshStandardMaterial({
        color: 0x060512,
        roughness: 0.4,
        metalness: 0.1
      });
      
      const photoMesh = new THREE.Mesh(photoGeo, [
        goldMaterial, // Right
        goldMaterial, // Left
        goldMaterial, // Top
        goldMaterial, // Bottom
        photoMat,     // Front
        backMat       // Back
      ]);
      photoMesh.castShadow = true;
      photoMesh.receiveShadow = true;
      photoMesh.userData = { id: index };
      frameGroup.add(photoMesh);
      
      const wireWidth = photoWidth + 0.25;
      const wireHeight = photoHeight + 0.25;
      const wireDepth = 0.25;
      
      const wireGeo = new THREE.BoxGeometry(wireWidth, wireHeight, wireDepth);
      const edgeGeo = new THREE.EdgesGeometry(wireGeo);
      const wireMesh = new THREE.LineSegments(
        edgeGeo, 
        new THREE.LineBasicMaterial({ color: 0xf1d8a7, linewidth: 2 })
      );
      frameGroup.add(wireMesh);
      
      const accentLight = new THREE.PointLight(0xf1d8a7, 1.2, 4.5);
      accentLight.position.set(0, -1.2, 0);
      frameGroup.add(accentLight);
      
      scene.add(frameGroup);
      frames.push(frameGroup);
      
      // F. Metallic Gold Saturn Orbital Rings
      const ringGroup = new THREE.Group();
      ringGroup.position.set(data.pos.x, data.pos.y + 3.1, data.pos.z);
      
      const ring1Geo = new THREE.TorusGeometry(1.9, 0.015, 8, 64);
      const ring1Mesh = new THREE.Mesh(ring1Geo, goldMaterial);
      ring1Mesh.rotation.x = Math.PI / 4;
      ring1Mesh.rotation.y = Math.PI / 6;
      ringGroup.add(ring1Mesh);
      
      const ring2Geo = new THREE.TorusGeometry(2.3, 0.01, 8, 64);
      const ring2Mesh = new THREE.Mesh(ring2Geo, goldMaterial);
      ring2Mesh.rotation.x = -Math.PI / 3;
      ring2Mesh.rotation.y = -Math.PI / 4;
      ringGroup.add(ring2Mesh);
      
      scene.add(ringGroup);
      orbitalRingGroups.push(ringGroup);
    }
  });
  
  // --- Create Drifting Golden Stardust Particle System ---
  const particleCount = 450;
  particlesGeometry = new THREE.BufferGeometry();
  const particlePositions = new Float32Array(particleCount * 3);
  const particleSpeeds = [];
  
  for (let i = 0; i < particleCount; i++) {
    // Distribute randomly in a room block containing the pedestals
    particlePositions[i * 3] = (Math.random() - 0.5) * 35;
    particlePositions[i * 3 + 1] = Math.random() * 12 - 3;
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 40 - 10;
    
    particleSpeeds.push({
      x: (Math.random() - 0.5) * 0.015,
      y: Math.random() * 0.005 + 0.002, // Slow, elegant floating
      z: (Math.random() - 0.5) * 0.015,
      amplitude: Math.random() * 0.5,
      freq: Math.random() * 1.5
    });
  }
  
  particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  
  // Programmatic soft circle particle texture
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 16;
  pCanvas.height = 16;
  const pCtx = pCanvas.getContext('2d');
  const pGrad = pCtx.createRadialGradient(8, 8, 0, 8, 8, 8);
  pGrad.addColorStop(0, 'rgba(255, 253, 235, 1)');
  pGrad.addColorStop(0.3, 'rgba(241, 216, 167, 0.85)');
  pGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  pCtx.fillStyle = pGrad;
  pCtx.fillRect(0, 0, 16, 16);
  const pTexture = new THREE.CanvasTexture(pCanvas);
  
  const particlesMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.16,
    map: pTexture,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
  scene.add(particleSystem);
  particleSystem.userData = { speeds: particleSpeeds };
  
  // --- Create Elegant Waving Silk Ribbons ---
  for (let r = 0; r < 4; r++) {
    const width = 0.15;
    const length = 20;
    const segments = 45;
    
    const ribbonGeo = new THREE.PlaneGeometry(width, length, 1, segments);
    const ribbonMat = new THREE.MeshStandardMaterial({
      color: r % 2 === 0 ? 0x060512 : 0xcda252,
      roughness: 0.2,
      metalness: 0.75,
      side: THREE.DoubleSide
    });
    
    const ribbonMesh = new THREE.Mesh(ribbonGeo, ribbonMat);
    ribbonMesh.rotation.x = Math.PI / 2;
    ribbonMesh.position.set(
      (Math.random() - 0.5) * 20,
      Math.random() * 4 + 1,
      -10 - Math.random() * 15
    );
    scene.add(ribbonMesh);
    ribbons.push({
      mesh: ribbonMesh,
      waveOffset: Math.random() * 100,
      speed: 0.5 + Math.random() * 0.5
    });
  }
}



// ==========================================
// 9. Interactive Setup (GSAP, Navigation)
// ==========================================
// ==========================================
// 8.5 Curated Grid View & Slideshow Routines
// ==========================================
function enterExhibitionAt(idx) {
  const heroSection = document.getElementById('hero-section');
  const scrollTracks = document.getElementById('scroll-track-sections');
  const bottomDashboard = document.getElementById('bottom-dashboard');
  
  heroSection.style.display = 'none';
  scrollTracks.style.display = 'block';
  bottomDashboard.classList.add('visible');
  
  // Instantly align scroll tracks translation to the correct slide offset
  if (scrollTracks) {
    gsap.set(scrollTracks, { y: -idx * window.innerHeight });
  }
  
  // Hide all narrative cards first
  document.querySelectorAll('.narrative-card').forEach(c => c.classList.remove('visible'));
  
  // Show active narrative card
  setTimeout(() => {
    const activeSlide = document.getElementById(`slide-${idx}`);
    if (activeSlide) {
      activeSlide.querySelector('.narrative-card').classList.add('visible');
      activeSlide.style.pointerEvents = 'auto';
    }
  }, 100);
  
  isExhibitionEntered = true;
  activeIndex = idx;
  
  // Transition camera directly
  transitionCameraToPedestal(idx);
}

function startSlideshow() {
  isSlideshowPlaying = true;
  const btn = document.getElementById('slideshow-btn');
  if (btn) {
    btn.classList.add('playing');
    const path = btn.querySelector('#play-pause-path');
    if (path) path.setAttribute('d', 'M6 19h4V5H6v14zm8-14v14h4V5h-4z');
  }
  tickSlideshow();
}

function stopSlideshow() {
  isSlideshowPlaying = false;
  const btn = document.getElementById('slideshow-btn');
  if (btn) {
    btn.classList.remove('playing');
    const path = btn.querySelector('#play-pause-path');
    if (path) path.setAttribute('d', 'M8 5v14l11-7z');
  }
  if (slideshowTimer) {
    clearTimeout(slideshowTimer);
    slideshowTimer = null;
  }
}

function tickSlideshow() {
  if (!isSlideshowPlaying) return;
  
  slideshowTimer = setTimeout(() => {
    if (!isSlideshowPlaying) return;
    
    let nextIdx = activeIndex + 1;
    if (nextIdx >= GALLERY_DATA.length) {
      nextIdx = 0;
    }
    
    changeSlide(nextIdx);
    tickSlideshow();
  }, 6000);
}

// ==========================================
// 9. Interactive Setup (GSAP, Navigation)
// ==========================================
function setupInteractions() {
  const exploreBtn = document.getElementById('explore-btn');
  const gridViewBtn = document.getElementById('grid-view-btn');
  const gridCloseBtn = document.getElementById('grid-close-btn');
  const heroSection = document.getElementById('hero-section');
  const scrollTracks = document.getElementById('scroll-track-sections');
  const bottomDashboard = document.getElementById('bottom-dashboard');
  const curatedGridOverlay = document.getElementById('curated-grid-overlay');
  
  // Raycast hover states
  window.addEventListener('mousemove', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
    
    // Parallax mouse variables
    mouseX = (e.clientX - window.innerWidth / 2) / (window.innerWidth / 2);
    mouseY = (e.clientY - window.innerHeight / 2) / (window.innerHeight / 2);
    
    targetCameraOffset.x = mouseX * 0.45;
    targetCameraOffset.y = -mouseY * 0.35;
  });
  
  // Raycast Click
  window.addEventListener('click', () => {
    if (!isExhibitionEntered || isTransitioning) return;
    
    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true);
    
    // Check if clicked a photo mesh
    const clickedPhoto = intersects.find(intersect => 
      intersect.object.parent && intersect.object.parent.children[0] === intersect.object && 
      intersect.object.userData.id !== undefined
    );
    
    if (clickedPhoto) {
      const idx = clickedPhoto.object.userData.id;
      zoomToPlate(idx);
    }
  });
  
  // "Enter Immersive Tour" swoop
  exploreBtn.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;
    stopSlideshow();
    
    gsap.to(heroSection, {
      opacity: 0,
      y: -30,
      duration: 1,
      ease: "power2.inOut",
      onComplete: () => {
        heroSection.style.display = 'none';
        scrollTracks.style.display = 'block';
        bottomDashboard.classList.add('visible');
        
        // Reset scroll position to 0
        gsap.set(scrollTracks, { y: 0 });
        
        // Make the narrative slides visible
        setTimeout(() => {
          document.getElementById('slide-0').querySelector('.narrative-card').classList.add('visible');
          document.getElementById('slide-0').style.pointerEvents = 'auto';
        }, 100);
        
        isExhibitionEntered = true;
        isTransitioning = false;
        activeIndex = 0;
        transitionCameraToPedestal(0);
      }
    });
  });
  
  // "Curated Grid View" entry
  gridViewBtn.addEventListener('click', () => {
    stopSlideshow();
    curatedGridOverlay.classList.add('visible');
  });
  
  // "Exit Grid View"
  gridCloseBtn.addEventListener('click', () => {
    curatedGridOverlay.classList.remove('visible');
  });
  
  // Grid Item direct clicks
  document.querySelectorAll('.grid-item').forEach(item => {
    item.addEventListener('click', () => {
      const idx = parseInt(item.getAttribute('data-index'));
      curatedGridOverlay.classList.remove('visible');
      enterExhibitionAt(idx);
    });
  });
  
  // Navigation button binds inside Narrative cards
  document.querySelectorAll('.narrative-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const pIdx = parseInt(e.target.getAttribute('data-pedestal'));
      zoomToPlate(pIdx);
    });
  });
  
  // Bottom control dashboard Roman Numeral clicks
  document.querySelectorAll('.roman-node').forEach(node => {
    node.addEventListener('click', () => {
      const idx = parseInt(node.getAttribute('data-index'));
      if (idx !== activeIndex) {
        stopSlideshow();
        changeSlide(idx);
      }
    });
  });
  
  // Slideshow toggle click
  const slideshowBtn = document.getElementById('slideshow-btn');
  slideshowBtn.addEventListener('click', () => {
    if (isSlideshowPlaying) {
      stopSlideshow();
    } else {
      startSlideshow();
    }
  });
  
  // Scroll wheel tracking to change slides
  window.addEventListener('wheel', handleScrollEvent, { passive: false });
  window.addEventListener('touchmove', handleTouchScrollEvent, { passive: false });
  
  // Lightbox close button
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);
  

}

// ==========================================
// 10. Scroll & Parallax Navigation Logic
// ==========================================
let lastScrollTime = 0;
function handleScrollEvent(e) {
  if (!isExhibitionEntered || isTransitioning || document.getElementById('photo-lightbox').classList.contains('open') || document.getElementById('wish-drawer').classList.contains('open') || document.getElementById('curated-grid-overlay').classList.contains('visible')) return;
  
  e.preventDefault();
  const now = Date.now();
  if (now - lastScrollTime < 1000) return; // Debounce slide moves
  
  if (e.deltaY > 20) {
    // Scroll Down -> Next Slide
    if (activeIndex < GALLERY_DATA.length - 1) {
      stopSlideshow();
      changeSlide(activeIndex + 1);
      lastScrollTime = now;
    }
  } else if (e.deltaY < -20) {
    // Scroll Up -> Previous Slide
    if (activeIndex > 0) {
      stopSlideshow();
      changeSlide(activeIndex - 1);
      lastScrollTime = now;
    }
  }
}

let startTouchY = 0;
window.addEventListener('touchstart', (e) => {
  startTouchY = e.touches[0].clientY;
}, { passive: true });

function handleTouchScrollEvent(e) {
  if (!isExhibitionEntered || isTransitioning || document.getElementById('photo-lightbox').classList.contains('open') || document.getElementById('wish-drawer').classList.contains('open') || document.getElementById('curated-grid-overlay').classList.contains('visible')) return;
  
  const touchY = e.touches[0].clientY;
  const diffY = startTouchY - touchY;
  
  const now = Date.now();
  if (now - lastScrollTime < 1200) return;
  
  if (Math.abs(diffY) > 50) {
    e.preventDefault();
    if (diffY > 0) {
      // Swipe Up (Scroll Down)
      if (activeIndex < GALLERY_DATA.length - 1) {
        stopSlideshow();
        changeSlide(activeIndex + 1);
        lastScrollTime = now;
      }
    } else {
      // Swipe Down (Scroll Up)
      if (activeIndex > 0) {
        stopSlideshow();
        changeSlide(activeIndex - 1);
        lastScrollTime = now;
      }
    }
  }
}

function changeSlide(nextIndex) {
  if (isTransitioning || nextIndex === activeIndex) return;
  isTransitioning = true;
  
  // Fade out old slide text card
  const oldSlide = document.getElementById(`slide-${activeIndex}`);
  if (oldSlide) {
    const oldCard = oldSlide.querySelector('.narrative-card');
    if (oldCard) oldCard.classList.remove('visible');
    oldSlide.style.pointerEvents = 'none';
  }
  
  // Animate the vertical scrolling transition of text slides
  const scrollTracks = document.getElementById('scroll-track-sections');
  if (scrollTracks) {
    gsap.to(scrollTracks, {
      y: -nextIndex * window.innerHeight,
      duration: 1.8,
      ease: "power3.inOut"
    });
  }
  
  // Move camera
  activeIndex = nextIndex;
  transitionCameraToPedestal(activeIndex);
  
  // Fade in new slide text card
  setTimeout(() => {
    const newSlide = document.getElementById(`slide-${activeIndex}`);
    if (newSlide) {
      const newCard = newSlide.querySelector('.narrative-card');
      if (newCard) newCard.classList.add('visible');
      
      newSlide.style.pointerEvents = 'auto';
    }
    isTransitioning = false;
  }, 1000);
}

function transitionCameraToPedestal(index) {
  const data = GALLERY_DATA[index];
  
  // Highlight active roman node in dashboard
  const romanNodes = document.querySelectorAll('.roman-node');
  romanNodes.forEach((node, idx) => {
    if (idx === index) {
      node.classList.add('active');
    } else {
      node.classList.remove('active');
    }
  });
  
  // Update bottom dashboard plate indicator texts
  const padNumStr = `Plate 0${index + 1}`;
  const plateNumEl = document.getElementById('dashboard-plate-num');
  const plateTitleEl = document.getElementById('dashboard-plate-title');
  if (plateNumEl) plateNumEl.innerText = padNumStr;
  if (plateTitleEl) plateTitleEl.innerText = data.title;
  
  // Animate volumetric lights opacity
  volumetricBeams.forEach((beam, idx) => {
    gsap.to(beam.material, {
      opacity: idx === index ? 0.22 : 0.02,
      duration: 1.5,
      ease: "power2.out"
    });
  });
  
  // Center light spotlight onto current pedestal
  gsap.to(spotLight.position, {
    x: data.pos.x,
    y: data.pos.y + 11,
    z: data.pos.z + 5,
    duration: 1.8,
    ease: "power2.inOut"
  });
  
  gsap.to(spotLight.target.position, {
    x: data.pos.x,
    y: data.pos.y + 1,
    z: data.pos.z,
    duration: 1.8,
    ease: "power2.inOut",
    onUpdate: () => {
      spotLight.target.updateMatrixWorld();
    }
  });
  
  // Gold accent warmth light move
  gsap.to(goldAccentLight.position, {
    x: data.pos.x,
    y: data.pos.y + 2,
    z: data.pos.z + 2,
    duration: 1.5,
    ease: "power2.inOut"
  });
  
  // Smoothly move the camera into close cinematic orbit
  gsap.to(camera.position, {
    x: data.camPos.x,
    y: data.camPos.y,
    z: data.camPos.z,
    duration: 2.2,
    ease: "power3.inOut"
  });
}

// ==========================================
// 11. Lightbox Detail View (Zoom on Click)
// ==========================================
function zoomToPlate(index) {
  if (isTransitioning) return;
  isTransitioning = true;
  
  const data = GALLERY_DATA[index];
  const targetFrame = frames[index];
  
  // Target position is extremely close right in front of the picture
  const closeCamX = data.pos.x;
  const closeCamY = data.pos.y + 3.1;
  const closeCamZ = data.pos.z + 1.8;
  
  // Swoop camera right up to the plate face
  gsap.to(camera.position, {
    x: closeCamX,
    y: closeCamY,
    z: closeCamZ,
    duration: 1.6,
    ease: "power3.inOut",
    onComplete: () => {
      // Open Lightbox window
      const lightbox = document.getElementById('photo-lightbox');
      const img = document.getElementById('lightbox-img');
      const title = document.getElementById('lightbox-title');
      const date = document.getElementById('lightbox-date');
      const desc = document.getElementById('lightbox-desc');
      const quote = document.getElementById('lightbox-quote');
      
      img.src = data.image;
      title.innerText = data.title;
      date.innerText = data.date;
      desc.innerText = data.desc;
      quote.innerText = `"${data.quote}"`;
      
      lightbox.classList.add('open');
      isTransitioning = false;
    }
  });
  
  // Rotate wireframe slightly to snap clean parallel facing
  gsap.to(targetFrame.rotation, {
    y: 0,
    x: 0,
    duration: 1.2
  });
}

function closeLightbox() {
  const lightbox = document.getElementById('photo-lightbox');
  lightbox.classList.remove('open');
  
  // Return camera back to slide position
  if (activeIndex >= 0) {
    isTransitioning = true;
    transitionCameraToPedestal(activeIndex);
    setTimeout(() => { isTransitioning = false; }, 1800);
  }
}

// ==========================================
// 12. Gold Stardust Cursor Trail (2D Canvas)
// ==========================================
function setup2DSparkleTrail() {
  const canvas = document.getElementById('sparkle-trail-canvas');
  const ctx = canvas.getContext('2d');
  
  let particles = [];
  
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  
  class Sparkle {
    constructor(x, y) {
      this.x = x;
      this.y = y;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 1.5;
      this.speedY = (Math.random() - 0.5) * 1.5 - 0.5; // slow float up
      this.opacity = 1;
      this.color = `hsla(${Math.random() * 20 + 35}, 75%, 65%, `; // golden hue range
    }
    
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      this.opacity -= 0.02;
    }
    
    draw() {
      ctx.fillStyle = this.color + this.opacity + ')';
      ctx.beginPath();
      // Draw diamond-like sparkle shape
      ctx.moveTo(this.x, this.y - this.size);
      ctx.lineTo(this.x + this.size, this.y);
      ctx.lineTo(this.x, this.y + this.size);
      ctx.lineTo(this.x - this.size, this.y);
      ctx.closePath();
      ctx.fill();
    }
  }
  
  window.addEventListener('mousemove', (e) => {
    // Generate few sparkles per move
    for (let i = 0; i < 2; i++) {
      particles.push(new Sparkle(e.clientX, e.clientY));
    }
  });
  
  // Animation Loop for 2D Canvas Trail
  function drawSparkles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
      
      if (particles[i].opacity <= 0) {
        particles.splice(i, 1);
        i--;
      }
    }
    requestAnimationFrame(drawSparkles);
  }
  
  drawSparkles();
}

// ==========================================
// 13. Floating Music Widget Logic
// ==========================================
function setupMusicPlayer() {
  const widget = document.getElementById('music-widget');
  const playBtn = document.getElementById('music-play-btn');
  const audio = document.getElementById('bg-audio');
  
  playBtn.addEventListener('click', () => {
    if (audio.paused) {
      audio.play().then(() => {
        widget.classList.add('playing');
        playBtn.classList.add('playing');
      }).catch(err => {
        console.warn("Audio play blocked by browser policy. User gesture registered.", err);
      });
    } else {
      audio.pause();
      widget.classList.remove('playing');
      playBtn.classList.remove('playing');
    }
  });
}





// ==========================================
// 15. Viewport Resizing
// ==========================================
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Re-align scroll tracks translation on window resize
  const scrollTracks = document.getElementById('scroll-track-sections');
  if (scrollTracks && activeIndex >= 0) {
    gsap.set(scrollTracks, { y: -activeIndex * window.innerHeight });
  }
}

// ==========================================
// 16. The Core WebGL Render Loop
// ==========================================
function animate() {
  requestAnimationFrame(animate);
  
  const time = clock.getElapsedTime();
  
  // A. Animate Hovering of 3D Photo Frames
  frames.forEach((frame, idx) => {
    frame.position.y = GALLERY_DATA[idx].pos.y + 3.1 + Math.sin(time * 1.5 + idx) * 0.12;
    frame.rotation.y = Math.sin(time * 0.35 + idx) * 0.08;
    frame.rotation.x = Math.cos(time * 0.25 + idx) * 0.02;
  });
  
  // A.2 Spin Gold Saturn Orbital Rings
  orbitalRingGroups.forEach((ringG, idx) => {
    ringG.children[0].rotation.z = time * 0.15 + idx;
    ringG.children[1].rotation.z = -time * 0.22 - idx;
    
    ringG.position.y = GALLERY_DATA[idx].pos.y + 3.1 + Math.sin(time * 1.5 + idx) * 0.12;
    ringG.rotation.y = Math.sin(time * 0.35 + idx) * 0.08;
    ringG.rotation.x = Math.cos(time * 0.25 + idx) * 0.02;
  });
  

  
  // B. Drifting silk ribbon meshes wave updates
  ribbons.forEach(ribbon => {
    const geo = ribbon.mesh.geometry;
    const positions = geo.attributes.position;
    const t = time * ribbon.speed + ribbon.waveOffset;
    
    for (let i = 0; i < positions.count; i++) {
      const y = positions.getY(i);
      const zOffset = Math.sin(t + y * 0.3) * 0.3;
      positions.setZ(i, zOffset);
    }
    positions.needsUpdate = true;
    ribbon.mesh.rotation.z = Math.sin(t * 0.2) * 0.05;
  });
  
  // C. Drifting Golden Dust Particles moves
  if (particleSystem && particlesGeometry) {
    const positionsAttr = particlesGeometry.attributes.position;
    const speeds = particleSystem.userData.speeds;
    
    for (let i = 0; i < positionsAttr.count; i++) {
      let x = positionsAttr.array[i * 3];
      let y = positionsAttr.array[i * 3 + 1];
      let z = positionsAttr.array[i * 3 + 2];
      
      const speed = speeds[i];
      
      y += speed.y;
      x += speed.x + Math.sin(time * speed.freq) * 0.005;
      z += speed.z;
      
      // Recycle particle to bottom if it exits top room ceiling
      if (y > 9) {
        y = -3;
        x = (Math.random() - 0.5) * 35;
        z = (Math.random() - 0.5) * 40 - 10;
      }
      
      positionsAttr.array[i * 3] = x;
      positionsAttr.array[i * 3 + 1] = y;
      positionsAttr.array[i * 3 + 2] = z;
    }
    positionsAttr.needsUpdate = true;
    
    // Slow pulsation of stardust opacity
    particleSystem.material.opacity = 0.85 + Math.sin(time * 0.8) * 0.15;
  }
  
  // D. Smooth Camera Parallax Smoothing (Damping)
  if (isExhibitionEntered && !isTransitioning && !document.getElementById('photo-lightbox').classList.contains('open')) {
    currentCameraOffset.x += (targetCameraOffset.x - currentCameraOffset.x) * 0.06;
    currentCameraOffset.y += (targetCameraOffset.y - currentCameraOffset.y) * 0.06;
    
    const activeData = GALLERY_DATA[activeIndex];
    
    camera.position.x = activeData.camPos.x + currentCameraOffset.x;
    camera.position.y = activeData.camPos.y + currentCameraOffset.y;
    
    // Subtle lookAt tracking active target pedestal center
    camera.lookAt(activeData.lookAt.x, activeData.lookAt.y, activeData.lookAt.z);
  }
  
  // Render
  renderer.render(scene, camera);
}
