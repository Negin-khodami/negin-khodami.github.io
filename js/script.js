/*
 * Custom JavaScript for Negin Khodami's landing page.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- 1. Animation Observer ---
  const observerOptions = { threshold: 0.1 };
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  function observeReveals(root = document) {
    const elements = root.querySelectorAll('.reveal');
    elements.forEach((el) => revealObserver.observe(el));
  }
  observeReveals(document);

  // --- 2. Stats Counters Animation ---
  const statsSection = document.querySelector('.stats');
  const counters = document.querySelectorAll('.counter');

  if (statsSection && counters.length) {
    const animateCounters = () => {
      counters.forEach((counter) => {
        const targetAttr = counter.getAttribute('data-target');
        const target = parseFloat(targetAttr);
        const suffix = counter.getAttribute('data-suffix') || '';
        let current = 0;
        const duration = 2000;
        const stepTime = 16; // approx 60fps
        const increment = target / (duration / stepTime);
        const hasDecimal = !Number.isInteger(target);
        
        const update = () => {
          current += increment;
          if (current < target) {
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

  // --- 3. Load Students (Updated for TOEFL & IELTS) ---
  const loadStudents = async () => {
    try {
      const response = await fetch('assets/students.json');
      if (!response.ok) throw new Error('Network response was not ok');
      const students = await response.json();
      const cardsContainer = document.getElementById('student-cards');
      if (!cardsContainer) return;
      
      cardsContainer.innerHTML = '';
      
      // Stats variables (We only calculate averages for IELTS to keep data clean)
      let ieltsSum = 0;
      let ieltsCount = 0;
      let highest = 0;
      let sevenPlus = 0;

      students.forEach((student) => {
        // Determine type (Default to IELTS if missing)
        const type = (student.type || 'IELTS').toUpperCase();
        const isToefl = type === 'TOEFL';

        // Update Stats (Only include IELTS in Band averages)
        if (!isToefl) {
            const score = parseFloat(student.overall);
            ieltsSum += score;
            ieltsCount++;
            highest = Math.max(highest, score);
            if (score >= 7.0) sevenPlus += 1;
        }

        // Create Card
        const card = document.createElement('div');
        card.className = 'result-card reveal';
        
        // Image
        const img = document.createElement('img');
        img.src = student.image || 'assets/default.jpg'; // Fallback image
        img.alt = `${student.name} scorecard`;
        
        // Overlay
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const h3 = document.createElement('h3');
        h3.textContent = student.name;

        // Badge for Exam Type
        const badge = document.createElement('span');
        badge.className = `exam-badge ${isToefl ? 'badge-toefl' : 'badge-ielts'}`;
        badge.textContent = type;
        
        const p = document.createElement('p');
        // Different labels for TOEFL vs IELTS
        const scoreLabel = isToefl ? "Total Score" : "Overall Band";
        
        p.innerHTML =
          `<strong>${scoreLabel}: ${student.overall}</strong><br>` +
          `Listening: ${student.listening}<br>` +
          `Reading: ${student.reading}<br>` +
          `Writing: ${student.writing}<br>` +
          `Speaking: ${student.speaking}`;

        overlay.appendChild(h3);
        overlay.appendChild(badge); // Add badge under name
        overlay.appendChild(p);
        card.appendChild(img);
        card.appendChild(overlay);
        cardsContainer.appendChild(card);
      });

      // Update UI Counters
      if (typeof observeReveals === 'function') {
        observeReveals(cardsContainer);
      }

      // Calculate Averages
      // 'studentsCount' shows TOTAL students (IELTS + TOEFL)
      const totalStudents = students.length;
      // 'averageBand' shows ONLY IELTS average
      const average = ieltsCount > 0 ? ieltsSum / ieltsCount : 0;

      const studentsCountEl = document.getElementById('studentsCount');
      const averageBandEl = document.getElementById('averageBand');
      const highestBandEl = document.getElementById('highestBand');
      const sevenPlusEl = document.getElementById('sevenPlusCount');

      if (studentsCountEl) studentsCountEl.setAttribute('data-target', totalStudents.toString());
      if (averageBandEl) averageBandEl.setAttribute('data-target', average.toFixed(1));
      if (highestBandEl) highestBandEl.setAttribute('data-target', highest.toString());
      if (sevenPlusEl) sevenPlusEl.setAttribute('data-target', sevenPlus.toString());

      // Trigger animation if already visible
      if (typeof animateCounters === 'function') animateCounters();

    } catch (err) {
      console.error('Failed to load students:', err);
    }
  };
  loadStudents();

  // --- 4. Load About Text ---
  const loadAbout = async () => {
    try {
      const aboutEl = document.getElementById('about-content');
      if (!aboutEl) return;
      const response = await fetch('assets/about.txt');
      if (!response.ok) throw new Error('Failed to load about text');
      const text = await response.text();
      const paragraphs = text.split(/\n+/).filter((line) => line.trim() !== '');
      aboutEl.innerHTML = paragraphs
        .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
        .join('');
    } catch (err) {
      console.error(err);
    }
  };
  loadAbout();

  // --- 5. Mobile Menu ---
  const menuToggle = document.querySelector('.menu-toggle');
  const navbar = document.querySelector('.navbar');
  if (menuToggle && navbar) {
    menuToggle.addEventListener('click', () => {
      navbar.classList.toggle('open');
    });
  }
});
