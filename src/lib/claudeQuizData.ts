// Theory question bank for the "Estabilidad" (Ing. Eléctrica, UTN FRBA)
// first-partial theory quiz. Statements/explanations are academic content
// straight from the course, kept bilingual (es/en) like quizData.ts.
import { ClaudeQuizQuestion, ClaudeQuizTopic } from "./claudeQuiz";

// Display labels per topic, in Spanish. Fallback only — the UI resolves
// topic labels via t("claudeQuiz.topic.*") so they follow the selected
// language; kept in sync with those i18n keys.
export const CLAUDE_QUIZ_TOPICS: Record<ClaudeQuizTopic, string> = {
  fuerzas: "Sistemas de fuerzas",
  vinculos: "Vínculos y GDL",
  cadenas: "Cadenas cinemáticas",
  reticulados: "Reticulados",
};

const VF_ES = ["Verdadero", "Falso"];
const VF_EN = ["True", "False"];

export const CLAUDE_QUIZ_QUESTIONS: ClaudeQuizQuestion[] = [
  // ── Sistemas de fuerzas ────────────────────────────────────────────────
  {
    id: "f1",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "El momento de una fuerza respecto de un punto es un vector perpendicular al plano que forman la fuerza y ese punto.",
      en: "The moment of a force about a point is a vector perpendicular to the plane formed by the force and that point.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "El momento se define como M = r × F, producto vectorial cuyo resultado es perpendicular al plano determinado por r (posición) y F.",
      en: "The moment is defined as M = r × F, a cross product whose result is perpendicular to the plane determined by r (position) and F.",
    },
  },
  {
    id: "f2",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "Una cupla puede equilibrarse mediante una única fuerza.",
      en: "A couple can be balanced by a single force.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Una cupla (par de fuerzas iguales, opuestas y no colineales) tiene resultante nula pero momento no nulo. Solo puede equilibrarse con otra cupla de igual módulo y sentido contrario; nunca con una sola fuerza.",
      en: "A couple (a pair of equal, opposite, non-collinear forces) has zero resultant but nonzero moment. It can only be balanced by another couple of equal magnitude and opposite sense; never by a single force.",
    },
  },
  {
    id: "f3",
    topic: "fuerzas",
    type: "mc",
    statement: {
      es: "Al trasladar una fuerza a un punto que NO está sobre su recta de acción, para conservar la equivalencia se debe agregar:",
      en: "When translating a force to a point that is NOT on its line of action, to preserve equivalence you must add:",
    },
    options: {
      es: [
        "Otra fuerza igual y opuesta",
        "Nada, la traslación es siempre libre",
        "Una cupla (momento) de traslación",
        "Una reacción de vínculo",
      ],
      en: [
        "Another equal and opposite force",
        "Nothing, translation is always free",
        "A translation couple (moment)",
        "A support reaction",
      ],
    },
    correct: 2,
    explanation: {
      es: "Trasladar la fuerza fuera de su recta cambia el momento; para compensar se añade una cupla igual al momento de la fuerza respecto del nuevo punto. Es el fundamento de la reducción a un punto.",
      en: "Moving the force off its line changes the moment; to compensate, a couple equal to the force's moment about the new point is added. This is the basis of reduction to a point.",
    },
  },
  {
    id: "f4",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "El momento de una cupla es independiente del punto respecto del cual se lo calcule.",
      en: "The moment of a couple is independent of the point about which it is computed.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "El momento de una cupla es un vector libre: vale F·d (fuerza por brazo) sea cual sea el punto elegido para tomar momentos.",
      en: "The moment of a couple is a free vector: it equals F·d (force times arm) regardless of the point chosen to take moments.",
    },
  },
  {
    id: "f5",
    topic: "fuerzas",
    type: "mc",
    statement: {
      es: "Los invariantes de un sistema de fuerzas en el espacio son:",
      en: "The invariants of a force system in space are:",
    },
    options: {
      es: [
        "La resultante R y el punto de aplicación",
        "La resultante R y la proyección del momento sobre R (R·M)",
        "El momento respecto de cualquier punto, siempre igual",
        "La suma de los módulos de las fuerzas",
      ],
      en: [
        "The resultant R and the point of application",
        "The resultant R and the projection of the moment onto R (R·M)",
        "The moment about any point, always equal",
        "The sum of the magnitudes of the forces",
      ],
    },
    correct: 1,
    explanation: {
      es: "Invariante vectorial: la resultante R. Invariante escalar: el producto R·M (proyección del momento sobre la dirección de R), que no cambia al variar el centro de reducción.",
      en: "Vector invariant: the resultant R. Scalar invariant: the product R·M (the projection of the moment onto the direction of R), which does not change as the reduction center varies.",
    },
  },
  {
    id: "f6",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "El eje central de un sistema de fuerzas es el lugar geométrico de los puntos donde el momento resultante es mínimo (paralelo a la resultante).",
      en: "The central axis of a force system is the locus of points where the resultant moment is minimum (parallel to the resultant).",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Sobre el eje central el momento tiene módulo mínimo y su dirección coincide con la de la resultante; el sistema queda reducido a un torsor (fuerza + cupla colineal).",
      en: "On the central axis the moment has minimum magnitude and its direction coincides with that of the resultant; the system reduces to a wrench (force + collinear couple).",
    },
  },
  {
    id: "f7",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "Dos sistemas de fuerzas son equivalentes si tienen igual resultante e igual momento resultante respecto de un mismo punto.",
      en: "Two force systems are equivalent if they have equal resultant and equal resultant moment about the same point.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Esa es justamente la definición de equivalencia: mismo vector resultante y mismo momento respecto de un punto (y por lo tanto respecto de cualquier punto).",
      en: "That is precisely the definition of equivalence: the same resultant vector and the same moment about a point (and therefore about any point).",
    },
  },
  {
    id: "f8",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "El teorema de Varignon dice que el momento de la resultante respecto de un punto es igual a la suma de los momentos de cada fuerza componente respecto del mismo punto.",
      en: "Varignon's theorem states that the moment of the resultant about a point equals the sum of the moments of each component force about the same point.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Válido para sistemas con resultante (fuerzas concurrentes o reducibles a una única fuerza). Es una herramienta central para ubicar la recta de acción de la resultante.",
      en: "Valid for systems with a resultant (concurrent forces or systems reducible to a single force). It is a key tool for locating the resultant's line of action.",
    },
  },
  {
    id: "f9",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "El principio de transmisibilidad permite deslizar una fuerza a lo largo de su recta de acción sin alterar su efecto sobre el cuerpo rígido.",
      en: "The principle of transmissibility allows sliding a force along its line of action without altering its effect on a rigid body.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "En el cuerpo rígido, correr la fuerza sobre su propia recta no cambia ni la resultante ni el momento. (Ojo: sí cambia el efecto interno/deformación en cuerpos deformables.)",
      en: "In a rigid body, sliding the force along its own line changes neither the resultant nor the moment. (Note: it does change the internal effect/deformation in deformable bodies.)",
    },
  },
  {
    id: "f10",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "Un sistema de fuerzas paralelas nunca se puede reducir a un binomio de reducción donde la resultante sea distinta de cero y el momento resultante sea igual a cero.",
      en: "A system of parallel forces can never be reduced to a force-couple system where the resultant is nonzero and the resultant moment is zero.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: cuando la resultante de un sistema de fuerzas paralelas no es nula, siempre existe un punto (sobre el eje central) donde el sistema se reduce a esa única fuerza resultante con momento nulo. Solo si la resultante es nula (cupla) esa reducción no es posible.",
      en: "False: when the resultant of a system of parallel forces is nonzero, there is always a point (on the central axis) where the system reduces to that single resultant force with zero moment. Only when the resultant is zero (a couple) is this reduction not possible.",
    },
  },
  {
    id: "f11",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "Si en una sección de un pórtico plano actúa una fuerza concentrada perpendicular al eje de barra, no observamos ninguna particularidad en el diagrama de momentos flexores.",
      en: "If a concentrated force perpendicular to the member axis acts at a section of a plane frame, we observe no particularity in the bending moment diagram.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: una fuerza puntual perpendicular al eje produce un salto en el diagrama de corte (Q) y, en consecuencia, un quiebre (cambio brusco de pendiente) en el diagrama de momento flector en ese punto, ya que dM/dx = Q.",
      en: "False: a point force perpendicular to the axis produces a jump in the shear diagram (Q) and, consequently, a kink (an abrupt change in slope) in the bending moment diagram at that point, since dM/dx = Q.",
    },
  },
  {
    id: "f12",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "El invariante escalar de un sistema de fuerzas en el espacio depende del centro de reducción elegido.",
      en: "The scalar invariant of a force system in space depends on the chosen reduction center.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: el invariante escalar (R·M) es, por definición, independiente del centro de reducción; por eso se lo llama invariante.",
      en: "False: the scalar invariant (R·M) is, by definition, independent of the reduction center; that's why it's called an invariant.",
    },
  },
  {
    id: "f13",
    topic: "fuerzas",
    type: "vf",
    statement: {
      es: "En una viga simplemente apoyada bajo carga uniformemente distribuida, como la de la imagen, el diagrama de corte (Q) es una función polinómica de grado 1 y el diagrama de momento flector (M) es una función polinómica de grado 2.",
      en: "In a simply supported beam under a uniformly distributed load, like the one in the image, the shear diagram (Q) is a degree-1 polynomial function and the bending moment diagram (M) is a degree-2 polynomial function.",
    },
    image: {
      src: "/claude-quiz/simply-supported-beam-udl.svg",
      alt: {
        es: "Viga simplemente apoyada de 10 m con carga uniformemente distribuida q = 10 kN/m",
        en: "10 m simply supported beam with a uniformly distributed load q = 10 kN/m",
      },
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Verdadero: con carga distribuida constante q, dQ/dx = −q (constante) ⇒ Q es lineal (grado 1); y dM/dx = Q (lineal) ⇒ M es una parábola (grado 2).",
      en: "True: with a constant distributed load q, dQ/dx = −q (constant) ⇒ Q is linear (degree 1); and dM/dx = Q (linear) ⇒ M is a parabola (degree 2).",
    },
  },

  // ── Vínculos y grados de libertad ──────────────────────────────────────
  {
    id: "v1",
    topic: "vinculos",
    type: "vf",
    statement: {
      es: "Una chapa rígida en el plano posee tres grados de libertad.",
      en: "A rigid plate in the plane has three degrees of freedom.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "En el plano: dos traslaciones (x, y) y una rotación → 3 GDL. En el espacio serían 6.",
      en: "In the plane: two translations (x, y) and one rotation → 3 DOF. In space it would be 6.",
    },
  },
  {
    id: "v2",
    topic: "vinculos",
    type: "mc",
    statement: {
      es: "Un apoyo móvil (vínculo de primera especie) en el plano restringe:",
      en: "A roller support (first-class support) in the plane restrains:",
    },
    options: {
      es: [
        "2 grados de libertad",
        "3 grados de libertad",
        "Ninguno",
        "1 grado de libertad (una reacción)",
      ],
      en: [
        "2 degrees of freedom",
        "3 degrees of freedom",
        "None",
        "1 degree of freedom (one reaction)",
      ],
    },
    correct: 3,
    explanation: {
      es: "El apoyo móvil impide el desplazamiento en una sola dirección → 1 reacción, 1 GDL restringido. Permite deslizar y rotar.",
      en: "The roller support prevents displacement in a single direction → 1 reaction, 1 DOF restrained. It allows sliding and rotation.",
    },
  },
  {
    id: "v3",
    topic: "vinculos",
    type: "mc",
    statement: {
      es: "Un apoyo fijo o articulación (segunda especie) restringe:",
      en: "A pin support or hinge (second-class support) restrains:",
    },
    options: {
      es: [
        "2 grados de libertad",
        "1 grado de libertad",
        "3 grados de libertad",
        "4 grados de libertad",
      ],
      en: [
        "2 degrees of freedom",
        "1 degree of freedom",
        "3 degrees of freedom",
        "4 degrees of freedom",
      ],
    },
    correct: 0,
    explanation: {
      es: "La articulación impide ambos desplazamientos (x e y) pero permite el giro → 2 reacciones, 2 GDL restringidos.",
      en: "The pin prevents both displacements (x and y) but allows rotation → 2 reactions, 2 DOF restrained.",
    },
  },
  {
    id: "v4",
    topic: "vinculos",
    type: "mc",
    statement: {
      es: "Un empotramiento (tercera especie) restringe:",
      en: "A fixed support (third-class support) restrains:",
    },
    options: {
      es: [
        "2 grados de libertad",
        "1 grado de libertad",
        "3 grados de libertad",
        "Depende de la carga",
      ],
      en: [
        "2 degrees of freedom",
        "1 degree of freedom",
        "3 degrees of freedom",
        "Depends on the load",
      ],
    },
    correct: 2,
    explanation: {
      es: "El empotramiento impide las dos traslaciones y la rotación → 3 reacciones (2 fuerzas + 1 momento), 3 GDL restringidos.",
      en: "The fixed support prevents both translations and the rotation → 3 reactions (2 forces + 1 moment), 3 DOF restrained.",
    },
  },
  {
    id: "v5",
    topic: "vinculos",
    type: "vf",
    statement: {
      es: "Para que una chapa esté isostáticamente sustentada en el plano se requieren exactamente 3 condiciones de vínculo, bien dispuestas.",
      en: "For a plate to be statically-determinately supported in the plane, exactly 3 well-arranged support conditions are required.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "3 GDL de la chapa = 3 condiciones de vínculo. Si son menos → hipostático (móvil); si son más → hiperestático; si están mal dispuestas → vínculo aparente.",
      en: "The plate's 3 DOF = 3 support conditions. Fewer → unstable (mobile); more → statically indeterminate; poorly arranged → apparent (spurious) constraint.",
    },
  },
  {
    id: "v6",
    topic: "vinculos",
    type: "vf",
    statement: {
      es: "Tres apoyos móviles cuyas direcciones (rectas de acción de las reacciones) concurren en un mismo punto sustentan isostáticamente a la chapa.",
      en: "Three roller supports whose directions (lines of action of the reactions) meet at a single point support the plate statically-determinately.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: es un vínculo aparente. Aunque hay 3 condiciones, la chapa puede rotar instantáneamente alrededor del punto de concurrencia. El sistema es inestable (críticamente hipostático).",
      en: "False: this is an apparent (spurious) constraint. Although there are 3 conditions, the plate can rotate instantaneously about the point of concurrence. The system is unstable (critically underconstrained).",
    },
  },
  {
    id: "v7",
    topic: "vinculos",
    type: "vf",
    statement: {
      es: "Tres bielas paralelas constituyen una sustentación isostática válida de una chapa.",
      en: "Three parallel links constitute a valid statically-determinate support for a plate.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: las reacciones paralelas concurren 'en el infinito', dejando libre el desplazamiento perpendicular a ellas. Es otro caso de vínculo aparente → sistema inestable.",
      en: "False: parallel reactions meet 'at infinity', leaving the displacement perpendicular to them unrestrained. This is another case of apparent constraint → unstable system.",
    },
  },
  {
    id: "v8",
    topic: "vinculos",
    type: "mc",
    statement: {
      es: "Se produce un vínculo aparente cuando:",
      en: "An apparent (spurious) constraint occurs when:",
    },
    options: {
      es: [
        "Faltan condiciones de vínculo",
        "El número de condiciones es suficiente pero están mal dispuestas y permiten un movimiento",
        "Sobran condiciones de vínculo",
        "La carga es excesiva",
      ],
      en: [
        "Support conditions are missing",
        "The number of conditions is sufficient but poorly arranged, allowing a motion",
        "There are too many support conditions",
        "The load is excessive",
      ],
    },
    correct: 1,
    explanation: {
      es: "El conteo da bien (p. ej. 3 en el plano) pero la disposición geométrica (reacciones concurrentes o paralelas) deja un grado de libertad libre. Numéricamente parece isostático, cinemáticamente es inestable.",
      en: "The count works out (e.g. 3 in the plane) but the geometric arrangement (concurrent or parallel reactions) leaves a free degree of freedom. Numerically it looks determinate, kinematically it is unstable.",
    },
  },
  {
    id: "v9",
    topic: "vinculos",
    type: "vf",
    statement: {
      es: "En el plano se dispone de tres ecuaciones independientes de equilibrio de la estática.",
      en: "In the plane, three independent equilibrium equations of statics are available.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "ΣFx = 0, ΣFy = 0 y ΣM = 0. Tres ecuaciones ⇒ se pueden despejar hasta tres incógnitas (reacciones) en un problema isostático plano.",
      en: "ΣFx = 0, ΣFy = 0 and ΣM = 0. Three equations ⇒ up to three unknowns (reactions) can be solved for in a plane statically-determinate problem.",
    },
  },
  {
    id: "v10",
    topic: "vinculos",
    type: "vf",
    statement: {
      es: "Un apoyo fijo (articulación de segunda especie) impide la rotación de la chapa respecto de tierra.",
      en: "A pin support (second-class hinge) prevents the plate's rotation relative to the ground.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: la articulación impide los desplazamientos (x e y) pero permite el giro relativo; quien impide la rotación es el empotramiento (tercera especie).",
      en: "False: the pin support prevents displacements (x and y) but allows relative rotation; it is the fixed support (third-class) that prevents rotation.",
    },
  },

  // ── Cadenas cinemáticas ────────────────────────────────────────────────
  {
    id: "c1",
    topic: "cadenas",
    type: "vf",
    statement: {
      es: "Una articulación relativa (vínculo interno de segunda especie) entre dos chapas restringe dos grados de libertad.",
      en: "A relative hinge (second-class internal constraint) between two plates restrains two degrees of freedom.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "La articulación intermedia impide el desplazamiento relativo en x e y entre las chapas, pero permite el giro relativo → restringe 2 GDL.",
      en: "The intermediate hinge prevents relative displacement in x and y between the plates, but allows relative rotation → restrains 2 DOF.",
    },
  },
  {
    id: "c2",
    topic: "cadenas",
    type: "mc",
    statement: {
      es: "Una cadena cinemática abierta de dos chapas posee:",
      en: "An open kinematic chain of two plates has:",
    },
    options: {
      es: [
        "3 grados de libertad",
        "6 grados de libertad",
        "2 grados de libertad",
        "4 grados de libertad",
      ],
      en: [
        "3 degrees of freedom",
        "6 degrees of freedom",
        "2 degrees of freedom",
        "4 degrees of freedom",
      ],
    },
    correct: 3,
    explanation: {
      es: "Dos chapas sueltas: 3 + 3 = 6 GDL. Una articulación relativa quita 2 → 6 − 2 = 4 GDL. Por eso hacen falta 4 condiciones de vínculo externas para fijarla.",
      en: "Two free plates: 3 + 3 = 6 DOF. A relative hinge removes 2 → 6 − 2 = 4 DOF. That's why 4 external support conditions are needed to fix it.",
    },
  },
  {
    id: "c3",
    topic: "cadenas",
    type: "vf",
    statement: {
      es: "Para fijar a tierra una cadena abierta de dos chapas se necesitan cuatro condiciones de vínculo externas.",
      en: "To fix an open chain of two plates to the ground, four external support conditions are needed.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Como la cadena tiene 4 GDL, se requieren 4 condiciones externas bien dispuestas para lograr sustentación isostática.",
      en: "Since the chain has 4 DOF, 4 well-arranged external conditions are required to achieve statically-determinate support.",
    },
  },
  {
    id: "c4",
    topic: "cadenas",
    type: "mc",
    statement: {
      es: "Los grados de libertad de una cadena abierta de n chapas articuladas en serie valen:",
      en: "The degrees of freedom of an open chain of n plates hinged in series equal:",
    },
    options: {
      es: ["n + 2", "3n", "2n − 1", "n − 2"],
      en: ["n + 2", "3n", "2n − 1", "n − 2"],
    },
    correct: 0,
    explanation: {
      es: "3n GDL de las chapas menos 2(n−1) por las (n−1) articulaciones: 3n − 2(n−1) = n + 2. Chequeo: n = 2 → 4 ✔.",
      en: "3n DOF from the plates minus 2(n−1) for the (n−1) hinges: 3n − 2(n−1) = n + 2. Check: n = 2 → 4 ✔.",
    },
  },
  {
    id: "c5",
    topic: "cadenas",
    type: "vf",
    statement: {
      es: "Una cadena cerrada de tres chapas con tres articulaciones relativas no alineadas equivale a una única chapa rígida.",
      en: "A closed chain of three plates with three non-aligned relative hinges is equivalent to a single rigid plate.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "El triángulo articulado (tres chapas, tres articulaciones no colineales) es indeformable: se comporta como una sola chapa de 3 GDL. Es la base del reticulado triangulado.",
      en: "The hinged triangle (three plates, three non-collinear hinges) is undeformable: it behaves as a single plate with 3 DOF. This is the basis of the triangulated truss.",
    },
  },
  {
    id: "c6",
    topic: "cadenas",
    type: "vf",
    statement: {
      es: "En las cadenas cinemáticas pueden aparecer vínculos aparentes internos, no solo externos.",
      en: "Apparent (spurious) internal constraints can occur in kinematic chains, not only external ones.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Sí: por ejemplo, tres articulaciones relativas alineadas entre chapas dan un vínculo aparente interno que permite un movimiento (rotación instantánea) aunque el conteo cierre.",
      en: "Yes: for example, three collinear relative hinges between plates give an internal apparent constraint that allows a motion (instantaneous rotation) even though the count works out.",
    },
  },
  {
    id: "c7",
    topic: "cadenas",
    type: "vf",
    statement: {
      es: "Una cadena cerrada de tres chapas cuyas tres articulaciones relativas están alineadas sobre una misma recta es rígida e isostática.",
      en: "A closed chain of three plates whose three relative hinges lie on the same straight line is rigid and statically determinate.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: si las tres articulaciones relativas están alineadas se produce un vínculo aparente interno; la cadena admite una rotación instantánea y no se comporta como una chapa rígida única.",
      en: "False: if the three relative hinges are collinear, an internal apparent constraint occurs; the chain can undergo an instantaneous rotation and does not behave as a single rigid plate.",
    },
  },
  {
    id: "c8",
    topic: "cadenas",
    type: "vf",
    statement: {
      es: "Los grados de libertad de una cadena abierta de dos chapas equivalen a la suma de los grados de libertad de cada chapa considerada por separado (sin articular).",
      en: "The degrees of freedom of an open chain of two plates equal the sum of the degrees of freedom of each plate considered separately (unhinged).",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: la articulación relativa quita 2 GDL a la suma de las chapas sueltas (3 + 3 = 6); la cadena articulada tiene 4 GDL, no 6.",
      en: "False: the relative hinge removes 2 DOF from the sum of the free plates (3 + 3 = 6); the hinged chain has 4 DOF, not 6.",
    },
  },
  {
    id: "c9",
    topic: "cadenas",
    type: "mc",
    statement: {
      es: "¿Cuántas ecuaciones (condiciones de vínculo externas) son necesarias para sustentar isostáticamente una cadena cinemática de dos chapas unidas por una articulación relativa?",
      en: "How many equations (external support conditions) are needed to statically-determinately support a kinematic chain of two plates joined by a relative hinge?",
    },
    options: {
      es: ["3", "6", "4", "2"],
      en: ["3", "6", "4", "2"],
    },
    correct: 2,
    explanation: {
      es: "La cadena de dos chapas articuladas tiene 4 GDL (3 + 3 GDL de las chapas sueltas menos 2 que quita la articulación relativa), por lo que se necesitan 4 ecuaciones (condiciones de vínculo externas bien dispuestas) para volverla isostática.",
      en: "The two-plate hinged chain has 4 DOF (3 + 3 DOF of the free plates minus the 2 removed by the relative hinge), so 4 equations (well-arranged external support conditions) are needed to make it statically determinate.",
    },
  },
  {
    id: "c10",
    topic: "cadenas",
    type: "vf",
    statement: {
      es: "El momento flector en la articulación relativa que une dos chapas debe ser necesariamente distinto de cero.",
      en: "The bending moment at the relative hinge joining two plates must necessarily be nonzero.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: la articulación (rótula) es precisamente la condición de vínculo interno que libera el momento; por definición, el momento flector en una articulación es nulo (M = 0), aunque a ambos lados de ella el momento en las barras pueda ser distinto de cero.",
      en: "False: the hinge is precisely the internal-constraint condition that releases the moment; by definition, the bending moment at a hinge is zero (M = 0), even though the moment in the members on either side of it can be nonzero.",
    },
  },

  // ── Reticulados ────────────────────────────────────────────────────────
  {
    id: "r1",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "En un reticulado ideal las barras trabajan únicamente a esfuerzo axil (tracción o compresión).",
      en: "In an ideal truss the members carry only axial force (tension or compression).",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Hipótesis del reticulado ideal: nudos articulados sin rozamiento, barras rectas y cargas solo en nudos ⇒ no hay flexión ni corte, solo esfuerzo normal (axil).",
      en: "Ideal truss hypothesis: frictionless pinned joints, straight members, and loads applied only at joints ⇒ no bending or shear, only normal (axial) force.",
    },
  },
  {
    id: "r2",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "En el modelo ideal de reticulado las cargas exteriores se suponen aplicadas exclusivamente en los nudos.",
      en: "In the ideal truss model, external loads are assumed to act exclusively at the joints.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Si una carga actuara sobre una barra entre nudos, esa barra sufriría flexión y se rompería la hipótesis de esfuerzo puramente axil.",
      en: "If a load acted on a member between joints, that member would experience bending, breaking the pure-axial-force hypothesis.",
    },
  },
  {
    id: "r3",
    topic: "reticulados",
    type: "mc",
    statement: {
      es: "La condición de isostaticidad (interna + externa) de un reticulado plano es, con b barras, v reacciones y n nudos:",
      en: "The condition of static determinacy (internal + external) of a plane truss is, with b members, v reactions and n joints:",
    },
    options: {
      es: ["b + v = 3n", "b + v = 2n", "b = 2n − v²", "b + n = 2v"],
      en: ["b + v = 3n", "b + v = 2n", "b = 2n − v²", "b + n = 2v"],
    },
    correct: 1,
    explanation: {
      es: "Cada nudo aporta 2 ecuaciones (2n en total). Las incógnitas son los esfuerzos en las b barras más las v reacciones. Isostático ⇒ b + v = 2n (sin vínculos aparentes).",
      en: "Each joint contributes 2 equations (2n total). The unknowns are the forces in the b members plus the v reactions. Determinate ⇒ b + v = 2n (with no apparent constraints).",
    },
  },
  {
    id: "r4",
    topic: "reticulados",
    type: "mc",
    statement: {
      es: "Si en un reticulado plano (sin vínculos aparentes) se cumple b + v > 2n, el reticulado es:",
      en: "If a plane truss (with no apparent constraints) satisfies b + v > 2n, the truss is:",
    },
    options: {
      es: ["Isostático", "Hipostático", "Un mecanismo", "Hiperestático"],
      en: [
        "Statically determinate",
        "Unstable (underconstrained)",
        "A mechanism",
        "Statically indeterminate",
      ],
    },
    correct: 3,
    explanation: {
      es: "Hay más incógnitas que ecuaciones: el grado de hiperestaticidad es GH = (b + v) − 2n. Requiere ecuaciones de compatibilidad además de las de equilibrio.",
      en: "There are more unknowns than equations: the degree of static indeterminacy is GH = (b + v) − 2n. It requires compatibility equations in addition to equilibrium equations.",
    },
  },
  {
    id: "r5",
    topic: "reticulados",
    type: "mc",
    statement: {
      es: "Si b + v < 2n, el reticulado es:",
      en: "If b + v < 2n, the truss is:",
    },
    options: {
      es: [
        "Hipostático / inestable (mecanismo)",
        "Hiperestático",
        "Isostático",
        "Rígido",
      ],
      en: [
        "Underconstrained / unstable (a mechanism)",
        "Statically indeterminate",
        "Statically determinate",
        "Rigid",
      ],
    },
    correct: 0,
    explanation: {
      es: "Faltan barras o vínculos: hay más ecuaciones que incógnitas y la estructura tiene grados de libertad libres ⇒ se comporta como un mecanismo (colapsa).",
      en: "Members or supports are missing: there are more equations than unknowns and the structure has free degrees of freedom ⇒ it behaves as a mechanism (it collapses).",
    },
  },
  {
    id: "r6",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "El método de los nudos plantea el equilibrio de un sistema de fuerzas concurrentes en cada nudo, aportando dos ecuaciones por nudo.",
      en: "The method of joints sets up the equilibrium of a system of concurrent forces at each joint, contributing two equations per joint.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "En cada nudo concurren las barras y las cargas: ΣFx = 0 y ΣFy = 0 (dos ecuaciones). Conviene empezar por nudos con solo dos barras incógnita.",
      en: "At each joint the members and loads are concurrent: ΣFx = 0 and ΣFy = 0 (two equations). It's best to start with joints that have only two unknown member forces.",
    },
  },
  {
    id: "r7",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "El método de Ritter (secciones) permite hallar el esfuerzo de una barra cortando la estructura por a lo sumo tres barras no concurrentes, sin resolver todo el reticulado.",
      en: "Ritter's method (method of sections) allows finding the force in a member by cutting the structure through at most three non-concurrent members, without solving the entire truss.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Se hace un corte que atraviese la barra buscada y como máximo tres barras no concurrentes; tomando momentos en el punto de cruce de las otras dos se despeja directamente el esfuerzo deseado.",
      en: "A cut is made through the sought member and at most three non-concurrent members; taking moments at the intersection point of the other two directly yields the desired force.",
    },
  },
  {
    id: "r8",
    topic: "reticulados",
    type: "mc",
    statement: {
      es: "En un nudo donde concurren solo dos barras no colineales y NO hay fuerza exterior aplicada, los esfuerzos en ambas barras son:",
      en: "At a joint where only two non-collinear members meet and there is NO external force applied, the forces in both members are:",
    },
    options: {
      es: [
        "Iguales y de tracción",
        "Iguales y de compresión",
        "Nulos (ambas barras son barras nulas)",
        "Imposibles de determinar",
      ],
      en: [
        "Equal and in tension",
        "Equal and in compression",
        "Zero (both are zero-force members)",
        "Impossible to determine",
      ],
    },
    correct: 2,
    explanation: {
      es: "Regla de barras nulas: dos barras no colineales sin carga en el nudo ⇒ el equilibrio exige que ambas tengan esfuerzo cero.",
      en: "Zero-force member rule: two non-collinear members with no load at the joint ⇒ equilibrium requires both to have zero force.",
    },
  },
  {
    id: "r9",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "En un nudo con tres barras, dos colineales entre sí y una tercera no colineal, sin carga exterior, la barra no colineal es una barra nula.",
      en: "At a joint with three members, two collinear with each other and a third non-collinear, with no external load, the non-collinear member is a zero-force member.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Proyectando en la dirección perpendicular a las dos colineales, la única componente proviene de la tercera barra; para equilibrar debe valer cero ⇒ barra nula.",
      en: "Projecting onto the direction perpendicular to the two collinear members, the only component comes from the third member; to balance it must equal zero ⇒ zero-force member.",
    },
  },
  {
    id: "r10",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "Un reticulado triangulado simple se genera a partir de un triángulo base agregando, cada vez, un nudo vinculado mediante dos nuevas barras no colineales.",
      en: "A simple triangulated truss is generated from a base triangle by adding, each time, a joint connected by two new non-collinear members.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Ese procedimiento generativo garantiza que el reticulado sea internamente isostático y rígido (se mantiene b = 2n − 3 para la parte interna).",
      en: "This generative procedure guarantees the truss is internally determinate and rigid (it maintains b = 2n − 3 for the internal part).",
    },
  },
  {
    id: "r11",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "Una estructura para poder ser modelada como reticulado, no depende del estado de carga a la que está sometida.",
      en: "Whether a structure can be modeled as a truss does not depend on the load state it is subjected to.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: una de las hipótesis del reticulado ideal es que las cargas se apliquen exclusivamente en los nudos. Si las cargas actúan sobre el tramo de una barra, esa barra flexiona y deja de cumplir la hipótesis de esfuerzo puramente axil, por lo que la validez del modelo de reticulado sí depende del estado de carga.",
      en: "False: one of the ideal-truss hypotheses is that loads are applied exclusively at the joints. If a load acts along a member's span, that member bends and no longer satisfies the pure-axial-force hypothesis, so whether the truss model is valid does depend on the load state.",
    },
  },
  {
    id: "r12",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "En un reticulado plano isostático siempre se cumple b + v > 2n.",
      en: "In a statically-determinate plane truss, b + v > 2n always holds.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: la condición exacta de isostaticidad es b + v = 2n. Si b + v > 2n el reticulado es hiperestático, no isostático.",
      en: "False: the exact condition for static determinacy is b + v = 2n. If b + v > 2n the truss is statically indeterminate, not determinate.",
    },
  },
  {
    id: "r13",
    topic: "reticulados",
    type: "mc",
    statement: {
      es: "En el reticulado triangular de la imagen (voladizo empotrado contra el muro), sometido a una carga de 500 kg en el nudo C, la barra diagonal b3 (A-C) está:",
      en: "In the triangular truss shown in the image (cantilevered against the wall), under a 500 kg load at joint C, the diagonal member b3 (A-C) is:",
    },
    image: {
      src: "/claude-quiz/triangular-truss.svg",
      alt: {
        es: "Reticulado triangular en voladizo contra el muro, con carga de 500 kg en el nudo C",
        en: "Triangular cantilever truss against the wall, with a 500 kg load at joint C",
      },
    },
    options: {
      es: ["En tracción", "En compresión", "Con esfuerzo nulo (barra nula)"],
      en: ["In tension", "In compression", "With zero force (a zero-force member)"],
    },
    correct: 1,
    explanation: {
      es: "En compresión: analizando el equilibrio del nudo C (donde concurren b2, b3 y la carga de 500 kg), b3 resulta 500√5 ≈ 1118 kg de compresión, mientras que b1 y b2 resultan en tracción (500 kg y 1000 kg respectivamente).",
      en: "In compression: analyzing the equilibrium of joint C (where b2, b3, and the 500 kg load meet), b3 works out to 500√5 ≈ 1118 kg in compression, while b1 and b2 turn out to be in tension (500 kg and 1000 kg respectively).",
    },
  },
  {
    id: "r14",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "El reticulado de la imagen es simétrico: su geometría y su estado de carga son especulares respecto de un eje vertical que pasa por el centro del vano.",
      en: "The truss shown in the image is symmetric: its geometry and load state are mirror-symmetric about a vertical axis through midspan.",
    },
    image: {
      src: "/claude-quiz/symmetric-truss.svg",
      alt: {
        es: "Reticulado de cordones paralelos con 4 paneles de 5 m y cargas verticales 20-30-50-30-20 T",
        en: "Parallel-chord truss with 4 panels of 5 m and vertical loads 20-30-50-30-20 T",
      },
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Verdadero: los 4 paneles miden 5 m cada uno y las cargas verticales sobre el cordón superior (20-30-50-30-20 T) son simétricas respecto del nudo central; por eso las reacciones resultan iguales, V_A = V_B = 75 T.",
      en: "True: all 4 panels are 5 m long and the vertical loads on the top chord (20-30-50-30-20 T) are symmetric about the center joint; that's why the reactions come out equal, V_A = V_B = 75 T.",
    },
  },
  {
    id: "r15",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "En un reticulado ideal, el diagrama de momento flector a lo largo de las barras es distinto de cero.",
      en: "In an ideal truss, the bending moment diagram along the members is nonzero.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 1,
    explanation: {
      es: "Falso: en el reticulado ideal las barras trabajan únicamente a esfuerzo axil; al no existir flexión, el momento flector es nulo en toda la barra.",
      en: "False: in an ideal truss the members carry only axial force; since there is no bending, the bending moment is zero along the entire member.",
    },
  },
  {
    id: "r16",
    topic: "reticulados",
    type: "vf",
    statement: {
      es: "Si un reticulado es simétrico respecto de un eje vertical y, además, el sistema de cargas aplicado también es simétrico respecto de ese mismo eje, alcanza con calcular los esfuerzos en la mitad más una de las barras, sin necesidad de resolver todos los nudos.",
      en: "If a truss is symmetric about a vertical axis and the applied load system is also symmetric about that same axis, it suffices to compute the forces in half-plus-one of the members, without needing to solve every joint.",
    },
    options: { es: VF_ES, en: VF_EN },
    correct: 0,
    explanation: {
      es: "Verdadero: la doble condición de simetría —de la estructura y de las cargas— determina que los esfuerzos en las barras también sean simétricos respecto del eje, por lo que no hace falta calcular todos los nudos: alcanza con la mitad más una de las barras.",
      en: "True: the double symmetry condition — of the structure and of the loads — determines that the member forces are also symmetric about the axis, so it isn't necessary to solve every joint: half-plus-one of the members suffices.",
    },
  },
];
