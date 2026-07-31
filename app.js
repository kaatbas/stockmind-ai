/**
 * StockMind AI - Dashboard Application Logic
 * Kurumsal Finansal Arayüz Mantığı
 */

document.addEventListener('DOMContentLoaded', () => {
  const tickerInput = document.getElementById('tickerInput');
  const btnAnalyze = document.getElementById('btnAnalyze');
  const watchlistChips = document.querySelectorAll('.chip-ticker');
  
  const cardRetriever = document.getElementById('cardAgentRetriever');
  const cardAnalyst = document.getElementById('cardAgentAnalyst');
  const cardSummary = document.getElementById('cardAgentSummary');
  
  const badgeRetriever = document.getElementById('badgeRetriever');
  const badgeAnalyst = document.getElementById('badgeAnalyst');
  const badgeSummary = document.getElementById('badgeSummary');

  const terminalLog = document.getElementById('terminalLog');
  const resultsContainer = document.getElementById('resultsContainer');
  const articlesCard = document.getElementById('articlesCard');
  const articlesList = document.getElementById('articlesList');
  const digestHeadline = document.getElementById('digestHeadline');
  const badgeRisk = document.getElementById('badgeRisk');

  // Watchlist Chip Handlers
  watchlistChips.forEach(chip => {
    chip.addEventListener('click', () => {
      const ticker = chip.getAttribute('data-ticker');
      tickerInput.value = ticker;
      runAnalysis(ticker);
    });
  });

  // Search Button Handler
  btnAnalyze.addEventListener('click', () => {
    const ticker = tickerInput.value.trim();
    if (ticker) {
      runAnalysis(ticker);
    }
  });

  // Enter Key Handler
  tickerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const ticker = tickerInput.value.trim();
      if (ticker) runAnalysis(ticker);
    }
  });

  /**
   * Run Analysis Flow
   */
  async function runAnalysis(ticker) {
    ticker = ticker.toUpperCase();
    resetUIState(ticker);
    appendTerminalLog("System", `'${ticker}' için analiz süreci başlatıldı.`);

    try {
      // Agent 1 Active
      setAgentState(cardRetriever, badgeRetriever, "Çalışıyor...", true);
      appendTerminalLog("News Retriever", `'${ticker}' için canlı haber kaynakları taranıyor...`);
      await sleep(400);

      // Fetch from API
      const response = await fetch(`/api/analyze?ticker=${encodeURIComponent(ticker)}`);
      if (!response.ok) throw new Error(`HTTP Hata: ${response.status}`);
      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(data.message || "Analiz yapılamadı.");
      }

      // Agent 1 Complete
      setAgentState(cardRetriever, badgeRetriever, "Tamamlandı", false);
      appendTerminalLog("News Retriever", `${data.result.articles.length} adet haber verisi çekildi.`);

      // Agent 2 Active
      setAgentState(cardAnalyst, badgeAnalyst, "Çalışıyor...", true);
      appendTerminalLog("Financial Analyst", `Haber içerikleri ve duygu metrikleri analiz ediliyor...`);
      await sleep(400);

      const metrics = data.result.metrics;
      setAgentState(cardAnalyst, badgeAnalyst, "Tamamlandı", false);
      appendTerminalLog("Financial Analyst", `Duygu Skoru: %${metrics.bullish_pct} Pozitif | Risk: ${metrics.risk_level}`);

      // Agent 3 Active
      setAgentState(cardSummary, badgeSummary, "Hazırlanıyor...", true);
      appendTerminalLog("Executive Summary", `Kurumsal yönetici bülteni derleniyor...`);
      await sleep(300);

      setAgentState(cardSummary, badgeSummary, "Tamamlandı", false);
      appendTerminalLog("Executive Summary", `Rapor başarıyla tamamlandı.`);

      // Render Results
      renderResults(data.result);

    } catch (err) {
      appendTerminalLog("System Error", `Hata oluştu: ${err.message}`);
      resultsContainer.innerHTML = `
        <div style="color:var(--bearish-color); padding:20px; text-align:center;">
          Analiz sırasında bir sorun oluştu. Sunucunun çalıştığından emin olun.<br>
          <small style="color:var(--text-muted);">${err.message}</small>
        </div>
      `;
      setAgentState(cardRetriever, badgeRetriever, "Hata", false);
      setAgentState(cardAnalyst, badgeAnalyst, "Hata", false);
      setAgentState(cardSummary, badgeSummary, "Hata", false);
    }
  }

  /**
   * Render Analysis Data to Dashboard
   */
  function renderResults(result) {
    const m = result.metrics;
    
    digestHeadline.innerText = result.headline;
    
    // Risk Badge Styling
    let riskBg = "rgba(16, 185, 129, 0.12)";
    let riskColor = "var(--bullish-color)";
    if (m.bearish_pct > 50) {
      riskBg = "rgba(239, 68, 68, 0.12)";
      riskColor = "var(--bearish-color)";
    } else if (m.bullish_pct < 65) {
      riskBg = "rgba(245, 158, 11, 0.12)";
      riskColor = "var(--neutral-color)";
    }
    
    badgeRisk.innerText = m.risk_level;
    badgeRisk.style.background = riskBg;
    badgeRisk.style.color = riskColor;
    badgeRisk.style.border = `1px solid ${riskColor}`;

    // Catalysts Badges HTML
    const catalystsHTML = m.catalysts.map(c => 
      `<span class="tag-badge">${c}</span>`
    ).join(' ');

    // Key Facts List HTML
    const keyFacts = result.key_facts || [];
    const factsHTML = keyFacts.map(fact => {
      const formatted = fact.replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fff;">$1</strong>');
      return `<li class="bullet-item-fact">${formatted}</li>`;
    }).join('');

    resultsContainer.innerHTML = `
      <!-- Metrics Grid -->
      <div class="metrics-row">
        <div class="metric-box">
          <div class="metric-label">Duygu Görünümü</div>
          <div class="metric-value" style="color: ${m.bullish_pct >= 60 ? 'var(--bullish-color)' : 'var(--neutral-color)'};">
            ${m.sentiment_label}
          </div>
        </div>
        <div class="metric-box">
          <div class="metric-label">Tespit Edilen Katalizörler</div>
          <div style="margin-top:6px; display:flex; gap:6px; flex-wrap:wrap;">
            ${catalystsHTML}
          </div>
        </div>
      </div>

      <!-- Sentiment Meter Bar -->
      <div class="sentiment-bar-wrapper">
        <div class="sentiment-labels">
          <span style="color:var(--bullish-color)">Pozitif Dengesi: %${m.bullish_pct}</span>
          <span style="color:var(--bearish-color)">Negatif Dengesi: %${m.bearish_pct}</span>
        </div>
        <div class="sentiment-bar-track">
          <div class="sentiment-bar-fill" style="width: ${m.bullish_pct}%;"></div>
        </div>
      </div>

      <!-- Key Facts Summary Section -->
      <h3 style="font-size:15px; font-weight:700; margin-bottom:14px; color:#fff; text-transform:uppercase; letter-spacing:0.5px;">Öne Çıkan Gelişmeler ve Analiz Notları</h3>
      <ul class="bullets-list-facts">
        ${factsHTML}
      </ul>

      <!-- Action Banner -->
      <div class="action-banner">
        <div>
          <strong style="color:#fff; display:block; margin-bottom:4px; font-size:13px; text-transform:uppercase; letter-spacing:0.5px;">Stratejik Değerlendirme Notu:</strong>
          ${result.action_takeaway}
        </div>
      </div>
    `;

    // Articles Section
    articlesCard.style.display = 'block';
    articlesList.innerHTML = result.articles.map(art => `
      <div class="article-card">
        <div class="article-meta">
          <span class="article-source">${art.source}</span>
          <span>•</span>
          <span>${art.time}</span>
        </div>
        <div class="article-title">${art.title}</div>
        <div class="article-content" style="margin-bottom:12px;">${art.content}</div>
        ${art.url && art.url !== '#' ? `
          <a href="${art.url}" target="_blank" rel="noopener noreferrer" class="link-btn">
            Orijinal Kaynak Bağlantısı &rarr;
          </a>
        ` : ''}
      </div>
    `).join('');
  }

  /**
   * Helper Functions
   */
  function setAgentState(cardElem, badgeElem, text, isActive) {
    if (isActive) {
      cardElem.classList.add('active');
    } else {
      cardElem.classList.remove('active');
    }
    badgeElem.innerText = text;
  }

  function resetUIState(ticker) {
    resultsContainer.innerHTML = `
      <div class="placeholder-state">
        <p><strong>${ticker}</strong> için veri derleme ve analiz işlemi yürütülüyor...</p>
      </div>
    `;
    articlesCard.style.display = 'none';
    
    badgeRetriever.innerText = "Bekliyor";
    badgeAnalyst.innerText = "Bekliyor";
    badgeSummary.innerText = "Bekliyor";
    
    cardRetriever.classList.remove('active');
    cardAnalyst.classList.remove('active');
    cardSummary.classList.remove('active');
  }

  function appendTerminalLog(agent, msg) {
    const timeStr = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.innerHTML = `
      <span class="log-time">[${timeStr}]</span>
      <span class="log-agent">${agent}:</span>
      <span class="log-msg">${msg}</span>
    `;
    terminalLog.appendChild(entry);
    terminalLog.scrollTop = terminalLog.scrollHeight;
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Initial trigger
  runAnalysis('THYAO');
});
