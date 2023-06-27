import { useRef } from 'react'

type Initializer<T> = T | (() => T)
const isFunction = (arg: any): arg is Function => typeof arg === 'function'

const useSingleton = <T>(initialValueOrFunc: Initializer<T>): T => {
	const ref = useRef<T>()
	if (!ref.current) {
		ref.current = isFunction(initialValueOrFunc)
			? initialValueOrFunc()
			: initialValueOrFunc
	}
	return ref.current
}

export default useSingleton
