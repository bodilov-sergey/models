(function () {
	'use strict';

	function initCompatibilityFilter() {
		const filterItems = document.querySelectorAll('.filter-item');
		let compatibilityFilter = null;

		for (let i = 0; i < filterItems.length; i++) {
			const item = filterItems[i];
			const label = item.querySelector('.gwt-Label');
			if (label && label.title === 'Совместимость') {
				compatibilityFilter = item;
				break;
			}
		}

		if (!compatibilityFilter) return false;
		if (compatibilityFilter.querySelector('.custom-dropdown-container'))
			return true;

		const input = compatibilityFilter.querySelector('input[type="text"]');
		if (!input) return false;

		// Используем глобальные модели
		const options = window.compatibilityModels;
		if (!options) {
			console.error('Модели не загружены!');
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
		compatibilityFilter.appendChild(container);

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

	function triggerInputEvents(input) {
		const events = ['input', 'change', 'keyup', 'blur'];
		events.forEach((eventType) => {
			const event = new Event(eventType, { bubbles: true });
			input.dispatchEvent(event);
		});
	}

	// Создаем простую кнопку
	const button = document.createElement('button');
	button.id = 'compatibility-filter-activator';
	button.textContent = '🔧';
	button.title = 'Активировать фильтр совместимости';

	button.addEventListener('click', function () {
		const success = initCompatibilityFilter();

		if (success) {
			// this.style.backgroundColor = '#00FF00';
			// this.style.color = 'black';
			this.textContent = '\u00A0' + 'Фильтр активирован 🔧';

			setTimeout(() => {
				this.style.backgroundColor = '';
				this.style.color = '';
				this.textContent = '🔧';
			}, 1000);
		} else {
			this.style.backgroundColor = '#FF0000';
			this.style.color = 'white';
			this.textContent = '\u00A0' + 'Не удалось найти фильтр 🔧';

			setTimeout(() => {
				this.style.backgroundColor = '';
				this.style.color = '';
				this.textContent = '🔧';
			}, 1000);
		}
	});

	// Добавляем кнопку в body
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
