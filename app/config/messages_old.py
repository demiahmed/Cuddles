"""
Centralized message configuration for special period and ovulation messages.
Used by both the notification service and the frontend UI components.
"""

# Base period soon message templates
PERIOD_SOON_TEMPLATES = [
    "🌸 Your next period is in {days} — stock up on chocolate 🍫",
    "⏳ Tick-tock… {days} until period time — you got this 💪", 
    "💖 Heads up! Only {days} left before your flow arrives 🌊",
    "🩸 Aunt Jaibu's packing her bags… ETA: {days} 😉",
    "🌹 Period incoming in {days} — be kind to yourself 💕",
    "🍫 Fairoz would say 'stock up on those treats now!' — {days} to go, my dear! 💋",
    "⚡ Haja's wisdom: 'preparation is key!' — {days} left to get ready, beta 👑",
    "🏹 Aslam's betting you forgot again… {days} reminder coming in hot! 🔥",
    "🐱 Even Mishmish is purring about your {days}-day countdown — time to prep! 😸",
    "🎯 Your body's internal GPS is spot-on — {days} until flow time! 🗺️",
    "⭐ Queen energy activated: {days} days to pamper yourself before the main event! 👑",
    "🎨 Time to channel your inner artist — {days} until the crimson masterpiece begins! 🖌️",
    "🌙 Luna whispers: '{days} more sleeps until your monthly lunar cycle' 🌛",
    "💎 Precious gem alert! Your ruby days start in {days} — shine bright! ✨",
    "🦋 Butterfly countdown: {days} days until your beautiful transformation! 🌺"
]

# Base period countdown message templates  
PERIOD_COUNTDOWN_TEMPLATES = [
    "📅 Your period is in {days} — plenty of time to prepare! 💫",
    "🗓️ {days} until your next cycle starts — stay awesome! ✨",
    "⏰ Period countdown: {days} to go! You're doing great 💖",
    "🌟 {days} until flow time — track and take care of yourself! 🌸",
    "📆 Your next period is {days} away — keep being amazing! 💪",
    "👸 Fairoz says 'you're glowing today!' — {days} until your royal visit 💎",
    "🧠 Haja's math: {days} days = plenty of time for self-care prep! 📚",
    "🏹 Aslam's prediction skills: 0/10. Yours: perfect! {days} remaining �",
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
    "🏹 Aslam's aim is nothing compared to your {highlight}egg's bullseye timing{/highlight} — proceed with caution! �",
    "🐱 Mishmish is giving you the side-eye... she knows you're in the {highlight}danger zone{/highlight}! 😼",
    "⚡ Your ovaries just sent a group text: '{highlight}WE'RE ONLINE{/highlight}' — proceed with wisdom! 💬",
    "🎰 Mother Nature's casino is open and you're at the {highlight}jackpot table{/highlight} — play smart! 🃏",
    "🦋 Butterfly effect alert: your {highlight}fertile wings{/highlight} are spread wide — flutter carefully! 🌺",
    "🌙 Lunar goddess mode: you're in the {highlight}sacred fertile window{/highlight} — magical things happen! ✨",
    "🎪 Welcome to the {highlight}fertility circus{/highlight} — step right up for the greatest show on earth! �"
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
    "🔥 Tonight's position spotlight: The Singapore Sling 🍸 — bend it like Beckham, baby!",
    "🌶️ Spice level: 🌶️🌶️🌶️ Try the Reverse Cowgirl... yeehaw partner! 🤠",
    "😈 Pro tip: Blindfolds aren't just for sleeping — explore the darkness! 👁️‍🗨️",
    "🍳 Kitchen counter = not just for cooking — serve up some passion! 💦",
    "🛏️ Missionary? More like Mission Im-POSSIBLE to keep quiet! 🚀",
    "💃 Let's tango... horizontally. The Argentine Backbend awaits! 🔥",
    "🪑 That chair isn't just furniture — it's your playground tonight! 💺",
    "🚿 Shower sex: slippery when wet, steamy when right! 💦",
    "🏃‍♀️ The Running Man isn't just a dance move — try it lying down! 💃",
    "🍯 Sweet like honey, wild like a bee — buzz into the Golden Gate! 🐝",
    "🌊 Ride the wave with The Surfer — balance is everything! 🏄‍♀️",
    "🎪 Welcome to the circus! Time for some acrobatic adventures! 🤸‍♀️",
    "🐍 Ssslither into the Python position — flexibility required! 🐍",
    "🦋 Butterfly your way to ecstasy — spread those wings wide! 🦋",
    "🌀 The Tornado: spinning passion into a whirlwind of pleasure! 🌪️",
    "🎯 Bullseye! The Archer position hits all the right targets! 🏹",
    "🚗 Take the scenic route with The Driver's Seat! 🚙",
    "🌙 Lunar eclipse tonight — block out the world and focus on each other! 🌛",
    "🔑 Unlock new levels with The Key & Lock — perfect fit guaranteed! 🗝️",
    "💎 The Diamond position: rare, precious, and absolutely brilliant! ✨"
]

