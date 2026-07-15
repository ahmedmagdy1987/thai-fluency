# Empty-phonetic cards — native reviewer worklist

**335 of 4792 cards carry no romanization** (`ph: ''`). Generated from the live
deck over `ALL_CARDS`, so nothing is hidden by the 18+/mature gate or by quarantine.
Review finding A3 (`docs/content-review/claude-review.md`).

> The review doc says 56. That is a ~6x undercount — 56 is only the `needsReview`
> subset. The corpus-wide figure is 335, corroborated by
> `docs/missing-phonetics-findings.json` (`meta.totalMissingPh: 334`, which predates the
> 5073 card split that added one) and `docs/missing-phonetics-fix-report.md:11-15`.
> All 335 need authoring, not just the flagged 57.

## Why a human has to do this

A romanization is Thai content, and in a tonal language the tone diacritic IS the word.
Nothing may transliterate, pattern-match, or otherwise synthesize these — a fabricated
tone teaches a wrong word while looking authoritative. The repo already proved it cannot
be mechanized: `scripts/audit-missing-phonetics.mjs` ran every safe-derivation path
against these cards and returned **0 hits on all of them**.

Until a native authors a `ph`, these cards are excluded from every phonetic-requiring
exercise (see `src/lib/phonetics.js`). They are not deleted and not hidden — they are
simply not taught. `scripts/check-phonetic-integrity.mjs` enforces both halves of that
and fails if any card below is missing from this file, so a new empty-`ph` card cannot
be added silently without being triaged here.

## ⚠️ Read before authoring: 7 cards have corrupted Thai (finding C3)

**4756, 4959, 5002, 5074, 5084, 5151, 5216** are quarantined as suspected-corrupted Thai.
**Their Thai must be corrected FIRST.** Authoring a phonetic against a corrupted string
encodes the corruption into the romanization — and the `ph` then reads as independent
confirmation that the broken Thai is right, which is far harder to catch later than the
original typo. Fix the Thai, then author the `ph`. They are marked **C3-corrupt** below.

## Breakdown

| | count |
|---|---|
| Total empty-`ph` (ALL_CARDS) | **335** |
| Reachable in the free deck (CARDS) | 323 |
| Mature-gated | 5 |
| Quarantined (all 7 are C3) | 7 |
| Flagged `needsReview` | 57 |

By stage: stage 4: 1 · stage 5: 19 · stage 6: 44 · stage 7: 108 · stage 8: 163. Concentrated in the late stages and almost entirely sentences
(type `s`) — the imported batches, not the hand-authored core.

## The list

