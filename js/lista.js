document.addEventListener('DOMContentLoaded', function() {
    const usuarioLogado = obterUsuarioLogado();
    if (!usuarioLogado) {
        exibirMensagemSemLogin();
        return;
    }

    carregarLista();
    configurarEventosFiltros();
    configurarEventosEdicao();
});

function obterKeyBiblioteca() {
    const usuario = obterUsuarioLogado();
    return usuario ? `bibliotecaJogos_${usuario}` : null;
}

function exibirMensagemSemLogin() {
    const container = document.querySelector('.container.my-5');
    if (!container) return;

    container.innerHTML = `
        <div class="row justify-content-center">
            <div class="col-md-8 col-lg-6">
                <div class="card shadow-sm text-center p-5 border-0 rounded-16">
                    <h3 class="mb-3 fw-bold">Minha Biblioteca</h3>
                    <p class="text-muted mb-4">Faça login ou cadastre-se para ver seus jogos salvos, gerenciar seu progresso e personalizar seu espaço.</p>
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

function carregarLista(termoBusca = "", statusFiltro = "todos") {
    const container = document.getElementById('listaJogosContainer');
    const areaExclusao = document.getElementById('areaExclusaoMassa');
    if (!container) return;

    const key = obterKeyBiblioteca();
    let lista = JSON.parse(localStorage.getItem(key)) || [];

    if (areaExclusao) {
        if (lista.length > 0) {
            areaExclusao.innerHTML = `
                <button class="btn btn-outline-danger btn-sm rounded-pill px-3 shadow-sm" id="btnLimparBiblioteca">
                    Limpar Biblioteca
                </button>
            `;
            document.getElementById('btnLimparBiblioteca').addEventListener('click', limparBiblioteca);
        } else {
            areaExclusao.innerHTML = "";
        }
    }

    let listaFiltrada = lista;
    if (termoBusca.trim() !== "") {
        const busca = termoBusca.toLowerCase().trim();
        listaFiltrada = listaFiltrada.filter(jogo => jogo.nome.toLowerCase().includes(busca));
    }
    if (statusFiltro !== "todos") {
        listaFiltrada = listaFiltrada.filter(jogo => jogo.status === statusFiltro);
    }

    container.innerHTML = ""; 

    if (lista.length === 0) {
        container.innerHTML = `
            <div class="text-center py-5 w-100">
                <p class="text-muted fs-5 mb-3">Você ainda não tem nenhum jogo na lista.</p>
                <a href="index.html" class="btn btn-primary rounded-pill px-4 py-2 fw-semibold shadow-sm">Procurar Jogos para Adicionar</a>
            </div>
        `;
        return;
    }

    if (listaFiltrada.length === 0) {
        container.innerHTML = "<p class='text-center py-5 text-muted w-100'>Nenhum jogo corresponde aos filtros selecionados.</p>";
        return;
    }

    listaFiltrada.forEach(jogo => {
        const imagemParaMostrar = jogo.imagem ? jogo.imagem : 'https://placehold.co/300x400/495057/FFF?text=Sem+Imagem';
        
        const card = `
            <div class="col-12 col-sm-6 col-md-4 col-lg-3 mb-4">
                <div class="card shadow-sm h-100 d-flex flex-column border-0 game-card-clickable" data-id="${jogo.id}">
                    <img src="${imagemParaMostrar}" class="library-card-img" alt="${jogo.nome}">
                    <div class="card-body d-flex flex-column p-3">
                        <h5 class="card-title fw-bold text-dark text-truncate mb-2" title="${jogo.nome}">${jogo.nome}</h5>
                        <div class="mb-2">
                            <span class="badge ${obterClasseStatus(jogo.status)}">${formatarStatus(jogo.status)}</span>
                        </div>
                        <p class="game-note-text text-muted">
                            Nota: <strong class="text-warning">${jogo.nota ? jogo.nota + '/5' : 'Não avaliado'}</strong>
                        </p>
                        <p class="game-review-text text-muted" title="${jogo.review || ''}">
                            ${jogo.review || '<em>Sem anotações.</em>'}
                        </p>
                        
                        <div class="d-flex gap-2 mt-auto">
                            <button class="btn btn-outline-primary btn-sm flex-grow-1 rounded-pill btn-editar" 
                                    data-id="${jogo.id}"
                                    data-bs-toggle="modal" 
                                    data-bs-target="#modalEditarJogo">
                                Editar
                            </button>
                            <button class="btn btn-outline-danger btn-sm rounded-pill btn-excluir px-3" data-id="${jogo.id}">
                                Excluir
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });

    const botoesExcluir = document.querySelectorAll('.btn-excluir');
    botoesExcluir.forEach(botao => {
        botao.addEventListener('click', function(e) {
            e.stopPropagation();
            const idParaExcluir = parseInt(this.getAttribute('data-id'));
            excluirJogo(idParaExcluir);
        });
    });

    const botoesEditar = document.querySelectorAll('.btn-editar');
    botoesEditar.forEach(botao => {
        botao.addEventListener('click', function(e) {
            e.stopPropagation();
            const idParaEditar = parseInt(this.getAttribute('data-id'));
            prepararEdicao(idParaEditar);
        });
    });

    const cardsClicaveis = document.querySelectorAll('.game-card-clickable');
    cardsClicaveis.forEach(cardEl => {
        cardEl.addEventListener('click', function() {
            const idJogo = parseInt(this.getAttribute('data-id'));
            exibirDetalhesJogo(idJogo);
        });
    });
}

