const query = document.getElementById("query");
const article = document.querySelector("article");

// Поиск всех текстовых узлов в статье для поиска внутри них.
const treeWalker = document.createTreeWalker(article, NodeFilter.SHOW_TEXT);
const allTextNodes = [];
let currentNode = treeWalker.nextNode();
while (currentNode) {
    allTextNodes.push(currentNode);
    currentNode = treeWalker.nextNode();
}

// Слушаем событие ввода для выполнения поиска.
query.addEventListener("input", () => {
    // Если CSS Custom Highlight API не поддерживается, отображаем сообщение и выходим.
    if (!CSS.highlights) {
        console.error("CSS Custom Highlight API не поддерживается.");
        return;
    }

    // Очищаем HighlightRegistry, чтобы удалить предыдущие результаты поиска.
    CSS.highlights.clear();

    // Очищаем запрос поиска и выходим, если он пуст.
    const str = query.value.trim().toLowerCase();
    if (!str) {
        return;
    }

    // Итерируем по всем текстовым узлам и находим совпадения.
    const ranges = allTextNodes.flatMap((el) => {
        const text = el.textContent.toLowerCase();
        const indices = [];
        let startPos = 0;
        while (startPos < text.length) {
            const index = text.indexOf(str, startPos);
            if (index === -1) break;
            indices.push(index);
            startPos = index + str.length;
        }

        // Создаем объект Range для каждого найденного совпадения.
        return indices.map((index) => {
            const range = new Range();
            range.setStart(el, index);
            range.setEnd(el, index + str.length);
            return range;
        });
    });

    // Создаем объект Highlight для диапазонов.
    if (ranges.length > 0) {
        const searchResultsHighlight = new Highlight();
        ranges.forEach(range => searchResultsHighlight.add(range));

        // Регистрируем объект Highlight в реестре.
        CSS.highlights.set("search-results", searchResultsHighlight);
    }
});
