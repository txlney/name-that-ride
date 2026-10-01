import { createContext, useContext } from 'react'

// Everything that differs between the games (cars, Pokémon) lives in a variant, see src/variants.
// App provides it, so any component can read it without it being passed down.
export const VariantContext = createContext(null)

export function useVariant() {
    return useContext(VariantContext)
}
