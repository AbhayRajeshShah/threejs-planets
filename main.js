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
} from "three";

import gsap from "gsap/gsap-core";
import { CSSPlugin } from "gsap/CSSPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";

//register plugins
gsap.registerPlugin(CSSPlugin);
gsap.registerPlugin(ScrollTrigger);

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

//create-earth
const earthMaterial = new MeshStandardMaterial({
  map: earthTexture,
});
const earth = new Mesh(geometry, earthMaterial);

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
    moonParent.remove(sphere);
    scene.add(sphere);
    scene.remove(earth);
    earth.position.set(0, 0, 0);
    earth.rotation.set(0, 0, 0);
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
    earth.position.set(0, 0, 0);
    scene.add(earth);
    moonParent.add(sphere);
    scene.remove(sphere);
  }
  created = true;
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
};

loop();
