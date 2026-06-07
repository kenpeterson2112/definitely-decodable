import type { Passage } from "./types";

// Curated, skill-tagged library. Topics are deliberately high-interest and
// age-respectful for grades 3+ — nonfiction-leaning, never babyish. Each passage
// declares the scope skills it exercises so the recommender can match on need.

type RawPassage = Omit<Passage, "wordCount" | "source">;

const RAW: RawPassage[] = [
  {
    id: "volcanoes",
    title: "Volcanoes That Build Islands",
    topic: "Earth Science",
    blurb: "How molten rock slowly grows new land out of the open ocean.",
    gradeBand: "3–5",
    level: 3,
    skillTargets: ["closed-syllables", "open-syllables"],
    text: `Deep under the ocean, hot rock pushes up through cracks in the sea floor. When the melted rock, called magma, reaches the surface, it cools and turns solid. Bit by bit, layer after layer, a mountain grows upward until it breaks above the waves.

That is how islands like Hawaii began. The process is slow, but it never really stops. A single eruption can add new land in a matter of days, and over millions of years a whole chain of islands can form.`,
    targetWords: ["magma", "solid", "until", "upward", "began", "process"],
    vocabulary: [
      { word: "magma", definition: "Hot, melted rock beneath the earth's surface." },
      { word: "eruption", definition: "When magma bursts out of a volcano." },
    ],
    questions: [
      { id: "q1", prompt: "How does an island like Hawaii form?", type: "literal", answer: "Magma rises, cools into solid rock, and builds up in layers until it rises above the water." },
      { id: "q2", prompt: "Why does the author say the process 'never really stops'?", type: "inferential", answer: "New eruptions keep adding rock over time, so the islands keep growing." },
    ],
  },
  {
    id: "mars-robots",
    title: "Robots on the Red Planet",
    topic: "Space",
    blurb: "The rovers that drive across Mars looking for signs of ancient water.",
    gradeBand: "3–5",
    level: 4,
    skillTargets: ["open-syllables", "r-controlled"],
    text: `A robot the size of a car is driving across Mars right now. Its name is a rover, and it has a motor for each wheel so it can climb over rocks and sand.

The rover takes photos, drills into the surface, and studies the dirt for clues. Scientists hope to learn whether water once flowed there. Because Mars is so far away, a message from Earth can take many minutes to arrive, so the rover must make some choices on its own.`,
    targetWords: ["robot", "rover", "motor", "surface", "water", "arrive"],
    vocabulary: [
      { word: "rover", definition: "A vehicle that explores the surface of another world." },
      { word: "surface", definition: "The top or outside layer of something." },
    ],
    questions: [
      { id: "q1", prompt: "What does the rover do on Mars?", type: "literal", answer: "It drives over rocks, takes photos, drills, and studies the dirt for clues about water." },
      { id: "q2", prompt: "Why must the rover make some choices on its own?", type: "inferential", answer: "Messages from Earth take a long time to arrive, so it can't wait for instructions." },
    ],
  },
  {
    id: "octopus",
    title: "Why Octopuses Outsmart Us",
    topic: "Animals",
    blurb: "Eight arms, three hearts, and a brain that solves puzzles.",
    gradeBand: "3–5",
    level: 4,
    skillTargets: ["vce-multisyllabic", "suffixes-inflectional"],
    text: `An octopus is one of the strangest animals in the sea. It has eight arms, three hearts, and blue blood. It can change the color of its skin in less than a second to hide from anything hunting it.

Octopuses are also clever. In labs, they have escaped from closed jars and solved puzzles for a snack. Some have been filmed carrying coconut shells to use later as a hiding place. For an animal with no bones, that is impressive problem solving.`,
    targetWords: ["escaped", "solved", "carrying", "hunting", "hiding", "filmed"],
    vocabulary: [
      { word: "clever", definition: "Quick to understand and solve problems." },
      { word: "impressive", definition: "So good that it earns admiration." },
    ],
    questions: [
      { id: "q1", prompt: "Name two ways an octopus protects itself.", type: "literal", answer: "It changes the color of its skin and hides, sometimes using shells." },
      { id: "q2", prompt: "What evidence shows octopuses are clever?", type: "inferential", answer: "They escape from jars, solve puzzles, and save shells to hide in later." },
    ],
  },
  {
    id: "plastic",
    title: "The Trouble with Plastic",
    topic: "Environment",
    blurb: "Why a material that never breaks down became a global problem.",
    gradeBand: "3–5",
    level: 5,
    skillTargets: ["consonant-le", "prefixes-1"],
    text: `Plastic is cheap, light, and able to take almost any shape. That is exactly why it became a problem. We made so much of it that we are unable to get rid of it.

Most plastic does not break down. A single bottle can outlast a person's whole life and still remain in the soil or sea. People are now trying to reuse and recycle more, and to rethink the way we wrap and bottle the things we buy.`,
    targetWords: ["able", "unable", "bottle", "single", "recycle", "rethink"],
    vocabulary: [
      { word: "recycle", definition: "To treat used material so it can be used again." },
      { word: "outlast", definition: "To last longer than something else." },
    ],
    questions: [
      { id: "q1", prompt: "Why did plastic become a problem?", type: "inferential", answer: "We made so much of a material that doesn't break down that we can't get rid of it." },
      { id: "q2", prompt: "What are two things people are doing about it?", type: "literal", answer: "Reusing and recycling more, and rethinking packaging." },
    ],
  },
  {
    id: "bioluminescence",
    title: "Light in the Deep Sea",
    topic: "Ocean",
    blurb: "In the darkest water on Earth, living things make their own light.",
    gradeBand: "6–8",
    level: 6,
    skillTargets: ["vowel-teams", "schwa"],
    text: `Sunlight cannot reach the deepest parts of the ocean, yet the water there is not completely dark. Many creatures make their own light in a process called bioluminescence. A chemical reaction inside their bodies releases a cool blue-green glow.

Animals use this light for different reasons. Some flash it to confuse a predator. Others dangle a glowing lure to draw curious prey close enough to eat. In a place with no sunlight at all, the ability to control light becomes a powerful advantage.`,
    targetWords: ["reach", "release", "reason", "creatures", "advantage", "control"],
    vocabulary: [
      { word: "bioluminescence", definition: "Light produced by a living thing through a chemical reaction." },
      { word: "predator", definition: "An animal that hunts others for food." },
    ],
    questions: [
      { id: "q1", prompt: "What is bioluminescence?", type: "vocabulary", answer: "Light a living thing makes inside its own body through a chemical reaction." },
      { id: "q2", prompt: "Why is making light an advantage in the deep sea?", type: "inferential", answer: "There is no sunlight, so animals that control light can hunt, hide, or trick others." },
    ],
  },
  {
    id: "codebreakers",
    title: "The Code Breakers of Bletchley",
    topic: "History",
    blurb: "How a secret team cracked an 'unbreakable' wartime code.",
    gradeBand: "6–8",
    level: 6,
    skillTargets: ["prefixes-1", "suffixes-inflectional"],
    text: `During the war, one army sent its orders using a machine that scrambled every message into nonsense. The enemy believed the code was unbreakable, because the settings changed every single day.

In a quiet English house called Bletchley Park, a hidden team worked day and night to disprove that belief. They built early machines that tested millions of settings, slowly decoding the messages. Their work stayed secret for decades, but historians now think it shortened the war by years.`,
    targetWords: ["unbreakable", "disprove", "decoding", "scrambled", "believed", "shortened"],
    vocabulary: [
      { word: "scrambled", definition: "Mixed up so the order makes no sense." },
      { word: "decode", definition: "To turn a secret message back into normal language." },
    ],
    questions: [
      { id: "q1", prompt: "Why did the enemy think the code was unbreakable?", type: "literal", answer: "The machine's settings changed every day, creating endless possibilities." },
      { id: "q2", prompt: "How did the team finally read the messages?", type: "inferential", answer: "They built machines that quickly tested millions of settings to decode them." },
    ],
  },
  {
    id: "parkour",
    title: "Parkour and the City",
    topic: "Sports",
    blurb: "Turning walls, rails, and rooftops into a moving obstacle course.",
    gradeBand: "6–8",
    level: 7,
    skillTargets: ["diphthongs", "r-controlled"],
    text: `To most people a concrete wall is just a wall. To someone who trains in parkour, it is a launch point. Parkour is the art of moving through a city quickly, using only your body to vault, climb, and balance over whatever stands in your way.

The sport rewards power and careful judgment in equal amounts. A wrong choice can mean a hard fall, so skilled runners scout every route first. They point out each landing and rehearse a move on the ground before they ever attempt it up high.`,
    targetWords: ["point", "around", "power", "scout", "rewards", "careful"],
    vocabulary: [
      { word: "vault", definition: "To jump over something using your hands for support." },
      { word: "rehearse", definition: "To practice something before doing it for real." },
    ],
    questions: [
      { id: "q1", prompt: "What is parkour?", type: "vocabulary", answer: "Moving quickly through a city using your body to vault, climb, and balance over obstacles." },
      { id: "q2", prompt: "Why do skilled runners scout a route first?", type: "inferential", answer: "A wrong choice can cause a hard fall, so they plan and rehearse to stay safe." },
    ],
  },
  {
    id: "wolves",
    title: "The Wolves That Changed a River",
    topic: "Ecology",
    blurb: "How returning one predator reshaped an entire national park.",
    gradeBand: "6–8",
    level: 7,
    skillTargets: ["prefixes-2", "suffixes-derivational-1"],
    text: `When wolves disappeared from Yellowstone, the deer population exploded. With nothing to hunt them, the deer overgrazed the young trees along the rivers until the banks were nearly bare.

In 1995, scientists reintroduced a small number of wolves. The improvement was remarkable. Deer began to avoid open valleys, the trees recovered, and birds and beavers returned to the new forest. The beaver dams even slowed the water, and over time the movement of the rivers themselves began to change.`,
    targetWords: ["disappeared", "reintroduced", "improvement", "movement", "remarkable", "recovered"],
    vocabulary: [
      { word: "overgraze", definition: "To eat so many plants that the land is damaged." },
      { word: "reintroduce", definition: "To bring a species back to a place it once lived." },
    ],
    questions: [
      { id: "q1", prompt: "What happened after the wolves disappeared?", type: "literal", answer: "Deer multiplied and overgrazed the trees along the rivers." },
      { id: "q2", prompt: "How could wolves change the path of a river?", type: "inferential", answer: "They reduced deer, trees recovered, beavers returned and built dams that slowed the water." },
    ],
  },
  {
    id: "endurance",
    title: "Stranded on the Ice",
    topic: "Adventure",
    blurb: "A ship is crushed by ice, and a crew must survive at the bottom of the world.",
    gradeBand: "6–8",
    level: 7,
    skillTargets: ["suffixes-inflectional", "schwa"],
    text: `In 1915, a ship named the Endurance became trapped in the frozen sea near Antarctica. For months the crew waited, hoping the ice would loosen. Instead it tightened, crushing the wooden hull until the ship finally sank.

The men were stranded on drifting ice with no way to call for help. Their leader refused to give up. He guided them across the ice, then sailed a tiny lifeboat through some of the roughest water on the planet to reach help. Astonishingly, every single member of the crew survived.`,
    targetWords: ["trapped", "waited", "tightened", "stranded", "drifting", "survived"],
    vocabulary: [
      { word: "stranded", definition: "Left somewhere with no way to leave." },
      { word: "hull", definition: "The main body of a ship." },
    ],
    questions: [
      { id: "q1", prompt: "What happened to the Endurance?", type: "literal", answer: "It got trapped in sea ice that crushed the hull until the ship sank." },
      { id: "q2", prompt: "What does the crew's survival suggest about their leader?", type: "inferential", answer: "He stayed calm, refused to give up, and made smart, brave decisions." },
    ],
  },
  {
    id: "vaccines",
    title: "How Vaccines Train the Body",
    topic: "Health Science",
    blurb: "A harmless preview that teaches the immune system to fight.",
    gradeBand: "9–12",
    level: 8,
    skillTargets: ["latin-roots", "suffixes-derivational-1"],
    text: `Your immune system constructs a defense against germs it has seen before. The problem is that a first infection can be dangerous while the body learns. A vaccine solves this by predicting the threat in advance.

A vaccine introduces a harmless version of a germ, or just a fragment of one. The immune system inspects it and produces protective cells, building a memory of the invader. If the real germ ever arrives, the response is fast and the infection is stopped before it can spread.`,
    targetWords: ["constructs", "predicting", "introduces", "inspects", "protection", "infection"],
    vocabulary: [
      { word: "immune system", definition: "The body's network of defenses against disease." },
      { word: "fragment", definition: "A small piece broken off from something whole." },
    ],
    questions: [
      { id: "q1", prompt: "How does a vaccine prepare the body?", type: "literal", answer: "It shows the immune system a harmless version of a germ so it can build protective cells and memory." },
      { id: "q2", prompt: "Why is having this memory in advance valuable?", type: "inferential", answer: "The body can respond fast and stop a real infection before it becomes dangerous." },
    ],
  },
  {
    id: "graphene",
    title: "Graphene: One Atom Thick",
    topic: "Materials",
    blurb: "A material a million times thinner than paper — and stronger than steel.",
    gradeBand: "9–12",
    level: 9,
    skillTargets: ["greek-forms", "latin-roots"],
    text: `Graphene is a sheet of carbon exactly one atom thick. Despite being almost invisible, it is stronger than steel, conducts electricity better than copper, and bends without breaking.

Researchers first extracted it using ordinary sticky tape to peel layers off a pencil tip. Since then, the structure has inspired thousands of experiments. Engineers predict it could transform batteries, water filters, and flexible screens — though manufacturing it cheaply at large scale has proven difficult.`,
    targetWords: ["graphene", "structure", "extracted", "conducts", "predict", "transform"],
    vocabulary: [
      { word: "atom", definition: "The smallest unit of an element." },
      { word: "conduct", definition: "To let electricity or heat pass through." },
    ],
    questions: [
      { id: "q1", prompt: "What makes graphene unusual?", type: "literal", answer: "It is one atom thick yet stronger than steel and conducts electricity very well." },
      { id: "q2", prompt: "Why might graphene not be in everyday products yet?", type: "inferential", answer: "Making it cheaply at a large scale has been difficult." },
    ],
  },
  {
    id: "blackhole",
    title: "Inside a Black Hole",
    topic: "Astronomy",
    blurb: "What happens at the edge of the universe's most extreme object.",
    gradeBand: "9–12",
    level: 9,
    skillTargets: ["greek-forms", "suffixes-derivational-2"],
    text: `A black hole forms when a massive star collapses under its own enormous gravity. The pull becomes so intense that nothing, not even light, can escape once it crosses the boundary called the event horizon.

Because no light returns, a black hole is invisible by definition. Astronomers detect one indirectly, by watching how nearby stars orbit an empty point in space, or by using a telescope array to capture the glowing gas swirling just outside it.`,
    targetWords: ["enormous", "intense", "invisible", "definition", "telescope", "gravity"],
    vocabulary: [
      { word: "gravity", definition: "The force that pulls objects toward one another." },
      { word: "event horizon", definition: "The boundary of a black hole that nothing can escape." },
    ],
    questions: [
      { id: "q1", prompt: "Why is a black hole invisible?", type: "inferential", answer: "Its gravity is so strong that no light can escape, so there is nothing to see." },
      { id: "q2", prompt: "How do astronomers find one anyway?", type: "literal", answer: "They watch how nearby stars orbit it, or image the hot gas swirling around it." },
    ],
  },
  {
    id: "last-speakers",
    title: "The Last Speakers",
    topic: "Language",
    blurb: "When a language has only a handful of speakers left, can it be saved?",
    gradeBand: "9–12",
    level: 8,
    skillTargets: ["suffixes-derivational-2", "prefixes-2"],
    text: `Roughly half of the world's languages may disappear within this century. Many now have only a few elderly speakers, and once they are gone, an entire way of describing the world goes with them.

A language is not merely a list of words. It carries history, humor, and knowledge about local plants and animals that exists nowhere else. Communities are fighting back by recording their elders, translating stories, and building apps so a new generation can interact with a language that is rightfully theirs.`,
    targetWords: ["disappear", "entire", "describing", "translating", "generation", "interact"],
    vocabulary: [
      { word: "elder", definition: "An older, respected member of a community." },
      { word: "generation", definition: "All the people born around the same time." },
    ],
    questions: [
      { id: "q1", prompt: "Why is losing a language more than losing words?", type: "inferential", answer: "Languages hold history, humor, and unique knowledge that vanish with them." },
      { id: "q2", prompt: "What are communities doing to save their languages?", type: "literal", answer: "Recording elders, translating stories, and building apps for younger people." },
    ],
  },
];

function countWords(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export const LIBRARY: Passage[] = RAW.map((p) => ({
  ...p,
  wordCount: countWords(p.text),
  source: "library" as const,
}));
