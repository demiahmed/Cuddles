"""
Centralized message configuration for special period and ovulation messages.
Used by both the notification service and the frontend UI components.
"""

# Base period soon message templates
PERIOD_SOON_TEMPLATES = [
    "🌸 Your flow begins in {days} — prepare with love and patience for your body's natural rhythm. 💕",
    "⏳ {days} until your monthly renewal. Embrace this time to honor your body's wisdom. 🌙",
    "💖 Period approaching in {days}. Stock up on self-compassion and whatever makes you feel nurtured. 🛋️",
    "🩸 Your sacred cycle starts in {days}. Time to create a sanctuary of comfort and care. �️",
    "🌹 Flow countdown: {days}. Take time for self-care and comfort. �",
    "🍫 {days} until period — gather your favorite comfort items. 💋",
    "⚡ Haja's wisdom: 'Rest is productive!' — {days} to prepare for your well-deserved downtime. �",
    "🏹 Aslam's reminder: You're amazing — {days} until your body's monthly masterpiece. 🔥",
    "🐱 Mishmish curls up for you — {days} until it's your turn for cozy comfort. 😸",
    "🎯 Your intuition is spot-on — {days} to listen to your body's signals. 🗺️",
    "⭐ Goddess mode activated: {days} days to pamper yourself before your period. ✨",
    "🎨 Your period starts in {days} — take time to prepare and care for yourself. 🖌️",
    "🌙 Luna's cycle aligns with yours — {days} sleeps until your lunar flow. 🌛",
    "💎 Precious time: {days} days until your period begins. Take it easy and be kind to yourself. 💎",
    "🦋 Your body is preparing for its monthly reset in {days} days — honor this process. 🌺",
    "🌟 {days} until your period — focus on self-care and comfort. ✨",
    "🛀 Epsom salts and essential oils await — {days} to set up your healing sanctuary. 🕯️",
    "📖 Journal your feelings, track your patterns — {days} to reflect and prepare. 📓",
    "🥗 Nutrient-dense meals and herbal teas — {days} to fuel your body's work. 🥦",
    "🧘‍♀️ Meditation and movement — {days} to center yourself before the shift. 🧘",
    "💕 Surround yourself with love and support — {days} until your cycle of care begins. 🤗",
    "🌈 Your body's rainbow of emotions deserves space — {days} to create safe passage. 🌈",
    "🕰️ Slow down and listen — {days} until your body's story unfolds. 📖",
    "🌸 Botanical allies like raspberry leaf await — {days} to gather your herbal support. 🌿",
    "💪 Take it easy — {days} until your period begins. 💪"
]# Base period countdown message templates  
PERIOD_COUNTDOWN_TEMPLATES = [
    "📅 Your period is in {days} — plenty of time to prepare! 💫",
    "🗓️ {days} until your next cycle starts — stay awesome! ✨",
    "⏰ Period countdown: {days} to go! You're doing great 💖",
    "🌟 {days} until flow time — track and take care of yourself! 🌸",
    "📆 Your next period is {days} away — keep being amazing! 💪",
    "👸 Fairoz says 'you're glowing today!' — {days} until your royal visit 💎",
    "🧠 Haja's math: {days} days = plenty of time for self-care prep! 📚",
    "🏹 Aslam's prediction skills: 0/10. Yours: perfect! {days} remaining ⭐",
    "🐱 Mishmish is napping peacefully... {days} days until your cycle begins 😴",
    "🌟 Plot twist: you're actually a time wizard — {days} days perfectly calculated! ⚡",
    "💅 Self-care mode unlocked for the next {days} days — treat yourself! ✨",
    "🚀 Mission control to goddess: {days} days until lift-off to period planet! 🌙",
    "🎭 The monthly drama begins in {days} — prepare your starring role! 🎪",
    "🏰 Castle preparations: {days} days until the royal red carpet arrival! 👑",
    "🌈 Rainbow forecast: {days} days until your colorful monthly adventure! 🦄"
]