function obterClasseStatus(status) {
    const classes = {
        'quero_jogar': 'bg-info text-dark',
        'jogando': 'bg-warning text-dark',
        'zerado': 'bg-success text-white',
        'abandonado': 'bg-danger text-white'
    };
    return classes[status] || 'bg-secondary text-white';
}

function formatarStatus(status) {
    const statusMap = {
        'quero_jogar': 'Quero Jogar',
        'jogando': 'Jogando',
        'zerado': 'Terminado',
        'abandonado': 'Abandonado'
    };
    return statusMap[status] || status;
}

function configurarEventosFiltros() {
    const busca = document.getElementById('filtroBusca');
    const status = document.getElementById('filtroStatus');

    if (busca) {
        busca.addEventListener('input', () => {
            carregarLista(busca.value, status.value);
        });
    }

    if (status) {
        status.addEventListener('change', () => {
            carregarLista(busca.value, status.value);
        });
    }
}

function configurarEventosEdicao() {
    const editStatus = document.getElementById('editStatusJogo');
    const editNota = document.getElementById('editNotaJogo');
    
    function atualizarCamposEdicao() {
        if (editStatus.value === "quero_jogar") {
            editNota.disabled = true;
            editNota.value = "";
        } else {
            editNota.disabled = false;
        }
    }

    if (editStatus) {
        editStatus.addEventListener('change', atualizarCamposEdicao);
    }

    const btnSalvar = document.getElementById('btnSalvarEdicaoJogo');
    if (btnSalvar) {
        btnSalvar.addEventListener('click', salvarEdicao);
    }
}

function prepararEdicao(id) {
    const key = obterKeyBiblioteca();
    let lista = JSON.parse(localStorage.getItem(key)) || [];
    const jogo = lista.find(j => j.id === id);

    if (!jogo) return;

    document.getElementById('editJogoId').value = jogo.id;
    document.getElementById('editNomeJogo').value = jogo.nome;
    document.getElementById('editStatusJogo').value = jogo.status;
    document.getElementById('editReviewJogo').value = jogo.review || "";
    
    const editNota = document.getElementById('editNotaJogo');
    if (jogo.status === "quero_jogar") {
        editNota.disabled = true;
        editNota.value = "";
    } else {
        editNota.disabled = false;
        editNota.value = jogo.nota || "";
    }
}

function salvarEdicao() {
    const key = obterKeyBiblioteca();
    let lista = JSON.parse(localStorage.getItem(key)) || [];
    
    const id = parseInt(document.getElementById('editJogoId').value);
    const status = document.getElementById('editStatusJogo').value;
    const nota = status === "quero_jogar" ? "" : document.getElementById('editNotaJogo').value;
    const review = document.getElementById('editReviewJogo').value;

    const index = lista.findIndex(j => j.id === id);
    if (index === -1) return;

    lista[index].status = status;
    lista[index].nota = nota;
    lista[index].review = review;

    localStorage.setItem(key, JSON.stringify(lista));

    const modalElement = document.getElementById('modalEditarJogo');
    const modalInstance = bootstrap.Modal.getInstance(modalElement);
    modalInstance.hide();

    const busca = document.getElementById('filtroBusca').value;
    const statusFiltro = document.getElementById('filtroStatus').value;
    carregarLista(busca, statusFiltro);

    mostrarToast('Informações do jogo atualizadas com sucesso!', 'success');
}

function excluirJogo(id) {
    mostrarConfirm("Tem certeza que deseja remover este jogo da sua lista?", function() {
        const key = obterKeyBiblioteca();
        let lista = JSON.parse(localStorage.getItem(key)) || [];
        lista = lista.filter(jogo => jogo.id !== id);
        localStorage.setItem(key, JSON.stringify(lista));
        
        const busca = document.getElementById('filtroBusca').value;
        const statusFiltro = document.getElementById('filtroStatus').value;
        carregarLista(busca, statusFiltro);
    });
}

function limparBiblioteca() {
    mostrarConfirm("ATENÇÃO: Tem certeza que deseja excluir TODOS os jogos da sua biblioteca? Esta ação é definitiva e apagará todos os dados registrados!", function() {
        const key = obterKeyBiblioteca();
        localStorage.setItem(key, JSON.stringify([]));
        
        carregarLista();
        mostrarToast('Sua biblioteca foi completamente limpa!', 'success');
    });
}

function exibirDetalhesJogo(id) {
    const key = obterKeyBiblioteca();
    let lista = JSON.parse(localStorage.getItem(key)) || [];
    const jogo = lista.find(j => j.id === id);

    if (!jogo) return;

    document.getElementById('detalheNomeJogo').textContent = jogo.nome;
    document.getElementById('detalheImagemJogo').src = jogo.imagem ? jogo.imagem : 'https://placehold.co/300x400/495057/FFF?text=Sem+Imagem';
    
    const statusEl = document.getElementById('detalheStatusJogo');
    statusEl.className = `badge ${obterClasseStatus(jogo.status)}`;
    statusEl.textContent = formatarStatus(jogo.status);

    const notaEl = document.getElementById('detalheNotaJogo');
    notaEl.textContent = jogo.nota ? `Nota: ${jogo.nota}/5` : 'Não avaliado';

    const reviewEl = document.getElementById('detalheReviewJogo');
    reviewEl.innerHTML = jogo.review ? jogo.review.replace(/\n/g, '<br>') : '<em>Sem anotações.</em>';

    let modalInstance = bootstrap.Modal.getInstance(document.getElementById('modalDetalhesJogo'));
    if (!modalInstance) {
        modalInstance = new bootstrap.Modal(document.getElementById('modalDetalhesJogo'));
    }
    modalInstance.show();
}