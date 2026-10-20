/* =========================================================
   Portfolio Dhea - JavaScript Dasar (Function & DOM)
   ========================================================= */

/* ---------- 1. DARK MODE TOGGLE ---------- */
function setTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-bs-theme", theme);
    const icon = document.getElementById("themeIcon");
    if (icon) {
        icon.className = theme === "dark" ? "bi bi-sun-fill" : "bi bi-moon-stars-fill";
    }
    try { localStorage.setItem("theme", theme); } catch (e) { /* abaikan */ }
}

function toggleTheme() {
    const current = document.documentElement.getAttribute("data-theme");
    setTheme(current === "dark" ? "light" : "dark");
}

function initTheme() {
    let saved = "light";
    try { saved = localStorage.getItem("theme") || "light"; } catch (e) { /* abaikan */ }
    setTheme(saved);
}

/* ---------- 2. EFEK MENGETIK ---------- */
function initTyping() {
    const el = document.getElementById("typedText");
    if (!el) return;

    const roles = ["calon sistem analyst.", "suka web design.", "belajar coding.", "pencinta tampilan rapi."];
    let roleIndex = 0;
    let charIndex = 0;
    let deleting = false;

    function type() {
        const word = roles[roleIndex];
        el.textContent = word.substring(0, charIndex);

        if (!deleting && charIndex < word.length) {
            charIndex++;
            setTimeout(type, 90);
        } else if (!deleting) {
            deleting = true;
            setTimeout(type, 1400);
        } else if (charIndex > 0) {
            charIndex--;
            setTimeout(type, 45);
        } else {
            deleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
            setTimeout(type, 400);
        }
    }
    type();
}

/* ---------- 3. NAVBAR: SCROLL, ACTIVE LINK, TO TOP ---------- */
function handleScroll() {
    const nav = document.getElementById("mainNav");
    const toTop = document.getElementById("toTop");
    const y = window.scrollY;

    nav.classList.toggle("scrolled", y > 30);
    toTop.classList.toggle("show", y > 500);

    // tandai link aktif sesuai section yang sedang terlihat
    const sections = document.querySelectorAll("main section[id]");
    let currentId = "beranda";
    sections.forEach(function(sec) {
        if (y >= sec.offsetTop - 140) currentId = sec.id;
    });
    document.querySelectorAll(".navbar-nav .nav-link").forEach(function(link) {
        link.classList.toggle("active", link.getAttribute("href") === "#" + currentId);
    });
}

function closeMobileMenu() {
    const menu = document.getElementById("navMenu");
    if (menu.classList.contains("show")) {
        const instance = bootstrap.Collapse.getInstance(menu) || new bootstrap.Collapse(menu, { toggle: false });
        instance.hide();
    }
}

/* ---------- 4. REVEAL, SKILL BAR, COUNTER SAAT SCROLL ---------- */
function animateSkill(fill) {
    const level = fill.getAttribute("data-level");
    fill.style.width = level + "%";

    const pct = fill.closest(".skill-item").querySelector(".skill-pct");
    let n = 0;
    const timer = setInterval(function() {
        n += 1;
        pct.textContent = n + "%";
        if (n >= Number(level)) clearInterval(timer);
    }, 14);
}

function animateCounter(el) {
    let target = Number(el.getAttribute("data-count"));
    const type = el.getAttribute("data-target-type");
    if (type === "projects") target = document.querySelectorAll(".project-item").length;
    if (type === "skills") target = document.querySelectorAll(".skill-fill").length;

    const suffix = el.getAttribute("data-suffix") || "";
    let n = 0;
    const step = Math.max(1, Math.ceil(target / 40));
    const timer = setInterval(function() {
        n = Math.min(n + step, target);
        el.textContent = n + suffix;
        if (n >= target) clearInterval(timer);
    }, 35);
}

function initCustomImages() {
    document.querySelectorAll(".avatar-photo, .project-photo").forEach(function(image) {
        function showImage() {
            if (image.naturalWidth === 0) return;
            image.classList.add("is-loaded");
            const avatar = image.closest(".avatar-wrap");
            const cover = image.closest(".project-cover");
            if (avatar) avatar.classList.add("has-photo");
            if (cover) cover.classList.add("has-photo");
        }

        image.addEventListener("load", showImage);
        if (image.complete) showImage();
    });
}

function initObservers() {
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
            if (!entry.isIntersecting) return;
            const el = entry.target;

            if (el.classList.contains("reveal")) el.classList.add("visible");
            el.querySelectorAll(".skill-fill").forEach(animateSkill);
            el.querySelectorAll(".stat-num").forEach(animateCounter);

            observer.unobserve(el);
        });
    }, { threshold: 0.2 });

    document.querySelectorAll(".reveal").forEach(function(el) { observer.observe(el); });
}

/* ---------- 5. FILTER & SEARCH PROYEK ---------- */
let activeFilter = "semua";

function applyProjectFilter() {
    const keyword = document.getElementById("searchProject").value.trim().toLowerCase();
    const items = document.querySelectorAll(".project-item");
    let visibleCount = 0;

    items.forEach(function(item) {
        const category = item.getAttribute("data-category");
        const title = item.getAttribute("data-title");
        const matchCategory = activeFilter === "semua" || category === activeFilter;
        const matchSearch = title.includes(keyword);

        if (matchCategory && matchSearch) {
            item.classList.remove("hide");
            item.classList.remove("pop");
            void item.offsetWidth; // restart animasi
            item.classList.add("pop");
            visibleCount++;
        } else {
            item.classList.add("hide");
        }
    });

    document.getElementById("emptyState").classList.toggle("d-none", visibleCount > 0);
}

