/*
 * Custom JavaScript for Negin Khodami's landing page.
 *
 * - Initializes AOS (Animate On Scroll) to trigger animations on scroll.
 * - Implements a typing effect using Typed.js for the hero subtitle.
 */

document.addEventListener('DOMContentLoaded', () => {
  // IntersectionObserver to reveal elements on scroll. Each element with
  // the class 'reveal' will gain the 'show' class when it enters the
  // viewport. This produces a subtle fade/slide animation defined in CSS.
  const observerOptions = {
    threshold: 0.1,
  };
  // IntersectionObserver to reveal elements on scroll. Elements must be
  // observed after they are added to the DOM. We'll define a helper
  // function below to observe both initial and dynamically added elements.
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Helper to observe any elements with the `.reveal` class within a given root
  // (default is the entire document). Call this after injecting new content.
  function observeReveals(root = document) {
    const elements = root.querySelectorAll('.reveal');
    elements.forEach((el) => revealObserver.observe(el));
  }

  // Observe all existing `.reveal` elements on page load
  observeReveals(document);

  // Note: The hero subtitle text is static; typed effect removed to ensure
  // compatibility in offline environments. If you wish to add a typing
  // animation, you can implement it here without external dependencies.

  /*
   * Animated counters for the facts & figures section. When the stats section
   * comes into view, each element with the class `counter` counts up from 0 to
   * its target value. A suffix (e.g. “+”) defined on the `data-suffix`
   * attribute is appended to the final number. The animation runs only once
   * when the section first enters the viewport.
   */
  const statsSection = document.querySelector('.stats');
  const counters = document.querySelectorAll('.counter');

  if (statsSection && counters.length) {
    const animateCounters = () => {
      counters.forEach((counter) => {
        const targetAttr = counter.getAttribute('data-target');
        const target = parseFloat(targetAttr);
        const suffix = counter.getAttribute('data-suffix') || '';
        let current = 0;
        const duration = 2000; // total time for animation in ms
        const stepTime = 1000 / 60; // approx 60fps
        const increment = target / (duration / stepTime);
        const hasDecimal = !(Number.isInteger(target));
        const update = () => {
          current += increment;
          if (current < target) {
            // If target has decimals, show one decimal place
            counter.textContent = hasDecimal
              ? current.toFixed(1) + suffix
              : Math.floor(current) + suffix;
            requestAnimationFrame(update);
          } else {
            counter.textContent = hasDecimal
              ? target.toFixed(1) + suffix
              : target + suffix;
          }
        };
        update();
      });
    };

    const statsObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statsObserver.observe(statsSection);
  }

  /*
   * Load student data from a separate JSON file and dynamically build
   * the results section. This allows Negin to update student scores and
   * names without modifying the HTML. Simply edit assets/students.json
   * to add, remove or change entries. After loading the data, statistics
   * (number of students, average overall band, highest band and count of
   * students with band 7 or higher) are computed and the counters are
   * updated accordingly.
   */
  const loadStudents = async () => {
    try {
      const response = await fetch('assets/students.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const students = await response.json();
      const cardsContainer = document.getElementById('student-cards');
      if (!cardsContainer) return;
      // Clear any existing content
      cardsContainer.innerHTML = '';
      let sum = 0;
      let highest = 0;
      let sevenPlus = 0;
      students.forEach((student, idx) => {
        const card = document.createElement('div');
        card.className = 'result-card reveal';
        // Image element
        const img = document.createElement('img');
        img.src = student.image;
        img.alt = `${student.name} scorecard`;
        // Overlay for scores
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        const h3 = document.createElement('h3');
        h3.textContent = student.name;
        const p = document.createElement('p');
        p.innerHTML =
          `Overall: ${student.overall}<br>` +
          `Listening: ${student.listening}<br>` +
          `Reading: ${student.reading}<br>` +
          `Writing: ${student.writing}<br>` +
          `Speaking: ${student.speaking}`;
        overlay.appendChild(h3);
        overlay.appendChild(p);
        card.appendChild(img);
        card.appendChild(overlay);
        cardsContainer.appendChild(card);
        // Update stats variables
        sum += parseFloat(student.overall);
        highest = Math.max(highest, parseFloat(student.overall));
        if (parseFloat(student.overall) >= 7.0) sevenPlus += 1;
      });
      // Once all cards are appended, observe them so they animate correctly
      if (typeof observeReveals === 'function') {
        observeReveals(cardsContainer);
      }
      const count = students.length;
      const average = count > 0 ? sum / count : 0;
      // Update counters with new targets
      const studentsCountEl = document.getElementById('studentsCount');
      const averageBandEl = document.getElementById('averageBand');
      const highestBandEl = document.getElementById('highestBand');
      const sevenPlusEl = document.getElementById('sevenPlusCount');
      if (studentsCountEl) studentsCountEl.setAttribute('data-target', count.toString());
      if (averageBandEl) averageBandEl.setAttribute('data-target', average.toFixed(1));
      if (highestBandEl) highestBandEl.setAttribute('data-target', highest.toString());
      if (sevenPlusEl) sevenPlusEl.setAttribute('data-target', sevenPlus.toString());
      // If the stats section is already visible, manually trigger the counter
      // animation so the numbers update immediately. Otherwise, the
      // IntersectionObserver will trigger animateCounters when the section
      // enters the viewport.
      if (typeof animateCounters === 'function') {
        animateCounters();
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };
  loadStudents();

  /*
   * Load the teacher's bio from a separate text file. The about section
   * contains a div with id `about-content` where this text will be injected.
   * This allows Negin to update her biography without editing the HTML.
   */
  const loadAbout = async () => {
    try {
      const aboutEl = document.getElementById('about-content');
      if (!aboutEl) return;
      const response = await fetch('assets/about.txt');
      if (!response.ok) throw new Error('Failed to load about text');
      const text = await response.text();
      // Convert newlines into paragraphs for better formatting. If the text
      // contains markdown-style line breaks (two spaces then newline) they
      // will be preserved as separate paragraphs.
      const paragraphs = text.split(/\n+/).filter((line) => line.trim() !== '');
      aboutEl.innerHTML = paragraphs
        .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`) // handle hard line breaks
        .join('');
    } catch (err) {
      console.error(err);
    }
  };
  loadAbout();

  /*
   * Mobile navigation toggle. On small screens, a hamburger icon is displayed. When the
   * icon is clicked, it toggles the `.open` class on the navbar, showing or hiding
   * the navigation links.
   */
  const menuToggle = document.querySelector('.menu-toggle');
  const navbar = document.querySelector('.navbar');
  if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
      navbar.classList.toggle('open');
    });
  }
});