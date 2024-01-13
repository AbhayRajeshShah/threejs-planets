import {
  PerspectiveCamera,
  Scene,
  WebGLRenderer,
  TextureLoader,
  RepeatWrapping,
  SphereGeometry,
  MeshStandardMaterial,
  Mesh,
  PointLight,
  Object3D,
  AmbientLight,
  Raycaster,
} from "three";

import gsap from "gsap/gsap-core";
import { CSSPlugin } from "gsap/CSSPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/all";

//mouse positions
let pointer = {
  x: 0,
  y: 0,
};

//initialize raycaster

const raycaster = new Raycaster();

//register plugins
gsap.registerPlugin(CSSPlugin);
gsap.registerPlugin(ScrollTrigger);
gsap.registerPlugin(ScrollToPlugin);

//initialize renderer and create scene
const canvas = document.querySelector(".webgl");
const renderer = new WebGLRenderer({ canvas });
renderer.setSize(window.innerWidth, window.innerHeight);
const scene = new Scene();

// perspective camera
const camera = new PerspectiveCamera(
  30,
  window.innerWidth / window.innerHeight,
  0.1,
  100
);

camera.position.z = 20;
scene.add(camera);

// Create texture
const textureLoader = new TextureLoader();

//MoonTexture
const moon = textureLoader.load("moon.jpg");
moon.wrapS = RepeatWrapping;
moon.wrapT = RepeatWrapping;
moon.repeat.set(4, 4);

//EarthTexture
const earthTexture = textureLoader.load("earth.jpg");

//create-moon
const geometry = new SphereGeometry(3, 64, 64);
const material = new MeshStandardMaterial({ map: moon, normalMap: moon });
const sphere = new Mesh(geometry, material);
scene.add(sphere);

//create sun
const sunTexture = textureLoader.load("sun.jpg");
const sunMaterial = new MeshStandardMaterial({ map: sunTexture });
const sun = new Mesh(geometry, sunMaterial);
sun.position.set(0, 0, 170);
scene.add(sun);

//lighting up the sun
const ambientLight = new AmbientLight(0xffffff, 2);
ambientLight.intensity = 0;
sun.add(ambientLight);

//create-earth
const earthMaterial = new MeshStandardMaterial({
  map: earthTexture,
});
const earth = new Mesh(geometry, earthMaterial);
scene.add(earth);
earth.position.set(0, 0, -100);

// point-light
const pointLight = new PointLight(0xffffff, 100, 100);
pointLight.position.set(0, 0, 10);
scene.add(pointLight);

//Moon-Parent so moon orbits it instead of sun
const moonParent = new Object3D();
scene.add(moonParent);

//initial-animations
gsap.fromTo(
  sphere.position,
  { x: 0, y: 0, z: -2 },
  { x: -5, y: 0, z: 0, duration: 1.5 }
);

gsap.fromTo(
  sphere.rotation,
  { x: 0, y: 0, z: 0 },
  { x: 0, y: -5, z: 0, duration: 1.5 }
);

gsap.fromTo(
  sphere.scale,
  { x: 0.8, y: 0.8, z: 0.8 },
  { x: 1, y: 1, z: 1, duration: 1.5 }
);

const tl = gsap.timeline({ defaults: { duration: 1.5 } });

tl.fromTo(
  document.querySelector(".intro-desc"),
  { opacity: 0 },
  { opacity: 1 }
);

//set created to false (tells if earth exists or no)
let created = false;

//for scroll animations
let sa = gsap.timeline();

//tells us we reached 2nd section i.e remove earth
const onReachingSecond = () => {
  console.log("second");
  if (created) {
    created = false;
    scene.add(sphere);
    gsap.to(earth.position, { z: -100, duration: 0.5 });
    moonParent.rotation.set(0, 0, 0);
  }
};

//animations for second section
let secondSectionOption = {
  trigger: ".second",
  scrub: true,
  start: "top 80%",
  end: "bottom bottom",
  immediateRender: false,
};

sa.to(".intro", {
  scrollTrigger: {
    ...secondSectionOption,
    end: "bottom bottom",
  },
  opacity: 0,
  xPercent: 100,
});

sa.to(sphere.position, {
  scrollTrigger: secondSectionOption,
  x: 4,
  y: 0,
  z: 0,
});

sa.to(sphere.scale, {
  scrollTrigger: secondSectionOption,
  x: 1.5,
  y: 1.5,
  z: 1.5,
});

sa.to(sphere.rotation, {
  x: -0.25,
  y: 0.25,
  z: 0,
  scrollTrigger: secondSectionOption,
});

//when coming up from third section animations (basically repeat second section animations with different breakpoints)
sa.to(sphere.position, {
  x: 4,
  y: 0,
  z: 0,
  scrollTrigger: {
    ...secondSectionOption,
    onUpdate: onReachingSecond,
    start: "bottom start",
    end: "bottom bottom",
    scrub: true,
    immediateRender: false,
  },
});

