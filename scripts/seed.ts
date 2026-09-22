/**
 * Seeds dummy/dev data for the Khoj Dashboard into the khoj_dashboard schema.
 * Run with `npm run seed` (needs .env.local per .env.example, with a
 * SUPABASE_SERVICE_ROLE_KEY that can write to khoj_dashboard).
 */
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { db: { schema: "khoj_dashboard" } }
);

const GRADE_DEFS = [
  { code: "LKG", label: "LKG" },
  { code: "UKG", label: "UKG" },
  ...Array.from({ length: 10 }, (_, i) => ({ code: String(i + 1), label: `Grade ${i + 1}` })),
];

const SUBJECTS = ["Math", "Language", "EVS"];
const FORMATIVE_MONTHS = ["Jun", "Jul", "Aug", "Sep", "Oct"];
const SEL_PARAMETERS = [
  "Self-Awareness",
  "Emotional Regulation",
  "Collaboration",
  "Empathy",
  "Responsible Decision-Making",
];
// The 5 CASEL-style domains from the actual design handoff mockup file
// (SEL Assessment Form.dc.html's DOMAIN_HUE/SR_DOMAIN_BY_PREFIX) — used for
// Observation items, Student Response items, and the SJT competency-map
// chart. Not the same list as SEL_PARAMETERS above (a separate, unrelated
// chart on the SEL & Holistic page).
const SEL_DOMAINS = [
  "Self Awareness",
  "Self Management",
  "Social Awareness",
  "Relationship Skills",
  "Responsible Decision Making",
];

