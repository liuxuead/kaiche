// 电量条分区配置
const BATTERY_BAR_CONFIG = {
    top: { count: 6, color: '#e74c3c' },      // 上：6格，红色
    middle: { count: 9, color: '#2ecc71' },   // 中：9格，绿色
    bottom: { count: 5, color: '#3498db' }    // 下：5格，蓝色
};

// 初始化电量条
function initBatteryBar() {
    const batteryBars = document.getElementById('battery-bars');
    if (!batteryBars) return;
    
    batteryBars.innerHTML = '';
    
    // 创建上部分（6格，蓝色）
    for (let i = 0; i < BATTERY_BAR_CONFIG.top.count; i++) {
        const bar = document.createElement('div');
        bar.className = 'battery-bar-item';
        bar.dataset.section = 'top';
        bar.dataset.index = i;
        bar.style.cssText = `
            flex: 1;
            height: 70%;
            margin: 0 2px;
            background: #555;
            border-radius: 2px;
            transition: background 0.1s;
        `;
        batteryBars.appendChild(bar);
    }
    
    // 创建中部分（9格，绿色）
    for (let i = 0; i < BATTERY_BAR_CONFIG.middle.count; i++) {
        const bar = document.createElement('div');
        bar.className = 'battery-bar-item';
        bar.dataset.section = 'middle';
        bar.dataset.index = i;
        bar.style.cssText = `
            flex: 1;
            height: 70%;
            margin: 0 2px;
            background: #555;
            border-radius: 2px;
            transition: background 0.1s;
        `;
        batteryBars.appendChild(bar);
    }
    
    // 创建下部分（5格，红色）
    for (let i = 0; i < BATTERY_BAR_CONFIG.bottom.count; i++) {
        const bar = document.createElement('div');
        bar.className = 'battery-bar-item';
        bar.dataset.section = 'bottom';
        bar.dataset.index = i;
        bar.style.cssText = `
            flex: 1;
            height: 70%;
            margin: 0 2px;
            background: #555;
            border-radius: 2px;
            transition: background 0.1s;
        `;
        batteryBars.appendChild(bar);
    }
}

// 更新电量条记录状态显示
function updateBatteryBarRecordStatus() {
    const bars = document.querySelectorAll('.battery-bar-item');
    
    bars.forEach(bar => {
        const section = bar.dataset.section;
        
        if (section === 'top' && touchData.top.x !== 0) {
            // 上有数据，亮起蓝色
            bar.style.background = BATTERY_BAR_CONFIG.top.color;
        } else if (section === 'middle' && touchData.middle.x !== 0) {
            // 中有数据，亮起绿色
            bar.style.background = BATTERY_BAR_CONFIG.middle.color;
        } else if (section === 'bottom' && touchData.bottom.x !== 0) {
            // 下有数据，亮起红色
            bar.style.background = BATTERY_BAR_CONFIG.bottom.color;
        } else {
            // 无数据，灰色
            bar.style.background = '#555';
        }
    });
}

// 更新电量条显示（实时追踪手指位置）
function updateBatteryBar(clientY) {
    const stats = getStatsAverage();
    if (stats.top.y === 0 || stats.bottom.y === 0) {
        return;
    }
    
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    const rect = gameContainer.getBoundingClientRect();
    // 把clientY转换成相对于game-container的坐标
    const relativeY = clientY - rect.top;
    
    // 计算当前Y在统计范围内的位置 (0-1)
    let totalRange = Math.abs(stats.bottom.y - stats.top.y);
    if (totalRange <= 0) {
        console.log('updateBatteryBar: totalRange <= 0，使用默认范围 100');
        totalRange = 100;
    }
    
    // 确定哪个是上，哪个是下
    const minY = Math.min(stats.top.y, stats.bottom.y);
    const maxY = Math.max(stats.top.y, stats.bottom.y);
    
    let position;
    if (totalRange === 100) {
        position = 0.5;
    } else {
        position = (relativeY - minY) / totalRange;
        position = Math.max(0, Math.min(1, position));
    }
    
    // 反转位置，让上下对应
    position = 1 - position;
    
    // 根据位置确定在哪个区域
    // 上区域：0-0.3 (6格)
    // 中区域：0.3-0.8 (9格)
    // 下区域：0.8-1 (5格) - 偏下一些，方便指尖操作
    let targetSection, sectionIndex, sectionPosition;
    const topThreshold = 0.3;
    const bottomThreshold = 0.8;
    
    if (position < topThreshold) {
        // 上区域
        targetSection = 'top';
        sectionPosition = position / topThreshold;
        sectionIndex = Math.round(sectionPosition * (BATTERY_BAR_CONFIG.top.count - 1));
    } else if (position > bottomThreshold) {
        // 下区域
        targetSection = 'bottom';
        sectionPosition = (position - bottomThreshold) / (1 - bottomThreshold);
        sectionIndex = Math.round(sectionPosition * (BATTERY_BAR_CONFIG.bottom.count - 1));
    } else {
        // 中区域
        targetSection = 'middle';
        sectionPosition = (position - topThreshold) / (bottomThreshold - topThreshold);
        sectionIndex = Math.round(sectionPosition * (BATTERY_BAR_CONFIG.middle.count - 1));
    }
    
    // 计算在总格子中的索引
    let centerIndex;
    if (targetSection === 'top') {
        centerIndex = sectionIndex;
    } else if (targetSection === 'middle') {
        centerIndex = BATTERY_BAR_CONFIG.top.count + sectionIndex;
    } else {
        centerIndex = BATTERY_BAR_CONFIG.top.count + BATTERY_BAR_CONFIG.middle.count + sectionIndex;
    }
    
    const spread = 2; // 向两边扩散的范围
    
    const bars = document.querySelectorAll('.battery-bar-item');
    bars.forEach((bar, i) => {
        const distance = Math.abs(i - centerIndex);
        const section = bar.dataset.section;
        
        if (distance <= spread) {
            const intensity = 1 - (distance / (spread + 1));
            
            // 根据区域使用不同颜色
            let r, g, b;
            if (section === 'top') {
                // 红色（对应记录的上）
                r = Math.round(231 * intensity + 50 * (1 - intensity));
                g = Math.round(76 * intensity);
                b = Math.round(60 * intensity);
            } else if (section === 'middle') {
                // 绿色
                r = Math.round(46 * intensity);
                g = Math.round(204 * intensity + 50 * (1 - intensity));
                b = Math.round(113 * intensity);
            } else {
                // 蓝色（对应记录的下）
                r = Math.round(52 * intensity);
                g = Math.round(152 * intensity);
                b = Math.round(219 * intensity + 100 * (1 - intensity));
            }
            
            bar.style.background = `rgb(${r}, ${g}, ${b})`;
        } else {
            // completeCount >= 3时，不显示记录状态，只显示默认灰色
            if (completeCount >= 3) {
                bar.style.background = '#555';
            } else {
                // 恢复记录状态显示
                if (section === 'top' && touchData.top.x !== 0) {
                    bar.style.background = BATTERY_BAR_CONFIG.top.color;
                } else if (section === 'middle' && touchData.middle.x !== 0) {
                    bar.style.background = BATTERY_BAR_CONFIG.middle.color;
                } else if (section === 'bottom' && touchData.bottom.x !== 0) {
                    bar.style.background = BATTERY_BAR_CONFIG.bottom.color;
                } else {
                    bar.style.background = '#555';
                }
            }
        }
    });
}

