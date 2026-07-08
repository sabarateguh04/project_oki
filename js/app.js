/* ============================================
   Maintenance System - app.js
   Role-based: admin, atasan, finance
   (Teknisi pakai aplikasi mobile terpisah)
============================================ */

"use strict";

/* ============================================
   ROLE CONFIG
============================================ */

const ROLE_PROFILE = {
    admin:   { name: "pak oky elja",   title: "Admin Operasional" },
    atasan:  { name: "Pak boim",  title: "Kepala Operasional" },
    finance: { name: "mbak nur",    title: "Finance Staff" }
};

const ROLE_MENU = {
    admin: [
        { href: "dashboard.html",  icon: "bi-speedometer2",     label: "Dashboard", key: "dashboard" },
        { href: "form-order.html", icon: "bi-plus-circle",      label: "Buat Tiket", key: "form-order" },
        { href: "orders.html",     icon: "bi-list-task",        label: "Data Order", key: "orders" },
        { href: "customer.html",   icon: "bi-building",         label: "Customer", key: "customer" },
        { href: "technician.html",icon: "bi-person-badge",      label: "Data Teknisi", key: "technician" },
        { href: "profile.html",    icon: "bi-person-circle",    label: "Profil", key: "profile" }
    ],
    atasan: [
        { href: "dashboard.html",         icon: "bi-speedometer2",  label: "Dashboard", key: "dashboard" },
        { href: "approval-atasan.html",   icon: "bi-check2-square", label: "Approval Tiket", key: "approval-atasan", badge: "atasan" },
        { href: "orders.html",            icon: "bi-list-task",     label: "Data Order", key: "orders" },
        { href: "profile.html",           icon: "bi-person-circle", label: "Profil", key: "profile" }
    ],
    finance: [
        { href: "dashboard.html",         icon: "bi-speedometer2",  label: "Dashboard", key: "dashboard" },
        { href: "approval-finance.html",  icon: "bi-cash-coin",     label: "Approval Finance", key: "approval-finance", badge: "finance" },
        { href: "orders.html",            icon: "bi-list-task",     label: "Data Order", key: "orders" },
        { href: "profile.html",           icon: "bi-person-circle", label: "Profil", key: "profile" }
    ]
};

/* dummy antrean count buat badge sidebar */
const QUEUE_COUNT = {
    atasan: 3,
    finance: 5
};

/* halaman yang boleh diakses tiap role (di luar ini akan ditolak) */
const ROLE_PAGES = {
    admin:   ["dashboard.html","form-order.html","orders.html","order-detail.html","customer.html","technician.html","profile.html"],
    atasan:  ["dashboard.html","approval-atasan.html","orders.html","order-detail.html","profile.html"],
    finance: ["dashboard.html","approval-finance.html","orders.html","order-detail.html","profile.html"]
};

/* ============================================
   LOGIN GUARD + ROLE GUARD
============================================ */

(function () {

    const page = window.location.pathname.split("/").pop() || "index.html";

    if (page === "index.html") return;

    const login = localStorage.getItem("login");
    const role = localStorage.getItem("role");

    if (login !== "true" || !role || !ROLE_PROFILE[role]) {
        window.location.href = "index.html";
        return;
    }

    const allowed = ROLE_PAGES[role] || [];

    if (!allowed.includes(page)) {
        sessionStorage.setItem("accessDenied", "1");
        window.location.href = "dashboard.html";
    }

})();

/* ============================================
   LOGIN AS ROLE (dipanggil dari index.html)
============================================ */

function loginAs(role) {

    if (!ROLE_PROFILE[role]) return;

    localStorage.setItem("login", "true");
    localStorage.setItem("role", role);
    localStorage.setItem("username", ROLE_PROFILE[role].name);

    window.location.href = "dashboard.html";

}

/* ============================================
   LOGOUT
============================================ */

function logout() {

    if (!confirm("Logout sekarang?")) return;

    localStorage.clear();
    window.location.href = "index.html";

}

/* ============================================
   RENDER SIDEBAR (dipanggil di tiap halaman)
============================================ */

function renderSidebar(activeKey) {

    const role = localStorage.getItem("role");
    const profile = ROLE_PROFILE[role];
    const menu = ROLE_MENU[role];

    if (!profile || !menu) return;

    let html = '<div class="logo"><i class="bi bi-tools"></i>Maintenance</div>';

    html += `<div class="sidebar-role"><span class="role-pill role-${role}">${profile.title}</span></div>`;

    menu.forEach(item => {
        const activeCls = item.key === activeKey ? ' class="active"' : '';
        let badge = "";
        if (item.badge && QUEUE_COUNT[item.badge]) {
            badge = `<span class="nav-count">${QUEUE_COUNT[item.badge]}</span>`;
        }
        html += `<a href="${item.href}"${activeCls}><span class="nav-label"><i class="bi ${item.icon}"></i> ${item.label}</span>${badge}</a>`;
    });

    html += '<a href="#" onclick="logout()"><span class="nav-label"><i class="bi bi-box-arrow-right"></i> Logout</span></a>';

    const el = document.getElementById("sidebar");
    if (el) el.innerHTML = html;

    const userEl = document.getElementById("username");
    if (userEl) userEl.innerHTML = profile.name;

    const roleBadgeEl = document.getElementById("roleBadge");
    if (roleBadgeEl) roleBadgeEl.innerHTML = `<span class="role-pill role-${role}">${profile.title}</span>`;

    if (sessionStorage.getItem("accessDenied")) {
        sessionStorage.removeItem("accessDenied");
        toast("Halaman itu bukan bagian akses kamu, dialihkan ke Dashboard");
    }

}

