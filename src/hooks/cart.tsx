import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Product): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      const cartItemsStringfied = await AsyncStorage.getItem(
        '@GoMarketplace: CartItems',
      );

      if (cartItemsStringfied) {
        const parsedCartItems = JSON.parse(cartItemsStringfied);
        setProducts(parsedCartItems);
        // setProducts([]); //For testing
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Omit<Product, 'quantity'>) => {
      let newProductsInCartArray;
      const findProductInCart = products.find(item => item.id === product.id);

      if (findProductInCart) {
        newProductsInCartArray = products.map(item => {
          if (item.id === product.id) {
            const newItemQuantity = item.quantity + 1;
            const newProductInCart = {
              ...product,
              quantity: newItemQuantity,
            };
            return newProductInCart;
          }
          return item;
        });
      } else {
        newProductsInCartArray = [{ ...product, quantity: 1 }, ...products];
      }

      const stringyfiedProducts = JSON.stringify(newProductsInCartArray);
      await AsyncStorage.setItem(
        '@GoMarketplace: CartItems',
        stringyfiedProducts,
      );
      setProducts(newProductsInCartArray);
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProductsInCartArray = products.map(item => {
        if (item.id === id) {
          const newItemQuantity = item.quantity + 1;
          const newProductInCart = {
            ...item,
            quantity: newItemQuantity,
          };
          return newProductInCart;
        }
        return item;
      });

      const stringyfiedProducts = JSON.stringify(newProductsInCartArray);
      await AsyncStorage.setItem(
        '@GoMarketplace: CartItems',
        stringyfiedProducts,
      );
      setProducts(newProductsInCartArray);
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      const newProductsInCartArray = products.map(item => {
        if (item.id === id) {
          const newItemQuantity = item.quantity - 1;
          if (newItemQuantity < 1) {
            return item;
          }
          const newProductInCart = {
            ...item,
            quantity: newItemQuantity,
          };
          return newProductInCart;
        }
        return item;
      });

      // const deletedItemIndex = newProductsInCartArray.findIndex(
      //   product => product.quantity === 0,
      // );
      // if (deletedItemIndex >= 0) {
      //   newProductsInCartArray.splice(deletedItemIndex, 1);
      // }

      const stringyfiedProducts = JSON.stringify(newProductsInCartArray);
      await AsyncStorage.setItem(
        '@GoMarketplace: CartItems',
        stringyfiedProducts,
      );
      setProducts(newProductsInCartArray);
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
