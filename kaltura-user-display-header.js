(function() {
    'use strict';
    
    let userDisplayElement = null;
    
    function fetchUserDetails() {
        const timestamp = new Date().getTime();
        return fetch(`/user/get-details?format=ajax&_=${timestamp}`, {
            credentials: 'same-origin',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data && data.content && data.content[0] && data.content[0].content) {
                return data.content[0].content;
            }
            return 'Login Here';
        })
        .catch(() => 'Login Here');
    }
    
    function createUserDisplay(username) {
        const userMenuButton = document.querySelector('[aria-label="user menu"]');
        if (!userMenuButton) {
            console.log('User menu button not found');
            return;
        }
        
        if (userDisplayElement) {
            userDisplayElement.textContent = username;
            userDisplayElement.href = (username === 'Login Here') ? '/user/login' : '#';
            userDisplayElement.title = username;
            return;
        }
        
        const parentDiv = userMenuButton.parentNode;
        if (!parentDiv) {
            console.log('Parent not found');
            return;
        }
        
        parentDiv.style.display = 'flex';
        parentDiv.style.alignItems = 'center';
        parentDiv.style.gap = '0px';
        
        userDisplayElement = document.createElement('a');
        userDisplayElement.textContent = username;
        userDisplayElement.id = 'kms-username-display';
        userDisplayElement.href = (username === 'Login Here') ? '/user/login' : '#';
        userDisplayElement.title = username;
        userDisplayElement.style.cssText = `
            font-size: 14px;
            font-weight: 500;
            color: #ffffff;
            white-space: nowrap;
            text-decoration: none;
            cursor: pointer;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
        `;
        
        if (username !== 'Login Here') {
            userDisplayElement.onclick = function(e) {
                e.preventDefault();
                const menuBtn = document.querySelector('[aria-label="user menu"]');
                if (menuBtn) {
                    menuBtn.click();
                }
            };
        }
        
        parentDiv.appendChild(userDisplayElement);
        
        setTimeout(attachMenuRepositioning, 200);
    }
    
    function updateUserDisplay() {
        fetchUserDetails().then(username => {
            createUserDisplay(username);
        });
    }
    
    function waitForUserMenu() {
        const userMenuButton = document.getElementById('userMenuToggle');
        if (userMenuButton) {
            updateUserDisplay();
            return;
        }
        
        const observer = new MutationObserver(function(mutations, obs) {
            const button = document.getElementById('userMenuToggle');
            if (button) {
                obs.disconnect();
                updateUserDisplay();
            }
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForUserMenu);
    } else {
        waitForUserMenu();
    }
    
    document.body.addEventListener('userDetailsPopulated', function() {
        updateUserDisplay();
    });
    
    function repositionUserMenu() {
        setTimeout(function() {
            const menu = document.querySelector('[role="menu"][aria-labelledby="userMenuToggleBtn"]');
            if (!menu) return;
            
            const usernameElement = document.getElementById('kms-username-display');
            if (!usernameElement) return;
            
            const menuParent = menu.parentElement;
            if (!menuParent) return;
            
            const usernameRect = usernameElement.getBoundingClientRect();
            const menuRect = menuParent.getBoundingClientRect();
            
            const offsetX = usernameRect.right - menuRect.right;
            
            menuParent.style.transform = `translateX(${offsetX}px)`;
        }, 50);
    }
    
    function attachMenuRepositioning() {
        const userMenuButton = document.querySelector('[aria-label="user menu"]');
        if (userMenuButton && !userMenuButton.dataset.repositionAttached) {
            userMenuButton.addEventListener('click', repositionUserMenu);
            userMenuButton.dataset.repositionAttached = 'true';
        }
    }
    
    const menuObserver = new MutationObserver(attachMenuRepositioning);
    menuObserver.observe(document.body, {
        childList: true,
        subtree: true
    });
})();
