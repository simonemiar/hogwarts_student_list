"use strict";

window.addEventListener("DOMContentLoaded", start);

let allStudents = [];
let allBloodtype = [];

const settings = {
  filterBy: "all",
  sortBy: "firstName",
  sortDir: "asc",
};

async function start() {
    console.log("ready");
    registerButtons();
    await loadBlood();
    await loadStudents();
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
    const student = await data.json();

    // when loaded, prepare data objects
    prepareObjects(student);
};

// LOADING FAMILIES
async function loadBlood() {
    console.log("loading families")
    const url2 = "https://petlatkea.dk/2021/hogwarts/families.json";
    const data = await fetch(url2);
    const bloodtype = await data.json();
    allBloodtype = bloodtype;

};

function prepareObjects(students) {
  allStudents = students.map(preapareObject);
  buildList();
};

function preapareObject(object) {
  //  allStudents.forEach((object) => {
  // Define a template for the data objects
  const Student = {
    expelled: false,
    inquisitorial: false, 
    prefect: false,
    firstName: "",
    lastName: "",
    middleName: "",
    nickName: "",
    image: "",
    house: "",
    bloodType: "",
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

  // calling the function deciding the blood 
  student.bloodType = whichBloodType(student);

  return student;
}

// FUNCTION DECIDING ON THE BLOODTYPE
function whichBloodType(student){
  console.log("hello blood");
  if (allBloodtype.pure.indexOf(student.lastName) > -1) {
    return "pure";
  } else if (allBloodtype.half.indexOf(student.lastName) > -1){
    return "halfblood";
  } else {
    return "muggle";
  }
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

  // INQUISITORIAL SQUARD // MISSING PURE BLOOD AND SLYTHERIN 
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
  } else if (settings.filterBy === "pureblood") {
    filteredList = allStudents.filter(filterPureblood);
  } else if (settings.filterBy === "halfblood") {
    filteredList = allStudents.filter(filterHalfblood);
  } else if (settings.filterBy === "muggle") {
    filteredList = allStudents.filter(filterMuggle);
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
function filterPureblood(student) {
  return student.bloodType === "pure";
}
function filterHalfblood(student) {
  return student.bloodType === "halfblood";
}
function filterMuggle(student) {
  return student.bloodType === "muggle";
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
  const prefects = allStudents.filter((student) => student.prefect && student.house === selectedStudent.house);
  const numberOfPrefects = prefects.length;

  if (numberOfPrefects >= 2) {
    console.log("WARNING! there can only be two prefects from each house");
    removeAorB(prefects[0], prefects[1]);
  } else {
    makePrefect(selectedStudent);
  }

  function removeAorB(prefectA, prefectB) {
    document.querySelector("#remove_aorb").classList.remove("hide");
    document.querySelector("#remove_aorb .closebutton").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb #removea").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb #removeb").addEventListener("click", clickRemoveB);

    document.querySelector("#remove_aorb [data-field=prefectA]").textContent = prefectA.firstName;
    document.querySelector("#remove_aorb [data-field=prefectB]").textContent = prefectB.firstName;


     // if ignore - do nothing
    function closeDialog() {
      document.querySelector("#remove_aorb").classList.add("hide");
      document.querySelector("#remove_aorb .closebutton").removeEventListener("click", closeDialog);
      document.querySelector("#remove_aorb #removea").removeEventListener("click", clickRemoveA);
      document.querySelector("#remove_aorb #removeb").removeEventListener("click", clickRemoveB);
    }

    // if removeA: 
    function clickRemoveA() {
      removePrefect(prefectA);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }
    // if removeB: 
    function clickRemoveB() {
      removePrefect(prefectB);
      makePrefect(selectedStudent);
      buildList();
      closeDialog();
    }
  }

  function removePrefect(student) {
    student.prefect = false;
  }

  function makePrefect(student) {
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
  document.querySelector("#popup .Bloodstatus").textContent = "Bloodtype: " + studentDetails.bloodType;
  document.querySelector("#popup .Prefect").textContent = "Prefect: " + studentDetails.prefect;
  document.querySelector(".houseCrest").src = `images/crest/${studentDetails.house}.png`;
  document.querySelector(".studentImage").src = `images/${studentDetails.lastName}_${studentDetails.firstName[0]}.png`;
  if (studentDetails.lastName === "Patil") {
    document.querySelector(".studentImage").src = `images/${studentDetails.lastName.toLowerCase()}_${studentDetails.firstName.toLowerCase()}.png`;
  } else {
    document.querySelector(".studentImage").src = `images/${studentDetails.lastName
      .substring(studentDetails.lastName.lastIndexOf(""), studentDetails.lastName.indexOf("-") + 1)
      .toLowerCase()}_${studentDetails.firstName.substring(0, 1).toLowerCase()}.png`;
  };

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