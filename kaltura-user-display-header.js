(function() {
    'use strict';
    
    const CONFIG = {
        username: 'BEN EMERY',
        retryAttempts: 20,
        retryDelay: 500
    };
    
    function extractUsernameFromEmail() {
        const inputs = document.querySelectorAll('input[name*="username"], input[type="email"], input[name*="email"]');
        for (let input of inputs) {
            if (input.value && input.value.includes('@')) {
                const username = input.value.split('@')[0];
                const parts = username.split(/[._-]/);
                return parts.map(part => part.toUpperCase()).join(' ');
            }
        }
        return null;
    }
    
    function findUserIcon() {
        const allElements = document.querySelectorAll('button, a');
        for (let el of allElements) {
            const rect = el.getBoundingClientRect();
            if (rect.right > window.innerWidth - 300 && rect.top < 100) {
                const text = el.textContent.toLowerCase();
                const href = (el.getAttribute('href') || '').toLowerCase();
                
                if (text.includes('log in') || text.includes('sign in') || text.includes('login') || 
                    href.includes('login') || href.includes('signin')) {
                    continue;
                }
                
                return el;
            }
        }
        return null;
    }
    
    function injectUsername(username) {
        const icon = findUserIcon();
        if (!icon) return false;
        
        const existing = document.querySelector('.kms-username-display');
        if (existing) {
            existing.textContent = username;
            return true;
        }
        
        const usernameEl = document.createElement('span');
        usernameEl.className = 'kms-username-display';
        usernameEl.textContent = username;
        usernameEl.style.cssText = 'margin-left:8px;margin-right:8px;font-size:14px;font-weight:500;color:#ffffff;white-space:nowrap;vertical-align:middle;display:inline-block;cursor:pointer;';
        
        usernameEl.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            icon.click();
        });
        
        if (icon.nextSibling) {
            icon.parentNode.insertBefore(usernameEl, icon.nextSibling);
        } else if (icon.parentElement) {
            icon.parentElement.appendChild(usernameEl);
        } else {
            return false;
        }
        return true;
    }
    
    function execute(attempt) {
        if (attempt === undefined) attempt = 0;
        
        let username = sessionStorage.getItem('kms_username');
        if (!username) {
            username = extractUsernameFromEmail() || CONFIG.username;
            if (username) sessionStorage.setItem('kms_username', username);
        }
        
        if (!username) {
            if (attempt < CONFIG.retryAttempts) {
                setTimeout(function() { execute(attempt + 1); }, CONFIG.retryDelay);
            }
            return;
        }
        
        const success = injectUsername(username);
        if (!success && attempt < CONFIG.retryAttempts) {
            setTimeout(function() { execute(attempt + 1); }, CONFIG.retryDelay);
        }
    }
    
    function alignDropdownMenu() {
        const usernameEl = document.querySelector('.kms-username-display');
        if (!usernameEl) return;
        
        const userIcon = findUserIcon();
        if (!userIcon) return;
        
        const allElements = document.querySelectorAll('*');
        for (let el of allElements) {
            const rect = el.getBoundingClientRect();
            const styles = window.getComputedStyle(el);
            
            if (rect.width > 100 && rect.width < 400 && 
                rect.top > 30 && rect.top < 150 && 
                rect.right > window.innerWidth - 500 &&
                (styles.position === 'absolute' || styles.position === 'fixed') &&
                (styles.backgroundColor !== 'rgba(0, 0, 0, 0)' && styles.backgroundColor !== 'transparent')) {
                
                const iconRect = userIcon.getBoundingClientRect();
                const horizontalDistance = Math.abs(rect.left - iconRect.left);
                
                if (horizontalDistance < 100 && !el.hasAttribute('data-kms-aligned')) {
                    const usernameRect = usernameEl.getBoundingClientRect();
                    const shiftAmount = usernameRect.right - rect.right;
                    
                    const currentTransform = styles.transform;
                    if (currentTransform && currentTransform !== 'none') {
                        el.style.transform = currentTransform + ' translateX(' + shiftAmount + 'px)';
                    } else {
                        el.style.transform = 'translateX(' + shiftAmount + 'px)';
                    }
                    
                    el.setAttribute('data-kms-aligned', 'true');
                }
            }
        }
    }
    
    function isUserLoggedIn() {
        const userIcon = findUserIcon();
        if (!userIcon) return false;
        
        const allButtons = document.querySelectorAll('button, a');
        for (let btn of allButtons) {
            const text = btn.textContent.trim().toLowerCase();
            const href = btn.getAttribute('href') || '';
            
            if ((text === 'log in' || text === 'sign in' || text === 'login') && 
                (href.includes('login') || btn.tagName === 'BUTTON')) {
                return false;
            }
        }
        
        const iconText = userIcon.textContent.trim().toLowerCase();
        if (iconText.includes('log in') || iconText.includes('sign in')) {
            return false;
        }
        
        return true;
    }
    
    let lastUrl = window.location.href;
    let loggedOut = false;
    
    function setupLogoutDetection() {
        document.addEventListener('click', function(e) {
            const target = e.target.closest('a, button');
            if (target) {
                const href = target.getAttribute('href') || '';
                const text = target.textContent.toLowerCase();
                
                if (href.includes('logout') || href.includes('logoff') || 
                    text.includes('log out') || text.includes('logout') || text.includes('sign out')) {
                    
                    loggedOut = true;
                    setTimeout(function() {
                        const existing = document.querySelector('.kms-username-display');
                        if (existing) {
                            existing.remove();
                        }
                        sessionStorage.removeItem('kms_username');
                        sessionStorage.setItem('kms_logged_out', 'true');
                    }, 100);
                }
            }
        }, true);
        
        const originalFetch = window.fetch;
        window.fetch = function() {
            const url = arguments[0];
            if (typeof url === 'string' && (url.includes('logout') || url.includes('logoff'))) {
                loggedOut = true;
                setTimeout(function() {
                    const existing = document.querySelector('.kms-username-display');
                    if (existing) {
                        existing.remove();
                    }
                    sessionStorage.removeItem('kms_username');
                    sessionStorage.setItem('kms_logged_out', 'true');
                }, 500);
            }
            return originalFetch.apply(this, arguments);
        };
    }
    
    function setupMonitoring() {
        setInterval(function() {
            const existing = document.querySelector('.kms-username-display');
            
            if (sessionStorage.getItem('kms_logged_out') === 'true') {
                if (existing) {
                    existing.remove();
                }
                return;
            }
            
            if (window.location.href !== lastUrl) {
                lastUrl = window.location.href;
                if (existing) {
                    existing.remove();
                }
                sessionStorage.removeItem('kms_username');
            }
            
            const logoutLink = document.querySelector('a[href*="logout"], a[href*="logoff"]');
            if (logoutLink && existing) {
                const logoutRect = logoutLink.getBoundingClientRect();
                if (logoutRect.width > 0 && logoutRect.height > 0) {
                    existing.remove();
                    sessionStorage.removeItem('kms_username');
                    return;
                }
            }
            
            const userIcon = findUserIcon();
            if (userIcon && !loggedOut) {
                const username = sessionStorage.getItem('kms_username') || CONFIG.username;
                if (!existing && username) {
                    injectUsername(username);
                }
                alignDropdownMenu();
            }
        }, 1000);
        
        const observer = new MutationObserver(function() {
            const existing = document.querySelector('.kms-username-display');
            
            if (sessionStorage.getItem('kms_logged_out') === 'true') {
                if (existing) {
                    existing.remove();
                }
                return;
            }
            
            const userIcon = findUserIcon();
            
            if (existing && !userIcon) {
                existing.remove();
                sessionStorage.removeItem('kms_username');
                return;
            }
            
            if (existing && userIcon && !userIcon.parentElement.contains(existing)) {
                existing.remove();
                sessionStorage.removeItem('kms_username');
                return;
            }
            
            if (userIcon && !loggedOut) {
                const username = sessionStorage.getItem('kms_username') || CONFIG.username;
                if (!existing && username) {
                    injectUsername(username);
                }
                alignDropdownMenu();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    execute();
    setupLogoutDetection();
    setupMonitoring();
    
})();
