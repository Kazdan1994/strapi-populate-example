const form = document.querySelector('form');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const formData = new FormData(e.target)

  formData.append('data', JSON.stringify({
    title: 'hello',
    author: 1,
    categories: [1],
  }));

  await fetch('http://localhost:1337/api/articles', {
    method: 'post',
    body: formData
  });
});