// Verbatim from the mockup's SITUATIONS constant (12 real situations, each
// with a bilingual story + 4 lettered options) — replaces 4 generic
// "Option A/B/C/D" placeholders.
const SJT_SITUATIONS: {
  title: string;
  storyEn: string;
  storyHi: string;
  optionsEn: [string, string, string, string];
  optionsHi: [string, string, string, string];
}[] = [
  {
    title: "Situation 1",
    storyEn:
      "Peter and Rashida have got into a fight. Peter goes to Tarun and tells him how angry he is at Rashida. What should Tarun do to resolve this issue?",
    storyHi:
      "पीटर और रशीदा में झगड़ा हो गया है। पीटर तरुण के पास जाकर बताता है कि वह रशीदा से कितना नाराज़ है। तरुण को इस मुद्दे को सुलझाने के लिए क्या करना चाहिए?",
    optionsEn: [
      "Since Peter came to Tarun first, he should take his side and support him.",
      "Ask and get to know the issue from both Peter and Rashida. And try to help each other understand what the other person feels, to resolve the issue.",
      "Ask and get to know the issue from Peter and Rashida. And take the side of the one Tarun feels is right.",
      "Ask and get to know the issue. Based on this, Tarun should try resolving the issue himself, and also get help from his teachers to better tackle the problem.",
    ],
    optionsHi: [
      "चूँकि पीटर पहले तरुण के पास आया, इसलिए उसे पीटर का पक्ष लेकर उसका समर्थन करना चाहिए।",
      "पीटर और रशीदा दोनों से बात करके मुद्दा समझना चाहिए, और एक-दूसरे को यह समझने में मदद करनी चाहिए कि दूसरा व्यक्ति क्या महसूस करता है।",
      "पीटर और रशीदा से पूछकर मुद्दा जानना चाहिए, और जो तरुण को सही लगे उसका पक्ष लेना चाहिए।",
      "मुद्दा समझने के बाद तरुण को खुद इसे सुलझाने की कोशिश करनी चाहिए, और बेहतर तरीके से निपटने के लिए शिक्षकों से भी मदद लेनी चाहिए।",
    ],
  },
  {
    title: "Situation 2",
    storyEn:
      "Preeti has started calling you a nickname that you do not like. You have asked Preeti to stop, but she laughs and tells you that she is just trying to be funny. How would you overcome this situation?",
    storyHi:
      "प्रीति तुम्हें एक ऐसा उपनाम बुलाने लगी है जो तुम्हें पसंद नहीं। तुमने उससे रुकने को कहा, लेकिन वह हँसकर कहती है कि वह मज़ाक कर रही है। तुम इस स्थिति से कैसे निपटोगे?",
    optionsEn: [
      "You will shout at Preeti whenever she calls you by that name.",
      "You will sit and talk with Preeti to let her know how exactly you feel when you are being called names, and ask her to stop.",
      "You will stop talking to Preeti, and when she calls you by that name again, you reach out to your teacher for help.",
      "You will stop talking to Preeti and completely ignore her, hoping that she would stop it some day.",
    ],
    optionsHi: [
      "जब भी वह यह नाम बुलाए, तुम उस पर चिल्लाओगे।",
      "तुम प्रीति के साथ बैठकर बताओगे कि यह नाम सुनकर तुम्हें कैसा महसूस होता है, और उससे रुकने को कहोगे।",
      "तुम प्रीति से बात करना बंद कर दोगे, और अगर वह फिर से यह नाम बुलाए तो शिक्षक से मदद माँगोगे।",
      "तुम प्रीति से बात करना पूरी तरह बंद कर दोगे और उसे नज़रअंदाज़ करोगे, यह सोचकर कि वह किसी दिन रुक जाएगी।",
    ],
  },
  {
    title: "Situation 3",
    storyEn: "One of your friends, Sameer, is being teased by your classmates for his skin colour. What would you do about this?",
    storyHi: "तुम्हारे दोस्त समीर को क्लास के बच्चे उसके रंग के कारण चिढ़ाते हैं। तुम इस बारे में क्या करोगे?",
    optionsEn: [
      "You feel that Sameer is getting hurt when called names. You will sit and talk to him about it, and comfort him.",
      "You feel that Sameer is getting hurt. You will go to your classmates and ask them to stop calling him names, and help them understand how he would be feeling.",
      "You feel that it is not a big thing, as it is very common among friends to call names among each other, so you will not do anything.",
      "You feel that Sameer is getting hurt. You will sit and talk to him about it to understand how he feels, and ask him if there is anything he would like you to do for him.",
    ],
    optionsHi: [
      "तुम्हें लगता है कि समीर को दुख हो रहा है। तुम उसके पास बैठकर बात करोगे और उसे दिलासा दोगे।",
      "तुम्हें लगता है कि समीर को दुख हो रहा है। तुम अपने सहपाठियों के पास जाकर उन्हें रुकने के लिए कहोगे, और समझाओगे कि इससे समीर को कैसा महसूस होता है।",
      "तुम्हें लगता है कि यह कोई बड़ी बात नहीं, दोस्तों में ऐसा मज़ाक चलता रहता है, इसलिए तुम कुछ नहीं करोगे।",
      "तुम्हें लगता है कि समीर को दुख हो रहा है। तुम उससे बैठकर बात करोगे, उसकी भावनाएँ समझोगे, और पूछोगे कि क्या तुम उसके लिए कुछ कर सकते हो।",
    ],
  },
  {
    title: "Situation 4",
    storyEn:
      "For annual day at school, Dheeraj has been given the responsibility to schedule performances. He has made a schedule, but 3 groups have now asked him to schedule their performance first. What should Dheeraj do?",
    storyHi:
      "स्कूल के वार्षिक दिवस के लिए धीरज को प्रदर्शन शेड्यूल करने की ज़िम्मेदारी दी गई है। उसने एक शेड्यूल बनाया है, लेकिन 3 समूहों ने अपना प्रदर्शन पहले रखने के लिए कहा है। धीरज को क्या करना चाहिए?",
    optionsEn: [
      "Dheeraj should give the first slot to his closest friend.",
      "So that no one is angry with Dheeraj, he should make number chits and ask every group to pull one, and schedule performances according to the chits.",
      "Dheeraj should understand from each group why they want to go first, present what he thinks would be a good line-up, and then discuss with everyone to reach a consensus.",
      "Dheeraj has already made a schedule, so he should explain to all that making changes will take a lot of time, and everyone should just stick to his plan.",
    ],
    optionsHi: [
      "धीरज को पहला स्थान अपने सबसे करीबी दोस्त को देना चाहिए।",
      "कोई भी धीरज से नाराज़ न हो, इसलिए उसे नंबर की चिट बनाकर हर समूह से एक निकालने के लिए कहना चाहिए, और चिट के अनुसार प्रदर्शन तय करना चाहिए।",
      "धीरज को हर समूह से समझना चाहिए कि वे पहले क्यों जाना चाहते हैं, अपनी राय भी बताना चाहिए, और सबके साथ चर्चा करके एक सहमति पर पहुँचना चाहिए।",
      "धीरज ने पहले से ही शेड्यूल बना लिया है, इसलिए उसे सबको समझाना चाहिए कि बदलाव करने में बहुत समय लगेगा, और सबको उसकी बनाई योजना पर ही टिके रहना चाहिए।",
    ],
  },
  {
    title: "Situation 5",
    storyEn:
      "One day Ankit comes and tells his friend Sara that he wants to wear nail polish, and asks if she could put it on for him. Sara is feeling confused. What should she do?",
    storyHi: "एक दिन अंकित अपनी दोस्त सारा से पूछता है कि क्या वह उसके नाखूनों पर नेल पॉलिश लगा देगी। सारा थोड़ी असमंजस में है। उसे क्या करना चाहिए?",
    optionsEn: [
      "While this is not usual, this will make her friend happy. Sara should say yes and do it.",
      "Society expects boys and girls to act and dress a certain way, so Sara could feel confused. But it doesn't actually matter — she should simply ask her friend what colour he wants.",
      "This is absurd, and everyone will laugh at Ankit and also at her for this. She should advise Ankit not to think about this, and say no.",
      "Ankit can get bullied, so this is a tricky situation. She should put the nail polish, but also tell Ankit that if he gets bullied, he should ask for help, and that she will be there for him.",
    ],
    optionsHi: [
      "यह सामान्य नहीं है, लेकिन इससे उसके दोस्त को खुशी मिलेगी। सारा को हाँ कहकर लगा देना चाहिए।",
      "समाज लड़कों और लड़कियों से एक तय तरीके से रहने की उम्मीद करता है, इसलिए सारा को असमंजस महसूस हो सकता है। लेकिन इससे कोई फ़र्क नहीं पड़ता। उसे सिर्फ़ अंकित से पूछना चाहिए कि उसे कौन सा रंग चाहिए।",
      "यह अजीब बात है और सब अंकित पर और सारा पर भी हँसेंगे। उसे अंकित को समझाना चाहिए कि ऐसा न सोचे, और मना कर देना चाहिए।",
      "अंकित को तंग किया जा सकता है, इसलिए यह उलझा हुआ मामला है। सारा को नेल पॉलिश लगा देनी चाहिए, लेकिन अंकित को यह भी बताना चाहिए कि अगर कोई उसे तंग करे तो मदद माँगे, और वह भी उसके साथ रहेगी।",
    ],
  },
  {
    title: "Situation 6",
    storyEn:
      "Salma and Ayushi go to school cycling together every day. One day Ayushi fell from the cycle and scraped her knee. Salma thought it was funny and laughed, but Ayushi was hurt by this. From the next day onwards, Ayushi stops coming with her. What should Salma do about it?",
    storyHi:
      "सलमा और आयुषी रोज़ साथ साइकिल से स्कूल जाती हैं। एक दिन आयुषी साइकिल से गिर गई और उसके घुटने में चोट लग गई। सलमा को यह मज़ाकिया लगा और वह हँस पड़ी, लेकिन आयुषी को इससे दुख हुआ। अगले दिन से आयुषी उसके साथ आना बंद कर देती है। सलमा को क्या करना चाहिए?",
    optionsEn: [
      "These things happen all the time. Since Ayushi didn't say anything to Salma, Salma doesn't need to ask or do anything.",
      "This is silly. Salma should simply tell Ayushi to start coming back to school with her, and help her till her wound is better.",
      "This is terrible. Salma should reach out to Ayushi immediately, understand what happened, apologize, and help her till her wound is healed.",
      "This is too small a reason for Ayushi to stop coming with her, so Salma should just find new friends who can take jokes.",
    ],
    optionsHi: [
      "ऐसी बातें होती रहती हैं। चूँकि आयुषी ने कुछ कहा नहीं, इसलिए सलमा को कुछ पूछने या करने की ज़रूरत नहीं है।",
      "यह छोटी बात है। सलमा को सीधे आयुषी से कहना चाहिए कि वह फिर से साथ आए, और उसकी चोट ठीक होने तक मदद करनी चाहिए।",
      "यह गंभीर बात है। सलमा को तुरंत आयुषी से बात करनी चाहिए, समझना चाहिए कि क्या हुआ, माफ़ी माँगनी चाहिए, और उसकी चोट ठीक होने तक मदद करनी चाहिए।",
      "आयुषी का साथ छोड़ना बहुत छोटी बात है, इसलिए सलमा को नए दोस्त ढूँढ लेने चाहिए जो मज़ाक सह सकें।",
    ],
  },
  {
    title: "Situation 7",
    storyEn:
      "Arbaaz and his friends have a cricket tournament to play after school. Only after reaching home did he remember he had a lot of homework left, and he will be tired to complete it if he goes to play. What should Arbaaz do?",
    storyHi:
      "अरबाज़ और उसके दोस्तों को स्कूल के बाद क्रिकेट टूर्नामेंट खेलना है। घर पहुँचने पर उसे याद आया कि उसका बहुत सारा होमवर्क बाकी है, और खेलने जाने पर वह उसे पूरा करते-करते थक जाएगा। अरबाज़ को क्या करना चाहिए?",
    optionsEn: [
      "Arbaaz should skip the homework and go to play. He can complete it at night or the next day at school.",
      "Since Arbaaz loves playing, he should go and play the match, make some excuse, and return early to finish his homework.",
      "Arbaaz should tell his friends that he won't be able to come and play since he has homework to complete. Then finish it immediately and enjoy free time at home.",
      "Arbaaz should inform his friends and find a substitute for the match, and finish his homework in time.",
    ],
    optionsHi: [
      "अरबाज़ को होमवर्क छोड़कर खेलने जाना चाहिए। वह इसे रात में या अगले दिन स्कूल में पूरा कर सकता है।",
      "चूँकि अरबाज़ को खेलना पसंद है, उसे मैच खेलने जाना चाहिए, कोई बहाना बनाकर जल्दी लौटना चाहिए और होमवर्क पूरा करना चाहिए।",
      "अरबाज़ को दोस्तों को बताना चाहिए कि वह होमवर्क की वजह से नहीं आ पाएगा। फिर उसे तुरंत पूरा करके घर पर खाली समय का आनंद लेना चाहिए।",
      "अरबाज़ को दोस्तों को बताकर मैच के लिए किसी और को ढूँढने में मदद करनी चाहिए, और समय पर अपना होमवर्क पूरा करना चाहिए।",
    ],
  },
  {
    title: "Situation 8",
    storyEn:
      "Nandini has a lot to study for her exam next week, but her friend has asked to speak to her as she is feeling sad. Nandini knows she won't be able to complete her studies if she talks to her friend. What should Nandini do?",
    storyHi:
      "नंदिनी को अगले हफ्ते परीक्षा के लिए बहुत पढ़ना है, लेकिन उसकी दोस्त उदास है और बात करना चाहती है। नंदिनी जानती है कि दोस्त से बात करने पर वह पढ़ाई पूरी नहीं कर पाएगी। नंदिनी को क्या करना चाहिए?",
    optionsEn: [
      "One can't say no to a friend in distress, so Nandini should talk to the friend and then manage her own studies later.",
      "Exams are more important, so Nandini should ignore her friend and talk to her after exams are over.",
      "Since there are many other things to do as well, like housework and playing, Nandini should tell her friend she cannot talk to her.",
      "Nandini should tell her friend that she cannot talk right now, but should help her find another friend to talk to about it.",
    ],
    optionsHi: [
      "मुसीबत में दोस्त को मना नहीं किया जा सकता, इसलिए नंदिनी को दोस्त से बात करनी चाहिए और बाद में पढ़ाई का इंतज़ाम करना चाहिए।",
      "परीक्षा ज़्यादा महत्वपूर्ण है, इसलिए नंदिनी को दोस्त को नज़रअंदाज़ करना चाहिए और परीक्षा के बाद बात करनी चाहिए।",
      "चूँकि घर का काम, खेलना जैसे और भी काम हैं, नंदिनी को दोस्त को बताना चाहिए कि वह अभी बात नहीं कर सकती।",
      "नंदिनी को दोस्त को बताना चाहिए कि वह अभी बात नहीं कर सकती, लेकिन उसे किसी और दोस्त से बात करने में मदद करनी चाहिए।",
    ],
  },
  {
    title: "Situation 9",
    storyEn:
      "Simran prepares for her Maths exam tomorrow. But when she reaches the exam, she realises that she has a Science exam today, not Maths. What should she do now?",
    storyHi:
      "सिमरन कल के मैथ्स एग्ज़ाम की तैयारी करती है, लेकिन परीक्षा में पहुँचने पर उसे पता चलता है कि आज साइंस का एग्ज़ाम है, मैथ्स का नहीं। उसे अब क्या करना चाहिए?",
    optionsEn: [
      "Simran feels ashamed that anyone else will get to know about this. So she should consider telling the teacher that she feels sick, and try to skip the exam.",
      "Simran will feel very tense. She should accept that mistakes happen to everyone, try to calm herself, and write whatever she knows.",
      "Simran feels ashamed to tell her teacher about this, but will share it with her friends and write whatever she knows.",
      "Simran gets scared; she tells her friends about this. She just skips the exam and returns home, as that is the safest option.",
    ],
    optionsHi: [
      "सिमरन को शर्म आती है कि यह बात किसी और को पता चलेगी। उसे शिक्षक को बताना चाहिए कि वह बीमार है और परीक्षा छोड़ने की कोशिश करनी चाहिए।",
      "सिमरन को बहुत तनाव होगा। उसे स्वीकार करना चाहिए कि गलतियाँ सबसे होती हैं, खुद को शांत करना चाहिए, और जो जानती है वह लिखना चाहिए।",
      "सिमरन को शिक्षक को बताने में शर्म आती है, लेकिन वह दोस्तों को बताएगी और जो जानती है वह लिखेगी।",
      "सिमरन डर जाती है और दोस्तों को बताती है। वह परीक्षा छोड़कर घर लौट जाती है, यह सोचकर कि यही सबसे सुरक्षित है।",
    ],
  },
  {
    title: "Situation 10",
    storyEn:
      "In Aman's neighbourhood, there are some people who are troubling stray animals. Aman's family does not object to this. If this happens again, what should Aman do?",
    storyHi: "अमन के पड़ोस में कुछ लोग आवारा जानवरों को परेशान कर रहे हैं। अमन के परिवार को इस पर कोई आपत्ति नहीं है। अगर ऐसा फिर हो, तो अमन को क्या करना चाहिए?",
    optionsEn: [
      "There is nothing to feel bad about, so Aman doesn't have to do anything.",
      "Even though this is terrible, since Aman's family will not support him, he should not do anything.",
      "Aman should try and protect the animals himself.",
      "Aman should try and organise other people and children in the neighbourhood who love animals, and plan out some awareness and protection activities.",
    ],
    optionsHi: [
      "इसमें बुरा मानने की कोई बात नहीं है, इसलिए अमन को कुछ नहीं करना चाहिए।",
      "यह भयानक है, लेकिन चूँकि अमन का परिवार साथ नहीं देगा, उसे कुछ नहीं करना चाहिए।",
      "अमन को खुद जानवरों की सुरक्षा करने की कोशिश करनी चाहिए।",
      "अमन को पड़ोस के अन्य लोगों और बच्चों को साथ लाकर जागरूकता और सुरक्षा की गतिविधियाँ आयोजित करनी चाहिए।",
    ],
  },
  {
    title: "Situation 11",
    storyEn:
      "Mitali's caregivers have decided to shift to their village. She has been given the option to either stay in the city with people her family knows well, or go to the village. How should Mitali choose what is best for her?",
    storyHi:
      "मिताली के देखभाल करने वालों ने गाँव जाने का फैसला किया है। उसे विकल्प दिया गया है कि वह शहर में उन लोगों के साथ रहे जिन्हें परिवार अच्छी तरह जानता है, या गाँव चली जाए। मिताली को यह कैसे तय करना चाहिए कि उसके लिए सबसे अच्छा क्या है?",
    optionsEn: [
      "There is not much in the village, so Mitali should not think too much and stay back in the city.",
      "Mitali should think about where she can study better, and should consider the decision keeping her caregivers and her friends in mind.",
      "Mitali should go to the village with her caregivers and try to study there.",
      "All of Mitali's friends are here in the city, so she should stay back here.",
    ],
    optionsHi: [
      "गाँव में ज़्यादा कुछ नहीं है, इसलिए मिताली को ज़्यादा न सोचकर शहर में ही रहना चाहिए।",
      "मिताली को सोचना चाहिए कि वह कहाँ बेहतर पढ़ाई कर सकती है, और अपने देखभाल करने वालों और दोस्तों को ध्यान में रखकर फैसला लेना चाहिए।",
      "मिताली को अपने देखभाल करने वालों के साथ गाँव जाना चाहिए और वहाँ पढ़ने की कोशिश करनी चाहिए।",
      "मिताली के सभी दोस्त शहर में हैं, इसलिए उसे यहीं रहना चाहिए।",
    ],
  },
  {
    title: "Situation 12",
    storyEn:
      "Mitali decided to stay back in the city. But she is missing her family, and the government school building she goes to is going to change. She is now thinking if she made the right decision. What should she do now?",
    storyHi:
      "मिताली ने शहर में रहने का फैसला किया, लेकिन उसे परिवार की याद आती है, और उसका सरकारी स्कूल भवन बदलने वाला है। वह सोच रही है कि क्या उसने सही फैसला लिया। उसे अब क्या करना चाहिए?",
    optionsEn: [
      "She should try to calm herself and come back to this thought after the academic year is over.",
      "She should tell her family and shift to the village immediately.",
      "Once you take a decision, you should stick to it, so Mitali should do nothing and continue to stay in the city.",
      "She should tell her family how she feels, and collectively decide what is best for her.",
    ],
    optionsHi: [
      "उसे खुद को शांत करना चाहिए और शैक्षणिक वर्ष खत्म होने के बाद इस बारे में फिर सोचना चाहिए।",
      "उसे परिवार को बताना चाहिए और तुरंत गाँव चले जाना चाहिए।",
      "एक बार फैसला लेने के बाद उस पर टिके रहना चाहिए, इसलिए मिताली को कुछ नहीं करना चाहिए और शहर में ही रहना चाहिए।",
      "उसे परिवार को बताना चाहिए कि उसे कैसा महसूस हो रहा है, और साथ मिलकर तय करना चाहिए कि उसके लिए क्या सबसे अच्छा है।",
    ],
  },
];

