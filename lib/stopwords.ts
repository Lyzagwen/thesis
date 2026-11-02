// English + common Filipino stopwords (BSCS theses often mix both languages).
export const STOPWORDS = new Set<string>([
  // ---- English ----
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any",
  "are", "aren't", "as", "at", "be", "because", "been", "before", "being", "below",
  "between", "both", "but", "by", "can", "can't", "cannot", "could", "couldn't", "did",
  "didn't", "do", "does", "doesn't", "doing", "don't", "down", "during", "each", "few",
  "for", "from", "further", "had", "hadn't", "has", "hasn't", "have", "haven't", "having",
  "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself", "him",
  "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into",
  "is", "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't",
  "my", "myself", "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other",
  "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "shan't", "she",
  "she'd", "she'll", "she's", "should", "shouldn't", "so", "some", "such", "than", "that",
  "that's", "the", "their", "theirs", "them", "themselves", "then", "there", "there's",
  "these", "they", "they'd", "they'll", "they're", "they've", "this", "those", "through",
  "to", "too", "under", "until", "up", "very", "was", "wasn't", "we", "we'd", "we'll",
  "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
  "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't",
  "would", "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours",
  "yourself", "yourselves", "study", "studies", "research", "researchers", "aims",
  "aimed", "aim", "paper", "papers", "thesis", "project", "development", "develop",
  "developing", "implement", "implementation", "implementing", "design", "designing",
  "designed", "system", "systems", "using", "use", "used", "based", "proposed", "propose",
  "will", "also", "may", "might", "within", "without", "among", "however", "therefore",
  "thus", "can", "well", "one", "two", "many", "much", "new", "via", "per", "etc", "e.g",
  "i.e", "particularly", "specifically", "generally", "overall", "result", "results",
  "resulted", "found", "showed", "shown", "show", "included", "including", "include",
  "performed", "performance", "conducted", "carried", "assess", "assessing", "evaluate",
  "evaluated", "evaluation", "comparative", "comparison", "compared", "online", "applications",
  "application", "make", "made", "help", "helps", "provide", "provides", "provided",
  "additional", "current", "various", "several", "different", "main", "major", "across",
  "along", "around", "since", "still", "may", "must", "etc", "namely",
  // ---- Filipino ----
  "ang", "mga", "ng", "sa", "nga", "ay", "ito", "iyon", "at", "para", "o", "kay",
  "ko", "mo", "niya", "kami", "kayo", "sila", "akin", "amin", "inyo", "kanila", "nito",
  "niyan", "roon", "doon", "dito", "hindi", "oo", "hindi", "wala", "meron", "mayroon",
  "lamang", "lang", "pa", "na", "din", "rin", "naman", "kung", "kapag", "kasi", "dahil",
  "upang", "ngunit", "subalit", "gayunpaman", "kaya", "bawat", "lahat", "ilang", "marami",
  "iyong", "aking", "aming", "kanilang", "pamagat", "layunin", "pag-aaral", "pananaliksik",
  "gumawa", "ginawa", "ginagamit", "gamit", "maging", "magkaroon", "magbigay", "tulong",
]);

export function isStopword(word: string): boolean {
  return STOPWORDS.has(word);
}
