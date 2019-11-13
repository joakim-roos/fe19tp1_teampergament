let quill = new Quill('#editor-container', {
  modules: {
    toolbar: [
      [{ header: [1, 2, false] }],
      ['bold', 'italic', 'underline'],
      ['image', 'code-block'],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
    ]
  },
  placeholder: 'Team Pergament är cool',
  theme: 'snow'  // or 'bubble'
});

const addNewNote = document.getElementById("newNoteBtn");
let noteList = []; //tom array för samtliga notes
var selectedNote = null;
var tempCont = document.createElement("div"); //temporär icke-existerande div för quill2HTML

window.addEventListener('DOMContentLoaded', () => {
  loadNotes();
  if (noteList.length > 0) {
    console.log(noteList);
    noteList.forEach(renderNote);
    console.log('DOM fully loaded and good to go');
  };
});

function loadNotes() {
  let data = localStorage.getItem('note');
  if (data) {
    noteList = JSON.parse(data);
  } else {
    console.log("localstorage empty")
    //För att pop up första gången man besöker sidan 
    localStorage.setItem("note", JSON.stringify(noteList));
    let modal = document.getElementById("myModal");
    modal.style.display = "block";
  };
};

function saveNotes() {
  localStorage.setItem('note', JSON.stringify(noteList));
};

quill.on('text-change', update);

function update() {
  var data = quill.getContents();
  if (selectedNote) {
    selectedNote.data = data;
    selectedNote.preview = quill.getText(0, 20);
    //note.innerHTML += selectedNote.preview;
    updatePreview();
    saveNotes();
  };
};

function updatePreview(note) {
  note = document.querySelector(`div[id="${selectedNote.id}"]`);
  note.childNodes[1].replaceWith(selectedNote.preview);
  //console.log("note id", selectedNote.id);
};

function Id2Object(n) {
  var i;
  for (i = 0; i < noteList.length; i++) {
    if (noteList[i].id == n) {
      return (noteList[i]);
    };
  };
};

function quill2HTML(input) {
  (new Quill(tempCont)).setContents(input);
  return tempCont.getElementsByClassName("ql-editor")[0].innerHTML;
};

function NoteData2HTML(noteObj) {
  var s = ('<button class="delete-button" onclick="deleteNote(' + noteObj.id + ')">X' + '</button>' +
    quill2HTML(noteObj.data));
  return s;
};

function setActiveNote(targetNote) {
  if (selectedNote != null && typeof selectedNote != "undefined") {
    document.getElementById(selectedNote.id).style.backgroundColor = "whitesmoke"; //återställ styling på fd vald note
  };
  selectedNote = targetNote;
  if (typeof selectedNote != "undefined") {
    var noteDiv = document.getElementById(selectedNote.id);
    if (noteDiv != null) {
      noteDiv.style.backgroundColor = "grey"; //styling så du ser vilken du valt, bör ändras
      quill.setContents(selectedNote.data);
    };
  };
};

function swapNote(event) {   //click funktion- när man klickar på en anteckningen syns det man skrivit i quillen
  //console.log(document.getElementById(event.target.id).innerHTML); //de här raderna har buggar
  //console.log(Id2Object(event.target.id).data); //samma här,buggar
  var targetNote = Id2Object(event.target.id);
  if (typeof targetNote != "undefined") {
    //console.log(selectedNote);
    //console.log(targetNote);
    if (targetNote != selectedNote) {
      selectedNote.data = quill.getContents();
      //quill.setContents(targetNote.data);
      //var c=document.getElementById(selectedNote.id);
      //c.innerHTML=NoteData2HTML(selectedNote);  //den här raden verkar också ge errors
      setActiveNote(targetNote);
    };
  } else console.log("For some reason, event was undefined. (Swapnote-function)");
};

addNewNote.onclick = function () {
  addNote();
};

function renderNote(notes) { // obs notes är singular: ett noteobjekt
  let allNotes = document.getElementById("innerSideBar");
  let child = allNotes.firstChild;
  let note = document.createElement("div");
  note.className = "note";
  note.setAttribute('id', notes.id) //ger elementet ett ID
  allNotes.insertBefore(note, child);
  let deleteButton = document.createElement("button"); //skapar en knapp
  let txtDeleteBtn = document.createTextNode("X"); // döper knappen till X

  deleteButton.appendChild(txtDeleteBtn); //lägger ihop X:et med knappen
  deleteButton.className = "delete-button"; //ger knappen en klass för styling i css
  deleteButton.setAttribute("onclick", "deleteNote(" + notes.id + ")") //säger att funktionen ska köras när knappen klickas på
  note.appendChild(deleteButton);

  note.addEventListener('click', swapNote);

  note.innerHTML += notes.preview;
  displayDate(notes); // visar datum och tid i anteckningen
  //createFavourite(note);
  setActiveNote(notes); //ny rad för att definera senast skapad note
};

