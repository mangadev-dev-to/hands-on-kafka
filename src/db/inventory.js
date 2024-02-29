class ProductInventory {
  #products;

  constructor() {
    this.#products = new Map();
    this.#products.set("PRODUCT-123", 109);
    this.#products.set("PRODUCT-321", 109);
  }

  product(id) {
    return this.#products.get(id);
  }

  setProduct(id, value) {
    this.#products.set(id, value);
  }
}

// export directly the instance to make it a singleton
export default new ProductInventory();
