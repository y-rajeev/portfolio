/* Portfolio: nav, smooth scroll, active section link, contact form (Formspree), footer year */
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section');
    const contactForm = document.getElementById('contactForm');
    const yearEl = document.getElementById('year');

    function throttle(func, limit) {
        let inThrottle;
        return function () {
            if (!inThrottle) {
                func.apply(this, arguments);
                inThrottle = true;
                setTimeout(function () {
                    inThrottle = false;
                }, limit);
            }
        };
    }

    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function () {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        navLinks.forEach(function (link) {
            link.addEventListener('click', function () {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
        anchor.addEventListener('click', function (e) {
            var id = this.getAttribute('href');
            if (id.length > 1) {
                e.preventDefault();
                var target = document.querySelector(id);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        });
    });

    if (navbar) {
        var handleScroll = throttle(function () {
            if (window.scrollY > 100) {
                navbar.style.background = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = 'none';
            }
        }, 16);
        window.addEventListener('scroll', handleScroll);
    }

    var updateActiveNav = throttle(function () {
        var current = '';
        sections.forEach(function (section) {
            var sectionTop = section.offsetTop;
            if (scrollY >= sectionTop - 200) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(function (link) {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    }, 100);
    window.addEventListener('scroll', updateActiveNav);

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();
            var form = this;
            var submitBtn = form.querySelector('button[type="submit"]');
            var originalText = submitBtn.textContent;
            submitBtn.textContent = 'Sending...';
            submitBtn.disabled = true;

            var controller = new AbortController();
            var timeoutId = setTimeout(function () {
                controller.abort();
            }, 10000);

            fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' },
                signal: controller.signal
            })
                .then(function (response) {
                    clearTimeout(timeoutId);
                    if (response.ok) {
                        showNotification('Message sent successfully!', 'success');
                        form.reset();
                    } else {
                        throw new Error('HTTP ' + response.status);
                    }
                })
                .catch(function (err) {
                    clearTimeout(timeoutId);
                    if (err.name === 'AbortError') {
                        showNotification('Request timed out. Please try again.', 'error');
                    } else {
                        showNotification('There was an error sending your message. Please try again.', 'error');
                    }
                })
                .finally(function () {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                });
        });
    }

    function showNotification(message, type) {
        type = type || 'info';
        var existing = document.querySelector('.notification');
        if (existing) {
            existing.remove();
        }

        var colors = { success: '#27ae60', error: '#e74c3c', info: '#3498db' };
        var notification = document.createElement('div');
        notification.className = 'notification notification-' + type;
        notification.setAttribute('role', 'status');
        notification.innerHTML =
            '<div class="notification-content">' +
            '<span class="notification-message"></span>' +
            '<button type="button" class="notification-close" aria-label="Close">&times;</button>' +
            '</div>';
        notification.querySelector('.notification-message').textContent = message;

        notification.style.cssText =
            'position:fixed;top:20px;right:20px;background:' +
            (colors[type] || colors.info) +
            ';color:#fff;padding:1rem 1.5rem;border-radius:10px;box-shadow:0 10px 30px rgba(0,0,0,.2);z-index:10000;transform:translateX(400px);transition:transform .3s cubic-bezier(.4,0,.2,1);max-width:300px;font-family:Poppins,sans-serif';

        document.body.appendChild(notification);
        requestAnimationFrame(function () {
            notification.style.transform = 'translateX(0)';
        });

        var remove = function () {
            notification.style.transform = 'translateX(400px)';
            setTimeout(function () {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        };

        var autoRemove = setTimeout(remove, 5000);
        notification.querySelector('.notification-close').addEventListener('click', function () {
            clearTimeout(autoRemove);
            remove();
        });
    }
});