// Verbatim from the mockup's ITEMS_K3 constant (LKG-3 Observation items).
const OBSERVATION_ITEMS_K3: { domain: string; title: string; guidance: string | null }[] = [
  { domain: "Self Awareness", title: "Identifies emotions for self in present moment", guidance: "Does the student avoid answering questions related to emotions — running away, changing topic? Is the student struggling to describe emotions during story sessions or FGDs? Does the student struggle to use words for big emotions? How often is the student able to express emotions accurately and without much prompting?" },
  { domain: "Self Awareness", title: "Goals & hopes", guidance: "Does the student demonstrate any activities that show consistent work towards their goals, like saving up for a course? Does the student answer questions about future plans, or answer with options and some confusion, or often say they don't know?" },
  { domain: "Self Awareness", title: "Strengths & areas of improvement", guidance: "Does the student reflect and share about what they were able to do and struggled with, post an activity? Does the student get defensive when pointed out flaws? Does the student shy away and not accept appreciation?" },
  { domain: "Self Management", title: "Work towards goals for self", guidance: "Does the student identify what they need to do to be able to achieve a goal for themself?" },
  { domain: "Self Management", title: "Direct thoughts & feelings", guidance: "Have you observed any incident where the student is angry or in panic, for example? Do they find ways to actively find solutions to calm themselves? Do they ask for help, or do they ignore, lash out, or resist help when offered?" },
  { domain: "Self Management", title: "Prioritise actions", guidance: "During an activity in class, do they manage all the instructions and resources given? Do they plan it and finish on time?" },
  { domain: "Social Awareness", title: "Impact on others", guidance: "Have you observed them apologising after a conflict? Are they able to give examples of interdependence in their daily life and in the larger society, on a macro level, easily?" },
  { domain: "Social Awareness", title: "Understand others' feelings", guidance: "Are they able to articulate how others' (like their friends, family, teachers) affect their own feelings, or have they expressed how you as a facilitator impact their feelings?" },
  { domain: "Social Awareness", title: "Interdependence", guidance: "Can be observed in how they interact with others in the school — e.g. other teachers, social worker, staff — and if they are able to express gratitude for those around them in their ecosystem at school or in the community." },
  { domain: "Relationship Skills", title: "Conflict resolution", guidance: "Have you observed them during a conflict, or heard them share about one?" },
  { domain: "Relationship Skills", title: "Compassionate & fair", guidance: "Can be observed in circle activities — does the student pass the ball / give a chance to their friends, or try to accommodate those who haven't gotten a chance? How do they share resources if they are leading a group work?" },
  { domain: "Relationship Skills", title: "Provide help", guidance: "Can be observed during group work — if they have finished early, do they help out others who are struggling?" },
  { domain: "Responsible Decision Making", title: "Consider all", guidance: "“I want to do ____ and for doing it, ____ may be the responsible decision.”" },
  { domain: "Responsible Decision Making", title: "Information gathering", guidance: "“I can see that I have more than one option and I have to make a choice.”" },
  { domain: "Responsible Decision Making", title: "Alternate thinking & consequences", guidance: "“I ask others questions such as: Why did you do this? What did you think when doing this?”" },
];

