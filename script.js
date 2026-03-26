// 游戏初始化
function initGame() {
    console.log('游戏初始化完成');
    setupTouchListeners();
    setupButtons();
    startStopwatch();
    // 初始化数据显示
    updateDataDisplay();
    // 初始化BOSS
    initBoss();
}

// BOSS相关变量
let boss = null;
let bossHealth = 100;
let isTouchingBoss = false;

// 存储触摸位置数据
const touchData = {
    bottom: { x: 0, y: 0, radius: 50 },
    middle: { x: 0, y: 0, radius: 50 },
    top: { x: 0, y: 0, radius: 50 }
};

// 触摸计时器
let touchTimer = null;
let currentTouch = null;
// 长按计数器，用于记录第几次长按
let touchCount = 0;
// 记录完成次数（上中下都有值）
let completeCount = 0;

// 设置触摸事件监听器
function setupTouchListeners() {
    const gameContainer = document.querySelector('.game-container');
    const touchInfo = document.querySelector('.touch-info');
    const touchArea = document.querySelector('.touch-area');
    
    // 触摸开始事件
    gameContainer.addEventListener('touchstart', (e) => {
        e.preventDefault();
        currentTouch = e.touches[0];
        updateTouchInfo(currentTouch, touchArea);
        
        // 开始计时
        if (!stopwatchRunning) {
            resetStopwatch();
            stopwatchRunning = true;
            stopwatchInterval = setInterval(() => {
                stopwatchMilliseconds += 10;
                if (stopwatchMilliseconds >= 1000) {
                    stopwatchMilliseconds = 0;
                    stopwatchSeconds += 1;
                }
                
                const totalSeconds = stopwatchSeconds + (stopwatchMilliseconds / 1000);
                document.querySelector('.dashboard-value').textContent = totalSeconds.toFixed(2);
            }, 10);
        }
        
        // 开始计时
        touchTimer = setTimeout(() => {
            // 超过1秒，记录数据
            recordTouchData(currentTouch);
        }, 1000);
    });
    
    // 触摸移动事件
    gameContainer.addEventListener('touchmove', (e) => {
        e.preventDefault();
        currentTouch = e.touches[0];
        updateTouchInfo(currentTouch, touchArea);
    });
    
    // 触摸结束事件
    gameContainer.addEventListener('touchend', () => {
        touchInfo.textContent = '触摸位置: (0, 0)';
        touchArea.style.opacity = '0';
        
        // 停止计时并显示最终时间
        stopStopwatch();
        
        // 清除计时器
        clearTimeout(touchTimer);
        currentTouch = null;
    });
    
    // 鼠标点击事件（用于桌面测试）
    gameContainer.addEventListener('mousedown', (e) => {
        currentTouch = e;
        updateTouchInfo(e, touchArea);
        
        // 开始计时
        if (!stopwatchRunning) {
            resetStopwatch();
            stopwatchRunning = true;
            stopwatchInterval = setInterval(() => {
                stopwatchMilliseconds += 10;
                if (stopwatchMilliseconds >= 1000) {
                    stopwatchMilliseconds = 0;
                    stopwatchSeconds += 1;
                }
                
                const totalSeconds = stopwatchSeconds + (stopwatchMilliseconds / 1000);
                document.querySelector('.dashboard-value').textContent = totalSeconds.toFixed(2);
            }, 10);
        }
        
        // 开始计时
        touchTimer = setTimeout(() => {
            // 超过1秒，记录数据
            recordTouchData(e);
        }, 1000);
    });
    
    gameContainer.addEventListener('mousemove', (e) => {
        currentTouch = e;
        updateTouchInfo(e, touchArea);
    });
    
    gameContainer.addEventListener('mouseup', () => {
        touchInfo.textContent = '触摸位置: (0, 0)';
        touchArea.style.opacity = '0';
        
        // 停止计时并显示最终时间
        stopStopwatch();
        
        // 清除计时器
        clearTimeout(touchTimer);
        currentTouch = null;
    });
}

