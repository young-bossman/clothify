/**
 * shop/cart.js
 * ─────────────────────────────────────────────
 * User-bound cart using API when authenticated,
 * with a guest localStorage fallback for unauthenticated shoppers.
 */

const STORAGE_KEY = 'clothify-guest-cart';
const API_BASE = '/api/v1';
let cart = [];
let total = 0;
let count = 0;
let authenticated = false;

const normalizeCartItem = (item) => ({
    id:         item.id,
    product_id: item.product_id ?? item.id,
    variant_id: item.variant_id ?? item.variantId ?? null,
    name:       item.name,
    price:      parseFloat(item.price ?? 0),
    image:      item.image ?? null,
    qty:        parseInt(item.qty ?? item.quantity ?? 1, 10) || 1,
});

const calculateTotals = () => {
    total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
    count = cart.reduce((sum, item) => sum + item.qty, 0);
};

const loadGuestCart = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) {
        return [];
    }

    try {
        const items = JSON.parse(saved) || [];
        return items.map(normalizeCartItem);
    } catch {
        localStorage.removeItem(STORAGE_KEY);
        return [];
    }
};

const saveGuestCart = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
};

const clearGuestCart = () => {
    cart = [];
    total = 0;
    count = 0;
    localStorage.removeItem(STORAGE_KEY);
};

const setCartState = (items) => {
    cart = (items || []).map(normalizeCartItem);
    calculateTotals();
};

const hasGuestCart = () => loadGuestCart().length > 0;

export const initializeCart = async () => {
    try {
        const response = await fetch(`${API_BASE}/cart`, {
            credentials: 'include',
        });

        if (response.status === 401) {
            authenticated = false;
            setCartState(loadGuestCart());
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        authenticated = true;
        setCartState(data.items || []);

        if (hasGuestCart()) {
            await mergeGuestCart();
        }
    } catch (err) {
        console.error('Failed to initialize cart:', err);
        authenticated = false;
        setCartState(loadGuestCart());
    }
};

export const getCart = () => cart;

export const cartTotal = () => total;

export const cartCount = () => count;

const addToCartLocally = (product) => {
    const variantId = product.variant_id ?? product.variantId ?? product.variants?.[0]?.id ?? null;
    const productId = product.product_id ?? product.id;
    const existing = cart.find(i => i.product_id === productId && i.variant_id === variantId);

    if (existing) {
        existing.qty += product.qty ?? 1;
    } else {
        cart.push({
            id:         crypto.randomUUID(),
            product_id: productId,
            variant_id: variantId,
            name:       product.name,
            price:      parseFloat(product.price),
            image:      product.image ?? null,
            qty:        product.qty ?? 1,
        });
    }

    calculateTotals();
    saveGuestCart();
    return product;
};

export const mergeGuestCart = async () => {
    const guestItems = loadGuestCart();
    if (!guestItems.length) {
        return;
    }

    for (const item of guestItems) {
        try {
            await addToCart({
                product_id: item.product_id,
                variant_id: item.variant_id,
                name: item.name,
                price: item.price,
                image: item.image,
                qty: item.qty,
            });
        } catch (err) {
            console.error('Failed to merge guest cart item:', err);
        }
    }

    clearGuestCart();
};

export const addToCart = async (product) => {
    if (!authenticated) {
        try {
            return addToCartLocally(product);
        } catch (err) {
            console.error('Failed to add to guest cart:', err);
            throw err;
        }
    }

    try {
        const variantId = product.variant_id ?? product.variantId ?? product.variants?.[0]?.id ?? null;
        const response = await fetch(`${API_BASE}/cart/add`, {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                product_id: product.id,
                variant_id: variantId,
                qty: product.qty ?? 1,
            }),
        });

        if (response.status === 401) {
            authenticated = false;
            return addToCartLocally(product);
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setCartState(data.items || []);
        return product;
    } catch (err) {
        console.error('Failed to add to cart:', err);
        throw err;
    }
};

export const removeFromCart = async (cartItemId) => {
    if (!authenticated) {
        cart = cart.filter(i => i.id !== cartItemId);
        calculateTotals();
        saveGuestCart();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart/item/${cartItemId}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.status === 401) {
            authenticated = false;
            cart = cart.filter(i => i.id !== cartItemId);
            calculateTotals();
            saveGuestCart();
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setCartState(data.items || []);
    } catch (err) {
        console.error('Failed to remove from cart:', err);
        throw err;
    }
};

export const changeQty = async (cartItemId, newQty) => {
    if (!authenticated) {
        const item = cart.find(i => i.id === cartItemId);
        if (!item) return;

        item.qty = newQty;
        if (item.qty <= 0) {
            cart = cart.filter(i => i.id !== cartItemId);
        }

        calculateTotals();
        saveGuestCart();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart/item/${cartItemId}`, {
            method: 'PATCH',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({ qty: newQty }),
        });

        if (response.status === 401) {
            authenticated = false;
            const item = cart.find(i => i.id === cartItemId);
            if (!item) return;
            item.qty = newQty;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.id !== cartItemId);
            }
            calculateTotals();
            saveGuestCart();
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setCartState(data.items || []);
    } catch (err) {
        console.error('Failed to update quantity:', err);
        throw err;
    }
};

export const clearCart = async () => {
    if (!authenticated) {
        clearGuestCart();
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/cart`, {
            method: 'DELETE',
            credentials: 'include',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (response.status === 401) {
            authenticated = false;
            clearGuestCart();
            return;
        }

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `HTTP ${response.status}`);
        }

        const data = await response.json();
        setCartState(data.items || []);
    } catch (err) {
        console.error('Failed to clear cart:', err);
        throw err;
    }
};

