document.getElementById("registerForm").addEventListener("submit", function(event) {
    event.preventDefault(); // ป้องกันการโหลดหน้าใหม่

    let password = document.getElementById("password").value;
    let confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
        alert("Passwords do not match!");
    } else {
        alert("Registration Successful!");
        // สามารถเพิ่มโค้ดส่งข้อมูลไปยังเซิร์ฟเวอร์ได้ที่นี่
    }
});

document.getElementById("showPassword").addEventListener("change", function() {
    let passwordField = document.getElementById("password");
    let confirmPasswordField = document.getElementById("confirmPassword");

    if (this.checked) {
        passwordField.type = "text";
        confirmPasswordField.type = "text";
    } else {
        passwordField.type = "password";
        confirmPasswordField.type = "password";
    }
});
