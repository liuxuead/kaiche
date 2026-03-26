// 游戏初始化
function initGame() {
    console.log('游戏初始化完成');
    setupTouchListeners();
    setupOrientationListener();
}

// 设置触摸事件监听器
function setupTouchListeners() {
    const gameContainer = document.querySelector('.game-container');
    const touchInfo = document.querySelector('.touch-info');
    const touchArea = document.querySelector('.touch-area');
    
    // 触摸开始事件
    gameContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        updateTouchInfo(e.touches[0], touchArea);
    });
    
    // 触摸移动事件
    gameContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        updateTouchInfo(e.touches[0], touchArea);
    });
    
    // 触摸结束事件
    gameContainer.addEventListener('touchend', () => {
        touchInfo.textContent = '触摸位置: (0, 0)';
        touchArea.style.opacity = '0';
    });
    
    // 鼠标点击事件（用于桌面测试）
    gameContainer.addEventListener('mousedown', (e) => {
        updateTouchInfo(e, touchArea);
    });
    
    gameContainer.addEventListener('mousemove', (e) => {
        updateTouchInfo(e, touchArea);
    });
    
    gameContainer.addEventListener('mouseup', () => {
        touchInfo.textContent = '触摸位置: (0, 0)';
        touchArea.style.opacity = '0';
    });
}

// 更新触摸信息和显示触摸区域
function updateTouchInfo(touch, touchArea) {
    const touchInfo = document.querySelector('.touch-info');
    const x = Math.round(touch.clientX);
    const y = Math.round(touch.clientY);
    touchInfo.textContent = `触摸位置: (${x}, ${y})`;
    
    // 显示触摸区域
    touchArea.style.left = `${x}px`;
    touchArea.style.top = `${y}px`;
    touchArea.style.opacity = '1';
    
    // 可以在这里添加根据触摸位置执行不同操作的逻辑
    console.log(`触摸位置: (${x}, ${y})`);
}

// 设置屏幕方向监听器
function setupOrientationListener() {
    window.addEventListener('orientationchange', () => {
        console.log('屏幕方向改变:', window.orientation);
        // 可以在这里添加根据屏幕方向调整布局的逻辑
    });
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