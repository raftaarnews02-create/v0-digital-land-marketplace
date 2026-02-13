import { useReducer } from 'react'

const TOAST_LIMIT = 1

export function useToast() {
  const [state, dispatch] = useReducer(reducer, { toasts: [] })

  function toast(props) {
    const id = Math.random().toString(36).substr(2, 9)

    const newToast = {
      ...props,
      id,
      open: true,
    }

    dispatch({ type: 'ADD_TOAST', toast: newToast })

    return {
      id,
      dismiss: () => dispatch({ type: 'DISMISS_TOAST', toastId: id }),
      update: (updatedProps) =>
        dispatch({ type: 'UPDATE_TOAST', toast: { ...updatedProps, id } }),
    }
  }

  return {
    ...state,
    toast,
    dismiss: (toastId) => dispatch({ type: 'DISMISS_TOAST', toastId }),
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT),
      }
    case 'UPDATE_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t,
        ),
      }
    case 'DISMISS_TOAST':
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toastId ? { ...t, open: false } : t,
        ),
      }
    default:
      return state
  }
}
