const favoritesGrid = document.getElementById('favorites-grid');
const favoritesSummary = document.getElementById('favorites-summary');

function getLocalFavorites() {
  return JSON.parse(localStorage.getItem('favorites') || '[]');
}

function setLocalFavorites(favorites) {
  localStorage.setItem('favorites', JSON.stringify(favorites));
}

function renderFavoriteList(favorites) {
  if (!favoritesGrid || !favoritesSummary) return;

  if (!favorites.length) {
    favoritesGrid.innerHTML = '<div class="feature-card"><h3>No favorites yet</h3><p>Save a listing from Explore to see it here.</p></div>';
    favoritesSummary.textContent = 'No saved homes';
    return;
  }

  favoritesGrid.innerHTML = favorites
    .map((property) => window.PropertyCard?.template ? window.PropertyCard.template(property, { favorite: true }) : `
      <article class="property-card" data-id="${property.id}">
        <div class="property-thumb"><img src="${property.image || property.image_url}" alt="${property.title}" /></div>
        <div class="property-card-body">
          <h3>${property.title}</h3>
          <p class="property-price">KES ${Number(property.price || 0).toLocaleString()}</p>
          <div class="property-actions">
            <a href="property.html?id=${property.id}" class="button button-secondary">View</a>
            <button type="button" class="button button-secondary remove-favorite">Remove</button>
          </div>
        </div>
      </article>
    `)
    .join('');

  favoritesSummary.textContent = `Showing ${favorites.length} saved ${favorites.length === 1 ? 'home' : 'homes'}`;

  document.querySelectorAll('.remove-favorite').forEach((button) => {
    button.addEventListener('click', async () => {
      const card = button.closest('.property-card');
      const propertyId = card?.dataset.id;
      const remaining = getLocalFavorites().filter((favorite) => favorite.id !== propertyId);
      setLocalFavorites(remaining);

      try {
        if (window.ThikaApi && localStorage.getItem('token')) {
          await window.ThikaApi.favorites.remove(propertyId);
        }
      } catch (error) {
        console.warn(error.message);
      }

      renderFavoriteList(remaining);
    });
  });
}

async function loadFavorites() {
  try {
    if (window.ThikaApi && localStorage.getItem('token')) {
      const { favorites } = await window.ThikaApi.favorites.list();
      renderFavoriteList(favorites);
      return;
    }
  } catch (error) {
    console.warn('Using local favorites:', error.message);
  }

  renderFavoriteList(getLocalFavorites());
}

document.addEventListener('DOMContentLoaded', loadFavorites);
