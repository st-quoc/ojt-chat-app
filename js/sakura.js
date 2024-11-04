document.addEventListener("DOMContentLoaded", function () {
  const sakuraContainer = document.querySelector('.falling-sakura');

  function createSakura() {
      const sakura = document.createElement('div');
      sakura.classList.add('sakura');
      
      // Đặt vị trí ngẫu nhiên
      sakura.style.left = Math.random() * 100 + 'vw';
      sakura.style.animationDuration = 3 + Math.random() * 5 + 's';
      sakura.style.opacity = Math.random() * 0.7 + 0.3;
      
      sakuraContainer.appendChild(sakura);

      // Xóa phần tử khi hoàn thành hiệu ứng
      sakura.addEventListener('animationend', () => {
          sakura.remove();
      });
  }

  // Tạo nhiều hoa anh đào mỗi 100ms
  const sakuraInterval = setInterval(() => {
      for (let i = 0; i < 3; i++) {
          createSakura();
      }
  }, 100);

  // Dừng tạo hoa sau 3 giây
  setTimeout(() => {
      clearInterval(sakuraInterval); // Dừng việc tạo hoa
  }, 3000); // 3000ms = 3s
});