// 记录触摸数据
function recordTouchData(touch) {
    // 增加触摸计数
    touchCount++;
    
    // 检查是否所有数据都已记录
    const allDataRecorded = (touchData.top.x !== 0 || touchData.top.y !== 0) && 
                          (touchData.middle.x !== 0 || touchData.middle.y !== 0) && 
                          (touchData.bottom.x !== 0 || touchData.bottom.y !== 0);
    
    // 根据计数决定记录到哪个位置
    if (touchCount === 1) {
        // 第一次长按，记录到上位置
        touchData.top.x = Math.round(touch.clientX);
        touchData.top.y = Math.round(touch.clientY);
        touchData.top.radius = 50;
        console.log('记录触摸数据到上位置:', touchData.top);
    } else if (touchCount === 2) {
        // 第二次长按，记录到中位置
        if (touchData.top.x !== 0 || touchData.top.y !== 0) {
            touchData.middle.x = Math.round(touch.clientX);
            touchData.middle.y = Math.round(touch.clientY);
            touchData.middle.radius = 50;
            console.log('记录触摸数据到中位置:', touchData.middle);
        }
    } else if (touchCount === 3) {
        // 第三次长按，记录到下位置
        if ((touchData.top.x !== 0 || touchData.top.y !== 0) && (touchData.middle.x !== 0 || touchData.middle.y !== 0)) {
            touchData.bottom.x = Math.round(touch.clientX);
            touchData.bottom.y = Math.round(touch.clientY);
            touchData.bottom.radius = 50;
            console.log('记录触摸数据到下位置:', touchData.bottom);
        }
    } else if (touchCount >= 4) {
        // 第四次及以后的按压
        if (allDataRecorded) {
            // 三个都有数据，次数+1，清空中和下，记录到上
            completeCount++;
            const completeCounter = document.getElementById('complete-counter');
            completeCounter.textContent = completeCount;
            
            // 清空中和下
            touchData.middle.x = 0;
            touchData.middle.y = 0;
            touchData.bottom.x = 0;
            touchData.bottom.y = 0;
            
            // 记录到上
            touchData.top.x = Math.round(touch.clientX);
            touchData.top.y = Math.round(touch.clientY);
            touchData.top.radius = 50;
            console.log('记录触摸数据到上位置:', touchData.top);
            
            // 重置触摸计数
            touchCount = 0;
        } else if (touchData.top.x !== 0 || touchData.top.y !== 0) {
            // 只有上有数据，记录到中
            if (touchData.middle.x === 0 && touchData.middle.y === 0) {
                touchData.middle.x = Math.round(touch.clientX);
                touchData.middle.y = Math.round(touch.clientY);
                touchData.middle.radius = 50;
                console.log('记录触摸数据到中位置:', touchData.middle);
            } else if (touchData.bottom.x === 0 && touchData.bottom.y === 0) {
                // 上中有数据，记录到下
                touchData.bottom.x = Math.round(touch.clientX);
                touchData.bottom.y = Math.round(touch.clientY);
                touchData.bottom.radius = 50;
                console.log('记录触摸数据到下位置:', touchData.bottom);
            }
        }
    }
    
    updateDataDisplay();
}

// 更新数据显示
function updateDataDisplay() {
    if (touchData.top.x !== 0 || touchData.top.y !== 0) {
        document.getElementById('data-top').textContent = `圆心: (${touchData.top.x}, ${touchData.top.y}), 半径: ${touchData.top.radius}`;
    } else {
        document.getElementById('data-top').textContent = '0';
    }
    
    if (touchData.middle.x !== 0 || touchData.middle.y !== 0) {
        document.getElementById('data-middle').textContent = `圆心: (${touchData.middle.x}, ${touchData.middle.y}), 半径: ${touchData.middle.radius}`;
    } else {
        document.getElementById('data-middle').textContent = '0';
    }
    
    if (touchData.bottom.x !== 0 || touchData.bottom.y !== 0) {
        document.getElementById('data-bottom').textContent = `圆心: (${touchData.bottom.x}, ${touchData.bottom.y}), 半径: ${touchData.bottom.radius}`;
    } else {
        document.getElementById('data-bottom').textContent = '0';
    }
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
let stopwatchInterval = null;
let stopwatchRunning = false;
let stopwatchSeconds = 0;
let stopwatchMilliseconds = 0;

function startStopwatch() {
    const dashboardValue = document.querySelector('.dashboard-value');
    
    // 初始化显示为0
    dashboardValue.textContent = '0';
}

function resetStopwatch() {
    const dashboardValue = document.querySelector('.dashboard-value');
    stopwatchSeconds = 0;
    stopwatchMilliseconds = 0;
    dashboardValue.textContent = '0';
}

function stopStopwatch() {
    const dashboardValue = document.querySelector('.dashboard-value');
    if (stopwatchInterval) {
        clearInterval(stopwatchInterval);
        stopwatchInterval = null;
    }
    stopwatchRunning = false;
    
    // 显示最终时间（秒）
    const totalSeconds = stopwatchSeconds + (stopwatchMilliseconds / 1000);
    dashboardValue.textContent = totalSeconds.toFixed(2);
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