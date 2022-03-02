"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

const settings = {
  filterBy: "all",
  sortBy: "firstName",
  sortDir: "asc",
};

function start() {
    console.log("ready");
    registerButtons();
    loadFamilies();
    loadStudents();
}

// Adding eventlisteners on buttons
function registerButtons() {
    document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
    document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
    document.querySelector("#search").addEventListener("input", searchFieldInput);
}
  
// LOADING STUDENTS
async function loadStudents() {
    console.log("loading students")
    const url = "https://petlatkea.dk/2021/hogwarts/students.json";
    const data = await fetch(url);
    const students = await data.json();

    // when loaded, prepare data objects
    prepareObjects(students);
};

// LOADING FAMILIES
async function loadFamilies() {
    console.log("loading families")
    const url2 = "https://petlatkea.dk/2021/hogwarts/families.json";
    const data = await fetch(url2);
    const familie = await data.json();

};

function prepareObjects(students) {
  allStudents = students.map(preapareObject);
  buildList();
};

function preapareObject(object) {
  //  allStudents.forEach((object) => {
  // Define a template for the data objects
  const Student = {
    inquisitorial: false, 
    prefect: false,
    firstName: "",
    lastName: "",
    middleName: "",
    nickName: "",
    image: "",
    house: "",
  };
  // create a objects from a prototype
  const student = Object.create(Student);

  //Trim objects
  let originalName = object.fullname.trim();

  // ----- First name -----
  if (originalName.includes(" ")) {
    student.firstName = originalName.substring(0, 1).toUpperCase() + originalName.substring(1, originalName.indexOf(" "));
  } else {
    student.firstName = originalName.substring(0, 1).toUpperCase() + originalName.substring(1);
  }
  student.firstName = student.firstName.substring(0, 1).toUpperCase() + student.firstName.substring(1).toLowerCase();

  // ----- Last name -----
  if (originalName.includes(" ")) {
    student.lastName = originalName.substring(originalName.lastIndexOf(" ") + 1);
    student.lastName = student.lastName.substring(0, 1).toUpperCase() + student.lastName.substring(1).toLowerCase();
  }

  //----- Middle name (if any) -----
  student.middleName = originalName.substring(originalName.indexOf(" ") + 1, originalName.lastIndexOf(" "));
  student.middleName = student.middleName.substring(0, 1).toUpperCase() + student.middleName.substring(1).toLowerCase();

  //----- Nick name (if any) -----
  if (originalName.includes('"')) {
    student.middleName = "";
    student.nickName = originalName.substring(originalName.indexOf('"'), originalName.lastIndexOf('"') + 1);
  }
  // // ----- Image -----
  student.image = `./images/${originalName.substring(0, originalName.indexOf(" ")).toLowerCase()}_.png`;
  student.image = `./images/${originalName.substring(originalName.lastIndexOf(" ") + 1, originalName.lastIndexOf(" ") + 2).toLowerCase() + originalName.substring(originalName.lastIndexOf(" ") + 2).toLowerCase()}_${originalName
    .substring(0, 1)
    .toUpperCase()
    .toLowerCase()}.png`;

  // ----- House -----
  let originalHouse = object.house.trim();
  student.house = originalHouse;
  student.house = student.house.substring(0, 1).toUpperCase() + student.house.substring(1).toLowerCase();

  // ----- Gender -----
  let originalGender = object.gender.trim();
  student.gender = originalGender;
  student.gender = student.gender.substring(0, 1).toUpperCase() + student.gender.substring(1).toLowerCase();

  // console.table(student);
  return student;
}


//---------- THE SEARCH SITUATIONEN ----------
function searchFieldInput(evt) {
  // write to the list with only those elemnts in the allAnimals array that has properties containing the search frase
  displayList(
    allStudents.filter((elm) => {
      // comparing in uppercase so that m is the same as M
      return elm.firstName.toUpperCase().includes(evt.target.value.toUpperCase()) || elm.lastName.toUpperCase().includes(evt.target.value.toUpperCase()) || elm.house.toUpperCase().includes(evt.target.value.toUpperCase());
    })
  );
}

