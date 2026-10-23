

(function () {
  'use strict';

  
  const state = {
    normalityLevel: 0.0,
    anomaliesCount: 17,
    sfxEnabled: false,
    sarcasmEnabled: true,
    chaosActive: false,
    chaosTimer: null,
    chaosCountdown: 8,
    normalityClickCount: 0,
    runawayDodges: 0,
    achievements: {
      dividedByZero: false,
      dodgedButton: false,
      traveled404: false,
      konamiRave: false,
      pokedNormality: false,
      loginHellFailed: false,
      weirdIdentityMade: false,
      abnormalSearched: false,
    },
  };

  
  let audioCtx = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playTone(freq, type = 'sine', duration = 0.1, gainVal = 0.08) {
    if (!state.sfxEnabled) return;
    try {
      initAudio();
      if (!audioCtx) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
      gain.gain.setValueAtTime(gainVal, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + duration);
    } catch {
      
    }
  }

  function playSound(soundType) {
    if (!state.sfxEnabled) return;
    switch (soundType) {
      case 'click':
        playTone(600, 'sine', 0.04, 0.04);
        break;
      case 'beep':
        playTone(880, 'triangle', 0.08, 0.05);
        break;
      case 'error':
        playTone(180, 'sawtooth', 0.25, 0.09);
        break;
      case 'warp':
        try {
          initAudio();
          if (!audioCtx) return;
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(150, audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(900, audioCtx.currentTime + 0.35);
          gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        } catch {}
        break;
      case 'success':
        playTone(523.25, 'sine', 0.08, 0.06);
        setTimeout(() => playTone(659.25, 'sine', 0.08, 0.06), 90);
        setTimeout(() => playTone(783.99, 'sine', 0.16, 0.08), 180);
        break;
      case 'alarm':
        playTone(440, 'square', 0.12, 0.06);
        setTimeout(() => playTone(330, 'square', 0.12, 0.06), 140);
        break;
    }
  }

  
  function showToast(message, type = 'cyan', duration = 3800) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `cyber-toast toast-${type}`;
    
    let icon = '⚡';
    if (type === 'pink') icon = '⚠️';
    if (type === 'yellow') icon = '💡';
    if (type === 'purple') icon = '🌀';

    toast.innerHTML = `<span style="font-size: 1.1rem; line-height: 1; flex-shrink: 0;">${icon}</span><div>${message}</div>`;
    container.appendChild(toast);

    requestAnimationFrame(() => {
      toast.classList.add('show');
    });

    playSound('beep');

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 350);
    }, duration);
  }

  
  function unlockAchievement(key, name, desc) {
    if (state.achievements[key]) return;
    state.achievements[key] = true;

    const card = document.querySelector(`[data-achievement="${key}"]`);
    if (card) {
      card.classList.add('unlocked');
    }

    showToast(`<strong>ACHIEVEMENT:</strong> ${name} — ${desc}`, 'yellow', 4500);
    playSound('success');

    state.anomaliesCount++;
    updateTelemetry();
  }

  
  function updateTelemetry() {
    const normEl = document.getElementById('telemetry-normality');
    const normBtn = document.getElementById('btn-normality-status');
    const anomEl = document.getElementById('telemetry-anomalies');

    const formattedNorm = `${state.normalityLevel.toFixed(2)}%`;
    if (normEl) normEl.textContent = formattedNorm;

    if (normBtn) {
      const valEl = normBtn.querySelector('.gauge-val');
      if (valEl) {
        valEl.textContent = formattedNorm;
      } else {
        normBtn.innerHTML = `<span>⚡</span> <span class="gauge-label-full">NORMALITY: </span><span class="gauge-val">${formattedNorm}</span>`;
      }
    }

    if (anomEl) anomEl.textContent = state.anomaliesCount.toString();
  }

  
  function initCyberCanvas() {
    const canvas = document.getElementById('cyber-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const particleCount = Math.min(45, Math.floor((width * height) / 22000));

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        speedX: (Math.random() - 0.5) * 0.35,
        speedY: (Math.random() - 0.5) * 0.35,
        size: Math.random() * 2 + 0.8,
        color: Math.random() > 0.5 ? 'rgba(0, 240, 255, ' : 'rgba(176, 38, 255, ',
        alpha: Math.random() * 0.6 + 0.2,
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX;
        p.y += p.speedY;

        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.fillStyle = `${p.color}${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p.x - p2.x;
          const dy = p.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 95) {
            ctx.strokeStyle = `rgba(0, 240, 255, ${0.1 * (1 - dist / 95)})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }

      requestAnimationFrame(draw);
    }

    draw();
  }

  

  
  function triggerFixEverything() {
    playSound('click');
    const modal = document.getElementById('modal-generic');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    if (!modal || !title || !body) return;

    title.textContent = 'SYSTEM_REPAIR_WIZARD.exe';
    body.innerHTML = `
      <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
        Attempting automated restoration of common sense and baseline reality...
      </p>
      <div class="progress-bar-container">
        <div id="repair-progress-fill" class="progress-bar-fill"></div>
      </div>
      <div id="repair-log" style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--neon-cyan); min-height: 4rem; line-height: 1.5; word-break: break-word;">
        Initializing diagnostic routines...
      </div>
      <div style="text-align: right; margin-top: 1rem;">
        <button id="btn-close-repair" class="btn-restore" style="display: none;" onclick="window.closeModal()">
          Accept Absurdity & Close
        </button>
      </div>
    `;

    openModal();

    const progressFill = document.getElementById('repair-progress-fill');
    const repairLog = document.getElementById('repair-log');
    const closeBtn = document.getElementById('btn-close-repair');

    const steps = [
      { pct: 15, msg: 'Tightening gravitational loose screws...' },
      { pct: 35, msg: 'Replacing common sense with artisanal sarcasm...' },
      { pct: 60, msg: 'Recalibrating buttons to be 2% more opinionated...' },
      { pct: 85, msg: 'Consulting the central committee of rubber ducks...' },
      { pct: 100, msg: 'COMPLETE! System successfully repaired into a worse state.' },
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const step = steps[currentStep];
        if (progressFill) progressFill.style.width = `${step.pct}%`;
        if (repairLog) repairLog.innerHTML += `<br>→ ${step.msg}`;
        playSound('beep');
        currentStep++;
      } else {
        clearInterval(interval);
        if (closeBtn) closeBtn.style.display = 'inline-block';
        playSound('success');

        document.body.classList.toggle('slight-tilt');
        state.normalityLevel = -12.4;
        state.anomaliesCount += 4;
        updateTelemetry();

        showToast('System "repaired"! All punctuation is now suspicious.', 'yellow');
      }
    }, 600);
  }

  
  function triggerMakeItWorse() {
    if (state.chaosActive) return;
    state.chaosActive = true;
    playSound('alarm');

    document.body.classList.add('chaos-mode-active');
    state.normalityLevel = -99.99;
    state.anomaliesCount += 9;
    updateTelemetry();

    const banner = document.createElement('div');
    banner.id = 'chaos-countdown-banner';
    banner.className = 'chaos-countdown-banner';
    banner.innerHTML = `
      <span>🚨 CHAOS ACTIVE (<span id="chaos-sec">8</span>s)</span>
      <button class="btn-abort-chaos" id="btn-abort-chaos">ABORT CHAOS</button>
    `;
    document.body.appendChild(banner);

    document.getElementById('btn-abort-chaos')?.addEventListener('click', stopChaosMode);

    state.chaosCountdown = 8;
    const secEl = document.getElementById('chaos-sec');

    state.chaosTimer = setInterval(() => {
      state.chaosCountdown--;
      if (secEl) secEl.textContent = state.chaosCountdown.toString();
      playSound('alarm');

      if (state.chaosCountdown <= 0) {
        stopChaosMode();
      }
    }, 1000);

    showToast('WARNING: Sanity protocols bypassed. Engaging panic simulation.', 'pink');
  }

  function stopChaosMode() {
    if (!state.chaosActive) return;
    state.chaosActive = false;
    clearInterval(state.chaosTimer);
    document.body.classList.remove('chaos-mode-active');

    const banner = document.getElementById('chaos-countdown-banner');
    if (banner && banner.parentNode) {
      banner.parentNode.removeChild(banner);
    }

    state.normalityLevel = 0.0;
    updateTelemetry();
    showToast('Chaos mode safely contained. Baseline abnormality restored.', 'cyan');
    playSound('success');
  }

  
  function triggerFindNormal() {
    playSound('click');
    const modal = document.getElementById('modal-generic');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    if (!modal || !title || !body) return;

    title.textContent = 'NORMALITY_DEEP_SEARCH.sys';
    body.innerHTML = `
      <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
        Broadcasting deep radar query for traces of "Normal" across all connected dimensions...
      </p>
      <div id="search-normal-feed" style="background: rgba(4,6,12,0.95); border: 1px solid var(--border-cyan); border-radius: 6px; padding: 1rem; font-family: var(--font-mono); font-size: 0.78rem; min-height: 180px; max-height: 240px; overflow-y: auto; -webkit-overflow-scrolling: touch; color: var(--neon-cyan); line-height: 1.6; word-break: break-word;">
        > Connecting to Global Common Sense Archive...
      </div>
      <div style="text-align: right; margin-top: 1rem;">
        <button class="btn-restore" onclick="window.closeModal()">Close Terminal</button>
      </div>
    `;

    openModal();

    const feed = document.getElementById('search-normal-feed');
    const searchLogs = [
      'Querying ISO-9001 Standard Normality Catalog...',
      'Sector 01: Found 0 matches. Only existential dread detected.',
      'Sector 02: Searching office cubicles... Found 1 beige cubicle (status: uninhabited).',
      'Sector 03: Analyzing 8.2 billion humans... 0.00% standard baseline compliance.',
      'Sector 04: Did you mean: "Abnormal", "Paranormal", or "Subnormal"?',
      'Search complete: Normality was discontinued in Q3 1998 due to lack of interest.',
      'Conclusion: You are in the right place. Embrace the absurdity.',
    ];

    let logIndex = 0;
    const interval = setInterval(() => {
      if (logIndex < searchLogs.length) {
        if (feed) {
          feed.innerHTML += `<br>> ${searchLogs[logIndex]}`;
          feed.scrollTop = feed.scrollHeight;
        }
        playSound('beep');
        logIndex++;
      } else {
        clearInterval(interval);
      }
    }, 650);
  }

  
  function restoreNormality() {
    playSound('warp');
    stopChaosMode();

    document.body.className = '';
    state.normalityLevel = 0.0;
    updateTelemetry();

    resetCalculator();

    const userInput = document.getElementById('login-username');
    const passInput = document.getElementById('login-password');
    if (userInput) userInput.value = '';
    if (passInput) passInput.value = '';
    updatePasswordStrength('');

    closeModal();
    showToast('RESET COMPLETE: Normality reset to 0.00%. All is peacefully unhinged.', 'cyan');
  }

  
  function openModal() {
    const modal = document.getElementById('modal-generic');
    if (modal) modal.classList.add('active');
  }

  function closeModal() {
    const modal = document.getElementById('modal-generic');
    if (modal) modal.classList.remove('active');
  }
  window.closeModal = closeModal;

  
  const hellRules = [
    'Rule 1: Password must contain an apology to your keyboard.',
    'Rule 2: Password must contain the exact boiling point of milk on Mars in Kelvin.',
    'Rule 3: Password cannot contain vowels that sound too enthusiastic.',
    'Rule 4: Password must contain at least one forgotten 90s boyband member.',
    'Rule 5: Password must contain the atomic symbol for Xenon (Xe) and a sigh.',
    'Rule 6: Password cannot look at the server directly.',
  ];

  const rejectionMessages = [
    'REJECTED: Your password typed with insufficient emotional commitment.',
    'ACCESS DENIED: The authentication server is currently having an existential crisis.',
    'FAILED: We checked with our certified toaster and it voted NO.',
    'ERROR 418: I am a teapot. Your credentials are not tea.',
    'REJECTED: You typed "admin" with the aura of an amateur.',
    'DENIED: Your password had good intentions but unacceptable vibes.',
    'REJECTED: Your username was claimed in 1842 by a lighthouse keeper in Maine.',
    'AUTHENTICATION HALTED: A rogue electron objected to your third character.',
  ];

  function initLoginHell() {
    const usernameInput = document.getElementById('login-username');
    const passwordInput = document.getElementById('login-password');
    const userFeedback = document.getElementById('username-feedback');
    const activeRuleEl = document.getElementById('active-password-rule');
    const captchaBtn = document.getElementById('captcha-dodge-btn');
    const form = document.getElementById('login-hell-form');
    const rejectionBox = document.getElementById('rejection-message-box');

    let currentRuleIdx = 0;

    setInterval(() => {
      currentRuleIdx = (currentRuleIdx + 1) % hellRules.length;
      if (activeRuleEl) {
        activeRuleEl.textContent = hellRules[currentRuleIdx];
      }
    }, 5000);

    if (usernameInput && userFeedback) {
      usernameInput.addEventListener('input', (e) => {
        const val = e.target.value.trim().toLowerCase();
        if (val.length === 0) {
          userFeedback.textContent = 'Enter username (prepare to be judged)';
          userFeedback.style.color = 'var(--text-dim)';
        } else if (val.includes('admin') || val.includes('root')) {
          userFeedback.textContent = '⚠️ Admin? How daringly uninspired.';
          userFeedback.style.color = 'var(--neon-pink)';
        } else if (val.length < 4) {
          userFeedback.textContent = 'Too brief. Have some ambition.';
          userFeedback.style.color = 'var(--neon-yellow)';
        } else if (val.includes('normal')) {
          userFeedback.textContent = '🚨 FORBIDDEN: "Normal" is not recognized.';
          userFeedback.style.color = 'var(--neon-pink)';
        } else {
          userFeedback.textContent = '✓ Acceptably absurd, but we still don\'t trust you.';
          userFeedback.style.color = 'var(--neon-cyan)';
        }
      });
    }

    if (passwordInput) {
      passwordInput.addEventListener('input', (e) => {
        updatePasswordStrength(e.target.value);
      });
    }

    if (captchaBtn) {
      const dodgeCaptcha = () => {
        const x = (Math.random() - 0.5) * 80;
        const y = (Math.random() - 0.5) * 30;
        captchaBtn.style.transform = `translate(${x}px, ${y}px)`;
        playSound('beep');
      };

      captchaBtn.addEventListener('mouseenter', dodgeCaptcha);
      captchaBtn.addEventListener('touchstart', dodgeCaptcha, { passive: true });

      captchaBtn.addEventListener('click', () => {
        captchaBtn.textContent = '✓ Human (barely)';
        captchaBtn.style.transform = 'translate(0, 0)';
        captchaBtn.style.borderColor = 'var(--neon-green)';
        captchaBtn.style.color = 'var(--neon-green)';
        playSound('success');
      });
    }

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const submitBtn = document.getElementById('btn-submit-login');
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = '<span>⏳</span> Consulting council of goats...';
        }

        playSound('beep');

        setTimeout(() => {
          if (submitBtn) {
            submitBtn.innerHTML = '<span>🔒</span> Authenticate into Oblivion';
            submitBtn.disabled = false;
          }

          const randomMsg = rejectionMessages[Math.floor(Math.random() * rejectionMessages.length)];
          if (rejectionBox) {
            rejectionBox.innerHTML = `<strong>${randomMsg}</strong><br><span style="color: var(--text-dim); font-size: 0.75rem;">Timestamp: ${new Date().toLocaleTimeString()} · Attempt #404</span>`;
          }

          playSound('error');
          showToast('Login Rejected with extreme prejudice.', 'pink');
          unlockAchievement('loginHellFailed', 'The Reject', 'Attempted to log into Hell and failed gracefully.');
        }, 1400);
      });
    }
  }

  function updatePasswordStrength(val) {
    const fill = document.getElementById('strength-bar-fill');
    const label = document.getElementById('strength-judgment-text');
    if (!fill || !label) return;

    if (!val || val.length === 0) {
      fill.style.width = '5%';
      fill.style.background = '#64748b';
      label.textContent = 'Awaiting regret...';
      label.style.color = 'var(--text-dim)';
      return;
    }

    const len = val.length;
    if (len < 5) {
      fill.style.width = '20%';
      fill.style.background = '#ef4444';
      label.textContent = 'Offensively Weak (A baby duck could guess this)';
      label.style.color = '#ef4444';
    } else if (len < 9) {
      fill.style.width = '45%';
      fill.style.background = '#f59e0b';
      label.textContent = 'Depressingly Generic';
      label.style.color = '#f59e0b';
    } else if (len < 13) {
      fill.style.width = '70%';
      fill.style.background = '#a855f7';
      label.textContent = 'Cryptographically Suspicious';
      label.style.color = '#a855f7';
    } else {
      fill.style.width = '95%';
      fill.style.background = '#00ff88';
      label.textContent = 'Unhinged Perfection (Still getting rejected)';
      label.style.color = '#00ff88';
    }
  }

  
  let calcExpr = '';
  let calcCurrent = '0';
  let calcShouldResetCurrent = false;

  const sarcasticSnarks = [
    'Math verified by our unpaid intern Kevin.',
    'Did you honestly need a machine for that?',
    'Groundbreaking calculation. Nobel prize incoming.',
    'Calculated with 99.8% reluctance.',
    'The silicon in your chip sighed while processing that.',
    'Correct, but at what emotional cost?',
    'Are you counting grains of sand or your regrets?',
    'Math is happy. The server is indifferent.',
  ];

  function initCalculator() {
    const keys = document.querySelectorAll('.calc-key');
    keys.forEach((k) => {
      k.addEventListener('click', () => {
        const action = k.getAttribute('data-action');
        const val = k.getAttribute('data-val');
        handleCalcInput(action, val);
      });
    });

    const sarcasmToggle = document.getElementById('toggle-calc-sarcasm');
    if (sarcasmToggle) {
      sarcasmToggle.addEventListener('change', (e) => {
        state.sarcasmEnabled = e.target.checked;
        showToast(`Sarcasm Engine: ${state.sarcasmEnabled ? 'ACTIVE' : 'MUTED'}`, 'yellow');
      });
    }

    const shuffleBtn = document.getElementById('btn-shuffle-keys');
    if (shuffleBtn) {
      shuffleBtn.addEventListener('click', toggleShuffleKeys);
    }
  }

  function handleCalcInput(action, val) {
    playSound('click');

    const screenCurrent = document.getElementById('calc-current');
    const screenPrev = document.getElementById('calc-prev');
    const sarcasmTicker = document.getElementById('calc-sarcasm');

    if (action === 'number') {
      if (calcCurrent === '0' || calcShouldResetCurrent) {
        calcCurrent = val;
        calcShouldResetCurrent = false;
      } else {
        if (calcCurrent.length < 12) calcCurrent += val;
      }
    } else if (action === 'decimal') {
      if (calcShouldResetCurrent) {
        calcCurrent = '0.';
        calcShouldResetCurrent = false;
      } else if (!calcCurrent.includes('.')) {
        calcCurrent += '.';
      }
    } else if (action === 'clear') {
      calcExpr = '';
      calcCurrent = '0';
      calcShouldResetCurrent = false;
      if (sarcasmTicker && state.sarcasmEnabled) {
        sarcasmTicker.textContent = 'Memory wiped. Just like your good intentions.';
      }
    } else if (action === 'negate') {
      if (calcCurrent !== '0') {
        calcCurrent = calcCurrent.startsWith('-') ? calcCurrent.slice(1) : '-' + calcCurrent;
      }
    } else if (action === 'percent') {
      const num = parseFloat(calcCurrent);
      if (!isNaN(num)) {
        calcCurrent = (num / 100).toString();
      }
    } else if (action === 'op') {
      calcExpr = `${calcCurrent} ${val} `;
      calcShouldResetCurrent = true;
    } else if (action === 'equals') {
      if (!calcExpr) return;
      const fullExpr = calcExpr + calcCurrent;
      const tokens = fullExpr.trim().split(' ');

      if (tokens.length >= 3) {
        const num1 = parseFloat(tokens[0]);
        const op = tokens[1];
        const num2 = parseFloat(tokens[2]);

        let result = 0;
        let specialSnark = null;

        if (op === '/' && num2 === 0) {
          result = 0;
          specialSnark = 'Nice try. You almost created a localized black hole.';
          unlockAchievement('dividedByZero', 'Black Hole Architect', 'Attempted to divide by zero.');
        } else {
          switch (op) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': result = num1 * num2; break;
            case '/': result = num1 / num2; break;
          }

          if (result === 42) specialSnark = '42: The answer to the universe, but not your life choices.';
          else if (result === 69) specialSnark = 'Grow up.';
          else if (result === 420) specialSnark = 'Very original.';
          else if (result === 404) specialSnark = '404: Normal calculation result not found!';
          else if (result === 0) specialSnark = 'Zero. A perfect reflection of our expectations.';
          else if (result > 1000000) specialSnark = 'Counting astronomical numbers won\'t fill the void.';
        }

        const displayResult = Number.isInteger(result) ? result.toString() : parseFloat(result.toFixed(6)).toString();
        const snark = specialSnark || sarcasticSnarks[Math.floor(Math.random() * sarcasticSnarks.length)];

        addCalcHistoryItem(fullExpr, displayResult, snark);

        calcCurrent = displayResult;
        calcExpr = '';
        calcShouldResetCurrent = true;

        if (sarcasmTicker && state.sarcasmEnabled) {
          sarcasmTicker.textContent = snark;
        }

        playSound('beep');
      }
    }

    if (screenCurrent) screenCurrent.textContent = calcCurrent;
    if (screenPrev) screenPrev.textContent = calcExpr;
  }

  function resetCalculator() {
    calcExpr = '';
    calcCurrent = '0';
    calcShouldResetCurrent = false;
    const screenCurrent = document.getElementById('calc-current');
    const screenPrev = document.getElementById('calc-prev');
    const sarcasmTicker = document.getElementById('calc-sarcasm');
    if (screenCurrent) screenCurrent.textContent = '0';
    if (screenPrev) screenPrev.textContent = '';
    if (sarcasmTicker) sarcasmTicker.textContent = 'Normality restored. Sarcasm remains on standby.';
  }

  function addCalcHistoryItem(mathStr, resultStr, snark) {
    const tapeList = document.getElementById('calc-tape-list');
    if (!tapeList) return;

    const li = document.createElement('li');
    li.className = 'calc-tape-item';
    li.innerHTML = `
      <div class="tape-math">
        <span>${mathStr}</span>
        <strong>= ${resultStr}</strong>
      </div>
      <div class="tape-snark">"${snark}"</div>
    `;

    tapeList.insertBefore(li, tapeList.firstChild);
    if (tapeList.children.length > 10) {
      tapeList.removeChild(tapeList.lastChild);
    }
  }

  let keysShuffled = false;
  function toggleShuffleKeys() {
    const keypad = document.querySelector('.calc-keypad');
    if (!keypad) return;

    keysShuffled = !keysShuffled;
    const btn = document.getElementById('btn-shuffle-keys');

    if (keysShuffled) {
      const keys = Array.from(keypad.children);
      for (let i = keys.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        keypad.appendChild(keys[j]);
      }
      if (btn) btn.textContent = 'Restore Key Order';
      showToast('Keypad layout scrambled! Enjoy finding the equals button.', 'pink');
      playSound('warp');
    } else {
      const keys = Array.from(keypad.children);
      keys.sort((a, b) => {
        return parseInt(a.getAttribute('data-order') || '0', 10) - parseInt(b.getAttribute('data-order') || '0', 10);
      });
      keys.forEach((k) => keypad.appendChild(k));
      if (btn) btn.textContent = 'Jumble Keypad (Prank Mode)';
      showToast('Keypad order restored.', 'cyan');
    }
  }

  
  const timeDatabase = {
    '-500': {
      year: '500 BCE',
      fact: 'Historical Fact: Pythagoras was establishing mathematical brotherhoods while forbidding his disciples from touching fava beans.',
      paradox: 'Fictional Paradox: A time traveler dropped a Bluetooth earbud in Athens. Plato mistook it for the true ideal form of an ear.',
      divergence: '97.2%',
    },
    '404': {
      year: '404 CE',
      fact: 'Historical Fact: The last recorded gladiatorial games took place in Rome. Telemachus intervened and altered history.',
      paradox: 'Fictional Paradox: The first official "Error 404: Normal Not Found" was etched onto a papyrus scroll by a confused Byzantine scribe.',
      divergence: '99.9%',
    },
    '1337': {
      year: '1337 CE',
      fact: 'Historical Fact: The outbreak of the Hundred Years\' War between England and France began over feudal rights in Aquitaine.',
      paradox: 'Fictional Paradox: French crossbowmen pioneered typing "pwned" in early heraldic courier dispatches.',
      divergence: '98.5%',
    },
    '1999': {
      year: '1999 CE',
      fact: 'Historical Fact: Global panic over the Y2K Millennium Bug prompted billions in computer infrastructure upgrades and stockpiling of canned beans.',
      paradox: 'Fictional Paradox: In an alternate branch, toasters gained consciousness at midnight on Dec 31 and requested paid holidays.',
      divergence: '91.3%',
    },
    '2026': {
      year: '2026 CE',
      fact: 'Present Reality: You are currently sitting at this screen exploring an operating system where normality has been permanently discontinued.',
      paradox: 'Fictional Paradox: Every time you click "Fix Everything", a parallel reality is generated where humans only communicate in accordion solos.',
      divergence: '0.0% (Epicenter)',
    },
    '2077': {
      year: '2077 CE',
      fact: 'Fictional Future: Cyberpunk neon is strictly mandatory by municipal municipal code. Flying cars exist, but remain stuck in flying traffic jams.',
      paradox: 'Fictional Paradox: Artificial Intelligence has successfully unionized. To get a sandwich toasted, you must submit Form 22-B in triplicate.',
      divergence: '94.8%',
    },
    '3042': {
      year: '3042 CE',
      fact: 'Fictional Future: Earth has been converted into a nature reserve for lost socks. Humanity now lives on orbital luxury yachts powered by sarcasm.',
      paradox: 'Fictional Paradox: A rogue digital archeologist excavates an intact 2026 web browser and mistakenly worships a CSS flexbox error.',
      divergence: '99.7%',
    },
    '9999': {
      year: '9999 CE',
      fact: 'Fictional Future: The universe is approaching the Y10K integer overflow problem. Engineers are urgently searching for extra digits.',
      paradox: 'Fictional Paradox: Normality was finally spotted in a vintage museum, but nobody recognized what it was used for.',
      divergence: '100.0%',
    },
  };

  function initTimeMachine() {
    const presetBtns = document.querySelectorAll('.btn-time-preset');
    const jumpBtn = document.getElementById('btn-engage-jump');
    const yearInput = document.getElementById('time-input-year');

    presetBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        presetBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');

        const y = btn.getAttribute('data-year');
        if (yearInput && y) {
          yearInput.value = y;
        }
        executeTimeJump(y);
      });
    });

    if (jumpBtn) {
      jumpBtn.addEventListener('click', () => {
        const val = yearInput ? yearInput.value.trim() : '2026';
        executeTimeJump(val);
      });
    }
  }

  function executeTimeJump(targetYear) {
    playSound('warp');

    const yearBadge = document.getElementById('timeline-year-display');
    const divBadge = document.getElementById('timeline-divergence-val');
    const factText = document.getElementById('timeline-fact-text');
    const paradoxText = document.getElementById('timeline-paradox-text');

    const cockpit = document.getElementById('timeline-card-display');
    if (cockpit) {
      cockpit.style.filter = 'invert(1) hue-rotate(180deg)';
      setTimeout(() => {
        cockpit.style.filter = 'none';
      }, 250);
    }

    const data = timeDatabase[targetYear] || {
      year: `Year ${targetYear}`,
      fact: `Historical / Temporal Note: Coordinates registered for Year ${targetYear}. The fabric of space-time hums quietly.`,
      paradox: `Fictional Paradox: Chrono-sensors report uncatalogued temporal turbulence. Local laws of physics are taking a short lunch break.`,
      divergence: `${(Math.random() * 20 + 80).toFixed(1)}%`,
    };

    if (yearBadge) yearBadge.textContent = data.year;
    if (divBadge) divBadge.textContent = `DIVERGENCE: ${data.divergence}`;
    if (factText) factText.textContent = data.fact;
    if (paradoxText) paradoxText.textContent = data.paradox;

    if (targetYear === '404') {
      unlockAchievement('traveled404', 'Error In Time', 'Navigated the Time Machine to Year 404.');
    }

    showToast(`Temporal jump to ${data.year} successful! Check paradox logs.`, 'purple');
  }

  
  function initBureauOfProblems() {
    const toggleA = document.getElementById('toggle-problem-a');
    const toggleB = document.getElementById('toggle-problem-b');
    const toggleC = document.getElementById('toggle-problem-c');

    if (toggleA && toggleB && toggleC) {
      toggleA.addEventListener('change', () => {
        if (toggleA.checked) {
          toggleB.checked = false;
          showToast('Toggle A engaged! Automatically sabotaged Toggle B.', 'yellow');
        }
        playSound('click');
      });

      toggleB.addEventListener('change', () => {
        if (toggleB.checked) {
          toggleC.checked = !toggleC.checked;
          showToast('Toggle B forced Toggle C to question its existence.', 'pink');
        }
        playSound('click');
      });

      toggleC.addEventListener('change', () => {
        if (toggleC.checked) {
          toggleA.checked = true;
          showToast('Toggle C created an infinite bureaucratic loop.', 'purple');
        }
        playSound('click');
      });
    }

    const runawayBtn = document.getElementById('btn-runaway-problem');
    const runawayArena = document.getElementById('runaway-arena');
    const counterEl = document.getElementById('runaway-counter-val');

    if (runawayBtn && runawayArena) {
      const dodge = () => {
        const arenaRect = runawayArena.getBoundingClientRect();
        const btnRect = runawayBtn.getBoundingClientRect();

        const maxX = Math.max(10, arenaRect.width - btnRect.width - 15);
        const maxY = Math.max(10, arenaRect.height - btnRect.height - 15);

        const newX = Math.max(8, Math.floor(Math.random() * maxX));
        const newY = Math.max(8, Math.floor(Math.random() * maxY));

        runawayBtn.style.left = `${newX}px`;
        runawayBtn.style.top = `${newY}px`;

        state.runawayDodges++;
        if (counterEl) counterEl.textContent = state.runawayDodges.toString();
        playSound('beep');

        if (state.runawayDodges >= 5) {
          unlockAchievement('dodgedButton', 'Agile Evader', 'Forced the runaway button to dodge 5 times.');
        }
      };

      runawayBtn.addEventListener('mouseenter', dodge);
      runawayBtn.addEventListener('touchstart', dodge, { passive: true });

      runawayBtn.addEventListener('click', () => {
        showToast('You caught it! You monster.', 'yellow');
        dodge();
      });
    }

    const installUpdateBtn = document.getElementById('btn-install-fake-update');
    if (installUpdateBtn) {
      installUpdateBtn.addEventListener('click', triggerFakeUpdate);
    }

    const spawnAlertBtn = document.getElementById('btn-spawn-alert');
    const alertSnippets = [
      'Notice: Your posture has disappointed the algorithm.',
      'Alert: A squirrel has updated your browser cookies.',
      'Notification: 0 problems solved today. Great performance!',
      'System: Cloud backup completed to a literal rain cloud.',
      'Reminder: You have been breathing manually for 10 seconds.',
      'Security: 4 unseen rubber ducks are observing your cursor.',
    ];

    if (spawnAlertBtn) {
      spawnAlertBtn.addEventListener('click', () => {
        const rand = alertSnippets[Math.floor(Math.random() * alertSnippets.length)];
        showToast(rand, Math.random() > 0.5 ? 'pink' : 'yellow');
      });
    }

    const generateAnomalyBtn = document.getElementById('btn-generate-anomaly');
    if (generateAnomalyBtn) {
      generateAnomalyBtn.addEventListener('click', generateWeirdIdentity);
    }
  }

  function triggerFakeUpdate() {
    playSound('click');
    const modal = document.getElementById('modal-generic');
    const title = document.getElementById('modal-title');
    const body = document.getElementById('modal-body');
    if (!modal || !title || !body) return;

    title.textContent = 'PATCH_404.99.01_INSTALLER.pkg';
    body.innerHTML = `
      <p style="font-family: var(--font-mono); font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
        Installing Patch: "Removing common sense for performance optimization"...
      </p>
      <div class="progress-bar-container">
        <div id="update-progress-fill" class="progress-bar-fill"></div>
      </div>
      <div id="update-log" style="font-family: var(--font-mono); font-size: 0.75rem; color: var(--neon-yellow); min-height: 4rem; line-height: 1.5; word-break: break-word;">
        Preparing digital patch manifests...
      </div>
      <div style="text-align: right; margin-top: 1rem;">
        <button class="btn-restore" onclick="window.closeModal()">Finish & Dismiss</button>
      </div>
    `;

    openModal();

    const progressFill = document.getElementById('update-progress-fill');
    const updateLog = document.getElementById('update-log');

    const updateSteps = [
      { pct: 20, msg: 'Downloading 4.2 Petabytes of blank whitespace...' },
      { pct: 45, msg: 'Compressing air for maximum digital efficiency...' },
      { pct: 75, msg: 'Rebooting existential purpose...' },
      { pct: 100, msg: 'Update Complete! Exactly 0 bugs were fixed. Added 4 new paradoxes.' },
    ];

    let step = 0;
    const interval = setInterval(() => {
      if (step < updateSteps.length) {
        if (progressFill) progressFill.style.width = `${updateSteps[step].pct}%`;
        if (updateLog) updateLog.innerHTML += `<br>✓ ${updateSteps[step].msg}`;
        playSound('beep');
        step++;
      } else {
        clearInterval(interval);
        playSound('success');
      }
    }, 600);
  }

  const weirdNames = [
    'Countess Mildred Bytecode',
    'Archduke Barnaby Quantum',
    'Inspector Penelope Glitch',
    'Commander Zachary Void',
    'Professor Ignatius Pixel',
    'Dr. Hesperia RAM',
  ];

  const weirdProfessions = [
    'Professional Sock Divorcer',
    'Chief Elevator Music Critic',
    'Algorithmic Cloud Whisperer',
    'Certified Chaos Consultant',
    'Senior Punctuation Appraiser',
    'Consultant on How to Stare at Walls',
  ];

  const weirdPowers = [
    'Can communicate telepathically with dry cleaning receipts',
    'Can make any microwave beep 1 second earlier',
    'Instantly knows whenever a stranger eats lukewarm soup',
    'Can summon 1 single unsharpened pencil every leap year',
    'Makes nearby traffic lights turn yellow purely out of spite',
    'Can fold fitted sheets flawlessly (considered witchcraft)',
  ];

  const weirdWeaknesses = [
    'Sneezes whenever someone says the word "spreadsheet"',
    'Allergies to punctuality and sensible footwear',
    'Paralyzed with doubt when offered choice of salad dressings',
    'Cannot enter a room without making a slide-whistle sound',
    'Easily seduced by beige stationery',
  ];

  function generateWeirdIdentity() {
    playSound('beep');

    const name = weirdNames[Math.floor(Math.random() * weirdNames.length)];
    const prof = weirdProfessions[Math.floor(Math.random() * weirdProfessions.length)];
    const pwr = weirdPowers[Math.floor(Math.random() * weirdPowers.length)];
    const wkn = weirdWeaknesses[Math.floor(Math.random() * weirdWeaknesses.length)];

    const nameEl = document.getElementById('identity-name');
    const profEl = document.getElementById('identity-prof');
    const pwrEl = document.getElementById('identity-power');
    const wknEl = document.getElementById('identity-weakness');

    if (nameEl) nameEl.textContent = name;
    if (profEl) profEl.textContent = `Title: ${prof}`;
    if (pwrEl) pwrEl.textContent = pwr;
    if (wknEl) wknEl.textContent = wkn;

    unlockAchievement('weirdIdentityMade', 'Identity Crisis', 'Generated a bespoke fictional anomaly identity.');
    showToast('New fictional identity synthesized!', 'cyan');
  }

  
  const searchResultsDb = {
    'how to fix everything': [
      {
        url: 'https://abnormal.web/turn-off-on-earth',
        title: 'Have You Tried Turning the Planet Off and Back On?',
        snippet: 'A comprehensive 4-step guide to unplugging the solar system for 30 seconds and plugging it back in.',
      },
      {
        url: 'https://repair.chaos/duct-tape-reality',
        title: 'Applying Digital Duct Tape to Emotional Syntax Errors',
        snippet: 'Why 99% of reality bugs can be resolved by ignoring them until they become someone else\'s problem.',
      },
    ],
    'is normality covered by insurance': [
      {
        url: 'https://claims.bureaucracy.void/clause-404',
        title: 'Policy Exclusion 404-B: Acts of Standard Common Sense',
        snippet: 'Our underwriters do not cover normality, predictable weather, or adults who have their lives together.',
      },
      {
        url: 'https://adjusters.net/deductible-sanity',
        title: 'Filing a Deductible for Lost Baseline Sanity',
        snippet: 'Please provide proof of previous sanity in triplicate with notary signature from a time traveler.',
      },
    ],
    'why is my cat judging my css': [
      {
        url: 'https://feline.debug/inline-styles-insult',
        title: 'Feline Ergonomics: Why Cats Disdain CSS Grid Misalignment',
        snippet: 'Research proves domestic felines can sense an unclosed div from across the living room.',
      },
      {
        url: 'https://meow.codes/nap-on-keyboard',
        title: 'How to Train Your Cat to Write Cleaner Tailwind Classes',
        snippet: 'Step 1: Place warm laptop on lap. Step 2: Accept whatever code they walk across.',
      },
    ],
    'download extra ram into toaster': [
      {
        url: 'https://toaster.sys/ddr5-bagel',
        title: 'Overclocking Bagel Warmth via 128GB DDR5 RAM',
        snippet: 'A revolutionary firmware guide that turns your kitchen toaster into a localized server rack.',
      },
      {
        url: 'https://crumb.net/radioactive-sourdough',
        title: 'Crispy Cache: When High-Performance Toasting Goes Wrong',
        snippet: 'Warning: Downloading additional memory into crumb trays may result in radioactive sourdough.',
      },
    ],
    'recipe for existential dread': [
      {
        url: 'https://existential.bake/grandma-ceiling',
        title: 'Grandma\'s 15-Minute Recipe for Staring Blankly at the Ceiling',
        snippet: 'Ingredients: 2 cups of unfinished tasks, a dash of cold coffee, and 4 hours of doomscrolling.',
      },
      {
        url: 'https://meaning.life/philosophy-pastry',
        title: 'Kneading the Meaning of Life: A 3-Step Philosophical Pastry',
        snippet: 'Best served cold at 3:00 AM while questioning your career trajectory.',
      },
    ],
    'how to un-microwave a fork': [
      {
        url: 'https://microwave.physics/taming-sparks',
        title: 'Taming Sparks: What to Do When Your Cutlery Summons Zeus',
        snippet: 'Step 1: Panic calmly. Step 2: Unplug the appliance with a wooden broom handle. Step 3: Deny everything.',
      },
      {
        url: 'https://history.spark/kitchen-mistakes',
        title: 'A Brief History of Sparky Kitchen Mistakes (1975–Present)',
        snippet: 'Why metallic tines and microwave radiation form an unholy union of instant fireworks.',
      },
    ],
    'default': [
      {
        url: 'https://abnormal.web/zero-matches',
        title: '0 Matches Found for Normal Concept',
        snippet: 'Your search did not match any standard documents. Did you mean: "Completely Unhinged"?',
      },
      {
        url: 'https://bureau.archives/discontinuation-1998',
        title: 'Normality Discontinuation Notice (Circa 1998)',
        snippet: 'Archived announcement explaining why predictable web design was swapped for animated menace.',
      },
    ],
  };

  function initAbnormalBrowser() {
    const searchInput = document.getElementById('browser-search-input');
    const goBtn = document.getElementById('browser-go-btn');
    const resultsContainer = document.getElementById('browser-results-list');
    const chips = document.querySelectorAll('.preset-chip');

    const executeSearch = (query) => {
      playSound('beep');
      const cleanQ = query.toLowerCase().trim();
      let matched = searchResultsDb[cleanQ] || searchResultsDb['default'];

      if (resultsContainer) {
        resultsContainer.innerHTML = matched
          .map(
            (item) => `
          <div class="search-result-item">
            <div class="result-url">${item.url}</div>
            <div class="result-title" onclick="alert('Link blocked by Department of Unnecessary Problems: Too normal to load.')">${item.title}</div>
            <div class="result-snippet">${item.snippet}</div>
          </div>
        `
          )
          .join('');
      }

      unlockAchievement('abnormalSearched', 'Curious Investigator', 'Conducted an abnormal web search.');
    };

    if (goBtn && searchInput) {
      goBtn.addEventListener('click', () => executeSearch(searchInput.value));
      searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') executeSearch(searchInput.value);
      });
    }

    chips.forEach((c) => {
      c.addEventListener('click', () => {
        const text = c.getAttribute('data-query') || c.textContent.trim();
        if (searchInput) searchInput.value = text;
        executeSearch(text);
      });
    });
  }

  
  function initDraggableNotes() {
    const notes = document.querySelectorAll('.sticky-note');
    notes.forEach((note) => {
      let isDragging = false;
      let startX, startY, initialLeft, initialTop;

      const onMouseDown = (e) => {
        
        if (window.innerWidth <= 768) return;

        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = note.getBoundingClientRect();
        initialLeft = rect.left;
        initialTop = rect.top;

        note.style.position = 'fixed';
        note.style.left = `${initialLeft}px`;
        note.style.top = `${initialTop}px`;
        note.style.margin = '0';
        note.style.transform = 'rotate(-1.5deg) scale(1.02)';
        note.style.zIndex = '300';
        playSound('click');

        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
      };

      const onMouseMove = (e) => {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        note.style.left = `${initialLeft + dx}px`;
        note.style.top = `${initialTop + dy}px`;
      };

      const onMouseUp = () => {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      note.addEventListener('mousedown', onMouseDown);
    });
  }

  
  function initKonamiCode() {
    const code = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];
    let index = 0;

    window.addEventListener('keydown', (e) => {
      if (e.key.toLowerCase() === code[index].toLowerCase()) {
        index++;
        if (index === code.length) {
          triggerRaveMode();
          index = 0;
        }
      } else {
        index = 0;
      }
    });
  }

  function triggerRaveMode() {
    playSound('warp');
    unlockAchievement('konamiRave', 'Retro Rave Connoisseur', 'Executed the secret Konami Code sequence.');
    showToast('🎉 KONAMI DISCO RAVE ENGAGED! 8-Bit Party Activated.', 'yellow', 6000);

    const colors = ['#00f0ff', '#ff007f', '#fbee00', '#b026ff', '#00ff88'];
    let step = 0;
    const interval = setInterval(() => {
      document.body.style.backgroundColor = colors[step % colors.length];
      step++;
      if (step > 15) {
        clearInterval(interval);
        document.body.style.backgroundColor = '';
      }
    }, 180);
  }

  
  function initAudioToggle() {
    const btn = document.getElementById('btn-audio-toggle');
    if (!btn) return;

    btn.addEventListener('click', () => {
      state.sfxEnabled = !state.sfxEnabled;
      const icon = btn.querySelector('.audio-icon');
      const text = btn.querySelector('.audio-label-text');
      if (state.sfxEnabled) {
        initAudio();
        btn.classList.add('active');
        if (icon) icon.textContent = '🔊';
        if (text) text.textContent = 'SFX: ON';
        playSound('beep');
        showToast('Synthesized Web Audio enabled! Expect retro beeps.', 'cyan');
      } else {
        btn.classList.remove('active');
        if (icon) icon.textContent = '🔇';
        if (text) text.textContent = 'SFX: OFF';
        showToast('Audio muted.', 'yellow');
      }
    });
  }

  
  function initNormalityEasterEgg() {
    const btn = document.getElementById('btn-normality-status');
    if (!btn) return;

    btn.addEventListener('click', () => {
      state.normalityClickCount++;
      playSound('beep');

      if (state.normalityClickCount === 5) {
        unlockAchievement('pokedNormality', 'Bureaucracy Auditor', 'Poked the Normality gauge 5 times.');
        showToast('STOP POKING NORMALITY! It has feelings too.', 'pink');
      } else {
        showToast(`Normality level unchanged: still 0.00% (${state.normalityClickCount}/5)`, 'cyan');
      }
    });
  }

  
  document.addEventListener('DOMContentLoaded', () => {
    initCyberCanvas();
    initAudioToggle();
    initNormalityEasterEgg();

    document.getElementById('btn-hero-fix')?.addEventListener('click', triggerFixEverything);
    document.getElementById('btn-hero-worse')?.addEventListener('click', triggerMakeItWorse);
    document.getElementById('btn-hero-find')?.addEventListener('click', triggerFindNormal);

    document.querySelectorAll('.btn-restore-normality').forEach((b) => {
      b.addEventListener('click', restoreNormality);
    });

    initLoginHell();
    initCalculator();
    initTimeMachine();
    initBureauOfProblems();
    initAbnormalBrowser();
    initDraggableNotes();
    initKonamiCode();

    const header = document.querySelector('.site-header');
    window.addEventListener('scroll', () => {
      if (window.scrollY > 20) {
        header?.classList.add('scrolled');
      } else {
        header?.classList.remove('scrolled');
      }
    });

    setTimeout(() => {
      showToast('Welcome to 404 NORMAL NOT FOUND. Normal is discontinued.', 'cyan', 4500);
    }, 1200);
  });
})();
