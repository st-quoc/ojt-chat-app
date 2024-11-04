const CLIENT_ID = '896387674450-36c0ktb6qabai36ol9271dlh2u1at97k.apps.googleusercontent.com';

// Cấu hình Google Sign-In
function initializeGoogleSignIn() {
  google.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: handleCredentialResponse
  });

  // Hiển thị nút đăng ký Google
  google.accounts.id.renderButton(
    document.getElementById('googleRegisterBtn'), // Sử dụng ID đúng
    { theme: 'outline', size: 'large' } // Tùy chọn cho nút
  );
}

// Xử lý phản hồi từ Google
async function handleCredentialResponse(response) {
  const token = response.credential;
  console.log("Google ID Token:", token);

  // Giải mã token để lấy thông tin email
  const userInfo = jwt_decode(token);
  const username = userInfo.sub; // Dùng sub làm username
  const email = userInfo.sub; // Cần lấy email thực từ userInfo nếu có
  const password = userInfo.sub; // Cần xử lý password theo cách tốt hơn

  try {
    // Đăng ký người dùng mới
    let response = await fetch(`${BASE_URL}/api/users/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        email,
        password,
      }),
    });

    let data = await response.json();
    console.log(data);

    if (data.message === 'User registered successfully') {
      cuteToast({
        type: 'success',
        title: 'Success',
        message: 'User registered successfully',
      });

      setTimeout(() => {
        window.location.href = '/index.html';
      }, 4000);

      response = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      data = await response.json();
      console.log('User ID:', data.data.userId);
      sessionStorage.setItem('userID', data.data.userId);
      window.location.href = '/pages/chatPage.html';
    } else {
      // Nếu đăng ký không thành công, thử đăng nhập
      response = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });
      
      data = await response.json();
      console.log('User ID:', data.data.userId);
      sessionStorage.setItem('userID', data.data.userId);
      window.location.href = '/pages/chatPage.html';
    }
  } catch (error) {
    displayErrorMessage('Network error or server is down');
  }
}

// Đảm bảo DOM đã tải xong trước khi gán các sự kiện
document.addEventListener('DOMContentLoaded', function () {
  initializeGoogleSignIn(); // Gọi hàm để hiển thị nút ngay khi DOM đã tải xong
});