// Verbatim from the mockup's ITEMS_G4 constant (Grade 4-10 Observation items).
const OBSERVATION_ITEMS_G4: { domain: string; title: string; guidance: string | null }[] = [
  { domain: "Self Awareness", title: "Emotions", guidance: "Does the student avoid answering questions related to emotions — running away, changing topic? Is the student struggling to describe emotions during story sessions or FGDs? Does the student struggle to use words for big emotions? How often is the student able to express emotions accurately and without much prompting?" },
  { domain: "Self Awareness", title: "Values & context of experiences", guidance: "Does the student answer questions related to values logically? Are the answers reflective of nuance, or is it more black and white (e.g. honest = good)? Does the student simply agree to anything said without applying their mind?" },
  { domain: "Self Awareness", title: "Goals & hopes", guidance: "Does the student demonstrate any activities that show consistent work towards their goals, like saving up for a course? Does the student answer questions about future plans, or answer with options and some confusion, or often say they don't know?" },
  { domain: "Self Awareness", title: "Strengths & areas of improvement", guidance: "Does the student reflect and share about what they were able to do and struggled with, post an activity? Does the student get defensive when pointed out flaws? Does the student shy away and not accept appreciation?" },
  { domain: "Self Awareness", title: "Impact on behaviour", guidance: "Incidents to observe: if there has been a conflict in the class and they are asked to reflect and change their action." },
  { domain: "Self Awareness", title: "Identities", guidance: "How many identities does the student easily name and share?" },
  { domain: "Self Management", title: "Focus on present", guidance: "Does the student focus easily during an activity in class? Has the student shared in a one-on-one conversation about focus-related issues, or has their teacher/parent?" },
  { domain: "Self Management", title: "Work towards goals", guidance: null },
  { domain: "Self Management", title: "Direct thoughts & feelings", guidance: "Have you observed any incident where the student is angry or in panic, for example? Do they find ways to actively find solutions to calm themselves? Do they ask for help, or do they ignore, lash out, or resist help when offered?" },
  { domain: "Self Management", title: "Prioritise actions", guidance: "During an activity in class, do they manage all the instructions and resources given? Do they plan it and finish on time?" },
  { domain: "Self Management", title: "Self compassion", guidance: "Observe in situations like: after a conflict, do they remain upset for long and stay disengaged? After receiving low marks, how do they talk about it — do they say they feel bad but will become okay and study better next time? Do they refer to classroom norms to share?" },
  { domain: "Self Management", title: "Seek help", guidance: "Observe in situations like: does the student avoid using spaces and norms for rest, even when reminded? Any incident in school where they've come and asked for help, or you see them seek help from peers/teachers." },
  { domain: "Social Awareness", title: "Impact on others", guidance: "Have you observed them apologising after a conflict? Are they able to give examples of interdependence in their daily life and in the larger society, on a macro level, easily?" },
  { domain: "Social Awareness", title: "Understand others' feelings", guidance: "Are they able to articulate how others' (like their friends, family, teachers) affect their own feelings, or have they expressed how you as a facilitator impact their feelings?" },
  { domain: "Social Awareness", title: "Different perspectives", guidance: "Have you observed them during FGD/class activity/debates? How do they respond to comments or discussions that don't align with their thoughts or opinions? Have they shared about conversations with teachers/parents/peers where they had a disagreement but showed understanding or acceptance of others' views?" },
  { domain: "Social Awareness", title: "Gratitude", guidance: "How do they thank their teachers/peers/you as a facilitator? What do their peers say about them?" },
  { domain: "Social Awareness", title: "Diverse and unjust norms", guidance: "Do they share about different norms sensitively, and also call out why they are discriminatory (when relevant)? Do they show openness to changing their bias/view after learning about a new cultural practice? Do they mock or judge during sharing sessions?" },
  { domain: "Social Awareness", title: "Adapt actions", guidance: "How do they make decisions during activities? Note: autistic or neurodivergent children may face difficulty displaying this competency — if you are aware of a diagnosis, or think they need one, note it here and refer to the counsellor." },
  { domain: "Social Awareness", title: "Structural understanding", guidance: "Have you discussed social issues and their causes in class or one-on-one with them? Have they been able to show an understanding of the structural or systemic nature?" },
  { domain: "Social Awareness", title: "Interdependence", guidance: null },
  { domain: "Relationship Skills", title: "Communicate needs", guidance: "Does the student share that they're struggling to focus, or just run away? Do they ask for what they need during an activity?" },
  { domain: "Relationship Skills", title: "Listen", guidance: "Do they interrupt others or you during class? Do they wait for their turn? Do they nod their head and respond in pair work?" },
  { domain: "Relationship Skills", title: "Group work", guidance: "Observe them during group work — do they sit away, do they talk over and push their ideas? Do they get upset when the group decides to do something else?" },
  { domain: "Relationship Skills", title: "Conflict resolution", guidance: "Have you observed them during a conflict, or heard them share about one?" },
  { domain: "Relationship Skills", title: "Trusting relationships", guidance: null },
  { domain: "Relationship Skills", title: "Compassionate & fair", guidance: "Can be observed in circle activities — does the student pass the ball / give a chance to their friends, or try to accommodate those who haven't gotten a chance? How do they share resources if they are leading a group work?" },
  { domain: "Relationship Skills", title: "Provide help", guidance: "Can be observed during group work — if they have finished early, do they help out others who are struggling?" },
  { domain: "Responsible Decision Making", title: "Well being of community", guidance: null },
  { domain: "Responsible Decision Making", title: "Consider all", guidance: null },
  { domain: "Responsible Decision Making", title: "Information gathering", guidance: null },
  { domain: "Responsible Decision Making", title: "Alternate thinking & consequences", guidance: null },
  { domain: "Responsible Decision Making", title: "Accept consequences", guidance: null },
];

