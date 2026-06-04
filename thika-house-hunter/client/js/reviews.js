async function renderReviews(propertyId, targetId = 'reviews-list') {
  const target = document.getElementById(targetId);
  if (!target || !window.ThikaApi) return;

  try {
    const { reviews } = await window.ThikaApi.reviews.list(propertyId);
    target.innerHTML = reviews.length
      ? reviews.map((review) => window.ReviewCard?.template ? window.ReviewCard.template(review) : `<p>${review.comment}</p>`).join('')
      : '<p>No reviews yet.</p>';
  } catch (error) {
    target.innerHTML = `<p>${error.message}</p>`;
  }
}

window.ThikaReviews = {
  renderReviews,
};
