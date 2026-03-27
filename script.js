// 初始化电量条
function initBatteryBar() {
    const batteryBars = document.getElementById('battery-bars');
    if (!batteryBars) return;
    
    batteryBars.innerHTML = '';
    
    for (let i = 0; i < BATTERY_BAR_COUNT; i++) {
        const bar = document.createElement('div');
        bar.className = 'battery-bar-item';
        bar.style.cssText = `
            flex: 1;
            height: 70%;
            margin: 0 2px;
            background: #555;
            border-radius: 2px;
            transition: background 0.1s;
        `;
        bar.dataset.index = i;
        batteryBars.appendChild(bar);
    }
}

// 更新电量条显示
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
    const totalRange = stats.bottom.y - stats.top.y;
    if (totalRange <= 0) return;
    
    let position = (relativeY - stats.top.y) / totalRange;
    position = Math.max(0, Math.min(1, position));
    
    // 计算应该点亮哪些竖杠（调换上下：上区域对应右边，下区域对应左边）
    // 如果已调整过"中"的范围，使用新的阈值
    let centerIndex;
    if (middleRangeAdjusted) {
        // 使用调整后的阈值
        // 上区域：0 - middleRangeStart
        // 中区域：middleRangeStart - middleRangeEnd
        // 下区域：middleRangeEnd - 1
        if (position < middleRangeStart) {
            // 上区域，映射到右边的竖杠
            centerIndex = Math.round((1 - (position / middleRangeStart) * 0.2) * (BATTERY_BAR_COUNT - 1));
        } else if (position > middleRangeEnd) {
            // 下区域，映射到左边的竖杠
            centerIndex = Math.round((1 - 0.8 - ((position - middleRangeEnd) / (1 - middleRangeEnd)) * 0.2) * (BATTERY_BAR_COUNT - 1));
        } else {
            // 中区域，映射到中间的竖杠
            const middlePosition = (position - middleRangeStart) / (middleRangeEnd - middleRangeStart);
            centerIndex = Math.round((1 - 0.2 - middlePosition * 0.6) * (BATTERY_BAR_COUNT - 1));
        }
    } else {
        // 使用默认阈值
        centerIndex = Math.round((1 - position) * (BATTERY_BAR_COUNT - 1));
    }
    
    const spread = 3; // 向两边扩散的范围
    
    const bars = document.querySelectorAll('.battery-bar-item');
    bars.forEach((bar, i) => {
        const distance = Math.abs(i - centerIndex);
        if (distance <= spread) {
            const intensity = 1 - (distance / (spread + 1));
            const green = Math.round(255 * intensity);
            bar.style.background = `rgb(0, ${green}, 0)`;
        } else {
            bar.style.background = '#555';
        }
    });
}

// 调整"中"的范围（长按压超过3秒后调用）
function adjustMiddleRange(clientY) {
    if (middleRangeAdjusted) {
        console.log('已经调整过"中"的范围，不再调整');
        return;
    }
    
    const stats = getStatsAverage();
    if (stats.top.y === 0 || stats.bottom.y === 0) {
        console.log('统计数据不完整，无法调整');
        return;
    }
    
    const gameContainer = document.querySelector('.game-container');
    if (!gameContainer) return;
    
    const rect = gameContainer.getBoundingClientRect();
    const relativeY = clientY - rect.top;
    
    // 计算按压位置在统计范围内的位置 (0-1)
    const totalRange = stats.bottom.y - stats.top.y;
    if (totalRange <= 0) return;
    
    let position = (relativeY - stats.top.y) / totalRange;
    position = Math.max(0, Math.min(1, position));
    
    // 根据按压位置调整"中"的范围
    // 如果按压在中偏上（0.2-0.5），中区域向上扩展
    // 如果按压在中偏下（0.5-0.8），中区域向下扩展
    // 如果按压在正中间（0.4-0.6），中区域向两边扩展
    
    if (position < 0.5) {
        // 中偏上，向上扩展
        middleRangeStart = Math.max(0.1, position - 0.15);
        middleRangeEnd = Math.min(0.9, position + 0.35);
    } else {
        // 中偏下，向下扩展
        middleRangeStart = Math.max(0.1, position - 0.35);
        middleRangeEnd = Math.min(0.9, position + 0.15);
    }
    
    middleRangeAdjusted = true;
    
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
            batteryBar.style.boxShadow = '0 0 10px #00ff00, 0 0 20px #00ff00';
        }, 500);
    }
}

