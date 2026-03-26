// 游戏初始化
function initGame() {
    console.log('游戏初始化完成');
    // 可以在这里添加游戏逻辑
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', initGame);

// 示例：可以添加一个简单的计数器功能
let count = 888;
const dashboardValue = document.querySelector('.dashboard-value');

// 可以通过其他游戏逻辑来更新这个值
function updateDashboard(newValue) {
    count = newValue;
    dashboardValue.textContent = count;
}

// 示例：每3秒增加1
setInterval(() => {
    updateDashboard(count + 1);
}, 3000);