// 调整"中"的范围（长按压超过3秒后调用）
function adjustMiddleRange(touch) {
    console.log('adjustMiddleRange 开始执行，touch:', touch);
    
    let stats = getStatsAverage();
    console.log('stats:', stats);
    console.log('stats.top.y:', stats.top.y);
    console.log('stats.bottom.y:', stats.bottom.y);
    
    // 检查统计数据是否完整，如果不完整，使用当前的touchData
    if (stats.top.y === 0 || stats.bottom.y === 0) {
        console.log('统计数据不完整，使用当前touchData');
        stats = {
            top: { ...touchData.top },
            middle: { ...touchData.middle },
            bottom: { ...touchData.bottom }
        };
        
        // 如果touchData也不完整，返回
        if (stats.top.y === 0 || stats.bottom.y === 0) {
            console.log('当前touchData也不完整，无法调整');
            return;
        }
    }
    
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) {
        console.log('gameContainer 不存在');
        return;
    }
    
    const rect = gameContainer.getBoundingClientRect();
    const containerHeight = gameContainer.clientHeight;
    const originalX = touch.clientX - rect.left;
    const originalY = touch.clientY - rect.top;
    const mirrorX = originalX; // X坐标不需要镜像
    const mirrorY = containerHeight - originalY; // Y坐标镜像
    const relativeY = mirrorY;
    console.log('mirrorX:', mirrorX, 'mirrorY:', mirrorY);
    console.log('relativeY (镜像后):', relativeY);
    
    // 计算按压位置在统计范围内的位置 (0-1)
    let totalRange = Math.abs(stats.bottom.y - stats.top.y);
    console.log('totalRange:', totalRange);
    if (totalRange <= 0) {
        console.log('totalRange <= 0，使用默认范围 100');
        totalRange = 100; // 使用一个小的默认范围
    }
    
    // 确定哪个是上，哪个是下
    const minY = Math.min(stats.top.y, stats.bottom.y);
    const maxY = Math.max(stats.top.y, stats.bottom.y);
    
    let position;
    if (totalRange === 100) {
        // 如果使用了默认范围，直接使用相对位置的比例
        position = 0.5; // 默认在中间
    } else {
        position = (relativeY - minY) / totalRange;
        position = Math.max(0, Math.min(1, position));
    }
    console.log('position:', position);
    
    // 反转位置，让上下对应
    position = 1 - position;
    console.log('position (反转后):', position);
    
    // 记录"中"的数据：更新圆心位置为当前按压的位置
    // 使用镜像后的坐标
    touchData.middle.x = Math.round(mirrorX);
    touchData.middle.y = Math.round(mirrorY);
    touchData.middle.radius = 50;
    touchData.middle.width = 150;
    touchData.middle.height = 100;
    console.log('记录新的"中"的数据:', touchData.middle);
    
    // 更新数据显示
    updateDataDisplay();
    
    // 更新所有统计数据中的"中"的数据
    allTouchData.forEach(record => {
        record.middle.x = touchData.middle.x;
        record.middle.y = touchData.middle.y;
        record.middle.radius = touchData.middle.radius;
        record.middle.width = touchData.middle.width;
        record.middle.height = touchData.middle.height;
    });
    console.log('已更新所有统计数据中的"中"的数据');
    
    // 更新统计面板显示
    updateStatsPanel();
    
    // 根据按压位置调整"中"的范围
    // "中"至少占 50%
    const minMiddleRange = 0.5;
    
    if (position < 0.5) {
        // 中偏上，向上扩展
        middleRangeStart = Math.max(0.1, position - 0.25);
        middleRangeEnd = middleRangeStart + minMiddleRange;
        middleRangeEnd = Math.min(0.9, middleRangeEnd);
    } else {
        // 中偏下，向下扩展
        middleRangeEnd = Math.min(0.9, position + 0.25);
        middleRangeStart = middleRangeEnd - minMiddleRange;
        middleRangeStart = Math.max(0.1, middleRangeStart);
    }
    
    console.log('========================================');
    console.log('长按压超过3秒，调整"中"的范围');
    console.log('按压位置:', position.toFixed(2));
    console.log('新的"中"范围:', middleRangeStart.toFixed(2), '-', middleRangeEnd.toFixed(2));
    console.log('========================================');
    
    // 电量条闪烁提示
    const batteryBar = document.querySelector('.battery-bar');
    if (batteryBar) {
        batteryBar.style.boxShadow = '0 0 20px #ffff00, 0 0 40px #ffff00';
        setTimeout(() => {
            batteryBar.style.boxShadow = 'none';
            batteryBar.style.border = 'none';
        }, 500);
    }
}