# Fertile window message templates
FERTILE_TEMPLATES = [
    "🔥 Looks like you're in the {highlight}fertile zone{/highlight} — high chance of baby magic if you don't behave 😉",
    "💋 The stars say it's your {highlight}wild window{/highlight} — fun now could mean little feet later 👶",
    "🌶️ {highlight}Fertility's peaking!{/highlight} A little playtime now could turn into a whole new adventure 😏",
    "💃 Your body's screaming {highlight}yes{/highlight} — stay naughty, but careful 😉",
    "⚡ You're basically a {highlight}pregnancy powerhouse{/highlight} right now — handle with caution 😜",
    "🩸 Aunt Jaibu's packing her bags… 😉 Your ovaries are on {highlight}VIP mode{/highlight} — fertile and ready! 💃✨",
    "🌸 Fairoz would blush knowing you're in {highlight}peak baby-making mode{/highlight} — handle with care! 😳💕",
    "📖 Haja didn't teach you biology for you to ignore {highlight}ovulation alerts{/highlight} — be smart, beti! 🤓",
    "🏹 Aslam's aim is nothing compared to your {highlight}egg's bullseye timing{/highlight} — proceed with caution! 🎯",
    "🐱 Mishmish is giving you the side-eye... she knows you're in the {highlight}danger zone{/highlight}! 😼",
    "⚡ Your ovaries just sent a group text: '{highlight}WE'RE ONLINE{/highlight}' — proceed with wisdom! 💬",
    "🎰 Mother Nature's casino is open and you're at the {highlight}jackpot table{/highlight} — play smart! 🃏",
    "🦋 Butterfly effect alert: your {highlight}fertile wings{/highlight} are spread wide — flutter carefully! 🌺",
    "🌙 Lunar goddess mode: you're in the {highlight}sacred fertile window{/highlight} — magical things happen! ✨",
    "🎪 Welcome to the {highlight}fertility circus{/highlight} — step right up for the greatest show on earth! 🎠",
    "🛡️ {highlight}High fertility alert{/highlight} — extra protection recommended if avoiding pregnancy! ⚠️",
    "📅 {highlight}Peak fertility window{/highlight} — perfect timing whether you're trying or preventing! 📊",
    "🌡️ {highlight}Ovulation approaching{/highlight} — your body is at peak reproductive capacity! 🌡️",
    "🎯 {highlight}Fertile window active{/highlight} — stay aware of your reproductive choices! 🎯",
    "🌱 {highlight}Fertility peak{/highlight} — nature's timing is powerful, whatever your plans! 🌱"
]

def _format_days(diff_days):
    """Helper to format day count with proper pluralization"""
    return f"{diff_days} day{'s' if diff_days > 1 else ''}"

def get_period_soon_messages(diff_days):
    """Messages for when period is 5 days or less away (plain text for notifications)"""
    days_str = _format_days(diff_days)
    return [template.format(days=days_str) for template in PERIOD_SOON_TEMPLATES]

def get_period_countdown_messages(diff_days):
    """Messages for when period is more than 5 days away (plain text for notifications)"""
    days_str = f"{diff_days} days"
    return [template.format(days=days_str) for template in PERIOD_COUNTDOWN_TEMPLATES]

def get_period_soon_messages_html(diff_days):
    """HTML versions for UI display with <strong> tags"""
    days_str = f"<strong>{_format_days(diff_days)}</strong>"
    return [template.format(days=days_str) for template in PERIOD_SOON_TEMPLATES]

def get_period_countdown_messages_html(diff_days):
    """HTML versions for UI display with <strong> tags"""
    days_str = f"<strong>{diff_days} days</strong>"
    return [template.format(days=days_str) for template in PERIOD_COUNTDOWN_TEMPLATES]

def get_fertile_messages(use_html=False):
    """Get fertile messages with optional HTML formatting"""
    if use_html:
        return [template.format(highlight="<strong>", **{"/highlight": "</strong>"}) for template in FERTILE_TEMPLATES]
    else:
        return [template.format(highlight="", **{"/highlight": ""}) for template in FERTILE_TEMPLATES]

# For backward compatibility
FERTILE_MESSAGES = get_fertile_messages(use_html=False)
FERTILE_MESSAGES_HTML = get_fertile_messages(use_html=True)

