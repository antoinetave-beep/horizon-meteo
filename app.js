"use strict";

const DETERMINISTIC_MODELS = [
  {
    id: "meteofrance_seamless",
    label: "Météo-France",
    short: "AROME / ARPEGE",
    originIcon: "🇫🇷",
    originLabel: "France",
    producer: "Météo-France",
    horizon: "Très fin à courte échéance",
    note: "AROME décrit finement les deux premiers jours en France ; ARPEGE prend le relais à une maille plus large. Très utile pour les phénomènes locaux et les précipitations.",
    color: "#c9583c"
  },
  {
    id: "ecmwf_ifs025",
    label: "ECMWF IFS",
    short: "IFS",
    originIcon: "🇪🇺",
    originLabel: "Centre européen",
    producer: "ECMWF",
    horizon: "Jusqu’à 15 jours",
    note: "Modèle global de référence. Sa version ouverte utilisée ici est à environ 25 km ; elle est particulièrement utile pour la trajectoire générale des masses d’air.",
    color: "#1f6d68"
  },
  {
    id: "ecmwf_aifs025_single",
    label: "ECMWF AIFS Single",
    short: "AIFS",
    originIcon: "🇪🇺",
    originLabel: "Centre européen",
    isAi: true,
    producer: "ECMWF — intelligence artificielle",
    horizon: "Jusqu’à 15 jours",
    note: "Prévision déterministe d’intelligence artificielle d’ECMWF. La comparer à IFS permet d’isoler les différences entre une dynamique apprise sur les archives et le modèle physique opérationnel.",
    color: "#d47a45"
  },
  {
    id: "gfs_global",
    label: "NOAA GFS",
    short: "GFS",
    originIcon: "🇺🇸",
    originLabel: "États-Unis",
    producer: "NOAA (États-Unis)",
    horizon: "Jusqu’à 16 jours",
    note: "Modèle global américain, mis à jour quatre fois par jour. Le comparer à IFS permet souvent de repérer rapidement une bifurcation de scénario.",
    color: "#536fa8"
  },
  {
    id: "ncep_aigfs025",
    label: "NOAA AIGFS",
    short: "AIGFS",
    originIcon: "🇺🇸",
    originLabel: "États-Unis",
    isAi: true,
    producer: "NOAA — intelligence artificielle",
    horizon: "Jusqu’à 16 jours",
    note: "Prévision IA opérationnelle de la NOAA fondée sur l’architecture GraphCast. Elle forme un duo particulièrement instructif avec le GFS physique, dont elle reprend l’état initial.",
    color: "#b8649d"
  },
  {
    id: "icon_global",
    label: "DWD ICON",
    short: "ICON",
    originIcon: "🇩🇪",
    originLabel: "Allemagne",
    producer: "DWD (Allemagne)",
    horizon: "Environ 7 jours",
    note: "Modèle global allemand. Sur l’Europe, il apporte une troisième dynamique indépendante très utile pour juger la robustesse d’un signal.",
    color: "#9b6aa3"
  },
  {
    id: "aiwp_graphcast_gfs",
    label: "Google GraphCast",
    short: "GraphCast",
    originIcon: "🇬🇧",
    originLabel: "Royaume-Uni",
    isAi: true,
    producer: "Google DeepMind · run NOAA/CIRA",
    horizon: "10 jours · pas de 6 h",
    note: "Architecture d’intelligence artificielle conçue par Google DeepMind, ici initialisée par GFS et exécutée par NOAA/CIRA. Les minimales et maximales sont estimées à partir de sorties toutes les 6 heures et de classes de 1 °C : elles sont donc approximatives.",
    color: "#d26ab3",
    sourceType: "aiwp",
    sourceKey: "gc_gfs",
    optional: true
  },
  {
    id: "weathernext_2_mean",
    label: "Google WeatherNext 2 Mean",
    short: "WN2 Mean",
    originIcon: "🇬🇧",
    originLabel: "Royaume-Uni",
    isAi: true,
    producer: "Google DeepMind · moyenne de 64 scénarios",
    horizon: "15 jours · pas de 6 h",
    note: "Moyenne des 64 membres de WeatherNext 2. Elle fournit une trajectoire centrale IA utile face aux modèles physiques, mais le faisceau complet reste plus informatif : une moyenne peut lisser ou masquer deux familles de scénarios opposées.",
    color: "#2c8178",
    sourceType: "weathernext-mean",
    optional: true
  },
  {
    id: "aiwp_pangu_gfs",
    label: "Huawei Pangu-Weather",
    short: "Pangu",
    originIcon: "🇨🇳",
    originLabel: "Chine",
    isAi: true,
    producer: "Huawei · run NOAA/CIRA",
    horizon: "10 jours · pas de 6 h",
    note: "Modèle IA de Huawei fondé sur un transformeur 3D, ici initialisé par GFS et exécuté par NOAA/CIRA. Cette source ne fournit ni pluie ni rafales ; les températures quotidiennes sont des estimations issues de sorties toutes les 6 heures.",
    color: "#7d6bb0",
    sourceType: "aiwp",
    sourceKey: "pw_gfs",
    optional: true
  }
];

const CORE_MODEL_COUNT = DETERMINISTIC_MODELS.filter(model => !model.optional).length;

const ENSEMBLE_MODELS = [
  { id: "ecmwf_ifs025", label: "ECMWF ENS", producer: "ECMWF", originIcon: "🇪🇺", originLabel: "Centre européen", horizon: "15 jours", expectedMembers: 51 },
  { id: "ecmwf_aifs025", label: "ECMWF AIFS", producer: "ECMWF — IA", originIcon: "🇪🇺", originLabel: "Centre européen", isAi: true, horizon: "15 jours", expectedMembers: 51 },
  { id: "weathernext_2", label: "Google WeatherNext 2", producer: "Google DeepMind — IA", originIcon: "🇬🇧", originLabel: "Royaume-Uni", isAi: true, horizon: "15 jours", expectedMembers: 64, sourceType: "weathernext", optional: true },
  { id: "gfs025", label: "GEFS", producer: "NOAA", originIcon: "🇺🇸", originLabel: "États-Unis", horizon: "16 jours", expectedMembers: 31 },
  { id: "ncep_aigefs025", label: "NOAA AIGEFS", producer: "NOAA — IA", originIcon: "🇺🇸", originLabel: "États-Unis", isAi: true, horizon: "16 jours", expectedMembers: 31 },
  { id: "gem_global", label: "GEM", producer: "Environnement Canada", originIcon: "🇨🇦", originLabel: "Canada", horizon: "16 jours", expectedMembers: 21 },
  { id: "icon_seamless", label: "ICON-EPS", producer: "DWD", originIcon: "🇩🇪", originLabel: "Allemagne", horizon: "7 jours environ", expectedMembers: 40 }
];

const LONG_MODELS = [
  { id: "ec46", label: "EC46", producer: "ECMWF", originIcon: "🇪🇺", originLabel: "Centre européen", horizon: "46 jours", expectedMembers: 51 },
  { id: "gfs05", label: "GEFS étendu", producer: "NOAA", originIcon: "🇺🇸", originLabel: "États-Unis", horizon: "35 jours", expectedMembers: 31 }
];

const LEARNING_STORAGE_KEY = "horizon-meteo-learning-v1";
const API_CACHE_PREFIX = "horizon-meteo-api-v2";
const HOUR = 60 * 60 * 1000;
const SCIENCE_LESSONS = [
  { id: "multi-modeles", icon: "◎", title: "Pourquoi plusieurs modèles ?", text: "Chaque centre météo utilise sa propre dynamique, ses observations et ses paramétrisations. Lorsque IFS, GFS, ICON et Météo-France convergent sans partager exactement le même système, le signal gagne en robustesse. Leur désaccord n’est pas un défaut : il révèle une bifurcation encore ouverte." },
  { id: "ensembles", icon: "⑩", title: "Un ensemble n’est pas une moyenne améliorée", text: "Un modèle d’ensemble relance la prévision avec de petites perturbations des conditions initiales et parfois de la physique du modèle. La dispersion des scénarios mesure la sensibilité de l’atmosphère : un faisceau serré suggère une évolution stable, un éventail large une forte incertitude." },
  { id: "quantiles", icon: "↕", title: "P10, P50 et P90", text: "P50 est la médiane : la moitié des scénarios est au-dessus, l’autre moitié au-dessous. P90 n’est pas une température certaine à 90 %, mais une valeur que seuls environ 10 % des scénarios dépassent. Pour le froid, la branche intéressante est plutôt P10 des minimales." },
  { id: "maille", icon: "▦", title: "La maille n’est pas la précision", text: "Une maille de 1,3 km décrit davantage le relief et les contrastes locaux qu’une maille de 25 km. Elle ne garantit pourtant pas que l’averse ou l’orage se produira exactement sur le bon quartier. Plus fin signifie mieux représenté, pas parfaitement localisé." },
  { id: "long-terme", icon: "▤", title: "Pourquoi regrouper au-delà de 15 jours ?", text: "Une date quotidienne perd vite sa signification lorsque les scénarios se décalent dans le temps. Regrouper par semaine permet de conserver le signal utile — plus chaud, plus froid, plus sec ou plus humide — sans fabriquer une précision que l’atmosphère ne permet plus." },
  { id: "runs", icon: "↻", title: "Un run peut changer sans que le modèle se contredise", text: "Chaque nouveau run assimile des observations plus récentes. Une petite différence initiale peut déplacer un front ou une goutte froide plusieurs jours plus tard. Il faut donc suivre la stabilité du scénario d’un run au suivant, pas seulement sa dernière valeur." },
  { id: "graphcast", icon: "✦", title: "GraphCast et les modèles physiques ne raisonnent pas pareil", text: "Un modèle physique résout explicitement des équations de l’atmosphère. GraphCast apprend des régularités à partir d’archives et produit très vite une évolution plausible. Les comparer est précieux : leurs erreurs et leurs forces ne sont pas identiques." },
  { id: "initialisation-ia", icon: "🤖", title: "Même départ, moteurs différents", text: "Les runs GraphCast et Pangu présentés ici sont initialisés par GFS. Leur accord avec GFS n’équivaut donc pas à trois observations totalement indépendantes : ils partagent le même état de départ, mais font évoluer l’atmosphère avec des architectures très différentes." },
  { id: "weathernext-ensemble", icon: "🧬", title: "WeatherNext 2 : 64 futurs, pas 64 modèles", text: "WeatherNext 2 produit 64 membres probabilistes à partir d’un même état initial. Le faisceau décrit donc l’incertitude interne d’une famille de modèles IA, pas 64 avis indépendants. Sa comparaison avec ENS, AIFS et GEFS reste indispensable pour repérer un biais commun ou une bifurcation propre à Google." },
  { id: "pluie", icon: "☔", title: "Pourquoi la pluie diverge plus vite", text: "Les précipitations dépendent souvent de phénomènes étroits et non linéaires. Deux modèles peuvent prévoir la même perturbation mais décaler sa bande pluvieuse de cinquante kilomètres. La moyenne locale baisse alors, même si le risque régional reste élevé." },
  { id: "nuit-tropicale", icon: "☾", title: "La nuit tropicale compte autant que le pic", text: "Pour le confort et la climatisation, une minimale supérieure à 20 °C empêche le bâtiment de se rafraîchir. Une succession de nuits chaudes peut être plus pénible qu’un seul maximum très élevé en journée." },
  { id: "canicule", icon: "☀", title: "Canicule n’est pas synonyme de 35 °C", text: "Une canicule officielle dépend de seuils départementaux de températures minimales et maximales maintenus plusieurs jours, ainsi que d’une expertise sanitaire. L’application repère un signal de chaleur durable, mais ne remplace jamais la vigilance officielle." },
  { id: "biais-local", icon: "⌖", title: "Le biais local survit au bon modèle", text: "Une prévision peut être excellente à l’échelle régionale et garder un biais dans une vallée, sur un plateau ou au centre d’une grande ville. Comparer régulièrement prévision et observation permet d’apprendre ce biais local." },
  { id: "incertitude", icon: "◇", title: "L’incertitude peut être utile", text: "Une forte dispersion ne signifie pas qu’il ne faut rien conclure. Elle indique qu’une décision réversible est préférable : surveiller, préparer la climatisation ou garder une option de repli, sans encore agir comme si le scénario extrême était certain." }
];

