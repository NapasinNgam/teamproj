let configMenu = null;
let searchResults = null; 
let isSearching = false;  

window.onload = function () {
    const page = document.body.getAttribute("data-page");
    const urlParams = new URLSearchParams(window.location.search);
    
    if (page === "Home page") {
      const ingredientsParam = urlParams.get('ingredients');
      const pageParam = parseInt(urlParams.get('page'));
  
      if (ingredientsParam) {
        selectedIngredients = ingredientsParam.split(',');
        currentPage = pageParam || 1;
        isSearching = true;
        renderSelected();
        searchingredient(selectedIngredients);
      } else {
        displayMenu();
      }
    } else if (page === "Menu_info") {
      fetchDataById();
    }
  }
  

let currentPage = 1;
const itemsPerPage = 5;

async function displayMenu() {
  const menuScreen = document.getElementById("Menu");
  const pagination = document.getElementById("pagination");
  const page = document.getElementById("Current_page");

  // ถ้ายังไม่มีข้อมูล ให้โหลดและสุ่มเลย
  if (!configMenu) {
    const configRes = await fetch('/menus');
    const menuData = await configRes.json();
    configMenu = menuData.sort(() => 0.5 - Math.random()); // สุ่มครั้งเดียว
  }

  menuScreen.innerHTML = "";
  pagination.innerHTML = "";
  page.innerHTML = `</br></br><p>Current PAGE : ${currentPage}</p>`;

  const totalPages = Math.ceil(configMenu.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = currentPage * itemsPerPage;
  const currentPageMenu = configMenu.slice(startIndex, endIndex);

  currentPageMenu.forEach(menu => {
    const menu_info = `
        </br>
        <p>ชื่อเมนู: ${menu.Menu_name}</p>
        <p>วัตถุดิบ: ${menu.Menu_ingredient}</p>
        <a href="/menu_info.html?menu_id=${menu.Menu_ID}&page=${currentPage}&ingredients=${selectedIngredients.join(',')}">
            <button>How to cook</button>
        </a>
        </br>
    `;
    menuScreen.innerHTML += menu_info;
  });

  // ปุ่มตัวเลข
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
        <button onclick="changePage(${i})">${i}</button>
    `;
  }
}

function changePage(page) {
    currentPage = page;
    if (isSearching) {
      displaySearchResults(); // แสดงผลที่ค้นหา
    } else {
      displayMenu(); // โหมดปกติ
    }
  }
  

  async function searchingredient(selectedIngredients) {
    const configRes = await fetch('/menus');
    const menuData = await configRes.json();
  
    let ingredient = menuData.map((menu) => ({
      Menu_ID: menu.Menu_ID,
      Menu_name: menu.Menu_name,
      Menu_ingredient: menu.Menu_ingredient.split(", "),
      Match_Ing: [],
      Missing_Ing: [],
      diff: null
    }));
  
    selectedIngredients.forEach(select => {
      ingredient.forEach(ing => {
        if (ing.Menu_ingredient.includes(select)) {
          ing.Match_Ing.push(select);
        }
      });
    });
  
    // คำนวณ Missing และ diff หลังจับ Match เสร็จ
    ingredient.forEach(ing => {
      ing.Missing_Ing = ing.Menu_ingredient.filter(n => !ing.Match_Ing.includes(n));
      if (ing.Missing_Ing.length === 0) {
        ing.Missing_Ing = "ไม่มีวัตถุดิบที่ขาด";
      }
      ing.diff = ing.Menu_ingredient.length - ing.Match_Ing.length;
    });
  
    // กรองเมนูที่ไม่มีวัตถุดิบตรงกันเลย
    ingredient = ingredient.filter(ing => ing.Match_Ing.length > 0);
  
    // เรียงตาม diff
    ingredient.sort((a, b) => {
      if (a.diff === 0 && b.diff === 0) {
        return Math.random() - 0.5;
      } else {
        return a.diff - b.diff;
      }
    });
  
    searchResults = ingredient;
    isSearching = true;
    currentPage = 1;
  
    displaySearchResults();
  }
  

  function displaySearchResults() {
    const menuScreen = document.getElementById("Menu");
    const pagination = document.getElementById("pagination");
    const page = document.getElementById("Current_page");
  
    menuScreen.innerHTML = "";
    pagination.innerHTML = "";
    page.innerHTML = `</br></br><p>Current PAGE : ${currentPage}</p>`;
  
    const totalPages = Math.ceil(searchResults.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = currentPage * itemsPerPage;
    const currentPageMenu = searchResults.slice(startIndex, endIndex);
  
    currentPageMenu.forEach(menu => {
      let menu_info = `
          </br>
          <p>ชื่อเมนู: ${menu.Menu_name}</p>
          <p>วัตถุดิบที่ขาด: ${menu.Missing_Ing}</p>
          <p>วัตถุดิบที่มี: ${menu.Match_Ing}</p>
          <a href="/menu_info.html?menu_id=${menu.Menu_ID}&page=${currentPage}&ingredients=${selectedIngredients.join(',')}">
            <button>How to cook</button>
          </a>
          </br>
      `;
      
        menuScreen.innerHTML += menu_info;
    });
  
    for (let i = 1; i <= totalPages; i++) {
      pagination.innerHTML += `<button onclick="changePage(${i})">${i}</button>`;
    }
  }

  
  function resetSearch() {
    selectedIngredients = [];
    isSearching = false;
    
    renderSelected();
    const checkboxes = document.querySelectorAll("#ingredient-select input[type='checkbox']");
    checkboxes.forEach(checkbox => checkbox.checked = false);
    currentPage = 1;

    displayMenu();
  }

  async function fetchDataById() {
  const urlParams = new URLSearchParams(window.location.search);
  const menuId = urlParams.get('menu_id');

  fetch(`/menu/${menuId}`)
    .then(res => res.json())
    .then(data => {
      document.body.innerHTML = `
        <h2>${data.Menu_name}</h2>
        <p>วัตถุดิบ: ${data.Ingredient_split}</p>
        <p>กระบวนการ: ${data.Menu_process}</p>
        <button onclick="goBackToSearch()">⬅️ ย้อนกลับ</button>
      `;
    });
  }

  function goBackToSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 1;
    const ingredients = urlParams.get('ingredients') || '';
  
    // สร้างลิงก์กลับ
    const backUrl = `/index.html?page=${page}&ingredients=${ingredients}`;
    window.location.href = backUrl;
  }
  
  
  
