(function () {
	'use strict';

	// === Поля, которые обслуживает фильтр ===
	// Добавить ещё одно поле = дописать объект в этот массив.
	const FILTERS = [
		{ labelTitle: 'Совместимость', getData: () => window.compatibilityModels },
		{ labelTitle: 'Модификации', getData: () => window.compatibilityModifications },
	];

	function triggerInputEvents(input) {
		const events = ['input', 'change', 'keyup', 'blur'];
		events.forEach((eventType) => {
			input.dispatchEvent(new Event(eventType, { bubbles: true }));
		});
	}

	// Закрыть все открытые выпадашки на странице (общая для всех полей)
	function closeAllDropdowns() {
		document
			.querySelectorAll('.custom-dropdown-container .custom-dropdown')
			.forEach((d) => d.classList.remove('open'));
		document
			.querySelectorAll('.custom-dropdown-container .custom-options-list')
			.forEach((list) => (list.style.display = 'none'));
	}

	// Построить выпадашку внутри конкретного поля (item) и связать её с полем ввода
	function buildDropdown(item, input, options) {
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
				if (!input.value.trim()) return;
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
		item.appendChild(container);
	}

	// Прикрепить выпадашку КО ВСЕМ полям с нужной подписью (и в фильтре, и в карточке).
	// Возвращает { found, attached }.
	function initFilter(config) {
		const filterItems = document.querySelectorAll('.filter-item');
		let found = 0;
		let attached = 0;

		for (let i = 0; i < filterItems.length; i++) {
			const item = filterItems[i];
			const label = item.querySelector('.gwt-Label');
			if (!label) continue;

			// Совпадение по title ИЛИ по видимому тексту подписи
			const match =
				label.title === config.labelTitle ||
				label.textContent.trim() === config.labelTitle;
			if (!match) continue;

			found++;

			// уже прикреплено к этому полю — не дублируем
			if (item.querySelector('.custom-dropdown-container')) {
				attached++;
				continue;
			}

			// поле ввода: и обычный input, и textarea (в карточке товара — textarea)
			const input = item.querySelector('input[type="text"], textarea');
			if (!input) continue;

			const options = config.getData();
			if (!options) continue;

			buildDropdown(item, input, options);
			attached++;
		}

		return { found, attached };
	}

	// === Одна кнопка активирует все поля из FILTERS ===
	const button = document.createElement('button');
	button.id = 'compatibility-filter-activator';
	button.textContent = '🔧';
	button.title = 'Активировать фильтры';

	button.addEventListener('click', function () {
		const btn = this;
		const notFound = [];
		let totalAttached = 0;

		FILTERS.forEach((cfg) => {
			const res = initFilter(cfg);
			totalAttached += res.attached;
			// поле считается проблемным, если кнопки не появились НИГДЕ
			if (res.attached === 0) notFound.push(cfg.labelTitle);
		});

		if (notFound.length === 0) {
			btn.textContent = '\u00A0\u00A0Готово: полей ' + totalAttached + ' 🔧';
			setTimeout(() => {
				btn.textContent = '🔧';
			}, 1200);
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

	// Один общий обработчик: клик по странице закрывает все выпадашки
	document.addEventListener('click', closeAllDropdowns);

	if (document.body) {
		document.body.appendChild(button);
	} else {
		const observer = new MutationObserver(function () {
			if (document.body) {
				document.body.appendChild(button);
				observer.disconnect();
			}
		});
		observer.observe(document.documentElement, { childList: true, subtree: true });
	}
})();