const ANALYSIS_GUIDES = [
  {
    id: "pression-z500",
    category: "circulation",
    icon: "◎",
    title: "Relier pression au sol et géopotentiel à 500 hPa",
    source: "Météociel · GEFS",
    url: "https://www.meteociel.fr/modeles/gefs_cartes.php",
    look: "Repérez les dépressions et anticyclones au sol, puis les creux et dorsales vers 5,5 km. Faites avancer l’animation plutôt que de regarder une seule échéance.",
    read: "Un creux de Z500 qui s’approche favorise souvent un temps plus perturbé ; une dorsale favorise la subsidence et un temps plus stable. Des isobares serrées indiquent un gradient de pression et souvent davantage de vent.",
    pitfall: "Une dépression dessinée au bon endroit ne suffit pas : vérifiez aussi sa trajectoire dans plusieurs scénarios et plusieurs runs."
  },
  {
    id: "temperature-850",
    category: "air",
    icon: "↕",
    title: "Suivre les masses d’air avec la température à 850 hPa",
    source: "Météociel · GFS",
    url: "https://www.meteociel.fr/modeles/gfse_cartes.php",
    look: "Choisissez « Temp. 850 hPa / anomalies » et observez l’origine de la langue chaude ou froide ainsi que son déplacement sur plusieurs jours.",
    read: "Vers 1 500 m, la température subit moins le cycle jour-nuit et décrit mieux la masse d’air. Elle aide à distinguer chaleur advectée, air maritime frais et descente froide continentale.",
    pitfall: "La température à 850 hPa n’est pas celle ressentie au sol : relief, vent, humidité, nuages et brassage peuvent fortement modifier la température à 2 m."
  },
  {
    id: "temperature-2m",
    category: "air",
    icon: "2m",
    title: "Bien lire la température à 2 mètres",
    source: "NOAA · Formation météo",
    url: "https://www.weather.gov/jkl/education",
    look: "Distinguez la température instantanée à 2 m, la minimale nocturne et la maximale diurne. Comparez aussi vent, nébulosité, humidité et nature du sol.",
    read: "La température à 2 m décrit la couche d’air où nous vivons. Elle réagit fortement au rayonnement, au brassage, à l’îlot de chaleur urbain et au refroidissement nocturne : c’est la bonne variable pour le confort, le gel local et la climatisation.",
    pitfall: "Une température de chaussée, de toiture ou relevée en plein soleil n’est pas une température normalisée à 2 m sous abri ventilé."
  },
  {
    id: "colonne-2m-850-500",
    category: "air",
    icon: "↟",
    title: "Comprendre la colonne 2 m → 850 → 500 hPa",
    source: "ECMWF · OpenCharts",
    url: "https://charts.ecmwf.int/products/aifs_single_medium-z500-t850",
    look: "Lisez verticalement : 2 m pour les effets locaux, 850 hPa vers 1 500 m pour la masse d’air, puis 500 hPa vers 5 500 m pour les creux, dorsales et le pilotage des perturbations.",
    read: "Avec le gradient moyen de l’atmosphère standard, l’écart indicatif est d’environ 10 °C entre 2 m et 850 hPa, 26 °C entre 850 et 500 hPa, et 36 °C entre 2 m et 500 hPa. Ce sont des règles graduées, pas des conversions de prévision.",
    pitfall: "Les niveaux de pression ne sont pas des altitudes fixes. En montagne, 850 hPa peut même se trouver près du sol ou sous le relief du modèle."
  },
  {
    id: "ecarts-saisonniers-850",
    category: "air",
    icon: "☀",
    title: "Relier T850 et température au sol selon la saison",
    source: "ECMWF · Guide des cartes",
    url: "https://charts.ecmwf.int/products/aifs_single_medium-z500-t850",
    look: "Comparez T850 à la maximale prévue, puis vérifiez ensoleillement, vent et humidité. Recommencez sur plusieurs journées comparables pour apprendre le biais local.",
    read: "En été, par temps ensoleillé et bien brassé à basse altitude, ajouter environ 10 à 15 °C à T850 donne parfois un ordre de grandeur de la maximale. Aux saisons intermédiaires l’écart dépend davantage du brassage ; en hiver, inversions, brouillard et sol froid peuvent rendre cette relation inutilisable.",
    pitfall: "N’appliquez jamais mécaniquement « T850 + 10 » en hiver, sous stratus, en vallée, sur neige ou avec une forte inversion."
  },
  {
    id: "gradient-850-500",
    category: "air",
    icon: "∆",
    title: "Mesurer la stabilité avec l’écart T850 − T500",
    source: "NOAA/NWS · Indices verticaux",
    url: "https://www.weather.gov/lmk/indices",
    look: "Soustrayez la température à 500 hPa de celle à 850 hPa. Regardez ensuite l’humidité et le soulèvement : l’écart thermique ne suffit pas à produire un orage.",
    read: "Un écart proche de 25 à 26 °C correspond à un gradient assez raide sur cette couche et peut favoriser l’instabilité en saison chaude. Un écart nettement plus faible décrit une colonne plus stable, surtout si une inversion est présente.",
    pitfall: "Un fort gradient sans humidité, sans déclenchement ou sous une couche d’inhibition peut ne donner aucune convection."
  },
  {
    id: "inversion-thermique",
    category: "air",
    icon: "⌁",
    title: "Repérer une inversion et comprendre les nuits froides",
    source: "NOAA · Éducation météo",
    url: "https://www.weather.gov/jkl/education",
    look: "Cherchez une température qui augmente avec l’altitude dans les basses couches, un vent faible, un ciel dégagé et une vallée ou cuvette topographique.",
    read: "Lors d’une inversion, l’air froid et dense reste près du sol tandis que l’air est plus doux au-dessus. T850 peut alors être relativement élevée alors que la température à 2 m chute, avec risque de brouillard, gel ou pollution piégée.",
    pitfall: "Une carte T850 seule peut manquer complètement un gel radiatif très local. Consultez les minimales à 2 m et les profils verticaux."
  },
  {
    id: "point-rosee",
    category: "air",
    icon: "♨",
    title: "Préférer le point de rosée pour quantifier l’humidité",
    source: "NOAA/NWS · Humidité",
    url: "https://www.weather.gov/lmk/humidity",
    look: "Comparez température et point de rosée à 2 m. Un écart qui se resserre signale une approche de la saturation ; suivez aussi son évolution pendant la nuit.",
    read: "Le point de rosée renseigne plus directement sur la quantité de vapeur d’eau que l’humidité relative, qui varie aussi avec la température. Il aide à apprécier lourdeur estivale, brouillard, rosée et potentiel de refroidissement nocturne.",
    pitfall: "Une humidité relative élevée au petit matin ne signifie pas forcément qu’une grande quantité de vapeur d’eau est présente dans un air très froid."
  },
  {
    id: "theta-w-850",
    category: "air",
    icon: "θ",
    title: "Suivre les fronts avec la thêta’w à 850 hPa",
    source: "Météociel · GFS",
    url: "https://www.meteociel.fr/modeles/gfse_cartes.php",
    look: "Sélectionnez la température potentielle du thermomètre mouillé à 850 hPa lorsqu’elle est disponible. Repérez les gradients serrés et leur déplacement.",
    read: "La thêta’w combine en partie chaleur et humidité de la masse d’air. Ses forts contrastes aident à suivre les limites de masses d’air et les fronts, parfois plus nettement que la seule température à 850 hPa.",
    pitfall: "Un gradient de thêta’w localise une zone frontale probable, pas nécessairement l’heure exacte du passage ni le cumul de pluie au sol."
  },
  {
    id: "humidite-700-omega",
    category: "precipitations",
    icon: "⇡",
    title: "Croiser humidité à 700 hPa et mouvement vertical",
    source: "NOAA/NWS · Comparaison des cartes",
    url: "https://www.weather.gov/source/zhu/ZHU_Training_Page/Miscellaneous/chart_comparison/chart_comparison.htm",
    look: "À 700 hPa, superposez humidité et oméga ou vitesse verticale. Cherchez une zone humide coïncidant avec un soulèvement persistant.",
    read: "Le soulèvement refroidit l’air et favorise la condensation s’il est assez humide. Cette combinaison aide à distinguer une perturbation activement pluvieuse d’un simple passage nuageux.",
    pitfall: "Le signe de l’oméga varie selon les conventions graphiques. Lisez toujours la légende avant d’interpréter les couleurs."
  },
  {
    id: "cape-cin-cisaillement",
    category: "precipitations",
    icon: "⚡",
    title: "Lire CAPE, CIN et cisaillement ensemble",
    source: "NOAA/NWS · Paramètres convectifs",
    url: "https://www.weather.gov/source/zhu/ZHU_Training_Page/convective_parameters/Sounding_Stuff/MesoscaleParameters.html",
    look: "Commencez par la CAPE disponible, vérifiez la CIN qui peut bloquer le départ des ascendances, puis le cisaillement du vent qui organise ou désorganise les cellules.",
    read: "La CAPE mesure une énergie potentielle, pas la certitude d’un orage. La CIN décrit le couvercle à franchir ; le cisaillement influence ensuite la durée de vie et l’organisation des orages.",
    pitfall: "Une CAPE spectaculaire isolée d’un profil vertical, de l’humidité, d’un déclencheur et du cisaillement est un mauvais résumé du risque."
  },
  {
    id: "epaisseur-1000-500",
    category: "air",
    icon: "❄",
    title: "Utiliser l’épaisseur 1000–500 hPa en hiver",
    source: "NOAA/NWS · Prévision hivernale",
    url: "https://www.weather.gov/sgf/winter_checklist_paper",
    look: "Consultez l’épaisseur 1000–500 hPa avec la température à 850 hPa et surtout le profil complet près de 0 °C.",
    read: "Une faible épaisseur traduit une colonne d’air globalement froide. Le repère historique de 5 400 m aide à situer la transition pluie-neige, mais il doit être adapté au lieu, au relief et à la situation.",
    pitfall: "Le seuil 5 400 m n’est pas une frontière universelle. Une couche chaude en altitude ou une fine couche froide au sol peut produire pluie verglaçante, grésil ou pluie malgré ce repère."
  },
  {
    id: "ensemble-aifs",
    category: "ensembles",
    icon: "⑩",
    title: "Comparer les 51 scénarios d’AIFS",
    source: "Météociel · ECMWF AIFS ENS",
    url: "https://www.meteociel.fr/modeles/ecmwfens_cartes.php?aifs=1",
    look: "Passez de la moyenne à l’écart-type, puis aux quantiles 10, 50 et 90 %. Comparez pression/Z500, température à 850 hPa et précipitations.",
    read: "Un signal présent dans la moyenne avec une faible dispersion est plus robuste. Une moyenne lisse entourée d’un fort écart-type peut cacher plusieurs familles de scénarios incompatibles.",
    pitfall: "La moyenne de deux trajectoires de dépression peut dessiner une dépression centrale qui n’existe dans aucun scénario."
  },
  {
    id: "weatherlab-cyclones",
    category: "ensembles",
    icon: "🌀",
    title: "Explorer les scénarios de cyclones dans Weather Lab",
    source: "Google DeepMind · Weather Lab",
    url: "https://deepmind.google.com/science/weatherlab",
    look: "Choisissez un cyclone puis comparez le faisceau de trajectoires, l’intensité et la taille prévues. Observez comment la dispersion s’ouvre avec l’échéance et comment les familles évoluent d’un cycle à l’autre.",
    read: "Weather Lab met en scène des modèles expérimentaux de la famille WeatherNext. Un resserrement du faisceau indique un accord interne accru ; plusieurs paquets de trajectoires signalent des scénarios concurrents qu’une simple moyenne masquerait.",
    pitfall: "Cette vitrine expérimentale n’est ni une alerte ni une prévision officielle. Pour une décision réelle, revenez toujours au service météorologique national concerné."
  },
  {
    id: "ecmwf-opencharts",
    category: "circulation",
    icon: "◫",
    title: "Lire la circulation générale sur les cartes ECMWF",
    source: "ECMWF · OpenCharts",
    url: "https://charts.ecmwf.int/",
    look: "Commencez par « 500 hPa geopotential height and 850 hPa temperature », puis comparez contrôle, moyenne d’ensemble et dispersion.",
    read: "La forme des lignes de Z500 montre les ondulations du courant d’ouest. La température à 850 hPa précise la nature des masses d’air transportées par cette circulation.",
    pitfall: "Au-delà d’une semaine, privilégiez la structure à grande échelle et la dispersion plutôt que la position exacte d’une petite anomalie."
  },
  {
    id: "jet-stream",
    category: "circulation",
    icon: "➜",
    title: "Repérer le courant-jet et la trajectoire des perturbations",
    source: "ECMWF · OpenCharts",
    url: "https://charts.ecmwf.int/",
    look: "Sélectionnez la pression au niveau de la mer avec le vent à 200 hPa. Suivez le ruban de vents les plus forts et ses ondulations sur l’Atlantique Nord.",
    read: "Le jet guide souvent les dépressions. Une France située au sud du jet connaît plus facilement une alimentation chaude ; sous ou au nord du jet, le temps est souvent plus mobile, sans que cette règle soit absolue.",
    pitfall: "Le jet n’est pas une frontière météo parfaite : regardez aussi les fronts, l’humidité et la situation au sol."
  },
  {
    id: "radar-direct",
    category: "precipitations",
    icon: "🌧",
    title: "Vérifier la pluie réellement observée au radar",
    source: "Météo-France · Radar",
    url: "https://meteofrance.com/images-radar",
    look: "Animez au moins les six dernières images. Regardez la direction, la vitesse, l’organisation et le renforcement ou l’affaiblissement des échos.",
    read: "Le radar répond à la question « où pleut-il maintenant ? ». Une bande homogène évoque souvent un front ; des cellules compactes et rapidement évolutives peuvent signaler des averses ou des orages.",
    pitfall: "Un écho radar ne garantit pas que toute la précipitation atteint le sol et les reliefs peuvent créer des masques ou des artefacts."
  },
  {
    id: "radar-apprendre",
    category: "precipitations",
    icon: "?",
    title: "Apprendre le code couleur et les limites du radar",
    source: "Météo-France · Comprendre la météo",
    url: "https://meteofrance.com/actualites-et-dossiers/comprendre-la-meteo/comment-interpreter-une-image-radar",
    look: "Lisez la légende en millimètres par heure et comparez couleur, extension spatiale et persistance dans l’animation.",
    read: "L’intensité instantanée n’est pas le cumul final. Une pluie modérée persistante peut donner davantage d’eau qu’une cellule très intense mais brève.",
    pitfall: "Ne déduisez pas automatiquement « grêle » d’une couleur rouge : une expertise croisée avec satellite, foudre et observations reste nécessaire."
  },
  {
    id: "satellite",
    category: "precipitations",
    icon: "◉",
    title: "Observer les nuages depuis Meteosat",
    source: "EUMETSAT · Earth View",
    url: "https://www.eumetsat.int/real-time-imagery/earth-view",
    look: "Suivez l’enroulement des systèmes nuageux, la naissance des amas convectifs et les zones qui se dégagent. Tenez compte de l’heure UTC affichée.",
    read: "Le satellite montre la structure et l’évolution des nuages, y compris là où le radar français ne porte pas encore. L’infrarouge nocturne aide à repérer les sommets nuageux froids.",
    pitfall: "Un nuage très blanc ou très froid n’indique pas directement la quantité de pluie au sol."
  },
  {
    id: "enso-diagnostic",
    category: "climat",
    icon: "≈",
    title: "Suivre El Niño et La Niña à la source",
    source: "NOAA CPC · Diagnostic ENSO",
    url: "https://www.cpc.ncep.noaa.gov/products/analysis_monitoring/enso_advisory/ensodisc.html",
    look: "Commencez par le statut d’alerte, l’indice Niño-3.4, les anomalies sous la surface du Pacifique et les probabilités pour les saisons suivantes.",
    read: "ENSO est un couplage océan-atmosphère : une anomalie de température de mer ne suffit pas, il faut aussi une réponse des vents et de la convection tropicale.",
    pitfall: "El Niño modifie des probabilités saisonnières ; il ne permet pas de prévoir directement le temps d’un jour donné à Paris."
  },
  {
    id: "enso-comprendre",
    category: "climat",
    icon: "🌊",
    title: "Comprendre le mécanisme d’El Niño",
    source: "NOAA Climate.gov · ENSO",
    url: "https://www.climate.gov/enso",
    look: "Parcourez la circulation de Walker, la région Niño-3.4 et les cartes d’impacts typiques selon la saison.",
    read: "Les alizés, la thermocline et les températures de surface du Pacifique interagissent. C’est cette interaction persistante qui distingue ENSO d’une anomalie océanique passagère.",
    pitfall: "Les cartes d’impacts sont des tendances statistiques globales, pas des conséquences garanties partout et chaque année."
  },
  {
    id: "stratosphere",
    category: "air",
    icon: "△",
    title: "Surveiller le vortex polaire à 10 hPa",
    source: "Météociel · GFS",
    url: "https://www.meteociel.fr/modeles/gfse_cartes.php",
    look: "En hiver, sélectionnez « Temp. 10 hPa strat. » et observez la forme, la position et un éventuel réchauffement du vortex sur l’hémisphère Nord.",
    read: "Un réchauffement stratosphérique majeur peut perturber le vortex, mais ses effets éventuels sur la troposphère demandent souvent plusieurs jours ou semaines et ne sont pas automatiques.",
    pitfall: "Une carte spectaculaire à 10 hPa ne constitue jamais, à elle seule, une prévision de vague de froid en France."
  },
  {
    id: "vigilance",
    category: "securite",
    icon: "!",
    title: "Terminer par la Vigilance officielle",
    source: "Météo-France · Vigilance",
    url: "https://vigilance.meteofrance.fr/fr",
    look: "Consultez la couleur du département, le phénomène concerné, la chronologie et le bulletin de suivi associé.",
    read: "La Vigilance combine modèles, observations, expertise et enjeux territoriaux. Elle doit primer sur une interprétation personnelle des cartes pour toute décision de sécurité.",
    pitfall: "Une carte de modèle n’est ni une alerte ni une prévision expertisée des conséquences locales."
  }
];

const POLLEN_TYPES = [
  { key: "alder_pollen", label: "Aulne" },
  { key: "birch_pollen", label: "Bouleau" },
  { key: "grass_pollen", label: "Graminées" },
  { key: "mugwort_pollen", label: "Armoise" },
  { key: "olive_pollen", label: "Olivier" },
  { key: "ragweed_pollen", label: "Ambroisie" }
];

const AIR_POLLUTANTS = [
  { key: "pm2_5", label: "PM2,5", unit: "µg/m³" },
  { key: "pm10", label: "PM10", unit: "µg/m³" },
  { key: "nitrogen_dioxide", label: "NO₂", unit: "µg/m³" },
  { key: "ozone", label: "O₃", unit: "µg/m³" }
];

const state = {
  location: null,
  deterministic: [],
  consensus: [],
  ensembles: [],
  longRange: [],
  selectedModel: 0,
  selectedEnsemble: 0,
  selectedLong: 0,
  learningQueue: [],
  environment: null,
  environmentRequest: 0,
  franceMapPromise: null,
  ensembleMapPromise: null,
  insightLoaded: { stability: false, atmosphere: false, extremes: false }
};

const el = id => document.getElementById(id);
const isNumber = value => typeof value === "number" && Number.isFinite(value);
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const mean = values => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : null;

function standardDeviation(values) {
  if (values.length < 2) return 0;
  const average = mean(values);
  return Math.sqrt(mean(values.map(value => (value - average) ** 2)));
}

