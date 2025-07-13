function useUserInput () {
  let _isArrowLeftPressed = false;
  let _isArrowRightPressed = false;

  const isArrowLeftPressed = () => {
    return _isArrowLeftPressed;
  }
  const isArrowRightPressed = () => {
    return _isArrowRightPressed;
  }

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      _isArrowRightPressed = true;
    }
    if (event.key === 'ArrowLeft') {
      _isArrowLeftPressed = true
    }
  }
  const handleKeyUp = (event: KeyboardEvent) => {
    if (event.key === 'ArrowRight') {
      _isArrowRightPressed = false;
    }
    if (event.key === 'ArrowLeft') {
      _isArrowLeftPressed = false;
    }
  }

  const register = () => {
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
  }

  const unregister = () => {
    window.removeEventListener('keydown', handleKeyDown)
    window.removeEventListener('keyup', handleKeyUp)
  }

  return {
    isArrowLeftPressed,
    isArrowRightPressed,
    register,
    unregister
  }
}

export const sharedUserInput = useUserInput();