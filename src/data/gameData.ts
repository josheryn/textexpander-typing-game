import { GameLevel, Abbreviation } from '../types';

// Define abbreviations that can be unlocked
export const abbreviations: Abbreviation[] = [
  {
    id: 'abbr1',
    abbreviation: ';em',
    expansion: 'email@example.com',
    description: 'Quickly insert your email address',
    unlockedAt: 1
  },
  {
    id: 'abbr2',
    abbreviation: ';addr',
    expansion: '123 Main St, Anytown, CA 12345',
    description: 'Insert your full address',
    unlockedAt: 2
  },
  {
    id: 'abbr3',
    abbreviation: ';sig',
    expansion: 'Best regards,\nYour Name\nCompany Inc.',
    description: 'Add your email signature',
    unlockedAt: 3
  },
  {
    id: 'abbr4',
    abbreviation: ';date',
    expansion: new Date().toLocaleDateString(),
    description: 'Insert current date',
    unlockedAt: 4
  },
  {
    id: 'abbr5',
    abbreviation: ';time',
    expansion: new Date().toLocaleTimeString(),
    description: 'Insert current time',
    unlockedAt: 5
  },
  {
    id: 'abbr6',
    abbreviation: ';lorem',
    expansion: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    description: 'Insert Lorem Ipsum text',
    unlockedAt: 6
  },
  {
    id: 'abbr7',
    abbreviation: ';ty',
    expansion: 'Thank you for your message. I appreciate your time and will get back to you as soon as possible.',
    description: 'Thank you response',
    unlockedAt: 7
  },
  {
    id: 'abbr8',
    abbreviation: ';meet',
    expansion: 'I would like to schedule a meeting to discuss this further. Are you available next week?',
    description: 'Request a meeting',
    unlockedAt: 8
  },
  {
    id: 'abbr9',
    abbreviation: ';conf',
    expansion: 'I confirm receipt of your message and will process your request shortly.',
    description: 'Confirmation message',
    unlockedAt: 9
  },
  {
    id: 'abbr10',
    abbreviation: ';te',
    expansion: 'TextExpander helps you communicate smarter, faster, and more consistently.',
    description: 'TextExpander slogan',
    unlockedAt: 10
  }
];

