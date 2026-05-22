const EN_WORDS = [
  "the","be","to","of","and","a","in","that","have","i","it","for","not","on",
  "with","he","as","you","do","at","this","but","his","by","from","they","we",
  "say","her","she","or","an","will","my","one","all","would","there","their",
  "what","so","up","out","if","about","who","get","which","go","me","when","make",
  "can","like","time","no","just","him","know","take","people","into","year",
  "your","good","some","could","them","see","other","than","then","now","look",
  "only","come","its","over","think","also","back","after","use","two","how",
  "our","work","first","well","way","even","new","want","because","any","these",
  "give","day","most","us","great","between","need","large","often","hand","high",
  "place","hold","true","power","learn","change","light","move","toward","point",
  "live","right","turn","might","start","close","night","real","begin","life",
  "walk","river","earth","start","every","under","story","never","last","door",
  "between","city","tree","cross","should","country","world","school","still",
  "every","each","begin","help","much","before","line","right","house","place",
  "long","old","find","head","down","been","call","made","after","water","where",
  "same","another","while","part","may","thing","those","keep","through","child",
  "eye","thought","city","run","man","did","family","girl","left","late","above",
  "study","better","number","paper","young","soon","letter","group","carry",
  "travel","simple","cover","table","plant","often","build","answer","class",
  "stand","letter","money","music","person","read","food","story","sometimes",
  "near","far","hard","ask","try","kind","few","play","small","end","put","home",
  "read","hand","port","large","spell","add","follow","picture","sentence",
  "move","self","own","page","should","country","found","answer","thought",
  "school","grow","study","still","learn","plant","cover","often","earth",
  "father","until","light","against","body","second","later","river","group",
  "carry","begin","system","stand","table","nothing","probably","enough",
  "almost","together","during","change","again","animals","morning","outside",
  "problem","million","surface","produce","building","special","everything",
  "thought","company","already","though","through","different","important",
  "beautiful","remember","something","anything","nothing","everything",
  "understand","together","possible","particular","another","different",
  "following",
];

const EN_QUOTES = [
  "The only way to do great work is to love what you do.",
  "In the middle of difficulty lies opportunity.",
  "Life is what happens when you are busy making other plans.",
  "The greatest glory in living lies not in never falling but in rising every time we fall.",
  "The way to get started is to quit talking and begin doing.",
  "Your time is limited so do not waste it living someone else's life.",
  "If life were predictable it would cease to be life and be without flavor.",
  "In the end it is not the years in your life that count but the life in your years.",
  "Life is really simple but we insist on making it complicated.",
  "The purpose of our lives is to be happy.",
  "You miss one hundred percent of the shots you do not take.",
  "Whether you think you can or you think you cannot you are right.",
  "The best time to plant a tree was twenty years ago. The second best time is now.",
  "It does not matter how slowly you go as long as you do not stop.",
  "Everything you have ever wanted is on the other side of fear.",
  "The mind is everything. What you think you become.",
  "Strive not to be a success but rather to be of value.",
  "I have not failed. I have just found ten thousand ways that will not work.",
  "The only impossible journey is the one you never begin.",
  "What we achieve inwardly will change outer reality.",
  "It is during our darkest moments that we must focus to see the light.",
  "Whoever is happy will make others happy too.",
  "Do not go where the path may lead. Go instead where there is no path and leave a trail.",
  "Spread love everywhere you go. Let no one ever come to you without leaving happier.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Tell me and I forget. Teach me and I remember. Involve me and I learn.",
  "It is always the simple that produces the marvelous.",
  "The only limit to our realization of tomorrow will be our doubts of today.",
  "We may encounter defeats but we must not be defeated.",
  "The best and most beautiful things in the world cannot be seen or even touched. They must be felt with the heart.",
];

export interface WordList {
  name: string;
  words: string[];
}

export function loadWordList(name: string): Promise<WordList> {
  if (name === "en") {
    return Promise.resolve({ name: "en", words: [...EN_WORDS] });
  }
  return Promise.reject(new Error(`word list "${name}" not found`));
}

export function sampleWords(words: string[], n: number): string[] {
  const result: string[] = [];
  for (let i = 0; i < n; i++) {
    let w = words[Math.floor(Math.random() * words.length)];
    if (result.length > 0) {
      while (w === result[result.length - 1]) {
        w = words[Math.floor(Math.random() * words.length)];
      }
    }
    result.push(w);
  }
  return result;
}