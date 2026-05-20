document.addEventListener('webslides:ready', () => {
  // Your existing Three.js scenes (Scene 1, 2, 3)...
  initScene1(); // Dragon
  initScene2(); // Subway + BLE
  initScene3();
});

// ====================== WEBXR AR FUNCTION ======================
let xrSession = null;

async function enterAR() {
  if (!navigator.xr) {
    alert("WebXR is not supported in this browser.");
    return;
  }

  try {
    const sessionInit = {
      requiredFeatures: ['hit-test'],           // Important for placing objects
      optionalFeatures: ['dom-overlay', 'local-floor']
    };

    xrSession = await navigator.xr.requestSession('immersive-ar', sessionInit);

    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2', { xrCompatible: true });

    const renderer = new THREE.WebGLRenderer({ context: gl, antialias: true });
    renderer.xr.enabled = true;
    renderer.xr.setSession(xrSession);

    // Create scene for AR
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera();

    // Add a simple hologram box as example
    const hologram = new THREE.Mesh(
      new THREE.BoxGeometry(0.4, 0.4, 0.4),
      new THREE.MeshPhongMaterial({ color: 0x00ffff, emissive: 0x008888 })
    );
    scene.add(hologram);

    // Add lighting
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light = new THREE.DirectionalLight(0xffffff, 1);
    light.position.set(1, 2, 3);
    scene.add(light);

    xrSession.addEventListener('end', () => {
      xrSession = null;
      console.log("AR Session ended");
    });

    renderer.setAnimationLoop((timestamp, frame) => {
      if (frame) {
        // You can add hit testing here
      }
      renderer.render(scene, camera);
    });

  } catch (err) {
    console.error(err);
    alert("Failed to start AR: " + err.message);
  }
}

// Attach button
document.getElementById('enterAR').addEventListener('click', enterAR);