| id | thai | en | flags |
|---|---|---|---|
| 4732 | แป๊บนึง | Just one moment | — |
| 4733 | อะไรอย่างเงี้ยะ | Something like that | — |
| 4734 | ทำปุ๊บ เสร็จปั๊บ | As soon as I do it, it's done | needsReview |
| 4735 | มันไม่คุ้ม | It's not worth it | — |
| 4737 | พอดีเอกับเขา | I just happened to run into him | needsReview |
| 4752 | เขาพูดภาษาพื้นๆ | He uses basic, common language | — |
| 4753 | ทำไปเรื่อยๆ | Keep doing it | — |
| 4755 | เราจะเหมารถไป | We will rent a car and a driver | needsReview |
| 4756 | ผมเป็นหนี้บุคุณเขา | I'm indebted to him (male) | quarantined, needsReview, **C3-corrupt** |
| 4770 | ขอหลับแป๊บนึง | I'd like to take a little nap | — |
| 4772 | โอ้โห | Wow! | needsReview |
| 4777 | อย่ายุ่งได้มั้ย | Can you not interfere? | — |
| 4778 | บอกตรงๆ | I'll be straight with you | — |
| 4781 | คุณนอนละเมอ | You talked in your sleep | needsReview |
| 4783 | อย่างอนไปหน่อยเลย | Don't get too upset | needsReview |
| 4796 | ไปเแป๊บเดียวก็ถึง | We can get there in no time | needsReview |
| 4804 | คืออย่างงี้นะ | Let me say it this way | — |
| 4806 | ขับรถปาดซ้าย ปาดขวา | To fishtail on the road | needsReview |
| 4808 | ทุกซอก ทุกมุม | Every nook and cranny | needsReview |
| 4810 | นั่นน่ะสิ | I agree with you | — |
| 4815 | เรารู้จักกันมาก่อนรึเปล่า | Have we met before? | needsReview |
| 4817 | ไม่ทำเด็ดขาด | I won't do it by any means | — |
| 4822 | ต้องดีแน่ๆ | It must be good | — |
| 4825 | หาไม่ได้ง่ายๆ | It's not that easy to find | — |
| 4827 | เขาชอบพูดเพ้อเจ้อ | He likes to babble | needsReview |
| 4842 | รวมหัวกันโกง | They got together to cheat | — |
| 4855 | ไม่เอาได้มั้ย | I don't want it | — |
| 4858 | ไม่ย่อท้อ | Not giving up | — |
| 4872 | หมั่นไส้ | I dislike it | — |
| 4873 | เรื่องมันเป็นยังงี้ | This is how the story goes | — |
| 4880 | ไม่มีเงินดาวน์ | I have no down payment | needsReview |
| 4882 | ไม่ดีมั้ง | I don't think that's a good idea | — |
| 4891 | หุบปาก | Shut up | — |
| 4895 | หูอื้อ | Stuffed up ears (e.g. in an airplane, high altitude) | needsReview |
| 4896 | พูดดังๆหน่อย | Can you speak up? | — |
| 4897 | เคลียงานอยู่ | I'm finishing up work | needsReview |
| 4898 | มีลางสังหรณ์ | I have a hunch | needsReview |
| 4900 | มีเยอะแยะ | There's plenty | — |
| 4916 | คิดแล้วกลุ้ม | I'm depressed thinking about it | needsReview |
| 4928 | คนหลายใจ | An unfaithful person | — |
| 4929 | คิดจนหัวปั่น | My head is spinning from thinking too much | — |
| 4930 | คุณฝีมือดี | You have good skills | — |
| 4931 | ห้ามเข้า | No entry | — |
| 4932 | เราแย่งกันกิน | We fight to get the food | — |
| 4933 | ยังไม่ถึงเดือน | It hasn't been a month | — |
| 4934 | ทำกับมือ | I made (did) it with my own hands | — |
| 4935 | จ่ายค่าเช่า | To pay rent | — |
| 4936 | ดำปิ๊ดปี๋ | As black as charcoal | needsReview |
| 4937 | ปวดฉี่ | I need to pee | — |
| 4938 | นึกว่าคุณไม่ชอบ | I thought you didn't like it | — |
| 4939 | ไม่นานขนาดนั้น | It doesn't take that long | — |
| 4940 | อยู่เฝ้าบ้าน | I'm staying home to guard the house | — |
| 4941 | บอกแล้วไง | I told you so | — |
| 4942 | คุณตัวร้อน | You have a fever | — |
| 4943 | ว่าแต่คุณล่ะ | And what about yourself? | — |
| 4944 | ไม่อยากลองดี | I don't want to try it | — |
| 4945 | ไม่บอกก็รู้ | I knew it without being told | — |
| 4946 | ขอแก้แค้น | I want revenge | — |
| 4947 | เธอเป็นลม | She fainted | — |
| 4948 | ก่าเขาจะมาก็ดึกแล้ว | It's going to be late by the time he arrives | needsReview |
| 4949 | ไม่เห็นจริงๆ | I really didn't see it | — |
| 4950 | น่าสงสาร | He is pitiful | — |
| 4951 | ดีขนาดนั้นเลยเหรอ | Is it really that good? | — |
| 4952 | รู้ไม่ทันคุณ | You tricked me | — |
| 4953 | ไว้ใจไม่ได้ | He can't be trusted | — |
| 4954 | หนีไปเที่ยว | She sneaked out to have fun | — |
| 4955 | กลางวันแสกๆ | During broad daylight | needsReview |
| 4956 | ได้เวลาแล้ว | It's time | — |
| 4957 | สอบตก | To fail the exam | — |
| 4958 | ยกมือขึ้น | Hands up! | — |
| 4959 | เขาเพึ่งจะไป | He just left | quarantined, needsReview, **C3-corrupt** |
| 4960 | นักพนันมืออาชีพ | A professional gambler | — |
| 4961 | แอบดู | To peek at something | — |
| 4962 | ยังไม่เข็ด | “I haven't learned my lesson yet” | needsReview |
| 4963 | ไม่รู้จะทำไง | I don't know what I should do | — |
| 4964 | ทำแรงเกินไป | You did it too harshly | — |
| 4965 | หัวเด็ดตีนขาด ยังไงก็ไม่ทำ | I won't do it no matter what | — |
| 4966 | ทำหลบๆซ่อนๆ | To do something secretly | — |
| 4967 | ตามใจคุณ | I'll let you do what you want | — |
| 4968 | กินไม่ได้ นอนไม่หลับ | I can't eat | — |
| 4969 | ขึ้นๆ ลงๆ | Up and down | — |
| 4970 | ไหนๆ ก็ไหนๆ | Let's get over it (Let bygones be bygones) | — |
| 4971 | ปากหวาน | You're very complimentary | — |
| 4972 | ไม่มียางอาย | You have no shame at all | — |
| 4973 | ฝีมือตก | My skill level dropped | — |
| 4974 | สักวัน | One day | — |
| 4975 | จะทำให้ได้ | I will make it | — |
| 4976 | เขาเองเหรอ | Oh, is it him? | — |
| 4977 | อดไม่ได้ | I can't help it | — |
| 4978 | คืนดีกันแล้ว | They reconciled | — |
| 4979 | ตามคุณไม่ทัน | I can't keep up with you | — |
| 4980 | อยู่กันสองต่อสอง | To be alone just the two of us (them) | — |
| 4981 | ขอแก้ตัว | Give me a chance to correct myself | — |
| 4982 | นอนทั้งวันทั้งคืน | To sleep all day and all night | — |
| 4983 | แกล้งโง่หรือโง่จริงๆ | Are you pretending or are you really stupid? | — |
| 4984 | รีบไปรีบมา | Go and come back soon | — |
| 4985 | อิจฉาตาร้อน | Green with envy | — |
| 4986 | ดูท่าทางไม่ค่อยดี | It doesn't look very good | — |
| 4987 | ผมไม่เกี่ยว | I have nothing to do with this (male) | — |
| 4988 | มีเรื่องด่วน | There is an urgent matter | — |
| 4989 | เอาเป็นว่า... | So let's decide that... | — |
| 4990 | ขอบอกก่อนว่า... | I want to tell you ahead of time that... | — |
| 4991 | ไม่อยากคบกับเขา | I don't want to associate with him | — |
| 4992 | เขาชอบนินทา | She likes to gossip | needsReview |
| 4993 | เป็นใบ้ | To be dumb | needsReview |
| 4994 | หูหนวก | Deaf | — |
| 4995 | ตาบอด | Blind | — |
| 4996 | กำลังแพ้ท้อง | She is having morning sickness | — |
| 4997 | ขอนั่งด้วยคนได้มั้ย | May I sit here with you? | — |
| 4998 | ปรับความเข้าใจ | To try to make up | — |
| 4999 | เขาไม่พูดสักคำ | He didn't even say a word | — |
| 5000 | ชอบใจลอย | I'm often absent minded | — |
| 5001 | จริงเหรอ | Is it really? | — |
| 5002 | แล้วทีนี้่จะทำยังไง | What should I do then? | quarantined, needsReview, **C3-corrupt** |
| 5003 | มีพิรุธ | That's suspicious | needsReview |
| 5004 | ยังมีอีกเยอะ | There's still plenty left | needsReview |
| 5005 | ที่เหลือ | The remaining | — |
| 5006 | บ้ารึเปล่า | Are you crazy? | — |
| 5007 | ท่าทางมีความสุข | She looks happy | — |
| 5008 | ใช้ได้มั้ย | Will this work? | — |
| 5009 | หายป่วยแล้ว | I'm over my sickness | — |
| 5010 | ถ้าไม่ได้คุณ ฉันคงแย่ | Without you, I would have been in real trouble (female) | — |
| 5011 | มันธรรมดา | This is normal | — |
| 5012 | โสดแต่ไม่สด | She (I/You/They/He) is single, but not a virgin | mature, needsReview |
| 5013 | เสียแรงที่ไว้ใจคุณ | I'm sorry I trusted you | — |
| 5014 | ขอสงบสติอารมณ์ | Give me time to calm down | — |
| 5015 | ยินดีรับใช้ | I'm happy to see you | — |
| 5016 | มันเป็นกฏ | It's a rule | needsReview |
| 5017 | เขาไม่สมประกอบ | He's not all there | — |
| 5018 | ไปไหนกันมา | Where have you all been? | — |
| 5019 | ไม่อยากยุ่งเรื่องชาวบ้าน | I don't want to intrude into people's business | — |
| 5020 | ไปคุยกันที่บ้านดีกว่า | Let's discuss it at home | — |
| 5021 | ทำไมพึ่งจะบอก | Why didn't you tell me before? | — |
| 5022 | อยากคบคุณเป็นเพื่อน | I want to have you as a friend | — |
| 5023 | มีแต่ปัญหา | There's nothing, but problems | — |
| 5024 | เดือนหน้านายจะขึ้นเงินให้ | Next month my boss will give me a raise | — |
| 5025 | เปิดอีเมล์ดูรึยัง | Have you opened your email? | — |
| 5026 | กลัวถูกแม่ด่า | I'm afraid my mom will yell at me | — |
| 5027 | อยากเจอคนที่รู้ใจ | I want to meet someone that understands me | — |
| 5028 | เรื่องอยู่บนข่าวหน้าหนึ่ง | The story is on the front page | — |
| 5029 | ดูแลตัวเองให้ดี | Take good care of yourself | — |
| 5030 | หนีตามแฟน | She ran off with her boyfriend | — |
| 5031 | เบื่อชีวิต | I'm tired of life | — |
| 5032 | อยากหารายได้เสริม | I want to have additional income | — |
| 5033 | สวยไปหมด | She is beautiful all over | — |
| 5034 | เผลอไม่ได้ | You can't be careless | — |
| 5035 | ไม่ไหวแล้ว | I can't take it anymore | — |
| 5036 | เรียนต่อ | To continue one's study | — |
| 5037 | ต้องมีอะไรแน่ๆ | There must be something (going on) for sure | — |
| 5038 | แทบจะบ้า | I almost went crazy | — |
| 5039 | เร็วๆเข้า | Hurry up | — |
| 5040 | ทีละคน | One by one | — |
| 5042 | ทำได้ไง | How did you do it? | — |
| 5043 | เข้ากันไม่ได้ | They don't get along | — |
| 5044 | ตื่นได้แล้ว | Wake up! | — |
| 5045 | ถูกแฟนทิ้ง | She has been dumped (by her boyfriend) | — |
| 5046 | ทำตามสัญญา | To do as promised | — |
| 5047 | เราเป็นเนื้อคู่กัน | We are soulmates | — |
| 5048 | ขอปิดเป็นความลับ | I want to keep it a secret | — |
| 5049 | กล้าพูด | Dare to speak | — |
| 5051 | มันจะดีเหรอ | Do you think it will be good? | — |
| 5052 | เก็บแรงไว้ | I want to build up my strength | — |
| 5053 | ดูแต่ตา | Just look | — |
| 5055 | อย่าหลงเชื่อ | Don't fall for it and believe them | — |
| 5056 | ไม่รู้จะทำยังไง | I don't know what to do | — |
| 5057 | หัวอกเดียวกัน | To be in the same boat | — |
| 5058 | ว่างๆ จะมาหา | I will come to see you when I get a chance | — |
| 5059 | พูดอย่าง ทำอย่าง | Say one thing, but do another | — |
| 5060 | เขามาตั้งแต่หัวค่ำ | He's been here since early evening | — |
| 5061 | ตายเป็นตาย | I don't care if I have to die for it | — |
| 5062 | จะพาไปส่งบ้าน | I will take you home | — |
| 5063 | ปฎิเสธไม่ได้ | I can't refuse | needsReview |
| 5064 | เขาไม่โทรหาตั้งนาน | He hasn't called in a long time | — |
| 5065 | ไม่น่าพูดเลย | I shouldn't have said that | — |
| 5066 | นี่มันเรื่องส่วนตัว | This is a personal matter | — |
| 5067 | ไม่ได้ตั้งใจ | I didn't mean it | — |
| 5068 | คุณเป็นต้นเหตุ | You are the cause | — |
| 5069 | หาทางแก้ไข | To find a way to solve the problem | — |
| 5070 | เมียขอหย่า | My wife asked for a divorce | needsReview |
| 5071 | เกือบไปแล้ว | That was close! | — |
| 5072 | เรื่องน่าขำ | A funny story | needsReview |
| 5073 | เป็นเมนส์ | I'm having my period (casual) | mature, needsReview |
| 5074 | จะเล่าคามจริงให้ฟัง | I will tell you the truth | quarantined, needsReview, **C3-corrupt** |
| 5075 | อย่าไปโทษเขา | Don't blame him | — |
| 5076 | ลองจินตนาการดู | Try to imagine it | — |
| 5077 | ทำยังงี้ไม่ถูก | Doing this is not right | — |
| 5078 | ผมผิดข้อหาอะไร | What are the charges against me? (male) | — |
| 5079 | โมโหหิว | Angry from hunger | — |
| 5080 | เราเสียลูกค้า | We lost a customer | — |
| 5081 | จะไม่ยอมให้คุณทำกับฉันยังงี้ | I won't let you do this to me (female) | — |
| 5082 | ซึ้งแล้วใช่มั้ย | You appreciate it now, don't you? | needsReview |
| 5083 | เขาติดคุกอยู่ | He is in jail | needsReview |
| 5084 | พยยามรวบรวมเงิน | I'm trying to gather money | quarantined, needsReview, **C3-corrupt** |
| 5085 | ครานี้ซวยแน่ | You won't be lucky this time | needsReview |
| 5086 | คุณชอบเถียง | You like to argue | — |
| 5087 | ต้องจัดการให้เร็วที่สุด | This has to be taken care of as soon as possible | — |
| 5088 | มักมากในกาม | To be lustful | mature, needsReview |
| 5089 | แค้นต้องชำระ | Revenge that must by paid | — |
| 5090 | งานต้องมาก่อน | Work must come first | needsReview |
| 5091 | ค่าจ้างงวดแรก | First payment for the work | needsReview |
| 5092 | ผมต้องลงโทษคุณ | I have to punish you (male) | — |
| 5093 | คุณหวังมากเกินไป | You expect too much | — |
| 5094 | เดินทางข้ามน้ำข้ามทะเล | To travel across the ocean | — |
| 5095 | อะไรกันนักกันหนา | What are you all doing this for"! | — |
| 5096 | ผมโดนหักหลัง | I have been double"crossed (male) | — |
| 5097 | หายโกรธรึยัง | Have you stopped being mad? | — |
| 5098 | เธอท้องได้สามเดือน | She is three months pregnant | — |
| 5099 | ฉันจะไม่ลืมบุญคุณ | I will not forget your kindness (female) | — |
| 5100 | คุณเป็นใครกันแน่ | Who are you really? | — |
| 5101 | ไม่มีอะไรสำคัญกว่านี้ | There's nothing more important that this | — |
| 5102 | พนักงานชั่วคราว | A temporary worker"employee | needsReview |
| 5103 | คุณหมายถึงอะไร | What do you mean? | — |
| 5104 | ทำไมไม่บอกให้รู้ก่อน | Why didn't you let me know first? | — |
| 5105 | ได้ประโยชน์อะไร | What good will come of this? | — |
| 5106 | ใครรับผิดชอบ | Who is responsible? | — |
| 5107 | ฉันเป็นคนช่างฝัน | I'm a dreamer (female) | — |
| 5108 | เขตอันตราย | It's a danger zone | — |
| 5109 | เขาทำงานแบบไม่ลืมหูลืมตา | He works as if he didn't care about anything else | — |
| 5110 | อยากได้อะไร บอกได้เลย | If you want anything, just let me know | — |
| 5111 | เลยเวลานัดแล้ว | It's past the appointment time | — |
| 5112 | จะอธิบายยังไงดี | How can I explain? | — |
| 5113 | รองเท้ากัด | My shoes hurt my feet | — |
| 5114 | ทำแล้วก็ไม่ดีขึ้น | It won't get any better (even if I do it) | — |
| 5115 | ขอลองหน่อย | I want to try it a little | — |
| 5116 | ไม่อยากมีเรื่อง | I don't want to make a scene | — |
| 5117 | หวงไว้ทำไม | Why are you possessive of that? | needsReview |
| 5118 | งานนี้สนุกแน่ | It's going to be a fun party | — |
| 5119 | ไปก่อนนะ | I have to go now | — |
| 5120 | มานานรึยัง | Have you been here long? | — |
| 5121 | ทีหลังอย่าทำ | Don't do it next time | — |
| 5122 | ไปได้แล้ว | You may go now | — |
| 5123 | ต้องพิสูจน์ให้เห็น | I have to prove it | needsReview |
| 5124 | ตั้งหน้าตั้งตารอ | To look forward to seeing someone or something | — |
| 5125 | ตัวแทนจากบริษัท | A representative from the company | — |
| 5126 | แบบนี้แหล่ะ ดีแล้ว | It's good the way it is | needsReview |
| 5127 | คิดถึงใจจะขาด | I miss you so much it hurts | — |
| 5128 | เดินเร็วๆ หน่อยไม่ได้เหรอ | Can't you walk a little faster? | — |
| 5129 | ติดลม | To get carried away doing something | — |
| 5130 | ชื่นใจจังเลย | That's refreshing | — |
| 5131 | ไม่ต้องบอกก็รู้ | I know it without you telling me | — |
| 5132 | ทำใจไม่ได้ | I can't accept what happened | — |
| 5133 | มีแค่นี้เอง | That's all we have | — |
| 5134 | ได้ยินกับหู | I heard it with my own ears | — |
| 5135 | ได้เสียกันแล้ว | They already had sex | — |
| 5136 | มันไม่เหมาะ | It's not appropriate | — |
| 5137 | ไม่ใช่ความผิดฉัน | It's not my fault (female) | — |
| 5138 | มาตั้งแต่เมื่อไร | When did you get here? | — |
| 5139 | ผู้ชายหน้าโง่ | Stupid man | — |
| 5140 | มันไม่ใช่ของง่าย | It's not an easy thing | — |
| 5141 | จะพาแฟนไปด้วย | I will take my boyfriend with me | — |
| 5142 | แน่นะ | It's time | needsReview |
| 5143 | ถึงเวลาแล้ว | It's time | — |
| 5144 | ออกรถ | Drive! | — |
| 5145 | จะอยู่อีกนานมั้ย | Are you staying here much longer? | — |
| 5146 | ขอให้รวยๆ | I wish you lots of money | — |
| 5147 | เป็นคนละคน | She is a different person from before | — |
| 5148 | เสียวไส้ | That's scary | needsReview |
| 5149 | จะให้ทำยังไง | How do you want me to do it? | — |
| 5150 | นอนก่อนเลย | "Go ahead and sleep" (I will follow you later) | — |
| 5151 | ต้องรีบท | "I have to finish it quickly” | quarantined, needsReview, **C3-corrupt** |
| 5152 | เลือกไม่ถูก | I can't choose | — |
| 5153 | ตายเป็นผี | To die and become a ghost | — |
| 5154 | เขาทนอยู่ | He forces himself to stay | — |
| 5155 | กำลังยืดเส้นยืดสาย | I'm stretching | — |
| 5156 | เอาไว้คราวหน้าก็แล้วกัน | Let's do it next time | — |
| 5157 | ทีละเล็ก ทีละน้อย | Little by little | — |
| 5158 | เงินล่วงหน้า | Money in advance | — |
| 5159 | รับไม่ได้ | It's not acceptable | — |
| 5160 | เสร็จธุระแล้วรีบกลับบ้าน | Hurry home after you are done (with business, etc)? | — |
| 5161 | ทำเป็นไม่รู้ไม่ชี้ | To pretend not to know | — |
| 5162 | ไม่ต้องรอทานข้าว | Don't wait for me for dinner (lunch, etc) | — |
| 5163 | มองตาค้าง | To look at something and be stunned | — |
| 5164 | สักพักใหญ่ๆ | "In a long while" (As opposed to ‘a little while’) | — |
| 5165 | ธุรกิจเฟื่องฟู | The business is flourishing | needsReview |
| 5166 | ต้องทำให้ได้ | I have to make it | — |
| 5167 | อย่าหาเรื่อง | Don't cause yourself trouble | — |
| 5168 | ทำเปนไม่รูู้ไม่เห็น | To pretend that one can't see and doesn't know | needsReview |
| 5169 | อันเดียวพอ | One is enough | — |
| 5170 | ไม่ชอบนั่งเฉยๆ | I don't to sit doing nothing | — |
| 5171 | จะดูลายมือให้ | I will read your palm | — |
| 5172 | ไม่เข้ากับบรรยากาศ | It's not appropriate for the location | — |
| 5173 | ชอบนั่งริมหน้าต่าง | I like to sit by the window | — |
| 5174 | โดนเล่นงาน | To be reprimanded, criticized or attacked | — |
| 5175 | จู่ๆ ก็ได้เจอ | I met him (it/you/they/etc) by accident | needsReview |
| 5176 | อย่าไปกวนเขา | Don't bother him | — |
| 5177 | ต้องระวังเป็นพิเศษ | We have to be especially careful | — |
| 5178 | บริการที่ยอดเยี่ยม | An excellent service | — |
| 5179 | ให้รางวัลกับตัวเอง | To give oneself a reward | — |
| 5180 | ซ้อมร้องเพลงอยู่ | I'm practicing singing | needsReview |
| 5181 | เล่นละครเก่ง | She is good at faking it | — |
| 5182 | ไม่ใช่ความผิดของใคร | It's nobody's fault | — |
| 5183 | ดวงเป็นตัวกำหนด | Destiny sets it | — |
| 5184 | จำเป็นต้องทำ | It was necessary that I did it | — |
| 5185 | ไม่อยากบอก กลัวคุณจะเสียใจ | I don't want to tell you | — |
| 5186 | ทุกอย่างจะจบลงด้วยดี | It's all going to work out fine | — |
| 5187 | เล่าให้ฟังหน่อย | Can you tell me about it? | — |
| 5188 | จะไปไหนก็ไป | Go fly a kite | — |
| 5189 | จะเอาเงินไปรักษาแม่ | I will take the money to cure my mother | — |
| 5190 | ดูหมอ | To have one's fortune told | — |
| 5191 | ต้องหาวิธี | I have to find a way | — |
| 5192 | อย่าเผลอก็แล้วกัน | Watch your back | — |
| 5193 | ทำตามคำสั่ง | To follow the order | — |
| 5194 | อย่าให้ใครรู้ | Don't let anyone know | — |
| 5195 | เอาแต่ใจตัวเอง | She only wants it her way | — |
| 5196 | แกล้งทำ | To pretend to do something | — |
| 5197 | เขาเป็นปอดบวม | He has pneumonia | needsReview |
| 5198 | อย่าให้มันเกินเลย | Don't go overboard | — |
| 5199 | แน่ใจหรือว่าดี | Are you sure it's good? | — |
| 5200 | เบาๆด้วย | Keep it quiet | — |
| 5201 | คุณตบตาฉัน | You tricked me (female) | — |
| 5202 | บรรยากาศเป็นใจ | "The condition inspires it" (sexual contact or act) | — |
| 5203 | บอกมาเดี๋ยวนี้นะ | Tell me now! | — |
| 5204 | ท้องเสีย | To have diarrhea | — |
| 5205 | ตัวใครตัวมัน | To be on one's own | — |
| 5206 | ตอแหล | Liar! | mature, needsReview |
| 5207 | ท่าทางไม่ดี | It doesn't look good | — |
| 5208 | คงไม่ใช่เรื่องสำคัญ | It shouldn't be that important | — |
| 5209 | ท่าดี ทีเลว | Good look, bad performance | — |
| 5210 | ต้องเปิดตำรา | I have to consult the book | — |
| 5211 | เขาหน้าเหมือนคุณ | He looks like you | — |
| 5212 | รอนานมั้ย | Have you waited long? | — |
| 5213 | จะไม่ให้ใครรู้ | I won't let anyone know | — |
| 5214 | ไปทำบุญที่วัด | I go to make merit at the temple | — |
| 5215 | ถามอะไรหน่อยได้มั้ย | Can I ask you something? | — |
| 5216 | เปิเเผยความลับ | To tell a secret | quarantined, needsReview, **C3-corrupt** |
| 5217 | ทำแล้วสบายใจ | I feel good after I do it | — |
| 5218 | ไม่นึกเลย | I never thought so | — |
| 5219 | พูดอีก ก็ถูกอีก | You say it again, you are right again | — |
| 5220 | ทะลึ่ง | That's impertinent | needsReview |
| 5221 | ลืมหมดแล้ว | I forgot everything | — |
| 5222 | รสนิยมสูง รายได้ต่ำ | High taste, low income | — |
| 5223 | ขอโทษที่มาสาย | I'm sorry I'm late | — |
| 5224 | หนังเรื่องนี้มันมาก | This movie is really fun | — |
| 5225 | มันไม่ยากอย่างที่คิด | It's not as difficult as you think | — |
| 5739 | มีประจำเดือน | I'm having my period (formal) | mature, needsReview |

---

_Generated from the live deck. To regenerate, filter `ALL_CARDS` with `hasPhonetic`
from `src/lib/phonetics.js` — do not hand-edit rows._
