import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Volume2, VolumeX, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type Language = 'en' | 'pcm' | 'yo' | 'ha' | 'ig';

interface VoiceNarrationProps {
  text: string;
  className?: string;
}

const languageLabels: Record<Language, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  pcm: { name: 'Pidgin', nativeName: 'Naija Pidgin' },
  yo: { name: 'Yoruba', nativeName: 'Yorùbá' },
  ha: { name: 'Hausa', nativeName: 'Hausa' },
  ig: { name: 'Igbo', nativeName: 'Igbo' },
};

// Translations for the narration content
const translations: Record<Language, Record<string, string>> = {
  en: {
    salary: 'Salary or wages is regular employment income paid by an employer. This is treated as taxable income under PAYE regulations. PAYE tax applies with progressive rates, and your employer must withhold and remit the tax monthly.',
    business: 'Business income comes from your business activities or self-employment. Company Income Tax of 30% applies for companies. You must file self-assessment and maintain proper records. Quarterly filings may be needed.',
    gift: 'Family support or gifts are financial assistance from family members with no expectation of repayment. Generally, these are not taxable if they are genuine gifts. Keep records of the donor for large amounts.',
    loan: 'A loan is borrowed funds that must be repaid. It is not taxable income since it creates a repayment obligation. Interest paid may be deductible. Keep your loan agreement as proof.',
    reimbursement: 'Reimbursement is repayment of expenses you paid on behalf of another party like your employer. Not taxable if properly documented with receipts.',
    allowance: 'Allowances and bonuses are additional compensation beyond regular salary. Usually taxable as employment income with PAYE withholding.',
    miscellaneous: 'Miscellaneous transactions need additional clarification. Tax treatment depends on the true nature of the transaction. Proper documentation is essential.',
  },
  pcm: {
    salary: 'Salary na di money wey your oga dey pay you every month for work. Dem go remove tax from am based on how much you dey collect. Your company suppose remove di tax and pay am to government.',
    business: 'Business money na di profit wey you dey make from your business or self-employment. Company go pay 30% tax. You go need to file your tax yourself and keep proper records.',
    gift: 'Gift from family na when your people give you money without expecting you to pay back. Normal normal, you no go pay tax for am if na real gift. Just keep record of who give you.',
    loan: 'Loan na money wey you borrow and go pay back. You no go pay tax for am because na debt. Di interest wey you dey pay fit reduce your tax small.',
    reimbursement: 'Reimbursement na when dem pay you back money wey you spend for company matter. You no go pay tax for am if you get receipt.',
    allowance: 'Allowance and bonus na extra money wey company dey add to your salary. Dem go remove tax from am join your salary.',
    miscellaneous: 'Other transactions need more explanation. Di tax go depend on wetin di money really be. Make sure you get proper documents.',
  },
  yo: {
    salary: 'Owó ọ̀sọ̀ọ̀sù ni owó tí agbanisísé rẹ ń san fún ọ ní gbogbo oṣù. Wọ́n máa yọ òwò tax kúrò níbẹ̀. Ilé iṣẹ́ rẹ ni yóò san tax náà fún ìjọba.',
    business: 'Owó iṣẹ́ ọwọ́ ni owó tí o ń jẹ́ láti ọ̀dọ̀ iṣẹ́ tirẹ. Àwọn ilé-iṣẹ́ yóò san 30% tax. O gbọ́dọ̀ máa kọ àkọsílẹ̀ tax rẹ pàtó.',
    gift: 'Ẹ̀bùn láti ọ̀dọ̀ ẹbí ni owó tí àwọn ènìyàn rẹ fún ọ láìrò pé kí o san padà. Kò sí tax fún rẹ̀ tí ó bá jẹ́ ẹ̀bùn tòótọ́.',
    loan: 'Awin ni owó tí o yá tí o sì gbọdọ̀ san padà. Kò sí tax fún rẹ̀ nítorí pé ó jẹ́ gbèsè. Interest tí o ń san lè dín tax rẹ kù.',
    reimbursement: 'Àpamọ́ owó ni nígbà tí wọ́n san owó padà fún ọ tí o ti ná fún ilé-iṣẹ́. Kò sí tax fún rẹ̀ tí o bá ní receipt.',
    allowance: 'Ìfikún àti bonus jẹ́ owó àfikún sí owó ọ̀sọ̀ọ̀sù. Wọ́n máa yọ tax kúrò níbẹ̀.',
    miscellaneous: 'Àwọn idùpọ̀ mìíràn nílò àlàyé síwájú sí i. Tax yóò dá lórí irú owó náà.',
  },
  ha: {
    salary: 'Albashi shine kudin da mai aiki yake biyan ka kowane wata. Za a cire haraji daga ciki. Kamfaninka zai biya harajin ga gwamnati.',
    business: 'Kudin kasuwanci shine ribar da kake samu daga kasuwancinka. Kamfanoni za su biya 30% haraji. Kana buƙatar fayil ɗin harajinka da kuma kiyaye bayanan daidai.',
    gift: 'Kyautar iyali ita ce kudin da dangin ka suka ba ka ba tare da suna tsammani za ka mayar ba. Ba a biya haraji a kan kyauta ta gaske ba.',
    loan: 'Bashi shine kudin da ka aro wanda dole ne ka biya. Ba a biya haraji a kai ba saboda bashi ne. Riba da kake biya na iya rage harajinka.',
    reimbursement: 'Mayar da kuɗi shine lokacin da suka biya maka kudin da ka kashe domin kamfani. Ba a biya haraji idan kana da risiti.',
    allowance: 'Ƙarin kuɗi da bonus sun zama ƙarin kuɗi a kan albashi. Za a cire haraji daga ciki.',
    miscellaneous: 'Sauran ma\'amaloli suna buƙatar ƙarin bayani. Harajin zai dogara da ainihin kuɗin.',
  },
  ig: {
    salary: 'Ego ọnwa bụ ego nke onye gị n\'arụ ọrụ na-akwụ gị kwa ọnwa. Ha ga-ewepụ ụtụ isi site na ya. Ụlọ ọrụ gị ga-akwụ ụtụ isi ahụ nye gọọmentị.',
    business: 'Ego azụmahịa bụ uru ị na-enweta site na azụmahịa gị. Ụlọ ọrụ ga-akwụ 30% ụtụ isi. Ị ga-akwụ ụtụ isi gị n\'onwe gị ma debe ndekọ nke ọma.',
    gift: 'Onyinye sitere n\'ezinụlọ bụ ego ndị ezinụlọ gị nyere gị na-atụghị anya na ị ga-akwụghachi. A naghị akwụ ụtụ isi ma ọ bụrụ onyinye n\'ezie.',
    loan: 'Ịgbazinye ego bụ ego ị gbazinyere nke ị ga-akwụghachi. A naghị akwụ ụtụ isi n\'ihi na ọ bụ ụgwọ. Ọmụrụ ị na-akwụ nwere ike belata ụtụ isi gị.',
    reimbursement: 'Nkwụghachi ego bụ mgbe ha kwụghachiri gị ego ị tụrụ maka ụlọ ọrụ. A naghị akwụ ụtụ isi ma ị nwere nnata.',
    allowance: 'Ego mgbakwunye na bonus bụ ego a na-agbakwunye n\'ego ọnwa. Ha ga-ewepụ ụtụ isi site na ya.',
    miscellaneous: 'Azụmahịa ndị ọzọ chọrọ nkọwa ọzọ. Ụtụ isi ga-adabere n\'ụdị ego ahụ n\'ezie.',
  },
};

