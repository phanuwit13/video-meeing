import { create } from 'zustand'

type LoadingBackdrop = {
  isShow: boolean
  onShow: () => void
  onClose: () => void
}

const initialState = {
  isShow: false,
}

export const useLoadingBackdrop = create<LoadingBackdrop>()((set) => ({
  ...initialState,
  onShow: () => {
    set({ isShow: true })
  },
  onClose: () => {
    set({ isShow: false })
  },
}))
