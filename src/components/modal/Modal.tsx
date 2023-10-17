import { useRef, type Signal } from "cinnabun"
import { ComponentChildren, ComponentProps } from "cinnabun/types"
import { KeyboardListener, NavigationListener } from "cinnabun/listeners"
import { FadeInOut, Transition } from "cinnabun-transitions"
import "./Modal.css"

type ModalGestureProps = {
  closeOnClickOutside?: boolean
  closeOnEscape?: boolean
}
const defaultGestures: ModalGestureProps = {
  closeOnClickOutside: true,
  closeOnEscape: true,
}

type ModalProps = {
  watch: Signal<any>
  visible: () => boolean
  toggle: (e: Event) => void
  onclose?: () => void
  onUnmount?: () => void
  gestures?: ModalGestureProps
  size?: "lg" | "md" | "sm"
}
export const Modal = (
  { watch, visible, toggle, onclose, onUnmount, gestures = {}, size = "sm" }: ModalProps,
  children: ComponentChildren
) => {
  const _gestures = { ...defaultGestures, ...gestures }
  const { closeOnClickOutside, closeOnEscape } = _gestures

  const outerRef = useRef()

  return (
    <FadeInOut
      properties={[{ name: "opacity", from: 0, to: 1, ms: 350 }]}
      className="modal-outer"
      tabIndex={-1}
      watch={watch}
      ref={outerRef}
      bind:visible={() => {
        const isVisible = visible()
        if (!isVisible && onclose) onclose()
        return isVisible
      }}
      onclick={(e: MouseEvent) => {
        const target = e.target as HTMLElement
        if (target === outerRef.value && closeOnClickOutside) toggle(e)
      }}
      cancelExit={() => {
        if (onUnmount) onUnmount()
        return visible()
      }}
    >
      <div tag="div" className="modal-wrapper">
        <Transition
          className={`modal ${size}`}
          properties={[{ name: "translate", from: "0 -5rem", to: "0 0", ms: 350 }]}
          watch={watch}
          bind:visible={visible}
          cancelExit={visible}
        >
          <KeyboardListener keys={["Escape"]} onCapture={(_, e) => closeOnEscape && toggle(e)} />
          {children}
        </Transition>
      </div>
    </FadeInOut>
  )
}

export const ModalHeader = (props: ComponentProps, children: ComponentChildren) => {
  return (
    <div className={`modal-header ${props.className ?? ""}`} {...props}>
      {children}
    </div>
  )
}

export const ModalBody = (props: ComponentProps, children: ComponentChildren) => {
  return (
    <div className={`modal-body ${props.className ?? ""}`} {...props}>
      {children}
    </div>
  )
}

export const ModalFooter = (props: ComponentProps, children: ComponentChildren) => {
  return (
    <div className={`modal-footer ${props.className ?? ""}`} {...props}>
      {children}
    </div>
  )
}