// 判断触摸位置是否在绘制范围附近
function isNearDrawArea(mirrorX, mirrorY) {
    const stats = getStatsAverage();
    const areas = [
        stats.top,
        stats.middle,
        stats.bottom
    ];
    
    const distanceThreshold = 100; // 100像素范围内
    
    for (const area of areas) {
        if (area.x === 0 && area.y === 0) {
            continue; // 跳过未记录的区域
        }
        
        // 计算到区域中心的距离
        const dx = mirrorX - area.x;
        const dy = mirrorY - area.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // 计算椭圆内的距离
        const width = area.width || 100;
        const height = area.height || 100;
        const normalizedDx = dx / (width / 2);
        const normalizedDy = dy / (height / 2);
        const normalizedDistance = Math.sqrt(normalizedDx * normalizedDx + normalizedDy * normalizedDy);
        
        if (distance <= distanceThreshold || normalizedDistance <= 1.5) {
            return true;
        }
    }
    
    return false;
}

// 更新仪表盘数值（平滑动画）
function updateDashboardValue() {
    const dashboardEl = document.querySelector('.dashboard-value');
    if (!dashboardEl) return;
    
    // 计算差值，平滑过渡
    const diff = targetDashboardValue - dashboardValue;
    if (Math.abs(diff) < 0.1) {
        // 差值很小，直接设置
        dashboardValue = targetDashboardValue;
        dashboardEl.textContent = Math.round(dashboardValue);
        dashboardAnimationId = null;
        return;
    }
    
    // 快速平滑过渡（每次移动差值的20%）
    dashboardValue += diff * 0.2;
    dashboardEl.textContent = Math.round(dashboardValue);
    
    // 继续动画
    dashboardAnimationId = requestAnimationFrame(updateDashboardValue);
}

// 根据触摸位置计算仪表盘数值
function calculateDashboardValue(mirrorY) {
    const stats = getStatsAverage();
    
    // 获取上、中、下的位置
    const bottomY = stats.bottom.y;
    const middleY = stats.middle.y;
    const topY = stats.top.y;
    
    // 确定范围边界
    const minY = Math.min(bottomY, middleY, topY);
    const maxY = Math.max(bottomY, middleY, topY);
    const totalRange = maxY - minY;
    
    if (totalRange <= 0) {
        return DASHBOARD_MAX_VALUE / 2; // 默认中间值
    }
    
    // 计算触摸位置在整个范围内的比例 (0-1)
    let position = (mirrorY - minY) / totalRange;
    position = Math.max(0, Math.min(1, position));
    
    // 映射到 0-300 - 不反转，直接下对应0，上对应300
    return position * DASHBOARD_MAX_VALUE;
}

// 游戏初始化
function initGame() {
    console.log('游戏初始化完成');
    initBatteryBar();
    
    // 初始化仪表盘显示0
    dashboardValue = 0;
    targetDashboardValue = 0;
    const dashboardEl = document.querySelector('.dashboard-value');
    if (dashboardEl) {
        dashboardEl.textContent = '0';
    }
    
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
            showStatsTouchArea('top', touchAreaTop, touchAreaMiddle, touchAreaBottom);
            updateStatsDisplayText('top', textTop, textMiddle, textBottom);
        };
    }
    if (btnMiddle) {
        btnMiddle.onclick = function() {
            console.log('点击了中按钮');
            showStatsTouchArea('middle', touchAreaTop, touchAreaMiddle, touchAreaBottom);
            updateStatsDisplayText('middle', textTop, textMiddle, textBottom);
        };
    }
    if (btnBottom) {
        btnBottom.onclick = function() {
            console.log('点击了下按钮');
            showStatsTouchArea('bottom', touchAreaTop, touchAreaMiddle, touchAreaBottom);
            updateStatsDisplayText('bottom', textTop, textMiddle, textBottom);
        };
    }
    
    // 重置统计按钮事件 - 只清空统计数据，不清空当前记录
    const clearBtn = document.getElementById('clear-btn');
    if (clearBtn) {
        clearBtn.onclick = function() {
            console.log('点击了重置统计按钮');
            // 只清空统计数据
            allTouchData.length = 0; // 清空统计数据
            lastBottomX = 0;
            lastBottomY = 0;
            
            // 重置"中"范围调整状态
            middleRangeAdjusted = false;
            middleRangeStart = 0.33;
            middleRangeEnd = 0.66;
            
            // 清除保存的统计数据
            clearSavedData();
            
            // 更新统计面板为0
            updateStatsPanel();
            initBatteryBar(); // 重置电量条
            
            // 恢复电量条边框样式
            const batteryBar = document.querySelector('.battery-bar');
            if (batteryBar) {
                batteryBar.style.boxShadow = 'none';
                batteryBar.style.border = 'none';
            }
            
            // 重置仪表盘显示0
            dashboardValue = 0;
            targetDashboardValue = 0;
            const dashboardEl = document.querySelector('.dashboard-value');
            if (dashboardEl) {
                dashboardEl.textContent = '0';
            }
            
            console.log('统计数据已重置为0');
        };
    }
    
    // 重置记录按钮事件
    const resetRecordBtn = document.getElementById('reset-record-btn');
    if (resetRecordBtn) {
        resetRecordBtn.onclick = function() {
            console.log('点击了重置记录按钮');
            // 重置所有数据
            touchData.top.x = 0;
            touchData.top.y = 0;
            touchData.middle.x = 0;
            touchData.middle.y = 0;
            touchData.bottom.x = 0;
            touchData.bottom.y = 0;
            touchCount = 0;
            lastBottomX = 0;
            lastBottomY = 0;
            allTouchData.length = 0; // 清空统计数据
            completeCount = 0;
            
            // 重置"中"范围调整状态
            middleRangeAdjusted = false;
            middleRangeStart = 0.33;
            middleRangeEnd = 0.66;
            
            // 清除保存的统计数据
            clearSavedData();
            
            // 清除显示
            clearTouchAreas(touchAreaTop, touchAreaMiddle, touchAreaBottom);
            clearDisplayText(textTop, textMiddle, textBottom);
            updateDataDisplay();
            updateStatsPanel();
            initBatteryBar(); // 重置电量条
            
            // 恢复电量条边框样式
            const batteryBar = document.querySelector('.battery-bar');
            if (batteryBar) {
                batteryBar.style.boxShadow = 'none';
                batteryBar.style.border = 'none';
            }
            
            // 更新完成计数器
            const completeCounter = document.getElementById('complete-counter');
            completeCounter.textContent = completeCount;
            
            // 重置仪表盘显示0
            dashboardValue = 0;
            targetDashboardValue = 0;
            const dashboardEl = document.querySelector('.dashboard-value');
            if (dashboardEl) {
                dashboardEl.textContent = '0';
            }
            
            console.log('所有数据已重置，可以重新开始记录');
        };
    }
    
    setupTouchListeners();
    setupDashboardListeners();
    startStopwatch();
    // 初始化数据显示
    updateDataDisplay();
}



