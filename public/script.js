document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const loginFormWrapper = document.getElementById('login-form-wrapper');
    const registerFormWrapper = document.getElementById('register-form-wrapper');
    const toRegisterBtn = document.getElementById('to-register');
    const toLoginBtn = document.getElementById('to-login');
    const togglePasswordBtns = document.querySelectorAll('.toggle-password');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    // Toggle between forms with animation
    function switchForms(hideForm, showForm) {
        hideForm.classList.remove('active');
        hideForm.classList.add('exit');

        setTimeout(() => {
            hideForm.style.display = 'none';
            hideForm.classList.remove('exit');

            showForm.style.display = 'block';
            setTimeout(() => {
                showForm.classList.add('active');
            }, 50);
        }, 300); // match transition smoother time
    }

    // Set initial state
    registerFormWrapper.style.display = 'none';

    toRegisterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchForms(loginFormWrapper, registerFormWrapper);
    });

    toLoginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        switchForms(registerFormWrapper, loginFormWrapper);
    });

    // Toggle Password Visibility
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const input = btn.previousElementSibling;
            const icon = btn.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('ri-eye-off-line');
                icon.classList.add('ri-eye-line');
            } else {
                input.type = 'password';
                icon.classList.remove('ri-eye-line');
                icon.classList.add('ri-eye-off-line');
            }
        });
    });

    // Toast Notification System
    function showToast(message, type = 'success') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconClass = type === 'success' ? 'ri-checkbox-circle-fill' : 'ri-error-warning-fill';

        toast.innerHTML = `
            <i class="${iconClass}"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        // Remove after 3 seconds
        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s forwards';
            setTimeout(() => {
                if (toastContainer.contains(toast)) {
                    toastContainer.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    // Handle Login Submit
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('login-btn');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Entrando...';
        btn.disabled = true;

        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                // Store user info in localStorage for the dashboard
                if (result.user) {
                    localStorage.setItem('haruedu_user', JSON.stringify(result.user));
                }
                showToast('Login realizado com sucesso! Redirecionando...', 'success');

                // Redirect to the new BI Dashboard
                setTimeout(() => {
                    window.location.href = '/bigestao.html';
                }, 800);
            } else {
                showToast(result.message || 'Erro ao realizar login', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showToast('Erro de conexão com o servidor.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });

    // Handle Registration Submit
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const btn = document.getElementById('register-btn');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> Cadastrando...';
        btn.disabled = true;

        const formData = new FormData(registerForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok) {
                showToast('Conta criada com sucesso! Faça login.', 'success');
                registerForm.reset();
                setTimeout(() => {
                    switchForms(registerFormWrapper, loginFormWrapper);
                }, 1500);
            } else {
                showToast(result.message || 'Erro ao criar conta', 'error');
            }
        } catch (error) {
            console.error('Registration error:', error);
            showToast('Erro de conexão com o servidor.', 'error');
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    });
});