# Wild sex tips - raunchy positions and dirty talk for 18:30 notifications
WILD_SEX_TIPS = [
    "🔥 Try the Reverse Cowgirl position tonight — you control the rhythm and depth! 🤠",
    "😈 Blindfold your partner and use ice cubes for intense temperature play! 🧊",
    "🍳 Kitchen counter sex: bend over and let them take you from behind! 💦",
    "🛏️ Missionary with a twist: wrap your legs around their waist for deeper penetration! �",
    "🚿 Shower sex: slippery, steamy, and perfect for standing doggy style! 💦",
    "🪑 Ride them in a chair — grind slow and tease until they beg! �",
    "� 69 position: mutual pleasure while you both reach climax together! 🐝",
    "� Woman on top: straddle them and bounce to your favorite rhythm! 🏄‍♀️",
    "🐍 Try the Python position — wrap around them like you can't get enough! 🐍",
    "🦋 Butterfly: lie back with legs up while they stand and thrust deep! 🦋",
    "🌀 Spooning sex: perfect for slow, intimate penetration from behind! 🌪️",
    "🎯 Doggy style: arch your back and push back against each thrust! 🏹",
    "🚗 Car sex in the backseat: spontaneous and thrilling! 🚙",
    "🌙 Midnight quickie: wake them up with your mouth first! 🌛",
    "🔑 Try anal play tonight — start slow with plenty of lube! 🗝️",
    "💎 The Lotus position: face-to-face intimacy with maximum connection! ✨",
    "🍑 Spanking and dirty talk: tell them exactly what you want! 🍑",
    "� Bath sex: bubbles everywhere, slippery and sensual! 🛁",
    "🎪 Circus pretzel: get creative with flexible positions! 🤸‍♀️",
    "🌶️ Add nipple clamps or light bondage for extra intensity! 🔥"
]

# Sexual health and nutrition tips for 13:00 notifications
HEALTH_NUTRITION_TIPS = [
    "🥜 Zinc from pumpkin seeds boosts testosterone and sperm quality! 💪",
    "🍫 Dark chocolate releases phenylethylamine — the 'love chemical'! 🍫",
    "🍉 Citrulline in watermelon improves blood flow to intimate areas! 🍉",
    "🥑 Avocados contain healthy fats that boost estrogen and arousal! 🥑",
    "🍓 Strawberries increase libido with natural sugars and vitamin C! 🍓",
    "🐚 Oysters provide dopamine and zinc for better sexual function! 🦪",
    "🍯 Raw honey contains boron that regulates sex hormones! 🍯",
    "🥕 Carrots improve blood circulation for stronger erections! 🥕",
    "🌶️ Capsaicin in chili peppers increases heart rate and sensitivity! 🔥",
    "🍌 Bananas provide potassium for muscle contractions during sex! 🍌",
    "🥬 Spinach contains magnesium that prevents premature ejaculation! 🥬",
    "🫐 Blueberries improve blood vessel health for better performance! 🫐",
    "🥛 Adequate hydration prevents vaginal dryness and discomfort! 💧",
    "🍊 Vitamin C from oranges boosts collagen for vaginal health! 🍊",
    "🌰 Almonds provide vitamin E for hormonal balance and lubrication! 🥜",
    "🐟 Omega-3s in salmon reduce inflammation and improve mood! 🐠",
    "🧄 Garlic improves circulation and may enhance sexual stamina! �",
    "🥒 Cucumbers hydrate and cool — perfect for post-sex recovery! 🥒",
    "🥭 Mangoes contain vitamin A for reproductive health! 🥭",
    "☕ Moderate caffeine increases alertness and sexual arousal! ☕"
]

# Period-specific health and comfort tips for 13:00 notifications during period
PERIOD_HEALTH_TIPS = [
    "🥥 Coconut water for cramps — nature's electrolyte magic! 🥥",
    "🌸 Magnesium-rich foods like almonds help with period comfort! 🥜",
    "🍵 Ginger tea = cramps' worst enemy. Sip away the discomfort! 🍵",
    "🛀 Epsom salt baths = pure relaxation for your flow days! 🛁",
    "🍫 70% dark chocolate = mood booster + antioxidant power! 🍫",
    "🥦 Iron from spinach keeps energy high during your cycle! 🥬",
    "🍯 Manuka honey soothes everything, including period woes! 🍯",
    "🧘‍♀️ Deep breathing: 4 counts in, hold 4, out 4 — instant calm! 🧘",
    "🌿 Peppermint tea for bloating — gentle and effective! 🌿",
    "🥑 Healthy fats from avocados support hormone balance! 🥑",
    "💤 Prioritize rest — your body is doing important work! 😴",
    "🧊 Cold packs on lower belly = natural pain relief! 🧊",
    "🍓 Vitamin C from berries helps with iron absorption! 🍓",
    "🫖 Chamomile tea for relaxation and better sleep! 🌙",
    "🥥 Bananas for potassium — prevents cramps and fatigue! 🍌",
    "🌱 Leafy greens for folate — supports your body's renewal! 🥬",
    "🫘 Beans and lentils for sustained energy during flow! 🫘",
    "🍠 Sweet potatoes for beta-carotene and steady blood sugar! 🍠",
    "🌰 Walnuts for omega-3s — anti-inflammatory power! 🥜",
    "🫐 Blueberries for antioxidants — combat period oxidative stress! 🫐"
]

