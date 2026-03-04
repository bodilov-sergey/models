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

		const options = {
			Другое: {
				icon: "🛴",
				models: ['[Model 3 GTR PROF]', '[Коляска]']
			},
			Велосипеды: {
				icon: "🚲",
				models: [
					'[Zsun Model F8]',
					'[GT9]',
					'[GT10]',
					'[GT17]',
					'[Cross V-8]',
					'[Cross V-8 PRO]',
					'[Monster V-12L]',
					'[Monster V-12]',
					'[Allroud PCX10]',
					'[Fedbike GTR]',
					'[Fedbike RKS]',
					'[Model 107]',
					'[Apache Y]',
					'[Apache X PRO]',
					'[Trike 31]',
					'[Trike xMax]',
					'[Trike PRO]',
				]
			},
			Скутеры: {
				icon: "🛵",
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
				icon: "🛺",
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
				icon: "🚜",
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

	// Создаем кнопку
	function createButton() {
		// Проверяем, не существует ли уже кнопка
		if (document.getElementById('compatibility-filter-activator')) {
			return;
		}

		const button = document.createElement('button');
		button.id = 'compatibility-filter-activator';
		button.textContent = '🔧';
		button.title = 'Активировать фильтр совместимости';
		
		// Добавляем стили прямо в элемент
		button.style.position = 'fixed';
		button.style.top = '3px';
		button.style.right = '3px';
		button.style.zIndex = '9999';
		button.style.border = 'none';
		button.style.borderRadius = '4px';
		button.style.cursor = 'pointer';
		button.style.fontSize = '20px';
		button.style.width = '30px';
		button.style.height = '30px';
		button.style.display = 'flex';
		button.style.alignItems = 'center';
		button.style.justifyContent = 'center';
		button.style.backgroundColor = '#4CAF50';
		button.style.color = 'white';
		button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
		button.style.transition = 'all 0.3s';

		button.addEventListener('mouseenter', function() {
			this.style.backgroundColor = '#45a049';
		});

		button.addEventListener('mouseleave', function() {
			this.style.backgroundColor = '#4CAF50';
		});

		button.addEventListener('click', function() {
			const success = initCompatibilityFilter();

			if (success) {
				this.style.backgroundColor = '#00FF00';
				this.style.color = 'black';
				this.textContent = '✅';
				this.title = 'Фильтр активирован';

				setTimeout(() => {
					this.style.backgroundColor = '#4CAF50';
					this.style.color = 'white';
					this.textContent = '🔧';
					this.title = 'Активировать фильтр совместимости';
				}, 1000);
			} else {
				this.style.backgroundColor = '#FF0000';
				this.style.color = 'white';
				this.textContent = '❌';
				this.title = 'Не удалось найти фильтр';

				setTimeout(() => {
					this.style.backgroundColor = '#4CAF50';
					this.style.color = 'white';
					this.textContent = '🔧';
					this.title = 'Активировать фильтр совместимости';
				}, 1000);
			}
		});

		// Добавляем кнопку в body
		if (document.body) {
			document.body.appendChild(button);
			console.log('🔧 Кнопка фильтра создана');
		} else {
			// Если body еще нет, ждем
			const observer = new MutationObserver(function() {
				if (document.body) {
					document.body.appendChild(button);
					console.log('🔧 Кнопка фильтра создана');
					observer.disconnect();
				}
			});
			
			observer.observe(document.documentElement, {
				childList: true,
				subtree: true
			});
		}
	}

	// Запускаем создание кнопки
	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', createButton);
	} else {
		createButton();
	}
})();