# Sexual health and nutrition tips for 13:00 notifications
HEALTH_NUTRITION_TIPS = [
    "🥜 Zinc boost alert: Pumpkin seeds = stronger finishes. Science is delicious! 💪",
    "🍫 Dark chocolate increases blood flow... everywhere that matters 😉",
    "🍉 Watermelon = nature's Viagra. Sweet, juicy, and effective! 🍉",
    "🥑 Avocados boost libido — spread the love, literally! 💚",
    "🍓 Strawberries and cream aren't just dessert — they're foreplay fuel! 🍓",
    "🐚 Oysters: the ocean's aphrodisiac. Slurp responsibly! 🦪",
    "🍯 Honey drizzles aren't just for pancakes — energy boost incoming! 🍯",
    "🥕 Carrots improve circulation — see the connection? 👀",
    "🌶️ Chili peppers get your blood pumping — spice up your love life! 🔥",
    "🍌 Bananas: potassium for stamina, shape for... inspiration 😏",
    "🥬 Spinach = iron power = more energy for marathon sessions! 💪",
    "🫐 Blueberries boost blood flow — berry good for bedtime! 🫐",
    "🥛 Stay hydrated: 8 glasses a day keeps performance anxiety away! 💧",
    "🍊 Vitamin C from oranges = healthier... everything! 🍊",
    "🌰 Almonds for vitamin E — smooth operators need smooth skin! 🥜",
    "🐟 Omega-3 from salmon = happy hormones and happy endings! 🐠",
    "🧄 Garlic boosts circulation — just brush your teeth after! 🦷",
    "🥒 Cucumbers: 96% water, 100% helpful for staying cool! 🥒",
    "🥭 Mango sweetness increases serotonin — natural mood booster! 🥭",
    "☕ Coffee before play = increased alertness and sensitivity! ☕"
]

# Achievement and milestone messages for 21:30 notifications
ACHIEVEMENT_MESSAGES = [
    "🦋 You've reached {milestone} moments of bliss! Your happiness chart is off the scale! 📈",
    "� {milestone} starlit nights logged! You're practically a constellation of passion! ✨", 
    "🍯 Sweet achievement: {milestone} honey-dripped memories! The bees are jealous! �",
    "� Vincent van Gogh painted {milestone} fewer masterpieces than your love gallery! �️",
    "🌊 You've created {milestone} waves of euphoria! Surfboard optional! 🏄‍♀️",
    "🔥 {milestone} sparks ignited! NASA wants to study your rocket fuel! 🚀",
    "🎶 Mozart composed fewer symphonies than your {milestone} crescendos! 🎵", 
    "💎 {milestone} precious moments collected! Your treasure chest overflows! �",
    "� {milestone} garden blooms recorded! Eden is taking notes! 🌺",
    "⚡ You've generated {milestone} lightning bolts of electricity! Zeus is impressed! ⛈️",
    "🍷 {milestone} intoxicating moments savored! Sommeliers worldwide applaud! 🥂",
    "🌙 {milestone} lunar eclipses of ecstasy! The moon blushes nightly! 🌛",
    "🎭 Shakespeare never wrote {milestone} love scenes this beautiful! �",
    "� {milestone} rainbow bridges to paradise built! Leprechauns are relocating! �",
    "🎯 Cupid's scored {milestone} perfect bullseyes through your heart! 💘",
    "� {milestone} tropical sunsets witnessed from your private island! �️",
    "� {milestone} standing ovations earned! The circus wants your autograph! �",
    "� You've wished upon {milestone} shooting stars and caught them all! ⭐",
    "� Picasso's blue period had nothing on your {milestone} colorful moments! 🎨",
    "🌊 {milestone} tsunamis of pleasure! Seismologists are confused! 📊"
]

