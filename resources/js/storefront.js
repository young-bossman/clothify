document.addEventListener('DOMContentLoaded', async () => {
    const grid = document.getElementById('productGrid')
    const empty = document.getElementById('emptyState')

    const res = await fetch('/api/v1/products/public')
    const data = await res.json()

    if (!data.data.length) {
        empty.classList.remove('hidden')
        return
    }

    data.data.forEach(product => {
        const card = document.createElement('div')
        card.className = 'bg-gray-800 rounded-xl overflow-hidden shadow'

        card.innerHTML = `
            <img src="/storage/${product.image ?? 'placeholder.png'}"
                 class="h-48 w-full object-cover">

            <div class="p-4">
                <h3 class="font-semibold">${product.name}</h3>
                <p class="text-indigo-400 font-bold mt-2">
                    GHS ${product.price}
                </p>
            </div>
        `

        grid.appendChild(card)
    })
})
