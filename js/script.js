document.addEventListener('DOMContentLoaded', function() {
    // Lógica de busca da API RAWG
    const apiKey = "73ed6bc0d7a7472bba22721dbd927eb4"; 
    const btnPesquisar = document.getElementById('btnPesquisar');
    const inputPesquisa = document.getElementById('inputPesquisa');
    const vitrineJogos = document.getElementById('vitrineJogos');

    btnPesquisar.addEventListener('click', function() {
        const termoBusca = inputPesquisa.value.trim();
        
        if (termoBusca === "") {
            alert("Digite o nome de um jogo para procurar!");
            return;
        }

        vitrineJogos.innerHTML = "<p class='text-center w-100'>A procurar jogos na base de dados...</p>";

        fetch(`https://api.rawg.io/api/games?key=${apiKey}&search=${termoBusca}`)
            .then(resposta => resposta.json())
            .then(dados => {
                vitrineJogos.innerHTML = ""; 
                
                const jogos = dados.results;
                
                if (jogos.length === 0) {
                    vitrineJogos.innerHTML = "<p class='text-center w-100'>Nenhum jogo encontrado.</p>";
                    return;
                }

                jogos.forEach(jogo => {
                    const imagemUrl = jogo.background_image ? jogo.background_image : 'https://placehold.co/300x400/495057/FFF?text=Sem+Imagem';
                    
                    const cardHTML = `
                        <div class="col-12 col-md-6 col-lg-3 mb-4">
                            <div class="card h-100 shadow-sm">
                                <img src="${imagemUrl}" class="card-img-top" alt="${jogo.name}">
                                <div class="card-body d-flex flex-column">
                                    <h5 class="card-title">${jogo.name}</h5>
                                    <p class="card-text text-muted">Lançamento: ${jogo.released ? jogo.released.substring(0, 4) : 'N/D'}</p>
                                    
                                    <button class="btn btn-primary mt-auto btn-abrir-modal" 
                                            data-bs-toggle="modal" 
                                            data-bs-target="#logModal"
                                            data-nome="${jogo.name}"
                                            data-imagem="${imagemUrl}">
                                        Adicionar ao Log
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                    vitrineJogos.innerHTML += cardHTML;
                });

                const botoesAbrirModal = document.querySelectorAll('.btn-abrir-modal');
                botoesAbrirModal.forEach(botao => {
                    botao.addEventListener('click', function() {
                        const nomeSelecionado = this.getAttribute('data-nome');
                        const imagemSelecionada = this.getAttribute('data-imagem');
                        
                        document.getElementById('nomeJogo').value = nomeSelecionado;
                        document.getElementById('imagemJogo').value = imagemSelecionada;
                    });
                });

            })
            .catch(erro => {
                console.error("Erro ao contactar a API:", erro);
                vitrineJogos.innerHTML = "<p class='text-center text-danger w-100'>Erro ao carregar os jogos. Tente novamente.</p>";
            });
    });

    // Lógica do localStorage
    const btnSalvarLog = document.getElementById('btnSalvarLog');

    btnSalvarLog.addEventListener('click', function(event) {
        event.preventDefault(); 
        
        const nome = document.getElementById('nomeJogo').value;
        const status = document.getElementById('statusJogo').value;
        const nota = document.getElementById('notaJogo').value;
        const review = document.getElementById('reviewJogo').value;
        const imagem = document.getElementById('imagemJogo').value || 'https://placehold.co/300x400/495057/FFF?text=Sem+Imagem';

        if (nome === "") {
            alert("Por favor, digite o nome do jogo.");
            return;
        }

        const novoJogo = {
            id: Date.now(),
            nome: nome,
            status: status,
            nota: nota,
            review: review,
            imagem: imagem
        };

        let listaJogos = JSON.parse(localStorage.getItem('bibliotecaJogos')) || [];
        
        listaJogos.push(novoJogo);
        localStorage.setItem('bibliotecaJogos', JSON.stringify(listaJogos));

        document.getElementById('formAdicionarLog').reset();
        
        const modalElement = document.getElementById('logModal');
        const modalInstance = bootstrap.Modal.getInstance(modalElement);
        modalInstance.hide();

        alert('Jogo guardado com sucesso!');
    });
});