function currentRole() {
    return localStorage.getItem("role");
}

/* ============================================
   SEARCH TABLE
============================================ */

function searchTable(inputId, tableId) {

    const keyword = document.getElementById(inputId).value.toUpperCase();
    const table = document.getElementById(tableId);
    const tr = table.getElementsByTagName("tr");

    for (let i = 1; i < tr.length; i++) {
        const row = tr[i];
        let show = false;
        const td = row.getElementsByTagName("td");
        for (let j = 0; j < td.length; j++) {
            if (td[j].innerText.toUpperCase().indexOf(keyword) > -1) show = true;
        }
        row.style.display = show ? "" : "none";
    }

}

/* ============================================
   FILTER STATUS
============================================ */

function filterStatus(selectId, tableId, columnIndex) {

    const status = document.getElementById(selectId).value;
    const table = document.getElementById(tableId);
    const rows = table.getElementsByTagName("tr");

    for (let i = 1; i < rows.length; i++) {
        const cell = rows[i].getElementsByTagName("td")[columnIndex];
        if (!cell) continue;
        if (status === "") {
            rows[i].style.display = "";
            continue;
        }
        rows[i].style.display = cell.innerText.trim().includes(status) ? "" : "none";
    }

}

/* ============================================
   DELETE ROW
============================================ */

function deleteRow(btn) {

    if (!confirm("Yakin menghapus data?")) return;

    btn.closest("tr").remove();
    toast("Data berhasil dihapus");

}

/* ============================================
   APPROVAL ACTIONS (dummy, hapus row + toast)
============================================ */

function approveAtasan(btn) {
    const row = btn.closest("tr");
    toast("Tiket disetujui, diteruskan ke Finance");
    if (row) row.remove();
}

function rejectAtasan(btn) {
    const row = btn.closest("tr");
    toast("Tiket ditolak, dikembalikan ke Admin untuk revisi");
    if (row) row.remove();
}

function financeClearPrepay(btn) {
    const row = btn.closest("tr");
    toast("Dana pre-bayar ditransfer & bukti diupload, tiket siap di-assign");
    if (row) row.remove();
}

function financeSkipPrepay(btn) {
    const row = btn.closest("tr");
    toast("Tidak ada kebutuhan pre-bayar, tiket langsung di-assign ke teknisi");
    if (row) row.remove();
}

function financePayJasa(btn) {
    const row = btn.closest("tr");
    toast("Jasa/ongkos teknisi berhasil ditransfer");
    if (row) row.remove();
}

function uploadBukti() {
    toast("Bukti transfer berhasil diupload (dummy)");
}

function approve(){ toast("Order berhasil diapprove"); }
function reject(){ toast("Order ditolak"); }

/* ============================================
   FORMAT RUPIAH
============================================ */

function rupiah(angka) {
    return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" }).format(angka);
}

/* ============================================
   PREVIEW IMAGE
============================================ */

function previewImage(input, target) {
    if (!input.files.length) return;
    const reader = new FileReader();
    reader.onload = function (e) {
        document.getElementById(target).src = e.target.result;
    }
    reader.readAsDataURL(input.files[0]);
}

/* ============================================
   TOAST
============================================ */

function toast(message) {

    let el = document.createElement("div");
    el.className = "toast-custom";
    el.innerHTML = message;
    document.body.appendChild(el);

    setTimeout(() => { el.classList.add("show"); }, 100);

    setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => { el.remove(); }, 300);
    }, 2600);

}

/* ============================================
   LOADER
============================================ */

function showLoader() {
    let loader = document.createElement("div");
    loader.id = "loader";
    loader.innerHTML = '<div class="spinner-border text-primary"></div>';
    document.body.appendChild(loader);
}

function hideLoader() {
    let loader = document.getElementById("loader");
    if (loader) loader.remove();
}

/* ============================================
   DATE HELPERS
============================================ */

function today() {
    let d = new Date();
    return d.toISOString().substring(0,10);
}

window.addEventListener("DOMContentLoaded", function(){
    let input = document.querySelectorAll(".today");
    input.forEach(function(i){ i.value = today(); });
});

/* ============================================
   RANDOM ORDER NUMBER
============================================ */

function generateOrderNumber(){
    let n = Math.floor(Math.random()*99999);
    return "ORD-"+String(n).padStart(5,"0");
}

/* ============================================
   EXPORT / PRINT (dummy)
============================================ */

function exportCSV(){ alert("Export CSV berhasil (dummy)"); }
function printPage(){ window.print(); }

console.log("Maintenance System Ready");
