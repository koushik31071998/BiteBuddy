const CART_KEY = "bitebuddy_cart";

export const getCart = () => {
  const data = localStorage.getItem(CART_KEY);
  return data ? JSON.parse(data) : [];
};

export const addToCart = (item) => {
  const cart = getCart();
  cart.push(item);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
};

export const removeFromCart = (id) => {
  const cart = getCart().filter((item) => item.catalogItem !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
};

export const clearCart = () => {
  localStorage.removeItem(CART_KEY);
};
