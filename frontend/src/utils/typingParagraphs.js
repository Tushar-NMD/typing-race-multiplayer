const wordPools = {
  english: "the be to of and a in that have i it for not on with he as you do at this but his by from they we say her she or an will my one all would there their what so up out if about who get which go me when make can like time no just him know take people into year your good some could them see other than then now look only come its over think also back after use two how our work first well way even new want because any these give day most us".split(" "),
  spanish: "el la de que y en un ser a por con no una su para es como tener le lo todo pero más hacer o poder decir este ir otro ese la si me ya ver porque dar cuando él muy sin vez mucho saber qué sobre mi alguno mismo yo también hasta hay donde quien desde todo nos ni entre gente día esto bien poco cosas año dos parte".split(" "),
  french: "le la les de et un une en être pour à dans ce qui avoir ne sur pas plus ou se avec par mais il on comme tout faire son pouvoir dire aller y voir bien où sans eux mon nouveau moins quand comment dire monsieur".split(" "),
  german: "der die das und in den von zu dem für mit auf des sich als nicht nach an es ein auch bei um noch wie aus oder über vor aber dann schon hier so was sein haben werden können sagen machen tun lassen geben sehen".split(" ")
};

export const getRandomParagraph = (language = 'english', duration = 60) => {
  const pool = wordPools[language.toLowerCase()] || wordPools.english;
  // Assume a fast typist types at 120 WPM = 2 words per second
  const wordCount = Math.max(10, Math.ceil(duration * 2));
  
  let result = [];
  for (let i = 0; i < wordCount; i++) {
    const randomWord = pool[Math.floor(Math.random() * pool.length)];
    result.push(randomWord);
  }
  
  // Capitalize first word and add period at end for some basic formatting
  const text = result.join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1) + '.';
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
