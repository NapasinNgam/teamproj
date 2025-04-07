document.addEventListener("DOMContentLoaded", () => {

    const ingredientCategories = {
        "ผัก": [
            "กระเทียม", "กะหล่ำปลี", "ขึ้นฉ่าย", "ข่า", "คะน้า", "ตะไคร้", "ต้นหอม", "ถั่วงอก",
            "ถั่วฝักยาว", "ผักกาดขาว", "ผักกาดดอง", "ผักชี", "ผักชีฝรั่ง", "ผักบุ้ง", "ผักโขม", 
            "มะเขือพวง", "มะเขือเทศ", "มะเขือเปราะ", "รากผักชี", "ลูกผักชี", "หอมเจียว", "หอมแขก", 
            "หอมแดง", "หอมใหญ่", "หัวไชเท้า", "เผือก", "แตงกวา", "แคร์รอต", "ใบกะเพรา", "ใบกุยช่าย", 
            "ใบมะกรูด", "ใบสะระแหน่", "ใบโหระพา"
        ],
        "ผลไม้": [
            "กล้วยน้ำว้า", "ข้าวโพด", "พริก", "พริกขี้หนู", "พริกขี้หนูสวน", "พริกจินดา", 
            "พริกชี้ฟ้า", "พริกผัด", "พริกหอม", "พริกแกง", "พริกแกงเขียวหวาน", "พริกแห้ง", 
            "พริกแห้งแดงจินดา", "มะนาว", "มะพร้าวทึนทึก", "มะม่วง", "มะละกอดิบ", "ลูกตาล", 
            "เนื้อมะพร้าว", "เนื้อมะพร้าวอ่อน", "แตงโม"
        ],
        "ผลิตภัณฑ์นมและไข่": [
            "นมข้นจืด", "นมข้นหวาน", "ไข่เป็ด", "ไข่ไก่"
        ],
        "เนื้อสัตว์": [
            "กระดูกหมู", "ขาหมู", "คอหมูย่าง", "น่องไก่", "ปีกไก่บน", "สันคอหมู", "หมูกรอบ", 
            "หมูสับ", "เนื้อสะโพกไก่", "เนื้อหมู", "เนื้อไก่"
        ],
        "ธัญพืช": [
            "งาขาว", "ถั่วดำ", "ถั่วทอง", "ถั่วลิสงคั่ว"
        ],
        "เห็ด": [
            "เห็ดฟาง", "เห็ดหอม"
        ],
        "อาหารทะเล": [
            "กุ้งสด", "กุ้งแห้ง", "ปลากระพง", "ปลาช่อนแดดเดียว", "ปลาหมึกกล้วย"
        ],
        "คาร์โบไฮเดรต": [
            "ข้าวสวย", "ข้าวเหนียว", "ข้าวเหนียวเขี้ยวงู", "วุ้นเส้น", "เส้นข้าวซอย", "เส้นจันท์", 
            "เส้นใหญ่", "แป้งข้าวเจ้า", "แป้งข้าวเหนียว", "แป้งถั่วเขียว", "แป้งท้าวยายม่อม", "แป้งมัน"
        ],
        "เครื่องปรุง": [
            "กะปิ", "ซอสปรุงรส", "ซอสปรุงรสฝาเขียว", "ซอสหอยนางรม", "ซีอิ้วดำหวาน", 
            "ซีอิ๊วขาว", "ซีอิ๊วดำ", "ซุปก้อน", "น้ำตาลทรายขาว", "น้ำตาลทรายแดง", 
            "น้ำตาลปี๊บ", "น้ำตาลมะพร้าว", "น้ำปลา", "น้ำผึ้ง", "น้ำพริกข้าวซอย", 
            "น้ำพริกเผา", "น้ำมะขามเปียก", "น้ำมะนาว", "น้ำสต๊อก", "น้ำเชื่อม", "น้ำแดง", 
            "ผงกะหรี่", "ผงชูรส", "ผงปรุงรส", "พริกป่น", "พริกไทย", "พริกไทยขาว", 
            "พริกไทยป่น", "พริกไทยเม็ด", "เกลือ"
        ],
        "อื่น ๆ": [
            "กระเทียมดอง", "กลิ่นสังเคราะห์กลิ่นมะลิ", "กะทิ", "ข้าวคั่ว", "ดอกมะลิ",
            "น้ำ", "น้ำปูนใส", "น้ำมะพร้าวอ่อน", "น้ำมันพืช", "น้ำมันพืชสำหรับผัด",
            "น้ำมันมะกอก", "น้ำแข็ง", "น้ำใบเตย", "ผงวุ้น", "สาคูต้น", "สีธรรมชาติ",
            "หัวกะทิ", "อบเชย", "เต้าหู้แข็ง", "เต้าหู้ไข่", "โป๊ยกั๊ก", "ใบเตย", "ไชโป๊วเค็ม"
        ]
    };

    const ingredientContainer = document.getElementById('ingredient-categories');

    // วนลูปเพื่อสร้างหมวดหมู่และรายการเช็คบ็อกซ์
    for (const category in ingredientCategories) {
        const categoryDiv = document.createElement('div');
        categoryDiv.classList.add('ingredient-category');

        const categoryHeader = document.createElement('div');
        categoryHeader.classList.add('ingredients-header');
        categoryHeader.textContent = category;

        categoryDiv.appendChild(categoryHeader);

        const checkboxesContainer = document.createElement('div');
        checkboxesContainer.classList.add('ingredient-checkboxes');

        ingredientCategories[category].forEach(ingredient => {
            const label = document.createElement('label');
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = ingredient;
            checkbox.classList.add('ingredient-check');
            label.appendChild(checkbox);
            label.appendChild(document.createTextNode(ingredient));
            checkboxesContainer.appendChild(label);

            // ฟังเหตุการณ์เมื่อมีการเลือกวัตถุดิบ
            checkbox.addEventListener('change', () => {
                if (checkbox.checked) {
                    if (!selectedIngredients.includes(ingredient)) {
                        selectedIngredients.push(ingredient);
                    }
                } else {
                    selectedIngredients = selectedIngredients.filter(i => i !== ingredient);
                }
                updateSelectedIngredients();
            });
        });

        categoryDiv.appendChild(checkboxesContainer);
        ingredientContainer.appendChild(categoryDiv);
    }

    const selectedList = document.getElementById("selected-list");
    const ingredientButtons = document.querySelectorAll(".ingredient-btn");
    const searchBtn = document.getElementById("search-btn");
    const resetBtn = document.getElementById("reset-btn");
    const recipeResult = document.getElementById("recipe-result");
    const toggleSidebarBtn = document.getElementById("toggleSidebar");

    let selectedIngredients = [];

    // Sidebar toggle
    toggleSidebarBtn.addEventListener("click", () => {
        document.body.classList.toggle("sidebar-closed");
    });

    // Select ingredient
    ingredientButtons.forEach(button => {
        button.addEventListener("click", () => {
            if (!selectedIngredients.includes(button.innerText)) {
                selectedIngredients.push(button.innerText);
                updateSelectedIngredients();
            }
        });
    });

    function updateSelectedIngredients() {
        selectedList.innerHTML = "";
        selectedIngredients.forEach(ingredient => {
            const span = document.createElement("span");
            span.textContent = ingredient;
            span.classList.add("selected-item");

            const removeBtn = document.createElement("button");
            removeBtn.textContent = "x";
            removeBtn.addEventListener("click", () => {
                selectedIngredients = selectedIngredients.filter(i => i !== ingredient);
                updateSelectedIngredients();
            });

            span.appendChild(removeBtn);
            selectedList.appendChild(span);
        });
    }

    // กำหนดให้ recipeResult ซ่อนอยู่ตอนเริ่มต้น
    recipeResult.style.display = "none"; // ซ่อนไว้ตั้งแต่แรก

    // เมื่อคลิกปุ่มค้นหา
    searchBtn.addEventListener("click", () => {
        fetch("recipes.json")
            .then(response => response.json())
            .then(data => {
                const matchedRecipes = data.recipes.filter(recipe =>
                    recipe.ingredients.some(i => selectedIngredients.includes(i))
                );

                if (matchedRecipes.length > 0) {
                    displayRecipe(matchedRecipes);  // เรียกใช้ฟังก์ชันแสดงผลลัพธ์
                } else {
                    alert("No matching recipes found!");
                    recipeResult.style.display = "none";  // หากไม่พบผลลัพธ์ให้ซ่อน
                }
            })
            .catch(error => {
                console.error("Error loading recipes.json:", error);
                alert("Failed to load recipes.");
            });
    });

    // Reset
// Reset
    resetBtn.addEventListener("click", () => {
    selectedIngredients = [];
    updateSelectedIngredients();
    recipeResult.style.display = "none";
    recipeResult.innerHTML = "";

    // รีเซ็ตสถานะของ checkbox ทุกตัว
    document.querySelectorAll('input[type="checkbox"]').forEach(function(checkbox) {
        checkbox.checked = false;  // รีเซ็ตสถานะของ checkbox
    });
});


    // Show recipes
    function displayRecipe(recipes) {
        recipeResult.style.display = "block"; // Show the results section
        recipeResult.innerHTML = "<h3>Recipe(s)</h3>";
    
        recipes.forEach(recipe => {
            const recipeCard = document.createElement("div");
            recipeCard.classList.add("recipe-card");
    
            const recipeImage = document.createElement("img");
            recipeImage.src = recipe.image;
            recipeImage.alt = recipe.name;
            recipeImage.style.width = "100%";
            recipeImage.style.borderRadius = "10px";
            recipeImage.style.marginBottom = "15px";
    
            const recipeName = document.createElement("p");
            recipeName.innerHTML = `<strong>Name:</strong> ${recipe.name}`;
    
            const recipeIngredients = document.createElement("p");
            recipeIngredients.innerHTML = `<strong>Ingredients:</strong> ${recipe.ingredients.join(", ")}`;
    
            const missingIngredients = recipe.ingredients.filter(ingredient => !selectedIngredients.includes(ingredient));
            const recipeMissing = document.createElement("p");
            recipeMissing.innerHTML = `<strong>Missing Ingredients:</strong> ${missingIngredients.length > 0 ? missingIngredients.join(", ") : "None"}`;
    
            const howToCookButton = document.createElement("button");
            howToCookButton.classList.add("how-to-cook");
            howToCookButton.textContent = "How to cook";
            howToCookButton.addEventListener("click", () => {
                alert(`Here’s how to cook ${recipe.name}`);
            });
    
            recipeCard.appendChild(recipeImage);
            recipeCard.appendChild(recipeName);
            recipeCard.appendChild(recipeIngredients);
            recipeCard.appendChild(recipeMissing);
            recipeCard.appendChild(howToCookButton);
    
            recipeResult.appendChild(recipeCard);
        });
    }
    

    const topMenuSearch = document.getElementById("menu-search");
    const sidebar = document.getElementById("sidebar");
    const content = document.getElementById("content");

    if (topMenuSearch) {
        topMenuSearch.addEventListener("click", (e) => {
            e.preventDefault();
            sidebar.style.display = "block";
            content.style.display = "block";
        });
    }
});
