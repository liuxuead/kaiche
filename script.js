// 游戏初始化
function initGame() {
    console.log('游戏初始化完成');
    
    // 上中下按钮事件
    const btnTop = document.getElementById('btn-top');
    const btnMiddle = document.getElementById('btn-middle');
    const btnBottom = document.getElementById('btn-bottom');
    const textTop = document.getElementById('text-top');
    const textMiddle = document.getElementById('text-middle');
    const textBottom = document.getElementById('text-bottom');
    const touchAreaTop = document.querySelector('.touch-area-top');
    const touchAreaMiddle = document.querySelector('.touch-area-middle');
    const touchAreaBottom = document.querySelector('.touch-area-bottom');
    
    if (btnTop) {
        btnTop.onclick = function() {
            console.log('点击了上按钮');
            showFixedTouchArea('top', touchAreaTop, touchAreaMiddle, touchAreaBottom);
            updateDisplayText('top', textTop, textMiddle, textBottom);
        };
    }
    if (btnMiddle) {
        btnMiddle.onclick = function() {
            console.log('点击了中按钮');
            showFixedTouchArea('middle', touchAreaTop, touchAreaMiddle, touchAreaBottom);
            updateDisplayText('middle', textTop, textMiddle, textBottom);
        };
    }
    if (btnBottom) {
        btnBottom.onclick = function() {
            console.log('点击了下按钮');
            showFixedTouchArea('bottom', touchAreaTop, touchAreaMiddle, touchAreaBottom);
            updateDisplayText('bottom', textTop, textMiddle, textBottom);
        };
    }
    
    // 清除按钮事件
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.onclick = function() {
            console.log('点击了清除按钮');
            clearTouchAreas(touchAreaTop, touchAreaMiddle, touchAreaBottom);
            clearDisplayText(textTop, textMiddle, textBottom);
        };
    }
    
    setupTouchListeners();
    startStopwatch();
    // 初始化数据显示
    updateDataDisplay();
}



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
        if (e.target.closest('button')) {
            return;
        }
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
        if (e.target.closest('button')) {
            return;
        }
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
        if (e.target.closest('button')) {
            return;
        }
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
            
            // 设置触摸计数为1，表示已经记录了上
            touchCount = 1;
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
}

// 设置按钮点击事件
function setupButtons() {
    console.log('setupButtons 开始执行');
    
    const buttons = document.querySelectorAll('.action-button[data-position]');
    console.log('找到的按钮数量:', buttons.length);
    
    const clearButton = document.getElementById('clear-btn');
    const touchAreaTop = document.querySelector('.touch-area-top');
    const touchAreaMiddle = document.querySelector('.touch-area-middle');
    const touchAreaBottom = document.querySelector('.touch-area-bottom');
    const textTop = document.getElementById('text-top');
    const textMiddle = document.getElementById('text-middle');
    const textBottom = document.getElementById('text-bottom');
    
    buttons.forEach((button, index) => {
        const position = button.dataset.position;
        console.log(`按钮 ${index} position:`, position);
        if (position) {
            button.addEventListener('click', () => {
                alert(`点击了${position}按钮！`);
                console.log(`点击了${position}按钮！`);
                showFixedTouchArea(position, touchAreaTop, touchAreaMiddle, touchAreaBottom);
                updateDisplayText(position, textTop, textMiddle, textBottom);
            });
        }
    });
    
    // 清除按钮点击事件
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            alert('点击了清除按钮！');
            clearTouchAreas(touchAreaTop, touchAreaMiddle, touchAreaBottom);
            clearDisplayText(textTop, textMiddle, textBottom);
        });
    }
    
    console.log('setupButtons 执行完成');
}

// 更新显示文本
function updateDisplayText(position, textTop, textMiddle, textBottom) {
    const data = touchData[position];
    console.log('updateDisplayText 被调用, position:', position, 'data:', data);
    const text = data.x !== 0 || data.y !== 0 ? 
        `圆心: (${data.x}, ${data.y}), 半径: ${data.radius}` : '暂无数据';
    console.log('要显示的文本:', text);
    
    if (position === 'top') {
        textTop.textContent = text;
        console.log('已设置 textTop.textContent:', textTop.textContent);
    } else if (position === 'middle') {
        textMiddle.textContent = text;
        console.log('已设置 textMiddle.textContent:', textMiddle.textContent);
    } else if (position === 'bottom') {
        textBottom.textContent = text;
        console.log('已设置 textBottom.textContent:', textBottom.textContent);
    }
}

// 清除显示文本
function clearDisplayText(textTop, textMiddle, textBottom) {
    textTop.textContent = '';
    textMiddle.textContent = '';
    textBottom.textContent = '';
}

// 显示固定的触摸区域
function showFixedTouchArea(position, touchAreaTop, touchAreaMiddle, touchAreaBottom) {
    const data = touchData[position];
    console.log(`显示${position}位置的触摸区域，数据:`, data);
    
    // 判断是否有数据
    if (data.x === 0 && data.y === 0) {
        console.log(`${position}位置没有数据`);
        return;
    }
    
    let targetArea;
    if (position === 'top') {
        targetArea = touchAreaTop;
    } else if (position === 'middle') {
        targetArea = touchAreaMiddle;
    } else if (position === 'bottom') {
        targetArea = touchAreaBottom;
    }
    
    if (targetArea) {
        targetArea.style.left = `${data.x}px`;
        targetArea.style.top = `${data.y}px`;
        targetArea.style.width = `${data.radius * 2}px`;
        targetArea.style.height = `${data.radius * 2}px`;
        targetArea.style.opacity = '1';
        console.log(`${position}触摸区域设置完成`);
    }
}

// 清除所有触摸区域
function clearTouchAreas(touchAreaTop, touchAreaMiddle, touchAreaBottom) {
    if (touchAreaTop) {
        touchAreaTop.style.opacity = '0';
    }
    if (touchAreaMiddle) {
        touchAreaMiddle.style.opacity = '0';
    }
    if (touchAreaBottom) {
        touchAreaBottom.style.opacity = '0';
    }
    console.log('清除所有触摸区域');
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