// 存储触摸位置数据
const touchData = {
    bottom: { x: 0, y: 0, radius: 50, width: 100, height: 100 },
    middle: { x: 0, y: 0, radius: 50, width: 200, height: 100 },
    top: { x: 0, y: 0, radius: 50, width: 100, height: 100 }
};

// 存储所有记录的数据
const allTouchData = [];
// 记录上一次"下"的数据，用来检测变化
let lastBottomX = 0;
let lastBottomY = 0;
// 电量条竖杠数量
const BATTERY_BAR_COUNT = 20;
// 是否已调整过"中"的范围
let middleRangeAdjusted = false;
// 调整后的阈值（默认是0.33-0.66，调整后是0.2-0.8）
let middleRangeStart = 0.33;
let middleRangeEnd = 0.66;
// 长按压3秒的计时器
let longPressTimer = null;
// 长按压开始时间
let longPressStartTime = 0;

// 触摸计时器
let touchTimer = null;
let currentTouch = null;
// 长按计数器，用于记录第几次长按
let touchCount = 0;
// 记录完成次数（上中下都有值）
let completeCount = 0;

// 仪表盘数值相关
let dashboardValue = 0; // 当前仪表盘显示的数值
let targetDashboardValue = 0; // 目标数值
let dashboardAnimationId = null; // 动画requestId
const DASHBOARD_MAX_VALUE = 300; // 仪表盘最大值

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
        if (!stopwatchRunning && completeCount < 4) {
            resetStopwatch();
            stopwatchRunning = true;
            stopwatchInterval = setInterval(() => {
                stopwatchMilliseconds += 10;
                if (stopwatchMilliseconds >= 1000) {
                    stopwatchMilliseconds = 0;
                    stopwatchSeconds += 1;
                }
                
                const totalSeconds = stopwatchSeconds + (stopwatchMilliseconds / 1000);
                // 只有 completeCount <4 时才显示秒数
                if (completeCount < 4) {
                    document.querySelector('.dashboard-value').textContent = totalSeconds.toFixed(2);
                }
            }, 10);
        }
        
        // 开始计时（1秒记录数据）
        if (completeCount < 3) {
            touchTimer = setTimeout(() => {
                // 超过1秒，记录数据
                recordTouchData(currentTouch);
                // 记录完成后停止计时
                stopStopwatch();
            }, 1000);
        } else if (completeCount === 3) {
            // 当completeCount=3时，3秒后自动停止计时
            longPressTimer = setTimeout(() => {
                stopStopwatch();
            }, 3000);
        }
    });
    
    // 触摸移动事件（添加节流，减少更新频率）
    let lastUpdateTime = 0;
    gameContainer.addEventListener('touchmove', (e) => {
        if (e.target.closest('button')) {
            return;
        }
        
        const now = Date.now();
        if (now - lastUpdateTime < 16) {
            return;
        }
        lastUpdateTime = now;
        
        currentTouch = e.touches[0];
        updateTouchInfo(currentTouch, touchArea);
        
        // 实时更新电量条（completeCount达到4后才启用）
        if (completeCount >= 4) {
            const gameContainer = document.querySelector('.game-container');
            const containerHeight = gameContainer.clientHeight;
            const rect = gameContainer.getBoundingClientRect();
            const mirrorX = currentTouch.clientX - rect.left;
            const mirrorY = containerHeight - currentTouch.clientY;
            
            // 只有在绘制范围附近100像素内才更新
            if (isNearDrawArea(mirrorX, mirrorY)) {
                updateBatteryBar(mirrorY);
                
                // 更新仪表盘数值
                targetDashboardValue = calculateDashboardValue(mirrorY);
                if (!dashboardAnimationId) {
                    updateDashboardValue();
                }
            }
        }
    });
    
    // 触摸结束事件
    gameContainer.addEventListener('touchend', () => {
        touchInfo.textContent = '触摸位置: (0, 0)';
        touchArea.style.opacity = '0';
        
        // 停止计时并显示最终时间
        stopStopwatch();
        
        // 清除计时器
        clearTimeout(touchTimer);
        clearTimeout(longPressTimer);
        currentTouch = null;
        
        // completeCount >=4 时，仪表盘数值回落到0，电量条也清空
        if (completeCount >= 4) {
            targetDashboardValue = 0;
            if (!dashboardAnimationId) {
                updateDashboardValue();
            }
            // 清空电量条
            const bars = document.querySelectorAll('.battery-bar-item');
            bars.forEach(bar => {
                bar.style.background = '#555';
            });
        }
    });
    
    // 鼠标点击事件（用于桌面测试）
    gameContainer.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) {
            return;
        }
        currentTouch = e;
        updateTouchInfo(e, touchArea);
        
        // 开始计时
        if (!stopwatchRunning && completeCount < 4) {
            resetStopwatch();
            stopwatchRunning = true;
            stopwatchInterval = setInterval(() => {
                stopwatchMilliseconds += 10;
                if (stopwatchMilliseconds >= 1000) {
                    stopwatchMilliseconds = 0;
                    stopwatchSeconds += 1;
                }
                
                const totalSeconds = stopwatchSeconds + (stopwatchMilliseconds / 1000);
                // 只有 completeCount <4 时才显示秒数
                if (completeCount < 4) {
                    document.querySelector('.dashboard-value').textContent = totalSeconds.toFixed(2);
                }
            }, 10);
        }
        
        // 开始计时（1秒记录数据）
        if (completeCount < 3) {
            touchTimer = setTimeout(() => {
                // 超过1秒，记录数据
                recordTouchData(e);
                // 记录完成后停止计时
                stopStopwatch();
            }, 1000);
        } else if (completeCount === 3) {
            // 当completeCount=3时，3秒后自动停止计时
            longPressTimer = setTimeout(() => {
                stopStopwatch();
            }, 3000);
        }
    });
    
    // 鼠标移动事件（添加节流，减少更新频率）
    let lastMouseMoveTime = 0;
    gameContainer.addEventListener('mousemove', (e) => {
        const now = Date.now();
        if (now - lastMouseMoveTime < 16) {
            return;
        }
        lastMouseMoveTime = now;
        
        currentTouch = e;
        updateTouchInfo(e, touchArea);
        
        // 实时更新电量条（completeCount达到4后才启用）
        if (completeCount >= 4) {
            const gameContainer = document.querySelector('.game-container');
            const containerHeight = gameContainer.clientHeight;
            const rect = gameContainer.getBoundingClientRect();
            const mirrorX = e.clientX - rect.left;
            const mirrorY = containerHeight - e.clientY;
            
            // 只有在绘制范围附近100像素内才更新
            if (isNearDrawArea(mirrorX, mirrorY)) {
                updateBatteryBar(mirrorY);
                
                // 更新仪表盘数值
                targetDashboardValue = calculateDashboardValue(mirrorY);
                if (!dashboardAnimationId) {
                    updateDashboardValue();
                }
            }
        }
    });
    
    gameContainer.addEventListener('mouseup', () => {
        touchInfo.textContent = '触摸位置: (0, 0)';
        touchArea.style.opacity = '0';
        
        // 停止计时并显示最终时间
        stopStopwatch();
        
        // 清除计时器
        clearTimeout(touchTimer);
        clearTimeout(longPressTimer);
        currentTouch = null;
        
        // completeCount >=4 时，仪表盘数值回落到0，电量条也清空
        if (completeCount >= 4) {
            targetDashboardValue = 0;
            if (!dashboardAnimationId) {
                updateDashboardValue();
            }
            // 清空电量条
            const bars = document.querySelectorAll('.battery-bar-item');
            bars.forEach(bar => {
                bar.style.background = '#555';
            });
        }
    });
}

