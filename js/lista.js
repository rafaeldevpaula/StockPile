document.addEventListener('DOMContentLoaded', function() {
    carregarLista();
});

function carregarLista() {
    const container = document.getElementById('listaJogosContainer');
    let lista = JSON.parse(localStorage.getItem('bibliotecaJogos')) || [];

    container.innerHTML = ""; 

    if (lista.length === 0) {
        container.innerHTML = "<p class='text-center mt-5 w-100'>Nenhum jogo na sua lista ainda.</p>";
        return;
    }

    lista.forEach(jogo => {
        const imagemParaMostrar = jogo.imagem ? jogo.imagem : 'https://placehold.co/300x400/495057/FFF?text=Sem+Imagem';
        
        const card = `
            <div class="col-12 col-md-6 col-lg-3 mb-4">
                <div class="card shadow-sm h-100 d-flex flex-column">
                    <img src="${imagemParaMostrar}" class="card-img-top" alt="${jogo.nome}">
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title">${jogo.nome}</h5>
                        <p class="mb-1">Status: <span class="badge bg-secondary">${formatarStatus(jogo.status)}</span></p>
                        <p class="mb-1">Nota: <strong>${jogo.nota ? jogo.nota + '/5' : 'S/N'}</strong></p>
                        <p class="mb-2 text-muted review-card">${jogo.review || 'Sem anotações.'}</p>
                        <button class="btn btn-link p-0 btn-ler-mais" data-id="${jogo.id}">Ler mais</button>
                        
                        <button class="btn btn-outline-warning mt-auto mb-2 btn-editar" data-id="${jogo.id}">
                            Editar
                        </button>

                        <button class="btn btn-outline-danger mt-auto btn-excluir" data-id="${jogo.id}">
                            Excluir
                        </button>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += card;
    });

    const botoesExcluir = document.querySelectorAll('.btn-excluir');
    botoesExcluir.forEach(botao => {
        botao.addEventListener('click', function() {
            const idParaExcluir = parseInt(this.getAttribute('data-id'));
            excluirJogo(idParaExcluir);
        });
    });
}

function excluirJogo(id) {
    if (confirm("Tem certeza que deseja remover este jogo da sua lista?")) {
        let lista = JSON.parse(localStorage.getItem('bibliotecaJogos')) || [];
        lista = lista.filter(jogo => jogo.id !== id);
        localStorage.setItem('bibliotecaJogos', JSON.stringify(lista));
        carregarLista();
    }
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