# Achievement and milestone messages - PURE CREATIVITY, NO NUMBERS
ACHIEVEMENT_MESSAGES = [
    "� Your consistent tracking shows real dedication to your health journey! �",
    "💪 Building healthy habits takes commitment — you're crushing it! 💪",
    "� Your data tells a story of someone who takes their wellness seriously! 📈",
    "🌱 Small daily actions create big changes — you're proving that! 🌱",
    "⚡ Your tracking discipline is inspiring — keep that momentum! ⚡",
    "🎨 Every entry you log is a brushstroke in your health masterpiece! 🖼️",
    "🔥 Your streak shows you're serious about understanding your body! �",
    "💎 Precious data collected with care — that's real self-love! �",
    "� Your cycle tracking wisdom grows stronger with each entry! �",
    "� Consistency is the real achievement — you're winning at life! �",
    "� Your health journal is becoming a valuable personal resource! �",
    "🌸 Nurturing your body with knowledge — that's true empowerment! 🌸",
    "💡 Your patterns reveal insights only you can discover! 💡",
    "🎪 Your dedication to tracking creates its own kind of magic! 🎪",
    "🌈 Understanding your body better every day — that's progress! 🌈",
    "�‍♀️ Your health journey is a marathon, not a sprint — you're pacing perfectly! 🏃‍♀️",
    "🍷 Like fine wine, your self-awareness improves with time and care! �",
    "💫 Your data collection is creating a roadmap to better health! 💫",
    "🎯 Precision tracking leads to precise self-understanding! �",
    "� Your garden of health knowledge is blooming beautifully! �"
]

# Sex encouragement messages for dry spells - SUBTLE & CREATIVE
SEX_ENCOURAGEMENT_MESSAGES = [
    "💕 It's been {days} days since your last intimate moment — time to reconnect! 💕",
    "� Your body misses the touch and connection you've been tracking! 🌙",
    "💋 {days} days without intimacy — your relationship deserves some attention! 💋",
    "� That {days}-day dry spell could use some heat tonight! �",
    "🛏️ Your bed has been lonely for {days} days — change that tonight! 🛏️",
    "💑 Relationships thrive on physical connection — it's been {days} days! �",
    "� Intimacy is important for your relationship health — {days} days is too long! �",
    "⚡ Your last intimate entry was {days} days ago — time for an update! ⚡",
    "� Sweet moments together keep relationships strong — {days} days without! �",
    "� Ride the waves of passion again — it's been {days} days! �",
    "🎶 Your love song needs a new verse — {days} days of silence! 🎶",
    "💫 Physical closeness strengthens emotional bonds — {days} days apart! �",
    "🌟 Your intimacy tracking shows a gap of {days} days — fill it tonight! 🌟",
    "🦋 Break out of that {days}-day cocoon and spread your wings! 🦋",
    "� Create new memories together — it's been {days} days since the last! 🎨",
    "🍷 Relationships need regular 'tasting' — {days} days is vintage territory! �",
    "💃 Dance the intimate dance again — {days} days since your last performance! 💃",
    "🌙 Your connection deserves regular nurturing — {days} days dry! �",
    "🔑 Unlock those intimate doors — they've been closed {days} days! �",
    "🎯 Practice makes perfect — {days} days since your last target hit! �"
]