export function VoiceNarration({ text, className }: VoiceNarrationProps) {
  const [language, setLanguage] = useState<Language>('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const getTranslatedText = useCallback((originalText: string, lang: Language): string => {
    // Try to find a matching translation key based on content
    const lowerText = originalText.toLowerCase();
    
    if (lowerText.includes('salary') || lowerText.includes('wages')) {
      return translations[lang].salary;
    } else if (lowerText.includes('business') || lowerText.includes('self-employment')) {
      return translations[lang].business;
    } else if (lowerText.includes('gift') || lowerText.includes('family support')) {
      return translations[lang].gift;
    } else if (lowerText.includes('loan') || lowerText.includes('borrowed')) {
      return translations[lang].loan;
    } else if (lowerText.includes('reimbursement')) {
      return translations[lang].reimbursement;
    } else if (lowerText.includes('allowance') || lowerText.includes('bonus')) {
      return translations[lang].allowance;
    } else if (lowerText.includes('miscellaneous')) {
      return translations[lang].miscellaneous;
    }
    
    // Default to original text for English, or show message for other languages
    if (lang === 'en') {
      return originalText;
    }
    return translations[lang].miscellaneous;
  }, []);
  
  const handleSpeak = useCallback(() => {
    if (!('speechSynthesis' in window)) {
      toast({
        title: 'Not Supported',
        description: 'Voice narration is not supported in your browser.',
        variant: 'destructive',
      });
      return;
    }
    
    // Stop any current speech
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    
    setIsLoading(true);
    
    const textToSpeak = getTranslatedText(text, language);
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    
    // Map language codes to speech synthesis language codes
    const langMap: Record<Language, string> = {
      en: 'en-NG', // Nigerian English
      pcm: 'en-NG', // Use Nigerian English for Pidgin
      yo: 'yo-NG', // Yoruba
      ha: 'ha-NG', // Hausa  
      ig: 'ig-NG', // Igbo
    };
    
    utterance.lang = langMap[language];
    utterance.rate = 0.9;
    utterance.pitch = 1;
    
    utterance.onstart = () => {
      setIsLoading(false);
      setIsSpeaking(true);
    };
    
    utterance.onend = () => {
      setIsSpeaking(false);
    };
    
    utterance.onerror = (event) => {
      setIsLoading(false);
      setIsSpeaking(false);
      
      // Check if there's a voice available
      if (event.error === 'not-allowed') {
        toast({
          title: 'Permission Required',
          description: 'Please allow audio playback to use voice narration.',
          variant: 'destructive',
        });
      } else {
        // Fall back to English if the language isn't supported
        const fallbackUtterance = new SpeechSynthesisUtterance(textToSpeak);
        fallbackUtterance.lang = 'en-US';
        fallbackUtterance.rate = 0.9;
        
        fallbackUtterance.onstart = () => setIsSpeaking(true);
        fallbackUtterance.onend = () => setIsSpeaking(false);
        
        window.speechSynthesis.speak(fallbackUtterance);
      }
    };
    
    window.speechSynthesis.speak(utterance);
  }, [text, language, isSpeaking, getTranslatedText, toast]);
  
  const handleStop = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsLoading(false);
  }, []);
  
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
        <SelectTrigger className="w-[140px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {Object.entries(languageLabels).map(([code, { name, nativeName }]) => (
            <SelectItem key={code} value={code}>
              <span className="flex items-center gap-2">
                <span>{nativeName}</span>
                {code !== 'en' && (
                  <span className="text-xs text-muted-foreground">({name})</span>
                )}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      
      <Button
        variant={isSpeaking ? 'destructive' : 'default'}
        size="sm"
        onClick={isSpeaking ? handleStop : handleSpeak}
        disabled={isLoading}
        className="gap-2"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading...
          </>
        ) : isSpeaking ? (
          <>
            <VolumeX className="h-4 w-4" />
            Stop
          </>
        ) : (
          <>
            <Volume2 className="h-4 w-4" />
            Listen
          </>
        )}
      </Button>
    </div>
  );
}
