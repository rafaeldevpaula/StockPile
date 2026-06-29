document.addEventListener('DOMContentLoaded', function() {
    atualizarNavbarAuth();
    configurarEventosAuth();
});

function obterUsuarioLogado() {
    return localStorage.getItem('usuarioLogado') || null;
}

function obterDadosUsuarioAtivo() {
    const usuario = obterUsuarioLogado();
    if (!usuario) return null;
    
    const usuarios = JSON.parse(localStorage.getItem('usuariosStockpile')) || [];
    return usuarios.find(u => u.username === usuario) || { username: usuario, name: usuario, bio: "" };
}

function atualizarNavbarAuth() {
    const authArea = document.getElementById('navAuthArea');
    if (!authArea) return;

    const usuario = obterUsuarioLogado();

    if (usuario) {
        const dados = obterDadosUsuarioAtivo();
        authArea.innerHTML = `
            <div class="d-flex align-items-center flex-column flex-lg-row">
                <a href="perfil.html" class="text-white me-lg-3 mb-2 mb-lg-0 text-decoration-none fw-semibold">
                    <span class="badge bg-purple-badge p-2 text-wrap">
                        ${dados.name}
                    </span>
                </a>
                <button class="btn btn-outline-danger btn-sm rounded-pill px-3" id="btnAuthLogout">Sair</button>
            </div>
        `;
    } else {
        authArea.innerHTML = `
            <button class="btn btn-primary btn-sm px-4 py-1.5 rounded-pill" data-bs-toggle="modal" data-bs-target="#modalAuth">Entrar</button>
        `;
    }
}

function configurarEventosAuth() {
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', function(e) {
            e.preventDefault();
            const username = document.getElementById('loginUsername').value.trim().toLowerCase();
            const password = document.getElementById('loginPassword').value;

            const usuarios = JSON.parse(localStorage.getItem('usuariosStockpile')) || [];
            const usuarioEncontrado = usuarios.find(u => u.username === username && u.password === password);

            if (usuarioEncontrado) {
                localStorage.setItem('usuarioLogado', username);
                
                const modal = bootstrap.Modal.getInstance(document.getElementById('modalAuth'));
                modal.hide();
                
                atualizarNavbarAuth();
                mostrarToast(`Bem-vindo de volta, ${usuarioEncontrado.name}!`, "success");
                window.dispatchEvent(new Event('authStatusChanged'));
                
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            } else {
                mostrarToast('Usuário ou senha incorretos.', 'danger');
            }
        });
    }

    const formCadastro = document.getElementById('formCadastro');
    if (formCadastro) {
        formCadastro.addEventListener('submit', function(e) {
            e.preventDefault();
            const name = document.getElementById('cadName').value.trim();
            const username = document.getElementById('cadUsername').value.trim().toLowerCase();
            const bio = document.getElementById('cadBio').value.trim();
            const password = document.getElementById('cadPassword').value;
            const confirmPass = document.getElementById('cadConfirmPassword').value;

            if (username.length < 3) {
                mostrarToast('O nome de usuário deve ter no mínimo 3 caracteres.', 'danger');
                return;
            }
            if (username.includes(' ')) {
                mostrarToast('O nome de usuário não pode conter espaços.', 'danger');
                return;
            }
            if (password.length < 4) {
                mostrarToast('A senha deve ter no mínimo 4 caracteres.', 'danger');
                return;
            }
            if (password !== confirmPass) {
                mostrarToast('As senhas não coincidem!', 'danger');
                return;
            }

            const usuarios = JSON.parse(localStorage.getItem('usuariosStockpile')) || [];
            const usuarioExiste = usuarios.some(u => u.username === username);

            if (usuarioExiste) {
                mostrarToast('Este nome de usuário já está cadastrado. Escolha outro.', 'danger');
                return;
            }

            const novoUsuario = {
                name: name,
                username: username,
                bio: bio || "Novato na comunidade.",
                password: password
            };

            usuarios.push(novoUsuario);
            localStorage.setItem('usuariosStockpile', JSON.stringify(usuarios));

            const perfilKey = `dadosPerfil_${username}`;
            if (!localStorage.getItem(perfilKey)) {
                localStorage.setItem(perfilKey, JSON.stringify({
                    nome: name,
                    bio: bio || "Novato na comunidade."
                }));
            }

            mostrarToast('Cadastro realizado com sucesso! Você já pode entrar.', 'success');
            formCadastro.reset();

            const tabLoginButton = document.getElementById('tab-login');
            bootstrap.Tab.getInstance(tabLoginButton).show();
        });
    }

    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'btnAuthLogout') {
            e.preventDefault();
            mostrarConfirm('Tem certeza que deseja sair da sua conta?', function() {
                localStorage.removeItem('usuarioLogado');
                atualizarNavbarAuth();
                window.dispatchEvent(new Event('authStatusChanged'));
                window.location.href = 'index.html';
            });
        }
    });
}

// Notificações Toast
function mostrarToast(mensagem, tipo = 'info') {
    let container = document.getElementById('customToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'customToastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `custom-toast toast-${tipo}`;
    toast.innerHTML = `<div class="fw-semibold">${mensagem}</div>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.remove();
        if (container.children.length === 0) {
            container.remove();
        }
    }, 3500);
}

// Confirm Modal
function mostrarConfirm(mensagem, callbackSucesso) {
    const antigo = document.getElementById('customConfirmModal');
    if (antigo) antigo.remove();

    const modalHTML = `
        <div class="modal fade" id="customConfirmModal" tabindex="-1" aria-hidden="true">
            <div class="modal-dialog modal-dialog-centered confirm-modal-dialog">
                <div class="modal-content border-0 shadow-lg">
                    <div class="modal-body p-4 text-center">
                        <h5 class="fw-bold mb-2">Confirmação</h5>
                        <p class="text-muted mb-4 confirm-text">${mensagem}</p>
                        <div class="d-flex gap-2 justify-content-center">
                            <button type="button" class="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancelar</button>
                            <button type="button" class="btn btn-danger rounded-pill px-4" id="btnConfirmarAcao">Confirmar</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    const div = document.createElement('div');
    div.innerHTML = modalHTML;
    document.body.appendChild(div.firstElementChild);

    const modalElement = document.getElementById('customConfirmModal');
    const modalInstance = new bootstrap.Modal(modalElement);
    modalInstance.show();

    document.getElementById('btnConfirmarAcao').addEventListener('click', function() {
        modalInstance.hide();
        modalElement.addEventListener('hidden.bs.modal', function() {
            callbackSucesso();
            modalElement.remove();
        }, { once: true });
    });
}
