// 游戏初始化
function initGame() {
    console.log('游戏初始化完成');
    setupTouchListeners();
    setupButtons();
    startStopwatch();
}

// 存储触摸位置数据
const touchData = {
    bottom: { x: 0, y: 0, radius: 50 },
    middle: { x: 0, y: 0, radius: 50 },
    top: { x: 0, y: 0, radius: 50 }
};

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

// 设置按钮点击事件
function setupButtons() {
    const buttons = document.querySelectorAll('.action-button');
    const touchArea = document.querySelector('.touch-area');
    
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            const position = button.dataset.position;
            showTouchArea(position, touchArea);
        });
    });
}

// 显示对应位置的触摸区域
function showTouchArea(position, touchArea) {
    const data = touchData[position];
    touchArea.style.left = `${data.x}px`;
    touchArea.style.top = `${data.y}px`;
    touchArea.style.width = `${data.radius * 2}px`;
    touchArea.style.height = `${data.radius * 2}px`;
    touchArea.style.opacity = '1';
    
    // 3秒后隐藏
    setTimeout(() => {
        touchArea.style.opacity = '0';
    }, 3000);
}

// 秒表功能
function startStopwatch() {
    const dashboardValue = document.querySelector('.dashboard-value');
    let seconds = 0;
    let milliseconds = 0;
    
    setInterval(() => {
        milliseconds += 10;
        if (milliseconds >= 1000) {
            milliseconds = 0;
            seconds += 1;
        }
        
        const formattedSeconds = seconds.toString().padStart(2, '0');
        const formattedMilliseconds = Math.floor(milliseconds / 10).toString().padStart(2, '0');
        dashboardValue.textContent = `${formattedSeconds}:${formattedMilliseconds}`;
    }, 10);
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', initGame);

// 模拟触摸数据（实际应用中可以通过触摸事件记录）
function simulateTouchData() {
    // 假设屏幕高度为800px，宽度为1200px（横屏）
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    
    // 下位置：屏幕底部附近
    touchData.bottom.x = screenWidth / 2;
    touchData.bottom.y = screenHeight - 100;
    touchData.bottom.radius = 50;
    
    // 中位置：屏幕中间
    touchData.middle.x = screenWidth / 2;
    touchData.middle.y = screenHeight / 2;
    touchData.middle.radius = 50;
    
    // 上位置：屏幕顶部附近
    touchData.top.x = screenWidth / 2;
    touchData.top.y = 100;
    touchData.top.radius = 50;
    
    // 更新显示
    document.getElementById('data-bottom').textContent = `圆心: (${touchData.bottom.x}, ${touchData.bottom.y}), 半径: ${touchData.bottom.radius}`;
    document.getElementById('data-middle').textContent = `圆心: (${touchData.middle.x}, ${touchData.middle.y}), 半径: ${touchData.middle.radius}`;
    document.getElementById('data-top').textContent = `圆心: (${touchData.top.x}, ${touchData.top.y}), 半径: ${touchData.top.radius}`;
}

// 窗口大小改变时更新数据
window.addEventListener('resize', simulateTouchData);

// 初始化触摸数据
simulateTouchData();