# Period-specific encouragement messages (during period, use in 18:30/21:30)
PERIOD_ENCOURAGEMENT_MESSAGES = [
    "🩸 On your period but still craving connection? Many find period sex deeply satisfying! �",
    "🌹 Period intimacy can be incredibly bonding — natural lubrication and heightened sensitivity! 🌹",
    "� Don't let your period stop the passion — try positions that avoid direct flow! �",
    "🔴 Period sex can actually help with cramps through uterine contractions and oxytocin! 🔴",
    "🍫 Satisfy those period cravings with intimate connection too! 😏",
    "🌊 Your period doesn't mean intimacy has to stop — explore what feels good! �",
    "� Many women find period sex more intense due to increased blood flow! �",
    "🎨 Get creative with towels and positions — period intimacy can be amazing! 🖼️",
    "🌙 Your cycle doesn't pause your desires — embrace them during your period! 🌛",
    "🔥 Period hormones can make intimacy feel electric — don't ignore that energy! 🔥",
    "💎 Your period is a time of power — channel it into passionate connection! 💎",
    "🎪 Period intimacy takes creativity but can be incredibly rewarding! 🎪",
    "🌹 Blood flow increases sensitivity — period sex can feel more intense! 🌹",
    "💋 Don't let period stigma stop you from enjoying intimacy! 💋",
    "🍷 Period intimacy can strengthen your bond — worth exploring! 🍷"
]

# Double entry encouragement (same day multiple entries) - POETIC & SUBTLE
DOUBLE_ENTRY_MESSAGES = [
    "🔥 Two intimate moments in one day? Your passion is on fire today! 🔥",
    "💫 Double the pleasure, double the connection — impressive energy! �",
    "� Back for seconds? That's what great intimacy does to you! �",
    "⚡ Lightning striking twice — your chemistry is electric today! ⚡",
    "🍯 Second helping of sweetness? Your intimacy game is strong! 🍯",
    "🎨 Creating multiple masterpieces in one day — artistic passion! 🖼️",
    "🌊 Two waves of pleasure today — riding high on your connection! 🌊",
    "🔥 Morning and evening sessions? Keeping the fire burning bright! 🔥",
    "🌙 Crescent and full moon intimacy — experiencing all phases today! 🌙",
    "🎯 Double bullseye on pleasure — your aim is perfect today! �",
    "🦋 Two transformations in one day — evolving beautifully together! 🦋",
    "🍷 Morning toast and evening champagne — celebrating intimacy! 🍷",
    "⭐ Two shooting stars in one sky — your wishes are coming true! ⭐",
    "🌈 Double rainbow of pleasure — what a colorful day! �",
    "🎪 Two standing ovations for your intimate performance! 🎭",
    "🌸 Spring and summer blooms — your passion spans all seasons! �",
    "💫 Two comets lighting up the sky — spectacular intimacy! �",
    "🎵 Symphony and encore — your love song has multiple movements! 🎼",
    "🌺 Double blossoming today — your connection is flourishing! 🌺",
    "🎯 Two perfect shots today — your intimate archery skills shine! 🎯"
]

# Weekly/monthly streak celebration messages - NO METRICS FOCUS
STREAK_MESSAGES = [
    "🌸 Your consistent intimacy tracking shows real commitment to your relationship! �",
    "☀️ Greeting each day with intimate connection — that's dedication! ☀️",
    "🎶 Your love rhythm is strong and steady this {period}! �",
    "🌊 Smooth sailing in your intimate waters this {period}! �",
    "🔥 Your passion stays lit through consistent connection! �",
    "🦋 Beautiful transformation through regular intimacy! 🦋",
    "⚡ Your intimate energy is powerful and consistent! ⚡",
    "🍯 Sweet rewards from maintaining your connection! 🍯",
    "🌙 Your intimate cycles align perfectly this {period}! 🌙",
    "🎨 Creating lasting intimacy art through consistency! 🎨"
]