// Define game levels
export const gameLevels: GameLevel[] = [
  {
    id: 1,
    name: 'Beginner',
    description: 'Start your typing journey with simple words and short sentences.',
    text: 'The quick brown fox jumps over the lazy dog. Simple words help you learn to type faster. Practice makes perfect when learning to type.',
    requiredWPM: 20,
    unlockableAbbreviation: abbreviations.find(a => a.unlockedAt === 1)
  },
  {
    id: 2,
    name: 'Basic Sentences',
    description: 'Practice typing complete sentences with common words.',
    text: 'Learning to type quickly is an essential skill in today\'s digital world. Regular practice will help you improve your speed and accuracy. Try to maintain a steady rhythm as you type.',
    requiredWPM: 30,
    unlockableAbbreviation: abbreviations.find(a => a.unlockedAt === 2)
  },
  {
    id: 3,
    name: 'Intermediate',
    description: 'More complex sentences with varied punctuation.',
    text: 'TextExpander allows you to create "snippets" of text that expand into frequently-used phrases, paragraphs, or even images! This saves you time and ensures consistency in your communications. Have you tried using it yet?',
    requiredWPM: 40,
    unlockableAbbreviation: abbreviations.find(a => a.unlockedAt === 3)
  },
  {
    id: 4,
    name: 'Numbers & Symbols',
    description: 'Practice typing numbers, symbols, and special characters.',
    text: 'Your password should include at least 8 characters with 1 uppercase letter, 1 number, and 1 special symbol (like #, @, or !). For example, "Secure123!" would be a decent password for non-critical accounts.',
    requiredWPM: 45,
    unlockableAbbreviation: abbreviations.find(a => a.unlockedAt === 4)
  },
  {
    id: 5,
    name: 'Business Writing',
    description: 'Practice typing professional business communications.',
    text: 'Dear Mr. Johnson, Thank you for your inquiry dated May 15, 2023. We are pleased to provide you with the requested information regarding our services. Please find attached our complete catalog and price list. Should you have any questions, please don\'t hesitate to contact us.',
    requiredWPM: 50,
    unlockableAbbreviation: abbreviations.find(a => a.unlockedAt === 5)
  },
  {
    id: 6,
    name: 'Technical Terms',
    description: 'Challenge yourself with technical vocabulary and terms.',
    text: 'The API documentation specifies that HTTP requests must include an Authorization header with a valid JWT token. The response will be in JSON format with a 200 OK status for successful requests or appropriate error codes (e.g., 401 Unauthorized, 404 Not Found) for failed requests.',
    requiredWPM: 55,
    unlockableAbbreviation: abbreviations.find(a => a.unlockedAt === 6)
  },
  {
    id: 7,
    name: 'Code Snippets',
    description: 'Practice typing programming code and syntax.',
    text: 'function calculateWPM(totalChars, timeInMinutes) {\n  const wordsTyped = totalChars / 5; // Standard: 5 chars = 1 word\n  return Math.round(wordsTyped / timeInMinutes);\n}\n\n// Call the function\nconst wpm = calculateWPM(500, 2);',
    requiredWPM: 60,
    unlockableAbbreviation: abbreviations.find(a => a.unlockedAt === 7)
  },
  {
    id: 8,
    name: 'Advanced Paragraphs',
    description: 'Long paragraphs with complex vocabulary and structure.',
    text: 'TextExpander\'s productivity features extend beyond simple text replacement. The application\'s sophisticated capabilities include fill-in fields for customizable snippets, date and time mathematics, and conditional expansions based on various criteria. Furthermore, it integrates seamlessly with numerous applications across different operating systems, enhancing workflow efficiency regardless of your preferred software environment.',
    requiredWPM: 65,
    unlockableAbbreviation: abbreviations.find(a => a.unlockedAt === 8)
  },
  {
    id: 9,
    name: 'Creative Writing',
    description: 'Expressive text with varied punctuation and dialogue.',
    text: '"Do you believe in coincidences?" she asked, glancing nervously over her shoulder. "Not in our line of work," he replied with a grim smile. "Everything happens for a reason—usually someone else\'s reason." The café buzzed with afternoon chatter, but their corner table remained an island of tension. "Well then," she whispered, sliding a worn envelope across the table, "you\'ll find this particularly... non-coincidental."',
    requiredWPM: 70,
    unlockableAbbreviation: abbreviations.find(a => a.unlockedAt === 9)
  },
  {
    id: 10,
    name: 'Master Level',
    description: 'The ultimate typing challenge with complex text and formatting.',
    text: 'TextExpander revolutionizes how professionals manage their communication workflow. By transforming frequently-used text into easily accessible snippets, it eliminates repetitive typing, reduces errors by 80%, and saves the average user 30+ hours annually. Organizations implementing TextExpander report significant improvements in customer response times (↓42%) and consistency of messaging (↑95%). The ROI becomes evident within just 4-6 weeks of adoption, making it an essential productivity tool for teams across industries—from customer support and sales to technical documentation and healthcare.',
    requiredWPM: 80,
    unlockableAbbreviation: abbreviations.find(a => a.unlockedAt === 10)
  }
];

// Helper function to get a level by ID
export const getLevelById = (id: number): GameLevel | undefined => {
  return gameLevels.find(level => level.id === id);
};

// Helper function to get abbreviation by ID
export const getAbbreviationById = (id: string): Abbreviation | undefined => {
  return abbreviations.find(abbr => abbr.id === id);
};

// Helper function to get abbreviations unlocked at a specific level
export const getAbbreviationsForLevel = (level: number): Abbreviation[] => {
  return abbreviations.filter(abbr => abbr.unlockedAt <= level);
};

// Helper function to modify level text to include references to newly unlocked abbreviations
export const getLevelWithUnlockedAbbreviation = (level: GameLevel, unlockedAbbreviation: Abbreviation | null): GameLevel => {
  if (!unlockedAbbreviation) {
    return level;
  }

  // Only include the abbreviation if it was unlocked in the previous level
  // For example, if current level is 3, only include abbreviation unlocked in level 2
  if (unlockedAbbreviation.unlockedAt !== level.id - 1) {
    return level;
  }

  // Create a modified version of the level text that includes the actual expansion text
  // so users can practice typing it and use the abbreviation to speed up their typing
  const modifiedText = `${level.text} You need to type ${unlockedAbbreviation.expansion} in this text. Try using the ${unlockedAbbreviation.abbreviation} abbreviation to type it more quickly.`;

  return {
    ...level,
    text: modifiedText
  };
};
