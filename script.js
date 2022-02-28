"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];

// The prototype for all animals: // the model
const Student = {
  winner: false, 
  prefect: false,
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

  loadJSON();
}

function registerButtons() {
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
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

async function loadJSON() {
  const url = "https://petlatkea.dk/2021/hogwarts/students.json";
  const data = await fetch(url);
  const students = await data.json();

  // when loaded, prepare data objects
  prepareObjects(students);
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
  student.name = texts[0];
  student.desc = texts[2];
  student.type = texts[3];
  student.age = jsonObject.age;

  return student;
}


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

  // let startButtons = document.querySelectorAll("[data-field='prefect']").forEach((button) => button.addEventListener("click", selectPrefect));

  // set clone data

  clone.querySelector("[data-field=firstname]").textContent = student.firstname;
  clone.querySelector("[data-field=lastname]").textContent = student.lastname;
  clone.querySelector("[data-field=house]").textContent = student.house;
  if (student.prefect === true) {
    clone.querySelector("[data-field=prefect]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=prefect]").textContent = "☆";
  }
  // Make prefect clickable
  clone.querySelector("[data-field=prefect]").addEventListener("click", clickPrefect);

  // append clone to list
  function clickPrefect() {
    // console.log("prefect clicked");
    if (student.prefect === true ) {
      student.prefect = false;
    } else {
      student.prefect = true;
    }
    buildList();
  }

  // winner
  clone.querySelector("[data-field=winner]").dataset.winner = student.winner;
  clone.querySelector("[data-field=winner]").addEventListener("click", clickWinner);
  function clickWinner(){
    if(student.winner === true){
      student.winner = false;
    } else {
      tryToMakeWinner(student);
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

function tryToMakeWinner(selectedStudent){
  const winners = allStudents.filter(student => student.winner);
  

  const numberOfWinners = winners.length;
  const other = winners.filter(student => student.house === selectedStudent.house).shift();

  if(other !== undefined){
    console.log("There can only be one winner of each house!");
    removeOther(other);
  } else if (numberOfWinners >= 2){
    console.log("There can only be two winner")
    removeAorB(winners[0], winners[1]);
  } else {
    makeWinner(selectedStudent);
  }

  function removeOther(other){
    // ask the user to ignore, or remove "other"
    document.querySelector("#remove_other").classList.remove("hide");
    document.querySelector("#remove_other .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_other #removeother").addEventListener("click", clickRemoveOther);

    // Show names on other
    document.querySelector("#remove_other [data-field=otherwinner]").textContent = other.firstname;
    
      // if ignore - do nothing
    function closeDialog(){
      document.querySelector("#remove_other").classList.add("hide");
      document.querySelector("#remove_other .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_other #removeother").removeEventListener("click", clickRemoveOther);
    }

    function clickRemoveOther(){
    removeWinner(other);
    makeWinner(selectedStudent);
    buildList();
    closeDialog();
    }
   

    // if remove other:
    removeWinner(other);
    makeWinner(selectedStudent);

  }
  function removeAorB(winnerA, winnerB){
    // ask the user to ignore, or remove A or B
    document.querySelector("#remove_aorb").classList.remove("hide");
    document.querySelector("#remove_aorb .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb #removea").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb #removeb").addEventListener("click", clickRemoveB);
    
    //show names on buttons
    document.querySelector("#remove_aorb [data-field=winnerA]").textContent = winnerA.firstname;
    document.querySelector("#remove_aorb [data-field=winnerB]").textContent = winnerB.firstname;

    // if ignore - do nothing
    function closeDialog(){
      document.querySelector("#remove_aorb").classList.add("hide");
      document.querySelector("#remove_aorb .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_aorb #removea").removeEventListener("click", clickRemoveA);
      document.querySelector("#remove_aorb #removeb").removeEventListener("click", clickRemoveB);
      
    }

    // if removeA: 
    function clickRemoveA(){
      removeWinner(winnerA);
      makeWinner(selectedStudent);
    }

    // if removeB: 
    function clickRemoveB(){
      removeWinner(winnerB);
      makeWinner(selectedStudent);
    }
    }

  function removeWinner(winnerAnimal){
    student.winner = false;

  }
  function makeWinner(student){
    student.winner = true;
  }
}