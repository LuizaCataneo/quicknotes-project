const notesContainer = document.querySelector("#notes-container");
const noteInput = document.querySelector("#note-content");
const addNoteBtn = document.querySelector(".add-note");
const searchInput = document.querySelector("#search-input");
const exportBtn = document.querySelector("#export-notes");

// Funções
function showNotes() {
  cleanNotes();

  getNotes().forEach((note) => {
    const noteElement = createNote(note.id, note.content, note.fixed);

    notesContainer.appendChild(noteElement);
  });
}

function cleanNotes() {
  notesContainer.replaceChildren([]); // limpa a área de exibição das notas
}

function addNote() {
  const notes = getNotes();

  const noteObject = {
    id: generateId(),
    content: noteInput.value,
    fixed: false,
  };

  const noteElement = createNote(noteObject.id, noteObject.content);
  notesContainer.appendChild(noteElement);

  notes.push(noteObject);

  saveNotes(notes);

  noteInput.value = "";
}

function createNote(id, content, fixed) {
  const element = document.createElement("div");
  element.classList.add("note");

  const textarea = document.createElement("textarea");
  textarea.value = content;
  textarea.placeholder = "Adicione algum texto...";
  element.append(textarea);

  const pinIcon = document.createElement("i");
  pinIcon.classList.add(...["bi", "bi-pin"]);
  element.appendChild(pinIcon);

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add(...["bi", "bi-x-lg"]);
  element.appendChild(deleteIcon);

  const duplicateIcon = document.createElement("i");
  duplicateIcon.classList.add(...["bi", "bi-file-earmark-plus"]);
  element.appendChild(duplicateIcon);

  if (fixed) {
    element.classList.add("fixed");
  }

  //   Eventos do elemento
  element.querySelector("textarea").addEventListener("keyup", (e) => {
    const noteContent = e.target.value;

    updateNote(id, noteContent);
  });

  element.querySelector(".bi-pin").addEventListener("click", () => {
    toggleFixNote(id);
  });

  element.querySelector(".bi-x-lg").addEventListener("click", () => {
    deleteNote(id, element);
  });

  element
    .querySelector(".bi-file-earmark-plus")
    .addEventListener("click", () => {
      copyNote(id);
    });

  return element;
}

function deleteNote(id, element) {
  const notes = getNotes().filter((note) => note.id !== id); // as notas que permanecem são as que note.id !== id.

  saveNotes(notes);

  notesContainer.removeChild(element);
}

function copyNote(id) {
  const notes = getNotes();

  const targetNote = notes.filter((note) => note.id === id)[0];
  const noteObject = {
    id: generateId(),
    content: targetNote.content,
    fixed: false,
  };

  const noteElement = createNote(
    noteObject.id,
    noteObject.content,
    noteObject.fixed
  );

  notesContainer.appendChild(noteElement);
  notes.push(noteObject);
  saveNotes(notes);
}

function toggleFixNote(id) {
  const notes = getNotes();

  const targetNote = notes.filter((note) => note.id === id)[0]; // o método filter vai retornar uma lista com um único elemento(note.id === id). [0] está acessando o primeiro - e único - elemento da lista.
  targetNote.fixed = !targetNote.fixed;

  saveNotes(notes);
  showNotes();
}

function updateNote(id, newContent) {
  const notes = getNotes();
  const targetNote = notes.filter((note) => note.id === id)[0];

  targetNote.content = newContent;

  saveNotes(notes);
}

function generateId() {
  return Math.floor(Math.random() * 5000);
}

function searchNotes(search) {
  const searchResults = getNotes().filter((note) =>
    note.content.includes(search)
  );

  if (search !== "") {
    cleanNotes();

    searchResults.forEach((note) => {
      const noteElement = createNote(note.id, note.content);
      notesContainer.appendChild(noteElement);
    });

    return;
  }

  cleanNotes();
  showNotes();
}

function exportData() {
  const notes = getNotes();

  const csvString = [
    ["ID", "Conteúdo", "Fixado?"],
    ...notes.map((note) => [note.id, note.content, note.fixed]), // itera sobre cada note no array notes e retorna um array com os valores das propriedades id, content e fixed
  ]
    .map((e) => e.join(","))
    .join("\n"); // concatena uma virgula e \n no final de cada array dentro do array csvString e retorna um novo array

  // criando um elemento <a> (link) fictício no DOM
  const element = document.createElement("a");
  element.href = "data:text/csv;charset=utf-8," + encodeURI(csvString); // 'data:text/csv;charset=utf-8,' indica que o conteúdo é um arquivo CSV codificado em UTF-8
  // encodeURI(csvString) codifica o conteúdo CSV para ser compatível com um URI
  element.target = "_blank"; // abre o link em uma nova aba quando clicado
  element.download = "notes.csv"; // define nome arquivo
  element.click(); // dispara automaticamente um clique no link, iniciando o download
}

// LocalStorage
function getNotes() {
  const notes = JSON.parse(localStorage.getItem("notes") || "[]"); // se localStorage estiver vazio (undefined), JSON.parse([]).

  const orderedNotes = notes.sort((a, b) => (a.fixed > b.fixed ? -1 : 1)); // ordenando vetor de notas: notas fixas primeiro.

  return orderedNotes;
}

function saveNotes(notes) {
  localStorage.setItem("notes", JSON.stringify(notes));
}

// Eventos
noteInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addNote();
});

addNoteBtn.addEventListener("click", () => {
  addNote();
});

searchInput.addEventListener("keyup", (e) => {
  const search = e.target.value;
  searchNotes(search);
});

exportBtn.addEventListener("click", () => {
  exportData();
});

// Inicialização
showNotes();