// 记录触摸数据
function recordTouchData(touch) {
    // 使用仪表盘旁边的completeCount来控制记录逻辑
    // completeCount < 3 时正常记录上中下
    // completeCount >= 3 时，不再记录，只等待长按压3秒调整"中"的范围
    
    if (completeCount >= 3) {
        console.log('completeCount >= 3，不再记录数据，只等待长按压3秒调整"中"的范围');
        return;
    }
    
    // 获取容器高度用于镜像坐标
    const gameContainer = document.querySelector('.game-container');
    const containerHeight = gameContainer.clientHeight;
    
    // 镜像坐标：以横向中线为基准翻转
    const mirrorX = Math.round(touch.clientX);
    const originalY = Math.round(touch.clientY);
    const mirrorY = containerHeight - originalY;
    
    // 增加触摸计数
    touchCount++;
    
    // 检查是否所有数据都已记录
    const allDataRecorded = (touchData.top.x !== 0 || touchData.top.y !== 0) && 
                          (touchData.middle.x !== 0 || touchData.middle.y !== 0) && 
                          (touchData.bottom.x !== 0 || touchData.bottom.y !== 0);
    
    // 根据计数决定记录到哪个位置（交换上、下）
    if (touchCount === 1) {
        // 第一次长按，记录到下位置
        touchData.bottom.x = mirrorX;
        touchData.bottom.y = mirrorY;
        touchData.bottom.radius = 50;
        touchData.bottom.width = 100;
        touchData.bottom.height = 100;
        console.log('记录触摸数据到下位置:', touchData.bottom);
    } else if (touchCount === 2) {
        // 第二次长按，记录到中位置
        if (touchData.bottom.x !== 0 || touchData.bottom.y !== 0) {
            touchData.middle.x = mirrorX;
            touchData.middle.y = mirrorY;
            touchData.middle.radius = 50;
            touchData.middle.width = 150;
            touchData.middle.height = 100;
            console.log('记录触摸数据到中位置:', touchData.middle);
        }
    } else if (touchCount === 3) {
        // 第三次长按，记录到上位置
        if ((touchData.bottom.x !== 0 || touchData.bottom.y !== 0) && (touchData.middle.x !== 0 || touchData.middle.y !== 0)) {
            touchData.top.x = mirrorX;
            touchData.top.y = mirrorY;
            touchData.top.radius = 50;
            touchData.top.width = 100;
            touchData.top.height = 100;
            console.log('记录触摸数据到上位置:', touchData.top);
            
            // 第一次三个数据都记录完，completeCount+1
            completeCount++;
            const completeCounter = document.getElementById('complete-counter');
            completeCounter.textContent = completeCount;
            console.log('第一次录入完成，completeCount:', completeCount);
            
            // 存到数组
            saveTouchDataToAll();
            
            // 检查是否达到3次
            if (completeCount >= 3) {
                // 电量条边框变亮，表示统计完成
                const batteryBar = document.querySelector('.battery-bar');
                if (batteryBar) {
                    batteryBar.style.boxShadow = '0 0 10px #00ff00, 0 0 20px #00ff00';
                    batteryBar.style.border = '2px solid #00ff00';
                }
                
                console.log('========================================');
                console.log('统计完成！completeCount = 3');
                console.log('请长按压3秒调整"中"的范围');
                console.log('========================================');
            }
        }
    } else if (touchCount >= 4) {
        // 第四次及以后的按压
        if (allDataRecorded) {
            // 三个都有数据，清空中和上，记录到下
            
            // 存当前这一组数据
            saveTouchDataToAll();
            
            // 清空中和上
            touchData.middle.x = 0;
            touchData.middle.y = 0;
            touchData.top.x = 0;
            touchData.top.y = 0;
            
            // 检查是否达到3次，如果是就不再记录
            if (completeCount >= 3) {
                // 电量条边框变亮，表示统计完成
                const batteryBar = document.querySelector('.battery-bar');
                if (batteryBar) {
                    batteryBar.style.boxShadow = '0 0 10px #00ff00, 0 0 20px #00ff00';
                    batteryBar.style.border = '2px solid #00ff00';
                }
                
                console.log('========================================');
                console.log('统计完成！completeCount = 3');
                console.log('请长按压3秒调整"中"的范围');
                console.log('========================================');
                
                // 不再记录
                return;
            }
            
            // 记录到下
            touchData.bottom.x = mirrorX;
            touchData.bottom.y = mirrorY;
            touchData.bottom.radius = 50;
            touchData.bottom.width = 100;
            touchData.bottom.height = 100;
            console.log('记录触摸数据到下位置:', touchData.bottom);
            
            // 设置触摸计数为1，表示已经记录了下
            touchCount = 1;
        } else if (touchData.bottom.x !== 0 || touchData.bottom.y !== 0) {
            // 只有下有数据，记录到中
            if (touchData.middle.x === 0 && touchData.middle.y === 0) {
                touchData.middle.x = mirrorX;
                touchData.middle.y = mirrorY;
                touchData.middle.radius = 50;
                touchData.middle.width = 150;
                touchData.middle.height = 100;
                console.log('记录触摸数据到中位置:', touchData.middle);
            } else if (touchData.top.x === 0 && touchData.top.y === 0) {
                // 下中有数据，记录到上
                touchData.top.x = mirrorX;
                touchData.top.y = mirrorY;
                touchData.top.radius = 50;
                touchData.top.width = 100;
                touchData.top.height = 100;
                console.log('记录触摸数据到上位置:', touchData.top);
                
                // 三个数据又记录完，completeCount+1
                completeCount++;
                const completeCounter = document.getElementById('complete-counter');
                completeCounter.textContent = completeCount;
                console.log('录入完成，completeCount:', completeCount);
                
                // 存到数组
                saveTouchDataToAll();
            }
        }
    }
    
    updateDataDisplay();
    updateBatteryBarRecordStatus(); // 更新电量条记录状态
}

