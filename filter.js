(function () {
	'use strict';

	// === Поля, которые обслуживает фильтр ===
	// Чтобы добавить ещё одно поле — просто допишите объект в этот массив.
	const FILTERS = [
		{
			labelTitle: 'Совместимость',
			getData: () => window.compatibilityModels,
		},
		{
			labelTitle: 'Модификации',
			getData: () => window.compatibilityModifications,
		},
	];

	// Инициализация одного поля.
	// Возвращает статус: 'ok' | 'already' | 'no-field' | 'no-input' | 'no-data'
	function initFilter(config) {
		const filterItems = document.querySelectorAll('.filter-item');
		let targetFilter = null;

		for (let i = 0; i < filterItems.length; i++) {
			const item = filterItems[i];
			const label = item.querySelector('.gwt-Label');
			if (!label) continue;
			// Совпадение по title ИЛИ по видимому тексту подписи
			// (на случай, если у поля заполнен только один из них).
			const titleMatch = label.title === config.labelTitle;
			const textMatch = label.textContent.trim() === config.labelTitle;
			if (titleMatch || textMatch) {
				targetFilter = item;
				break;
			}
		}

		if (!targetFilter) return 'no-field';
		if (targetFilter.querySelector('.custom-dropdown-container')) return 'already';

		const input = targetFilter.querySelector('input[type="text"]');
		if (!input) return 'no-input';

		const options = config.getData();
		if (!options) return 'no-data';

		const container = document.createElement('div');
		container.className = 'custom-dropdown-container';

		Object.keys(options).forEach((categoryName) => {
			const category = options[categoryName];

			const dropdown = document.createElement('div');
			dropdown.className = 'custom-dropdown';

			const iconElement = document.createElement('span');
			iconElement.className = 'category-icon';
			iconElement.textContent = category.icon;

			const textElement = document.createElement('span');
			textElement.className = 'category-text';
			textElement.textContent = categoryName;
			textElement.style.display = 'none';

			dropdown.appendChild(iconElement);
			dropdown.appendChild(textElement);

			const optionsList = document.createElement('div');
			optionsList.className = 'custom-options-list';
			optionsList.style.display = 'none';

			category.models.forEach((model) => {
				const optionElement = document.createElement('div');
				optionElement.className = 'custom-option';
				optionElement.textContent = model;
				optionElement.dataset.value = model;

				optionElement.addEventListener('click', function (e) {
					e.stopPropagation();
					input.value = this.dataset.value;
					triggerInputEvents(input);
					closeAllDropdowns();
				});

				optionsList.appendChild(optionElement);
			});

			dropdown.addEventListener('click', function (e) {
				e.stopPropagation();

				const isOpen = this.classList.contains('open');
				closeAllDropdowns();

				if (!isOpen) {
					this.classList.add('open');
					optionsList.style.display = 'block';
				}
			});

			dropdown.title = categoryName;

			container.appendChild(dropdown);
			container.appendChild(optionsList);
		});

		const clearButton = document.createElement('div');
		clearButton.className = 'custom-dropdown';
		clearButton.innerHTML = '❌';
		clearButton.title = 'Очистить';
		clearButton.style.cursor = 'pointer';
		clearButton.style.fontSize = '14px';
		clearButton.style.display = 'flex';
		clearButton.style.justifyContent = 'center';
		clearButton.style.alignItems = 'end';
		clearButton.style.background =
			'linear-gradient(to bottom, #fff1f1, #ffd2d2)';

		let lastValue = '';

		clearButton.addEventListener('click', function (e) {
			e.stopPropagation();

			if (this.innerHTML === '❌') {
				if (!input.value.trim()) {
					return;
				}

				lastValue = input.value;
				input.value = '';
				this.innerHTML = '↩️';
				this.title = 'Восстановить';
				triggerInputEvents(input);
			} else {
				input.value = lastValue;
				this.innerHTML = '❌';
				this.title = 'Очистить';
				triggerInputEvents(input);
			}
		});

		input.addEventListener('input', function () {
			if (this.value && clearButton.innerHTML === '↩️') {
				clearButton.innerHTML = '❌';
				clearButton.title = 'Очистить';
			}
		});

		container.appendChild(clearButton);
		targetFilter.appendChild(container);

		function closeAllDropdowns() {
			const dropdowns = container.querySelectorAll('.custom-dropdown');
			const optionsLists = container.querySelectorAll('.custom-options-list');

			dropdowns.forEach((dropdown) => {
				dropdown.classList.remove('open');
			});

			optionsLists.forEach((list) => {
				list.style.display = 'none';
			});
		}

		document.addEventListener('click', function () {
			closeAllDropdowns();
		});

		return 'ok';
	}

	function triggerInputEvents(input) {
		const events = ['input', 'change', 'keyup', 'blur'];
		events.forEach((eventType) => {
			const event = new Event(eventType, { bubbles: true });
			input.dispatchEvent(event);
		});
	}

	// === Одна кнопка активирует сразу все поля из FILTERS ===
	const button = document.createElement('button');
	button.id = 'compatibility-filter-activator';
	button.textContent = '🔧';
	button.title = 'Активировать фильтры';

	button.addEventListener('click', function () {
		const btn = this;
		const notFound = [];
		let activated = 0;

		FILTERS.forEach((cfg) => {
			const status = initFilter(cfg);

			if (status === 'ok' || status === 'already') {
				activated++;
			} else if (status === 'no-data') {
				notFound.push(cfg.labelTitle + ' (нет данных)');
				console.error(`Данные для "${cfg.labelTitle}" не загружены!`);
			} else {
				// no-field / no-input
				notFound.push(cfg.labelTitle);
			}
		});

		if (notFound.length === 0) {
			btn.textContent = '\u00A0\u00A0Фильтры активированы 🔧';
			setTimeout(() => {
				btn.textContent = '🔧';
			}, 1000);
		} else {
			btn.style.backgroundColor = '#FF0000';
			btn.style.color = 'white';
			btn.textContent = '\u00A0\u00A0Не найдено: ' + notFound.join(', ') + ' 🔧';
			setTimeout(() => {
				btn.style.backgroundColor = '';
				btn.style.color = '';
				btn.textContent = '🔧';
			}, 2500);
		}
	});

	if (document.body) {
		document.body.appendChild(button);
	} else {
		const observer = new MutationObserver(function () {
			if (document.body) {
				document.body.appendChild(button);
				observer.disconnect();
			}
		});

		observer.observe(document.documentElement, {
			childList: true,
			subtree: true,
		});
	}
})();