function quantile(values, q) {
  const sorted = values.filter(isNumber).sort((a, b) => a - b);
  if (!sorted.length) return null;
  const position = (sorted.length - 1) * q;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  if (lower === upper) return sorted[lower];
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function round(value, decimals = 0) {
  if (!isNumber(value)) return null;
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function formatTemperature(value) {
  return isNumber(value) ? `${Math.round(value)}°` : "—";
}

function formatRain(value) {
  if (!isNumber(value)) return "—";
  if (value < 0.05) return "0 mm";
  return `${value < 10 ? round(value, 1) : Math.round(value)} mm`;
}

function temperatureClass(value) {
  if (!isNumber(value)) return "temperature-neutral";
  if (value <= 0) return "temperature-freezing";
  if (value <= 10) return "temperature-cold";
  if (value >= 35) return "temperature-extreme";
  if (value >= 30) return "temperature-hot";
  if (value >= 24) return "temperature-warm";
  return "temperature-mild";
}

function temperatureBadge(value) {
  return `<span class="weather-value ${temperatureClass(value)}"><span aria-hidden="true">${isNumber(value) && value >= 24 ? "☀" : isNumber(value) && value <= 10 ? "❄" : "●"}</span>${formatTemperature(value)}</span>`;
}

function rainMeta(value) {
  if (!isNumber(value)) return { icon: "·", label: "Indisponible", className: "rain-unknown" };
  if (value < 0.05) return { icon: "○", label: "Sec", className: "rain-none" };
  if (value < 2) return { icon: "💧", label: "Faible", className: "rain-light" };
  if (value < 10) return { icon: "🌦", label: "Modérée", className: "rain-moderate" };
  if (value < 20) return { icon: "🌧", label: "Forte", className: "rain-heavy" };
  return { icon: "☔", label: "Très forte", className: "rain-very-heavy" };
}

function rainBadge(value, showLabel = false) {
  const meta = rainMeta(value);
  return `<span class="weather-value rain-value ${meta.className}" aria-label="Pluie ${meta.label.toLowerCase()} : ${formatRain(value)}"><span class="weather-icon" aria-hidden="true">${meta.icon}</span><span>${formatRain(value)}</span>${showLabel ? `<span class="weather-label">${meta.label}</span>` : ""}</span>`;
}

function parseDay(dateString) {
  return new Date(`${dateString}T12:00:00`);
}

function dayLabel(dateString, compact = false) {
  return new Intl.DateTimeFormat("fr-FR", compact
    ? { weekday: "short", day: "numeric" }
    : { weekday: "short", day: "numeric", month: "short" }
  ).format(parseDay(dateString)).replace(".", "");
}

function dateRangeLabel(start, end) {
  const formatter = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" });
  return `${formatter.format(parseDay(start))} – ${formatter.format(parseDay(end))}`;
}

async function fetchJSON(url, timeoutMs = 20000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      let reason = "";
      try {
        const payload = await response.clone().json();
        reason = payload.reason || "";
      } catch {}
      const error = new Error(reason || `Service météo indisponible (${response.status})`);
      error.status = response.status;
      throw error;
    }
    const data = await response.json();
    if (data.error) throw new Error(data.reason || "Réponse météo invalide");
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function apiCacheKey(url) {
  let hash = 2166136261;
  for (let index = 0; index < url.length; index += 1) {
    hash ^= url.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `${API_CACHE_PREFIX}:${(hash >>> 0).toString(36)}`;
}

function readApiCache(url, maxAgeMs) {
  try {
    const stored = JSON.parse(localStorage.getItem(apiCacheKey(url)) || "null");
    if (!stored || stored.url !== url || Date.now() - stored.savedAt > maxAgeMs) return null;
    return stored.data;
  } catch {
    return null;
  }
}

function writeApiCache(url, data) {
  try {
    localStorage.setItem(apiCacheKey(url), JSON.stringify({ url, data, savedAt: Date.now() }));
  } catch {}
}

async function fetchJSONCached(url, timeoutMs, freshForMs, staleForMs = freshForMs) {
  const fresh = readApiCache(url, freshForMs);
  if (fresh) return fresh;
  try {
    const data = await fetchJSON(url, timeoutMs);
    writeApiCache(url, data);
    return data;
  } catch (error) {
    const stale = readApiCache(url, staleForMs);
    if (stale) return stale;
    throw error;
  }
}

function ensembleServiceMessage(errors, fallback) {
  if (errors.some(error => error?.status === 429 || /limit|quota|too many/i.test(error?.message || ""))) {
    return "Quota météo temporairement atteint. Les cartes nationales sont maintenant chargées seulement à la demande pour éviter que cela se reproduise. Réessayez plus tard.";
  }
  const detail = errors.find(error => error?.message)?.message;
  return detail ? `${fallback} (${detail})` : fallback;
}

function forecastUrl(base, location, params) {
  const search = new URLSearchParams({
    latitude: location.lat,
    longitude: location.lon,
    timezone: "auto",
    ...params
  });
  return `${base}?${search.toString()}`;
}

async function fetchDeterministic(location) {
  const variables = "temperature_2m_max,temperature_2m_min,precipitation_sum,wind_gusts_10m_max";
  const tasks = DETERMINISTIC_MODELS.map(async meta => {
    if (meta.sourceType === "aiwp") return deterministicFromAiWp(meta, location);
    if (meta.sourceType === "weathernext-mean") return deterministicFromWeatherNextMean(meta, location);
    const url = forecastUrl("https://api.open-meteo.com/v1/forecast", location, {
      daily: variables,
      models: meta.id,
      forecast_days: "10"
    });
    const response = await fetchJSONCached(url, 20000, .75 * HOUR, 6 * HOUR);
    return {
      ...meta,
      timezone: response.timezone,
      elevation: response.elevation,
      dates: response.daily?.time || [],
      max: response.daily?.temperature_2m_max || [],
      min: response.daily?.temperature_2m_min || [],
      rain: response.daily?.precipitation_sum || [],
      gust: response.daily?.wind_gusts_10m_max || []
    };
  });

  const results = await Promise.allSettled(tasks);
  return results.filter(result => result.status === "fulfilled").map(result => result.value);
}

function deterministicFromWeatherNextMean(meta, location) {
  const ensemble = ensembleFromWeatherNext({ ...meta, sourceType: "weathernext" }, location);
  const averageSeries = field => ensemble.dates.map((_, dayIndex) => mean(
    ensemble.matrices[field].map(series => series[dayIndex]).filter(isNumber)
  ));
  return {
    ...meta,
    timezone: "Europe/Paris",
    elevation: null,
    dates: ensemble.dates.slice(0, 10),
    max: averageSeries("max").slice(0, 10),
    min: averageSeries("min").slice(0, 10),
    rain: averageSeries("rain").slice(0, 10),
    gust: ensemble.dates.slice(0, 10).map(() => null),
    sourceCycle: ensemble.sourceCycle
  };
}

function deterministicFromAiWp(meta, location) {
  const data = window.AI_WEATHER_GRID;
  const grid = data?.grid;
  const source = data?.models?.[meta.sourceKey];
  if (!grid || !source?.daily?.length) throw new Error(`${meta.label} indisponible`);
  const latIndex = Math.round((location.lat - grid.latMin) / grid.step);
  const lonIndex = Math.round((location.lon - grid.lonMin) / grid.step);
  if (latIndex < 0 || latIndex >= grid.latCount || lonIndex < 0 || lonIndex >= grid.lonCount) {
    throw new Error(`${meta.label} est actuellement préparé pour la France métropolitaine`);
  }
  const index = latIndex * grid.lonCount + lonIndex;
  const dates = source.daily.map(day => day.date);
  return {
    ...meta,
    timezone: "Europe/Paris",
    elevation: null,
    dates,
    max: source.daily.map(day => day.max[index]),
    min: source.daily.map(day => day.min[index]),
    rain: dates.map(() => null),
    gust: dates.map(() => null),
    sourceCycle: data.cycle,
    approximation: data.approximation
  };
}

function computeConfidence(maxValues, minValues, rainValues, dayIndex, modelCount) {
  const temperatureSpread = mean([standardDeviation(maxValues), standardDeviation(minValues)].filter(isNumber)) || 0;
  const wetFlags = rainValues.map(value => value >= 1 ? 1 : 0);
  const wetAgreement = wetFlags.length ? Math.abs(mean(wetFlags) - .5) * 2 : 0;
  const rainScale = mean(rainValues) || 0;
  const rainVariability = rainValues.length > 1 ? Math.min(1, standardDeviation(rainValues) / (rainScale + 2)) : 0;

  const temperatureAgreement = clamp(100 - temperatureSpread * 22, 20, 100);
  const rainAgreement = clamp(45 + wetAgreement * 35 + (1 - rainVariability) * 20, 20, 100);
  const coverage = clamp(modelCount / CORE_MODEL_COUNT * 100, 0, 100);
  const horizon = clamp(100 - dayIndex * 5.5, 45, 100);
  return Math.round(temperatureAgreement * .5 + rainAgreement * .2 + coverage * .15 + horizon * .15);
}

function computeConsensus(models) {
  const reference = models.find(model => model.dates.length)?.dates || [];
  return reference.map((date, index) => {
    const maxValues = models.map(model => model.max[index]).filter(isNumber);
    const minValues = models.map(model => model.min[index]).filter(isNumber);
    const rainValues = models.map(model => model.rain[index]).filter(isNumber);
    const gustValues = models.map(model => model.gust[index]).filter(isNumber);
    const modelCount = Math.max(maxValues.length, minValues.length, rainValues.length);
    return {
      date,
      dayIndex: index,
      max: mean(maxValues),
      maxLow: maxValues.length ? Math.min(...maxValues) : null,
      maxHigh: maxValues.length ? Math.max(...maxValues) : null,
      min: mean(minValues),
      minLow: minValues.length ? Math.min(...minValues) : null,
      minHigh: minValues.length ? Math.max(...minValues) : null,
      rain: mean(rainValues),
      rainLow: rainValues.length ? Math.min(...rainValues) : null,
      rainHigh: rainValues.length ? Math.max(...rainValues) : null,
      gust: mean(gustValues),
      confidence: computeConfidence(maxValues, minValues, rainValues, index, modelCount),
      modelCount
    };
  });
}

function confidenceMeta(score) {
  if (score >= 78) return { label: "Élevée", className: "confidence-high" };
  if (score >= 60) return { label: "Moyenne", className: "confidence-medium" };
  return { label: "Faible", className: "confidence-low" };
}

function seasonMeta() {
  const month = new Date().getMonth() + 1;
  if ([6, 7, 8].includes(month)) return { key: "summer", label: "Priorité chaleur" };
  if ([12, 1, 2].includes(month)) return { key: "winter", label: "Priorité froid" };
  return { key: "shoulder", label: "Priorité précipitations" };
}

function longestRun(days, predicate) {
  let best = [];
  let current = [];
  days.forEach(day => {
    if (predicate(day)) {
      current.push(day);
      if (current.length > best.length) best = [...current];
    } else {
      current = [];
    }
  });
  return best;
}

function signalSummary(consensus) {
  const hottest = consensus.filter(day => isNumber(day.max)).sort((a, b) => b.max - a.max)[0];
  const coldest = consensus.filter(day => isNumber(day.min)).sort((a, b) => a.min - b.min)[0];
  const totalRain = consensus.reduce((sum, day) => sum + (day.rain || 0), 0);
  const tropicalNights = consensus.filter(day => day.min >= 20);
  const hotRun = longestRun(consensus, day => day.max >= 30);
  const frostDays = consensus.filter(day => day.min <= 0);
  const averageConfidence = mean(consensus.map(day => day.confidence)) || 0;
  const lowestConfidence = consensus.slice().sort((a, b) => a.confidence - b.confidence)[0];

  return { hottest, coldest, totalRain, tropicalNights, hotRun, frostDays, averageConfidence, lowestConfidence };
}

function renderOverview() {
  const season = seasonMeta();
  const signals = signalSummary(state.consensus);
  el("season-label").textContent = season.label;

  const cards = [];
  if (season.key === "summer") {
    cards.push({ className: "heat", icon: "☀", label: "Pic de chaleur", value: formatTemperature(signals.hottest?.max), detail: signals.hottest ? `${dayLabel(signals.hottest.date)} · moyenne des modèles` : "Pas de donnée" });
    cards.push({ className: "heat", icon: "☾", label: "Nuits ≥ 20 °C", value: `${signals.tropicalNights.length}`, detail: signals.tropicalNights.length ? `Première : ${dayLabel(signals.tropicalNights[0].date)}` : "Aucune dans le consensus" });
  } else if (season.key === "winter") {
    cards.push({ className: "cold", icon: "❄", label: "Minimum", value: formatTemperature(signals.coldest?.min), detail: signals.coldest ? `${dayLabel(signals.coldest.date)} · à 2 mètres` : "Pas de donnée" });
    cards.push({ className: "cold", icon: "◇", label: "Jours avec gel", value: `${signals.frostDays.length}`, detail: signals.frostDays.length ? `Premier : ${dayLabel(signals.frostDays[0].date)}` : "Aucun dans le consensus" });
  } else {
    cards.push({ className: "rain", icon: "☔", label: "Cumul sur 10 jours", value: formatRain(signals.totalRain), detail: "Moyenne des modèles" });
    const wettest = state.consensus.slice().sort((a, b) => (b.rain || 0) - (a.rain || 0))[0];
    cards.push({ className: "rain", icon: rainMeta(wettest?.rain).icon, label: "Jour le plus arrosé", value: formatRain(wettest?.rain), detail: wettest ? dayLabel(wettest.date) : "Pas de donnée" });
  }

  cards.push({ className: "rain", icon: "☔", label: "Pluie sur 10 jours", value: formatRain(signals.totalRain), detail: "Cumul moyen multimodèle" });
  cards.push({ className: "confidence", icon: "✓", label: "Confiance moyenne", value: `${Math.round(signals.averageConfidence)}/100`, detail: signals.lowestConfidence ? `Plus fragile : ${dayLabel(signals.lowestConfidence.date)}` : "—" });

  el("signal-cards").innerHTML = cards.slice(0, 4).map(card => `
    <article class="signal-card ${card.className}">
      <span class="signal-icon" aria-hidden="true">${card.icon}</span>
      <span class="label">${card.label}</span>
      <strong>${card.value}</strong>
      <p>${card.detail}</p>
    </article>
  `).join("");

  let headline;
  if (season.key === "summer" && signals.hotRun.length >= 3) {
    headline = `Un <strong>signal de chaleur durable</strong> apparaît du ${dayLabel(signals.hotRun[0].date)} au ${dayLabel(signals.hotRun.at(-1).date)}, avec ${signals.hotRun.length} maximales moyennes consécutives d’au moins 30 °C. C’est un signal utile pour anticiper la climatisation ou un déplacement, mais pas une vigilance canicule officielle.`;
  } else if (season.key === "winter" && signals.frostDays.length) {
    headline = `Le consensus fait apparaître <strong>${signals.frostDays.length} jour${signals.frostDays.length > 1 ? "s" : ""} avec risque de gel</strong>. La branche froide des ensembles permettra de voir si le risque est plus marqué que la moyenne.`;
  } else if (signals.totalRain >= 25) {
    headline = `La période présente un <strong>signal humide notable</strong>, avec environ ${formatRain(signals.totalRain)} sur dix jours. Consultez le détail par modèle : les cumuls de pluie divergent souvent davantage que les températures.`;
  } else {
    headline = `Le scénario central ne montre pas de signal saisonnier majeur sur les dix prochains jours. La journée la plus chaude serait ${dayLabel(signals.hottest.date)} autour de ${formatTemperature(signals.hottest.max)}.`;
  }
  el("headline-summary").innerHTML = headline;
}

function nearestEnvironmentHour(times = []) {
  if (!times.length) return 0;
  const now = Date.now();
  let bestIndex = 0;
  let bestDistance = Infinity;
  times.forEach((time, index) => {
    const distance = Math.abs(new Date(time).getTime() - now);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestIndex = index;
    }
  });
  return bestIndex;
}

function environmentWindow(hourly, key, startIndex, hours = 24) {
  return (hourly?.[key] || []).slice(startIndex, startIndex + hours).filter(isNumber);
}

function environmentNumber(value) {
  if (!isNumber(value)) return "—";
  return String(value < 10 ? round(value, 1) : Math.round(value));
}

function environmentSeries(hourly, key, startIndex, hours = 25) {
  return (hourly?.[key] || []).slice(startIndex, startIndex + hours).map(value => isNumber(value) ? value : null);
}

function smoothTrendPath(points) {
  if (!points.length) return "";
  if (points.length === 1) return `M${points[0][0]},${points[0][1]}`;
  let path = `M${points[0][0]},${points[0][1]}`;
  for (let index = 1; index < points.length - 1; index += 1) {
    const current = points[index];
    const next = points[index + 1];
    const midX = (current[0] + next[0]) / 2;
    const midY = (current[1] + next[1]) / 2;
    path += ` Q${current[0]},${current[1]} ${midX},${midY}`;
  }
  const beforeLast = points[points.length - 2];
  const last = points[points.length - 1];
  return `${path} Q${beforeLast[0]},${beforeLast[1]} ${last[0]},${last[1]}`;
}

function environmentTrendChart(times, values, { label, unit, tone = "air" }) {
  const pairs = values.map((value, index) => ({ value, time: times[index], index })).filter(item => isNumber(item.value));
  if (pairs.length < 2) return `<p class="environment-source">Pas assez de valeurs horaires pour tracer l’évolution.</p>`;
  const width = 520;
  const height = 138;
  const margin = { left: 34, right: 12, top: 12, bottom: 27 };
  const maximum = Math.max(...pairs.map(item => item.value));
  const yMax = Math.max(1, maximum * 1.12);
  const x = index => margin.left + index / Math.max(1, values.length - 1) * (width - margin.left - margin.right);
  const y = value => height - margin.bottom - value / yMax * (height - margin.top - margin.bottom);
  const points = pairs.map(item => [round(x(item.index), 1), round(y(item.value), 1)]);
  const linePath = smoothTrendPath(points);
  const baseline = height - margin.bottom;
  const areaPath = `${linePath} L${points.at(-1)[0]},${baseline} L${points[0][0]},${baseline} Z`;
  const labelAt = index => {
    const time = times[index];
    if (!time) return "";
    return new Intl.DateTimeFormat("fr-FR", { weekday: "short", hour: "2-digit" }).format(new Date(time)).replace(" h", "h");
  };
  const middleIndex = Math.floor((values.length - 1) / 2);
  return `
    <figure class="environment-trend ${tone === "pollen" ? "pollen-trend" : "air-trend"}">
      <figcaption><strong>${label}</strong><span>continu, heure par heure · maximum ${environmentNumber(maximum)} ${unit}</span></figcaption>
      <svg class="environment-trend-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Évolution horaire de ${label}, maximum ${environmentNumber(maximum)} ${unit}">
        <line class="environment-trend-grid" x1="${margin.left}" y1="${baseline}" x2="${width - margin.right}" y2="${baseline}"></line>
        <line class="environment-trend-grid" x1="${margin.left}" y1="${y(yMax / 2)}" x2="${width - margin.right}" y2="${y(yMax / 2)}"></line>
        <text class="environment-trend-axis" x="${margin.left - 7}" y="${baseline + 4}" text-anchor="end">0</text>
        <text class="environment-trend-axis" x="${margin.left - 7}" y="${y(yMax / 2) + 4}" text-anchor="end">${environmentNumber(yMax / 2)}</text>
        <path class="environment-trend-area" d="${areaPath}"></path>
        <path class="environment-trend-line" d="${linePath}"></path>
        <text class="environment-trend-axis" x="${x(0)}" y="${height - 7}" text-anchor="start">${labelAt(0)}</text>
        <text class="environment-trend-axis" x="${x(middleIndex)}" y="${height - 7}" text-anchor="middle">${labelAt(middleIndex)}</text>
        <text class="environment-trend-axis" x="${x(values.length - 1)}" y="${height - 7}" text-anchor="end">${labelAt(values.length - 1)}</text>
      </svg>
    </figure>`;
}

function environmentRows(items) {
  return `<div class="environment-rows">${items.map(item => {
    const ratio = isNumber(item.current) && isNumber(item.peak) && item.peak > 0 ? clamp(item.current / item.peak * 100, 0, 100) : 0;
    return `<div class="environment-row">
      <strong>${item.label}</strong>
      <div class="environment-bar" aria-hidden="true"><span style="width:${round(ratio, 1)}%"></span></div>
      <span><b>${environmentNumber(item.current)}</b> ${item.unit}<small>pic ${environmentNumber(item.peak)}</small></span>
    </div>`;
  }).join("")}</div>`;
}

function europeanAqiMeta(value) {
  if (!isNumber(value)) return { label: "Indisponible", className: "" };
  if (value <= 20) return { label: "Bon", className: "air-level-good" };
  if (value <= 40) return { label: "Acceptable", className: "air-level-fair" };
  if (value <= 60) return { label: "Modéré", className: "air-level-moderate" };
  if (value <= 80) return { label: "Mauvais", className: "air-level-poor" };
  if (value <= 100) return { label: "Très mauvais", className: "air-level-very-poor" };
  return { label: "Extrêmement mauvais", className: "air-level-extreme" };
}

function isIleDeFrance(location) {
  return location.lat >= 48.1 && location.lat <= 49.25 && location.lon >= 1.4 && location.lon <= 3.6;
}

function environmentLinks(location, kind) {
  if (isIleDeFrance(location)) {
    const url = kind === "pollen"
      ? "https://www.airparif.fr/surveiller-la-pollution/carte-des-pollens"
      : "https://www.airparif.fr/surveiller-la-pollution/pollution-en-direct-en-ile-de-france";
    const label = kind === "pollen" ? "Voir l’indice pollen Airparif" : "Voir la carte Airparif heure par heure";
    return `<a href="${url}" target="_blank" rel="noreferrer">${label}</a>`;
  }
  return `<a href="https://map.atmo-france.org/" target="_blank" rel="noreferrer">Voir la carte Atmo France</a>`;
}

function renderPollenPanel(data, location, hourIndex) {
  const hourly = data.hourly || {};
  const pollen = POLLEN_TYPES.map(type => {
    const current = hourly[type.key]?.[hourIndex];
    const series = environmentSeries(hourly, type.key, hourIndex);
    const next24 = series.filter(isNumber);
    return { ...type, current, series, max24: next24.length ? Math.max(...next24) : null };
  });
  const dominant = pollen.filter(item => isNumber(item.max24)).sort((a, b) => b.max24 - a.max24)[0];
  const hasSignal = dominant && dominant.max24 > 0;
  el("pollen-summary").textContent = hasSignal
    ? `${dominant.label} dominant · pic ${environmentNumber(dominant.max24)} grains/m³`
    : "Aucun signal marqué sur 24 h";
  el("pollen-content").innerHTML = `
    <div class="environment-hero">
      <span>Signal dominant sur 24 h</span>
      <strong>${hasSignal ? `${dominant.label} · ${environmentNumber(dominant.max24)}` : "Très faible ou absent"}</strong>
    </div>
    ${hasSignal ? environmentTrendChart((hourly.time || []).slice(hourIndex, hourIndex + 25), dominant.series, { label: `Évolution · ${dominant.label}`, unit: "grains/m³", tone: "pollen" }) : ""}
    ${environmentRows(pollen.map(item => ({ label: item.label, current: item.current, peak: item.max24, unit: "grains/m³" })))}
    <p class="environment-source">Prévision de concentrations CAMS Europe, maille d’environ 11 km, redistribuée par Open-Meteo. Ce ne sont pas des comptages réalisés à votre adresse et la sensibilité dépend de chaque personne.</p>
    <div class="environment-links">${environmentLinks(location, "pollen")}<a href="https://www.atmo-france.org/article/indice-pollen" target="_blank" rel="noreferrer">Comprendre l’indice pollen</a></div>`;
  state.environment = { ...(state.environment || {}), pollenDominant: hasSignal ? dominant : null };
}

function renderAirQualityPanel(data, location, hourIndex) {
  const hourly = data.hourly || {};
  const currentAqi = hourly.european_aqi?.[hourIndex];
  const nextAqi = environmentWindow(hourly, "european_aqi", hourIndex);
  const maxAqi = nextAqi.length ? Math.max(...nextAqi) : null;
  const meta = europeanAqiMeta(currentAqi);
  const maxMeta = europeanAqiMeta(maxAqi);
  el("air-quality-summary").innerHTML = `<span class="${meta.className}">${meta.label}</span>${isNumber(currentAqi) ? ` · AQI ${Math.round(currentAqi)}` : ""}`;
  el("air-quality-content").innerHTML = `
    <div class="environment-hero">
      <span>Indice européen actuel</span>
      <strong class="${meta.className}">${isNumber(currentAqi) ? `${Math.round(currentAqi)} · ${meta.label}` : "Indisponible"}</strong>
    </div>
    ${environmentTrendChart((hourly.time || []).slice(hourIndex, hourIndex + 25), environmentSeries(hourly, "european_aqi", hourIndex), { label: "Évolution de l’indice européen", unit: "AQI", tone: "air" })}
    ${environmentRows(AIR_POLLUTANTS.map(pollutant => {
      const current = hourly[pollutant.key]?.[hourIndex];
      const next24 = environmentWindow(hourly, pollutant.key, hourIndex, 25);
      return { label: pollutant.label, current, peak: next24.length ? Math.max(...next24) : null, unit: pollutant.unit };
    }))}
    <p class="environment-source">Prévision CAMS Europe, maille d’environ 11 km, via Open-Meteo. Maximum AQI prévu sur 24 h : <strong class="${maxMeta.className}">${environmentNumber(maxAqi)} · ${maxMeta.label}</strong>. À Paris et en Île-de-France, la carte Airparif ci-dessous apporte une lecture beaucoup plus fine, intégrant notamment trafic et stations.</p>
    <div class="environment-links">${environmentLinks(location, "air")}<a href="https://open-meteo.com/en/docs/air-quality-api" target="_blank" rel="noreferrer">Méthode et données CAMS</a></div>`;
  state.environment = { ...(state.environment || {}), currentAqi, aqiLabel: meta.label, maxAqi };
}

async function loadEnvironmentData(location) {
  const requestId = ++state.environmentRequest;
  state.environment = null;
  el("pollen-summary").textContent = "Chargement…";
  el("air-quality-summary").textContent = "Chargement…";
  el("pollen-content").innerHTML = `<p class="loading-line">Chargement des pollens…</p>`;
  el("air-quality-content").innerHTML = `<p class="loading-line">Chargement de la qualité de l’air…</p>`;
  const variables = ["european_aqi", ...AIR_POLLUTANTS.map(item => item.key), ...POLLEN_TYPES.map(item => item.key)].join(",");
  const params = new URLSearchParams({
    latitude: location.lat,
    longitude: location.lon,
    hourly: variables,
    domains: "cams_europe",
    timezone: "Europe/Paris",
    forecast_days: "3"
  });
  try {
    const url = `https://air-quality-api.open-meteo.com/v1/air-quality?${params.toString()}`;
    const data = await fetchJSONCached(url, 25000, HOUR, 6 * HOUR);
    if (requestId !== state.environmentRequest || state.location !== location) return;
    const hourIndex = nearestEnvironmentHour(data.hourly?.time || []);
    renderPollenPanel(data, location, hourIndex);
    renderAirQualityPanel(data, location, hourIndex);
  } catch (error) {
    if (requestId !== state.environmentRequest || state.location !== location) return;
    el("pollen-summary").textContent = "Données temporairement indisponibles";
    el("air-quality-summary").textContent = "Données temporairement indisponibles";
    const message = `<p class="loading-line error-line">Impossible de charger ces données pour le moment : ${error.message}</p>`;
    el("pollen-content").innerHTML = message;
    el("air-quality-content").innerHTML = message;
  }
}

function metropolitanFeatures(geojson) {
  return (geojson.features || []).filter(feature => {
    const [longitude, latitude] = d3.geoCentroid(feature);
    return longitude >= -6 && longitude <= 10 && latitude >= 41 && latitude <= 52;
  });
}

function franceSamplePoints(features, { latitudeStep = .55, longitudeStep = .7 } = {}) {
  const points = [];
  for (let latitude = 42.1; latitude <= 51.2; latitude += latitudeStep) {
    for (let longitude = -4.8; longitude <= 8.5; longitude += longitudeStep) {
      const point = [round(longitude, 3), round(latitude, 3)];
      if (features.some(feature => d3.geoContains(feature, point))) points.push(point);
    }
  }
  return points;
}

async function fetchFranceGrid(endpoint, points, parameters, timeout, chunkSize = 70) {
  const chunks = [];
  for (let index = 0; index < points.length; index += chunkSize) chunks.push(points.slice(index, index + chunkSize));
  const batches = await Promise.all(chunks.map(async chunk => {
    const params = new URLSearchParams({
      ...parameters,
      latitude: chunk.map(point => point[1]).join(","),
      longitude: chunk.map(point => point[0]).join(",")
    });
    const responses = await fetchJSONCached(`${endpoint}?${params.toString()}`, timeout, 6 * HOUR, 24 * HOUR);
    const list = Array.isArray(responses) ? responses : [responses];
    return list.map((response, index) => {
      const pointIndex = Number.isInteger(response.location_id) ? response.location_id : index;
      return { response, point: chunk[pointIndex] || chunk[index] };
    }).filter(item => item.point);
  }));
  return batches.flat();
}

function appendSmoothWeatherField(svg, projection, valid, valueAccessor, color, clipId, width, height) {
  const rasterWidth = 400;
  const rasterHeight = 390;
  const canvas = document.createElement("canvas");
  canvas.width = rasterWidth;
  canvas.height = rasterHeight;
  const context = canvas.getContext("2d");
  const pixels = context.createImageData(rasterWidth, rasterHeight);
  const projected = valid.map(sample => {
    const point = projection(sample.point);
    return point ? { x: point[0], y: point[1], value: valueAccessor(sample) } : null;
  }).filter(Boolean);
  const nearestDistances = projected.map((sample, index) => {
    let nearest = Infinity;
    projected.forEach((other, otherIndex) => {
      if (index === otherIndex) return;
      const distance = Math.hypot(sample.x - other.x, sample.y - other.y);
      if (distance < nearest) nearest = distance;
    });
    return nearest;
  }).filter(isNumber).sort((a, b) => a - b);
  const typicalSpacing = nearestDistances[Math.floor(nearestDistances.length / 2)] || 24;
  const smoothingRadius = clamp(typicalSpacing * 4.2, 54, 88);
  const smoothingRadiusSquared = smoothingRadius * smoothingRadius;
  const domain = color.domain();
  const domainLow = Math.min(...domain);
  const domainHigh = Math.max(...domain);
  const palette = Array.from({ length: 512 }, (_, index) => {
    const value = domainLow + index / 511 * (domainHigh - domainLow || 1);
    const rgb = d3.rgb(color(value));
    return [rgb.r, rgb.g, rgb.b];
  });

  for (let py = 0; py < rasterHeight; py += 1) {
    const y = (py + .5) / rasterHeight * height;
    if (y < 22 || y > 388) continue;
    for (let px = 0; px < rasterWidth; px += 1) {
      const x = (px + .5) / rasterWidth * width;
      if (x < 22 || x > 418) continue;
      let weightedValue = 0;
      let weightTotal = 0;
      for (const sample of projected) {
        const dx = x - sample.x;
        const dy = y - sample.y;
        const distanceSquared = dx * dx + dy * dy;
        if (distanceSquared >= smoothingRadiusSquared) continue;
        const proximity = 1 - distanceSquared / smoothingRadiusSquared;
        const weight = proximity * proximity;
        weightedValue += sample.value * weight;
        weightTotal += weight;
      }
      if (!weightTotal) continue;
      const value = weightedValue / weightTotal;
      const ratio = Math.max(0, Math.min(1, (value - domainLow) / (domainHigh - domainLow || 1)));
      const rgb = palette[Math.round(ratio * 511)];
      const offset = (py * rasterWidth + px) * 4;
      pixels.data[offset] = rgb[0];
      pixels.data[offset + 1] = rgb[1];
      pixels.data[offset + 2] = rgb[2];
      pixels.data[offset + 3] = 255;
    }
  }
  context.putImageData(pixels, 0, 0);
  svg.append("image")
    .attr("href", canvas.toDataURL("image/png"))
    .attr("width", width)
    .attr("height", height)
    .attr("preserveAspectRatio", "none")
    .attr("clip-path", `url(#${clipId})`)
    .attr("class", "smooth-weather-field");
}

async function getFranceGeoJSON() {
  if (window.FRANCE_DEPARTMENTS?.features?.length) return window.FRANCE_DEPARTMENTS;
  return fetchJSON("france-departements.geojson", 15000);
}

function renderFranceMapCard(target, france, samples, variable, title, date) {
  const valid = samples.filter(sample => isNumber(sample[variable]));
  if (valid.length < 10) throw new Error("La grille nationale ne contient pas assez de valeurs.");
  const width = 440;
  const height = 430;
  const projection = d3.geoConicConformal().parallels([44, 49]).rotate([-3, 0]).fitExtent([[30, 30], [410, 380]], france);
  const path = d3.geoPath(projection);
  const values = valid.map(sample => sample[variable]);
  const low = Math.floor(Math.min(...values));
  const high = Math.ceil(Math.max(...values));
  const color = d3.scaleSequential(d3.interpolateTurbo).domain([low, high === low ? low + 1 : high]);
  const key = `${variable}-${Math.random().toString(36).slice(2, 8)}`;

  const figure = document.createElement("figure");
  figure.className = "weather-map-card";
  figure.innerHTML = `<figcaption><strong>${title}</strong><span>${dayLabel(date)} · grille densifiée et interpolée · ${low} à ${high} °C</span></figcaption>`;
  const svg = d3.select(figure).append("svg")
    .attr("class", "france-weather-map")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", `${title} en France le ${dayLabel(date)}, valeurs de ${low} à ${high} degrés`);
  svg.append("title").text(`${title} en France`);
  svg.append("desc").text("Carte indicative calculée par interpolation continue d’une grille nationale densifiée du modèle Météo-France.");

  const defs = svg.append("defs");
  const clipId = `clip-${key}`;
  defs.append("clipPath").attr("id", clipId).append("path").attr("d", path(france));
  const gradient = defs.append("linearGradient").attr("id", `legend-${key}`).attr("x1", "0%").attr("x2", "100%");
  d3.range(0, 1.01, .1).forEach(stop => gradient.append("stop").attr("offset", `${stop * 100}%`).attr("stop-color", color(low + stop * (high - low))));

  svg.append("path").datum(france).attr("class", "country-base").attr("d", path);
  appendSmoothWeatherField(svg, projection, valid, sample => sample[variable], color, clipId, width, height);
  svg.append("g").selectAll("path").data(france.features).join("path").attr("class", "department").attr("d", path);

  const cities = [
    { name: "Paris", point: [2.3522, 48.8566], anchor: "start", dx: 6 },
    { name: "Nancy", point: [6.18496, 48.68439], anchor: "start", dx: 6 }
  ];
  const cityGroup = svg.append("g");
  cities.forEach(city => {
    const [x, y] = projection(city.point);
    cityGroup.append("circle").attr("class", "city-point").attr("cx", x).attr("cy", y).attr("r", 3);
    cityGroup.append("text").attr("class", "city-label").attr("x", x + city.dx).attr("y", y + 3).attr("text-anchor", city.anchor).text(city.name);
  });

  const legendX = 90;
  const legendY = 397;
  const legendWidth = 260;
  svg.append("rect").attr("x", legendX).attr("y", legendY).attr("width", legendWidth).attr("height", 10).attr("rx", 5).attr("fill", `url(#legend-${key})`);
  svg.append("text").attr("class", "legend-label").attr("x", legendX).attr("y", legendY + 26).text(`${low} °C`);
  svg.append("text").attr("class", "legend-label").attr("x", legendX + legendWidth).attr("y", legendY + 26).attr("text-anchor", "end").text(`${high} °C`);
  target.appendChild(figure);
}

async function loadFranceMaps() {
  const section = el("france-map-section");
  section.hidden = false;
  if (state.franceMapPromise) return state.franceMapPromise;
  const button = el("france-map-button");
  button.disabled = true;
  el("france-map-loading").hidden = false;
  el("france-map-loading").className = "loading-line";
  el("france-map-loading").textContent = "Calcul des cartes nationales…";
  state.franceMapPromise = (async () => {
    if (!window.d3) throw new Error("Le moteur cartographique n’a pas pu démarrer.");
    const geojson = await getFranceGeoJSON();
    const features = metropolitanFeatures(geojson);
    const france = { type: "FeatureCollection", features };
    const points = franceSamplePoints(features, { latitudeStep: .55, longitudeStep: .7 });
    const grid = await fetchFranceGrid("https://api.open-meteo.com/v1/forecast", points, {
      daily: "temperature_2m_max,temperature_2m_min",
      models: "meteofrance_seamless",
      timezone: "Europe/Paris",
      forecast_days: "2"
    }, 30000, 250);
    const samples = grid.map(({ response, point }) => {
      return {
        point,
        max: response.daily?.temperature_2m_max?.[1],
        min: response.daily?.temperature_2m_min?.[1],
        date: response.daily?.time?.[1]
      };
    }).filter(sample => sample.point);
    const date = samples.find(sample => sample.date)?.date;
    if (!date) throw new Error("La prévision nationale de demain n’est pas encore disponible.");
    const target = el("france-maps");
    target.innerHTML = "";
    renderFranceMapCard(target, france, samples, "max", "Température maximale", date);
    renderFranceMapCard(target, france, samples, "min", "Température minimale", date);
    el("france-map-loading").hidden = true;
    button.hidden = true;
  })().catch(error => {
    state.franceMapPromise = null;
    button.disabled = false;
    el("france-map-loading").className = "loading-line error-line";
    el("france-map-loading").textContent = `Cartes indisponibles : ${error.message}`;
  });
  return state.franceMapPromise;
}

function renderEnsembleFranceMapCard(target, france, samples, config, date) {
  const valid = samples.filter(sample => isNumber(sample[config.key]));
  if (valid.length < 10) throw new Error("La grille ensembleiste ne contient pas assez de valeurs.");
  const width = 440;
  const height = 430;
  const projection = d3.geoConicConformal().parallels([44, 49]).rotate([-3, 0]).fitExtent([[30, 30], [410, 380]], france);
  const path = d3.geoPath(projection);
  const values = valid.map(sample => sample[config.key]);
  const low = config.domain ? config.domain[0] : Math.floor(Math.min(...values));
  const high = config.domain ? config.domain[1] : Math.ceil(Math.max(...values));
  const color = d3.scaleSequential(config.interpolator).domain([low, high === low ? low + 1 : high]);
  const key = `ens-${config.key}-${Math.random().toString(36).slice(2, 8)}`;

  const figure = document.createElement("figure");
  figure.className = "weather-map-card ensemble-map-card";
  figure.innerHTML = `<figcaption><strong>${config.title}</strong><span>${dayLabel(date)} · ${config.subtitle}</span></figcaption>`;
  const svg = d3.select(figure).append("svg")
    .attr("class", "france-weather-map")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .attr("role", "img")
    .attr("aria-label", `${config.title} en France le ${dayLabel(date)}`);
  svg.append("title").text(`${config.title} en France`);
  svg.append("desc").text(config.description);

  const defs = svg.append("defs");
  const clipId = `clip-${key}`;
  defs.append("clipPath").attr("id", clipId).append("path").attr("d", path(france));
  const gradient = defs.append("linearGradient").attr("id", `legend-${key}`).attr("x1", "0%").attr("x2", "100%");
  d3.range(0, 1.01, .1).forEach(stop => gradient.append("stop").attr("offset", `${stop * 100}%`).attr("stop-color", color(low + stop * (high - low))));

  svg.append("path").datum(france).attr("class", "country-base").attr("d", path);
  appendSmoothWeatherField(svg, projection, valid, sample => sample[config.key], color, clipId, width, height);
  svg.append("g").selectAll("path").data(france.features).join("path").attr("class", "department").attr("d", path);

  [{ name: "Paris", point: [2.3522, 48.8566] }, { name: "Nancy", point: [6.18496, 48.68439] }].forEach(city => {
    const [x, y] = projection(city.point);
    svg.append("circle").attr("class", "city-point").attr("cx", x).attr("cy", y).attr("r", 3);
    svg.append("text").attr("class", "city-label").attr("x", x + 6).attr("y", y + 3).text(city.name);
  });

  const legendX = 90;
  const legendY = 397;
  const legendWidth = 260;
  svg.append("rect").attr("x", legendX).attr("y", legendY).attr("width", legendWidth).attr("height", 10).attr("rx", 5).attr("fill", `url(#legend-${key})`);
  svg.append("text").attr("class", "legend-label").attr("x", legendX).attr("y", legendY + 26).text(config.format(low));
  svg.append("text").attr("class", "legend-label").attr("x", legendX + legendWidth).attr("y", legendY + 26).attr("text-anchor", "end").text(config.format(high));
  target.appendChild(figure);
}

async function loadEnsembleFranceMaps() {
  if (state.ensembleMapPromise) return state.ensembleMapPromise;
  const button = el("ensemble-map-button");
  button.disabled = true;
  el("ensemble-map-loading").hidden = false;
  el("ensemble-map-loading").className = "loading-line";
  el("ensemble-map-loading").textContent = "Calcul des cartes probabilistes…";
  state.ensembleMapPromise = (async () => {
    if (!window.d3) throw new Error("Le moteur cartographique n’a pas pu démarrer.");
    const geojson = await getFranceGeoJSON();
    const features = metropolitanFeatures(geojson);
    const france = { type: "FeatureCollection", features };
    const points = franceSamplePoints(features, { latitudeStep: .75, longitudeStep: .95 });
    const grid = await fetchFranceGrid("https://ensemble-api.open-meteo.com/v1/ensemble", points, {
      daily: "temperature_2m_max,temperature_2m_min,precipitation_sum",
      models: "ecmwf_ifs025",
      timezone: "Europe/Paris",
      forecast_days: "2"
    }, 45000, 250);
    const samples = grid.map(({ response, point }) => {
      const dayValues = variable => extractMemberMatrix(response.daily, variable).map(series => series[1]).filter(isNumber);
      const maxValues = dayValues("temperature_2m_max");
      const minValues = dayValues("temperature_2m_min");
      const rainValues = dayValues("precipitation_sum");
      const probability = (values, predicate) => values.length ? Math.round(values.filter(predicate).length / values.length * 100) : null;
      return {
        point,
        date: response.daily?.time?.[1],
        maxP50: quantile(maxValues, .5),
        hot30: probability(maxValues, value => value >= 30),
        frost: probability(minValues, value => value <= 0),
        rain10: probability(rainValues, value => value >= 10)
      };
    }).filter(sample => sample.point);
    const date = samples.find(sample => sample.date)?.date;
    if (!date) throw new Error("Le run ECMWF ENS de demain n’est pas encore disponible.");
    const season = seasonMeta();
    const riskConfig = season.key === "summer"
      ? { key: "hot30", title: "Risque de dépasser 30 °C", subtitle: "part des scénarios ≥ 30 °C", interpolator: d3.interpolateYlOrRd, domain: [0, 100], format: value => `${value}%`, description: "Probabilité issue de la proportion de scénarios ECMWF ENS dont la température maximale atteint trente degrés." }
      : season.key === "winter"
        ? { key: "frost", title: "Risque de gel", subtitle: "part des scénarios ≤ 0 °C", interpolator: d3.interpolatePuBu, domain: [0, 100], format: value => `${value}%`, description: "Probabilité issue de la proportion de scénarios ECMWF ENS dont la température minimale atteint zéro degré ou moins." }
        : { key: "rain10", title: "Risque de pluie marquée", subtitle: "part des scénarios ≥ 10 mm", interpolator: d3.interpolateBlues, domain: [0, 100], format: value => `${value}%`, description: "Probabilité issue de la proportion de scénarios ECMWF ENS dont le cumul quotidien atteint dix millimètres." };
    const target = el("ensemble-maps");
    target.innerHTML = "";
    renderEnsembleFranceMapCard(target, france, samples, { key: "maxP50", title: "Maximale médiane P50", subtitle: "scénario central de l’ensemble", interpolator: d3.interpolateTurbo, format: value => `${value} °C`, description: "Température maximale médiane calculée à partir des scénarios ECMWF ENS sur une grille nationale indicative." }, date);
    renderEnsembleFranceMapCard(target, france, samples, riskConfig, date);
    el("ensemble-map-loading").hidden = true;
    button.hidden = true;
  })().catch(error => {
    state.ensembleMapPromise = null;
    button.disabled = false;
    el("ensemble-map-loading").className = "loading-line error-line";
    el("ensemble-map-loading").textContent = `Cartes ensembleistes indisponibles : ${error.message}`;
  });
  return state.ensembleMapPromise;
}

function renderConsensusTable() {
  const tbody = el("consensus-table").querySelector("tbody");
  tbody.innerHTML = state.consensus.map(day => {
    const confidence = confidenceMeta(day.confidence);
    const wideMin = isNumber(day.minLow) && isNumber(day.minHigh) && day.minHigh - day.minLow >= 2.5;
    const wideMax = isNumber(day.maxLow) && isNumber(day.maxHigh) && day.maxHigh - day.maxLow >= 2.5;
    const rainRange = isNumber(day.rainHigh) && day.rainHigh - day.rainLow >= 3;
    return `
      <tr>
        <th scope="row">${dayLabel(day.date)}</th>
        <td>${temperatureBadge(day.min)}${wideMin ? `<span class="range">(${formatTemperature(day.minLow)}–${formatTemperature(day.minHigh)})</span>` : ""}</td>
        <td>${temperatureBadge(day.max)}${wideMax ? `<span class="range">(${formatTemperature(day.maxLow)}–${formatTemperature(day.maxHigh)})</span>` : ""}</td>
        <td>${rainBadge(day.rain, true)}${rainRange ? `<span class="range">(${formatRain(day.rainLow)}–${formatRain(day.rainHigh)})</span>` : ""}</td>
        <td><span class="confidence-pill ${confidence.className}">${confidence.label} · ${day.confidence}</span></td>
      </tr>
    `;
  }).join("");
}

function renderTemperatureChart() {
  const days = state.consensus;
  const allValues = state.deterministic.flatMap(model => [...model.max, ...model.min]).filter(isNumber);
  if (!allValues.length) {
    el("temperature-chart").innerHTML = "<p class='error-line'>Graphique indisponible.</p>";
    return;
  }

  const width = 900;
  const height = 270;
  const margin = { top: 58, right: 20, bottom: 38, left: 42 };
  const minY = Math.floor(Math.min(...allValues) / 5) * 5 - 2;
  const maxY = Math.ceil(Math.max(...allValues) / 5) * 5 + 2;
  const x = index => margin.left + index * ((width - margin.left - margin.right) / Math.max(1, days.length - 1));
  const y = value => margin.top + (maxY - value) / (maxY - minY) * (height - margin.top - margin.bottom);
  const yTicks = [];
  for (let value = Math.ceil(minY / 5) * 5; value <= maxY; value += 5) yTicks.push(value);

  const line = values => values.map((value, index) => isNumber(value) ? `${x(index)},${y(value)}` : null).filter(Boolean).join(" ");
  const grid = yTicks.map(value => `
    <line class="grid" x1="${margin.left}" x2="${width - margin.right}" y1="${y(value)}" y2="${y(value)}"></line>
    <text class="axis-label" x="${margin.left - 8}" y="${y(value) + 4}" text-anchor="end">${value}°</text>
  `).join("");
  const labels = days.map((day, index) => `<text class="axis-label" x="${x(index)}" y="${height - 12}" text-anchor="middle">${dayLabel(day.date, true)}</text>`).join("");
  const modelLines = state.deterministic.map(model => `<polyline class="model-line" points="${line(model.max)}" stroke="${model.color}"><title>${model.label} — maximales</title></polyline>`).join("");
  const consensusValues = days.map(day => day.max);
  const points = consensusValues.map((value, index) => isNumber(value) ? `<circle class="consensus-point" cx="${x(index)}" cy="${y(value)}" r="4"><title>${dayLabel(days[index].date)} : ${round(value, 1)} °C</title></circle>` : "").join("");
  const legend = state.deterministic.map((model, index) => `<g transform="translate(${margin.left + (index % 4) * 205},${13 + Math.floor(index / 4) * 20})"><line x1="0" x2="18" y1="5" y2="5" stroke="${model.color}" stroke-width="2"></line><text class="axis-label" x="24" y="9">${model.short}</text></g>`).join("");

  el("temperature-chart").innerHTML = `
    <svg class="temperature-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Comparaison des températures maximales prévues par les modèles et de leur consensus">
      <title>Températures maximales par modèle</title>
      ${grid}${labels}${legend}${modelLines}
      <polyline class="consensus-line" points="${line(consensusValues)}"><title>Consensus des modèles</title></polyline>
      ${points}
    </svg>
  `;
}

function modelAccessibleLabel(model) {
  return `${model.label}, ${model.originLabel || "origine non précisée"}, ${model.isAi ? "modèle fondé sur l’intelligence artificielle" : "modèle numérique physique"}`;
}

function modelTabContent(model) {
  return `<span class="model-tab-symbols" aria-hidden="true"><span>${model.originIcon || "🌍"}</span>${model.isAi ? '<span class="ai-marker">🤖</span>' : ""}</span><span>${model.label}</span>`;
}

function modelOriginMeta(model) {
  return `<span class="model-origin-meta"><span aria-hidden="true">${model.originIcon || "🌍"}${model.isAi ? " 🤖" : ""}</span><span>${model.originLabel || "Origine non précisée"}${model.isAi ? " · modèle IA" : " · modèle physique"}</span></span>`;
}

function renderModelTabs() {
  const tabs = el("model-tabs");
  tabs.innerHTML = state.deterministic.map((model, index) => `
    <button type="button" role="tab" aria-label="${modelAccessibleLabel(model)}" aria-selected="${index === state.selectedModel}" data-index="${index}">${modelTabContent(model)}</button>
  `).join("");
  tabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    state.selectedModel = Number(button.dataset.index);
    renderModelTabs();
    renderModelDetail();
  }));
}

