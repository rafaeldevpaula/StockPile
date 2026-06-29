document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = obterUsuarioLogado();
    if (!usuarioLogado) {
        exibirMensagemSemLogin();
        return;
    }

    calcularEstatisticas();
    carregarPerfil();

    const btnSalvarPerfil = document.getElementById('btnSalvarPerfil');
    if (btnSalvarPerfil) {
        btnSalvarPerfil.addEventListener('click', guardarPerfil);
    }
});

function exibirMensagemSemLogin() {
    const container = document.querySelector('.container.my-5');
    if (!container) return;
    
    container.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card shadow-sm text-center p-5 border-0 rounded-16">
                    <h3 class="mb-3 fw-bold">Gerencie seu Perfil</h3>
                    <p class="text-muted mb-4">Faça login ou cadastre-se para visualizar suas estatísticas de jogo e personalizar seu perfil público de jogador.</p>
                    <button class="btn btn-primary py-2.5 px-5 rounded-pill fw-bold shadow-sm" 
                            data-bs-toggle="modal" 
                            data-bs-target="#modalAuth">
                        Fazer Login / Registrar
                    </button>
                </div>
            </div>
        </div>
    `;
}

function carregarPerfil() {
    const usuario = obterUsuarioLogado();
    if (!usuario) return;

    const perfilKey = `dadosPerfil_${usuario}`;
    
    const dadosPerfil = JSON.parse(localStorage.getItem(perfilKey)) || {
        nome: obterDadosUsuarioAtivo().name || usuario,
        bio: obterDadosUsuarioAtivo().bio || 'Novato na comunidade.'
    };

    const nomeEl = document.getElementById('nomePerfil');
    const bioEl = document.getElementById('bioPerfil');
    if (nomeEl) nomeEl.textContent = dadosPerfil.nome;
    if (bioEl) bioEl.textContent = dadosPerfil.bio;

    const inputNome = document.getElementById('inputNomePerfil');
    const inputBio = document.getElementById('inputBioPerfil');
    if (inputNome) inputNome.value = dadosPerfil.nome;
    if (inputBio) inputBio.value = dadosPerfil.bio;
}

function guardarPerfil() {
    const usuario = obterUsuarioLogado();
    if (!usuario) return;

    const nomeForm = document.getElementById('inputNomePerfil').value;
    const bioForm = document.getElementById('inputBioPerfil').value;

    if (nomeForm.trim() === "") {
        mostrarToast("O nome não pode estar vazio!", "warning");
        return;
    }

    const novosDados = {
        nome: nomeForm,
        bio: bioForm
    };

    const perfilKey = `dadosPerfil_${usuario}`;
    localStorage.setItem(perfilKey, JSON.stringify(novosDados));

    const usuarios = JSON.parse(localStorage.getItem('usuariosStockpile')) || [];
    const index = usuarios.findIndex(u => u.username === usuario);
    if (index !== -1) {
        usuarios[index].name = nomeForm;
        usuarios[index].bio = bioForm;
        localStorage.setItem('usuariosStockpile', JSON.stringify(usuarios));
    }

    carregarPerfil();
    atualizarNavbarAuth();

    const modalElement = document.getElementById('modalEditarPerfil');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
    
    mostrarToast('Perfil atualizado com sucesso!', 'success');
}

function calcularEstatisticas() {
    const usuario = obterUsuarioLogado();
    if (!usuario) return;

    const key = `bibliotecaJogos_${usuario}`;
    const lista = JSON.parse(localStorage.getItem(key)) || [];

    const totalJogos = lista.length;
    const zerados = lista.filter(jogo => jogo.status === 'zerado').length;
    const jogando = lista.filter(jogo => jogo.status === 'jogando').length;
    const abandonados = lista.filter(jogo => jogo.status === 'abandonado').length;
    const queroJogar = lista.filter(jogo => jogo.status === 'quero_jogar').length;

    const container = document.getElementById('containerEstatisticas');
    if (!container) return;
    
    container.innerHTML = `
        <div class="col-6 col-md-4">
            <div class="p-3 border bg-light rounded shadow-sm">
                <h2 class="mb-0 text-primary">${totalJogos}</h2>
                <small class="text-muted">Total na Lista</small>
            </div>
        </div>
        <div class="col-6 col-md-4">
            <div class="p-3 border bg-light rounded shadow-sm">
                <h2 class="mb-0 text-success">${zerados}</h2>
                <small class="text-muted">Terminados</small>
            </div>
        </div>
        <div class="col-6 col-md-4">
            <div class="p-3 border bg-light rounded shadow-sm">
                <h2 class="mb-0 text-warning">${jogando}</h2>
                <small class="text-muted">Jogando</small>
            </div>
        </div>
        <div class="col-6 col-md-6">
            <div class="p-3 border bg-light rounded shadow-sm">
                <h2 class="mb-0 text-info">${queroJogar}</h2>
                <small class="text-muted">Quero Jogar</small>
            </div>
        </div>
        <div class="col-6 col-md-6">
            <div class="p-3 border bg-light rounded shadow-sm">
                <h2 class="mb-0 text-danger">${abandonados}</h2>
                <small class="text-muted">Abandonados</small>
            </div>
        </div>
    `;
}