// 保存当前触摸数据到allTouchData数组（每次"下"值变化时触发，最多3次）
function saveTouchDataToAll() {
    // 如果completeCount已经达到3，不再保存数据
    if (completeCount >= 3) {
        console.log('completeCount >= 3，不再保存数据');
        return;
    }
    
    const currentBottomX = touchData.bottom.x;
    const currentBottomY = touchData.bottom.y;
    const currentBottomHasValue = (currentBottomX !== 0 || currentBottomY !== 0);
    
    // 只有当"下"有值且和上次不一样时才保存
    if (currentBottomHasValue && (currentBottomX !== lastBottomX || currentBottomY !== lastBottomY)) {
        const record = {
            timestamp: Date.now(),
            top: { ...touchData.top },
            middle: { ...touchData.middle },
            bottom: { ...touchData.bottom }
        };
        
        allTouchData.push(record);
        console.log('========================================');
        console.log('新记录已保存！总记录数:', allTouchData.length);
        console.log('当前记录:', record);
        console.log('所有记录:', allTouchData);
        console.log('========================================');
        
        // 更新统计面板
        updateStatsPanel();
        
        // 检查是否达到3次
            if (allTouchData.length >= 3) {
                // 电量条边框变亮，表示已锁定
                const batteryBar = document.querySelector('.battery-bar');
                if (batteryBar) {
                    batteryBar.style.boxShadow = '0 0 10px #00ff00, 0 0 20px #00ff00';
                    batteryBar.style.border = '2px solid #00ff00';
                }
                console.log('========================================');
                console.log('统计已达到3次！记录区域停止记录');
                console.log('========================================');
                
                // 保存统计数据到localStorage
                saveStatsData();
            }
    }
    
    // 更新状态
    lastBottomX = currentBottomX;
    lastBottomY = currentBottomY;
}

// 获取统计平均值
function getStatsAverage() {
    const count = allTouchData.length;
    
    if (count === 0) {
        return {
            top: { x: 0, y: 0, radius: 50, width: 100, height: 100 },
            middle: { x: 0, y: 0, radius: 50, width: 150, height: 100 },
            bottom: { x: 0, y: 0, radius: 50, width: 100, height: 100 }
        };
    }
    
    // 计算平均值
    let sumTopX = 0, sumTopY = 0, sumTopR = 0, sumTopW = 0, sumTopH = 0;
    let sumMiddleX = 0, sumMiddleY = 0, sumMiddleR = 0, sumMiddleW = 0, sumMiddleH = 0;
    let sumBottomX = 0, sumBottomY = 0, sumBottomR = 0, sumBottomW = 0, sumBottomH = 0;
    
    allTouchData.forEach(record => {
        sumTopX += record.top.x;
        sumTopY += record.top.y;
        sumTopR += record.top.radius;
        sumTopW += record.top.width || 100;
        sumTopH += record.top.height || 100;
        
        sumMiddleX += record.middle.x;
        sumMiddleY += record.middle.y;
        sumMiddleR += record.middle.radius;
        sumMiddleW += record.middle.width || 200;
        sumMiddleH += record.middle.height || 100;
        
        sumBottomX += record.bottom.x;
        sumBottomY += record.bottom.y;
        sumBottomR += record.bottom.radius;
        sumBottomW += record.bottom.width || 100;
        sumBottomH += record.bottom.height || 100;
    });
    
    return {
        top: {
            x: Math.round(sumTopX / count),
            y: Math.round(sumTopY / count),
            radius: Math.round(sumTopR / count),
            width: Math.round(sumTopW / count),
            height: Math.round(sumTopH / count)
        },
        middle: {
            x: Math.round(sumMiddleX / count),
            y: Math.round(sumMiddleY / count),
            radius: Math.round(sumMiddleR / count),
            width: Math.round(sumMiddleW / count),
            height: Math.round(sumMiddleH / count)
        },
        bottom: {
            x: Math.round(sumBottomX / count),
            y: Math.round(sumBottomY / count),
            radius: Math.round(sumBottomR / count),
            width: Math.round(sumBottomW / count),
            height: Math.round(sumBottomH / count)
        }
    };
}