function renderModelDetail() {
  const model = state.deterministic[state.selectedModel];
  if (!model) return;
  const rows = model.dates.map((date, index) => {
    if (![model.min[index], model.max[index], model.rain[index]].some(isNumber)) return "";
    return `<tr><th scope="row">${dayLabel(date)}</th><td>${temperatureBadge(model.min[index])}</td><td>${temperatureBadge(model.max[index])}</td><td>${rainBadge(model.rain[index], true)}</td><td>${isNumber(model.gust[index]) ? `${Math.round(model.gust[index])} km/h` : "—"}</td></tr>`;
  }).join("");
  const table = rows
    ? `<div class="table-wrap"><table><thead><tr><th>Jour</th><th>T. min</th><th>T. max</th><th>Pluie</th><th>Rafales</th></tr></thead><tbody>${rows}</tbody></table></div>`
    : `<p class="error-line">Le dernier run ne contient pas encore de valeurs exploitables. Le modèle reste visible pour signaler sa disponibilité dès sa prochaine diffusion.</p>`;
  el("model-detail").innerHTML = `
    <div class="model-meta">${modelOriginMeta(model)}<span>${model.producer}</span><span>${model.horizon}</span><span>${isNumber(model.elevation) ? `Altitude corrigée : ${round(model.elevation)} m` : "Maille source : environ 25 km"}</span></div>
    <p class="model-note">${model.note}</p>
    ${table}
  `;
}

