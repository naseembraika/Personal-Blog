let skip = 3;
document.getElementById('load-articles').addEventListener('click', async () => {
    try {
        const response = await fetch(`/api/blog/load-articles?api_key=3e923e54-525ec33e-69f1b40f-948fcd3e&skip=${skip}`);
        if (response.status != 200) throw new Error("Api key not valid");
        skip += 3;
        const result = await response.json();
        console.log("Result", result);
        
        if (result.status) {
            result.data.forEach(article => {
                createArticlePreview(article);
            })
        } else {
            const loadBtnDiv = document.getElementById('loadBtnDiv');
            loadBtnDiv.remove();
        }
    } catch (error) {
        console.log(error);
    }
})

const createArticlePreview = (article) => {
    const post = `
    <!-- Post preview-->
    <div class="post-preview">
        <a href="/blog/article/${article.slug}">
            <h2 class="post-title">${article.title}</h2>
            <h3 class="post-subtitle">${article.description}</h3>
        </a>
        <p class="post-meta">
            Posted by
            <a href="/blog/author/${article.author.username}">${article.author.name}</a>
            on
            ${new Date(article.created_at).toLocaleDateString('default', { month: 'long' })}
            ${new Date(article.created_at).getDate()},
            ${new Date(article.created_at).getFullYear()}
        </p>
    </div>
    <!-- Divider-->
    <hr class="my-4" />`;
    const loadDiv = document.getElementById('loadBtnDiv');
    loadDiv.insertAdjacentHTML('beforebegin', post);
}