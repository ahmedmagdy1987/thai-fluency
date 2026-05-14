# Thai Text Integrity — Fix Report

Companion to the previous content-integrity work. The
missing-phonetics audit surfaced a pile of cards whose **Thai** field
was wrapped in stray ASCII or curly quote characters left over from the
original TXT import — e.g. card 4994 was storing `"หูหนวก"` literally,
with a leading ASCII straight quote and a trailing curly close quote.

## Summary

- **Cards scanned with quote chars in Thai field:** 294 (out of 4 791 total)
- **Cards fixed (HIGH-confidence wrapper strip):** 293
- **Cards left for editorial / native review:** 1

### Buckets used by the audit

| Bucket | What it means | Action |
|---|---|---|
| `both-ends-clean` | First + last char are quote characters; nothing between them is a quote | **Auto-fixed** — strip both boundaries |
| `lead-only`       | Only the first char is a quote; no quotes anywhere else | **Auto-fixed** — strip leading char |
| `trail-only`      | Only the last char is a quote; no quotes anywhere else | **Auto-fixed** — strip trailing char |
| `internal-only`   | Quotes only inside the string, never at boundaries | Left for review (could be intentional) |
| `complex`         | Quotes at boundary **and** inside | Left for review (likely a synonym separator) |

All four eligible mismatched-quote forms were observed in the data:
`"…"` / `"…"` / `"…"` / `"…"`. The fix is uniform — strip whichever
quote chars are at the boundary, regardless of which form they take.

## Per-card table