function renderGoogleStatus() {
  const status = (elementId, modelId) => {
    const model = state.deterministic.find(item => item.id === modelId);
    const availableDays = model ? model.max.filter(isNumber).length : 0;
    el(elementId).innerHTML = availableDays
      ? `<strong>Cycle ${model.sourceCycle || "récent"} disponible :</strong> ${availableDays} journées de température sont intégrées à la comparaison.`
      : `<strong>Cycle momentanément absent :</strong> ce modèle n’est pas intégré au consensus tant que sa mise à jour NOAA/CIRA n’est pas disponible.`;
  };
  status("graphcast-status", "aiwp_graphcast_gfs");
  status("pangu-status", "aiwp_pangu_gfs");
  const weatherNext = window.WEATHERNEXT_GRID;
  const weatherNextStatus = el("weathernext-status");
  if (weatherNextStatus) {
    const dayCount = weatherNext?.dates?.length || 0;
    const memberCount = weatherNext?.memberCount || 0;
    weatherNextStatus.innerHTML = dayCount && memberCount
      ? `<strong>Cycle ${weatherNext.cycle} intégré :</strong> ${memberCount} scénarios et ${dayCount} journées pour ${weatherNext.points?.length || 0} lieux personnels.`
      : window.WEATHERNEXT_ACCESS_GRANTED
        ? `<strong>Autorisation Google validée :</strong> l’accès WeatherNext 2 fonctionne. La passerelle personnelle protégée reste à raccorder pour afficher les scénarios sans les exposer sur ce site public.`
        : `<strong>Connecteur prêt, accès privé non activé :</strong> aucune sortie temps réel n’est exposée sur ce site public. L’autorisation Google puis une passerelle personnelle protégée sont nécessaires.`;
  }
}

function extractMemberMatrix(daily, variable) {
  const keys = Object.keys(daily || {}).filter(key => key === variable || key.startsWith(`${variable}_member`));
  return keys.map(key => daily[key]).filter(Array.isArray);
}

function parseEnsembleResponse(response, meta) {
  const daily = response.daily || {};
  return {
    ...meta,
    dates: daily.time || [],
    matrices: {
      max: extractMemberMatrix(daily, "temperature_2m_max"),
      min: extractMemberMatrix(daily, "temperature_2m_min"),
      rain: extractMemberMatrix(daily, "precipitation_sum")
    }
  };
}

function decodeWeatherNextField(data, field) {
  data._decoded ||= {};
  if (data._decoded[field]) return data._decoded[field];
  const encoded = data.fields?.[field];
  if (!encoded) return null;
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  data._decoded[field] = new Int16Array(bytes.buffer);
  return data._decoded[field];
}

function ensembleFromWeatherNext(meta, location) {
  const data = window.WEATHERNEXT_GRID;
  if (!data?.points?.length || !data?.dates?.length || !data?.memberCount) throw new Error("WeatherNext 2 n’est pas encore connecté");
  const distance = point => Math.hypot(location.lat - point.lat, (location.lon - point.lon) * Math.cos(location.lat * Math.PI / 180));
  const pointStride = data.dates.length * data.memberCount;
  const sourceValues = decodeWeatherNextField(data, "max");
  const hasData = pointIndex => sourceValues?.subarray(pointIndex * pointStride, (pointIndex + 1) * pointStride).some(value => value !== (data.missing ?? -32768));
  const nearest = data.points
    .map((point, index) => ({ point, index, distance: distance(point) }))
    .filter(candidate => hasData(candidate.index))
    .sort((a, b) => a.distance - b.distance)[0];
  if (!nearest || nearest.distance > .35) {
    throw new Error("WeatherNext 2 est actuellement préparé pour Paris, Sarrebourg, Saint-Nicolas-de-Port et Nancy");
  }
  const pointIndex = nearest.index;
  const dayCount = data.dates.length;
  const memberCount = data.memberCount;
  const scale = data.scale || 10;
  const missing = data.missing ?? -32768;
  const matrix = field => {
    const values = decodeWeatherNextField(data, field);
    if (!values) return [];
    return Array.from({ length: memberCount }, (_, memberIndex) => data.dates.map((_, dayIndex) => {
      const index = ((pointIndex * dayCount + dayIndex) * memberCount) + memberIndex;
      const value = values[index];
      return value === missing ? null : value / scale;
    }));
  };
  return {
    ...meta,
    dates: data.dates,
    matrices: { max: matrix("max"), min: matrix("min"), rain: matrix("rain") },
    sourceCycle: data.cycle,
    sourceNote: data.source,
    sourceLocation: nearest.point.name
  };
}

function dailyEnsembleSummary(model) {
  return model.dates.map((date, dayIndex) => {
    const valuesFor = variable => model.matrices[variable].map(series => series[dayIndex]).filter(isNumber);
    const stats = variable => {
      const values = valuesFor(variable);
      return { p10: quantile(values, .1), p50: quantile(values, .5), p90: quantile(values, .9), count: values.length, values };
    };
    const maxValues = valuesFor("max");
    const minValues = valuesFor("min");
    const rainValues = valuesFor("rain");
    const probability = (values, predicate) => values.length ? Math.round(values.filter(predicate).length / values.length * 100) : null;
    return {
      date,
      max: stats("max"),
      min: stats("min"),
      rain: stats("rain"),
      events: {
        hot30: probability(maxValues, value => value >= 30),
        hot35: probability(maxValues, value => value >= 35),
        frost: probability(minValues, value => value <= 0),
        rain1: probability(rainValues, value => value >= 1),
        rain10: probability(rainValues, value => value >= 10)
      }
    };
  }).filter(day => day.max.count || day.min.count || day.rain.count);
}

async function fetchEnsembles(location) {
  const variables = "temperature_2m_max,temperature_2m_min,precipitation_sum";
  const tasks = ENSEMBLE_MODELS.map(async meta => {
    if (meta.sourceType === "weathernext") return ensembleFromWeatherNext(meta, location);
    const url = forecastUrl("https://ensemble-api.open-meteo.com/v1/ensemble", location, {
      daily: variables,
      models: meta.id,
      forecast_days: "16"
    });
    return parseEnsembleResponse(await fetchJSONCached(url, 30000, 3 * HOUR, 24 * HOUR), meta);
  });
  const results = await Promise.allSettled(tasks);
  const models = results
    .filter(result => result.status === "fulfilled")
    .map(result => result.value)
    .filter(model => model.dates.length && Object.values(model.matrices).some(matrix => matrix.length));
  if (!models.length) {
    const errors = results.filter(result => result.status === "rejected").map(result => result.reason);
    throw new Error(ensembleServiceMessage(errors, "Ensembles temporairement indisponibles."));
  }
  return models;
}

