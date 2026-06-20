/* ================================================================
   JDF SISTEMAS — JAVASCRIPT
   ================================================================ */

/* ----------------------------------------------------------------
   COPIAR EMAIL AL PORTAPAPELES
   ---------------------------------------------------------------- */
function copyEmail() {
    const email = 'info@jdfsistemas.com.ar';

    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(email)
            .then(() => showToast('Email copiado: ' + email))
            .catch(() => fallbackCopy(email));
    } else {
        fallbackCopy(email);
    }
}

function fallbackCopy(text) {
    const el = document.createElement('input');
    el.value = text;
    el.style.cssText = 'position:fixed;opacity:0;top:0;left:0;';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
        document.execCommand('copy');
        showToast('Email copiado: ' + text);
    } catch {
        showToast('Email: ' + text);
    }
    document.body.removeChild(el);
}

/* ----------------------------------------------------------------
   TOAST NOTIFICATION
   ---------------------------------------------------------------- */
let toastTimer = null;

function showToast(msg) {
    const toast = document.getElementById('toast');
    const label = document.getElementById('toastMsg');
    label.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ----------------------------------------------------------------
   MENÚ HAMBURGUESA
   ---------------------------------------------------------------- */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    const isOpen = navMenu.classList.toggle('open');
    hamburger.classList.toggle('active', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen);
});

navMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    });
});

// Cerrar menú si se hace click fuera
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('open');
        hamburger.classList.remove('active');
        hamburger.setAttribute('aria-expanded', 'false');
    }
});

/* ----------------------------------------------------------------
   NAVBAR — EFECTO AL SCROLL
   ---------------------------------------------------------------- */
const navbar = document.getElementById('navbar');

function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
    updateActiveNav();
}

window.addEventListener('scroll', onScroll, { passive: true });

/* ----------------------------------------------------------------
   NAV LINK ACTIVO SEGÚN SECCIÓN VISIBLE
   ---------------------------------------------------------------- */
const sections  = Array.from(document.querySelectorAll('section[id]'));
const navLinks  = Array.from(document.querySelectorAll('.nav-link'));

function updateActiveNav() {
    const scrollMid = window.scrollY + window.innerHeight / 2;

    let currentId = sections[0]?.id;
    for (const sec of sections) {
        if (sec.offsetTop <= scrollMid) currentId = sec.id;
    }

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        link.classList.toggle('active', href === '#' + currentId);
    });
}

/* ----------------------------------------------------------------
   VALIDACIÓN DEL FORMULARIO DE CONTACTO
   ---------------------------------------------------------------- */
const form      = document.getElementById('contactForm');
const submitBtn = document.getElementById('submitBtn');

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const nombre  = document.getElementById('nombre');
    const cemail  = document.getElementById('cemail');
    const mensaje = document.getElementById('mensaje');

    const errNombre  = document.getElementById('errNombre');
    const errEmail   = document.getElementById('errEmail');
    const errMensaje = document.getElementById('errMensaje');

    // Reset
    [nombre, cemail, mensaje].forEach(f => f.classList.remove('err'));
    [errNombre, errEmail, errMensaje].forEach(e => e.classList.remove('show'));

    let ok = true;

    if (!nombre.value.trim() || nombre.value.trim().length < 2) {
        nombre.classList.add('err');
        errNombre.classList.add('show');
        ok = false;
    }

    const emailRx = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cemail.value.trim() || !emailRx.test(cemail.value.trim())) {
        cemail.classList.add('err');
        errEmail.classList.add('show');
        ok = false;
    }

    if (!mensaje.value.trim() || mensaje.value.trim().length < 10) {
        mensaje.classList.add('err');
        errMensaje.classList.add('show');
        ok = false;
    }

    if (!ok) return;

    // Éxito visual
    const origHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = '<i class="fas fa-check"></i> ¡Mensaje enviado!';
    submitBtn.classList.add('success');
    submitBtn.disabled = true;

    showToast('¡Mensaje enviado correctamente!');

    setTimeout(() => {
        submitBtn.innerHTML = origHTML;
        submitBtn.classList.remove('success');
        submitBtn.disabled = false;
        form.reset();
    }, 3200);
});

// Limpiar error al escribir
['nombre', 'cemail', 'mensaje'].forEach(id => {
    const el  = document.getElementById(id);
    const err = document.getElementById('err' + id.charAt(0).toUpperCase() + id.slice(1));
    if (el && err) {
        el.addEventListener('input', () => {
            el.classList.remove('err');
            err.classList.remove('show');
        });
    }
});

/* ----------------------------------------------------------------
   SCROLL REVEAL (Intersection Observer)
   ---------------------------------------------------------------- */
const revealEls = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.1,
    rootMargin: '0px 0px -28px 0px'
});

revealEls.forEach(el => revealObserver.observe(el));

/* ----------------------------------------------------------------
   MARCAR ELEMENTOS HERO COMO VISIBLES AL CARGAR
   (el hero está visible sin scroll)
   ---------------------------------------------------------------- */
window.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.hero .reveal').forEach(el => {
        el.classList.add('visible');
    });
    updateActiveNav();
});

/* ----------------------------------------------------------------
   YOUTUBE FACADE — abre el video en YouTube al hacer click
   ---------------------------------------------------------------- */
document.querySelectorAll('.yt-facade').forEach(facade => {
    facade.addEventListener('click', () => {
        const id = facade.dataset.id;
        window.open(`https://www.youtube.com/watch?v=${id}`, '_blank', 'noopener,noreferrer');
    });
});
