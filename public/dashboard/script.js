let skip = 3;
document.getElementById('load-btn').addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/dashboard/load-articles?api_key=3e923e54-525ec33e-69f1b40f-948fcd3e&skip=${skip}`);
        if (response.status != 200) throw new Error("Api key not valid");
        skip += 3;
        const result = await response.json();
        if (result.status) {
            result.data.forEach(article => {
                createArticleCard(article);
            })
        } else {
            document.getElementById('load-btn').remove();
        }

    } catch (error) {
        console.log(error);
    }
})

const createArticleCard = (article) => {
    const card = document.createElement('dive');
    card.className = 'card mt-4';
    card.innerHTML = `
    <div class="card-body">
        <h4 class="card-title">${article.title}</h4>
        <div class="card-subtitle text-muted mb-2">
            ${new Date(article.created_at).toDateString()}
        </div>
        <div class="card-text mb-2">${article.description}</div>
        <a href="/dashboard/article/${article.slug}" class="btn btn-primary">Read More</a>
        <a href="/dashboard/article/edit/${article._id}" class="btn btn-info">Edit</a>
        <form action="/dashboard/article/${article._id}?_method=DELETE" method="POST" class="d-inline">
            <button type="submit" class="btn btn-danger">Delete</button>
        </form>
    </div>`;
    const loadBtn = document.getElementById('load-btn');
    document.getElementById('main-page-load').insertBefore(card, loadBtn);
}
