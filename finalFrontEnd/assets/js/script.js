function updateCheckboxValue() {
    const checkbox = document.getElementById('status');
    checkbox.setAttribute('value', checkbox.checked);
}

function isStorageExist() {
  if (typeof(Storage)===undefined) {
    alert('Browser kamu tidak mendukung local storage');
    return false;
  }
  return true;
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('form');
    submitForm.addEventListener('submit', function(event) {
        event.preventDefault();
        addBookshelf();
    })

    if (isStorageExist()) {
        loadDataFromStorage();
    }
})

function addBookshelf() {
    const titleInput = document.getElementById('judulBuku');
    const authorInput = document.getElementById('penulisBuku');
    const yearInput = document.getElementById('tahunBuku');
    const statusCheckbox = document.getElementById('status');

    const title = titleInput.value;
    const author = authorInput.value;
    const year = parseInt(yearInput.value);
    const isComplete = statusCheckbox.checked;

    const generatedID = generateId();
    const booksObjek = generateBooksObjek(generatedID, title, author, year, isComplete);
    books.push(booksObjek);

    titleInput.value = '';
    authorInput.value = '';
    yearInput.value = '';
    statusCheckbox.checked = false;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    showAlert('Buku berhasil ditambahkan!');
}

function generateId() {
    return +new Date()
}

function generateBooksObjek(id, title, author, year, isComplete) {
    return{
        id,
        title,
        author,
        year,
        isComplete
    }
}

const books = [];
const RENDER_EVENT = 'render-book';

document.addEventListener(RENDER_EVENT, function(){
    const belumDibaca = document.getElementById('belumDibaca');
    belumDibaca.innerHTML='';
    
    const sudahDibaca = document.getElementById('sudahDibaca');
    sudahDibaca.innerHTML='';

    for (const bookItem of books) {
        const bookElmen = makeBookshelf(bookItem);
        if (!bookItem.isComplete)
            belumDibaca.append(bookElmen);
        else
            sudahDibaca.append(bookElmen);

    }
})

function makeBookshelf(booksObjek) {
    const teksJudul = document.createElement('h2')
    teksJudul.innerText = booksObjek.title;

    const teksPenulis = document.createElement('p')
    teksPenulis.innerText = booksObjek.author;

    const teksTahun = document.createElement('p')
    teksTahun.innerText = booksObjek.year;

    const divButton = document.createElement('div')
    divButton.classList.add('horButton');
    
    if (booksObjek.isComplete) {
        const undoButton = document.createElement('button');
        undoButton.classList.add('btn-info')
        undoButton.innerHTML = '<i class="gg-undo"></i>';

        undoButton.addEventListener('click', function() {
            kembalikanBukuDariSelesai(booksObjek.id);
        })

        const trashButton = document.createElement('button');
        trashButton.classList.add('btn-danger')
        trashButton.innerHTML = '<i class="gg-trash"></i>';

        trashButton.addEventListener('click', function(){
            hapusBukuDariSelesai(booksObjek.id);
        })

        divButton.append(undoButton, trashButton);

    } else {
        const checkButton = document.createElement('button');
        checkButton.classList.add('btn-primer')
        checkButton.innerHTML = '<i class="gg-play-list-check"></i>';

        checkButton.addEventListener('click', function(){
            tambahBukuKeSelesai(booksObjek.id);
        })

        const editButton = document.createElement('button');
        editButton.classList.add('btn-orange')
        editButton.innerHTML = '<i class="gg-pen"></i>';

        editButton.addEventListener('click', function(){
            editBook(booksObjek.id);
        })

        const trashButton = document.createElement('button');
        trashButton.classList.add('btn-danger')
        trashButton.innerHTML = '<i class="gg-trash"></i>';

        trashButton.addEventListener('click', function(){
            hapusBukuDariSelesai(booksObjek.id);
        })

        divButton.append(checkButton, editButton, trashButton);

    }

    const contentItem = document.createElement('div');
    contentItem.classList.add('item', 'card');
    contentItem.setAttribute('id', booksObjek.id);
    contentItem.append(teksJudul, teksPenulis, teksTahun, divButton);
    
    return contentItem;
}

function tambahBukuKeSelesai(bookId) {
    const bookTarget = findBook(bookId);
    
    if (bookTarget == null) return;

    bookTarget.isComplete = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    showAlert('Buku berhasil dipindah ke daftar sudah dibaca!');
}