// Verbatim from the mockup's SR_ITEMS constant (Student Response bank).
// Codes intentionally repeat across rows in a couple of cases (matches source).
const SR_ITEMS: { code: string; domain: string; en: string; hi: string }[] = [
  { code: "SA1", domain: "Self Awareness", en: "I can describe my mood and how I am feeling in different situations and different times.", hi: "मैं अलग-अलग स्थितियों और अलग-अलग समयों पर अपने मूड और भावनाओं का वर्णन कर सकता/सकती हूँ।" },
  { code: "SA2", domain: "Self Awareness", en: "I can recognize what values are important to me and why", hi: "मैं पहचान सकता/सकती हूँ कि मेरे लिए कौन से मूल्य महत्वपूर्ण हैं और क्यों।" },
  { code: "SA3", domain: "Self Awareness", en: "I can identify what my needs are in my life and how to work towards them", hi: "मैं पहचान सकता/सकती हूँ कि मेरी ज़िंदगी में मेरी ज़रूरतें क्या हैं और उन्हें पूरा करने के लिए कैसे काम करूँ।" },
  { code: "SA1", domain: "Self Awareness", en: "When I am feeling anxious about something I can figure out why.", hi: "जब मैं किसी बात को लेकर चिंतित महसूस करता/करती हूँ, तो मैं समझ सकता/सकती हूँ कि ऐसा क्यों हो रहा है।" },
  { code: "SA4", domain: "Self Awareness", en: "I spend time doing activities that I am good at / like (Eg: Drawing, playing football, kite flying, playing marbles)", hi: "मैं उन गतिविधियों में समय बिताता/बिताती हूँ जिनमें मैं अच्छा/अच्छी हूँ या जो मुझे पसंद हैं (जैसे: चित्रकारी, फुटबॉल खेलना, पतंग उड़ाना, कंचे खेलना)।" },
  { code: "SA6", domain: "Self Awareness", en: "I can describe how my experiences have shaped who I am", hi: "मैं बता सकता/सकती हूँ कि मेरे अनुभवों ने मुझे कैसा इंसान बनाया है।" },
  { code: "SA5", domain: "Self Awareness", en: "I can understand why we behave differently when we are in different moods", hi: "मैं समझ सकता/सकती हूँ कि अलग-अलग मूड में हम अलग तरह से व्यवहार क्यों करते हैं।" },
  { code: "SM1", domain: "Self Management", en: "When I get distracted during an activity I am able to focus back on it", hi: "जब किसी गतिविधि के दौरान मेरा ध्यान भटकता है, तो मैं फिर से उस पर ध्यान लगा सकता/सकती हूँ।" },
  { code: "SM6", domain: "Self Management", en: "I know how to get help when I'm having trouble with a classmate.", hi: "मुझे पता है कि जब किसी सहपाठी के साथ परेशानी हो तो मदद कैसे लूँ।" },
  { code: "SM2", domain: "Self Management", en: "When I have a major exam, project or any important task to complete, I make a plan and work towards it", hi: "जब मुझे कोई बड़ी परीक्षा, प्रोजेक्ट या महत्वपूर्ण काम पूरा करना होता है, तो मैं एक योजना बनाता/बनाती हूँ और उस पर काम करता/करती हूँ।" },
  { code: "SM3", domain: "Self Management", en: "When I make a mistake, I admit it and reflect on the reasons", hi: "जब मुझसे गलती होती है, तो मैं उसे स्वीकार करता/करती हूँ और उसके कारणों पर विचार करता/करती हूँ।" },
  { code: "SM6", domain: "Self Management", en: "When I need help I ask for it", hi: "जब मुझे मदद की ज़रूरत होती है, तो मैं मदद माँगता/माँगती हूँ।" },
  { code: "SM3", domain: "Self Management", en: "When I do badly on a test, I try not to dwell on it and focus on what I can do now", hi: "जब किसी टेस्ट में मेरा प्रदर्शन खराब होता है, तो मैं उस पर ज़्यादा नहीं सोचता/सोचती और अभी क्या कर सकता/सकती हूँ, उस पर ध्यान देता/देती हूँ।" },
  { code: "SO4", domain: "Social Awareness", en: "I communicate my gratitude to my friends, family, caregivers, teachers etc.", hi: "मैं अपने दोस्तों, परिवार, देखभाल करने वालों, शिक्षकों आदि के प्रति अपनी कृतज्ञता व्यक्त करता/करती हूँ।" },
  { code: "SO6", domain: "Social Awareness", en: "I'm careful when I use things that are not mine.", hi: "जब मैं किसी और की चीज़ों का उपयोग करता/करती हूँ, तो सावधानी रखता/रखती हूँ।" },
  { code: "SO2", domain: "Social Awareness", en: "I know how I feel when others are angry or disappointed with me.", hi: "मुझे पता होता है कि जब दूसरे मुझसे नाराज़ या निराश होते हैं तो मुझे कैसा महसूस होता है।" },
  { code: "SO1", domain: "Social Awareness", en: "I recognize when something I do makes someone happy, upset, or angry", hi: "मैं पहचान सकता/सकती हूँ कि मेरे किए किसी काम से कोई खुश, परेशान या नाराज़ हुआ है।" },
  { code: "SO3", domain: "Social Awareness", en: "I learn from people with different opinions than me.", hi: "मैं उन लोगों से सीखता/सीखती हूँ जिनकी राय मुझसे अलग होती है।" },
  { code: "RS3", domain: "Relationship Skills", en: "I contribute while working in groups", hi: "समूह में काम करते समय मैं अपना योगदान देता/देती हूँ।" },
  { code: "RS5", domain: "Relationship Skills", en: "Others confide their problems in me", hi: "दूसरे लोग अपनी समस्याएँ मुझसे साझा करते हैं।" },
  { code: "RS6", domain: "Relationship Skills", en: "I take actions in support of others when they are not treated well.", hi: "जब किसी के साथ अच्छा व्यवहार नहीं होता, तो मैं उनके समर्थन में कदम उठाता/उठाती हूँ।" },
  { code: "RS4", domain: "Relationship Skills", en: "I find different ways to end a disagreement respectfully", hi: "मैं किसी असहमति को सम्मानपूर्वक सुलझाने के अलग-अलग तरीके खोजता/खोजती हूँ।" },
  { code: "RS1", domain: "Relationship Skills", en: "When I am not treated well I communicate it to the person.", hi: "जब मेरे साथ अच्छा व्यवहार नहीं होता, तो मैं इसे उस व्यक्ति को बताता/बताती हूँ।" },
  { code: "RS6", domain: "Relationship Skills", en: "If I do something that upsets someone, I apologize and take the action required in that situation", hi: "अगर मेरी किसी बात से किसी को दुख होता है, तो मैं माफ़ी माँगता/माँगती हूँ और ज़रूरी कदम उठाता/उठाती हूँ।" },
  { code: "RS7", domain: "Relationship Skills", en: "When I see someone is in trouble I find ways to help them", hi: "जब मैं देखता/देखती हूँ कि कोई परेशानी में है, तो मैं उनकी मदद के तरीके ढूँढता/ढूँढती हूँ।" },
  { code: "RD4", domain: "Responsible Decision Making", en: "I think about what might happen before making a decision.", hi: "कोई फैसला लेने से पहले मैं सोचता/सोचती हूँ कि इसका क्या नतीजा हो सकता है।" },
  { code: "RD1", domain: "Responsible Decision Making", en: "I contribute to work that improves my area or the place I live in", hi: "मैं उस काम में योगदान देता/देती हूँ जिससे मेरा इलाका या मेरी रहने की जगह बेहतर हो।" },
  { code: "RD2", domain: "Responsible Decision Making", en: "I ensure that there are more positive outcomes when making a choice.", hi: "कोई चुनाव करते समय मैं यह सुनिश्चित करता/करती हूँ कि सकारात्मक नतीजे ज़्यादा हों।" },
  { code: "RD4", domain: "Responsible Decision Making", en: "I consider the pros and cons of the strategy before deciding to use it.", hi: "किसी तरीके को अपनाने का फैसला करने से पहले मैं उसके फ़ायदे और नुकसान पर विचार करता/करती हूँ।" },
  { code: "RD5", domain: "Responsible Decision Making", en: "When I realise that I have made a poor decision, I try to learn from it and take responsibility for the consequences", hi: "जब मुझे पता चलता है कि मैंने कोई गलत फैसला लिया है, तो मैं उससे सीखने की कोशिश करता/करती हूँ और नतीजों की ज़िम्मेदारी लेता/लेती हूँ।" },
];
const FIRST_NAMES = ["Aarav", "Diya", "Vihaan", "Ananya", "Ishaan", "Myra", "Kabir", "Saanvi", "Arjun", "Riya", "Reyansh", "Aadhya", "Vivaan", "Anika", "Shaurya"];
const LAST_NAMES = ["Sharma", "Patel", "Kumar", "Singh", "Gupta", "Rao", "Nair", "Mehta", "Joshi", "Verma"];
const SECTIONS = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
const SOCIAL_CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];
const MINORITY_GROUPS = ["None", "None", "None", "Muslim", "Christian", "Sikh", "Buddhist", "Other"];
const IMPAIRMENT_TYPES = ["Visual", "Hearing", "Locomotor", "Speech and language"];

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function pick<T>(arr: readonly T[], seed: number) {
  return arr[seed % arr.length];
}
function rand(min: number, max: number, seed: number) {
  const x = Math.sin(seed) * 10000;
  const frac = x - Math.floor(x);
  return Math.round((min + frac * (max - min)) * 10) / 10;
}
function bracketSplit(seed: number) {
  const below = Math.max(2, rand(5, 20, seed));
  const basic = Math.max(5, rand(15, 30, seed + 1));
  const proficient = Math.max(10, rand(25, 40, seed + 2));
  const advanced = Math.max(100 - below - basic - proficient, 5);
  return { below, basic, proficient, advanced };
}