//---------- THE DISPLAY SITUATIONEN ----------
function displayList(students) {
  document.querySelector("tbody").innerHTML = "";
  students.forEach((student) => displayStudent(student));
}

function displayStudent(student) {
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // DISPLAYING NAMES
  clone.querySelector("[data-field=firstname]").textContent = student.firstName + " " + student.nickName + " " + student.middleName;
  clone.querySelector("[data-field=lastname]").textContent = student.lastName;
  clone.querySelector("[data-field=house]").textContent = student.house;

  // CLICK READ MORE BUTTON AND POPUP WILL APPEAR 
  clone.querySelector("button#readmore").addEventListener("click", () => showdetails(student));

  // INQUISITORIAL SQUARD
  if (student.inquisitorial === true) {
    clone.querySelector("[data-field=inquisitorial]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=inquisitorial]").textContent = "☆";
  }
  // Make inquisitorial clickable
  clone.querySelector("[data-field=inquisitorial]").addEventListener("click", clickInquisitorial);

  // append clone to list
  function clickInquisitorial() {
    // console.log("inquisitorial clicked");
    if (student.inquisitorial === true ) {
      student.inquisitorial = false;
    } else {
      student.inquisitorial = true;
    }
    buildList();
  }

//---------- THE PREFECT SITUATIONEN ----------
  clone.querySelector("[data-field=prefect]").dataset.prefect = student.prefect;
  clone.querySelector("[data-field=prefect]").addEventListener("click", clickPrefect);
  function clickPrefect() {
    console.log(student);
    if (student.prefect === true) {
      student.prefect = false;
    } else {
      tryToMakePrefect(student);
    }
    buildList();
  }
  
  document.querySelector("tbody").appendChild(clone);
}

//---------- THE BUILDING LIST SITUATIONEN ----------
function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}
//---------- THE FILTER SITUATIONEN ----------
function filterList(filteredList) {
  if (settings.filterBy === "gryffindor") {
    filteredList = allStudents.filter(filterGryffindor);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(filterSlytherin);
  } else if (settings.filterBy === "hufflepuff") {
    filteredList = allStudents.filter(filterHufflepuff);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(filterRavenclaw);
  } else if (settings.filterBy === "boys") {
    filteredList = allStudents.filter(filterBoys);
  } else if (settings.filterBy === "girls") {
    filteredList = allStudents.filter(filterGirls);
  }
  return filteredList;
}
function selectFilter(event) {
  const filter = event.target.dataset.filter;
  // console.log(filter);
  setFilter(filter);
}
function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}
function filterGryffindor(student) {
  return student.house === "Gryffindor";
}
function filterSlytherin(student) {
  return student.house === "Slytherin";
}
function filterHufflepuff(student) {
  return student.house === "Hufflepuff";
}
function filterRavenclaw(student) {
  return student.house === "Ravenclaw";
}
function filterBoys(student) {
  return student.gender === "Boy";
}
function filterGirls(student) {
  return student.gender === "Girl";
}

//---------- THE SORTING SITUATIONEN ----------
function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find old sorting element
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");

  // show arrow and indicate whats sorting / add class to active sort
  event.target.classList.add("sortby");

  // toogle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }
  // console.log(`user selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}
