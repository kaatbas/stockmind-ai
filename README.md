# StockMind AI - Finansal Haber ve Duygu Analizi Platformu

StockMind AI, belirtilen borsa simgeleri için web kaynaklarındaki finansal haberleri ve duyuruları derleyen, metin içeriklerini finansal duygu ve risk algoritmaları ile süzgeçten geçiren ve kurumsal düzeyde raporlar üreten modüler bir çoklu temsilci (multi-agent) platformudur.

---

## Mimari Yapı

Platform, her biri kendi alanında uzmanlaşmış üç temel temsilci bileşeninden oluşur:

1. **Haber ve Duyuru Tarayıcısı (News Retriever Agent):**
   - Belirtilen hisse senedi simgeleri için güncel haber akışını ve finansal duyuruları derler.
2. **Finansal Analiz ve Duygu Temsilcisi (Financial Analyst Agent):**
   - Derlenen verileri anlamsal açıdan analiz ederek piyasa duygu skorunu (Boğa/Ayı dengesi), risk düzeyini ve temel katalizörleri tespit eder.
3. **Baş Editör ve Raporlama Temsilcisi (Executive Summary Agent):**
   - Tüm analiz verilerini harmanlayarak karar almayı kolaylaştıran yapılandırılmış yönetici bülteni oluşturur.

---

## Kurulum ve Çalıştırma

### Gereksinimler
- Python 3.8 veya üzeri sürüm

### Uygulamayı Başlatma
1. Proje ana dizininde sunucuyu başlatın:
   ```bash
   python server.py
   ```
2. Tarayıcı üzerinden erişim sağlayın:
   ```text
   http://localhost:8000
   ```

---

## Proje Dizini Yapısı

```text
samp-agent/
├── agent_engine.py   # Multi-Agent veri işleme ve analiz motoru
├── server.py         # HTTP API ve statik dosya sunucusu
├── index.html        # Web kullanıcı arayüzü
├── style.css         # Tasarım ve stil kuralları
├── app.js            # İstemci tarafı durum yönetimi ve olay işleyicileri
├── .gitignore        # Sürüm kontrolü istisnaları
└── README.md         # Proje dokümantasyonu
```
