// Material properties (course notes "Propiedades de los materiales"). Any consistent units.

/** Hooke's law in the proportional range: σ = E·ε. */
export function hooke(E: number, strain: number): number {
  return E * strain;
}

/** Young's modulus from a point of the straight part of the σ–ε diagram: E = tan β = σ_P / ε_P. */
export function youngModulus(sigmaP: number, epsilonP: number): number {
  return sigmaP / epsilonP;
}

/** Admissible (working) stress: σ_adm = σ_E / ν, with the safety factor ν = 2…4. */
export function admissibleStress(sigmaE: number, nu: number): number {
  return sigmaE / nu;
}

/** Resilience up to σ_e: the triangle under the elastic line, U = ½·σ_e² / E (energy per unit volume). */
export function resilience(sigmaE: number, E: number): number {
  return (sigmaE * sigmaE) / (2 * E);
}

/** Unit elongation ε = Δl / l_o and nominal stress σ = F / A_o of a tensile test. */
export const strain = (dl: number, l0: number) => dl / l0;
export const nominalStress = (F: number, A0: number) => F / A0;
