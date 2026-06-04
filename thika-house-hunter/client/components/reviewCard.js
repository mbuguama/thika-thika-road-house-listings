function reviewCardTemplate(review) {
  const stars = '★★★★★'.slice(0, Number(review.rating || 0));

  return `
    <article class="testimonial-card review-card">
      <p class="review-stars" aria-label="${review.rating} out of 5 stars">${stars}</p>
      <p>${review.comment || 'No comment provided.'}</p>
      <span>${review.user_name || 'Verified renter'}</span>
    </article>
  `;
}

window.ReviewCard = {
  template: reviewCardTemplate,
};