function createFavourite(note) { //funktion som skapar en favorit-knapp. Kallas i renderNotes.
  note = document.querySelector('.note');
  let button = document.createElement('button');
  let img = document.createElement('img');
  button.className = 'favouriteButton';
  img.className = 'heartImage';
  img.src = 'img/heart-regular.svg';
  note.appendChild(button);
  button.appendChild(img);
};

function addNote() {
  let notes = {    //objekt som skapas. Innehåller ID , data (texten), och andra properties vi behöver senare. ett objekt = en anteckning.
    id: Date.now(),
    title: "",
    preview: quill.getText(0, 20),
    data: quill.getContents(),
    favourite: false,
    deleted: false
  };

  renderNote(notes);
  noteList.push(notes);
  quill.deleteText(0, quill.getLength());
  setActiveNote(notes); //ny rad för att definera senast skapad note
  saveNotes(); //sparar i Local Storage

};

function deleteNote(id) {
  var toDelete = document.getElementById(id);//spar anteckningen i en variabel
  var i;
  var index;
  for (i = 0; i < noteList.length; i++) {
    if (noteList[i].id == id) {
      index = i;
      break;
    };
  };
  noteList.splice(index, 1);
  if (toDelete == document.getElementById(selectedNote.id)) {
    setActiveNote(noteList[noteList.length - 1]); //fixes utifall att du tar bort active note
    console.log("removed selected");
  };
  toDelete.parentNode.removeChild(toDelete);//tar bort anteckningen 
  saveNotes();
};


var showBtn = document.getElementById("showHideBtn");
showBtn.onclick = function () { showHideFunction() };
function showHideFunction() {
  var sideNav = document.querySelector("#sideNav");

  if (sideNav.style.display === "inline-block") {
    sideNav.style.display = "none";
  } else {
    sideNav.style.display = "inline-block";
  };
};

let modal = document.getElementById("myModal"); // första diven 
let btn = document.getElementById("helpBtn"); // Get the button that opens the modal
let span = document.getElementsByClassName("close")[0]; // Get the <span> element that closes the modal
btn.onclick = function () {  // When the user clicks the button, open the modal 
  modal.style.display = "block";
};
span.onclick = function () { // When the user clicks on <span> (x), close the modal
  modal.style.display = "none";
};
window.onclick = function (event) { // When the user clicks anywhere outside of the modal, close it
  if (event.target == modal) {
    modal.style.display = "none";
  };
};

printDiv = function (divName) {
  let printContents = quill.root.innerHTML;
  document.body.innerHTML = printContents;
  window.print();
  location.reload();
};

//DISPLAYA NÄR ANTECKNINGEN SKAPADES | se efter setContent och getContent
function displayDate(notes) {
  let note = document.querySelector(".note");
  // let child = allNotes.firstChild;
  var d = new Date(notes.id);
  var date = d.toDateString();
  // Skapa ett element där ID:t ska skrivas ut i diven
  var pDateId = document.createElement("p");
  note.appendChild(pDateId);
  // ge den ett classname (för styling)
  pDateId.className = "pDate";
  //random styling


  //displayar tiden i det skapade elementet
  pDateId.innerHTML = date;
  //TODO: få datumet att displayas högst upp i diven

};

function toggleFavouriteButton() { //funktion som endast visar anteckningar som har favourite.true. Ej klar än.
  if (favouriteButton.classList.contains('inActive')) {
    favouriteButton.classList.replace('inActive', 'active');
  } else {
    favouriteButton.classList.replace('active', 'inActive');
  };
};


/////////
const showFavourites = (notes) => notes.favourite === true; //arrow function
favouriteButton = document.querySelector("#favouriteBtn");
// favouriteButton.onclick() = showOnlyFavs();
favouriteButton.addEventListener('click', showFavourites);

//const showDeleted = (note) => note.deleted === true;
function showFavourites() {
  console.log();
  let allNotes = document.querySelector('#innerSideBar');
  allNotes.innerHTML = "";
  let onlyFavs = filterNotes(showFavourites);
  onlyFavs.forEach(function (note) {
    renderNote(note);
    //setActiveNote(targetNote);
  });

  function filterNotes(func = () => true) {
    //console.log(func(1));
    let filtered = noteList.filter(func)
    return filtered;
  };
};
//////////