| Status | Card ID | Stage | Old Thai | New Thai | Reason |
|---|---|---|---|---|---|
| Fixed | 5144 | S4 | "ออกรถ” | ออกรถ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4937 | S5 | “ปวดฉี่” | ปวดฉี่ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4957 | S5 | “สอบตก” | สอบตก | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4961 | S5 | “แอบดู” | แอบดู | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4967 | S5 | “ตามใจคุณ” | ตามใจคุณ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4969 | S5 | “ขึ้นๆ ลงๆ” | ขึ้นๆ ลงๆ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5001 | S5 | "จริงเหรอ” | จริงเหรอ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5033 | S5 | "สวยไปหมด” | สวยไปหมด | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5042 | S5 | "ทำได้ไง” | ทำได้ไง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5049 | S5 | "กล้าพูด” | กล้าพูด | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5119 | S5 | "ไปก่อนนะ” | ไปก่อนนะ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5122 | S5 | "ไปได้แล้ว” | ไปได้แล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5129 | S5 | "ติดลม” | ติดลม | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5190 | S5 | "ดูหมอ” | ดูหมอ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5196 | S5 | "แกล้งทำ” | แกล้งทำ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5200 | S5 | "เบาๆด้วย” | เบาๆด้วย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5218 | S5 | "ไม่นึกเลย” | ไม่นึกเลย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4928 | S6 | “คนหลายใจ” | คนหลายใจ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4930 | S6 | “คุณฝีมือดี” | คุณฝีมือดี | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4934 | S6 | “ทำกับมือ” | ทำกับมือ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4941 | S6 | “บอกแล้วไง” | บอกแล้วไง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4942 | S6 | “คุณตัวร้อน” | คุณตัวร้อน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4949 | S6 | “ไม่เห็นจริงๆ” | ไม่เห็นจริงๆ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4954 | S6 | “หนีไปเที่ยว” | หนีไปเที่ยว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4964 | S6 | “ทำแรงเกินไป” | ทำแรงเกินไป | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4966 | S6 | “ทำหลบๆซ่อนๆ" | ทำหลบๆซ่อนๆ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4970 | S6 | “ไหนๆ ก็ไหนๆ” | ไหนๆ ก็ไหนๆ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4973 | S6 | “ฝีมือตก” | ฝีมือตก | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4976 | S6 | "เขาเองเหรอ” | เขาเองเหรอ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4977 | S6 | "อดไม่ได้” | อดไม่ได้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4981 | S6 | "ขอแก้ตัว” | ขอแก้ตัว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4987 | S6 | "ผมไม่เกี่ยว” | ผมไม่เกี่ยว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4988 | S6 | "มีเรื่องด่วน” | มีเรื่องด่วน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4989 | S6 | "เอาเป็นว่า...” | เอาเป็นว่า... | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4994 | S6 | "หูหนวก” | หูหนวก | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5018 | S6 | "ไปไหนกันมา” | ไปไหนกันมา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5023 | S6 | "มีแต่ปัญหา” | มีแต่ปัญหา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5030 | S6 | "หนีตามแฟน” | หนีตามแฟน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5035 | S6 | "ไม่ไหวแล้ว” | ไม่ไหวแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5036 | S6 | "เรียนต่อ” | เรียนต่อ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5040 | S6 | "ทีละคน” | ทีละคน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5044 | S6 | "ตื่นได้แล้ว” | ตื่นได้แล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5045 | S6 | "ถูกแฟนทิ้ง” | ถูกแฟนทิ้ง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5061 | S6 | "ตายเป็นตาย” | ตายเป็นตาย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5071 | S6 | "เกือบไปแล้ว” | เกือบไปแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5079 | S6 | "โมโหหิว” | โมโหหิว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5086 | S6 | "คุณชอบเถียง” | คุณชอบเถียง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5115 | S6 | "ขอลองหน่อย” | ขอลองหน่อย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5132 | S6 | "ทำใจไม่ได้” | ทำใจไม่ได้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5136 | S6 | "มันไม่เหมาะ” | มันไม่เหมาะ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5146 | S6 | "ขอให้รวยๆ” | ขอให้รวยๆ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5150 | S6 | "นอนก่อนเลย” | นอนก่อนเลย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5152 | S6 | "เลือกไม่ถูก” | เลือกไม่ถูก | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5153 | S6 | "ตายเป็นผี” | ตายเป็นผี | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5154 | S6 | "เขาทนอยู่” | เขาทนอยู่ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5167 | S6 | "อย่าหาเรื่อง” | อย่าหาเรื่อง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5212 | S6 | "รอนานมั้ย” | รอนานมั้ย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5221 | S6 | "ลืมหมดแล้ว” | ลืมหมดแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4929 | S7 | “คิดจนหัวปั่น” | คิดจนหัวปั่น | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4932 | S7 | “เราแย่งกันกิน” | เราแย่งกันกิน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4933 | S7 | “ยังไม่ถึงเดือน” | ยังไม่ถึงเดือน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4935 | S7 | “จ่ายค่าเช่า” | จ่ายค่าเช่า | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4938 | S7 | “นึกว่าคุณไม่ชอบ” | นึกว่าคุณไม่ชอบ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4939 | S7 | “ไม่นานขนาดนั้น” | ไม่นานขนาดนั้น | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4940 | S7 | “อยู่เฝ้าบ้าน” | อยู่เฝ้าบ้าน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4943 | S7 | “ว่าแต่คุณล่ะ” | ว่าแต่คุณล่ะ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4944 | S7 | “ไม่อยากลองดี” | ไม่อยากลองดี | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4945 | S7 | “ไม่บอกก็รู้” | ไม่บอกก็รู้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4946 | S7 | “ขอแก้แค้น” | ขอแก้แค้น | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4950 | S7 | “น่าสงสาร” | น่าสงสาร | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4952 | S7 | “รู้ไม่ทันคุณ” | รู้ไม่ทันคุณ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4953 | S7 | “ไว้ใจไม่ได้” | ไว้ใจไม่ได้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4958 | S7 | “ยกมือขึ้น” | ยกมือขึ้น | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4963 | S7 | “ไม่รู้จะทำไง” | ไม่รู้จะทำไง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4971 | S7 | “ปากหวาน” | ปากหวาน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4972 | S7 | “ไม่มียางอาย” | ไม่มียางอาย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4975 | S7 | “จะทำให้ได้” | จะทำให้ได้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4979 | S7 | "ตามคุณไม่ทัน” | ตามคุณไม่ทัน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4984 | S7 | "รีบไปรีบมา” | รีบไปรีบมา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4985 | S7 | "อิจฉาตาร้อน” | อิจฉาตาร้อน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4996 | S7 | "กำลังแพ้ท้อง” | กำลังแพ้ท้อง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4998 | S7 | "ปรับความเข้าใจ” | ปรับความเข้าใจ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5000 | S7 | "ชอบใจลอย” | ชอบใจลอย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5006 | S7 | "บ้ารึเปล่า” | บ้ารึเปล่า | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5008 | S7 | "ใช้ได้มั้ย” | ใช้ได้มั้ย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5009 | S7 | "หายป่วยแล้ว” | หายป่วยแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5011 | S7 | "มันธรรมดา” | มันธรรมดา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5021 | S7 | "ทำไมพึ่งจะบอก” | ทำไมพึ่งจะบอก | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5031 | S7 | "เบื่อชีวิต” | เบื่อชีวิต | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5034 | S7 | "เผลอไม่ได้” | เผลอไม่ได้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5037 | S7 | "ต้องมีอะไรแน่ๆ” | ต้องมีอะไรแน่ๆ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5038 | S7 | "แทบจะบ้า” | แทบจะบ้า | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5043 | S7 | "เข้ากันไม่ได้” | เข้ากันไม่ได้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5046 | S7 | "ทำตามสัญญา” | ทำตามสัญญา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5051 | S7 | "มันจะดีเหรอ” | มันจะดีเหรอ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5052 | S7 | "เก็บแรงไว้” | เก็บแรงไว้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5055 | S7 | "อย่าหลงเชื่อ” | อย่าหลงเชื่อ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5056 | S7 | "ไม่รู้จะทำยังไง” | ไม่รู้จะทำยังไง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5057 | S7 | "หัวอกเดียวกัน” | หัวอกเดียวกัน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5058 | S7 | "ว่างๆ จะมาหา” | ว่างๆ จะมาหา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5059 | S7 | "พูดอย่าง ทำอย่าง” | พูดอย่าง ทำอย่าง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5065 | S7 | "ไม่น่าพูดเลย” | ไม่น่าพูดเลย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5068 | S7 | "คุณเป็นต้นเหตุ” | คุณเป็นต้นเหตุ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5069 | S7 | "หาทางแก้ไข” | หาทางแก้ไข | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5075 | S7 | "อย่าไปโทษเขา” | อย่าไปโทษเขา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5077 | S7 | "ทำยังงี้ไม่ถูก” | ทำยังงี้ไม่ถูก | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5080 | S7 | "เราเสียลูกค้า” | เราเสียลูกค้า | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5089 | S7 | "แค้นต้องชำระ” | แค้นต้องชำระ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5092 | S7 | "ผมต้องลงโทษคุณ” | ผมต้องลงโทษคุณ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5093 | S7 | "คุณหวังมากเกินไป” | คุณหวังมากเกินไป | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5096 | S7 | "ผมโดนหักหลัง” | ผมโดนหักหลัง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5097 | S7 | "หายโกรธรึยัง” | หายโกรธรึยัง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5103 | S7 | "คุณหมายถึงอะไร” | คุณหมายถึงอะไร | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5105 | S7 | "ได้ประโยชน์อะไร” | ได้ประโยชน์อะไร | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5111 | S7 | "เลยเวลานัดแล้ว” | เลยเวลานัดแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5113 | S7 | "รองเท้ากัด” | รองเท้ากัด | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5116 | S7 | "ไม่อยากมีเรื่อง” | ไม่อยากมีเรื่อง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5118 | S7 | "งานนี้สนุกแน่” | งานนี้สนุกแน่ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5120 | S7 | "มานานรึยัง” | มานานรึยัง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5121 | S7 | "ทีหลังอย่าทำ” | ทีหลังอย่าทำ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5127 | S7 | "คิดถึงใจจะขาด” | คิดถึงใจจะขาด | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5133 | S7 | "มีแค่นี้เอง” | มีแค่นี้เอง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5134 | S7 | "ได้ยินกับหู” | ได้ยินกับหู | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5135 | S7 | "ได้เสียกันแล้ว” | ได้เสียกันแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5137 | S7 | "ไม่ใช่ความผิดฉัน” | ไม่ใช่ความผิดฉัน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5147 | S7 | "เป็นคนละคน” | เป็นคนละคน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5149 | S7 | "จะให้ทำยังไง” | จะให้ทำยังไง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5158 | S7 | "เงินล่วงหน้า” | เงินล่วงหน้า | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5159 | S7 | "รับไม่ได้” | รับไม่ได้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5163 | S7 | "มองตาค้าง” | มองตาค้าง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5164 | S7 | "สักพักใหญ่ๆ” | สักพักใหญ่ๆ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5166 | S7 | "ต้องทำให้ได้” | ต้องทำให้ได้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5169 | S7 | "อันเดียวพอ” | อันเดียวพอ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5170 | S7 | "ไม่ชอบนั่งเฉยๆ” | ไม่ชอบนั่งเฉยๆ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5171 | S7 | "จะดูลายมือให้” | จะดูลายมือให้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5174 | S7 | "โดนเล่นงาน” | โดนเล่นงาน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5176 | S7 | "อย่าไปกวนเขา” | อย่าไปกวนเขา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5181 | S7 | "เล่นละครเก่ง” | เล่นละครเก่ง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5184 | S7 | "จำเป็นต้องทำ” | จำเป็นต้องทำ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5187 | S7 | "เล่าให้ฟังหน่อย” | เล่าให้ฟังหน่อย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5188 | S7 | "จะไปไหนก็ไป” | จะไปไหนก็ไป | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5191 | S7 | "ต้องหาวิธี” | ต้องหาวิธี | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5193 | S7 | "ทำตามคำสั่ง” | ทำตามคำสั่ง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5194 | S7 | "อย่าให้ใครรู้” | อย่าให้ใครรู้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5199 | S7 | "แน่ใจหรือว่าดี” | แน่ใจหรือว่าดี | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5201 | S7 | "คุณตบตาฉัน” | คุณตบตาฉัน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5203 | S7 | "บอกมาเดี๋ยวนี้นะ” | บอกมาเดี๋ยวนี้นะ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5205 | S7 | "ตัวใครตัวมัน” | ตัวใครตัวมัน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5207 | S7 | "ท่าทางไม่ดี” | ท่าทางไม่ดี | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5209 | S7 | "ท่าดี ทีเลว” | ท่าดี ทีเลว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5210 | S7 | "ต้องเปิดตำรา” | ต้องเปิดตำรา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5211 | S7 | "เขาหน้าเหมือนคุณ” | เขาหน้าเหมือนคุณ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5213 | S7 | "จะไม่ให้ใครรู้” | จะไม่ให้ใครรู้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5214 | S7 | "ไปทำบุญที่วัด” | ไปทำบุญที่วัด | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5217 | S7 | "ทำแล้วสบายใจ” | ทำแล้วสบายใจ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5223 | S7 | "ขอโทษที่มาสาย” | ขอโทษที่มาสาย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4777 | S8 | "อย่ายุ่งได้มั้ย | อย่ายุ่งได้มั้ย | Stripped stray wrapper quote characters (lead-only). Thai content unchanged. |
| Fixed | 4856 | S8 | "เดี๋ยวอย่างนี้ | เดี๋ยวอย่างนี้ | Stripped stray wrapper quote characters (lead-only). Thai content unchanged. |
| Fixed | 4931 | S8 | “ห้ามเข้า” | ห้ามเข้า | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4936 | S8 | “ดำปิ๊ดปี๋” | ดำปิ๊ดปี๋ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4947 | S8 | “เธอเป็นลม” | เธอเป็นลม | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4948 | S8 | “ก่าเขาจะมาก็ดึกแล้ว” | ก่าเขาจะมาก็ดึกแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4951 | S8 | “ดีขนาดนั้นเลยเหรอ” | ดีขนาดนั้นเลยเหรอ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4955 | S8 | “กลางวันแสกๆ” | กลางวันแสกๆ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4956 | S8 | “ได้เวลาแล้ว” | ได้เวลาแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4959 | S8 | “เขาเพึ่งจะไป” | เขาเพึ่งจะไป | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4960 | S8 | “นักพนันมืออาชีพ” | นักพนันมืออาชีพ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4962 | S8 | “ยังไม่เข็ด” | ยังไม่เข็ด | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4965 | S8 | “หัวเด็ดตีนขาด ยังไงก็ไม่ทำ" | หัวเด็ดตีนขาด ยังไงก็ไม่ทำ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4968 | S8 | “กินไม่ได้ นอนไม่หลับ” | กินไม่ได้ นอนไม่หลับ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4974 | S8 | “สักวัน” | สักวัน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4978 | S8 | "คืนดีกันแล้ว” | คืนดีกันแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4980 | S8 | "อยู่กันสองต่อสอง” | อยู่กันสองต่อสอง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4982 | S8 | "นอนทั้งวันทั้งคืน” | นอนทั้งวันทั้งคืน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4983 | S8 | "แกล้งโง่หรือโง่จริงๆ” | แกล้งโง่หรือโง่จริงๆ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4986 | S8 | "ดูท่าทางไม่ค่อยดี” | ดูท่าทางไม่ค่อยดี | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4990 | S8 | "ขอบอกก่อนว่า...” | ขอบอกก่อนว่า... | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4991 | S8 | "ไม่อยากคบกับเขา” | ไม่อยากคบกับเขา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4992 | S8 | "เขาชอบนินทา” | เขาชอบนินทา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4997 | S8 | "ขอนั่งด้วยคนได้มั้ย” | ขอนั่งด้วยคนได้มั้ย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 4999 | S8 | "เขาไม่พูดสักคำ” | เขาไม่พูดสักคำ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5002 | S8 | "แล้วทีนี้่จะทำยังไง” | แล้วทีนี้่จะทำยังไง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5003 | S8 | "มีพิรุธ” | มีพิรุธ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5004 | S8 | "ยังมีอีกเยอะ” | ยังมีอีกเยอะ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5005 | S8 | "ที่เหลือ” | ที่เหลือ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5007 | S8 | "ท่าทางมีความสุข” | ท่าทางมีความสุข | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5010 | S8 | "ถ้าไม่ได้คุณ ฉันคงแย่” | ถ้าไม่ได้คุณ ฉันคงแย่ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5012 | S8 | "โสดแต่ไม่สด” | โสดแต่ไม่สด | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5013 | S8 | "เสียแรงที่ไว้ใจคุณ” | เสียแรงที่ไว้ใจคุณ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5014 | S8 | "ขอสงบสติอารมณ์” | ขอสงบสติอารมณ์ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5015 | S8 | "ยินดีรับใช้” | ยินดีรับใช้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5016 | S8 | "มันเป็นกฏ” | มันเป็นกฏ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5017 | S8 | "เขาไม่สมประกอบ” | เขาไม่สมประกอบ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5019 | S8 | "ไม่อยากยุ่งเรื่องชาวบ้าน” | ไม่อยากยุ่งเรื่องชาวบ้าน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5020 | S8 | "ไปคุยกันที่บ้านดีกว่า” | ไปคุยกันที่บ้านดีกว่า | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5022 | S8 | "อยากคบคุณเป็นเพื่อน” | อยากคบคุณเป็นเพื่อน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5024 | S8 | "เดือนหน้านายจะขึ้นเงินให้” | เดือนหน้านายจะขึ้นเงินให้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5025 | S8 | "เปิดอีเมล์ดูรึยัง” | เปิดอีเมล์ดูรึยัง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5026 | S8 | "กลัวถูกแม่ด่า” | กลัวถูกแม่ด่า | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5027 | S8 | "อยากเจอคนที่รู้ใจ” | อยากเจอคนที่รู้ใจ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5028 | S8 | "เรื่องอยู่บนข่าวหน้าหนึ่ง” | เรื่องอยู่บนข่าวหน้าหนึ่ง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5029 | S8 | "ดูแลตัวเองให้ดี” | ดูแลตัวเองให้ดี | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5032 | S8 | "อยากหารายได้เสริม” | อยากหารายได้เสริม | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5039 | S8 | "เร็วๆเข้า” | เร็วๆเข้า | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5047 | S8 | "เราเป็นเนื้อคู่กัน” | เราเป็นเนื้อคู่กัน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5048 | S8 | "ขอปิดเป็นความลับ” | ขอปิดเป็นความลับ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5053 | S8 | "ดูแต่ตา” | ดูแต่ตา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5060 | S8 | "เขามาตั้งแต่หัวค่ำ” | เขามาตั้งแต่หัวค่ำ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5062 | S8 | "จะพาไปส่งบ้าน” | จะพาไปส่งบ้าน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5063 | S8 | "ปฎิเสธไม่ได้” | ปฎิเสธไม่ได้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5064 | S8 | "เขาไม่โทรหาตั้งนาน” | เขาไม่โทรหาตั้งนาน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5066 | S8 | "นี่มันเรื่องส่วนตัว” | นี่มันเรื่องส่วนตัว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5067 | S8 | "ไม่ได้ตั้งใจ” | ไม่ได้ตั้งใจ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5070 | S8 | "เมียขอหย่า” | เมียขอหย่า | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5072 | S8 | "เรื่องน่าขำ” | เรื่องน่าขำ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Left for native review | 5073 | S8 | "เป็นเมนส์ " มีประจำเดือน” | "เป็นเมนส์ " มีประจำเดือน” | Quote chars appear at boundary AND inside the string — likely a multi-synonym import artifact. Editorial decision needed on how to separate the two phrases (slash, space, or comma). |
| Fixed | 5074 | S8 | "จะเล่าคามจริงให้ฟัง” | จะเล่าคามจริงให้ฟัง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5076 | S8 | "ลองจินตนาการดู” | ลองจินตนาการดู | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5078 | S8 | "ผมผิดข้อหาอะไร” | ผมผิดข้อหาอะไร | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5081 | S8 | "จะไม่ยอมให้คุณทำกับฉันยังงี้” | จะไม่ยอมให้คุณทำกับฉันยังงี้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5082 | S8 | "ซึ้งแล้วใช่มั้ย” | ซึ้งแล้วใช่มั้ย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5083 | S8 | "เขาติดคุกอยู่” | เขาติดคุกอยู่ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5084 | S8 | "พยยามรวบรวมเงิน” | พยยามรวบรวมเงิน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5085 | S8 | "ครานี้ซวยแน่” | ครานี้ซวยแน่ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5087 | S8 | "ต้องจัดการให้เร็วที่สุด” | ต้องจัดการให้เร็วที่สุด | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5088 | S8 | "มักมากในกาม” | มักมากในกาม | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5090 | S8 | "งานต้องมาก่อน” | งานต้องมาก่อน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5091 | S8 | "ค่าจ้างงวดแรก” | ค่าจ้างงวดแรก | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5094 | S8 | "เดินทางข้ามน้ำข้ามทะเล” | เดินทางข้ามน้ำข้ามทะเล | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5095 | S8 | "อะไรกันนักกันหนา” | อะไรกันนักกันหนา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5098 | S8 | "เธอท้องได้สามเดือน” | เธอท้องได้สามเดือน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5099 | S8 | "ฉันจะไม่ลืมบุญคุณ” | ฉันจะไม่ลืมบุญคุณ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5100 | S8 | "คุณเป็นใครกันแน่” | คุณเป็นใครกันแน่ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5101 | S8 | "ไม่มีอะไรสำคัญกว่านี้” | ไม่มีอะไรสำคัญกว่านี้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5102 | S8 | "พนักงานชั่วคราว” | พนักงานชั่วคราว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5104 | S8 | "ทำไมไม่บอกให้รู้ก่อน” | ทำไมไม่บอกให้รู้ก่อน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5106 | S8 | "ใครรับผิดชอบ” | ใครรับผิดชอบ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5107 | S8 | "ฉันเป็นคนช่างฝัน” | ฉันเป็นคนช่างฝัน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5108 | S8 | "เขตอันตราย” | เขตอันตราย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5109 | S8 | "เขาทำงานแบบไม่ลืมหูลืมตา” | เขาทำงานแบบไม่ลืมหูลืมตา | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5110 | S8 | "อยากได้อะไร บอกได้เลย” | อยากได้อะไร บอกได้เลย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5112 | S8 | "จะอธิบายยังไงดี” | จะอธิบายยังไงดี | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5114 | S8 | "ทำแล้วก็ไม่ดีขึ้น” | ทำแล้วก็ไม่ดีขึ้น | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5117 | S8 | "หวงไว้ทำไม” | หวงไว้ทำไม | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5123 | S8 | "ต้องพิสูจน์ให้เห็น” | ต้องพิสูจน์ให้เห็น | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5124 | S8 | "ตั้งหน้าตั้งตารอ” | ตั้งหน้าตั้งตารอ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5125 | S8 | "ตัวแทนจากบริษัท” | ตัวแทนจากบริษัท | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5126 | S8 | "แบบนี้แหล่ะ ดีแล้ว” | แบบนี้แหล่ะ ดีแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5128 | S8 | "เดินเร็วๆ หน่อยไม่ได้เหรอ” | เดินเร็วๆ หน่อยไม่ได้เหรอ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5130 | S8 | "ชื่นใจจังเลย” | ชื่นใจจังเลย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5131 | S8 | "ไม่ต้องบอกก็รู้” | ไม่ต้องบอกก็รู้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5138 | S8 | "มาตั้งแต่เมื่อไร” | มาตั้งแต่เมื่อไร | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5139 | S8 | "ผู้ชายหน้าโง่” | ผู้ชายหน้าโง่ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5140 | S8 | "มันไม่ใช่ของง่าย” | มันไม่ใช่ของง่าย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5141 | S8 | "จะพาแฟนไปด้วย” | จะพาแฟนไปด้วย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5142 | S8 | "แน่นะ” | แน่นะ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5143 | S8 | "ถึงเวลาแล้ว” | ถึงเวลาแล้ว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5145 | S8 | "จะอยู่อีกนานมั้ย” | จะอยู่อีกนานมั้ย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5148 | S8 | "เสียวไส้” | เสียวไส้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5155 | S8 | "กำลังยืดเส้นยืดสาย” | กำลังยืดเส้นยืดสาย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5156 | S8 | "เอาไว้คราวหน้าก็แล้วกัน” | เอาไว้คราวหน้าก็แล้วกัน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5157 | S8 | "ทีละเล็ก ทีละน้อย” | ทีละเล็ก ทีละน้อย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5160 | S8 | "เสร็จธุระแล้วรีบกลับบ้าน” | เสร็จธุระแล้วรีบกลับบ้าน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5161 | S8 | "ทำเป็นไม่รู้ไม่ชี้” | ทำเป็นไม่รู้ไม่ชี้ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5162 | S8 | "ไม่ต้องรอทานข้าว” | ไม่ต้องรอทานข้าว | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5165 | S8 | "ธุรกิจเฟื่องฟู” | ธุรกิจเฟื่องฟู | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5168 | S8 | "ทำเปนไม่รูู้ไม่เห็น” | ทำเปนไม่รูู้ไม่เห็น | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5172 | S8 | "ไม่เข้ากับบรรยากาศ” | ไม่เข้ากับบรรยากาศ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5173 | S8 | "ชอบนั่งริมหน้าต่าง” | ชอบนั่งริมหน้าต่าง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5175 | S8 | "จู่ๆ ก็ได้เจอ” | จู่ๆ ก็ได้เจอ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5177 | S8 | "ต้องระวังเป็นพิเศษ” | ต้องระวังเป็นพิเศษ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5178 | S8 | "บริการที่ยอดเยี่ยม” | บริการที่ยอดเยี่ยม | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5179 | S8 | "ให้รางวัลกับตัวเอง” | ให้รางวัลกับตัวเอง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5180 | S8 | "ซ้อมร้องเพลงอยู่” | ซ้อมร้องเพลงอยู่ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5182 | S8 | "ไม่ใช่ความผิดของใคร” | ไม่ใช่ความผิดของใคร | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5183 | S8 | "ดวงเป็นตัวกำหนด” | ดวงเป็นตัวกำหนด | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5185 | S8 | "ไม่อยากบอก กลัวคุณจะเสียใจ” | ไม่อยากบอก กลัวคุณจะเสียใจ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5186 | S8 | "ทุกอย่างจะจบลงด้วยดี” | ทุกอย่างจะจบลงด้วยดี | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5189 | S8 | "จะเอาเงินไปรักษาแม่” | จะเอาเงินไปรักษาแม่ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5192 | S8 | "อย่าเผลอก็แล้วกัน” | อย่าเผลอก็แล้วกัน | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5195 | S8 | "เอาแต่ใจตัวเอง” | เอาแต่ใจตัวเอง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5197 | S8 | "เขาเป็นปอดบวม” | เขาเป็นปอดบวม | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5198 | S8 | "อย่าให้มันเกินเลย” | อย่าให้มันเกินเลย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5202 | S8 | "บรรยากาศเป็นใจ” | บรรยากาศเป็นใจ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5204 | S8 | "ท้องเสีย” | ท้องเสีย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5206 | S8 | "ตอแหล” | ตอแหล | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5208 | S8 | "คงไม่ใช่เรื่องสำคัญ” | คงไม่ใช่เรื่องสำคัญ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5215 | S8 | "ถามอะไรหน่อยได้มั้ย” | ถามอะไรหน่อยได้มั้ย | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5216 | S8 | "เปิเเผยความลับ” | เปิเเผยความลับ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5219 | S8 | "พูดอีก ก็ถูกอีก” | พูดอีก ก็ถูกอีก | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5220 | S8 | "ทะลึ่ง” | ทะลึ่ง | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5222 | S8 | "รสนิยมสูง รายได้ต่ำ” | รสนิยมสูง รายได้ต่ำ | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5224 | S8 | "หนังเรื่องนี้มันมาก” | หนังเรื่องนี้มันมาก | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |
| Fixed | 5225 | S8 | "มันไม่ยากอย่างที่คิด” | มันไม่ยากอย่างที่คิด | Stripped stray wrapper quote characters (both-ends-clean). Thai content unchanged. |

## What was NOT changed

- Thai script *content* was preserved verbatim — only the boundary
  quote characters were stripped. No characters inside the Thai content
  were modified, replaced, or normalized.
- English, phonetic, note, category, stage, type, id, and order all
  unchanged.
- No UI, auth, OneSignal, character coach, reward system, or database
  edits.

## How to re-run

```bash
node scripts/audit-thai-quote-corruption.mjs           # read-only scan
node scripts/fix-thai-quote-wrappers.mjs               # dry-run
node scripts/fix-thai-quote-wrappers.mjs --write       # apply
node scripts/write-thai-quote-report.mjs               # regenerate this report
```