// 更新统计面板
function updateStatsPanel() {
    const count = allTouchData.length;
    
    // 更新记录次数
    const statCount = document.getElementById('stat-count');
    if (statCount) {
        statCount.textContent = count;
    }
    
    if (count === 0) {
        return;
    }
    
    const stats = getStatsAverage();
    
    // 更新上的平均值
    const statTopX = document.getElementById('stat-top-x');
    const statTopY = document.getElementById('stat-top-y');
    const statTopR = document.getElementById('stat-top-r');
    if (statTopX) statTopX.textContent = stats.top.x;
    if (statTopY) statTopY.textContent = stats.top.y;
    if (statTopR) statTopR.textContent = stats.top.radius;
    
    // 更新中的平均值
    const statMiddleX = document.getElementById('stat-middle-x');
    const statMiddleY = document.getElementById('stat-middle-y');
    const statMiddleR = document.getElementById('stat-middle-r');
    if (statMiddleX) statMiddleX.textContent = stats.middle.x;
    if (statMiddleY) statMiddleY.textContent = stats.middle.y;
    if (statMiddleR) statMiddleR.textContent = stats.middle.radius;
    
    // 更新下的平均值
    const statBottomX = document.getElementById('stat-bottom-x');
    const statBottomY = document.getElementById('stat-bottom-y');
    const statBottomR = document.getElementById('stat-bottom-r');
    if (statBottomX) statBottomX.textContent = stats.bottom.x;
    if (statBottomY) statBottomY.textContent = stats.bottom.y;
    if (statBottomR) statBottomR.textContent = stats.bottom.radius;
}

// 更新数据显示
function updateDataDisplay() {
    if (touchData.top.x !== 0 || touchData.top.y !== 0) {
        document.getElementById('data-top').textContent = `圆心: (${touchData.top.x}, ${touchData.top.y}), 半径: ${touchData.top.radius}, 尺寸: ${touchData.top.width}x${touchData.top.height}`;
    } else {
        document.getElementById('data-top').textContent = '0';
    }
    
    if (touchData.middle.x !== 0 || touchData.middle.y !== 0) {
        document.getElementById('data-middle').textContent = `圆心: (${touchData.middle.x}, ${touchData.middle.y}), 半径: ${touchData.middle.radius}, 尺寸: ${touchData.middle.width}x${touchData.middle.height}`;
    } else {
        document.getElementById('data-middle').textContent = '0';
    }
    
    if (touchData.bottom.x !== 0 || touchData.bottom.y !== 0) {
        document.getElementById('data-bottom').textContent = `圆心: (${touchData.bottom.x}, ${touchData.bottom.y}), 半径: ${touchData.bottom.radius}, 尺寸: ${touchData.bottom.width}x${touchData.bottom.height}`;
    } else {
        document.getElementById('data-bottom').textContent = '0';
    }
}

