class ThreeScene {
    constructor() {
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        this.particles = [];
        this.init();
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.getElementById('three-container').appendChild(this.renderer.domElement);

        // Create floating particles
        this.createParticles();

        // Setup lighting
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        const pointLight = new THREE.PointLight(0x6366f1, 1, 100);
        pointLight.position.set(10, 10, 10);
        this.scene.add(pointLight);

        // Position camera
        this.camera.position.z = 30;

        // Start animation
        this.animate();

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    createParticles() {
        const geometries = [
            new THREE.IcosahedronGeometry(0.5, 0),
            new THREE.OctahedronGeometry(0.5, 0),
            new THREE.TetrahedronGeometry(0.5, 0)
        ];

        for (let i = 0; i < 50; i++) {
            const geometry = geometries[Math.floor(Math.random() * geometries.length)];
            const material = new THREE.MeshStandardMaterial({
                color: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.7, 0.6),
                emissive: new THREE.Color().setHSL(Math.random() * 0.3 + 0.6, 0.3, 0.1),
                transparent: true,
                opacity: 0.8
            });

            const mesh = new THREE.Mesh(geometry, material);
            
            // Random position
            mesh.position.set(
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50,
                (Math.random() - 0.5) * 50
            );

            // Random rotation
            mesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );

            this.scene.add(mesh);
            this.particles.push({
                mesh: mesh,
                speed: Math.random() * 0.02 + 0.01,
                rotationSpeed: Math.random() * 0.02 + 0.01
            });

            // Animate with GSAP
            gsap.to(mesh.position, {
                y: mesh.position.y + (Math.random() - 0.5) * 10,
                duration: Math.random() * 3 + 2,
                repeat: -1,
                yoyo: true,
                ease: "sine.inOut"
            });
        }
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Rotate particles
        this.particles.forEach(particle => {
            particle.mesh.rotation.x += particle.rotationSpeed;
            particle.mesh.rotation.y += particle.rotationSpeed;
        });

        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }
}

// Initialize scene
document.addEventListener('DOMContentLoaded', () => {
    new ThreeScene();
});