function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;
  buildList();
}
function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
  }

  sortedList = sortedList.sort(sortByProperty);

  function sortByProperty(a, b) {
    if (a[settings.sortBy] < b[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }
  return sortedList;
}


function tryToMakePrefect(selectedStudent){
  const prefects = allStudents.filter(student => student.prefect);
  const numberOfPrefect = prefects.length;
  const other = prefects.filter((student) => student.house === selectedStudent.house).shift();

  if(other !== undefined){
    console.log("There can only be one prefect of each house!");
    removeOther(other);
  } else if (numberOfPrefect >= 2){
    console.log("There can only be two prefects")
    removeAorB(prefects[0], prefects[1]);
  } else {
    makePrefect(selectedStudent);
  }

  function removeOther(other){
    // ask the user to ignore, or remove "other"
    document.querySelector("#remove_other").classList.remove("hide");
    document.querySelector("#remove_other .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_other #removeother").addEventListener("click", clickRemoveOther);

    // Show names on other
    document.querySelector("#remove_other [data-field=otherprefect]").textContent = other.firstname;
    
      // if ignore - do nothing
    function closeDialog(){
      document.querySelector("#remove_other").classList.add("hide");
      document.querySelector("#remove_other .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_other #removeother").removeEventListener("click", clickRemoveOther);
    }

    function clickRemoveOther(){
    removePrefect(other);
    makePrefect(selectedStudent);
    buildList();
    closeDialog();
    }

    // if remove other:
    removePrefect(other);
    makePrefect(selectedStudent);

  }

  function removeAorB(prefectA, prefectB){
    // ask the user to ignore, or remove A or B
    document.querySelector("#remove_aorb").classList.remove("hide");
    document.querySelector("#remove_aorb .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb #removea").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb #removeb").addEventListener("click", clickRemoveB);
    
    //show names on buttons
    document.querySelector("#remove_aorb [data-field=prefectA]").textContent = prefectA.firstname;
    document.querySelector("#remove_aorb [data-field=prefectB]").textContent = prefectB.firstname;

    // if ignore - do nothing
    function closeDialog(){
      document.querySelector("#remove_aorb").classList.add("hide");
      document.querySelector("#remove_aorb .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_aorb #removea").removeEventListener("click", clickRemoveA);
      document.querySelector("#remove_aorb #removeb").removeEventListener("click", clickRemoveB);
    }

    // if removeA: 
    function clickRemoveA(){
      removePrefect(prefectA);
      makePrefect(selectedStudent);
    }

    // if removeB: 
    function clickRemoveB(){
      removePrefect(prefectB);
      makePrefect(selectedStudent);
    }
    }

  function removePrefect(prefectStudent){
    student.prefect = false;

  }
  function makePrefect(student){
    student.prefect = true;
  }
}

// OPENING THE POPUP DETAILS AND DISPLAYING THE INFORMATION
function showdetails(studentDetails) {
  console.log("detaljer");
  document.querySelector("#popup").classList.remove("hide")
  document.querySelector("#popup .Firstname").textContent = "Firstname: " + studentDetails.firstName;
  document.querySelector("#popup .Nickname").textContent = "Nickname: " + studentDetails.nickName;
  document.querySelector("#popup .Middlename").textContent = "Middlename: " + studentDetails.middleName;
  document.querySelector("#popup .Lastname").textContent = "Lastname: " + studentDetails.lastName;
  document.querySelector("#popup .House").textContent = "House: " + studentDetails.house;
  document.querySelector(".houseCrest").src = `images/crest/${studentDetails.house}.png`;
  document.querySelector(".studentImage").src = `images/${studentDetails.lastName}_${studentDetails.firstName[0]}.png`;
  if (studentDetails.lastName === "Patil") {
    document.querySelector(".studentImage").src = `images/${studentDetails.lastName.toLowerCase()}_${studentDetails.firstName.toLowerCase()}.png`;
  } else {
    document.querySelector(".studentImage").src = `images/${studentDetails.lastName
      .substring(studentDetails.lastName.lastIndexOf(""), studentDetails.lastName.indexOf("-") + 1)
      .toLowerCase()}_${studentDetails.firstName.substring(0, 1).toLowerCase()}.png`;
  }

  switch(studentDetails.house) {
    case "Gryffindor":
      document.querySelector("#backgroundcolor").style.backgroundColor = "red";
      break;
    case "Slytherin":
      document.querySelector("#backgroundcolor").style.backgroundColor = "green";
      break;
    case "Hufflepuff":
      document.querySelector("#backgroundcolor").style.backgroundColor = "blue";
      break;
    case "Ravenclaw":
      document.querySelector("#backgroundcolor").style.backgroundColor = "black";
      break;

  }
  // CLICK EXPEL STUDENT BUTTON HERE
  popup.querySelector(".expelledBtn").addEventListener("click", expelledStudent);

}

// CLOSING THE POPUP DETAILS
document.querySelector("#popup button").addEventListener("click", closePopup); 
function closePopup() {
  // document.querySelector("#popup").style.display = "none";
  popup.classList.add("hide")
}

//---------- THE EXPEL STUDENT SITUATION ----------   
function expelledStudent(){
  console.log("expelled works")
}