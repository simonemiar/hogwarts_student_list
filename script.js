"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

// The prototype for all animals: // the model
const Student = {
  prefect: false, 
  inquisitorial: false,
  firstName: "",
  lastName: "",
  middleName: "",
  nickName: "",
  image: "",
  house: "",
};

const settings = {
  filterBy: "all",
  sortBy: "firstname",
  sortDir: "asc",
};

// let filterBy = "all";

function start() {
  console.log("ready");

  // // TODO: Add event-listeners to filter and sort buttons
  registerButtons();

  loadFamilies();
  loadStudents();
}

// Adding eventlisteners on buttons
function registerButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
}


// LOADING STUDENTS
async function loadStudents() {
  const url = "https://petlatkea.dk/2021/hogwarts/students.json";
  const data = await fetch(url);
  const students = await data.json();

  // when loaded, prepare data objects
  prepareObjects(students);
};

// LOADING FAMILIES
async function loadFamilies() {
  const url2 = "https://petlatkea.dk/2021/hogwarts/families.json";
  const data = await fetch(url2);
  const students = await data.json();
};

function prepareObjects(students) {
  allStudents = students.map(preapareObject);

  buildList();
  // nedestående udkommenteret grundet buildlist function skal indlæses først
  // displayList(allAnimals);
};

function preapareObject(jsonObject) {
  const student = Object.create(Student);

  const texts = jsonObject.fullname.split(" ");
  student.firstName = texts[0];
  student.lastName = texts[2];
  student.house = texts[3];
  // console.table(student)
  return student;
}

// filter allStudents with the correct filter function and put info filterAnimals
function selectFilter(event) {
  const filter = event.target.dataset.filter;
  // console.log(`user selected ${filter}`);
  // filterList(filter);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

// sort allAnimals with the correct sort function and put info filterAnimals
function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  // find "old" sortby element 
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");

  // idicate active sort 
  event.target.classList.add("sortby");
  

  //toggle the direction
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  console.log(`user selected ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;

  buildList();
}

//---------- MODEL ----------
// get filter depending on data-filter attribute
function filterList(filteredList) {
  // let filteredList = allAnimals;
  if (settings.filterBy === "griffendor") {
    filteredList = allStudents.filter(isGriffendor);
  } else if (settings.filterBy === "slytherin") {
    filteredList = allStudents.filter(isSlytherin);
  } else if (settings.filterBy === "ravenclaw") {
    filteredList = allStudents.filter(isRavenclaw);
  } else if (settings.filterBy === "huffelpuf") {
    filteredList = allStudents.filter(isHuffelpuf);
  }
  return filteredList;
}

function sortList(sortedList) {
  let direction = 1;
  if (settings.sortDir === "lastname") {
    direction = -1;
  } else {
    settings.direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  // closure
  function sortByProperty(a, b) {
    // console.log(`sortBy is ${sortBy}`);
    if (a[settings.sortBy] < b[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}

// isGriffendor function
function isGriffendor(student) {
  if (student.house === "griffendor") {
    return true;
  } else {
    return false;
  }
}

// isSlytherin function
function isSlytherin(student) {
  if (student.house === "slytherin") {
    return true;
  } else {
    return false;
  }
}

function isRavenclaw(student){
  if (student.house === "ravenclaw") {
    return true;
  } else {
    return false;
  }
}

function isHuffelpuf(student) {
  if (student.house === "huffelpuf") {
    return true;
  } else {
    return false;
  }
}

// all function
function all() {
  return true;
}
// -------------------------------------------------------

function displayList(students) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  students.forEach(displayStudent);
  // call the function which is filtering
  // compareName(displayAnimal);
};

function displayStudent(student) {
  // create clone
  const clone = document.querySelector("template#student").content.cloneNode(true);

  // let startButtons = document.querySelectorAll("[data-field='inquisitorial']").forEach((button) => button.addEventListener("click", selectInquisitorial));

  // set clone data

  clone.querySelector("[data-field=firstname]").textContent = student.firstname;
  clone.querySelector("[data-field=lastname]").textContent = student.lastname;
  clone.querySelector("[data-field=house]").textContent = student.house;
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

  // prefect
  clone.querySelector("[data-field=prefect]").dataset.prefect = student.prefect;
  clone.querySelector("[data-field=prefect]").addEventListener("click", clickPrefect);
  function clickPrefect(){
    if(student.prefect === true){
      student.prefect = false;
    } else {
      tryToMakePrefect(student);
    }
    buildList();
  }
  

  document.querySelector("#list tbody").appendChild(clone);
}

function buildList() {
  const currentList = filterList(allStudents);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

function tryToMakePrefect(selectedStudent){
  const prefects = allStudents.filter(student => student.prefect);
  

  const numberOfPrefect = prefects.length;
  const other = prefects.filter(student => student.house === selectedStudent.house).shift();

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

  function removePrefect(prefectAnimal){
    student.prefect = false;

  }
  function makePrefect(student){
    student.prefect = true;
  }
}