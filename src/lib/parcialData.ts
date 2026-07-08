// True/False self-assessment for the "parcial" (statics theory, UTN FRBA).
// Reuses the QuizQuestion shape and the shared grading logic in ./quiz.
import { QuizQuestion } from "./quiz";

export const parcialQuestions: QuizQuestion[] = [
  {
    id: 1,
    answer: true,
    statement: {
      es: "Dos sistemas de fuerzas son equivalentes si, actuando independientemente, producen el mismo efecto sobre el cambio de estado de movimiento de un cuerpo.",
      en: "Two force systems are equivalent if, acting independently, they produce the same effect on the change of state of motion of a body.",
    },
    explanation: {
      es: "Sistemas equivalentes tienen igual resultante e igual momento resultante, por lo que producen el mismo efecto sobre el cuerpo rígido.",
      en: "Equivalent systems share the same resultant and the same resultant moment, so they have the same effect on the rigid body.",
    },
  },
  {
    id: 2,
    answer: true,
    statement: {
      es: "Al no poder salir de su plano, una chapa solo tiene 2 posibilidades de traslación y 1 rotación.",
      en: "Since it cannot leave its plane, a plate (chapa) has only 2 possible translations and 1 rotation.",
    },
    explanation: {
      es: "Una chapa en su plano tiene 3 grados de libertad: dos traslaciones y una rotación.",
      en: "A plate in its plane has 3 degrees of freedom: two translations and one rotation.",
    },
  },
  {
    id: 3,
    answer: true,
    statement: {
      es: "El Invariante Escalar de un Sistema de Fuerzas Plano es siempre nulo.",
      en: "The Scalar Invariant of a planar force system is always zero.",
    },
    explanation: {
      es: "Es R·M; en el plano R está en el plano y M es perpendicular, así que R·M = 0.",
      en: "It is R·M; in the plane R lies in the plane and M is perpendicular to it, so R·M = 0.",
    },
  },
  {
    id: 4,
    answer: false,
    statement: {
      es: "En una barra sometida a Compresión, la convención de signo es negativa (−) y las fuerzas internas se grafican como salientes del Nudo.",
      en: "In a bar under compression the sign convention is negative (−) and the internal forces are drawn as leaving the joint.",
    },
    explanation: {
      es: "El signo negativo es correcto, pero en compresión las fuerzas se grafican entrantes al nudo (la barra empuja al nudo); salientes corresponde a tracción.",
      en: "The negative sign is right, but in compression the forces are drawn entering the joint (the bar pushes the joint); leaving the joint corresponds to tension.",
    },
  },
  {
    id: 5,
    answer: false,
    statement: {
      es: "Reducir un sistema de fuerzas siempre da como resultado una única fuerza resultante.",
      en: "Reducing a force system always yields a single resultant force.",
    },
    explanation: {
      es: "La reducción puede dar una fuerza y un par, un par puro (R=0, M≠0) o el sistema nulo; no siempre una única resultante.",
      en: "Reduction may give a force plus a couple, a pure couple (R=0, M≠0) or the null system; not always a single resultant.",
    },
  },
  {
    id: 6,
    answer: true,
    statement: {
      es: "El uso de reticulados es frecuente en estructuras de grandes luces para evitar los pesos propios excesivos que caracterizan a las estructuras de alma llena.",
      en: "Trusses are common in large-span structures to avoid the excessive self-weight typical of solid-web structures.",
    },
    explanation: {
      es: "El reticulado ubica el material en los cordones alejados del eje, logrando gran inercia con poco peso frente al alma llena.",
      en: "A truss places material in chords far from the axis, achieving high inertia with little weight compared to a solid web.",
    },
  },
  {
    id: 7,
    answer: true,
    statement: {
      es: "Si un sistema tiene un número de condiciones de vínculo igual a sus grados de libertad (C.V. = G.L.) y es cinemáticamente invariable, se dice que está isostáticamente sustentado.",
      en: "If a system has a number of constraint conditions equal to its degrees of freedom (C.C. = D.O.F.) and is kinematically invariant, it is said to be isostatically supported.",
    },
    explanation: {
      es: "Con C.V. = G.L. y sin posibilidad de movimiento (invariable), la sustentación es isostática (determinada).",
      en: "With C.C. = D.O.F. and no possible motion (invariant), the support is isostatic (determinate).",
    },
  },
  {
    id: 8,
    answer: false,
    statement: {
      es: "Una barra rígida en el espacio posee 6 grados de libertad.",
      en: "A rigid bar in space has 6 degrees of freedom.",
    },
    explanation: {
      es: "Una barra en el espacio tiene 5 grados de libertad (sus dos extremos dan 6 coordenadas menos la distancia constante); la rotación en torno a su propio eje no cuenta. 6 corresponde a un cuerpo/chapa.",
      en: "A bar in space has 5 degrees of freedom (its two endpoints give 6 coordinates minus the fixed length); rotation about its own axis does not count. 6 corresponds to a rigid body.",
    },
  },
  {
    id: 9,
    answer: true,
    statement: {
      es: "En un sistema de fuerzas concurrentes a un punto propio, el Invariante Escalar siempre es igual a cero.",
      en: "In a system of forces concurrent at a proper point, the Scalar Invariant is always zero.",
    },
    explanation: {
      es: "Tomando momentos en el punto de concurrencia, M = 0; como el invariante escalar R·M es constante, vale 0.",
      en: "Taking moments at the concurrency point, M = 0; since the scalar invariant R·M is constant, it equals 0.",
    },
  },
  {
    id: 10,
    answer: true,
    statement: {
      es: "Para que un sistema de fuerzas generalizado esté en equilibrio, es condición necesaria y suficiente que las seis expresiones independientes (tres de proyección y tres de momentos) sean nulas.",
      en: "For a generalized force system to be in equilibrium, it is necessary and sufficient that the six independent expressions (three projections and three moments) be zero.",
    },
    explanation: {
      es: "En el espacio el equilibrio exige ΣFx = ΣFy = ΣFz = 0 y ΣMx = ΣMy = ΣMz = 0: seis ecuaciones.",
      en: "In space, equilibrium requires ΣFx = ΣFy = ΣFz = 0 and ΣMx = ΣMy = ΣMz = 0: six equations.",
    },
  },
  {
    id: 11,
    answer: true,
    statement: {
      es: "El momento de una fuerza respecto de un eje es igual a la proyección sobre dicho eje del vector momento de la fuerza respecto a un punto cualquiera del mismo eje.",
      en: "The moment of a force about an axis equals the projection onto that axis of the moment vector of the force about any point on the axis.",
    },
    explanation: {
      es: "Es la definición de momento respecto de un eje: proyección sobre el eje del momento respecto de un punto del mismo.",
      en: "That is the definition of the moment about an axis: the projection onto the axis of the moment about a point on it.",
    },
  },
  {
    id: 12,
    answer: false,
    statement: {
      es: "Cualquier Cadena Cinemática de dos chapas de las cuales una esté empotrada y sobre la otra haya aplicado vínculo de primera especie será siempre isostática.",
      en: "Any kinematic chain of two plates, one of which is fixed (built-in) and the other carrying a first-species constraint, will always be isostatic.",
    },
    explanation: {
      es: "La igualdad en el conteo de vínculos es necesaria pero no suficiente: según la disposición puede haber vínculo aparente y resultar hipostática, por eso no es 'siempre' isostática.",
      en: "Matching the constraint count is necessary but not sufficient: depending on the arrangement there may be an apparent constraint and the system can be hypostatic, so it is not 'always' isostatic.",
    },
  },
  {
    id: 13,
    answer: false,
    statement: {
      es: "Para una barra de eje recto con diagrama de corte nulo, el diagrama de momento también será nulo.",
      en: "For a straight-axis bar with a zero shear diagram, the moment diagram will also be zero.",
    },
    explanation: {
      es: "Q = dM/dx; si Q = 0 el momento es constante, pero puede ser un valor no nulo (flexión pura).",
      en: "Q = dM/dx; if Q = 0 the moment is constant, but it may be a nonzero value (pure bending).",
    },
  },
  {
    id: 14,
    answer: false,
    statement: {
      es: "Las barras de un reticulado deben cumplir tres condiciones: sus extremos serán articulados, su eje será recto y las cargas se aplicarán en la mitad de su luz.",
      en: "Truss bars must satisfy three conditions: their ends are pin-jointed, their axis is straight, and loads are applied at mid-span.",
    },
    explanation: {
      es: "Las cargas deben aplicarse en los nudos, no en la mitad de la luz; hacerlo en el tramo introduce flexión en la barra.",
      en: "Loads must be applied at the joints, not at mid-span; applying them along the span introduces bending in the bar.",
    },
  },
  {
    id: 15,
    answer: false,
    statement: {
      es: "Una fuerza puntual producirá un salto en el diagrama de momento flexor en el punto de su aplicación.",
      en: "A point force produces a jump in the bending-moment diagram at its point of application.",
    },
    explanation: {
      es: "Una fuerza puntual produce un salto en el diagrama de corte y un quiebre (cambio de pendiente) en el de momento; el salto en el momento lo produce un momento concentrado.",
      en: "A point force produces a jump in the shear diagram and a kink (slope change) in the moment diagram; a jump in the moment is caused by a concentrated moment.",
    },
  },
  {
    id: 16,
    answer: false,
    statement: {
      es: "La capacidad de una fuerza de producir una rotación en torno a un eje viene dada por la proyección de dicha fuerza con respecto al eje.",
      en: "The capacity of a force to produce a rotation about an axis is given by the projection of that force onto the axis.",
    },
    explanation: {
      es: "Está dada por el momento respecto del eje (proyección sobre el eje del vector momento), no por la proyección de la fuerza; la componente de la fuerza según el eje no produce giro.",
      en: "It is given by the moment about the axis (the projection onto the axis of the moment vector), not by the projection of the force; the force component along the axis produces no rotation.",
    },
  },
  {
    id: 17,
    answer: true,
    statement: {
      es: "Si tenemos un pórtico plano en equilibrio, entonces se debe verificar el equilibrio interno de cada uno de sus nodos.",
      en: "If a plane frame is in equilibrium, then the internal equilibrium of each of its nodes must be satisfied.",
    },
    explanation: {
      es: "Si el todo está en equilibrio, cada parte también lo está; por eso cada nudo debe equilibrarse.",
      en: "If the whole is in equilibrium, so is every part; hence each node must be in equilibrium.",
    },
  },
  {
    id: 18,
    answer: true,
    statement: {
      es: "Si a un nudo de reticulado sin carga exterior convergen dos barras no alineadas, estas no toman esfuerzo.",
      en: "If two non-aligned bars meet at a truss joint with no external load, they carry no force.",
    },
    explanation: {
      es: "Nudo descargado con dos barras no colineales: por equilibrio ambas son barras de esfuerzo nulo.",
      en: "Unloaded joint with two non-collinear bars: by equilibrium both are zero-force members.",
    },
  },
  {
    id: 19,
    answer: true,
    statement: {
      es: "Una fuerza puntual en el tramo de una carga distribuida generará un salto en el diagrama de Esfuerzo de Corte.",
      en: "A point force within the span of a distributed load produces a jump in the shear diagram.",
    },
    explanation: {
      es: "Toda fuerza puntual genera un salto en el corte igual a su valor, exista o no carga distribuida en el tramo.",
      en: "Any point force produces a jump in the shear equal to its magnitude, whether or not a distributed load acts on the span.",
    },
  },
];
