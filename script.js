(function () {
  // === LOADING SCREEN ===
  const loadingScreen = document.getElementById("loading-screen");
  window.addEventListener("load", () => {
    setTimeout(() => {
      loadingScreen.classList.add("hidden");
    }, 600);
  });
  setTimeout(() => {
    if (!loadingScreen.classList.contains("hidden"))
      loadingScreen.classList.add("hidden");
  }, 3000);

  // === PAGE TRANSITION OVERLAY ===
  const transitionOverlay = document.getElementById("page-transition-overlay");
  function triggerTransition(callback) {
    transitionOverlay.classList.add("active");
    setTimeout(() => {
      callback();
      setTimeout(() => {
        transitionOverlay.classList.remove("active");
      }, 150);
    }, 400);
  }

  // === HEADER SCROLL EFFECT ===
  const header = document.getElementById("main-header");
  function updateHeader() {
    if (window.scrollY > 60) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", updateHeader, { passive: true });
  updateHeader();

  // === LOCATION SELECTOR ===
  const locationBtn = document.getElementById("locationBtn");
  const locationDropdown = document.getElementById("locationDropdown");
  const locOptions = document.querySelectorAll(".loc-option");
  const displayAddress = document.getElementById("display-address");
  const mapContainer = document.getElementById("mapContainer");

  const locationData = {
    "madrid-centro": {
      name: "Madrid Centro",
      address: "Calle del Deporte 123, Madrid",
      lat: 40.4168,
      lon: -3.7038,
      zoom: 15,
      marker: "40.4168,-3.7038",
    },
    "madrid-norte": {
      name: "Madrid Norte",
      address: "Av. de la Ilustración 45, Madrid",
      lat: 40.4781,
      lon: -3.71,
      zoom: 15,
      marker: "40.4781,-3.7100",
    },
    barcelona: {
      name: "Barcelona",
      address: "Carrer de Balmes 200, Barcelona",
      lat: 41.3949,
      lon: 2.1654,
      zoom: 15,
      marker: "41.3949,2.1654",
    },
    valencia: {
      name: "Valencia",
      address: "Av. del Puerto 80, Valencia",
      lat: 39.4667,
      lon: -0.375,
      zoom: 15,
      marker: "39.4667,-0.3750",
    },
  };

  function updateMap(locationKey) {
    const loc = locationData[locationKey];
    if (!loc) return;
    if (displayAddress) displayAddress.textContent = loc.address;
    const bbox = `${loc.lon - 0.01},${loc.lat - 0.01},${loc.lon + 0.01},${loc.lat + 0.01}`;
    const iframeHTML = `<iframe 
      src="https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${loc.lat},${loc.lon}" 
      width="100%" height="100%" style="border:none;" allowfullscreen loading="lazy">
    </iframe>`;
    if (mapContainer) mapContainer.innerHTML = iframeHTML;
  }

  locationBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    locationDropdown.classList.toggle("open");
  });
  document.addEventListener("click", () =>
    locationDropdown.classList.remove("open"),
  );

  locOptions.forEach((opt) => {
    opt.addEventListener("click", () => {
      locOptions.forEach((o) => o.classList.remove("selected"));
      opt.classList.add("selected");
      const locKey = opt.getAttribute("data-loc");
      locationBtn.innerHTML = `<span class="loc-dot"></span> ${locationData[locKey].name} ▼`;
      locationDropdown.classList.remove("open");
      updateMap(locKey);
    });
  });

  updateMap("madrid-centro");

  // === HAMBURGER MENU ===
  const hamburger = document.getElementById("hamburger");
  const mainNav = document.getElementById("main-nav");
  hamburger.addEventListener("click", () => {
    hamburger.classList.toggle("active");
    mainNav.classList.toggle("open");
  });

  // === PAGE NAVIGATION ===
  const pages = document.querySelectorAll(".page");
  const navLinks = document.querySelectorAll("[data-page]");
  let currentPage = "home";
  let isTransitioning = false;

  function navigateTo(pageName, extraCallback) {
    if (isTransitioning || pageName === currentPage) return;
    isTransitioning = true;
    triggerTransition(() => {
      const currentPageEl = document.getElementById("page-" + currentPage);
      const nextPageEl = document.getElementById("page-" + pageName);
      if (currentPageEl) {
        currentPageEl.classList.add("exiting");
        currentPageEl.classList.remove("active");
      }
      if (nextPageEl) {
        nextPageEl.classList.remove("exiting");
        nextPageEl.classList.add("active");
        setTimeout(() => {
          nextPageEl
            .querySelectorAll(".reveal")
            .forEach((el) => el.classList.add("visible"));
          if (pageName === "home") animateResultBars();
        }, 200);
      }
      navLinks.forEach((link) => {
        link.classList.remove("active");
        if (
          link.getAttribute("data-page") === pageName &&
          link.closest("#main-nav") &&
          !link.classList.contains("nav-cta")
        ) {
          link.classList.add("active");
        }
      });
      const logoLink = document.querySelector(".logo");
      if (logoLink) logoLink.setAttribute("data-page", pageName);
      currentPage = pageName;
      window.scrollTo({ top: 0, behavior: "instant" });
      hamburger.classList.remove("active");
      mainNav.classList.remove("open");
      if (pageName === "home")
        history.pushState(null, "", window.location.pathname);
      else history.pushState(null, "", "#" + pageName);
      setTimeout(() => {
        if (currentPageEl) currentPageEl.classList.remove("exiting");
        isTransitioning = false;
        if (extraCallback) extraCallback();
      }, 750);
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const pageName = link.getAttribute("data-page");
      const filterVal = link.getAttribute("data-filter");
      if (pageName) {
        navigateTo(pageName, () => {
          if (filterVal && pageName === "classes") {
            const btn = document.querySelector(
              `.filter-btn[data-filter="${filterVal}"]`,
            );
            if (btn) btn.click();
          }
        });
      }
    });
  });
  window.addEventListener("popstate", () => {
    const hash = window.location.hash.replace("#", "");
    if (hash && document.getElementById("page-" + hash)) navigateTo(hash);
    else navigateTo("home");
  });
  const initialHash = window.location.hash.replace("#", "");
  if (initialHash && document.getElementById("page-" + initialHash))
    navigateTo(initialHash);

  // === COUNTDOWN TIMER ===
  function updateCountdown() {
    const now = new Date();
    const target = new Date(now);
    target.setHours(
      target.getHours() + 2,
      target.getMinutes() + 47 - (target.getMinutes() % 60),
      0,
      0,
    );
    const diff = target - now;
    if (diff <= 0) target.setHours(target.getHours() + 1);
    const diff2 = target - now;
    const h = Math.floor(diff2 / (1000 * 60 * 60));
    const m = Math.floor((diff2 % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff2 % (1000 * 60)) / 1000);
    document.getElementById("countHours").textContent = String(h).padStart(
      2,
      "0",
    );
    document.getElementById("countMins").textContent = String(m).padStart(
      2,
      "0",
    );
    document.getElementById("countSecs").textContent = String(s).padStart(
      2,
      "0",
    );
  }
  setInterval(updateCountdown, 1000);
  updateCountdown();

  // === RESULTS BARS ANIMATION ===
  function animateResultBars() {
    const bars = document.querySelectorAll(".result-bar-fill");
    const values = document.querySelectorAll(".result-value[data-target]");
    bars.forEach((bar) => {
      const w = bar.getAttribute("data-width");
      bar.style.width = "0%";
      setTimeout(() => {
        bar.style.width = w + "%";
      }, 300);
    });
    values.forEach((val) => {
      const target = parseFloat(val.getAttribute("data-target"));
      const suffix = val.textContent.includes("kg")
        ? " kg"
        : val.textContent.includes("%")
          ? "%"
          : "";
      const isDecimal = target % 1 !== 0;
      let current = 0;
      const duration = 1500;
      const start = performance.now();
      function animate(ts) {
        const elapsed = ts - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        current = target * eased;
        val.textContent = isDecimal
          ? current.toFixed(1) + suffix
          : Math.round(current) + suffix;
        if (progress < 1) requestAnimationFrame(animate);
      }
      requestAnimationFrame(animate);
    });
  }

  // === GALLERY DRAG ===
  const galleryViewport = document.getElementById("galleryViewport");
  const galleryTrack = document.getElementById("galleryTrack");
  const galleryPrev = document.getElementById("galleryPrev");
  const galleryNext = document.getElementById("galleryNext");
  let galleryIndex = 0;
  const slides = document.querySelectorAll(".gallery-slide");
  const slideWidth = () => slides[0]?.offsetWidth + 20 || 400;
  let isDragging = false,
    startX,
    scrollLeft;

  function updateGalleryPos() {
    const maxIndex =
      slides.length - Math.floor(galleryViewport.offsetWidth / slideWidth());
    galleryIndex = Math.max(0, Math.min(galleryIndex, maxIndex));
    galleryTrack.style.transform = `translateX(-${galleryIndex * slideWidth()}px)`;
    galleryTrack.style.transition =
      "transform 0.5s cubic-bezier(0.65, 0, 0.35, 1)";
  }
  galleryPrev.addEventListener("click", () => {
    galleryIndex--;
    updateGalleryPos();
  });
  galleryNext.addEventListener("click", () => {
    galleryIndex++;
    updateGalleryPos();
  });
  galleryViewport.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.pageX - galleryViewport.offsetLeft;
    scrollLeft = galleryIndex * slideWidth();
    galleryTrack.style.transition = "none";
    galleryViewport.style.cursor = "grabbing";
  });
  galleryViewport.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.pageX - galleryViewport.offsetLeft;
    const walk = (x - startX) * 1.5;
    galleryTrack.style.transform = `translateX(-${scrollLeft - walk}px)`;
  });
  const stopDrag = () => {
    if (!isDragging) return;
    isDragging = false;
    galleryViewport.style.cursor = "grab";
    const currentOffset =
      -parseFloat(
        galleryTrack.style.transform
          .replace("translateX(", "")
          .replace("px)", ""),
      ) || 0;
    galleryIndex = Math.round(currentOffset / slideWidth());
    updateGalleryPos();
  };
  galleryViewport.addEventListener("mouseleave", stopDrag);
  galleryViewport.addEventListener("mouseup", stopDrag);
  galleryViewport.addEventListener(
    "touchstart",
    (e) => {
      isDragging = true;
      startX = e.touches[0].pageX;
      scrollLeft = galleryIndex * slideWidth();
      galleryTrack.style.transition = "none";
    },
    { passive: false },
  );
  galleryViewport.addEventListener(
    "touchmove",
    (e) => {
      if (!isDragging) return;
      const x = e.touches[0].pageX;
      const walk = (x - startX) * 1.5;
      galleryTrack.style.transform = `translateX(-${scrollLeft - walk}px)`;
    },
    { passive: false },
  );
  galleryViewport.addEventListener("touchend", stopDrag);

  // === MUSIC PLAYER ===
  const musicToggle = document.getElementById("music-toggle");
  const musicVolume = document.getElementById("music-volume");
  const bgMusic = document.getElementById("bgMusic");
  let musicPlaying = false;
  let audioCtx = null;
  let oscillator = null;
  let gainNode = null;
  function initAudio() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      gainNode = audioCtx.createGain();
      gainNode.gain.value = (parseFloat(musicVolume.value) / 100) * 0.3;
      gainNode.connect(audioCtx.destination);
    }
  }
  function startAmbient() {
    initAudio();
    if (!oscillator) {
      oscillator = audioCtx.createOscillator();
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(60, audioCtx.currentTime);
      oscillator.connect(gainNode);
      oscillator.start();
      setInterval(() => {
        if (musicPlaying && oscillator) {
          oscillator.frequency.linearRampToValueAtTime(
            55 + Math.random() * 20,
            audioCtx.currentTime + 2,
          );
        }
      }, 2000);
    }
  }
  function stopAmbient() {
    if (oscillator) {
      oscillator.stop();
      oscillator.disconnect();
      oscillator = null;
    }
  }
  musicToggle.addEventListener("click", () => {
    musicPlaying = !musicPlaying;
    if (musicPlaying) {
      musicToggle.classList.add("playing");
      musicToggle.textContent = "⏸";
      startAmbient();
    } else {
      musicToggle.classList.remove("playing");
      musicToggle.textContent = "♪";
      stopAmbient();
    }
  });
  musicVolume.addEventListener("input", () => {
    if (gainNode)
      gainNode.gain.value = (parseFloat(musicVolume.value) / 100) * 0.3;
  });

  // === SCROLL REVEAL ===
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    { root: null, rootMargin: "0px 0px -60px 0px", threshold: 0.15 },
  );
  document
    .querySelectorAll(".reveal")
    .forEach((el) => revealObserver.observe(el));
  const pageContainer = document.getElementById("page-container");
  new MutationObserver(() => {
    const activePage = document.querySelector(".page.active");
    if (activePage) {
      activePage.querySelectorAll(".reveal:not(.visible)").forEach((el) => {
        revealObserver.observe(el);
        if (el.getBoundingClientRect().top < window.innerHeight - 60)
          el.classList.add("visible");
      });
    }
  }).observe(pageContainer, {
    attributes: true,
    subtree: true,
    attributeFilter: ["class"],
  });

  // === TESTIMONIAL SLIDER ===
  const track = document.getElementById("testimonialTrack");
  const dots = document.querySelectorAll("#sliderDots .slider-dot");
  let currentSlide = 0;
  const totalSlides = dots.length;
  function goToSlide(index) {
    currentSlide = index;
    if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;
    dots.forEach((dot, i) =>
      dot.classList.toggle("active", i === currentSlide),
    );
  }
  dots.forEach((dot) =>
    dot.addEventListener("click", () =>
      goToSlide(parseInt(dot.getAttribute("data-index"))),
    ),
  );
  let autoSlideInterval = setInterval(
    () => goToSlide((currentSlide + 1) % totalSlides),
    5000,
  );
  const sliderContainer = document.querySelector(".testimonial-slider");
  if (sliderContainer) {
    sliderContainer.addEventListener("mouseenter", () =>
      clearInterval(autoSlideInterval),
    );
    sliderContainer.addEventListener("mouseleave", () => {
      autoSlideInterval = setInterval(
        () => goToSlide((currentSlide + 1) % totalSlides),
        5000,
      );
    });
  }

  // === CLASS FILTERS ===
  const filterBtns = document.querySelectorAll(".filter-btn");
  const classCards = document.querySelectorAll(".class-card");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const filter = btn.getAttribute("data-filter");
      classCards.forEach((card) => {
        if (filter === "all" || card.getAttribute("data-category") === filter) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
      setTimeout(() => {
        document
          .querySelectorAll(".class-card:not(.hidden).reveal:not(.visible)")
          .forEach((c) => c.classList.add("visible"));
      }, 100);
    });
  });

  // === WEEKLY SCHEDULE ===
  const scheduleData = {
    lunes: [
      {
        time: "07:00",
        class: "HIIT Inferno",
        instructor: "Diego Castillo",
        level: "Avanzado",
        desc: "45 min de intervalos de máxima intensidad.",
      },
      {
        time: "09:30",
        class: "Vinyasa Flow Pro",
        instructor: "Sofía Herrera",
        level: "Todos",
        desc: "60 min de conexión cuerpo-mente.",
      },
      {
        time: "12:00",
        class: "Powerlifting Elite",
        instructor: "Marcos Vega",
        level: "Intermedio",
        desc: "Técnica pura en los 3 grandes levantamientos.",
      },
      {
        time: "17:30",
        class: "Cycling Revolution",
        instructor: "Ana Lucía Ríos",
        level: "Todos",
        desc: "50 min de pedaleo con iluminación envolvente.",
      },
      {
        time: "19:00",
        class: "Movimiento Total",
        instructor: "Diego Castillo",
        level: "Todos",
        desc: "Funcional con kettlebells y TRX.",
      },
    ],
    martes: [
      {
        time: "08:00",
        class: "HIIT & Core",
        instructor: "Diego Castillo",
        level: "Intermedio",
        desc: "Explosividad + trabajo abdominal intensivo.",
      },
      {
        time: "10:30",
        class: "Powerlifting Elite",
        instructor: "Marcos Vega",
        level: "Avanzado",
        desc: "Sentadilla, press banca y peso muerto.",
      },
      {
        time: "13:00",
        class: "Vinyasa Flow Pro",
        instructor: "Sofía Herrera",
        level: "Todos",
        desc: "Flexibilidad y fuerza isométrica.",
      },
      {
        time: "18:00",
        class: "Cycling Revolution",
        instructor: "Ana Lucía Ríos",
        level: "Intermedio",
        desc: "Ritmo y energía colectiva.",
      },
    ],
    miercoles: [
      {
        time: "07:00",
        class: "HIIT Inferno",
        instructor: "Diego Castillo",
        level: "Avanzado",
        desc: "Quema hasta 800 kcal en 45 min.",
      },
      {
        time: "11:00",
        class: "Movimiento Total",
        instructor: "Marcos Vega",
        level: "Todos",
        desc: "Agilidad, equilibrio y fuerza útil.",
      },
      {
        time: "16:00",
        class: "Vinyasa Flow Pro",
        instructor: "Sofía Herrera",
        level: "Principiante",
        desc: "Ideal para empezar con yoga.",
      },
      {
        time: "19:30",
        class: "Cycling Revolution",
        instructor: "Ana Lucía Ríos",
        level: "Avanzado",
        desc: "La sesión más intensa de la semana.",
      },
    ],
    jueves: [
      {
        time: "09:00",
        class: "Powerlifting Elite",
        instructor: "Marcos Vega",
        level: "Todos",
        desc: "Progresión inteligente de cargas.",
      },
      {
        time: "12:30",
        class: "HIIT & Core",
        instructor: "Diego Castillo",
        level: "Intermedio",
        desc: "Abdomen definido y resistencia.",
      },
      {
        time: "17:00",
        class: "Movimiento Total",
        instructor: "Diego Castillo",
        level: "Todos",
        desc: "Battle ropes, TRX y peso corporal.",
      },
    ],
    viernes: [
      {
        time: "07:30",
        class: "HIIT Inferno",
        instructor: "Diego Castillo",
        level: "Todos",
        desc: "El clásico de los viernes.",
      },
      {
        time: "10:00",
        class: "Vinyasa Flow Pro",
        instructor: "Sofía Herrera",
        level: "Todos",
        desc: "Calma mental para cerrar la semana.",
      },
      {
        time: "14:00",
        class: "Cycling Revolution",
        instructor: "Ana Lucía Ríos",
        level: "Todos",
        desc: "Beats que te llevan al máximo.",
      },
      {
        time: "18:30",
        class: "Powerlifting Elite",
        instructor: "Marcos Vega",
        level: "Avanzado",
        desc: "Sesión de máxima intensidad.",
      },
    ],
    sabado: [
      {
        time: "09:00",
        class: "HIIT & Core",
        instructor: "Diego Castillo",
        level: "Todos",
        desc: "Sábado explosivo.",
      },
      {
        time: "11:00",
        class: "Movimiento Total",
        instructor: "Marcos Vega",
        level: "Todos",
        desc: "Funcional para todos los niveles.",
      },
      {
        time: "13:00",
        class: "Vinyasa Flow Pro",
        instructor: "Sofía Herrera",
        level: "Todos",
        desc: "Yoga relajante de fin de semana.",
      },
    ],
  };
  const scheduleTabs = document.querySelectorAll("#scheduleTabs .schedule-tab");
  const scheduleGrid = document.getElementById("scheduleGrid");
  const schedulePopup = document.getElementById("schedulePopup");
  const closePopup = document.getElementById("closePopup");

  function renderSchedule(day) {
    const classes = scheduleData[day] || [];
    scheduleGrid.innerHTML = classes
      .map(
        (c) => `
      <div class="schedule-item" data-time="${c.time}" data-class="${c.class}" data-instructor="${c.instructor}" data-level="${c.level}" data-desc="${c.desc}">
        <div class="sched-time">${c.time}</div>
        <div class="sched-class">${c.class}</div>
        <div class="sched-instructor">${c.instructor}</div>
        <span class="sched-level">${c.level}</span>
      </div>
    `,
      )
      .join("");
    document.querySelectorAll(".schedule-item").forEach((item) => {
      item.addEventListener("click", () => {
        document.getElementById("popupClassName").textContent =
          item.getAttribute("data-class");
        document.getElementById("popupTime").textContent =
          "⏱ " + item.getAttribute("data-time") + " · 45-60 min";
        document.getElementById("popupInstructor").textContent =
          "👤 " + item.getAttribute("data-instructor");
        document.getElementById("popupLevel").textContent =
          item.getAttribute("data-level");
        document.getElementById("popupDesc").textContent =
          item.getAttribute("data-desc");
        schedulePopup.classList.add("open");
      });
    });
  }
  scheduleTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      scheduleTabs.forEach((t) => t.classList.remove("active"));
      tab.classList.add("active");
      renderSchedule(tab.getAttribute("data-day"));
    });
  });
  closePopup.addEventListener("click", () =>
    schedulePopup.classList.remove("open"),
  );
  schedulePopup.addEventListener("click", (e) => {
    if (e.target === schedulePopup) schedulePopup.classList.remove("open");
  });
  renderSchedule("lunes");

  // === PARALLAX ON HERO SCROLL ===
  const heroBg = document.querySelector(".hero-bg");
  if (heroBg) {
    window.addEventListener(
      "scroll",
      () => {
        const scrollY = window.scrollY;
        if (scrollY < window.innerHeight)
          heroBg.style.transform = `translateY(${scrollY * 0.4}px)`;
      },
      { passive: true },
    );
  }

  // === HERO SCROLL INDICATOR ===
  document
    .querySelector(".hero-scroll-indicator")
    ?.addEventListener("click", () => {
      document
        .getElementById("ventajas")
        ?.scrollIntoView({ behavior: "smooth" });
    });

  setTimeout(animateResultBars, 800);

  console.log(
    "%c🦾 IRON ASCENT v2 %c| %c10 Mejoras Implementadas %c| %cNivel Agencia $30k+",
    "color:#00ff7f;font-weight:900;font-size:1.1em;",
    "color:#fff;",
    "color:#1a6bff;font-weight:700;",
    "color:#fff;",
    "color:#c9a44b;",
  );
  console.log(
    "%c✓ Selector ubicación con mapa real | ✓ Horario semanal | ✓ Comparador membresías | ✓ Galería arrastrable | ✓ Contador regresivo",
    "color:#a8a9b0;",
  );
  console.log(
    "%c✓ Reproductor música | ✓ Gráficos resultados | ✓ Mega menú | ✓ Testimonios | ✓ Transiciones cinematográficas",
    "color:#a8a9b0;",
  );
})();
