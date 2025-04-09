// Função para inicializar a página
document.addEventListener('DOMContentLoaded', function() {
    // Verifica se estamos na página de administração
    if (document.getElementById('medForm')) {
        initAdminPage();
    } else {
        initPublicPage();
    }
});

// Inicializa a página pública
function initPublicPage() {
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    const resultContainer = document.getElementById('resultContainer');
    
    searchButton.addEventListener('click', function() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        
        if (searchTerm === '') {
            resultContainer.innerHTML = '<p>Por favor, digite o nome de um medicamento para buscar.</p>';
            return;
        }
        
        const medications = getMedications();
        const results = medications.filter(med => 
            med.name.toLowerCase().includes(searchTerm)
        );
        
        displayResults(results);
    });
    
    // Permite buscar pressionando Enter
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            searchButton.click();
        }
    });
}

// Exibe os resultados da busca
function displayResults(results) {
    const resultContainer = document.getElementById('resultContainer');
    
    if (results.length === 0) {
        resultContainer.innerHTML = '<p>Nenhum medicamento encontrado com esse nome.</p>';
        return;
    }
    
    let html = '';
    results.forEach(med => {
        html += `
            <div class="medication-result">
                <h3>${med.name}</h3>
                <p>Quantidade: ${med.quantity}</p>
                <p>Situação: 
                    <span class="${med.status === 'Disponível' ? 'available' : 'unavailable'}">
                        ${med.status}
                    </span>
                </p>
                ${med.status === 'Em falta' ? `<p>Previsão de reposição: ${formatDate(med.restock)}</p>` : ''}
            </div>
        `;
    });
    
    resultContainer.innerHTML = html;
}

// Inicializa a página administrativa
function initAdminPage() {
    const medForm = document.getElementById('medForm');
    const medStatus = document.getElementById('medStatus');
    const restockGroup = document.getElementById('restockGroup');
    
    // Mostra/oculta o campo de previsão de reposição conforme a situação
    medStatus.addEventListener('change', function() {
        if (this.value === 'Em falta') {
            restockGroup.style.display = 'block';
        } else {
            restockGroup.style.display = 'none';
        }
    });
    
    // Submissão do formulário
    medForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('medName').value.trim();
        const quantity = parseInt(document.getElementById('medQuantity').value);
        const status = document.getElementById('medStatus').value;
        let restock = '';
        
        if (status === 'Em falta') {
            restock = document.getElementById('medRestock').value;
        }
        
        if (!name || isNaN(quantity)) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        addMedication(name, quantity, status, restock);
        medForm.reset();
        restockGroup.style.display = 'none';
        renderMedications();
    });
    
    // Renderiza os medicamentos já cadastrados
    renderMedications();
}

// Adiciona um novo medicamento
function addMedication(name, quantity, status, restock) {
    const medications = getMedications();
    medications.push({ name, quantity, status, restock });
    localStorage.setItem('medications', JSON.stringify(medications));
}

// Obtém todos os medicamentos do localStorage
function getMedications() {
    const medications = localStorage.getItem('medications');
    return medications ? JSON.parse(medications) : [];
}

// Renderiza a tabela de medicamentos
function renderMedications() {
    const medications = getMedications();
    const tableBody = document.querySelector('#medTable tbody');
    
    tableBody.innerHTML = '';
    
    medications.forEach((med, index) => {
        const row = document.createElement('tr');
        
        row.innerHTML = `
            <td>${med.name}</td>
            <td>${med.quantity}</td>
            <td>${med.status}</td>
            <td>${med.status === 'Em falta' ? formatDate(med.restock) : '-'}</td>
            <td><button class="delete-btn" data-index="${index}">Apagar</button></td>
        `;
        
        tableBody.appendChild(row);
    });
    
    // Adiciona eventos aos botões de apagar
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', function() {
            deleteMedication(parseInt(this.getAttribute('data-index')));
        });
    });
}

// Apaga um medicamento
function deleteMedication(index) {
    if (confirm('Tem certeza que deseja apagar este medicamento?')) {
        const medications = getMedications();
        medications.splice(index, 1);
        localStorage.setItem('medications', JSON.stringify(medications));
        renderMedications();
    }
}

// Formata a data para exibição
function formatDate(dateString) {
    if (!dateString) return 'Não informada';
    
    const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', options);
}