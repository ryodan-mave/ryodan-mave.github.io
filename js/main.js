// ====================== MAIN.JS - All Scenes + WebXR ======================

document.addEventListener('webslides:ready', () => {
  initScene1(); // Tower of London + Dragon
  initScene2(); // Subway + BLE Beacons
  initScene3(); // Dramatic Scene
});

// ==============================================
// SCENE 1: Tower of London + Flying Dragon + Fire
// ==============================================
function initScene1() {
  const container = document.getElementById('scene1');
  if (!container) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x0a0a1f, 30, 120);

  const camera = new THREE.PerspectiveCamera(55, container.clientWidth / container.clientHeight, 0.1, 200);
  camera.position.set(8, 20, 42);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.shadowMap.enabled = true;
  container.appendChild(renderer.domElement);

  // Lighting
  scene.add(new THREE.AmbientLight(0x445577, 0.7));
  const moonLight = new THREE.DirectionalLight(0x99aaff, 1.4);
  moonLight.position.set(25, 50, 35);
  scene.add(moonLight);

  // Improved Tower
  const towerGroup = new THREE.Group();
  const mainTower = new THREE.Mesh(
    new THREE.BoxGeometry(11, 19, 11),
    new THREE.MeshLambertMaterial({ color: 0xddddee })
  );
  mainTower.position.y = 9.5;
  towerGroup.add(mainTower);

  // Corner Turrets
  for (let i = 0; i < 4; i++) {
    const turret = new THREE.Mesh(
      new THREE.CylinderGeometry(2.2, 2.5, 14, 8),
      new THREE.MeshLambertMaterial({ color: 0xbbbbcc })
    );
    const angle = (i * Math.PI) / 2 + 0.7;
    turret.position.set(Math.cos(angle) * 8, 7, Math.sin(angle) * 8);
    towerGroup.add(turret);
  }
  scene.add(towerGroup);

  // Dragon
  const dragon = new THREE.Group();
  scene.add(dragon);

  const loader = new THREE.GLTFLoader();
  loader.load('https://raw.githubusercontent.com/KhronosGroup/glTF-Sample-Assets/main/Models/DragonAttenuation/glTF-Binary/DragonAttenuation.glb',
    (gltf) => {
      gltf.scene.scale.set(2.4, 2.4, 2.4);
      dragon.add(gltf.scene);
    }
  );

  // Fire Particles
  const particleCount = 280;
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = 0; positions[i+1] = 0; positions[i+2] = 0;
    colors[i] = 1.0;
    colors[i+1] = 0.6;
    colors[i+2] = 0.05;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const fireMaterial = new THREE.PointsMaterial({
    size: 0.4,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthTest: false
  });

  const fireParticles = new THREE.Points(geometry, fireMaterial);
  dragon.add(fireParticles);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 10, 0);

  let time = 0;

  function animate() {
    if (!container.isConnected) return;
    requestAnimationFrame(animate);
    time += 0.016;

    // Dragon movement
    const radius = 27;
    dragon.position.x = Math.cos(time * 0.38) * radius;
    dragon.position.z = Math.sin(time * 0.38) * radius;
    dragon.position.y = 16 + Math.sin(time * 2.3) * 3.5;
    dragon.lookAt(0, 12, 0);

    // Fire animation
    const posAttr = geometry.attributes.position;
    for (let i = 0; i < particleCount * 3; i += 3) {
      posAttr.array[i + 1] += 0.18;
      posAttr.array[i] += (Math.random() - 0.5) * 0.25;
      posAttr.array[i + 2] += (Math.random() - 0.5) * 0.25;

      if (posAttr.array[i + 1] > 9) {
        posAttr.array[i] = (Math.random() - 0.5) * 1.2;
        posAttr.array[i + 1] = 1;
        posAttr.array[i + 2] = (Math.random() - 0.5) * 1.2;
      }
    }
    posAttr.needsUpdate = true;

    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

// ==============================================
// SCENE 2: Subway Station + Interactive BLE Beacons
// ==============================================
function initScene2() {
  const container = document.getElementById('scene2');
  if (!container) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x112233, 12, 65);

  const camera = new THREE.PerspectiveCamera(52, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(0, 7, 24);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.target.set(0, 3, 0);

  // Lighting
  scene.add(new THREE.AmbientLight(0x99aaff, 0.65));
  const mainLight = new THREE.PointLight(0xffeecc, 1.6, 70);
  mainLight.position.set(0, 18, 5);
  scene.add(mainLight);

  // Floor & Wall
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(50, 40), new THREE.MeshLambertMaterial({ color: 0x222222 }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);

  const wall = new THREE.Mesh(new THREE.PlaneGeometry(50, 18), new THREE.MeshLambertMaterial({ color: 0x334455 }));
  wall.position.set(0, 9, -18);
  scene.add(wall);

  // BLE Beacons
  const beacons = [];
  const beaconData = [
    { x: -12, z: -8, label: "Beacon A - Entrance" },
    { x:   0, z: -6, label: "Beacon B - Platform" },
    { x:  12, z: -8, label: "Beacon C - Exit" }
  ];

  beaconData.forEach(data => {
    const beacon = new THREE.Mesh(
      new THREE.CylinderGeometry(0.4, 0.45, 1.6, 16),
      new THREE.MeshPhongMaterial({ color: 0x0088ff })
    );
    beacon.position.set(data.x, 0.8, data.z);
    beacon.userData = { label: data.label, active: false };
    scene.add(beacon);
    beacons.push(beacon);

    // Particles
    const pCount = 80;
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(pCount * 3);

    for (let i = 0; i < pCount * 3; i += 3) {
      pPos[i] = 0;
      pPos[i+1] = Math.random() * 4;
      pPos[i+2] = 0;
    }

    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));

    const pMat = new THREE.PointsMaterial({
      size: 0.18, color: 0x00ffff, blending: THREE.AdditiveBlending, transparent: true
    });

    const particles = new THREE.Points(pGeo, pMat);
    particles.position.set(data.x, 0.3, data.z);
    scene.add(particles);
    beacon.userData.particles = particles;
  });

  // Click to activate beacons
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  container.addEventListener('click', (e) => {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(beacons);

    if (intersects.length > 0) {
      const b = intersects[0].object;
      b.userData.active = !b.userData.active;
      b.material.color.set(b.userData.active ? 0x00ff88 : 0x0088ff);
    }
  });

  let time = 0;
  function animate() {
    if (!container.isConnected) return;
    requestAnimationFrame(animate);
    time += 0.016;

    beacons.forEach(beacon => {
      if (beacon.userData.particles) {
        const pos = beacon.userData.particles.geometry.attributes.position;
        for (let i = 1; i < pos.count * 3; i += 3) {
          pos.array[i] += 0.045;
          if (pos.array[i] > 7) pos.array[i] = 0.5;
        }
        pos.needsUpdate = true;

        if (beacon.userData.active) {
          beacon.userData.particles.scale.setScalar(1 + Math.sin(time * 12) * 0.2);
        }
      }
    });

    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

// ==============================================
// SCENE 3: Dramatic / Future Vision Scene
// ==============================================
function initScene3() {
  const container = document.getElementById('scene3');
  if (!container) return;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x000011, 10, 60);

  const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
  camera.position.set(5, 10, 25);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Dramatic lighting
  scene.add(new THREE.AmbientLight(0x220033, 0.6));
  const glowLight = new THREE.PointLight(0x00ffff, 3, 50);
  glowLight.position.set(0, 8, 5);
  scene.add(glowLight);

  // Simple futuristic platform
  const platform = new THREE.Mesh(
    new THREE.CylinderGeometry(8, 8, 1, 32),
    new THREE.MeshPhongMaterial({ color: 0x112233 })
  );
  platform.rotation.x = Math.PI / 2;
  scene.add(platform);

  function animate() {
    if (!container.isConnected) return;
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

// ====================== WEBXR AR BUTTON ======================
document.getElementById('enterAR').addEventListener('click', async () => {
  // You can paste the full WebXR code from previous message here
  alert("WebXR AR Mode - Ready for integration (Hit Testing + Holograms)");
  // We'll expand this when you're ready
});
