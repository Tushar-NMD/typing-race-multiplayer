// Collection of typing paragraphs for multiplayer games
export const typingParagraphs = {
  easy: [
    "The sun sets over the calm ocean. Birds fly across the sky. People walk along the beach. Children play in the sand.",
    "Cats sleep on warm windowsills. Dogs run in the park. Fish swim in the pond. Rabbits hop through the garden.",
    "Books sit on wooden shelves. Pens rest on the desk. Papers stack in neat piles. Lamps light up the room.",
  ],
  medium: [
    "Technology has transformed the way we communicate with each other. Social media platforms connect millions of people worldwide. Information travels faster than ever before in human history.",
    "The ancient library contained countless volumes of wisdom and knowledge. Scholars traveled from distant lands to study the manuscripts. Each book held secrets waiting to be discovered by curious minds.",
    "Mountain climbers prepare carefully for their challenging expeditions. They check their equipment and study weather patterns. Success requires determination, skill, and respect for nature's power.",
  ],
  hard: [
    "Quantum mechanics fundamentally challenges our intuitive understanding of reality. Subatomic particles exhibit wave-particle duality, existing in superposition states until observed. The uncertainty principle suggests that certain pairs of physical properties cannot be simultaneously known with arbitrary precision.",
    "Artificial intelligence algorithms process vast datasets to identify complex patterns and correlations. Machine learning models continuously refine their predictions through iterative training cycles. Neural networks attempt to replicate the interconnected architecture of biological brains.",
    "Cryptocurrency blockchain technology utilizes cryptographic hashing and distributed consensus mechanisms. Decentralized networks validate transactions without centralized authority or intermediaries. Mining operations solve computationally intensive mathematical problems to secure the ledger.",
  ]
};

export const getRandomParagraph = (difficulty = 'medium') => {
  const paragraphs = typingParagraphs[difficulty] || typingParagraphs.medium;
  return paragraphs[Math.floor(Math.random() * paragraphs.length)];
};

export const calculateWPM = (characters, seconds) => {
  if (seconds === 0) return 0;
  const words = characters / 5; // Standard: 5 characters = 1 word
  const minutes = seconds / 60;
  return Math.round(words / minutes);
};

export const calculateAccuracy = (correct, total) => {
  if (total === 0) return 100;
  return Math.round((correct / total) * 100);
};
