document.getElementById('add-music').addEventListener('click', addMusic);
document.getElementById('close-popup').addEventListener('click', closePopup);
document.getElementById('save-lyrics').addEventListener('click', saveLyrics);
document.getElementById('save-repertoire').addEventListener('click', saveRepertoire);
document.getElementById('save-changes').addEventListener('click', saveChanges); // Adicionado

let currentEditingIndex = null;
let draggedRow = null;
let currentRepertoireIndex = null; // Para rastrear o repertório atual

// Função para adicionar uma nova música à lista
function addMusic() {
    const table = document.getElementById('music-list');
    const row = table.insertRow();

    const musicCell = row.insertCell(0);
    const toneCell = row.insertCell(1);
    const lyricsCell = row.insertCell(2);
    const actionsCell = row.insertCell(3);
    const deleteCell = row.insertCell(4);

    musicCell.innerHTML = `<input type="text" name="music" placeholder="Nome da música">`;
    toneCell.innerHTML = `<input type="text" name="tom" placeholder="Tom" maxlength="5">`;
    lyricsCell.innerHTML = `<button onclick="editLyrics(this)">Letra</button>`;
    actionsCell.innerHTML = `
        <button onclick="moveUp(this)">↑</button>
        <button onclick="moveDown(this)">↓</button>
    `;
    deleteCell.innerHTML = `<button class="remove-button" style="color: red;">X</button>`;

    addDragEvents(row);
    const removeButton = deleteCell.querySelector('.remove-button');
    setupRemoveButton(removeButton);

    saveToLocalStorage(); // Salvar as alterações no localStorage
}

// Função para configurar o botão de remoção
function setupRemoveButton(button) {
    let isConfirming = false;

    button.addEventListener('dblclick', () => {
        if (!isConfirming) {
            button.textContent = '✔️'; 
            isConfirming = true;
        } else {
            const row = button.closest('tr');
            row.remove();
            saveToLocalStorage();
        }
    });

    document.addEventListener('click', (event) => {
        if (!button.contains(event.target) && isConfirming) {
            button.textContent = 'X'; 
            isConfirming = false;
        }
    });
}

// Função para editar a letra da música
function editLyrics(button) {
    const row = button.parentNode.parentNode;
    currentEditingIndex = row.rowIndex - 1;
    const lyrics = button.dataset.lyrics || '';

    document.getElementById('lyrics-editor').value = lyrics;
    document.getElementById('lyrics-popup').style.display = 'flex';
}

// Função para salvar a letra editada
function saveLyrics() {
    const lyrics = document.getElementById('lyrics-editor').value;
    const table = document.getElementById('music-list');
    const row = table.rows[currentEditingIndex];
    row.cells[2].querySelector('button').dataset.lyrics = lyrics;

    saveToLocalStorage();
    closePopup();
}

// Função para fechar o popup de edição
function closePopup() {
    document.getElementById('lyrics-popup').style.display = 'none';
}

// Funções para mover as músicas na lista
function moveUp(button) {
    const row = button.parentNode.parentNode;
    const previousRow = row.previousElementSibling;
    if (previousRow) {
        row.parentNode.insertBefore(row, previousRow);
        saveToLocalStorage();
    }
}

function moveDown(button) {
    const row = button.parentNode.parentNode;
    const nextRow = row.nextElementSibling;
    if (nextRow) {
        row.parentNode.insertBefore(nextRow, row);
        saveToLocalStorage();
    }
}

// Funções para arrastar e soltar as linhas
function addDragEvents(row) {
    row.draggable = true;
    row.addEventListener('dragstart', dragStart);
    row.addEventListener('dragover', dragOver);
    row.addEventListener('drop', drop);
}

function dragStart(event) {
    draggedRow = event.target;
    event.dataTransfer.effectAllowed = 'move';
}

function dragOver(event) {
    event.preventDefault();
}

function drop(event) {
    event.preventDefault();
    const targetRow = event.target.closest('tr');

    if (targetRow && draggedRow !== targetRow) {
        const table = document.getElementById('music-list');
        if (draggedRow.rowIndex < targetRow.rowIndex) {
            table.insertBefore(draggedRow, targetRow.nextSibling);
        } else {
            table.insertBefore(draggedRow, targetRow);
        }
        saveToLocalStorage();
    }
}

// Função para salvar as músicas no localStorage
function saveToLocalStorage() {
    const table = document.getElementById('music-list');
    const musicData = [];

    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        const music = row.cells[0].querySelector('input').value;
        const tone = row.cells[1].querySelector('input').value;
        const lyrics = row.cells[2].querySelector('button').dataset.lyrics || '';

        musicData.push({ music, tone, lyrics });
    }

    if (currentRepertoireIndex !== null) {
        const savedRepertoires = JSON.parse(localStorage.getItem('savedRepertoires')) || [];
        savedRepertoires[currentRepertoireIndex] = musicData;
        localStorage.setItem('savedRepertoires', JSON.stringify(savedRepertoires));
    } else {
        localStorage.setItem('musicFlow', JSON.stringify(musicData));
    }
}

