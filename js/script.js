document.getElementById('add-music').addEventListener('click', addMusic);
document.getElementById('close-popup').addEventListener('click', closePopup);
document.getElementById('save-lyrics').addEventListener('click', saveLyrics);

let currentEditingIndex = null;
let draggedRow = null;

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
    actionsCell.innerHTML = `<button onclick="toggleDrag(this)">⇅</button>`;
    deleteCell.innerHTML = `<button onclick="deleteRow(this)" style="color: red;">X</button>`;

    // Adiciona eventos de arrasto à nova linha
    row.draggable = true;
    row.addEventListener('dragstart', dragStart);
    row.addEventListener('dragover', dragOver);
    row.addEventListener('drop', drop);

    saveToLocalStorage(); // Salvar as alterações no localStorage
}

function editLyrics(button) {
    const row = button.parentNode.parentNode;
    currentEditingIndex = row.rowIndex - 1;
    const lyrics = button.dataset.lyrics || '';

    document.getElementById('lyrics-editor').value = lyrics;
    document.getElementById('lyrics-popup').style.display = 'flex';
}

function saveLyrics() {
    const lyrics = document.getElementById('lyrics-editor').value;
    const table = document.getElementById('music-list');
    const row = table.rows[currentEditingIndex];
    row.cells[2].querySelector('button').dataset.lyrics = lyrics;

    saveToLocalStorage(); // Salvar as alterações no localStorage
    closePopup();
}

function closePopup() {
    document.getElementById('lyrics-popup').style.display = 'none';
}

function toggleDrag(button) {
    const row = button.parentNode.parentNode;
    if (row.draggable) {
        row.draggable = false;
        button.textContent = '⇅'; // Reseta o botão para o estado inicial
    } else {
        row.draggable = true;
        button.textContent = '🔄'; // Mudança de ícone quando arrastável
    }
}

function deleteRow(button) {
    const row = button.parentNode.parentNode;
    row.parentNode.removeChild(row);
    saveToLocalStorage(); // Salvar as alterações no localStorage
}

// Funções de arrasto
function dragStart(event) {
    draggedRow = event.target;
    event.dataTransfer.effectAllowed = 'move';
}

function dragOver(event) {
    event.preventDefault(); // Permite o arrasto
}

function drop(event) {
    event.preventDefault();
    const targetRow = event.target.closest('tr');

    if (targetRow && draggedRow !== targetRow) {
        const table = document.getElementById('music-list');
        table.insertBefore(draggedRow, targetRow.nextSibling);
        saveToLocalStorage(); // Salvar as alterações no localStorage
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

    localStorage.setItem('musicFlow', JSON.stringify(musicData));
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
        actionsCell.innerHTML = `<button onclick="toggleDrag(this)">⇅</button>`;
        deleteCell.innerHTML = `<button onclick="deleteRow(this)" style="color: red;">X</button>`;

        // Adiciona eventos de arrasto à nova linha
        row.draggable = true;
        row.addEventListener('dragstart', dragStart);
        row.addEventListener('dragover', dragOver);
        row.addEventListener('drop', drop);
    });
}

// Carregar músicas ao iniciar
window.onload = loadFromLocalStorage;