async function main() {
  console.log("Seeding khoj_dashboard...");

  // Grades ------------------------------------------------------------
  const { data: grades, error: gradesErr } = await supabase
    .from("grades")
    .upsert(
      GRADE_DEFS.map((g, i) => ({ code: g.code, label: g.label, sort_order: i })),
      { onConflict: "code" }
    )
    .select();
  if (gradesErr) throw gradesErr;

  // Students ------------------------------------------------------------
  await supabase.from("students").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const studentRows = [];
  let s = 0;
  for (const g of grades!) {
    const count = 30 + (s % 15);
    for (let i = 0; i < count; i++) {
      s++;
      const isCwsn = s % 20 === 0;
      studentRows.push({
        grade_id: g.id,
        roll_no: String(i + 1).padStart(2, "0"),
        name: `${pick(FIRST_NAMES, s)} ${pick(LAST_NAMES, s + 3)}`,
        gender: s % 2 === 0 ? "M" : "F",
        date_of_birth: `${2008 + (s % 12)}-${String((s % 12) + 1).padStart(2, "0")}-${String((s % 27) + 1).padStart(2, "0")}`,
        section: pick(SECTIONS, s),
        father_name: `${pick(FIRST_NAMES, s + 5)} ${pick(LAST_NAMES, s)}`,
        mother_name: `${pick(FIRST_NAMES, s + 8)} ${pick(LAST_NAMES, s)}`,
        social_category: pick(SOCIAL_CATEGORIES, s),
        minority_group: pick(MINORITY_GROUPS, s),
        bpl_beneficiary: s % 9 === 0,
        cwsn: isCwsn,
        impairment_type: isCwsn ? pick(IMPAIRMENT_TYPES, s) : null,
        repeater_this_year: s % 25 === 0,
        student_pen: `PEN${String(100000 + s)}`,
        aadhaar_number: `${String(s).padStart(4, "0")}${String(s * 7).padStart(4, "0")}${String(s * 13).padStart(4, "0")}`,
        apaar_id: `APAAR${String(200000 + s)}`,
        mobile_number: `9${String(800000000 + s * 37).slice(0, 9)}`,
        address: `${(s % 40) + 1}, ${pick(LAST_NAMES, s)} Colony, Pune`,
      });
    }
  }
  const { data: students, error: studentsErr } = await supabase
    .from("students")
    .insert(studentRows)
    .select();
  if (studentsErr) throw studentsErr;

  // Grade history: current year + previous 2 (mostly today's grade) -----
  await supabase.from("student_grade_history").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const AY_LABELS = ["AY 2026-27", "AY 2025-26", "AY 2024-25"];
  const gradeHistoryRows = students!.flatMap((stu) =>
    AY_LABELS.map((ay) => ({ student_id: stu.id, academic_year: ay, grade_id: stu.grade_id }))
  );
  for (const batch of chunk(gradeHistoryRows, 1000)) {
    const { error } = await supabase.from("student_grade_history").insert(batch);
    if (error) throw error;
  }

  // Assessments (formative + summative) ---------------------------------
  await supabase.from("assessments").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const assessmentRows = [];
  let a = 0;
  for (const g of grades!) {
    for (const subject of SUBJECTS) {
      for (const kind of ["formative", "summative"] as const) {
        const rounds = kind === "formative" ? ["Round 1", "Round 2"] : ["Pre", "Post"];
        let prevAvg: number | null = null;
        for (const round of rounds) {
          a++;
          const avg = rand(45, 85, a);
          const brackets = bracketSplit(a);
          assessmentRows.push({
            kind,
            grade_id: g.id,
            subject,
            round_label: round,
            assessment_date: `2026-0${(a % 5) + 4}-15`,
            average_pct: avg,
            previous_average_pct: prevAvg,
            bracket_below_pct: brackets.below,
            bracket_basic_pct: brackets.basic,
            bracket_proficient_pct: brackets.proficient,
            bracket_advanced_pct: brackets.advanced,
          });
          prevAvg = avg;
        }
      }
    }
  }
  const { data: assessments, error: assessmentsErr } = await supabase
    .from("assessments")
    .insert(assessmentRows)
    .select();
  if (assessmentsErr) throw assessmentsErr;

  // Objectives for latest formative assessment per grade/subject --------
  const objectiveRows = [];
  for (const asm of assessments!.filter((x) => x.kind === "formative" && x.round_label === "Round 2")) {
    for (let i = 0; i < 3; i++) {
      objectiveRows.push({
        assessment_id: asm.id,
        objective_text: `${asm.subject} objective ${i + 1}`,
        max_marks: 10,
        class_average: rand(4, 9, i + asm.average_pct),
      });
    }
  }
  let objectives: { id: string; assessment_id: string; max_marks: number }[] = [];
  if (objectiveRows.length) {
    await supabase.from("assessment_objectives").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    const { data, error } = await supabase.from("assessment_objectives").insert(objectiveRows).select();
    if (error) throw error;
    objectives = data!;
  }

  // Per-student, per-objective scores for those same formative assessments —
  // gives the score-entry grid real data to show immediately.
  await supabase.from("assessment_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const objectivesByAssessment = new Map<string, typeof objectives>();
  for (const obj of objectives) {
    const list = objectivesByAssessment.get(obj.assessment_id) ?? [];
    list.push(obj);
    objectivesByAssessment.set(obj.assessment_id, list);
  }
  const scoreRows: { assessment_id: string; objective_id: string; student_id: string; score: number }[] = [];
  let sq = 0;
  for (const asm of assessments!.filter((x) => x.kind === "formative" && x.round_label === "Round 2")) {
    const objs = objectivesByAssessment.get(asm.id) ?? [];
    const gradeStudents = students!.filter((stu) => stu.grade_id === asm.grade_id);
    for (const stu of gradeStudents) {
      for (const obj of objs) {
        sq++;
        scoreRows.push({
          assessment_id: asm.id,
          objective_id: obj.id,
          student_id: stu.id,
          score: Math.min(obj.max_marks, rand(2, obj.max_marks, sq)),
        });
      }
    }
  }
  for (const batch of chunk(scoreRows, 1000)) {
    const { error } = await supabase.from("assessment_scores").insert(batch);
    if (error) throw error;
  }

  // Coverage by month -----------------------------------------------------
  await supabase.from("assessment_coverage_months").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const coverageRows: { kind: "formative" | "summative"; grade_id: string; month_label: string; coverage_pct: number; sort_order: number }[] = [];
  let c = 0;
  for (const g of grades!) {
    for (const kind of ["formative", "summative"] as const) {
      FORMATIVE_MONTHS.forEach((month, idx) => {
        c++;
        coverageRows.push({
          kind,
          grade_id: g.id,
          month_label: month,
          coverage_pct: rand(40, 95, c),
          sort_order: idx,
        });
      });
    }
  }
  await supabase.from("assessment_coverage_months").insert(coverageRows).then(({ error }) => { if (error) throw error; });

  // Attendance --------------------------------------------------------------
  await supabase.from("attendance_monthly").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("attendance_records").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("student_attendance").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  await supabase.from("attendance_alerts").delete().neq("id", "00000000-0000-0000-0000-000000000000");

  const attendanceMonthlyRows: { grade_id: string; month_label: string; attendance_pct: number; sort_order: number }[] = [];
  let att = 0;
  for (const g of grades!) {
    FORMATIVE_MONTHS.forEach((month, idx) => {
      att++;
      attendanceMonthlyRows.push({
        grade_id: g.id,
        month_label: month,
        attendance_pct: rand(65, 96, att),
        sort_order: idx,
      });
    });
  }
  await supabase.from("attendance_monthly").insert(attendanceMonthlyRows).then(({ error }) => { if (error) throw error; });

  const attendanceRecordRows = [];
  let ar = 0;
  for (const g of grades!) {
    for (let d = 1; d <= 5; d++) {
      ar++;
      const total = 30 + (ar % 15);
      attendanceRecordRows.push({
        grade_id: g.id,
        record_date: `2026-09-${String(d).padStart(2, "0")}`,
        present_count: Math.round(total * (rand(0.7, 0.97, ar) / 1)),
        total_count: total,
      });
    }
  }
  await supabase.from("attendance_records").insert(attendanceRecordRows).then(({ error }) => { if (error) throw error; });

  // Per-student daily roster — real backing data for "Take attendance" ------
  await supabase.from("attendance_daily").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const attendanceDailyRows: { student_id: string; record_date: string; present: boolean }[] = [];
  let ad = 0;
  for (const stu of students!) {
    for (let d = 1; d <= 5; d++) {
      ad++;
      attendanceDailyRows.push({
        student_id: stu.id,
        record_date: `2026-09-${String(d).padStart(2, "0")}`,
        present: rand(0, 1, ad) > 0.12,
      });
    }
  }
  for (const batch of chunk(attendanceDailyRows, 1000)) {
    const { error } = await supabase.from("attendance_daily").insert(batch);
    if (error) throw error;
  }

  const studentAttendanceRows: { student_id: string; month_label: string; attendance_pct: number; sort_order: number }[] = [];
  let sa = 0;
  for (const stu of students!) {
    FORMATIVE_MONTHS.forEach((month, idx) => {
      sa++;
      studentAttendanceRows.push({
        student_id: stu.id,
        month_label: month,
        attendance_pct: rand(55, 99, sa),
        sort_order: idx,
      });
    });
  }
  await supabase.from("student_attendance").insert(studentAttendanceRows).then(({ error }) => { if (error) throw error; });

  const alertRows = students!
    .filter((_, i) => i % 12 === 0)
    .map((stu, i) => ({
      student_id: stu.id,
      consecutive_days_missed: 7 + (i % 5),
      status: "open" as const,
    }));
  await supabase.from("attendance_alerts").insert(alertRows).then(({ error }) => { if (error) throw error; });

  // SEL parameters + scores --------------------------------------------------
  await supabase.from("sel_parameters").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { data: selParams, error: selParamsErr } = await supabase
    .from("sel_parameters")
    .insert(SEL_PARAMETERS.map((name, i) => ({ name, sort_order: i })))
    .select();
  if (selParamsErr) throw selParamsErr;

  await supabase.from("sel_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const selScoreRows = [];
  let sc = 0;
  for (const g of grades!) {
    for (const p of selParams!) {
      for (const method of ["observation", "self_report"] as const) {
        sc++;
        const thrive = rand(45, 85, sc);
        selScoreRows.push({
          grade_id: g.id,
          parameter_id: p.id,
          period_label: "Cycle 1",
          method,
          thrive_pct: thrive,
          resist_pct: 100 - thrive,
        });
      }
    }
  }
  await supabase.from("sel_scores").insert(selScoreRows).then(({ error }) => { if (error) throw error; });

  // SJT (grades 6-10) --------------------------------------------------------
  await supabase.from("sel_domains").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { data: domains, error: domainsErr } = await supabase
    .from("sel_domains")
    .insert(SEL_DOMAINS.map((name, i) => ({ name, sort_order: i })))
    .select();
  if (domainsErr) throw domainsErr;

  await supabase.from("sjt_situations").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const { data: situations, error: situationsErr } = await supabase
    .from("sjt_situations")
    .insert(
      SJT_SITUATIONS.map((s, i) => ({
        title: s.title,
        sort_order: i,
        story_en: s.storyEn,
        story_hi: s.storyHi,
        options_en: s.optionsEn,
        options_hi: s.optionsHi,
      }))
    )
    .select();
  if (situationsErr) throw situationsErr;

  // Observation item bank (grade-band-specific) ------------------------------
  await supabase.from("sel_observation_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const domainIdByName = new Map(domains!.map((d) => [d.name, d.id]));
  const observationRows = [
    ...OBSERVATION_ITEMS_K3.map((item, i) => ({
      code: `k3-${i + 1}`,
      band: "k3" as const,
      domain_id: domainIdByName.get(item.domain)!,
      title: item.title,
      guidance: item.guidance,
      sort_order: i,
    })),
    ...OBSERVATION_ITEMS_G4.map((item, i) => ({
      code: `g4-${i + 1}`,
      band: "g4" as const,
      domain_id: domainIdByName.get(item.domain)!,
      title: item.title,
      guidance: item.guidance,
      sort_order: i,
    })),
  ];
  for (const batch of chunk(observationRows, 200)) {
    const { error } = await supabase.from("sel_observation_items").insert(batch);
    if (error) throw error;
  }

  // Student Response statement bank ------------------------------------------
  await supabase.from("sel_response_items").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const responseItemRows = SR_ITEMS.map((item, i) => ({
    code: item.code,
    domain_id: domainIdByName.get(item.domain)!,
    statement_en: item.en,
    statement_hi: item.hi,
    sort_order: i,
  }));
  for (const batch of chunk(responseItemRows, 200)) {
    const { error } = await supabase.from("sel_response_items").insert(batch);
    if (error) throw error;
  }

  const sjtGrades = grades!.filter((g) => Number(g.code) >= 6 && Number(g.code) <= 10);

  await supabase.from("sjt_responses").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const sjtResponseRows: {
    situation_id: string;
    grade_id: string | null;
    option_a_pct: number;
    option_b_pct: number;
    option_c_pct: number;
    option_d_pct: number;
  }[] = [];
  let sj = 0;
  for (const situ of situations!) {
    for (const g of [...sjtGrades, null]) {
      sj++;
      const a1 = rand(10, 40, sj);
      const b1 = rand(10, 40, sj + 1);
      const c1 = rand(10, 30, sj + 2);
      const d1 = Math.max(100 - a1 - b1 - c1, 5);
      sjtResponseRows.push({
        situation_id: situ.id,
        grade_id: g?.id ?? null,
        option_a_pct: a1,
        option_b_pct: b1,
        option_c_pct: c1,
        option_d_pct: d1,
      });
    }
  }
  await supabase.from("sjt_responses").insert(sjtResponseRows).then(({ error }) => { if (error) throw error; });

  await supabase.from("sjt_competency_scores").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const competencyRows: { grade_id: string | null; domain_id: string; score_pct: number }[] = [];
  let cs = 0;
  for (const g of [...sjtGrades, null]) {
    for (const d of domains!) {
      cs++;
      competencyRows.push({ grade_id: g?.id ?? null, domain_id: d.id, score_pct: rand(40, 85, cs) });
    }
  }
  await supabase.from("sjt_competency_scores").insert(competencyRows).then(({ error }) => { if (error) throw error; });

  await supabase.from("sjt_coverage").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const coverageRowsSjt: { grade_id: string | null; coverage_pct: number }[] = [];
  let cv = 0;
  for (const g of [...sjtGrades, null]) {
    cv++;
    coverageRowsSjt.push({ grade_id: g?.id ?? null, coverage_pct: rand(35, 80, cv) });
  }
  await supabase.from("sjt_coverage").insert(coverageRowsSjt).then(({ error }) => { if (error) throw error; });

  // Individual growth ---------------------------------------------------------
  await supabase.from("student_growth").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const growthRows = [];
  let sg = 0;
  for (const stu of students!) {
    for (const subject of SUBJECTS) {
      sg++;
      const pre = rand(30, 70, sg);
      growthRows.push({
        student_id: stu.id,
        subject,
        pre_score: pre,
        post_score: Math.min(100, pre + rand(2, 25, sg + 1)),
      });
    }
  }
  await supabase.from("student_growth").insert(growthRows).then(({ error }) => { if (error) throw error; });

  // Overview: action queue, bracket movement, top movers, stats -------------
  await supabase.from("action_queue").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const actionRows = [
    ...grades!.map((g) => ({
      grade_id: g.id,
      category: "attendance",
      description: `${alertRows.filter((r) => students!.find((s) => s.id === r.student_id)?.grade_id === g.id).length} students in ${g.label} have missed 7+ consecutive teaching days`,
      status: "open" as const,
    })).filter((_, i) => i % 3 === 0),
    { grade_id: null, category: "formative", description: "3 grades have formative coverage below target", status: "open" as const },
  ];
  await supabase.from("action_queue").insert(actionRows).then(({ error }) => { if (error) throw error; });

  await supabase.from("bracket_movement").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const bracketMovementRows = [];
  let bm = 0;
  for (const g of grades!) {
    for (const round of ["pre", "post"] as const) {
      bm++;
      const b = bracketSplit(bm + (round === "post" ? 50 : 0));
      bracketMovementRows.push({
        grade_id: g.id,
        round_label: round,
        below_pct: b.below,
        basic_pct: b.basic,
        proficient_pct: b.proficient,
        advanced_pct: b.advanced,
      });
    }
  }
  await supabase.from("bracket_movement").insert(bracketMovementRows).then(({ error }) => { if (error) throw error; });

  await supabase.from("top_movers").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const topMoverRows = students!
    .filter((_, i) => i % 8 === 0)
    .slice(0, 20)
    .map((stu, i) => ({ student_id: stu.id, delta_pct: rand(8, 30, i), cycle_label: "Round 2" }));
  await supabase.from("top_movers").insert(topMoverRows).then(({ error }) => { if (error) throw error; });

  await supabase.from("overview_stats").delete().neq("id", "00000000-0000-0000-0000-000000000000");
  const statsRows = [];
  let ov = 0;
  for (const g of [...grades!, null]) {
    ov++;
    const gradeStudents = g ? students!.filter((s) => s.grade_id === g.id) : students!;
    const boys = gradeStudents.filter((s) => s.gender === "M").length;
    statsRows.push({
      grade_id: g?.id ?? null,
      enrollment_count: gradeStudents.length,
      boys_count: boys,
      girls_count: gradeStudents.length - boys,
      attendance_this_month_pct: rand(65, 95, ov),
      formative_coverage_pct: rand(50, 90, ov + 1),
      attendance_alert_threshold_pct: 85,
    });
  }
  await supabase.from("overview_stats").insert(statsRows).then(({ error }) => { if (error) throw error; });

  console.log(`Seeded ${grades!.length} grades, ${students!.length} students, ${assessments!.length} assessments.`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
