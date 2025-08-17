// FlowPilot AI - Interactions

(function() {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // IntersectionObserver for on-scroll reveals
  const revealElements = document.querySelectorAll('.reveal');
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealElements.forEach((el) => io.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('in-view'));
  }

  // Year in footer
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Tabs (Services overview)
  const tabButtons = Array.from(document.querySelectorAll('.tabs [role="tab"]'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabButtons.forEach((b) => b.setAttribute('aria-selected', String(b === btn)));
      tabPanels.forEach((panel) => panel.classList.remove('is-active'));
      const id = btn.getAttribute('aria-controls');
      const target = document.getElementById(id);
      if (target) target.classList.add('is-active');
    });
  });

  // Accordion (Pricing)
  document.querySelectorAll('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const expanded = item.classList.toggle('expanded');
      trigger.setAttribute('aria-expanded', String(expanded));
    });
  });

  // Smooth show back-to-top button
  const backToTop = document.querySelector('.back-to-top');
  const onScroll = () => {
    if (!backToTop) return;
    const y = window.scrollY || window.pageYOffset;
    if (y > 600) backToTop.classList.add('visible');
    else backToTop.classList.remove('visible');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Modal logic
  function openModal(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'false');
    modal.querySelector('.modal-dialog').focus?.();
    document.body.style.overflow = 'hidden';
  }
  function closeModals() {
    document.querySelectorAll('.modal').forEach((m) => m.setAttribute('aria-hidden', 'true'));
    document.body.style.overflow = '';
  }
  document.querySelectorAll('[data-open]')?.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const target = btn.getAttribute('data-open');
      const plan = btn.getAttribute('data-plan');
      if (plan) {
        const planSelect = document.getElementById('plan');
        if (planSelect) {
          if (/premium/i.test(plan)) planSelect.value = 'Premium';
          else if (/advanced/i.test(plan)) planSelect.value = 'Advanced';
          else planSelect.value = 'Basic';
        }
        const serviceSelect = document.getElementById('service');
        if (serviceSelect) {
          if (/website/i.test(plan)) serviceSelect.value = 'Website Setup';
          else if (/workflow/i.test(plan)) serviceSelect.value = 'AI Workflow Automation';
          else if (/chatbot/i.test(plan)) serviceSelect.value = 'Chatbot Service';
          else if (/lead/i.test(plan)) serviceSelect.value = 'AI Lead Funnel';
          else if (/marketing/i.test(plan)) serviceSelect.value = 'AI-Driven Marketing';
        }
      }
      if (target) openModal(target);
    });
  });
  document.querySelectorAll('[data-close]')?.forEach((btn) => btn.addEventListener('click', closeModals));

  // Close modal on ESC/backdrop
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModals(); });
  document.querySelectorAll('.modal-backdrop').forEach((bd) => bd.addEventListener('click', closeModals));

  // Signup form
  const form = document.getElementById('signup-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const data = Object.fromEntries(new FormData(form).entries());
      try {
        const existing = JSON.parse(localStorage.getItem('flowpilot_signups') || '[]');
        existing.push({ ...data, ts: Date.now() });
        localStorage.setItem('flowpilot_signups', JSON.stringify(existing));
      } catch {}
      const success = form.querySelector('.form-success');
      if (success) success.hidden = false;
      setTimeout(() => { closeModals(); form.reset(); if (success) success.hidden = true; }, 1400);
    });
  }

  // Chat widget
  const chatToggleEls = document.querySelectorAll('[data-toggle-chat]');
  const chatWindow = document.getElementById('chat-window');
  const chatWidget = document.getElementById('chat-widget');
  const chatBody = document.querySelector('.chat-body');
  const chatForm = document.getElementById('chat-form');
  const chatInput = document.getElementById('chat-text');

  function toggleChat() {
    if (!chatWindow) return;
    const isHidden = chatWindow.hasAttribute('hidden');
    if (isHidden) chatWindow.removeAttribute('hidden');
    else chatWindow.setAttribute('hidden', '');
    const toggle = chatWidget?.querySelector('.chat-toggle');
    toggle?.setAttribute('aria-expanded', String(isHidden));
    if (!isHidden) return;
    chatInput?.focus();
  }

  chatToggleEls.forEach((el) => el.addEventListener('click', toggleChat));

  if (chatForm && chatBody && chatInput) {
    chatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = chatInput.value.trim();
      if (!text) return;
      appendMessage('user', text);
      chatInput.value = '';
      fakeAiReply(text);
    });
  }

  function appendMessage(sender, text) {
    const div = document.createElement('div');
    div.className = `message ${sender}`;
    div.textContent = text;
    chatBody.appendChild(div);
    chatBody.scrollTop = chatBody.scrollHeight;
  }

  function fakeAiReply(input) {
    const delay = 450 + Math.random() * 500;
    setTimeout(() => {
      const reply = getReply(input);
      appendMessage('bot', reply);
    }, delay);
  }

  function getReply(input) {
    const lower = input.toLowerCase();
    if (lower.includes('price') || lower.includes('pricing')) return 'Our pricing is transparent: check the Pricing section for a full breakdown, and all basics start with a 7-day free trial.';
    if (lower.includes('trial')) return 'Every core service includes a 7-day free trial. No credit card needed.';
    if (lower.includes('website')) return 'Website Setup starts at $20 for the first month, then $5/month. Premium add-on is $50/month.';
    if (lower.includes('workflow')) return 'Basic Workflow Automation is $15/month. Advanced add-on is $30/month.';
    if (lower.includes('chat')) return 'Basic Chatbot is $10/month with live handover. Premium is $25/month with custom intents.';
    if (lower.includes('lead')) return 'Lead Funnels start at $12/month with an advanced add-on at $25/month.';
    if (lower.includes('market')) return 'Marketing plan starts at $18/month; Advanced is $40/month.';
    if (lower.includes('demo')) return 'Happy to schedule a demo! Click “Schedule a Demo” or email demo@flowpilot.ai.';
    return 'I can help with Websites, Workflows, Chatbots, Lead Funnels, and AI Marketing. What would you like to explore?';
  }
})();