function findBook(bookId) {
    for (const bookItem of books) {
        if (bookItem.id === bookId) {
            return bookItem;
        }
    }
    return null;
}

function editBook(bookId) {
    const bookTarget = findBook(bookId);

    if (!bookTarget) return;

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block';

    const editDialog = document.getElementById('editDialog');
    editDialog.style.display = 'block';

    const editedTitleInput = document.getElementById('editedTitle');
    const editedAuthorInput = document.getElementById('editedAuthor');
    const editedYearInput = document.getElementById('editedYear');

    editedTitleInput.value = bookTarget.title;
    editedAuthorInput.value = bookTarget.author;
    editedYearInput.value = bookTarget.year;

    const confirmEditButton = document.getElementById('confirmEdit');
    confirmEditButton.addEventListener('click', function () {
        bookTarget.title = editedTitleInput.value;
        bookTarget.author = editedAuthorInput.value;
        bookTarget.year = parseInt(editedYearInput.value);

        overlay.style.display = 'none';
        editDialog.style.display = 'none';

        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        showAlert('Buku berhasil diubah.');
    });

    const cancelEditButton = document.getElementById('cancelEdit');
    cancelEditButton.addEventListener('click', function () {

        overlay.style.display = 'none';
        editDialog.style.display = 'none';
    });
}

function hapusBukuDariSelesai(bookId) {
    const bookTarget = findBookIndex(bookId);

    if (bookTarget === -1) return;

    const overlay = document.getElementById('overlay');
    overlay.style.display = 'block';

    const customDialog = document.getElementById('customDialog');
    customDialog.style.display = 'block';

    const confirmDeleteButton = document.getElementById('confirmDelete');
    confirmDeleteButton.addEventListener('click', function () {

        overlay.style.display = 'none';
        customDialog.style.display = 'none';

        books.splice(bookTarget, 1);
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();

        showAlert('Buku berhasil dihapus.');
    });

    const cancelDeleteButton = document.getElementById('cancelDelete');
    cancelDeleteButton.addEventListener('click', function () {
        overlay.style.display = 'none';
        customDialog.style.display = 'none';
    });
}


function kembalikanBukuDariSelesai(bookId) {
    const bookTarget = findBook(bookId);

    if (bookTarget == null) return;

    bookTarget.isComplete = false;
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();

    showAlert('Buku berhasil dipindah ke daftar belum dibaca!');
}

function findBookIndex(bookId) {
    for (const index in books) {
        if (books[index].id === bookId) {
            return index;
        }
    }

    return -1;
}

function saveData() {
    if (isStorageExist()) {
        const parsed = JSON.stringify(books);
        localStorage.setItem(STORAGE_KEY, parsed);
        document.dispatchEvent(new Event(SAVED_EVENT));
    }
}

const SAVED_EVENT = 'saved-book';
const STORAGE_KEY = 'BOOKSHELF_APPS';

document.addEventListener(SAVED_EVENT, function () {
   localStorage.getItem(STORAGE_KEY);
})

function loadDataFromStorage() {
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);

    if (data !== null) {
        for (const book of data) {
            books.push(book);
        }
    }

    document.dispatchEvent(new Event(RENDER_EVENT));
}


function showAlert(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'alert';
    alertElement.textContent = message;

    document.body.appendChild(alertElement);

    setTimeout(() => {
        document.body.removeChild(alertElement);
    }, 3000); 
}

const searchInput = document.getElementById('cariBuku');
searchInput.addEventListener('input', function () {
    const searchTerm = searchInput.value.toLowerCase();

    const filteredBooks = books.filter(book =>
        book.title.toLowerCase().includes(searchTerm)
    );

    const belumDibaca = document.getElementById('belumDibaca');
    updateBookshelfView(filteredBooks.filter(book => !book.isComplete), belumDibaca);

    const sudahDibaca = document.getElementById('sudahDibaca');
    updateBookshelfView(filteredBooks.filter(book => book.isComplete), sudahDibaca);
});

function updateBookshelfView(filteredBooks, container) {
    container.innerHTML = '';

    for (const bookItem of filteredBooks) {
        const bookElement = makeBookshelf(bookItem);
        container.append(bookElement);
    }
}