function triplet(stats, formatter) {
  if (!stats || !stats.count) return "—";
  return `<span class="ensemble-range"><span class="quantile p10-value"><small>P10</small>${formatter(stats.p10)}</span><span class="quantile p50-value"><small>P50</small><strong>${formatter(stats.p50)}</strong></span><span class="quantile p90-value"><small>P90</small>${formatter(stats.p90)}</span></span>`;
}

function ensembleTrajectoryImage(summary, model, width, height, margin, low, high) {
  const rasterWidth = Math.max(1, Math.round(width - margin.left - margin.right));
  const rasterHeight = Math.max(1, Math.round(height - margin.top - margin.bottom));
  const pixelRatio = 2;
  const canvas = document.createElement("canvas");
  canvas.width = rasterWidth * pixelRatio;
  canvas.height = rasterHeight * pixelRatio;
  const context = canvas.getContext("2d");
  context.scale(pixelRatio, pixelRatio);
  const dateIndexes = new Map(model.dates.map((date, index) => [date, index]));
  const x = index => summary.length === 1 ? rasterWidth / 2 : index * rasterWidth / (summary.length - 1);
  const y = value => (high - value) / (high - low) * rasterHeight;

  const trace = series => {
    context.beginPath();
    let drawing = false;
    summary.forEach((day, index) => {
      const sourceIndex = dateIndexes.get(day.date);
      const value = Number.isInteger(sourceIndex) ? series[sourceIndex] : null;
      if (!isNumber(value)) {
        drawing = false;
        return;
      }
      if (drawing) context.lineTo(x(index), y(value));
      else context.moveTo(x(index), y(value));
      drawing = true;
    });
    context.stroke();
  };

  const drawMembers = (key, color) => {
    const members = (model.matrices[key] || []).filter(series => Array.isArray(series));
    if (!members.length) return;
    const baseAlpha = clamp(2.6 / members.length, .045, .12);
    const layer = (blur, lineWidth, alpha) => {
      context.save();
      context.globalCompositeOperation = "source-over";
      context.filter = `blur(${blur}px)`;
      context.lineWidth = lineWidth;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.strokeStyle = `rgba(${color.join(",")},${alpha})`;
      members.forEach(trace);
      context.restore();
    };
    layer(4.8, 5.2, baseAlpha * .52);
    layer(.65, 1.15, baseAlpha * .92);
  };

  drawMembers("max", [201, 88, 60]);
  drawMembers("min", [54, 122, 164]);
  return canvas.toDataURL("image/png");
}

function renderEnsembleTemperatureChart(summary, model) {
  const width = 820;
  const height = 285;
  const margin = { top: 42, right: 22, bottom: 42, left: 52 };
  const values = summary.flatMap(day => [day.min.p10, day.min.p90, day.max.p10, day.max.p90]).filter(isNumber);
  if (!values.length) return "";
  let low = Math.floor(Math.min(...values) / 5) * 5;
  let high = Math.ceil(Math.max(...values) / 5) * 5;
  if (low === high) high = low + 5;
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const x = index => margin.left + (summary.length === 1 ? plotWidth / 2 : index * plotWidth / (summary.length - 1));
  const y = value => margin.top + (high - value) / (high - low) * plotHeight;
  const quantileLine = (key, quantileKey) => summary.map((day, index) => `${index ? "L" : "M"}${round(x(index), 1)},${round(y(day[key][quantileKey]), 1)}`).join(" ");
  const line = key => summary.map((day, index) => `${index ? "L" : "M"}${round(x(index), 1)},${round(y(day[key].p50), 1)}`).join(" ");
  const trajectoryImage = ensembleTrajectoryImage(summary, model, width, height, margin, low, high);
  const ticks = [];
  for (let value = low; value <= high; value += 5) ticks.push(value);
  return `
    <figure class="ensemble-chart-card">
      <figcaption><strong>Températures possibles</strong><span>Chaque scénario trace sa propre trajectoire ; les superpositions foncent les familles les plus denses. Contours P10–P90, ligne P50.</span></figcaption>
      <svg class="ensemble-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Faisceau des trajectoires de températures minimales et maximales sur ${summary.length} jours">
        <title>Trajectoires des scénarios de l’ensemble</title>
        <desc>Chaque membre est représenté par une courbe diffuse. Les courbes orange décrivent les maximales et les bleues les minimales. Une couleur plus soutenue signifie que davantage de scénarios suivent une trajectoire proche. Les contours délimitent P10 à P90 et la ligne indique la médiane P50.</desc>
        ${ticks.map(value => `<line class="ensemble-grid" x1="${margin.left}" y1="${y(value)}" x2="${width - margin.right}" y2="${y(value)}"></line><text class="ensemble-axis" x="${margin.left - 9}" y="${y(value) + 4}" text-anchor="end">${value}°</text>`).join("")}
        <image class="ensemble-trajectory-field" href="${trajectoryImage}" x="${margin.left}" y="${margin.top}" width="${plotWidth}" height="${plotHeight}" preserveAspectRatio="none"></image>
        <path class="ensemble-quantile-boundary max-boundary" d="${quantileLine("max", "p10")}"></path>
        <path class="ensemble-quantile-boundary max-boundary" d="${quantileLine("max", "p90")}"></path>
        <path class="ensemble-quantile-boundary min-boundary" d="${quantileLine("min", "p10")}"></path>
        <path class="ensemble-quantile-boundary min-boundary" d="${quantileLine("min", "p90")}"></path>
        <path class="ensemble-median max-median" d="${line("max")}"></path>
        <path class="ensemble-median min-median" d="${line("min")}"></path>
        ${summary.map((day, index) => `<circle class="ensemble-point max-point" cx="${x(index)}" cy="${y(day.max.p50)}" r="3"><title>${dayLabel(day.date)} : Tmax P50 ${formatTemperature(day.max.p50)}, P10 ${formatTemperature(day.max.p10)}, P90 ${formatTemperature(day.max.p90)}</title></circle><circle class="ensemble-point min-point" cx="${x(index)}" cy="${y(day.min.p50)}" r="3"><title>${dayLabel(day.date)} : Tmin P50 ${formatTemperature(day.min.p50)}, P10 ${formatTemperature(day.min.p10)}, P90 ${formatTemperature(day.min.p90)}</title></circle>`).join("")}
        ${summary.map((day, index) => index % 2 === 0 || index === summary.length - 1 ? `<text class="ensemble-axis" x="${x(index)}" y="${height - 14}" text-anchor="middle">${dayLabel(day.date, true)}</text>` : "").join("")}
        <g class="ensemble-chart-legend" transform="translate(${margin.left},18)"><rect class="legend-density-max" width="28" height="8" rx="4"></rect><text x="35" y="8">T. max</text><rect class="legend-density-min" x="105" width="28" height="8" rx="4"></rect><text x="140" y="8">T. min</text><text x="210" y="8">pâle : branche isolée · foncé : scénarios superposés</text></g>
      </svg>
    </figure>`;
}

function renderEnsembleRainChart(summary) {
  const width = 820;
  const height = 245;
  const margin = { top: 36, right: 22, bottom: 42, left: 52 };
  const plotWidth = width - margin.left - margin.right;
  const plotHeight = height - margin.top - margin.bottom;
  const groupWidth = plotWidth / summary.length;
  const barWidth = Math.min(18, groupWidth * .28);
  const y = value => margin.top + (100 - value) / 100 * plotHeight;
  return `
    <figure class="ensemble-chart-card">
      <figcaption><strong>Probabilité de pluie</strong><span>Part des scénarios dépassant 1 mm ou 10 mm dans la journée.</span></figcaption>
      <svg class="ensemble-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Probabilités quotidiennes de pluie supérieure à 1 et 10 millimètres">
        <title>Probabilités de pluie de l’ensemble</title>
        <desc>Deux barres par jour indiquent la proportion de scénarios dépassant un et dix millimètres.</desc>
        ${[0, 25, 50, 75, 100].map(value => `<line class="ensemble-grid" x1="${margin.left}" y1="${y(value)}" x2="${width - margin.right}" y2="${y(value)}"></line><text class="ensemble-axis" x="${margin.left - 9}" y="${y(value) + 4}" text-anchor="end">${value}%</text>`).join("")}
        ${summary.map((day, index) => {
          const center = margin.left + groupWidth * (index + .5);
          const rain1 = day.events.rain1 ?? 0;
          const rain10 = day.events.rain10 ?? 0;
          return `<rect class="rain-bar rain-bar-1" x="${center - barWidth - 1}" y="${y(rain1)}" width="${barWidth}" height="${margin.top + plotHeight - y(rain1)}" rx="3"><title>${dayLabel(day.date)} : ${rain1}% des scénarios dépassent 1 mm</title></rect><rect class="rain-bar rain-bar-10" x="${center + 1}" y="${y(rain10)}" width="${barWidth}" height="${margin.top + plotHeight - y(rain10)}" rx="3"><title>${dayLabel(day.date)} : ${rain10}% des scénarios dépassent 10 mm</title></rect><text class="ensemble-axis" x="${center}" y="${height - 14}" text-anchor="middle">${dayLabel(day.date, true)}</text>`;
        }).join("")}
        <g class="ensemble-chart-legend" transform="translate(${margin.left},15)"><rect class="legend-rain-1" width="12" height="10" rx="2"></rect><text x="18" y="9">≥ 1 mm</text><rect class="legend-rain-10" x="86" width="12" height="10" rx="2"></rect><text x="104" y="9">≥ 10 mm</text></g>
      </svg>
    </figure>`;
}

function probabilityBadge(label, value) {
  const className = !isNumber(value) ? "probability-unknown" : value >= 60 ? "probability-high" : value >= 25 ? "probability-medium" : "probability-low";
  return `<span class="probability-pill ${className}">${label} : ${isNumber(value) ? `${value}%` : "—"}</span>`;
}

function renderEnsembleTabs() {
  const tabs = el("ensemble-tabs");
  tabs.innerHTML = state.ensembles.map((model, index) => `
    <button type="button" role="tab" aria-label="${modelAccessibleLabel(model)}" aria-selected="${index === state.selectedEnsemble}" data-index="${index}">${modelTabContent(model)}</button>
  `).join("");
  tabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    state.selectedEnsemble = Number(button.dataset.index);
    renderEnsembleTabs();
    renderEnsembleDetail();
  }));
}

function renderEnsembleDetail() {
  const model = state.ensembles[state.selectedEnsemble];
  if (!model) return;
  const summary = dailyEnsembleSummary(model).filter(day => [
    day.min.p10, day.min.p50, day.min.p90,
    day.max.p10, day.max.p50, day.max.p90
  ].every(isNumber));
  const memberCount = Math.max(...Object.values(model.matrices).map(matrix => matrix.length), 0);
  const season = seasonMeta();
  const eventCell = day => {
    if (season.key === "summer") return `${probabilityBadge("≥ 30°", day.events.hot30)} ${probabilityBadge("≥ 35°", day.events.hot35)}`;
    if (season.key === "winter") return probabilityBadge("Gel ≤ 0°", day.events.frost);
    return probabilityBadge("Pluie ≥ 10 mm", day.events.rain10);
  };
  const rows = summary.map(day => `
    <tr>
      <th scope="row">${dayLabel(day.date)}</th>
      <td>${triplet(day.min, formatTemperature)}</td>
      <td>${triplet(day.max, formatTemperature)}</td>
      <td>${triplet(day.rain, formatRain)}</td>
      <td>${eventCell(day)}</td>
    </tr>
  `).join("");
  el("ensemble-detail").innerHTML = `
    <div class="model-meta">${modelOriginMeta(model)}<span>${model.producer}</span><span>${memberCount} scénarios disponibles</span><span>Horizon : ${model.horizon}</span>${model.sourceCycle ? `<span>Cycle : ${model.sourceCycle}</span>` : ""}${model.sourceLocation ? `<span>Point source : ${model.sourceLocation}</span>` : ""}</div>
    <div class="ensemble-charts">${renderEnsembleTemperatureChart(summary, model)}${renderEnsembleRainChart(summary)}</div>
    <div class="table-wrap"><table><thead><tr><th>Jour</th><th>T. min · P10 / P50 / P90</th><th>T. max · P10 / P50 / P90</th><th>Pluie · P10 / P50 / P90</th><th>Risque ciblé</th></tr></thead><tbody>${rows}</tbody></table></div>
  `;
}

function renderEnsembleAlert() {
  const alert = el("ensemble-alert");
  const model = state.ensembles.find(item => item.id === "ecmwf_ifs025") || state.ensembles[0];
  if (!model) {
    alert.hidden = true;
    return;
  }
  const days = dailyEnsembleSummary(model).slice(7);
  const season = seasonMeta();
  let target;
  let message;
  if (season.key === "summer") {
    target = days.slice().sort((a, b) => (b.events.hot35 ?? -1) - (a.events.hot35 ?? -1))[0];
    if (target && target.events.hot35 >= 20) {
      message = `<strong>Branche chaude à surveiller :</strong> ${target.events.hot35}% des scénarios ${model.label} atteignent 35 °C le ${dayLabel(target.date)} (${target.events.hot30}% atteignent 30 °C).`;
    } else {
      target = days.slice().sort((a, b) => (b.events.hot30 ?? -1) - (a.events.hot30 ?? -1))[0];
      message = target ? `<strong>Au-delà d’une semaine :</strong> le risque maximal d’atteindre 30 °C dans ${model.label} est de ${target.events.hot30}% le ${dayLabel(target.date)}.` : "";
    }
  } else if (season.key === "winter") {
    target = days.slice().sort((a, b) => (b.events.frost ?? -1) - (a.events.frost ?? -1))[0];
    message = target ? `<strong>Branche froide :</strong> le risque maximal de gel dans ${model.label} est de ${target.events.frost}% le ${dayLabel(target.date)}.` : "";
  } else {
    target = days.slice().sort((a, b) => (b.events.rain10 ?? -1) - (a.events.rain10 ?? -1))[0];
    message = target ? `<strong>Branche humide :</strong> le risque maximal de dépasser 10 mm dans ${model.label} est de ${target.events.rain10}% le ${dayLabel(target.date)}.` : "";
  }
  alert.innerHTML = message;
  alert.hidden = !message;
}

function weeklySummary(model, startIndex = 15) {
  const weeks = [];
  for (let start = startIndex; start < model.dates.length; start += 7) {
    const end = Math.min(start + 6, model.dates.length - 1);
    if (end - start < 2) continue;
    const aggregateMembers = (variable, mode) => model.matrices[variable].map(series => {
      const values = series.slice(start, end + 1).filter(isNumber);
      if (values.length < 3) return null;
      return mode === "sum" ? values.reduce((sum, value) => sum + value, 0) : mean(values);
    }).filter(isNumber);
    const stats = values => ({ p10: quantile(values, .1), p50: quantile(values, .5), p90: quantile(values, .9), count: values.length });
    weeks.push({
      start: model.dates[start],
      end: model.dates[end],
      max: stats(aggregateMembers("max", "mean")),
      min: stats(aggregateMembers("min", "mean")),
      rain: stats(aggregateMembers("rain", "sum"))
    });
  }
  return weeks;
}

async function fetchLongRange(location) {
  const variables = "temperature_2m_max,temperature_2m_min,precipitation_sum";
  const ec46Task = (async () => {
    const url = forecastUrl("https://seasonal-api.open-meteo.com/v1/seasonal", location, {
      daily: variables,
      forecast_days: "46"
    });
    return parseEnsembleResponse(await fetchJSONCached(url, 35000, 12 * HOUR, 48 * HOUR), LONG_MODELS[0]);
  })();
  const gefsTask = (async () => {
    const url = forecastUrl("https://ensemble-api.open-meteo.com/v1/ensemble", location, {
      daily: variables,
      models: "gfs05",
      forecast_days: "35"
    });
    return parseEnsembleResponse(await fetchJSONCached(url, 35000, 6 * HOUR, 36 * HOUR), LONG_MODELS[1]);
  })();
  const results = await Promise.allSettled([ec46Task, gefsTask]);
  const models = results
    .filter(result => result.status === "fulfilled")
    .map(result => result.value)
    .filter(model => model.dates.length && Object.values(model.matrices).some(matrix => matrix.length));
  if (!models.length) {
    const errors = results.filter(result => result.status === "rejected").map(result => result.reason);
    throw new Error(ensembleServiceMessage(errors, "Tendance lointaine temporairement indisponible."));
  }
  return models;
}

function renderLongTabs() {
  const tabs = el("long-tabs");
  tabs.innerHTML = state.longRange.map((model, index) => `
    <button type="button" role="tab" aria-label="${modelAccessibleLabel(model)}" aria-selected="${index === state.selectedLong}" data-index="${index}">${modelTabContent(model)}</button>
  `).join("");
  tabs.querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    state.selectedLong = Number(button.dataset.index);
    renderLongTabs();
    renderLongDetail();
  }));
}

function renderLongDetail() {
  const model = state.longRange[state.selectedLong];
  if (!model) return;
  const weeks = weeklySummary(model);
  const memberCount = Math.max(...Object.values(model.matrices).map(matrix => matrix.length), 0);
  const rows = weeks.map(week => `
    <tr>
      <th scope="row">${dateRangeLabel(week.start, week.end)}</th>
      <td>${triplet(week.min, formatTemperature)}</td>
      <td>${triplet(week.max, formatTemperature)}</td>
      <td>${triplet(week.rain, formatRain)}</td>
    </tr>
  `).join("");
  el("long-detail").innerHTML = `
    <div class="model-meta">${modelOriginMeta(model)}<span>${model.producer}</span><span>${memberCount} scénarios</span><span>Horizon : ${model.horizon}</span></div>
    <p class="model-note">Les températures représentent la moyenne quotidienne de la semaine. La pluie est le cumul de la semaine. P10 et P90 décrivent une plage plausible, pas des bornes absolues.</p>
    <div class="table-wrap"><table><thead><tr><th>Semaine</th><th>T. min moyenne · P10 / P50 / P90</th><th>T. max moyenne · P10 / P50 / P90</th><th>Cumul pluie · P10 / P50 / P90</th></tr></thead><tbody>${rows}</tbody></table></div>
  `;
}

