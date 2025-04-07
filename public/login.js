// ลิงก์ไปหน้าลงทะเบียน
document.getElementById("registerLink").addEventListener("click", function(event) {
    event.preventDefault(); 
    window.location.href = "register.html"; 
});

// ตรวจสอบข้อมูลและเปลี่ยนหน้าเมื่อ Login สำเร็จ
document.getElementById("loginForm").addEventListener("submit", function(event) {
    event.preventDefault();
    
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    
    if (email && password) {
        alert("Login Successful!");
        window.location.href = "index.html";
    } else {
        alert("Please fill in all fields.");
    }
});
