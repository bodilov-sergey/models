(function () {
	'use strict';

	// === Поля карточки, которые обрабатываем: подпись -> источник данных ===
	// Добавить ещё одно поле = дописать объект в этот массив.
	const FIELDS = [
		{ label: 'Совместимость', getData: () => window.compatibilityModels },
		{ label: 'Модификации', getData: () => window.compatibilityModifications },
	];

	// Какому полю соответствует подпись (span). Возвращает объект из FIELDS или null.
	function matchField(span) {
		const text = span.textContent;
		for (const field of FIELDS) {
			if (text.includes(field.label)) return field;
		}
		return null;
	}

	function createCustomDropdown(textarea, options) {
		const dropdownContainer = document.createElement('div');
		dropdownContainer.className = 'custom-dropdown-container';

		// Закрытие всех открытых списков
		function closeAllDropdowns() {
			dropdownContainer
				.querySelectorAll('.custom-dropdown.open')
				.forEach((dropdown) => {
					dropdown.classList.remove('open');
					dropdown.nextElementSibling.style.display = 'none';
				});
		}

		// Обновление всех списков согласно текущему содержимому textarea
		function updateAllDropdowns() {
			const currentValues = textarea.value
				.split('\n')
				.filter((v) => v.trim() !== '' && v !== '-------------------');
			dropdownContainer.querySelectorAll('.custom-option').forEach((option) => {
				option.classList.toggle('selected', currentValues.includes(option.textContent));
			});
		}

		// Создаём выпадающие списки для каждой категории
		Object.keys(options).forEach((categoryName) => {
			const category = options[categoryName];

			const dropdown = document.createElement('div');
			dropdown.className = 'custom-dropdown';
			dropdown.textContent = category.icon;
			dropdown.title = categoryName; // подсказка с названием категории

			const optionsList = document.createElement('div');
			optionsList.className = 'custom-options-list';
			optionsList.style.display = 'none';

			category.models.forEach((optionText) => {
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
					updateAllDropdowns(); // обновляем перед открытием
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
			dropdownContainer.querySelectorAll('.custom-options-list').forEach((list) => {
				list.querySelectorAll('.custom-option.selected').forEach((option) => {
					selectedOptions.push(option.textContent);
				});
			});

			const allLines = textarea.value.split('\n');

			// Собираем все модели из всех категорий этого поля
			const allModels = [];
			Object.values(options).forEach((category) => {
				allModels.push(...category.models);
			});

			const invalidLines = allLines.filter(
				(line) =>
					!allModels.includes(line) &&
					line.trim() !== '' &&
					line !== '-------------------'
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

		// Обработчики изменений textarea
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
		textarea.dataset.replaced = 'true';
		updateAllDropdowns(); // инициализируем состояние
	}

	// Обработка одного textarea с данными конкретного поля
	function handleTextarea(textarea, options) {
		if (!textarea || textarea.dataset.replaced) return;
		if (!options) return; // данные для этого поля ещё не загружены

		// Если контейнер уже есть — убираем, чтобы пересоздать
		const existingContainer = textarea.nextElementSibling;
		if (
			existingContainer &&
			existingContainer.classList.contains('custom-dropdown-container')
		) {
			existingContainer.remove();
		}

		createCustomDropdown(textarea, options);
	}

	// По подписи определяем поле и обрабатываем его textarea
	function processSpan(span) {
		const field = matchField(span);
		if (!field) return;
		const textarea = span.closest('tr')?.querySelector('textarea');
		if (textarea) handleTextarea(textarea, field.getData());
	}

	// Обработка уже существующих подписей на странице
	function initExistingTextareas() {
		document.querySelectorAll('span.b-validation-label').forEach(processSpan);
	}

	// Наблюдатель за новыми элементами
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node.nodeType === 1) {
					const spans = node.querySelectorAll?.('span.b-validation-label') || [];
					spans.forEach(processSpan);
				}
			});
		});
	});

	// Инициализация при загрузке
	initExistingTextareas();

	// Переинициализация при возможных обновлениях страницы
	const reinitObserver = new MutationObserver(() => {
		initExistingTextareas();
	});

	reinitObserver.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		characterData: true,
	});

	observer.observe(document.body, { childList: true, subtree: true });
})();
