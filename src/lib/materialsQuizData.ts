// 30 multiple-choice questions on the strength-of-materials guides of the app
// (axial load, bending, shear, state of stress, material properties, plane
// areas). Same shape as the Estabilidad quiz (`claudeQuiz.ts`), so it reuses its
// card and grading. Every answer is written to be checkable against the guide
// it comes from.
import type { ClaudeQuizQuestion, ClaudeQuizTopic } from "./claudeQuiz";

type L = { es: string; en: string };

// right answer + 3 distractors. The right one's slot comes from POSITIONS (a
// fixed pattern, so the letters are balanced and the order is stable); the
// distractors are written about as long as the answer so length is no hint.
const POSITIONS = [0, 2, 1, 3, 3, 1, 2, 0];
let counter = 0;

function mc(
  id: string,
  topic: ClaudeQuizTopic,
  statement: L,
  right: L,
  wrong: [L, L, L],
  _pos: number,
  explanation: L,
): ClaudeQuizQuestion {
  const pos = POSITIONS[counter++ % POSITIONS.length];
  const all = [...wrong];
  all.splice(pos, 0, right);
  return {
    id,
    topic,
    type: "mc",
    statement,
    options: { es: all.map((o) => o.es), en: all.map((o) => o.en) },
    correct: pos,
    explanation,
  };
}

export const MATERIALS_QUIZ_TOPICS: Partial<Record<ClaudeQuizTopic, string>> = {
  axil: "Axil",
  flexion: "Flexión",
  corte: "Corte",
  tension: "Estado de tensión",
  materiales: "Materiales",
  superficies: "Superficies planas",
  flecha: "Flecha",
  pandeo: "Pandeo",
};

