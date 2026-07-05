// 20-question True/False self-assessment on statics.
import { QuizQuestion } from "./quiz";

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    answer: false,
    statement: {
      es: "En hipótesis de cuerpos rígidos, las cargas puntuales pueden considerarse vectores libres a efectos de resolver reacciones de vínculos.",
      en: "Under the rigid-body hypothesis, point loads can be treated as free vectors for the purpose of solving support reactions.",
    },
    explanation: {
      es: "Bajo rígido son vectores deslizantes, no libres; moverlas a una recta paralela cambia el momento.",
      en: "Under rigid-body theory they are sliding vectors, not free ones; moving one to a parallel line changes the moment.",
    },
  },
  {
    id: 2,
    answer: true,
    statement: {
      es: "La Resultante de Reducción de un Sistema de Fuerzas no depende del Centro de Reducción.",
      en: "The reduction Resultant of a force system does not depend on the reduction center.",
    },
    explanation: {
      es: "R = ΣF es el invariante vectorial; solo el momento de reducción depende del centro.",
      en: "R = ΣF is the vector invariant; only the reduction moment depends on the center.",
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
      es: "El Momento de Reducción de un Sistema de Fuerzas se denomina Invariante Vectorial.",
      en: "The reduction Moment of a force system is called the Vector Invariant.",
    },
    explanation: {
      es: "El invariante vectorial es la Resultante; el momento depende del centro.",
      en: "The vector invariant is the Resultant; the moment depends on the reduction center.",
    },
  },
  {
    id: 5,
    answer: true,
    statement: {
      es: "Para fijar un punto en el espacio es necesario restringir el desplazamiento en tres direcciones no coplanares.",
      en: "To fix a point in space, translation must be restrained in three non-coplanar directions.",
    },
    explanation: {
      es: "Un punto en el espacio tiene 3 GL de traslación.",
      en: "A point in space has 3 translational degrees of freedom.",
    },
  },
  {
    id: 6,
    answer: false,
    statement: {
      es: "Para fijar una chapa plana es condición necesaria y suficiente aplicar tres vínculos de primera especie.",
      en: "To fix a plane rigid body, applying three first-class supports is a necessary and sufficient condition.",
    },
    explanation: {
      es: "Necesaria pero no suficiente: no deben ser concurrentes ni paralelos.",
      en: "Necessary but not sufficient: the three support lines must not be concurrent nor parallel.",
    },
  },
  {
    id: 7,
    answer: true,
    statement: {
      es: "Cualquier cadena cinemática de dos chapas sustentada por dos apoyos fijos no alineados con la articulación será isostática.",
      en: "Any two-body kinematic chain supported by two fixed supports not aligned with the hinge is statically determinate.",
    },
    explanation: {
      es: "Arco de tres articulaciones; isostático mientras las tres rótulas no estén alineadas.",
      en: "It is a three-hinged arch; determinate as long as the three hinges are not collinear.",
    },
  },
  {
    id: 8,
    answer: false,
    statement: {
      es: "Cualquier cadena cinemática de dos chapas, una empotrada y sobre la otra un vínculo de primera especie, será siempre isostática.",
      en: "Any two-body kinematic chain, one fixed and the other carrying a first-class support, is always statically determinate.",
    },
    explanation: {
      es: "El 'siempre' falla: si la recta del vínculo pasa por la articulación, la 2da chapa gira.",
      en: "The 'always' fails: if the support's line of action passes through the hinge, the second body can still rotate.",
    },
  },
  {
    id: 9,
    answer: false,
    statement: {
      es: "Una cupla aplicada en el tramo de una carga distribuida generará un quiebre en el diagrama de Momento Flector.",
      en: "A couple applied within a distributed-load span produces a kink in the bending moment diagram.",
    },
    explanation: {
      es: "Una cupla genera un salto, no un quiebre.",
      en: "A couple produces a jump, not a kink.",
    },
  },
  {
    id: 10,
    answer: true,
    statement: {
      es: "Una fuerza puntual en el tramo de una carga distribuida generará un salto en el diagrama de Esfuerzo de Corte.",
      en: "A point force within a distributed-load span produces a jump in the shear force diagram.",
    },
    explanation: {
      es: "Toda fuerza puntual produce un salto en Q.",
      en: "Every point force produces a jump in Q.",
    },
  },
  {
    id: 11,
    answer: false,
    statement: {
      es: "Si a un nudo con carga exterior convergen tres barras y una está alineada con la carga, las otras dos no trabajan.",
      en: "If three members meet at a loaded joint and one is aligned with the load, the other two carry no force.",
    },
    explanation: {
      es: "No es general; si las otras dos son colineales toman esfuerzos iguales no nulos.",
      en: "Not general; if the other two are collinear they carry equal, non-zero forces.",
    },
  },
  {
    id: 12,
    answer: true,
    statement: {
      es: "Si a un nudo sin carga exterior convergen dos barras no alineadas, estas no toman esfuerzo.",
      en: "If two non-aligned members meet at an unloaded joint, neither carries any force.",
    },
    explanation: {
      es: "El equilibrio en cada dirección obliga a que ambas sean nulas.",
      en: "Equilibrium along each direction forces both to be zero.",
    },
  },
  {
    id: 13,
    answer: true,
    statement: {
      es: "Si a un nudo con carga exterior convergen dos barras y una está alineada con la carga, la otra barra no toma esfuerzo.",
      en: "If two members meet at a loaded joint and one is aligned with the load, the other member carries no force.",
    },
    explanation: {
      es: "Nada equilibra la componente perpendicular, así que la otra es nula.",
      en: "Nothing balances the perpendicular component, so the other member's force must be zero.",
    },
  },
  {
    id: 14,
    answer: false,
    statement: {
      es: "Una chapa en el espacio posee 9 grados de libertad.",
      en: "A rigid body in space has 9 degrees of freedom.",
    },
    explanation: {
      es: "Tiene 6 GL (3 traslaciones + 3 rotaciones).",
      en: "It has 6 DOF (3 translations + 3 rotations).",
    },
  },
  {
    id: 15,
    answer: true,
    statement: {
      es: "Para fijar un punto a tierra en un sistema plano basta restringir la traslación en dos direcciones.",
      en: "To fix a point to the ground in a planar system, restraining translation in two directions suffices.",
    },
    explanation: {
      es: "Un punto en el plano tiene 2 GL; no hay rotación que impedir.",
      en: "A point in the plane has 2 DOF; there is no rotation to prevent.",
    },
  },
  {
    id: 16,
    answer: false,
    statement: {
      es: "El momento de una fuerza respecto de un punto no varía si se modifica la distancia entre la recta de acción y dicho punto.",
      en: "The moment of a force about a point does not change if the distance between its line of action and that point changes.",
    },
    explanation: {
      es: "M = F·d; si cambia d, cambia M.",
      en: "M = F·d; if d changes, M changes.",
    },
  },
  {
    id: 17,
    answer: false,
    statement: {
      es: "Las barras de un reticulado deben tener extremos articulados, eje recto y las cargas aplicadas en la mitad de su luz.",
      en: "Truss members must have pinned ends, a straight axis, and loads applied at mid-span.",
    },
    explanation: {
      es: "Las cargas van en los nudos, no en la mitad de la luz.",
      en: "Loads are applied at the joints, not at mid-span.",
    },
  },
  {
    id: 18,
    answer: true,
    statement: {
      es: "Con carga uniforme sobre una barra, el diagrama de esfuerzo de corte varía en forma lineal.",
      en: "Under a uniform load on a member, the shear force diagram varies linearly.",
    },
    explanation: {
      es: "dV/dx = −q = cte → Q lineal, M parabólico.",
      en: "dV/dx = −q = constant → Q is linear, M is parabolic.",
    },
  },
  {
    id: 19,
    answer: false,
    statement: {
      es: "Una fuerza puntual produce un salto en el diagrama de momento flexor en el punto de aplicación.",
      en: "A point force produces a jump in the bending moment diagram at its point of application.",
    },
    explanation: {
      es: "Produce un quiebre en M (y un salto en Q); el salto en M lo da una cupla.",
      en: "It produces a kink in M (and a jump in Q); a jump in M is caused by a couple.",
    },
  },
  {
    id: 20,
    answer: true,
    statement: {
      es: "Si un pórtico plano está en equilibrio, se debe verificar el equilibrio interno de cada uno de sus nodos.",
      en: "If a plane frame is in equilibrium, the internal equilibrium of each of its joints must also hold.",
    },
    explanation: {
      es: "Todo cuerpo libre aislado, incluido cada nudo, debe estar en equilibrio.",
      en: "Every isolated free body, including each joint, must be in equilibrium.",
    },
  },
];
