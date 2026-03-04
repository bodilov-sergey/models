(function() {
    'use strict';

    const options = {
        Другое: {
            icon: '🛴',
            models: [
                '[Model 3 GTR PROF]',
                '[Коляска]',
            ]
        },
        Велосипеды: {
            icon: '🚲',
            models: [
                '[Zsun Model F8]',
                '[GT9]',
                '[GT10]',
                '[GT17]',
                '[Cross V-8]', // V-8L
                '[Cross V-8 PRO]', // V-8
                '[Monster V-12L]',
                '[Monster V-12]',
                '[Allroud PCX10]', // Allroad PCX10
                '[Fedbike GTR]', // Fatbike GTR 
                '[Fedbike RKS]', // Fatbike GTR 
                '[Model 107]',
                '[Apache Y]',
                '[Apache X PRO]',
                '[Trike 31]',
                '[Trike xMax]',
                '[Trike PRO]',
            ]
        },
        Скутеры: {
            icon: '🛵',
            models: [
                '[Model 3 Standard Range]',
                '[Model 3 Long Range]',
                '[Model 9 Long Range]',
                '[Model 11 Standard Range]',
                '[Model 14 mini]',
                '[Model 15 Maxi Range]',
                '[Model 16 Maxi Range]',
                '[Model 18]',
                '[Model 20]',
                '[Model 21 Performance]',
                '[Model 29 Performance]',
                '[Model 60]',
                '[Model 70]',
            ]
        },
        Трициклы: {
            icon: '🛺',
            models: [
                '[Model 108]',
                '[Model 104]',
                '[Model 30]',
                '[Model 31]',
                '[Model 34]',
                '[Model 37]',
                '[Model XL 40]',
                '[Model 90]',
                '[Model 100]',
            ]
        },
        Мотоблоки: {
            icon: '🚜',
            models: [
                '[1900]',
                '[1030]',
                '[900]',
                '[500]',
                '[7000]',
                '[2000 2KNS]',
                '[2000 N]',
                '[1000]',
                '[8000]',
            ]
        },
    };
        
    function createCustomDropdown(textarea) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.className = 'custom-dropdown-container';

        // Закрытие всех открытых списков
        function closeAllDropdowns() {
            dropdownContainer.querySelectorAll('.custom-dropdown.open').forEach(dropdown => {
                dropdown.classList.remove('open');
                dropdown.nextElementSibling.style.display = 'none';
            });
        }

        // Обновление всех списков согласно текущему содержимому textarea
        function updateAllDropdowns() {
            const currentValues = textarea.value.split('\n').filter(v => v.trim() !== '' && v !== '-------------------');
            dropdownContainer.querySelectorAll('.custom-option').forEach(option => {
                option.classList.toggle('selected', currentValues.includes(option.textContent));
            });
        }

        // Создаем выпадающие списки для каждой категории
        Object.keys(options).forEach(categoryName => {
            const category = options[categoryName];
            
            const dropdown = document.createElement('div');
            dropdown.className = 'custom-dropdown';
            dropdown.textContent = category.icon;
            dropdown.title = categoryName; // Добавляем подсказку с названием категории

            const optionsList = document.createElement('div');
            optionsList.className = 'custom-options-list';
            optionsList.style.display = 'none';

            category.models.forEach(optionText => {
                const option = document.createElement('div');
                option.className = 'custom-option';
                option.textContent = optionText;
                optionsList.appendChild(option);
            });

            dropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                if (dropdown.classList.contains('open')) {
                    dropdown.classList.remove('open');
                    optionsList.style.display = 'none';
                } else {
                    closeAllDropdowns();
                    updateAllDropdowns(); // Обновляем перед открытием
                    dropdown.classList.add('open');
                    optionsList.style.display = 'block';
                }
            });

            optionsList.addEventListener('click', (e) => {
                if (e.target.classList.contains('custom-option')) {
                    e.stopPropagation();
                    e.target.classList.toggle('selected');
                    updateTextareaValue();
                }
            });

            dropdownContainer.appendChild(dropdown);
            dropdownContainer.appendChild(optionsList);
        });

        // Обновление содержимого textarea
        function updateTextareaValue() {
            const selectedOptions = [];
            dropdownContainer.querySelectorAll('.custom-options-list').forEach(list => {
                list.querySelectorAll('.custom-option.selected').forEach(option => {
                    selectedOptions.push(option.textContent);
                });
            });

            const allLines = textarea.value.split('\n');
            
            // Собираем все модели из всех категорий
            const allModels = [];
            Object.values(options).forEach(category => {
                allModels.push(...category.models);
            });
            
            const invalidLines = allLines.filter(line => 
                !allModels.includes(line) && line.trim() !== '' && line !== '-------------------'
            );

            let newValue = selectedOptions.join('\n');
            if (invalidLines.length > 0) {
                newValue += '\n-------------------\n' + invalidLines.join('\n');
            }

            textarea.value = newValue;
            
            // Триггерим событие изменения для textarea
            const event = new Event('change', { bubbles: true });
            textarea.dispatchEvent(event);
        }

        // Добавляем обработчик изменений textarea
        textarea.addEventListener('change', updateAllDropdowns);
        textarea.addEventListener('input', updateAllDropdowns);

        // Закрытие при клике вне области
        document.addEventListener('click', (e) => {
            if (!dropdownContainer.contains(e.target)) {
                closeAllDropdowns();
            }
        });

        // Первоначальная настройка
        textarea.insertAdjacentElement('afterend', dropdownContainer);
        textarea.dataset.replaced = "true";
        updateAllDropdowns(); // Инициализируем состояние
    }

    // Обработка textarea
    function handleTextarea(textarea) {
        if (!textarea || textarea.dataset.replaced) return;
        
        // Проверяем, есть ли уже контейнер для этого textarea
        const existingContainer = textarea.nextElementSibling;
        if (existingContainer && existingContainer.classList.contains('custom-dropdown-container')) {
            existingContainer.remove();
        }
        
        createCustomDropdown(textarea);
    }

    // MutationObserver для новых элементов
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            mutation.addedNodes.forEach((node) => {
                if (node.nodeType === 1) {
                    const compatibilitySpans = node.querySelectorAll?.('span.b-validation-label') || [];
                    compatibilitySpans.forEach(span => {
                        if (span.textContent.includes('Совместимость')) {
                            const textarea = span.closest('tr')?.querySelector('textarea');
                            if (textarea) handleTextarea(textarea);
                        }
                    });
                }
            });
        });
    });

    // Обработка существующих элементов
    function initExistingTextareas() {
        document.querySelectorAll('span.b-validation-label').forEach(span => {
            if (span.textContent.includes('Совместимость')) {
                const textarea = span.closest('tr')?.querySelector('textarea');
                if (textarea) handleTextarea(textarea);
            }
        });
    }

    // Инициализация при загрузке
    initExistingTextareas();
    
    // Также переинициализируем при возможных обновлениях страницы
    const reinitObserver = new MutationObserver((mutations) => {
        initExistingTextareas();
    });
    
    reinitObserver.observe(document.body, { 
        childList: true, 
        subtree: true,
        attributes: true,
        characterData: true
    });

    observer.observe(document.body, { childList: true, subtree: true });
})();