# Sex encouragement messages for dry spells (18:30 or 21:30)
SEX_ENCOURAGEMENT_MESSAGES = [
    "🌙 Your bed sheets are getting lonely... {days} days of solo sleeping? 💭",
    "☕ Coffee isn't the only thing that should be brewing hot in the morning... {days} days later! ☕",
    "🎬 Netflix has been getting more action than you lately... {days} days of just 'chill'? �",
    "🌹 Even your houseplants are more intimate than you've been... {days} days of neglect! 🪴",
    "�️ Candles are meant for romance, not just power outages... {days} days without spark! �",
    "� Your playlist knows 'love songs' exist for a reason... {days} days of silence! �",
    "🍯 Honey, even bees are busier than your love life... {days} days without buzzing! �",
    "🌊 The ocean has more waves than your relationship lately... {days} days of calm seas! 🏖️",
    "🔥 Your passion needs CPR... {days} days without a heartbeat! 💗",
    "🎭 Shakespeare wrote about love, not Netflix marathons... {days} days of solo performances! 🎪",
    "� Flowers bloom with attention... your relationship needs watering after {days} days! 🌸",
    "⚡ Lightning doesn't wait {days} days to strike... neither should you! ⛈️",
    "� Artists create masterpieces with passion... {days} days of blank canvas! 🖼️",
    "🦋 Butterflies don't stay in cocoons forever... {days} days is enough hibernation! 🛌",
    "🌟 Stars shine brightest in pairs... {days} days of solo constellation! ⭐",
    "🍷 Fine wine gets better with age, relationships need regular tasting... {days} days vintage! 🍇",
    "🎶 Dancing takes two... your floor misses the footsteps after {days} days! �",
    "� Even the moon has phases... yours has been 'invisible' for {days} days! �",
    "🔑 Keys unlock doors... yours haven't opened paradise in {days} days! 🚪",
    "🎯 Cupid's arrows don't stay sharp forever... {days} days without target practice! 🏹"
]

# Period-specific encouragement messages (during period, use in 18:30/21:30)
PERIOD_ENCOURAGEMENT_MESSAGES = [
    "🩸 Aunt Flow's visiting but that doesn't mean the party stops! 💃",
    "🌹 Red roses are blooming — still time for garden activities! 🌹",
    "💋 Crimson passion mode: embrace the mess, enjoy the moment! 💋",
    "🔴 Red light doesn't always mean stop — it can mean go! 🔴",
    "🍫 Period cravings satisfied, now satisfy other cravings! 😏",
    "🌊 Riding the crimson wave? Surf with style! 🏄‍♀️",
    "💃 Monthly visitor doesn't mean monthly vacation! Keep dancing! 💃",
    "🎨 Painting the town red... literally! Art can be messy! 🖼️",
    "🌙 Lunar cycle activated — perfect timing for intimate moonlight! 🌛",
    "🔥 Period fire can't extinguish passion flames! 🔥",
    "💎 Ruby season is precious — treasure every moment! 💎",
    "🎪 The red tent is open for business — welcome all performers! 🎪",
    "🌹 Rose petals aren't the only red beauty in bloom! 🌹",
    "💋 Red lips, red flow — double the confidence, double the fun! 💋",
    "🍷 Red wine night? How about red everything night! 🍷"
]

# Double entry encouragement (same day multiple entries)
DOUBLE_ENTRY_MESSAGES = [
    "☀️ Morning coffee AND afternoon tea? Someone's savoring life's finest flavors today! ☕",
    "🌅 Sunrise kiss AND sunset embrace? You're collecting the whole day's magic! 🌄",
    "� First dance AND encore performance? The music never stopped playing! 💃",
    "🌺 Morning bloom AND evening fragrance? Your garden is in full glory! 🌸",
    "⚡ Lightning striking twice in one sky! Meteorologists are baffled! �️",
    "🍯 Double honey harvest! Even the busiest bees take breaks! �",
    "� Monet painted fewer masterpieces in a day than you've created! �️",
    "🌊 Two tides in one ocean day? Neptune himself is impressed! �",
    "� Morning campfire AND evening bonfire? Someone's keeping the flames alive! 🏕️",
    "🌙 Crescent moon AND full moon in one night? You've bent time itself! ⏰",
    "� Double bullseye! Cupid's taking archery lessons from you! 🏹",
    "🦋 Two butterflies emerging from the same cocoon? Nature is jealous! �",
    "� Breakfast wine AND dinner champagne? Living like French royalty! �",
    "⭐ Two shooting stars granted wishes in one sky! The universe spoils you! 🌌",
    "� Double rainbow after the same storm! Leprechauns are moving neighborhoods! 🍀",
    "🎪 Two standing ovations in one theater! Broadway scouts are watching! 🎭",
    "� Spring flowers AND autumn leaves? You're experiencing all seasons today! 🍂",
    "💫 Two comets crossing paths! Astronomers are rewriting textbooks! 📚",
    "� Symphony AND jazz in one concert hall? Your playlist defies genres! 🎼",
    "🌺 Hibiscus blooming twice? Botanists want to study your secret garden! 🔬"
]