function initProjectFilter() {
    document.querySelectorAll(".filter-btn").forEach(function(btn) {
        btn.addEventListener("click", function() {
            document.querySelectorAll(".filter-btn").forEach(function(b) { b.classList.remove("active"); });
            btn.classList.add("active");
            activeFilter = btn.getAttribute("data-filter");
            applyProjectFilter();
        });
    });
    document.getElementById("searchProject").addEventListener("input", applyProjectFilter);
}

/* ---------- 6. KALKULATOR ESTIMASI BIAYA ---------- */
function formatRupiah(angka) {
    return "Rp " + Math.round(angka).toLocaleString("id-ID");
}

function hitungEstimasi() {
    const select = document.getElementById("jenisProyek");
    const inputHalaman = document.getElementById("jumlahHalaman");
    const ekspres = document.getElementById("ekspres").checked;

    // validasi jumlah halaman
    let halaman = parseInt(inputHalaman.value, 10);
    if (isNaN(halaman) || halaman < 1 || halaman > 50) {
        inputHalaman.classList.add("is-invalid");
        return;
    }
    inputHalaman.classList.remove("is-invalid");

    const hargaDasar = Number(select.value);
    const hariDasar = Number(select.options[select.selectedIndex].getAttribute("data-hari"));
    const namaProyek = select.options[select.selectedIndex].text.split(" (")[0];

    const biayaHalaman = (halaman - 1) * 150000;

    let biayaFitur = 0;
    let jumlahFitur = 0;
    document.querySelectorAll(".fitur:checked").forEach(function(cb) {
        biayaFitur += Number(cb.value);
        jumlahFitur++;
    });

    let subtotal = hargaDasar + biayaHalaman + biayaFitur;
    const biayaEkspres = ekspres ? subtotal * 0.3 : 0;
    const total = subtotal + biayaEkspres;

    // estimasi hari: dasar + 1 hari tiap 3 halaman tambahan + 1 hari tiap fitur
    let hari = hariDasar + Math.floor((halaman - 1) / 3) + jumlahFitur;
    if (ekspres) hari = Math.max(2, Math.ceil(hari * 0.6));

    // tampilkan ke DOM
    const totalEl = document.getElementById("hasilTotal");
    totalEl.textContent = formatRupiah(total);
    totalEl.classList.add("bump");
    setTimeout(function() { totalEl.classList.remove("bump"); }, 250);

    let rincian = "<li><span>" + namaProyek + "</span><span>" + formatRupiah(hargaDasar) + "</span></li>";
    rincian += "<li><span>Halaman tambahan (" + (halaman - 1) + ")</span><span>" + formatRupiah(biayaHalaman) + "</span></li>";
    rincian += "<li><span>Fitur tambahan (" + jumlahFitur + ")</span><span>" + formatRupiah(biayaFitur) + "</span></li>";
    if (ekspres) {
        rincian += "<li><span>Biaya ekspres (30%)</span><span>" + formatRupiah(biayaEkspres) + "</span></li>";
    }
    document.getElementById("rincian").innerHTML = rincian;
    document.getElementById("hasilHari").textContent = hari + " hari kerja";
}

function initCalculator() {
    const form = document.getElementById("calcForm");
    form.addEventListener("submit", function(e) {
        e.preventDefault();
        hitungEstimasi();
    });
    // hasil update langsung saat input berubah
    form.addEventListener("input", hitungEstimasi);
    form.addEventListener("change", hitungEstimasi);
    hitungEstimasi();
}

/* ---------- 7. VALIDASI FORM KONTAK ---------- */
function validasiField(input, kondisi) {
    input.classList.toggle("is-invalid", !kondisi);
    input.classList.toggle("is-valid", kondisi);
    return kondisi;
}

function initContactForm() {
    const form = document.getElementById("contactForm");
    const nama = document.getElementById("nama");
    const email = document.getElementById("email");
    const pesan = document.getElementById("pesan");
    const alertBox = document.getElementById("formAlert");
    const charCount = document.getElementById("charCount");

    const polaEmail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    const cekNama = function() { return validasiField(nama, nama.value.trim().length >= 3); };
    const cekEmail = function() { return validasiField(email, polaEmail.test(email.value.trim())); };
    const cekPesan = function() { return validasiField(pesan, pesan.value.trim().length >= 10); };

    nama.addEventListener("input", cekNama);
    email.addEventListener("input", cekEmail);
    pesan.addEventListener("input", function() {
        charCount.textContent = pesan.value.length + "/300";
        cekPesan();
    });

    form.addEventListener("submit", function(e) {
        e.preventDefault();
        const valid = [cekNama(), cekEmail(), cekPesan()].every(Boolean);

        if (!valid) {
            alertBox.classList.add("d-none");
            return;
        }

        alertBox.textContent = "Terima kasih, " + nama.value.trim() + "! Pesanmu sudah diterima.";
        alertBox.classList.remove("d-none");
        form.reset();
        charCount.textContent = "0/300";
        [nama, email, pesan].forEach(function(el) { el.classList.remove("is-valid", "is-invalid"); });
        setTimeout(function() { alertBox.classList.add("d-none"); }, 5000);
    });
}

/* ---------- 8. INISIALISASI ---------- */
document.addEventListener("DOMContentLoaded", function() {
    initTheme();
    document.getElementById("themeToggle").addEventListener("click", toggleTheme);

    initTyping();
    initCustomImages();
    initObservers();
    initProjectFilter();
    initCalculator();
    initContactForm();

    document.getElementById("year").textContent = new Date().getFullYear();
    document.getElementById("toTop").addEventListener("click", function() {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });
    document.querySelectorAll(".navbar-nav .nav-link").forEach(function(link) {
        link.addEventListener("click", closeMobileMenu);
    });

    window.addEventListener("scroll", handleScroll);
    handleScroll();
});