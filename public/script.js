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
  
        searchingredient(selectedIngredients);
      } else {
        displayMenu();
      }
    } else if (page === "Menu_info") {
      fetchDataById();
    } else if (page === "bookmark") {
      console.log("Bookmark");
      showbookmark();
    }
  }
  
  

let currentPage = 1;
const itemsPerPage = 5;

async function displayMenu() {
  const menuScreen = document.getElementById("recipe-result");
  const pagination = document.getElementById("pagination");
  const page = document.getElementById("Current_page");


  if (!configMenu) {
    const configRes = await fetch('/menus');
    const menuData = await configRes.json();
    configMenu = menuData.sort(() => 0.5 - Math.random()); 
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
        <div id="Current_page"></div>
            <div class="recipe-card">
            <div class="recipe-container">
                <img id="recipe-image" src="${menu.img_link}" style="width:100%,borderRadius:10px,marginBottom:15px">
                    <p><strong>ชื่อเมนู :</strong> <span id="recipe-name">${menu.Menu_name}</span></p>
                    <p><strong>วัตถุดิบ :</strong> <span id="recipe-ingredients">${menu.Menu_ingredient}</span></p>
                    <a href="/menu_info.html?menu_id=${menu.Menu_ID}&page=${currentPage}&ingredients=${selectedIngredients.join(',')}">
                        <button class="how-to-cook">How to cook</button>
                    </a>
                
            </div>
        </div>
    `;
    menuScreen.innerHTML += menu_info;
  });

  
  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
        <button onclick="changePage(${i})">${i}</button>
    `;
  }
}

function changePage(page) {
    currentPage = page;
    window.scrollTo({
      top: 450,
      behavior: 'smooth' 
    });
  
    if (isSearching) {
      displaySearchResults(); 
    } else {
      displayMenu(); 
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
      img_link: menu.img_link,
      diff: null
    }));
  
    selectedIngredients.forEach(select => {
      ingredient.forEach(ing => {
        if (ing.Menu_ingredient.includes(select)) {
          ing.Match_Ing.push(select);
        }
      });
    });
  
    
    ingredient.forEach(ing => {
      ing.Missing_Ing = ing.Menu_ingredient.filter(n => !ing.Match_Ing.includes(n));
      if (ing.Missing_Ing.length === 0) {
        ing.Missing_Ing = "ไม่มีวัตถุดิบที่ขาด";
      }
      ing.diff = ing.Menu_ingredient.length - ing.Match_Ing.length;
    });
  
    
    ingredient = ingredient.filter(ing => ing.Match_Ing.length > 0);
  
    
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
    const menuScreen = document.getElementById("recipe-result");
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
            <div class="recipe-card">
            <div class="recipe-container">
                <img id="recipe-image" src="${menu.img_link}" style="width:100%,borderRadius:10px,marginBottom:15px">
                    <p><strong>ชื่อเมนู :</strong> <span id="recipe-name">${menu.Menu_name}</span></p>
                    <p><strong>วัตถุดิบที่ขาด :</strong> <span id="recipe-ingredients">${menu.Missing_Ing}</span></p>
                    <p><strong>วัตถุดิบที่มี :</strong> <span id="recipe-ingredients">${menu.Match_Ing}</span></p>
                    <a href="/menu_info.html?menu_id=${menu.Menu_ID}&page=${currentPage}&ingredients=${selectedIngredients.join(',')}&missing_ingredients=${encodeURIComponent(menu.Missing_Ing)}">
            <button class="how-to-cook">How to cook</button>
            </a>
            </div>
        </div>
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

    // ✅ ล้าง checkbox ทั้งหมด
    const checkboxes = document.querySelectorAll("#ingredient-categories input[type='checkbox']");
    checkboxes.forEach(checkbox => checkbox.checked = false);

    // ✅ ล้างช่องแสดงวัตถุดิบที่เลือก
    const selectedList = document.getElementById("selected-list");
    selectedList.innerHTML = "";

    alert("รีเซ็ท การเสิร์ชแล้ว");

    currentPage = 1;
    displayMenu();
}