export const MATERIALS_QUIZ_QUESTIONS: ClaudeQuizQuestion[] = [
  // ── Axil ───────────────────────────────────────────────────────────────
  mc(
    "ax1",
    "axil",
    {
      es: "En la solicitación axil simple, ¿qué tensión actúa en la sección transversal?",
      en: "In simple axial loading, which stress acts on the cross-section?",
    },
    {
      es: "Solo σ, uniforme: σ = N/A (τ = 0)",
      en: "Only σ, uniform: σ = N/A (τ = 0)",
    },
    [
      {
        es: "σ variable linealmente y τ nula",
        en: "σ varying linearly and τ zero",
      },
      { es: "σ uniforme y τ uniforme", en: "Uniform σ and uniform τ" },
      { es: "Solo τ, uniforme", en: "Only τ, uniform" },
    ],
    0,
    {
      es: "Las secciones planas permanecen planas y paralelas: las distorsiones γ son nulas, y como τ = G·γ también τ = 0. Las equilibrantes ∫τ dA = 0 y ∫σ dA = N dan σ uniforme = N/A.",
      en: "Plane sections stay plane and parallel: the distortions γ are zero, and since τ = G·γ so is τ. The equilibrium conditions ∫τ dA = 0 and ∫σ dA = N give a uniform σ = N/A.",
    },
  ),
  mc(
    "ax2",
    "axil",
    {
      es: "¿Qué establece el principio de Saint-Venant?",
      en: "What does Saint-Venant's principle state?",
    },
    {
      es: "Lejos de la zona de aplicación (a una distancia del orden de la altura h), cargas estáticamente equivalentes producen los mismos efectos",
      en: "Far from the loaded zone (a distance of the order of the depth h), statically equivalent loads produce the same effects",
    },
    [
      {
        es: "En cualquier sección, cerca o lejos de la carga, la tensión es uniforme porque la resultante es la misma",
        en: "In any section, near or far from the load, the stress is uniform because the resultant is the same",
      },
      {
        es: "Una carga axial produce el mismo alargamiento sin importar el material, si su resultante es igual",
        en: "An axial load produces the same elongation whatever the material, if its resultant is the same",
      },
      {
        es: "Las tensiones tangenciales en planos perpendiculares son iguales y concurren a la arista común",
        en: "Shear stresses on perpendicular planes are equal and meet at the common edge",
      },
    ],
    1,
    {
      es: "Junto al extremo cargado σ no es uniforme (depende de cómo se aplica la carga); a ≈ h de distancia solo importa la resultante, y vale σ = N/A.",
      en: "Next to the loaded end σ is not uniform (it depends on how the load is applied); about h away only the resultant matters, and σ = N/A.",
    },
  ),
  mc(
    "ax3",
    "axil",
    {
      es: "En Δl = N·l/(A·E), si se duplica el área de la sección y todo lo demás queda igual, el alargamiento:",
      en: "In Δl = N·l/(A·E), if the cross-sectional area is doubled and all else stays the same, the elongation:",
    },
    { es: "Se reduce a la mitad", en: "Is halved" },
    [
      { es: "Se duplica", en: "Doubles" },
      { es: "No cambia", en: "Does not change" },
      { es: "Se reduce a la cuarta parte", en: "Drops to a quarter" },
    ],
    2,
    {
      es: "Δl es inversamente proporcional a A (y a E): con 2A, Δl/2.",
      en: "Δl is inversely proportional to A (and to E): with 2A, Δl/2.",
    },
  ),
  mc(
    "ax4",
    "axil",
    {
      es: "¿Cuáles son las unidades del módulo de elasticidad E?",
      en: "What are the units of the modulus of elasticity E?",
    },
    {
      es: "Fuerza / superficie (por ejemplo kg/cm²), las de una tensión",
      en: "Force / area (for example kg/cm²), those of a stress",
    },
    [
      {
        es: "Fuerza / longitud (por ejemplo kg/cm), las de una carga distribuida",
        en: "Force / length (for example kg/cm), those of a distributed load",
      },
      {
        es: "Adimensional, porque E = σ/ε es un cociente entre dos magnitudes",
        en: "Dimensionless, because E = σ/ε is a ratio of two quantities",
      },
      {
        es: "Fuerza · longitud (por ejemplo kg·cm), las de un momento",
        en: "Force · length (for example kg·cm), those of a moment",
      },
    ],
    3,
    {
      es: "E = σ/ε y la deformación ε es adimensional, así que E tiene las unidades de σ.",
      en: "E = σ/ε and the strain ε is dimensionless, so E has the units of σ.",
    },
  ),
  mc(
    "ax5",
    "axil",
    {
      es: "En la guía de axil, ¿qué es γ en la relación τ = G·γ?",
      en: "In the axial guide, what is γ in τ = G·γ?",
    },
    {
      es: "La distorsión angular (deformación por corte) de un elemento",
      en: "The angular distortion (shear strain) of an element",
    },
    [
      {
        es: "El peso específico del material, que aparece en los datos del acero",
        en: "The specific weight of the material, which appears in the steel data",
      },
      {
        es: "La deformación específica longitudinal, ΔL/L, que produce la fuerza axil",
        en: "The longitudinal strain, ΔL/L, produced by the axial force",
      },
      {
        es: "El coeficiente de Poisson, que relaciona la deformación transversal con la longitudinal",
        en: "Poisson's ratio, which relates transverse strain to longitudinal strain",
      },
    ],
    1,
    {
      es: "γ es el cambio del ángulo recto de un elemento (la deformación por corte). No confundir con el γ (peso específico) de los datos del acero, que es otra magnitud.",
      en: "γ is the change of an element's right angle (the shear strain). Not to be confused with the γ (specific weight) of the steel data, which is a different quantity.",
    },
  ),
  mc(
    "ax6",
    "axil",
    {
      es: "En axil simple, además de la fuerza axil N, ¿qué esfuerzos de la sección valen cero?",
      en: "In simple axial loading, besides the axial force N, which section forces are zero?",
    },
    {
      es: "El corte Q, el momento flector M_f y el momento torsor M_t",
      en: "The shear Q, the bending moment M_f and the torsional moment M_t",
    },
    [
      {
        es: "Solo el corte Q: los momentos flector y torsor sí pueden actuar en la barra",
        en: "Only the shear Q: bending and torsional moments can still act on the bar",
      },
      {
        es: "Solo los momentos flectores: el corte y la torsión quedan en la sección",
        en: "Only the bending moments: shear and torsion remain in the section",
      },
      {
        es: "Ninguno: en axil simple los seis esfuerzos de la sección son distintos de cero",
        en: "None: in simple axial loading all six section forces are nonzero",
      },
    ],
    2,
    {
      es: "De las seis ecuaciones de equivalencia solo ∫σ dA = N es distinta de cero; ∫τ dA → Q, ∫(τ_xz·y − τ_xy·z) dA → M_t y ∫σ·z dA, ∫σ·y dA → M_f son nulas.",
      en: "Of the six equivalence equations only ∫σ dA = N is nonzero; ∫τ dA → Q, ∫(τ_xz·y − τ_xy·z) dA → M_t and ∫σ·z dA, ∫σ·y dA → M_f are zero.",
    },
  ),

  // ── Flexión ────────────────────────────────────────────────────────────
  mc(
    "fx1",
    "flexion",
    {
      es: "En flexión simple (σ = M·y/J_x), ¿dónde es máxima la tensión normal en una sección?",
      en: "In simple bending (σ = M·y/J_x), where is the normal stress largest in a section?",
    },
    {
      es: "En las fibras más alejadas del eje neutro",
      en: "In the fibres farthest from the neutral axis",
    },
    [
      {
        es: "Sobre el eje neutro, donde y = 0 y la fibra trabaja al máximo",
        en: "On the neutral axis, where y = 0 and the fibre works hardest",
      },
      {
        es: "En el baricentro de la sección, que es donde se concentra el material",
        en: "At the centroid of the section, where the material is concentrated",
      },
      {
        es: "En todas las fibras por igual, porque M es constante en la sección",
        en: "Equally in every fibre, because M is constant over the section",
      },
    ],
    0,
    {
      es: "σ varía linealmente con y: es nula en el eje neutro y máxima donde y es máxima.",
      en: "σ varies linearly with y: it is zero on the neutral axis and largest where y is largest.",
    },
  ),
  mc(
    "fx2",
    "flexion",
    {
      es: "En flexión pura, ∫σ dA = 0. ¿Qué significa?",
      en: "In pure bending, ∫σ dA = 0. What does it mean?",
    },
    {
      es: "La fuerza total de tracción es igual a la de compresión (N = 0); por eso el eje neutro pasa por el baricentro",
      en: "The total tension force equals the compression force (N = 0); that is why the neutral axis passes through the centroid",
    },
    [
      {
        es: "Que las tensiones de tracción y compresión se anulan punto a punto, así que la sección no trabaja",
        en: "That tension and compression stresses cancel point by point, so the section does no work",
      },
      {
        es: "Que las áreas traccionada y comprimida son siempre iguales, sea cual sea la forma de la sección",
        en: "That the tensioned and compressed areas are always equal, whatever the shape of the section",
      },
      {
        es: "Que el momento flector es nulo, porque las fuerzas se compensan en la sección",
        en: "That the bending moment is zero, because the forces balance in the section",
      },
    ],
    1,
    {
      es: "∫σ dA = N = 0 e ∫y dA = 0 ⇒ el eje neutro es baricéntrico. Las fuerzas son iguales; las áreas solo lo son si la sección es simétrica respecto del eje neutro.",
      en: "∫σ dA = N = 0 and ∫y dA = 0 ⇒ the neutral axis is centroidal. The forces are equal; the areas are only equal if the section is symmetric about the neutral axis.",
    },
  ),
  mc(
    "fx3",
    "flexion",
    {
      es: "En flexión recta, el eje neutro:",
      en: "In straight bending, the neutral axis:",
    },
    {
      es: "Pasa por el baricentro y es perpendicular a la línea de fuerzas",
      en: "Passes through the centroid and is perpendicular to the line of forces",
    },
    [
      {
        es: "Coincide con la línea de fuerzas",
        en: "Coincides with the line of forces, since both mark the same direction",
      },
      {
        es: "Está en la fibra más traccionada",
        en: "Lies on the most tensioned fibre, where σ is largest",
      },
      {
        es: "Forma un ángulo α cualquiera con la línea de fuerzas",
        en: "Forms any angle α with the line of forces, depending on the section",
      },
    ],
    2,
    {
      es: "La línea de fuerzas coincide con un eje principal de inercia y el eje neutro es el otro eje principal, baricéntrico.",
      en: "The line of forces coincides with a principal axis of inertia and the neutral axis is the other, centroidal, principal axis.",
    },
  ),
  mc(
    "fx4",
    "flexion",
    {
      es: "¿Cuándo la flexión es oblicua?",
      en: "When is bending oblique?",
    },
    {
      es: "Cuando la línea de fuerzas no coincide con ningún eje principal de inercia (forma un ángulo α con uno de ellos)",
      en: "When the line of forces does not coincide with any principal axis of inertia (it forms an angle α with one of them)",
    },
    [
      {
        es: "Cuando la viga está inclinada respecto de la horizontal y la carga es vertical",
        en: "When the beam is inclined to the horizontal and the load is vertical",
      },
      {
        es: "Cuando además del momento flector actúa un esfuerzo de corte en la sección",
        en: "When a shear force acts in the section besides the bending moment",
      },
      {
        es: "Cuando la sección es asimétrica, aunque la línea de fuerzas coincida con un eje principal",
        en: "When the section is asymmetric, even if the line of forces coincides with a principal axis",
      },
    ],
    0,
    {
      es: "Lo que importa es la posición de la línea de fuerzas respecto de los ejes principales, no la inclinación de la viga ni la presencia de corte.",
      en: "What matters is where the line of forces lies with respect to the principal axes, not the beam's inclination or the presence of shear.",
    },
  ),
  mc(
    "lf1",
    "flexion",
    {
      es: "En flexión simple, ¿qué es la línea de fuerzas?",
      en: "In simple bending, what is the line of forces?",
    },
    {
      es: "La traza del plano de flexión (donde actúan los pares flexores) sobre el plano de la sección",
      en: "The trace of the bending plane (where the bending couples act) on the plane of the section",
    },
    [
      {
        es: "El eje neutro de la sección, la recta donde la tensión normal vale cero",
        en: "The neutral axis of the section, the line where the normal stress is zero",
      },
      {
        es: "La recta que une las fibras más traccionada y más comprimida de la sección",
        en: "The line joining the most tensioned and the most compressed fibres of the section",
      },
      {
        es: "La curva que forma el eje de la viga una vez deformada por las cargas",
        en: "The curve the beam's axis takes once deformed by the loads",
      },
    ],
    0,
    {
      es: "El plano de flexión es el de los pares flexores; cortado con el plano de la sección deja una recta, la línea de fuerzas. Su posición respecto de los ejes principales dice si la flexión es normal u oblicua.",
      en: "The bending plane is the one of the bending couples; cut by the plane of the section it leaves a line, the line of forces. Its position with respect to the principal axes tells whether bending is normal or oblique.",
    },
  ),
  mc(
    "lf2",
    "flexion",
    {
      es: "En una sección circular, ¿cómo es la flexión simple, sea cual sea la dirección de la carga?",
      en: "In a circular section, what kind of simple bending occurs, whatever the direction of the load?",
    },
    {
      es: "Siempre normal (recta): todo par ortogonal por G es de ejes principales",
      en: "Always normal (straight): every orthogonal pair through G is principal",
    },
    [
      {
        es: "Siempre oblicua, porque la sección no tiene un eje fuerte y otro débil que la guíen",
        en: "Always oblique, because the section has no strong and weak axis",
      },
      {
        es: "Oblicua cuando la carga es inclinada y normal cuando la carga es vertical u horizontal",
        en: "Oblique when the load is inclined and normal when the load is vertical",
      },
      {
        es: "No hay flexión posible, porque los dos momentos principales de inercia son iguales",
        en: "No bending is possible, because the principal moments of inertia are equal",
      },
    ],
    0,
    {
      es: "Con J_x = J_y todo par ortogonal por G es principal (el momento centrífugo es nulo respecto de cualquiera). La línea de fuerzas coincide entonces con uno de ellos: α = 0, flexión normal.",
      en: "With J_x = J_y every orthogonal pair through G is principal (the product of inertia is zero about any of them). The line of forces then coincides with one of them: α = 0, normal bending.",
    },
  ),

  // ── Corte ──────────────────────────────────────────────────────────────
  mc(
    "co1",
    "corte",
    {
      es: "En la fórmula de Jourawski τ = Q·S/(J·s), ¿qué es S?",
      en: "In Jourawski's formula τ = Q·S/(J·s), what is S?",
    },
    {
      es: "El momento estático, respecto del eje neutro, de la parte de la sección a un lado del corte",
      en: "The static moment, about the neutral axis, of the part of the section on one side of the cut",
    },
    [
      {
        es: "El área de toda la sección transversal, que es la que resiste el corte",
        en: "The area of the whole cross-section, which is what resists the shear",
      },
      {
        es: "El módulo resistente de la sección, W = J/y máx",
        en: "The section modulus, W = J/y max",
      },
      {
        es: "El momento de inercia de la parte de la sección que queda a un lado del corte",
        en: "The moment of inertia of the part of the section on one side of the cut",
      },
    ],
    2,
    {
      es: "S es el momento estático del área Ω que quedaría deslizando, respecto del eje neutro de toda la sección.",
      en: "S is the static moment of the area Ω that would slide, about the neutral axis of the whole section.",
    },
  ),
  mc(
    "co2",
    "corte",
    {
      es: "Según el teorema de Cauchy, las tensiones tangenciales en dos planos perpendiculares:",
      en: "According to Cauchy's theorem, the shear stresses on two perpendicular planes:",
    },
    {
      es: "Son iguales (τ_xy = τ_yx) y las dos llegan a la arista común o las dos se alejan de ella",
      en: "Are equal (τ_xy = τ_yx) and either both point to the common edge or both away from it",
    },
    [
      {
        es: "Son iguales y de sentidos opuestos respecto de la arista común",
        en: "They are equal and of opposite sense about the common edge",
      },
      {
        es: "Son distintas: la del plano horizontal es el doble de la del vertical",
        en: "They are different: that on the horizontal plane is double that on the vertical",
      },
      {
        es: "Son siempre nulas cuando actúa una tensión normal en el elemento",
        en: "They are always zero when a normal stress acts on the element",
      },
    ],
    0,
    {
      es: "Es el equilibrio de momentos del elemento: las tangenciales perpendiculares a la arista común son iguales y forman un par que equilibra al otro.",
      en: "It is the moment equilibrium of the element: the shears perpendicular to the common edge are equal and form a couple balancing the other.",
    },
  ),
  mc(
    "co3",
    "corte",
    {
      es: "En una sección rectangular sometida a corte, ¿dónde vale τ máxima y cuánto?",
      en: "In a rectangular section under shear, where is τ largest and how much?",
    },
    {
      es: "En el eje neutro, τ máx = 3/2 · Q/A",
      en: "At the neutral axis, τ max = 3/2 · Q/A",
    },
    [
      {
        es: "En las fibras extremas, τ máx = Q/A",
        en: "At the extreme fibres, τ max = Q/A",
      },
      {
        es: "En el eje neutro, τ máx = Q/A",
        en: "At the neutral axis, τ max = Q/A",
      },
      {
        es: "En las fibras extremas, τ máx = 3/2 · Q/A",
        en: "At the extreme fibres, τ max = 3/2 · Q/A",
      },
    ],
    1,
    {
      es: "τ sigue una parábola: nula en las fibras extremas (S = 0) y máxima en el eje neutro, 1,5 veces la media Q/A.",
      en: "τ follows a parabola: zero at the extreme fibres (S = 0) and largest at the neutral axis, 1.5 times the mean Q/A.",
    },
  ),

  mc(
    "co4",
    "corte",
    {
      es: "En una viga en flexión pura (Q = 0), ¿qué tensión tangencial da la fórmula de Jourawski, τ = Q·S/(J·s)?",
      en: "In a beam under pure bending (Q = 0), what shear stress does Jourawski's formula, τ = Q·S/(J·s), give?",
    },
    {
      es: "Cero: como dM = Q·dx = 0, la fuerza N_Ω no cambia entre dos secciones y no hay nada que resista el deslizamiento",
      en: "Zero: since dM = Q·dx = 0, the force N_Ω does not change between two sections and there is nothing for the sliding to resist",
    },
    [
      {
        es: "Máxima en el eje neutro: el momento flector la produce aunque no haya corte",
        en: "Maximum at the neutral axis: the bending moment produces it even with no shear",
      },
      {
        es: "Uniforme e igual a M/A en toda la sección, porque la fórmula no depende de Q",
        en: "Uniform and equal to M/A over the whole section, because the formula does not depend on Q",
      },
      {
        es: "Indeterminada: la fórmula solo vale cuando también hay momento torsor",
        en: "Undetermined: the formula only holds when there is also a torsional moment",
      },
    ],
    0,
    {
      es: "τ aparece porque el momento cambia a lo largo de la viga (dM = Q·dx): N_Ω pasa a N_Ω + dN_Ω y la diferencia la toma la tensión tangencial. Sin corte no hay dT.",
      en: "τ appears because the moment changes along the beam (dM = Q·dx): N_Ω becomes N_Ω + dN_Ω and the difference is taken by the shear stress. With no shear there is no dT.",
    },
  ),
  mc(
    "co5",
    "corte",
    {
      es: "En Jourawski, la tensión tangencial calculada en la sección transversal también actúa en la superficie de corte paralela al eje de la viga. ¿Qué lo justifica?",
      en: "In Jourawski's derivation, the shear stress computed on the cross-section also acts on the cut surface parallel to the beam's axis. What justifies this?",
    },
    {
      es: "El teorema de Cauchy: en planos perpendiculares las tangenciales (normales a la arista común) son iguales",
      en: "Cauchy's theorem: on perpendicular planes the shear stresses (normal to the common edge) are equal",
    },
    [
      {
        es: "La hipótesis de Bernoulli: las secciones planas permanecen planas al flexar",
        en: "Bernoulli's hypothesis: plane sections remain plane under bending",
      },
      {
        es: "El principio de Saint-Venant: lejos de la carga solo importa la resultante",
        en: "Saint-Venant's principle: far from the load only the resultant matters",
      },
      {
        es: "La ley de Hooke: la tensión tangencial es proporcional a la distorsión γ",
        en: "Hooke's law: shear stress is proportional to the distortion γ",
      },
    ],
    0,
    {
      es: "Por Cauchy τ_xy = τ_yx: la τ de la sección es igual a la longitudinal sobre el corte paralelo al eje, y de esa igualdad sale dT = τ·s·dx = dN_Ω.",
      en: "By Cauchy τ_xy = τ_yx: the τ on the section equals the longitudinal one on the cut parallel to the axis, and from that equality dT = τ·s·dx = dN_Ω.",
    },
  ),

  // ── Estado de tensión ──────────────────────────────────────────────────
  mc(
    "te1",
    "tension",
    {
      es: "¿Cuántas componentes independientes tiene el tensor de tensiones en un punto?",
      en: "How many independent components does the stress tensor have at a point?",
    },
    { es: "6 (es simétrico)", en: "6 (it is symmetric)" },
    [
      {
        es: "9 (una por cada par de ejes, sin simetría)",
        en: "9 (one per pair of axes, no symmetry)",
      },
      { es: "3 (una por cada eje)", en: "3 (one per axis)" },
      {
        es: "4 (σ en x, y, z y una sola τ)",
        en: "4 (σ in x, y, z and a single τ)",
      },
    ],
    3,
    {
      es: "Tiene 9 componentes pero, por el teorema de Cauchy (τ_ij = τ_ji), solo 6 son independientes: σx, σy, σz, τxy, τxz, τyz.",
      en: "It has 9 components but, by Cauchy's theorem (τ_ij = τ_ji), only 6 are independent: σx, σy, σz, τxy, τxz, τyz.",
    },
  ),
  mc(
    "te2",
    "tension",
    {
      es: "¿Cómo se clasifica un estado de tensión en simple, doble o triple?",
      en: "How is a state of stress classified as simple, double or triple?",
    },
    {
      es: "Según cuántas tensiones principales son distintas de cero (1, 2 o 3)",
      en: "By how many principal stresses are nonzero (1, 2 or 3)",
    },
    [
      {
        es: "Según cuántas tensiones tangenciales distintas de cero hay en el elemento",
        en: "By how many nonzero shear stresses there are in the element",
      },
      {
        es: "Según el material sea dúctil o frágil, que fija cuántas tensiones soporta",
        en: "By whether the material is ductile or brittle, which sets how many stresses it takes",
      },
      {
        es: "Según el signo de σ: tracción es simple, compresión es doble",
        en: "By the sign of σ: tension is simple, compression is double",
      },
    ],
    0,
    {
      es: "Simple: una σ principal no nula (barra traccionada); doble: dos; triple: tres.",
      en: "Simple: one nonzero principal stress (a bar in tension); double: two; triple: three.",
    },
  ),
  mc(
    "te3",
    "tension",
    {
      es: "Las direcciones principales de un estado de tensión son aquellas en las que:",
      en: "The principal directions of a state of stress are those in which:",
    },
    {
      es: "El plano tiene τ = 0: el vector tensión es normal al plano",
      en: "The plane has τ = 0: the stress vector is normal to the plane",
    },
    [
      {
        es: "El plano tiene τ máxima y la tensión normal es nula",
        en: "The plane has maximum τ and zero normal stress",
      },
      {
        es: "El plano tiene σ = 0 y el vector tensión es tangente al plano",
        en: "The plane has σ = 0 and the stress vector is tangent to the plane",
      },
      {
        es: "El plano forma 45° con los ejes y σ y τ valen lo mismo",
        en: "The plane is at 45° to the axes and σ and τ are equal",
      },
    ],
    1,
    {
      es: "Se obtienen de (T − σI)·n = 0: sobre los planos principales ρ = σ·n, sin componente tangencial.",
      en: "They come from (T − σI)·n = 0: on the principal planes ρ = σ·n, with no tangential component.",
    },
  ),

  mc(
    "te4",
    "tension",
    {
      es: "Dado el tensor T y la normal n de un plano, ¿cómo se obtiene el vector tensión ρ sobre ese plano?",
      en: "Given the tensor T and a plane's normal n, how is the stress vector ρ on that plane obtained?",
    },
    {
      es: "ρ = T·n; luego σ = ρ·n y τ = √(ρ² − σ²)",
      en: "ρ = T·n; then σ = ρ·n and τ = √(ρ² − σ²)",
    },
    [
      {
        es: "ρ = n / T: se divide la normal por el tensor, y σ = ρ·n",
        en: "ρ = n / T: the normal is divided by the tensor, and σ = ρ·n",
      },
      {
        es: "ρ = det(T)·n, y luego σ = |ρ| y τ = 0",
        en: "ρ = det(T)·n, then σ = |ρ| and τ = 0",
      },
      {
        es: "ρ = T + n, y luego σ = ρ·n y τ = ρ²",
        en: "ρ = T + n, then σ = ρ·n and τ = ρ²",
      },
    ],
    2,
    {
      es: "El producto del tensor por la normal da el vector tensión; su proyección sobre n es σ y lo que queda es τ (ρ² = σ² + τ²).",
      en: "The tensor times the normal gives the stress vector; its projection on n is σ and what remains is τ (ρ² = σ² + τ²).",
    },
  ),

  mc(
    "te5",
    "tension",
    {
      es: "En el ejercicio de la guía, el tensor tiene σx = −20, σy = 30, σz = 0, τxy = 10, τxz = 5 y τyz = 0 (MPa). ¿Cuánto vale el primer invariante I1?",
      en: "In the guide's exercise the tensor has σx = −20, σy = 30, σz = 0, τxy = 10, τxz = 5 and τyz = 0 (MPa). What is the first invariant I1?",
    },
    {
      es: "10 MPa: la suma de la diagonal, −20 + 30 + 0",
      en: "10 MPa: the sum of the diagonal, −20 + 30 + 0",
    },
    [
      {
        es: "50 MPa: la suma de los valores absolutos de la diagonal",
        en: "50 MPa: the sum of the absolute values of the diagonal",
      },
      {
        es: "15 MPa: la suma de las tangenciales, 10 + 5 + 0",
        en: "15 MPa: the sum of the shear stresses, 10 + 5 + 0",
      },
      {
        es: "−10 MPa: la misma suma pero con el signo cambiado",
        en: "−10 MPa: the same sum with its sign flipped",
      },
    ],
    0,
    {
      es: "I1 = σx + σy + σz es la traza del tensor y no cambia al girar los ejes; las tangenciales no entran. Acá: −20 + 30 + 0 = 10 MPa.",
      en: "I1 = σx + σy + σz is the trace of the tensor and does not change when the axes are rotated; the shear stresses do not enter. Here: −20 + 30 + 0 = 10 MPa.",
    },
  ),

  // ── Materiales ─────────────────────────────────────────────────────────
  mc(
    "ma1",
    "materiales",
    {
      es: "La ley de Hooke σ = E·ε vale hasta:",
      en: "Hooke's law σ = E·ε holds up to:",
    },
    {
      es: "El límite de proporcionalidad σ_P",
      en: "The proportional limit σ_P",
    },
    [
      { es: "La tensión de rotura σ_Rot", en: "The rupture stress σ_Rot" },
      { es: "La tensión de fluencia σ_Fl", en: "The yield stress σ_Fl" },
      { es: "Cualquier tensión", en: "Any stress" },
    ],
    0,
    {
      es: "Mientras el diagrama σ–ε es una recta (hasta σ_P) la tensión es proporcional a la deformación.",
      en: "While the σ–ε diagram is a straight line (up to σ_P) stress is proportional to strain.",
    },
  ),
  mc(
    "ma2",
    "materiales",
    {
      es: "¿Cómo se obtiene la tensión admisible?",
      en: "How is the allowable stress obtained?",
    },
    {
      es: "σ adm = σ_E / ν, con un coeficiente de seguridad ν entre 2 y 4 (por ejemplo)",
      en: "σ adm = σ_E / ν, with a safety factor ν between 2 and 4 (for example)",
    },
    [
      {
        es: "σ adm = σ_E · ν, con un coeficiente de seguridad ν entre 2 y 4 (por ejemplo)",
        en: "σ adm = σ_E · ν, with a safety factor ν between 2 and 4 (for example)",
      },
      {
        es: "σ adm = σ_Rot − σ_E, la reserva entre el límite elástico y la rotura",
        en: "σ adm = σ_Rot − σ_E, the reserve between the elastic limit and rupture",
      },
      {
        es: "σ adm = E · ε_R, el producto del módulo por la deformación de rotura",
        en: "σ adm = E · ε_R, the modulus times the strain at rupture",
      },
    ],
    1,
    {
      es: "Se divide una tensión característica del material (σ_E, límite elástico) por un coeficiente ν > 1 para quedar del lado seguro.",
      en: "A characteristic stress of the material (σ_E, the elastic limit) is divided by a coefficient ν > 1 to stay on the safe side.",
    },
  ),
  mc(
    "ma3",
    "materiales",
    {
      es: "¿Qué representa el área bajo todo el diagrama σ–ε hasta la rotura?",
      en: "What does the area under the whole σ–ε diagram up to rupture represent?",
    },
    {
      es: "La tenacidad (energía por unidad de volumen que absorbe hasta romper)",
      en: "The toughness (energy per unit volume absorbed until rupture)",
    },
    [
      {
        es: "La resiliencia (energía por unidad de volumen que se recupera al descargar)",
        en: "The resilience (energy per unit volume recovered on unloading)",
      },
      {
        es: "La rigidez (resistencia a deformarse, medida por la pendiente del tramo elástico)",
        en: "The stiffness (resistance to deformation, measured by the slope of the elastic part)",
      },
      {
        es: "La dureza (resistencia a ser rayado o penetrado, que no sale del diagrama)",
        en: "The hardness (resistance to scratching or penetration, which does not come from the diagram)",
      },
    ],
    2,
    {
      es: "La resiliencia es el área solo hasta el límite elástico (U = ½·σ_E²/E, energía recuperable); la tenacidad es toda el área hasta la rotura.",
      en: "Resilience is the area only up to the elastic limit (U = ½·σ_E²/E, recoverable energy); toughness is the whole area up to rupture.",
    },
  ),
  mc(
    "ma4",
    "materiales",
    {
      es: "En el diagrama σ–ε, ¿qué es el módulo de elasticidad E?",
      en: "In the σ–ε diagram, what is the modulus of elasticity E?",
    },
    {
      es: "La pendiente de la recta elástica: E = tg β",
      en: "The slope of the elastic line: E = tg β",
    },
    [
      {
        es: "La ordenada de la tensión de rotura",
        en: "The ordinate of the rupture stress",
      },
      { es: "El área bajo la curva", en: "The area under the curve" },
      {
        es: "La deformación en el punto de fluencia",
        en: "The strain at the yield point",
      },
    ],
    3,
    {
      es: "En el tramo proporcional (hasta σ_P) vale σ = E·ε, así que E es la pendiente de esa recta (tangente del ángulo β que forma con el eje ε).",
      en: "In the proportional range (up to σ_P) σ = E·ε holds, so E is the slope of that line (tangent of the angle β it makes with the ε axis).",
    },
  ),

  mc(
    "ma5",
    "materiales",
    {
      es: "¿Qué caracteriza a un material dúctil frente a uno frágil?",
      en: "What distinguishes a ductile material from a brittle one?",
    },
    {
      es: "El dúctil tiene un período plástico largo; el frágil rompe casi sin deformación plástica",
      en: "The ductile one has a long plastic period; the brittle one breaks with almost no plastic strain",
    },
    [
      {
        es: "El dúctil tiene mayor módulo E, por eso se deforma menos antes de romper",
        en: "The ductile one has a larger modulus E, so it strains less before rupture",
      },
      {
        es: "El frágil tiene un período plástico largo y rompe con gran deformación permanente",
        en: "The brittle one has a long plastic period and breaks with large permanent strain",
      },
      {
        es: "El dúctil no tiene zona elástica: entra en fluencia desde la primera carga",
        en: "The ductile one has no elastic zone: it yields from the first load",
      },
    ],
    0,
    {
      es: "La ductilidad se mide por la deformación en el período plástico (entre σ_E y la rotura), no por E.",
      en: "Ductility is measured by the strain in the plastic period (between σ_E and rupture), not by E.",
    },
  ),

  // ── Superficies planas ─────────────────────────────────────────────────
  mc(
    "su1",
    "superficies",
    {
      es: "Una figura se divide en F1 y F2 por un eje y_G baricéntrico de la figura entera. ¿Qué relación hay entre los momentos estáticos de F1 y F2 respecto de y_G?",
      en: "A figure is split into F1 and F2 by a centroidal axis y_G of the whole figure. What is the relation between the static moments of F1 and F2 about y_G?",
    },
    {
      es: "Son iguales en valor absoluto y de signo contrario: S(F1) = −S(F2), o sea F1·d1 = F2·d2",
      en: "They are equal in absolute value and of opposite sign: S(F1) = −S(F2), i.e. F1·d1 = F2·d2",
    },
    [
      {
        es: "Son iguales y del mismo signo, así que su suma duplica el momento de cada parte",
        en: "They are equal and of the same sign, so their sum doubles the moment of each part",
      },
      {
        es: "Son nulos los dos, porque y_G pasa por el baricentro de la figura entera",
        en: "Both are zero, because y_G passes through the centroid of the whole figure",
      },
      {
        es: "S(F1) = F1 y S(F2) = F2: cada uno es igual al área de su parte",
        en: "S(F1) = F1 and S(F2) = F2: each equals the area of its part",
      },
    ],
    1,
    {
      es: "El momento estático de la figura entera respecto de un eje baricéntrico es cero, y es la suma de los de las partes: S(F1) + S(F2) = 0.",
      en: "The static moment of the whole figure about a centroidal axis is zero, and it is the sum of those of the parts: S(F1) + S(F2) = 0.",
    },
  ),
  mc(
    "su3",
    "superficies",
    {
      es: "El teorema de Steiner (ejes paralelos) dice que, si x_G es baricéntrico y x paralelo a distancia d:",
      en: "Steiner's theorem (parallel axes) says that, if x_G is centroidal and x is parallel at distance d:",
    },
    { es: "J_x = J_xG + A·d²", en: "J_x = J_xG + A·d²" },
    [
      { es: "J_x = J_xG + A·d", en: "J_x = J_xG + A·d" },
      { es: "J_x = J_xG − A·d²", en: "J_x = J_xG − A·d²" },
      { es: "J_x = J_xG · A·d²", en: "J_x = J_xG · A·d²" },
    ],
    0,
    {
      es: "Se suma A·d², siempre positivo: por eso el momento de inercia es mínimo respecto del eje baricéntrico.",
      en: "A·d² is added, always positive: that is why the moment of inertia is smallest about the centroidal axis.",
    },
  ),
  mc(
    "su5",
    "superficies",
    {
      es: "El momento de inercia de un rectángulo de base b y altura h respecto de su eje baricéntrico paralelo a la base es:",
      en: "The moment of inertia of a rectangle of base b and height h about its centroidal axis parallel to the base is:",
    },
    { es: "b·h³/12", en: "b·h³/12" },
    [
      { es: "b·h³/3", en: "b·h³/3" },
      { es: "b³·h/12", en: "b³·h/12" },
      { es: "b·h²/6", en: "b·h²/6" },
    ],
    0,
    {
      es: "J_xG = b·h³/12. Respecto del lado (base) vale b·h³/3, que sale de sumar A·d² con d = h/2. b·h²/6 es el módulo resistente W.",
      en: "J_xG = b·h³/12. About the base side it is b·h³/3, which comes from adding A·d² with d = h/2. b·h²/6 is the section modulus W.",
    },
  ),
  mc(
    "su6",
    "superficies",
    {
      es: "Si una figura tiene un eje de simetría, ese eje y la perpendicular a él por el baricentro:",
      en: "If a figure has an axis of symmetry, that axis and the perpendicular to it through the centroid:",
    },
    {
      es: "Son ejes principales centrales de inercia (J_xy = 0)",
      en: "Are central principal axes of inertia (J_xy = 0)",
    },
    [
      {
        es: "Tienen el mismo momento de inercia, porque la figura es simétrica",
        en: "Have the same moment of inertia, because the figure is symmetric",
      },
      {
        es: "Dan el producto de inercia máximo, ya que los dos lados se suman",
        en: "Give the maximum product of inertia, since the two sides add up",
      },
      {
        es: "No son ejes principales: solo lo son si la figura es un cuadrado o un círculo",
        en: "Are not principal axes: they are only so if the figure is a square or a circle",
      },
    ],
    2,
    {
      es: "Por cada elemento a un lado del eje de simetría hay otro simétrico con x de signo opuesto, así que J_xy = ∫xy dA = 0.",
      en: "For each element on one side of the symmetry axis there is a mirror one with x of opposite sign, so J_xy = ∫xy dA = 0.",
    },
  ),

  // ── Flecha ─────────────────────────────────────────────────────────────
  mc(
    "fl1",
    "flecha",
    {
      es: "¿Qué relación liga la curvatura de la elástica con el momento flector?",
      en: "Which relation links the curvature of the elastic line with the bending moment?",
    },
    { es: "1/ρ = M/(E·J)", en: "1/ρ = M/(E·J)" },
    [
      { es: "1/ρ = M·E·J", en: "1/ρ = M·E·J" },
      { es: "1/ρ = M/(E·A)", en: "1/ρ = M/(E·A)" },
      { es: "1/ρ = Q/(G·A)", en: "1/ρ = Q/(G·A)" },
    ],
    0,
    {
      es: "Es la ecuación base de la flecha: la curvatura es proporcional al momento e inversamente proporcional a la rigidez a flexión E·J.",
      en: "It is the basic deflection equation: curvature is proportional to the moment and inversely proportional to the bending stiffness E·J.",
    },
  ),
  mc(
    "fl2",
    "flecha",
    {
      es: "Una viga simplemente apoyada de luz l con carga uniforme q tiene su flecha máxima:",
      en: "A simply supported beam of span l under a uniform load q has its maximum deflection:",
    },
    {
      es: "En el centro del tramo, f = 5·q·l⁴/(384·E·J)",
      en: "At midspan, f = 5·q·l⁴/(384·E·J)",
    },
    [
      {
        es: "En los apoyos, f = 5·q·l⁴/(384·E·J)",
        en: "At the supports, f = 5·q·l⁴/(384·E·J)",
      },
      {
        es: "En el centro, f = q·l³/(3·E·J)",
        en: "At midspan, f = q·l³/(3·E·J)",
      },
      {
        es: "En el centro, f = q·l²/(8·E·J)",
        en: "At midspan, f = q·l²/(8·E·J)",
      },
    ],
    1,
    {
      es: "Por simetría el máximo está en el centro; en los apoyos la flecha es nula. El 5/384 sale de integrar dos veces M/(E·J).",
      en: "By symmetry the maximum is at midspan; at the supports the deflection is zero. The 5/384 comes from integrating M/(E·J) twice.",
    },
  ),
  mc(
    "fl3",
    "flecha",
    {
      es: "En un voladizo con carga puntual P en el extremo (f = P·l³/(3·E·J)), si se duplica la longitud l:",
      en: "In a cantilever with a point load P at the tip (f = P·l³/(3·E·J)), if the length l is doubled:",
    },
    {
      es: "La flecha se multiplica por 8",
      en: "The deflection is multiplied by 8",
    },
    [
      { es: "La flecha se duplica", en: "The deflection doubles" },
      {
        es: "La flecha se multiplica por 4",
        en: "The deflection is multiplied by 4",
      },
      {
        es: "La flecha se multiplica por 16",
        en: "The deflection is multiplied by 16",
      },
    ],
    2,
    {
      es: "f es proporcional a l³: 2³ = 8.",
      en: "f is proportional to l³: 2³ = 8.",
    },
  ),

  mc(
    "fl4",
    "flecha",
    {
      es: "En f = P·l³/(3·E·J), si se duplica el momento de inercia J de la sección, la flecha:",
      en: "In f = P·l³/(3·E·J), if the section's moment of inertia J is doubled, the deflection:",
    },
    { es: "Se reduce a la mitad", en: "Is halved" },
    [
      { es: "Se duplica", en: "Doubles" },
      { es: "No cambia", en: "Does not change" },
      { es: "Se reduce a la cuarta parte", en: "Drops to a quarter" },
    ],
    3,
    {
      es: "f es inversamente proporcional a E·J: con 2J, f/2.",
      en: "f is inversely proportional to E·J: with 2J, f/2.",
    },
  ),

  // ── Pandeo ─────────────────────────────────────────────────────────────
  mc(
    "pa1",
    "pandeo",
    {
      es: "La carga crítica de Euler es Fk = π²·E·J/(c²·l²). ¿Qué momento de inercia J se usa?",
      en: "Euler's critical load is Fk = π²·E·J/(c²·l²). Which moment of inertia J is used?",
    },
    {
      es: "El mínimo de la sección (J_min): la barra pandea por el eje débil",
      en: "The minimum of the section (J_min): the bar buckles about its weak axis",
    },
    [
      {
        es: "El máximo de la sección (J_max): la barra pandea por el eje fuerte",
        en: "The maximum of the section (J_max): the bar buckles about its strong axis",
      },
      {
        es: "El polar J_0 = J_x + J_y, que mide la resistencia total de la sección",
        en: "The polar J_0 = J_x + J_y, which measures the total resistance of the section",
      },
      {
        es: "El de cualquiera de los ejes principales: Fk no depende del eje elegido",
        en: "That of either principal axis: Fk does not depend on the axis chosen",
      },
    ],
    1,
    {
      es: "La barra se flexiona hacia donde es menos rígida, y ahí J es el menor.",
      en: "The bar bends where it is least stiff, and there J is the smallest.",
    },
  ),
  mc(
    "pa2",
    "pandeo",
    {
      es: "Según el apunte, si la carga F es mayor que la carga crítica Fk el equilibrio de la barra es:",
      en: "According to the notes, if the load F is greater than the critical load Fk the bar's equilibrium is:",
    },
    { es: "Inestable", en: "Unstable" },
    [
      { es: "Estable", en: "Stable" },
      { es: "Indiferente", en: "Indifferent" },
      {
        es: "Depende solo del material",
        en: "It depends only on the material",
      },
    ],
    0,
    {
      es: "F < Fk equilibrio estable, F = Fk indiferente, F > Fk inestable: la barra pandea.",
      en: "F < Fk stable equilibrium, F = Fk indifferent, F > Fk unstable: the bar buckles.",
    },
  ),
  mc(
    "pa3",
    "pandeo",
    {
      es: "¿Qué coeficiente c corresponde a una barra empotrada en un extremo y libre en el otro (un voladizo comprimido)?",
      en: "Which coefficient c corresponds to a bar fixed at one end and free at the other (a compressed cantilever)?",
    },
    { es: "c = 2", en: "c = 2" },
    [
      { es: "c = 1", en: "c = 1" },
      { es: "c = 0,7", en: "c = 0.7" },
      { es: "c = 0,5", en: "c = 0.5" },
    ],
    3,
    {
      es: "Articulada–articulada c = 1; empotrada–libre c = 2 (carga crítica 4 veces menor); empotrada–articulada 0,7; empotrada–empotrada 0,5.",
      en: "Pinned–pinned c = 1; fixed–free c = 2 (critical load 4 times smaller); fixed–pinned 0.7; fixed–fixed 0.5.",
    },
  ),
  mc(
    "pa4",
    "pandeo",
    {
      es: "Con la esbeltez λ = l₀/i_min, ¿qué pasa con la tensión crítica σk = π²·E/λ² cuando λ aumenta?",
      en: "With the slenderness λ = l₀/i_min, what happens to the critical stress σk = π²·E/λ² as λ increases?",
    },
    {
      es: "Disminuye (es la hipérbola de Euler): la barra más esbelta pandea con menos tensión",
      en: "Decreases (Euler's hyperbola): a more slender bar buckles at a lower stress",
    },
    [
      {
        es: "Aumenta, porque la barra esbelta tiene más material para resistir",
        en: "Increases, because the slender bar has more material to resist",
      },
      {
        es: "No cambia: σk depende solo del material, no de la forma de la barra",
        en: "Does not change: σk depends only on the material, not on the bar's shape",
      },
      {
        es: "Se anula cuando λ supera 1, porque la barra ya no resiste ninguna tensión",
        en: "Becomes zero once λ exceeds 1, because the bar no longer resists any stress",
      },
    ],
    0,
    {
      es: "σk es inversamente proporcional a λ²; por eso una barra esbelta pandea mucho antes de llegar a la tensión admisible.",
      en: "σk is inversely proportional to λ²; that is why a slender bar buckles long before reaching the allowable stress.",
    },
  ),
];