// 游戏初始化
function initGame() {
    console.log('游戏初始化完成');
    initBatteryBar();
    
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
            
            // 更新统计面板为0
            updateStatsPanel();
            initBatteryBar(); // 重置电量条
            
            // 恢复电量条边框样式
            const batteryBar = document.querySelector('.battery-bar');
            if (batteryBar) {
                batteryBar.style.boxShadow = 'none';
                batteryBar.style.border = 'none';
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
            
            // 重置"中"范围调整状态
            middleRangeAdjusted = false;
            middleRangeStart = 0.33;
            middleRangeEnd = 0.66;
            
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
            
            console.log('所有数据已重置，可以重新开始记录');
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
        if (!stopwatchRunning && completeCount < 3) {
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
        
        // 开始计时（1秒记录数据）
        touchTimer = setTimeout(() => {
            // 超过1秒，记录数据
            recordTouchData(currentTouch);
        }, 1000);
        
        // 长按压3秒调整"中"的范围（只在completeCount=3且未调整过时生效）
        if (completeCount >= 3 && !middleRangeAdjusted) {
            longPressStartTime = Date.now();
            longPressTimer = setTimeout(() => {
                adjustMiddleRange(currentTouch.clientY);
            }, 3000);
        }
    });
    
    // 触摸移动事件
    gameContainer.addEventListener('touchmove', (e) => {
        if (e.target.closest('button')) {
            return;
        }
        currentTouch = e.touches[0];
        updateTouchInfo(currentTouch, touchArea);
        
        // 实时更新电量条（completeCount达到3后才启用）
        if (completeCount >= 3) {
            updateBatteryBar(currentTouch.clientY);
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
    });
    
    // 鼠标点击事件（用于桌面测试）
    gameContainer.addEventListener('mousedown', (e) => {
        if (e.target.closest('button')) {
            return;
        }
        currentTouch = e;
        updateTouchInfo(e, touchArea);
        
        // 开始计时
        if (!stopwatchRunning && completeCount < 3) {
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
        
        // 开始计时（1秒记录数据）
        touchTimer = setTimeout(() => {
            // 超过1秒，记录数据
            recordTouchData(e);
        }, 1000);
        
        // 长按压3秒调整"中"的范围（只在completeCount=3且未调整过时生效）
        if (completeCount >= 3 && !middleRangeAdjusted) {
            longPressStartTime = Date.now();
            longPressTimer = setTimeout(() => {
                adjustMiddleRange(e.clientY);
            }, 3000);
        }
    });
    
    gameContainer.addEventListener('mousemove', (e) => {
        currentTouch = e;
        updateTouchInfo(e, touchArea);
        
        // 实时更新电量条（completeCount达到3后才启用）
        if (completeCount >= 3) {
            updateBatteryBar(e.clientY);
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
    
    // 根据计数决定记录到哪个位置
    if (touchCount === 1) {
        // 第一次长按，记录到上位置
        touchData.top.x = mirrorX;
        touchData.top.y = mirrorY;
        touchData.top.radius = 50;
        console.log('记录触摸数据到上位置:', touchData.top);
    } else if (touchCount === 2) {
        // 第二次长按，记录到中位置
        if (touchData.top.x !== 0 || touchData.top.y !== 0) {
            touchData.middle.x = mirrorX;
            touchData.middle.y = mirrorY;
            touchData.middle.radius = 50;
            console.log('记录触摸数据到中位置:', touchData.middle);
        }
    } else if (touchCount === 3) {
        // 第三次长按，记录到下位置
        if ((touchData.top.x !== 0 || touchData.top.y !== 0) && (touchData.middle.x !== 0 || touchData.middle.y !== 0)) {
            touchData.bottom.x = mirrorX;
            touchData.bottom.y = mirrorY;
            touchData.bottom.radius = 50;
            console.log('记录触摸数据到下位置:', touchData.bottom);
            
            // 第一次三个数据都记录完，存到数组
            saveTouchDataToAll();
        }
    } else if (touchCount >= 4) {
        // 第四次及以后的按压
        if (allDataRecorded) {
            // 三个都有数据，次数+1，清空中和下，记录到上
            completeCount++;
            const completeCounter = document.getElementById('complete-counter');
            completeCounter.textContent = completeCount;
            
            // 存当前这一组数据
            saveTouchDataToAll();
            
            // 清空中和下
            touchData.middle.x = 0;
            touchData.middle.y = 0;
            touchData.bottom.x = 0;
            touchData.bottom.y = 0;
            
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
            
            // 记录到上
            touchData.top.x = mirrorX;
            touchData.top.y = mirrorY;
            touchData.top.radius = 50;
            console.log('记录触摸数据到上位置:', touchData.top);
            
            // 设置触摸计数为1，表示已经记录了上
            touchCount = 1;
        } else if (touchData.top.x !== 0 || touchData.top.y !== 0) {
            // 只有上有数据，记录到中
            if (touchData.middle.x === 0 && touchData.middle.y === 0) {
                touchData.middle.x = mirrorX;
                touchData.middle.y = mirrorY;
                touchData.middle.radius = 50;
                console.log('记录触摸数据到中位置:', touchData.middle);
            } else if (touchData.bottom.x === 0 && touchData.bottom.y === 0) {
                // 上中有数据，记录到下
                touchData.bottom.x = mirrorX;
                touchData.bottom.y = mirrorY;
                touchData.bottom.radius = 50;
                console.log('记录触摸数据到下位置:', touchData.bottom);
                
                // 三个数据又记录完，存到数组
                saveTouchDataToAll();
            }
        }
    }
    
    updateDataDisplay();
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
            top: { x: 0, y: 0, radius: 50 },
            middle: { x: 0, y: 0, radius: 50 },
            bottom: { x: 0, y: 0, radius: 50 }
        };
    }
    
    // 计算平均值
    let sumTopX = 0, sumTopY = 0, sumTopR = 0;
    let sumMiddleX = 0, sumMiddleY = 0, sumMiddleR = 0;
    let sumBottomX = 0, sumBottomY = 0, sumBottomR = 0;
    
    allTouchData.forEach(record => {
        sumTopX += record.top.x;
        sumTopY += record.top.y;
        sumTopR += record.top.radius;
        
        sumMiddleX += record.middle.x;
        sumMiddleY += record.middle.y;
        sumMiddleR += record.middle.radius;
        
        sumBottomX += record.bottom.x;
        sumBottomY += record.bottom.y;
        sumBottomR += record.bottom.radius;
    });
    
    return {
        top: {
            x: Math.round(sumTopX / count),
            y: Math.round(sumTopY / count),
            radius: Math.round(sumTopR / count)
        },
        middle: {
            x: Math.round(sumMiddleX / count),
            y: Math.round(sumMiddleY / count),
            radius: Math.round(sumMiddleR / count)
        },
        bottom: {
            x: Math.round(sumBottomX / count),
            y: Math.round(sumBottomY / count),
            radius: Math.round(sumBottomR / count)
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
    const gameContainer = document.querySelector('.game-container');
    const containerHeight = gameContainer.clientHeight;
    
    // 镜像坐标：以横向中线为基准翻转
    const x = Math.round(touch.clientX);
    const originalY = Math.round(touch.clientY);
    const y = containerHeight - originalY;
    
    touchInfo.textContent = `触摸位置: (${x}, ${y})`;
    
    // 显示触摸区域（使用镜像后的坐标）
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
    
    // 显示最终时间（秒）
    const totalSeconds = stopwatchSeconds + (stopwatchMilliseconds / 1000);
    dashboardValue.textContent = totalSeconds.toFixed(2);
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', initGame);



