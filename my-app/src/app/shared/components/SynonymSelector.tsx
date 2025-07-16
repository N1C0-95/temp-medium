
import { useGptGenerateSynonymsOfWord } from '@/app/hooks/useGptModel';

import {
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
} from '@fluentui/react-components';
import { makeStyles, tokens } from '@fluentui/react-components';
import { useEffect, useMemo, useState } from 'react';
import { Spinner } from './core/Spinner';

const useStyles = makeStyles({
  word: {
    cursor: 'pointer',
    borderRadius: tokens.borderRadiusSmall,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground1Hover,
      boxShadow: `0 0 0 4px ${tokens.colorNeutralBackground1Hover}`,
    },
  },
});



export type SynonymSelectorProps = {
  sentence: string;
  onSynonymSelected?: (word: string, index: number, synonym: string) => void;
};

type Token = {
  text: string;
  isWord: boolean;
};

export default function SynonymSelector(props: SynonymSelectorProps) { 

  const { sentence } = props;
  const styles = useStyles();

 // State to manage synonyms and active word index
  const [synonyms, setSynonyms] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const [selectedWord, setSelectedWord] = useState<string | null>(null);
const [selectedWordIndex, setSelectedWordIndex] = useState<number | null>(null);





  // =======================
  // Tokenization Logic
  // =======================
  const tokens: Token[] = useMemo(() => {
    
    const regex = /[\p{L}\p{N}][\p{L}\p{N}'-]*|[^\s\p{L}\p{N}]|\s+/gu;
    const matches = sentence.match(regex) || [];

    const wordRegex = new RegExp('^\\p{L}', 'u');

    return matches.map((part) => ({
      text: part,
      isWord: wordRegex.test(part.trim()),
    }));
  }, [sentence]);

// =======================
  // Synonym Generation Logic
  // =======================

  
const { data: gptSynonyms, isLoading, error } = useGptGenerateSynonymsOfWord(
  sentence,
  selectedWord ?? "",
  selectedWordIndex ?? 0,
  5,
  { enabled: !!selectedWord   }
);

useEffect(() => {
  setSynonyms([]);
  setActiveIndex(null);
  setSelectedWord(null);
  setSelectedWordIndex(null);
}, [sentence]);

useEffect(() => {
  setSynonyms(gptSynonyms?.suggestions || []);
}, [gptSynonyms]);

  const handleWordClick = async (
    word: string,
    wordIndex: number,
    target: HTMLElement
  ) => {
    setSelectedWord(word);
    setSelectedWordIndex(wordIndex);
    setActiveIndex(wordIndex);
  };
  
  return (
    <div className="overflow-y-auto"style={{ display: 'inline', wordWrap: 'break-word' }}>
      
      {tokens.map((token, i) => {
        if (token.isWord) {
          const wordIndex = tokens.slice(0, i).filter((t) => t.isWord).length;
          return (            
            
            <Menu>
              <MenuTrigger>
                <span
                  key={i}
                  role="button"
                  tabIndex={0}
                  onClick={(e) =>
                    handleWordClick(token.text, wordIndex, e.currentTarget)
                  }
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleWordClick(token.text, wordIndex, e.currentTarget);
                    }
                  }}
                  className={styles.word}
                >
                  {token.text}
                </span>
              </MenuTrigger>
              <MenuPopover>
                {isLoading && <Spinner />}
                {!isLoading &&
                <MenuList>
                  {synonyms.length > 0 ? (
                    synonyms.map((syn, i) => (
                      <MenuItem key={i}
                        onClick={() => {
                          if (props.onSynonymSelected) {
                            props.onSynonymSelected(selectedWord ?? "", i, syn);
                          }
                        }}
                      >
                        {syn}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem disabled>No synonyms</MenuItem>
                  )}
                </MenuList>
                }
              </MenuPopover>
            </Menu>
          );
        } else {
          return <span key={i}>{token.text}</span>;
        }
      })}
    </div>
    
  );
}