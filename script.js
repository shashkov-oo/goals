let habits = JSON.parse(localStorage.getItem('habits')) || [];
let trackerData = JSON.parse(localStorage.getItem('trackerData')) || {};
let weeks = parseInt(localStorage.getItem('weeks')) || 1;

// Инициализация темы
const savedTheme = localStorage.getItem('theme') || 'dark';
document.body.classList.toggle('light-theme', savedTheme === 'light');

// Переключение темы
document.getElementById('themeToggle').addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

// Управление видимостью блока
document.getElementById('toggleShowButton').addEventListener('click', function() {
    const mainControls = document.getElementById('mainControls');
    if (mainControls.style.display === 'none') {
        mainControls.style.display = 'block';
        this.textContent = 'Скрыть генерацию';
    } else {
        mainControls.style.display = 'none';
        this.textContent = 'Показать генерацию';
    }
});

// Добавление привычки
document.getElementById('addHabit').addEventListener('click', function() {
    const category = document.getElementById('category').value;
    const habit = document.getElementById('habit').value;
    const goal = document.getElementById('goal').value;
    
    if (category && habit && goal) {
        habits.push({ category, habit, goal });
        document.getElementById('category').value = '';
        document.getElementById('habit').value = '';
        document.getElementById('goal').value = '';
        displayCurrentHabits();
        saveHabits();
        alert('Привычка добавлена!');
        if (habits.length > 0) createTracker(weeks);
    } else {
        alert('Заполните все поля!');
    }
});

// Отображение текущих привычек
function displayCurrentHabits() {
    const container = document.getElementById('currentHabits');
    container.innerHTML = '<h3>Текущие привычки:</h3>';
    habits.forEach((habit, index) => {
        container.innerHTML += `
            <div class="habit-item">
                ${index + 1}. ${habit.category}: ${habit.habit} (Цель: ${habit.goal})
                <button onclick="removeHabit(${index})">🗑️</button>
            </div>`;
    });
}

// Удаление привычки
function removeHabit(index) {
    habits.splice(index, 1);
    saveHabits();
    displayCurrentHabits();
    createTracker(weeks);
}

// Создание трекера
document.getElementById('createTracker').addEventListener('click', function() {
    weeks = parseInt(document.getElementById('weeks').value);
    localStorage.setItem('weeks', weeks);
    createTracker(weeks);
});

// Генерация таблицы
function createTracker(weeks) {
    const trackerContainer = document.getElementById('trackerContainer');
    trackerContainer.innerHTML = '';

    const table = document.createElement('table');
    table.innerHTML = `
        <tr>
            <th>Неделя</th>
            <th>Категория</th>
            <th>Привычка</th>
            <th>Цель</th>
            <th>Факт</th>
            <th>Выполнение</th>
            ${Array.from({length: 7}, (_, i) => `<th>День ${i+1}</th>`).join('')}
        </tr>
    `;

    for (let week = 1; week <= weeks; week++) {
        habits.forEach((habit, habitIndex) => {
            const row = document.createElement('tr');
            const checkedCount = Object.keys(trackerData)
                .filter(key => key.startsWith(`${habitIndex}-${week}-`) && trackerData[key])
                .length;

            const completion = habit.goal > 0 
                ? Math.round((checkedCount / habit.goal) * 100)
                : 0;

            row.innerHTML = `
                <td>${week}</td>
                <td>${habit.category}</td>
                <td>${habit.habit}</td>
                <td>${habit.goal}</td>
                <td class="fact">${checkedCount}</td>
                <td class="completion" style="background-color: ${getCompletionColor(completion)}">
                    ${completion}%
                </td>
                ${Array.from({length: 7}, (_, day) => `
                    <td>
                        <input type="checkbox" 
                            ${trackerData[`${habitIndex}-${week}-${day}`] ? 'checked' : ''}
                            onchange="updateFact(this, ${habitIndex}, ${week}, ${day})">
                    </td>
                `).join('')}
            `;
            table.appendChild(row);
        });

        // Добавление разделителя недель
        const separatorRow = document.createElement('tr');
        separatorRow.className = 'week-separator';
        separatorRow.innerHTML = '<td colspan="13"></td>';
        table.appendChild(separatorRow);
    }
    trackerContainer.appendChild(table);
}

// Обновление данных чекбокса
function updateFact(checkbox, habitIndex, week, day) {
    const key = `${habitIndex}-${week}-${day}`;
    if (checkbox.checked) {
        trackerData[key] = true;
    } else {
        delete trackerData[key];
    }
    localStorage.setItem('trackerData', JSON.stringify(trackerData));
    createTracker(weeks);
}

// Цвет выполнения
function getCompletionColor(value) {
    return value > 90 ? '#90EE90' : value < 70 ? '#FFB6C1' : '#FFFFE0';
}

// Очистка чекбоксов
document.getElementById('clearCheckboxes').addEventListener('click', () => {
    trackerData = {};
    localStorage.setItem('trackerData', JSON.stringify(trackerData));
    createTracker(weeks);
});

// Сохранение привычек
function saveHabits() {
    localStorage.setItem('habits', JSON.stringify(habits));
}

// Инициализация
window.onload = () => {
    displayCurrentHabits();
    if (habits.length > 0) {
        document.getElementById('mainControls').style.display = 'none';
        document.getElementById('toggleShowButton').textContent = 'Показать генерацию';
    }
    createTracker(weeks);
};