// Função para carregar as músicas do localStorage
function loadFromLocalStorage() {
    const musicData = JSON.parse(localStorage.getItem('musicFlow')) || [];

    musicData.forEach(data => {
        const table = document.getElementById('music-list');
        const row = table.insertRow();

        const musicCell = row.insertCell(0);
        const toneCell = row.insertCell(1);
        const lyricsCell = row.insertCell(2);
        const actionsCell = row.insertCell(3);
        const deleteCell = row.insertCell(4);

        musicCell.innerHTML = `<input type="text" name="music" placeholder="Nome da música" value="${data.music}">`;
        toneCell.innerHTML = `<input type="text" name="tom" placeholder="Tom" maxlength="5" value="${data.tone}">`;
        lyricsCell.innerHTML = `<button onclick="editLyrics(this)" data-lyrics="${data.lyrics}">Letra</button>`;
        actionsCell.innerHTML = `
            <button onclick="moveUp(this)">↑</button>
            <button onclick="moveDown(this)">↓</button>
        `;
        deleteCell.innerHTML = `<button class="remove-button" style="color: red;">X</button>`;

        addDragEvents(row);

        const removeButton = deleteCell.querySelector('.remove-button');
        setupRemoveButton(removeButton);
    });
}

// Função para salvar o repertório
function saveRepertoire() {
    const table = document.getElementById('music-list');
    const musicData = [];

    for (let i = 0; i < table.rows.length; i++) {
        const row = table.rows[i];
        const music = row.cells[0].querySelector('input').value;
        const tone = row.cells[1].querySelector('input').value;
        const lyrics = row.cells[2].querySelector('button').dataset.lyrics || '';

        musicData.push({ music, tone, lyrics });
    }

    const savedRepertoires = JSON.parse(localStorage.getItem('savedRepertoires')) || [];
    savedRepertoires.push(musicData);
    localStorage.setItem('savedRepertoires', JSON.stringify(savedRepertoires));

    createRepertoireButton(savedRepertoires.length - 1); // Cria botão para novo repertório
    alert('Repertório salvo com sucesso!'); // Exibe uma mensagem de sucesso
}

// Função para criar um botão de repertório salvo
function createRepertoireButton(index) {
    const repertoireContainer = document.getElementById('repertoire-container');
    const newButton = document.createElement('button');
    newButton.textContent = `Repertório ${index + 1}`;

    // Adiciona evento para carregar o repertório
    newButton.addEventListener('click', () => loadRepertoire(index));

    // Permite editar o nome do repertório
    newButton.addEventListener('dblclick', () => {
        const newName = prompt('Digite um novo nome para o repertório:', newButton.textContent);
        if (newName) {
            newButton.textContent = newName;
            updateRepertoireName(index, newName);
        }
    });

    repertoireContainer.appendChild(newButton);
}

// Função para carregar um repertório salvo
function loadRepertoire(index) {
    const savedRepertoires = JSON.parse(localStorage.getItem('savedRepertoires')) || [];
    const selectedRepertoire = savedRepertoires[index];

    currentRepertoireIndex = index; // Define o repertório atual
    const table = document.getElementById('music-list');
    table.innerHTML = ''; // Limpa a tabela antes de carregar um novo repertório

    selectedRepertoire.forEach(data => {
        const row = table.insertRow();

        const musicCell = row.insertCell(0);
        const toneCell = row.insertCell(1);
        const lyricsCell = row.insertCell(2);
        const actionsCell = row.insertCell(3);
        const deleteCell = row.insertCell(4);

        musicCell.innerHTML = `<input type="text" name="music" placeholder="Nome da música" value="${data.music}">`;
        toneCell.innerHTML = `<input type="text" name="tom" placeholder="Tom" maxlength="5" value="${data.tone}">`;
        lyricsCell.innerHTML = `<button onclick="editLyrics(this)" data-lyrics="${data.lyrics}">Letra</button>`;
        actionsCell.innerHTML = `
            <button onclick="moveUp(this)">↑</button>
            <button onclick="moveDown(this)">↓</button>
        `;
        deleteCell.innerHTML = `<button class="remove-button" style="color: red;">X</button>`;

        addDragEvents(row);

        const removeButton = deleteCell.querySelector('.remove-button');
        setupRemoveButton(removeButton);
    });
}

// Função para atualizar o nome do repertório
function updateRepertoireName(index, newName) {
    const savedRepertoires = JSON.parse(localStorage.getItem('savedRepertoires')) || [];
    savedRepertoires[index].name = newName; // Atualiza o nome do repertório
    localStorage.setItem('savedRepertoires', JSON.stringify(savedRepertoires));
}

// Função para salvar as alterações feitas
function saveChanges() {
    if (currentRepertoireIndex !== null) {
        saveToLocalStorage(); // Salva as alterações do repertório atual
        alert('Alterações salvas com sucesso!'); // Mensagem de confirmação
    }
}

// Carrega os dados do localStorage ao iniciar
loadFromLocalStorage();