# Weekly/monthly streak celebration messages  
STREAK_MESSAGES = [
    "🌸 {count} blooming days this {period}! Your garden of love is flourishing! 🌺",
    "☀️ {count} sunrise celebrations this {period}! You're greeting each day with passion! 🌅",
    "🎶 {count} symphonies composed this {period}! Beethoven is taking notes! 🎵",
    "🌊 {count} waves crashed on your shore this {period}! Perfect surfing conditions! 🏄‍♀️",
    "🔥 {count} candles lit this {period}! Your romance could power a city! �",
    "🦋 {count} metamorphoses this {period}! You're redefining transformation! 🌺",
    "⚡ {count} lightning strikes this {period}! Zeus wants your weather secrets! 🌩️",
    "🍯 {count} honey drops collected this {period}! The sweetest harvest ever! 🐝",
    "🌙 {count} lunar dances this {period}! The moon follows your rhythm! 💃",
    "� {count} masterpieces painted this {period}! The Louvre is calling! 🖼️"
]

# Fun facts and orgasm celebration messages
ORGASM_CELEBRATION_MESSAGES = [
    "💫 Did you know? Your brain releases the same chemicals as eating chocolate... but 10x stronger! 🍫",
    "🌊 Ocean fact: Blue whales can't reach the depths you just explored! 🐋",
    "⚡ Lightning fact: You just generated more electricity than a small thunderstorm! �️",
    "� Fireworks fact: New Year's Eve has nothing on your personal celebration! 🎊",
    "🌋 Volcano fact: Mount Vesuvius wishes it could erupt with your intensity! 🌋",
    "🚀 Space fact: You just experienced more Gs than astronauts during launch! 🛸",
    "🎵 Music fact: Beethoven's 9th Symphony lasted shorter than your crescendo! 🎼",
    "🌈 Rainbow fact: You just created more colors than a prism in sunlight! �",
    "⭐ Star fact: Supernovas are less explosive than what you just experienced! ✨",
    "🌸 Nature fact: Cherry blossoms bloom once a year, you bloom whenever you want! 🌺",
    "🎪 Circus fact: Trapeze artists wish they could fly as high as you just did! 🎪",
    "🍯 Honey fact: A bee visits 2 million flowers for one pound... you just made 2 million flowers bloom! �",
    "🌊 Tsunami fact: You just created bigger waves than the Pacific Ocean! 🌊",
    "� Fire fact: The sun burns at 27 million degrees, you just reached 28 million! ☀️",
    "💎 Diamond fact: Takes billions of years to form underground, you created one in minutes! 💎"
]

# Intimate connection and desire messages
INTIMATE_CONNECTION_MESSAGES = [
    "💕 Connection level: Bluetooth has nothing on your soul-to-soul transmission! �",
    "🧲 Magnetic attraction detected! Scientists want to study your gravitational pull! 🌌",
    "🎭 Chemistry class: You two just created elements not found on periodic table! ⚗️",
    "🌺 Pollination success: Even bees are jealous of your natural harmony! 🐝",
    "🎵 Frequency match: You're vibrating on the same wavelength as the universe! 📻",
    "🔥 Heat signature: Infrared cameras can't capture the warmth you generate! 🌡️",
    "🌙 Lunar alignment: Your cycles are more synchronized than Swiss watches! ⏰",
    "💫 Gravity defied: You two just created your own orbit around each other! 🌍",
    "� Color palette: You're painting outside the lines of ordinary love! 🖌️",
    "⚡ Electrical current: Tesla coils wish they could conduct your energy! 🔌",
    "🌊 Ocean depth: Marianas Trench is shallow compared to your connection! 🐠",
    "🦋 Migration pattern: Even butterflies navigate with less precision than your hearts! 🗺️",
    "🌸 Seasonal bloom: You've created eternal spring in your private garden! 🌿",
    "🎯 Perfect aim: Cupid retired after witnessing your precision targeting! 💘",
    "🔮 Crystal ball: Fortune tellers study your future-predicting intuition! ✨"
]

# Notification messages used by the notification service
NOTIFICATION_MESSAGES = {
    'period_soon': PERIOD_SOON_TEMPLATES,
    'period_countdown': PERIOD_COUNTDOWN_TEMPLATES,
    'fertile': [template.format(highlight="", **{"/highlight": ""}) for template in FERTILE_TEMPLATES],
    'wild_sex_tips': WILD_SEX_TIPS,
    'health_nutrition': HEALTH_NUTRITION_TIPS,
    'achievements': ACHIEVEMENT_MESSAGES,
    'sex_encouragement': SEX_ENCOURAGEMENT_MESSAGES,
    'period_encouragement': PERIOD_ENCOURAGEMENT_MESSAGES,
    'double_entry': DOUBLE_ENTRY_MESSAGES,
    'streaks': STREAK_MESSAGES,
    'orgasm_celebration': ORGASM_CELEBRATION_MESSAGES,
    'intimate_connection': INTIMATE_CONNECTION_MESSAGES
}