# Fun facts and orgasm celebration messages - EDUCATIONAL & PLAYFUL
ORGASM_CELEBRATION_MESSAGES = [
    "💫 Did you know? Your brain releases the same chemicals as eating chocolate... but 10x stronger! 🍫",
    "🌊 Ocean fact: Blue whales can't reach the depths you just explored! 🐋",
    "⚡ Lightning fact: You just generated more electricity than a small thunderstorm! 🌩️",
    "🎆 Fireworks fact: New Year's Eve has nothing on your personal celebration! 🎊",
    "🌋 Volcano fact: Mount Vesuvius wishes it could erupt with your intensity! 🌋",
    "🚀 Space fact: You just experienced more Gs than astronauts during launch! 🛸",
    "🎵 Music fact: Beethoven's 9th Symphony lasted shorter than your crescendo! 🎼",
    "🌈 Rainbow fact: You just created more colors than a prism in sunlight! 🌈",
    "⭐ Star fact: Supernovas are less explosive than what you just experienced! ✨",
    "🌸 Nature fact: Cherry blossoms bloom once a year, you bloom whenever you want! 🌺",
    "🎪 Circus fact: Trapeze artists wish they could fly as high as you just did! 🎪",
    "🍯 Honey fact: A bee visits 2 million flowers for one pound... you just made 2 million flowers bloom! 🐝",
    "🌊 Tsunami fact: You just created bigger waves than the Pacific Ocean! 🌊",
    "🔥 Fire fact: The sun burns at 27 million degrees, you just reached 28 million! ☀️",
    "💎 Diamond fact: Takes billions of years to form underground, you created one in minutes! 💎"
]

# Intimate connection and desire messages - SOULFUL & DEEP
INTIMATE_CONNECTION_MESSAGES = [
    "💕 Connection level: Bluetooth has nothing on your soul-to-soul transmission! 📡",
    "🧲 Magnetic attraction detected! Scientists want to study your gravitational pull! 🌌",
    "🎭 Chemistry class: You two just created elements not found on periodic table! ⚗️",
    "🌺 Pollination success: Even bees are jealous of your natural harmony! 🐝",
    "🎵 Frequency match: You're vibrating on the same wavelength as the universe! 📻",
    "🔥 Heat signature: Infrared cameras can't capture the warmth you generate! 🌡️",
    "🌙 Lunar alignment: Your cycles are more synchronized than Swiss watches! ⏰",
    "💫 Gravity defied: You two just created your own orbit around each other! 🌍",
    "🎨 Color palette: You're painting outside the lines of ordinary love! 🖌️",
    "⚡ Electrical current: Tesla coils wish they could conduct your energy! 🔌",
    "🌊 Ocean depth: Marianas Trench is shallow compared to your connection! 🐠",
    "🦋 Migration pattern: Even butterflies navigate with less precision than your hearts! 🗺️",
    "🌸 Seasonal bloom: You've created eternal spring in your private garden! 🌿",
    "🎯 Perfect aim: Cupid retired after witnessing your precision targeting! 💘",
    "🔮 Crystal ball: Fortune tellers study your future-predicting intuition! ✨"
]

# 9:30 PM wellness reminder messages (sent when today's log is missing)
WELLNESS_REMINDER_MESSAGES = [
    "Haven't logged today yet — takes 60 seconds and helps you spot patterns 🌙",
    "Your wellness log is empty today. A quick check-in before bed keeps the streaks going 📓",
    "Before you sleep — mood, sleep, food. 60 seconds, big picture 🌸",
    "Tonight's the last chance to log today's wellness. Future you will thank you ✨",
    "No wellness entry yet today. Log it quick before you drift off 💤",
]

# Notification messages used by the notification service
NOTIFICATION_MESSAGES = {
    'period_soon': PERIOD_SOON_TEMPLATES,
    'period_countdown': PERIOD_COUNTDOWN_TEMPLATES,
    'fertile': [template.format(highlight="", **{"/highlight": ""}) for template in FERTILE_TEMPLATES],
    'wild_sex_tips': WILD_SEX_TIPS,
    'health_nutrition': HEALTH_NUTRITION_TIPS,
    'period_health': PERIOD_HEALTH_TIPS,
    'achievements': ACHIEVEMENT_MESSAGES,
    'sex_encouragement': SEX_ENCOURAGEMENT_MESSAGES,
    'period_encouragement': PERIOD_ENCOURAGEMENT_MESSAGES,
    'double_entry': DOUBLE_ENTRY_MESSAGES,
    'streaks': STREAK_MESSAGES,
    'orgasm_celebration': ORGASM_CELEBRATION_MESSAGES,
    'intimate_connection': INTIMATE_CONNECTION_MESSAGES,
    'wellness_reminder': WELLNESS_REMINDER_MESSAGES,
}