sa.to(sphere.scale, {
  x: 1.5,
  y: 1.5,
  z: 1.5,
  scrollTrigger: {
    ...secondSectionOption,
    start: "bottom start",
    end: "bottom bottom",
    scrub: true,
    immediateRender: false,
  },
});

sa.to(sphere.rotation, {
  x: -0.25,
  y: 0.25,
  z: 0,
  scrollTrigger: {
    ...secondSectionOption,
    start: "bottom start",
    end: "bottom bottom",
    scrub: true,
    immediateRender: false,
  },
});

//break point for third section (i.e add earth)
const onReachingThird = () => {
  if (!created) {
    gsap.to(earth.position, { z: 0, duration: 0.5 });
    moonParent.add(sphere);
    created = true;
  }
  console.log("reached third");
};

//animations for third section
sa.to(sphere.scale, {
  x: 0.25,
  y: 0.25,
  z: 0.25,
  scrollTrigger: {
    trigger: ".third",
    scrub: true,
    immediateRender: false,
    start: "top 80%",
    end: "bottom bottom",
    // onUpdate: onReachingThird,
  },
});

sa.to(sphere.position, {
  x: 8,
  z: -4,
  scrollTrigger: {
    trigger: ".third",
    scrub: true,
    immediateRender: false,
    start: "top 80%",
    end: "bottom bottom",
  },
});

sa.to(sphere.rotation, {
  x: 0.25,
  y: 1.5,
  z: 0,
  scrollTrigger: {
    trigger: ".third",
    scrub: true,
    immediateRender: false,
    start: "top 80%",
    end: "bottom bottom",
  },
});

//no animation just check for breakpoint
sa.to(sphere.position, {
  scrollTrigger: {
    trigger: ".third",
    scrub: true,
    start: "top top",
    end: "bottom bottom",
    onUpdate: onReachingThird,
  },
});

let recentlyClicked = false;
let done = false;

//loop to constantly update canvas
const loop = () => {
  // if earth is added simply rotate earth and moonParent
  if (created) {
    moonParent.rotation.y += 0.000343;
    earth.rotation.y += 0.01;
  }
  //rotate moon
  renderer.render(scene, camera);
  sphere.rotation.x += 0.001;
  sphere.rotation.y += 0.001;
  window.requestAnimationFrame(loop);
  //check for object intersection when day
  if (recentlyClicked && day && !done) {
    recentlyClicked = false;
    raycaster.setFromCamera(pointer, camera);
    let intersections = raycaster.intersectObjects(scene.children, false);
    if (intersections.length > 0) {
      console.log(intersections);
      gsap.to(".cringe", { opacity: 1, duration: 1.5 });
      window.setTimeout(() => {
        gsap.to(".overlay", { yPercent: -100, duration: 1 });
      }, 750);
    }
  }
};

loop();

//boolean to check for sun
let day = false;

//work on sun
document.querySelectorAll(".icon").forEach((icon) => {
  icon.addEventListener("click", (e) => {
    day = !day;
    if (day) {
      gsap.to(".day", { opacity: 0, duration: 2 });
      gsap.to(".day", { display: "none", duration: 3 });
      gsap.to(camera.position, { z: 190, duration: 1.5 });
      gsap.to(ambientLight, { intensity: 2, duration: 3 });
      gsap.to(".overlay", { yPercent: 0 });
      gsap.to(".cringe", { opacity: 0 });
      window.setTimeout(() => {
        gsap.to(window, { duration: 1, scrollTo: { y: 0 } });
        gsap.to(".night", { display: "grid", duration: 2 });
        gsap.to(".night", { opacity: 1, duration: 2 });
      }, 1500);
    } else {
      sphere.rotation.set(0, 0, 0);
      gsap.to(".night", { opacity: 0, duration: 2 });
      gsap.to(".night", { display: "none", duration: 3 });
      gsap.to(camera.position, { z: 20, duration: 3 });
      gsap.to(ambientLight, { intensity: 0, duration: 3 });
      window.setTimeout(() => {
        gsap.to(window, { duration: 1, scrollTo: { y: 0 } });
        sphere.position.set(-5, 0, 0);
        sphere.scale.set(1, 1, 1);
        gsap.to(".day", { display: "block", duration: 2 });
        gsap.to(".day", { opacity: 1, duration: 2 });
      }, 1500);
    }
  });
});

window.addEventListener("click", (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  console.log(e.target);
  recentlyClicked = true;
});

window.onbeforeunload = () => {
  gsap.to(window, { scrollTo: { y: 0 } });
  history.scrollRestoration = "manual";
};
