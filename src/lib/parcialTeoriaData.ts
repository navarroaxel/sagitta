// The 25 questions of the course's multiple-choice theory form, copied as they
// are (Spanish only). The form shows no answer key: `correct` (index of the
// right option) and `explanation` are ours, worked out from the guides, not
// the professor's.
export interface ParcialTeoriaQuestion {
  statement: string;
  options: [string, string, string, string];
  correct: number;
  explanation: string;
}

export const PARCIAL_TEORIA_QUESTIONS: ParcialTeoriaQuestion[] = [
  {
    statement:
      "En una barra prismática solicitada a tracción pura por una fuerza N, ¿dónde debe estar aplicada dicha fuerza para garantizar un estado de tensión normal uniforme en la sección transversal?",
    options: [
      "En cualquier punto del contorno exterior de la sección transversal.",
      "En el baricentro o centro de gravedad de la sección transversal.",
      "En el eje principal de menor momento de inercia únicamente.",
      "En el punto donde la rigidez del material sea máxima.",
    ],
    correct: 1,
    explanation:
      "Para que σ sea uniforme la resultante N debe pasar por el baricentro; si no, además de N hay un momento flector y σ deja de ser uniforme.",
  },
  {
    statement:
      "De acuerdo con el Principio de Saint-Venant aplicado a la solicitación axil, la distribución uniforme de tensiones normales σ = N/A se verifica estrictamente en:",
    options: [
      "Los puntos inmediatos de aplicación de las cargas concentradas.",
      "Secciones transversales alejadas de los extremos y de perturbaciones geométricas o cargas concentradas.",
      "Únicamente en los apoyos y empotramientos de la estructura.",
      "Zonas donde existan orificios o entalladuras agudas.",
    ],
    correct: 1,
    explanation:
      "Saint-Venant: junto a la carga σ no es uniforme; lejos de ella (a ≈ h de distancia) solo importa la resultante y vale σ = N/A.",
  },
  {
    statement:
      "En régimen elástico lineal (Ley de Hooke, σ = E · ε), ¿cuál es la expresión correcta para el alargamiento total Δl de una barra de longitud l, sección A y módulo de Young E?",
    options: [
      "Δl = (N · A) / (l · E)",
      "Δl = (N · l) / (A · E)",
      "Δl = (E · l) / (N · A)",
      "Δl = (N · E · A) / l",
    ],
    correct: 1,
    explanation: "Δl = N·l/(A·E): sale de Δl = ε·l con ε = σ/E y σ = N/A.",
  },
  {
    statement:
      "¿Cuál es el valor del momento estático o de primer orden (Sx = ∫ y dA) de una superficie plana respecto a un eje baricéntrico que pasa por su centro de gravedad?",
    options: [
      "Es igual al área total A multiplicada por la altura total.",
      "Es estrictamente nulo (Sx = 0).",
      "Es igual al momento de inercia baricéntrico dividida la base.",
      "Depende de la orientación del eje y siempre es positivo.",
    ],
    correct: 1,
    explanation:
      "Respecto de un eje que pasa por el baricentro S = ∫y dA = 0; esa es la definición del baricentro.",
  },
  {
    statement:
      "Para una figura plana rectangular de base b y altura h, el momento estático respecto a un eje coincidente con su base inferior vale:",
    options: [
      "Sx = (b · h²) / 2",
      "Sx = (b · h³) / 12",
      "Sx = (b² · h) / 2",
      "Sx = b · h",
    ],
    correct: 0,
    explanation:
      "El baricentro está a h/2 de la base: S = A·y_G = (b·h)·(h/2) = b·h²/2.",
  },
  {
    statement:
      "Respecto a los momentos de inercia o de segundo orden (Jx = ∫ y² dA), indique la afirmación correcta referente a su signo matemático:",
    options: [
      "Pueden ser positivos, negativos o nulos según el cuadrante.",
      "Son siempre estrictamente positivos, ya que los elementos de área son positivos y las distancias están elevadas al cuadrado.",
      "Son nulos cuando se calculan respecto a un eje baricéntrico.",
      "Cambian de signo al invertir el sentido de los ejes coordenados.",
    ],
    correct: 1,
    explanation:
      "J = ∫y² dA: el integrando es siempre positivo, así que J > 0 siempre (no se anula ni cambia de signo).",
  },
  {
    statement:
      "El Teorema de Steiner permite calcular el momento de inercia Jx respecto a un eje paralelo a uno baricéntrico (Jxg) distanciado una dimensión 'd'. Su formulación exacta es:",
    options: [
      "Jx = Jxg - A · d²",
      "Jx = Jxg + A · d²",
      "Jx = Jxg + A · d",
      "Jx = (Jxg · A) / d²",
    ],
    correct: 1,
    explanation:
      "Steiner: J_x = J_xg + A·d². Siempre se suma A·d², por eso J es mínimo respecto del eje baricéntrico.",
  },
  {
    statement:
      "Se definen como ejes principales de inercia a aquel par de ejes baricéntricos ortogonales para los cuales:",
    options: [
      "El momento estático alcanza su valor máximo.",
      "El momento centrífugo o producto de inercia Jxy es estrictamente nulo (Jxy = 0) y los momentos de segundo orden son máximos y mínimos.",
      "La suma de los momentos de inercia es igual a cero.",
      "El radio de giro se hace infinito.",
    ],
    correct: 1,
    explanation:
      "Los ejes principales son un par ortogonal con J_xy = 0, respecto del cual J alcanza su máximo y su mínimo.",
  },
  {
    statement:
      "La relación matemática entre el momento de inercia polar Jp respecto al origen de coordenadas y los momentos de inercia rectangulares Jx y Jy es:",
    options: [
      "Jp = Jx · Jy",
      "Jp = Jx + Jy",
      "Jp = Jx - Jy",
      "Jp = √(Jx² + Jy²)",
    ],
    correct: 1,
    explanation: "J_p = ∫ρ² dA y ρ² = x² + y², por lo que J_p = J_x + J_y.",
  },
  {
    statement:
      "Se denomina 'Flexión Pura' a aquel caso particular de flexión en el cual en la sección transversal:",
    options: [
      "Existe únicamente esfuerzo de corte Q sin momento flector M.",
      "Existe momento flector M y el esfuerzo de corte Q es nulo (Q = 0).",
      "Coexisten momento flector M, esfuerzo de corte Q y fuerza axil N.",
      "Las tensiones normales son tangenciales al plano de la sección.",
    ],
    correct: 1,
    explanation:
      "Flexión pura: hay momento flector y no hay corte (Q = 0); con corte se la llama flexión y corte.",
  },
  {
    statement:
      "El Eje Neutro de una sección solicitada a flexión simple se define geométricamente y mecánicamente como:",
    options: [
      "La línea donde las tensiones normales alcanzan su valor máximo de tracción.",
      "El lugar geométrico de los puntos de la sección donde la tensión normal es nula (σ = 0) y que coincide con un eje baricéntrico.",
      "El borde superior del perfil metálico.",
      "El eje perpendicular al plano donde actúan las cargas de flexión.",
    ],
    correct: 1,
    explanation:
      "El eje neutro es el lugar de los puntos con σ = 0; en flexión simple pasa por el baricentro.",
  },
  {
    statement:
      "La ecuación fundamental para determinar la tensión normal σ a una distancia 'y' del eje neutro en flexión simple es:",
    options: [
      "σ = (M · Jx) / y",
      "σ = (M · y) / Jx",
      "σ = (Q · y) / Jx",
      "σ = (M · Wx) / y",
    ],
    correct: 1,
    explanation:
      "σ = M·y/J_x: lineal en y, nula en el eje neutro y máxima en la fibra más alejada.",
  },
  {
    statement:
      "El Módulo Resistente a la flexión Wx de una sección transversal se define como la razón entre el momento de inercia Jx y la distancia a la fibra más alejada 'v' (Wx = Jx / v). ¿En qué unidad se expresa habitualmente?",
    options: ["cm²", "cm³", "cm⁴", "Kg / cm²"],
    correct: 1,
    explanation:
      "W = J/v tiene unidades de longitud⁴/longitud = longitud³: cm³.",
  },
  {
    statement:
      "¿Se produce 'Flexión Oblicua' en una viga de sección transversal dada?",
    options: [
      "Cuando las cargas actúan paralelas al eje longitudinal de la barra.",
      "Cuando la línea de fuerzas del momento flector no coincide con ninguno de los ejes principales de inercia de la sección.",
      "Cuando la sección posee dos ejes de simetría ortogonales cargados verticalmente.",
      "Cuando el módulo de Young varía entre la cara superior e inferior.",
    ],
    correct: 1,
    explanation:
      "La flexión es oblicua cuando la línea de fuerzas no coincide con ningún eje principal de inercia.",
  },
  {
    statement:
      "Al dimensionar o verificar una sección asimétrica respecto al eje neutro (donde v1 ≠ v2), ¿cuál módulo resistente W se debe adoptar para garantizar la seguridad del elemento?",
    options: [
      "El mayor de los módulos resistentes (Wmax = Jx / ymin).",
      "El menor de los módulos resistentes (Wmin = Jx / ymax).",
      "El promedio aritmético entre ambos módulos resistentes.",
      "Únicamente el módulo resistente respecto al eje vertical.",
    ],
    correct: 1,
    explanation:
      "Se verifica con la fibra más exigida, la más alejada: v máx, o sea W mín = J_x/y máx.",
  },
  {
    statement:
      "El Teorema de Cauchy sobre tensiones tangenciales establece fundamentalmente que:",
    options: [
      "Las tensiones tangenciales en dos planos perpendiculares son iguales en magnitud y concurren o se alejan ambas de la arista común (τxy = τyx).",
      "El corte causa únicamente tensiones normales en el eje baricéntrico.",
      "La tensión tangencial máxima es siempre igual a la tensión normal de tracción.",
      "El momento estático de la sección total es igual al momento de inercia.",
    ],
    correct: 0,
    explanation:
      "Cauchy: τ_xy = τ_yx; las dos tangenciales perpendiculares a la arista común llegan a ella o se alejan de ella.",
  },
  {
    statement:
      "La fórmula de Jouravski-Collignon para calcular la tensión tangencial media τm a una determinada altura de la sección en flexión es:",
    options: [
      "τm = (Q · Jx) / (Sn · b)",
      "τm = (Q · Sn) / (Jx · b)",
      "τm = (M · Sn) / (Jx · b)",
      "τm = (Q · b) / (Jx · Sn)",
    ],
    correct: 1,
    explanation:
      "Jourawski–Colignon: τ = Q·S/(J·b), con S el momento estático de la parte que desliza.",
  },
  {
    statement:
      "En una sección transversal rectangular de ancho 'b' y altura 'h', la distribución de tensiones tangenciales de corte τ a lo largo de la altura es de forma:",
    options: [
      "Constante e uniforme en toda la superficie.",
      "Lineal, siendo máxima en los bordes superior e inferior.",
      "Parabólica, siendo nula en los bordes extremos y máxima en el eje neutro baricéntrico.",
      "Triangular con vértice en la fibra comprimida.",
    ],
    correct: 2,
    explanation:
      "En el rectángulo τ es parabólica: nula en los bordes (S = 0) y máxima en el eje neutro (3/2 · Q/A).",
  },
  {
    statement:
      "¿Por qué motivo las tensiones tangenciales τ son estrictamente nulas en las fibras extremas superior e inferior de una viga de sección rectangular?",
    options: [
      "Porque el momento flector M es nulo en dichas fibras.",
      "Porque el área resbalante por fuera de dichas fibras es nula, haciendo que el momento estático resulte Sn = 0.",
      "Porque el ancho 'b' tiende a infinito en los bordes.",
      "Porque la tensión normal es nula en los bordes.",
    ],
    correct: 1,
    explanation:
      "En las fibras extremas el área que desliza por fuera de ellas es nula, entonces S = 0 y τ = Q·S/(J·b) = 0.",
  },
  {
    statement:
      "Para reducir a la mitad la flecha elástica f de una viga sometida a flexión sin alterar las cargas ni la longitud, la modificación de diseño más eficaz es:",
    options: [
      "Duplicar la altura del perfil para aumentar considerablemente el momento de inercia J.",
      "Utilizar un material con la mitad de módulo de Young E.",
      "Disminuir el ancho de la sección transversal a la mitad.",
      "Reemplazar los apoyos simples por articulaciones móviles.",
    ],
    correct: 0,
    explanation:
      "f es inversamente proporcional a E·J. Duplicar la altura multiplica J por 8 (f/8), así que sobra, pero es la única opción que la reduce; usar la mitad de E la duplicaría.",
  },
  {
    statement:
      "El fenómeno de pandeo o inestabilidad del equilibrio en elementos estructurales comprimidos ocurre principalmente cuando las barras presentan una relación de esbeltez tal que:",
    options: [
      "La longitud l es menor a 5 veces el ancho mínimo b (l < 5b).",
      "La barra es esbelta (habitualmente l > 30b) y falla por flexión lateral instintiva antes de alcanzar la tensión límite.",
      "La barra está sometida únicamente a tracción axial.",
      "El material se encuentra en estado puramente plástico.",
    ],
    correct: 1,
    explanation:
      "El pandeo se da en barras esbeltas (l > 30·b): fallan por flexión lateral antes de alcanzar la tensión límite.",
  },
  {
    statement:
      "La longitud de pandeo o longitud equivalente lo se define como lo = c · l. ¿Cuál es el valor del coeficiente 'c' para una columna empotrada en la base y libre en el extremo superior?",
    options: ["c = 0,5", "c = 0,7", "c = 1,0", "c = 2,0"],
    correct: 3,
    explanation:
      "Empotrada–libre: l₀ = 2·l, o sea c = 2 (articulada–articulada c = 1, empotrada–articulada 0,7, empotrada–empotrada 0,5).",
  },
  {
    statement:
      "En el ensayo de tracción simple de un acero dulce, el tramo inicial rectilíneo del diagrama tensión-deformación (σ - ε) representa la fase elástica lineal gobernada por la Ley de Hooke. En dicho tramo, la pendiente de la recta equivale a:",
    options: [
      "El límite de rotura del material.",
      "El Módulo de Elasticidad Longitudinal o Módulo de Young (E = tg β).",
      "El coeficiente de Poisson.",
      "La resiliencia del material.",
    ],
    correct: 1,
    explanation:
      "En el tramo recto inicial σ = E·ε, así que E es la pendiente: E = tg β.",
  },
  {
    statement:
      "Se define como 'Límite de Elasticidad' (σE) de un material al valor de tensión por encima del cual:",
    options: [
      "La probeta se rompe de forma instantánea.",
      "Las deformaciones dejan de ser recuperables y comienzan a aparecer deformaciones plásticas permanentes.",
      "La sección transversal aumenta su diámetro.",
      "La tensión tangencial se anula por completo.",
    ],
    correct: 1,
    explanation:
      "Por encima del límite elástico σ_E las deformaciones ya no se recuperan: aparecen deformaciones plásticas permanentes.",
  },
  {
    statement:
      "¿Qué diferencia fundamental presenta un material 'Frágil' (como el vidrio o el hormigón simple) respecto a un material 'Dúctil' (como el acero estructurado) en el diagrama de tracción?",
    options: [
      "El material frágil sufre enormes deformaciones plásticas y estricción antes de romperse.",
      "El material frágil alcanza la rotura con muy pequeñas deformaciones, prácticamente sin presentar periodo de fluencia ni estricción apreciable.",
      "El material frágil posee un módulo de Young E igual a cero.",
      "El material frágil no soporta ningún tipo de carga a compresión.",
    ],
    correct: 1,
    explanation:
      "El frágil rompe con deformaciones muy pequeñas, casi sin fluencia ni estricción; el dúctil tiene un período plástico largo.",
  },
];
