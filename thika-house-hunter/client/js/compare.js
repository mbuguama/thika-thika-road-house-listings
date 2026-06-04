document.addEventListener('DOMContentLoaded', () => {
	const removeButtons = document.querySelectorAll('.compare-remove');
	const cards = document.querySelectorAll('.compare-card');

	function highlightDiffs() {
		const rows = document.querySelectorAll('.compare-table tbody tr');
		rows.forEach((row) => {
			const a = row.querySelector('.c-p1')?.textContent?.trim();
			const b = row.querySelector('.c-p2')?.textContent?.trim();
			if (a !== b) {
				row.classList.add('diff');
			} else {
				row.classList.remove('diff');
			}
		});
	}

	removeButtons.forEach((btn) => {
		btn.addEventListener('click', (e) => {
			const card = e.currentTarget.closest('.compare-card');
			if (!card) return;
			card.remove();
			// hide corresponding column in table by removing cells with class matching id
			const id = card.dataset.id; // p1 or p2
			if (id === 'p1') {
				document.querySelectorAll('.c-p1').forEach((el) => el.textContent = '—');
			}
			if (id === 'p2') {
				document.querySelectorAll('.c-p2').forEach((el) => el.textContent = '—');
			}
			highlightDiffs();
		});
	});

	// initial highlight
	highlightDiffs();
});