function pairedDailyValues(first, second, firstValues, secondValues) {
  if (!first || !second) return [];
  const secondIndexes = new Map(second.dates.map((date, index) => [date, index]));
  return first.dates.map((date, firstIndex) => {
    const secondIndex = secondIndexes.get(date);
    if (!Number.isInteger(secondIndex)) return null;
    const a = firstValues(first, firstIndex);
    const b = secondValues(second, secondIndex);
    return isNumber(a) && isNumber(b) ? { date, a, b, difference: b - a } : null;
  }).filter(Boolean);
}

function trendAgreement(first, second) {
  const pairs = pairedDailyValues(first, second, (model, index) => model.max[index], (model, index) => model.max[index]);
  if (pairs.length < 3) return null;
  let agreements = 0;
  let comparisons = 0;
  for (let index = 1; index < pairs.length; index += 1) {
    const firstMove = pairs[index].a - pairs[index - 1].a;
    const secondMove = pairs[index].b - pairs[index - 1].b;
    if (Math.abs(firstMove) < .5 && Math.abs(secondMove) < .5) agreements += 1;
    else if (firstMove * secondMove > 0) agreements += 1;
    comparisons += 1;
  }
  return comparisons ? Math.round(agreements / comparisons * 100) : null;
}

function biasPill(value, unit = "°C") {
  if (!isNumber(value)) return "";
  const className = value > .4 ? "warm" : value < -.4 ? "cold" : "neutral";
  const text = value > .4 ? `IA +${round(value, 1)} ${unit}` : value < -.4 ? `IA ${round(value, 1)} ${unit}` : "Écart faible";
  return `<span class="diagnostic-pill ${className}">${text}</span>`;
}

function deterministicComparisonCard(physicalId, aiId, title) {
  const physical = state.deterministic.find(model => model.id === physicalId);
  const ai = state.deterministic.find(model => model.id === aiId);
  if (!physical || !ai) return "";
  const maxPairs = pairedDailyValues(physical, ai, (model, index) => model.max[index], (model, index) => model.max[index]);
  const minPairs = pairedDailyValues(physical, ai, (model, index) => model.min[index], (model, index) => model.min[index]);
  if (!maxPairs.length || !minPairs.length) return "";
  const maxBias = mean(maxPairs.map(pair => pair.difference));
  const minBias = mean(minPairs.map(pair => pair.difference));
  const largest = [...maxPairs, ...minPairs].sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference))[0];
  const agreement = trendAgreement(physical, ai);
  return `
    <article class="comparison-card">
      <h3>${title} · scénario unique</h3>
      <p>${biasPill(maxBias)} ${biasPill(minBias)}</p>
      <p><strong>Tendance commune :</strong> ${isNumber(agreement) ? `${agreement}% des changements quotidiens` : "—"}.</p>
      <p><strong>Plus grand écart :</strong> ${formatTemperature(Math.abs(largest.difference))} le ${dayLabel(largest.date)}.</p>
    </article>`;
}

function ensembleComparisonCard(physicalId, aiId, title) {
  const physical = state.ensembles.find(model => model.id === physicalId);
  const ai = state.ensembles.find(model => model.id === aiId);
  if (!physical || !ai) return "";
  const physicalSummary = dailyEnsembleSummary(physical);
  const aiSummary = dailyEnsembleSummary(ai);
  const aiByDate = new Map(aiSummary.map(day => [day.date, day]));
  const pairs = physicalSummary.map(day => {
    const aiDay = aiByDate.get(day.date);
    if (!aiDay || !isNumber(day.max.p50) || !isNumber(aiDay.max.p50)) return null;
    return {
      date: day.date,
      maxBias: aiDay.max.p50 - day.max.p50,
      minBias: aiDay.min.p50 - day.min.p50,
      physicalSpread: day.max.p90 - day.max.p10,
      aiSpread: aiDay.max.p90 - aiDay.max.p10
    };
  }).filter(Boolean);
  if (!pairs.length) return "";
  const maxBias = mean(pairs.map(pair => pair.maxBias));
  const minBias = mean(pairs.map(pair => pair.minBias));
  const physicalSpread = mean(pairs.map(pair => pair.physicalSpread));
  const aiSpread = mean(pairs.map(pair => pair.aiSpread));
  const spreadDifference = aiSpread - physicalSpread;
  return `
    <article class="comparison-card">
      <h3>${title} · ensembles</h3>
      <p>${biasPill(maxBias)} ${biasPill(minBias)}</p>
      <p><strong>Largeur P10–P90 des maximales :</strong> IA ${round(aiSpread, 1)} °C · physique ${round(physicalSpread, 1)} °C.</p>
      <p><strong>Dispersion IA :</strong> ${Math.abs(spreadDifference) < .35 ? "proche" : spreadDifference > 0 ? "plus large" : "plus resserrée"} de ${formatTemperature(Math.abs(spreadDifference))} en moyenne.</p>
    </article>`;
}

function renderAIPhysicsComparison() {
  const target = el("ai-physics-content");
  if (!target) return;
  const cards = [
    deterministicComparisonCard("ecmwf_ifs025", "ecmwf_aifs025_single", "ECMWF AIFS contre IFS"),
    deterministicComparisonCard("gfs_global", "ncep_aigfs025", "NOAA AIGFS contre GFS"),
    ensembleComparisonCard("ecmwf_ifs025", "ecmwf_aifs025", "ECMWF AIFS ENS contre IFS ENS"),
    ensembleComparisonCard("gfs025", "ncep_aigefs025", "NOAA AIGEFS contre GEFS")
  ].filter(Boolean);
  if (!cards.length) {
    target.innerHTML = "<p class='loading-line'>Les modèles nécessaires sont encore en cours de chargement.</p>";
    return;
  }
  target.innerHTML = `
    <p class="insight-note">Les écarts sont calculés jour par jour au même lieu. «&nbsp;IA +1 °C&nbsp;» signifie que la prévision IA est en moyenne plus chaude que son pendant physique ; ce n’est pas un score de qualité.</p>
    <div class="comparison-grid">${cards.join("")}</div>
    ${cards.length < 4 ? "<p class='loading-line'>Les comparaisons ensembleistes apparaîtront dès que tous les ensembles auront répondu.</p>" : ""}`;
}

function resetComplementaryAnalyses() {
  state.insightLoaded = { stability: false, atmosphere: false, extremes: false };
  document.querySelectorAll(".insight-panel").forEach(panel => { panel.open = false; });
  el("ai-physics-content").innerHTML = "<p class='loading-line'>Ouvrez ce volet après le chargement des modèles.</p>";
  el("run-stability-content").innerHTML = "<p class='loading-line'>Les runs archivés seront chargés à l’ouverture.</p>";
  el("atmosphere-content").innerHTML = "<p class='loading-line'>Le profil IFS sera chargé à l’ouverture.</p>";
  el("extremes-content").innerHTML = "<p class='loading-line'>Les indices EC46 seront chargés à l’ouverture.</p>";
}

function stabilityLabel(value) {
  if (value <= .8) return "très stable";
  if (value <= 1.5) return "plutôt stable";
  if (value <= 2.5) return "encore mobile";
  return "très mobile";
}

async function fetchPreviousRun(model, location) {
  const url = forecastUrl("https://previous-runs-api.open-meteo.com/v1/forecast", location, {
    hourly: "temperature_2m_previous_day1",
    models: model.id,
    forecast_days: "10"
  });
  const response = await fetchJSONCached(url, 25000, 6 * HOUR, 36 * HOUR);
  const hourly = response.hourly || {};
  const days = new Map();
  (hourly.time || []).forEach((time, index) => {
    const value = hourly.temperature_2m_previous_day1?.[index];
    if (!isNumber(value)) return;
    const date = time.slice(0, 10);
    if (!days.has(date)) days.set(date, []);
    days.get(date).push(value);
  });
  const dates = [...days.keys()];
  return {
    dates,
    max: dates.map(date => Math.max(...days.get(date))),
    min: dates.map(date => Math.min(...days.get(date)))
  };
}

function renderStabilityCard(model, previous) {
  const previousIndexes = new Map(previous.dates.map((date, index) => [date, index]));
  const changes = model.dates.map((date, index) => {
    const previousIndex = previousIndexes.get(date);
    if (!Number.isInteger(previousIndex)) return null;
    const maxChange = isNumber(model.max[index]) && isNumber(previous.max[previousIndex]) ? model.max[index] - previous.max[previousIndex] : null;
    const minChange = isNumber(model.min[index]) && isNumber(previous.min[previousIndex]) ? model.min[index] - previous.min[previousIndex] : null;
    return isNumber(maxChange) || isNumber(minChange) ? { date, maxChange, minChange } : null;
  }).filter(Boolean);
  const magnitudes = changes.flatMap(day => [day.maxChange, day.minChange].filter(isNumber).map(value => Math.abs(value)));
  if (!magnitudes.length) return "";
  const average = mean(magnitudes);
  const largestDay = changes.slice().sort((a, b) => Math.max(Math.abs(b.maxChange || 0), Math.abs(b.minChange || 0)) - Math.max(Math.abs(a.maxChange || 0), Math.abs(a.minChange || 0)))[0];
  const largest = Math.max(Math.abs(largestDay.maxChange || 0), Math.abs(largestDay.minChange || 0));
  return `
    <article class="comparison-card">
      <h3>${model.label}</h3>
      <p><span class="diagnostic-pill neutral">${stabilityLabel(average)}</span></p>
      <p><strong>Déplacement moyen :</strong> ${round(average, 1)} °C entre le run actuel et la prévision publiée 24 h plus tôt.</p>
      <p><strong>Révision maximale :</strong> ${round(largest, 1)} °C le ${dayLabel(largestDay.date)}.</p>
    </article>`;
}

async function loadRunStability() {
  if (state.insightLoaded.stability || !state.location) return;
  state.insightLoaded.stability = true;
  const target = el("run-stability-content");
  target.innerHTML = "<p class='loading-line'>Comparaison avec les prévisions publiées 24 heures plus tôt…</p>";
  const models = ["ecmwf_ifs025", "ecmwf_aifs025_single"].map(id => state.deterministic.find(model => model.id === id)).filter(Boolean);
  try {
    const previous = await Promise.all(models.map(model => fetchPreviousRun(model, state.location)));
    const cards = models.map((model, index) => renderStabilityCard(model, previous[index])).filter(Boolean);
    target.innerHTML = cards.length ? `<p class="insight-note">Une faible révision d’un run à l’autre renforce la confiance dans la trajectoire. Elle ne garantit pas pour autant que la prévision soit juste.</p><div class="comparison-grid">${cards.join("")}</div>` : "<p class='error-line'>Les archives du run précédent ne contiennent pas encore de valeurs comparables.</p>";
  } catch (error) {
    state.insightLoaded.stability = false;
    target.innerHTML = `<p class="error-line">Stabilité temporairement indisponible : ${error.message}</p>`;
  }
}

function dailyNoonRows(hourly) {
  const times = hourly?.time || [];
  return times.map((time, index) => time.endsWith("T12:00") ? {
    date: time.slice(0, 10),
    t850: hourly.temperature_850hPa?.[index],
    z500: hourly.geopotential_height_500hPa?.[index],
    jet: hourly.wind_speed_300hPa?.[index],
    pressure: hourly.pressure_msl?.[index],
    cape: hourly.cape?.[index]
  } : null).filter(row => row && [row.t850, row.z500, row.jet, row.pressure, row.cape].some(isNumber));
}

async function loadAtmosphereProfile() {
  if (state.insightLoaded.atmosphere || !state.location) return;
  state.insightLoaded.atmosphere = true;
  const target = el("atmosphere-content");
  target.innerHTML = "<p class='loading-line'>Lecture de la colonne atmosphérique IFS…</p>";
  try {
    const url = forecastUrl("https://api.open-meteo.com/v1/forecast", state.location, {
      hourly: "temperature_850hPa,geopotential_height_500hPa,wind_speed_300hPa,pressure_msl,cape",
      models: "ecmwf_ifs025",
      forecast_days: "7"
    });
    const response = await fetchJSONCached(url, 25000, 3 * HOUR, 18 * HOUR);
    const rows = dailyNoonRows(response.hourly);
    if (!rows.length) throw new Error("aucun profil exploitable dans le dernier run");
    const strongestJet = rows.slice().sort((a, b) => (b.jet || 0) - (a.jet || 0))[0];
    const strongestCape = rows.slice().sort((a, b) => (b.cape || 0) - (a.cape || 0))[0];
    target.innerHTML = `
      <p class="insight-note">Valeurs prises vers 12 h locales. T850 décrit la masse d’air ; Z500 aide à repérer dorsales et talwegs ; le vent à 300 hPa situe le courant-jet. CAPE n’indique un risque orageux que si un mécanisme de déclenchement existe.</p>
      <p><span class="diagnostic-pill neutral">Jet maximal ${Math.round(strongestJet.jet || 0)} km/h</span> <span class="diagnostic-pill neutral">CAPE maximale ${Math.round(strongestCape.cape || 0)} J/kg</span></p>
      <div class="table-wrap"><table><thead><tr><th>Jour · 12 h</th><th>T850</th><th>Z500</th><th>Jet 300 hPa</th><th>Pression</th><th>CAPE</th></tr></thead><tbody>${rows.map(row => `<tr><th scope="row">${dayLabel(row.date)}</th><td>${formatTemperature(row.t850)}</td><td>${isNumber(row.z500) ? `${Math.round(row.z500)} m` : "—"}</td><td>${isNumber(row.jet) ? `${Math.round(row.jet)} km/h` : "—"}</td><td>${isNumber(row.pressure) ? `${Math.round(row.pressure)} hPa` : "—"}</td><td>${isNumber(row.cape) ? `${Math.round(row.cape)} J/kg` : "—"}</td></tr>`).join("")}</tbody></table></div>`;
  } catch (error) {
    state.insightLoaded.atmosphere = false;
    target.innerHTML = `<p class="error-line">Profil atmosphérique temporairement indisponible : ${error.message}</p>`;
  }
}

function signedIndex(value) {
  if (!isNumber(value)) return "—";
  const className = value >= .5 ? "efi-strong" : value <= -.5 ? "efi-cold" : "";
  return `<span class="${className}">${value > 0 ? "+" : ""}${round(value, 2)}</span>`;
}

async function loadExtremeIndices() {
  if (state.insightLoaded.extremes || !state.location) return;
  state.insightLoaded.extremes = true;
  const target = el("extremes-content");
  target.innerHTML = "<p class='loading-line'>Calcul des anomalies EC46…</p>";
  try {
    const variables = "temperature_2m_efi,temperature_2m_sot10,temperature_2m_sot90,precipitation_efi,precipitation_sot90";
    const url = forecastUrl("https://seasonal-api.open-meteo.com/v1/seasonal", state.location, { weekly: variables, forecast_days: "46" });
    const response = await fetchJSONCached(url, 30000, 12 * HOUR, 48 * HOUR);
    const weekly = response.weekly || {};
    const rows = (weekly.time || []).map((date, index) => ({
      date,
      temperatureEfi: weekly.temperature_2m_efi?.[index],
      coldTail: weekly.temperature_2m_sot10?.[index],
      warmTail: weekly.temperature_2m_sot90?.[index],
      rainEfi: weekly.precipitation_efi?.[index],
      rainTail: weekly.precipitation_sot90?.[index]
    })).filter(row => [row.temperatureEfi, row.rainEfi].some(isNumber));
    if (!rows.length) throw new Error("aucun indice EFI/SOT dans le dernier run");
    target.innerHTML = `
      <p class="insight-note">EFI proche de +1 signale un événement très supérieur à la climatologie du modèle ; proche de −1, très inférieur. SOT examine la queue extrême : il renseigne sur le potentiel des scénarios rares, pas sur leur certitude.</p>
      <div class="table-wrap"><table><thead><tr><th>Semaine</th><th>EFI température</th><th>SOT froid</th><th>SOT chaud</th><th>EFI pluie</th><th>SOT pluie forte</th></tr></thead><tbody>${rows.map(row => `<tr><th scope="row">Du ${dayLabel(row.date)}</th><td>${signedIndex(row.temperatureEfi)}</td><td>${signedIndex(row.coldTail)}</td><td>${signedIndex(row.warmTail)}</td><td>${signedIndex(row.rainEfi)}</td><td>${signedIndex(row.rainTail)}</td></tr>`).join("")}</tbody></table></div>
      <p class="insight-note">Ces indices portent sur une zone d’environ 36 km et ne sont pas corrigés des biais locaux. Ils servent à repérer un caractère inhabituel, pas à prévoir précisément la température d’une commune.</p>`;
  } catch (error) {
    state.insightLoaded.extremes = false;
    target.innerHTML = `<p class="error-line">Indices EFI/SOT temporairement indisponibles : ${error.message}</p>`;
  }
}

function learningDayKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function loadLearningQueue() {
  try {
    const stored = JSON.parse(localStorage.getItem(LEARNING_STORAGE_KEY) || "[]");
    state.learningQueue = Array.isArray(stored)
      ? stored.filter(item => item && typeof item.issueKey === "string" && SCIENCE_LESSONS.some(lesson => lesson.id === item.lessonId))
      : [];
  } catch {
    state.learningQueue = [];
  }
}

function saveLearningQueue() {
  try {
    const unread = state.learningQueue.filter(item => !item.read);
    const recentRead = state.learningQueue.filter(item => item.read).slice(-90);
    localStorage.setItem(LEARNING_STORAGE_KEY, JSON.stringify([...unread, ...recentRead]));
  } catch {
    // L’application reste utilisable si le stockage privé du navigateur est bloqué.
  }
}

function ensureLearningForRun() {
  if (!state.learningQueue.length) loadLearningQueue();
  const dayKey = learningDayKey();
  if (state.learningQueue.some(item => item.dayKey === dayKey)) return;
  const lessonIndex = Math.floor(parseDay(dayKey).getTime() / 86400000) % SCIENCE_LESSONS.length;
  const lesson = SCIENCE_LESSONS[lessonIndex];
  state.learningQueue.push({
    issueKey: `${dayKey}:${lesson.id}`,
    dayKey,
    lessonId: lesson.id,
    read: false,
    createdAt: new Date().toISOString()
  });
  saveLearningQueue();
}

