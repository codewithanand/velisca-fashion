import { createContext, useContext, useReducer, useMemo, useCallback, useEffect } from 'react';
import { orders as dummyOrders } from '../data/orders';
import authService from '../services/authService';
import { setAccessToken, setRefreshToken, setTokenExpiry, clearAuth, getRefreshToken, ensureFreshToken } from '../services/api';

const AppContext = createContext(null);

const initialState = {
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  cart: [],
  wishlist: [],
  orders: dummyOrders,
  isAuthLoading: !!localStorage.getItem('refresh_token'),
  authError: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_AUTH_LOADING':
      return { ...state, isAuthLoading: action.payload };
    case 'SET_USER':
      return { ...state, user: action.payload };
    case 'SET_AUTH_ERROR':
      return { ...state, authError: action.payload };
    case 'CLEAR_AUTH_ERROR':
      return { ...state, authError: null };
    case 'LOGIN':
    case 'SIGNUP':
      return { ...state, user: action.payload, authError: null };
    case 'LOGOUT':
      return { ...state, user: null, authError: null };
    case 'ADD_TO_CART': {
      const { product, quantity = 1 } = action.payload;
      const existing = state.cart.find((item) => item.product.id === product.id);
      if (existing) {
        return {
          ...state,
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      return { ...state, cart: [...state.cart, { product, quantity }] };
    }
    case 'REMOVE_FROM_CART':
      return {
        ...state,
        cart: state.cart.filter((item) => item.product.id !== action.payload),
      };
    case 'UPDATE_QUANTITY': {
      const { productId, quantity } = action.payload;
      if (quantity <= 0) {
        return {
          ...state,
          cart: state.cart.filter((item) => item.product.id !== productId),
        };
      }
      return {
        ...state,
        cart: state.cart.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        ),
      };
    }
    case 'TOGGLE_WISHLIST': {
      const id = action.payload;
      if (state.wishlist.includes(id)) {
        return { ...state, wishlist: state.wishlist.filter((w) => w !== id) };
      }
      return { ...state, wishlist: [...state.wishlist, id] };
    }
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Ensure guest session_id exists for cart
  useEffect(() => {
    let sid = localStorage.getItem('session_id');
    if (!sid) {
      sid = crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2);
      localStorage.setItem('session_id', sid);
    }
  }, []);

  useEffect(() => {
    const token = getRefreshToken();
    if (!token) {
      dispatch({ type: 'SET_AUTH_LOADING', payload: false });
      return;
    }

    let cancelled = false;

    const initAuth = async () => {
      try {
        await ensureFreshToken();
        if (cancelled) return;

        const response = await authService.me();
        if (cancelled) return;
        const user = response.data?.user;
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
          dispatch({ type: 'LOGIN', payload: user });
        }
      } catch {
        if (cancelled) return;
        clearAuth();
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
      } finally {
        if (!cancelled) {
          dispatch({ type: 'SET_AUTH_LOADING', payload: false });
        }
      }
    };

    initAuth();

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (credentials) => {
    dispatch({ type: 'CLEAR_AUTH_ERROR' });
    const response = await authService.login(credentials);
    const { user, access_token, refresh_token: newRefreshToken, expires_in } = response.data || {};
    setAccessToken(access_token);
    setRefreshToken(newRefreshToken);
    if (expires_in) setTokenExpiry(expires_in);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: user });
    return response;
  }, []);

  const signup = useCallback(async (userData) => {
    dispatch({ type: 'CLEAR_AUTH_ERROR' });
    const response = await authService.register(userData);
    const { user, access_token, refresh_token: newRefreshToken, expires_in } = response.data || {};
    setAccessToken(access_token);
    setRefreshToken(newRefreshToken);
    if (expires_in) setTokenExpiry(expires_in);
    localStorage.setItem('user', JSON.stringify(user));
    dispatch({ type: 'SIGNUP', payload: user });
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch {
      // Proceed with local logout even if API call fails
    }
    clearAuth();
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const logoutAll = useCallback(async () => {
    try {
      await authService.logoutAll();
    } catch {
      // Proceed with local logout even if API call fails
    }
    clearAuth();
    localStorage.removeItem('user');
    dispatch({ type: 'LOGOUT' });
  }, []);

  const forgotPassword = useCallback(async (email) => {
    return authService.forgotPassword(email);
  }, []);

  const resetPassword = useCallback(async (data) => {
    return authService.resetPassword(data);
  }, []);

  const addToCart = useCallback(
    (product, quantity = 1) =>
      dispatch({ type: 'ADD_TO_CART', payload: { product, quantity } }),
    []
  );
  const removeFromCart = useCallback(
    (productId) => dispatch({ type: 'REMOVE_FROM_CART', payload: productId }),
    []
  );
  const updateQuantity = useCallback(
    (productId, quantity) =>
      dispatch({ type: 'UPDATE_QUANTITY', payload: { productId, quantity } }),
    []
  );
  const toggleWishlist = useCallback(
    (productId) => dispatch({ type: 'TOGGLE_WISHLIST', payload: productId }),
    []
  );
  const clearAuthError = useCallback(
    () => dispatch({ type: 'CLEAR_AUTH_ERROR' }),
    []
  );

  const value = useMemo(
    () => ({
      user: state.user,
      cart: state.cart,
      wishlist: state.wishlist,
      orders: state.orders,
      isAuthenticated: state.user !== null,
      isAuthLoading: state.isAuthLoading,
      authError: state.authError,
      login,
      signup,
      logout,
      logoutAll,
      forgotPassword,
      resetPassword,
      clearAuthError,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleWishlist,
      isInWishlist: (id) => state.wishlist.includes(id),
      cartTotal: state.cart.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      ),
      cartCount: state.cart.reduce((sum, item) => sum + item.quantity, 0),
    }),
    [
      state,
      login,
      signup,
      logout,
      logoutAll,
      forgotPassword,
      resetPassword,
      clearAuthError,
      addToCart,
      removeFromCart,
      updateQuantity,
      toggleWishlist,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
