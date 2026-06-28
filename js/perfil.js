document.addEventListener('DOMContentLoaded', function() {
    calcularEstatisticas();
    carregarPerfil();

    const btnSalvarPerfil = document.getElementById('btnSalvarPerfil');
    if (btnSalvarPerfil) {
        btnSalvarPerfil.addEventListener('click', guardarPerfil);
    }
});

// carrega perfil do LocalStorage
function carregarPerfil() {
    const dadosPerfil = JSON.parse(localStorage.getItem('dadosPerfilStockpile')) || {
        nome: 'Insira um nome',
        bio: 'Sua bio!'
    };

    // Atualiza os elementos visíveis na página
    document.getElementById('nomePerfil').textContent = dadosPerfil.nome;
    document.getElementById('bioPerfil').textContent = dadosPerfil.bio;

    // Preenche os campos do Modal
    document.getElementById('inputNomePerfil').value = dadosPerfil.nome;
    document.getElementById('inputBioPerfil').value = dadosPerfil.bio;
}

// Função que grava os dados introduzidos no Modal
function guardarPerfil() {
    const nomeForm = document.getElementById('inputNomePerfil').value;
    const bioForm = document.getElementById('inputBioPerfil').value;

    if (nomeForm.trim() === "") {
        alert("O nome não pode estar vazio!");
        return;
    }

    // Cria o objeto com os dados
    const novosDados = {
        nome: nomeForm,
        bio: bioForm
    };

    // Guarda no localStorage do navegador
    localStorage.setItem('dadosPerfilStockpile', JSON.stringify(novosDados));

    // Atualiza a página imediatamente com os novos dados
    carregarPerfil();

    // Esconde o Modal do Bootstrap
    const modalElement = document.getElementById('modalEditarPerfil');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();
}

// Cálculo das estatísticas
function calcularEstatisticas() {
    const lista = JSON.parse(localStorage.getItem('bibliotecaJogos')) || [];

    const totalJogos = lista.length;
    const zerados = lista.filter(jogo => jogo.status === 'zerado').length;
    const jogando = lista.filter(jogo => jogo.status === 'jogando').length;
    const abandonados = lista.filter(jogo => jogo.status === 'abandonado').length;
    const queroJogar = lista.filter(jogo => jogo.status === 'quero_jogar').length;

    const container = document.getElementById('containerEstatisticas');
    
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
                <small class="text-muted">A Jogar</small>
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