// 更新触摸信息和显示触摸区域
function updateTouchInfo(touch, touchArea) {
    const touchInfo = document.querySelector('.touch-info');
    
    // 直接使用触摸坐标，不做镜像
    const x = Math.round(touch.clientX);
    const y = Math.round(touch.clientY);
    
    // 触摸位置只显示黑条，不要文字
    touchInfo.textContent = '';
    
    // 显示触摸区域（直接使用触摸坐标，不做镜像）
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

// 显示统计平均值的触摸区域
function showStatsTouchArea(position, touchAreaTop, touchAreaMiddle, touchAreaBottom) {
    const stats = getStatsAverage();
    const data = stats[position];
    console.log(`显示${position}位置的统计平均值，数据:`, data);
    
    // 判断是否有数据
    if (data.x === 0 && data.y === 0) {
        console.log(`${position}位置没有统计数据`);
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
        console.log(`${position}统计平均值触摸区域设置完成`);
    }
}

// 更新显示统计平均值文本
function updateStatsDisplayText(position, textTop, textMiddle, textBottom) {
    const stats = getStatsAverage();
    const data = stats[position];
    
    let targetText;
    if (position === 'top') {
        targetText = textTop;
    } else if (position === 'middle') {
        targetText = textMiddle;
    } else if (position === 'bottom') {
        targetText = textBottom;
    }
    
    if (targetText) {
        if (data.x !== 0 || data.y !== 0) {
            targetText.textContent = `圆心: (${data.x}, ${data.y})\n半径: ${data.radius}`;
            console.log(`${position}统计平均值文本设置完成`);
        } else {
            targetText.textContent = '';
        }
    }
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
    
    // 显示最终时间（秒）- 只有 completeCount <4 时才显示
    const totalSeconds = stopwatchSeconds + (stopwatchMilliseconds / 1000);
    if (completeCount < 4) {
        dashboardValue.textContent = totalSeconds.toFixed(2);
    }
    
    console.log('stopStopwatch 被调用，completeCount:', completeCount, 'totalSeconds:', totalSeconds, 'currentTouch:', currentTouch ? '存在' : '不存在');
    
    // 当completeCount=3且计时达到3秒时，调整"中"的范围
    if (completeCount === 3 && totalSeconds >= 3 && currentTouch) {
        console.log('计时达到3秒，调整"中"的范围');
        adjustMiddleRange(currentTouch);
        // 将completeCount增加到4，避免再次触发
        completeCount = 4;
        const completeCounter = document.getElementById('complete-counter');
        completeCounter.textContent = completeCount;
        // 绘制按压区域
        drawPressAreas();
    }
}

// 保存统计数据到localStorage
function saveStatsData() {
    if (allTouchData.length >= 3) {
        const stats = getStatsAverage();
        const savedData = {
            stats: stats,
            allTouchData: allTouchData,
            completeCount: completeCount
        };
        localStorage.setItem('gameStats', JSON.stringify(savedData));
        console.log('统计数据已保存到localStorage');
    }
}

// 从localStorage加载统计数据
function loadSavedData() {
    const savedData = localStorage.getItem('gameStats');
    if (savedData) {
        try {
            const parsedData = JSON.parse(savedData);
            if (parsedData.stats && parsedData.allTouchData) {
                // 加载统计数据
                allTouchData = parsedData.allTouchData;
                completeCount = parsedData.completeCount || 3;
                
                // 更新UI
                const completeCounter = document.getElementById('complete-counter');
                completeCounter.textContent = completeCount;
                
                // 更新统计面板
                updateStatsPanel();
                
                // 如果 completeCount >= 4，绘制按压区域
                if (completeCount >= 4) {
                    drawPressAreas();
                }
                
                // 激活电量条
                const batteryBar = document.querySelector('.battery-bar');
                if (batteryBar) {
                    batteryBar.style.boxShadow = '0 0 10px #00ff00, 0 0 20px #00ff00';
                    batteryBar.style.border = '2px solid #00ff00';
                }
                
                console.log('从localStorage加载了统计数据');
            }
        } catch (error) {
            console.error('加载保存数据失败:', error);
        }
    }
}

// 清除保存的统计数据
function clearSavedData() {
    localStorage.removeItem('gameStats');
    console.log('已清除保存的统计数据');
}

// 设置仪表盘监听器（长按重置）
function setupDashboardListeners() {
    const dashboard = document.querySelector('.dashboard');
    if (!dashboard) return;
    
    let dashboardLongPressTimer = null;
    const dashboardLongPressDuration = 3000; // 3秒
    
    // 鼠标按下事件
    dashboard.addEventListener('mousedown', () => {
        console.log('仪表盘被按下');
        dashboardLongPressTimer = setTimeout(() => {
            console.log('长按仪表盘超过3秒，重置所有数据');
            resetAllData();
        }, dashboardLongPressDuration);
    });
    
    // 鼠标释放事件
    dashboard.addEventListener('mouseup', () => {
        clearTimeout(dashboardLongPressTimer);
    });
    
    // 鼠标离开事件
    dashboard.addEventListener('mouseleave', () => {
        clearTimeout(dashboardLongPressTimer);
    });
    
    // 触摸开始事件
    dashboard.addEventListener('touchstart', (e) => {
        e.stopPropagation(); // 阻止事件冒泡
        console.log('仪表盘被触摸');
        dashboardLongPressTimer = setTimeout(() => {
            console.log('长按仪表盘超过3秒，重置所有数据');
            resetAllData();
        }, dashboardLongPressDuration);
    });
    
    // 触摸结束事件
    dashboard.addEventListener('touchend', () => {
        clearTimeout(dashboardLongPressTimer);
    });
}

// 重置所有数据
function resetAllData() {
    // 重置所有数据
    touchData.top.x = 0;
    touchData.top.y = 0;
    touchData.middle.x = 0;
    touchData.middle.y = 0;
    touchData.bottom.x = 0;
    touchData.bottom.y = 0;
    touchCount = 0;
    completeCount = 0;
    lastBottomX = 0;
    lastBottomY = 0;
    allTouchData.length = 0; // 清空统计数据
    
    // 重置"中"范围调整状态
    middleRangeAdjusted = false;
    middleRangeStart = 0.33;
    middleRangeEnd = 0.66;
    
    // 清除保存的统计数据
    clearSavedData();
    
    // 清除显示
    const touchAreaTop = document.querySelector('.touch-area-top');
    const touchAreaMiddle = document.querySelector('.touch-area-middle');
    const touchAreaBottom = document.querySelector('.touch-area-bottom');
    const textTop = document.getElementById('text-top');
    const textMiddle = document.getElementById('text-middle');
    const textBottom = document.getElementById('text-bottom');
    
    clearTouchAreas(touchAreaTop, touchAreaMiddle, touchAreaBottom);
    clearDisplayText(textTop, textMiddle, textBottom);
    updateDataDisplay();
    updateStatsPanel();
    initBatteryBar(); // 重置电量条
    
    // 清除按压区域
    clearPressAreas();
    
    // 恢复电量条边框样式
    const batteryBar = document.querySelector('.battery-bar');
    if (batteryBar) {
        batteryBar.style.boxShadow = 'none';
        batteryBar.style.border = 'none';
    }
    
    // 更新完成计数器
    const completeCounter = document.getElementById('complete-counter');
    completeCounter.textContent = completeCount;
    
    // 重置秒表
    resetStopwatch();
    
    console.log('所有数据已重置，可以重新开始记录');
}

// 绘制按压区域
function drawPressAreas() {
    const stats = getStatsAverage();
    if (stats.top.y === 0 || stats.bottom.y === 0 || stats.middle.y === 0) {
        console.log('统计数据不完整，无法绘制按压区域');
        return;
    }
    
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    // 获取容器高度，用于反转镜像坐标
    const containerHeight = gameContainer.clientHeight;
    
    // 先清除现有的按压区域
    clearPressAreas();
    
    // 反转镜像坐标
    const reversedBottom = {
        x: stats.bottom.x,
        y: containerHeight - stats.bottom.y,
        radius: stats.bottom.radius,
        width: stats.bottom.width,
        height: stats.bottom.height
    };
    
    const reversedMiddle = {
        x: stats.middle.x,
        y: containerHeight - stats.middle.y,
        radius: stats.middle.radius,
        width: stats.middle.width,
        height: stats.middle.height
    };
    
    const reversedTop = {
        x: stats.top.x,
        y: containerHeight - stats.top.y,
        radius: stats.top.radius,
        width: stats.top.width,
        height: stats.top.height
    };
    
    // 绘制下区域（黑色）
    createPressArea(gameContainer, reversedBottom, '#000000', '下');
    
    // 绘制中区域（绿色）
    createPressArea(gameContainer, reversedMiddle, '#2ecc71', '中');
    
    // 绘制上区域（红色）
    createPressArea(gameContainer, reversedTop, '#e74c3c', '上');
    
    console.log('按压区域已绘制');
}

// 创建单个按压区域
function createPressArea(container, position, color, label) {
    const area = document.createElement('div');
    area.className = 'press-area';
    
    // 使用记录的 width 和 height
    const width = position.width || 100;
    const height = position.height || 100;
    
    area.style.cssText = `
        position: absolute;
        width: ${width}px;
        height: ${height}px;
        border: 3px solid ${color};
        border-radius: 50%;
        background-color: transparent;
        transform: translate(-50%, -50%);
        left: ${position.x}px;
        top: ${position.y}px;
        z-index: 20;
        pointer-events: none;
    `;
    
    // 添加标签
    const labelEl = document.createElement('div');
    labelEl.style.cssText = `
        position: absolute;
        top: -30px;
        left: 50%;
        transform: translateX(-50%);
        color: ${color};
        font-size: 1.2rem;
        font-weight: bold;
        text-shadow: 0 0 5px rgba(0,0,0,0.8);
    `;
    labelEl.textContent = label;
    area.appendChild(labelEl);
    
    container.appendChild(area);
}

// 清除按压区域
function clearPressAreas() {
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    const areas = gameContainer.querySelectorAll('.press-area');
    areas.forEach(area => area.remove());
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', initGame);