async function fetchDataById() {
    const urlParams = new URLSearchParams(window.location.search);
    const menuId = urlParams.get('menu_id');
    const missingIngredients = urlParams.get('missing_ingredients');

  fetch(`/menu/${menuId}`)
    .then(res => res.json())
    .then(data => {
      const processSteps = data.Menu_process.split('-').map(step => `<p>${step.trim()}</p>`).join("");
      
      if(!missingIngredients) {
        document.body.innerHTML = `
          <nav>
        <div class="container">
            <div class="nav-con">
                <div class="logo"><a href="#"><b>IngreDee🥯</b></a></div>
                <ul class="menu">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="bookmark.html" id="menu-search">Bookmark</a></li>
                    <li><a href="login.html">Login</a></li>
                    <li><a href="register.html">Register</a></li>
                </ul>
            </div>
        </div>
    </nav>

          <button class="back-button" onclick="goBackToSearch()"> &lt; ย้อนกลับ </button>

          <section class="maincontent">
              <div class="container">
                  <div class="maincontent-con">
                      <div class="maincontent-info">
                          <div class="maincontent-img">
                              <img src="${data.img_link}" alt="Tom Yum Goong">
                          </div>
                          <div class="info">
                              <button class="addtobookmark" onclick="addtobookmark('${data.Menu_ID}')">Add to bookmark</button>
                              <h1>${data.Menu_name}</h1>
                              <p><span>Ingredient:</span> ${data.Ingredient_split}</p>
                          </div>
                      </div>
                  </div>

                  <div class="how-to-cook">
                      <h2>How to cook ...</h2>
                      <ol>
                        ${processSteps}
                      </ol>
                  </div>
              </div>
          </section>
        `;
    } else {
      document.body.innerHTML = `
      <nav>
        <div class="container">
            <div class="nav-con">
                <div class="logo"><a href="#"><b>IngreDee🥯</b></a></div>
                <ul class="menu">
                    <li><a href="index.html">Home</a></li>
                    <li><a href="bookmark.html" id="menu-search">Bookmark</a></li>
                    <li><a href="login.html">Login</a></li>
                    <li><a href="register.html">Register</a></li>
                </ul>
            </div>
        </div>
    </nav>

      <button class="back-button" onclick="goBackToSearch()"> &lt; ย้อนกลับ </button>

      <section class="maincontent">
          <div class="container">
              <div class="maincontent-con">
                  <div class="maincontent-info">
                      <div class="maincontent-img">
                          <img src="${data.img_link}" alt="Tom Yum Goong">
                      </div>
                      <div class="info">
                          <h1>${data.Menu_name}</h1>
                          <p><span>Ingredient:</span> ${data.Ingredient_split}</p>
                          <p><span>Missing Ingredient:</span> ${missingIngredients}</p>
                          <button class="addtobookmark" onclick="addtobookmark('${data.Menu_ID}')">Add to bookmark</button>
                      </div>
                  </div>
              </div>

              <div class="how-to-cook">
                  <h2>How to cook ...</h2>
                  <ol>
                    ${processSteps}
                  </ol>
              </div>
          </div>
      </section>
      `;
      }
    });
  }
  

function goBackToSearch() {
    const urlParams = new URLSearchParams(window.location.search);
    const page = urlParams.get('page') || 1;
    const ingredients = urlParams.get('ingredients') || '';

    if (page === "bookmark") {
        const backUrl = `/bookmark.html`;
        window.location.href = backUrl;
    } else {
        const backUrl = `/index.html?page=${page}&ingredients=${ingredients}`;
        window.location.href = backUrl;
    }
  }

function addtobookmark(menuId) {
    console.log(menuId);
    fetch(`/addbookmark/${menuId}`)
    .then(res => res.text())
    .then(text => alert("Server says: " + text))
    .catch(err => alert("เกิดข้อผิดพลาด: " + err));
}

async function showbookmark() {

    const res = await fetch('/showbookmark');
    const data = await res.json();

    const show = document.getElementById('showbookmark');
    show.innerHTML = "";

    data.forEach(menu => {
        const bookmark = `
        <div class="bookmark-card">
          <h3>${menu.Menu_name}</h3>
          <p>วัตถุดิบ: ${menu.Menu_ingredient}</p>
    
          <!-- ปุ่ม "How to cook" และ "Delete Bookmark" -->
          <div class="button-container">
           <a href="/menu_info.html?menu_id=${menu.Menu_ID}&page=bookmark">
            <button>How to cook</button>
           </a>
           <button class="delete-btn" onclick='deletebookmark("${menu.Menu_ID}")'>Delete Bookmark</button>
          </div>
        </div>
        `;
        show.innerHTML += bookmark;
    });
}


function deletebookmark(Menu_ID) {
    console.log(Menu_ID);
    fetch(`/deletebookmark/${Menu_ID}`)
    .then(res => res.text())
    .then(text => {
        alert("Server says: " + text);
        location.reload();
    })
    .catch(err => alert("เกิดข้อผิดพลาด: " + err));
}




  
  
  
