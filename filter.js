(function () {
	'use strict';

	// Универсальный конструктор кастомного фильтра-выпадашки.
	// Один и тот же код обслуживает любое поле (Совместимость, Модификации, ...).
	// Различаются только: заголовок поля, источник данных и кнопка-активатор —
	// всё это передаётся через объект config.
	function createCustomFilter(config) {
		function initFilter() {
			const filterItems = document.querySelectorAll('.filter-item');
			let targetFilter = null;

			for (let i = 0; i < filterItems.length; i++) {
				const item = filterItems[i];
				const label = item.querySelector('.gwt-Label');
				if (label && label.title === config.labelTitle) {
					targetFilter = item;
					break;
				}
			}

			if (!targetFilter) return false;
			if (targetFilter.querySelector('.custom-dropdown-container')) return true;

			const input = targetFilter.querySelector('input[type="text"]');
			if (!input) return false;

			// Данные берём из глобальной переменной, заданной в config
			const options = config.getData();
			if (!options) {
				console.error(`Данные для "${config.labelTitle}" не загружены!`);
				return false;
			}

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

			return true;
		}

		// --- Кнопка-активатор для этого поля ---
		const button = document.createElement('button');
		button.id = config.buttonId;
		button.textContent = config.buttonText;
		button.title = config.buttonTitle;

		// Необязательные inline-стили (нужны, например, чтобы вторая кнопка
		// не легла поверх первой). Задаются через config.buttonStyle.
		if (config.buttonStyle) {
			Object.assign(button.style, config.buttonStyle);
		}

		button.addEventListener('click', function () {
			const success = initFilter();

			if (success) {
				this.textContent = config.activatedText;

				setTimeout(() => {
					this.textContent = config.buttonText;
				}, 1000);
			} else {
				this.style.backgroundColor = '#FF0000';
				this.style.color = 'white';
				this.textContent = config.notFoundText;

				setTimeout(() => {
					this.style.backgroundColor = '';
					this.style.color = '';
					this.textContent = config.buttonText;
				}, 1000);
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
	}

	function triggerInputEvents(input) {
		const events = ['input', 'change', 'keyup', 'blur'];
		events.forEach((eventType) => {
			const event = new Event(eventType, { bubbles: true });
			input.dispatchEvent(event);
		});
	}

	// ===== Поле "Совместимость" (работает как раньше) =====
	createCustomFilter({
		labelTitle: 'Совместимость',
		getData: () => window.compatibilityModels,
		buttonId: 'compatibility-filter-activator',
		buttonText: '🔧',
		buttonTitle: 'Активировать фильтр совместимости',
		activatedText: '\u00A0' + '\u00A0' + 'Фильтр активирован 🔧',
		notFoundText: '\u00A0' + '\u00A0' + 'Не удалось найти "Совместимость" 🔧',
	});

	// ===== Поле "Модификации" (новое, тот же механизм) =====
	createCustomFilter({
		labelTitle: 'Модификации',
		getData: () => window.compatibilityModifications,
		buttonId: 'modifications-filter-activator',
		buttonText: '🛠️',
		buttonTitle: 'Активировать фильтр модификаций',
		activatedText: '\u00A0' + '\u00A0' + 'Фильтр активирован 🛠️',
		notFoundText: '\u00A0' + '\u00A0' + 'Не удалось найти "Модификации" 🛠️',
		// ВАЖНО: у меня нет вашего CSS, который позиционирует первую кнопку (🔧),
		// поэтому вторую кнопку (🛠️) я задаю inline-стилями как стартовую точку.
		// Поправьте координаты под себя (или уберите buttonStyle и пропишите
		// позицию в CSS расширения через #modifications-filter-activator).
		buttonStyle: {
			position: 'fixed',
			right: '20px',
			bottom: '60px',
			zIndex: '99999',
		},
	});
})();
