type Constructor<T> = { new(...props): T }
type ValueOf<T> = T[keyof T];