function renderLearningCard() {
  ensureLearningForRun();
  const unread = state.learningQueue.filter(item => !item.read);
  const current = unread[0];
  if (!current) {
    el("learning-card").innerHTML = `
      <div class="learning-complete" aria-live="polite">
        <span class="learning-icon" aria-hidden="true">✓</span>
        <div><h3>Vous êtes à jour</h3><p>Tous les repères disponibles ont été lus. Un nouveau repère sera ajouté lors du prochain bulletin quotidien.</p></div>
      </div>
      <p class="learning-storage-note">Les repères lus restent mémorisés sur cet appareil.</p>
    `;
    return;
  }
  const lesson = SCIENCE_LESSONS.find(item => item.id === current.lessonId) || SCIENCE_LESSONS[0];
  let editionNote = "Le commentaire lié à cette édition apparaîtra après le chargement des modèles.";
  if (state.consensus.length) {
    const fragile = state.consensus.slice().sort((a, b) => a.confidence - b.confidence)[0];
    const temperatureRange = isNumber(fragile.maxHigh) && isNumber(fragile.maxLow) ? fragile.maxHigh - fragile.maxLow : 0;
    const rainRange = isNumber(fragile.rainHigh) && isNumber(fragile.rainLow) ? fragile.rainHigh - fragile.rainLow : 0;
    editionNote = `Dans ce bulletin, la journée la plus incertaine est le <strong>${dayLabel(fragile.date)}</strong> : ${fragile.confidence}/100 de confiance, ${round(temperatureRange, 1)} °C d’écart sur la maximale et ${formatRain(rainRange)} d’écart sur la pluie entre modèles.`;
  }
  el("learning-card").innerHTML = `
    <div class="learning-heading">
      <span class="learning-icon" aria-hidden="true">${lesson.icon}</span>
      <div><span class="learning-unread">À lire · ${unread.length} en attente</span><h3>${lesson.title}</h3></div>
    </div>
    <p>${lesson.text}</p>
    <p class="edition-note"><strong>Ce que montrent les modèles aujourd’hui :</strong><br>${editionNote}</p>
    <div class="learn-actions">
      <button id="next-lesson-button" type="button">✓ Marquer comme lu${unread.length > 1 ? " et voir le suivant" : ""}</button>
      <span>Ajouté le ${dayLabel(current.dayKey)} · conservé tant qu’il n’est pas lu</span>
    </div>
  `;
  el("next-lesson-button").addEventListener("click", () => {
    current.read = true;
    current.readAt = new Date().toISOString();
    saveLearningQueue();
    renderLearningCard();
  });
}

function selectAnalysisTip() {
  if (state.consensus.length) {
    const signals = signalSummary(state.consensus);
    const season = seasonMeta();
    if (signals.hotRun.length >= 3) return { id: "temperature-850", reason: "Le bulletin montre une chaleur durable : commencez par identifier l’origine et l’épaisseur de la masse d’air chaud." };
    if (signals.totalRain >= 20) return { id: "radar-direct", reason: "Le signal humide est notable : confrontez la prévision à l’animation radar lorsque la perturbation approche." };
    if (season.key === "winter" && signals.frostDays.length) return { id: "temperature-850", reason: "Un risque de gel apparaît : la température à 850 hPa aide à distinguer refroidissement local et véritable arrivée d’air froid." };
    if (signals.averageConfidence < 65) return { id: "ensemble-aifs", reason: "Les modèles divergent : regardez la dispersion et les familles de scénarios avant de retenir une trajectoire." };
  }
  const rotating = ["colonne-2m-850-500", "pression-z500", "gradient-850-500", "ecmwf-opencharts", "point-rosee", "jet-stream", "enso-diagnostic", "humidite-700-omega", "satellite", "ensemble-aifs", "weatherlab-cyclones"];
  const index = Math.floor(Date.now() / 86400000) % rotating.length;
  return { id: rotating[index], reason: "Conseil du jour pour progresser régulièrement dans la lecture des cartes météo." };
}

function renderAnalysisLibrary() {
  const selected = selectAnalysisTip();
  const tip = ANALYSIS_GUIDES.find(guide => guide.id === selected.id) || ANALYSIS_GUIDES[0];
  el("analysis-count").textContent = `${ANALYSIS_GUIDES.length} parcours guidés`;
  el("analysis-tip").innerHTML = `
    <article class="analysis-tip-card">
      <span class="analysis-tip-icon" aria-hidden="true">${tip.icon}</span>
      <div>
        <span class="analysis-tip-label">Conseil d’analyse lié au bulletin</span>
        <h3>${tip.title}</h3>
        <p>${selected.reason}</p>
        <p class="analysis-first-step"><strong>Premier geste :</strong> ${tip.look}</p>
        <a href="${tip.url}" target="_blank" rel="noreferrer">Ouvrir ${tip.source}</a>
      </div>
    </article>`;

  const filters = [
    ["all", "Tout"], ["circulation", "Circulation"], ["air", "Températures et air"],
    ["precipitations", "Pluie et satellite"], ["ensembles", "Ensembles"],
    ["climat", "Climat"], ["securite", "Sécurité"]
  ];
  el("analysis-filters").innerHTML = filters.map(([id, label], index) => `<button type="button" data-category="${id}" aria-pressed="${index === 0}">${label}</button>`).join("");
  el("analysis-guide-list").innerHTML = ANALYSIS_GUIDES.map(guide => `
    <details class="analysis-guide" data-category="${guide.category}">
      <summary>
        <span class="analysis-guide-icon" aria-hidden="true">${guide.icon}</span>
        <span><strong>${guide.title}</strong><small>${guide.source}</small></span>
      </summary>
      <div class="analysis-guide-body">
        <p><strong>À regarder</strong>${guide.look}</p>
        <p><strong>Comment le lire</strong>${guide.read}</p>
        <p class="analysis-pitfall"><strong>Piège à éviter</strong>${guide.pitfall}</p>
        <a href="${guide.url}" target="_blank" rel="noreferrer">Consulter la ressource</a>
      </div>
    </details>`).join("");

  el("analysis-filters").querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
    const category = button.dataset.category;
    el("analysis-filters").querySelectorAll("button").forEach(item => item.setAttribute("aria-pressed", String(item === button)));
    el("analysis-guide-list").querySelectorAll(".analysis-guide").forEach(guide => {
      guide.hidden = category !== "all" && guide.dataset.category !== category;
    });
  }));
}

function buildNewsletterText() {
  if (!state.location || !state.consensus.length) return "";
  const signals = signalSummary(state.consensus);
  const lines = [
    `HORIZON MÉTÉO — ${state.location.name}`,
    `Mise à jour : ${new Intl.DateTimeFormat("fr-FR", { dateStyle: "full", timeStyle: "short" }).format(new Date())}`,
    "",
    "SYNTHÈSE",
    `Pic prévu : ${formatTemperature(signals.hottest?.max)} le ${signals.hottest ? dayLabel(signals.hottest.date) : "—"}.`,
    `Nuits ≥ 20 °C : ${signals.tropicalNights.length}. Pluie moyenne sur 10 jours : ${formatRain(signals.totalRain)}.`,
    `Confiance multimodèle moyenne : ${Math.round(signals.averageConfidence)}/100.`,
    "",
    "CONSENSUS À 10 JOURS"
  ];
  state.consensus.forEach(day => {
    const confidence = confidenceMeta(day.confidence);
    lines.push(`${dayLabel(day.date)} · ${formatTemperature(day.min)} / ${formatTemperature(day.max)} · pluie ${formatRain(day.rain)} · confiance ${confidence.label.toLowerCase()} (${day.confidence})`);
  });

  if (state.environment) {
    lines.push("", "AIR ET POLLENS");
    if (isNumber(state.environment.currentAqi)) lines.push(`Qualité de l’air : indice européen ${Math.round(state.environment.currentAqi)} (${state.environment.aqiLabel.toLowerCase()}). Maximum prévu sur 24 h : ${environmentNumber(state.environment.maxAqi)}.`);
    if (state.environment.pollenDominant) lines.push(`Pollen dominant sur 24 h : ${state.environment.pollenDominant.label}, pic modélisé ${environmentNumber(state.environment.pollenDominant.max24)} grains/m³.`);
  }

  const ensemble = state.ensembles.find(model => model.id === "ecmwf_ifs025") || state.ensembles[0];
  if (ensemble) {
    lines.push("", `ENSEMBLE ${ensemble.label.toUpperCase()} — BRANCHES J11 À J15`);
    dailyEnsembleSummary(ensemble).slice(10, 15).forEach(day => {
      lines.push(`${dayLabel(day.date)} · Tmin P10/P50/P90 ${plainTriplet(day.min, formatTemperature)} · Tmax ${plainTriplet(day.max, formatTemperature)} · P(≥30°) ${day.events.hot30}% · P(≥35°) ${day.events.hot35}%`);
    });
  }

  const longModel = state.longRange.find(model => model.id === "ec46") || state.longRange[0];
  if (longModel) {
    lines.push("", `TENDANCE HEBDOMADAIRE — ${longModel.label}`);
    weeklySummary(longModel).forEach(week => {
      lines.push(`${dateRangeLabel(week.start, week.end)} · Tmax moy. P10/P50/P90 ${plainTriplet(week.max, formatTemperature)} · pluie ${plainTriplet(week.rain, formatRain)}`);
    });
  }

  lines.push("", "Sources : Open-Meteo et services météorologiques producteurs ; qualité de l’air et pollens CAMS Europe. Indices calculés pour un usage personnel ; les informations officielles Météo-France, Airparif et Atmo France restent prioritaires.");
  return lines.join("\n");
}

function plainTriplet(stats, formatter) {
  if (!stats || !stats.count) return "—";
  return `${formatter(stats.p10)} / ${formatter(stats.p50)} / ${formatter(stats.p90)}`;
}

async function copyNewsletter() {
  const text = buildNewsletterText();
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }
  const button = el("copy-button");
  const original = button.textContent;
  button.textContent = "Bulletin copié";
  setTimeout(() => { button.textContent = original; }, 1800);
}

function openMail() {
  const subject = `Horizon météo — ${state.location?.name || "ma position"}`;
  const body = buildNewsletterText();
  window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function setStatus(message, error = false) {
  const status = el("global-status");
  status.textContent = message;
  status.classList.toggle("error-line", error);
}

function setLoading(isLoading) {
  ["gps-button", "refresh-button"].forEach(id => { if (el(id)) el(id).disabled = isLoading; });
}

async function loadLocation(location) {
  state.location = location;
  state.deterministic = [];
  state.consensus = [];
  state.ensembles = [];
  state.longRange = [];
  state.environment = null;
  state.selectedModel = 0;
  state.selectedEnsemble = 0;
  state.selectedLong = 0;
  resetComplementaryAnalyses();
  el("ensemble-alert").hidden = true;
  setLoading(true);
  setStatus(`Interrogation des modèles pour ${location.name}…`);
  el("bulletin").hidden = true;

  try {
    state.deterministic = await fetchDeterministic(location);
    const availableDeterministic = state.deterministic.filter(model => [...model.max, ...model.min].some(isNumber));
    if (availableDeterministic.length < 2) throw new Error("Trop peu de modèles ont répondu. Réessayez dans quelques minutes.");
    state.consensus = computeConsensus(state.deterministic);
    el("place-heading").textContent = location.name;
    el("updated-at").textContent = `Position ${round(location.lat, 3)}°, ${round(location.lon, 3)}° · ${availableDeterministic.length} modèles disponibles · actualisé ${new Intl.DateTimeFormat("fr-FR", { hour: "2-digit", minute: "2-digit" }).format(new Date())}`;
    renderOverview();
    renderConsensusTable();
    renderTemperatureChart();
    renderModelTabs();
    renderModelDetail();
    renderGoogleStatus();
    renderAIPhysicsComparison();
    renderLearningCard();
    renderAnalysisLibrary();
    el("bulletin").hidden = false;
    setStatus(`Bulletin prêt pour ${location.name}. Les ensembles continuent de se charger.`);
    el("bulletin").scrollIntoView({ behavior: "smooth", block: "start" });

    el("france-map-section").hidden = false;
    el("france-map-button").hidden = el("france-maps").children.length > 0;
    el("france-map-loading").hidden = true;
    void loadEnvironmentData(location);
    void loadEnsembleSections(location);
  } catch (error) {
    console.error(error);
    setStatus(error.name === "AbortError" ? "Le service météo a mis trop de temps à répondre." : error.message, true);
  } finally {
    setLoading(false);
  }
}

async function loadEnsembleSections(location) {
  el("ensemble-loading").hidden = false;
  el("ensemble-loading").className = "loading-line";
  el("ensemble-loading").textContent = "Chargement des ensembles…";
  el("long-loading").hidden = false;
  el("long-loading").className = "loading-line";
  el("long-loading").textContent = "Chargement de la tendance lointaine…";
  el("ensemble-content").hidden = true;
  el("long-content").hidden = true;
  const ensemblePromise = fetchEnsembles(location).then(models => {
    if (state.location !== location) return;
    state.ensembles = models;
    if (!models.length) throw new Error("Ensembles temporairement indisponibles.");
    el("ensemble-loading").hidden = true;
    el("ensemble-content").hidden = false;
    renderEnsembleTabs();
    renderEnsembleDetail();
    renderEnsembleAlert();
    renderAIPhysicsComparison();
    el("ensemble-map-button").hidden = el("ensemble-maps").children.length > 0;
    el("ensemble-map-loading").hidden = true;
  }).catch(error => {
    el("ensemble-loading").className = "loading-line error-line";
    el("ensemble-loading").textContent = error.message;
  });

  const longPromise = fetchLongRange(location).then(models => {
    if (state.location !== location) return;
    state.longRange = models;
    if (!models.length) throw new Error("Tendance lointaine temporairement indisponible.");
    el("long-loading").hidden = true;
    el("long-content").hidden = false;
    renderLongTabs();
    renderLongDetail();
  }).catch(error => {
    el("long-loading").className = "loading-line error-line";
    el("long-loading").textContent = error.message;
  });

  await Promise.allSettled([ensemblePromise, longPromise]);
}

function useGPS() {
  if (!navigator.geolocation) {
    setStatus("La géolocalisation n’est pas disponible sur cet appareil. Recherchez une commune.", true);
    return;
  }
  setStatus("Demande de votre position…");
  el("gps-button").disabled = true;
  navigator.geolocation.getCurrentPosition(
    position => {
      el("gps-button").disabled = false;
      loadLocation({ lat: position.coords.latitude, lon: position.coords.longitude, name: "Ma position actuelle" });
    },
    error => {
      el("gps-button").disabled = false;
      const messages = {
        1: "Position refusée. Autorisez-la dans le navigateur ou choisissez une commune.",
        2: "Position introuvable. Choisissez une commune.",
        3: "La recherche GPS a expiré. Réessayez ou choisissez une commune."
      };
      setStatus(messages[error.code] || "Impossible d’obtenir la position.", true);
    },
    { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
  );
}

async function searchCity(query) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?${new URLSearchParams({ name: query, count: "6", language: "fr", format: "json" })}`;
  setStatus(`Recherche de « ${query} »…`);
  try {
    const data = await fetchJSON(url, 12000);
    const results = data.results || [];
    if (!results.length) {
      el("search-results").innerHTML = "<span>Aucune commune trouvée.</span>";
      return;
    }
    el("search-results").innerHTML = results.map((result, index) => {
      const context = [result.admin2, result.admin1, result.country].filter(Boolean).join(" · ");
      return `<button class="search-result" type="button" data-index="${index}">${result.name}${context ? ` — ${context}` : ""}</button>`;
    }).join("");
    el("search-results").querySelectorAll("button").forEach(button => button.addEventListener("click", () => {
      const result = results[Number(button.dataset.index)];
      el("search-results").innerHTML = "";
      loadLocation({ lat: result.latitude, lon: result.longitude, name: [result.name, result.admin1].filter(Boolean).join(", ") });
    }));
    setStatus("Choisissez la bonne commune dans la liste.");
  } catch (error) {
    setStatus(error.message, true);
  }
}

function bindEvents() {
  el("gps-button").addEventListener("click", useGPS);
  document.querySelectorAll(".preset-button").forEach(button => button.addEventListener("click", () => {
    loadLocation({ lat: Number(button.dataset.lat), lon: Number(button.dataset.lon), name: button.dataset.name });
  }));
  el("city-form").addEventListener("submit", event => {
    event.preventDefault();
    const query = el("city-input").value.trim();
    if (query) searchCity(query);
  });
  el("refresh-button").addEventListener("click", () => state.location && loadLocation(state.location));
  el("copy-button").addEventListener("click", copyNewsletter);
  el("mail-button").addEventListener("click", openMail);
  el("france-map-button").addEventListener("click", loadFranceMaps);
  el("ensemble-map-button").addEventListener("click", loadEnsembleFranceMaps);
  el("ai-physics-panel").addEventListener("toggle", event => { if (event.currentTarget.open) renderAIPhysicsComparison(); });
  el("run-stability-panel").addEventListener("toggle", event => { if (event.currentTarget.open) void loadRunStability(); });
  el("atmosphere-panel").addEventListener("toggle", event => { if (event.currentTarget.open) void loadAtmosphereProfile(); });
  el("extremes-panel").addEventListener("toggle", event => { if (event.currentTarget.open) void loadExtremeIndices(); });
  document.querySelectorAll("[data-dialog]").forEach(button => button.addEventListener("click", () => el(button.dataset.dialog).showModal()));
}

bindEvents();
renderLearningCard();
renderAnalysisLibrary();
setStatus("Choisissez un lieu pour créer votre bulletin.");

window.addEventListener("weathernext-ready", () => {
  renderGoogleStatus();
  if (state.location) void loadEnsembleSections(state.location);
});

if ("serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => {}));
}
