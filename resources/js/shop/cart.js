/**
 * shop/cart.js
 * ─────────────────────────────────────────────
 * Pure cart state — no DOM, no network.
 * Persisted in localStorage so it survives page refresh.
 *
 * Consumers call the exported functions and react to
 * the returned state themselves.
 */

const STORAGE_KEY = 'clothify-cart';

let cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');

export const saveCart = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
};

export const getCart = () => cart;

export const cartTotal = () => cart.reduce((sum, i) => sum + i.price * i.qty, 0);
export const cartCount = () => cart.reduce((sum, i) => sum + i.qty, 0);

export const addToCart = (product) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
        existing.qty++;
    } else {
        cart.push({
            id:    product.id,
            name:  product.name,
            price: parseFloat(product.price),
            image: product.image ?? null,
            qty:   1,
        });
    }
    saveCart();
    return product; // returned so caller can show a toast
};

export const removeFromCart = (id) => {
    cart = cart.filter(i => i.id !== id);
    saveCart();
};

export const changeQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) removeFromCart(id);
    else saveCart();
};

export const clearCart = () => {
    cart = [];
    saveCart();
};
