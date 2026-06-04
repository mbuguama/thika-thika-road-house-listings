document.addEventListener('DOMContentLoaded', function () {
	const heroSearch = document.getElementById('hero-search');
	if (heroSearch) {
		heroSearch.addEventListener('submit', function (e) {
			e.preventDefault();
			const form = e.currentTarget;
			const params = new URLSearchParams();
			const location = form.elements['location']?.value || '';
			const type = form.elements['type']?.value || '';
			if (location) params.set('q', location);
			if (type) params.set('type', type);
			// Navigate to explore with query params (simple behavior for demo)
			window.location.href = 'explore.html' + (params.toString() ? ('?' + params.toString()) : '');
		});
	}
});

// Small enhancement: add subtle focus ring for accessibility
document.addEventListener('focusin', (e) => {
	if (e.target.matches('input, button, select, a')) {
		e.target.classList.add('focus-ring');
	}
});
document.addEventListener('focusout', (e) => {
	if (e.target.matches('input, button, select, a')) {
		e.target.classList.remove('focus-ring');
	}
});

